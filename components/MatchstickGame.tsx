import React, { useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, awardTeam, solveMatchstickMove } from '../utils/facilitatedPuzzleRules';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
interface Selection { source: string | null; target: string | null }

const PUZZLES = {
  NORMAL: {
    equation: '6 ＋ 4 ＝ 4',
    solved: '8 － 4 ＝ 4',
    solution: { source: 'B2', target: 'A2' },
    sources: ['A1', 'B1', 'B2', 'C1'],
    targets: ['A2', 'C2', 'D1'],
    sourceText: '＋號的直棒',
    targetText: '數字 6 的右上方',
  },
  ADVANCED: {
    equation: '9 ＋ 3 ＝ 5',
    solved: '8 － 3 ＝ 5',
    solution: { source: 'B2', target: 'A4' },
    sources: ['A1', 'A3', 'B1', 'B2', 'C2'],
    targets: ['A2', 'A4', 'C1', 'D2'],
    sourceText: '＋號的直棒',
    targetText: '數字 9 的左下方',
  },
} as const;

const MatchstickGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const puzzle = PUZZLES[difficulty];
  const [selection, setSelection] = useState<Selection>({ source: null, target: null });
  const [history, setHistory] = useState<Selection[]>([]);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('請說出要拿起的火柴編號，以及要放入的位置編號。');
  const [finished, setFinished] = useState(false);

  const reset = (nextMode = mode) => {
    setSelection({ source: null, target: null });
    setHistory([]);
    setTeam('A');
    setFinished(false);
    setRecent(nextMode === 'TEAMS' ? 'A 組先提出移動方式。' : '請找出能讓算式成立的一根火柴。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    setScores({ A: 0, B: 0 });
    reset(nextMode);
  };

  const chooseSource = (source: string) => {
    if (finished) return;
    setHistory(items => [...items, { ...selection }]);
    setSelection({ source, target: null });
    setRecent(`已選取火柴 ${source}，請再選擇放置位置。`);
  };

  const chooseTarget = (target: string) => {
    if (finished || !selection.source) {
      setRecent('請先選擇要移動的火柴。');
      return;
    }
    setHistory(items => [...items, { ...selection }]);
    setSelection(value => ({ ...value, target }));
    setRecent(`準備把火柴 ${selection.source} 移到位置 ${target}，請確認答案。`);
  };

  const submit = () => {
    if (!selection.source || !selection.target) {
      setRecent('需要同時選擇來源火柴與目的位置。');
      return;
    }
    if (solveMatchstickMove(selection.source, selection.target, puzzle.solution)) {
      setFinished(true);
      setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}${selection.source} 移到 ${selection.target}，算式成立！`);
      if (mode === 'TEAMS') setScores(value => awardTeam(value, team));
    } else {
      setRecent(`${selection.source} 移到 ${selection.target} 後算式仍不成立，請再討論。`);
      if (mode === 'TEAMS') setTeam(advanceTeam);
      setSelection({ source: null, target: null });
    }
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setSelection({ ...previous });
    setHistory(items => items.slice(0, -1));
    setFinished(false);
    setRecent('已復原上一次選擇。');
  };

  return (
    <FacilitatedGameFrame
      title="移動火柴棒"
      subtitle={difficulty === 'NORMAL' ? '一根火柴入門題' : '更多干擾位置'}
      onBack={onBack}
      mode={mode}
      onModeChange={changeMode}
      currentTeam={team}
      scores={scores}
      recentAction={recent}
      onUndo={undo}
      onReset={() => reset()}
      onHint={() => setRecent(`提示：觀察火柴 ${puzzle.solution.source} 所在的運算符號。`)}
      canUndo={history.length > 0}
      feedback={finished ? `答對了：${puzzle.solved}` : undefined}
      rules={[
        '目標：只移動一根火柴，使畫面上的算式變成正確等式。',
        '被移動的火柴必須完整放到另一個空缺位置，不能丟棄或折斷。',
        '操作：先從來源清單選火柴，再從目的清單選位置，最後按「確認移動」。',
        '口述範例：「把火柴 B2，也就是加號的直棒，移到位置 A2。」',
        '一般模式的候選較少；進階模式增加干擾火柴與位置，需要先在心中驗算。',
        '分組玩法：A、B 組輪流提出完整的來源與目的；答對的組別得 1 分，也可共同討論。',
      ]}
      sidebar={(
        <button type="button" onClick={submit} disabled={finished} className="mt-auto min-h-11 rounded-xl bg-emerald-600 px-3 text-base font-black text-white disabled:opacity-50">確認移動</button>
      )}
    >
      <div className="grid h-full w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-3 overflow-auto p-1">
        <section aria-label="可移動火柴" className="rounded-2xl bg-amber-50 p-2">
          <h2 className="mb-2 text-center text-sm font-black text-amber-900">選來源火柴</h2>
          <div className="grid grid-cols-2 gap-2">
            {puzzle.sources.map(source => (
              <button key={source} type="button" aria-pressed={selection.source === source} onClick={() => chooseSource(source)} className={`min-h-11 rounded-xl border-2 px-2 text-sm font-bold ${selection.source === source ? 'border-amber-800 bg-amber-300' : 'border-amber-300 bg-white'}`}>
                火柴 {source}{source === puzzle.solution.source ? <span className="sr-only">，{puzzle.sourceText}</span> : null}
              </button>
            ))}
          </div>
        </section>

        <div className="min-w-40 rounded-2xl border-4 border-slate-700 bg-slate-900 px-3 py-5 text-center text-2xl font-black tracking-wide text-white shadow-xl sm:text-3xl">
          {finished ? puzzle.solved : puzzle.equation}
        </div>

        <section aria-label="火柴目的位置" className="rounded-2xl bg-sky-50 p-2">
          <h2 className="mb-2 text-center text-sm font-black text-sky-900">選目的位置</h2>
          <div className="grid grid-cols-2 gap-2">
            {puzzle.targets.map(target => (
              <button key={target} type="button" aria-pressed={selection.target === target} onClick={() => chooseTarget(target)} className={`min-h-11 rounded-xl border-2 px-2 text-sm font-bold ${selection.target === target ? 'border-sky-800 bg-sky-200' : 'border-sky-300 bg-white'}`}>
                位置 {target}{target === puzzle.solution.target ? <span className="sr-only">，{puzzle.targetText}</span> : null}
              </button>
            ))}
          </div>
        </section>
      </div>
    </FacilitatedGameFrame>
  );
};

export default MatchstickGame;
