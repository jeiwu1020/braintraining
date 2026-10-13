import React, { useMemo, useState } from 'react';
import type { Difficulty } from '../types';
import { MATCHSTICK_PUZZLES, type MatchstickTier } from '../data/matchstickPuzzles';
import { canTakeMatchstick, createMatchstickBoard, decodeMatchstickBoard, describeMatchstickPosition, getMatchstickPositions, MATCHSTICK_SEGMENT_NAMES, MATCHSTICK_SLOTS, moveMatchstick, type MatchstickBoard, type MatchstickSlot } from '../utils/matchstickRules';
import { chooseMatchstickSource, chooseMatchstickTarget, clearMatchstickDraft, confirmMatchstickMove, createMatchstickSession, requestMatchstickHint, undoMatchstickDecision } from '../utils/matchstickSession';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';
import { useConfirmAction } from './game-ui/useConfirmAction';

interface Props { onBack: () => void; difficulty?: Difficulty }
const TIERS: Array<{ value: MatchstickTier; label: string; description: string }> = [
  { value: 'BEGINNER', label: '入門', description: '指定來源，預測放哪裡' },
  { value: 'STANDARD', label: '標準', description: '自由選一棒，驗算一個解' },
  { value: 'CHALLENGE', label: '挑戰', description: '回到同一原題，找兩個不同解' },
];
const slotNames: Record<MatchstickSlot, string> = { A: '左數', B: '運算', C: '中數', D: '等號', E: '右數' };
const digitLines = [[20, 10, 60, 10], [67, 20, 67, 50], [67, 70, 67, 100], [20, 110, 60, 110], [13, 70, 13, 100], [13, 20, 13, 50], [20, 60, 60, 60]];
const buttonClass = 'min-h-11 rounded-xl border-2 px-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 disabled:opacity-40';

interface EquationProps {
  board: MatchstickBoard; originalBoard: MatchstickBoard;
  selection: { source: string | null; target: string | null }; activeSlot: MatchstickSlot;
  onSelectSlot: (slot: MatchstickSlot) => void; hintSource?: string | null; disabled?: boolean;
}

