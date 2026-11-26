import { describe, expect, it } from "vitest";
import {
  applyLighthouse,
  createLighthouse,
  legalLighthouse,
  lighthouseEngine,
} from "../games/playground/lighthouse/rules";
import { replay, restore } from "../games/playground/session";

describe("lighthouse rules", () => {
  it("guards port loading capacity, direct sea routes and immutable state", () => {
    const s = createLighthouse(1, "normal", "A");
    const before = JSON.stringify(s);
    expect(() =>
      applyLighthouse(s, { type: "load", fuel: 5, food: 0 }),
    ).toThrow();
    expect(() => applyLighthouse(s, { type: "sail", to: 2 })).toThrow();
    const n = applyLighthouse(s, { type: "load", fuel: 2, food: 2 });
    expect(n.ap).toBe(1);
    expect(n.cargo).toEqual([2, 2]);
    expect(JSON.stringify(s)).toBe(before);
    const delivered = applyLighthouse(n, { type: "sail", to: 1 });
    expect(delivered.at).toBe(1);
    expect(delivered.needs[1]).toEqual([0, 0]);
    expect(delivered.cargo).toEqual([0, 1]);
  });

  it("offers a winnable complete normal voyage across all weather seeds", () => {
    for (let seed = 0; seed < 64; seed++) {
      let state = createLighthouse(seed, "normal", "A");
      const actions: any[] = [];
      const plan: any[] = [
        { type: "load", fuel: 3, food: 1 },
        { type: "sail", to: 1 },
        { type: "sail", to: 2 },
        { type: "sail", to: 3 },
        { type: "sail", to: 0 },
        { type: "load", fuel: 1, food: 3 },
        { type: "sail", to: 3 },
        { type: "sail", to: 2 },
      ];
      const apply = (a: any) => {
        state = applyLighthouse(state, a);
        actions.push(a);
      };
      for (const a of plan) {
        if (state.phase === "round_summary") apply({ type: "next" });
        if (
          a.type === "sail" &&
          !legalLighthouse(state).some(
            (x) => JSON.stringify(x) === JSON.stringify(a),
          )
        ) {
          apply({ type: "wait" });
          apply({ type: "next" });
        }
        apply(a);
      }
      expect(state.won, `seed ${seed}`).toBe(true);
      expect(state.needs.flat().every((v: number) => v === 0)).toBe(true);
      const journal: any = {
        version: 1,
        game: "lighthouse",
        id: "test",
        settings: { mode: "teams", level: "normal" },
        seed,
        aiSeed: 0,
        starter: "A",
        actions,
      };
      expect(
        replay(
          restore(JSON.stringify(journal), "lighthouse", lighthouseEngine),
          lighthouseEngine,
        ).at(-1),
      ).toEqual(state);
      expect(() => applyLighthouse(state, { type: "wait" })).toThrow();
    }
  });

  it("preserves deterministic normal opening and weather sequence", () => {
    expect(createLighthouse(7, "normal", "B")).toEqual({
      phase: "playing",
      turn: "B",
      round: 1,
      limit: 7,
      ap: 2,
      at: 0,
      cargo: [0, 0],
      needs: [
        [0, 0],
        [2, 1],
        [1, 2],
        [1, 1],
      ],
      weather: [false, true, true, false, false, false, false, false, true, false],
      won: false,
      message: "全團體合作：在母港裝入燈油與糧食後出航，抵達燈塔自動交貨！",
    });
  });

  it("charges rough outer crossings without needing readiness tokens and allows last-action wins", () => {
    const s = {
      ...createLighthouse(1, "normal", "A"),
      at: 1,
      ap: 1,
      weather: Array(10).fill(true),
    };
    expect(() => applyLighthouse(s, { type: "sail", to: 2 })).toThrow();
    const canSail = { ...s, ap: 2 };
    const n = applyLighthouse(canSail, { type: "sail", to: 2 });
    expect(n.ap).toBe(0);
    expect(n.phase).toBe("round_summary");

    const last = {
      ...s,
      at: 1,
      ap: 1,
      round: 7,
      weather: Array(10).fill(false),
      cargo: [1, 0],
      needs: [
        [0, 0],
        [0, 0],
        [0, 0],
        [1, 0],
      ],
    };
    const win = applyLighthouse(last, { type: "sail", to: 3 });
    expect(win.won).toBe(true);
    expect(win.phase).toBe("finished");
  });

  it("finishes a missed deadline and cannot consume the same next-round action twice", () => {
    let s = createLighthouse(2, "normal", "A");
    while (s.phase !== "finished")
      s = applyLighthouse(
        s,
        s.phase === "round_summary" ? { type: "next" } : { type: "wait" },
      );
    expect(s.won).toBe(false);
    expect(s.round).toBe(s.limit);
    expect(() =>
      applyLighthouse(createLighthouse(0, "normal", "A"), { type: "next" }),
    ).toThrow();
  });
});
