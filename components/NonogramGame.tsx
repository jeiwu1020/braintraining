import { readFacilitatorKnowledge, saveFacilitatorKnowledge } from '../utils/facilitatorKnowledge';
import React, { useEffect, useState } from 'react';
import type { Difficulty } from '../types';
import { NONOGRAM_PUZZLES } from '../data/nonogramPuzzles';
import { getNonogramClues, type NonogramMark, type NonogramPuzzle, type NonogramTier } from '../utils/nonogramRules';
import { commitNonogramBatch, createNonogramSession, hintNonogram, NONOGRAM_MARK_LABELS, restartNonogram, setNonogramTool, toggleNonogramDraft, undoNonogramBatch } from '../utils/nonogramSession';
import FacilitatedGameFrame from './game-ui/FacilitatedGameFrame';
import { useConfirmAction } from './game-ui/useConfirmAction';

interface Props { onBack: () => void; difficulty?: Difficulty }
const TIERS: Record<NonogramTier, string> = { BEGINNER: '入門：剛好排滿', STANDARD: '標準：重疊與交叉', CHALLENGE: '挑戰：多次交叉' };
const coordinate = (index: number, size: number) => `${String.fromCharCode(65 + index % size)}${Math.floor(index / size) + 1}`;
const buttonClass = 'min-h-11 rounded-lg border-2 px-2 text-base font-bold focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40';

const NonogramGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [puzzle, setPuzzle] = useState(() => NONOGRAM_PUZZLES.find(item => item.tier === (difficulty === 'ADVANCED' ? 'STANDARD' : 'BEGINNER'))!);
  const [session, setSession] = useState(() => ({ ...createNonogramSession(puzzle), revealedIds: readFacilitatorKnowledge('nonogram-v1') }));
  useEffect(() => saveFacilitatorKnowledge('nonogram-v1', session.revealedIds), [session.revealedIds]);
  const size = puzzle.pattern.length;
  const clues = getNonogramClues(puzzle.pattern);
  const tierPuzzles = NONOGRAM_PUZZLES.filter(item => item.tier === puzzle.tier);
  const index = tierPuzzles.findIndex(item => item.id === puzzle.id);
  const draft = Object.entries(session.draft) as Array<[string, NonogramMark]>;
  const hasProgress = Object.keys(session.marks).length > 0 || draft.length > 0 || session.hintDepth > 0 || session.scores.A + session.scores.B > 0;
  const { requestAction, confirmationDialog } = useConfirmAction(hasProgress);
  const changePuzzle = (next: NonogramPuzzle) => {
    if (next.id === puzzle.id) return;
    requestAction(() => { setPuzzle(next); setSession(previous => restartNonogram(previous, next)); }, '換題會清除目前盤面與預選；累積分數及已看答案的紀錄保留。是否繼續？');
  };
  const practice = session.revealedIds.includes(puzzle.id);
  const marked = Object.values(session.marks).filter(mark => mark !== 'UNKNOWN').length;

  return <>
    <FacilitatedGameFrame desktopLayout="nonogram"
      title="數織彩繪" subtitle={`${size}×${size}・${TIERS[puzzle.tier]} ${index + 1}／${tierPuzzles.length}`}
      onBack={onBack} mode={session.mode} onModeChange={mode => setSession(previous => restartNonogram(previous, puzzle, mode))}
      currentTeam={session.team} scores={session.scores} recentAction={session.recent}
      onUndo={() => setSession(undoNonogramBatch)} canUndo={session.history.length > 0}
      onReset={() => setSession(previous => restartNonogram(previous, puzzle))}
      onHint={() => setSession(previous => hintNonogram(previous, puzzle))} hasProgress={hasProgress}
      feedback={session.finished ? `完成圖像：${puzzle.pictureName}。全部填滿與叉號都完成！${practice ? '提示練習，不計分。' : '請一起說出關鍵推理。'}` : undefined}
      rules={[
        '目標：依每列與每欄的數字填出一幅圖像，並確定全部格要填滿或打叉；完成後揭曉圖名和顏色。',
        '數字表示連續填滿的格數，多段之間至少隔一格；0 代表整列或整欄都打叉。',
        '先選「填滿、打叉、清除」，再點選一格或多格。預選還不會改盤面；治療者核對口述後按「確認整批」。',
        '同一組說完一段推理再整批提交，才換組一次；不要把每一次點格當作新回合。可混合填滿與打叉。',
        '口述範例：「第 2 列是 2、2，中間留一格，所以 A2、B2、D2、E2 填滿，C2 打叉。」',
        '入門與標準為 5×5；挑戰含 5×5 與 6×6。從排滿到重疊、多輪交叉；圖像有輪廓，但每格仍需數字依據。',
        '提示逐步提供觀察、推理方向、確定座標。看過第 3 層答案後，本題是提示練習；復原、重開、換模式或重訪都保留紀錄。',
        '分組完成得 1 分，同題不重複計分。復原整批會還原盤面、預選、輪組和分數；重開與換題保留累積分數，換活動模式才清分。分數不是能力或療效評估。',
      ]}
      sidebar={<div className="space-y-2 text-base text-slate-700"><h2 className="font-bold text-slate-900">{puzzle.title}</h2>{session.finished && <p data-nonogram-picture-name="true" className="rounded-xl border-2 p-2 text-xl font-black" style={{ color: puzzle.pictureColor, borderColor: puzzle.pictureColor }}>完成圖像：{puzzle.pictureName}</p>}<p>{puzzle.focus}</p><p>已判斷 {marked}／{size * size} 格</p><p>{practice ? '提示練習：本題不計自主完成分。' : session.credited[puzzle.id] ? '本題已計分，重玩不重複加分。' : '先說理由，再確認整批。'}</p></div>}
      settings={<div className="space-y-2"><label className="block text-base font-bold">推理階段<select aria-label="數織推理階段" className="mt-1 min-h-11 w-full rounded-lg border px-2 text-base" value={puzzle.tier} onChange={event => changePuzzle(NONOGRAM_PUZZLES.find(item => item.tier === event.target.value)!)}>{Object.entries(TIERS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-base font-bold">題目<select aria-label="數織題目" className="mt-1 min-h-11 w-full rounded-lg border px-2 text-base" value={puzzle.id} onChange={event => changePuzzle(tierPuzzles.find(item => item.id === event.target.value)!)}>{tierPuzzles.map((item, i) => <option key={item.id} value={item.id}>{i + 1}．{item.title}</option>)}</select></label></div>}
      controls={<div className="space-y-2"><div className="grid grid-cols-3 gap-2">{(['FILLED', 'CROSSED', 'UNKNOWN'] as NonogramMark[]).map(tool => <button key={tool} type="button" aria-pressed={session.tool === tool} disabled={session.finished} className={`${buttonClass} ${session.tool === tool ? 'border-indigo-700 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white'}`} onClick={() => setSession(previous => setNonogramTool(previous, tool))}>{NONOGRAM_MARK_LABELS[tool]}</button>)}</div><div data-nonogram-draft="true" className="max-h-10 overflow-y-auto text-sm font-semibold" tabIndex={0}>{draft.length ? draft.map(([key, mark]) => `${coordinate(Number(key), size)}${NONOGRAM_MARK_LABELS[mark]}`).join('、') : '先選工具，再選座標。'}</div><div className="grid grid-cols-[1fr_1.5fr_1fr] gap-2"><button type="button" className={`${buttonClass} border-slate-300`} disabled={!draft.length} onClick={() => setSession(previous => ({ ...previous, draft: {}, recent: '已取消本次預選，沒有改盤面或換組。' }))}>取消</button><button type="button" className={`${buttonClass} border-indigo-700 bg-indigo-700 text-white`} disabled={!draft.length || session.finished} onClick={() => { const revision = session.revision; setSession(previous => commitNonogramBatch(previous, puzzle, revision)); }}>確認整批</button><button type="button" className={`${buttonClass} border-slate-300`} onClick={() => changePuzzle(tierPuzzles[(index + 1) % tierPuzzles.length])}>換題</button></div></div>}
    >
      <div data-coordinate-grid="true" role="grid" aria-label="數織座標與相鄰線索" className="grid w-full max-w-[24rem] shrink-0 self-start gap-0.5" style={{ '--nonogram-size': size, gridTemplateColumns: `4rem repeat(${size}, minmax(2.75rem, 1fr))`, gridAutoRows: 'minmax(2.75rem, auto)' } as React.CSSProperties}>
        <div className="flex items-center justify-center text-sm font-bold">列／欄</div>
        {clues.columns.map((clue, col) => <div key={`col-${col}`} role="columnheader" data-nonogram-column-clue={col} className={`flex flex-col items-center justify-center rounded text-base font-bold ${session.hintLine === `COLUMN:${col}` ? 'bg-amber-100' : 'bg-slate-100'}`}><span>{String.fromCharCode(65 + col)}</span><span>{clue.join('、')}</span></div>)}
        {clues.rows.map((clue, row) => <React.Fragment key={row}><div role="rowheader" data-nonogram-row-clue={row} className={`flex items-center justify-center gap-1 rounded text-base font-bold ${session.hintLine === `ROW:${row}` ? 'bg-amber-100' : 'bg-slate-100'}`}><span className="text-slate-500">{row + 1}:</span><span>{clue.join('、')}</span></div>{Array.from({ length: size }, (_, col) => {
          const key = row * size + col; const current = session.marks[key] ?? 'UNKNOWN'; const pending = session.draft[key]; const visible = pending ?? current; const label = coordinate(key, size);
          return <div key={col} role="gridcell" aria-label={label}><button type="button" data-nonogram-cell={key} data-current-mark={current} data-draft-mark={pending} aria-label={`${label}，${pending ? '預選' : ''}${visible === 'UNKNOWN' ? '空白' : NONOGRAM_MARK_LABELS[visible]}`} disabled={session.finished} style={session.finished && visible === 'FILLED' ? { backgroundColor: puzzle.pictureColor } : undefined} className={`h-full min-h-11 w-full min-w-11 rounded border-2 text-2xl font-black focus-visible:ring-4 focus-visible:ring-sky-300 ${pending ? 'border-amber-600 ring-2 ring-inset ring-amber-300' : 'border-slate-300'} ${visible === 'FILLED' ? 'bg-indigo-700 text-white' : 'bg-white text-slate-600'}`} onClick={() => setSession(previous => toggleNonogramDraft(previous, puzzle, key))}>{session.finished ? '' : visible === 'FILLED' ? '■' : visible === 'CROSSED' ? '×' : '·'}</button></div>;
        })}</React.Fragment>)}
      </div>
    </FacilitatedGameFrame>
    {confirmationDialog}
  </>;
};
export default NonogramGame;
