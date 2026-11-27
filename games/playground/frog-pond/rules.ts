import { Level, other, random, shuffled, Team } from "../types";

export interface FrogState {
  level: Level;
  size: number;
  pads: number[]; // 0 = water, 1..3 = lotus count
  frogs: Record<Team, number[]>;
  scores: Record<Team, number>;
  turn: Team;
  ply: number;
  phase: "playing" | "finished";
  result: Team | "tie" | null;
  last: string;
}

export type FrogAction = {
  type: "move";
  frog: number;
  to: number;
};

const DIRS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
] as const;

export function createFrogPond(
  seed: number,
  level: Level = "normal",
  starter: Team = "A",
): FrogState {
  const size = level === "normal" ? 5 : 6;
  const total = size * size;
  const pads = Array<number>(total).fill(1);
  const frogs: Record<Team, number[]> =
    level === "normal"
      ? { A: [6, 18], B: [8, 16] }
      : { A: [7, 16, 26], B: [28, 19, 9] };
  const sunk = level === "normal" ? [] : [14, 21];
  const occupied = new Set([...frogs.A, ...frogs.B, ...sunk]);
  for (const s of sunk) pads[s] = 0;

  // Build rotationally symmetric lotus pairs so both sides have balanced openings
  const pairs: [number, number][] = [];
  const seen = new Set<number>();
  for (let i = 0; i < total; i++) {
    if (occupied.has(i) || seen.has(i)) continue;
    const j = total - 1 - i;
    seen.add(i);
    seen.add(j);
    if (i === j) {
      pads[i] = 3; // center pad on 5x5
    } else {
      pairs.push([i, j]);
    }
  }

  const pairWeights =
    level === "normal"
      ? [1, 1, 1, 1, 2, 2, 2, 2, 3, 3]
      : [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3];
  const assigned = shuffled(pairWeights, seed ^ 0x51a9);
  pairs.forEach(([a, b], idx) => {
    const val = assigned[idx] ?? 1;
    pads[a] = val;
    pads[b] = val;
  });

  return {
    level,
    size,
    pads,
    frogs,
    scores: { A: 0, B: 0 },
    turn: starter,
    ply: 0,
    phase: "playing",
    result: null,
    last: "池塘準備完成，選一隻己方青蛙沿直線跳到荷葉上。",
  };
}

export function occupantAt(state: FrogState, idx: number): Team | null {
  if (state.frogs.A.includes(idx)) return "A";
  if (state.frogs.B.includes(idx)) return "B";
  return null;
}

export function movesFrom(state: FrogState, from: number): number[] {
  const { size, pads } = state;
  const x0 = from % size;
  const y0 = Math.floor(from / size);
  const out: number[] = [];
  for (const [dx, dy] of DIRS) {
    let x = x0 + dx;
    let y = y0 + dy;
    while (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = y * size + x;
      if (pads[idx] === 0 || occupantAt(state, idx) !== null) break;
      out.push(idx);
      x += dx;
      y += dy;
    }
  }
  return out;
}

export function legalMoves(state: FrogState, team: Team = state.turn): FrogAction[] {
  if (state.phase !== "playing") return [];
  const actions: FrogAction[] = [];
  for (const frog of state.frogs[team]) {
    for (const to of movesFrom(state, frog)) {
      actions.push({ type: "move", frog, to });
    }
  }
  return actions;
}

export function frogCoord(idx: number, size: number): string {
  const col = String.fromCharCode(65 + (idx % size));
  const row = Math.floor(idx / size) + 1;
  return `${col}${row}`;
}

export function validFrogAction(a: unknown): a is FrogAction {
  return (
    !!a &&
    typeof a === "object" &&
    (a as FrogAction).type === "move" &&
    Number.isInteger((a as FrogAction).frog) &&
    Number.isInteger((a as FrogAction).to)
  );
}

export function applyFrogPond(state: FrogState, action: FrogAction): FrogState {
  if (state.phase !== "playing") throw new Error("對局已結束");
  if (!validFrogAction(action)) throw new Error("無效動作");
  const { turn, size } = state;
  if (!state.frogs[turn].includes(action.frog)) throw new Error("這不是己方青蛙");
  const legalTargets = movesFrom(state, action.frog);
  if (!legalTargets.includes(action.to)) throw new Error("不能跳到該位置");

  const pads = [...state.pads];
  const gain = pads[action.frog];
  pads[action.frog] = 0;

  const frogs: Record<Team, number[]> = {
    A: [...state.frogs.A],
    B: [...state.frogs.B],
  };
  frogs[turn] = frogs[turn].map((p) => (p === action.frog ? action.to : p));

  const scores: Record<Team, number> = {
    A: state.scores.A + (turn === "A" ? gain : 0),
    B: state.scores.B + (turn === "B" ? gain : 0),
  };

  let next: FrogState = {
    ...state,
    pads,
    frogs,
    scores,
    ply: state.ply + 1,
    last: `${turn}隊青蛙從 ${frogCoord(action.frog, size)} 跳至 ${frogCoord(action.to, size)}，採收 ${gain} 朵蓮花。`,
  };

  const opp = other(turn);
  const oppHasMoves = legalMoves(next, opp).length > 0;
  const selfHasMoves = legalMoves(next, turn).length > 0;

  if (oppHasMoves) {
    next.turn = opp;
    return next;
  }
  if (selfHasMoves) {
    next.turn = turn;
    next.last += ` ${opp}隊已無路可跳，由 ${turn}隊繼續收葉！`;
    return next;
  }

  // Final harvest: collect remaining pads under stranded frogs
  const finalPads = [...next.pads];
  const finalScores = { ...next.scores };
  for (const t of ["A", "B"] as const) {
    for (const pos of next.frogs[t]) {
      finalScores[t] += finalPads[pos];
      finalPads[pos] = 0;
    }
  }
  const result =
    finalScores.A > finalScores.B
      ? "A"
      : finalScores.B > finalScores.A
        ? "B"
        : "tie";
  return {
    ...next,
    pads: finalPads,
    scores: finalScores,
    phase: "finished",
    result,
    last: `${next.last} 雙方皆無路可跳，結算腳下荷葉：A ${finalScores.A} 朵 · B ${finalScores.B} 朵。`,
  };
}
