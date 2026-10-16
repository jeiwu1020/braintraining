// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { it, expect } from "vitest";
import Workshop from "../components/playground/Workshop";
import { PREFIX } from "../games/playground/session";
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
  const save = () => JSON.parse(sessionStorage.getItem(`${PREFIX}.workshop`)!);
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
