import { other, shuffled, type Team } from "../types";

/** Frozen independent ruleset. Never expand the legacy FOODS array or replay a legacy seed here. */
export const MASTER_FOODS = [
  "rice",
  "noodle",
  "corn",
  "chicken",
  "tofu",
  "tea",
] as const;
export type MasterFood = (typeof MASTER_FOODS)[number];
export type MasterCounts = Record<MasterFood, number>;
export interface MasterCard {
  id: string;
  food: MasterFood;
}
export const MASTER_FOOD_NAMES: Record<MasterFood, string> = {
  rice: "飯糰",
  noodle: "麵線",
  corn: "烤玉米",
  chicken: "雞排",
  tofu: "豆花",
  tea: "冬瓜茶",
};
export const MASTER_FOOD_GROUPS: Record<MasterFood, string> = {
  rice: "主食",
  noodle: "主食",
  corn: "小吃",
  chicken: "小吃",
  tofu: "甜飲",
  tea: "甜飲",
};
export const MASTER_ORDERS = {
  variety: {
    name: "三味俱全",
    condition: "飯糰、玉米、豆花各至少1張",
    points: 3,
  },
  specialty: { name: "招牌專賣", condition: "任一菜色至少4張", points: 4 },
  sharing: { name: "雙份分享", condition: "兩種菜各至少2張", points: 3 },
  even: { name: "整整齊齊", condition: "所有已拿菜色皆為偶數張", points: 3 },
  main: {
    name: "主食雙拼",
    condition: "飯糰＋麵線至少4張，兩者都有",
    points: 4,
  },
  snack: { name: "鹹香雙拼", condition: "玉米、雞排各至少2張", points: 5 },
  sweet: {
    name: "甜點茶會",
    condition: "豆花至少1張、冬瓜茶至少2張",
    points: 4,
  },
  meal: { name: "夜市全餐", condition: "主食、小吃、甜飲各至少2張", points: 5 },
  four: { name: "四味剛好", condition: "恰好4種菜，第5種會失效", points: 4 },
  six: { name: "六攤全逛", condition: "六種菜各至少1張", points: 6 },
  tripairs: { name: "三攤成雙", condition: "三種菜各至少2張", points: 5 },
  double: { name: "雙主打", condition: "兩種菜各至少3張", points: 5 },
} as const;
export type MasterOrder = keyof typeof MASTER_ORDERS;
export const MASTER_ORDER_SETS: readonly (readonly MasterOrder[])[] = [
  ["four", "sweet", "sharing"],
  ["main", "variety", "sharing"],
  ["specialty", "snack", "even"],
  ["six", "sweet", "sharing"],
  ["four", "meal", "tripairs"],
  ["main", "variety", "double"],
];
export const emptyMasterCounts = (): MasterCounts => ({
  rice: 0,
  noodle: 0,
  corn: 0,
  chicken: 0,
  tofu: 0,
  tea: 0,
});
export function masterCounts(cards: readonly MasterCard[]): MasterCounts {
  const c = emptyMasterCounts();
  for (const card of cards) c[card.food]++;
  return c;
}
export function masterFoodScore(f: MasterFood, n: number): number {
  return f === "rice"
    ? Math.floor(n / 2) * 5 + (n % 2)
    : f === "tofu"
      ? n > 0
        ? n + 3
        : 0
      : n * 2;
}
export function matchesMasterOrder(c: MasterCounts, o: MasterOrder): boolean {
  const ns = MASTER_FOODS.map((f) => c[f]);
  switch (o) {
    case "variety":
      return c.rice > 0 && c.corn > 0 && c.tofu > 0;
    case "specialty":
      return ns.some((n) => n >= 4);
    case "sharing":
      return ns.filter((n) => n >= 2).length >= 2;
    case "even":
      return ns.some((n) => n > 0) && ns.every((n) => n % 2 === 0);
    case "main":
      return c.rice > 0 && c.noodle > 0 && c.rice + c.noodle >= 4;
    case "snack":
      return c.corn >= 2 && c.chicken >= 2;
    case "sweet":
      return c.tofu >= 1 && c.tea >= 2;
    case "meal":
      return (
        c.rice + c.noodle >= 2 && c.corn + c.chicken >= 2 && c.tofu + c.tea >= 2
      );
    case "four":
      return ns.filter((n) => n > 0).length === 4;
    case "six":
      return ns.every((n) => n > 0);
    case "tripairs":
      return ns.filter((n) => n >= 2).length >= 3;
    case "double":
      return ns.filter((n) => n >= 3).length >= 2;
  }
}
export function scoreMasterCounts(
  c: MasterCounts,
  orders: readonly MasterOrder[] = [],
  final = false,
) {
  const parts = MASTER_FOODS.map((f) => masterFoodScore(f, c[f]));
  const base = parts.reduce((a, b) => a + b, 0);
  const awarded = final
    ? [...new Set(orders)].filter((o) => matchesMasterOrder(c, o))
    : [];
  const bonus = awarded.reduce((n, o) => n + MASTER_ORDERS[o].points, 0);
  return { parts, base, bonus, total: base + bonus, awarded };
}
export function masterOrderProgress(c: MasterCounts, o: MasterOrder): string {
  const ns = MASTER_FOODS.map((f) => c[f]);
  switch (o) {
    case "variety":
      return `三味 ${[c.rice, c.corn, c.tofu].filter((n) => n > 0).length}/3`;
    case "specialty":
      return `最多 ${Math.max(...ns)}/4張`;
    case "sharing":
      return `成雙 ${ns.filter((n) => n >= 2).length}/2種`;
    case "even":
      return `奇數 ${ns.filter((n) => n % 2 === 1).length}種`;
    case "main":
      return `飯${c.rice}＋麵${c.noodle}/4`;
    case "snack":
      return `玉${c.corn}/2 雞${c.chicken}/2`;
    case "sweet":
      return `豆${c.tofu}/1 茶${c.tea}/2`;
    case "meal":
      return `主${c.rice + c.noodle}/2 小${c.corn + c.chicken}/2 甜${c.tofu + c.tea}/2`;
    case "four":
      return `目前${ns.filter((n) => n > 0).length}種／恰4`;
    case "six":
      return `菜色 ${ns.filter((n) => n > 0).length}/6種`;
    case "tripairs":
      return `成雙 ${ns.filter((n) => n >= 2).length}/3種`;
    case "double":
      return `三張 ${ns.filter((n) => n >= 3).length}/2種`;
  }
}
/** Compact progress retains the cap on each required ingredient; extra corn cannot stand in for chicken. */
export function masterCompactProgress(c: MasterCounts, o: MasterOrder): string {
  const ns = MASTER_FOODS.map((f) => c[f]),
    types = ns.filter((n) => n > 0).length;
  switch (o) {
    case "variety":
      return `${[c.rice, c.corn, c.tofu].filter((n) => n > 0).length}/3味`;
    case "specialty":
      return `${Math.max(...ns)}/4張`;
    case "sharing":
      return `${ns.filter((n) => n >= 2).length}/2種`;
    case "even":
      return `${ns.filter((n) => n % 2 === 1).length}種奇數`;
    case "main":
      return `${c.rice + c.noodle}/4${!c.rice ? "缺飯" : !c.noodle ? "缺麵" : ""}`;
    case "snack":
      return `${Math.min(c.corn, 2) + Math.min(c.chicken, 2)}/4張`;
    case "sweet":
      return `${Math.min(c.tofu, 1) + Math.min(c.tea, 2)}/3張`;
    case "meal":
      return `${[c.rice + c.noodle, c.corn + c.chicken, c.tofu + c.tea].filter((n) => n >= 2).length}/3類`;
    case "four":
      return `${types}/4種`;
    case "six":
      return `${types}/6種`;
    case "tripairs":
      return `${ns.filter((n) => n >= 2).length}/3種`;
    case "double":
      return `${ns.filter((n) => n >= 3).length}/2種`;
  }
}
export function masterNeeded(c: MasterCounts, o: MasterOrder): number {
  const ns = MASTER_FOODS.map((f) => c[f]),
    d = (n: number, t: number) => Math.max(0, t - n);
  const sets = (n: number, k: number) =>
    ns
      .map((x) => d(x, n))
      .sort((a, b) => a - b)
      .slice(0, k)
      .reduce((a, b) => a + b, 0);
  switch (o) {
    case "variety":
      return [c.rice, c.corn, c.tofu].filter((n) => n === 0).length;
    case "specialty":
      return d(Math.max(...ns), 4);
    case "sharing":
      return sets(2, 2);
    case "even":
      return ns.filter((n) => n % 2 === 1).length;
    case "main":
      return Math.max(
        d(c.rice + c.noodle, 4),
        Number(!c.rice) + Number(!c.noodle),
      );
    case "snack":
      return d(c.corn, 2) + d(c.chicken, 2);
    case "sweet":
      return d(c.tofu, 1) + d(c.tea, 2);
    case "meal":
      return (
        d(c.rice + c.noodle, 2) +
        d(c.corn + c.chicken, 2) +
        d(c.tofu + c.tea, 2)
      );
    case "four":
      return ns.filter((n) => n > 0).length > 4
        ? Infinity
        : 4 - ns.filter((n) => n > 0).length;
    case "six":
      return ns.filter((n) => n === 0).length;
    case "tripairs":
      return sets(2, 3);
    case "double":
      return sets(3, 2);
  }
}
let finalHands: readonly MasterCounts[] | undefined;
export function legalMasterHands(): readonly MasterCounts[] {
  if (!finalHands) {
    const hands: MasterCounts[] = [];
    function visit(c: MasterCounts, i: number, left: number) {
      if (i === 6) {
        if (left === 0) hands.push(Object.freeze({ ...c }));
        return;
      }
      for (let n = 0; n <= Math.min(4, left); n++) {
        c[MASTER_FOODS[i]] = n;
        visit(c, i + 1, left - n);
      }
    }
    visit(emptyMasterCounts(), 0, 8);
    finalHands = Object.freeze(hands);
  }
  return finalHands;
}
export interface MasterState {
  seed: number;
  starter: Team;
  round: 1 | 2;
  turn: Team;
  phase: "playing" | "round_summary" | "finished";
  market: (MasterCard | null)[];
  deck: MasterCard[];
  hands: Record<Team, MasterCard[]>;
  orders: MasterOrder[];
  previous: Record<Team, number>;
  picks: number;
  last: string;
}
export type MasterAction =
  | { type: "pick"; slot: number }
  | { type: "next-round" };
