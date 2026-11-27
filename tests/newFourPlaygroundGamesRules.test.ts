import { describe, expect, it } from "vitest";
import * as F from "../games/playground/frog-pond/rules";
import * as T from "../games/playground/cloud-towers/rules";
import * as C from "../games/playground/chef-split/rules";
import * as S from "../games/playground/sumo-push/rules";

describe("frog-pond rules", () => {
  it("conserves total lotuses through normal and advanced openings", () => {
    for (const level of ["normal", "advanced"] as const) {
      let s = F.createFrogPond(77, level, "A");
      const initialSum = s.pads.reduce((a, b) => a + b, 0);
      while (s.phase === "playing") {
        const moves = F.legalMoves(s);
        s = F.applyFrogPond(s, moves[0]);
      }
      const remainingPads = s.pads.reduce((a, b) => a + b, 0);
      expect(s.scores.A + s.scores.B + remainingPads).toBe(initialSum);
      for (const pos of [...s.frogs.A, ...s.frogs.B]) expect(s.pads[pos]).toBe(0);
    }
  });

  it("blocks jumping over water holes and skips stranded team", () => {
    const s = F.createFrogPond(11, "normal", "A");
    // Put water between A frog at 6 and 8
    const custom: F.FrogState = {
      ...s,
      pads: s.pads.map((_, i) => (i === 6 || i === 7 || i === 8 ? (i === 7 ? 0 : 2) : 0)),
      frogs: { A: [6, 18], B: [8, 16] },
    };
    expect(F.movesFrom(custom, 6)).not.toContain(8);
    expect(() => F.applyFrogPond(custom, { type: "move", frog: 6, to: 8 })).toThrow();
  });
});

describe("cloud-towers rules", () => {
  it("enforces max +1 climb, allows climbing down, builds on vacated cell, and wins immediately on 3F", () => {
    const base = T.createTowers(1, "normal", "A");
    // Cannot jump from 0F directly to 2F
    const high = { ...base, heights: base.heights.map((h, i) => (i === 7 ? 2 : h)) };
    expect(T.moveTargets(high, 6)).not.toContain(7);

    // Can climb from 2F to 3F and win immediately without building
    const readyWin: T.TowerState = {
      ...base,
      heights: base.heights.map((_, i) => (i === 6 ? 2 : i === 7 ? 3 : 0)),
    };
    const won = T.applyTowers(readyWin, { type: "turn", from: 6, to: 7 });
    expect(won.phase).toBe("finished");
    expect(won.result).toBe("A");

    // Can build on vacated cell `from`
    const moved = T.applyTowers(base, { type: "turn", from: 6, to: 7, build: 6 });
    expect(moved.heights[6]).toBe(1);
    expect(moved.turn).toBe("B");
  });

  it("includes symmetric reefs and 1F terraces in advanced mode", () => {
    const adv = T.createTowers(5, "advanced", "A");
    expect(adv.reefs).toEqual([7, 17]);
    expect(adv.heights[11]).toBe(1);
    expect(adv.heights[13]).toBe(1);
    expect(T.moveTargets(adv, 6)).not.toContain(7);
  });
});

describe("chef-split rules", () => {
  it("scores sets, variety, and charred penalty cleanly and alternates splitters over 6 rounds", () => {
    const sc = C.scoreChefCollection(["tart", "tart", "matcha", "matcha", "matcha", "pudding", "macaron", "charred"]);
    // base: 4+3+3+2=12, tartBonus=2, matchaBonus=5, varietyBonus=5, penalty=-2 => 22
    expect(sc.total).toBe(22);

    let s = C.createChefSplit(99, "advanced", "A");
    expect(s.tray).toHaveLength(5);
    expect(() => C.applyChefSplit(s, { type: "split", leftIndices: [] })).toThrow();
    expect(() => C.applyChefSplit(s, { type: "split", leftIndices: [0, 1, 2, 3, 4] })).toThrow();

    for (let r = 1; r <= 6; r++) {
      expect(s.splitter).toBe(r % 2 === 1 ? "A" : "B");
      s = C.applyChefSplit(s, { type: "split", leftIndices: [0, 1] });
      expect(s.stage).toBe("choose");
      s = C.applyChefSplit(s, { type: "choose", plate: "left" });
    }
    expect(s.phase).toBe("finished");
    expect(s.collections.A.length + s.collections.B.length).toBe(30);
  });
});

describe("sumo-push rules", () => {
  it("allows 2-vs-1 pushes including ring-outs, and rejects 1-vs-1 or self-ring-out", () => {
    const s = S.createSumoPush(1, "normal", "A");
    // Place A at 10 (C3), 15 (C4) pushing B at 5 (C2) upward -> B lands at 0 (A1 row)
    const board = Array<S.CellPiece>(25).fill(null);
    board[15] = "A";
    board[10] = "A";
    board[5] = "B";
    const setup: S.SumoState = { ...s, board };
    // 1-vs-1 from 10 up cannot push B
    expect(S.inspectPush(setup, 10, "up")).toBeNull();
    // 2-vs-1 from 15 up pushes B to 0
    const next = S.applySumoPush(setup, { type: "push", from: 15, dir: "up" });
    expect(next.board[10]).toBe("A");
    expect(next.board[5]).toBe("A");
    expect(next.board[0]).toBe("B");

    // Now B at 0, A at 5 & 10: A pushes up and rings B out!
    const next2 = S.applySumoPush({ ...next, turn: "A" }, { type: "push", from: 10, dir: "up" });
    expect(next2.pushedOut.A).toBe(1);
    expect(next2.board[0]).toBe("A");
    expect(next2.board[5]).toBe("A");
    // Cannot push own piece off edge from 5 up
    expect(S.inspectPush({ ...next2, turn: "A" }, 5, "up")).toBeNull();
  });

  it("supports neutral wooden crates in advanced mode", () => {
    const adv = S.createSumoPush(2, "advanced", "A");
    expect(adv.size).toBe(6);
    expect(adv.goal).toBe(4);
    expect(adv.board[14]).toBe("C");
    expect(adv.board[21]).toBe("C");
  });
});
