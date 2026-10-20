import { describe, it, expect } from "vitest";
import {
  createLighthouse,
  applyLighthouse,
  legalLighthouse,
  lighthouseEngine,
} from "../games/playground/lighthouse/rules";
import { restore, replay } from "../games/playground/session";
describe("lighthouse cooperative logistics", () => {
  it("uses two actions, rejects invalid cargo and routes without changing its input", () => {
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
    expect(() => applyLighthouse(n, { type: "unload" })).toThrow();
  });
  it.each(["normal"] as const)(
    "offers a winnable complete %s voyage across weather seeds",
    (level) => {
      // A public-information itinerary serves each port in turn; rough crossings may wait for two AP.
      for (let seed = 0; seed < 64; seed++) {
        let state = createLighthouse(seed, level, "A");
        const actions: any[] = [];
        const plan: any[] = [
          { type: "load", fuel: 2, food: 1 },
          { type: "sail", to: 1 },
          { type: "unload" },
          { type: "sail", to: 0 },
          { type: "load", fuel: 1, food: level === "normal" ? 2 : 3 },
          { type: "sail", to: 1 },
          { type: "sail", to: 2 },
          { type: "unload" },
          { type: "sail", to: 1 },
          { type: "sail", to: 0 },
          { type: "load", fuel: 1, food: level === "normal" ? 1 : 2 },
          { type: "sail", to: 3 },
          { type: "unload" },
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
        const found = { s: state, actions };
        expect(found, `seed ${seed}`).toBeTruthy();
        expect(found.s.needs.flat().every((v: number) => v === 0)).toBe(true);
        const journal: any = {
          version: 1,
          game: "lighthouse",
          id: "test",
          settings: { mode: "teams", level },
          seed,
          aiSeed: 0,
          starter: "A",
          actions: found.actions,
        };
        expect(
          replay(
            restore(JSON.stringify(journal), "lighthouse", lighthouseEngine),
            lighthouseEngine,
          ).at(-1),
        ).toEqual(found.s);
        expect(() => applyLighthouse(found.s, { type: "wait" })).toThrow();
      }
    },
  );
  it("preserves the original normal opening, including its weather sequence", () => {
    expect(createLighthouse(7, "normal", "B")).toEqual({
      phase: "playing",
      turn: "B",
      round: 1,
      limit: 9,
      ap: 2,
      at: 0,
      cargo: [0, 0],
      needs: [[0, 0], [2, 1], [1, 2], [1, 1]],
      ready: 0,
      weather: [false, true, true, false, false, false, false, false, true, false],
      won: false,
      message: "全團體共同決策。先在母港裝貨，再選一條航線。",
    });
  });
  it("charges rough outer crossings, consumes readiness, and accepts a last-action delivery", () => {
    const s = {
      ...createLighthouse(1, "normal", "A"),
      at: 1,
      ap: 1,
      weather: Array(10).fill(true),
    };
    expect(() => applyLighthouse(s, { type: "sail", to: 2 })).toThrow();
    const n = applyLighthouse({ ...s, ready: 1 }, { type: "sail", to: 2 });
    expect(n.ready).toBe(0);
    expect(n.ap).toBe(0);
    expect(n.phase).toBe("round_summary");
    const last = {
      ...s,
      at: 3,
      round: 9,
      cargo: [1, 0],
      needs: [
        [0, 0],
        [0, 0],
        [0, 0],
        [1, 0],
      ],
    };
    const win = applyLighthouse(last, { type: "unload" });
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

