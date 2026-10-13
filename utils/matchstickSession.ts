import type { MatchstickPuzzle } from '../data/matchstickPuzzles';
import { canTakeMatchstick, createMatchstickBoard, describeMatchstickPosition, getMatchstickPositions, solveMatchstick, validateMatchstickMove, type MatchstickSolution } from './matchstickRules';

export interface MatchstickSnapshot {
  mode: 'COOP' | 'TEAMS'; team: 'A' | 'B'; scores: { A: number; B: number };
  selection: { source: string | null; target: string | null }; hintLevel: number; hintSource: string | null;
  revealed: string[]; found: Array<MatchstickSolution & { assisted: boolean }>;
  finished: boolean; recent: string;
}
export interface MatchstickSession extends MatchstickSnapshot { history: MatchstickSnapshot[] }
const moveKey = (move: { source: string; target: string }) => `${move.source}>${move.target}`;
const initialSelection = (puzzle: MatchstickPuzzle) => ({ source: puzzle.guidedSource ?? null, target: null });
const prompt = (puzzle: MatchstickPuzzle) => puzzle.guidedSource
  ? `已圈出火柴 ${describeMatchstickPosition(createMatchstickBoard(puzzle.equation), puzzle.guidedSource)}。請決定放哪裡。`
  : '請說出拿哪一段、放哪一段；確認前先預測移後的算式。';

export const createMatchstickSession = (puzzle: MatchstickPuzzle, mode: 'COOP' | 'TEAMS' = 'COOP'): MatchstickSession => ({
  mode, team: 'A', scores: { A: 0, B: 0 }, selection: initialSelection(puzzle),
  hintLevel: 0, hintSource: null, revealed: [], found: [], finished: false, recent: prompt(puzzle), history: [],
});

export const chooseMatchstickSource = (state: MatchstickSession, puzzle: MatchstickPuzzle, source: string): MatchstickSession => {
  if (state.finished || (puzzle.guidedSource && source !== puzzle.guidedSource)) return state;
  const board = createMatchstickBoard(puzzle.equation);
  if (!canTakeMatchstick(board, source)) return state;
  return { ...state, selection: { source, target: null }, recent: `拿起 ${describeMatchstickPosition(board, source)}。請選放入的空段。` };
};

export const chooseMatchstickTarget = (state: MatchstickSession, puzzle: MatchstickPuzzle, target: string): MatchstickSession => {
  if (state.finished || !state.selection.source) return state;
  const board = createMatchstickBoard(puzzle.equation);
  if (!getMatchstickPositions(board, 'target').includes(target)) return state;
  return { ...state, selection: { ...state.selection, target }, recent: `預覽：${state.selection.source} → ${describeMatchstickPosition(board, target)}。請先口述變化，再確認整步。` };
};

export const clearMatchstickDraft = (state: MatchstickSession, puzzle: MatchstickPuzzle): MatchstickSession => state.finished ? state : ({
  ...state, selection: initialSelection(puzzle), hintLevel: 0, hintSource: null, recent: '已清除本次選取，還沒換組。' + prompt(puzzle),
});

export const confirmMatchstickMove = (state: MatchstickSession, puzzle: MatchstickPuzzle): MatchstickSession => {
  const { source, target } = state.selection;
  if (state.finished || !source || !target) return state;
  const move = { source, target }; const result = validateMatchstickMove(createMatchstickBoard(puzzle.equation), move);
  if (state.found.some(solution => moveKey(solution) === moveKey(move))) {
    return { ...state, recent: '這個方法已記錄，沒有重複加分或換組。請從原題找另一個不同的移法。' };
  }
  const { history, ...snapshot } = state;
  const next: MatchstickSession = {
    ...state, history: [...history, snapshot], selection: initialSelection(puzzle),
    team: state.mode === 'TEAMS' ? (state.team === 'A' ? 'B' : 'A') : state.team,
  };
  if (!result.valid || !result.equation) {
    const explanation = result.reason === 'SHAPE' ? '有符號不是標準的 0–9 數字或加減號'
      : result.reason === 'EQUATION' ? `${result.equation}，左右兩邊不相等` : '需要拿一根現有火柴，放進一個原本空著的位置';
    return { ...next, recent: `${source} → ${target}：${explanation}。本次已確認，請再討論。` };
  }
  const assisted = state.revealed.includes(moveKey(move));
  const found = [...state.found, { ...move, equation: result.equation, assisted }];
  const scores = state.mode === 'TEAMS' && !assisted ? { ...state.scores, [state.team]: state.scores[state.team] + 1 } : state.scores;
  const finished = found.length >= puzzle.goal;
  return {
    ...next, scores, found, finished, hintLevel: 0, hintSource: null,
    recent: `${state.mode === 'TEAMS' ? `${state.team} 組：` : ''}${source} → ${target}，${result.equation} 成立！${assisted ? '這個方法已揭示，練習不計分。' : ''}${finished ? '本題完成。' : '已記下這一解；回到原題，再找不同的移法。'}`,
  };
};

export const requestMatchstickHint = (state: MatchstickSession, puzzle: MatchstickPuzzle): MatchstickSession => {
  if (state.finished) return state;
  const board = createMatchstickBoard(puzzle.equation);
  const solution = solveMatchstick(board, puzzle.guidedSource).find(move => !state.found.some(found => moveKey(move) === moveKey(found)));
  if (!solution) return state;
  const hintLevel = Math.min(3, state.hintLevel + 1);
  if (hintLevel === 1) return { ...state, hintLevel, recent: `提示 1／3・想一想：${puzzle.observation}` };
  if (hintLevel === 2) return { ...state, hintLevel, hintSource: solution.source, recent: `提示 2／3・來源：觀察 ${describeMatchstickPosition(board, solution.source)}。拿走後是什麼符號？再找放置位置。` };
  return {
    ...state, hintLevel, hintSource: solution.source, selection: { source: solution.source, target: solution.target },
    revealed: state.revealed.includes(moveKey(solution)) ? state.revealed : [...state.revealed, moveKey(solution)],
    recent: `提示 3／3・展示方法：${describeMatchstickPosition(board, solution.source)} → ${describeMatchstickPosition(board, solution.target)}，得到 ${solution.equation}。請驗算後確認；揭示的這一解不計分。`,
  };
};

export const undoMatchstickDecision = (state: MatchstickSession): MatchstickSession => {
  const previous = state.history[state.history.length - 1];
  // A revealed answer is knowledge, not a reversible game action. An earlier
  // snapshot may predate the reveal, so undo must retain both sets of markers.
  return previous ? {
    ...previous, revealed: [...new Set([...previous.revealed, ...state.revealed])],
    history: state.history.slice(0, -1),
  } : state;
};