function ordersFor(seed: number, round: 1 | 2): MasterOrder[] {
  const first = shuffled([...MASTER_ORDER_SETS], seed ^ 0x71f23a65)[0];
  return [
    ...(round === 1
      ? first
      : shuffled(
          MASTER_ORDER_SETS.filter((set) =>
            set.every((o) => !first.includes(o)),
          ),
          seed ^ 0x12f8b3ab,
        )[0]),
  ];
}
function deal(seed: number, round: 1 | 2) {
  const cards = shuffled(
    MASTER_FOODS.flatMap((food) =>
      Array.from({ length: 4 }, (_, i) => ({
        food,
        id: `master-${round}-${food}-${i}`,
      })),
    ),
    seed ^ (round * 0x9e3779b9),
  );
  return {
    market: cards.slice(0, 4),
    deck: cards.slice(4),
    orders: ordersFor(seed, round),
  };
}
export function createMaster(seed: number, starter: Team): MasterState {
  return {
    seed,
    starter,
    round: 1,
    turn: starter,
    phase: "playing",
    ...deal(seed, 1),
    hands: { A: [], B: [] },
    previous: { A: 0, B: 0 },
    picks: 0,
    last: "從四張公開菜色選一張",
  };
}
export const scoreMaster = (s: MasterState, t: Team) =>
  scoreMasterCounts(masterCounts(s.hands[t]), s.orders, s.phase !== "playing");
