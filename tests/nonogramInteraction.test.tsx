// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NonogramGame from '../components/NonogramGame';
import { NONOGRAM_PUZZLES } from '../data/nonogramPuzzles';
let host: HTMLDivElement; let root: Root;
beforeEach(() => { sessionStorage.clear(); (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); act(() => root.render(<NonogramGame onBack={vi.fn()} />)); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const button = (text: string) => [...host.querySelectorAll('button')].find(item => item.textContent === text)!;
const click = (element: Element | null) => { expect(element).toBeTruthy(); act(() => element!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
const cell = (index: number) => host.querySelector(`[data-nonogram-cell="${index}"]`)!;
const chooseTier = (tier: string) => { const select = host.querySelector('[aria-label="數織推理階段"]') as HTMLSelectElement; expect(select).toBeTruthy(); act(() => { select.value = tier; select.dispatchEvent(new Event('change', { bubbles: true })); }); };

describe('spoken nonogram inference controls', () => {
  it('places clues next to their own row/column and uses explicit draft tools', () => {
    expect(host.querySelectorAll('[data-nonogram-row-clue]')).toHaveLength(5);
    expect(host.querySelectorAll('[data-nonogram-column-clue]')).toHaveLength(5);
    expect(host.querySelector('[data-nonogram-row-clue="1"]')?.textContent).toContain('5');
    click(cell(0)); click(button('打叉')); click(cell(3));
    expect(cell(0).getAttribute('data-current-mark')).toBe('UNKNOWN');
    expect(cell(0).getAttribute('data-draft-mark')).toBe('FILLED');
    expect(cell(3).getAttribute('data-draft-mark')).toBe('CROSSED');
    expect(host.querySelector('[data-nonogram-draft]')?.textContent).toContain('A1填滿');
    expect(host.querySelector('[data-nonogram-draft]')?.textContent).toContain('D1打叉');
  });
  it('confirms a whole batch once and restores the same draft on undo', () => {
    click(button('A／B 分組')); click(cell(0)); click(cell(1));
    const confirm = button('確認整批'); act(() => { confirm.click(); confirm.click(); });
    expect(cell(0).getAttribute('data-current-mark')).toBe('FILLED');
    expect(host.textContent).toContain('目前：B 組');
    click(host.querySelector('[aria-label="復原上一步"]'));
    expect(cell(0).getAttribute('data-current-mark')).toBe('UNKNOWN');
    expect(cell(1).getAttribute('data-draft-mark')).toBe('FILLED');
    expect(host.textContent).toContain('目前：A 組');
  });
  it('protects a draft on canceled tier change and uses the explicit exit label', () => {
    click(cell(0)); chooseTier('CHALLENGE'); click(button('繼續活動'));
    expect(cell(0).getAttribute('data-draft-mark')).toBe('FILLED');
    click(host.querySelector('[aria-label="返回遊戲目錄"]'));
    expect(button('確認離開')).toBeTruthy(); click(button('繼續活動'));
    chooseTier('CHALLENGE'); click(button('確認繼續'));
    expect(host.textContent).toContain('圖像 1');
  });
  it('keeps a fully revealed puzzle as practice through complete submission and undo', () => {
    click(button('A／B 分組'));
    for (let i = 0; i < 3; i++) click(host.querySelector('[aria-label="取得提示"]'));
    [...NONOGRAM_PUZZLES[0].pattern.join('')].forEach((value, index) => { click(button(value === '1' ? '填滿' : '打叉')); click(cell(index)); });
    click(button('確認整批'));
    expect(host.textContent).toContain('全部填滿與叉號都完成');
    expect(host.textContent).toContain('提示練習'); expect(host.textContent).toContain('A 組 0 分');
    click(host.querySelector('[aria-label="復原上一步"]')); click(button('確認整批'));
    expect(host.textContent).toContain('A 組 0 分');
  });
});

it('reveals the picture name and color only after completing a full solution, and undo hides it again',()=>{
 expect(host.querySelector('[data-nonogram-picture-name]')).toBeNull();
 [...NONOGRAM_PUZZLES[0].pattern.join('')].forEach((value,index)=>{click(button(value==='1'?'填滿':'打叉'));click(cell(index));});click(button('確認整批'));
 expect(host.querySelector('[data-nonogram-picture-name]')?.textContent).toContain('愛心');
 expect((cell(0) as HTMLElement).style.backgroundColor).toBe('rgb(225, 29, 72)');
 expect(cell(0).textContent).toBe('');
 click(host.querySelector('[aria-label="復原上一步"]'));expect(host.querySelector('[data-nonogram-picture-name]')).toBeNull();expect((cell(0) as HTMLElement).style.backgroundColor).toBe('');
});
