import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Bomb, Eye, EyeOff, MapPin } from 'lucide-react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TreasureGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

const EMOJI_POOL = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", 
  "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧",
  "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓",
  "🚗", "🚕", "🚙", "🚌", "🚓", "🚑", "🚒", "🚜"
];

const TreasureGame: React.FC<TreasureGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const gridSize = isAdvanced ? 5 : 4;
  const totalCells = gridSize * gridSize;

  interface CellData { id: number; emoji: string; type: 'TREASURE' | 'EMPTY' | 'BOMB'; revealed: boolean; distance?: number; }
  const [cells, setCells] = useState<CellData[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'SETUP' | 'PREVIEW' | 'PLAYING' | 'GAMEOVER'>('SETUP');
  
  const [treasuresFound, setTreasuresFound] = useState(0);
  const totalTreasures = isAdvanced ? 7 : 5;

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
    const shuffledEmojis = [...EMOJI_POOL].sort(() => 0.5 - Math.random()).slice(0, totalCells);
    
    // Assign types
    let types: ('TREASURE' | 'EMPTY' | 'BOMB')[] = Array(totalCells).fill('EMPTY');
    
    // Add treasures
    for (let i = 0; i < totalTreasures; i++) {
      types[i] = 'TREASURE';
    }
    
    // Add bombs for advanced
    if (isAdvanced) {
      for (let i = totalTreasures; i < totalTreasures + 4; i++) {
        types[i] = 'BOMB';
      }
    }

    // Shuffle types
    types.sort(() => 0.5 - Math.random());

    const newCells = shuffledEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      type: types[index],
      revealed: false
    }));

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

  const countAdjacentTreasures = (index: number, currentCells: CellData[]) => {
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
                  if (currentCells[nIndex].type === 'TREASURE') {
                      count++;
                  }
              }
          }
      }
      return count;
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'PLAYING' || cells[index].revealed) return;

    const newCells = [...cells];
    newCells[index].revealed = true;
    
    const type = newCells[index].type;
    if (type === 'TREASURE') {
      setScore(s => s + 10);
      setTreasuresFound(t => {
        const newT = t + 1;
        if (newT >= totalTreasures) {
          setGameState('GAMEOVER');
          // Add time bonus: max 50 points, minus 1 point per second
          const timeBonus = Math.max(0, 50 - elapsedSeconds);
          setScore(s => s + timeBonus);
        }
        return newT;
      });
    } else if (type === 'BOMB') {
      setScore(s => Math.max(0, s - 5));
    } else if (type === 'EMPTY' && enableRadar) {
        // Calculate radar distance
        newCells[index].distance = countAdjacentTreasures(index, newCells);
    }

    setCells(newCells);
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="p-3 bg-white rounded-full shadow-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-800">尋寶大冒險</h2>
          <p className="text-amber-600 font-medium">
            請成員說出想要的圖案，點擊挖寶！
          </p>
        </div>
        <button
          onClick={initGame}
          className="p-3 bg-amber-500 text-white rounded-full shadow-md hover:bg-amber-600 transition-colors"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 w-full max-w-4xl flex flex-col items-center flex-1">
        
        {gameState === 'SETUP' && (
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md">
                <h3 className="text-2xl font-bold text-amber-800 mb-8">遊戲設定</h3>
                
                <div className="w-full bg-amber-50 p-6 rounded-2xl mb-6 border-2 border-amber-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {enablePreview ? <Eye className="text-amber-600" /> : <EyeOff className="text-gray-400" />}
                            <span className="font-bold text-lg text-amber-900">開局預覽寶藏位置</span>
                        </div>
                        <input type="checkbox" checked={enablePreview} onChange={(e) => setEnablePreview(e.target.checked)} className="w-6 h-6 accent-amber-500" />
                    </div>
                    {enablePreview && (
                        <div className="flex items-center justify-between pl-8">
                            <span className="text-amber-700">預覽時間 (秒)</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setPreviewSeconds(Math.max(1, previewSeconds - 1))} className="w-8 h-8 rounded-full bg-amber-200 font-bold">-</button>
                                <span className="font-bold w-4 text-center">{previewSeconds}</span>
                                <button onClick={() => setPreviewSeconds(Math.min(10, previewSeconds + 1))} className="w-8 h-8 rounded-full bg-amber-200 font-bold">+</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full bg-blue-50 p-6 rounded-2xl mb-8 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="text-blue-600" />
                            <span className="font-bold text-lg text-blue-900">開啟雷達提示</span>
                        </div>
                        <input type="checkbox" checked={enableRadar} onChange={(e) => setEnableRadar(e.target.checked)} className="w-6 h-6 accent-blue-500" />
                    </div>
                    <p className="text-sm text-blue-600 pl-8">挖到空地時，會顯示周圍 8 宮格內的寶藏數量。</p>
                </div>

                <button 
                    onClick={startGame}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    開始遊戲
                </button>
            </div>
        )}

        {gameState !== 'SETUP' && (
            <>
                {/* Score & Progress */}
                <div className="flex w-full justify-between items-center mb-4 sm:mb-6 px-2 sm:px-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-2xl">
                            <Trophy className="text-amber-500 w-6 h-6" />
                            <span className="text-xl font-bold text-amber-700">{score}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl font-mono text-slate-600 font-bold">
                            ⏱️ {elapsedSeconds}s
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-lg font-bold text-gray-600">寶藏:</span>
                        <div className="flex gap-1">
                            {Array.from({length: totalTreasures}).map((_, i) => (
                                <div key={i} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base ${i < treasuresFound ? 'bg-amber-400 text-white shadow-sm' : 'bg-gray-100 text-transparent'}`}>
                                    {i < treasuresFound ? '💎' : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {gameState === 'GAMEOVER' && (
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-4 bg-green-100 text-green-700 px-6 py-3 rounded-2xl text-xl font-bold text-center w-full border-2 border-green-300 shadow-sm"
                    >
                        太棒了！找到所有寶藏！(最終得分: {score})
                    </motion.div>
                )}
                
                {gameState === 'PREVIEW' && (
                    <div className="mb-4 text-rose-600 font-bold text-xl animate-pulse">
                        請記住寶藏的位置！
                    </div>
                )}

                {/* Game Grid */}
                <div 
                    className="grid gap-2 sm:gap-3 w-full max-w-[80vw] mx-auto landscape:max-w-[60vh] landscape:max-h-[60vh] pb-4"
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
                        className={`aspect-square rounded-xl sm:rounded-2xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl flex items-center justify-center shadow-sm relative overflow-hidden transition-colors ${
                            isVisualRevealed ? 'bg-gray-100' : 'bg-amber-200 hover:bg-amber-300 active:bg-amber-400 cursor-pointer shadow-md'
                        }`}
                        whileHover={!isVisualRevealed ? { scale: 1.05 } : {}}
                        whileTap={!isVisualRevealed ? { scale: 0.95 } : {}}
                        >
                        {!isVisualRevealed ? (
                            <span>{cell.emoji}</span>
                        ) : (
                            <motion.div
                            initial={gameState === 'PLAYING' ? { scale: 0, rotate: -180 } : false}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex flex-col items-center justify-center w-full h-full"
                            >
                                {cell.type === 'TREASURE' && <span className="text-4xl sm:text-5xl drop-shadow-md">💎</span>}
                                {cell.type === 'BOMB' && <span className="text-4xl sm:text-5xl drop-shadow-md">💣</span>}
                                {cell.type === 'EMPTY' && (
                                    cell.distance !== undefined ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl sm:text-2xl font-black text-blue-500">{cell.distance}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 text-3xl sm:text-4xl">❌</span>
                                    )
                                )}
                            </motion.div>
                        )}

                        {/* Small indicator of original emoji when revealed */}
                        {isVisualRevealed && gameState === 'PLAYING' && (
                            <div className="absolute top-1 left-1 text-[10px] sm:text-sm opacity-50 pointer-events-none">
                                {cell.emoji}
                            </div>
                        )}
                        </motion.button>
                    )
                })}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default TreasureGame;
