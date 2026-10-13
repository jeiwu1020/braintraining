import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, applyHanoiMove, awardTeam, isHanoiSolved } from '../utils/facilitatedPuzzleRules';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }

const copyRods = (rods: readonly (readonly number[])[]) => rods.map(rod => [...rod]);

const HanoiGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const committed = useRef(false);
  useLayoutEffect(() => { committed.current = false; });
  const diskCount = difficulty === 'NORMAL' ? 3 : 4;
  const initial = (): number[][] => [Array.from({ length: diskCount }, (_, index) => diskCount - index), [], []];
  const [rods, setRods] = useState<number[][]>(initial);
  const [history, setHistory] = useState<{ rods: number[][]; team: 'A' | 'B'; scores: { A: number; B: number } }[]>([]);
  const [selectedRod, setSelectedRod] = useState<number | null>(null);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('請說出圓盤號碼、來源柱與目的柱。');
  const [finished, setFinished] = useState(false);

  const reset = (nextMode = mode) => {
    setRods(initial());
    setHistory([]);
    setSelectedRod(null);
    setTeam('A');
    setFinished(false);
    setRecent(nextMode === 'TEAMS' ? 'A 組先提出第一步。' : '請說出第一步。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    setScores({ A: 0, B: 0 });
    reset(nextMode);
  };

  const selectRod = (rodIndex: number) => {
    if (finished || committed.current) return;
    if (selectedRod === null) {
      if (rods[rodIndex].length === 0) {
        setRecent(`柱子 ${String.fromCharCode(65 + rodIndex)} 沒有可移動的圓盤。`);
        return;
      }
      setSelectedRod(rodIndex);
      const disk = rods[rodIndex][rods[rodIndex].length - 1];
      setRecent(`已選取 ${disk} 號圓盤，來源柱 ${String.fromCharCode(65 + rodIndex)}。`);
      return;
    }

    if (selectedRod === rodIndex) { setSelectedRod(null); setRecent('已取消來源選取。'); return; }
    const next = applyHanoiMove(rods, selectedRod, rodIndex);
    if (JSON.stringify(next) === JSON.stringify(rods)) {
      setRecent('不能把大圓盤放在小圓盤上，請重新選擇。');
      setSelectedRod(null);
      return;
    }
    committed.current = true;
    const disk = rods[selectedRod][rods[selectedRod].length - 1];
    const fromLabel = String.fromCharCode(65 + selectedRod);
    const toLabel = String.fromCharCode(65 + rodIndex);
    setHistory(items => [...items, { rods: copyRods(rods), team, scores: { ...scores } }]);
    setRods(next);
    setSelectedRod(null);
    setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}${disk} 號圓盤從 ${fromLabel} 移到 ${toLabel}。`);
    if (isHanoiSolved(next, diskCount)) {
      setFinished(true);
      if (mode === 'TEAMS') setScores(value => awardTeam(value, team));
    } else if (mode === 'TEAMS') setTeam(advanceTeam);
  };

  const undo = () => {
    if (committed.current) return;
    const previous = history[history.length - 1];
    if (!previous) return;
    committed.current = true;
    setRods(copyRods(previous.rods));
    setTeam(previous.team);
    setScores({ ...previous.scores });
    setHistory(items => items.slice(0, -1));
    setSelectedRod(null);
    setFinished(false);
    setRecent('已復原上一個移動。');
  };

  return (
    <FacilitatedGameFrame desktopLayout="hanoi"
      title="河內塔"
      subtitle={`${diskCount} 片圓盤｜最少 ${2 ** diskCount - 1} 步`}
      onBack={onBack}
      mode={mode}
      onModeChange={changeMode}
      currentTeam={team}
      scores={scores}
      recentAction={recent}
      onUndo={undo}
      onReset={() => reset()}
      onHint={() => setRecent('提示：先確認最小圓盤的位置；任何時候都不能讓大盤壓在小盤上。')}
      canUndo={history.length > 0}
      hasProgress={history.length > 0 || selectedRod !== null || scores.A + scores.B > 0}
      feedback={finished ? `完成！共使用 ${history.length} 步。` : undefined}
      rules={[
        '目標：把所有圓盤從 A 柱移到 C 柱，並維持由大到小堆疊。',
        '每次只能移動每根柱子最上方的一片圓盤，大圓盤不能放在小圓盤上。',
        '操作：先點來源柱，再點目的柱；再次點選可重新決定。',
        '口述範例：「把 1 號圓盤從 A 柱移到 C 柱。」柱子為 A、B、C，圓盤由小到大編號。',
        '一般模式有 3 片圓盤；進階模式有 4 片，需要更長的步驟規劃。',
        '分組玩法：A、B 組輪流提出一個合法移動，完成最後一步的組別得 1 分；亦可全體合作。',
      ]}
    >
      <div className="hanoi-presentation flex h-full w-full max-w-3xl items-end justify-around gap-2 pb-2">
        {rods.map((rod, rodIndex) => {
          const rodLabel = String.fromCharCode(65 + rodIndex);
          return (
            <button
              key={rodLabel}
              type="button"
              aria-label={`柱子 ${rodLabel}`}
              aria-pressed={selectedRod === rodIndex}
              onClick={() => selectRod(rodIndex)}
              className={`hanoi-rod relative flex h-[85%] min-h-44 min-w-28 flex-1 flex-col-reverse items-center rounded-2xl border-2 bg-amber-50 px-2 pb-8 pt-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${selectedRod === rodIndex ? 'border-indigo-600 ring-4 ring-indigo-200' : 'border-amber-300'}`}
            >
              <span className="hanoi-label absolute bottom-0 left-0 right-0 flex h-8 items-center justify-center bg-amber-800 text-base font-black text-white">{rodLabel}</span>
              <span className="absolute bottom-8 top-5 w-2 rounded-full bg-amber-700" aria-hidden="true" />
              {rod.map(disk => (
                <span
                  key={disk}
                  aria-label={`${disk} 號圓盤`}
                  className="hanoi-disk z-10 flex h-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-sm font-black text-white shadow"
                  style={{ width: `${42 + disk * 12}%` }}
                >
                  {disk}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </FacilitatedGameFrame>
  );
};

export default HanoiGame;
