// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import Auction from '../components/playground/Auction';
import Lantern from '../components/playground/Lantern';
import { PREFIX } from '../games/playground/session';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
function mount(Component: typeof Auction) {
  sessionStorage.clear();
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host); act(() => root.render(<Component onBack={() => {}}/>));
  const click = (label: string) => {
    const button = [...host.querySelectorAll('button')].find(b => b.textContent === label || b.ariaLabel === label);
    expect(button, label).toBeTruthy(); act(() => button!.click());
  };
  return {host, click, close: () => { act(() => root.unmount()); host.remove(); }};
}
it('confirms auction choices inline, retains the board, and reviews every action', () => {
  const v=mount(Auction); v.click('開始本局'); v.click('開始正式局');
  v.click('+1 枚');
  expect(v.host.querySelector('[role="dialog"]')).toBeNull();
  expect(v.host.querySelector('[aria-label="確認拍賣選擇"]')).toBeTruthy();
  v.click('取消選擇');
  expect(JSON.parse(sessionStorage.getItem(`${PREFIX}.auction`)!).actions).toHaveLength(0);
  v.click('+1 枚'); v.click('確認行動'); v.click('退出本件'); v.click('確認行動');
  v.click('紀錄');
  expect(v.host.textContent).toContain('完整操作與得分回顧');
  expect(v.host.querySelectorAll('[data-review-step]')).toHaveLength(2);
  v.close();
});
it('lantern chooses B as starter and rematches the same public values with swapped starter', () => {
  const v=mount(Lantern); v.click('B隊先手'); v.click('開始本局'); v.click('開始正式局');
  const old=JSON.parse(sessionStorage.getItem(`${PREFIX}.lantern`)!);
  expect(old.starter).toBe('B');
  v.click('重開'); v.click('同局交換先手');
  const next=JSON.parse(sessionStorage.getItem(`${PREFIX}.lantern`)!);
  expect(next.seed).toBe(old.seed); expect(next.starter).toBe('A'); expect(next.actions).toEqual([]); expect(next.id).not.toBe(old.id);
  v.close();
});
it('auction confirmation can be dismissed by Escape without recording a bid', () => {
 const v=mount(Auction); v.click('開始本局');v.click('開始正式局');v.click('+1 枚');
 act(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'})));
 expect(v.host.querySelector('[aria-label="確認拍賣選擇"]')).toBeNull();
 expect(JSON.parse(sessionStorage.getItem(`${PREFIX}.auction`)!).actions).toHaveLength(0);v.close();
});
it('preserves same-seed comparison text after a lantern rematch', () => {
 const v=mount(Lantern);v.click('開始本局');v.click('開始正式局');v.click('重開');v.click('同局再戰');
 expect(v.host.textContent).toContain('同局比較');expect(v.host.textContent).toContain('中途重開');
 v.close();
});
