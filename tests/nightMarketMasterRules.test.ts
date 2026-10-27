import { describe, expect, it } from "vitest";
import * as M from "../games/playground/night-market/masterRules";
import * as J from "../games/playground/night-market/masterSession";
import { chooseMaster } from "../games/playground/night-market/masterAi";
import {
  applyNight,
  createNight,
} from "../games/playground/night-market/rules";
import { restore } from "../games/playground/session";

const count = (v: number[]) =>
  Object.fromEntries(
    ["rice", "noodle", "corn", "chicken", "tofu", "tea"].map((f, i) => [
      f,
      v[i],
    ]),
  ) as M.MasterCounts;
describe("independent Master eight-pick rules", () => {
  it("keeps compact progress meaningful when excess copies cannot replace a required food", () => {
    expect(M.masterCompactProgress(count([4, 0, 0, 0, 0, 0]), "main")).toBe(
      "4/4缺麵",
    );
    expect(M.masterCompactProgress(count([0, 0, 4, 0, 0, 0]), "snack")).toBe(
      "2/4張",
    );
    expect(M.masterCompactProgress(count([2, 0, 0, 2, 1, 1]), "meal")).toBe(
      "3/3類",
    );
  });
  it("conserves 24 unique cards, deals two rounds of eight, swaps starters and never refills the last pick", () => {
    let s = M.createMaster(27, "A");
    const seen: string[] = [];
    for (const r of [1, 2]) {
      expect(s.orders).toHaveLength(3);
      expect(s.orders.some((o) => seen.includes(o))).toBe(false);
      seen.push(...s.orders);
      expect(s.market).toHaveLength(4);
      expect(s.deck).toHaveLength(20);
      for (let p = 0; p < 16; p++) {
        const cards = [
          ...s.deck,
          ...s.market.filter(Boolean),
          ...s.hands.A,
          ...s.hands.B,
        ];
        expect(cards).toHaveLength(24);
        expect(new Set(cards.map((c) => c!.id)).size).toBe(24);
        for (const f of M.MASTER_FOODS)
          expect(cards.filter((c) => c!.food === f)).toHaveLength(4);
        s = M.applyMaster(s, { type: "pick", slot: p % 4 });
      }
      expect(s.hands.A).toHaveLength(8);
      expect(s.hands.B).toHaveLength(8);
      expect(s.market.filter(Boolean)).toHaveLength(3);
      expect(s.deck).toHaveLength(5);
      expect(() => M.applyMaster(s, { type: "pick", slot: 0 })).toThrow();
      if (r === 1) {
        expect(s.phase).toBe("round_summary");
        s = M.applyMaster(s, { type: "next-round" });
        expect(s.turn).toBe("B");
      }
    }
    expect(s.phase).toBe("finished");
    expect(() => M.applyMaster(s, { type: "next-round" })).toThrow();
  });
  it("scores the approved 29 versus 26 tradeoff only at final scoring", () => {
    const orders: M.MasterOrder[] = ["four", "sweet", "sharing"];
    expect(
      M.scoreMasterCounts(count([2, 0, 2, 0, 2, 2]), orders, true),
    ).toMatchObject({ base: 18, bonus: 11, total: 29 });
    expect(
      M.scoreMasterCounts(count([2, 1, 2, 0, 1, 2]), orders, true),
    ).toMatchObject({ base: 19, bonus: 7, total: 26 });
    expect(
      M.scoreMasterCounts(count([2, 0, 2, 0, 2, 2]), orders, false).total,
    ).toBe(18);
    expect(
      M.scoreMasterCounts(
        count([2, 0, 2, 0, 2, 2]),
        ["sharing", "sharing"],
        true,
      ).bonus,
    ).toBe(3);
    expect(M.scoreMasterCounts(count([2, 0, 2, 0, 2, 2]), [], true).bonus).toBe(
      0,
    );
  });
  it.each([
    ["variety", [1, 0, 1, 0, 1, 0], true],
    ["variety", [0, 1, 1, 0, 1, 0], false],
    ["specialty", [4, 0, 0, 0, 0, 0], true],
    ["specialty", [3, 1, 1, 1, 1, 1], false],
    ["sharing", [2, 2, 0, 0, 0, 0], true],
    ["sharing", [3, 1, 1, 1, 1, 1], false],
    ["even", [2, 0, 2, 0, 2, 2], true],
    ["even", [0, 0, 0, 0, 0, 0], false],
    ["even", [1, 1, 2, 0, 2, 2], false],
    ["main", [1, 3, 0, 0, 0, 0], true],
    ["main", [4, 0, 0, 0, 0, 0], false],
    ["snack", [0, 0, 2, 2, 0, 0], true],
    ["snack", [0, 0, 3, 1, 0, 0], false],
    ["sweet", [0, 0, 0, 0, 1, 2], true],
    ["sweet", [0, 0, 0, 0, 2, 1], false],
    ["meal", [2, 0, 0, 2, 1, 1], true],
    ["meal", [3, 0, 0, 1, 2, 2], false],
    ["four", [1, 1, 1, 1, 0, 0], true],
    ["four", [1, 1, 1, 1, 1, 0], false],
    ["six", [1, 1, 1, 1, 1, 1], true],
    ["six", [2, 1, 1, 1, 1, 0], false],
    ["tripairs", [2, 2, 2, 0, 0, 0], true],
    ["tripairs", [2, 2, 1, 1, 1, 1], false],
    ["double", [3, 3, 0, 0, 0, 0], true],
    ["double", [4, 2, 0, 0, 0, 0], false],
  ])(
    "%s has an independently specified boundary %j -> %s",
    (order, values, want) => {
      expect(
        M.matchesMasterOrder(count(values as number[]), order as M.MasterOrder),
      ).toBe(want);
    },
  );
  it("has 951 legal final plates and every offered order set has multiple joint solutions and disjoint successors", () => {
    const hands = M.legalMasterHands();
    expect(hands).toHaveLength(951);
    for (const set of M.MASTER_ORDER_SETS) {
      expect(
        hands.filter((c) => set.every((o) => M.matchesMasterOrder(c, o)))
          .length,
      ).toBeGreaterThan(1);
      expect(
        M.MASTER_ORDER_SETS.some((next) => next.every((o) => !set.includes(o))),
      ).toBe(true);
    }
  });
  it("rejects malformed picks and exposes no private deck order or seeds", () => {
    const s = M.createMaster(19, "A");
    for (const slot of [-1, 4, 0.5, NaN])
      expect(() => M.applyMaster(s, { type: "pick", slot })).toThrow();
    expect(() => M.applyMaster(s, { type: "next-round" })).toThrow();
    expect(M.observeMaster(s)).toEqual(
      M.observeMaster({ ...s, seed: 99, deck: [...s.deck].reverse() }),
    );
    expect(Object.keys(M.observeMaster(s))).not.toContain("seed");
  });
});
describe("Master journal is not a legacy migration", () => {
  it("replays exactly 33 actions while rejecting future formats and preserving legacy 25-action behavior", () => {
    let j = J.newMasterJournal(
      { mode: "teams", aiDifficulty: "standard" },
      "A",
      27,
      5,
    );
    for (let r = 0; r < 2; r++) {
      if (r) j = { ...j, actions: [...j.actions, { type: "next-round" }] };
      for (let p = 0; p < 16; p++)
        j = { ...j, actions: [...j.actions, { type: "pick", slot: p % 4 }] };
    }
    expect(j.actions).toHaveLength(33);
    expect(
      J.replayMaster(J.restoreMaster(JSON.stringify(j))).at(-1)!.phase,
    ).toBe("finished");
    expect(() =>
      J.restoreMaster(JSON.stringify({ ...j, version: 2 })),
    ).toThrow();
    expect(() =>
      J.restoreMaster(
        JSON.stringify({
          ...j,
          actions: [...j.actions, { type: "pick", slot: 0 }],
        }),
      ),
    ).toThrow();
    const legacy = {
      version: 1,
      game: "night-market",
      id: "legacy",
      settings: { mode: "teams", level: "advanced" },
      seed: 27,
      aiSeed: 5,
      starter: "A",
      actions: Array.from({ length: 12 }, () => ({
        type: "pick",
        slot: 0,
      })).concat(
        [{ type: "next-round" } as any],
        Array.from({ length: 12 }, () => ({ type: "pick", slot: 0 })),
      ),
    };
    const engine = {
      create: createNight,
      apply: applyNight,
      validAction: (_a: unknown): _a is any => true,
    };
    expect(
      restore(JSON.stringify(legacy), "night-market", engine).actions,
    ).toHaveLength(25);
    expect(() =>
      restore(
        JSON.stringify({
          ...legacy,
          actions: [...legacy.actions, { type: "pick", slot: 0 }],
        }),
        "night-market",
        engine,
      ),
    ).toThrow();
    expect(() => J.restoreMaster(JSON.stringify(legacy))).toThrow();
  });
  it.each(["easy", "standard", "challenge"] as const)(
    "%s AI is legal, reproducible, and blind to unseen permutations",
    (difficulty) => {
      let s = M.createMaster(41, "B");
      for (let p = 0; p < 16; p++) {
        const o = M.observeMaster(s),
          before = JSON.stringify(o),
          choice = chooseMaster(o, 11 + p, difficulty);
        expect(o.market[choice]).toBeTruthy();
        expect(chooseMaster(o, 11 + p, difficulty)).toBe(choice);
        expect(
          chooseMaster(
            M.observeMaster({ ...s, seed: 999, deck: [...s.deck].reverse() }),
            11 + p,
            difficulty,
          ),
        ).toBe(choice);
        expect(JSON.stringify(o)).toBe(before);
        s = M.applyMaster(s, { type: "pick", slot: choice });
      }
    },
  );
});
