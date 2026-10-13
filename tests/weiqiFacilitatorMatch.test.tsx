// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { WeiqiGame } from '../components/WeiqiGame';

const aiReply = vi.hoisted(() => ({ value: { r: 0, c: 1 } as { r: number; c: number } | null }));
vi.mock('../services/goEngine', async () => ({ ...await vi.importActual('../services/goEngine'), getGoAIMove: () => aiReply.value }));
vi.mock('../services/soundService', () => ({ soundService: { playTilePlace: () => {}, playWrong: () => {}, playWin: () => {} } }));
describe.each([true, false])('original Go, compact landscape=%s', landscape => {
let host: HTMLDivElement, root: Root;
const back = vi.fn();
const button = (name: string) => [...host.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === name || b.textContent?.trim() === name)!;
const click = (name: string) => { expect(button(name), name).toBeTruthy(); act(() => button(name).click()); };
const play = (point: string) => click(`圍棋交叉點 ${point}`);
const stone = (r: number, c: number, color: string) => host.querySelector(`#go-cell-${r}-${c} [data-go-stone="${color}"]`);
const status = () => host.querySelector('[data-go-match-status]')?.textContent ?? '';
const choosePuzzle = (id: string) => {
  const select = host.querySelector('[aria-label="選擇死活題"]') as HTMLSelectElement;
  expect(select, 'original puzzle selector').toBeTruthy();
  act(() => { select.value = id; select.dispatchEvent(new Event('change', { bubbles: true })); });
  if (button('確認繼續')) click('確認繼續');
};
beforeEach(() => {
  vi.useFakeTimers(); back.mockClear(); sessionStorage.clear(); aiReply.value = { r: 0, c: 1 };
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: landscape }) });
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
  act(() => root.render(<WeiqiGame onBack={back} />));
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers(); });

