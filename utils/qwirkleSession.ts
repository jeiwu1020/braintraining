import { evaluateQwirkleMove, qwirkleTileName, solveQwirklePuzzle, type QwirkleMove, type QwirklePlacedTile, type QwirklePuzzle } from './qwirkleRules';
export type QwirkleMode = 'COOP' | 'TEAMS';
export type QwirkleTeam = 'A' | 'B';
export interface QwirkleSnapshot {
  puzzleId: string; mode: QwirkleMode; team: QwirkleTeam; roundTeam: QwirkleTeam;
  board: QwirklePlacedTile[]; moves: Array<QwirkleMove & { score: number }>;
  selection: { tileId: string | null; targetId: string | null };
  scores: { A: number; B: number }; credits: Record<string, QwirkleTeam>;
  hintLevel: number; hintLevels: Record<string, number>; revealed: string[];
  finished: boolean; outcome: 'SUCCESS' | 'LEGAL_PLAN' | 'DEAD_END' | null; recent: string;
}
export interface QwirkleSession extends QwirkleSnapshot { history: QwirkleSnapshot[] }
const initialSelection = (puzzle: QwirklePuzzle) => ({ tileId: null, targetId: puzzle.tier === 'BEGINNER' ? puzzle.targets[0].id : null });
export const createQwirkleSession = (puzzle: QwirklePuzzle, mode: QwirkleMode = 'COOP'): QwirkleSession => ({
  puzzleId: puzzle.id, mode, team: 'A', roundTeam: 'A', board: puzzle.board.map(item => ({ ...item, tile: { ...item.tile } })), moves: [],
  selection: initialSelection(puzzle), scores: { A: 0, B: 0 }, credits: {}, hintLevel: 0, hintLevels: {}, revealed: [],
  finished: false, outcome: null, recent: '先說棋子和落點，再由治療者確認；選取不換組。', history: [],
});
export const startQwirklePuzzle = (state: QwirkleSession, puzzle: QwirklePuzzle): QwirkleSession => ({
  ...createQwirkleSession(puzzle, state.mode), team: state.team, roundTeam: state.team,
  scores: { ...state.scores }, credits: { ...state.credits }, revealed: [...state.revealed], hintLevels: { ...state.hintLevels }, hintLevel: state.hintLevels[puzzle.id] ?? 0,
  recent: `${state.credits[puzzle.id] ? '本題已有活動分，重玩不重複加分。' : ''}${state.revealed.includes(puzzle.id) ? '本題已揭示，重玩只作練習。' : ''}請先討論本題目標。`,
});
export function resetQwirkleRound(state: QwirkleSession, puzzle: QwirklePuzzle, mode: QwirkleMode = state.mode): QwirkleSession {
  const scores = { ...state.scores }; const credits = { ...state.credits };
  const creditedTeam = credits[puzzle.id];
  if (creditedTeam) { scores[creditedTeam] -= 1; delete credits[puzzle.id]; }
  const changedMode = mode !== state.mode;
  const next = startQwirklePuzzle({ ...state, mode, team: changedMode ? 'A' : state.roundTeam, scores: changedMode ? { A: 0, B: 0 } : scores, credits: changedMode ? {} : credits }, puzzle);
  return { ...next, recent: `已重開本題${changedMode ? '並重設模式與活動分' : '，只取消本題活動分，保留其他題分數'}。${state.revealed.includes(puzzle.id) ? '答案已揭示，仍只作練習。' : '請重新討論。'}` };
}
export const availableQwirkleTiles = (state: QwirkleSession, puzzle: QwirklePuzzle) => state.moves.length === 0 ? puzzle.hand : puzzle.nextTile ? [puzzle.nextTile] : [];
export function selectQwirkleTile(state: QwirkleSession, puzzle: QwirklePuzzle, tileId: string): QwirkleSession {
  const tile = availableQwirkleTiles(state, puzzle).find(item => item.id === tileId);
  if (state.finished || !tile || state.puzzleId !== puzzle.id) return state;
  return { ...state, selection: { ...state.selection, tileId }, recent: `預選棋${tileId === 'next' ? '下一顆' : tileId}：${qwirkleTileName(tile)}。尚未落盤。` };
}
export function selectQwirkleTarget(state: QwirkleSession, puzzle: QwirklePuzzle, targetId: string): QwirkleSession {
  const target = puzzle.targets.find(item => item.id === targetId);
  if (state.finished || !target || state.puzzleId !== puzzle.id || state.board.some(item => item.x === target.x && item.y === target.y)) return state;
  return { ...state, selection: { ...state.selection, targetId }, recent: `預選落點 ${targetId}。請重述棋子與落點後確認。` };
}
export const clearQwirkleDraft = (state: QwirkleSession, puzzle: QwirklePuzzle): QwirkleSession => state.finished ? state : ({
  ...state, selection: state.moves.length ? { tileId: 'next', targetId: null } : initialSelection(puzzle), recent: '已清除本次預選；盤面、組別與提示紀錄不變。',
});
const reasonText = { INVALID: '盤面或棋子資料不符合規則', OCCUPIED: '落點已有棋子', DETACHED: '需要相鄰連接現有棋子', HORIZONTAL: '橫線必須同色異形或同形異色，而且不能重複', VERTICAL: '直線必須同色異形或同形異色，而且不能重複' };
export function confirmQwirkleMove(state: QwirkleSession, puzzle: QwirklePuzzle): QwirkleSession {
  if (state.finished || state.puzzleId !== puzzle.id) return state;
  const tile = availableQwirkleTiles(state, puzzle).find(item => item.id === state.selection.tileId);
  const target = puzzle.targets.find(item => item.id === state.selection.targetId);
  if (!tile || !target) return state;
  const result = evaluateQwirkleMove(state.board, tile, target);
  if (!result.valid) return { ...state, recent: `${reasonText[result.reason!] ?? '這步不合法'}。尚未落盤或換組，請調整選取。` };
  if (puzzle.tier === 'STANDARD' && (result.horizontal < 2 || result.vertical < 2)) return { ...state, recent: '這步合法，但本題目標是同時形成橫、直兩條線。尚未落盤，請另選棋子或落點。' };
  const { history, ...snapshot } = state;
  const board = [...state.board, { ...target, tile }]; const moves = [...state.moves, { tile, target, score: result.score }];
  const next: QwirkleSession = { ...state, board, moves, history: [...history, snapshot], selection: { tileId: puzzle.nextTile && moves.length === 1 ? 'next' : null, targetId: null } };
  const moveText = `${qwirkleTileName(tile)}放 ${target.id}：橫${result.horizontal > 1 ? result.horizontal : 0}顆、直${result.vertical > 1 ? result.vertical : 0}顆，本步${result.score}棋分。`;
  if (puzzle.tier === 'CHALLENGE' && moves.length === 1) {
    const canContinue = puzzle.nextTile && puzzle.targets.some(candidate => evaluateQwirkleMove(board, puzzle.nextTile!, candidate).valid);
    if (canContinue) return { ...next, recent: `${moveText}仍由同一組規劃第 2 步：${qwirkleTileName(puzzle.nextTile!)}。` };
    return { ...next, finished: true, outcome: 'DEAD_END', recent: `${moveText}第一步合法，但公開下一顆已沒有合法落點，本題未走完，本組保留。可復原比較另一個計畫；沒有扣分。` };
  }
  const total = moves.reduce((sum, move) => sum + move.score, 0);
  const best = solveQwirklePuzzle(puzzle)[0]?.score ?? 0;
  const success = puzzle.tier !== 'CHALLENGE' || total === best;
  const assisted = state.revealed.includes(puzzle.id); const credited = Boolean(state.credits[puzzle.id]);
  const award = success && !assisted && !credited;
  const scores = award ? { ...state.scores, [state.roundTeam]: state.scores[state.roundTeam] + 1 } : state.scores;
  return {
    ...next, scores, credits: award ? { ...state.credits, [puzzle.id]: state.roundTeam } : state.credits,
    finished: true, outcome: success ? 'SUCCESS' : 'LEGAL_PLAN', team: state.mode === 'TEAMS' ? (state.team === 'A' ? 'B' : 'A') : state.team,
    recent: `${moveText}${puzzle.tier === 'CHALLENGE' ? `兩步都合法，共${total}棋分；最佳可達${best}棋分。` : '已完成本題目標。'}${assisted ? '本題已揭示，屬提示練習，不加活動分。' : credited ? '本題已記分，不重複加活動分。' : award ? `${state.mode === 'TEAMS' ? `${state.roundTeam}組` : '全體'}活動分 +1。` : '這是合法方案，但還有更高總分；可復原比較，沒有扣分。'}`,
  };
}
export function requestQwirkleHint(state: QwirkleSession, puzzle: QwirklePuzzle): QwirkleSession {
  if (state.finished || state.puzzleId !== puzzle.id) return state;
  const level = Math.min(3, state.hintLevel + 1);
  const next = { ...state, hintLevel: level, hintLevels: { ...state.hintLevels, [puzzle.id]: level } };
  const step = state.moves.length + 1;
  if (level < 3) {
    const text = step === 1 ? puzzle.hints[level - 1] : level === 1 ? `盤面已改變。先找${qwirkleTileName(puzzle.nextTile!)}可接的線。` : '逐一檢查剩餘落點；把這一步棋分加上第一步，再比較總和。';
    return { ...next, recent: `提示 ${level}／3・第 ${step} 步：${text}` };
  }
  const solution = solveQwirklePuzzle(puzzle).find(solution => state.moves.every((move, index) => solution.moves[index]?.tile.id === move.tile.id && solution.moves[index]?.target.id === move.target.id));
  const move = solution?.moves[state.moves.length];
  if (!move) return { ...next, recent: '目前選擇沒有可完成的後續方案，請復原前一步再比較。' };
  const route = solution!.moves.slice(state.moves.length).map((item, index) => `第 ${step + index} 步 ${qwirkleTileName(item.tile)}放 ${item.target.id}`).join('；');
  return { ...next, selection: { tileId: move.tile.id, targetId: move.target.id }, revealed: [...new Set([...state.revealed, puzzle.id])], recent: `提示 3／3・示範：${route}。已預選第 ${step} 步，仍需確認；本題之後只作練習、不計活動分。` };
}
export function undoQwirkleDecision(state: QwirkleSession): QwirkleSession {
  const previous = state.history[state.history.length - 1];
  if (!previous) return state;
  const hintLevels = { ...previous.hintLevels };
  for (const [id, level] of Object.entries(state.hintLevels)) hintLevels[id] = Math.max(hintLevels[id] ?? 0, level);
  return { ...previous, history: state.history.slice(0, -1), revealed: [...new Set([...previous.revealed, ...state.revealed])], hintLevels, hintLevel: hintLevels[state.puzzleId] ?? 0, recent: '已復原整步：盤面、活動分與組別一起回復；看過的提示與答案仍保留。' };
}
