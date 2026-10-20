import { describe, expect, it } from "vitest";
import {
  LIGHTHOUSE_MISSIONS,
  applyLighthouse,
  createLighthouse,
  lighthouseEngine,
  type LighthouseAction,
  type LighthouseState,
} from "../games/playground/lighthouse/rules";
import { replay, restore, type SavedSession } from "../games/playground/session";
import { ADVANCED_NEEDS, ADVANCED_PLANS, followPlan, weatherForMask } from "./lighthouseFixtures";

describe("lighthouse advanced supply missions", () => {
  it("selects only three deterministic 12-crate missions that require split deliveries", () => {
    expect(LIGHTHOUSE_MISSIONS.map((mission) => mission.needs)).toEqual(ADVANCED_NEEDS);
    const seen = new Set<number>();
    for (let seed = 0; seed < 128; seed++) {
      const state = createLighthouse(seed, "advanced", "A");
      expect(state).toEqual(createLighthouse(seed, "advanced", "A"));
      expect(state.mission).toBeGreaterThanOrEqual(0);
      expect(state.mission).toBeLessThan(3);
      seen.add(state.mission!);
      expect(state.needs).toEqual(ADVANCED_NEEDS[state.mission!]);
      expect(state.needs.flat().reduce((sum, n) => sum + n, 0)).toBe(12);
      expect(state.needs.some((need) => need[0] + need[1] > 4)).toBe(true);
      expect(state.limit).toBe(9);
      expect(state.weather[0]).toBe(false);
    }
    expect(seen.size).toBe(3);
  });

  it("keeps each mission's mutable cargo and demand independent", () => {
    const first = createLighthouse(7, "advanced", "A");
    const original = createLighthouse(7, "advanced", "A");
    first.needs[1][0] = 99;
    first.cargo[0] = 99;
    expect(createLighthouse(7, "advanced", "A")).toEqual(original);
    expect(LIGHTHOUSE_MISSIONS[original.mission!].needs).toEqual(original.needs);
  });

  it.each([0, 1, 2])("mission %i has two distinct supply routes under all 256 possible forecasts", (mission) => {
    const deliveryOrders = ADVANCED_PLANS[mission].map((plan) => {
      let at = 0;
      return plan.flatMap((action) => {
        if (action.type === "sail") at = action.to;
        return action.type === "unload" ? [at] : [];
      });
    });
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
        expect(state.round).toBeLessThanOrEqual(9);
        expect(state.needs.flat().every((n) => n === 0)).toBe(true);
      }
    }
  });

  it.each([0, 1, 2])("mission %i cannot be completed by the old one-load-per-tower route", (mission) => {
    const state = {
      ...createLighthouse(7, "advanced", "A"),
      mission,
      needs: ADVANCED_NEEDS[mission].map((need) => [...need]),
    };
    const oldRoute: LighthouseAction[] = [];
    for (const port of [1, 3, 2]) {
      const [fuel, food] = state.needs[port];
      oldRoute.push({ type: "load", fuel, food }, { type: "sail", to: port === 2 ? 1 : port });
      if (port === 2) oldRoute.push({ type: "sail", to: 2 });
      oldRoute.push({ type: "unload" });
      if (port !== 2) oldRoute.push({ type: "sail", to: 0 });
    }
    expect(() => followPlan(state, oldRoute)).toThrow(/船艙上限4箱/);
  });

  it("retains an unfinished tower after delivering a full ship and can replay every generated mission", () => {
    for (let seed = 0; seed < 48; seed++) {
      const start = createLighthouse(seed, "advanced", "B");
      const { state, actions } = followPlan(start, ADVANCED_PLANS[start.mission!][0]);
      expect(state.won).toBe(true);
      const journal: SavedSession<LighthouseAction> = {
        version: 1, game: "lighthouse", id: "advanced-test", settings: { mode: "teams", level: "advanced" },
        seed, aiSeed: 0, starter: "B", actions,
      };
      expect(replay(restore(JSON.stringify(journal), "lighthouse", lighthouseEngine), lighthouseEngine).at(-1)).toEqual(state);
    }
    let state: LighthouseState = {
      ...createLighthouse(7, "advanced", "A"),
      mission: 0,
      needs: ADVANCED_NEEDS[0].map((need) => [...need]),
    };
    state = followPlan(state, [{ type: "load", fuel: 3, food: 1 }, { type: "sail", to: 1 }, { type: "unload" }]).state;
    expect(state.needs[1]).toEqual([0, 1]);
    expect(state.cargo).toEqual([0, 0]);
    expect(state.won).toBe(false);
    expect(() => applyLighthouse(state, { type: "unload" })).toThrow();
  });
});
