import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Bomb, Eye, EyeOff, MapPin } from 'lucide-react';
import { Difficulty } from '../types';
import { motion } from 'motion/react';

interface TreasureGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

export const EMOJI_POOL = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", 
  "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧",
  "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓",
  "🚗", "🚕", "🚙", "🚌", "🚓", "🚑", "🚒", "🚜"
];

export const TREASURE_GAME_RULES = {
  NORMAL: { gridSize: 4, totalTreasures: 5, bombCount: 0 },
  ADVANCED: { gridSize: 5, totalTreasures: 7, bombCount: 4 },
} as const;

export const PREVIEW_SECONDS_MIN = 1;
export const PREVIEW_SECONDS_MAX = 10;

export interface CellData {
  id: number;
  emoji: string;
  type: 'TREASURE' | 'EMPTY' | 'BOMB';
  revealed: boolean;
  distance?: number;
}

type CellType = CellData['type'];

export const buildTreasureCells = (
  gridSize: number,
  totalTreasures: number,
  bombCount: number,
  random: () => number = Math.random,
): CellData[] => {
  const totalCells = gridSize * gridSize;
  const shuffledEmojis = [...EMOJI_POOL].sort(() => 0.5 - random()).slice(0, totalCells);
  const types: CellType[] = Array(totalCells).fill('EMPTY');

  for (let i = 0; i < totalTreasures; i++) {
    types[i] = 'TREASURE';
  }

  for (let i = totalTreasures; i < totalTreasures + bombCount; i++) {
    types[i] = 'BOMB';
  }

  types.sort(() => 0.5 - random());

  return shuffledEmojis.map((emoji, index) => ({
    id: index,
    emoji,
    type: types[index],
    revealed: false,
  }));
};

export const applyCellScore = (currentScore: number, type: CellType): number => {
  if (type === 'TREASURE') return currentScore + 10;
  if (type === 'BOMB') return Math.max(0, currentScore - 5);
  return currentScore;
};

export const calculateTimeBonus = (elapsedSeconds: number): number =>
  Math.max(0, 50 - elapsedSeconds);

export const hasFoundAllTreasures = (found: number, total: number): boolean =>
  found >= total;

export const countAdjacentTreasures = (
  index: number,
  currentCells: CellData[],
  gridSize: number,
): number => {
  const x = index % gridSize;
  const y = Math.floor(index / gridSize);
  let count = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const nx = x + i;
      const ny = y + j;
      if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
        const nIndex = ny * gridSize + nx;
        if (currentCells[nIndex].type === 'TREASURE') count++;
      }
    }
  }

  return count;
};

