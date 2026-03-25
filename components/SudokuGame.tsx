import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, Timer, Trophy } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

type Cell = {
  value: number | null;
  isFixed: boolean;
  isError: boolean;
};

const generateSudoku = (size: number, subgridSize: number) => {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));

  const isSafe = (r: number, c: number, num: number) => {
    for (let i = 0; i < size; i++) {
      if (grid[r][i] === num) return false;
      if (grid[i][c] === num) return false;
    }
    const sr = Math.floor(r / subgridSize) * subgridSize;
    const sc = Math.floor(c / subgridSize) * subgridSize;
    for (let i = 0; i < subgridSize; i++) {
      for (let j = 0; j < subgridSize; j++) {
        if (grid[sr + i][sc + j] === num) return false;
      }
    }
    return true;
  };

  const solve = () => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          const nums = Array.from({length: size}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isSafe(r, c, num)) {
              grid[r][c] = num;
              if (solve()) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve();

  const solution = grid.map(row => [...row]);
  const initial: (number | null)[][] = grid.map(row => [...row]);
  
  const cellsToRemove = size === 9 ? 45 : 8;
  let removed = 0;
  while (removed < cellsToRemove) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (initial[r][c] !== null) {
      initial[r][c] = null;
      removed++;
    }
  }

  return { solution, initial };
};

const SudokuGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const size = isAdvanced ? 9 : 4;
  const subgridSize = isAdvanced ? 3 : 2;
  
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [targetCell, setTargetCell] = useState<{r: number, c: number} | null>(null);
  const [isManualSelect, setIsManualSelect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [errorCell, setErrorCell] = useState<{r: number, c: number} | null>(null);

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const getValidNumbersCount = (currentGrid: Cell[][], r: number, c: number) => {
    const used = new Set<number>();
    for (let i = 0; i < size; i++) {
      if (currentGrid[r][i].value !== null) used.add(currentGrid[r][i].value!);
      if (currentGrid[i][c].value !== null) used.add(currentGrid[i][c].value!);
    }
    const startRow = Math.floor(r / subgridSize) * subgridSize;
    const startCol = Math.floor(c / subgridSize) * subgridSize;
    for (let i = 0; i < subgridSize; i++) {
      for (let j = 0; j < subgridSize; j++) {
        const val = currentGrid[startRow + i][startCol + j].value;
        if (val !== null) used.add(val);
      }
    }
    return size - used.size;
  };

  const findNextTargetCell = (currentGrid: Cell[][]) => {
    let bestCell = null;
    let minPossibilities = size + 1;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c].value === null) {
          const validCount = getValidNumbersCount(currentGrid, r, c);
          if (validCount < minPossibilities) {
            minPossibilities = validCount;
            bestCell = { r, c };
          }
        }
      }
    }

    if (bestCell) {
      setTargetCell(bestCell);
      setRoundStartTime(Date.now());
    } else {
      setTargetCell(null);
      setIsComplete(true);
      soundService.playWin();
    }
  };

  const initGame = () => {
    const { solution: newSolution, initial } = generateSudoku(size, subgridSize);
    
    const newGrid: Cell[][] = initial.map(row => 
      row.map(val => ({
        value: val,
        isFixed: val !== null,
        isError: false
      }))
    );
    
    setGrid(newGrid);
    setSolution(newSolution);
    setScore(0);
    setIsComplete(false);
    setErrorCell(null);
    setIsManualSelect(false);
    findNextTargetCell(newGrid);
  };

  const handleCellClick = (r: number, c: number) => {
    if (isComplete) return;
    const cell = grid[r][c];
    if (cell.isFixed || cell.value !== null) return; // can't select filled cells
    // Toggle: clicking same cell deselects and goes back to auto
    if (isManualSelect && targetCell?.r === r && targetCell?.c === c) {
      setIsManualSelect(false);
      findNextTargetCell(grid);
      return;
    }
    setIsManualSelect(true);
    setTargetCell({ r, c });
    setRoundStartTime(Date.now());
    setErrorCell(null);
  };

  const handleNumberInput = (num: number) => {
    if (!targetCell || isComplete) return;
    const { r, c } = targetCell;

    if (num === solution[r][c]) {
      // Correct
      const newGrid = [...grid];
      newGrid[r] = [...newGrid[r]];
      newGrid[r][c] = { ...newGrid[r][c], value: num, isError: false };
      setGrid(newGrid);
      setErrorCell(null);
      
      const timeTaken = (Date.now() - roundStartTime) / 1000;
      const roundScore = Math.max(5, 50 - Math.floor(timeTaken) * 2);
      setScore(prev => prev + roundScore);
      
      soundService.playGameSound('HIGH');
      if (isManualSelect) {
        // Stay in manual mode — deselect current cell, let player pick next
        setTargetCell(null);
        // Check if game is complete
        const remaining = newGrid.flat().some(cell => cell.value === null);
        if (!remaining) { setIsComplete(true); soundService.playWin(); }
      } else {
        findNextTargetCell(newGrid);
      }
    } else {
      // Wrong
      setErrorCell({ r, c });
      soundService.playWrong();
      setTimeout(() => setErrorCell(null), 500);
    }
  };

  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  return (
    <div className={`flex flex-col h-[100dvh] ${isAdvanced ? 'bg-indigo-50' : 'bg-emerald-50'} overflow-hidden`}>
      {/* Header */}
      <div className="flex-none p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${isAdvanced ? 'text-indigo-800' : 'text-emerald-800'}`}>數獨</h2>
          <p className="text-xs text-gray-500">{isAdvanced ? '9x9 進階挑戰' : '4x4 輕鬆填字'}</p>
        </div>
        <button onClick={initGame} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <RefreshCw size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 landscape:p-2 lg:p-4 overflow-y-auto">
        
        {/* Stats Bar */}
        <div className="w-full max-w-md flex justify-between items-center bg-white p-3 landscape:p-2 lg:p-3 rounded-2xl shadow-sm mb-4 landscape:mb-2 lg:mb-4 border border-gray-100">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
            <Trophy className="text-yellow-500" />
            分數: {score}
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${isManualSelect ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {isManualSelect ? '✋ 手動選格' : '🤖 自動選格'}
          </div>
        </div>

        {isComplete && (
          <div className="mb-6 animate-bounce-in flex flex-col items-center bg-white p-6 rounded-3xl shadow-lg border-4 border-green-200 w-full max-w-md">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
            <h3 className="text-2xl font-bold text-green-600 mb-2">太棒了！完成挑戰！</h3>
            <p className="text-xl text-gray-700 font-bold">總得分：{score} 分</p>
          </div>
        )}

        <div className={`flex flex-col landscape:flex-row lg:flex-col items-center justify-center gap-4 lg:gap-8 w-full ${isComplete ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Board */}
          <div className={`bg-white p-2 rounded-xl shadow-lg border-2 ${isAdvanced ? 'border-indigo-200' : 'border-emerald-200'} mb-2 lg:mb-6`}>
            <div 
              className="grid gap-0 border-2 border-gray-800"
              style={{ 
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
                width: isAdvanced ? 'min(90vw, 65vh, 400px)' : 'min(80vw, 65vh, 300px)',
                height: isAdvanced ? 'min(90vw, 65vh, 400px)' : 'min(80vw, 65vh, 300px)'
              }}
            >
              {grid.map((row, r) => 
                row.map((cell, c) => {
                  const isTarget = targetCell?.r === r && targetCell?.c === c;
                  const isError = errorCell?.r === r && errorCell?.c === c;
                  const isRightEdge = (c + 1) % subgridSize === 0 && c !== size - 1;
                  const isBottomEdge = (r + 1) % subgridSize === 0 && r !== size - 1;
                  
                  return (
                    <div 
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`
                        flex items-center justify-center text-lg sm:text-2xl landscape:text-lg lg:text-2xl font-bold transition-colors
                        border-r border-b border-gray-300
                        ${isRightEdge ? 'border-r-2 border-r-gray-800' : ''}
                        ${isBottomEdge ? 'border-b-2 border-b-gray-800' : ''}
                        ${c === size - 1 ? 'border-r-0' : ''}
                        ${r === size - 1 ? 'border-b-0' : ''}
                        ${isTarget && isManualSelect ? 'bg-blue-200 ring-4 ring-blue-400 ring-inset scale-105 z-10 shadow-md cursor-pointer' : ''}
                        ${isTarget && !isManualSelect ? 'bg-yellow-200 ring-4 ring-yellow-400 ring-inset scale-105 z-10 shadow-md' : ''}
                        ${isError ? 'bg-red-300 ring-4 ring-red-500 ring-inset' : ''}
                        ${cell.isFixed ? 'bg-gray-100 text-gray-800' : (!cell.value ? 'cursor-pointer hover:bg-blue-50' : 'text-blue-600')}
                      `}
                    >
                      {cell.value || ''}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="w-full max-w-md flex flex-col justify-center">
            <div className={`grid ${isAdvanced ? 'grid-cols-5 landscape:grid-cols-3 lg:grid-cols-5' : 'grid-cols-4 landscape:grid-cols-2 lg:grid-cols-4'} gap-2 mb-4`}>
              {numbers.map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  disabled={isComplete}
                  className={`
                    py-4 landscape:py-2 lg:py-4 rounded-xl font-bold text-2xl landscape:text-xl lg:text-2xl shadow-sm transition-transform active:scale-95
                    ${isAdvanced ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}
                    ${isComplete ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SudokuGame;
