import { AiDifficulty, other, random } from "../types";
import { ChefAction, ChefState, DISH_INFO, Dish, scoreChefCollection } from "./rules";

export interface ChefAiOptions {
  difficulty?: AiDifficulty;
  seed?: number;
}

function allSplits(n: number): number[][] {
  const out: number[][] = [];
  const total = 1 << n;
  // Symmetry breaking: fix index 0 in left OR full non-empty subsets (exclude 0 and all-1s)
  for (let mask = 1; mask < total - 1; mask++) {
    const idxs: number[] = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) idxs.push(i);
    out.push(idxs);
  }
  return out;
}

function nominalValue(items: Dish[]): number {
  return items.reduce((sum, d) => sum + DISH_INFO[d].base, 0);
}

export function chooseChefSplit(state: ChefState, options: ChefAiOptions = {}): ChefAction {
  const diff = options.difficulty ?? (state.level === "normal" ? "standard" : "challenge");
  const rng = random(options.seed ?? state.ply + 41);
  const me = state.turn;
  const opp = other(me);

  if (state.stage === "choose" && state.plates) {
    const { left, right } = state.plates;
    if (diff === "easy") {
      const vl = nominalValue(left) + rng() * 2.5;
      const vr = nominalValue(right) + rng() * 2.5;
      return { type: "choose", plate: vl >= vr ? "left" : "right" };
    }
    const myBase = scoreChefCollection(state.collections[me]).total;
    const oppBase = scoreChefCollection(state.collections[opp]).total;
    const pickLeftDiff =
      scoreChefCollection([...state.collections[me], ...left]).total -
      myBase -
      (diff === "challenge"
        ? scoreChefCollection([...state.collections[opp], ...right]).total - oppBase
        : 0);
    const pickRightDiff =
      scoreChefCollection([...state.collections[me], ...right]).total -
      myBase -
      (diff === "challenge"
        ? scoreChefCollection([...state.collections[opp], ...left]).total - oppBase
        : 0);
    return { type: "choose", plate: pickLeftDiff >= pickRightDiff ? "left" : "right" };
  }

  // Stage === "split"
  const splits = allSplits(state.tray.length);
  if (diff === "easy") {
    // Near-balanced nominal split with mild randomness
    const scored = splits.map((idxs) => {
      const set = new Set(idxs);
      const left = state.tray.filter((_, i) => set.has(i));
      const right = state.tray.filter((_, i) => !set.has(i));
      const gap = Math.abs(nominalValue(left) - nominalValue(right));
      return { idxs, score: -gap + rng() * 3 };
    });
    scored.sort((a, b) => b.score - a.score);
    return { type: "split", leftIndices: scored[0].idxs };
  }

  // standard & challenge: minimax over chooser's rational pick
  const scored = splits.map((idxs) => {
    const set = new Set(idxs);
    const left = state.tray.filter((_, i) => set.has(i));
    const right = state.tray.filter((_, i) => !set.has(i));
    const oppTakesLeft =
      scoreChefCollection([...state.collections[opp], ...left]).total +
      scoreChefCollection([...state.collections[me], ...right]).total * -1;
    const oppTakesRight =
      scoreChefCollection([...state.collections[opp], ...right]).total +
      scoreChefCollection([...state.collections[me], ...left]).total * -1;

    // My lead after opponent picks whichever hurts me more (challenge) or gives opponent higher own score (standard)
    const oppPrefLeft =
      diff === "challenge"
        ? oppTakesLeft >= oppTakesRight
        : scoreChefCollection([...state.collections[opp], ...left]).total >=
          scoreChefCollection([...state.collections[opp], ...right]).total;

    const myFinal = scoreChefCollection([
      ...state.collections[me],
      ...(oppPrefLeft ? right : left),
    ]).total;
    const oppFinal = scoreChefCollection([
      ...state.collections[opp],
      ...(oppPrefLeft ? left : right),
    ]).total;
    return { idxs, score: myFinal - oppFinal + rng() * 0.05 };
  });
  scored.sort((a, b) => b.score - a.score);
  return { type: "split", leftIndices: scored[0].idxs };
}
