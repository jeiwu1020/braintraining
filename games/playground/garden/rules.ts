import { Level, Team, other, random } from "../types";
import { Engine } from "../session";

export type Terrain = "rose" | "gold" | "path";
export type CellTerrain = Terrain | "fountain";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export interface SeasonInfo {
  id: SeasonId;
  name: string;
  short: string;
  title: string;
  bonus: number;
  headline: string;
  desc: string;
}

export const SEASONS: Record<SeasonId, SeasonInfo> = {
  spring: {
    id: "spring",
    name: "春季",
    short: "春",
    title: "春季賞",
    bonus: 2,
    headline: "花朵挨著中央噴泉 ＋2分",
    desc: "本手放的花有碰到噴泉 ＋2分",
  },
  summer: {
    id: "summer",
    name: "夏季",
    short: "夏",
    title: "夏季賞",
    bonus: 2,
    headline: "湊出 3 格以上同色花海 ＋2分",
    desc: "本手湊出或擴大 ≥3格花海 ＋2分",
  },
  autumn: {
    id: "autumn",
    name: "秋季",
    short: "秋",
    title: "秋季賞",
    bonus: 2,
    headline: "小徑連通中央噴泉 ＋2分",
    desc: "本手鋪出並延長連泉小徑 ＋2分",
  },
  winter: {
    id: "winter",
    name: "冬季",
    short: "冬",
    title: "冬季賞",
    bonus: 3,
    headline: "紅花海・金花海・連泉小徑齊備 ＋3分",
    desc: "三景齊全 ＋3分（每隊限領一次）",
  },
};

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
  boards: Record<Team, (CellTerrain | null)[]>;
  seasonBonuses: Record<Team, number>;
  winterClaimed: Record<Team, boolean>;
  lastSeasonAward: {
    team: Team;
    season: SeasonId;
    points: number;
    title: string;
  } | null;
  market: TileCell[][];
  deck: TileCell[][];
  message: string;
}

const SHAPES_4: [number, number][][] = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
];

