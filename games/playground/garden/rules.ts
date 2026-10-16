import { Level, Team, other, random } from "../types";
import { Engine } from "../session";
export type Terrain = "rose" | "gold" | "path";
export interface TileCell {
  x: number;
  y: number;
  kind: Terrain;
}
export type GardenAction =
  | { type: "place"; slot: number; rotation: number; x: number; y: number }
  | { type: "discard" };
export interface GardenState {
  phase: "playing" | "finished";
  turn: Team;
  size: number;
  ply: number;
  limit: number;
  boards: Record<Team, (Terrain | null)[]>;
  market: TileCell[][];
  deck: TileCell[][];
  message: string;
}
export function createGarden(
  seed: number,
  level: Level,
  starter: Team,
): GardenState {
  const rng = random(seed),
    size = level === "normal" ? 5 : 6,
    limit = level === "normal" ? 12 : 16;
  const deck = Array.from({ length: limit + 3 }, () => {
    const shape =
      rng() < 0.5
        ? [
            [0, 0],
            [1, 0],
            [0, 1],
          ]
        : [
            [0, 0],
            [1, 0],
            [2, 0],
          ];
    const sets: Terrain[][] = [
      ["rose", "rose", "path"],
      ["gold", "gold", "path"],
      ["path", "path", "path"],
      ["rose", "rose", "rose"],
      ["gold", "gold", "gold"],
      ["rose", "gold", "path"],
    ];
    const kinds = sets[Math.floor(rng() * sets.length)];
    return shape.map(([x, y], i) => ({ x, y, kind: kinds[i] }));
  });
  return {
    phase: "playing",
    turn: starter,
    size,
    ply: 0,
    limit,
    boards: {
      A: Array(size * size).fill(null),
      B: Array(size * size).fill(null),
    },
    market: deck.slice(0, 3),
    deck: deck.slice(3),
    message: "先選公開地形板，再旋轉並選花園落點。",
  };
}
export function rotated(tile: TileCell[], rotation: number) {
  let out = tile.map((c) => ({ ...c }));
  for (let i = 0; i < ((rotation % 4) + 4) % 4; i++)
    out = out.map((c) => ({ ...c, x: -c.y, y: c.x }));
  const mx = Math.min(...out.map((c) => c.x)),
    my = Math.min(...out.map((c) => c.y));
  return out.map((c) => ({ ...c, x: c.x - mx, y: c.y - my }));
}
const adjacent = (i: number, n: number) =>
  [
    i % n ? i - 1 : -1,
    i % n < n - 1 ? i + 1 : -1,
    i >= n ? i - n : -1,
    i < n * (n - 1) ? i + n : -1,
  ].filter((x) => x >= 0);
export function placementError(
  s: GardenState,
  a: Extract<GardenAction, { type: "place" }>,
): string | null {
  if (!s.market[a.slot]) return "請先選一塊地形板";
  const cells = rotated(s.market[a.slot], a.rotation).map((c) => ({
    ...c,
    x: c.x + a.x,
    y: c.y + a.y,
  }));
  if (cells.some((c) => c.x < 0 || c.y < 0 || c.x >= s.size || c.y >= s.size))
    return "地形板超出花園邊界";
  const b = s.boards[s.turn];
  if (cells.some((c) => b[c.y * s.size + c.x])) return "不能覆蓋已放好的地形";
  if (
    b.some(Boolean) &&
    !cells.some((c) => adjacent(c.y * s.size + c.x, s.size).some((i) => b[i]))
  )
    return "新地形至少一邊要接到原有花園";
  return null;
}
export function placements(
  s: GardenState,
): Extract<GardenAction, { type: "place" }>[] {
  if (s.phase === "finished") return [];
  const out: Extract<GardenAction, { type: "place" }>[] = [];
  for (let slot = 0; slot < 3; slot++)
    for (let rotation = 0; rotation < 4; rotation++)
      for (let y = 0; y < s.size; y++)
        for (let x = 0; x < s.size; x++) {
          const a = { type: "place" as const, slot, rotation, x, y };
          if (!placementError(s, a)) out.push(a);
        }
  return out;
}
export function scoreGarden(board: (Terrain | null)[], size: number) {
  const visited = new Set<number>();
  let flowers = 0,
    paths = 0,
    holes = 0;
  const entrance = Math.floor(size / 2) * size;
  for (let start = 0; start < board.length; start++) {
    if (visited.has(start)) continue;
    const kind = board[start],
      group = [start];
    visited.add(start);
    for (let j = 0; j < group.length; j++)
      for (const i of adjacent(group[j], size))
        if (!visited.has(i) && board[i] === kind) {
          visited.add(i);
          group.push(i);
        }
    if (kind === "path")
      paths += group.length * (group.includes(entrance) ? 2 : 1);
    else if (kind) flowers += group.length * (group.length >= 3 ? 2 : 1);
    else if (
      !group.some(
        (i) =>
          i < size ||
          i >= size * (size - 1) ||
          i % size === 0 ||
          i % size === size - 1,
      )
    )
      holes += group.length;
  }
  return {
    flowers,
    paths,
    holes,
    penalty: holes * 3,
    total: flowers + paths - holes * 3,
  };
}
export function validGarden(a: unknown): a is GardenAction {
  if (!a || typeof a !== "object") return false;
  const v = a as any;
  return (
    v.type === "discard" ||
    (v.type === "place" &&
      [v.slot, v.rotation, v.x, v.y].every(Number.isInteger) &&
      v.slot >= 0 &&
      v.slot < 3 &&
      v.rotation >= 0 &&
      v.rotation < 4 &&
      v.x >= 0 &&
      v.y >= 0 &&
      v.x < 6 &&
      v.y < 6)
  );
}
export function applyGarden(s: GardenState, a: GardenAction): GardenState {
  if (!validGarden(a) || s.phase !== "playing") throw Error("行動無效或已結束");
  const boards = { A: [...s.boards.A], B: [...s.boards.B] },
    market = [...s.market],
    deck = [...s.deck];
  let message = "";
  if (a.type === "discard") {
    if (placements(s).length) throw Error("仍有合法落點，不能略過");
    message = `${s.turn}隊沒有可放位置，本手略過。`;
  } else {
    const error = placementError(s, a);
    if (error) throw Error(error);
    for (const c of rotated(s.market[a.slot], a.rotation))
      boards[s.turn][(c.y + a.y) * s.size + c.x + a.x] = c.kind;
    market[a.slot] = deck.shift()!;
    message = `${s.turn}隊在 ${String.fromCharCode(65 + a.x)}${a.y + 1} 種下地形，暫計 ${scoreGarden(boards[s.turn], s.size).total} 分。`;
  }
  const ply = s.ply + 1;
  return {
    ...s,
    boards,
    market,
    deck,
    ply,
    turn: other(s.turn),
    phase: ply === s.limit ? "finished" : "playing",
    message,
  };
}
export const gardenEngine: Engine<GardenState, GardenAction> = {
  create: createGarden,
  apply: applyGarden,
  validAction: validGarden,
};
