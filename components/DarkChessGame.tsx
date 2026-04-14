
// ... imports ... (Keep existing imports)
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User, BookOpen, X } from 'lucide-react';
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

const RULES_CONTENT = [
  { title: '基本規則', content: '暗棋為中國象棋的簡化翻牌版本。所有棋子面朝下隨機排列在 4×8 的棋盤上。玩家輪流行動，每次可翻開一枚棋子、移動己方棋子或吃掉敵方棋子。' },
  { title: '先手決定', content: '遊戲開始時，第一位翻牌的玩家決定雙方顏色：翻到紅棋，翻牌者為紅方，下一回合換黑方行動；翻到黑棋，翻牌者為黑方，下一回合換紅方行動。之後雙方輪流行動，與翻牌顏色無關。' },
  { title: '棋子等級（由高到低）', content: '將/帥（最高）> 士/仕 > 象/相 > 車/俥 > 馬/傌 > 炮/包（特殊） > 卒/兵（最低）' },
  { title: '吃子規則', content: '高等級棋子可吃低等級或同等級棋子。例外：卒/兵可吃將/帥（以小吃大），但將/帥不能吃卒/兵。炮/包有特殊規則（見下方）。' },
  { title: '炮/包的規則', content: '炮（包）不能直接相鄰吃子。必須隔著「恰好一枚」任何棋子（稱為炮架）才能吃子，可以跨越整行或整列。炮本身移動時和一般棋子一樣，只能移動到相鄰格。' },
  { title: '移動規則', content: '所有棋子每次只能移動到相鄰的一格（上、下、左、右）。炮吃子時可跨格，但移動時仍只能走一格。' },
  { title: '勝負判定', content: '當某方所有棋子被吃光時，該方判負。' },
];

const DarkChessGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  // ... state definitions ...
  const [grid, setGrid] = useState<(Piece | null)[]>(Array(32).fill(null));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isRedTurn, setIsRedTurn] = useState(true); 
  const [playerColor, setPlayerColor] = useState<'RED' | 'BLACK' | null>(null); 
  const [log, setLog] = useState("點擊棋子翻牌");
  const [gameOver, setGameOver] = useState(false);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');
  const [firstFlipDone, setFirstFlipDone] = useState(false);
  const [showRules, setShowRules] = useState(false);

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
    setFirstFlipDone(false);
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
          
          if (!firstFlipDone) {
              // FIRST flip: determines colors
              // Flip RED → you are RED → next turn is BLACK (isRedTurn=false)
              // Flip BLACK → you are BLACK → next turn is RED (isRedTurn=true)
              const revealedIsRed = newGrid[idx]!.isRed;
              const nextTurnIsRed = !revealedIsRed;
              
              if (gameMode === 'PVE') {
                  setPlayerColor(revealedIsRed ? 'RED' : 'BLACK');
              }
              setFirstFlipDone(true);
              setLog(`翻開 ${newGrid[idx]!.text}，${revealedIsRed ? '紅' : '黑'}方先手`);
              setIsRedTurn(nextTurnIsRed);
          } else {
              // Subsequent flips: just end the turn normally, color doesn't matter
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

  const endTurn = () => { setIsRedTurn(prev => !prev); };

  // ================== AI Helpers ==================
  const getPieceDanger = (idx: number, board: (Piece|null)[], aiColorRed: boolean): number => {
      const piece = board[idx];
      if (!piece) return 0;
      let danger = 0;
      getAdjacents(idx).forEach(adj => {
          const enemy = board[adj];
          if (enemy && enemy.revealed && !enemy.dead && enemy.isRed !== aiColorRed) {
              if (enemy.rank !== 2 && canEat(enemy, piece)) {
                  danger += enemy.rank * 10;
              }
          }
      });
      board.forEach((enemy, eIdx) => {
          if (enemy && enemy.revealed && !enemy.dead && enemy.isRed !== aiColorRed && enemy.rank === 2) {
              if (canCannonEat(eIdx, idx, board)) danger += 80;
          }
      });
      return danger;
  };

  const isSafePosition = (toIdx: number, movingPiece: Piece, board: (Piece|null)[], aiColorRed: boolean): boolean => {
      const simBoard = [...board];
      simBoard[toIdx] = movingPiece;
      return getAdjacents(toIdx).every(adj => {
          const enemy = simBoard[adj];
          if (!enemy || !enemy.revealed || enemy.dead || enemy.isRed === aiColorRed) return true;
          if (enemy.rank === 2) return true; // cannon can't eat adjacent
          return !canEat(enemy, movingPiece);
      });
  };

  // ================== Normal AI ==================
  const executeAiMoveNormal = (aiColorRed: boolean) => {
      const actions: any[] = [];

      grid.forEach((p, idx) => {
          if (!p || !p.revealed || p.dead || p.isRed !== aiColorRed) return;
          const myDanger = getPieceDanger(idx, grid, aiColorRed);

          getAdjacents(idx).forEach(adj => {
              const target = grid[adj];
              if (!target) {
                  const safe = isSafePosition(adj, p, grid, aiColorRed) ? 15 : -10;
                  const escape = myDanger > 0 ? 25 : 0;
                  actions.push({type: 'MOVE', from: idx, to: adj, score: 5 + safe + escape});
              } else if (target.revealed && target.isRed !== aiColorRed && p.rank !== 2) {
                  if (canEat(p, target)) {
                      actions.push({type: 'CAPTURE', from: idx, to: adj, score: 100 + target.rank * 15 + (myDanger > 0 ? 30 : 0)});
                  }
              }
          });

          if (p.rank === 2) {
              grid.forEach((t, tIdx) => {
                  if (t && t.revealed && !t.dead && t.isRed !== aiColorRed && canCannonEat(idx, tIdx, grid)) {
                      actions.push({type: 'CAPTURE', from: idx, to: tIdx, score: 160 + t.rank * 15});
                  }
              });
          }
      });

      grid.forEach((p, idx) => {
          if (p && !p.revealed && !p.dead) {
              actions.push({type: 'REVEAL', to: idx, score: 25 + Math.random() * 20});
          }
      });

      if (actions.length === 0) { setIsRedTurn(prev => !prev); return; }
      actions.sort((a, b) => b.score - a.score);
      
      // Pick randomly from top 3 for natural feel
      const topK = actions.slice(0, Math.min(3, actions.length));
      executeAction(topK[Math.floor(Math.random() * topK.length)], aiColorRed);
  };

  // ================== Advanced AI ==================
  const executeAiMoveAdvanced = (aiColorRed: boolean) => {
      const actions: any[] = [];

      grid.forEach((p, idx) => {
          if (!p || !p.revealed || p.dead || p.isRed !== aiColorRed) return;
          const myDanger = getPieceDanger(idx, grid, aiColorRed);

          getAdjacents(idx).forEach(adj => {
              const target = grid[adj];
              if (!target) {
                  const safe = isSafePosition(adj, p, grid, aiColorRed) ? 20 : -40;
                  const escape = myDanger > 0 ? 50 + p.rank * 8 : 0;
                  actions.push({type: 'MOVE', from: idx, to: adj, score: 5 + safe + escape});
              } else if (target.revealed && target.isRed !== aiColorRed && p.rank !== 2) {
                  if (canEat(p, target)) {
                      // Simulate the capture and evaluate safety after
                      const simBoard = [...grid];
                      simBoard[adj] = {...p};
                      simBoard[idx] = null;
                      const afterDanger = getPieceDanger(adj, simBoard, aiColorRed);
                      const afterPenalty = afterDanger > 0 ? -afterDanger : 20;
                      actions.push({type: 'CAPTURE', from: idx, to: adj, score: 120 + target.rank * 20 + (myDanger > 0 ? 50 : 0) + afterPenalty});
                  }
              }
          });

          if (p.rank === 2) {
              grid.forEach((t, tIdx) => {
                  if (t && t.revealed && !t.dead && t.isRed !== aiColorRed && canCannonEat(idx, tIdx, grid)) {
                      actions.push({type: 'CAPTURE', from: idx, to: tIdx, score: 200 + t.rank * 20});
                  }
              });
          }
      });

      // Advanced AI only reveals if no good action available
      const goodActions = actions.filter(a => a.score > 60);
      if (goodActions.length === 0) {
          grid.forEach((p, idx) => {
              if (p && !p.revealed && !p.dead) {
                  actions.push({type: 'REVEAL', to: idx, score: 20 + Math.random() * 10});
              }
          });
      }

      if (actions.length === 0) { setIsRedTurn(prev => !prev); return; }
      actions.sort((a, b) => b.score - a.score);
      
      // Advanced AI always picks the best (no randomness)
      executeAction(actions[0], aiColorRed);
  };

  const executeAction = (action: any, aiColorRed: boolean) => {
      if (action.type === 'REVEAL') {
          const newGrid = [...grid];
          newGrid[action.to]!.revealed = true;
          setGrid(newGrid);
          setLog(`電腦翻開 ${newGrid[action.to]!.text}`);
          soundService.playGameSound('BOUNCE');
          if (!firstFlipDone) {
              const revealedIsRed = newGrid[action.to]!.isRed;
              setFirstFlipDone(true);
              setIsRedTurn(!revealedIsRed);
          } else {
              endTurn();
          }
      } else if (action.type === 'MOVE') {
          movePiece(action.from, action.to);
      } else if (action.type === 'CAPTURE') {
          capturePiece(action.from, action.to);
      }
  };

  useEffect(() => {
      if (gameMode === 'PVE' && playerColor && !gameOver) {
          const isAiTurn = (playerColor === 'RED' && !isRedTurn) || (playerColor === 'BLACK' && isRedTurn);
          if (isAiTurn) {
              const timer = setTimeout(() => {
                  const aiColorRed = playerColor === 'BLACK';
                  if (difficulty === 'ADVANCED') {
                      executeAiMoveAdvanced(aiColorRed);
                  } else {
                      executeAiMoveNormal(aiColorRed);
                  }
              }, 900);
              return () => clearTimeout(timer);
          }
      }
  }, [isRedTurn, playerColor, gameOver, gameMode]);

  return (
    <div className="flex flex-col h-[100dvh] bg-amber-50 overflow-hidden">
        {/* Compact Header */}
        <div className="flex-none p-2 flex justify-between items-center bg-[#f7e7ce] shadow-sm z-10 border-b border-amber-200 h-12 sm:h-14">
            <button onClick={onBack} className="p-1.5 bg-white/50 rounded-full text-amber-900"><ArrowLeft size={18} /></button>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowRules(true)}
                    className="flex items-center gap-1 px-2 py-1.5 bg-white/50 rounded-full text-xs font-bold text-amber-900 border border-amber-300"
                    title="象棋規則說明"
                >
                    <BookOpen size={14} />
                    <span className="hidden sm:inline">規則</span>
                </button>
                <button 
                    onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full text-xs sm:text-sm font-bold text-amber-900 border border-amber-300"
                >
                    {gameMode === 'PVE' ? <User size={14} /> : <Users size={14} />}
                    {gameMode === 'PVE' ? '單人' : '雙人'}
                </button>
            </div>
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

        {/* Board Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 bg-amber-100 overflow-hidden">
            <div 
                className="relative flex flex-col items-center justify-center w-full"
                style={{ 
                    aspectRatio: '2/1',
                    maxHeight: '60vh',
                    maxWidth: '120vh',
                    width: '95vw'
                }}
            > 
                <div className="w-full h-full flex flex-col">
                    <div className="flex pl-6 mb-0.5 w-full shrink-0">
                        {COL_LABELS.map(c => (
                            <div key={c} className="flex-1 text-center font-bold text-amber-800 text-[10px] sm:text-xs">{c}</div>
                        ))}
                    </div>

                    <div className="flex w-full flex-1 min-h-0">
                        <div className="flex flex-col justify-between pr-1 py-1 w-6 shrink-0">
                            {ROW_LABELS.map(r => (
                                <div key={r} className="flex-1 flex items-center justify-center font-bold text-amber-800 text-[10px] sm:text-xs">{r}</div>
                            ))}
                        </div>

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
        
        {/* Game Over Overlay */}
        {gameOver && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#f7e7ce] p-6 rounded-xl border-4 border-[#8B4513] text-center shadow-2xl">
                    <Trophy className="w-16 h-16 mx-auto mb-2 text-amber-600"/>
                    <h2 className="text-xl font-bold text-amber-900 mb-4">{log}</h2>
                    <button onClick={initGame} className="px-6 py-2 bg-[#8B4513] text-white rounded font-bold shadow hover:bg-[#5C3317]">再來一局</button>
                </div>
            </div>
        )}

        {/* Rules Modal */}
        {showRules && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-[#f7e7ce] rounded-xl border-4 border-[#8B4513] shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#8B4513] rounded-t-lg">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            <BookOpen size={18} /> 暗棋規則說明
                        </h2>
                        <button onClick={() => setShowRules(false)} className="text-white/80 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-4 space-y-3">
                        {RULES_CONTENT.map((section, i) => (
                            <div key={i} className="bg-amber-100 rounded-lg p-3 border border-amber-300">
                                <h3 className="font-bold text-amber-900 text-sm mb-1">▶ {section.title}</h3>
                                <p className="text-amber-800 text-xs leading-relaxed">{section.content}</p>
                            </div>
                        ))}
                        <div className="bg-amber-100 rounded-lg p-3 border border-amber-300">
                            <h3 className="font-bold text-amber-900 text-sm mb-2">▶ 棋子對照表</h3>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                <div className="text-red-700 font-bold">紅方</div>
                                <div className="text-black font-bold">黑方</div>
                                {[['帥（最高）','將（最高）'],['仕','士'],['相','象'],['俥','車'],['傌','馬'],['炮（特殊）','包（特殊）'],['兵（最低）','卒（最低）']].map(([r,b],i)=>(
                                    <React.Fragment key={i}>
                                        <div className="text-red-700">{r}</div>
                                        <div className="text-black">{b}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3 border-t border-amber-300">
                        <button 
                            onClick={() => setShowRules(false)}
                            className="w-full py-2 bg-[#8B4513] text-white rounded font-bold hover:bg-[#5C3317]"
                        >
                            了解了，開始遊戲！
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DarkChessGame;
