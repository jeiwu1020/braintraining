import { other, random, type AiDifficulty, type Team } from "../types";
import {
  MASTER_FOODS,
  MASTER_ORDERS,
  legalMasterHands,
  masterNeeded,
  matchesMasterOrder,
  scoreMasterCounts,
  type MasterCounts,
  type MasterFood,
  type MasterObservation,
} from "./masterRules";
const add = (c: MasterCounts, f: MasterFood): MasterCounts => ({
  ...c,
  [f]: c[f] + 1,
});
function value(
  o: MasterObservation,
  c: MasterCounts,
  remaining: number,
): number {
  if (remaining === 0) return scoreMasterCounts(c, o.orders, true).total;
  let v = scoreMasterCounts(c).base;
  const available = Object.fromEntries(
    MASTER_FOODS.map((f) => [
      f,
      o.unknown[f] + o.market.filter((x) => x === f).length,
    ]),
  ) as MasterCounts;
  const feasible = legalMasterHands().filter((h) =>
    MASTER_FOODS.every((f) => h[f] >= c[f] && h[f] - c[f] <= available[f]),
  );
  for (const order of o.orders) {
    if (feasible.some((h) => matchesMasterOrder(h, order)))
      v +=
        MASTER_ORDERS[order].points *
        (matchesMasterOrder(c, order)
          ? 0.72
          : 0.48 / (masterNeeded(c, order) + 0.5));
  }
  if (c.rice % 2 && available.rice > 0) v += 1.2;
  return v;
}
function take(o: MasterObservation, t: Team, slot: number) {
  const food = o.market[slot]!,
    market = [...o.market];
  market[slot] = null;
  return {
    ...o,
    market,
    hands: { ...o.hands, [t]: add(o.hands[t], food) },
    remaining: { ...o.remaining, [t]: o.remaining[t] - 1 },
  };
}
function expectedNextGain(o: MasterObservation, t: Team, slot: number): number {
  if (o.remaining[t] <= 0) return 0;
  const total = MASTER_FOODS.reduce((n, f) => n + o.unknown[f], 0);
  const draws = total
    ? MASTER_FOODS.filter((f) => o.unknown[f] > 0).map((food) => ({
        food,
        weight: o.unknown[food] / total,
      }))
    : [{ food: null, weight: 1 }];
  let gain = 0;
  for (const draw of draws) {
    const market = [...o.market];
    market[slot] = draw.food;
    const next = {
      ...o,
      market,
      unknown: draw.food
        ? { ...o.unknown, [draw.food]: o.unknown[draw.food] - 1 }
        : o.unknown,
    };
    const before = value(next, next.hands[t], next.remaining[t]);
    gain +=
      draw.weight *
      Math.max(
        0,
        ...market.flatMap((food, i) =>
          food
            ? [
                value(
                  take(next, t, i),
                  add(next.hands[t], food),
                  next.remaining[t] - 1,
                ) - before,
              ]
            : [],
        ),
      );
  }
  return gain;
}
export function chooseMaster(
  o: MasterObservation,
  seed: number,
  difficulty: AiDifficulty,
): number {
  const legal = o.market.flatMap((f, i) => (f ? [i] : []));
  if (!legal.length) throw Error("沒有合法菜牌");
  const rng = random(seed),
    me = o.turn,
    op = other(me);
  const scored = legal.map((slot) => {
    const next = take(o, me, slot);
    let score = value(next, next.hands[me], next.remaining[me]);
    if (difficulty !== "easy") score += 0.3 * expectedNextGain(next, me, slot);
    if (difficulty === "challenge")
      score -= 0.6 * expectedNextGain(next, op, slot);
    return { slot, score };
  });
  const best = Math.max(...scored.map((x) => x.score));
  const choices = scored.filter(
    (x) => x.score >= best - (difficulty === "easy" ? 1.5 : 0.000001),
  );
  return choices[Math.floor(rng() * choices.length)].slot;
}
