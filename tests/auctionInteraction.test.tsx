// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { it, expect } from "vitest";
import Auction from "../components/playground/Auction";
import { PREFIX } from "../games/playground/session";
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
it("previews a bid, cancels, debits one winning sale and restores interrupted auctions", () => {
  sessionStorage.clear();
  const h = document.createElement("div");
  document.body.append(h);
  let root = createRoot(h);
  const click = (name: string) => {
    const b = [...h.querySelectorAll("button")].find(
      (b) => b.textContent === name || b.ariaLabel === name,
    );
    expect(b, name).toBeTruthy();
    act(() => b!.click());
  };
  const save = () => JSON.parse(sessionStorage.getItem(`${PREFIX}.auction`)!);
  act(() => root.render(<Auction onBack={() => {}} />));
  click("開始本局");
  click("開始正式局");
  click("加一枚籌碼");
  click("取消選擇");
  expect(save().actions).toHaveLength(0);
  click("加一枚籌碼");
  const b = [...h.querySelectorAll("button")].find(
    (b) => b.textContent === "確認行動",
  )!;
  act(() => {
    b.click();
    b.click();
  });
  expect(save().actions).toHaveLength(1);
  const j = save();
  act(() => root.unmount());
  root = createRoot(h);
  act(() => root.render(<Auction onBack={() => {}} />));
  expect(save()).toEqual(j);
  click("退出本件");
  click("確認行動");
  expect(h.textContent).toContain("本件成交");
  let guard = 0;
  while (!h.textContent?.includes("本局結果")) {
    expect(++guard).toBeLessThan(40);
    const next = [...h.querySelectorAll("button")].find(
      (b) => b.textContent === "下一件展品" || b.textContent === "查看展覽總分",
    );
    if (next) act(() => next.click());
    else click("退出本件");
    click("確認行動");
  }
  expect(h.textContent).toContain("展覽");
  click("再玩一局");
  click("保留本局");
  expect(save().actions.length).toBeGreaterThan(1);
  click("再玩一局");
  click("確定");
  expect(save().actions).toHaveLength(0);
  act(() => root.unmount());
  h.remove();
});