it('opens the original AI game with 9/13/19 boards and direct placement', () => {
  expect(button('人機模式').getAttribute('aria-pressed')).toBe('true');
  expect(host.querySelectorAll('[id^="go-cell-"]')).toHaveLength(81);
  expect(button('13路棋盤')).toBeTruthy(); expect(button('19路棋盤')).toBeTruthy();
  expect(host.textContent).not.toContain('短題合作'); expect(button('確認落子')).toBeUndefined();
  play('A9'); expect(stone(0, 0, 'BLACK')).toBeTruthy();
  act(() => vi.advanceTimersByTime(601)); expect(stone(0, 1, 'WHITE')).toBeTruthy();
  click('悔棋'); expect(stone(0, 0, 'BLACK')).toBeNull(); expect(stone(0, 1, 'WHITE')).toBeNull();
  act(() => vi.advanceTimersByTime(601)); expect(stone(0, 1, 'WHITE')).toBeNull();
});
it('uses original direct PVP placement and ignores occupied intersections without undo entries', () => {
  click('AB組模式'); play('A9'); play('A9'); expect(status()).toContain('已下 1 手');
  play('B9'); expect(stone(0, 1, 'WHITE')).toBeTruthy(); click('悔棋'); expect(status()).toContain('已下 1 手');
  click('悔棋'); expect(status()).toContain('已下 0 手');
});
it('records passes and dead-group removal in undo before explicit final scoring', () => {
  click('AB組模式'); play('A9'); play('B9'); play('A8'); click('虛手'); click('虛手');
  expect(status()).toContain('核對死子'); expect(host.textContent).not.toContain('獲勝！');
  play('A9'); expect(stone(0, 0, 'BLACK')).toBeNull(); click('悔棋');
  expect(stone(0, 0, 'BLACK')).toBeTruthy(); expect(status()).toContain('核對死子');
  click('確認數目'); expect(status()).toContain('已結算'); click('復原結算');
  expect(status()).toContain('核對死子'); click('悔棋'); expect(status()).toContain('已下 4 手');
});
it('undoes the human and automatic AI passes together so play can resume', () => {
  aiReply.value = null;
  click('虛手'); act(() => vi.advanceTimersByTime(601)); expect(status()).toContain('核對死子');
  click('悔棋'); expect(status()).toContain('已下 0 手');
  act(() => vi.advanceTimersByTime(1200)); expect(status()).not.toContain('核對死子');
  play('A9'); expect(stone(0, 0, 'BLACK')).toBeTruthy(); expect(status()).toContain('已下 1 手');
});
it('undoes AI scoring edits one at a time, then removes the final pass pair', () => {
  play('A9'); act(() => vi.advanceTimersByTime(601)); aiReply.value = null;
  click('虛手'); act(() => vi.advanceTimersByTime(601)); expect(status()).toContain('核對死子');
  play('A9'); expect(stone(0, 0, 'BLACK')).toBeNull(); click('悔棋');
  expect(stone(0, 0, 'BLACK')).toBeTruthy(); expect(status()).toContain('已下 4 手'); expect(status()).toContain('核對死子');
  click('確認數目'); click('復原結算'); expect(status()).toContain('核對死子'); expect(status()).toContain('已下 4 手');
  click('悔棋'); expect(status()).toContain('已下 2 手');
  act(() => vi.advanceTimersByTime(1200)); expect(status()).not.toContain('核對死子');
  expect(stone(0, 0, 'BLACK')).toBeTruthy(); expect(stone(0, 1, 'WHITE')).toBeTruthy();
});
it('preserves the original board on same-mode or same-size clicks and guards a size change', () => {
  click('AB組模式'); play('A9'); click('AB組模式'); click('9路棋盤');
  expect(host.querySelector('[role="alertdialog"]')).toBeNull(); expect(stone(0, 0, 'BLACK')).toBeTruthy();
  click('13路棋盤'); click('確認繼續'); expect(host.querySelectorAll('[id^="go-cell-"]')).toHaveLength(169);
  click('19路棋盤'); expect(host.querySelectorAll('[id^="go-cell-"]')).toHaveLength(361);
});
it('keeps 確認離開 and pauses the pending AI while the dialog is open', () => {
  play('A9'); click('返回'); expect(button('確認離開')).toBeTruthy();
  act(() => vi.advanceTimersByTime(601)); expect(stone(0, 1, 'WHITE')).toBeNull();
  click('繼續活動'); expect(stone(0, 0, 'BLACK')).toBeTruthy();
  act(() => vi.advanceTimersByTime(601)); expect(stone(0, 1, 'WHITE')).toBeTruthy();
  click('返回'); click('確認離開'); expect(back).toHaveBeenCalledOnce();
});
if (!landscape) {
  it('schedules the black AI opening after leaving and reentering AI mode as white', () => {
    click('執白子'); click('AB組模式'); act(() => vi.advanceTimersByTime(601));
    click('人機模式'); act(() => vi.advanceTimersByTime(601));
    expect(host.querySelectorAll('[data-go-stone]')).toHaveLength(1); expect(status()).toContain('白方');
    act(() => vi.advanceTimersByTime(6000)); expect(host.querySelectorAll('[data-go-stone]')).toHaveLength(1);
    play('A9'); expect(stone(0, 0, 'WHITE')).toBeTruthy();
  });
  it('schedules exactly one black opening after white changes board size before the timer', () => {
    click('執白子'); click('13路棋盤'); act(() => vi.advanceTimersByTime(601));
    expect(host.querySelectorAll('[id^="go-cell-"]')).toHaveLength(169); expect(host.querySelectorAll('[data-go-stone]')).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1800)); expect(host.querySelectorAll('[data-go-stone]')).toHaveLength(1); expect(status()).toContain('白方');
  });
}
it.runIf(landscape)('offers only implemented handicap counts and aligns white with team B', () => {
  click('AB組模式'); const s = host.querySelector('[aria-label="讓子設定"]') as HTMLSelectElement;
  act(() => { s.value = '2'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(status()).toContain('目前 B 組'); expect([...s.options].map(o => o.value)).toEqual(['0', '2', '3', '4']);
});
it('returns directly to the original twenty puzzles and retains the 19-line source board', () => {
  click('死活題模式'); const s = host.querySelector('[aria-label="選擇死活題"]') as HTMLSelectElement;
  expect(s.options).toHaveLength(20); expect(host.querySelectorAll('[id^="go-cell-"]')).toHaveLength(81);
  choosePuzzle('ggg-easy-01'); expect(host.querySelectorAll('[id^="go-cell-"]')).toHaveLength(361);
  expect(host.textContent).toContain('首手參考'); expect(host.textContent).toContain('未完整驗證');
});
it('requires the legal reply and capture before marking the original straight-three branch complete', () => {
  click('死活題模式'); choosePuzzle('straight-three-kill'); play('B8');
  expect(host.textContent).toContain('選擇白方應手'); expect(host.textContent).not.toContain('已完成驗證變化');
  click('白方應手 A8'); expect(stone(1, 0, 'WHITE')).toBeTruthy(); play('C8');
  expect(stone(0, 0, 'WHITE')).toBeNull(); expect(host.textContent).toContain('已完成驗證變化');
  expect(host.textContent).toContain('本題得分 100'); click('悔棋');
  expect(stone(0, 0, 'WHITE')).toBeTruthy(); expect(host.textContent).toContain('本題得分 0');
});
it('offers both original straight-three replies and reports unlisted legal moves without failure', () => {
  click('死活題模式'); choosePuzzle('straight-three-kill'); play('J1');
  expect(host.textContent).toContain('合法，但未收錄'); expect(host.textContent).not.toContain('落子不對');
  expect(stone(8, 8, 'BLACK')).toBeNull(); play('B8'); click('白方應手 C8'); play('A8');
  expect(host.textContent).toContain('已完成驗證變化');
});
it('verifies two distinct eyes and keeps hinted solutions unscored through undo', () => {
  click('死活題模式'); click('查看題目提示'); click('我知道了'); play('B8');
  expect(host.textContent).toContain('兩隻獨立真眼'); expect(host.textContent).toContain('提示練習');
  expect(host.textContent).toContain('本題得分 0'); click('悔棋'); play('B8');
  expect(host.textContent).toContain('本題得分 0');
});
it('does not credit a first-move-only source answer as proven life or a scored completion', () => {
  click('死活題模式'); choosePuzzle('ggg-easy-01'); play('S1');
  expect(host.textContent).toContain('符合參考首手'); expect(host.textContent).toContain('不計分');
  expect(host.textContent).not.toContain('已完成驗證變化'); expect(host.textContent).toContain('本題得分 0');
});

it('resigns the human color while AI is waiting, and restores the exact pre-result board and scores', () => {
  play('A9'); click('認輸'); act(() => vi.advanceTimersByTime(601));
  expect(stone(0, 1, 'WHITE')).toBeNull(); click('確認認輸');
  expect(status()).toContain('A 0／B 1'); expect(host.textContent).toContain('黑方 認輸');
  click('復原結算'); expect(status()).toContain('A 0／B 0'); expect(status()).toContain('已下 1 手');
  expect(stone(0, 0, 'BLACK')).toBeTruthy(); expect(stone(0, 1, 'WHITE')).toBeNull();
});
it('commits rapid duplicate direct puzzle clicks once and keeps replay scoring reversible', () => {
  click('死活題模式'); const point = button('圍棋交叉點 B8');
  act(() => { point.click(); point.click(); }); expect(host.textContent).toContain('本題得分 100');
  click('悔棋'); expect(host.textContent).toContain('本題得分 0'); expect(button('悔棋').disabled).toBe(true);
  play('B8'); expect(host.textContent).toContain('本題得分 100');
  click('重新開始'); click('確認繼續'); play('B8'); expect(host.textContent).toContain('本題得分 100');
});
it('keeps revealed solutions unscored after remount and on the original curved-three example', () => {
  click('死活題模式'); choosePuzzle('bent-three-live'); click('查看題目解說'); click('關閉');
  act(() => root.unmount()); root = createRoot(host); act(() => root.render(<WeiqiGame onBack={back} />));
  click('死活題模式'); choosePuzzle('bent-three-live'); play('A9');
  expect(host.textContent).toContain('兩隻獨立真眼'); expect(host.textContent).toContain('提示練習');
  expect(host.textContent).toContain('本題得分 0');
});

});
