// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrafficJamGame from '../components/TrafficJamGame';
import { TRAFFIC_JAM_PUZZLES } from '../data/trafficJamLevels';

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
const findButton = (text: string) => [...host.querySelectorAll('button')].find(button => button.textContent === text)!;
const click = (element: Element | null) => {
  expect(element).not.toBeNull();
  act(() => element!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
};
const choose = (label: string, value: string) => {
  const select = host.querySelector(`select[aria-label="${label}"]`) as HTMLSelectElement;
  expect(select).not.toBeNull();
  act(() => { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); });
};
const move = (id: string, distance: number) => {
  choose('選擇車輛', id); choose('移動方向', String(Math.sign(distance))); choose('移動格數', String(Math.abs(distance)));
  click(findButton('確認整步'));
};
const render = () => {
  act(() => root.render(<TrafficJamGame onBack={vi.fn()} />));
  // The menu now starts at STANDARD; use the retained short teaching fixture for transaction regressions.
  choose('塞車關卡難度', 'BEGINNER');
};
const steps = () => host.querySelector('[data-traffic-steps]')?.textContent;
const team = () => host.querySelector('[data-facilitated-turn-status]')?.textContent;

describe('traffic facilitator interaction', () => {
  it('previews an entire multi-square command without moving, then advances exactly one turn', () => {
    render(); click(findButton('A／B 分組'));
    choose('選擇車輛', 'B'); choose('移動方向', '1'); choose('移動格數', '2');
    expect(host.querySelector('[data-traffic-car="B"]')?.getAttribute('aria-label')).toContain('D2～D4');
    expect(host.querySelector('[data-traffic-preview]')?.getAttribute('aria-label')).toContain('D4～D6');
    expect(steps()).toContain('策略步數：0');
    expect(team()).toMatch(/目前[： ]A 組/);
    const confirm = findButton('確認整步');
    act(() => { confirm.click(); confirm.click(); });
    expect(steps()).toContain('策略步數：1');
    expect(steps()).toContain('移車格數 2');
    expect(team()).toMatch(/目前[： ]B 組/);
    expect(host.querySelector('[data-traffic-preview]')).toBeNull();
    expect(findButton('確認整步').disabled).toBe(true);
  });
  it('rejects crossing, scores only once and undoes completion atomically', () => {
    render(); click(findButton('A／B 分組'));
    choose('移動方向', '1'); choose('移動格數', '3');
    expect(findButton('確認整步').disabled).toBe(true);
    expect(host.textContent).toContain('會撞車或越界');
    expect(steps()).toContain('策略步數：0');
    move('B', 2); move('X', 3);
    expect(host.textContent).toContain('B 組 1 分');
    expect(steps()).toContain('策略步數：2');
    expect(findButton('確認整步').disabled).toBe(true);
    click(host.querySelector('[aria-label="復原上一步"]'));
    expect(host.textContent).toContain('B 組 0 分');
    expect(team()).toMatch(/目前[： ]B 組/);
    expect(steps()).toContain('策略步數：1');
    expect(host.querySelector('[data-traffic-car="X"]')?.getAttribute('aria-label')).toContain('B3～C3');
    click(findButton('確認整步'));
    expect(host.textContent).toContain('B 組 1 分');
    expect(steps()).toContain('策略步數：2');
  });
  it('requires confirmation to replace a puzzle and preserves it when canceled', () => {
    render(); move('B', 2);
    choose('塞車關卡難度', 'CHALLENGE');
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
    click(findButton('繼續活動'));
    expect(steps()).toContain('策略步數：1');
    expect(host.textContent).toContain('長車向下讓路');
    choose('塞車關卡難度', 'CHALLENGE'); click(findButton('確認繼續'));
    expect(steps()).toContain('策略步數：0');
    expect(host.textContent).toContain(TRAFFIC_JAM_PUZZLES.find(level => level.id === 'challenge-1')!.title);
    expect(host.querySelectorAll('[data-traffic-car]')).toHaveLength(TRAFFIC_JAM_PUZZLES.find(level => level.id === 'challenge-1')!.cars.length);
  });
  it('keeps the selected mode and removes only the replayed round score on reset', () => {
    render(); click(findButton('A／B 分組'));
    move('B', 2); move('X', 3);
    click(findButton('下一題')); click(findButton('確認繼續'));
    expect(host.textContent).toContain('B 組 1 分');
    move('B', -1); move('X', 4);
    expect(host.textContent).toContain('B 組 2 分');
    click(host.querySelector('[aria-label="重新開始"]')); click(findButton('確認繼續'));
    expect(host.textContent).toContain('B 組 1 分');
    expect(steps()).toContain('策略步數：0');
    expect(findButton('A／B 分組').getAttribute('aria-pressed')).toBe('true');
  });
  it('protects accumulated scores and hint-only progress before replacing the activity', () => {
    render(); click(findButton('A／B 分組')); move('B', 2); move('X', 3);
    click(findButton('下一題')); click(findButton('確認繼續'));
    click(findButton('全體合作'));
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
    click(findButton('繼續活動'));
    expect(team()).toContain('B 組 1 分');
  });
  it('protects observation-only work and a selected car before a new question', () => {
    render(); click(host.querySelector('[aria-label="取得提示"]'));
    click(findButton('下一題'));
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
    click(findButton('繼續活動'));
    choose('選擇車輛', 'B');
    click(findButton('下一題'));
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
  });
  it('marks a fully revealed route as practice without awarding a point', () => {
    render(); click(findButton('A／B 分組'));
    for (let i=0;i<3;i++) click(host.querySelector('[aria-label="取得提示"]'));
    move('B', 2);
    for (let i=0;i<3;i++) click(host.querySelector('[aria-label="取得提示"]'));
    move('X', 3);
    expect(team()).toContain('B 組 0 分');
    expect(host.textContent).toContain('提示練習');
    click(host.querySelector('[aria-label="復原上一步"]'));
    click(findButton('確認整步'));
    expect(team()).toContain('B 組 0 分');
  });
  it('uses current-position hints after clearing a prerequisite', () => {
    render(); choose('塞車題目', 'beginner-5'); move('C', -1);
    click(host.querySelector('[aria-label="取得提示"]'));
    expect(team()).not.toContain('下方又被誰擋');
    click(host.querySelector('[aria-label="取得提示"]'));
    expect(team()).toContain('B 車');
    expect(team()).not.toContain('先移');
  });
  it('can complete a challenge through the same oral controls, including a reverse move', () => {
    render(); choose('塞車關卡難度', 'CHALLENGE');
    const puzzle = TRAFFIC_JAM_PUZZLES.find(level => level.id === 'challenge-1')!;
    for (const command of puzzle.solution) move(command.carId, command.distance);
    expect(host.textContent).toContain('完成！X 車抵達出口');
    expect(steps()).toContain(`策略步數：${puzzle.minimumMoves}`);
  });
});
