import { other, Team } from "../types";
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
export function fallbackWall(s: WallState): WallAction {
  const ms = moves(s);
  const win = ms.find((p) => goal(p, s.turn));
  if (win !== undefined) return { type: "move", to: win };
  if (!ms.length) throw new Error("規則錯誤：沒有合法動作");
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
  budgetMs = s.level === "advanced" ? 450 : 90,
  nodeBudget = 6000,
) {
  const start = performance.now(),
    me = s.turn;
  let nodes = 0,
    completedDepth = 0,
    chosen = fallbackWall(s);
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
    return legalActions(state)
      .map((action) => {
        const next = applyWall(state, action);
        return { action, next, value: evaluate(next, me) };
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
    if (!depth || state.phase === "finished") return evaluate(state, me);
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
  for (let depth = 1; depth <= (s.level === "advanced" ? 3 : 1); depth++) {
    let candidate = chosen,
      best = -Infinity,
      alpha = -Infinity;
    try {
      for (const { action, next } of root) {
        const score = search(next, depth - 1, alpha, Infinity);
        if (score > best) {
          best = score;
          candidate = action;
        }
        alpha = Math.max(alpha, best);
      }
      chosen = candidate;
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
