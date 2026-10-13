import type { WordPathPuzzle } from '../data/wordPathPuzzles';
import { validWordPath, wordPathCoordinates, wordPathKey, wordPathText } from './wordPathRules';
export type WordPathMode = 'COOP' | 'TEAMS';
export type WordPathTeam = 'A' | 'B';
export interface WordPathAnswer { word: string; path: number[]; key: string; assisted: boolean }
interface WordPathSnapshot {
  puzzleId: string; mode: WordPathMode; team: WordPathTeam; roundTeam: WordPathTeam;
  path: number[]; found: WordPathAnswer[]; extensions: WordPathAnswer[];
  pending: { word: string; path: number[] } | null;
  scores: Record<WordPathTeam, number>; credits: Record<string, WordPathTeam>;
  turns: number; finished: boolean; recent: string;
}
export interface WordPathKnowledge { level: number; revealed: boolean; text: string }
export interface WordPathSession extends WordPathSnapshot {
  history: WordPathSnapshot[];
  /** Knowledge sits outside undo snapshots and survives every in-session navigation. */
  knowledge: Record<string, WordPathKnowledge>;
}
export const createWordPathSession = (puzzle: WordPathPuzzle, mode: WordPathMode = 'COOP'): WordPathSession => ({
  puzzleId: puzzle.id, mode, team: 'A', roundTeam: 'A', path: [], found: [], extensions: [], pending: null,
  scores: { A: 0, B: 0 }, credits: {}, turns: 0, finished: false,
  recent: '先說完整詞與座標，依序選字後提交；選字不換組。', history: [], knowledge: {},
});
const save = (state: WordPathSession): WordPathSnapshot[] => {
  const { history, knowledge: _knowledge, ...snapshot } = state;
  return [...history, snapshot];
};
const finishTurn = (state: WordPathSession): WordPathSession => ({
  ...state, path: [], pending: null, turns: state.turns + 1,
  team: state.mode === 'TEAMS' ? (state.team === 'A' ? 'B' : 'A') : state.team,
});
const addCredit = (state: WordPathSession, key: string): WordPathSession => {
  if (state.knowledge[state.puzzleId]?.revealed || state.credits[key]) return state;
  return { ...state, scores: { ...state.scores, [state.team]: state.scores[state.team] + 1 }, credits: { ...state.credits, [key]: state.team } };
};
const pointMessage = (state: WordPathSession, key: string): string => state.knowledge[state.puzzleId]?.revealed
  ? '本題已揭示，這次只作練習，不加分。'
  : state.credits[key] ? '這個答案本次活動已計分，不重複加分。' : `${state.mode === 'TEAMS' ? `${state.team} 組` : '合作'} +1 分。`;
