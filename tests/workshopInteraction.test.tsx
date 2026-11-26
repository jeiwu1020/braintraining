// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { it, expect } from "vitest";
import Workshop from "../components/playground/Workshop";
import { workshopEngine } from "../games/playground/workshop/rules";
import { PREFIX, restore, replay } from "../games/playground/session";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

it("uses direct 1-tap stations with zero dropdowns, saves under rules-v3, and preserves legacy storage", () => {
  sessionStorage.clear();
  const oldKey = `${PREFIX}.workshop`;
  const key = `${PREFIX}.workshop.rules-v3`;
  const legacy = JSON.stringify({
    version: 1,
    game: "workshop",
    id: "previous-rules",
    settings: { mode: "teams", level: "advanced" },
    seed: 7,
    aiSeed: 0,
    starter: "A",
    actions: [{ type: "rest" }],
  });
  sessionStorage.setItem(oldKey, legacy);

  const h = document.createElement("div");
  document.body.append(h);
  let root = createRoot(h);
  const click = (name: string) => {
    const button = [...h.querySelectorAll("button")].find(
      (b) => b.textContent === name || b.ariaLabel === name,
    );
    expect(button, name).toBeTruthy();
    expect(button!.disabled, name).toBe(false);
    act(() => button!.click());
  };
  const saved = () => restore(sessionStorage.getItem(key)!, "workshop", workshopEngine);

  try {
    act(() => root.render(<Workshop onBack={() => {}} />));
    expect(h.textContent).toContain("舊版暫存已另外保留");
    click("進階");
    click("開始本局");
    click("開始正式局");

    expect(h.querySelectorAll("select")).toHaveLength(0);
    expect(h.textContent).toContain("含今日剩 5 日");

    click("使用大料倉");
    click("取消選擇");
    expect(saved().actions).toHaveLength(0);

    click("使用大料倉");
    click("確認行動");
    expect(saved().actions).toEqual([{ type: "use", station: "metal" }]);
    expect(h.querySelector<HTMLButtonElement>('[aria-label="使用大料倉"]')!.disabled).toBe(true);

    // Finish a full advanced game by taking rest actions & next day
    while (!h.textContent?.includes("本局結果")) {
      const state = replay(saved(), workshopEngine).at(-1)!;
      if (state.phase === "round_summary") {
        click(state.round === state.limit ? "查看總結果" : "下一工作日");
      } else {
        click("安排休息");
      }
      click("確認行動");
    }

    const completed = saved();
    expect(completed.actions).toHaveLength(35);
    const finalState = replay(completed, workshopEngine).at(-1)!;
    expect(finalState.phase).toBe("finished");

    act(() => root.unmount());
    root = createRoot(h);
    act(() => root.render(<Workshop onBack={() => {}} />));
    expect(h.textContent).toContain("本局結果");

    click("再玩一局");
    click("確定");
    expect(saved().actions).toHaveLength(0);
    expect(sessionStorage.getItem(oldKey)).toBe(legacy);
  } finally {
    act(() => root.unmount());
    h.remove();
  }
});
