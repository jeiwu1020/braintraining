// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Playground from "../components/playground/Playground";
import FrogPond from "../components/playground/FrogPond";
import CloudTowers from "../components/playground/CloudTowers";
import ChefSplit from "../components/playground/ChefSplit";
import SumoPush from "../components/playground/SumoPush";

let host: HTMLDivElement, root: Root;

class WorkerStub {
  onmessage: any;
  onerror: any;
  postMessage() {
    // trigger fallback path or quick response
    setTimeout(() => this.onerror?.(), 0);
  }
  terminate() {}
}

beforeEach(() => {
  sessionStorage.clear();
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal("Worker", WorkerStub);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

const clickText = (text: string) => {
  const b = [...host.querySelectorAll("button")].find((x) => x.textContent?.trim() === text);
  expect(b, `button "${text}"`).toBeTruthy();
  act(() => b!.click());
};

describe("four new playground games UI, modes, difficulty & AI interactions", () => {
  it("lists all four new games in Playground gallery", () => {
    act(() => root.render(<Playground onBack={() => {}} />));
    for (const id of ["frog-pond", "cloud-towers", "chef-split", "sumo-push"]) {
      const card = host.querySelector(`[data-game-card="${id}"]`);
      expect(card).toBeTruthy();
      expect(card!.textContent).toContain("單人／兩隊");
    }
  });

  it("FrogPond supports teams & solo AI difficulty selection and frog jumping", () => {
    act(() => root.render(<FrogPond onBack={() => {}} />));
    clickText("單人");
    expect(host.querySelector('[aria-label="電腦難度"]')).toBeTruthy();
    clickText("挑戰");
    clickText("開始本局");
    clickText("略過並開始");

    const frogBtn = [...host.querySelectorAll(".pg-pond-cell")].find((b) =>
      b.getAttribute("aria-label")?.includes("A隊青蛙"),
    ) as HTMLButtonElement;
    expect(frogBtn).toBeTruthy();
    act(() => frogBtn.click());
    const target = host.querySelector(".pg-pond-cell.legal-target") as HTMLButtonElement;
    expect(target).toBeTruthy();
    act(() => target.click());
    clickText("確認跳躍");
    expect(host.textContent).toContain("▲ 電腦回合");
  });

  it("CloudTowers walks through 3-step move + build flow", () => {
    act(() => root.render(<CloudTowers onBack={() => {}} />));
    clickText("進階");
    clickText("開始本局");
    clickText("略過並開始");

    const unit = [...host.querySelectorAll(".pg-tower-cell")].find((b) =>
      b.getAttribute("aria-label")?.includes("A隊建築師"),
    ) as HTMLButtonElement;
    act(() => unit.click());
    const moveOpt = host.querySelector(".pg-tower-cell.legal-move") as HTMLButtonElement;
    act(() => moveOpt.click());
    const buildOpt = host.querySelector(".pg-tower-cell.legal-build") as HTMLButtonElement;
    act(() => buildOpt.click());
    clickText("確認移動＋加蓋");
    expect(host.textContent).toContain("輪到 ▲ B 隊");
  });

  it("ChefSplit runs split then choose flow cleanly", () => {
    act(() => root.render(<ChefSplit onBack={() => {}} />));
    clickText("開始本局");
    clickText("略過並開始");
    clickText("確認分盤");
    const leftPlate = [...host.querySelectorAll(".pg-plate-zone")].find((b) =>
      b.textContent?.includes("左盤"),
    ) as HTMLButtonElement;
    act(() => leftPlate.click());
    clickText("確認選盤");
    expect(host.textContent).toContain("第 2／6 輪");
  });

  it("SumoPush selects piece, picks direction, previews push, and commits", () => {
    act(() => root.render(<SumoPush onBack={() => {}} />));
    clickText("開始本局");
    clickText("略過並開始");
    const disc = [...host.querySelectorAll(".pg-sumo-cell")].find((b) =>
      b.getAttribute("aria-label")?.includes("A隊棋子"),
    ) as HTMLButtonElement;
    act(() => disc.click());
    clickText("向上推");
    clickText("確認推動");
    expect(host.textContent).toContain("輪到 ▲ B 隊");
  });
});
