import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, Search, Timer, Trophy, XCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

// Emulating a "Spot the Difference" using emoji grids.
// The left grid is the original, the right grid has 1-3 differences.
// Since patients point at the screen, we make the grid large and clear.

const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍', '🥝', '🍅'];
const ADVANCED_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];

const SpotDiffGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const gridSize = isAdvanced ? 4 : 3; // 4x4 or 3x3
  const numDifferences = isAdvanced ? 3 : 1;
  const emojiSet = isAdvanced ? ADVANCED_EMOJIS : EMOJIS;

  const [originalGrid, setOriginalGrid] = useState<string[]>([]);
  const [modifiedGrid, setModifiedGrid] = useState<string[]>([]);
  const [diffIndices, setDiffIndices] = useState<number[]>([]);
  const [foundIndices, setFoundIndices] = useState<number[]>([]);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const TOTAL_ROUNDS = 10;

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const initGame = () => {
    setRound(1);
    setScore(0);
    setIsComplete(false);
    generateGrid();
  };

  const generateGrid = () => {
    const totalCells = gridSize * gridSize;
    const newOriginal: string[] = [];
    
    // Fill original grid with random emojis
    for (let i = 0; i < totalCells; i++) {
      const randomEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
      newOriginal.push(randomEmoji);
    }

    const newModified = [...newOriginal];
    const newDiffIndices: number[] = [];

    // Create differences
    while (newDiffIndices.length < numDifferences) {
      const randIndex = Math.floor(Math.random() * totalCells);
      if (!newDiffIndices.includes(randIndex)) {
        newDiffIndices.push(randIndex);
        
        // Pick a different emoji for this spot
        let newEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
        while (newEmoji === newOriginal[randIndex]) {
          newEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
        }
        newModified[randIndex] = newEmoji;
      }
    }

    setOriginalGrid(newOriginal);
    setModifiedGrid(newModified);
    setDiffIndices(newDiffIndices);
    setFoundIndices([]);
    setWrongIndices([]);
    setRoundStartTime(Date.now());
  };

  const handleCellClick = (index: number) => {
    if (isComplete) return;

    if (diffIndices.includes(index) && !foundIndices.includes(index)) {
      soundService.playGameSound('HIGH');
      const newFound = [...foundIndices, index];
      setFoundIndices(newFound);

      if (newFound.length === numDifferences) {
        const timeTaken = (Date.now() - roundStartTime) / 1000;
        // Base score 100, minus 2 points per second, min 10 points
        const roundScore = Math.max(10, 100 - Math.floor(timeTaken) * 2);
        setScore(prev => prev + roundScore);

        if (round < TOTAL_ROUNDS) {
          soundService.playWin();
          setTimeout(() => {
            setRound(prev => prev + 1);
            generateGrid();
          }, 1000);
        } else {
          setIsComplete(true);
          soundService.playWin();
        }
      }
    } else if (!diffIndices.includes(index)) {
      if (!wrongIndices.includes(index)) {
        setWrongIndices(prev => [...prev, index]);
      }
      soundService.playWrong();
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] ${isAdvanced ? 'bg-indigo-50' : 'bg-emerald-50'} overflow-hidden`}>
      {/* Header */}
      <div className="flex-none p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${isAdvanced ? 'text-indigo-800' : 'text-emerald-800'}`}>大家來找碴</h2>
          <p className="text-xs text-gray-500">
            {isAdvanced ? `找出 ${numDifferences} 個不同的圖案` : `找出 ${numDifferences} 個不同的圖案`}
          </p>
        </div>
        <button onClick={initGame} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <RefreshCw size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto w-full">
        
        {/* Stats Bar */}
        <div className="w-full max-w-5xl flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm mb-4 border border-gray-100">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
            <Timer className="text-blue-500" />
            第 {round} / {TOTAL_ROUNDS} 關
          </div>
          <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
            <Trophy className="text-yellow-500" />
            分數: {score}
          </div>
        </div>

        {isComplete && (
          <div className="mb-4 animate-bounce-in flex flex-col items-center bg-white p-6 rounded-3xl shadow-lg border-4 border-green-200">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
            <h3 className="text-2xl font-bold text-green-600 mb-2">挑戰完成！</h3>
            <p className="text-xl text-gray-700 font-bold">總得分：{score} 分</p>
          </div>
        )}

        <div className={`flex flex-col landscape:flex-row lg:flex-row gap-4 lg:gap-8 items-center justify-center w-full max-w-5xl ${isComplete ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Original Grid (Left) */}
          <div className="flex flex-col items-center w-full max-w-[70vw] landscape:max-w-[40vh] lg:max-w-md">
            <div className="mb-2 font-bold text-gray-600 bg-white px-4 py-1 rounded-full shadow-sm">原圖 (A)</div>
            <div 
              className={`bg-white p-3 rounded-2xl shadow-lg border-4 ${isAdvanced ? 'border-indigo-200' : 'border-emerald-200'} w-full`}
            >
              <div 
                className="grid gap-2 landscape:gap-1 lg:gap-4 w-full"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
              >
                {originalGrid.map((emoji, idx) => (
                  <div 
                    key={`orig-${idx}`}
                    className="aspect-square flex items-center justify-center text-4xl landscape:text-2xl lg:text-6xl bg-gray-50 rounded-xl border border-gray-100 shadow-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modified Grid (Right) */}
          <div className="flex flex-col items-center w-full max-w-[70vw] landscape:max-w-[40vh] lg:max-w-md">
            <div className="mb-2 font-bold text-blue-600 bg-blue-50 px-4 py-1 rounded-full shadow-sm border border-blue-200 flex items-center gap-2">
              <Search size={16} /> 找不同 (B)
            </div>
            <div 
              className={`bg-white p-3 rounded-2xl shadow-lg border-4 ${isAdvanced ? 'border-indigo-400' : 'border-emerald-400'} w-full`}
            >
              <div 
                className="grid gap-2 landscape:gap-1 lg:gap-4 w-full"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
              >
                {modifiedGrid.map((emoji, idx) => {
                  const isFound = foundIndices.includes(idx);
                  const isWrong = wrongIndices.includes(idx);
                  return (
                    <button 
                      key={`mod-${idx}`}
                      onClick={() => handleCellClick(idx)}
                      disabled={isComplete || isFound}
                      className={`
                        relative aspect-square flex items-center justify-center text-4xl landscape:text-2xl lg:text-6xl rounded-xl border shadow-sm transition-all duration-300
                        ${isFound ? 'bg-green-100 border-green-400 ring-4 ring-green-300 scale-105' : 'bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200 active:scale-95'}
                      `}
                    >
                      <span className="absolute top-0 left-0 bg-blue-600 text-white text-[8px] sm:text-xs md:text-sm font-bold w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center rounded-br-lg rounded-tl-lg shadow-sm z-10 leading-none">{idx + 1}</span>
                      {emoji}
                      {isFound && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl">
                          <CheckCircle2 className="w-1/2 h-1/2 text-green-600 opacity-80" />
                        </div>
                      )}
                      {isWrong && !isFound && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 rounded-xl">
                          <XCircle className="w-1/2 h-1/2 text-red-500 opacity-80" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex gap-2">
          {Array.from({ length: numDifferences }).map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full ${i < foundIndices.length ? 'bg-green-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default SpotDiffGame;
