import { applyLighthouse, sailCost, type LighthouseAction, type LighthouseState } from "../games/playground/lighthouse/rules";

export const ADVANCED_NEEDS = [
  [[0, 0], [3, 2], [2, 2], [1, 2]],
  [[0, 0], [2, 2], [3, 2], [1, 2]],
  [[0, 0], [2, 1], [2, 2], [2, 3]],
];

const load = (fuel: number, food: number): LighthouseAction => ({ type: "load", fuel, food });
const sail = (to: number): LighthouseAction => ({ type: "sail", to });

// Two distinct delivery orders per mission, both auto-delivering on arrival with no rig needed:
const whitePlans: LighthouseAction[][] = [
  // White Reef first, then Pine Bay -> White Reef -> home -> Cape
  [load(3, 1), sail(1), sail(0), load(1, 3), sail(3), sail(1), sail(0), load(2, 2), sail(1), sail(2)],
  // Pine Bay -> White Reef first, then return for remaining White Reef -> Cape
  [load(1, 3), sail(3), sail(1), sail(0), load(3, 1), sail(1), sail(0), load(2, 2), sail(3), sail(2)],
];

const capePlans: LighthouseAction[][] = [
  [load(2, 2), sail(1), sail(0), load(1, 3), sail(3), sail(2), sail(1), sail(0), load(3, 1), sail(1), sail(2)],
  [load(1, 3), sail(3), sail(2), sail(3), sail(0), load(2, 2), sail(1), sail(0), load(3, 1), sail(3), sail(2)],
];

const pinePlans = whitePlans.map((plan) =>
  plan.map((action): LighthouseAction =>
    action.type === "load"
      ? load(action.food, action.fuel)
      : action.type === "sail"
        ? sail(action.to === 1 ? 3 : action.to === 3 ? 1 : action.to)
        : action,
  ),
);

export const ADVANCED_PLANS = [whitePlans, capePlans, pinePlans];

export const weatherForMask = (mask: number) => [
  false,
  ...Array.from({ length: 8 }, (_, i) => Boolean(mask & (1 << i))),
  false,
];

export function followPlan(initial: LighthouseState, plan: LighthouseAction[]) {
  let state = initial;
  const actions: LighthouseAction[] = [];
  for (const action of plan) {
    if (state.phase === "round_summary") {
      state = applyLighthouse(state, { type: "next" });
      actions.push({ type: "next" });
    }
    if (action.type === "sail" && sailCost(state, action.to) > state.ap) {
      state = applyLighthouse(state, { type: "wait" });
      actions.push({ type: "wait" });
      if (state.phase === "round_summary") {
        state = applyLighthouse(state, { type: "next" });
        actions.push({ type: "next" });
      }
    }
    state = applyLighthouse(state, action);
    actions.push(action);
  }
  return { state, actions };
}
