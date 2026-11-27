import { describe, expect, it } from "vitest";
import { AiDifficulty } from "../games/playground/types";
import { newSession, replay, restore } from "../games/playground/session";
import * as F from "../games/playground/frog-pond/rules";
import { chooseFrogPond } from "../games/playground/frog-pond/ai";
import * as T from "../games/playground/cloud-towers/rules";
import { chooseTowers } from "../games/playground/cloud-towers/ai";
import * as C from "../games/playground/chef-split/rules";
import { chooseChefSplit } from "../games/playground/chef-split/ai";
import * as S from "../games/playground/sumo-push/rules";
import { chooseSumoPush } from "../games/playground/sumo-push/ai";

const DIFFS: AiDifficulty[] = ["easy", "standard", "challenge"];

describe("all 4 new games support full AI play across all difficulties and session restore", () => {
  it.each(DIFFS)("frog-pond %s plays full legal match and replays cleanly", (difficulty) => {
    let s = F.createFrogPond(2026, "normal", "A");
    const sess = newSession<F.FrogAction>("frog-pond", { mode: "solo", level: "normal", aiDifficulty: difficulty });
    sess.seed = 2026;
    while (s.phase === "playing") {
      const a = chooseFrogPond(s, { difficulty, seed: s.ply + 7 });
      sess.actions.push(a);
      s = F.applyFrogPond(s, a);
    }
    expect(s.result).toBeTruthy();
    const eng = { create: F.createFrogPond, apply: F.applyFrogPond, validAction: F.validFrogAction };
    expect(replay(restore(JSON.stringify(sess), "frog-pond", eng), eng).at(-1)).toEqual(s);
  });

  it.each(DIFFS)("cloud-towers %s plays legal match and takes immediate 3F win", (difficulty) => {
    const base = T.createTowers(1, "normal", "B");
    const winPos: T.TowerState = {
      ...base,
      heights: base.heights.map((_, i) => (i === 8 ? 2 : i === 9 ? 3 : 0)),
    };
    const winAction = chooseTowers(winPos, { difficulty, seed: 1 });
    expect(T.applyTowers(winPos, winAction).result).toBe("B");

    let s = T.createTowers(15, "advanced", "A");
    const sess = newSession<T.TowerAction>("cloud-towers", { mode: "solo", level: "advanced", aiDifficulty: difficulty });
    sess.seed = 15;
    while (s.phase === "playing") {
      const a = chooseTowers(s, { difficulty, seed: s.ply + 3 });
      sess.actions.push(a);
      s = T.applyTowers(s, a);
    }
    expect(["A", "B", "tie"]).toContain(s.result);
    const eng = { create: T.createTowers, apply: T.applyTowers, validAction: T.validTowerAction };
    expect(replay(restore(JSON.stringify(sess), "cloud-towers", eng), eng).at(-1)).toEqual(s);
  });

  it.each(DIFFS)("chef-split %s plays 6 full rounds cleanly and challenge guards against opponent sets", (difficulty) => {
    let s = C.createChefSplit(88, "advanced", "A");
    const sess = newSession<C.ChefAction>("chef-split", { mode: "solo", level: "advanced", aiDifficulty: difficulty });
    sess.seed = 88;
    while (s.phase === "playing") {
      const a = chooseChefSplit(s, { difficulty, seed: s.ply + 9 });
      sess.actions.push(a);
      s = C.applyChefSplit(s, a);
    }
    expect(s.result).toBeTruthy();
    const eng = { create: C.createChefSplit, apply: C.applyChefSplit, validAction: C.validChefAction };
    expect(replay(restore(JSON.stringify(sess), "chef-split", eng), eng).at(-1)).toEqual(s);
  });

  it.each(DIFFS)("sumo-push %s plays legal match cleanly", (difficulty) => {
    let s = S.createSumoPush(33, "normal", "A");
    const sess = newSession<S.SumoAction>("sumo-push", { mode: "solo", level: "normal", aiDifficulty: difficulty });
    sess.seed = 33;
    while (s.phase === "playing") {
      const a = chooseSumoPush(s, { difficulty, seed: s.ply + 11 });
      sess.actions.push(a);
      s = S.applySumoPush(s, a);
    }
    expect(["A", "B", "tie"]).toContain(s.result);
    const eng = { create: S.createSumoPush, apply: S.applySumoPush, validAction: S.validSumoAction };
    expect(replay(restore(JSON.stringify(sess), "sumo-push", eng), eng).at(-1)).toEqual(s);
  });
});
