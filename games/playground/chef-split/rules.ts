import { Level, other, shuffled, Team } from "../types";

export type Dish = "tart" | "matcha" | "pudding" | "macaron" | "charred";

export const DISH_INFO: Record<
  Dish,
  { name: string; base: number; rule: string }
> = {
  tart: { name: "草莓塔", base: 2, rule: "每顆 +2 分，每湊 2 顆額外 +2 分" },
  matcha: { name: "抹茶捲", base: 1, rule: "每顆 +1 分，集滿 3 顆額外 +5 分（限一次）" },
  pudding: { name: "焦糖布丁", base: 3, rule: "每顆穩定 +3 分" },
  macaron: { name: "馬卡龍", base: 2, rule: "每顆 +2 分，湊齊 4 種甜品額外 +5 分" },
  charred: { name: "焦黑點心", base: -2, rule: "每顆扣 2 分，分盤時小心被塞入" },
};

export const SWEET_DISHES: Dish[] = ["tart", "matcha", "pudding", "macaron"];

export interface ChefScore {
  total: number;
  base: number;
  tartBonus: number;
  matchaBonus: number;
  varietyBonus: number;
  penalty: number;
  counts: Record<Dish, number>;
}

export function scoreChefCollection(items: Dish[]): ChefScore {
  const counts: Record<Dish, number> = {
    tart: 0,
    matcha: 0,
    pudding: 0,
    macaron: 0,
    charred: 0,
  };
  for (const d of items) counts[d] += 1;
  const base =
    counts.tart * 2 +
    counts.matcha * 1 +
    counts.pudding * 3 +
    counts.macaron * 2;
  const tartBonus = Math.floor(counts.tart / 2) * 2;
  const matchaBonus = counts.matcha >= 3 ? 5 : 0;
  const varietyBonus =
    counts.tart >= 1 &&
    counts.matcha >= 1 &&
    counts.pudding >= 1 &&
    counts.macaron >= 1
      ? 5
      : 0;
  const penalty = counts.charred * -2;
  const total = base + tartBonus + matchaBonus + varietyBonus + penalty;
  return { total, base, tartBonus, matchaBonus, varietyBonus, penalty, counts };
}

export interface ChefState {
  level: Level;
  round: number;
  totalRounds: number;
  splitter: Team;
  turn: Team;
  stage: "split" | "choose" | "finished";
  phase: "playing" | "finished";
  tray: Dish[];
  plates: { left: Dish[]; right: Dish[] } | null;
  deck: Dish[];
  collections: Record<Team, Dish[]>;
  ply: number;
  result: Team | "tie" | null;
  last: string;
}

export type ChefAction =
  | { type: "split"; leftIndices: number[] }
  | { type: "choose"; plate: "left" | "right" };

export function createChefSplit(
  seed: number,
  level: Level = "normal",
  starter: Team = "A",
): ChefState {
  const perRound = level === "normal" ? 4 : 5;
  const totalRounds = 6;
  const rawDeck: Dish[] =
    level === "normal"
      ? [
          ...Array(6).fill("tart"),
          ...Array(6).fill("matcha"),
          ...Array(6).fill("pudding"),
          ...Array(6).fill("macaron"),
        ]
      : [
          ...Array(7).fill("tart"),
          ...Array(7).fill("matcha"),
          ...Array(7).fill("pudding"),
          ...Array(6).fill("macaron"),
          ...Array(3).fill("charred"),
        ];
  const deck = shuffled(rawDeck, seed ^ 0x9e37);
  const tray = deck.slice(0, perRound);
  return {
    level,
    round: 1,
    totalRounds,
    splitter: starter,
    turn: starter,
    stage: "split",
    phase: "playing",
    tray,
    plates: null,
    deck: deck.slice(perRound),
    collections: { A: [], B: [] },
    ply: 0,
    result: null,
    last: `第 1 輪開始，由 ${starter}隊擔任主廚切分左右兩盤！`,
  };
}

export function validChefAction(a: unknown): a is ChefAction {
  if (!a || typeof a !== "object") return false;
  const x = a as ChefAction;
  if (x.type === "split") {
    return Array.isArray(x.leftIndices) && x.leftIndices.every((i) => Number.isInteger(i));
  }
  if (x.type === "choose") {
    return x.plate === "left" || x.plate === "right";
  }
  return false;
}

export function applyChefSplit(state: ChefState, action: ChefAction): ChefState {
  if (state.phase !== "playing") throw new Error("對局已結束");
  if (!validChefAction(action)) throw new Error("無效動作");

  if (state.stage === "split") {
    if (action.type !== "split") throw new Error("現在輪到主廚分盤");
    const unique = [...new Set(action.leftIndices)];
    if (
      unique.length !== action.leftIndices.length ||
      unique.length < 1 ||
      unique.length >= state.tray.length ||
      unique.some((i) => i < 0 || i >= state.tray.length)
    ) {
      throw new Error("左右盤都必須至少保留 1 份點心");
    }
    const leftSet = new Set(unique);
    const left: Dish[] = [];
    const right: Dish[] = [];
    state.tray.forEach((d, idx) => (leftSet.has(idx) ? left : right).push(d));
    const chooser = other(state.splitter);
    return {
      ...state,
      plates: { left, right },
      stage: "choose",
      turn: chooser,
      ply: state.ply + 1,
      last: `${state.splitter}隊已分好左盤 ${left.length} 份、右盤 ${right.length} 份，換 ${chooser}隊先挑！`,
    };
  }

  if (state.stage === "choose") {
    if (action.type !== "choose" || !state.plates) throw new Error("現在輪到客人挑盤");
    const chooser = state.turn;
    const splitter = state.splitter;
    const chosen = action.plate === "left" ? state.plates.left : state.plates.right;
    const leftover = action.plate === "left" ? state.plates.right : state.plates.left;

    const collections: Record<Team, Dish[]> = {
      A: [...state.collections.A, ...(chooser === "A" ? chosen : leftover)],
      B: [...state.collections.B, ...(chooser === "B" ? chosen : leftover)],
    };

    if (state.round >= state.totalRounds) {
      const sa = scoreChefCollection(collections.A);
      const sb = scoreChefCollection(collections.B);
      let result: Team | "tie" =
        sa.total > sb.total ? "A" : sb.total > sa.total ? "B" : "tie";
      if (result === "tie" && sa.counts.charred !== sb.counts.charred) {
        result = sa.counts.charred < sb.counts.charred ? "A" : "B";
      }
      return {
        ...state,
        collections,
        plates: null,
        tray: [],
        stage: "finished",
        phase: "finished",
        ply: state.ply + 1,
        result,
        last: `${chooser}隊選走${action.plate === "left" ? "左" : "右"}盤！全場結束：A ${sa.total} 分 · B ${sb.total} 分。`,
      };
    }

    const perRound = state.level === "normal" ? 4 : 5;
    const nextTray = state.deck.slice(0, perRound);
    const nextDeck = state.deck.slice(perRound);
    const nextSplitter = other(splitter);
    return {
      ...state,
      round: state.round + 1,
      splitter: nextSplitter,
      turn: nextSplitter,
      stage: "split",
      tray: nextTray,
      plates: null,
      deck: nextDeck,
      collections,
      ply: state.ply + 1,
      last: `${chooser}隊選走${action.plate === "left" ? "左" : "右"}盤。第 ${state.round + 1} 輪改由 ${nextSplitter}隊分盤！`,
    };
  }

  throw new Error("無效回合狀態");
}
