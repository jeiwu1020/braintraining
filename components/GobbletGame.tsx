
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Undo2, HelpCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import { applyGobbletMove, type GobbletPiece } from '../services/gobblet';
import GameModeSelector from './game-ui/GameModeSelector';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

type Piece = GobbletPiece;

const initGobbletPieces = (player: 1 | 2): Piece[] => [
  { player, size: 0, id: `${player}-s1` }, { player, size: 0, id: `${player}-s2` },
  { player, size: 1, id: `${player}-m1` }, { player, size: 1, id: `${player}-m2` },
  { player, size: 2, id: `${player}-l1` }, { player, size: 2, id: `${player}-l2` },
];

const gobbletSizeLabels = ['小型', '中型', '大型'] as const;
const gobbletSizeCodes = ['S', 'M', 'L'] as const;

const GobbletGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [board, setBoard] = useState<Piece[][]>(Array(9).fill([]));
  const [p1Inv, setP1Inv] = useState<Piece[]>(() => initGobbletPieces(1));
  const [p2Inv, setP2Inv] = useState<Piece[]>(() => initGobbletPieces(2));
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

  const resetGame = () => {
      setBoard(Array(9).fill([]));
      setP1Inv(initGobbletPieces(1));
      setP2Inv(initGobbletPieces(2));
      setTurn(1);
      setWinner(null);
      setIsWinModalOpen(false);
      setSelectedPiece(null);
      setHistory([]);
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

      let moveSource: { kind: 'board'; index: number } | { kind: 'supply'; piece: Piece };
      if (from.source === 'inv') {
          const inv = turn === 1 ? p1Inv : p2Inv;
          const piece = inv[from.index];
          moveSource = { kind: 'supply', piece };
          const newInv = [...inv];
          newInv.splice(from.index, 1);
          if (turn === 1) setP1Inv(newInv); else setP2Inv(newInv);
      } else {
          moveSource = { kind: 'board', index: from.index };
      }

      const moveResult = applyGobbletMove(board, moveSource, toIdx, turn);
      const newBoard = moveResult.board;
      setBoard(newBoard);
      setSelectedPiece(null);
      soundService.playGameSound('BOUNCE');
      const w = moveResult.winner;
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
                              const result = applyGobbletMove(
                                  currentB,
                                  { kind: 'supply', piece: p },
                                  b,
                                  1,
                              );
                              if (result.winner === 1) return true;
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
                                  const result = applyGobbletMove(
                                      currentB,
                                      { kind: 'board', index: i },
                                      b,
                                      1,
                                  );
                                  if (result.winner === 1) return true;
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
                  const targetStack = board[m.target];
                  const isGobbling = targetStack.length > 0 && targetStack[targetStack.length-1].player === 1;
                  const gobbledSize = isGobbling ? targetStack[targetStack.length-1].size : -1;
                  const result = applyGobbletMove(
                      board,
                      m.source === 'board'
                          ? { kind: 'board', index: m.index }
                          : { kind: 'supply', piece: m.piece },
                      m.target,
                      2,
                  );
                  const tempBoard = result.board;
                  const winState = result.winner;
                  if (winState === 2) {
                      score += 10000000; // Immediate Win
                  } else if (winState === 1) {
                      score -= 8000000; // The move leaves an opponent line visible
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
           : [ 'gobblet-piece-s w-6 h-6 sm:w-10 sm:h-10 max-[480px]:landscape:w-6 max-[480px]:landscape:h-6', 'gobblet-piece-m w-10 h-10 sm:w-14 sm:h-14 max-[480px]:landscape:w-8 max-[480px]:landscape:h-8', 'gobblet-piece-l w-14 h-14 sm:w-20 sm:h-20 max-[480px]:landscape:w-10 max-[480px]:landscape:h-10' ];
      const colorClass = p.player === 1 ? 'bg-blue-500 border-blue-700' : 'bg-orange-500 border-orange-700';
      return (
           <div className={`${sizeClasses[p.size]} ${colorClass} aspect-square rounded-full border-b-4 flex items-center justify-center shadow-lg font-black text-white text-xs sm:text-base z-10 transition-all`} aria-hidden="true">
              {gobbletSizeCodes[p.size]}
          </div>
      );
  };

  return (
    <div className="gobblet-game flex flex-col landscape:flex-row h-[100dvh] bg-orange-50 overflow-hidden text-orange-900">
        <style>{`@media (orientation: landscape) and (max-height: 480px) {
          .gobblet-game [data-gobblet-layout="inventory-board-inventory"] { gap: 0.25rem; padding: 0.25rem; }
          .gobblet-game [data-gobblet-inventory] { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; padding: 0; width: auto; }
          .gobblet-game .gobblet-board-frame { width: min(72vh, 88vw) !important; }
          .gobblet-game .gobblet-piece-s { width: 1.5rem; height: 1.5rem; }
          .gobblet-game .gobblet-piece-m { width: 2rem; height: 2rem; }
          .gobblet-game .gobblet-piece-l { width: 2.5rem; height: 2.5rem; }
        }`}</style>
        <div className="flex-none p-2 flex landscape:flex-col justify-between items-center bg-white shadow-sm z-10 portrait:h-14 landscape:w-16 landscape:h-full">
            <button type="button" onClick={onBack} aria-label="返回" className="min-h-11 min-w-11 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">
                <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div className="flex portrait:flex-row landscape:flex-col gap-2">
                <button
                    type="button"
                    onClick={handleUndo} 
                    disabled={history.length === 0}
                    aria-label="悔棋"
                    className="min-h-11 min-w-11 bg-orange-50 rounded-full border border-orange-200 hover:bg-orange-100 disabled:opacity-50 flex items-center justify-center"
                >
                    <Undo2 size={16} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => setShowRules(true)} 
                    aria-label="遊戲規則"
                    className="min-h-11 min-w-11 bg-orange-50 rounded-full border border-orange-200 hover:bg-orange-100 flex items-center justify-center"
                >
                    <HelpCircle size={16} aria-hidden="true" />
                </button>
            </div>
            <button type="button" onClick={resetGame} aria-label="重新開始" className="min-h-11 min-w-11 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">
                <RefreshCw size={18} aria-hidden="true" />
            </button>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-none flex items-center justify-between gap-2 px-2 py-1 bg-orange-200 border-b border-orange-300 z-10">
                <div className="min-w-0 flex-1 text-center font-bold text-sm sm:text-lg">
                    {winner ? (winner === 1 ? "藍方獲勝！" : "橘方獲勝！") : (turn === 1 ? "藍方回合 (你)" : (gameMode==='PVE'?"電腦思考中...":"橘方回合"))}
                </div>
                <GameModeSelector value={gameMode} onChange={setGameMode} className="!w-[190px] shrink-0" />
            </div>

            <div data-gobblet-layout="inventory-board-inventory" className="flex-1 flex flex-col portrait:sm:flex-row landscape:flex-row items-center justify-center p-2 max-[480px]:landscape:p-1 gap-2 sm:gap-6 max-[480px]:landscape:gap-1 overflow-hidden w-full h-full">
            <div data-gobblet-inventory="2" aria-label="橘方棋子庫" className={`flex-none order-1 sm:order-3 p-2 max-[480px]:landscape:p-1 rounded-xl bg-orange-100/50 grid grid-cols-6 sm:grid-cols-2 max-[480px]:landscape:grid-cols-2 gap-2 max-[480px]:landscape:gap-1 justify-center items-center w-full sm:w-auto max-[480px]:landscape:w-auto h-auto sm:max-h-full shrink-0 ${turn === 2 ? 'ring-2 ring-orange-400' : 'opacity-70'}`}>
                {p2Inv.map((p, i) => (
                    <button key={p.id} type="button" data-gobblet-inventory-player="2" data-gobblet-piece-size={gobbletSizeCodes[p.size]} onClick={() => handleInvClick(2, i)} disabled={gameMode === 'PVE'} aria-label={`橘方${gobbletSizeLabels[p.size]}棋子 ${p.id.endsWith('2') ? '2' : '1'}`} aria-pressed={selectedPiece?.source === 'inv' && selectedPiece.index === i && turn===2} className={`min-h-11 min-w-11 transition-transform aspect-square flex items-center justify-center ${selectedPiece?.source === 'inv' && selectedPiece.index === i && turn===2 ? 'scale-110 ring-2 ring-yellow-400 rounded-full' : ''}`}>
                        <PieceRender p={p} isBoard={false} />
                    </button>
                ))}
            </div>

            <div className="order-2 flex-1 flex flex-col items-center justify-center min-h-0 w-full">
                <div data-gobblet-board-frame="true" className="gobblet-board-frame flex flex-col items-center justify-center" style={{ width: 'min(60vh, 85vw)' }}>
                    <div className="flex w-full pl-6 sm:pl-8 mb-1">
                        {['A', 'B', 'C'].map(t => <div key={t} className="flex-1 text-center font-bold text-orange-800 text-xs sm:text-sm">{t}</div>)}
                    </div>
                    <div className="flex w-full items-stretch">
                        <div className="flex flex-col pr-1 sm:pr-2 py-3 w-6 sm:w-8 shrink-0">
                            {['1', '2', '3'].map(t => <div key={t} className="flex-1 flex items-center justify-center font-bold text-orange-800 text-xs sm:text-sm">{t}</div>)}
                        </div>
                        <div data-gobblet-board="true" className="bg-white p-2 rounded-xl shadow-2xl border-4 border-orange-200 grid grid-cols-3 grid-rows-3 gap-2 aspect-square flex-1 w-full">
                            {board.map((stack, i) => {
                                const top = stack.length > 0 ? stack[stack.length-1] : null;
                                const pSelected = selectedPiece?.source === 'inv' ? (turn === 1 ? p1Inv : p2Inv)[selectedPiece.index] : (selectedPiece?.source === 'board' ? board[selectedPiece.index][board[selectedPiece.index].length-1] : null);
                                const isTarget = pSelected && canPlace(i, pSelected, board);
                                const isSource = selectedPiece?.source === 'board' && selectedPiece.index === i;
                                const coordinate = `${['A', 'B', 'C'][i % 3]}${Math.floor(i / 3) + 1}`;
                                const topLabel = top ? `${top.player === 1 ? '藍方' : '橘方'}${gobbletSizeLabels[top.size]}棋子` : '空位';
                                return (
                                    <button key={i} type="button" data-gobblet-cell={coordinate} aria-label={`${coordinate}，${topLabel}`} onClick={() => handleBoardClick(i)} className={`relative bg-orange-50 rounded-lg flex items-center justify-center border-2 border-orange-100 w-full h-full aspect-square ${isTarget ? 'bg-green-100 border-green-300 animate-pulse' : ''} ${isSource ? 'ring-4 ring-yellow-400 z-20' : ''}`}>
                                        {isTarget && <span aria-hidden="true" className="pointer-events-none absolute inset-1 rounded-md border-2 border-green-700" />}
                                        {top && <PieceRender p={top} isBoard={true} />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div data-gobblet-inventory="1" aria-label="藍方棋子庫" className={`flex-none order-3 sm:order-1 p-2 max-[480px]:landscape:p-1 rounded-xl bg-blue-100/50 grid grid-cols-6 sm:grid-cols-2 max-[480px]:landscape:grid-cols-2 gap-2 max-[480px]:landscape:gap-1 justify-center items-center w-full sm:w-auto max-[480px]:landscape:w-auto h-auto sm:max-h-full shrink-0 ${turn === 1 ? 'ring-2 ring-blue-400' : 'opacity-70'}`}>
                {p1Inv.map((p, i) => (
                    <button key={p.id} type="button" data-gobblet-inventory-player="1" data-gobblet-piece-size={gobbletSizeCodes[p.size]} onClick={() => handleInvClick(1, i)} aria-label={`藍方${gobbletSizeLabels[p.size]}棋子 ${p.id.endsWith('2') ? '2' : '1'}`} aria-pressed={selectedPiece?.source === 'inv' && selectedPiece.index === i && turn===1} className={`min-h-11 min-w-11 transition-transform aspect-square flex items-center justify-center ${selectedPiece?.source === 'inv' && selectedPiece.index === i && turn===1 ? 'scale-110 ring-2 ring-yellow-400 rounded-full' : ''}`}>
                        <PieceRender p={p} isBoard={false} />
                    </button>
                ))}
            </div>
        </div>
        </div>

        {/* Rules Modal */}
        {showRules && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="gobblet-rules-title">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90dvh]">
                    <h2 id="gobblet-rules-title" className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-900"><HelpCircle aria-hidden="true" /> 遊戲規則：奇雞連連</h2>
                    <ul className="list-disc pl-5 space-y-2 text-stone-700 mb-6 text-sm">
                        <li>雙方各有三種尺寸大小的圈圈（套娃/奇雞）。</li>
                        <li><b>放置規則：</b>你可以將場外自己顏色的圈圈放入棋盤上的空位。</li>
                        <li><b>吃掉（覆蓋）規則：</b>你可以將自己「較大」的圈圈，蓋在棋盤上任何「較小」的圈圈（不論敵我）上方。且你可以移動棋盤上自己已經下的圈圈去蓋別人！</li>
                        <li><b>勝利條件：</b>先將自己顏色的3個圈圈連成一線（橫、豎、斜皆可）者獲勝！</li>
                        <li><b>露子規則：</b>移開棋子後若露出對方三連線，你必須把拿起的棋子蓋住該連線中另外一枚較小棋子，破壞連線；否則即使你的落點也形成三連線，仍由對方獲勝。</li>
                    </ul>
                    <button 
                        type="button"
                        onClick={() => setShowRules(false)} 
                        aria-label="關閉遊戲規則"
                        className="w-full min-h-11 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                    >
                        了解，開始遊戲！
                    </button>
                </div>
            </div>
        )}

        {winner && isWinModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="gobblet-win-title">
                <div className="bg-white p-8 rounded-2xl text-center shadow-2xl border-4 border-orange-200 w-full max-w-sm">
                    <Trophy aria-hidden="true" className="w-16 h-16 mx-auto mb-4 text-yellow-500"/>
                    <h2 id="gobblet-win-title" className="text-2xl font-bold mb-6">{winner === 1 ? "藍方獲勝！" : "橘方獲勝！"}</h2>
                    <button type="button" onClick={() => setIsWinModalOpen(false)} className="min-h-11 px-10 py-3 bg-orange-600 text-white rounded-lg font-bold">確認</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default GobbletGame;
