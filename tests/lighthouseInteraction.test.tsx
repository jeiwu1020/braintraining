// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { beforeEach, afterEach, it, expect } from "vitest";
import Lighthouse from "../components/playground/Lighthouse";
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
  const b = Array.from(host.querySelectorAll("button")).find(
    (b) => b.textContent === t || b.getAttribute("aria-label") === t,
  );
  expect(b, t).toBeTruthy();
  act(() => b!.click());
};

const save = () =>
  JSON.parse(sessionStorage.getItem(`${PREFIX}.lighthouse.rules-v3`)!);

it("teaches, previews, cancels, prevents duplicate commits and restores interruption", () => {
  act(() => root.render(<Lighthouse onBack={() => {}} />));
  click("開始本局");
  expect(host.textContent).toContain("三步出發");
  click("裝入燈油 2、糧食 1");
  click("航向白礁（自動交貨）");
  expect(host.textContent).toContain("補給完成");
  click("開始正式局");
  expect(host.querySelectorAll("select")).toHaveLength(0);
  click("增加燈油");
  expect(host.querySelector('[data-testid="load-fuel"]')?.textContent).toBe("2");
  click("裝入目前貨單");
  click("取消選擇");
  expect(save().actions).toHaveLength(0);
  click("裝入目前貨單");
  const b = Array.from(host.querySelectorAll("button")).find(
    (b) => b.textContent === "確認行動",
  )!;
  act(() => {
    b.click();
    b.click();
  });
  expect(save().actions).toHaveLength(1);
  const journal = save();
  act(() => root.unmount());
  root = createRoot(host);
  act(() => root.render(<Lighthouse onBack={() => {}} />));
  expect(save()).toEqual(journal);
  expect(host.textContent).toContain("船艙 3 / 4");
  click("重開");
  click("保留本局");
  expect(save()).toEqual(journal);
  click("重開");
  click("確定");
  expect(save().actions).toHaveLength(0);
});

it("explains the advanced split-delivery mission and keeps its identity after restoring", () => {
  act(() => root.render(<Lighthouse onBack={() => {}} />));
  click("進階");
  click("開始本局");
  click("開始正式局");
  expect(host.textContent).toContain("進階任務");
  expect(host.textContent).toContain("共12箱");
  expect(host.textContent).toContain("分批");
  expect(host.querySelector(".game-shell__header")?.textContent).toMatch(
    /白礁增援|遠岬輪補|松灣增援/,
  );
  click("裝入目前貨單");
  click("確認行動");
  const summary = host.querySelector(".game-shell__header")?.textContent;
  const journal = save();
  expect(journal.actions).toHaveLength(1);
  act(() => root.unmount());
  root = createRoot(host);
  act(() => root.render(<Lighthouse onBack={() => {}} />));
  expect(save()).toEqual(journal);
  expect(host.querySelector(".game-shell__header")?.textContent).toBe(summary);
  click("玩法");
  expect(host.textContent).toContain("抵達自動交貨");
  expect(host.textContent).toContain("限 8 回合");
});
