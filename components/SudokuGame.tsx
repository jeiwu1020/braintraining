import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, RefreshCw, Trophy } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import BoardSidebarLayout from './game-ui/BoardSidebarLayout';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
  initialPuzzle?: (number | null)[][];
  initialSolution?: number[][];
}

export type SudokuCell = { value: number | null; isFixed: boolean; isError: boolean };
const getSubgridSize = (size: number) => size === 9 ? 3 : 2;

export const getSudokuValidNumbersCount = (
  currentGrid: Array<Array<Pick<SudokuCell, 'value'>>>, r: number, c: number,
  size = currentGrid.length, subgridSize = getSubgridSize(size),
) => {
  const used = new Set<number>();
  for (let i = 0; i < size; i += 1) {
    const rowValue = currentGrid[r]?.[i]?.value;
    const columnValue = currentGrid[i]?.[c]?.value;
    if (rowValue !== null && rowValue !== undefined) used.add(rowValue);
    if (columnValue !== null && columnValue !== undefined) used.add(columnValue);
  }
  const startRow = Math.floor(r / subgridSize) * subgridSize;
  const startCol = Math.floor(c / subgridSize) * subgridSize;
  for (let i = 0; i < subgridSize; i += 1) for (let j = 0; j < subgridSize; j += 1) {
    const value = currentGrid[startRow + i]?.[startCol + j]?.value;
    if (value !== null && value !== undefined) used.add(value);
  }
  return size - used.size;
};

export const findSudokuNextTarget = (
  currentGrid: Array<Array<Pick<SudokuCell, 'value'>>>, size = currentGrid.length,
  subgridSize = getSubgridSize(size),
) => {
  let bestCell: { r: number; c: number } | null = null;
  let minPossibilities = size + 1;
  for (let r = 0; r < size; r += 1) for (let c = 0; c < size; c += 1) {
    if (currentGrid[r]?.[c]?.value === null) {
      const validCount = getSudokuValidNumbersCount(currentGrid, r, c, size, subgridSize);
      if (validCount < minPossibilities) { minPossibilities = validCount; bestCell = { r, c }; }
    }
  }
  return bestCell;
};

