import { AiDifficulty, other, random, Team } from "../types";
import {
  adjacentCells,
  applyTowers,
  legalTowerActions,
  moveTargets,
  TowerAction,
  TowerState,
} from "./rules";

export interface TowerAiOptions {
  difficulty?: AiDifficulty;
  seed?: number;
}

function canReachThreeInOne(state: TowerState, team: Team): boolean {
  for (const b of state.builders[team]) {
    for (const to of moveTargets(state, b)) {
      if (state.heights[to] === 3) return true;
    }
  }
  return false;
}

function evaluateTowers(state: TowerState, perspective: Team): number {
  const opp = other(perspective);
  if (state.phase === "finished") {
    if (state.result === perspective) return 10000;
    if (state.result === opp) return -10000;
    return 0;
  }
  let score = 0;
  for (const b of state.builders[perspective]) {
    const h = state.heights[b];
    score += h * h * 18;
    const moves = moveTargets(state, b);
    score += moves.length * 1.5;
    for (const m of moves) {
      if (state.heights[m] === 3) score += 220;
      else if (state.heights[m] === 2) score += 14;
    }
    const cx = b % 5 - 2;
    const cy = Math.floor(b / 5) - 2;
    score -= (Math.abs(cx) + Math.abs(cy)) * 1.2;
  }
  for (const b of state.builders[opp]) {
    const h = state.heights[b];
    score -= h * h * 18;
    const moves = moveTargets(state, b);
    score -= moves.length * 1.5;
    for (const m of moves) {
      if (state.heights[m] === 3) score -= 450;
      else if (state.heights[m] === 2) score -= 18;
    }
  }
  return score;
}

export function chooseTowers(state: TowerState, options: TowerAiOptions = {}): TowerAction {
  const actions = legalTowerActions(state, state.turn);
  if (actions.length === 0) throw new Error("無合法操作");
  const diff = options.difficulty ?? (state.level === "normal" ? "standard" : "challenge");
  const rng = random(options.seed ?? state.ply + 31);
  const perspective = state.turn;

  // Immediate win check applies to all difficulties
  const winNow = actions.find((a) => state.heights[a.to] === 3);
  if (winNow) return winNow;

  if (diff === "easy") {
    const scored = actions.map((a) => {
      const next = applyTowers(state, a);
      return {
        a,
        v: state.heights[a.to] * 12 + (next.heights[a.build ?? a.to] ?? 0) * 2 + rng() * 14,
      };
    });
    scored.sort((x, y) => y.v - x.v);
    return scored[0].a;
  }

  if (diff === "standard") {
    const scored = actions.map((a) => {
      const next = applyTowers(state, a);
      const val = evaluateTowers(next, perspective) + rng() * 3;
      return { a, v: val };
    });
    scored.sort((x, y) => y.v - x.v);
    return scored[0].a;
  }

  // challenge: 2-ply search (block all win-in-1 threats & pick strongest response)
  const candidates = actions
    .map((a) => {
      const next = applyTowers(state, a);
      return { a, next, h: evaluateTowers(next, perspective) };
    })
    .sort((x, y) => y.h - x.h)
    .slice(0, 26);

  let best = candidates[0].a;
  let bestScore = -Infinity;
  for (const { a, next } of candidates) {
    if (next.phase === "finished") {
      const val = evaluateTowers(next, perspective);
      if (val > bestScore) {
        bestScore = val;
        best = a;
      }
      continue;
    }
    if (canReachThreeInOne(next, other(perspective))) {
      const val = -9000 + rng();
      if (val > bestScore) {
        bestScore = val;
        best = a;
      }
      continue;
    }
    const oppMoves = legalTowerActions(next, other(perspective));
    const oppSample = oppMoves
      .map((oa) => ({ oa, next2: applyTowers(next, oa) }))
      .sort((x, y) => evaluateTowers(x.next2, perspective) - evaluateTowers(y.next2, perspective))
      .slice(0, 14);
    let worstForMe = Infinity;
    for (const { next2 } of oppSample) {
      const v = evaluateTowers(next2, perspective);
      if (v < worstForMe) worstForMe = v;
    }
    const finalVal = (worstForMe === Infinity ? evaluateTowers(next, perspective) : worstForMe) + rng() * 0.5;
    if (finalVal > bestScore) {
      bestScore = finalVal;
      best = a;
    }
  }
  return best;
}
