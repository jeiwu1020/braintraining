import { AiDifficulty, other, random, Team } from "../types";
import { applyFrogPond, FrogAction, FrogState, legalMoves } from "./rules";

export interface FrogAiOptions {
  difficulty?: AiDifficulty;
  seed?: number;
}

const DIRS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
] as const;

function reachableLotus(state: FrogState, team: Team): { cells: number; lotuses: number } {
  const { size, pads } = state;
  const visited = new Uint8Array(size * size);
  const queue: number[] = [];
  for (const f of state.frogs[team]) {
    visited[f] = 1;
    queue.push(f);
  }
  let cells = 0;
  let lotuses = 0;
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const x0 = cur % size;
    const y0 = Math.floor(cur / size);
    for (const [dx, dy] of DIRS) {
      const x = x0 + dx;
      const y = y0 + dy;
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const nxt = y * size + x;
      if (visited[nxt] || pads[nxt] === 0) continue;
      const occ = state.frogs.A.includes(nxt) || state.frogs.B.includes(nxt);
      if (occ) continue;
      visited[nxt] = 1;
      cells++;
      lotuses += pads[nxt];
      queue.push(nxt);
    }
  }
  return { cells, lotuses };
}

function evaluateFrog(state: FrogState, perspective: Team): number {
  if (state.phase === "finished") {
    const diff = state.scores[perspective] - state.scores[other(perspective)];
    return diff * 100;
  }
  const opp = other(perspective);
  const scoreDiff = (state.scores[perspective] - state.scores[opp]) * 10;
  const myReach = reachableLotus(state, perspective);
  const oppReach = reachableLotus(state, opp);
  const myMoves = legalMoves(state, perspective).length;
  const oppMoves = legalMoves(state, opp).length;
  return (
    scoreDiff +
    (myReach.lotuses - oppReach.lotuses) * 1.4 +
    (myReach.cells - oppReach.cells) * 0.6 +
    (myMoves - oppMoves) * 0.8
  );
}

function alphabeta(
  state: FrogState,
  depth: number,
  alpha: number,
  beta: number,
  perspective: Team,
): number {
  if (depth === 0 || state.phase === "finished") {
    return evaluateFrog(state, perspective);
  }
  const actions = legalMoves(state, state.turn);
  // Order higher-lotus jumps first
  actions.sort((a, b) => state.pads[b.frog] + state.pads[b.to] - (state.pads[a.frog] + state.pads[a.to]));
  const capped = actions.slice(0, 14);
  const maximizing = state.turn === perspective;
  if (maximizing) {
    let best = -Infinity;
    for (const a of capped) {
      const val = alphabeta(applyFrogPond(state, a), depth - 1, alpha, beta, perspective);
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const a of capped) {
    const val = alphabeta(applyFrogPond(state, a), depth - 1, alpha, beta, perspective);
    if (val < best) best = val;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  return best;
}

export function chooseFrogPond(state: FrogState, options: FrogAiOptions = {}): FrogAction {
  const actions = legalMoves(state, state.turn);
  if (actions.length === 0) throw new Error("無合法動作");
  const diff = options.difficulty ?? (state.level === "normal" ? "standard" : "challenge");
  const rng = random(options.seed ?? state.ply + 17);
  const perspective = state.turn;

  if (diff === "easy") {
    const scored = actions.map((a) => ({
      a,
      v: state.pads[a.frog] * 2 + state.pads[a.to] * 0.7 + rng() * 2.5,
    }));
    scored.sort((x, y) => y.v - x.v);
    return scored[0].a;
  }

  if (diff === "standard") {
    const scored = actions.map((a) => {
      const next = applyFrogPond(state, a);
      const myMoves = legalMoves(next, perspective).length;
      const oppMoves = legalMoves(next, other(perspective)).length;
      const val =
        (next.scores[perspective] - next.scores[other(perspective)]) * 6 +
        next.pads[a.to] * 1.6 +
        (myMoves - oppMoves * 0.6) * 0.5 +
        rng() * 0.3;
      return { a, v: val };
    });
    scored.sort((x, y) => y.v - x.v);
    return scored[0].a;
  }

  // challenge: 2-ply (or 3-ply when few options)
  const depth = actions.length <= 12 ? 3 : 2;
  const ordered = [...actions].sort(
    (a, b) => state.pads[b.frog] + state.pads[b.to] - (state.pads[a.frog] + state.pads[a.to]),
  );
  let bestAction = ordered[0];
  let bestVal = -Infinity;
  for (const a of ordered.slice(0, 18)) {
    const val = alphabeta(applyFrogPond(state, a), depth - 1, -Infinity, Infinity, perspective) + rng() * 0.05;
    if (val > bestVal) {
      bestVal = val;
      bestAction = a;
    }
  }
  return bestAction;
}