const generateSudoku = (size: number, subgridSize: number) => {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  const isSafe = (r: number, c: number, num: number) => {
    for (let i = 0; i < size; i += 1) { if (grid[r][i] === num || grid[i][c] === num) return false; }
    const sr = Math.floor(r / subgridSize) * subgridSize; const sc = Math.floor(c / subgridSize) * subgridSize;
    for (let i = 0; i < subgridSize; i += 1) for (let j = 0; j < subgridSize; j += 1) if (grid[sr + i][sc + j] === num) return false;
    return true;
  };
  const solve = (): boolean => {
    for (let r = 0; r < size; r += 1) for (let c = 0; c < size; c += 1) if (grid[r][c] === 0) {
      const nums = Array.from({ length: size }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      for (const num of nums) if (isSafe(r, c, num)) { grid[r][c] = num; if (solve()) return true; grid[r][c] = 0; }
      return false;
    }
    return true;
  };
  solve();
  const solution = grid.map(row => [...row]); const initial: (number | null)[][] = grid.map(row => [...row]);
  const cellsToRemove = size === 9 ? 45 : 8; let removed = 0;
  while (removed < cellsToRemove) { const r = Math.floor(Math.random() * size); const c = Math.floor(Math.random() * size); if (initial[r][c] !== null) { initial[r][c] = null; removed += 1; } }
  return { solution, initial };
};

const toCells = (puzzle: (number | null)[][]): SudokuCell[][] => puzzle.map(row => row.map(value => ({ value, isFixed: value !== null, isError: false })));

const SudokuGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL', initialPuzzle, initialSolution }) => {
  const isAdvanced = difficulty === 'ADVANCED'; const size = isAdvanced ? 9 : 4; const subgridSize = isAdvanced ? 3 : 2;
  const initialDataRef = useRef<{ initial: (number | null)[][]; solution: number[][] } | null>(null);
  if (!initialDataRef.current) initialDataRef.current = initialPuzzle && initialSolution ? { initial: initialPuzzle, solution: initialSolution } : generateSudoku(size, subgridSize);
  const initialData = initialDataRef.current;
  const [grid, setGrid] = useState<SudokuCell[][]>(() => toCells(initialData.initial));
  const [solution, setSolution] = useState<number[][]>(() => initialData.solution.map(row => [...row]));
  const [targetCell, setTargetCell] = useState<{ r: number; c: number } | null>(null);
  const [isManualSelect, setIsManualSelect] = useState(false); const [isComplete, setIsComplete] = useState(false); const [score, setScore] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(Date.now()); const [errorCell, setErrorCell] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => { initGame(); }, [difficulty]);
  const findNextTargetCell = (currentGrid: SudokuCell[][]) => { const bestCell = findSudokuNextTarget(currentGrid, size, subgridSize); if (bestCell) { setTargetCell(bestCell); setRoundStartTime(Date.now()); } else { setTargetCell(null); setIsComplete(true); soundService.playWin(); } };
  const initGame = () => { const data = initialPuzzle && initialSolution ? { initial: initialPuzzle, solution: initialSolution } : generateSudoku(size, subgridSize); const newGrid = toCells(data.initial); setGrid(newGrid); setSolution(data.solution.map(row => [...row])); setScore(0); setIsComplete(false); setErrorCell(null); setIsManualSelect(false); findNextTargetCell(newGrid); };
  const handleCellClick = (r: number, c: number) => { if (isComplete) return; const cell = grid[r][c]; if (cell.isFixed || cell.value !== null) return; if (isManualSelect && targetCell?.r === r && targetCell?.c === c) { setIsManualSelect(false); findNextTargetCell(grid); return; } setIsManualSelect(true); setTargetCell({ r, c }); setRoundStartTime(Date.now()); setErrorCell(null); };
  const handleNumberInput = (num: number) => {
    if (!targetCell || isComplete) return; const { r, c } = targetCell;
    if (num === solution[r][c]) { const newGrid = [...grid]; newGrid[r] = [...newGrid[r]]; newGrid[r][c] = { ...newGrid[r][c], value: num, isError: false }; setGrid(newGrid); setErrorCell(null); const timeTaken = (Date.now() - roundStartTime) / 1000; const roundScore = Math.max(5, 50 - Math.floor(timeTaken) * 2); setScore(prev => prev + roundScore); soundService.playGameSound('HIGH'); if (isManualSelect) { setTargetCell(null); const remaining = newGrid.flat().some(cell => cell.value === null); if (!remaining) { setIsComplete(true); soundService.playWin(); } } else findNextTargetCell(newGrid); }
    else { setErrorCell({ r, c }); soundService.playWrong(); setTimeout(() => setErrorCell(null), 500); }
  };

  const numbers = Array.from({ length: size }, (_, i) => i + 1); const columns = ['A','B','C','D','E','F','G','H','I']; const targetLabel = targetCell ? `${columns[targetCell.c]}${targetCell.r + 1}` : '尚未選擇';
  const boardView = <div className="flex h-full min-h-0 w-full items-center justify-center p-1 sm:p-2"><div className="flex aspect-square w-full max-w-full items-stretch justify-center" style={{ width: 'min(100%, calc(100dvh - 6.5rem))' }}><div className="grid h-full w-full grid-cols-[1.15rem_minmax(0,1fr)] grid-rows-[1.15rem_minmax(0,1fr)]"><span aria-hidden="true" /><div className="grid items-center text-center text-[10px] font-bold text-slate-700 sm:text-xs" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>{columns.slice(0, size).map(label => <span key={label}>{label}</span>)}</div><div className="grid items-center text-center text-[10px] font-bold text-slate-700 sm:text-xs" style={{ gridTemplateRows: `repeat(${size}, minmax(0, 1fr))` }}>{Array.from({ length: size }, (_, i) => <span key={i}>{i + 1}</span>)}</div><div data-board-coordinate-model="cell" data-sudoku-grid-size={size} data-subgrid-size={subgridSize} className={`grid h-full w-full overflow-hidden rounded-lg border-2 border-slate-800 bg-white shadow-xl ${isAdvanced ? 'text-indigo-900' : 'text-emerald-900'}`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${size}, minmax(0, 1fr))` }}>{grid.map((row, r) => row.map((cell, c) => { const coordinate = `${columns[c]}${r + 1}`; const isTarget = targetCell?.r === r && targetCell?.c === c; const isError = errorCell?.r === r && errorCell?.c === c; const right = (c + 1) % subgridSize === 0 && c !== size - 1; const bottom = (r + 1) % subgridSize === 0 && r !== size - 1; const label = cell.isFixed ? `${coordinate}，固定數字 ${cell.value}` : cell.value !== null ? `${coordinate}，玩家填入 ${cell.value}` : isTarget ? `在 ${coordinate} 填入數字${isManualSelect ? '，手動選格' : '，自動選格'}` : `${coordinate}，空格`; return <button key={coordinate} type="button" data-sudoku-cell={coordinate} aria-label={label} aria-pressed={isTarget ? true : undefined} disabled={cell.isFixed || cell.value !== null || isComplete} onClick={() => handleCellClick(r, c)} className={`relative flex min-h-0 min-w-0 items-center justify-center border-slate-300 text-sm font-bold transition-colors sm:text-lg ${right ? 'border-r-2 border-r-slate-800' : 'border-r'} ${bottom ? 'border-b-2 border-b-slate-800' : 'border-b'} ${cell.isFixed ? 'bg-slate-100 text-slate-800' : cell.value !== null ? 'bg-white text-blue-700' : 'bg-white hover:bg-sky-50'} ${isTarget && isManualSelect ? 'z-10 bg-blue-100 ring-2 ring-inset ring-blue-600' : ''} ${isTarget && !isManualSelect ? 'z-10 bg-yellow-100 ring-2 ring-inset ring-yellow-500' : ''} ${isError ? 'z-10 bg-red-200 ring-2 ring-inset ring-red-600' : ''}`}>{cell.value ?? ''}{isTarget && <span aria-hidden="true" className={`absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full ${isManualSelect ? 'bg-blue-700' : 'bg-yellow-600'}`} />}</button>; }))}</div></div></div></div>;
  const sidebarView = <div className="flex h-full min-h-0 flex-col gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 text-slate-900 shadow-sm sm:gap-3 sm:p-3"><div className="rounded-lg bg-slate-100 p-2 text-center"><div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700"><Trophy aria-hidden="true" className="h-4 w-4 text-yellow-600" /> 分數: {score}</div></div><div className="rounded-lg bg-slate-100 p-2 text-center"><span className="block text-xs font-semibold text-slate-700">目前選格</span><strong className="block text-base">{targetLabel}</strong><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${isManualSelect ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{isManualSelect ? '✋ 手動選格' : '🤖 自動選格'}</span></div><div className="grid gap-2" style={{ gridTemplateColumns: isAdvanced ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))' }}>{numbers.map(num => <button key={num} type="button" onClick={() => handleNumberInput(num)} disabled={isComplete || !targetCell} aria-label={`填入數字 ${num}`} className={`flex min-h-11 items-center justify-center rounded-lg font-bold shadow-sm transition-transform active:scale-95 ${isAdvanced ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'} disabled:cursor-not-allowed disabled:opacity-50`}>{num}</button>)}</div>{isComplete ? <div className="mt-auto rounded-xl border-2 border-green-200 bg-green-50 p-3 text-center text-green-800"><CheckCircle2 aria-hidden="true" className="mx-auto mb-1 h-8 w-8" /><strong className="block">太棒了！完成挑戰！</strong><span>總得分：{score} 分</span></div> : <p className="mt-auto rounded-lg bg-slate-50 p-2 text-xs leading-relaxed text-slate-600 sm:text-sm">點選空格可手動指定目標，再按數字填入；自動選格會優先挑選候選數字較少的位置。</p>}</div>;
  return <GameShell title="數獨" subtitle={isAdvanced ? '9×9 進階挑戰' : '4×4 輕鬆填字'} onBack={onBack} status={<span aria-label="難度">{isAdvanced ? '進階' : '一般'}</span>} actions={<button type="button" onClick={initGame} aria-label="重設遊戲" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"><RefreshCw aria-hidden="true" className="h-5 w-5" /></button>} contentClassName={isAdvanced ? 'bg-indigo-50 text-indigo-950' : 'bg-emerald-50 text-emerald-950'}><BoardSidebarLayout board={boardView} sidebar={sidebarView} boardLabel="數獨棋盤" sidebarLabel="數獨狀態與數字操作" boardClassName="flex min-h-0 items-center justify-center" sidebarClassName="flex min-h-0 flex-col" /></GameShell>;
};

export default SudokuGame;
