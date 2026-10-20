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

it.each(["wood", "metal"] as const)(
  "lets an advanced worker rest for one %s without claiming a shared station",
  (resource) => {
    const s = createWorkshop(0, "advanced", "A");
    s.occupied[resource] = "B";
    s.stock.A.level = 2;
    const original = JSON.stringify(s);
    const action = { type: "rest", resource } as const;
    const n = applyWorkshop(s, action);
    expect(n.stock.A[resource]).toBe(s.stock.A[resource] + 1);
    expect(n.stock.A[resource === "wood" ? "metal" : "wood"]).toBe(
      s.stock.A[resource === "wood" ? "metal" : "wood"],
    );
    expect(n.workers.A).toBe(2);
    expect(n.workers.B).toBe(3);
    expect(n.turn).toBe("B");
    expect(n.occupied).toEqual(s.occupied);
    expect(n.stock.A.score).toBe(0);
    expect(JSON.stringify(s)).toBe(original);
  },
);

it("offers only legal advanced rest resources and keeps no-resource rest available at capacity", () => {
  const s = createWorkshop(0, "advanced", "A");
  s.stock.A.wood = 6;
  s.stock.A.metal = 5;
  expect(workshopError(s, { type: "rest", resource: "wood" } as any)).toBeTruthy();
  expect(() =>
    applyWorkshop(s, { type: "rest", resource: "wood" } as any),
  ).toThrow();
  expect(legalWorkshop(s)).not.toContainEqual({ type: "rest", resource: "wood" });
  expect(legalWorkshop(s)).toContainEqual({ type: "rest", resource: "metal" });
  const n = applyWorkshop(s, { type: "rest", resource: "metal" } as any);
  expect(n.stock.A.metal).toBe(6);
  s.stock.A.metal = 6;
  expect(legalWorkshop(s).filter((a) => a.type === "rest")).toEqual([
    { type: "rest" },
  ]);
  expect(applyWorkshop(s, { type: "rest" }).stock).toEqual(s.stock);
});

it("keeps normal opening and rest unchanged, and rejects resource collection in normal mode", () => {
  for (const seed of [0, 1, 2, 17, 0xffffffff]) {
    const s = createWorkshop(seed, "normal", "A");
    expect(s.stock.A).toEqual({ wood: 1, metal: 1, goods: 0, level: 0, score: 0 });
    expect(s.stock.B).toEqual(s.stock.A);
    expect(applyWorkshop(s, { type: "rest" }).stock).toEqual(s.stock);
    expect(legalWorkshop(s).filter((a) => a.type === "rest")).toEqual([
      { type: "rest" },
    ]);
    expect(() =>
      applyWorkshop(s, { type: "rest", resource: "wood" } as any),
    ).toThrow();
  }
});

it("validates rest-resource choices instead of accepting arbitrary stock names", () => {
  expect(validWorkshop({ type: "rest" })).toBe(true);
  expect(validWorkshop({ type: "rest", resource: "wood" })).toBe(true);
  expect(validWorkshop({ type: "rest", resource: "metal" })).toBe(true);
  for (const resource of ["goods", "score", "level", "", 1, null]) {
    expect(validWorkshop({ type: "rest", resource })).toBe(false);
  }
});

it("uses a small deterministic set of symmetric advanced opening supplies", () => {
  const openings = new Set<string>();
  for (let seed = 0; seed < 24; seed++) {
    const s = createWorkshop(seed, "advanced", "A");
    expect(s).toEqual(createWorkshop(seed, "advanced", "A"));
    expect(s.stock.A).toEqual(s.stock.B);
    expect(s.stock.A).not.toBe(s.stock.B);
    expect(s.stock.A.goods).toBe(0);
    expect(s.stock.A.level).toBe(0);
    expect(s.stock.A.score).toBe(0);
    expect(s.workers).toEqual({ A: 3, B: 3 });
    expect(s.limit).toBe(6);
    expect(s.message).toContain(`木料${s.stock.A.wood}`);
    expect(s.message).toContain(`金屬${s.stock.A.metal}`);
    openings.add(`${s.stock.A.wood}/${s.stock.A.metal}`);
  }
  expect(openings).toEqual(new Set(["1/1", "2/1", "1/2"]));
});

it("ends an advanced workday after six rests and preserves gained resources across days", () => {
  let s = createWorkshop(0, "advanced", "B");
  for (let i = 0; i < 6; i++) {
    s = applyWorkshop(s, {
      type: "rest",
      resource: i % 2 === 0 ? "wood" : "metal",
    } as any);
  }
  expect(s.phase).toBe("round_summary");
  expect(s.workers).toEqual({ A: 0, B: 0 });
  expect(s.stock.A.metal).toBe(4);
  expect(s.stock.B.wood).toBe(4);
  expect(Object.values(s.occupied).every((station) => station === null)).toBe(true);
  expect(() =>
    applyWorkshop(s, { type: "rest", resource: "wood" } as any),
  ).toThrow();
  const n = applyWorkshop(s, { type: "next" });
  expect(n.stock).toEqual(s.stock);
  expect(n.workers).toEqual({ A: 3, B: 3 });
  expect(n.turn).toBe("A");
});

