// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import NightMarketMaster from "../components/playground/NightMarketMaster";
import {
  MASTER_KEY,
  newMasterJournal,
} from "../games/playground/night-market/masterSession";
import {
  applyMaster,
  createMaster,
  type MasterAction,
} from "../games/playground/night-market/masterRules";
let root: Root, host: HTMLDivElement;
beforeEach(() => {
  sessionStorage.clear();
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.stubGlobal(
    "Worker",
    class {
      postMessage() {}
      terminate() {}
    },
  );
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
const render = () =>
  act(() => root.render(<NightMarketMaster onBack={() => undefined} />));
const click = (name: string) => {
  const b = [...host.querySelectorAll("button")].find(
    (b) => b.textContent === name,
  );
  expect(b).toBeTruthy();
  act(() => b!.click());
};
function fixture(
  round: 1 | 2,
  picks: number,
  mode: "teams" | "solo" = "teams",
) {
  const j = newMasterJournal({ mode, aiDifficulty: "standard" }, "A", 27, 5);
  let s = createMaster(27, "A");
  const push = (a: MasterAction) => {
    s = applyMaster(s, a);
    j.actions.push(a);
  };
  if (round === 2) {
    for (let p = 0; p < 16; p++) push({ type: "pick", slot: p % 4 });
    push({ type: "next-round" });
  }
  for (let p = 0; p < picks; p++) push({ type: "pick", slot: p % 4 });
  sessionStorage.setItem(MASTER_KEY, JSON.stringify(j));
  return { s, j };
}
it("starts only Master, shows three of twelve, preselect/cancel do not commit and repeated confirmation is atomic", () => {
  const legacy = '{"old":"journal untouched"}';
  sessionStorage.setItem("braintraining.playground.v1.night-market", legacy);
  render();
  expect(host.textContent).toContain("搭配六種菜色，完成訂單，挑戰更高分！");
  click("開始大師版");
  expect(host.textContent).toContain("本輪啟用 3／12");
  expect(host.querySelectorAll("[data-master-slot]")).toHaveLength(4);
  act(() =>
    (host.querySelector('[data-master-slot="0"]') as HTMLButtonElement).click(),
  );
  expect(JSON.parse(sessionStorage.getItem(MASTER_KEY)!).actions).toHaveLength(
    0,
  );
  click("取消");
  act(() =>
    (host.querySelector('[data-master-slot="1"]') as HTMLButtonElement).click(),
  );
  const button = [...host.querySelectorAll("button")].find(
    (b) => b.textContent === "確認拿取",
  )!;
  act(() => {
    button.click();
    button.click();
  });
  expect(JSON.parse(sessionStorage.getItem(MASTER_KEY)!).actions).toHaveLength(
    1,
  );
  expect(
    sessionStorage.getItem("braintraining.playground.v1.night-market"),
  ).toBe(legacy);
  click("撤回");
  expect(JSON.parse(sessionStorage.getItem(MASTER_KEY)!).actions).toHaveLength(
    0,
  );
});
it.each([1, 2] as const)(
  "keeps round %s final card before explicit summary and reload never commits a second pick",
  (round) => {
    const { j } = fixture(round, 15);
    render();
    act(() =>
      (
        host.querySelector('[data-master-slot="3"]') as HTMLButtonElement
      ).click(),
    );
    click("確認拿取");
    expect(host.querySelector('[aria-label="最後一手"]')).toBeTruthy();
    expect(host.querySelector('[aria-label="本輪結算"]')).toBeNull();
    expect(
      host.querySelector('[aria-label="A 隊餐盤"]')?.textContent,
    ).toContain("8／8");
    expect(
      host.querySelector('[aria-label="B 隊餐盤"]')?.textContent,
    ).toContain("8／8");
    click("查看結算");
    expect(host.querySelector('[aria-label="本輪結算"]')).toBeTruthy();
    expect(host.querySelectorAll("[data-order-score]")).toHaveLength(6);
    const before = sessionStorage.getItem(MASTER_KEY);
    act(() => root.unmount());
    root = createRoot(host);
    render();
    expect(host.querySelector('[aria-label="最後一手"]')).toBeTruthy();
    expect(sessionStorage.getItem(MASTER_KEY)).toBe(before);
    expect(JSON.parse(before!).actions).toHaveLength(j.actions.length + 1);
  },
);
it("round two undo cannot cross the first-round boundary", () => {
  fixture(1, 16);
  render();
  click("查看結算");
  click("開始第 2 輪");
  expect(
    [...host.querySelectorAll("button")].find((b) => b.textContent === "撤回")
      ?.disabled,
  ).toBe(true);
  act(() =>
    (host.querySelector('[data-master-slot="0"]') as HTMLButtonElement).click(),
  );
  click("確認拿取");
  click("撤回");
  expect(JSON.parse(sessionStorage.getItem(MASTER_KEY)!).actions).toHaveLength(
    17,
  );
});
it("AI fallback remains pending until facilitator reveal, then makes one legal pick", () => {
  let worker: any;
  vi.stubGlobal(
    "Worker",
    class {
      onerror: any;
      constructor() {
        worker = this;
      }
      postMessage() {}
      terminate() {}
    },
  );
  fixture(1, 1, "solo");
  render();
  act(() => worker.onerror());
  expect(JSON.parse(sessionStorage.getItem(MASTER_KEY)!).actions).toHaveLength(
    1,
  );
  click("看電腦行動");
  expect(JSON.parse(sessionStorage.getItem(MASTER_KEY)!).actions).toHaveLength(
    2,
  );
});
it("unknown Master journals are not deleted or interpreted as legacy on load", () => {
  const raw = '{"version":77,"ruleset":"future"}';
  sessionStorage.setItem(MASTER_KEY, raw);
  sessionStorage.setItem("braintraining.playground.v1.night-market", "legacy");
  render();
  expect(host.textContent).toContain("暫存無法繼續");
  expect(sessionStorage.getItem(MASTER_KEY)).toBe(raw);
  expect(
    sessionStorage.getItem("braintraining.playground.v1.night-market"),
  ).toBe("legacy");
});
it.each(["重新設定大師版", "重開大師版本局"])(
  "%s explains its own save scope without promising a legacy history entry",
  (action) => {
    fixture(1, 3);
    const legacy = 'legacy journal';
    sessionStorage.setItem("braintraining.playground.v1.night-market", legacy);
    render();
    click("選項");
    click(action);
    const dialog = host.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain("只清除大師版本局進度；舊一般／進階的暫存不受影響。");
    expect(dialog.textContent).not.toContain("標示未完成");
    click("保留本局");
    expect(JSON.parse(sessionStorage.getItem(MASTER_KEY)!).actions).toHaveLength(3);
    click("選項");
    click(action);
    click("確定");
    expect(sessionStorage.getItem("braintraining.playground.v1.night-market")).toBe(legacy);
  },
);
