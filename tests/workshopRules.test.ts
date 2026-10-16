import { it, expect } from "vitest";
import {
  createWorkshop,
  applyWorkshop,
  legalWorkshop,
  workshopEngine,
} from "../games/playground/workshop/rules";
import { restore, replay } from "../games/playground/session";
it("blocks occupied stations and resources, while upgrades reward investment on later visits", () => {
  let s = createWorkshop(0, "normal", "A");
  const original = JSON.stringify(s);
  const n = applyWorkshop(s, { type: "use", station: "wood", count: 1 });
  expect(n.stock.A.wood).toBe(3);
  expect(JSON.stringify(s)).toBe(original);
  expect(() =>
    applyWorkshop(n, { type: "use", station: "wood", count: 1 }),
  ).toThrow();
  expect(() =>
    applyWorkshop(s, { type: "use", station: "ship", count: 1 }),
  ).toThrow();
  s = {
    ...s,
    stock: {
      ...s.stock,
      A: { wood: 4, metal: 3, goods: 1, level: 0, score: 0 },
    },
  };
  s = applyWorkshop(s, { type: "use", station: "upgrade", count: 1 });
  expect(s.stock.A.level).toBe(1);
  s = applyWorkshop(s, { type: "rest" });
  s = applyWorkshop(s, { type: "use", station: "ship", count: 1 });
  expect(s.stock.A.score).toBe(6);
});
it("requires a round boundary before freeing stations and gives no points for leftover materials", () => {
  let s = createWorkshop(0, "normal", "A");
  expect(() => applyWorkshop(s, { type: "next" })).toThrow();
  for (let i = 0; i < 4; i++) s = applyWorkshop(s, { type: "rest" });
  expect(s.phase).toBe("round_summary");
  s = applyWorkshop(s, { type: "next" });
  expect(s.workers).toEqual({ A: 2, B: 2 });
  expect(Object.values(s.occupied).every((x) => x === null)).toBe(true);
});
it.each(["normal", "advanced"] as const)(
  "completes and replays 32 %s worker games",
  (level) => {
    for (let seed = 0; seed < 32; seed++) {
      let s = createWorkshop(seed, level, "A");
      const actions: any[] = [];
      while (s.phase !== "finished") {
        const opts = legalWorkshop(s),
          a = opts[(seed * 11 + actions.length * 7) % opts.length];
        s = applyWorkshop(s, a);
        actions.push(a);
        for (const v of Object.values(s.stock)) {
          expect(v.wood).toBeGreaterThanOrEqual(0);
          expect(v.metal).toBeGreaterThanOrEqual(0);
          expect(v.goods).toBeGreaterThanOrEqual(0);
          expect(v.level).toBeLessThanOrEqual(2);
        }
        expect(actions.length).toBeLessThanOrEqual(42);
      }
      const j: any = {
        version: 1,
        game: "workshop",
        id: "x",
        settings: { mode: "teams", level },
        seed,
        aiSeed: 0,
        starter: "A",
        actions,
      };
      expect(
        replay(
          restore(JSON.stringify(j), "workshop", workshopEngine),
          workshopEngine,
        ).at(-1),
      ).toEqual(s);
      expect(() => applyWorkshop(s, { type: "rest" })).toThrow();
    }
  },
);

it("uses one worker for a two-piece batch, alternates daily first player and leaves stock unscored at closing", () => {
  let s = createWorkshop(0, "normal", "A");
  s = {
    ...s,
    stock: {
      ...s.stock,
      A: { wood: 6, metal: 6, goods: 0, level: 2, score: 7 },
    },
  };
  s = applyWorkshop(s, { type: "use", station: "craft", count: 2 });
  expect(s.workers.A).toBe(1);
  expect(s.stock.A.goods).toBe(2);
  while (s.phase === "playing") s = applyWorkshop(s, { type: "rest" });
  s = applyWorkshop(s, { type: "next" });
  expect(s.turn).toBe("B");
  while (s.phase !== "finished")
    s = applyWorkshop(
      s,
      s.phase === "round_summary" ? { type: "next" } : { type: "rest" },
    );
  expect(s.stock.A.score).toBe(7);
  expect(s.stock.A.goods).toBe(2);
  expect(s.stock.A.wood).toBe(4);
});
