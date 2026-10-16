import { it, expect } from "vitest";
import {
  createAuction,
  applyAuction,
  legalAuction,
  exhibitionScore,
  auctionEngine,
} from "../games/playground/auction/rules";
import { restore, replay } from "../games/playground/session";
it("raises exactly one, releases losing bids and charges only the winner", () => {
  let s = createAuction(0, "normal", "A");
  const original = JSON.stringify(s);
  s = applyAuction(s, { type: "bid" });
  expect(s.price).toBe(1);
  expect(s.budgets).toEqual({ A: 18, B: 18 });
  s = applyAuction(s, { type: "bid" });
  expect(s.price).toBe(2);
  s = applyAuction(s, { type: "pass" });
  expect(s.phase).toBe("round_summary");
  expect(s.budgets).toEqual({ A: 18, B: 16 });
  expect(s.collections.B).toHaveLength(1);
  expect(s.sales[0].price).toBe(2);
  expect(JSON.parse(original).sales).toHaveLength(0);
  expect(() => applyAuction(s, { type: "pass" })).toThrow();
});
it("supports unsold exhibits and a single active bidder; forbids unaffordable bids", () => {
  let s = createAuction(0, "normal", "A");
  expect(() =>
    applyAuction({ ...s, budgets: { A: 0, B: 18 } }, { type: "bid" }),
  ).toThrow();
  s = applyAuction(s, { type: "pass" });
  s = applyAuction(s, { type: "pass" });
  expect(s.sales[0].owner).toBeNull();
  expect(s.budgets).toEqual({ A: 18, B: 18 });
  let one = applyAuction(createAuction(0, "normal", "A"), { type: "pass" });
  one = applyAuction(one, { type: "bid" });
  expect(one.phase).toBe("round_summary");
  expect(one.sales[0].owner).toBe("B");
  expect(one.budgets.B).toBe(17);
});
it("adds five points for each complete set of the three public exhibit types", () => {
  const e = createAuction(0, "normal", "A").exhibits;
  const c = [0, 1, 2].map((i) => ({
    ...e.find((x) => x.kind === ["ceramic", "bronze", "scroll"][i])!,
    price: 1,
  }));
  const score = exhibitionScore([...c, ...c]);
  expect(score.bonus).toBe(10);
  expect(score.total).toBe(score.base + 10);
});
it.each(["normal", "advanced"] as const)(
  "completes 48 %s auctions with conserved budgets and replayable bids",
  (level) => {
    for (let seed = 0; seed < 48; seed++) {
      let s = createAuction(seed, level, "A");
      const actions: any[] = [];
      while (s.phase !== "finished") {
        const opts = legalAuction(s),
          a = opts[(seed * 17 + actions.length * 7) % opts.length];
        s = applyAuction(s, a);
        actions.push(a);
        for (const t of ["A", "B"] as const) {
          expect(s.budgets[t]).toBeGreaterThanOrEqual(0);
          expect(
            s.budgets[t] + s.collections[t].reduce((n, e) => n + e.price, 0),
          ).toBe(level === "normal" ? 18 : 22);
        }
        expect(actions.length).toBeLessThanOrEqual(80);
      }
      expect(s.sales).toHaveLength(s.exhibits.length);
      const j: any = {
        version: 1,
        game: "auction",
        id: "x",
        settings: { mode: "teams", level },
        seed,
        aiSeed: 0,
        starter: "A",
        actions,
      };
      expect(
        replay(
          restore(JSON.stringify(j), "auction", auctionEngine),
          auctionEngine,
        ).at(-1),
      ).toEqual(s);
      expect(() => applyAuction(s, { type: "next" })).toThrow();
    }
  },
);