const TreasureGame: React.FC<TreasureGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const rules = isAdvanced ? TREASURE_GAME_RULES.ADVANCED : TREASURE_GAME_RULES.NORMAL;
  const gridSize = rules.gridSize;
  const [cells, setCells] = useState<CellData[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'SETUP' | 'PREVIEW' | 'PLAYING' | 'GAMEOVER'>('SETUP');
  
  const [treasuresFound, setTreasuresFound] = useState(0);
  const totalTreasures = rules.totalTreasures;

  // Settings
  const [enablePreview, setEnablePreview] = useState(true);
  const [enableRadar, setEnableRadar] = useState(false);
  const [previewSeconds, setPreviewSeconds] = useState(3);

  // Time tracking
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
      let timer: NodeJS.Timeout;
      if (gameState === 'PLAYING') {
          timer = setInterval(() => {
              setElapsedSeconds(s => s + 1);
          }, 1000);
      }
      return () => clearInterval(timer);
  }, [gameState]);

  const initGame = () => {
      setGameState('SETUP');
  };

  const startGame = () => {
    // Select unique emojis
     const newCells = buildTreasureCells(gridSize, totalTreasures, rules.bombCount);

    setCells(newCells);
    setScore(0);
    setTreasuresFound(0);
    setElapsedSeconds(0);

    if (enablePreview) {
        setGameState('PREVIEW');
        setTimeout(() => {
            setGameState('PLAYING');
        }, previewSeconds * 1000);
    } else {
        setGameState('PLAYING');
    }
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const handleCellClick = (index: number) => {
    if (gameState !== 'PLAYING' || cells[index].revealed) return;

    const newCells = [...cells];
    newCells[index].revealed = true;
    
    const type = newCells[index].type;
    if (type === 'TREASURE') {
      setScore(s => applyCellScore(s, type));
      setTreasuresFound(t => {
        const newT = t + 1;
        if (hasFoundAllTreasures(newT, totalTreasures)) {
          setGameState('GAMEOVER');
          // Add time bonus: max 50 points, minus 1 point per second
          const timeBonus = calculateTimeBonus(elapsedSeconds);
          setScore(s => s + timeBonus);
        }
        return newT;
      });
    } else if (type === 'BOMB') {
      setScore(s => applyCellScore(s, type));
    } else if (type === 'EMPTY' && enableRadar) {
        // Calculate radar distance
        newCells[index].distance = countAdjacentTreasures(index, newCells, gridSize);
    }

    setCells(newCells);
  };

  const getCellAccessibleName = (cell: CellData, isVisualRevealed: boolean) => {
    if (!isVisualRevealed) return `圖案 ${cell.emoji}，尚未挖掘`;
    if (cell.type === 'TREASURE') return `圖案 ${cell.emoji}，寶藏`;
    if (cell.type === 'BOMB') return `圖案 ${cell.emoji}，炸彈`;
    if (cell.distance !== undefined) return `圖案 ${cell.emoji}，空地，周圍有 ${cell.distance} 個寶藏`;
    return `圖案 ${cell.emoji}，空地`;
  };

  return (
    <div
      data-treasure-root="true"
      className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-amber-50"
    >
      <div data-treasure-safe-stage="true" className="app-safe-screen h-full w-full">
        <div
          data-treasure-layout="true"
          className="treasure-layout flex h-full min-h-0 w-full flex-col items-center gap-3 overflow-hidden px-4 py-3"
        >
      <header data-treasure-header="true" className="treasure-header flex w-full max-w-4xl shrink-0 items-center justify-between gap-3">
        <button
          onClick={onBack}
          aria-label="返回遊戲選單"
          className="min-h-11 min-w-11 rounded-full bg-white p-2.5 text-gray-600 shadow-md transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="treasure-title text-2xl font-bold text-amber-800">尋寶大冒險</h2>
          <p className="treasure-helper text-amber-600 font-medium">
            請成員說出想要的圖案，點擊挖寶！
          </p>
        </div>
        <button
          onClick={initGame}
          aria-label="重新開始"
          className="min-h-11 min-w-11 rounded-full bg-amber-500 p-2.5 text-white shadow-md transition-colors hover:bg-amber-600"
        >
          <RefreshCw size={24} />
        </button>
      </header>

      <main className="treasure-card flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center overflow-hidden rounded-3xl bg-white p-4 shadow-lg">
        
        {gameState === 'SETUP' && (
            <section data-treasure-setup="true" className="treasure-setup flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4">
                <h3 className="treasure-setup-title text-2xl font-bold text-amber-800">遊戲設定</h3>

                <div className="treasure-setup-cards grid w-full max-w-4xl gap-4">
                  <div className="treasure-setting-card w-full rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
                      <span className="flex items-center gap-2 font-bold text-lg text-amber-900">
                        {enablePreview ? <Eye className="text-amber-600" /> : <EyeOff className="text-gray-400" />}
                        開局預覽寶藏位置
                      </span>
                      <input
                        type="checkbox"
                        checked={enablePreview}
                        onChange={(e) => setEnablePreview(e.target.checked)}
                        aria-label="開局預覽寶藏位置"
                        className="h-6 w-6 shrink-0 accent-amber-500"
                      />
                    </label>
                    {enablePreview && (
                      <div className="treasure-preview-control flex items-center justify-between gap-3 pl-8 pt-2">
                        <span className="text-amber-700">預覽時間 (秒)</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewSeconds(Math.max(PREVIEW_SECONDS_MIN, previewSeconds - 1))}
                            aria-label="減少預覽時間"
                            className="min-h-11 min-w-11 rounded-full bg-amber-200 font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold">{previewSeconds}</span>
                          <button
                            onClick={() => setPreviewSeconds(Math.min(PREVIEW_SECONDS_MAX, previewSeconds + 1))}
                            aria-label="增加預覽時間"
                            className="min-h-11 min-w-11 rounded-full bg-amber-200 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="treasure-setting-card w-full rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
                    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
                      <span className="flex items-center gap-2 font-bold text-lg text-blue-900">
                        <MapPin className="text-blue-600" />
                        開啟雷達提示
                      </span>
                      <input
                        type="checkbox"
                        checked={enableRadar}
                        onChange={(e) => setEnableRadar(e.target.checked)}
                        aria-label="開啟雷達提示"
                        className="h-6 w-6 shrink-0 accent-blue-500"
                      />
                    </label>
                    <p className="treasure-radar-help pl-8 pt-2 text-sm text-blue-600">挖到空地時，會顯示周圍 8 宮格內的寶藏數量。</p>
                  </div>

                  <button
                    onClick={startGame}
                    className="treasure-start-button min-h-11 w-full rounded-2xl bg-amber-500 py-3 text-xl font-black text-white shadow-lg transition-all hover:scale-105 hover:bg-amber-600 active:scale-95"
                  >
                    開始遊戲
                  </button>
                </div>
            </section>
        )}

        {gameState !== 'SETUP' && (
            <section data-treasure-stage="true" className="treasure-play flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden">
                {/* Score & Progress */}
                <div data-treasure-status="true" className="treasure-status flex w-full shrink-0 items-center justify-between gap-2 px-1 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-2xl bg-amber-100 px-3 py-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            <span className="font-bold text-amber-700">分數 {score}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 font-mono font-bold text-slate-600">
                            <span aria-hidden="true">⏱️</span> 時間 {elapsedSeconds}s
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-2" aria-label={`寶藏進度 ${treasuresFound}/${totalTreasures}`}>
                        <span className="treasure-progress-label font-bold text-gray-600">寶藏 {treasuresFound}/{totalTreasures}</span>
                        <div className="treasure-progress-dots flex gap-1" aria-hidden="true">
                          {Array.from({length: totalTreasures}).map((_, i) => (
                            <div key={i} className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${i < treasuresFound ? 'bg-amber-400 text-white shadow-sm' : 'bg-gray-100 text-transparent'}`}>
                              {i < treasuresFound ? '💎' : '·'}
                            </div>
                          ))}
                        </div>
                    </div>
                </div>

                {gameState === 'GAMEOVER' && (
                    <motion.div
                        data-treasure-gameover="true"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="treasure-gameover mb-2 w-full shrink-0 rounded-2xl border-2 border-green-300 bg-green-100 px-4 py-2 text-center text-lg font-bold text-green-700 shadow-sm"
                    >
                        太棒了！找到所有寶藏！(最終得分: {score})
                    </motion.div>
                )}
                
                {gameState === 'PREVIEW' && (
                    <div data-treasure-preview="true" className="treasure-preview-status mb-2 h-7 shrink-0 text-center font-bold text-rose-600 animate-pulse">
                        請記住寶藏的位置！
                    </div>
                )}

                {/* Game Grid */}
                <div className="treasure-board-stage flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden">
                <div
                    data-treasure-grid="true"
                    className="treasure-grid grid aspect-square max-h-full max-w-full gap-2"
                    style={{ 
                        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` 
                    }}
                >
                {cells.map((cell, index) => {
                    const isVisualRevealed = cell.revealed || gameState === 'PREVIEW';
                    
                    return (
                        <motion.button
                        key={cell.id}
                        onClick={() => handleCellClick(index)}
                        aria-label={getCellAccessibleName(cell, isVisualRevealed)}
                        className={`treasure-cell flex aspect-square items-center justify-center overflow-hidden rounded-xl shadow-sm transition-colors md:rounded-2xl ${
                            isVisualRevealed ? 'bg-gray-100' : 'bg-amber-200 hover:bg-amber-300 active:bg-amber-400 cursor-pointer shadow-md'
                        }`}
                        whileHover={!isVisualRevealed ? { scale: 1.05 } : {}}
                        whileTap={!isVisualRevealed ? { scale: 0.95 } : {}}
                        >
                        {!isVisualRevealed ? (
                            <span className="treasure-cell-emoji">{cell.emoji}</span>
                        ) : (
                            <motion.div
                            initial={gameState === 'PLAYING' ? { scale: 0, rotate: -180 } : false}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex flex-col items-center justify-center w-full h-full"
                            >
                                {cell.type === 'TREASURE' && <span className="treasure-cell-result drop-shadow-md">💎</span>}
                                {cell.type === 'BOMB' && <span className="treasure-cell-result drop-shadow-md">💣</span>}
                                {cell.type === 'EMPTY' && (
                                    cell.distance !== undefined ? (
                                        <div className="flex flex-col items-center">
                                            <span className="treasure-cell-radar font-black text-blue-500">{cell.distance}</span>
                                        </div>
                                    ) : (
                                        <span className="treasure-cell-empty text-gray-300">❌</span>
                                    )
                                )}
                            </motion.div>
                        )}

                        {/* Small indicator of original emoji when revealed */}
                        {isVisualRevealed && gameState === 'PLAYING' && (
                            <div className="treasure-cell-original pointer-events-none absolute left-1 top-1 opacity-50">
                                {cell.emoji}
                            </div>
                        )}
                        </motion.button>
                    )
                })}
                </div>
                </div>
            </section>
        )}
      </main>
        </div>
      </div>
    </div>
  );
};

export default TreasureGame;
