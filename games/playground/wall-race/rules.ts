import { Level, Team, other } from "../types";
export interface Wall {
  x: number;
  y: number;
  dir: "h" | "v";
}
export type WallAction =
  | { type: "move"; to: number }
  | { type: "wall"; wall: Wall };
export interface WallState {
  level: Level;
  starter: Team;
  turn: Team;
  pawns: Record<Team, number>;
  walls: Wall[];
  reserve: Record<Team, number>;
  ply: number;
  phase: "playing" | "finished";
  result: Team | "repetition" | "limit" | null;
  repetitions: Record<string, number>;
  last: string;
}
export const coord = (p: number) => `${"ABCDE"[p % 5]}${Math.floor(p / 5) + 1}`;
export const goal = (p: number, t: Team) =>
  Math.floor(p / 5) === (t === "A" ? 0 : 4);
const edge = (a: number, b: number) => (a < b ? `${a}:${b}` : `${b}:${a}`);
export function wallEdges(w: Wall): string[] {
  const p = w.y * 5 + w.x;
  return w.dir === "h"
    ? [edge(p, p + 5), edge(p + 1, p + 6)]
    : [edge(p, p + 1), edge(p + 5, p + 6)];
}
export function neighbors(p: number): number[] {
  const x = p % 5,
    y = Math.floor(p / 5);
  return [
    y > 0 ? p - 5 : -1,
    x < 4 ? p + 1 : -1,
    y < 4 ? p + 5 : -1,
    x > 0 ? p - 1 : -1,
  ].filter((p) => p >= 0);
}
export function blocked(walls: Wall[], a: number, b: number): boolean {
  return walls.some((w) => wallEdges(w).includes(edge(a, b)));
}
export function path(s: Pick<WallState, "walls" | "pawns">, t: Team): number[] {
  const start = s.pawns[t],
    queue = [start],
    prev = new Map<number, number>();
  prev.set(start, -1);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    if (goal(p, t)) {
      const out = [p];
      while (prev.get(out[0]) !== -1) out.unshift(prev.get(out[0])!);
      return out;
    }
    for (const n of neighbors(p))
      if (!prev.has(n) && !blocked(s.walls, p, n)) {
        prev.set(n, p);
        queue.push(n);
      }
  }
  return [];
}
export function moves(s: WallState, t: Team = s.turn): number[] {
  const me = s.pawns[t],
    op = s.pawns[other(t)],
    out: number[] = [];
  for (const n of neighbors(me)) {
    if (blocked(s.walls, me, n)) continue;
    if (n !== op) {
      out.push(n);
      continue;
    }
    const dx = (op % 5) - (me % 5),
      dy = Math.floor(op / 5) - Math.floor(me / 5);
    const bx = (op % 5) + dx,
      by = Math.floor(op / 5) + dy,
      behind = by * 5 + bx;
    if (bx >= 0 && bx < 5 && by >= 0 && by < 5 && !blocked(s.walls, op, behind))
      out.push(behind);
    else
      for (const side of neighbors(op)) {
        const sx = (side % 5) - (op % 5),
          sy = Math.floor(side / 5) - Math.floor(op / 5);
        if (sx * dx + sy * dy === 0 && !blocked(s.walls, op, side))
          out.push(side);
      }
  }
  return [...new Set(out)];
}
export function wallError(s: WallState, w: Wall): string | null {
  if (
    !w ||
    !Number.isInteger(w.x) ||
    !Number.isInteger(w.y) ||
    w.x < 0 ||
    w.x > 3 ||
    w.y < 0 ||
    w.y > 3 ||
    !["h", "v"].includes(w.dir)
  )
    return "牆超出棋盤";
  if (s.reserve[s.turn] <= 0) return "本隊的牆已用完";
  const edges = wallEdges(w);
  if (
    s.walls.some(
      (v) => v.dir === w.dir && wallEdges(v).some((e) => edges.includes(e)),
    )
  )
    return "牆重疊";
  if (s.walls.some((v) => v.dir !== w.dir && v.x === w.x && v.y === w.y))
    return "牆交叉";
  const next = { ...s, walls: [...s.walls, w] };
  for (const t of ["A", "B"] as Team[])
    if (!path(next, t).length) return `${t} 隊沒有通往對岸的路`;
  return null;
}
export function positionKey(s: WallState): string {
  return [
    s.pawns.A,
    s.pawns.B,
    s.turn,
    s.reserve.A,
    s.reserve.B,
    ...s.walls.map((w) => `${w.x}${w.y}${w.dir}`).sort(),
  ].join("|");
}
export function createWall(level: Level, starter: Team): WallState {
  const reserve = level === "advanced" ? 5 : 3;
  const s: WallState = {
    level,
    starter,
    turn: starter,
    pawns: { A: 22, B: 2 },
    walls: [],
    reserve: { A: reserve, B: reserve },
    ply: 0,
    phase: "playing",
    result: null,
    repetitions: {},
    last: "A 往上到第 1 列；B 往下到第 5 列",
  };
  s.repetitions[positionKey(s)] = 1;
  return s;
}
export function applyWall(s: WallState, a: WallAction): WallState {
  if (s.phase !== "playing") throw new Error("本局已結束");
  let n: WallState = {
    ...s,
    pawns: { ...s.pawns },
    walls: [...s.walls],
    reserve: { ...s.reserve },
    ply: s.ply + 1,
    turn: other(s.turn),
    repetitions: { ...s.repetitions },
  };
  if (a.type === "move") {
    if (!moves(s).includes(a.to)) throw new Error("不是合法目的格");
    n.pawns[s.turn] = a.to;
    n.last = `${s.turn} 隊走到 ${coord(a.to)}`;
    if (goal(a.to, s.turn)) {
      n.phase = "finished";
      n.result = s.turn;
      return n;
    }
  } else if (a.type === "wall") {
    const error = wallError(s, a.wall);
    if (error) throw new Error(error);
    n.walls.push({ ...a.wall });
    n.reserve[s.turn]--;
    n.last = `${s.turn} 隊在 ${coord(a.wall.y * 5 + a.wall.x)} 放${a.wall.dir === "h" ? "橫" : "直"}牆`;
  } else throw new Error("未知動作");
  const key = positionKey(n);
  n.repetitions[key] = (n.repetitions[key] || 0) + 1;
  if (n.repetitions[key] >= 3) {
    n.phase = "finished";
    n.result = "repetition";
  } else if (n.ply >= 80) {
    n.phase = "finished";
    n.result = "limit";
  }
  return n;
}
export function legalActions(s: WallState): WallAction[] {
  if (s.phase !== "playing") return [];
  const out: WallAction[] = moves(s).map((to) => ({ type: "move", to }));
  if (s.reserve[s.turn] > 0)
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++)
        for (const dir of ["h", "v"] as const) {
          const wall = { x, y, dir };
          if (!wallError(s, wall)) out.push({ type: "wall", wall });
        }
  return out;
}
