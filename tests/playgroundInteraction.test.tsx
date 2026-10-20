// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import NightMarket from "../components/playground/NightMarket";
import WallRace from "../components/playground/WallRace";
import {
  createNight,
  ORDERS,
  ORDER_IDS,
} from "../games/playground/night-market/rules";
import { PREFIX } from "../games/playground/session";
let root: Root, host: HTMLDivElement;
class FakeWorker {
  static all: FakeWorker[] = [];
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  request: any;
  terminated = false;
  constructor() {
    FakeWorker.all.push(this);
  }
  postMessage(request: any) {
    this.request = request;
  }
  terminate() {
    this.terminated = true;
  }
  reply(action: any) {
    this.onmessage?.({ data: { id: this.request.id, action } });
  }
}
const button = (name: string) =>
  [...host.querySelectorAll("button")].find(
    (b) => b.textContent === name || b.getAttribute("aria-label") === name,
  )!;
const click = (name: string) => {
  expect(button(name)).toBeTruthy();
  act(() => button(name).click());
};
const mount = (game: "night" | "wall") =>
  act(() =>
    root.render(
      game === "night" ? (
        <NightMarket onBack={() => undefined} />
      ) : (
        <WallRace onBack={() => undefined} />
      ),
    ),
  );
const saved = (id = "night-market") =>
  JSON.parse(sessionStorage.getItem(`${PREFIX}.${id}`)!);
const firstCard = () =>
  act(() =>
    (host.querySelector('[data-market-slot="0"]') as HTMLButtonElement).click(),
  );