export function selectWordPathCell(state: WordPathSession, puzzle: WordPathPuzzle, cell: number): WordPathSession {
  if (state.finished || state.pending || state.puzzleId !== puzzle.id) return state;
  if (state.path.at(-1) === cell) return { ...state, path: state.path.slice(0, -1), history: save(state), recent: '已移除最後一格，尚未提交或換組。' };
  const path = [...state.path, cell];
  if (!validWordPath(path, puzzle)) return { ...state, recent: '下一格須上下左右相鄰；同一詞不可重用字格。原路徑保留。' };
  return { ...state, path, history: save(state), recent: `目前路徑：${wordPathText(path, puzzle)}。尚未提交。` };
}
export function clearWordPath(state: WordPathSession): WordPathSession {
  if (state.finished || state.pending || !state.path.length) return state;
  return { ...state, path: [], history: save(state), recent: '已清除本次路徑，組別與分數不變。' };
}
export function submitWordPath(state: WordPathSession, puzzle: WordPathPuzzle): WordPathSession {
  if (state.finished || state.pending || state.puzzleId !== puzzle.id) return state;
  if (state.path.length < 2 || !validWordPath(state.path, puzzle)) return { ...state, recent: '詞語至少需要兩個字，請完成合法路徑再提交。' };
  const word = wordPathText(state.path, puzzle); const key = wordPathKey(puzzle, word, state.path);
  const isTarget = puzzle.targets.some(target => target.word === word);
  const duplicate = isTarget ? state.found.some(answer => answer.key === key) : state.extensions.some(answer => answer.word === word);
  const next = { ...state, history: save(state) };
  if (duplicate) return finishTurn({ ...next, recent: `「${word}」${puzzle.goal === 'TWO_PATHS' && isTarget ? '的這條路徑' : ''}已找過，本回合不重複得分。` });
  if (!isTarget) return { ...next, pending: { word, path: [...state.path] }, recent: `「${word}」不是本題目標。請治療者確認詞義；決定後才結算這一回合。` };
  const answer: WordPathAnswer = { word, path: [...state.path], key, assisted: Boolean(state.knowledge[puzzle.id]?.revealed) };
  const found = [...state.found, answer];
  return finishTurn(addCredit({ ...next, found, finished: found.length >= puzzle.required, recent: `找到「${word}」${puzzle.goal === 'TWO_PATHS' ? `第 ${found.length} 條路徑` : ''}。${pointMessage(state, key)}${found.length >= puzzle.required ? '已完成本題目標。' : ''}` }, key));
}
export function reviewWordPath(state: WordPathSession, puzzle: WordPathPuzzle, accepted: boolean): WordPathSession {
  if (!state.pending || state.finished || state.puzzleId !== puzzle.id) return state;
  const { word, path } = state.pending;
  // Extensions always deduplicate by word, even in the two-path challenge.
  const key = `${puzzle.id}::extension::${word}`;
  const next = { ...state, history: save(state) };
  if (!accepted) return finishTurn({ ...next, recent: `治療者判定「${word}」本次不採計；本回合 0 分。` });
  const extension: WordPathAnswer = { word, path: [...path], key, assisted: Boolean(state.knowledge[puzzle.id]?.revealed) };
  return finishTurn(addCredit({ ...next, extensions: [...state.extensions, extension], recent: `接受延伸詞「${word}」，不增加目標進度。${pointMessage(state, key)}` }, key));
}
export function undoWordPath(state: WordPathSession): WordPathSession {
  const previous = state.history.at(-1);
  if (!previous) return state;
  return { ...previous, history: state.history.slice(0, -1), knowledge: state.knowledge, recent: '已復原路徑、待審詞、完成狀態、組別與分數；看過的提示仍保留。' };
}
export function startWordPathPuzzle(state: WordPathSession, puzzle: WordPathPuzzle): WordPathSession {
  return { ...createWordPathSession(puzzle, state.mode), team: state.team, roundTeam: state.team, scores: { ...state.scores }, credits: { ...state.credits }, knowledge: state.knowledge,
    recent: `${state.knowledge[puzzle.id]?.revealed ? '本題曾揭示答案，仍只作練習、不加分。' : ''}先看本題目標，再提出完整詞與路徑。` };
}
export function resetWordPathPuzzle(state: WordPathSession, puzzle: WordPathPuzzle, mode: WordPathMode = state.mode): WordPathSession {
  const scores = { ...state.scores }; const credits = { ...state.credits };
  for (const [key, team] of Object.entries(credits)) if (key.startsWith(`${puzzle.id}::`)) { scores[team] -= 1; delete credits[key]; }
  const changedMode = mode !== state.mode;
  const next = startWordPathPuzzle({ ...state, mode, scores: changedMode ? { A: 0, B: 0 } : scores, credits: changedMode ? {} : credits, team: changedMode ? 'A' : state.roundTeam }, puzzle);
  return { ...next, recent: `已重開本題${changedMode ? '並清除活動分數' : '並取消本題分數，其他題分數保留'}。${next.knowledge[puzzle.id]?.revealed ? '已揭示的答案仍只作練習。' : '請重新討論。'}` };
}
export function hintWordPath(state: WordPathSession, puzzle: WordPathPuzzle): WordPathSession {
  if (state.finished || state.pending || state.puzzleId !== puzzle.id) return state;
  const level = Math.min(3, (state.knowledge[puzzle.id]?.level ?? 0) + 1);
  const target = puzzle.targets.find(item => item.paths.some(path => !state.found.some(answer => answer.key === wordPathKey(puzzle, item.word, path))));
  if (!target) return state;
  const path = target.paths.find(candidate => !state.found.some(answer => answer.key === wordPathKey(puzzle, target.word, candidate)))!;
  const text = level === 1
    ? puzzle.goal === 'TWO_PATHS' ? '先比較盤面重複的字：第二條路可以共用字格，但完整座標順序須不同。' : puzzle.tier === 'STANDARD' ? '先把語意線索說成四字詞，再找起點；路徑可以逆向，也可以轉彎。' : '先找目標的第一個字，再看它上下左右是否有第二個字。'
    : level === 2 ? `答案提示：「${target.word}」，從 ${wordPathCoordinates([path[0]], puzzle)} 開始。` : `路徑示範：「${target.word}」，${wordPathCoordinates(path, puzzle)}。`;
  const revealed = level >= 2 || Boolean(state.knowledge[puzzle.id]?.revealed);
  const message = `提示 ${level}／3：${text}${revealed ? '本題已揭示，後續只作練習、不加分。' : '這一級只給找路方法；下一級會揭示答案，之後不加分。'}`;
  return { ...state, knowledge: { ...state.knowledge, [puzzle.id]: { level, revealed, text: message } }, recent: message };
}
