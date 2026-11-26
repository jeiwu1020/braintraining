// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import Auction from "../components/playground/Auction";
import { PREFIX } from "../games/playground/session";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;

function button(label: string) {
  const found = [...host.querySelectorAll("button")].find((b) => b.textContent === label || b.ariaLabel === label);
  expect(found, label).toBeTruthy();
  return found!;
}
function click(label: string) {
  const target = button(label);
  expect(target.disabled, label).toBe(false);
  target.focus();
  act(() => target.click());
}
const saved = () => JSON.parse(sessionStorage.getItem(`${PREFIX}.auction`)!);

beforeEach(() => {
  sessionStorage.clear();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Auction onBack={() => {}} />));
  click("開始本局");
  click("開始正式局");
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

it("moves focus into the inline confirmation and announces the selected action", () => {
  click("+1 枚");
  expect(document.activeElement).toBe(button("取消選擇"));
  const confirmation = host.querySelector('[aria-label="確認拍賣選擇"]')!;
  expect(confirmation).toBeTruthy();
  expect(confirmation.querySelector('[aria-live="polite"]')).toBeTruthy();
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  expect(saved().actions).toEqual([]);
});

it("returns focus to the original action after cancellation or Escape without committing", () => {
  click("+1 枚");
  click("取消選擇");
  expect(document.activeElement).toBe(button("+1 枚"));
  expect(saved().actions).toEqual([]);
  click("退出本件");
  expect(document.activeElement).toBe(button("取消選擇"));
  act(() => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(document.activeElement).toBe(button("退出本件"));
  expect(host.querySelector('[aria-label="確認拍賣選擇"]')).toBeNull();
  expect(saved().actions).toEqual([]);
});

it("keeps keyboard focus usable through a bid, sale settlement, and next-lot transition", () => {
  click("+1 枚");
  click("確認行動");
  expect(document.activeElement).toBe(button("+1 枚"));
  click("退出本件");
  click("確認行動");
  expect(host.textContent).toContain("本件成交");
  expect(document.activeElement).toBe(button("下一件展品"));
  click("下一件展品");
  expect(document.activeElement).toBe(button("取消選擇"));
  click("確認行動");
  expect(document.activeElement).toBe(button("+1 枚"));
  expect(saved().actions).toHaveLength(3);
});

it("focuses the result action when the last lot finishes and the old trigger no longer exists", () => {
  for (let lot = 0; lot < 6; lot++) {
    click("退出本件");
    click("確認行動");
    expect(document.activeElement).toBe(button("退出本件"));
    click("退出本件");
    click("確認行動");
    const next = lot === 5 ? "查看展覽總分" : "下一件展品";
    expect(document.activeElement).toBe(button(next));
    click(next);
    click("確認行動");
  }
  expect(host.textContent).toContain("本局結果");
  expect(document.activeElement).toBe(button("再玩一局"));
  expect(saved().actions).toHaveLength(18);
});