beforeEach(() => {
  sessionStorage.clear();
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal("Worker", FakeWorker);
  FakeWorker.all = [];
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it("teaches three steps without committing the sample and permits skipping", () => {
  mount("night");
  click("開始本局");
  expect(host.querySelector("ol")?.children.length).toBe(3);
  click("試選第 2 個飯糰");
  expect(host.textContent).toContain("1 分 → 5 分");
  expect(sessionStorage.getItem(`${PREFIX}.night-market`)).toBeNull();
  click("開始");
  expect(saved().actions).toEqual([]);
});
it("requires confirmation, cancels, ignores duplicate confirmation, and restores after remount", () => {
  mount("night");
  click("開始本局");
  click("略過並開始");
  const before = host.querySelector(".pg-market")!.textContent;
  firstCard();
  expect(saved().actions).toHaveLength(0);
  click("取消");
  expect(button("確認拿取").disabled).toBe(true);
  firstCard();
  const confirm = button("確認拿取");
  act(() => {
    confirm.click();
    confirm.click();
  });
  expect(saved().actions).toHaveLength(1);
  click("撤回");
  expect(saved().actions).toHaveLength(0);
  expect(host.querySelector(".pg-market")!.textContent).toBe(before);
  firstCard();
  click("確認拿取");
  const journal = saved();
  act(() => root.unmount());
  root = createRoot(host);
  mount("night");
  expect(saved()).toEqual(journal);
  expect(host.textContent).toContain("輪到 ▲ B 隊");
  click("選項");
  click("重新設定…");
  click("保留本局");
  expect(saved()).toEqual(journal);
});
it("never auto-reveals AI, undoes a human/AI pair, and ignores obsolete worker callbacks", () => {
  mount("night");
  click("單人");
  click("開始本局");
  click("略過並開始");
  firstCard();
  click("確認拿取");
  const first = FakeWorker.all.at(-1)!;
  act(() => first.reply({ type: "pick", slot: 1 }));
  expect(saved().actions).toHaveLength(1);
  click("看電腦行動");
  expect(saved().actions).toHaveLength(2);
  click("撤回");
  expect(saved().actions).toHaveLength(0);
  firstCard();
  click("確認拿取");
  const stale = FakeWorker.all.at(-1)!;
  click("撤回");
  act(() => stale.reply({ type: "pick", slot: 2 }));
  expect(saved().actions).toHaveLength(0);
  expect(stale.terminated).toBe(true);
  expect(button("看電腦行動")).toBeUndefined();
});
it("recovers only its own corrupt record, preserving legacy and the other game", () => {
  sessionStorage.setItem("legacy-game", "keep");
  sessionStorage.setItem(`${PREFIX}.wall-race`, "other");
  sessionStorage.setItem(`${PREFIX}.night-market`, "broken");
  mount("night");
  expect(host.textContent).toContain("暫存無法繼續");
  click("重新開局");
  expect(sessionStorage.getItem("legacy-game")).toBe("keep");
  expect(sessionStorage.getItem(`${PREFIX}.wall-race`)).toBe("other");
  expect(sessionStorage.getItem(`${PREFIX}.night-market`)).toBeNull();
});
it("previews wall edges, blocks crossing, cancels, and completes a two-team jump game", () => {
  mount("wall");
  click("開始本局");
  click("略過並開始");
  click("築牆");
  click("B2，牆錨點");
  expect(host.textContent).toContain("B2–B3、C2–C3");
  expect(saved("wall-race").actions).toHaveLength(0);
  click("確認放牆");
  click("築牆");
  click("直");
  click("B2，牆錨點");
  expect(host.textContent).toContain("牆交叉");
  expect(button("確認放牆").disabled).toBe(true);
  click("取消");
  click("撤回");
  expect(saved("wall-race").actions).toHaveLength(0);
  for (const cell of ["C4", "C2", "C3", "C4", "C2", "C5"]) {
    click(`${cell}，可走`);
    click("確認走棋");
  }
  expect(host.textContent).toContain("B 隊到岸獲勝");
  expect(button("撤回").disabled).toBe(true);
  click("再玩一局");
  expect(host.textContent).toContain("輪到 ▲ B 隊");
  expect(saved("wall-race").starter).toBe("B");
});

it("keeps a computer-only opening while undoing later human decisions", () => {
  sessionStorage.setItem(
    `${PREFIX}.night-market`,
    JSON.stringify({
      version: 1,
      game: "night-market",
      id: "opening",
      settings: { mode: "solo", level: "normal" },
      seed: 1,
      aiSeed: 2,
      starter: "B",
      actions: [],
    }),
  );
  mount("night");
  act(() => FakeWorker.all.at(-1)!.reply({ type: "pick", slot: 0 }));
  click("看電腦行動");
  expect(button("撤回").disabled).toBe(true);
  firstCard();
  click("確認拿取");
  click("撤回");
  expect(saved().actions).toHaveLength(1);
  expect(button("撤回").disabled).toBe(true);
});

it.each(ORDER_IDS)(
  "keeps the %s order condition visible beside its live progress",
  (order) => {
    const seed = Array.from({ length: 100 }, (_, i) => i).find((seed) =>
      createNight(seed, "advanced", "A").orders.includes(order),
    )!;
    sessionStorage.setItem(
      `${PREFIX}.night-market`,
      JSON.stringify({
        version: 1,
        game: "night-market",
        id: `order-${order}`,
        settings: { mode: "teams", level: "advanced" },
        seed,
        aiSeed: 2,
        starter: "A",
        actions: [],
      }),
    );
    mount("night");
    const goals = host.querySelector('[aria-label="本輪公開訂單"]')!;
    expect(goals.textContent).toContain(ORDERS[order].condition);
    expect(goals.querySelectorAll(".pg-order-condition")).toHaveLength(2);
    expect(goals.textContent).toContain("A ○未符合");
    firstCard();
    expect(goals.textContent).toContain(ORDERS[order].condition);
    click("確認拿取");
    expect(
      host.querySelector('[aria-label="本輪公開訂單"]')!.textContent,
    ).toContain(ORDERS[order].condition);
    expect(host.querySelectorAll("[data-market-slot]")).toHaveLength(4);
  },
);

it("keeps normal mode free of active order labels", () => {
  mount("night");
  click("開始本局");
  click("略過並開始");
  expect(host.querySelector('[aria-label="本輪公開訂單"]')).toBeNull();
  expect(host.textContent).not.toContain("本輪啟用");
  expect(host.querySelectorAll("[data-market-slot]")).toHaveLength(4);
});

it("labels only the two active advanced orders out of four possibilities", () => {
  mount("night");
  click("進階");
  click("開始本局");
  click("略過並開始");
  const goals = host.querySelector('[aria-label="本輪公開訂單"]')!;
  const state = createNight(saved().seed, "advanced", "A");
  expect(goals.textContent).toContain("本輪啟用 2／4 種訂單");
  expect(goals.querySelectorAll('[role="group"]')).toHaveLength(2);
  for (const order of ORDER_IDS) {
    expect(goals.textContent?.includes(ORDERS[order].name)).toBe(state.orders.includes(order));
  }
});

it.each(["setup", "playing"])("explains all possible orders and selection in the %s rules dialog", (phase) => {
  mount("night");
  if (phase === "playing") {
    click("開始本局");
    click("略過並開始");
  }
  const rulesButton = phase === "setup" ? "玩法" : "規則";
  click(rulesButton);
  const dialog = host.querySelector('[role="dialog"]')!;
  const text = dialog.textContent!.replace(/\s+/g, "");
  expect(text).toContain("可能抽到的四種訂單");
  expect([...dialog.querySelectorAll("p")].filter(p => ORDER_IDS.some(order => p.textContent?.startsWith(ORDERS[order].name)))).toHaveLength(4);
  for (const order of ORDER_IDS) {
    expect(text).toContain(`${ORDERS[order].name}：${ORDERS[order].condition}，＋${ORDERS[order].points}分。`.replace(/\s+/g, ""));
  }
  expect(text).toContain("進階模式每輪從四種訂單隨機抽出兩種");
  expect(text).toContain("本輪只有畫面顯示的兩種有效，雙方都可完成");
  expect(text).toContain("每人拿滿6張後才結算符合的訂單加分");
  expect(text).toContain("第2輪重新抽選，可能與上一輪重複");
  click("關閉");
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  click(rulesButton);
  act(() => host.querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(host.querySelector('[role="dialog"]')).toBeNull();
});
