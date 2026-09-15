import React, { useMemo, useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, awardTeam, coordinateLabel, getLineRuns, isNonogramSolved } from '../utils/facilitatedPuzzleRules';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
type Mark = 'EMPTY' | 'FILLED' | 'CROSSED';

const PATTERNS: Record<Difficulty, string[]> = {
  NORMAL: ['01110', '01010', '11111', '10001', '01110'],
  ADVANCED: ['001100', '011110', '111111', '101101', '011110', '001100'],
};

const NonogramGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const pattern = PATTERNS[difficulty];
  const size = pattern.length;
  const solution = useMemo(() => new Set(pattern.flatMap((line, row) => [...line].flatMap((value, col) => value === '1' ? [`${row},${col}`] : []))), [pattern]);
  const rowClues = pattern.map(line => getLineRuns([...line].map(value => value === '1')));
  const colClues = Array.from({ length: size }, (_, col) => getLineRuns(pattern.map(line => line[col] === '1')));
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [history, setHistory] = useState<Record<string, Mark>[]>([]);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('請根據列與欄的連續數量，說出要填滿或排除的座標。');
  const [finished, setFinished] = useState(false);

  const reset = (nextMode = mode) => {
    setMarks({});
    setHistory([]);
    setTeam('A');
    setFinished(false);
    setRecent(nextMode === 'TEAMS' ? 'A 組先選擇一格。' : '請選擇第一格。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    setScores({ A: 0, B: 0 });
    reset(nextMode);
  };

  const cycle = (row: number, col: number) => {
    if (finished) return;
    const key = `${row},${col}`;
    const current = marks[key] ?? 'EMPTY';
    const nextMark: Mark = current === 'EMPTY' ? 'FILLED' : current === 'FILLED' ? 'CROSSED' : 'EMPTY';
    const next = { ...marks, [key]: nextMark };
    setHistory(items => [...items, { ...marks }]);
    setMarks(next);
    const label = nextMark === 'FILLED' ? '填滿' : nextMark === 'CROSSED' ? '標記叉號' : '清除標記';
    setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}${coordinateLabel(row, col)} ${label}。`);
    const filled = new Set(Object.entries(next).filter(([, mark]) => mark === 'FILLED').map(([cell]) => cell));
    if (isNonogramSolved(filled, solution)) {
      setFinished(true);
      if (mode === 'TEAMS') setScores(value => awardTeam(value, team));
    } else if (mode === 'TEAMS') setTeam(advanceTeam);
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setMarks({ ...previous });
    setHistory(items => items.slice(0, -1));
    setFinished(false);
    if (mode === 'TEAMS') setTeam(advanceTeam);
    setRecent('已復原上一個標記。');
  };

  const hint = () => {
    const missing = [...solution].find(key => marks[key] !== 'FILLED');
    if (missing) {
      const [row, col] = missing.split(',').map(Number);
      setRecent(`提示：${coordinateLabel(row, col)} 應該填滿。`);
      return;
    }
    const extra = Object.keys(marks).find(key => marks[key] === 'FILLED' && !solution.has(key));
    if (extra) {
      const [row, col] = extra.split(',').map(Number);
      setRecent(`提示：重新檢查 ${coordinateLabel(row, col)}。`);
    }
  };

  return (
    <FacilitatedGameFrame
      title="數織彩繪"
      subtitle={`${size}×${size} 圖形推理`}
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
      feedback={finished ? '完成！隱藏圖形已正確還原。' : undefined}
      rules={[
        '目標：依照每列與每欄的數字，填出所有正確方格並完成隱藏圖形。',
        '數字表示連續填滿的格數；多個數字之間至少隔一個空格。',
        '操作：每格依序切換「填滿、叉號、空白」，叉號代表確定不填。',
        '口述範例：「第 2 列提示 1、1，所以 B2 填滿，C2 打叉。」',
        '一般模式是 5×5 單純圖案；進階模式是 6×6，線索組合更多。',
        '分組玩法：A、B 組輪流判斷一格；最後正確完成圖形的組別得 1 分，也可全體合作。',
      ]}
      sidebar={(
        <div className="mt-auto grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2 text-xs font-semibold text-slate-700">
          <div><div className="mb-1 font-black">列線索</div>{rowClues.map((clue, index) => <div key={index}>{index + 1}：{clue.join('、')}</div>)}</div>
          <div><div className="mb-1 font-black">欄線索</div>{colClues.map((clue, index) => <div key={index}>{String.fromCharCode(65 + index)}：{clue.join('、')}</div>)}</div>
        </div>
      )}
    >
      <CoordinateGrid
        rows={size}
        columns={size}
        className="w-full max-w-[28rem]"
        renderCell={(row, col, coordinate) => {
          const mark = marks[`${row},${col}`] ?? 'EMPTY';
          return (
            <button
              type="button"
              aria-label={`${coordinate}，${mark === 'FILLED' ? '已填滿' : mark === 'CROSSED' ? '已標記叉號' : '空白'}`}
              onClick={() => cycle(row, col)}
              className={`h-full w-full rounded-sm border-2 text-xl font-black ${mark === 'FILLED' ? 'border-indigo-800 bg-indigo-600 text-white' : mark === 'CROSSED' ? 'border-slate-400 bg-white text-slate-600' : 'border-slate-300 bg-slate-50 text-transparent'}`}
            >
              {mark === 'FILLED' ? '■' : mark === 'CROSSED' ? '×' : '·'}
            </button>
          );
        }}
      />
    </FacilitatedGameFrame>
  );
};

export default NonogramGame;
