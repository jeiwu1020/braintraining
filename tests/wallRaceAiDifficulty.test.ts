import { afterEach, describe, expect, it, vi } from "vitest";
import { chooseWall, fallbackWall } from "../games/playground/wall-race/ai";
import { applyWall, createWall, legalActions, path, WallState } from "../games/playground/wall-race/rules";

const difficulties = ["easy", "standard", "challenge"] as const;
const levels = ["normal", "advanced"] as const;
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("independent Wall Race AI difficulty", () => {
  it.each(levels)("uses three independent search caps with %s rules", (level) => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    // With no walls in reserve, all requested depths finish without CPU timing assumptions.
    const state = { ...createWall(level, "A"), reserve: { A: 0, B: 0 } };
    for (const [index, difficulty] of difficulties.entries()) {
      const result = chooseWall(state, 500, 6000, { difficulty, seed: 42 });
      expect(result.depth).toBe(index + 1);
      expect(legalActions(state)).toContainEqual(result.action);
    }
  });

  it.each(levels)("returns legal reproducible choices and keeps state intact with %s rules", (level) => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    const state = createWall(level, "A");
    const before = structuredClone(state);
    for (const difficulty of difficulties) {
      const first = chooseWall(state, 500, 500, { difficulty, seed: 77 });
      const second = chooseWall(state, 500, 500, { difficulty, seed: 77 });
      expect(second).toEqual(first);
      expect(legalActions(state)).toContainEqual(first.action);
      expect(first.nodes).toBeLessThanOrEqual(500);
      expect(first.depth).toBeLessThanOrEqual(difficulties.indexOf(difficulty) + 1);
      expect(legalActions(state)).toContainEqual(fallbackWall(state, { difficulty, seed: 77 }));
    }
    expect(state).toEqual(before);
  });

  it("uses the seed to vary Easy's near-best progress moves", () => {
    const state = createWall("normal", "A");
    const decisions = new Set<string>();
    for (let seed = 0; seed < 16; seed++) {
      const action = chooseWall(state, 500, 100, { difficulty: "easy", seed }).action;
      expect(action.type).toBe("move");
      const next = applyWall(state, action);
      expect(path(next, "A").length).toBeLessThanOrEqual(path(state, "A").length);
      decisions.add(JSON.stringify(action));
    }
    expect(decisions.size).toBeGreaterThan(1);
  });

  it("keeps Easy's seeded worker and one-ply fallback choice identical on detours", () => {
    const state: WallState = {
      ...createWall("normal", "A"),
      walls: [{ x: 2, y: 3, dir: "h" }],
    };
    for (let seed = 0; seed < 8; seed++) {
      const options = { difficulty: "easy" as const, seed };
      expect(chooseWall(state, 500, 100, options).action).toEqual(fallbackWall(state, options));
    }
  });

  it.each(levels)("Easy advances while stronger policies block an immediate threat under %s rules", (level) => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    const state: WallState = { ...createWall(level, "A"), pawns: { A: 20, B: 17 } };
    const easy = chooseWall(state, 500, 6000, { difficulty: "easy", seed: 1 });
    expect(easy.action.type).toBe("move");
    for (const difficulty of ["standard", "challenge"] as const) {
      const result = chooseWall(state, 500, 6000, { difficulty, seed: 1 });
      expect(result.action.type).toBe("wall");
      const next = applyWall(state, result.action);
      expect(legalActions(next).some((reply) => applyWall(next, reply).result === "B")).toBe(false);
    }
  });

  it("Challenge's deeper race evaluation can choose a strategic wall while Standard advances", () => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    const state: WallState = { ...createWall("normal", "A"), pawns: { A: 20, B: 2 } };
    const standard = chooseWall(state, 500, 6000, { difficulty: "standard" });
    const challenge = chooseWall(state, 500, 6000, { difficulty: "challenge" });
    expect(standard.action).toEqual({ type: "move", to: 15 });
    expect(challenge.action).toEqual({ type: "wall", wall: { x: 1, y: 0, dir: "h" } });
    expect(challenge.depth).toBeGreaterThan(standard.depth);
  });

  it.each(levels)("takes immediate wins at every difficulty and fallback under %s rules", (level) => {
    const state: WallState = { ...createWall(level, "A"), pawns: { A: 5, B: 24 }, ply: 79 };
    for (const difficulty of difficulties) {
      const options = { difficulty, seed: 7 };
      expect(chooseWall(state, 0, 0, options).action).toEqual({ type: "move", to: 0 });
      expect(fallbackWall(state, options)).toEqual({ type: "move", to: 0 });
    }
  });

  it("keeps a legal fallback without claiming an unfinished depth when budgets expire", () => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    const state = createWall("advanced", "A");
    for (const difficulty of difficulties) {
      for (const [time, nodes] of [[0, 6000], [500, 0], [500, 1]]) {
        const result = chooseWall(state, time, nodes, { difficulty, seed: 2 });
        expect(result.depth).toBe(0);
        expect(result.nodes).toBeLessThanOrEqual(nodes);
        expect(legalActions(state)).toContainEqual(result.action);
      }
    }
  });

  it.each(difficulties)("respects a time interruption for %s without publishing partial search", (difficulty) => {
    let tick = 0;
    vi.spyOn(performance, "now").mockImplementation(() => tick++ * 10);
    const state = createWall("normal", "A");
    const result = chooseWall(state, 30, 6000, { difficulty, seed: 3 });
    expect(result.depth).toBe(0);
    expect(result.elapsed).toBeLessThanOrEqual(50);
    expect(legalActions(state)).toContainEqual(result.action);
  });

  it("preserves level-dependent legacy decisions when difficulty is absent", () => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    for (const level of levels) {
      const state = { ...createWall(level, "A"), reserve: { A: 0, B: 0 } };
      const legacy = chooseWall(state);
      expect(legacy.depth).toBe(level === "advanced" ? 3 : 1);
      expect(legacy.action).toEqual({ type: "move", to: 17 });
      expect(chooseWall(state, undefined, undefined, { seed: 123 })).toEqual(legacy);
      expect(fallbackWall(state, { seed: 123 })).toEqual(fallbackWall(state));
    }
  });

  it("passes difficulty and seed through the worker while retaining the request id", async () => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    const worker = { onmessage: null as any, postMessage: vi.fn() };
    vi.stubGlobal("self", worker);
    await import("../games/playground/wall-race/ai.worker");
    const state = createWall("advanced", "A");
    for (const difficulty of difficulties) {
      const options = { difficulty, seed: 8 };
      worker.onmessage({ data: { id: `wall-${difficulty}`, state, options } });
      expect(worker.postMessage).toHaveBeenLastCalledWith({
        id: `wall-${difficulty}`,
        ...chooseWall(state, undefined, undefined, options),
      });
    }
  });
});
