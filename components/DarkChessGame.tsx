
// ... imports ... (Keep existing imports)
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

// ... constants ... (Keep existing constants RANKS, PIECES, COLS, ROWS, etc.)
const RANKS: Record<string, number> = {
    '將': 7, '帥': 7, '士': 6, '仕': 6, '象': 5, '相': 5,
    '車': 4, '俥': 4, '馬': 3, '傌': 3, '包': 2, '炮': 2, '卒': 1, '兵': 1
};

const RED_PIECES = ['帥','仕','仕','相','相','俥','俥','傌','傌','炮','炮','兵','兵','兵','兵','兵'];
const BLK_PIECES = ['將','士','士','象','象','車','車','馬','馬','包','包','卒','卒','卒','卒','卒'];

const COLS = 8;
const ROWS = 4;
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROW_LABELS = ['1', '2', '3', '4'];

interface Piece {
    id: number;
    text: string;
    isRed: boolean;
    rank: number;
    revealed: boolean;
    dead: boolean;
}

const DarkChessGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  // ... state definitions ...
  const [grid, setGrid] = useState<(Piece | null)[]>(Array(32).fill(null));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isRedTurn, setIsRedTurn] = useState(true); 
  const [playerColor, setPlayerColor] = useState<'RED' | 'BLACK' | null>(null); 
  const [log, setLog] = useState("點擊棋子翻牌");
  const [gameOver, setGameOver] = useState(false);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');

  useEffect(() => { initGame(); }, []);
  useEffect(() => { initGame(); }, [gameMode]);

  const initGame = () => {
    let all: Piece[] = [];
    let id = 0;
    RED_PIECES.forEach(p => all.push({id: id++, text: p, isRed: true, rank: RANKS[p], revealed: false, dead: false}));
    BLK_PIECES.forEach(p => all.push({id: id++, text: p, isRed: false, rank: RANKS[p], revealed: false, dead: false}));
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }
    setGrid(all);
    setSelectedIdx(null);
    setIsRedTurn(true);
    setPlayerColor(null);
    setLog("遊戲開始！請翻牌");
    setGameOver(false);
  };

  const getAdjacents = (idx: number) => {
      const row = Math.floor(idx / COLS);
      const col = idx % COLS;
      const adjs = [];
      if (row > 0) adjs.push(idx - COLS);
      if (row < ROWS - 1) adjs.push(idx + COLS);
      if (col > 0) adjs.push(idx - 1);
      if (col < COLS - 1) adjs.push(idx + 1);
      return adjs;
  };

  const canEat = (src: Piece, dst: Piece) => {
      if (src.rank === 2) return false;
      if (src.rank === 1 && dst.rank === 7) return true;
      if (src.rank === 7 && dst.rank === 1) return false;
      if (src.rank >= dst.rank) return true;
      return false;
  };

  const canCannonEat = (srcIdx: number, dstIdx: number, board: (Piece|null)[]) => {
      const r1 = Math.floor(srcIdx / COLS), c1 = srcIdx % COLS;
      const r2 = Math.floor(dstIdx / COLS), c2 = dstIdx % COLS;
      if (r1 !== r2 && c1 !== c2) return false;
      let screens = 0;
      if (r1 === r2) {
          const start = Math.min(c1, c2) + 1;
          const end = Math.max(c1, c2);
          for (let c = start; c < end; c++) {
              const idx = r1 * COLS + c;
              if (board[idx] && !board[idx]?.dead) screens++;
          }
      } else {
          const start = Math.min(r1, r2) + 1;
          const end = Math.max(r1, r2);
          for (let r = start; r < end; r++) {
              const idx = r * COLS + c1;
              if (board[idx] && !board[idx]?.dead) screens++;
          }
      }
      return screens === 1;
  };

  const handleTileClick = (idx: number) => {
      if (gameOver) return;
      if (gameMode === 'PVE' && playerColor) {
          const isAiTurn = (playerColor === 'RED' && !isRedTurn) || (playerColor === 'BLACK' && isRedTurn);
          if (isAiTurn) return;
      }
      const target = grid[idx];

      // 1. Reveal hidden piece
      if (target && !target.revealed) {
          if (selectedIdx !== null) { setSelectedIdx(null); return; }
          const newGrid = [...grid];
          if (newGrid[idx]) newGrid[idx]!.revealed = true;
          setGrid(newGrid);
          soundService.playGameSound('BOUNCE');
          
          if (!playerColor) {
              const revealedIsRed = newGrid[idx]!.isRed;
              const pColor = revealedIsRed ? 'RED' : 'BLACK';
              if (gameMode === 'PVE') setPlayerColor(pColor);
              setLog(`翻開 ${newGrid[idx]!.text}`);
              // Fix: If revealed Black (isRed=false), next turn is Red (true). 
              // If revealed Red (isRed=true), next turn is Black (false).
              setIsRedTurn(!revealedIsRed);
          } else {
              setLog(`翻開了 ${newGrid[idx]!.text}`);
              endTurn();
          }
          return;
      }

      // 2. Select own piece
      if (target && target.revealed && target.isRed === isRedTurn) {
          if (selectedIdx === idx) setSelectedIdx(null);
          else { setSelectedIdx(idx); soundService.playGameSound('HIGH'); }
          return;
      }

      // 3. Move or Capture
      if (selectedIdx !== null) {
          const attacker = grid[selectedIdx]!;
          
          // Move to empty
          if (!target) {
              const isAdjacent = getAdjacents(selectedIdx).includes(idx);
              if (isAdjacent) { 
                  movePiece(selectedIdx, idx); 
              } else {
                  // Optional: visual feedback for invalid move
                  setSelectedIdx(null);
              }
              return;
          }
          
          // Capture enemy
          if (target && target.revealed && target.isRed !== attacker.isRed) {
              const isAdjacent = getAdjacents(selectedIdx).includes(idx);
              if (attacker.rank === 2) {
                  if (canCannonEat(selectedIdx, idx, grid)) capturePiece(selectedIdx, idx);
                  else setSelectedIdx(null);
              } else {
                  if (isAdjacent && canEat(attacker, target)) capturePiece(selectedIdx, idx);
                  else setSelectedIdx(null);
              }
          }
      }
  };

  const movePiece = (from: number, to: number) => {
      const newGrid = [...grid];
      newGrid[to] = newGrid[from];
      newGrid[from] = null;
      setGrid(newGrid);
      setSelectedIdx(null);
      soundService.playGameSound('FALL');
      endTurn();
  };

  const capturePiece = (from: number, to: number) => {
      const newGrid = [...grid];
      const victim = newGrid[to]!;
      victim.dead = true; 
      newGrid[to] = newGrid[from];
      newGrid[from] = null;
      setGrid(newGrid);
      setSelectedIdx(null);
      soundService.playGameSound('RISE'); 
      setLog(`吃了 ${victim.text}`);
      checkWinCondition(newGrid);
      endTurn();
  };

  const checkWinCondition = (b: (Piece|null)[]) => {
      const activeRed = b.filter(p => p && !p.dead && p.isRed).length;
      const activeBlk = b.filter(p => p && !p.dead && !p.isRed).length;
      if (activeRed === 0) { setGameOver(true); setLog("黑方獲勝！"); soundService.playWin(); }
      else if (activeBlk === 0) { setGameOver(true); setLog("紅方獲勝！"); soundService.playWin(); }
  };

  const endTurn = () => { setIsRedTurn(!isRedTurn); };

  // Improved AI Logic
  useEffect(() => {
      if (gameMode === 'PVE' && playerColor && !gameOver) {
          const isAiTurn = (playerColor === 'RED' && !isRedTurn) || (playerColor === 'BLACK' && isRedTurn);
          if (isAiTurn) {
              const timer = setTimeout(() => { executeAiMove(); }, 1000);
              return () => clearTimeout(timer);
          }
      }
  }, [isRedTurn, playerColor, gameOver, gameMode]);

  const executeAiMove = () => {
      const aiColorRed = playerColor === 'BLACK'; 
      if (aiColorRed !== isRedTurn) return; 
      
      const actions: any[] = [];
      const boardState = [...grid];

      // 1. Evaluate possible captures (High priority)
      grid.forEach((p, idx) => {
          if (p && p.revealed && !p.dead && p.isRed === aiColorRed) {
              
              // Normal Moves / Captures
              const adjs = getAdjacents(idx);
              adjs.forEach(adj => {
                  const target = grid[adj];
                  if (!target) {
                      // Move to empty: Score based on safety (avoid moving next to stronger enemy)
                      actions.push({type: 'MOVE', from: idx, to: adj, score: 10}); 
                  } else if (target.revealed && target.isRed !== aiColorRed && p.rank !== 2) {
                      if (canEat(p, target)) {
                          // Score based on value of target
                          actions.push({type: 'CAPTURE', from: idx, to: adj, score: 100 + (target.rank * 10)}); 
                      }
                  }
              });

              // Cannon Captures
              if (p.rank === 2) {
                  grid.forEach((t, tIdx) => {
                      if (t && t.revealed && !t.dead && t.isRed !== aiColorRed) {
                          if (canCannonEat(idx, tIdx, grid)) {
                              // Cannons love eating high value targets
                              actions.push({type: 'CAPTURE', from: idx, to: tIdx, score: 150 + (t.rank * 10)});
                          }
                      }
                  });
              }
          }
      });

      // 2. Evaluate Reveals (Medium priority, depends on board state)
      const unrevealedCount = grid.filter(p => p && !p.revealed && !p.dead).length;
      grid.forEach((p, idx) => {
          if (p && !p.revealed && !p.dead) {
              // Less likely to reveal if board is full of enemies
              actions.push({type: 'REVEAL', to: idx, score: 20 + Math.random() * 15});
          }
      });

      if (actions.length === 0) { setIsRedTurn(!isRedTurn); return; }
      
      // Sort and execute best
      actions.sort((a, b) => b.score - a.score);
      
      // Add a little randomness to top choices to feel natural
      const best = actions[0];
      
      if (best.type === 'REVEAL') {
          const newGrid = [...grid];
          newGrid[best.to]!.revealed = true;
          setGrid(newGrid);
          setLog(`電腦翻開 ${newGrid[best.to]!.text}`);
          soundService.playGameSound('BOUNCE');
          
          // Check color logic if AI flipped first (rare in PVE usually player starts)
          endTurn();
          
      } else if (best.type === 'MOVE') movePiece(best.from!, best.to);
      else if (best.type === 'CAPTURE') capturePiece(best.from!, best.to);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-amber-50 overflow-hidden">
        {/* Compact Header */}
        <div className="flex-none p-2 flex justify-between items-center bg-[#f7e7ce] shadow-sm z-10 border-b border-amber-200 h-12 sm:h-14">
            <button onClick={onBack} className="p-1.5 bg-white/50 rounded-full text-amber-900"><ArrowLeft size={18} /></button>
            <button 
                onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full text-xs sm:text-sm font-bold text-amber-900 border border-amber-300"
            >
                {gameMode === 'PVE' ? <User size={14} /> : <Users size={14} />}
                {gameMode === 'PVE' ? '單人' : '雙人'}
            </button>
            <button onClick={initGame} className="p-1.5 bg-white/50 rounded-full text-amber-900"><RefreshCw size={18} /></button>
        </div>

        {/* Log */}
        <div className="flex-none text-center py-1 bg-[#f7e7ce] text-amber-900 border-b border-amber-200">
            <div className="font-bold text-sm sm:text-base">{log}</div>
            <div className="text-xs opacity-70">
                {isRedTurn ? "紅方回合" : "黑方回合"} 
                {gameMode === 'PVE' && playerColor && <span className="ml-1">({playerColor === 'RED' ? '你:紅' : '你:黑'})</span>}
            </div>
        </div>

        {/* Board Container - Flex centered */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 bg-amber-100 overflow-hidden">
            
            {/* 
               CRITICAL FIX: Layout Constraint for Landscape Mode.
               A 2:1 board needs to fit in the screen.
               Reduced max height to 60vh to prevent cropping at bottom in landscape.
            */}
            <div 
                className="relative flex flex-col items-center justify-center w-full"
                style={{ 
                    aspectRatio: '2/1',
                    maxHeight: '60vh', // Further reduced from 80vh to 60vh
                    maxWidth: '120vh', // Matches 2:1 of 60vh
                    width: '95vw'
                }}
            > 
                {/* Board Wrapper with Coordinates */}
                <div className="w-full h-full flex flex-col">
                    {/* Top Labels */}
                    <div className="flex pl-6 mb-0.5 w-full shrink-0">
                        {COL_LABELS.map(c => (
                            <div key={c} className="flex-1 text-center font-bold text-amber-800 text-[10px] sm:text-xs">{c}</div>
                        ))}
                    </div>

                    <div className="flex w-full flex-1 min-h-0">
                        {/* Left Labels */}
                        <div className="flex flex-col justify-between pr-1 py-1 w-6 shrink-0">
                            {ROW_LABELS.map(r => (
                                <div key={r} className="flex-1 flex items-center justify-center font-bold text-amber-800 text-[10px] sm:text-xs">{r}</div>
                            ))}
                        </div>

                        {/* The Board - Horizontal 8x4 */}
                        <div className="bg-[#DEB887] p-1.5 sm:p-2 rounded shadow-xl border-4 border-[#8B4513] w-full h-full">
                            <div 
                                className="grid gap-1 sm:gap-2 w-full h-full"
                                style={{ 
                                    gridTemplateColumns: `repeat(8, 1fr)`, 
                                    gridTemplateRows: `repeat(4, 1fr)` 
                                }}
                            >
                                {grid.map((piece, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTileClick(idx)}
                                        type="button"
                                        className={`
                                            relative rounded-full border-2 sm:border-4 shadow-sm w-full h-full
                                            transition-transform active:scale-95
                                            ${!piece ? 'border-transparent bg-black/5 hover:bg-black/10' : ''}
                                            ${piece && !piece.revealed ? 'bg-[#8B4513] border-[#5C3317]' : ''}
                                            ${piece && piece.revealed ? 'bg-[#f7e7ce]' : ''}
                                            ${piece && piece.revealed && piece.isRed ? 'text-red-600 border-red-800' : ''}
                                            ${piece && piece.revealed && !piece.isRed ? 'text-black border-black' : ''}
                                            ${selectedIdx === idx ? 'ring-4 ring-yellow-400 scale-105 z-10' : ''}
                                        `}
                                    >
                                        {/* 
                                            CRITICAL FIX: Absolute positioning for content.
                                            This prevents the button size from jumping when content changes from '?' to Text.
                                            pointer-events-none ensures clicks go to the button logic.
                                        */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            {piece && piece.revealed && (
                                                <div className="rounded-full border border-dashed border-current w-[85%] h-[85%] flex items-center justify-center text-base sm:text-xl md:text-3xl font-bold">
                                                    {piece.text}
                                                </div>
                                            )}
                                            {piece && !piece.revealed && (
                                                <div className="opacity-20 text-white text-[10px] sm:text-xs">?</div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {gameOver && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#f7e7ce] p-6 rounded-xl border-4 border-[#8B4513] text-center shadow-2xl">
                    <Trophy className="w-16 h-16 mx-auto mb-2 text-amber-600"/>
                    <h2 className="text-xl font-bold text-amber-900 mb-4">{log}</h2>
                    <button onClick={initGame} className="px-6 py-2 bg-[#8B4513] text-white rounded font-bold shadow hover:bg-[#5C3317]">再來一局</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default DarkChessGame;
