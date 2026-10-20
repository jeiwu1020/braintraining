// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { chooseNight } from "../games/playground/night-market/ai";
import { applyNight, createNight, observeNight, type Observation } from "../games/playground/night-market/rules";
import NightMarket from "../components/playground/NightMarket";
import { PREFIX } from "../games/playground/session";

const difficulties = ["easy", "standard", "challenge"] as const;
const levels = ["normal", "advanced"] as const;
const finalChoice = (level: "normal" | "advanced" = "normal"): Observation => ({
  level, turn: "B", market: ["corn", "tofu", null, null],
  hands: { A: { rice: 1, corn: 3, tofu: 0 }, B: { rice: 2, corn: 2, tofu: 1 } },
  orders: [], unknown: { rice: 0, corn: 0, tofu: 0 }, remaining: { A: 2, B: 1 },
});

afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); });

describe.each(levels)("Night Market %s AI difficulty", (level) => {
  it.each(difficulties)("keeps %s legal, reproducible, and blind to private deck permutations", (difficulty) => {
    let s = createNight(41, level, "A");
    for (let turn = 0; turn < 12; turn++) {
      const observation = observeNight(s);
      const seed = (513 ^ (s.round * 97) ^ s.picks) >>> 0;
      const before = structuredClone(observation);
      const choice = chooseNight(observation, seed, difficulty);
      expect(observation.market[choice]).toBeTruthy();
      expect(chooseNight(observation, seed, difficulty)).toBe(choice);
      expect(chooseNight(observeNight({ ...s, seed: 999, deck: [...s.deck].reverse() }), seed, difficulty)).toBe(choice);
      expect(observation).toEqual(before);
      s = applyNight(s, { type: "pick", slot: choice });
    }
  });
});

it("easy reproducibly varies among near-best legal foods instead of always maximizing", () => {
  const o = finalChoice();
  const choices = new Set(Array.from({ length: 32 }, (_, seed) => chooseNight(o, seed, "easy")));
  expect(choices).toEqual(new Set([0, 1]));
});

it("easy avoids obviously poor moves when a first tofu is available", () => {
  const o = finalChoice();
  o.hands.B = { rice: 2, corn: 3, tofu: 0 };
  o.market = ["rice", "tofu", null, null];
  for (let seed = 0; seed < 32; seed++) expect(chooseNight(o, seed, "easy")).toBe(1);
});

it("standard favors its own score while challenge blocks the opponent in normal rules", () => {
  const o = finalChoice();
  expect(chooseNight(o, 9, "standard")).toBe(0);
  expect(chooseNight(o, 9, "challenge")).toBe(1);
  expect(chooseNight(o, 9)).toBe(0);
});

it("standard and challenge honor only advanced public orders and only score completion at the last pick", () => {
  const o = finalChoice("advanced");
  o.orders = ["even"];
  o.remaining.A = 0;
  for (const difficulty of ["standard", "challenge"] as const) {
    expect(chooseNight(o, 9, difficulty)).toBe(1);
    expect(chooseNight({ ...o, level: "normal" }, 9, difficulty)).toBe(0);
    expect(chooseNight({ ...o, orders: [] }, 9, difficulty)).toBe(0);
  }
});

it("preserves the original omitted-difficulty scoring and advanced blocking policy", () => {
  const o = finalChoice();
  expect(chooseNight(o, 9)).toBe(0);
  expect(chooseNight({ ...o, level: "advanced" }, 9)).toBe(1);
  const pair = { ...o, hands: { ...o.hands, B: { rice: 1, corn: 3, tofu: 1 } }, market: ["corn", "rice", null, null] } satisfies Observation;
  expect(chooseNight(pair, 9)).toBe(1);
});

it("standard looks one own pick ahead and avoids planning an unavailable rice pair", () => {
  const o: Observation = {
    level: "normal", turn: "A", market: ["rice", "tofu", "corn", "corn"],
    hands: { A: { rice: 2, corn: 1, tofu: 1 }, B: { rice: 3, corn: 0, tofu: 1 } },
    orders: [], unknown: { rice: 0, corn: 3, tofu: 3 }, remaining: { A: 2, B: 2 },
  };
  expect(o.market[chooseNight(o, 9)]).toBe("rice");
  expect(o.market[chooseNight(o, 9, "standard")]).toBe("corn");
});

it.each(difficulties)("%s handles one remaining legal slot and rejects an empty market", (difficulty) => {
  const o = finalChoice();
  expect(chooseNight({ ...o, market: [null, null, "tofu", null] }, 9, difficulty)).toBe(2);
  expect(() => chooseNight({ ...o, market: [null, null, null, null] }, 9, difficulty)).toThrow("沒有合法菜牌");
});

it.each(["easy", "standard"] as const)("%s does not change its choice to deny an opponent dish", (difficulty) => {
  const o = finalChoice("advanced");
  for (let seed = 0; seed < 20; seed++) {
    expect(chooseNight(o, seed, difficulty)).toBe(chooseNight({ ...o, hands: { ...o.hands, A: { rice: 0, corn: 0, tofu: 4 } } }, seed, difficulty));
  }
});

it.each(difficulties)("worker forwards %s and the independent turn seed", async (difficulty) => {
  const postMessage = vi.fn();
  const worker = { postMessage, onmessage: undefined as any };
  vi.stubGlobal("self", worker);
  vi.resetModules();
  await import("../games/playground/night-market/ai.worker");
  const observation = finalChoice(difficulty === "standard" ? "advanced" : "normal");
  const seed = difficulty === "easy" ? 1 : 9;
  worker.onmessage({ data: { id: "turn", observation, seed, difficulty } });
  expect(postMessage).toHaveBeenCalledWith({ id: "turn", action: { type: "pick", slot: chooseNight(observation, seed, difficulty) } });
});

it.each([...difficulties, undefined])("component sends %s and preserves the matching policy after failure", (difficulty) => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  let worker: any;
  vi.stubGlobal("Worker", class {
    request: any; onerror: any;
    constructor() { worker = this; }
    postMessage(request: any) { this.request = request; }
    terminate() {}
  });
  const s = createNight(27, "advanced", "B");
  const aiSeed = 513;
  const seed = (aiSeed ^ (s.round * 97) ^ s.picks) >>> 0;
  sessionStorage.setItem(`${PREFIX}.night-market`, JSON.stringify({ version: 1, game: "night-market", id: "difficulty", settings: { mode: "solo", level: "advanced", aiDifficulty: difficulty }, seed: 27, aiSeed, starter: "B", actions: [] }));
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    act(() => root.render(React.createElement(NightMarket, { onBack: () => {} })));
    expect(worker.request).toMatchObject({ difficulty, seed, observation: observeNight(s) });
    act(() => worker.onerror());
    expect(JSON.parse(sessionStorage.getItem(`${PREFIX}.night-market`)!).actions).toEqual([]);
    const reveal = [...host.querySelectorAll("button")].find((b) => b.textContent === "看電腦行動")!;
    act(() => reveal.click());
    expect(JSON.parse(sessionStorage.getItem(`${PREFIX}.night-market`)!).actions).toEqual([{ type: "pick", slot: difficulty === undefined ? 0 : chooseNight(observeNight(s), seed, difficulty) }]);
  } finally {
    act(() => root.unmount());
    host.remove();
  }
});
