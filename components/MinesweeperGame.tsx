import React, { useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, awardTeam, coordinateLabel, countAdjacentMines } from '../utils/facilitatedPuzzleRules';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
interface Snapshot { revealed: Set<string>; flags: Set<string>; mines: Set<string>; firstMove: boolean }

const CONFIG = {
  NORMAL: { rows: 5, columns: 7, mines: ['0,5', '1,1', '2,6', '3,3', '4,0', '4,5'] },
  ADVANCED: { rows: 6, columns: 8, mines: ['0,0', '0,6', '1,3', '2,1', '2,7', '3,4', '4,0', '4,6', '5,2', '5,5'] },
} as const;

const cloneSnapshot = (snapshot: Snapshot): Snapshot => ({
  revealed: new Set(snapshot.revealed),
  flags: new Set(snapshot.flags),
  mines: new Set(snapshot.mines),
  firstMove: snapshot.firstMove,
});

const MinesweeperGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const config = CONFIG[difficulty];
  const fresh = (): Snapshot => ({ revealed: new Set(), flags: new Set(), mines: new Set(config.mines), firstMove: true });
  const [board, setBoard] = useState<Snapshot>(fresh);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [flagMode, setFlagMode] = useState(false);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('請先說出座標，再決定要安全翻開或插旗。');
  const [result, setResult] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

  const reset = (nextMode = mode) => {
    setBoard(fresh());
    setHistory([]);
    setFlagMode(false);
    setTeam('A');
    setResult('PLAYING');
    setRecent(nextMode === 'TEAMS' ? 'A 組先選擇座標。' : '請選擇第一個安全格。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    setScores({ A: 0, B: 0 });
    reset(nextMode);
  };

  const revealConnected = (startKey: string, mines: Set<string>, alreadyRevealed: Set<string>): Set<string> => {
    const revealed = new Set(alreadyRevealed);
    const queue = [startKey];
    while (queue.length > 0) {
      const key = queue.shift()!;
      if (revealed.has(key) || mines.has(key)) continue;
      revealed.add(key);
      const [row, col] = key.split(',').map(Number);
      if (countAdjacentMines(row, col, mines, config.rows, config.columns) !== 0) continue;
      for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
          const nextRow = row + rowOffset;
          const nextCol = col + colOffset;
          if (nextRow >= 0 && nextCol >= 0 && nextRow < config.rows && nextCol < config.columns) queue.push(`${nextRow},${nextCol}`);
        }
      }
    }
    return revealed;
  };

  const act = (row: number, col: number) => {
    if (result !== 'PLAYING') return;
    const key = `${row},${col}`;
    const coordinate = coordinateLabel(row, col);
    if (board.revealed.has(key)) return;
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
    if (board.firstMove && mines.has(key)) {
      mines.delete(key);
      outer: for (let targetRow = config.rows - 1; targetRow >= 0; targetRow -= 1) {
        for (let targetCol = config.columns - 1; targetCol >= 0; targetCol -= 1) {
          const replacement = `${targetRow},${targetCol}`;
          if (replacement !== key && !mines.has(replacement)) {
            mines.add(replacement);
            break outer;
          }
        }
      }
    }

    if (mines.has(key)) {
      setBoard({ revealed: new Set<string>([...board.revealed, ...mines]), flags: new Set(board.flags), mines, firstMove: false });
      setResult('LOST');
      setRecent(`${coordinate} 是地雷；可復原並重新討論線索。`);
      return;
    }

    const revealed = revealConnected(key, mines, board.revealed);
    const next = { revealed, flags: new Set(board.flags), mines, firstMove: false };
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
      subtitle={`${config.columns}×${config.rows}｜${config.mines.length} 顆地雷`}
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
        '操作：選擇「安全翻開」或「插旗」，再點盤面座標；第一次翻開一定安全。',
        '口述範例：「C3 周圍已有兩面旗，所以翻開 D4。」欄為英文字母、列為數字。',
        '一般模式為 7×5、6 顆雷；進階模式為 8×6、10 顆雷。',
        '分組玩法：A、B 組輪流提出翻開或插旗指令；成功清除盤面時，最後完成的組別得 1 分。',
      ]}
      sidebar={(
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={!flagMode} onClick={() => setFlagMode(false)} className={`min-h-11 rounded-xl border px-2 text-sm font-bold ${!flagMode ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white'}`}>安全翻開</button>
          <button type="button" aria-pressed={flagMode} onClick={() => setFlagMode(true)} className={`min-h-11 rounded-xl border px-2 text-sm font-bold ${flagMode ? 'border-amber-600 bg-amber-500 text-white' : 'border-slate-300 bg-white'}`}>🚩 插旗</button>
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
