// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { it, expect } from "vitest";
import Workshop from "../components/playground/Workshop";
import { PREFIX, replay, restore } from "../games/playground/session";
import { applyWorkshop, createWorkshop, WorkshopAction, workshopEngine } from "../games/playground/workshop/rules";
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
it("previews occupied workstations, cancels and completes a worker-placement match", () => {
  sessionStorage.clear();
  const h = document.createElement("div");
  document.body.append(h);
  let root = createRoot(h);
  const click = (n: string) => {
    const b = [...h.querySelectorAll("button")].find(
      (b) => b.textContent === n || b.ariaLabel === n,
    );
    expect(b, n).toBeTruthy();
    act(() => b!.click());
  };
  const save = () => JSON.parse(sessionStorage.getItem(`${PREFIX}.workshop.rules-v2`)!);
  act(() => root.render(<Workshop onBack={() => {}} />));
  click("開始本局");
  click("開始正式局");
  click("使用木料站");
  click("取消選擇");
  expect(save().actions).toHaveLength(0);
  click("使用木料站");
  click("確認行動");
  expect(
    (h.querySelector('[aria-label="使用木料站"]') as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  while (!h.textContent?.includes("本局結果")) {
    const next = [...h.querySelectorAll("button")].find(
      (b) => b.ariaLabel === "下一工作日" || b.ariaLabel === "查看總結果",
    );
    if (next) act(() => next.click());
    else click("安排休息");
    const b = [...h.querySelectorAll("button")].find(
      (b) => b.textContent === "確認行動",
    )!;
    act(() => {
      b.click();
      b.click();
    });
  }
  expect(save().actions).toHaveLength(25);
  click("再玩一局");
  click("保留本局");
  expect(save().actions).toHaveLength(25);
  act(() => root.unmount());
  root = createRoot(h);
  act(() => root.render(<Workshop onBack={() => {}} />));
  expect(h.textContent).toContain("本局結果");
  click("再玩一局");
  click("確定");
  expect(save().actions).toHaveLength(0);
  act(() => root.unmount());
  h.remove();
});

it("previews and cancels advanced rest gathering, then records the chosen resource without occupying a station", () => {
  sessionStorage.clear();
  const h = document.createElement("div");
  document.body.append(h);
  const root = createRoot(h);
  const click = (name: string) => {
    const button = [...h.querySelectorAll("button")].find(
      (b) => b.textContent === name || b.ariaLabel === name,
    );
    expect(button, name).toBeTruthy();
    act(() => button!.click());
  };
  const save = () => JSON.parse(sessionStorage.getItem(`${PREFIX}.workshop.rules-v2`)!);
  try {
    act(() => root.render(<Workshop onBack={() => {}} />));
    click("進階");
    click("開始本局");
    click("開始正式局");
    const resource = h.querySelector<HTMLSelectElement>('[aria-label="休息取材"]');
    expect(resource).toBeTruthy();
    expect(resource!.value).toBe("wood");
    expect(h.textContent).toContain("含今日剩6日");
    expect(h.textContent).toContain("升級：木2＋金1＋1工匠");
    expect(h.textContent).toContain("往後取材站＋1／每件出貨＋2分");
    act(() => {
      resource!.value = "metal";
      resource!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    click("安排休息");
    expect(h.textContent).toContain("取金屬1");
    expect(h.textContent).toContain("花費1位工匠，不占工作站");
    click("取消選擇");
    expect(save().actions).toHaveLength(0);
    click("安排休息");
    click("確認行動");
    expect(save().actions).toEqual([{ type: "rest", resource: "metal" }]);
    expect(h.querySelector<HTMLButtonElement>('[aria-label="使用金屬站"]')!.disabled).toBe(false);
    const workers = [...h.querySelectorAll("tr")].find((row) => row.textContent?.startsWith("工匠"));
    expect([...workers!.querySelectorAll("td")].map((cell) => cell.textContent)).toEqual(["2", "3"]);
    expect(h.textContent).toContain("A隊安排一位工匠休息，取金屬1，不占工作站");
  } finally {
    act(() => root.unmount());
    h.remove();
  }
});

it("keeps the simple rest button in normal mode without an extra resource choice", () => {
  sessionStorage.clear();
  const h = document.createElement("div");
  document.body.append(h);
  const root = createRoot(h);
  try {
    act(() => root.render(<Workshop onBack={() => {}} />));
    for (const name of ["開始本局", "開始正式局"]) {
      const button = [...h.querySelectorAll("button")].find((b) => b.textContent === name)!;
      act(() => button.click());
    }
    expect(h.querySelector('[aria-label="休息取材"]')).toBeNull();
    const rest = h.querySelector<HTMLButtonElement>('[aria-label="安排休息"]')!;
    act(() => rest.click());
    expect(h.textContent).toContain("也不獲得資源");
  } finally {
    act(() => root.unmount());
    h.remove();
  }
});

it("still allows a no-resource rest when both advanced stockpiles are full", () => {
  sessionStorage.clear();
  let state = createWorkshop(0, "advanced", "A");
  const actions: WorkshopAction[] = [];
  while (Object.values(state.stock).some((stock) => stock.wood < 6 || stock.metal < 6)) {
    const stock = state.stock[state.turn];
    const action: WorkshopAction = state.phase === "round_summary"
      ? { type: "next" }
      : { type: "rest", resource: stock.wood < 6 ? "wood" : "metal" };
    state = applyWorkshop(state, action);
    actions.push(action);
  }
  const key = `${PREFIX}.workshop.rules-v2`;
  sessionStorage.setItem(key, JSON.stringify({
    version: 1, game: "workshop", id: "full-workshop",
    settings: { mode: "teams", level: "advanced" },
    seed: 0, aiSeed: 0, starter: "A", actions,
  }));
  const h = document.createElement("div");
  document.body.append(h);
  const root = createRoot(h);
  try {
    act(() => root.render(<Workshop onBack={() => {}} />));
    const resource = h.querySelector<HTMLSelectElement>('[aria-label="休息取材"]')!;
    const rest = h.querySelector<HTMLButtonElement>('[aria-label="安排休息"]')!;
    expect(rest.disabled).toBe(true);
    expect(resource.querySelector<HTMLOptionElement>('[value="wood"]')!.disabled).toBe(true);
    expect(resource.querySelector<HTMLOptionElement>('[value="metal"]')!.disabled).toBe(true);
    expect(resource.querySelector<HTMLOptionElement>('[value="none"]')!.disabled).toBe(false);
    act(() => {
      resource.value = "none";
      resource.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(rest.disabled).toBe(false);
    act(() => rest.click());
    const confirm = [...h.querySelectorAll("button")].find((b) => b.textContent === "確認行動")!;
    act(() => confirm.click());
    const saved = JSON.parse(sessionStorage.getItem(key)!);
    expect(saved.actions.at(-1)).toEqual({ type: "rest" });
    expect(saved.actions).toHaveLength(actions.length + 1);
    for (const rowName of ["木料", "金屬"]) {
      const row = [...h.querySelectorAll("tr")].find((r) => r.textContent?.startsWith(rowName))!;
      expect([...row.querySelectorAll("td")].map((cell) => cell.textContent)).toEqual(["6/6", "6/6"]);
    }
  } finally {
    act(() => root.unmount());
    h.remove();
  }
});

it("finishes an advanced resource-rest game, restores its replay and restarts without touching the legacy journal", () => {
  sessionStorage.clear();
  const oldKey = `${PREFIX}.workshop`;
  const key = `${PREFIX}.workshop.rules-v2`;
  const legacy = JSON.stringify({
    version: 1, game: "workshop", id: "previous-rules",
    settings: { mode: "teams", level: "advanced" },
    seed: 7, aiSeed: 0, starter: "A", actions: [{ type: "rest" }],
  });
  sessionStorage.setItem(oldKey, legacy);
  const h = document.createElement("div");
  document.body.append(h);
  let root = createRoot(h);
  const click = (name: string) => {
    const button = [...h.querySelectorAll("button")].find((b) => b.textContent === name || b.ariaLabel === name);
    expect(button, name).toBeTruthy();
    expect(button!.disabled, name).toBe(false);
    act(() => button!.click());
  };
  const saved = () => restore(sessionStorage.getItem(key)!, "workshop", workshopEngine);
  let reloadedMidgame = false;
  try {
    act(() => root.render(<Workshop onBack={() => {}} />));
    expect(h.textContent).toContain("舊版暫存已另外保留");
    click("進階");
    click("開始本局");
    click("開始正式局");
    while (!h.textContent?.includes("本局結果")) {
      const journal = saved();
      const state = replay(journal, workshopEngine).at(-1)!;
      if (state.phase === "round_summary") {
        expect(h.textContent).toContain(`剩餘${state.limit - state.round}日`);
        expect(h.querySelector('[aria-label="休息取材"]')).toBeNull();
        click(state.round === state.limit ? "查看總結果" : "下一工作日");
      } else {
        const resource = h.querySelector<HTMLSelectElement>('[aria-label="休息取材"]')!;
        const stock = state.stock[state.turn];
        act(() => {
          resource.value = stock.wood < 6 ? "wood" : stock.metal < 6 ? "metal" : "none";
          resource.dispatchEvent(new Event("change", { bubbles: true }));
        });
        click("安排休息");
      }
      click("確認行動");
      expect(saved().actions.length).toBeLessThanOrEqual(42);
      if (!reloadedMidgame && saved().actions.length === 4) {
        const before = sessionStorage.getItem(key);
        act(() => root.unmount());
        root = createRoot(h);
        act(() => root.render(<Workshop onBack={() => {}} />));
        expect(sessionStorage.getItem(key)).toBe(before);
        expect(h.textContent).toContain(replay(saved(), workshopEngine).at(-1)!.message);
        reloadedMidgame = true;
      }
    }
    const completed = saved();
    expect(completed.actions).toHaveLength(42);
    const finalState = replay(completed, workshopEngine).at(-1)!;
    expect(finalState.phase).toBe("finished");
    expect(finalState.stock.A).toEqual({ wood: 6, metal: 6, goods: 0, level: 0, score: 0 });
    expect(finalState.stock.B).toEqual(finalState.stock.A);
    click("再玩一局");
    click("保留本局");
    expect(saved()).toEqual(completed);
    act(() => root.unmount());
    root = createRoot(h);
    act(() => root.render(<Workshop onBack={() => {}} />));
    expect(h.textContent).toContain("本局結果");
    expect(saved()).toEqual(completed);
    click("再玩一局");
    click("確定");
    expect(saved().actions).toHaveLength(0);
    expect(saved().settings.level).toBe("advanced");
    expect(h.querySelector('[aria-label="休息取材"]')).not.toBeNull();
    expect(sessionStorage.getItem(oldKey)).toBe(legacy);
  } finally {
    act(() => root.unmount());
    h.remove();
  }
});

