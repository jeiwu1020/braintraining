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
const saved = () => JSON.parse(sessionStorage.getItem(`${PREFIX}.garden`)!);
it("rotates, previews without placing, cancels and finishes both public gardens", () => {
  act(() => root.render(<Garden onBack={() => {}} />));
  click("開始本局");
  click("開始正式局");
  click("旋轉90°");
  const before = saved();
  act(() =>
    (
      host.querySelector('[data-valid-anchor="true"]') as HTMLButtonElement
    ).click(),
  );
  click("預覽放置");
  click("取消選擇");
  expect(saved()).toEqual(before);
  let guard = 0;
  while (!host.textContent?.includes("本局結果")) {
    expect(++guard).toBeLessThan(40);
    const cell = host.querySelector(
      '[data-valid-anchor="true"]',
    ) as HTMLButtonElement;
    if (cell) {
      act(() => cell.click());
      click("預覽放置");
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
        for (let r = 0; r < 4 && !host.querySelector('[data-valid-anchor="true"]'); r++) click('旋轉90°');
      }
      else {
        click("本手略過");
        click("確認行動");
      }
    }
  }
  expect(saved().actions).toHaveLength(12);
  expect(host.textContent).toContain("花圃");
  click("再玩一局");
  click("保留本局");
  expect(saved().actions).toHaveLength(12);
  click("再玩一局");
  click("確定");
  expect(saved().actions).toHaveLength(0);
});
