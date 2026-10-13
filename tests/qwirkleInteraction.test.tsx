// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QwirkleGame from '../components/QwirkleGame';
import { QWIRKLE_PUZZLES } from '../data/qwirklePuzzles';
import { solveQwirklePuzzle } from '../utils/qwirkleRules';
let host: HTMLDivElement; let root: Root;
beforeEach(() => { sessionStorage.clear(); (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const render = () => act(() => root.render(<QwirkleGame onBack={vi.fn()} />));
const button = (text: string) => [...host.querySelectorAll('button')].find(item => item.textContent === text)!;
const click = (item: Element | null) => { expect(item).not.toBeNull(); act(() => item!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
const chooseTier = (tier: string) => { const select = host.querySelector('select[aria-label="形色棋推理階段"]') as HTMLSelectElement; expect(select).not.toBeNull(); act(() => { select.value = tier; select.dispatchEvent(new Event('change', { bubbles: true })); }); };
const tile = (id: string) => host.querySelector(`[data-qwirkle-option="${id}"]`);
const target = (id: string) => host.querySelector(`[data-qwirkle-target="${id}"]`);
const team = () => host.querySelector('[data-facilitated-turn-status]')?.textContent;
const moves = () => host.querySelectorAll('[data-qwirkle-played]').length;
describe('Qwirkle facilitator interaction', () => {
  it('keeps four named warm-up options and fixed oral controls, without a timer', () => {
    render();
    expect(host.querySelectorAll('[data-qwirkle-option]')).toHaveLength(4);
    expect(tile('1')?.getAttribute('aria-label')).toContain('紅色星星');
    expect(host.querySelector('[data-facilitated-controls]')?.textContent).toContain('確認落棋');
    expect(host.textContent).toContain('全體合作'); expect(host.textContent).not.toContain('0.0s');
    expect(button('確認落棋').disabled).toBe(true);
    expect(host.querySelector('[data-qwirkle-board]')?.className).toContain('gap-2');
    expect(button('確認落棋').parentElement?.className).toContain('gap-2');
    expect(tile('1')?.parentElement?.className).toContain('gap-2');
    expect(host.querySelector('[data-qwirkle-board] .text-xs')).not.toBeNull();
  });
  it('preselects without moving, confirms once on a double click, and undoes the completed answer', () => {
    render(); click(button('A／B 分組')); click(tile('1'));
    expect(moves()).toBe(0); expect(team()).toContain('目前：A 組');
    expect(host.querySelector('[data-qwirkle-draft]')?.textContent).toContain('紅色星星');
    const confirm = button('確認落棋'); act(() => { confirm.click(); confirm.click(); });
    expect(moves()).toBe(1); expect(team()).toContain('A 組 1 分'); expect(team()).toContain('目前：B 組');
    expect(host.querySelectorAll('[data-qwirkle-option]')).toHaveLength(4);
    expect((tile('1') as HTMLButtonElement).disabled).toBe(true);
    click(host.querySelector('[aria-label="復原上一步"]'));
    expect(moves()).toBe(0); expect(team()).toContain('A 組 0 分'); expect(team()).toContain('目前：A 組');
  });
  it('changes only the selected tile on an illegal answer and leaves the round open', () => {
    render(); click(tile('3')); click(button('確認落棋'));
    expect(moves()).toBe(0); expect(host.textContent).toContain('橫線');
    click(tile('1')); click(button('確認落棋')); expect(moves()).toBe(1);
  });
  it('requires explicit tile and target for standard, preserving the current puzzle on canceled navigation', () => {
    render(); chooseTier('STANDARD'); click(tile('2'));
    expect(button('確認落棋').disabled).toBe(true);
    click(target('P')); expect(button('確認落棋').disabled).toBe(false);
    chooseTier('CHALLENGE'); expect(host.querySelector('[role="alertdialog"]')).not.toBeNull(); click(button('繼續活動'));
    expect(host.querySelector('[data-qwirkle-draft]')?.textContent).toContain('紅色正方形');
    click(button('確認落棋')); expect(host.textContent).toContain('已完成本題目標');
  });
  it('keeps a complete two-step plan with one team and displays the public next tile before step one', () => {
    render(); chooseTier('CHALLENGE'); click(button('A／B 分組'));
    expect(host.querySelector('[data-qwirkle-next]')?.textContent).toContain('藍色正方形');
    const puzzle = QWIRKLE_PUZZLES.find(p => p.id === 'plan-corner')!;
    const [first, second] = solveQwirklePuzzle(puzzle)[0].moves;
    click(tile(first.tile.id)); click(target(first.target.id)); click(button('確認落棋'));
    expect(moves()).toBe(1); expect(team()).toContain('目前：A 組'); expect(team()).toContain('A 組 0 分');
    expect(button('確認落棋').disabled).toBe(true);
    click(target(second.target.id)); click(button('確認落棋'));
    expect(moves()).toBe(2); expect(team()).toContain('目前：B 組'); expect(team()).toContain('A 組 1 分');
  });
  it('keeps the same team when a legal first move blocks the public next tile', () => {
    render(); chooseTier('CHALLENGE'); click(button('A／B 分組'));
    click(tile('1')); click(target('P')); click(button('確認落棋'));
    expect(moves()).toBe(1); expect(team()).toContain('目前：A 組');
    expect(team()).toContain('本組保留'); expect(team()).toContain('A 組 0 分');
    expect(button('確認落棋').disabled).toBe(true);
    click(host.querySelector('[aria-label="復原上一步"]')); expect(moves()).toBe(0);
  });
  it('retains reveal after clearing and resetting and never awards revealed practice', () => {
    render(); click(button('A／B 分組'));
    for (let i=0;i<3;i++) click(host.querySelector('[aria-label="取得提示"]'));
    click(button('清除預選')); expect(host.textContent).toContain('已揭示');
    click(tile('1')); click(button('確認落棋')); expect(team()).toContain('A 組 0 分');
    click(host.querySelector('[aria-label="重新開始"]')); click(button('確認繼續'));
    expect(host.textContent).toContain('已揭示');
    click(tile('1')); click(button('確認落棋')); expect(team()).toContain('A 組 0 分');
  });
  it('protects unconfirmed selections on reset and next puzzle, and keeps controls independent of scrolling details', () => {
    render(); click(tile('1')); click(button('下一題'));
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull(); click(button('繼續活動'));
    expect(tile('1')?.getAttribute('aria-pressed')).toBe('true');
    click(host.querySelector('[aria-label="重新開始"]')); expect(host.querySelector('[role="alertdialog"]')).not.toBeNull(); click(button('繼續活動'));
    expect(host.querySelector('[data-facilitated-details]')?.contains(button('確認落棋'))).toBe(false);
  });
});
