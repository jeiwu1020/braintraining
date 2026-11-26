import { describe, expect, it } from "vitest";
import {
  applyLighthouse,
  createLighthouse,
  LIGHTHOUSE_MISSIONS,
  PORTS,
  type LighthouseAction,
  type LighthouseState,
} from "../games/playground/lighthouse/rules";
import { replay, restore, type SavedSession } from "../games/playground/session";
import { lighthouseEngine } from "../games/playground/lighthouse/rules";
import { ADVANCED_NEEDS, ADVANCED_PLANS, followPlan, weatherForMask } from "./lighthouseFixtures";

describe("lighthouse advanced missions", () => {
  it("keeps normal mode untouched and adds three distinct 12-crate split-delivery missions in advanced mode", () => {
    const normal = createLighthouse(7, "normal", "A");
    expect(normal.mission).toBeUndefined();
    expect(normal.limit).toBe(7);
    expect(normal.needs.flat().reduce((a, b) => a + b, 0)).toBe(8);

    const seen = new Set<number>();
    for (let seed = 0; seed < 24; seed++) {
      const s = createLighthouse(seed, "advanced", "A");
      expect(s.limit).toBe(8);
      expect(s.mission).toBeDefined();
      seen.add(s.mission!);
      const sum = s.needs.flat().reduce((a, b) => a + b, 0);
      expect(sum).toBe(12);
      expect(s.needs.some((n) => n[0] + n[1] === 5)).toBe(true);
      expect(s.message).toContain(LIGHTHOUSE_MISSIONS[s.mission!].name);
      const splitIdx = s.needs.findIndex((n) => n[0] + n[1] > 4);
      expect(s.message).toContain(PORTS[splitIdx]);
    }
    expect(seen).toEqual(new Set([0, 1, 2]));
  });

  it("does not mutate mission definitions on replay", () => {
    const original = JSON.parse(JSON.stringify(ADVANCED_NEEDS));
    const s = createLighthouse(7, "advanced", "A");
    followPlan(s, ADVANCED_PLANS[s.mission!][0]);
    expect(ADVANCED_NEEDS).toEqual(original);
  });

  it.each([0, 1, 2])("mission %i has two distinct supply routes under all 256 possible forecasts", (mission) => {
    const deliveryOrders = ADVANCED_PLANS[mission].map((plan) =>
      plan.filter((a): a is Extract<LighthouseAction, { type: "sail" }> => a.type === "sail" && a.to > 0).map((a) => a.to),
    );
    expect(deliveryOrders[0][0]).not.toBe(deliveryOrders[1][0]);
    for (let mask = 0; mask < 256; mask++) {
      for (const plan of ADVANCED_PLANS[mission]) {
        const initial: LighthouseState = {
          ...createLighthouse(7, "advanced", "A"),
          mission,
          needs: ADVANCED_NEEDS[mission].map((need) => [...need]),
          weather: weatherForMask(mask),
        };
        const { state } = followPlan(initial, plan);
        expect(state.won, `mission ${mission}, weather ${mask}`).toBe(true);
        expect(state.round).toBeLessThanOrEqual(8);
        expect(state.needs.flat().every((n) => n === 0)).toBe(true);
      }
    }
  });

  it.each([0, 1, 2])("mission %i cannot be completed by a single load per tower", (mission) => {
    const state = {
      ...createLighthouse(7, "advanced", "A"),
      mission,
      needs: ADVANCED_NEEDS[mission].map((need) => [...need]),
    };
    const oneLoadRoute: LighthouseAction[] = [];
    for (const port of [1, 3, 2]) {
      const [fuel, food] = state.needs[port];
      oneLoadRoute.push({ type: "load", fuel, food }, { type: "sail", to: port === 2 ? 1 : port });
      if (port === 2) oneLoadRoute.push({ type: "sail", to: 2 });
      if (port !== 2) oneLoadRoute.push({ type: "sail", to: 0 });
    }
    expect(() => followPlan(state, oneLoadRoute)).toThrow(/船艙上限4箱/);
  });

  it("auto-delivers on arrival and replays every generated mission", () => {
    for (let seed = 0; seed < 48; seed++) {
      const start = createLighthouse(seed, "advanced", "B");
      const { state, actions } = followPlan(start, ADVANCED_PLANS[start.mission!][0]);
      expect(state.won).toBe(true);
      const journal: SavedSession<LighthouseAction> = {
        version: 1,
        game: "lighthouse",
        id: "advanced-test",
        settings: { mode: "teams", level: "advanced" },
        seed,
        aiSeed: 0,
        starter: "B",
        actions,
      };
      expect(
        replay(restore(JSON.stringify(journal), "lighthouse", lighthouseEngine), lighthouseEngine).at(-1),
      ).toEqual(state);
    }
    let state: LighthouseState = {
      ...createLighthouse(7, "advanced", "A"),
      mission: 0,
      needs: ADVANCED_NEEDS[0].map((need) => [...need]),
    };
    state = followPlan(state, [{ type: "load", fuel: 3, food: 1 }, { type: "sail", to: 1 }]).state;
    expect(state.needs[1]).toEqual([0, 1]);
    expect(state.cargo).toEqual([0, 0]);
    expect(state.won).toBe(false);
  });
});
