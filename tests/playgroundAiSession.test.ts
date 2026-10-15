import { describe, it, expect, vi } from "vitest";
import { chooseNight } from "../games/playground/night-market/ai";
import * as N from "../games/playground/night-market/rules";
import { chooseWall } from "../games/playground/wall-race/ai";
import * as W from "../games/playground/wall-race/rules";
import { replay, restore, SavedSession } from "../games/playground/session";
import { random } from "../games/playground/types";
const ne = {
  create: N.createNight,
  apply: N.applyNight,
  validAction: (a: any): a is N.NightAction =>
    a?.type === "next-round" || a?.type === "pick",
};
const we = {
  create: (_: number, level: any, starter: any) => W.createWall(level, starter),
  apply: W.applyWall,
  validAction: (a: any): a is W.WallAction =>
    a?.type === "move" || a?.type === "wall",
};
const envelope = (game: "night-market" | "wall-race"): SavedSession<any> => ({
  version: 1,
  game,
  id: "test",
  settings: { mode: "teams", level: "normal" },
  seed: 42,
  aiSeed: 5,
  starter: "A",
  actions: [],
});
describe("playground replay and recovery", () => {
  it("rejects corrupt, unsupported, illegal and oversized journals", () => {
    for (const raw of [
      "bad",
      "null",
      JSON.stringify({ ...envelope("night-market"), version: 2 }),
      JSON.stringify({
        ...envelope("night-market"),
        actions: [{ type: "pick", slot: 5 }],
      }),
      JSON.stringify({
        ...envelope("night-market"),
        actions: Array(26).fill({ type: "pick", slot: 0 }),
      }),
    ])
      expect(() => restore(raw, "night-market", ne)).toThrow();
    expect(() =>
      restore(JSON.stringify(envelope("night-market")), "wall-race", we),
    ).toThrow();
  });
  it("replays exactly and undo does not redraw", () => {
    const e = envelope("night-market");
    e.actions = [
      { type: "pick", slot: 0 },
      { type: "pick", slot: 1 },
    ];
    const original = replay(e, ne);
    expect(replay(restore(JSON.stringify(e), "night-market", ne), ne)).toEqual(
      original,
    );
    const undo = { ...e, actions: e.actions.slice(0, 1) };
    expect(replay(undo, ne).at(-1)).toEqual(original[1]);
    expect(
      N.applyNight(replay(undo, ne).at(-1)!, { type: "pick", slot: 1 }),
    ).toEqual(original[2]);
  });
  it("restores wall counts, repetitions, turn and resources exactly", () => {
    const e = envelope("wall-race");
    e.actions = [
      { type: "wall", wall: { x: 0, y: 0, dir: "h" } },
      { type: "move", to: 7 },
      { type: "move", to: 17 },
    ];
    const original = replay(e, we);
    expect(replay(restore(JSON.stringify(e), "wall-race", we), we)).toEqual(
      original,
    );
    expect(replay({ ...e, actions: e.actions.slice(0, 1) }, we).at(-1)).toEqual(
      original[1],
    );
  });
});
describe("AI observation and legal decisions", () => {
  it("night AI cannot distinguish privately permuted decks or seeds", () => {
    for (const level of ["normal", "advanced"] as const) {
      let s = N.createNight(77, level, "A");
      for (let p = 0; p < 12; p++) {
        const a = N.observeNight(s),
          b = N.observeNight({ ...s, seed: 9, deck: [...s.deck].reverse() });
        expect(a).toEqual(b);
        for (let seed = 0; seed < 8; seed++)
          expect(chooseNight(a, seed)).toBe(chooseNight(b, seed));
        const slot = chooseNight(a, p);
        expect(s.market[slot]).toBeTruthy();
        s = N.applyNight(s, { type: "pick", slot });
      }
    }
  });
  it("normal and advanced wall AI take immediate wins and respect legal actions", () => {
    for (const level of ["normal", "advanced"] as const) {
      const s = {
        ...W.createWall(level, "A"),
        pawns: { A: 5, B: 24 },
        ply: 79,
      };
      const result = chooseWall(s);
      expect(result.action).toEqual({ type: "move", to: 0 });
      expect(W.applyWall(s, result.action).result).toBe("A");
    }
    const advanced = W.createWall("advanced", "A");
    // Depth is a deterministic node-budget contract, not a CPU-load benchmark.
    const clock = vi.spyOn(performance, "now").mockReturnValue(0);
    let r;
    try {
      r = chooseWall(advanced, 450, 6000);
    } finally {
      clock.mockRestore();
    }
    expect(r.depth).toBeGreaterThanOrEqual(2);
    expect(r.nodes).toBeLessThanOrEqual(6000);
    expect(W.legalActions(advanced)).toContainEqual(r.action);
    let ticks = 0;
    const timedClock = vi
      .spyOn(performance, "now")
      .mockImplementation(() => ticks++ * 10);
    let bounded;
    try {
      bounded = chooseWall(advanced, 40, 6000);
    } finally {
      timedClock.mockRestore();
    }
    expect(bounded.elapsed).toBeLessThanOrEqual(60);
    expect(bounded.depth).toBeLessThan(3);
    expect(W.legalActions(advanced)).toContainEqual(bounded.action);
  });
  it("plays complete games on shared rules and preserves both routes", () => {
    const rng = random(422);
    let completed = 0;
    for (let game = 0; game < 12; game++) {
      let s = W.createWall(game % 2 ? "normal" : "advanced", "A");
      while (s.phase === "playing") {
        const actions = W.legalActions(s);
        expect(actions.length).toBeGreaterThan(0);
        const a =
          game < 2
            ? chooseWall(s, 25, 300).action
            : actions[Math.floor(rng() * actions.length)];
        s = W.applyWall(s, a);
        expect(W.path(s, "A").length).toBeGreaterThan(0);
        expect(W.path(s, "B").length).toBeGreaterThan(0);
        expect(s.reserve.A).toBeGreaterThanOrEqual(0);
        expect(s.reserve.B).toBeGreaterThanOrEqual(0);
      }
      expect(s.ply).toBeLessThanOrEqual(80);
      completed++;
    }
    expect(completed).toBe(12);
  });
});
describe("wall edge contract", () => {
  const canonical = (a: number, b: number) =>
    `${Math.min(a, b)}:${Math.max(a, b)}`;
  it("maps all 32 walls to the exact two edges", () => {
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const p = y * 5 + x;
        expect(W.wallEdges({ x, y, dir: "h" })).toEqual([
          canonical(p, p + 5),
          canonical(p + 1, p + 6),
        ]);
        expect(W.wallEdges({ x, y, dir: "v" })).toEqual([
          canonical(p, p + 1),
          canonical(p + 5, p + 6),
        ]);
      }
  });
  it("supports all four boundary jumps and one-sided blocked side jumps", () => {
    for (const [a, b, sides] of [
      [5, 0, [1]],
      [1, 0, [5]],
      [19, 24, [23]],
      [23, 24, [19]],
    ] as [number, number, number[]][]) {
      const s = { ...W.createWall("normal", "A"), pawns: { A: a, B: b } };
      for (const side of sides) expect(W.moves(s)).toContain(side);
    }
    const s = {
      ...W.createWall("normal", "A"),
      pawns: { A: 12, B: 7 },
      walls: [
        { x: 1, y: 0, dir: "h" as const },
        { x: 1, y: 1, dir: "v" as const },
      ],
    };
    expect(W.moves(s)).toContain(8);
    expect(W.moves(s)).not.toContain(6);
  });
  it("refuses complete enclosure, accepts a detour, and ignores pawn occupancy in path search", () => {
    let s = {
      ...W.createWall("advanced", "A"),
      pawns: { A: 20, B: 2 },
      walls: [{ x: 0, y: 3, dir: "h" as const }],
    };
    expect(W.wallError(s, { x: 0, y: 3, dir: "v" })).toBe("牆交叉");
    // A at A5 is already blocked to A4 by A4 horizontal. B4 vertical closes A5→B5 only if x=0,y=2 is not used; A4 vertical crosses, so construct another valid corner.
    const corner = {
      ...W.createWall("advanced", "A"),
      pawns: { A: 0, B: 22 },
      walls: [{ x: 0, y: 0, dir: "h" as const }],
    };
    expect(W.wallError(corner, { x: 0, y: 0, dir: "v" })).toBe("牆交叉");
    let found = false;
    const rng = random(6);
    for (let trial = 0; trial < 40 && !found; trial++) {
      let b = W.createWall("advanced", "A");
      for (let n = 0; n < 10; n++) {
        const walls = W.legalActions(b).filter((a) => a.type === "wall");
        if (!walls.length) break;
        b = W.applyWall(b, walls[Math.floor(rng() * walls.length)]);
        for (let y = 0; y < 4; y++)
          for (let x = 0; x < 4; x++)
            for (const dir of ["h", "v"] as const)
              if (
                W.wallError(
                  { ...b, reserve: { A: 5, B: 5 } },
                  { x, y, dir },
                )?.includes("沒有通往")
              )
                found = true;
      }
    }
    expect(found).toBe(true);
    const occupied = { ...W.createWall("normal", "A"), pawns: { A: 7, B: 2 } };
    expect(W.path(occupied, "A")).toEqual([7, 2]);
    expect(
      W.wallError(W.createWall("normal", "A"), { x: 1, y: 0, dir: "h" }),
    ).toBeNull();
  });
});
