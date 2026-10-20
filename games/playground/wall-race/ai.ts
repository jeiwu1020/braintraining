import { AiDifficulty, other, random, Team } from "../types";
import {
  applyWall,
  goal,
  legalActions,
  moves,
  path,
  WallAction,
  WallState,
} from "./rules";
function evaluate(s: WallState, me: Team): number {
  if (s.result === me) return 10000 - s.ply;
  if (s.result === other(me)) return -10000 + s.ply;
  if (s.phase === "finished") return 0;
  return (
    (path(s, other(me)).length - path(s, me).length) * 12 +
    (s.reserve[me] - s.reserve[other(me)]) * 0.7
  );
}
export interface WallAiOptions {
  difficulty?: AiDifficulty;
  seed?: number;
}
function evaluatePolicy(s: WallState, me: Team, difficulty?: AiDifficulty) {
  if (!difficulty || difficulty === "challenge" || s.phase === "finished")
    return evaluate(s, me);
  // Easy only considers its own route. Standard values progress more than blocking.
  return (
    -path(s, me).length * 12 +
    (difficulty === "standard" ? path(s, other(me)).length * 4 : 0) +
    (s.reserve[me] - s.reserve[other(me)]) * 0.35
  );
}
function easyChoice(
  candidates: { action: WallAction; value: number }[],
  seed = 0,
): WallAction {
  const best = Math.max(...candidates.map(({ value }) => value));
  // At most one route step worse than the best legal move; never sample a wall.
  const near = candidates
    .filter(({ value }) => value >= best - 12)
    .sort((a, b) => b.value - a.value);
  return near[Math.floor(random(seed)() * near.length)].action;
}
/** Worker-error fallback: one-ply policy only; legacy sessions keep the old move-only backup. */
export function fallbackWall(
  s: WallState,
  options: WallAiOptions = {},
): WallAction {
  const ms = moves(s);
  const win = ms.find((p) => goal(p, s.turn));
  if (win !== undefined) return { type: "move", to: win };
  if (!ms.length) throw new Error("規則錯誤：沒有合法動作");
  if (options.difficulty) {
    const actions =
      options.difficulty === "easy"
        ? ms.map((to): WallAction => ({ type: "move", to }))
        : legalActions(s);
    const candidates = actions.map((action) => ({
      action,
      value: evaluatePolicy(applyWall(s, action), s.turn, options.difficulty),
    }));
    if (options.difficulty === "easy")
      return easyChoice(candidates, options.seed);
    return candidates.sort((a, b) => b.value - a.value)[0].action;
  }
  return {
    type: "move",
    to: [...ms].sort(
      (a, b) =>
        path({ ...s, pawns: { ...s.pawns, [s.turn]: a } }, s.turn).length -
        path({ ...s, pawns: { ...s.pawns, [s.turn]: b } }, s.turn).length,
    )[0],
  };
}
export function chooseWall(
  s: WallState,
  budgetMs?: number,
  nodeBudget = 6000,
  options: WallAiOptions = {},
) {
  const difficulty = options.difficulty;
  budgetMs ??=
    difficulty === "easy" ? 60
    : difficulty === "standard" ? 180
    : difficulty === "challenge" || s.level === "advanced" ? 450
    : 90;
  const maxDepth =
    difficulty === "easy" ? 1
    : difficulty === "standard" ? 2
    : difficulty === "challenge" || s.level === "advanced" ? 3
    : 1;
  const start = performance.now(),
    me = s.turn;
  let nodes = 0,
    completedDepth = 0,
    chosen = fallbackWall(s, options);
  const win = moves(s).find((p) => goal(p, me));
  if (win !== undefined)
    return {
      action: { type: "move", to: win } as WallAction,
      depth: 1,
      nodes: 1,
      elapsed: performance.now() - start,
    };
  const timedOut = () =>
    performance.now() - start >= budgetMs || nodes >= nodeBudget;
  const STOP = Symbol("budget");
  function ordered(state: WallState) {
    const actions =
      difficulty === "easy"
        ? moves(state).map((to): WallAction => ({ type: "move", to }))
        : legalActions(state);
    return actions
      .map((action) => {
        const next = applyWall(state, action);
        return { action, next, value: evaluatePolicy(next, me, difficulty) };
      })
      .sort((a, b) => (b.value - a.value) * (state.turn === me ? 1 : -1));
  }
  function search(
    state: WallState,
    depth: number,
    alpha: number,
    beta: number,
  ): number {
    if (timedOut()) throw STOP;
    nodes++;
    if (!depth || state.phase === "finished")
      return evaluatePolicy(state, me, difficulty);
    const max = state.turn === me;
    let value = max ? -Infinity : Infinity;
    for (const { next } of ordered(state)) {
      const score = search(next, depth - 1, alpha, beta);
      value = max ? Math.max(value, score) : Math.min(value, score);
      if (max) alpha = Math.max(alpha, value);
      else beta = Math.min(beta, value);
      if (beta <= alpha) break;
    }
    return value;
  }
  const root = ordered(s);
  for (let depth = 1; depth <= maxDepth; depth++) {
    let candidate = chosen,
      best = -Infinity,
      alpha = -Infinity;
    const scored: { action: WallAction; value: number }[] = [];
    try {
      for (const { action, next } of root) {
        const score = search(next, depth - 1, alpha, Infinity);
        if (difficulty === "easy") scored.push({ action, value: score });
        if (score > best) {
          best = score;
          candidate = action;
        }
        alpha = Math.max(alpha, best);
      }
      chosen =
        difficulty === "easy" ? easyChoice(scored, options.seed) : candidate;
      completedDepth = depth;
    } catch (error) {
      if (error !== STOP) throw error;
      break;
    }
  }
  return {
    action: chosen,
    depth: completedDepth,
    nodes,
    elapsed: performance.now() - start,
  };
}