export const MatchstickEquation: React.FC<EquationProps> = ({ board, originalBoard, selection, activeSlot, onSelectSlot, hintSource, disabled }) => {
  const decoded = decodeMatchstickBoard(board);
  return (
    <div data-matchstick-equation="true" aria-label={`火柴算式 ${decoded?.equation ?? '移動後有待確認的符號'}`} className="grid w-full grid-cols-[1fr_.8fr_1fr_.55fr_1fr] items-start gap-1">
      {MATCHSTICK_SLOTS.map(slot => {
        const fixed = slot === 'D';
        const lines = slot === 'B' ? [[17, 60, 63, 60], [40, 37, 40, 83]] : fixed ? [[15, 48, 65, 48], [15, 72, 65, 72]] : digitLines;
        const glyph = (
          <>
            <span className="block text-center text-sm font-black">{slot} {slotNames[slot]}</span>
            <svg viewBox="0 0 80 120" className="h-[116px] w-full" aria-hidden="true">
              {lines.map(([x1, y1, x2, y2], index) => {
                const segment = index + 1; const id = `${slot}${segment}`;
                const present = board[slot].includes(segment); const wasPresent = originalBoard[slot].includes(segment);
                const removed = wasPresent && !present; const added = !wasPresent && present;
                const selected = selection.source === id || hintSource === id;
                const state = removed ? 'removed' : added ? 'added' : selected ? 'selected' : present ? 'present' : 'empty';
                const color = removed ? '#be123c' : added ? '#047857' : selected ? '#b45309' : present ? '#fbbf24' : '#64748b';
                return (
                  <g key={id} data-matchstick-segment={id} data-segment-state={state}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={present ? 9 : 3} strokeLinecap="round" strokeDasharray={present ? undefined : '4 4'} />
                    {present && <circle cx={x2} cy={y2} r="3" fill={added ? '#a7f3d0' : selected ? '#fde68a' : '#b45309'} />}
                    {!fixed && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="900" fill={present ? (added || selected ? '#ffffff' : '#422006') : removed ? '#be123c' : '#475569'} stroke={present ? undefined : '#f8fafc'} strokeWidth={present ? undefined : 3} paintOrder="stroke">{segment}</text>}
                  </g>
                );
              })}
            </svg>
          </>
        );
        return fixed ? (
          <div key={slot} aria-label="等號不移動" className="rounded-xl border-2 border-transparent py-1 text-slate-500">{glyph}</div>
        ) : (
          <button key={slot} type="button" disabled={disabled} aria-label={`選擇 ${slot}：${slotNames[slot]}`} aria-pressed={activeSlot === slot} onClick={() => onSelectSlot(slot)} className={`min-h-11 min-w-11 rounded-xl border-2 py-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${activeSlot === slot ? 'border-sky-600 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}>{glyph}</button>
        );
      })}
    </div>
  );
};

const MatchstickGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [tier, setTier] = useState<MatchstickTier>(difficulty === 'NORMAL' ? 'BEGINNER' : 'STANDARD');
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzles = useMemo(() => MATCHSTICK_PUZZLES.filter(puzzle => puzzle.tier === tier), [tier]);
  const puzzle = puzzles[puzzleIndex % puzzles.length];
  const [session, setSession] = useState(() => createMatchstickSession(puzzle));
  const [activeSlot, setActiveSlot] = useState<MatchstickSlot>('A');
  const board = useMemo(() => createMatchstickBoard(puzzle.equation), [puzzle]);
  const lastSolution = session.found[session.found.length - 1];
  const selection = session.finished && lastSolution ? lastSolution : session.selection;
  const preview = selection.source && selection.target ? moveMatchstick(board, { source: selection.source, target: selection.target }) : null;
  const previewEquation = preview ? decodeMatchstickBoard(preview) : null;
  const phase = session.selection.source ? 'target' : 'source';
  const candidates = getMatchstickPositions(board, phase).filter(id => id[0] === activeSlot);
  const hasProgress = Boolean(session.history.length || session.selection.target || (!puzzle.guidedSource && session.selection.source) || session.hintLevel || session.revealed.length || session.found.length || session.scores.A || session.scores.B);
  const { requestAction, confirmationDialog } = useConfirmAction(hasProgress);
  const tierInfo = TIERS.find(item => item.value === tier)!;

  const restart = (mode: FacilitatedMode = session.mode) => {
    const fresh = createMatchstickSession(puzzle, mode);
    setSession({
      ...fresh, revealed: [...session.revealed],
      recent: session.revealed.length ? `重玩本題：已揭示的 ${session.revealed.length} 個方法仍只作練習、不計分。${fresh.recent}` : fresh.recent,
    });
    setActiveSlot('A');
  };
  const changeTier = (nextTier: MatchstickTier) => {
    if (nextTier === tier) return;
    requestAction(() => {
      const nextPuzzle = MATCHSTICK_PUZZLES.find(item => item.tier === nextTier)!;
      setTier(nextTier); setPuzzleIndex(0); setSession(createMatchstickSession(nextPuzzle, session.mode)); setActiveSlot('A');
    }, '切換階段會清除本題進度與分數。要切換嗎？');
  };
  const nextPuzzle = () => {
    const applyNext = () => {
      const index = (puzzleIndex + 1) % puzzles.length;
      setPuzzleIndex(index); setSession({ ...createMatchstickSession(puzzles[index], session.mode), team: session.team, scores: session.scores }); setActiveSlot('A');
    };
    if (session.finished) applyNext();
    else requestAction(applyNext, '換題會清除本題進度，保留累積分數。要換題嗎？');
  };
  const hint = () => {
    const next = requestMatchstickHint(session, puzzle);
    setSession(next);
    if (next.selection.target) setActiveSlot(next.selection.target[0] as MatchstickSlot);
    else if (next.hintSource) setActiveSlot(next.hintSource[0] as MatchstickSlot);
  };
  const undo = () => {
    const restored = undoMatchstickDecision(session);
    setSession(restored);
    const position = restored.selection.target ?? restored.selection.source;
    if (position) setActiveSlot(position[0] as MatchstickSlot);
  };

  return (
    <>
      <FacilitatedGameFrame
        title="移動火柴棒" subtitle={`${tierInfo.label} ${puzzleIndex + 1}／${puzzles.length}・${puzzle.title}`}
        onBack={onBack} mode={session.mode} onModeChange={restart} currentTeam={session.team} scores={session.scores}
        recentAction={session.recent} onUndo={undo} onReset={() => restart()} onHint={hint}
        canUndo={session.history.length > 0} hasProgress={hasProgress}
        feedback={session.finished ? `完成！已驗算 ${session.found.length} 個方法。可復原整步或換題。` : undefined}
        rules={[
          '只拿起一根現有火柴，放入另一個原本空著的棒段；可以旋轉，不能折斷、丟棄或改動等號。加號的橫棒不能拿取，其餘棒段不新增取用限制。',
          '數字採七段標準形狀，只接受 0–9、加號及減號；移動後必須仍是合法數字，並且等式成立。',
          '先點 A、B、C 或 E 選符號，再按大按鈕選來源棒段；同樣方式選目的空段，看預覽後按「確認移動」。不需要拖曳。',
          '入門已指定來源；標準自由選來源與目的；挑戰需從同一原題找出兩個不同的一棒解。',
          '圖上實線是現有火柴，虛線是空位；琥珀色標來源，紅色虛線標拿走處，綠色標補入處。編號與中文方位可共同口述。',
          '每個完整確認只換組一次；新合法解得 1 分，選取、清除、提示與重複的解不換組、不加分。完整答案揭示後，該解只作練習不計分。',
          '提示依序提供觀察方向、來源、完整方法。復原會一起還原選取、分數、組別和完成狀態；已看過完整答案的紀錄會保留。',
          '重新開始與切模式會清盤、清分，但保留本題的答案揭示紀錄；只有換題或切階段到另一題，才開始新的揭示紀錄。下一題保留累積分數，切階段清分。沒有時間限制。',
        ]}
        settings={(
          <div className="space-y-1">
            <div className="text-sm font-bold">推理階段</div>
            <div className="grid grid-cols-3 gap-1">{TIERS.map(item => <button key={item.value} type="button" aria-pressed={tier === item.value} onClick={() => changeTier(item.value)} className={`${buttonClass} ${tier === item.value ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white'}`}>{item.label}</button>)}</div>
            <p className="text-sm text-slate-600">{tierInfo.description}</p>
          </div>
        )}
        sidebar={(
          <div className="space-y-2 text-sm">
            <div className="rounded-xl bg-slate-100 p-2">
              <div className="font-bold">原題 {puzzle.equation}・已找到 {session.found.length}／{puzzle.goal} 解</div>
              {session.selection.source && <div className="mt-1 font-semibold text-amber-900">拿：火柴 {describeMatchstickPosition(board, session.selection.source)}</div>}
              {session.selection.target && <div className="mt-1 font-semibold text-emerald-900">放：{describeMatchstickPosition(board, session.selection.target)}</div>}
              {preview && !session.finished && <div className="mt-1 font-bold">預覽：{previewEquation?.equation ?? '有非標準符號，請看棒段'}<br />先請另一人驗算，再確認。</div>}
            </div>
            {session.found.map((solution, index) => <div key={`${solution.source}-${solution.target}`} className="rounded-xl border border-emerald-200 bg-emerald-50 p-2"><div className="font-black">方法 {index + 1}：{solution.equation}</div><div>{solution.source} → {solution.target}{solution.assisted ? '（提示練習）' : ''}</div></div>)}
            <div className="text-slate-600">提示 {session.hintLevel}／3・完整揭示的解不計分{session.revealed.length > 0 && <div>本題已揭示 {session.revealed.length} 解；復原、重玩仍保留</div>}</div>
          </div>
        )}
        controls={(
          <div className="grid grid-cols-2 gap-1">
            <button type="button" onClick={() => setSession(state => clearMatchstickDraft(state, puzzle))} disabled={session.finished} className={`${buttonClass} border-slate-300 bg-white`}>清除本次選取</button>
            <button type="button" onClick={() => setSession(state => confirmMatchstickMove(state, puzzle))} disabled={session.finished || !session.selection.source || !session.selection.target} className={`${buttonClass} border-emerald-700 bg-emerald-700 text-white`}>確認移動</button>
            <button type="button" onClick={nextPuzzle} className={`${buttonClass} col-span-2 border-indigo-200 bg-indigo-50 text-indigo-900`}>下一題（保留分數）</button>
          </div>
        )}
      >
        <div className="flex w-full min-w-[320px] max-w-xl flex-col gap-1 p-1">
          <div className="text-center text-sm font-bold text-slate-700">{session.finished ? '完成圖・紅虛線拿走，綠色補入' : `${preview ? '移動預覽・' : ''}${phase === 'source' ? '選來源火柴' : '選目的空段'}：先點符號，再點下方棒段`}</div>
          <MatchstickEquation board={preview ?? board} originalBoard={board} selection={selection} activeSlot={activeSlot} onSelectSlot={setActiveSlot} hintSource={session.hintSource} disabled={session.finished} />
          <div className="flex min-h-12 flex-wrap items-center justify-center gap-1" aria-label={phase === 'source' ? '可移動火柴' : '火柴目的位置'}>
            {session.finished ? <span className="text-base font-black text-emerald-800">{lastSolution?.equation}，等式成立</span> : candidates.length ? candidates.map(id => (
              <button key={id} type="button" disabled={phase === 'source' && !canTakeMatchstick(board, id)} title={phase === 'source' && !canTakeMatchstick(board, id) ? '＋的橫棒不能拿取' : undefined} aria-label={`${phase === 'source' ? '拿起火柴' : '放入位置'} ${describeMatchstickPosition(board, id)}`} aria-pressed={(phase === 'source' ? session.selection.source : session.selection.target) === id} onClick={() => setSession(state => phase === 'source' ? chooseMatchstickSource(state, puzzle, id) : chooseMatchstickTarget(state, puzzle, id))} className={`min-h-11 min-w-11 rounded-xl border-2 px-1 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 ${session.selection.target === id ? 'border-emerald-700 bg-emerald-100' : 'border-slate-300 bg-white'}`}>
                <span className="block">{id}</span><span className="block text-xs">{activeSlot === 'B' ? (id[1] === '1' ? (phase === 'source' && !canTakeMatchstick(board, id) ? '橫棒固定' : '橫棒') : '直棒') : MATCHSTICK_SEGMENT_NAMES[Number(id[1])].replace('段', '')}</span>
              </button>
            )) : <span className="text-sm font-semibold text-slate-600">{activeSlot} 沒有可{phase === 'source' ? '拿的火柴' : '放的空段'}，請選其他符號。</span>}
          </div>
        </div>
      </FacilitatedGameFrame>
      {confirmationDialog}
    </>
  );
};

export default MatchstickGame;
