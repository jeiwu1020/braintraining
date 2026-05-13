
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User, Crown, Undo2, HelpCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

type Size = 0 | 1 | 2;
interface Piece {
    player: 1 | 2;
    size: Size;
    id: string;
}

const GobbletGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [board, setBoard] = useState<Piece[][]>(Array(9).fill([]));
  const [p1Inv, setP1Inv] = useState<Piece[]>([]);
  const [p2Inv, setP2Inv] = useState<Piece[]>([]);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [selectedPiece, setSelectedPiece] = useState<{source: 'board'|'inv', index: number} | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');

  interface GameState {
    board: Piece[][];
    p1Inv: Piece[];
    p2Inv: Piece[];
    turn: 1 | 2;
  }
  const [history, setHistory] = useState<GameState[]>([]);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => { resetGame(); }, [gameMode]);

  const initPieces = (p: 1 | 2) => [
      {player: p, size: 0, id: `${p}-s1`}, {player: p, size: 0, id: `${p}-s2`},
      {player: p, size: 1, id: `${p}-m1`}, {player: p, size: 1, id: `${p}-m2`},
      {player: p, size: 2, id: `${p}-l1`}, {player: p, size: 2, id: `${p}-l2`}
  ] as Piece[];

  const resetGame = () => {
      setBoard(Array(9).fill([]));
      setP1Inv(initPieces(1));
      setP2Inv(initPieces(2));
      setTurn(1);
      setWinner(null);
      setIsWinModalOpen(false);
      setSelectedPiece(null);
      setHistory([]);
  };

  const checkWin = (b: Piece[][]) => {
      const topPieces = b.map(stack => stack.length > 0 ? stack[stack.length-1] : null);
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for(const line of lines) {
          const p0 = topPieces[line[0]], p1 = topPieces[line[1]], p2 = topPieces[line[2]];
          if (p0 && p1 && p2 && p0.player === p1.player && p1.player === p2.player) return p0.player;
      }
      return null;
  };

  const canPlace = (boardIdx: number, piece: Piece, currentBoard: Piece[][]) => {
      const stack = currentBoard[boardIdx];
      if (stack.length === 0) return true;
      return piece.size > stack[stack.length - 1].size;
  };

  const handleInvClick = (player: 1 | 2, idx: number) => {
      if (winner || turn !== player || (gameMode === 'PVE' && player === 2)) return;
      if (selectedPiece?.source === 'inv' && selectedPiece.index === idx) setSelectedPiece(null);
      else { setSelectedPiece({ source: 'inv', index: idx }); soundService.playGameSound('LOW'); }
  };

  const handleBoardClick = (idx: number) => {
      if (winner || (gameMode === 'PVE' && turn === 2)) return;
      const stack = board[idx];
      const top = stack.length > 0 ? stack[stack.length-1] : null;

      if (!selectedPiece) {
          if (top && top.player === turn) {
              setSelectedPiece({ source: 'board', index: idx });
              soundService.playGameSound('LOW');
          }
          return;
      }

      let pieceToMove: Piece;
      if (selectedPiece.source === 'inv') pieceToMove = (turn === 1 ? p1Inv : p2Inv)[selectedPiece.index];
      else {
          if (selectedPiece.index === idx) { setSelectedPiece(null); return; }
          pieceToMove = board[selectedPiece.index][board[selectedPiece.index].length - 1];
      }

      if (canPlace(idx, pieceToMove, board)) executeMove(selectedPiece, idx);
      else soundService.playWrong();
  };

  const executeMove = (from: {source: 'board'|'inv', index: number}, toIdx: number) => {
      setHistory(prev => [...prev, {
          board: board.map(s => [...s]),
          p1Inv: [...p1Inv],
          p2Inv: [...p2Inv],
          turn
      }]);

      const newBoard = board.map(s => [...s]);
      let piece: Piece;
      if (from.source === 'inv') {
          const inv = turn === 1 ? p1Inv : p2Inv;
          piece = inv[from.index];
          const newInv = [...inv];
          newInv.splice(from.index, 1);
          if (turn === 1) setP1Inv(newInv); else setP2Inv(newInv);
      } else {
          piece = newBoard[from.index].pop()!;
      }
      newBoard[toIdx].push(piece);
      setBoard(newBoard);
      setSelectedPiece(null);
      soundService.playGameSound('BOUNCE');
      const w = checkWin(newBoard);
      if (w) { setWinner(w); setIsWinModalOpen(true); soundService.playWin(); }
      else setTurn(turn === 1 ? 2 : 1);
  };

  const handleUndo = () => {
      if (history.length === 0) return;
      
      let targetIndex = history.length - 1;
      if (gameMode === 'PVE' && turn === 1) {
          // If it's PVE and player's turn, we undo both AI's last move and player's last move
          while (targetIndex >= 0 && history[targetIndex].turn === 2) {
              targetIndex--;
          }
          if (targetIndex < 0) targetIndex = 0; // fallback
      }
      
      const prevState = history[targetIndex];
      setHistory(history.slice(0, targetIndex));
      setBoard(prevState.board);
      setP1Inv(prevState.p1Inv);
      setP2Inv(prevState.p2Inv);
      setTurn(prevState.turn);
      setWinner(null);
      setIsWinModalOpen(false);
      setSelectedPiece(null);
  };

  // --- SUPER STRONG AI LOGIC ---
  useEffect(() => {
      if (gameMode === 'PVE' && turn === 2 && !winner) {
          const timer = setTimeout(() => {
              const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

              const getStats = (b: Piece[][]) => {
                  const tops = b.map(s => s.length > 0 ? s[s.length-1] : null);
                  return lines.map(line => {
                      const lp = line.map(idx => tops[idx]);
                      return {
                          p1: lp.filter(p => p?.player === 1).length,
                          p2: lp.filter(p => p?.player === 2).length,
                          empty: lp.filter(p => p === null).length,
                          line
                      };
                  });
              };

              // Find if player can win in ONE move on a given board
              const canPlayerWinNext = (currentB: Piece[][], playerInv: Piece[]) => {
                  // Player inventory moves
                  for (const p of playerInv) {
                      for (let b = 0; b < 9; b++) {
                          if (canPlace(b, p, currentB)) {
                              const temp = currentB.map(s => [...s]);
                              temp[b].push(p);
                              if (checkWin(temp) === 1) return true;
                          }
                      }
                  }
                  // Player board moves
                  for (let i = 0; i < 9; i++) {
                      const stack = currentB[i];
                      if (stack.length > 0 && stack[stack.length - 1].player === 1) {
                          const p = stack[stack.length - 1];
                          for (let b = 0; b < 9; b++) {
                              if (i !== b && canPlace(b, p, currentB)) {
                                  const temp = currentB.map(s => [...s]);
                                  temp[i].pop();
                                  if (checkWin(temp) === 1) return true; // Win by uncovering
                                  temp[b].push(p);
                                  if (checkWin(temp) === 1) return true; // Win by moving
                              }
                          }
                      }
                  }
                  return false;
              };

              // Collect all AI moves
              const possibleMoves: {source: 'inv'|'board', index: number, target: number, piece: Piece}[] = [];
              p2Inv.forEach((p, i) => { for(let b=0; b<9; b++) if (canPlace(b, p, board)) possibleMoves.push({source: 'inv', index: i, target: b, piece: p}); });
              board.forEach((stack, i) => {
                  if (stack.length > 0 && stack[stack.length-1].player === 2) {
                      const p = stack[stack.length-1];
                      for(let b=0; b<9; b++) if (b !== i && canPlace(b, p, board)) possibleMoves.push({source: 'board', index: i, target: b, piece: p});
                  }
              });

              if (possibleMoves.length === 0) return;

              let bestMove = possibleMoves[0];
              let maxScore = -Infinity;

              for (const m of possibleMoves) {
                  let score = 0;
                  const tempBoard = board.map(s => [...s]);
                  const tempInv = [...p2Inv];
                  
                  // 1. Simulate Move
                  if (m.source === 'board') {
                      const afterLiftBoard = board.map(s => [...s]);
                      afterLiftBoard[m.index].pop();
                      if (checkWin(afterLiftBoard) === 1) score -= 5000000; // Immediate suicide by uncovering
                      tempBoard[m.index].pop();
                  } else {
                      tempInv.splice(m.index, 1);
                  }

                  const targetStack = tempBoard[m.target];
                  const isGobbling = targetStack.length > 0 && targetStack[targetStack.length-1].player === 1;
                  const gobbledSize = isGobbling ? targetStack[targetStack.length-1].size : -1;
                  tempBoard[m.target].push(m.piece);

                  const winState = checkWin(tempBoard);
                  if (winState === 2) {
                      score += 10000000; // Immediate Win
                  } else {
                      // 2. Defensive Look-ahead: Can player win after this?
                      if (canPlayerWinNext(tempBoard, p1Inv)) {
                          score -= 8000000; // This move is a trap
                      }

                      // 3. Heuristic Scoring
                      const stats = getStats(tempBoard);
                      const originalStats = getStats(board);
                      
                      let aiThreats = 0;
                      stats.forEach((s, idx) => {
                          // Own Potential
                          if (s.p2 === 2 && s.empty === 1) { score += 15000; aiThreats++; }
                          
                          // Blocking Player
                          const orig = originalStats[idx];
                          if (orig.p1 === 2 && s.p1 < 2) score += 500000; // Critical Block
                          if (orig.p1 === 1 && s.p1 === 0 && isGobbling) score += 5000; // Disruption
                      });

                      if (aiThreats >= 2) score += 100000; // Create Fork

                      // Positional & Strategic
                      if (m.target === 4) score += 10000; // Center control
                      if ([0, 2, 6, 8].includes(m.target)) score += 3000; // Corner
                      
                      if (isGobbling) score += 8000 + (gobbledSize * 2000);
                      
                      // Conserve Large pieces
                      if (m.source === 'inv' && m.piece.size === 2) {
                          const playerHasL = p1Inv.some(p => p.size === 2) || board.some(s => s.length > 0 && s[s.length-1].player === 1 && s[s.length-1].size === 2);
                          if (playerHasL) score -= 5000; // Keep L in hand for defense
                      }
                      
                      if (m.source === 'board') score += 2000; // Value board reuse
                  }

                  score += Math.random() * 200; // Randomness for tie-breaking

                  if (score > maxScore) {
                      maxScore = score;
                      bestMove = m;
                  }
              }

              executeMove({source: bestMove.source, index: bestMove.index}, bestMove.target);
          }, 800);
          return () => clearTimeout(timer);
      }
  }, [turn, board, winner, gameMode, p2Inv, p1Inv]);

  const PieceRender = ({ p, isBoard = false }: { p: Piece, isBoard?: boolean }) => {
      const sizeClasses = isBoard 
          ? [ 'w-[40%] h-[40%]', 'w-[65%] h-[65%]', 'w-[90%] h-[90%]' ]
          : [ 'w-6 h-6 sm:w-10 sm:h-10', 'w-10 h-10 sm:w-14 sm:h-14', 'w-14 h-14 sm:w-20 sm:h-20' ];
      const colorClass = p.player === 1 ? 'bg-blue-500 border-blue-700' : 'bg-orange-500 border-orange-700';
      return (
          <div className={`${sizeClasses[p.size]} ${colorClass} aspect-square rounded-full border-b-4 flex items-center justify-center shadow-lg font-black text-white text-xs sm:text-base z-10 transition-all`}>
              {['S', 'M', 'L'][p.size]}
          </div>
      );
  };

  return (
    <div className="flex flex-col landscape:flex-row h-[100dvh] bg-orange-50 overflow-hidden text-orange-900">
        <div className="flex-none p-2 flex landscape:flex-col justify-between items-center bg-white shadow-sm z-10 portrait:h-14 landscape:w-16 landscape:h-full">
            <button onClick={onBack} className="p-1.5 md:p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <ArrowLeft size={18} />
            </button>
            <div className="flex portrait:flex-row landscape:flex-col gap-2">
                <button 
                    onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')} 
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 landscape:p-2 bg-orange-50 rounded-full text-xs sm:text-sm font-bold border border-orange-200"
                >
                    {gameMode === 'PVE' ? <User size={14} /> : <Users size={14} />} 
                    <span className="landscape:hidden">{gameMode === 'PVE' ? '單人' : '雙人'}</span>
                </button>
                <button 
                    onClick={handleUndo} 
                    disabled={history.length === 0}
                    className="p-1.5 md:p-2 bg-orange-50 rounded-full border border-orange-200 hover:bg-orange-100 disabled:opacity-50 flex items-center justify-center"
                >
                    <Undo2 size={16} />
                </button>
                <button 
                    onClick={() => setShowRules(true)} 
                    className="p-1.5 md:p-2 bg-orange-50 rounded-full border border-orange-200 hover:bg-orange-100 flex items-center justify-center"
                >
                    <HelpCircle size={16} />
                </button>
            </div>
            <button onClick={resetGame} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200">
                <RefreshCw size={18} />
            </button>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-none text-center py-1 sm:py-2 font-bold text-sm sm:text-lg bg-orange-200 border-b border-orange-300 z-10">
                {winner ? (winner === 1 ? "藍方獲勝！" : "橘方獲勝！") : (turn === 1 ? "藍方回合 (你)" : (gameMode==='PVE'?"電腦思考中...":"橘方回合"))}
            </div>

            <div className="flex-1 flex flex-col portrait:sm:flex-row landscape:flex-row items-center justify-center p-2 gap-2 sm:gap-6 overflow-hidden w-full h-full">
            <div className={`flex-none order-1 sm:order-3 p-2 rounded-xl bg-orange-100/50 grid grid-cols-6 sm:grid-cols-2 gap-2 justify-center items-center w-full sm:w-auto h-auto sm:max-h-full ${turn === 2 ? 'ring-2 ring-orange-400' : 'opacity-70'}`}>
                {p2Inv.map((p, i) => (
                    <button key={p.id} onClick={() => handleInvClick(2, i)} disabled={gameMode === 'PVE'} className={`transition-transform aspect-square flex items-center justify-center ${selectedPiece?.source === 'inv' && selectedPiece.index === i && turn===2 ? 'scale-110 ring-2 ring-yellow-400 rounded-full' : ''}`}>
                        <PieceRender p={p} isBoard={false} />
                    </button>
                ))}
            </div>

            <div className="order-2 flex-1 flex flex-col items-center justify-center min-h-0 w-full">
                <div className="flex flex-col items-center justify-center" style={{ width: 'min(60vh, 85vw)' }}>
                    <div className="flex w-full pl-6 sm:pl-8 mb-1">
                        {['A', 'B', 'C'].map(t => <div key={t} className="flex-1 text-center font-bold text-orange-800 text-xs sm:text-sm">{t}</div>)}
                    </div>
                    <div className="flex w-full items-stretch">
                        <div className="flex flex-col pr-1 sm:pr-2 py-3 w-6 sm:w-8 shrink-0">
                            {['1', '2', '3'].map(t => <div key={t} className="flex-1 flex items-center justify-center font-bold text-orange-800 text-xs sm:text-sm">{t}</div>)}
                        </div>
                        <div className="bg-white p-2 rounded-xl shadow-2xl border-4 border-orange-200 grid grid-cols-3 grid-rows-3 gap-2 aspect-square flex-1 w-full">
                            {board.map((stack, i) => {
                                const top = stack.length > 0 ? stack[stack.length-1] : null;
                                const pSelected = selectedPiece?.source === 'inv' ? (turn === 1 ? p1Inv : p2Inv)[selectedPiece.index] : (selectedPiece?.source === 'board' ? board[selectedPiece.index][board[selectedPiece.index].length-1] : null);
                                const isTarget = pSelected && canPlace(i, pSelected, board);
                                const isSource = selectedPiece?.source === 'board' && selectedPiece.index === i;
                                return (
                                    <button key={i} onClick={() => handleBoardClick(i)} className={`relative bg-orange-50 rounded-lg flex items-center justify-center border-2 border-orange-100 w-full h-full aspect-square ${isTarget ? 'bg-green-100 border-green-300 animate-pulse' : ''} ${isSource ? 'ring-4 ring-yellow-400 z-20' : ''}`}>
                                        {top && <PieceRender p={top} isBoard={true} />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`flex-none order-3 sm:order-1 p-2 rounded-xl bg-blue-100/50 grid grid-cols-6 sm:grid-cols-2 gap-2 justify-center items-center w-full sm:w-auto h-auto sm:max-h-full ${turn === 1 ? 'ring-2 ring-blue-400' : 'opacity-70'}`}>
                {p1Inv.map((p, i) => (
                    <button key={p.id} onClick={() => handleInvClick(1, i)} className={`transition-transform aspect-square flex items-center justify-center ${selectedPiece?.source === 'inv' && selectedPiece.index === i && turn===1 ? 'scale-110 ring-2 ring-yellow-400 rounded-full' : ''}`}>
                        <PieceRender p={p} isBoard={false} />
                    </button>
                ))}
            </div>
        </div>
        </div>

        {/* Rules Modal */}
        {showRules && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-900"><HelpCircle /> 遊戲規則：奇雞連連</h2>
                    <ul className="list-disc pl-5 space-y-2 text-stone-700 mb-6 text-sm">
                        <li>雙方各有三種尺寸大小的圈圈（套娃/奇雞）。</li>
                        <li><b>放置規則：</b>你可以將場外自己顏色的圈圈放入棋盤上的空位。</li>
                        <li><b>吃掉（覆蓋）規則：</b>你可以將自己「較大」的圈圈，蓋在棋盤上任何「較小」的圈圈（不論敵我）上方。且你可以移動棋盤上自己已經下的圈圈去蓋別人！</li>
                        <li><b>勝利條件：</b>先將自己顏色的3個圈圈連成一線（橫、豎、斜皆可）者獲勝！</li>
                        <li><b>注意：</b>當你移動棋盤上自己的圈圈時，可能會露出下面原本被蓋住的對方圈圈。如果對方因此連成一線，對方會立刻獲勝！</li>
                    </ul>
                    <button 
                        onClick={() => setShowRules(false)} 
                        className="w-full py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                    >
                        了解，開始遊戲！
                    </button>
                </div>
            </div>
        )}

        {winner && isWinModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white p-8 rounded-2xl text-center shadow-2xl border-4 border-orange-200 w-full max-w-sm">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500"/>
                    <h2 className="text-2xl font-bold mb-6">{winner === 1 ? "藍方獲勝！" : "橘方獲勝！"}</h2>
                    <button onClick={() => setIsWinModalOpen(false)} className="px-10 py-3 bg-orange-600 text-white rounded-lg font-bold">確認</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default GobbletGame;
