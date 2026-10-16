import { it, expect } from "vitest";
import {
  createGarden,
  applyGarden,
  placements,
  scoreGarden,
  rotated,
  gardenEngine,
} from "../games/playground/garden/rules";
import { restore, replay } from "../games/playground/session";
it("rotates without losing cell kinds; rejects overlap, disconnection and out-of-bounds", () => {
  const s = createGarden(1, "normal", "A");
  expect(rotated(s.market[0], 4)).toEqual(rotated(s.market[0], 0));
  expect(() =>
    applyGarden(s, { type: "place", slot: 0, rotation: 0, x: 5, y: 5 }),
  ).toThrow();
  const a = placements(s)[0];
  const n = applyGarden(s, a);
  const again = { ...n, turn: "A" as const };
  expect(() => applyGarden(again, a)).toThrow();
  expect(s.boards.A.every((x) => !x)).toBe(true);
});
it("scores flower groups, entrance-connected paths and enclosed empty cells separately", () => {
  // 5x5: three flowers + connected 3-path entrance, ring encloses one empty cell.
  const b = Array(25).fill(null);
  for (const i of [0, 1, 2]) b[i] = "rose";
  for (const i of [10, 11, 12]) b[i] = "path";
  const v = scoreGarden(b, 5);
  expect(v.flowers).toBe(6);
  expect(v.paths).toBe(6);
  expect(v.holes).toBe(0);
  const ring = Array(25).fill(null);
  for (const i of [6, 7, 8, 11, 13, 16, 17, 18]) ring[i] = "gold";
  expect(scoreGarden(ring, 5).holes).toBe(1);
  expect(scoreGarden(ring, 5).penalty).toBe(3);
});
it.each(["normal", "advanced"] as const)(
  "completes and replays 24 %s public drafting games",
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

it("rejects disconnected placement and passing when a legal placement exists", () => {
  const s = createGarden(7, "normal", "A");
  expect(() => applyGarden(s, { type: "discard" })).toThrow();
  const boards = { ...s.boards, A: [...s.boards.A] };
  boards.A[24] = "rose";
  expect(() =>
    applyGarden(
      { ...s, boards },
      { type: "place", slot: 0, rotation: 0, x: 0, y: 0 },
    ),
  ).toThrow();
  const full = { ...s, boards: { A: Array(25).fill("rose"), B: s.boards.B } };
  const n = applyGarden(full, { type: "discard" });
  expect(n.ply).toBe(1);
  expect(n.turn).toBe("B");
});
