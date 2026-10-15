import { other, random, Team } from "../types";
import {
  Counts,
  Food,
  FOODS,
  matchesOrder,
  Observation,
  ORDERS,
  scoreCounts,
} from "./rules";
const add = (c: Counts, f: Food): Counts => ({ ...c, [f]: c[f] + 1 });
function value(o: Observation, c: Counts, remaining: number): number {
  let v = scoreCounts(c).base;
  if (remaining > 0 && c.rice % 2 === 1) v += 1.5;
  if (o.level === "advanced")
    for (const order of o.orders) {
      if (remaining === 0) {
        if (matchesOrder(c, order)) v += ORDERS[order].points;
        continue;
      }
      // Public availability bounds: estimate feasibility, never inspect the real deck.
      const available = FOODS.map(
        (f) => o.unknown[f] + o.market.filter((x) => x === f).length,
      );
      const ns = FOODS.map((f) => c[f]);
      let needed = 0,
        possible = true;
      if (order === "variety") {
        needed = ns.filter((n) => n === 0).length;
        possible = ns.every((n, i) => n > 0 || available[i] > 0);
      }
      if (order === "specialty") {
        needed = Math.min(...ns.map((n) => Math.max(0, 4 - n)));
        possible = ns.some((n, i) => n + available[i] >= 4);
      }
      if (order === "sharing") {
        needed = ns
          .map((n) => Math.max(0, 2 - n))
          .sort((a, b) => a - b)
          .slice(0, 2)
          .reduce((a, b) => a + b, 0);
        possible = ns.filter((n, i) => n + available[i] >= 2).length >= 2;
      }
      if (order === "even") {
        needed = ns.filter((n) => n % 2 === 1).length;
        possible = ns.every((n, i) => n % 2 === 0 || available[i] > 0);
      }
      if (possible && needed <= remaining)
        v +=
          ORDERS[order].points * (needed === 0 ? 0.7 : 0.45 / (needed + 0.3));
    }
  return v;
}
export function chooseNight(o: Observation, aiSeed: number): number {
  const me = o.turn,
    op = other(me),
    legal = o.market
      .map((food, i) => (food !== null ? i : -1))
      .filter((i) => i >= 0);
  if (!legal.length) throw new Error("沒有合法菜牌");
  const tie = random(aiSeed);
  let best = -Infinity,
    chosen = legal[0];
  for (const slot of legal) {
    const food = o.market[slot]!,
      mine = add(o.hands[me], food);
    let score =
      value(o, mine, o.remaining[me] - 1) -
      value(o, o.hands[me], o.remaining[me]);
    if (o.level === "advanced" && o.remaining[op] > 0) {
      const unknownTotal = FOODS.reduce((n, f) => n + o.unknown[f], 0);
      const outcomes: { food: Food | null; weight: number }[] = unknownTotal
        ? FOODS.filter((f) => o.unknown[f] > 0).map((f) => ({
            food: f,
            weight: o.unknown[f] / unknownTotal,
          }))
        : [{ food: null, weight: 1 }];
      let opponentGain = 0;
      for (const draw of outcomes) {
        const market = [...o.market];
        market[slot] = draw.food;
        const response = market
          .filter((f): f is Food => f !== null)
          .map(
            (f) =>
              value(o, add(o.hands[op], f), o.remaining[op] - 1) -
              value(o, o.hands[op], o.remaining[op]),
          );
        opponentGain += draw.weight * Math.max(0, ...response);
      }
      score -= 0.6 * opponentGain;
    }
    score += tie() * 0.00001;
    if (score > best) {
      best = score;
      chosen = slot;
    }
  }
  return chosen;
}
