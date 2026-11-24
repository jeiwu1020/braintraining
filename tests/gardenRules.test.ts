import { it, expect } from "vitest";
import {
  createGarden,
  applyGarden,
  placements,
  scoreGarden,
  teamScore,
  gardenHighlights,
  resolveCellAnchor,
  currentSeason,
  rotated,
  gardenEngine,
} from "../games/playground/garden/rules";
import { restore, replay } from "../games/playground/session";

it("initializes central fountain, rotates tiles, and rejects overlap or disconnection from garden/fountain", () => {
  const s = createGarden(1, "normal", "A");
  expect(s.boards.A[12]).toBe("fountain");
  expect(s.boards.B[12]).toBe("fountain");
  expect(s.limit).toBe(8);
  expect(currentSeason(s).id).toBe("spring");
  expect(rotated(s.market[0], 4)).toEqual(rotated(s.market[0], 0));
  expect(() =>
    applyGarden(s, { type: "place", slot: 0, rotation: 0, x: 5, y: 5 }),
  ).toThrow();
  // Corner (0,0) does not touch central fountain at (2,2)
  expect(() =>
    applyGarden(s, { type: "place", slot: 0, rotation: 0, x: 0, y: 0 }),
  ).toThrow();
  const a = placements(s)[0];
  const n = applyGarden(s, a);
  const again = { ...n, turn: "A" as const };
  expect(() => applyGarden(again, a)).toThrow();
});

it("scores flower clusters (>=3 doubled), fountain-connected paths, seasonal awards", () => {
  const b = Array(25).fill(null);
  b[12] = "fountain";
  for (const i of [0, 1, 2]) b[i] = "rose"; // 3 * 2 = 6
  for (const i of [13, 14]) b[i] = "path"; // touches fountain at 12 -> 2 * 2 = 4
  const v = scoreGarden(b, 5, 2);
  expect(v.flowers).toBe(6);
  expect(v.paths).toBe(4);
  expect(v.season).toBe(2);
  expect(v.total).toBe(12);
  const hl = gardenHighlights(b, 5);
  expect([...hl.doubledFlowers]).toEqual([0, 1, 2]);
  expect([...hl.connectedPaths]).toEqual([13, 14]);
});

it("resolves intuitive solid-cell anchors including L-shapes rotated with empty top-left", () => {
  const s = createGarden(7, "normal", "A");
  const lIndex = s.market.findIndex((t) => t.some((c) => c.y === 1));
  if (lIndex >= 0) {
    const res = resolveCellAnchor(s, lIndex, 2, 2, 1);
    expect(res).toBeTruthy();
    if (res?.valid) {
      const cells = rotated(s.market[lIndex], 2).map((c) => ({
        x: c.x + res.anchor.x,
        y: c.y + res.anchor.y,
      }));
      expect(cells.some((c) => c.x === 2 && c.y === 1)).toBe(true);
    }
  }
});

it.each(["normal", "advanced"] as const)(
  "completes and replays 24 %s four-season drafting games",
  (level) => {
    for (let seed = 0; seed < 24; seed++) {
      let s = createGarden(seed, level, "A");
      const actions: any[] = [];
      while (s.phase !== "finished") {
        const options = placements(s);
        const a = options.length
          ? options[(seed * 13 + actions.length * 7) % options.length]
          : { type: "discard" as const };
        s = applyGarden(s, a);
        actions.push(a);
        expect(actions.length).toBeLessThanOrEqual(16);
      }
      expect(teamScore(s, "A").total).toBeGreaterThan(0);
      expect(teamScore(s, "B").total).toBeGreaterThan(0);
      const j: any = {
        version: 1,
        game: "garden",
        id: "garden",
        settings: { mode: "teams", level },
        seed,
        aiSeed: 0,
        starter: "A",
        actions,
      };
      expect(
        replay(
          restore(JSON.stringify(j), "garden", gardenEngine),
          gardenEngine,
        ).at(-1),
      ).toEqual(s);
      expect(() => applyGarden(s, actions[0])).toThrow();
    }
  },
);

it("rejects passing when a legal placement exists and allows discard only when board is full", () => {
  const s = createGarden(7, "normal", "A");
  expect(() => applyGarden(s, { type: "discard" })).toThrow();
  const full = { ...s, boards: { A: Array(25).fill("rose"), B: s.boards.B } };
  const n = applyGarden(full, { type: "discard" });
  expect(n.ply).toBe(1);
  expect(n.turn).toBe("B");
});
