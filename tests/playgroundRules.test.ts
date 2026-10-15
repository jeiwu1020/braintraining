import { describe, it, expect } from "vitest";
import * as N from "../games/playground/night-market/rules";
import * as W from "../games/playground/wall-race/rules";
describe("night market rules", () => {
  it("scores every 0–6 count and examples", () => {
    const values = [
      [0, 1, 5, 6, 10, 11, 15],
      [0, 2, 4, 6, 8, 10, 12],
      [0, 4, 5, 6, 7, 8, 9],
    ];
    N.FOODS.forEach((f, i) =>
      values[i].forEach((v, n) => expect(N.foodScore(f, n)).toBe(v)),
    );
    expect(N.scoreCounts({ rice: 2, corn: 3, tofu: 1 }).base).toBe(15);
    expect(N.scoreCounts({ rice: 4, corn: 1, tofu: 1 }).base).toBe(16);
  });
  it("conserves cards, alternates starters, and finishes two rounds", () => {
    let s = N.createNight(42, "advanced", "A");
    for (let r = 1; r <= 2; r++) {
      expect(new Set(s.orders).size).toBe(2);
      for (let i = 0; i < 12; i++) {
        const all = [
          ...s.deck,
          ...s.market.filter(Boolean),
          ...s.hands.A,
          ...s.hands.B,
        ];
        expect(all.length).toBe(18);
        expect(new Set(all.map((c) => c!.id)).size).toBe(18);
        s = N.applyNight(s, { type: "pick", slot: 0 });
      }
      expect(s.hands.A.length).toBe(6);
      expect(s.hands.B.length).toBe(6);
      expect(s.deck.length).toBe(3);
      expect(s.market.filter(Boolean).length).toBe(3);
      if (r === 1) {
        expect(s.phase).toBe("round_summary");
        s = N.applyNight(s, { type: "next-round" });
        expect(s.turn).toBe("B");
      }
    }
    expect(s.phase).toBe("finished");
  });
  it("awards public orders only at round end and hides private state", () => {
    expect(
      N.scoreCounts({ rice: 2, corn: 0, tofu: 0 }, ["even"], false).bonus,
    ).toBe(0);
    expect(
      N.scoreCounts({ rice: 2, corn: 2, tofu: 2 }, ["even", "variety"], true)
        .bonus,
    ).toBe(6);
    const a = N.createNight(125, "advanced", "A");
    expect(N.observeNight(a)).toEqual(
      N.observeNight({ ...a, seed: 7, deck: [...a.deck].reverse() }),
    );
    expect(N.applyNight(a, { type: "pick", slot: 2 })).toEqual(
      N.applyNight(N.createNight(125, "advanced", "A"), {
        type: "pick",
        slot: 2,
      }),
    );
  });
});
describe("wall race rules", () => {
  it("has the right initial state and orthogonal moves", () => {
    const s = W.createWall("normal", "A");
    expect(s.pawns).toEqual({ A: 22, B: 2 });
    expect(s.reserve.A).toBe(3);
    expect(W.moves(s).sort((a, b) => a - b)).toEqual([17, 21, 23]);
    expect(() => W.applyWall(s, { type: "move", to: 16 })).toThrow();
  });
  it("uses straight jumps first, side jumps only when blocked", () => {
    const s = { ...W.createWall("normal", "A"), pawns: { A: 12, B: 7 } };
    expect(W.moves(s)).toContain(2);
    expect(W.moves(s)).not.toContain(6);
    const b = { ...s, walls: [{ x: 1, y: 0, dir: "h" as const }] };
    expect(W.moves(b)).not.toContain(2);
    expect(W.moves(b)).toEqual(expect.arrayContaining([6, 8]));
    const c = { ...s, walls: [{ x: 1, y: 1, dir: "h" as const }] };
    expect(W.moves(c)).not.toContain(2);
    expect(W.moves(c)).not.toContain(6);
  });
  it("maps anchors and rejects overlaps and crossings but allows endpoint contact", () => {
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++)
        for (const dir of ["h", "v"] as const)
          expect(W.wallEdges({ x, y, dir })).toHaveLength(2);
    const s = {
      ...W.createWall("normal", "A"),
      walls: [{ x: 1, y: 1, dir: "h" as const }],
    };
    expect(W.wallError(s, { x: 2, y: 1, dir: "h" })).toBe("牆重疊");
    expect(W.wallError(s, { x: 1, y: 1, dir: "v" })).toBe("牆交叉");
    expect(W.wallError(s, { x: 0, y: 2, dir: "v" })).toBeNull();
    expect(W.wallError(s, { x: 4, y: 0, dir: "h" })).toBe("牆超出棋盤");
  });
  it("prioritizes arrival on move 80 and detects the third full repetition", () => {
    const s = {
      ...W.createWall("normal", "A"),
      pawns: { A: 5, B: 24 },
      ply: 79,
    };
    expect(W.applyWall(s, { type: "move", to: 0 }).result).toBe("A");
    expect(W.positionKey(s)).not.toBe(W.positionKey({ ...s, turn: "B" }));
    let r = W.createWall("normal", "A");
    for (let i = 0; i < 2; i++)
      for (const to of [21, 1, 22, 2]) r = W.applyWall(r, { type: "move", to });
    expect(r.result).toBe("repetition");
  });
});
