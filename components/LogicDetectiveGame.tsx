import { readFacilitatorKnowledge, saveFacilitatorKnowledge } from '../utils/facilitatorKnowledge';
import React, { useEffect, useMemo, useState } from 'react';
import type { Difficulty } from '../types';
import { LOGIC_PUZZLES, LOGIC_TIER_LABELS, type LogicTier } from '../data/logicDetectivePuzzles';
import { describeLogicClue, logicCoordinate, type LogicMark } from '../utils/logicDetectiveRules';
import { clearLogicDraft, confirmLogicDecision, confirmLogicHypothesis, createLogicSession, prepareLogicDecision, prepareLogicHypothesis, requestLogicHint, undoLogicDecision } from '../utils/logicDetectiveSession';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';
import { useConfirmAction } from './game-ui/useConfirmAction';

interface Props { onBack: () => void; difficulty?: Difficulty }
/** Compatibility entry points; the local three-tier bank is the canonical source. */
export const LOGIC_DETECTIVE_PUZZLES = {
  NORMAL: LOGIC_PUZZLES.filter(puzzle => puzzle.tier === 'BEGINNER'),
  ADVANCED: LOGIC_PUZZLES.filter(puzzle => puzzle.tier === 'STANDARD'),
};
const buttonClass = 'min-h-11 min-w-11 rounded-xl border-2 px-2 text-base font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 disabled:opacity-40';
const tiers: LogicTier[] = ['BEGINNER','STANDARD','CHALLENGE'];
const tools: { value: LogicMark; label: string }[] = [
  { value: 'YES', label: '確認 ○' }, { value: 'NO', label: '排除 ×' }, { value: 'UNKNOWN', label: '清除' },
];
const markName = (mark: LogicMark) => mark === 'YES' ? '已確認' : mark === 'NO' ? '已排除' : '未判定';
const markSymbol = (mark: LogicMark) => mark === 'YES' ? '○' : mark === 'NO' ? '×' : '·';

const LogicDetectiveGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [tier,setTier] = useState<LogicTier>(difficulty === 'NORMAL' ? 'BEGINNER' : 'STANDARD');
  const [puzzleIndex,setPuzzleIndex] = useState(0);
  const bank = useMemo(() => LOGIC_PUZZLES.filter(puzzle => puzzle.tier === tier),[tier]);
  const puzzle = bank[puzzleIndex]; const size = puzzle.people.length;
  const [session,setSession] = useState(() => ({ ...createLogicSession(puzzle), revealed: readFacilitatorKnowledge('logic-v1') }));
  useEffect(() => saveFacilitatorKnowledge('logic-v1', session.revealed), [session.revealed]);
  const [tool,setTool] = useState<LogicMark>('YES');
  const [autoOrganize,setAutoOrganize] = useState(true);
  const [focusedClue,setFocusedClue] = useState<number | null>(null);
  const assisted = session.revealed.includes(puzzle.id);
  const hasProgress = Boolean(session.history.length || session.selection || session.hypothesis.candidate !== null || session.hypothesis.clue !== null || session.hintLevel || assisted || session.scores.A || session.scores.B);
  const { requestAction,confirmationDialog } = useConfirmAction(hasProgress);
  const activeTool = session.selection?.mark ?? tool;
  const restart = (mode: FacilitatedMode = session.mode) => {
    setSession(state => createLogicSession(puzzle,mode,state)); setFocusedClue(null); setTool('YES');
  };
  const changeTier = (next: LogicTier) => {
    if (next === tier) return;
    requestAction(() => {
      const nextPuzzle = LOGIC_PUZZLES.find(item => item.tier === next)!;
      setTier(next); setPuzzleIndex(0); setFocusedClue(null); setTool('YES');
      setSession(state => createLogicSession(nextPuzzle,state.mode,state));
    },'切換階段會清除目前配對與待確認推論；保留分數和已看過的提示紀錄。是否繼續？');
  };
  const nextPuzzle = () => {
    const apply = () => {
      const next = (puzzleIndex + 1) % bank.length;
      setPuzzleIndex(next); setFocusedClue(null); setTool('YES');
      setSession(state => createLogicSession(bank[next],state.mode,state));
    };
    if (session.finished) apply();
    else requestAction(apply,'換題會清除目前配對與待確認推論；保留分數和已看過的提示紀錄。是否繼續？');
  };
  const chooseTool = (mark: LogicMark) => {
    setTool(mark);
    if (session.selection) setSession(state => prepareLogicDecision(state,puzzle,{ ...state.selection!,mark }));
  };
  const selectClue = (index: number) => {
    setFocusedClue(index);
    if (puzzle.candidates) setSession(state => prepareLogicHypothesis(state,puzzle,state.hypothesis.candidate,index));
  };
  const ready = puzzle.candidates ? session.hypothesis.candidate !== null && session.hypothesis.clue !== null : Boolean(session.selection);

  return (
    <div data-logic-detective="true" className="contents">
      <style>{'[data-logic-detective] .text-sm,[data-logic-detective] .text-xs{font-size:1rem;line-height:1.4}[data-logic-detective] [data-facilitated-turn-status]{font-size:1rem;line-height:1.35}'}</style>
      <FacilitatedGameFrame desktopLayout="detective"
        title="邏輯線索偵探" subtitle={`${LOGIC_TIER_LABELS[tier]} ${puzzleIndex+1}／${bank.length}・${puzzle.title}・${size}×${size}`}
        onBack={onBack} mode={session.mode} onModeChange={restart} currentTeam={session.team} scores={session.scores}
        recentAction={session.recent} onUndo={() => setSession(undoLogicDecision)} onReset={() => restart()}
        onHint={() => setSession(state => requestLogicHint(state,puzzle))} canUndo={session.history.length > 0} hasProgress={hasProgress}
        feedback={session.finished ? `全部配對完成！${assisted ? '本題為提示練習。' : '可一起回顧每一步的理由。'}` : undefined}
        rules={[
          '每個人物只選一項，每個選項只給一人。配對表的 ○ 是確認、× 是排除，點格子只準備，不會立刻落筆。',
          '入門：讀短線索，分清肯定與否定。標準：結合兩條以上線索和一對一限制。挑戰：比較甲、乙兩案，找出可推翻其中一案的線索。',
          '先選「確認 ○、排除 ×、清除」，再點配對格；說出座標和理由後按「確認推論」。例如：「第 1 條說小安選牛奶，所以 B1 確認。」',
          '自動整理只在確認一個新標記之後進行：同列同欄排除，以及只剩一格時確認。它不會自行閱讀題目線索；每個自動變化都附理由，並可整批復原。',
          '分組每次確認一個新的正確推論，換組一次、得 1 分；自動衍生幾格都不多計分。重複標記、清除修正與重新填回已處理的格不加分、不換組。',
          '挑戰先選要排除的甲案或乙案，再選一條確實矛盾的線索；說明矛盾後確認，正確推論得 1 分。',
          '提示依序為觀察、具體推論、示範。第 2 級起已取得推論協助，本題往後只作練習、不加分；復原、重玩、切模式或回到本題，都保留協助紀錄。',
          '復原一次會還原整個推論的標記、自動整理、組別、分數、待確認選取、完成狀態及提示階段。已知道的提示不能復原。',
          '重玩、換題、切階段保留累積分數及已計分的推論，避免重複得分；切換合作／分組才重新計分。所有紀錄只保留在這次活動中，沒有倒數時間。',
        ]}
        settings={(
          <div className="space-y-2 text-base">
            <div className="font-bold">推理階段</div>
            <div className="grid grid-cols-3 gap-1">{tiers.map(item => <button key={item} type="button" aria-pressed={tier === item} onClick={() => changeTier(item)} className={`${buttonClass} ${tier === item ? 'border-violet-700 bg-violet-100' : 'border-slate-300 bg-white'}`}>{LOGIC_TIER_LABELS[item]}</button>)}</div>
            <p className="text-slate-700">{puzzle.strategy}。每階段 3 題，最多 4 位人物。</p>
            {!puzzle.candidates && <button type="button" aria-pressed={autoOrganize} onClick={() => setAutoOrganize(value => !value)} className={`${buttonClass} w-full border-violet-300 bg-white`}>自動整理：{autoOrganize ? '開' : '關'}</button>}
            <p className="text-slate-700">切換自動整理不會改盤面；下一次確認才套用。</p>
          </div>
        )}
        sidebar={(
          <div className="space-y-2 text-base leading-snug">
            <div className="font-bold text-violet-950">{puzzle.candidates ? '選一條有矛盾的線索' : '線索・先讀一句，再說理由'}</div>
            <ol className="space-y-1">
              {puzzle.clues.map((clue,index) => {
                const chosen = puzzle.candidates ? session.hypothesis.clue === index : focusedClue === index;
                return <li key={index}><button type="button" disabled={session.finished} aria-label={`線索 ${index+1}：${describeLogicClue(puzzle,clue)}`} aria-pressed={chosen} onClick={() => selectClue(index)} className={`${buttonClass} w-full text-left leading-snug ${chosen ? 'border-violet-700 bg-violet-100 text-violet-950' : 'border-violet-100 bg-violet-50 text-violet-950'}`}>{index+1}. {describeLogicClue(puzzle,clue)}</button></li>;
              })}
            </ol>
            <p className="text-slate-700">提示 {session.hintLevel}／3{assisted && <span className="block font-bold text-amber-900">本題已取得推論協助；重玩仍是練習，不計分。</span>}</p>
            {(session.selection || session.hypothesis.candidate !== null || session.hypothesis.clue !== null) && !session.finished && <button type="button" onClick={() => setSession(clearLogicDraft)} className={`${buttonClass} w-full border-slate-300 bg-white`}>取消選取</button>}
            {session.derived.length > 0 && <details data-logic-derivations="true" className="rounded-xl border border-amber-200 bg-amber-50 p-2">
              <summary className="min-h-11 cursor-pointer font-bold">本次自動整理 {session.derived.length} 格・查看理由</summary>
              <ul className="mt-1 space-y-1">{session.derived.map(step => <li key={`${step.row},${step.col}`}><strong>{logicCoordinate(step.row,step.col)} {markSymbol(step.mark)}</strong>：{step.reason}</li>)}</ul>
              <p className="mt-1">「復原上一步」會連同本次標記整批撤回。</p>
            </details>}
          </div>
        )}
        controls={(
          <div className="space-y-1">
            {puzzle.candidates ? <div data-logic-tools="true" className="grid grid-cols-2 gap-1">{[0,1].map(candidate => <button key={candidate} type="button" disabled={session.finished} aria-pressed={session.hypothesis.candidate === candidate} onClick={() => setSession(state => prepareLogicHypothesis(state,puzzle,candidate,state.hypothesis.clue))} className={`${buttonClass} ${session.hypothesis.candidate === candidate ? 'border-violet-700 bg-violet-100' : 'border-slate-300 bg-white'}`}>排除{candidate === 0 ? '甲' : '乙'}案</button>)}</div> : <div data-logic-tools="true" className="grid grid-cols-3 gap-1">{tools.map(item => <button key={item.value} type="button" disabled={session.finished} aria-pressed={activeTool === item.value} onClick={() => chooseTool(item.value)} className={`${buttonClass} ${activeTool === item.value ? 'border-violet-700 bg-violet-100 text-violet-950' : 'border-slate-300 bg-white'}`}>{item.label}</button>)}</div>}
            <div data-logic-submit="true" className="grid grid-cols-2 gap-1">
              <button type="button" disabled={!ready || session.finished} onClick={() => setSession(state => puzzle.candidates ? confirmLogicHypothesis(state,puzzle) : confirmLogicDecision(state,puzzle,autoOrganize))} className={`${buttonClass} border-emerald-700 bg-emerald-700 text-white`}>確認推論</button>
              <button type="button" onClick={nextPuzzle} title="換到下一題，保留分數與提示紀錄" className={`${buttonClass} border-slate-300 bg-white`}>下一題</button>
            </div>
          </div>
        )}
      >
        <div data-logic-comparison={puzzle.candidates ? (session.finished ? 'complete' : 'active') : undefined} className="detective-presentation my-auto w-full min-w-[300px] max-w-2xl shrink-0 p-1">
            {puzzle.candidates && <div data-logic-candidates="true" className="rounded-xl border border-violet-200 bg-violet-50 p-2">
              <div className="mb-1 font-bold">比較兩個候選配對</div>
              <div className="grid grid-cols-3 gap-x-1 gap-y-1 text-center">
                <span className="font-bold">人物</span><span className="font-bold">甲案</span><span className="font-bold">乙案</span>
                {puzzle.people.map((person,row) => <React.Fragment key={person}><span>{person}</span>{puzzle.candidates!.map((candidate,index) => <span key={index}>{puzzle.choices[candidate[row]]}</span>)}</React.Fragment>)}
              </div>
            </div>}
          <table data-coordinate-grid="true" role="grid" aria-label="人物與選項配對表" className="w-full table-fixed border-separate border-spacing-0.5 text-base">
            <thead><tr><th className="w-20 px-1 text-left font-bold leading-tight">人物／選項</th>{puzzle.choices.map((choice,col) => <th key={choice} scope="col" className="px-1 pb-1 text-center font-bold leading-tight">{String.fromCharCode(65+col)} {choice}</th>)}</tr></thead>
            <tbody>{puzzle.people.map((person,row) => <tr key={person}>
              <th scope="row" className="px-1 text-left font-bold">{row+1} {person}</th>
              {puzzle.choices.map((choice,col) => {
                const mark = session.marks[`${row},${col}`] ?? 'UNKNOWN';
                const selected = session.selection?.row === row && session.selection?.col === col;
                const derived = session.derived.find(step => step.row === row && step.col === col);
                return <td key={choice} role="gridcell" aria-label={logicCoordinate(row,col)} className="p-0">
                  <button type="button" disabled={session.finished || Boolean(puzzle.candidates)} aria-label={`${logicCoordinate(row,col)}，${person}與${choice}，${markName(mark)}${selected ? '，待確認' : ''}`} aria-pressed={selected} title={derived ? `自動整理：${derived.reason}` : undefined}
                    onClick={() => setSession(state => prepareLogicDecision(state,puzzle,{ row,col,mark:activeTool }))}
                    className={`min-h-11 min-w-11 w-full rounded-lg border-2 text-2xl font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 ${selected ? 'ring-4 ring-inset ring-violet-500' : ''} ${mark === 'YES' ? 'border-emerald-700 bg-emerald-100 text-emerald-900' : mark === 'NO' ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-300 bg-white text-slate-500'} ${derived ? 'border-dashed' : ''}`}>{markSymbol(mark)}</button>
                </td>;
              })}
            </tr>)}</tbody>
          </table>
          <div className="mt-1 text-center text-base text-slate-700">{puzzle.ordered ? '由左到右：早 → 晚。' : '每人一項，每項一人。'} ○ 確認 · × 排除{!puzzle.candidates && ' · 紫框待確認'}</div>
        </div>
      </FacilitatedGameFrame>
      {confirmationDialog}
    </div>
  );
};
export default LogicDetectiveGame;
