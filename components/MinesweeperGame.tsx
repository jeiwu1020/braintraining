import React, { useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, awardTeam, coordinateLabel, countAdjacentMines, revealMinesweeperRegion, type MinesweeperPuzzleDefinition } from '../utils/facilitatedPuzzleRules';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
interface Snapshot { revealed: Set<string>; flags: Set<string>; mines: Set<string> }

export const MINESWEEPER_PUZZLES: Record<Difficulty, readonly MinesweeperPuzzleDefinition[]> = {
  NORMAL: [
    { rows: 5, columns: 7, mines: ['0,3', '2,6', '3,0', '3,4', '4,1'], start: '2,2' },
    { rows: 5, columns: 7, mines: ['1,4', '2,2', '2,3', '4,2', '4,3'], start: '4,6' },
    { rows: 5, columns: 7, mines: ['0,5', '1,4', '1,5', '2,0', '4,2'], start: '4,5' },
    { rows: 5, columns: 7, mines: ['0,0', '1,0', '1,5', '3,1', '4,3'], start: '3,6' },
  ],
  ADVANCED: [
    { rows: 6, columns: 8, mines: ['0,2', '1,3', '2,2', '3,0', '4,4', '5,0', '5,4', '5,7'], start: '0,0' },
    { rows: 6, columns: 8, mines: ['0,2', '0,3', '1,4', '4,1', '4,3', '4,5', '5,1', '5,2'], start: '2,0' },
    { rows: 6, columns: 8, mines: ['0,6', '0,7', '1,4', '3,3', '4,0', '4,4', '4,7', '5,7'], start: '5,2' },
    { rows: 6, columns: 8, mines: ['0,5', '0,6', '0,7', '1,0', '1,4', '2,4', '4,3', '5,6'], start: '2,6' },
  ],
};

const cloneSnapshot = (snapshot: Snapshot): Snapshot => ({
  revealed: new Set(snapshot.revealed),
  flags: new Set(snapshot.flags),
  mines: new Set(snapshot.mines),
});

const createSnapshot = (puzzle: MinesweeperPuzzleDefinition): Snapshot => {
  const mines = new Set(puzzle.mines);
  return { revealed: revealMinesweeperRegion(puzzle.start, mines, new Set<string>(), new Set<string>(), puzzle.rows, puzzle.columns), flags: new Set<string>(), mines };
};

const MinesweeperGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const puzzleBank = MINESWEEPER_PUZZLES[difficulty];
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const config = puzzleBank[puzzleIndex];
  const [board, setBoard] = useState<Snapshot>(() => createSnapshot(puzzleBank[0]));
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [flagMode, setFlagMode] = useState(false);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('安全起始區已展開，請根據數字說出下一個座標。');
  const [result, setResult] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

  const reset = (nextMode = mode) => {
    setBoard(createSnapshot(config));
    setHistory([]);
    setFlagMode(false);
    setTeam('A');
    setResult('PLAYING');
    setRecent(nextMode === 'TEAMS' ? '安全區已展開，A 組先根據數字選擇座標。' : '安全起始區已展開，請根據數字繼續推理。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    setScores({ A: 0, B: 0 });
    reset(nextMode);
  };

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % puzzleBank.length;
    setPuzzleIndex(nextIndex);
    setBoard(createSnapshot(puzzleBank[nextIndex]));
    setHistory([]);
    setFlagMode(false);
    setTeam('A');
    setResult('PLAYING');
    setRecent(`已換到第 ${nextIndex + 1} 題，安全起始區已展開。`);
  };

  const act = (row: number, col: number) => {
    if (result !== 'PLAYING') return;
    const key = `${row},${col}`;
    const coordinate = coordinateLabel(row, col);
    if (board.revealed.has(key)) {
      if (flagMode) return;
      const adjacent = countAdjacentMines(row, col, board.mines, config.rows, config.columns);
      if (adjacent === 0) return;
      const neighbors = Array.from({ length: 9 }, (_, index) => [row + Math.floor(index / 3) - 1, col + (index % 3) - 1] as const)
        .filter(([nextRow, nextCol]) => nextRow >= 0 && nextCol >= 0 && nextRow < config.rows && nextCol < config.columns && (nextRow !== row || nextCol !== col))
        .map(([nextRow, nextCol]) => `${nextRow},${nextCol}`);
      if (neighbors.filter(neighbor => board.flags.has(neighbor)).length !== adjacent) {
        setRecent(`${coordinate} 周圍旗幟數量還不等於 ${adjacent}。`);
        return;
      }
      setHistory(items => [...items, cloneSnapshot(board)]);
      if (neighbors.some(neighbor => board.mines.has(neighbor) && !board.flags.has(neighbor))) {
        setBoard({ revealed: new Set([...board.revealed, ...board.mines]), flags: new Set(board.flags), mines: new Set(board.mines) });
        setResult('LOST');
        setRecent(`${coordinate} 的旗幟位置有誤；可復原後再討論。`);
        return;
      }
      let revealed = new Set<string>(board.revealed);
      for (const neighbor of neighbors) revealed = revealMinesweeperRegion(neighbor, board.mines, revealed, board.flags, config.rows, config.columns);
      setBoard({ ...board, revealed });
      setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}快速展開 ${coordinate} 周圍安全格。`);
      if (revealed.size === config.rows * config.columns - board.mines.size) {
        setResult('WON');
        if (mode === 'TEAMS') setScores(value => awardTeam(value, team));
      } else if (mode === 'TEAMS') setTeam(advanceTeam);
      return;
    }
    setHistory(items => [...items, cloneSnapshot(board)]);

    if (flagMode) {
      const flags = new Set(board.flags);
      if (flags.has(key)) flags.delete(key);
      else flags.add(key);
      setBoard({ ...board, flags });
      setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}${coordinate} ${flags.has(key) ? '插上旗幟' : '移除旗幟'}。`);
      if (mode === 'TEAMS') setTeam(advanceTeam);
      return;
    }

    const mines = new Set<string>(board.mines);

    if (mines.has(key)) {
      setBoard({ revealed: new Set<string>([...board.revealed, ...mines]), flags: new Set(board.flags), mines });
      setResult('LOST');
      setRecent(`${coordinate} 是地雷；可復原並重新討論線索。`);
      return;
    }

    const revealed = revealMinesweeperRegion(key, mines, board.revealed, board.flags, config.rows, config.columns);
    const next = { revealed, flags: new Set(board.flags), mines };
    setBoard(next);
    setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}安全翻開 ${coordinate}。`);
    if (revealed.size === config.rows * config.columns - mines.size) {
      setResult('WON');
      if (mode === 'TEAMS') setScores(value => awardTeam(value, team));
    } else if (mode === 'TEAMS') setTeam(advanceTeam);
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setBoard(cloneSnapshot(previous));
    setHistory(items => items.slice(0, -1));
    setResult('PLAYING');
    if (mode === 'TEAMS') setTeam(advanceTeam);
    setRecent('已復原上一個動作。');
  };

  const hint = () => {
    const safe = Array.from({ length: config.rows * config.columns }, (_, index) => `${Math.floor(index / config.columns)},${index % config.columns}`)
      .find(key => !board.mines.has(key) && !board.revealed.has(key));
    if (!safe) return;
    const [row, col] = safe.split(',').map(Number);
    setRecent(`提示：${coordinateLabel(row, col)} 可以安全翻開。`);
  };

  return (
    <FacilitatedGameFrame
      title="合作踩地雷"
      subtitle={`${config.columns}×${config.rows}｜${config.mines.length} 顆地雷｜第 ${puzzleIndex + 1}/${puzzleBank.length} 題`}
      onBack={onBack}
      mode={mode}
      onModeChange={changeMode}
      currentTeam={team}
      scores={scores}
      recentAction={recent}
      onUndo={undo}
      onReset={() => reset()}
      onHint={hint}
      canUndo={history.length > 0}
      feedback={result === 'WON' ? '完成！所有安全格都已找出。' : result === 'LOST' ? '踩到地雷，可按復原繼續推理。' : undefined}
      rules={[
        '目標：根據數字線索翻開所有安全格，避免踩到地雷。',
        '數字代表相鄰八格共有幾顆地雷；旗幟用來標記推測的地雷位置。',
        '操作：每題會先展開安全起始區；選擇「安全翻開」或「插旗」，再點盤面座標。',
        '若已翻開數字周圍的旗幟數量相符，再點該數字可一次展開其餘相鄰格。',
        '口述範例：「C3 周圍已有兩面旗，所以翻開 D4。」欄為英文字母、列為數字。',
        '一般模式為 7×5、5 顆雷；進階模式為 8×6、8 顆雷；題目皆可用邏輯推理完成。',
        '分組玩法：A、B 組輪流提出翻開或插旗指令；成功清除盤面時，最後完成的組別得 1 分。',
      ]}
      sidebar={(
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={!flagMode} onClick={() => setFlagMode(false)} className={`min-h-11 rounded-xl border px-2 text-sm font-bold ${!flagMode ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white'}`}>安全翻開</button>
          <button type="button" aria-pressed={flagMode} onClick={() => setFlagMode(true)} className={`min-h-11 rounded-xl border px-2 text-sm font-bold ${flagMode ? 'border-amber-600 bg-amber-500 text-white' : 'border-slate-300 bg-white'}`}>🚩 插旗</button>
          <button type="button" onClick={nextPuzzle} className="col-span-2 min-h-11 rounded-xl border border-sky-700 bg-white px-2 text-sm font-black text-sky-800">換一題</button>
        </div>
      )}
    >
      <CoordinateGrid
        rows={config.rows}
        columns={config.columns}
        className="w-full max-w-[32rem]"
        renderCell={(row, col, coordinate) => {
          const key = `${row},${col}`;
          const revealed = board.revealed.has(key);
          const mine = board.mines.has(key);
          const adjacent = countAdjacentMines(row, col, board.mines, config.rows, config.columns);
          return (
            <button
              type="button"
              aria-label={`${coordinate}${board.flags.has(key) ? '，已插旗' : revealed ? (mine ? '，地雷' : `，數字 ${adjacent}`) : '，未翻開'}`}
              onClick={() => act(row, col)}
              className={`h-full w-full rounded-md border-2 text-base font-black shadow-sm ${revealed ? (mine ? 'border-rose-700 bg-rose-100 text-rose-800' : 'border-slate-300 bg-white text-indigo-800') : 'border-sky-700 bg-sky-500 text-white'}`}
            >
              {board.flags.has(key) && !revealed ? '🚩' : revealed ? (mine ? '✹' : adjacent || '') : '·'}
            </button>
          );
        }}
      />
    </FacilitatedGameFrame>
  );
};

export default MinesweeperGame;
