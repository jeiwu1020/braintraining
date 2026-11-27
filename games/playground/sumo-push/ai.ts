import { AiDifficulty, other, random, Team } from "../types";
import { applySumoPush, inspectPush, legalSumoActions, SumoAction, SumoState } from "./rules";

export interface SumoAiOptions {
  difficulty?: AiDifficulty;
  seed?: number;
}

function evaluateSumo(state: SumoState, perspective: Team): number {
  const opp = other(perspective);
  if (state.phase === "finished") {
    if (state.result === perspective) return 10000;
    if (state.result === opp) return -10000;
    return 0;
  }
  const { size, board } = state;
  const mid = (size - 1) / 2;
  let score = (state.pushedOut[perspective] - state.pushedOut[opp]) * 180;
  for (let i = 0; i < board.length; i++) {
    const p = board[i];
    if (p !== perspective && p !== opp) continue;
    const x = i % size;
    const y = Math.floor(i / size);
    const dist = Math.abs(x - mid) + Math.abs(y - mid);
    const isEdge = x === 0 || x === size - 1 || y === 0 || y === size - 1;
    const centrality = (size - dist) * 4 - (isEdge ? 14 : 0);
    // Neighbor cohesion bonus (aligned formation)
    let allies = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny * size + nx] === p) allies++;
    }
    const val = centrality + allies * 3;
    score += p === perspective ? val : -val;
  }
  return score;
}

export function chooseSumoPush(state: SumoState, options: SumoAiOptions = {}): SumoAction {
  const actions = legalSumoActions(state, state.turn);
  if (actions.length === 0) throw new Error("無合法動作");
  const diff = options.difficulty ?? (state.level === "normal" ? "standard" : "challenge");
  const rng = random(options.seed ?? state.ply + 53);
  const perspective = state.turn;
  const opp = other(perspective);

  if (diff === "easy") {
    const scored = actions.map((a) => {
      const prev = inspectPush(state, a.from, a.dir)!;
      const ringBonus = prev.pushedOff === opp ? 30 : prev.rivalCells.length * 4;
      return { a, v: ringBonus + rng() * 14 };
    });
    scored.sort((x, y) => y.v - x.v);
    return scored[0].a;
  }

  if (diff === "standard") {
    const scored = actions.map((a) => {
      const next = applySumoPush(state, a);
      return { a, v: evaluateSumo(next, perspective) + rng() * 4 };
    });
    scored.sort((x, y) => y.v - x.v);
    return scored[0].a;
  }

  // challenge: 2-ply search
  const ordered = actions
    .map((a) => {
      const next = applySumoPush(state, a);
      return { a, next, h: evaluateSumo(next, perspective) };
    })
    .sort((x, y) => y.h - x.h)
    .slice(0, 18);

  let best = ordered[0].a;
  let bestVal = -Infinity;
  for (const { a, next } of ordered) {
    if (next.phase === "finished") {
      const val = evaluateSumo(next, perspective);
      if (val > bestVal) {
        bestVal = val;
        best = a;
      }
      continue;
    }
    const oppMoves = legalSumoActions(next, opp);
    const oppTop = oppMoves
      .map((oa) => ({ next2: applySumoPush(next, oa) }))
      .sort((x, y) => evaluateSumo(x.next2, perspective) - evaluateSumo(y.next2, perspective))
      .slice(0, 12);
    let worst = Infinity;
    for (const { next2 } of oppTop) {
      const v = evaluateSumo(next2, perspective);
      if (v < worst) worst = v;
    }
    const finalVal = (worst === Infinity ? evaluateSumo(next, perspective) : worst) + rng() * 0.5;
    if (finalVal > bestVal) {
      bestVal = finalVal;
      best = a;
    }
  }
  return best;
}
