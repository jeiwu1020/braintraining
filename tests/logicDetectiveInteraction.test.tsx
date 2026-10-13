// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LogicDetectiveGame from '../components/LogicDetectiveGame';
import { LOGIC_PUZZLES } from '../data/logicDetectivePuzzles';
import { satisfiesLogicClue } from '../utils/logicDetectiveRules';
let host: HTMLDivElement; let root: Root;
const back = vi.fn();
beforeEach(() => { sessionStorage.clear();
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); back.mockClear();
  act(() => root.render(<LogicDetectiveGame onBack={back} />));
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
const button = (text: string) => [...host.querySelectorAll('button')].find(b => b.textContent === text);
const label = (prefix: string) => [...host.querySelectorAll('button')].find(b => b.getAttribute('aria-label')?.startsWith(prefix));
const click = (element?: Element | null) => { if (!element) throw new Error('Expected logic control'); act(() => element.dispatchEvent(new MouseEvent('click', {bubbles:true}))); };
const cell = (coordinate: string) => label(`${coordinate}，`);
const prepare = (tool: string, coordinate: string) => { click(button(tool)); click(cell(coordinate)); };
const confirm = () => click(button('確認推論'));

describe('logic detective facilitated interface', () => {
  it('uses explicit tools and a pending decision, never a click cycle', () => {
    expect(button('確認 ○')).toBeDefined(); expect(button('排除 ×')).toBeDefined(); expect(button('清除')).toBeDefined();
    click(button('A／B 分組'));
    prepare('確認 ○','B1');
    expect(cell('B1')?.getAttribute('aria-label')).toContain('未判定');
    expect(host.textContent).toContain('A 組 0 分'); expect(host.textContent).toContain('目前：A 組');
    click(cell('B1'));
    expect(cell('B1')?.getAttribute('aria-label')).toContain('未判定');
    confirm();
    expect(cell('B1')?.getAttribute('aria-label')).toContain('已確認');
    expect(cell('A1')?.getAttribute('aria-label')).toContain('已排除');
    expect(host.textContent).toContain('A 組 1 分'); expect(host.textContent).toContain('目前：B 組');
    expect(host.querySelector('[data-logic-derivations]')?.textContent).toContain('同一人只能選一項');
    prepare('確認 ○','B1'); confirm();
    expect(host.textContent).toContain('A 組 1 分'); expect(host.textContent).toContain('目前：B 組');
  });
  it('undoes the finishing inference, all derived marks, score and team together', () => {
    expect(button('確認 ○')).toBeDefined();
    click(button('A／B 分組')); prepare('確認 ○','B1'); confirm();
    prepare('排除 ×','A2'); confirm();
    expect(host.textContent).toContain('全部配對完成'); expect(host.textContent).toContain('B 組 1 分');
    click(label('復原上一步'));
    expect(cell('C2')?.getAttribute('aria-label')).toContain('未判定');
    expect(cell('A2')?.getAttribute('aria-label')).toContain('未判定');
    expect(host.textContent).toContain('B 組 0 分'); expect(host.textContent).toContain('目前：B 組');
    confirm(); expect(host.textContent).toContain('B 組 1 分');
  });
  it.each(['標準','挑戰','下一題','重新開始','返回遊戲目錄','A／B 分組'])('guards %s even when only a draft exists', action => {
    expect(button('確認 ○')).toBeDefined();
    prepare('確認 ○','B1');
    click(button(action) ?? label(action));
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
    click(button('繼續活動'));
    expect(host.textContent).toContain('入門 1／3');
    expect((button('確認推論') as HTMLButtonElement).disabled).toBe(false);
    expect(back).not.toHaveBeenCalled();
  });
  it('keeps exact table headers aligned, labels each 44px mark, and places controls outside scrollable details', () => {
    expect(host.querySelector('table[data-coordinate-grid]')).not.toBeNull();
    expect([...host.querySelectorAll('thead th')].map(th => th.textContent)).toEqual(['人物／選項','A 茶','B 牛奶','C 果汁']);
    expect(host.querySelectorAll('tbody tr')).toHaveLength(3);
    expect([...host.querySelectorAll('tbody button')].every(b => b.classList.contains('min-h-11') && b.classList.contains('min-w-11'))).toBe(true);
    const controls = host.querySelector('[data-facilitated-controls]'); const details = host.querySelector('[data-facilitated-details]');
    expect(controls?.contains(button('確認推論')!)).toBe(true); expect(details?.contains(controls!)).toBe(false);
    expect(host.querySelector('details[data-facilitated-settings]')?.hasAttribute('open')).toBe(false);
  });
  it('compares two candidate assignments and requires a contradicted clue', () => {
    expect(button('挑戰')).toBeDefined(); click(button('挑戰')); click(button('A／B 分組'));
    expect(host.textContent).toContain('挑戰 1／3'); expect(host.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(host.querySelector('[data-logic-candidates]')?.textContent).toContain('小玉');
    click(button('排除甲案'));
    expect((button('確認推論') as HTMLButtonElement).disabled).toBe(true);
    click(label('線索 1：')); confirm();
    expect(host.textContent).toContain('另一案符合全部線索'); expect(host.textContent).toContain('A 組 1 分');
    click(label('復原上一步'));
    expect(host.textContent).toContain('A 組 0 分'); expect((button('確認推論') as HTMLButtonElement).disabled).toBe(false);
  });
  it('keeps revealed practice status when reset or revisiting the same puzzle', () => {
    expect(button('確認 ○')).toBeDefined(); click(button('A／B 分組'));
    click(label('取得提示')); click(label('取得提示')); click(label('取得提示'));
    expect(host.textContent).toContain('本題已取得推論協助');
    click(label('重新開始')); click(button('確認繼續'));
    prepare('確認 ○','B1'); confirm(); expect(host.textContent).toContain('A 組 0 分');
    for (let i = 0; i < 3; i += 1) { click(button('下一題')); if (host.querySelector('[role="alertdialog"]')) click(button('確認繼續')); }
    expect(host.textContent).toContain('入門 1／3'); expect(host.textContent).toContain('本題已取得推論協助');
    prepare('確認 ○','B1'); confirm(); expect(host.textContent).toContain('A 組 0 分');
  });
  it('does not organize the board when merely toggling the automatic setting', () => {
    click(button('自動整理：開'));
    prepare('確認 ○','B1'); confirm();
    expect(cell('A1')?.getAttribute('aria-label')).toContain('未判定');
    click(button('自動整理：關'));
    expect(cell('A1')?.getAttribute('aria-label')).toContain('未判定');
    prepare('排除 ×','A2');
    expect(cell('A1')?.getAttribute('aria-label')).toContain('未判定');
    confirm();
    expect(cell('A1')?.getAttribute('aria-label')).toContain('已排除');
    expect(host.textContent).toContain('全部配對完成');
  });
  it('keeps assistance through a mode reset, and challenge demonstration still needs confirmation', () => {
    click(button('挑戰'));
    for (let i = 0; i < 3; i += 1) click(label('取得提示'));
    expect(cell('B1')?.getAttribute('aria-label')).toContain('未判定');
    expect((button('確認推論') as HTMLButtonElement).disabled).toBe(false);
    click(button('A／B 分組')); click(button('確認繼續'));
    expect(host.textContent).toContain('本題已取得推論協助');
    click(button('排除甲案')); click(label('線索 1：')); confirm();
    expect(host.textContent).toContain('A 組 0 分'); expect(host.textContent).toContain('全部配對完成');
  });
  it('maps ADVANCED to the local standard tier', () => {
    act(() => root.unmount()); root = createRoot(host);
    act(() => root.render(<LogicDetectiveGame difficulty="ADVANCED" onBack={back} />));
    expect(host.textContent).toContain('標準 1／3'); expect(host.querySelectorAll('tbody tr')).toHaveLength(4);
  });
});


it('carries the next group across three completed challenge questions', () => {
  click(button('挑戰')); click(button('A／B 分組'));
  const bank = LOGIC_PUZZLES.filter(item => item.tier === 'CHALLENGE');
  bank.forEach((p, index) => {
    if (index) click(button('下一題'));
    expect(host.textContent).toContain(`目前：${index % 2 === 0 ? 'A' : 'B'} 組`);
    const candidate = p.candidates!.findIndex(assignment => p.clues.some(clue => !satisfiesLogicClue(assignment, clue)));
    const clue = p.clues.findIndex(item => !satisfiesLogicClue(p.candidates![candidate], item));
    click(button(candidate === 0 ? '排除甲案' : '排除乙案')); click(label(`線索 ${clue + 1}：`)); confirm();
  });
  expect(host.textContent).toContain('A 組 2 分'); expect(host.textContent).toContain('B 組 1 分');
});
