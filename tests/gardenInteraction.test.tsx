// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { beforeEach, afterEach, it, expect } from "vitest";
import Garden from "../components/playground/Garden";
import { PREFIX } from "../games/playground/session";
let host: HTMLDivElement, root: Root;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => {
  sessionStorage.clear();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
const click = (t: string) => {
  const b = [...host.querySelectorAll("button")].find(
    (b) => b.textContent === t || b.ariaLabel === t,
  );
  expect(b, t).toBeTruthy();
  act(() => b!.click());
};
const saved = () => JSON.parse(sessionStorage.getItem(`${PREFIX}.garden.rules-v2`)!);
it("rotates in place, confirms inline without blocking modal, keeps A-left/B-right order and finishes 8 seasonal turns", () => {
  act(() => root.render(<Garden onBack={() => {}} />));
  click("開始本局");
  click("開始正式局");
  const boardsBefore = [...host.querySelectorAll("[data-board-team]")].map((el) =>
    el.getAttribute("data-board-team"),
  );
  expect(boardsBefore).toEqual(["A", "B"]);
  expect(host.textContent).toContain("春季");
  expect(host.textContent).toContain("夏季");
  expect(host.textContent).toContain("秋季");
  expect(host.textContent).toContain("冬季");

  act(() =>
    (
      host.querySelector('[data-valid-anchor="true"]') as HTMLButtonElement
    ).click(),
  );
  click("旋轉90°");
  expect(host.querySelectorAll(".tg-ghost").length).toBeGreaterThan(0);

  const before = saved();
  click("放置地形");
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  expect(host.querySelector(".tg-inline-confirm")).toBeTruthy();
  click("取消選擇");
  expect(saved()).toEqual(before);

  let guard = 0;
  while (!host.textContent?.includes("本局結果")) {
    expect(++guard).toBeLessThan(30);
    const order = [...host.querySelectorAll("[data-board-team]")].map((el) =>
      el.getAttribute("data-board-team"),
    );
    expect(order).toEqual(["A", "B"]);

    const cell = host.querySelector(
      '[data-valid-anchor="true"]',
    ) as HTMLButtonElement;
    if (cell) {
      act(() => cell.click());
      click("放置地形");
      const b = [...host.querySelectorAll("button")].find(
        (b) => b.textContent === "確認行動",
      )!;
      act(() => {
        b.click();
        b.click();
      });
    } else {
      const available = host.querySelector(
        '[data-tile-available="true"]',
      ) as HTMLButtonElement;
      if (available) {
        act(() => available.click());
        for (
          let r = 0;
          r < 4 && !host.querySelector('[data-valid-anchor="true"]');
          r++
        )
          click("旋轉90°");
      } else {
        click("本手略過");
        click("確認行動");
      }
    }
  }
  expect(saved().actions).toHaveLength(8);
  expect(host.textContent).toContain("花圃");
  expect(host.textContent).not.toContain("空洞");
  click("再玩一局");
  click("保留本局");
  expect(saved().actions).toHaveLength(8);
  click("再玩一局");
  click("確定");
  expect(saved().actions).toHaveLength(0);
});
