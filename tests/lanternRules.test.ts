import { it, expect } from "vitest";
import {
  createLantern,
  applyLantern,
  legalLantern,
  scoreDistricts,
  lanternEngine,
} from "../games/playground/lantern/rules";
import { restore, replay } from "../games/playground/session";
it("scores majorities and splits occupied ties, with no points for empty districts", () => {
  expect(
    scoreDistricts(
      [
        [2, 1],
        [1, 1],
        [0, 0],
        [0, 2],
      ],
      [5, 5, 7, 4],
    ),
  ).toEqual({ A: 7, B: 6 });
});
it("guards reserves, movement, scoring windows and immutable input", () => {
  const s = createLantern(2, "normal", "A"),
    before = JSON.stringify(s);
  expect(() =>
    applyLantern(s, { type: "move", from: 0, to: 1, count: 1 }),
  ).toThrow();
  expect(() => applyLantern(s, { type: "next" })).toThrow();
  const n = applyLantern(s, { type: "place", to: 1, count: 2 });
  expect(n.reserve.A).toBe(6);
  expect(JSON.stringify(s)).toBe(before);
  expect(() =>
    applyLantern(
      { ...s, reserve: { A: 0, B: 8 } },
      { type: "place", to: 0, count: 1 },
    ),
  ).toThrow();
});
it.each(["normal", "advanced"] as const)(
  "completes 32 %s games with conserved supply and exactly three scoring events",
  (level) => {
    for (let seed = 0; seed < 32; seed++) {
      let s = createLantern(seed, level, "A");
      const actions: any[] = [];
      while (s.phase !== "finished") {
        const opts = legalLantern(s),
          a = opts[(seed * 7 + actions.length * 13) % opts.length];
        s = applyLantern(s, a);
        actions.push(a);
        for (const [i, t] of ["A", "B"].entries())
          expect(s.reserve[t] + s.districts.reduce((n, d) => n + d[i], 0)).toBe(
            level === "normal" ? 8 : 6,
          );
        expect(actions.length).toBeLessThanOrEqual(21);
      }
      expect(s.history).toHaveLength(3);
      expect(s.totals.A).toBe(s.history.reduce((n, h) => n + h.points.A, 0));
      const j: any = {
        version: 1,
        game: "lantern",
        id: "x",
        settings: { mode: "teams", level },
        seed,
        aiSeed: 0,
        starter: "A",
        actions,
      };
      expect(
        replay(
          restore(JSON.stringify(j), "lantern", lanternEngine),
          lanternEngine,
        ).at(-1),
      ).toEqual(s);
      expect(() => applyLantern(s, { type: "next" })).toThrow();
    }
  },
);

it("uses even district values in normal and advanced modes so ties split cleanly", () => {
  for (const level of ["normal", "advanced"] as const) {
    for (let seed = 0; seed < 16; seed++) {
      const s = createLantern(seed, level, "A");
      for (const wave of s.values) {
        for (const v of wave) {
          expect(v % 2).toBe(0);
        }
      }
    }
  }
});
