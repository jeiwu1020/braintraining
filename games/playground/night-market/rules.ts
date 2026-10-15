import { Level, Team, other, shuffled } from "../types";
export const FOODS = ["rice", "corn", "tofu"] as const;
export type Food = (typeof FOODS)[number];
export const FOOD_NAMES: Record<Food, string> = {
  rice: "飯糰",
  corn: "烤玉米",
  tofu: "豆花",
};
export type Counts = Record<Food, number>;
export interface Card {
  id: string;
  food: Food;
}
export const ORDER_IDS = ["variety", "specialty", "sharing", "even"] as const;
export type Order = (typeof ORDER_IDS)[number];
export const ORDERS: Record<
  Order,
  { name: string; condition: string; points: number }
> = {
  variety: { name: "三味俱全", condition: "三種菜各至少 1 張", points: 3 },
  specialty: { name: "招牌專賣", condition: "任一菜色至少 4 張", points: 4 },
  sharing: { name: "雙份分享", condition: "兩種菜各至少 2 張", points: 3 },
  even: { name: "整整齊齊", condition: "所有已拿菜色皆為偶數張", points: 3 },
};
export function counts(cards: Card[]): Counts {
  return cards.reduce((a, c) => ({ ...a, [c.food]: a[c.food] + 1 }), {
    rice: 0,
    corn: 0,
    tofu: 0,
  });
}
export function foodScore(food: Food, n: number): number {
  return food === "rice"
    ? Math.floor(n / 2) * 5 + (n % 2)
    : food === "corn"
      ? n * 2
      : n
        ? n + 3
        : 0;
}
export function matchesOrder(c: Counts, order: Order): boolean {
  const n = FOODS.map((f) => c[f]);
  if (order === "variety") return n.every((x) => x >= 1);
  if (order === "specialty") return n.some((x) => x >= 4);
  if (order === "sharing") return n.filter((x) => x >= 2).length >= 2;
  return n.some((x) => x > 0) && n.every((x) => x % 2 === 0);
}
export function scoreCounts(c: Counts, orders: Order[] = [], final = false) {
  const parts = FOODS.map((f) => foodScore(f, c[f]));
  const base = parts.reduce((a, b) => a + b, 0);
  const bonus = final
    ? orders
        .filter((o) => matchesOrder(c, o))
        .reduce((a, o) => a + ORDERS[o].points, 0)
    : 0;
  return { parts, base, bonus, total: base + bonus };
}
export interface NightState {
  seed: number;
  level: Level;
  starter: Team;
  round: 1 | 2;
  turn: Team;
  phase: "playing" | "round_summary" | "finished";
  market: (Card | null)[];
  deck: Card[];
  hands: Record<Team, Card[]>;
  orders: Order[];
  previous: Record<Team, number>;
  picks: number;
  last: string;
}
export type NightAction =
  | { type: "pick"; slot: number }
  | { type: "next-round" };
function deal(seed: number, round: number, level: Level) {
  const deck = shuffled(
    FOODS.flatMap((food) =>
      Array.from({ length: 6 }, (_, i) => ({
        food,
        id: `${round}-${food}-${i}`,
      })),
    ),
    seed ^ (round * 0x9e3779b9),
  );
  return {
    market: deck.slice(0, 4),
    deck: deck.slice(4),
    orders:
      level === "advanced"
        ? shuffled([...ORDER_IDS], seed ^ (round * 0x85ebca6b)).slice(0, 2)
        : [],
  };
}
export function createNight(
  seed: number,
  level: Level,
  starter: Team,
): NightState {
  return {
    seed,
    level,
    starter,
    round: 1,
    turn: starter,
    phase: "playing",
    ...deal(seed, 1, level),
    hands: { A: [], B: [] },
    previous: { A: 0, B: 0 },
    picks: 0,
    last: "從四張公開菜色選一張",
  };
}
export const scoreNight = (s: NightState, t: Team) =>
  scoreCounts(counts(s.hands[t]), s.orders, s.phase !== "playing");
export function applyNight(s: NightState, a: NightAction): NightState {
  if (a.type === "next-round") {
    if (s.phase !== "round_summary") throw new Error("目前不能換輪");
    return {
      ...s,
      ...deal(s.seed, 2, s.level),
      round: 2,
      turn: other(s.starter),
      hands: { A: [], B: [] },
      previous: { A: scoreNight(s, "A").total, B: scoreNight(s, "B").total },
      picks: 0,
      phase: "playing",
      last: "第 2 輪換先手，餐盤重新開始",
    };
  }
  if (
    s.phase !== "playing" ||
    !Number.isInteger(a.slot) ||
    a.slot < 0 ||
    a.slot > 3 ||
    !s.market[a.slot]
  )
    throw new Error("不是合法菜牌");
  const card = s.market[a.slot]!;
  const market = [...s.market],
    deck = [...s.deck];
  const picks = s.picks + 1;
  market[a.slot] = picks === 12 ? null : deck.shift()!;
  return {
    ...s,
    market,
    deck,
    picks,
    hands: { ...s.hands, [s.turn]: [...s.hands[s.turn], card] },
    turn: other(s.turn),
    phase:
      picks === 12 ? (s.round === 1 ? "round_summary" : "finished") : "playing",
    last: `${s.turn} 隊拿了 ${a.slot + 1} 號${FOOD_NAMES[card.food]}`,
  };
}
export interface Observation {
  level: Level;
  turn: Team;
  market: (Food | null)[];
  hands: Record<Team, Counts>;
  orders: Order[];
  unknown: Counts;
  remaining: Record<Team, number>;
}
/** Deliberately excludes seed, deck order, and unrevealed IDs. */
export function observeNight(s: NightState): Observation {
  const hands = { A: counts(s.hands.A), B: counts(s.hands.B) };
  const unknown = { rice: 6, corn: 6, tofu: 6 };
  for (const f of FOODS)
    unknown[f] -=
      hands.A[f] + hands.B[f] + s.market.filter((c) => c?.food === f).length;
  return {
    level: s.level,
    turn: s.turn,
    market: s.market.map((c) => c?.food ?? null),
    hands,
    orders: [...s.orders],
    unknown,
    remaining: { A: 6 - s.hands.A.length, B: 6 - s.hands.B.length },
  };
}
