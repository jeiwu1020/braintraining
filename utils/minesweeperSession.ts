import type { GradedMinesweeperPuzzle } from '../data/minesweeperPuzzles';
import { countAdjacentMines, revealMinesweeperRegion } from './facilitatedPuzzleRules';
import { inferMinesweeperStep, mineCells, mineCoordinate, mineNeighbors, mineObservation, type MineInference } from './minesweeperInference';

export type MineTool = 'REVEAL' | 'FLAG' | 'CHORD';
export type MineResult = 'PLAYING' | 'MINE' | 'WON';
export interface MineSnapshot {
  mode: 'COOP' | 'TEAMS'; team: 'A' | 'B'; scores: Record<'A' | 'B', number>;
  puzzle: GradedMinesweeperPuzzle | null; revealed: string[]; flags: string[]; neutralFlags: string[];
  explodedMine: string | null; result: MineResult; tool: MineTool; selection: string[];
  creditedFlags: string[]; hintLevel: number; hintStep: MineInference | null; recent: string;
}
export interface MineSession extends MineSnapshot { history: MineSnapshot[]; exposedPuzzleIds: string[] }
const initialPrompt = '第一次請直接選擇座標，再確認揭開；第一格及周圍八格都安全。';
export const createMineSession = (mode: 'COOP' | 'TEAMS' = 'COOP', exposedPuzzleIds: string[] = []): MineSession => ({
  mode, team: 'A', scores: { A: 0, B: 0 }, puzzle: null, revealed: [], flags: [], neutralFlags: [], explodedMine: null,
  result: 'PLAYING', tool: 'REVEAL', selection: [], creditedFlags: [], hintLevel: 0, hintStep: null, recent: initialPrompt, history: [], exposedPuzzleIds,
});
export const resetMineSession = (state: MineSession, mode = state.mode): MineSession => createMineSession(mode, state.exposedPuzzleIds);
const snapshot = ({ history: _history, exposedPuzzleIds: _knowledge, ...state }: MineSession): MineSnapshot => state;
const expose = (state: MineSession, id: string) => [...new Set([...state.exposedPuzzleIds, id])];

export const selectMineCell = (state: MineSession, key: string): MineSession => {
  if (state.result !== 'PLAYING' || !mineCells(6, 6).includes(key)) return state;
  const selection = !state.puzzle || state.tool === 'CHORD' ? (state.selection[0] === key ? [] : [key])
    : state.selection.includes(key) ? state.selection.filter(cell => cell !== key) : [...state.selection, key];
  return { ...state, selection, recent: selection.length ? `預覽座標：${selection.map(mineCoordinate).join('、')}。請說明理由後確認整批。` : '已取消座標預覽，尚未換組。' };
};

export const confirmMineRound = (state: MineSession, initialPuzzle?: GradedMinesweeperPuzzle): MineSession => {
  if (state.result !== 'PLAYING' || !state.selection.length) return state;
  const puzzle = state.puzzle ?? initialPuzzle;
  if (!puzzle || (!state.puzzle && (state.tool !== 'REVEAL' || state.selection.length !== 1 || state.selection[0] !== puzzle.start))) return state;
  const valid = new Set(mineCells(puzzle.rows, puzzle.columns));
  const selected = [...new Set(state.selection)].filter(key => valid.has(key));
  let revealed = new Set(state.revealed); const flags = new Set(state.flags); const mines = new Set(puzzle.mines);
  let targets = selected; let newFlagContribution = false;
  if (state.tool === 'CHORD') {
    if (selected.length !== 1 || !revealed.has(selected[0])) return { ...state, recent: '連開請選一個已揭開的數字；本次不計分、不換組。' };
    const key = selected[0]; const [row, col] = key.split(',').map(Number); const neighbors = mineNeighbors(key, puzzle.rows, puzzle.columns);
    const count = countAdjacentMines(row, col, mines, puzzle.rows, puzzle.columns);
    if (!count || neighbors.filter(cell => flags.has(cell)).length !== count) return { ...state, recent: '周圍旗數須等於這個數字，才能連開；本次不計分、不換組。' };
    targets = neighbors.filter(cell => !revealed.has(cell) && !flags.has(cell));
  }
  let hit: string | null = null;
  if (state.tool === 'FLAG') {
    targets = targets.filter(key => !revealed.has(key) && !state.neutralFlags.includes(key));
    for (const key of targets) {
      if (flags.has(key)) flags.delete(key);
      else { flags.add(key); if (!state.creditedFlags.includes(key)) newFlagContribution = true; }
    }
  } else {
    targets = targets.filter(key => !revealed.has(key) && !flags.has(key));
    hit = targets.find(key => mines.has(key)) ?? null;
    if (hit) revealed.add(hit);
    else for (const key of targets) revealed = revealMinesweeperRegion(key, mines, revealed, flags, puzzle.rows, puzzle.columns);
  }
  if (!targets.length || (state.tool !== 'FLAG' && revealed.size === state.revealed.length)) return { ...state, recent: '沒有新增揭開或標記；不加分、不換組。請重新選取。' };
  const completed = !hit && [...revealed].filter(key => !mines.has(key)).length === puzzle.rows * puzzle.columns - mines.size;
  const participated = state.tool !== 'FLAG' || newFlagContribution;
  const assisted = state.exposedPuzzleIds.includes(puzzle.id);
  const points = hit ? -1 : participated && !assisted ? 1 : 0;
  const scores = state.mode === 'TEAMS' ? { ...state.scores, [state.team]: state.scores[state.team] + points } : state.scores;
  const nextTeam = state.mode === 'TEAMS' && participated ? (state.team === 'A' ? 'B' : 'A') : state.team;
  const action = hit ? `${mineCoordinate(hit)} 踩到地雷，只公開這一顆。`
    : state.tool === 'FLAG' ? `已處理 ${targets.map(mineCoordinate).join('、')} 的旗幟。旗幟仍是推測，請用數字核對。`
    : `已揭開 ${targets.map(mineCoordinate).join('、')}；連鎖展開合算一回合。`;
  return { ...state, puzzle, revealed: [...revealed], flags: [...flags], result: hit ? 'MINE' : completed ? 'WON' : 'PLAYING', explodedMine: hit,
    scores, team: nextTeam, selection: [], creditedFlags: [...new Set([...state.creditedFlags, ...flags])], hintLevel: 0, hintStep: null,
    history: [...state.history, snapshot(state)], exposedPuzzleIds: hit ? expose(state, puzzle.id) : state.exposedPuzzleIds,
    recent: `${action}${hit ? '繼續後，本盤為提示練習。' : assisted ? '本盤已揭示，提示練習不加分。' : !participated ? '撤旗／重複標記不加分、不換組。' : state.mode === 'TEAMS' ? '整批參與得 1 分。' : ''}${completed ? '所有安全格都已找出！' : ''}` };
};

