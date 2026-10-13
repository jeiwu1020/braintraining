import type { WordPathSession } from '../utils/wordPathSession';
import { readFacilitatorKnowledge, saveFacilitatorKnowledge } from '../utils/facilitatorKnowledge';
import React, { useEffect, useState } from 'react';
import type { Difficulty } from '../types';
import { WORD_PATH_BANK, type WordPathTier } from '../data/wordPathPuzzles';
import { wordPathCoordinates, wordPathText } from '../utils/wordPathRules';
import { clearWordPath, createWordPathSession, hintWordPath, resetWordPathPuzzle, reviewWordPath, selectWordPathCell, startWordPathPuzzle, submitWordPath, undoWordPath } from '../utils/wordPathSession';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame from './game-ui/FacilitatedGameFrame';
import { useConfirmAction } from './game-ui/useConfirmAction';

export { WORD_PATH_BANK } from '../data/wordPathPuzzles';
export const COMMON_WORDS = new Set([
  '春天', '春暖', '天花', '花開', '開學', '快樂', '樂天', '樂學', '學習', '學生',
  '健康', '康健', '康樂', '安康', '生活', '平安', '朋友', '開心', '心情', '專心',
  '好學', '互相', '相助', '幫助', '助學', '暖心', '愛心', '安心', '用心', '熱心',
]);
// Compatibility fixture for callers of the original two difficulty exports.
export const WORD_PATH_PUZZLES = {
  NORMAL: {
    columns: 4,
    grid: ['春', '天', '開', '花', '樂', '學', '健', '生', '快', '習', '康', '活', '安', '平', '朋', '友'],
    words: ['春天', '花開', '快樂', '學習', '健康', '生活', '平安', '朋友'],
    paths: [[0, 1], [3, 2], [8, 4], [5, 9], [6, 10], [7, 11], [13, 12], [14, 15]],
  },
  ADVANCED: {
    columns: 5,
    grid: ['春', '暖', '花', '活', '健', '專', '心', '開', '生', '康', '習', '學', '助', '情', '心', '樂', '好', '幫', '相', '互'],
    words: ['春暖花開', '健康生活', '專心學習', '互相幫助', '開心', '心情'],
    paths: [[0, 1, 2, 7], [4, 9, 8, 3], [5, 6, 11, 10], [19, 18, 17, 12], [7, 6], [14, 13]],
  },
} as const;

const TIERS: Array<{ value: WordPathTier; label: string }> = [
  { value: 'BEGINNER', label: '入門・看詞找路' }, { value: 'STANDARD', label: '標準・語意找詞' }, { value: 'CHALLENGE', label: '挑戰・同詞兩路' },
];
const buttonClass = 'min-h-11 min-w-11 rounded-xl border-2 px-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 disabled:opacity-40';
interface Props { onBack: () => void; difficulty?: Difficulty }

const WordPathGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [tier, setTier] = useState<WordPathTier>(difficulty === 'NORMAL' ? 'BEGINNER' : 'STANDARD');
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzles = WORD_PATH_BANK.filter(item => item.tier === tier);
  const puzzle = puzzles[puzzleIndex % puzzles.length];
  const [session, setSession] = useState<WordPathSession>(() => ({ ...createWordPathSession(puzzle), knowledge: Object.fromEntries(readFacilitatorKnowledge('word-path-v1').map(id => [id, { level: 3, revealed: true, text: '本題先前已揭示答案，仍只作提示練習，不加分。' }])) }));
  useEffect(() => saveFacilitatorKnowledge('word-path-v1', Object.keys(session.knowledge).filter(id => session.knowledge[id].revealed)), [session.knowledge]);
  const knowledge = session.knowledge[puzzle.id];
  const hasProgress = Boolean(session.path.length || session.pending || session.history.length || session.turns || knowledge || session.scores.A || session.scores.B);
  const { requestAction, confirmationDialog } = useConfirmAction(hasProgress);
  const blocked = session.finished || Boolean(session.pending);
  const goal = puzzle.goal === 'TWO_PATHS' ? `「${puzzle.targets[0].word}」：找出兩條不同路徑。`
    : tier === 'BEGINNER' ? `找齊 ${puzzle.required} 個目標詞，完成本題。` : `依語意找齊 ${puzzle.required} 個四字詞，完成本題。`;
  const nextPuzzle = () => {
    const next = (puzzleIndex + 1) % puzzles.length;
    const apply = () => { setPuzzleIndex(next); setSession(state => startWordPathPuzzle(state, puzzles[next])); };
    if (session.finished) apply();
    else requestAction(apply, '換題會清除目前路徑、待審詞與本題進度；累積分數與已看過的提示保留。要換題嗎？');
  };
  const changeTier = (nextTier: WordPathTier) => {
    if (nextTier === tier) return;
    requestAction(() => {
      const next = WORD_PATH_BANK.find(item => item.tier === nextTier)!;
      setTier(nextTier); setPuzzleIndex(0); setSession(state => startWordPathPuzzle(state, next));
    }, '切換階段會清除目前路徑、待審詞與本題進度；累積分數與已看過的提示保留。要切換嗎？');
  };

  return (
    <>
      <FacilitatedGameFrame desktopLayout="word-path"
        title="字詞路徑"
        subtitle={`${TIERS.find(item => item.value === tier)!.label}｜${puzzleIndex + 1}/${puzzles.length} 題`}
        onBack={onBack}
        mode={session.mode}
        onModeChange={mode => setSession(state => resetWordPathPuzzle(state, puzzle, mode))}
        currentTeam={session.team}
        scores={session.scores}
        recentAction={session.recent}
        onUndo={() => setSession(undoWordPath)}
        onReset={() => setSession(state => resetWordPathPuzzle(state, puzzle))}
        onHint={() => setSession(state => hintWordPath(state, puzzle))}
        canUndo={session.history.length > 0}
        hasProgress={hasProgress}
        feedback={session.finished ? `完成！${puzzle.goal === 'TWO_PATHS' ? '已找到同一詞的兩條不同路徑。' : '所有目標詞都已找到。'}${knowledge?.revealed ? '本題含提示練習。' : ''}` : undefined}
        rules={[
          '先說完整詞與每個字的座標，治療者依序選字，再按「提交詞語」。選字、取消末格、清除路徑都不換組。',
          '只能走上、下、左、右的相鄰格，不走斜線；同一詞不可重用同一格。點最後一格可取消該格。',
          '入門找齊明列的雙字詞；標準從語意線索想出四字詞；挑戰要為同一詞找到兩條座標順序不同的合法路徑。不同路徑可共用部分字格。',
          '每次完整詞提交結算一回合。非目標詞須由治療者接受或不採計，決定後才換組，提交和審核合計只算一回合。',
          '新目標或治療者接受的延伸詞得 1 活動分。延伸詞不增加目標進度，沒有由程式自動判斷詞義；重複詞不重複得分，挑戰的目標則以不同路徑計算。',
          '第一級提示只給找路方法；第二級揭示詞與起點，第三級顯示完整座標。本題一旦揭示答案，後續提交只作練習，不加分；復原、重開、換題再回來也保留紀錄。',
          '復原會一起恢復路徑、待審詞、進度、組別及分數。換題保留累積分數且同一答案不重複計分；重開只取消本題分數，切換合作／分組則清除所有活動分。',
          '口述範例：「春天，A1 到 B1。」另一人先核對字順和相鄰位置，再提交。',
        ]}
        sidebar={(
          <div className="space-y-2 text-base leading-snug">
            <div data-word-path-targets="true" className="rounded-xl bg-emerald-50 p-2 text-emerald-950">
              <p className="mb-1 font-black">{tier === 'STANDARD' ? '語意線索・每詞四字' : '本題目標'}</p>
              <ol className="space-y-2">
                {puzzle.targets.map((target, index) => {
                  const found = session.found.filter(answer => answer.word === target.word);
                  return <li key={target.word}>
                    <span className="font-bold">{index + 1}. {tier === 'STANDARD' && !found.length ? target.clue : target.word}</span>
                    {found.length > 0 && <span className="ml-1 text-sm">{puzzle.goal === 'TWO_PATHS' ? `已找到 ${found.length}/2 路` : '已找到'}</span>}
                    {tier === 'STANDARD' && found.length > 0 && <p className="mt-1 text-sm">{target.rationale}</p>}
                  </li>;
                })}
              </ol>
            </div>
            <details data-word-path-history="true" className="rounded-xl border border-slate-200 p-2"><summary className="min-h-11 cursor-pointer font-bold">已找到與延伸詞紀錄</summary>
            {session.found.length > 0 && <div data-word-path-found="true" className="rounded-xl bg-indigo-50 p-2 text-indigo-950">
              <p className="font-black">已找到的路徑</p>
              {session.found.map(answer => <p key={answer.key} className="mt-1 text-sm"><strong>{answer.word}{answer.assisted ? '・提示練習' : ''}</strong><br />{wordPathCoordinates(answer.path, puzzle)}</p>)}
            </div>}
            <div className="rounded-xl bg-sky-50 p-2 text-sm text-sky-950"><strong>延伸詞，不計入目標：</strong>{session.extensions.length ? session.extensions.map(answer => `${answer.word}${answer.assisted ? '（提示練習）' : ''}`).join('、') : '尚無'}<p className="mt-1">接受的延伸詞可得活動分，須由治療者確認詞義。</p></div>
            </details>
            {knowledge && <p className="rounded-xl bg-amber-50 p-2 text-sm text-amber-950">{knowledge.text}</p>}
            <p className="text-sm text-slate-700">已結算 {session.turns} 回合{session.mode === 'COOP' ? `・合作累積 ${session.scores.A + session.scores.B} 分` : ''}</p>
          </div>
        )}
        settings={(
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">選擇階段
              <select aria-label="字詞路徑階段" value={tier} onChange={event => changeTier(event.target.value as WordPathTier)} className="mt-1 min-h-11 w-full rounded-lg border-2 border-slate-300 bg-white px-2 text-base">
                {TIERS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <button type="button" onClick={nextPuzzle} className={`${buttonClass} w-full border-slate-300 bg-white text-slate-800`}>下一題</button>
            <p className="text-sm text-slate-600">每階 3 題循環。換題保留累積分；同一答案不重複加分。重開取消本題分數；切換活動模式清除全部分數。</p>
          </div>
        )}
        controls={(
          <div className="space-y-1">
            <div data-word-path-draft="true" className="max-h-16 overflow-y-auto rounded-lg bg-indigo-50 px-2 py-1 text-sm font-bold text-indigo-950">
              {session.path.length ? <><span className="text-base">{wordPathText(session.path, puzzle)}</span><span className="ml-2">{wordPathCoordinates(session.path, puzzle)}</span></> : '請依序選字，先說完整詞再提交'}
            </div>
            {session.pending ? <>
              <p className="text-sm font-bold text-amber-950">「{session.pending.word}」詞義通順嗎？屬延伸詞。</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setSession(state => reviewWordPath(state, puzzle, true))} className={`${buttonClass} border-emerald-700 bg-emerald-700 text-white`}>接受延伸詞</button>
                <button type="button" onClick={() => setSession(state => reviewWordPath(state, puzzle, false))} className={`${buttonClass} border-slate-500 bg-white text-slate-800`}>不採計</button>
              </div>
            </> : <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSession(state => submitWordPath(state, puzzle))} disabled={session.path.length < 2 || blocked} className={`${buttonClass} border-emerald-700 bg-emerald-700 text-white`}>提交詞語</button>
              <button type="button" onClick={() => setSession(clearWordPath)} disabled={!session.path.length || blocked} className={`${buttonClass} border-slate-300 bg-white text-slate-800`}>清除路徑</button>
            </div>}
            {session.finished && <button type="button" onClick={nextPuzzle} className={`${buttonClass} w-full border-indigo-700 bg-indigo-700 text-white`}>完成，換下一題</button>}
          </div>
        )}
      >
        <div data-word-path-puzzle={puzzle.id} className="flex w-full max-w-[30rem] flex-col gap-1 self-start">
          <div className="rounded-lg bg-slate-50 px-2 py-1 text-center text-sm text-slate-800">
            <p data-word-path-goal="true" className="font-bold">{goal}</p>
            <p data-word-path-progress="true" className="font-black">{puzzle.title}・目標 {session.found.length}/{puzzle.required}{puzzle.goal === 'TWO_PATHS' ? ' 路' : ' 詞'}</p>
            {knowledge?.revealed && <p data-word-path-assistance="true" className="font-bold text-amber-900">答案已揭示・後續只作練習，不加分</p>}
          </div>
          <CoordinateGrid rows={4} columns={puzzle.columns} className="w-full" renderCell={(row, col, coordinate) => {
            const index = row * puzzle.columns + col; const order = session.path.indexOf(index);
            return <button type="button" data-word-path-cell={index} aria-label={`${coordinate}，${puzzle.grid[index]}${order >= 0 ? `，路徑第 ${order + 1} 格` : ''}`} aria-pressed={order >= 0} disabled={blocked}
              onClick={() => setSession(state => selectWordPathCell(state, puzzle, index))}
              className={`relative min-h-11 min-w-11 h-full w-full rounded-lg border-2 text-2xl font-black shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${order >= 0 ? 'border-indigo-800 bg-indigo-600 text-white' : 'border-emerald-300 bg-emerald-50 text-emerald-950'}`}>
              {puzzle.grid[index]}{order >= 0 && <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-amber-300 text-xs text-slate-900">{order + 1}</span>}
            </button>;
          }} />
        </div>
      </FacilitatedGameFrame>
      {confirmationDialog}
    </>
  );
};
export default WordPathGame;
