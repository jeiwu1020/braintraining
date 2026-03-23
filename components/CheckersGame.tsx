
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Animation duration in ms
const ANIM_DURATION = 420;

// Player 1 (Red/Black) moves DOWN (index increases)
// Player 2 (White) moves UP (index decreases)
interface Piece {
    player: 1 | 2;
    isKing: boolean;
}

interface AnimatingPiece {
    piece: Piece;
    fromR: number;
    fromC: number;
    toR: number;
    toC: number;
    startTime: number;
}

interface TrailCell {
    r: number;
    c: number;
    opacity: number; // 0..1
}

const CheckersGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [board, setBoard] = useState<(Piece | null)[][]>([]);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [selectedPos, setSelectedPos] = useState<{r: number, c: number} | null>(null);
  const [validMoves, setValidMoves] = useState<{r: number, c: number, isJump: boolean}[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');

  // Animation state
  const [animating, setAnimating] = useState(false);
  const [animPiece, setAnimPiece] = useState<AnimatingPiece | null>(null);
  const [animProgress, setAnimProgress] = useState(0); // 0..1
  const [trail, setTrail] = useState<TrailCell[]>([]); // ghost trail cells
  const [lastLandPos, setLastLandPos] = useState<{r: number, c: number} | null>(null); // last move landing highlight

  const animFrameRef = useRef<number | null>(null);
  const boardRef = useRef<(Piece | null)[][]>([]);
  boardRef.current = board;

  // Board cell size reference for pixel positioning
  const boardDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { resetGame(); }, [gameMode]);

  const resetGame = () => {
    const newBoard = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if ((r + c) % 2 === 1) {
                if (r < 3) newBoard[r][c] = { player: 1, isKing: false };
                if (r > 4) newBoard[r][c] = { player: 2, isKing: false };
            }
        }
    }
    setBoard(newBoard);
    setTurn(2);
    setWinner(null);
    setSelectedPos(null);
    setValidMoves([]);
    setAnimating(false);
    setAnimPiece(null);
    setTrail([]);
    setLastLandPos(null);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const isValidPos = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

  const getMoves = (b: (Piece|null)[][], r: number, c: number, p: Piece) => {
      const moves: {r: number, c: number, isJump: boolean, jumpR?: number, jumpC?: number}[] = [];
      const directions = [];
      if (p.player === 1 || p.isKing) directions.push([1, -1], [1, 1]);
      if (p.player === 2 || p.isKing) directions.push([-1, -1], [-1, 1]);

      for (const [dr, dc] of directions) {
          if (isValidPos(r + dr, c + dc) && b[r + dr][c + dc] === null) {
              moves.push({ r: r + dr, c: c + dc, isJump: false });
          }
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

  // Build trail cells between two diagonal positions
  const buildTrail = (fromR: number, fromC: number, toR: number, toC: number): TrailCell[] => {
      const cells: TrailCell[] = [];
      const steps = Math.abs(toR - fromR);
      const dr = (toR - fromR) / steps;
      const dc = (toC - fromC) / steps;
      for (let i = 1; i <= steps; i++) {
          // opacity fades: start cell slightly transparent, end full
          cells.push({ r: fromR + dr * i, c: fromC + dc * i, opacity: i / steps });
      }
      return cells;
  };

  const runAnimation = useCallback((
      fromR: number, fromC: number,
      toR: number, toC: number,
      piece: Piece,
      onComplete: () => void
  ) => {
      const startTime = performance.now();
      const trailCells: TrailCell[] = buildTrail(fromR, fromC, toR, toC);
      // Include origin as trail start (fades out)
      const originTrail: TrailCell[] = [{ r: fromR, c: fromC, opacity: 0.6 }, ...trailCells.slice(0, -1)];

      setAnimating(true);
      setAnimPiece({ piece, fromR, fromC, toR, toC, startTime });
      setTrail(originTrail);

      const animate = (now: number) => {
          const elapsed = now - startTime;
          const t = Math.min(elapsed / ANIM_DURATION, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          setAnimProgress(eased);

          if (t < 1) {
              animFrameRef.current = requestAnimationFrame(animate);
          } else {
              setAnimating(false);
              setAnimPiece(null);
              setTrail([]);
              onComplete();
          }
      };
      animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const applyMove = useCallback((b: (Piece|null)[][], fromR: number, fromC: number, move: any, currentTurn: 1|2) => {
      const newBoard = b.map(row => row.map(p => p ? {...p} : null));
      const piece = newBoard[fromR][fromC]!;

      newBoard[move.r][move.c] = piece;
      newBoard[fromR][fromC] = null;

      if (move.isJump) {
          newBoard[move.jumpR][move.jumpC] = null;
          soundService.playGameSound('FALL');
      } else {
          soundService.playGameSound('BOUNCE');
      }

      if ((piece.player === 1 && move.r === SIZE - 1) || (piece.player === 2 && move.r === 0)) {
          piece.isKing = true;
          soundService.playGameSound('HIGH');
      }

      setBoard(newBoard);
      setLastLandPos({ r: move.r, c: move.c });

      const p1Count = newBoard.flat().filter(p => p?.player === 1).length;
      const p2Count = newBoard.flat().filter(p => p?.player === 2).length;
      if (p1Count === 0) setWinner(2);
      else if (p2Count === 0) setWinner(1);
      else setTurn(currentTurn === 1 ? 2 : 1);
  }, []);

  const executeMove = useCallback((fromR: number, fromC: number, move: any, currentTurn: 1|2) => {
      // Immediately hide piece from board during animation
      const boardDuringAnim = board.map(row => row.map(p => p ? {...p} : null));
      boardDuringAnim[fromR][fromC] = null; // hide source during anim
      setBoard(boardDuringAnim);
      setSelectedPos(null);
      setValidMoves([]);

      const piece = board[fromR][fromC]!;

      runAnimation(fromR, fromC, move.r, move.c, piece, () => {
          applyMove(board, fromR, fromC, move, currentTurn);
      });
  }, [board, runAnimation, applyMove]);

  const handleSquareClick = (r: number, c: number) => {
      if (winner || animating) return;
      if (gameMode === 'PVE' && turn === 1) return;

      const clickedPiece = board[r][c];

      if (clickedPiece && clickedPiece.player === turn) {
          setSelectedPos({r, c});
          const moves = getMoves(board, r, c, clickedPiece);
          setValidMoves(moves);
          return;
      }

      if (!clickedPiece && selectedPos) {
          const move = validMoves.find(m => m.r === r && m.c === c);
          if (move) {
              executeMove(selectedPos.r, selectedPos.c, move, turn);
          }
      }
  };

  // AI
  useEffect(() => {
      if (gameMode === 'PVE' && turn === 1 && !winner && !animating) {
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
                  setWinner(2);
                  return;
              }

              const jumps = allMoves.filter(m => m.isJump);
              const promotes = allMoves.filter(m => m.r === SIZE - 1);

              let bestMove;
              if (jumps.length > 0) bestMove = jumps[Math.floor(Math.random() * jumps.length)];
              else if (promotes.length > 0) bestMove = promotes[Math.floor(Math.random() * promotes.length)];
              else bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];

              executeMove(bestMove.fromR, bestMove.fromC, bestMove, 1);
          }, 900);
          return () => clearTimeout(timer);
      }
  }, [turn, board, winner, gameMode, animating]);

  // Compute animated piece pixel offset
  const getCellPercent = (animP: AnimatingPiece) => {
      const dr = (animP.toR - animP.fromR) * animProgress;
      const dc = (animP.toC - animP.fromC) * animProgress;
      return { dr, dc };
  };

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

                    <div ref={boardDivRef} className="bg-[#4a3b2a] p-1.5 rounded shadow-2xl border-4 border-[#3d2b1f] flex-1 aspect-square relative">
                        <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                            {board.map((row, r) => row.map((p, c) => {
                                const isDark = (r + c) % 2 === 1;
                                const isSelected = selectedPos?.r === r && selectedPos?.c === c;
                                const isValidMove = validMoves.some(m => m.r === r && m.c === c);
                                const isJumpTarget = validMoves.some(m => m.r === r && m.c === c && m.isJump);

                                // Trail ghost: match this cell to trail entries
                                const trailCell = trail.find(t => t.r === r && t.c === c);
                                const isLastLand = lastLandPos?.r === r && lastLandPos?.c === c && !animating && !isSelected;

                                // Animating piece overlay: render at interpolated position
                                const isAnimOrigin = animPiece && animPiece.fromR === r && animPiece.fromC === c;

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => handleSquareClick(r, c)}
                                        className={`
                                            relative flex items-center justify-center
                                            ${isDark ? 'bg-[#8B4513]' : 'bg-[#DEB887]'}
                                            ${isValidMove && !animating ? 'cursor-pointer' : ''}
                                        `}
                                    >
                                        {/* Last landing position ring */}
                                        {isLastLand && (
                                            <div className="absolute inset-0 rounded-sm pointer-events-none"
                                                style={{ boxShadow: 'inset 0 0 0 3px rgba(250, 204, 21, 0.85)' }} />
                                        )}

                                        {/* Trail ghost */}
                                        {trailCell && (
                                            <div
                                                className="absolute inset-0 rounded-sm pointer-events-none"
                                                style={{
                                                    background: `rgba(250, 204, 21, ${trailCell.opacity * 0.35})`,
                                                }}
                                            />
                                        )}

                                        {/* Valid move indicators */}
                                        {isValidMove && !animating && (
                                            <div className={`absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isJumpTarget ? 'bg-red-500 animate-pulse' : 'bg-green-500/50'}`}></div>
                                        )}

                                        {/* Static piece */}
                                        {p && (
                                            <div className={`
                                                w-[80%] h-[80%] rounded-full shadow-md border-2 sm:border-4 flex items-center justify-center aspect-square
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

                        {/* Floating animated piece — positioned absolutely over board grid */}
                        {animPiece && (() => {
                            const { dr, dc } = getCellPercent(animPiece);
                            // Each cell = 100/8 = 12.5% of board
                            const cellPct = 100 / SIZE;
                            // padding offset: p-1.5 = 6px, board inner starts there
                            // We position the piece center at (fromC + dc + 0.5) * cellPct
                            const left = (animPiece.fromC + dc + 0.5) * cellPct;
                            const top = (animPiece.fromR + dr + 0.5) * cellPct;

                            return (
                                <div
                                    className="absolute pointer-events-none z-20"
                                    style={{
                                        left: `calc(${left}% + 6px)`,
                                        top: `calc(${top}% + 6px)`,
                                        transform: 'translate(-50%, -50%)',
                                        width: `calc(${cellPct}% * 0.80)`,
                                        height: `calc(${cellPct}% * 0.80)`,
                                    }}
                                >
                                    <div
                                        className={`
                                            w-full h-full rounded-full shadow-xl border-2 sm:border-4 flex items-center justify-center
                                            ${animPiece.piece.player === 1 ? 'bg-red-700 border-red-900' : 'bg-slate-200 border-slate-400'}
                                        `}
                                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                                    >
                                        {animPiece.piece.isKing && (
                                            <Crown size={14} className={animPiece.piece.player === 1 ? 'text-red-200' : 'text-slate-600'} />
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
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
