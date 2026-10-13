// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WordPathGame from '../components/WordPathGame';
import { WORD_PATH_BANK } from '../data/wordPathPuzzles';
let host: HTMLDivElement; let root: Root;
beforeEach(() => { sessionStorage.clear(); (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const render = (difficulty: 'NORMAL' | 'ADVANCED' = 'NORMAL') => act(() => root.render(<WordPathGame difficulty={difficulty} onBack={vi.fn()} />));
const button = (label: string) => [...host.querySelectorAll('button')].find(item => item.textContent === label)!;
const click = (item: Element | null) => { expect(item).not.toBeNull(); expect(item).not.toBeUndefined(); act(() => item!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
const cell = (index: number) => host.querySelector(`[data-word-path-cell="${index}"]`);
const path = (indexes: number[]) => indexes.forEach(index => click(cell(index)));
const status = () => host.querySelector('[data-facilitated-turn-status]')?.textContent;
const chooseTier = (tier: string) => { const select = host.querySelector('select[aria-label="字詞路徑階段"]') as HTMLSelectElement; expect(select).not.toBeNull(); act(() => { select.value = tier; select.dispatchEvent(new Event('change', { bubbles: true })); }); };
const confirmNavigation = () => click(button('確認繼續'));
describe('word path facilitator interaction', () => {
  it('shows four explicit beginner targets, readable coordinates, and fixed submit/clear controls', () => {
    render(); expect(host.querySelectorAll('[data-word-path-cell]')).toHaveLength(16);
    expect(host.querySelector('[data-word-path-goal]')?.textContent).toContain('4 個目標詞');
    for (const word of ['春天', '花開', '快樂', '學習']) expect(host.querySelector('[data-word-path-targets]')?.textContent).toContain(word);
    expect(host.querySelector('[data-facilitated-controls]')?.contains(button('提交詞語'))).toBe(true);
    expect(host.querySelector('[data-facilitated-details]')?.contains(button('提交詞語'))).toBe(false);
    expect((cell(0) as HTMLButtonElement).getAttribute('aria-label')).toContain('A1，春');
    expect(cell(0)?.className).toContain('min-h-11'); expect(button('提交詞語').disabled).toBe(true);
  });
  it('maps legacy advanced entry to semantic standard clues without displaying answer words', () => {
    render('ADVANCED'); const clues = host.querySelector('[data-word-path-targets]')?.textContent;
    expect((host.querySelector('select') as HTMLSelectElement).value).toBe('STANDARD');
    expect(clues).toContain('彼此'); expect(clues).not.toContain('互相幫助'); expect(host.querySelector('[data-word-path-goal]')?.textContent).toContain('3 個四字詞');
  });
  it('selects without changing team, submits exactly once on double click, then undoes the whole answer', () => {
    render(); click(button('A／B 分組')); path([0, 1]); expect(status()).toContain('目前：A 組');
    expect(host.querySelector('[data-word-path-draft]')?.textContent).toContain('A1 → B1');
    const submit = button('提交詞語'); act(() => { submit.click(); submit.click(); });
    expect(status()).toContain('A 組 1 分'); expect(status()).toContain('目前：B 組');
    click(host.querySelector('[aria-label="復原上一步"]')); expect(status()).toContain('A 組 0 分'); expect(status()).toContain('目前：A 組'); expect(cell(0)?.getAttribute('aria-pressed')).toBe('true');
  });
  it('puts therapist review in fixed controls and restores the pending word on undo', () => {
    render(); click(button('A／B 分組')); path([6, 10]); click(button('提交詞語'));
    expect(status()).toContain('目前：A 組'); expect(host.querySelector('[data-facilitated-controls]')?.contains(button('接受延伸詞'))).toBe(true);
    expect((cell(0) as HTMLButtonElement).disabled).toBe(true);
    click(button('接受延伸詞')); expect(status()).toContain('不增加目標進度'); expect(status()).toContain('A 組 1 分');
    expect(host.querySelector('[data-word-path-progress]')?.textContent).toContain('0/4');
    click(host.querySelector('[aria-label="復原上一步"]')); expect(button('接受延伸詞')).toBeDefined(); expect(status()).toContain('A 組 0 分');
    click(button('不採計')); expect(status()).toContain('目前：B 組'); expect(status()).toContain('A 組 0 分');
  });
  it('finishes at the visible target endpoint, then undo reopens the final word', () => {
    render(); for (const target of WORD_PATH_BANK[0].targets) { path(target.paths[0]); click(button('提交詞語')); }
    expect(host.querySelector('[data-word-path-progress]')?.textContent).toContain('4/4'); expect(host.textContent).toContain('完成！'); expect(button('提交詞語').disabled).toBe(true);
    click(host.querySelector('[aria-label="復原上一步"]')); expect(button('提交詞語').disabled).toBe(false); expect(host.querySelector('[data-word-path-progress]')?.textContent).toContain('3/4');
  });
  it('requires two distinct physical routes in challenge and displays submitted coordinates', () => {
    render(); chooseTier('CHALLENGE'); expect(host.querySelector('[data-word-path-goal]')?.textContent).toContain('兩條不同路徑');
    const [first, second] = WORD_PATH_BANK[6].targets[0].paths;
    path(first); click(button('提交詞語')); path(first); click(button('提交詞語'));
    expect(host.querySelector('[data-word-path-progress]')?.textContent).toContain('1/2');
    path(second); click(button('提交詞語')); expect(host.querySelector('[data-word-path-progress]')?.textContent).toContain('2/2');
    expect(host.querySelector('[data-word-path-found]')?.textContent).toContain('A1 → A2 → B2 → B3');
  });
  it('protects selected paths during reset, next puzzle, tier change and mode change', () => {
    render(); path([0]);
    for (const action of [() => click(host.querySelector('[aria-label="重新開始"]')), () => click(button('下一題')), () => chooseTier('STANDARD'), () => click(button('A／B 分組'))]) {
      action(); expect(host.querySelector('[role="alertdialog"]')).not.toBeNull(); click(button('繼續活動')); expect(cell(0)?.getAttribute('aria-pressed')).toBe('true');
    }
    expect((host.querySelector('select') as HTMLSelectElement).value).toBe('BEGINNER');
  });
  it('preserves revealed status and zero hint credit through undo, reset and leaving then revisiting a tier', () => {
    render('ADVANCED'); click(button('A／B 分組'));
    click(host.querySelector('[aria-label="取得提示"]')); click(host.querySelector('[aria-label="取得提示"]'));
    expect(host.querySelector('[data-word-path-assistance]')?.textContent).toContain('已揭示');
    path(WORD_PATH_BANK[3].targets[0].paths[0]); click(button('提交詞語')); expect(status()).toContain('A 組 0 分');
    click(host.querySelector('[aria-label="復原上一步"]')); click(host.querySelector('[aria-label="重新開始"]')); confirmNavigation();
    chooseTier('BEGINNER'); confirmNavigation(); chooseTier('STANDARD');
    expect(host.querySelector('[data-word-path-assistance]')?.textContent).toContain('已揭示');
    path(WORD_PATH_BANK[3].targets[0].paths[0]); click(button('提交詞語')); expect(status()).toContain('A 組 0 分');
  });
  it('cycles three different puzzles in each tier', () => {
    render(); const ids = new Set<string>();
    for (let i = 0; i < 3; i++) { ids.add(host.querySelector('[data-word-path-puzzle]')!.getAttribute('data-word-path-puzzle')!); click(button('下一題')); }
    expect(ids.size).toBe(3);
  });
});
