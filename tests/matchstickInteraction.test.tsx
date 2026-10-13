// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import MatchstickGame from '../components/MatchstickGame';

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
  act(() => root.render(<MatchstickGame onBack={() => undefined} />));
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
const click = (element: Element | undefined | null) => {
  if (!element) throw new Error('Expected a matchstick control');
  act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
};
const textButton = (text: string) => [...host.querySelectorAll('button')].find(button => button.textContent === text);
const labelButton = (prefix: string) => [...host.querySelectorAll('button')].find(button => button.getAttribute('aria-label')?.startsWith(prefix));
const choose = (slot: string, target: string) => {
  click(labelButton(`選擇 ${slot}：`)); click(labelButton(`放入位置 ${target}・`));
};

describe('facilitator matchstick interaction', () => {
  it('disables only the plus horizontal source while keeping other source buttons available', () => {
    click(textButton('標準'));
    click(labelButton('選擇 B：'));
    expect((labelButton('拿起火柴 B1・') as HTMLButtonElement).disabled).toBe(true);
    expect((labelButton('拿起火柴 B2・') as HTMLButtonElement).disabled).toBe(false);
    click(labelButton('選擇 A：'));
    expect((labelButton('拿起火柴 A2・') as HTMLButtonElement).disabled).toBe(false);
    click(labelButton('拿起火柴 A2・'));
    expect(host.textContent).toContain('拿起 A2');
  });
  it('shows the physical preview before committing and fully undoes a scored completed move', () => {
    click(textButton('A／B 分組'));
    choose('A', 'A2');
    expect(host.querySelector('[data-matchstick-segment="B2"]')?.getAttribute('data-segment-state')).toBe('removed');
    expect(host.textContent).toContain('A 組 0 分');
    expect(host.textContent).toMatch(/目前[： ]A 組/);
    click(textButton('確認移動'));
    expect(host.textContent).toContain('A 組 1 分');
    expect(host.textContent).toMatch(/目前[： ]B 組/);
    expect((textButton('確認移動') as HTMLButtonElement).disabled).toBe(true);
    click(labelButton('復原上一步'));
    expect(host.textContent).toContain('A 組 0 分');
    expect(host.textContent).toMatch(/目前[： ]A 組/);
    expect((textButton('確認移動') as HTMLButtonElement).disabled).toBe(false);
    click(textButton('確認移動'));
    expect(host.textContent).toContain('A 組 1 分');
    expect(host.textContent).not.toContain('A 組 2 分');
  });

  it('preserves draft and current tier when a level change is canceled, and clears on confirmation', () => {
    choose('A', 'A2');
    click(textButton('標準'));
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
    click(textButton('繼續活動'));
    expect(host.textContent).toContain('入門 1／4');
    expect((textButton('確認移動') as HTMLButtonElement).disabled).toBe(false);
    click(textButton('標準')); click(textButton('確認繼續'));
    expect(host.textContent).toContain('標準 1／4');
    expect((textButton('確認移動') as HTMLButtonElement).disabled).toBe(true);
  });

  it('keeps the original equation for the second challenge solution and rejects duplicate credit', () => {
    click(textButton('挑戰')); click(textButton('A／B 分組'));
    click(labelButton('選擇 B：')); click(labelButton('拿起火柴 B2・')); choose('A', 'A1'); click(textButton('確認移動'));
    expect(host.textContent).toContain('已找到 1／2 解');
    expect(host.querySelector('[data-matchstick-equation]')?.getAttribute('aria-label')).toBe('火柴算式 1+2=5');
    click(labelButton('選擇 B：')); click(labelButton('拿起火柴 B2・')); choose('A', 'A1'); click(textButton('確認移動'));
    expect(host.textContent).toContain('沒有重複加分或換組');
    expect(host.textContent).toMatch(/目前[： ]B 組/);
    click(textButton('清除本次選取'));
    click(labelButton('選擇 E：')); click(labelButton('拿起火柴 E6・')); choose('E', 'E2'); click(textButton('確認移動'));
    expect(host.textContent).toContain('已找到 2／2 解');
    expect(host.textContent).toContain('A 組 1 分');
    expect(host.textContent).toContain('B 組 1 分');
    expect(host.textContent).toContain('7-2=5');
    expect(host.textContent).toContain('1+2=3');
  });

  it('restores the selected destination panel as well as the previous whole-decision draft', () => {
    click(textButton('挑戰'));
    click(labelButton('選擇 B：')); click(labelButton('拿起火柴 B2・')); choose('A', 'A1'); click(textButton('確認移動'));
    click(labelButton('選擇 E：')); click(labelButton('拿起火柴 E6・')); choose('E', 'E2');
    click(labelButton('復原上一步'));
    expect(labelButton('選擇 A：')?.getAttribute('aria-pressed')).toBe('true');
    expect(labelButton('放入位置 A1・')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.textContent).toContain('已找到 0／2 解');
  });

  it('still guards leaving after a revealed hint is cleared from the draft', () => {
    for (let count = 0; count < 3; count += 1) click(labelButton('取得提示'));
    click(textButton('清除本次選取')); click(textButton('下一題（保留分數）'));
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
    click(textButton('繼續活動'));
    expect(host.textContent).toContain('入門 1／4');
  });

  it.each(['重新開始', '切換模式'])('keeps revealed-answer practice status after %s on the same question', action => {
    click(textButton('A／B 分組'));
    for (let count = 0; count < 3; count += 1) click(labelButton('取得提示'));
    if (action === '重新開始') {
      click(labelButton('重新開始')); click(textButton('確認繼續'));
    } else {
      click(textButton('全體合作')); click(textButton('確認繼續'));
      click(textButton('A／B 分組'));
      if (host.querySelector('[role="alertdialog"]')) click(textButton('確認繼續'));
    }
    choose('A', 'A2'); click(textButton('確認移動'));
    expect(host.textContent).toContain('提示練習');
    expect(host.textContent).toContain('A 組 0 分');
  });

  it('starts a fresh reveal record only after moving to another question', () => {
    click(textButton('A／B 分組'));
    for (let count = 0; count < 3; count += 1) click(labelButton('取得提示'));
    click(textButton('下一題（保留分數）')); click(textButton('確認繼續'));
    expect(host.textContent).toContain('入門 2／4');
    expect(host.textContent).not.toContain('本題已揭示');
    choose('E', 'E5'); click(textButton('確認移動'));
    expect(host.textContent).toContain('A 組 1 分');
    expect(host.textContent).not.toContain('提示練習');
  });

  it('does not let clearing a fully revealed method turn it into a scored answer', () => {
    click(textButton('A／B 分組'));
    for (let count = 0; count < 3; count += 1) click(labelButton('取得提示'));
    click(textButton('清除本次選取')); choose('A', 'A2'); click(textButton('確認移動'));
    expect(host.textContent).toContain('提示練習');
    expect(host.textContent).toContain('A 組 0 分');
  });
});