export function validMasterAction(a: unknown): a is MasterAction {
  if (!a || typeof a !== "object") return false;
  const x = a as MasterAction;
  return (
    x.type === "next-round" ||
    (x.type === "pick" && Number.isInteger(x.slot) && x.slot >= 0 && x.slot < 4)
  );
}
export function applyMaster(s: MasterState, a: MasterAction): MasterState {
  if (!validMasterAction(a)) throw Error("不是合法菜牌");
  if (a.type === "next-round") {
    if (s.phase !== "round_summary" || s.round !== 1)
      throw Error("目前不能換輪");
    return {
      ...s,
      ...deal(s.seed, 2),
      round: 2,
      turn: other(s.starter),
      phase: "playing",
      hands: { A: [], B: [] },
      previous: { A: scoreMaster(s, "A").total, B: scoreMaster(s, "B").total },
      picks: 0,
      last: "第2輪換先手，餐盤重新開始",
    };
  }
  if (s.phase !== "playing" || !s.market[a.slot]) throw Error("不是合法菜牌");
  const card = s.market[a.slot]!,
    market = [...s.market],
    deck = [...s.deck],
    picks = s.picks + 1;
  market[a.slot] = picks === 16 ? null : deck.shift()!;
  return {
    ...s,
    market,
    deck,
    picks,
    hands: { ...s.hands, [s.turn]: [...s.hands[s.turn], card] },
    turn: other(s.turn),
    phase:
      picks === 16 ? (s.round === 1 ? "round_summary" : "finished") : "playing",
    last: `${s.turn}隊拿了${a.slot + 1}號${MASTER_FOOD_NAMES[card.food]}`,
  };
}
export interface MasterObservation {
  turn: Team;
  market: (MasterFood | null)[];
  hands: Record<Team, MasterCounts>;
  orders: MasterOrder[];
  unknown: MasterCounts;
  remaining: Record<Team, number>;
}
/** This boundary deliberately excludes seed, card IDs, actual deck order, and past hidden state. */
export function observeMaster(s: MasterState): MasterObservation {
  const hands = { A: masterCounts(s.hands.A), B: masterCounts(s.hands.B) },
    unknown = emptyMasterCounts();
  for (const f of MASTER_FOODS)
    unknown[f] =
      4 -
      hands.A[f] -
      hands.B[f] -
      s.market.filter((c) => c?.food === f).length;
  return {
    turn: s.turn,
    market: s.market.map((c) => c?.food ?? null),
    hands,
    orders: [...s.orders],
    unknown,
    remaining: { A: 8 - s.hands.A.length, B: 8 - s.hands.B.length },
  };
}
