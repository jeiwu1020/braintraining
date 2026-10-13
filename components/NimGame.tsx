import React, { useLayoutEffect, useRef, useState } from 'react';
import { readFacilitatorKnowledge, saveFacilitatorKnowledge } from '../utils/facilitatorKnowledge';
import type { Difficulty } from '../types';
import { advanceTeam, applyNimMove, awardTeam, getNimTeachingMove } from '../utils/facilitatedPuzzleRules';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
interface Snapshot { piles: number[]; team: 'A' | 'B'; scores: { A: number; B: number }; opponentPending: boolean; result: string | null }

const NimGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const committed = useRef(false);
  useLayoutEffect(() => { committed.current = false; });
  const misere = difficulty === 'ADVANCED';
  const knowledgeId = misere ? 'classic-misere-1357' : 'classic-normal-345';
  const [assisted, setAssisted] = useState(() => readFacilitatorKnowledge('nim-classic-v1').includes(knowledgeId));
  const initialPiles = (): number[] => misere ? [1, 3, 5, 7] : [3, 4, 5];
  const [piles, setPiles] = useState<number[]>(initialPiles);
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [amount, setAmount] = useState(1);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [opponentPending, setOpponentPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [recent, setRecent] = useState('請說出石堆代號與要拿走的數量。');

  const snapshot = (): Snapshot => ({ piles: [...piles], team, scores: { ...scores }, opponentPending, result });

  const reset = (nextMode = mode) => {
    setPiles(initialPiles());
    setSelectedPile(null);
    setAmount(1);
    setHistory([]);
    setTeam('A');
    setScores({ A: 0, B: 0 });
    setOpponentPending(false);
    setResult(null);
    setRecent(nextMode === 'COOP' ? '大家一起討論如何對抗教學對手。' : 'A 組先拿石子。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    reset(nextMode);
  };

  const finishMessage = (mover: string, moverWon: boolean, other: string): string =>
    moverWon ? `${mover}獲勝！` : `${mover}拿到最後一顆，因此${other}獲勝！`;

  const take = () => {
    if (selectedPile === null || opponentPending || result || committed.current) return;
    const outcome = applyNimMove(piles, selectedPile, amount, misere);
    if (!outcome) {
      setRecent('拿取數量超過該石堆，請重新選擇。');
      return;
    }
    committed.current = true;
    setHistory(items => [...items, snapshot()]);
    setPiles(outcome.piles);
    const pileLabel = String.fromCharCode(65 + selectedPile);
    setRecent(`${mode === 'TEAMS' ? `${team} 組：` : '合作組：'}從 ${pileLabel} 堆拿走 ${amount} 顆。`);
    setSelectedPile(null);
    setAmount(1);
    if (outcome.finished) {
      if (mode === 'TEAMS') {
        const other = team === 'A' ? 'B' : 'A';
        const winner = outcome.moverWon ? team : other;
        if (!assisted) setScores(value => awardTeam(value, winner));
        setResult(finishMessage(`${team} 組`, outcome.moverWon, `${other} 組`));
      } else setResult(outcome.moverWon ? '合作組獲勝！' : '教學對手獲勝。');
    } else if (mode === 'TEAMS') setTeam(advanceTeam);
    else setOpponentPending(true);
  };

  const playOpponent = () => {
    if (!opponentPending || result || committed.current) return;
    const move = getNimTeachingMove(piles, misere);
    if (!move) return;
    const outcome = applyNimMove(piles, move.pileIndex, move.amount, misere)!;
    committed.current = true;
    setHistory(items => [...items, snapshot()]);
    setPiles(outcome.piles);
    const pileLabel = String.fromCharCode(65 + move.pileIndex);
    setRecent(`教學對手從 ${pileLabel} 堆拿走 ${move.amount} 顆，請討論下一步。`);
    setOpponentPending(false);
    if (outcome.finished) setResult(outcome.moverWon ? '教學對手獲勝。' : '合作組獲勝！');
  };

  const undo = () => {
    if (committed.current) return;
    const previous = history[history.length - 1];
    if (!previous) return;
    committed.current = true;
    setPiles([...previous.piles]);
    setTeam(previous.team);
    setScores({ ...previous.scores });
    setOpponentPending(previous.opponentPending);
    setResult(previous.result);
    setSelectedPile(null);
    setAmount(1);
    setHistory(items => items.slice(0, -1));
    setRecent('已復原上一個拿取動作。');
  };

  const hint = () => {
    const move = getNimTeachingMove(piles, misere);
    if (move) {
      setAssisted(true);
      saveFacilitatorKnowledge('nim-classic-v1', [...new Set([...readFacilitatorKnowledge('nim-classic-v1'), knowledgeId])]);
      setRecent(`策略提示：考慮從 ${String.fromCharCode(65 + move.pileIndex)} 堆拿走 ${move.amount} 顆。本盤為提示練習，不計組分。`);
    }
  };

  return (
    <FacilitatedGameFrame
      title="取石子策略"
      subtitle={misere ? '進階：拿到最後一顆者輸' : '一般：拿到最後一顆者勝'}
      onBack={onBack}
      mode={mode}
      onModeChange={changeMode}
      coopLabel="合作教學"
      teamsLabel="A／B 對戰"
      currentTeam={team}
      scores={scores}
      recentAction={recent}
      onUndo={undo}
      onReset={() => reset()}
      onHint={hint}
      canUndo={history.length > 0}
      hasProgress={history.length > 0 || selectedPile !== null || assisted || scores.A + scores.B > 0}
      feedback={result ? `${result}${assisted ? ' 提示練習，不計組分。' : ''}` : undefined}
      rules={[
        '目標：每回合從一個石堆拿走石子，運用剩餘數量迫使對手進入不利局面。',
        `每回合只能選一堆，至少拿 1 顆，可拿到該堆全部；${misere ? '本模式拿到最後一顆者輸。' : '本模式拿到最後一顆者勝。'}`,
        '操作：先點石堆，再選拿取數量並確認；合作教學模式由治療者按鈕執行對手回合。',
        '口述範例：「從 B 堆拿走兩顆。」石堆由左到右標為 A、B、C、D。',
        '一般模式有 3 堆且最後一顆獲勝；進階模式有 4 堆並改為最後一顆落敗。',
        '分組玩法：A、B 組直接輪流對戰；合作教學則全體共同商量，對抗策略提示對手。',
      ]}
      sidebar={(
        <div className="mt-auto space-y-2">
          {assisted && <p className="text-sm font-bold text-amber-800">提示練習：本盤已看策略答案，不計組分。</p>}
          {mode === 'COOP' && opponentPending ? (
            <button type="button" onClick={playOpponent} className="min-h-11 w-full rounded-xl bg-violet-600 px-2 font-black text-white">執行教學對手</button>
          ) : (
            <>
              {selectedPile !== null && (
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: piles[selectedPile] }, (_, index) => index + 1).map(value => (
                    <button key={value} type="button" aria-pressed={amount === value} onClick={() => setAmount(value)} className={`min-h-11 rounded-lg border text-sm font-bold ${amount === value ? 'border-indigo-700 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>{value}</button>
                  ))}
                </div>
              )}
              <button type="button" onClick={take} disabled={selectedPile === null || Boolean(result)} className="min-h-11 w-full rounded-xl bg-indigo-600 px-2 font-black text-white disabled:opacity-40">確認拿取 {amount} 顆</button>
            </>
          )}
        </div>
      )}
    >
      <div className="flex h-full w-full max-w-3xl items-end justify-around gap-2 px-2 pb-2">
        {piles.map((count, pileIndex) => {
          const label = String.fromCharCode(65 + pileIndex);
          return (
            <button
              key={label}
              type="button"
              aria-label={`石堆 ${label}`}
              aria-pressed={selectedPile === pileIndex}
              disabled={count === 0 || opponentPending || Boolean(result)}
              onClick={() => { setSelectedPile(pileIndex); setAmount(1); setRecent(`已選取 ${label} 堆，共 ${count} 顆。`); }}
              className={`flex min-h-44 min-w-24 flex-1 flex-col items-center justify-end rounded-2xl border-2 p-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50 ${selectedPile === pileIndex ? 'border-indigo-700 bg-indigo-100 ring-4 ring-indigo-200' : 'border-amber-400 bg-amber-50'}`}
            >
              <span className="mb-1 flex max-w-28 flex-wrap-reverse justify-center gap-1" aria-hidden="true">
                {Array.from({ length: count }, (_, stone) => <span key={stone} className="h-7 w-9 rounded-full border-2 border-amber-800 bg-amber-500 shadow-sm" />)}
              </span>
              <span className="text-base font-black text-slate-900">{label} 堆：{count} 顆</span>
            </button>
          );
        })}
      </div>
    </FacilitatedGameFrame>
  );
};

export default NimGame;