export const continueMineSession = (state: MineSession): MineSession => {
  if (state.result !== 'MINE' || !state.explodedMine) return state;
  return { ...state, result: 'PLAYING', revealed: state.revealed.filter(key => key !== state.explodedMine), flags: [...new Set([...state.flags, state.explodedMine])],
    neutralFlags: [...new Set([...state.neutralFlags, state.explodedMine])], explodedMine: null, recent: '地雷已由系統插旗。請繼續討論；本盤為提示練習。' };
};
export const undoMineRound = (state: MineSession): MineSession => {
  const previous = state.history.at(-1);
  return previous ? { ...previous, history: state.history.slice(0, -1), exposedPuzzleIds: state.exposedPuzzleIds } : state;
};
export const requestMineHint = (state: MineSession): MineSession => {
  if (state.result !== 'PLAYING') return state;
  if (!state.puzzle) return { ...state, recent: '第一格和周圍八格都安全。先口述任一座標，再按確認揭開。' };
  const puzzle = state.puzzle; const mines = new Set(puzzle.mines); const level = Math.min(3, state.hintLevel + 1);
  let step = inferMinesweeperStep(mineObservation(puzzle, new Set(state.revealed), new Set(state.flags)));
  if (step?.targets.some(key => (step.action === 'FLAG') !== mines.has(key))) step = null;
  if (level === 1) return { ...state, hintLevel: level, hintStep: null, recent: '提示 1／3：先找旗已足數或未知格全是雷的數字；再比較兩圈的共同格，必要時看全盤剩雷。' };
  if (level === 2) return { ...state, hintLevel: level, hintStep: step ? { ...step, targets: [], explanation: '' } : null,
    recent: step ? `提示 2／3：觀察 ${step.clues.map(mineCoordinate).join('、') || '全盤'}${step.technique === 'GLOBAL' ? '與全盤剩雷' : ''}。已圈出相關區域，先口述它們的未知格與剩雷數。` : '提示 2／3：先核對已插的旗與周圍數字；目前沒有可直接說明的下一步。' };
  if (!step) {
    const safe = mineCells(puzzle.rows, puzzle.columns).find(key => !mines.has(key) && !state.revealed.includes(key) && !state.flags.includes(key));
    if (safe) step = { technique: 'GLOBAL', action: 'REVEAL', targets: [safe], clues: [], related: [safe], explanation: `直接協助：${mineCoordinate(safe)} 安全。這是答案揭示，請重新檢查旗幟。` };
  }
  if (!step) return { ...state, hintLevel: level, recent: '請先撤回需要核對的旗幟，讓安全格能被揭開。' };
  return { ...state, hintLevel: level, hintStep: step, selection: step.targets, tool: step.action, exposedPuzzleIds: expose(state, puzzle.id),
    recent: `提示 3／3：${step.explanation}已填入預覽；確認後練習，本盤不再加分。` };
};
