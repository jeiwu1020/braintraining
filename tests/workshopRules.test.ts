import { it, expect } from "vitest";
import {
  createWorkshop,
  applyWorkshop,
  legalWorkshop,
  validWorkshop,
  workshopError,
  workshopEngine,
} from "../games/playground/workshop/rules";
import { restore, replay } from "../games/playground/session";

it("blocks occupied stations, batches craft/ship and supports instant rush orders", () => {
  let s = createWorkshop(0, "normal", "A");
  const original = JSON.stringify(s);
  const n = applyWorkshop(s, { type: "use", station: "wood" });
  expect(n.stock.A.materials).toBe(3);
  expect(JSON.stringify(s)).toBe(original);
  expect(() => applyWorkshop(n, { type: "use", station: "wood" })).toThrow();
  expect(() => applyWorkshop(s, { type: "use", station: "ship" })).toThrow();

  expect(() => applyWorkshop(n, { type: "use", station: "upgrade" })).toThrow();
});

it("applies wood(+2), metal(+3), batch craft, rush order(+4) and full ship(+6/good)", () => {
  let s = createWorkshop(0, "normal", "A");
  s = {
    ...s,
    stock: {
      A: { materials: 5, goods: 1, score: 0 },
      B: { materials: 2, goods: 0, score: 0 },
    },
  };
  s = applyWorkshop(s, { type: "use", station: "craft" }); // A uses 4 materials -> +2 goods (total 3 goods, 1 mat)
  expect(s.stock.A).toEqual({ materials: 1, goods: 3, score: 0 });
  s = applyWorkshop(s, { type: "use", station: "upgrade" }); // B rush: 2 mat -> +4 score
  expect(s.stock.B).toEqual({ materials: 0, goods: 0, score: 4 });
  s = applyWorkshop(s, { type: "use", station: "ship" }); // A ships all 3 goods -> +18 score
  expect(s.stock.A).toEqual({ materials: 1, goods: 0, score: 18 });
});

it("requires a round boundary before freeing stations and gives no points for leftover stock", () => {
  let s = createWorkshop(0, "normal", "A");
  expect(() => applyWorkshop(s, { type: "next" })).toThrow();
  for (let i = 0; i < 4; i++) s = applyWorkshop(s, { type: "rest" });
  expect(s.phase).toBe("round_summary");
  expect(s.stock.A.materials).toBe(3);
  expect(s.stock.B.materials).toBe(3);
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
          expect(v.materials).toBeGreaterThanOrEqual(0);
          expect(v.materials).toBeLessThanOrEqual(6);
          expect(v.goods).toBeGreaterThanOrEqual(0);
          expect(v.goods).toBeLessThanOrEqual(4);
        }
        expect(actions.length).toBeLessThanOrEqual(35);
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

it("keeps rest available at cap 6 without exceeding max and alternates daily first player", () => {
  let s = createWorkshop(0, "advanced", "B");
  s.stock.B.materials = 6;
  expect(workshopError(s, { type: "use", station: "metal" })).toBeTruthy();
  expect(workshopError(s, { type: "rest" })).toBeNull();
  s = applyWorkshop(s, { type: "rest" });
  expect(s.stock.B.materials).toBe(6);
  expect(s.turn).toBe("A");
  while (s.phase === "playing") s = applyWorkshop(s, { type: "rest" });
  const next = applyWorkshop(s, { type: "next" });
  expect(next.turn).toBe("A");
  expect(next.workers).toEqual({ A: 3, B: 3 });
});

it("uses deterministic symmetric advanced opening supplies", () => {
  const openings = new Set<number>();
  for (let seed = 0; seed < 24; seed++) {
    const s = createWorkshop(seed, "advanced", "A");
    expect(s).toEqual(createWorkshop(seed, "advanced", "A"));
    expect(s.stock.A).toEqual(s.stock.B);
    expect(s.workers).toEqual({ A: 3, B: 3 });
    expect(s.limit).toBe(5);
    openings.add(s.stock.A.materials);
  }
  expect(openings).toEqual(new Set([1, 2]));
  expect(validWorkshop({ type: "rest" })).toBe(true);
  expect(validWorkshop({ type: "use", station: "metal" })).toBe(true);
  expect(validWorkshop({ type: "use", station: "bogus" })).toBe(false);
});
