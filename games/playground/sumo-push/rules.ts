import { Level, other, Team } from "../types";

export type CellPiece = Team | "C" | null; // C = neutral crate (advanced)
export type PushDir = "up" | "down" | "left" | "right";

export const DIR_DELTA: Record<PushDir, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export const DIR_LABELS: Record<PushDir, string> = {
  up: "向上推",
  down: "向下推",
  left: "向左推",
  right: "向右推",
};

export interface SumoState {
  level: Level;
  size: number;
  goal: number;
  board: CellPiece[];
  pushedOut: Record<Team, number>; // opponent pieces pushed off by each team
  turn: Team;
  ply: number;
  phase: "playing" | "finished";
  result: Team | "tie" | null;
  last: string;
}

export type SumoAction = {
  type: "push";
  from: number;
  dir: PushDir;
};

export function createSumoPush(
  _seed: number,
  level: Level = "normal",
  starter: Team = "A",
): SumoState {
  const size = level === "normal" ? 5 : 6;
  const board = Array<CellPiece>(size * size).fill(null);
  if (level === "normal") {
    for (const i of [16, 17, 18, 21, 22, 23]) board[i] = "A";
    for (const i of [1, 2, 3, 6, 7, 8]) board[i] = "B";
  } else {
    for (const i of [25, 26, 27, 28, 31, 32, 33, 34]) board[i] = "A";
    for (const i of [1, 2, 3, 4, 7, 8, 9, 10]) board[i] = "B";
    board[14] = "C";
    board[21] = "C";
  }
  return {
    level,
    size,
    goal: level === "normal" ? 3 : 4,
    board,
    pushedOut: { A: 0, B: 0 },
    turn: starter,
    ply: 0,
    phase: "playing",
    result: null,
    last: `擂台開戰！人多推得動人少（2 推 1／3 推 2），先推落對方 ${level === "normal" ? 3 : 4} 枚獲勝。`,
  };
}

export interface PushPreview {
  ownCells: number[];
  rivalCells: number[];
  pushedOff: CellPiece;
}

export function inspectPush(
  state: SumoState,
  from: number,
  dir: PushDir,
): PushPreview | null {
  const { size, board, turn } = state;
  if (from < 0 || from >= size * size || board[from] !== turn) return null;
  const [dx, dy] = DIR_DELTA[dir];
  const step = (idx: number): number | null => {
    const x = (idx % size) + dx;
    const y = Math.floor(idx / size) + dy;
    if (x < 0 || x >= size || y < 0 || y >= size) return null;
    return y * size + x;
  };

  const ownCells: number[] = [from];
  let cur: number | null = step(from);
  while (cur !== null && board[cur] === turn) {
    ownCells.push(cur);
    if (ownCells.length > 3) return null;
    cur = step(cur);
  }
  // Cannot push own piece off the arena edge
  if (cur === null) return null;

  if (board[cur] === null) {
    return { ownCells, rivalCells: [], pushedOff: null };
  }

  // Enemy or crate resistance
  const rivalCells: number[] = [];
  while (cur !== null && board[cur] !== null) {
    if (board[cur] === turn) return null; // Sandwich with own piece in front is illegal
    rivalCells.push(cur);
    cur = step(cur);
  }
  if (ownCells.length <= rivalCells.length) return null;
  const pushedOff = cur === null ? board[rivalCells[rivalCells.length - 1]] : null;
  return { ownCells, rivalCells, pushedOff };
}

export function legalSumoActions(state: SumoState, team: Team = state.turn): SumoAction[] {
  if (state.phase !== "playing") return [];
  const view = state.turn === team ? state : { ...state, turn: team };
  const actions: SumoAction[] = [];
  const dirs: PushDir[] = ["up", "down", "left", "right"];
  for (let i = 0; i < state.board.length; i++) {
    if (state.board[i] !== team) continue;
    for (const dir of dirs) {
      if (inspectPush(view, i, dir)) actions.push({ type: "push", from: i, dir });
    }
  }
  return actions;
}

export function sumoCoord(idx: number, size: number): string {
  return `${String.fromCharCode(65 + (idx % size))}${Math.floor(idx / size) + 1}`;
}

export function validSumoAction(a: unknown): a is SumoAction {
  if (!a || typeof a !== "object") return false;
  const x = a as SumoAction;
  return (
    x.type === "push" &&
    Number.isInteger(x.from) &&
    x.from >= 0 &&
    x.from < 36 &&
    ["up", "down", "left", "right"].includes(x.dir)
  );
}

export function applySumoPush(state: SumoState, action: SumoAction): SumoState {
  if (state.phase !== "playing") throw new Error("對局已結束");
  if (!validSumoAction(action)) throw new Error("無效推擠操作");
  const preview = inspectPush(state, action.from, action.dir);
  if (!preview) throw new Error("無法往此方向推動（需人多推人少且不可自墜）");

  const { size, turn } = state;
  const [dx, dy] = DIR_DELTA[action.dir];
  const board = [...state.board];
  const chain = [...preview.ownCells, ...preview.rivalCells];
  // Move from front to back
  for (let i = chain.length - 1; i >= 0; i--) {
    const src = chain[i];
    const x = (src % size) + dx;
    const y = Math.floor(src / size) + dy;
    const piece = board[src];
    board[src] = null;
    if (x >= 0 && x < size && y >= 0 && y < size) {
      board[y * size + x] = piece;
    }
  }

  const opp = other(turn);
  const scoredOut = preview.pushedOff === opp ? 1 : 0;
  const pushedOut: Record<Team, number> = {
    A: state.pushedOut.A + (turn === "A" ? scoredOut : 0),
    B: state.pushedOut.B + (turn === "B" ? scoredOut : 0),
  };

  let msg = `${turn}隊從 ${sumoCoord(action.from, size)} ${DIR_LABELS[action.dir]}（${preview.ownCells.length} 枚${preview.rivalCells.length ? `推 ${preview.rivalCells.length} 枚` : "推進"}）`;
  if (scoredOut) msg += `，將對手推出擂台！`;
  else if (preview.pushedOff === "C") msg += `，將木箱推離擂台！`;
  else msg += `。`;

  const next: SumoState = {
    ...state,
    board,
    pushedOut,
    turn: opp,
    ply: state.ply + 1,
    last: msg,
  };

  if (pushedOut[turn] >= state.goal) {
    return {
      ...next,
      phase: "finished",
      result: turn,
      last: `${msg} ${turn}隊率先推落 ${state.goal} 枚棋子獲勝！`,
    };
  }
  if (legalSumoActions(next, opp).length === 0) {
    return {
      ...next,
      phase: "finished",
      result: turn,
      last: `${msg} ${opp}隊已無合法推動，${turn}隊獲勝！`,
    };
  }
  if (next.ply >= 50) {
    const result =
      pushedOut.A > pushedOut.B ? "A" : pushedOut.B > pushedOut.A ? "B" : "tie";
    return {
      ...next,
      phase: "finished",
      result,
      last: `${msg} 50 手時間到：A 推落 ${pushedOut.A} 枚 · B 推落 ${pushedOut.B} 枚。`,
    };
  }
  return next;
}
