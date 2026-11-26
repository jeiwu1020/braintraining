// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { it, expect } from "vitest";
import Lantern from "../components/playground/Lantern";
import { PREFIX } from "../games/playground/session";
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
it("previews, cancels, prevents duplicate scoring and completes a public match", () => {
  sessionStorage.clear();
  const host = document.createElement("div");
  document.body.append(host);
  let root = createRoot(host);
  const click = (name: string) => {
    const b = [...host.querySelectorAll("button")].find(
      (b) => b.textContent === name || b.ariaLabel === name,
    );
    expect(b, name).toBeTruthy();
    act(() => b!.click());
  };
  const save = () => JSON.parse(sessionStorage.getItem(`${PREFIX}.lantern`)!);
  act(() => root.render(<Lantern onBack={() => {}} />));
  click("開始本局");
  click("開始正式局");
  click("放置到茶巷");
  click("取消選擇");
  expect(save().actions).toHaveLength(0);
  for (let i = 0; i < 9; i++) {
    for (let t = 0; t < 2; t++) {
      click("等待布局");
      const b = [...host.querySelectorAll("button")].find(
        (b) => b.textContent === "確認行動",
      )!;
      act(() => {
        b.click();
        b.click();
      });
    }
    if ([2, 5, 8].includes(i)) {
      expect(host.textContent).toContain("輪計分");
      click(i === 8 ? "查看總結果" : "繼續布局");
      click("確認行動");
    }
  }
  expect(host.textContent).toContain("本局結果");
  expect(save().actions).toHaveLength(21);
  click("再玩一局");
  click("保留本局");
  expect(save().actions).toHaveLength(21);
  act(() => root.unmount());
  root = createRoot(host);
  act(() => root.render(<Lantern onBack={() => {}} />));
  expect(host.textContent).toContain("本局結果");
  click("再玩一局");
  click("全新一局");
  expect(save().actions).toHaveLength(0);
  act(() => root.unmount());
  host.remove();
});

