import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Search, XCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import GridFocusScreen from './game-ui/GridFocusScreen';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

// Emulating a "Spot the Difference" using emoji grids.
// The left grid is the original, the right grid has 1-3 differences.
// Since patients point at the screen, we make the grid large and clear.

const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍', '🥝', '🍅'];
const ADVANCED_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];

const SpotDiffGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }: Props) => {
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
    <GridFocusScreen
      title="大家來找碴"
      subtitle={`找出 ${numDifferences} 個不同的圖案`}
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className={isAdvanced ? 'bg-indigo-50' : 'bg-emerald-50'}
      statusClassName={isAdvanced ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}
      advancedClassName="bg-indigo-600"
      playfieldLabel="找碴雙圖比較區"
      playfieldClassName="flex items-center justify-center overflow-auto"
      actions={(
        <button type="button" onClick={initGame} aria-label="重新開始" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200">
          <RefreshCw size={22} />
        </button>
      )}
      playfield={(
        <div className={`flex h-full w-full max-w-5xl flex-col items-center justify-center gap-2 landscape:flex-row sm:gap-4 ${isComplete ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="flex min-h-0 flex-col items-center">
            <div className="mb-1 rounded-full bg-white px-4 py-1 font-bold text-gray-600 shadow-sm">原圖 (A)</div>
            <div className={`h-full max-h-64 aspect-square rounded-2xl border-4 bg-white p-2 shadow-lg ${isAdvanced ? 'border-indigo-200' : 'border-emerald-200'}`}>
              <div className="grid h-full w-full gap-1 sm:gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                {originalGrid.map((emoji, idx) => (
                  <div key={`orig-${idx}`} className="flex aspect-square items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-2xl shadow-sm sm:text-4xl">{emoji}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col items-center">
            <div className="mb-1 flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 font-bold text-blue-600 shadow-sm"><Search size={16} /> 找不同 (B)</div>
            <div className={`h-full max-h-64 aspect-square rounded-2xl border-4 bg-white p-2 shadow-lg ${isAdvanced ? 'border-indigo-400' : 'border-emerald-400'}`}>
              <div className="grid h-full w-full gap-1 sm:gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                {modifiedGrid.map((emoji, idx) => {
                  const isFound = foundIndices.includes(idx);
                  const isWrong = wrongIndices.includes(idx);
                  return (
                    <button key={`mod-${idx}`} onClick={() => handleCellClick(idx)} disabled={isComplete || isFound} className={`relative flex aspect-square items-center justify-center rounded-lg border text-2xl shadow-sm transition-all active:scale-95 sm:text-4xl ${isFound ? 'scale-105 border-green-400 bg-green-100 ring-4 ring-green-300' : 'border-gray-100 bg-gray-50 hover:bg-blue-50'}`}>
                      <span className="absolute left-0 top-0 flex h-4 w-4 items-center justify-center rounded-br-lg rounded-tl-lg bg-blue-600 text-[8px] font-bold leading-none text-white sm:h-5 sm:w-5 sm:text-xs">{idx + 1}</span>
                      {emoji}
                      {isFound && <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-green-500/20"><CheckCircle2 className="h-1/2 w-1/2 text-green-600 opacity-80" /></div>}
                      {isWrong && !isFound && <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-500/10"><XCircle className="h-1/2 w-1/2 text-red-500 opacity-80" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div aria-label="已找到差異數" className="flex gap-2 landscape:flex-col">
            {Array.from({ length: numDifferences }).map((_, index) => (
              <div key={index} className={`h-4 w-4 rounded-full ${index < foundIndices.length ? 'bg-green-500' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>
      )}
      feedback={isComplete ? <span className="text-green-700">挑戰完成！總得分：{score} 分</span> : wrongIndices.length > 0 ? <span className="text-red-700">這一格相同，再仔細比較看看</span> : undefined}
    />
  );
};

export default SpotDiffGame;