const SHAPES_3: [number, number][][] = [
  [
    [0, 0],
    [1, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
];

const SETS_4: Terrain[][] = [
  ["rose", "rose", "path", "path"],
  ["gold", "gold", "path", "path"],
  ["rose", "rose", "gold", "gold"],
  ["rose", "rose", "rose", "path"],
  ["gold", "gold", "gold", "path"],
  ["rose", "gold", "path", "path"],
];

const SETS_3: Terrain[][] = [
  ["rose", "rose", "path"],
  ["gold", "gold", "path"],
  ["rose", "gold", "path"],
  ["rose", "rose", "gold"],
  ["gold", "gold", "rose"],
  ["path", "path", "rose"],
];

export function currentSeason(s: Pick<GardenState, "ply" | "limit">): SeasonInfo {
  const order: SeasonId[] = ["spring", "summer", "autumn", "winter"];
  const idx = Math.min(3, Math.floor((s.ply / Math.max(1, s.limit)) * 4));
  return SEASONS[order[idx]];
}

export function createGarden(
  seed: number,
  level: Level,
  starter: Team,
): GardenState {
  const rng = random(seed),
    size = level === "normal" ? 5 : 6,
    limit = level === "normal" ? 8 : 16;

  const deck = Array.from({ length: limit + 3 }, (_, idx) => {
    const useThree =
      level === "normal" ? idx >= limit - 1 : rng() < 0.35 || idx >= limit - 2;
    const shapes = useThree ? SHAPES_3 : SHAPES_4;
    const sets = useThree ? SETS_3 : SETS_4;
    const shape = shapes[Math.floor(rng() * shapes.length)];
    const kinds = sets[Math.floor(rng() * sets.length)];
    return shape.map(([x, y], i) => ({ x, y, kind: kinds[i] }));
  });

  const makeBoard = () => {
    const b: (CellTerrain | null)[] = Array(size * size).fill(null);
    const center = 2 * size + 2;
    b[center] = "fountain";
    return b;
  };

  return {
    phase: "playing",
    turn: starter,
    size,
    ply: 0,
    limit,
    boards: {
      A: makeBoard(),
      B: makeBoard(),
    },
    seasonBonuses: { A: 0, B: 0 },
    winterClaimed: { A: false, B: false },
    lastSeasonAward: null,
    market: deck.slice(0, 3),
    deck: deck.slice(3),
    message: "春季開園！選一塊地形板，從中央噴泉旁開始造園。",
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
  if (cells.some((c) => b[c.y * s.size + c.x])) return "不能覆蓋噴泉或已放地形";
  if (
    !cells.some((c) => adjacent(c.y * s.size + c.x, s.size).some((i) => b[i]))
  )
    return "須接到噴泉或原有花園旁";
  return null;
}

export function resolveCellAnchor(
  s: GardenState,
  slot: number,
  rotation: number,
  cellX: number,
  cellY: number,
): { anchor: { x: number; y: number }; valid: boolean } | null {
  const tile = s.market[slot];
  if (!tile) return null;
  const cells = [...rotated(tile, rotation)].sort(
    (a, b) => a.y - b.y || a.x - b.x,
  );
  const first = cells[0];
  const primaryAnchor = { x: cellX - first.x, y: cellY - first.y };
  if (!placementError(s, { type: "place", slot, rotation, ...primaryAnchor })) {
    return { anchor: primaryAnchor, valid: true };
  }
  for (const c of cells.slice(1)) {
    const candidate = { x: cellX - c.x, y: cellY - c.y };
    if (!placementError(s, { type: "place", slot, rotation, ...candidate })) {
      return { anchor: candidate, valid: true };
    }
  }
  return { anchor: primaryAnchor, valid: false };
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

export function gardenHighlights(
  board: (CellTerrain | null)[],
  size: number,
) {
  const visited = new Set<number>();
  const doubledFlowers = new Set<number>();
  const connectedPaths = new Set<number>();
  let hasRoseCluster = false;
  let hasGoldCluster = false;

  for (let start = 0; start < board.length; start++) {
    if (visited.has(start)) continue;
    const kind = board[start];
    if (!kind || kind === "fountain") continue;
    const group = [start];
    visited.add(start);
    for (let j = 0; j < group.length; j++)
      for (const i of adjacent(group[j], size))
        if (!visited.has(i) && board[i] === kind) {
          visited.add(i);
          group.push(i);
        }
    if (kind === "path") {
      const touchesFountain = group.some((idx) =>
        adjacent(idx, size).some((n) => board[n] === "fountain"),
      );
      if (touchesFountain) {
        for (const i of group) connectedPaths.add(i);
      }
    } else if (group.length >= 3) {
      if (kind === "rose") hasRoseCluster = true;
      if (kind === "gold") hasGoldCluster = true;
      for (const i of group) doubledFlowers.add(i);
    }
  }
  return {
    doubledFlowers,
    connectedPaths,
    hasRoseCluster,
    hasGoldCluster,
  };
}

export function scoreGarden(
  board: (CellTerrain | null)[],
  size: number,
  seasonBonus = 0,
) {
  const visited = new Set<number>();
  let flowers = 0,
    paths = 0;

  for (let start = 0; start < board.length; start++) {
    if (visited.has(start)) continue;
    const kind = board[start];
    if (!kind || kind === "fountain") continue;
    const group = [start];
    visited.add(start);
    for (let j = 0; j < group.length; j++)
      for (const i of adjacent(group[j], size))
        if (!visited.has(i) && board[i] === kind) {
          visited.add(i);
          group.push(i);
        }
    if (kind === "path") {
      const touchesFountain = group.some((idx) =>
        adjacent(idx, size).some((n) => board[n] === "fountain"),
      );
      paths += group.length * (touchesFountain ? 2 : 1);
    } else {
      flowers += group.length * (group.length >= 3 ? 2 : 1);
    }
  }

  return {
    flowers,
    paths,
    season: seasonBonus,
    total: flowers + paths + seasonBonus,
  };
}

export function teamScore(s: GardenState, team: Team) {
  return scoreGarden(s.boards[team], s.size, s.seasonBonuses[team]);
}

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export function formatGardenDelta(
  before: ReturnType<typeof scoreGarden>,
  after: ReturnType<typeof scoreGarden>,
): string {
  const totalDelta = after.total - before.total;
  const seasonDelta = after.season - before.season;
  return `本手 ${signed(totalDelta)}分${seasonDelta > 0 ? `（含季節賞${signed(seasonDelta)}）` : ""}`;
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
    deck = [...s.deck],
    seasonBonuses = { ...s.seasonBonuses },
    winterClaimed = { ...s.winterClaimed };

  const season = currentSeason(s);
  const before = teamScore(s, s.turn);
  const beforeHl = gardenHighlights(s.boards[s.turn], s.size);

  let lastSeasonAward: GardenState["lastSeasonAward"] = null;
  let message = "";

  if (a.type === "discard") {
    if (placements(s).length) throw Error("仍有合法落點，不能略過");
    message = `${s.turn}隊沒有可放位置，本手略過。`;
  } else {
    const error = placementError(s, a);
    if (error) throw Error(error);
    const placedCells = rotated(s.market[a.slot], a.rotation).map((c) => ({
      ...c,
      x: c.x + a.x,
      y: c.y + a.y,
      idx: (c.y + a.y) * s.size + c.x + a.x,
    }));
    for (const c of placedCells) {
      boards[s.turn][c.idx] = c.kind;
    }
    market[a.slot] = deck.shift()!;

    const afterHl = gardenHighlights(boards[s.turn], s.size);
    let awardPoints = 0;

    if (season.id === "spring") {
      const flowerTouchesFountain = placedCells.some(
        (c) =>
          (c.kind === "rose" || c.kind === "gold") &&
          adjacent(c.idx, s.size).some((n) => boards[s.turn][n] === "fountain"),
      );
      if (flowerTouchesFountain) awardPoints = season.bonus;
    } else if (season.id === "summer") {
      if (afterHl.doubledFlowers.size > beforeHl.doubledFlowers.size) {
        awardPoints = season.bonus;
      }
    } else if (season.id === "autumn") {
      if (
        placedCells.some((c) => c.kind === "path") &&
        afterHl.connectedPaths.size > beforeHl.connectedPaths.size
      ) {
        awardPoints = season.bonus;
      }
    } else if (season.id === "winter") {
      if (
        !winterClaimed[s.turn] &&
        afterHl.hasRoseCluster &&
        afterHl.hasGoldCluster &&
        afterHl.connectedPaths.size > 0
      ) {
        awardPoints = season.bonus;
        winterClaimed[s.turn] = true;
      }
    }

    if (awardPoints > 0) {
      seasonBonuses[s.turn] += awardPoints;
      lastSeasonAward = {
        team: s.turn,
        season: season.id,
        points: awardPoints,
        title: season.title,
      };
    }

    const after = scoreGarden(
      boards[s.turn],
      s.size,
      seasonBonuses[s.turn],
    );
    message = `${s.turn}隊完成${season.name}造園，暫計 ${after.total} 分。 ${formatGardenDelta(before, after)}。`;
  }

  const ply = s.ply + 1;
  return {
    ...s,
    boards,
    seasonBonuses,
    winterClaimed,
    lastSeasonAward,
    market,
    deck,
    ply,
    turn: other(s.turn),
    phase: ply === s.limit ? "finished" : "playing",
    message:
      a.type === "discard"
        ? `${message} ${formatGardenDelta(before, before)}。`
        : message,
  };
}

export const gardenEngine: Engine<GardenState, GardenAction> = {
  create: createGarden,
  apply: applyGarden,
  validAction: validGarden,
};
