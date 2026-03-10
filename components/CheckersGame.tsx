
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User, Crown } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const SIZE = 8;
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];

// Player 1 (Red/Black) moves DOWN (index increases)
// Player 2 (White) moves UP (index decreases)
interface Piece {
    player: 1 | 2;
    isKing: boolean;
}

const CheckersGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [board, setBoard] = useState<(Piece | null)[][]>([]);
  const [turn, setTurn] = useState<1 | 2>(1); // 1 = Red, 2 = White
  const [selectedPos, setSelectedPos] = useState<{r: number, c: number} | null>(null);
  const [validMoves, setValidMoves] = useState<{r: number, c: number, isJump: boolean}[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');

  useEffect(() => { resetGame(); }, [gameMode]);

  const resetGame = () => {
    const newBoard = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if ((r + c) % 2 === 1) {
                if (r < 3) newBoard[r][c] = { player: 1, isKing: false }; // P1 Top (Red) moves down
                if (r > 4) newBoard[r][c] = { player: 2, isKing: false }; // P2 Bottom (White) moves up
            }
        }
    }
    setBoard(newBoard);
    setTurn(2); // White usually starts, let's say P2 (Bottom/White) starts for better UI logic (player at bottom)
    setWinner(null);
    setSelectedPos(null);
    setValidMoves([]);
  };

  const isValidPos = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

  const getMoves = (b: (Piece|null)[][], r: number, c: number, p: Piece) => {
      const moves: {r: number, c: number, isJump: boolean, jumpR?: number, jumpC?: number}[] = [];
      const directions = [];
      
      // P1 (Red) moves Down (+r), P2 (White) moves Up (-r)
      // Kings move both
      if (p.player === 1 || p.isKing) directions.push([1, -1], [1, 1]);
      if (p.player === 2 || p.isKing) directions.push([-1, -1], [-1, 1]);

      for (const [dr, dc] of directions) {
          // Normal Move
          if (isValidPos(r + dr, c + dc) && b[r + dr][c + dc] === null) {
              moves.push({ r: r + dr, c: c + dc, isJump: false });
          }
          // Jump Move
          if (isValidPos(r + dr * 2, c + dc * 2)) {
              const midR = r + dr, midC = c + dc;
              const midP = b[midR][midC];
              const landP = b[r + dr * 2][c + dc * 2];
              if (midP && midP.player !== p.player && landP === null) {
                  moves.push({ r: r + dr * 2, c: c + dc * 2, isJump: true, jumpR: midR, jumpC: midC });
              }
          }
      }
      return moves;
  };

  const handleSquareClick = (r: number, c: number) => {
      if (winner) return;
      if (gameMode === 'PVE' && turn === 1) return; // P1 is AI (Red/Top)

      const clickedPiece = board[r][c];

      // Select Piece
      if (clickedPiece && clickedPiece.player === turn) {
          setSelectedPos({r, c});
          const moves = getMoves(board, r, c, clickedPiece);
          // Optional rule: Mandatory jumps? For OT simplicity, let's make it flexible or just show options.
          // Let's prioritize jumps visually but allow moves.
          setValidMoves(moves);
          return;
      }

      // Move to empty
      if (!clickedPiece && selectedPos) {
          const move = validMoves.find(m => m.r === r && m.c === c);
          if (move) {
              executeMove(selectedPos.r, selectedPos.c, move);
          }
      }
  };

  const executeMove = (fromR: number, fromC: number, move: any) => {
      const newBoard = board.map(row => row.map(p => p ? {...p} : null));
      const piece = newBoard[fromR][fromC]!;
      
      // Move
      newBoard[move.r][move.c] = piece;
      newBoard[fromR][fromC] = null;

      // Capture
      if (move.isJump) {
          newBoard[move.jumpR][move.jumpC] = null;
          soundService.playGameSound('FALL');
      } else {
          soundService.playGameSound('BOUNCE');
      }

      // King Promotion
      if ((piece.player === 1 && move.r === SIZE - 1) || (piece.player === 2 && move.r === 0)) {
          piece.isKing = true;
          soundService.playGameSound('HIGH');
      }

      setBoard(newBoard);
      setSelectedPos(null);
      setValidMoves([]);

      // Check Win
      const p1Count = newBoard.flat().filter(p => p?.player === 1).length;
      const p2Count = newBoard.flat().filter(p => p?.player === 2).length;
      if (p1Count === 0) setWinner(2);
      else if (p2Count === 0) setWinner(1);
      else setTurn(turn === 1 ? 2 : 1);
  };

  // AI
  useEffect(() => {
      if (gameMode === 'PVE' && turn === 1 && !winner) {
          const timer = setTimeout(() => {
              const allMoves: any[] = [];
              for(let r=0; r<SIZE; r++){
                  for(let c=0; c<SIZE; c++){
                      const p = board[r][c];
                      if (p && p.player === 1) {
                          const ms = getMoves(board, r, c, p);
                          ms.forEach(m => allMoves.push({fromR: r, fromC: c, ...m}));
                      }
                  }
              }

              if (allMoves.length === 0) {
                  setWinner(2); // AI can't move
                  return;
              }

              // Priority: Jumps -> Promotion -> Random
              const jumps = allMoves.filter(m => m.isJump);
              const promotes = allMoves.filter(m => m.r === SIZE - 1);
              
              let bestMove;
              if (jumps.length > 0) bestMove = jumps[Math.floor(Math.random() * jumps.length)];
              else if (promotes.length > 0) bestMove = promotes[Math.floor(Math.random() * promotes.length)];
              else bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];

              executeMove(bestMove.fromR, bestMove.fromC, bestMove);

          }, 800);
          return () => clearTimeout(timer);
      }
  }, [turn, board, winner, gameMode]);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex-none p-2 flex justify-between items-center bg-white shadow-sm z-10 h-12 sm:h-14">
            <button onClick={onBack} className="p-1.5 bg-gray-100 rounded-full text-slate-800"><ArrowLeft size={18} /></button>
            <button 
                onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-xs sm:text-sm font-bold text-slate-900 border border-slate-200"
            >
                {gameMode === 'PVE' ? <User size={14} /> : <Users size={14} />}
                {gameMode === 'PVE' ? '單人' : '雙人'}
            </button>
            <button onClick={resetGame} className="p-1.5 bg-gray-100 rounded-full text-slate-800"><RefreshCw size={18} /></button>
        </div>

        <div className="flex-none text-center py-1 bg-slate-200 font-bold text-slate-700 text-sm">
            {winner ? (winner === 1 ? "紅方獲勝" : "白方獲勝") : (turn === 1 ? (gameMode==='PVE'?"電腦(紅)回合":"紅方回合") : "白方(你)回合")}
        </div>

        {/* Board */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 bg-slate-100 overflow-hidden">
            <div className="flex flex-col items-center justify-center" style={{ width: 'min(85vw, 70vh)' }}>
                
                {/* Top Coordinates */}
                <div className="flex pl-6 mb-0.5 w-full">
                    {COL_LABELS.map(c => (
                        <div key={c} className="flex-1 text-center font-bold text-slate-500 text-[10px] sm:text-xs">{c}</div>
                    ))}
                </div>

                <div className="flex w-full items-stretch">
                    {/* Left Coordinates */}
                    <div className="flex flex-col justify-between pr-1 py-4 w-6">
                        {ROW_LABELS.map(r => (
                            <div key={r} className="flex-1 flex items-center justify-center font-bold text-slate-500 text-[10px] sm:text-xs">{r}</div>
                        ))}
                    </div>

                    <div className="bg-[#4a3b2a] p-1.5 rounded shadow-2xl border-4 border-[#3d2b1f] flex-1 aspect-square">
                        <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                            {board.map((row, r) => row.map((p, c) => {
                                const isDark = (r + c) % 2 === 1;
                                const isSelected = selectedPos?.r === r && selectedPos?.c === c;
                                const isValidMove = validMoves.some(m => m.r === r && m.c === c);
                                const isJumpTarget = validMoves.some(m => m.r === r && m.c === c && m.isJump);

                                return (
                                    <div 
                                        key={`${r}-${c}`}
                                        onClick={() => handleSquareClick(r, c)}
                                        className={`
                                            relative flex items-center justify-center
                                            ${isDark ? 'bg-[#8B4513]' : 'bg-[#DEB887]'}
                                            ${isValidMove ? 'cursor-pointer' : ''}
                                        `}
                                    >
                                        {isValidMove && (
                                            <div className={`absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isJumpTarget ? 'bg-red-500 animate-pulse' : 'bg-green-500/50'}`}></div>
                                        )}
                                        {p && (
                                            <div className={`
                                                w-[80%] h-[80%] rounded-full shadow-md border-2 sm:border-4 flex items-center justify-center transition-transform aspect-square
                                                ${p.player === 1 ? 'bg-red-700 border-red-900' : 'bg-slate-200 border-slate-400'}
                                                ${isSelected ? 'scale-110 ring-2 ring-yellow-400' : ''}
                                            `}>
                                                {p.isKing && <Crown size={14} className={p.player === 1 ? 'text-red-200' : 'text-slate-600'} />}
                                            </div>
                                        )}
                                    </div>
                                );
                            }))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {winner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white p-8 rounded-2xl text-center animate-bounce-short shadow-2xl">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500"/>
                    <h2 className="text-2xl font-bold mb-6">
                        {winner === 1 ? "紅方獲勝！" : "白方獲勝！"}
                    </h2>
                    <button onClick={resetGame} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold">再來一局</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default CheckersGame;
