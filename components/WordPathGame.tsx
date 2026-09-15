import React, { useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, awardTeam, coordinateLabel, isValidWordPath } from '../utils/facilitatedPuzzleRules';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
interface Snapshot { path: number[]; found: string[]; scores: { A: number; B: number }; team: 'A' | 'B' }

export const WORD_PATH_PUZZLES = {
  NORMAL: {
    columns: 4,
    grid: ['春', '天', '花', '開', '快', '樂', '學', '習', '健', '康', '生', '活', '平', '安', '朋', '友'],
    words: ['春天', '花開', '快樂', '學習', '健康', '生活', '平安', '朋友'],
  },
  ADVANCED: {
    columns: 5,
    grid: ['春', '暖', '花', '開', '心', '健', '康', '生', '活', '情', '專', '心', '學', '習', '好', '互', '相', '幫', '助', '樂'],
    words: ['春暖花開', '健康生活', '專心學習', '互相幫助', '開心', '心情'],
  },
} as const;

const WordPathGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const puzzle = WORD_PATH_PUZZLES[difficulty];
  const rows = puzzle.grid.length / puzzle.columns;
  const [path, setPath] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('請說出一個詞，以及每個字依序經過的座標。');
  const [finished, setFinished] = useState(false);

  const snapshot = (): Snapshot => ({ path: [...path], found: [...found], scores: { ...scores }, team });

  const reset = (nextMode = mode) => {
    setPath([]);
    setFound([]);
    setHistory([]);
    setScores({ A: 0, B: 0 });
    setTeam('A');
    setFinished(false);
    setRecent(nextMode === 'TEAMS' ? 'A 組先找一個詞。' : '請找出第一個詞。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    reset(nextMode);
  };

  const selectCell = (index: number) => {
    if (finished) return;
    if (path.includes(index)) {
      if (path[path.length - 1] === index) {
        setHistory(items => [...items, snapshot()]);
        setPath(items => items.slice(0, -1));
        setRecent('已移除路徑最後一格。');
      } else setRecent('同一個字格不能在一個詞中重複使用。');
      return;
    }
    const next = [...path, index];
    if (!isValidWordPath(next, puzzle.columns)) {
      setRecent(`${coordinateLabel(Math.floor(index / puzzle.columns), index % puzzle.columns)} 不與上一格相鄰。`);
      return;
    }
    setHistory(items => [...items, snapshot()]);
    setPath(next);
    const word = next.map(cell => puzzle.grid[cell]).join('');
    setRecent(`目前路徑：${word}。`);
  };

  const submit = () => {
    if (path.length === 0) return;
    const word = path.map(index => puzzle.grid[index]).join('');
    setHistory(items => [...items, snapshot()]);
    if (puzzle.words.includes(word as never) && !found.includes(word)) {
      const nextFound = [...found, word];
      setFound(nextFound);
      setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}找到「${word}」！`);
      if (mode === 'TEAMS') setScores(value => awardTeam(value, team));
      if (nextFound.length === puzzle.words.length) setFinished(true);
    } else {
      setRecent(found.includes(word) ? `「${word}」已經找過了。` : `「${word}」不在本題詞庫，請重新連線。`);
    }
    setPath([]);
    if (mode === 'TEAMS') setTeam(advanceTeam);
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setPath([...previous.path]);
    setFound([...previous.found]);
    setScores({ ...previous.scores });
    setTeam(previous.team);
    setHistory(items => items.slice(0, -1));
    setFinished(false);
    setRecent('已復原上一個選字或提交。');
  };

  const hint = () => {
    const word = puzzle.words.find(candidate => !found.includes(candidate));
    if (word) setRecent(`提示：盤面中還能找到「${word}」。`);
  };

  return (
    <FacilitatedGameFrame
      title="字詞路徑"
      subtitle={`${puzzle.columns}×${rows}｜已找到 ${found.length}/${puzzle.words.length}`}
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
      feedback={finished ? '完成！本題所有目標詞都已找到。' : undefined}
      rules={[
        '目標：從相鄰字格依序連出題目詞庫中的詞語。',
        '下一個字必須位於前一字的上下、左右或斜角相鄰格；同一格不可在同一詞中重複。',
        '操作：依序點選字格形成路徑，再按「提交詞語」；點路徑最後一格可取消。',
        '口述範例：「春天，路徑 A1 到 B1。」治療者依序點選座標。',
        '一般模式使用 4×4 常見雙字詞；進階模式使用 5×4 較長詞語與轉彎路徑。',
        '分組玩法：A、B 組輪流找詞，每個新詞得 1 分；全體合作則共同找完詞庫。',
      ]}
      sidebar={(
        <div className="mt-auto space-y-2">
          <div className="rounded-xl bg-emerald-50 p-2 text-sm font-semibold text-emerald-900">已找到：{found.length ? found.join('、') : '尚未找到詞語'}</div>
          <button type="button" onClick={submit} disabled={path.length === 0 || finished} className="min-h-11 w-full rounded-xl bg-emerald-600 px-3 text-base font-black text-white disabled:opacity-40">提交詞語</button>
        </div>
      )}
    >
      <CoordinateGrid
        rows={rows}
        columns={puzzle.columns}
        className="w-full max-w-[30rem]"
        renderCell={(row, col, coordinate) => {
          const index = row * puzzle.columns + col;
          const order = path.indexOf(index);
          return (
            <button
              type="button"
              aria-label={`${coordinate}，${puzzle.grid[index]}${order >= 0 ? `，路徑第 ${order + 1} 格` : ''}`}
              aria-pressed={order >= 0}
              onClick={() => selectCell(index)}
              className={`relative h-full w-full rounded-lg border-2 text-xl font-black shadow-sm ${order >= 0 ? 'border-indigo-800 bg-indigo-600 text-white' : 'border-emerald-300 bg-emerald-50 text-emerald-950'}`}
            >
              {puzzle.grid[index]}
              {order >= 0 && <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-amber-300 text-[10px] text-slate-900">{order + 1}</span>}
            </button>
          );
        }}
      />
    </FacilitatedGameFrame>
  );
};

export default WordPathGame;
