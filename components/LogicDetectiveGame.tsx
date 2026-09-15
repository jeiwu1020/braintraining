import React, { useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, awardTeam, coordinateLabel, isLogicGridSolved } from '../utils/facilitatedPuzzleRules';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
type LogicMark = 'UNKNOWN' | 'NO' | 'YES';

const PUZZLES = {
  NORMAL: {
    people: ['小安', '小美', '阿康'],
    choices: ['茶', '牛奶', '咖啡'],
    solution: [0, 1, 2],
    clues: ['小美選的是白色飲品。', '阿康不喝牛奶。', '喝咖啡的人不是小安。'],
  },
  ADVANCED: {
    people: ['小安', '小美', '阿康', '阿珠'],
    choices: ['數獨', '圍棋', '象棋', '拼圖'],
    solution: [2, 0, 3, 1],
    clues: ['小安選擇有棋子的活動，但不是圍棋。', '小美沒有選棋類活動，也沒有選拼圖。', '阿康選了需要組合圖像的活動。', '阿珠沒有選數獨或象棋。'],
  },
} as const;

const LogicDetectiveGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const puzzle = PUZZLES[difficulty];
  const size = puzzle.people.length;
  const [marks, setMarks] = useState<Record<string, LogicMark>>({});
  const [history, setHistory] = useState<Record<string, LogicMark>[]>([]);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('請讀出線索，再說明哪個配對可以確認或排除。');
  const [finished, setFinished] = useState(false);

  const reset = (nextMode = mode) => {
    setMarks({});
    setHistory([]);
    setTeam('A');
    setFinished(false);
    setRecent(nextMode === 'TEAMS' ? 'A 組先選擇一條線索。' : '請選擇一條線索開始推理。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    setScores({ A: 0, B: 0 });
    reset(nextMode);
  };

  const cycle = (row: number, col: number) => {
    if (finished) return;
    const key = `${row},${col}`;
    const current = marks[key] ?? 'UNKNOWN';
    const nextMark: LogicMark = current === 'UNKNOWN' ? 'NO' : current === 'NO' ? 'YES' : 'UNKNOWN';
    const next = { ...marks, [key]: nextMark };
    if (nextMark === 'YES') {
      for (let index = 0; index < size; index += 1) {
        if (index !== col) next[`${row},${index}`] = 'NO';
        if (index !== row) next[`${index},${col}`] = 'NO';
      }
    }
    setHistory(items => [...items, { ...marks }]);
    setMarks(next);
    const action = nextMark === 'YES' ? '確認配對' : nextMark === 'NO' ? '排除' : '清除標記';
    setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}${coordinateLabel(row, col)} ${puzzle.people[row]}與${puzzle.choices[col]}，${action}。`);
    const selections = puzzle.people.map((_, personIndex) => {
      const selected = puzzle.choices.findIndex((__, choiceIndex) => next[`${personIndex},${choiceIndex}`] === 'YES');
      return selected >= 0 ? selected : null;
    });
    if (isLogicGridSolved(selections, puzzle.solution)) {
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
    setRecent('已復原上一個推理標記。');
  };

  const hint = () => {
    const row = puzzle.solution.findIndex((col, index) => marks[`${index},${col}`] !== 'YES');
    if (row >= 0) setRecent(`提示：重新閱讀與「${puzzle.people[row]}」有關的線索。`);
  };

  return (
    <FacilitatedGameFrame
      title="邏輯線索偵探"
      subtitle={`${size} 人 × ${size} 個選項`}
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
      feedback={finished ? '破案成功！所有人物與選項都已正確配對。' : undefined}
      rules={[
        '目標：整合所有線索，找出每個人物唯一對應的飲品或活動。',
        '每個人物與每個選項只能使用一次；叉號代表排除，圓圈代表確認。',
        '操作：點一下標記叉號，再點一下確認圓圈；確認時會自動排除同列與同欄。',
        '口述範例：「根據第 2 條線索，把小美和茶的 A2 格標記叉號。」',
        '一般模式為 3×3 直接線索；進階模式為 4×4，需要結合多條排除線索。',
        '分組玩法：A、B 組輪流提出一個有理由的標記；完成最後配對的組別得 1 分。',
      ]}
      sidebar={(
        <ol className="mt-auto space-y-1 rounded-xl bg-violet-50 p-2 text-sm font-semibold leading-snug text-violet-950">
          {puzzle.clues.map((clue, index) => <li key={clue}>{index + 1}. {clue}</li>)}
        </ol>
      )}
    >
      <div className="flex max-h-full w-full max-w-[30rem] flex-col items-center gap-1">
        <div className="ml-16 grid w-[calc(100%-4rem)] gap-0.5 pl-7 text-center text-xs font-bold text-slate-700" style={{ gridTemplateColumns: `repeat(${size}, minmax(2.75rem, 1fr))` }}>
          {puzzle.choices.map(choice => <div key={choice} className="truncate px-0.5">{choice}</div>)}
        </div>
        <div className="flex w-full items-center gap-1">
          <div className="flex w-16 shrink-0 flex-col gap-0.5 pt-6">
            {puzzle.people.map(person => <div key={person} className="flex min-h-11 items-center justify-end pr-1 text-sm font-bold text-slate-700">{person}</div>)}
          </div>
          <CoordinateGrid
            rows={size}
            columns={size}
            className="min-w-0 flex-1"
            renderCell={(row, col, coordinate) => {
              const mark = marks[`${row},${col}`] ?? 'UNKNOWN';
              return (
                <button
                  type="button"
                  aria-label={`${coordinate}，${puzzle.people[row]}與${puzzle.choices[col]}，${mark === 'YES' ? '已確認' : mark === 'NO' ? '已排除' : '未判定'}`}
                  onClick={() => cycle(row, col)}
                  className={`h-full w-full rounded-md border-2 text-xl font-black ${mark === 'YES' ? 'border-emerald-700 bg-emerald-100 text-emerald-800' : mark === 'NO' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-300'}`}
                >
                  {mark === 'YES' ? '○' : mark === 'NO' ? '×' : '·'}
                </button>
              );
            }}
          />
        </div>
      </div>
    </FacilitatedGameFrame>
  );
};

export default LogicDetectiveGame;
