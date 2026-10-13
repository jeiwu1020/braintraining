// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MinesweeperGame from '../components/MinesweeperGame';
import { generateGradedMinesweeper } from '../data/minesweeperPuzzles';
import { solveMinesweeperTrace, mineCoordinate } from '../utils/minesweeperInference';
let host: HTMLDivElement; let root: Root;
beforeEach(() => {
 (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT=true;
 sessionStorage.clear(); vi.spyOn(Math,'random').mockReturnValue(0);
 host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);
 act(()=>root.render(<MinesweeperGame onBack={()=>undefined}/>));
});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.restoreAllMocks();});
const click=(element: Element | undefined | null)=>{if(!element)throw Error('Missing Minesweeper control');act(()=>element.dispatchEvent(new MouseEvent('click',{bubbles:true})));};
const button=(text:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===text);
const label=(text:string)=>[...host.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')?.startsWith(text));
const first=()=>{click(label('A1，'));click(button('確認整批'));};

describe('Minesweeper facilitator flow',()=>{
 it('keeps a six-by-six board and all three tools visible in fixed controls',()=>{
  expect(host.querySelectorAll('[role="gridcell"]')).toHaveLength(36);
  const controls=host.querySelector('[data-facilitated-controls]');expect(controls).not.toBeNull();
  for(const name of ['揭開','標雷／撤旗','連開','確認整批'])expect(controls?.textContent).toContain(name);
  for(const name of ['入門','標準','挑戰'])expect(button(name)).toBeDefined();
  expect(controls?.querySelectorAll('button.min-h-11').length).toBeGreaterThanOrEqual(5);
 });
 it('only previews a selected coordinate until confirmation, then fully undoes the opening',()=>{
  click(button('A／B 分組'));click(label('A1，'));
  expect(label('A1，未翻開')?.getAttribute('aria-pressed')).toBe('true');expect(host.textContent).toContain('A 組 0 分');
  click(button('確認整批'));expect(label('A1，數字 0')).toBeDefined();expect(host.textContent).toContain('A 組 1 分');
  click(label('誤觸復原'));expect(label('A1，未翻開')).toBeDefined();expect(host.textContent).toContain('A 組 0 分');
  expect(label('A1，未翻開')?.getAttribute('aria-pressed')).toBe('true');
 });
 it('guards a pending first-coordinate draft and preserves it when changing tier is canceled',()=>{
  click(label('A1，'));click(button('標準'));expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
  click(button('繼續活動'));expect(button('入門')?.getAttribute('aria-pressed')).toBe('true');expect(label('A1，未翻開')?.getAttribute('aria-pressed')).toBe('true');
  click(button('標準'));click(button('確認繼續'));expect(button('標準')?.getAttribute('aria-pressed')).toBe('true');expect(label('A1，未翻開')?.getAttribute('aria-pressed')).toBe('false');
 });
 it('gives a multi-cell inference one turn and keeps empty chords as no-ops',()=>{
  click(button('A／B 分組'));first();
  const step=solveMinesweeperTrace(generateGradedMinesweeper('BEGINNER','0,0',[],()=>0)).steps[0];
  click(button(step.action==='FLAG'?'標雷／撤旗':'揭開'));
  step.targets.forEach(cell=>click(label(mineCoordinate(cell)+'，')));click(button('確認整批'));
  expect(host.textContent).toContain('B 組 1 分');expect(host.textContent).toMatch(/目前：A 組/);
  click(button('連開'));click(label('A1，'));click(button('確認整批'));
  expect(host.textContent).toContain('不計分、不換組');expect(host.textContent).toMatch(/目前：A 組/);
 });
 it('keeps answer exposure after undo, clearing the draft, and remounting the activity',()=>{
  click(button('A／B 分組'));first();
  for(let i=0;i<3;i++)click(label('取得提示'));
  expect(host.textContent).toContain('提示練習');
  click(label('誤觸復原'));click(button('清除選取'));first();expect(host.textContent).toContain('A 組 0 分');
  act(()=>root.unmount());root=createRoot(host);act(()=>root.render(<MinesweeperGame onBack={()=>undefined}/>));
  click(button('A／B 分組'));first();expect(host.textContent).toContain('提示練習');expect(host.textContent).toContain('A 組 0 分');
 });
 it('does not reset a confirmed board when pressing the current mode or current tier',()=>{
  first();click(button('全體合作'));click(button('入門'));
  expect(host.querySelector('[role="alertdialog"]')).toBeNull();expect(label('A1，數字 0')).toBeDefined();
 });
 it('makes over-flagging explicit instead of displaying a negative number of remaining mines',()=>{
  first();click(button('標雷／撤旗'));
  const cells=[...host.querySelectorAll('button')].filter(b=>b.getAttribute('aria-label')?.endsWith('，未翻開')).slice(0,7);
  expect(cells).toHaveLength(7);cells.forEach(click);click(button('確認整批'));
  expect(host.textContent).toContain('旗幟超過總雷數');expect(host.textContent).not.toContain('剩 -1');
 });

});
it('keeps exact help across remount when storage reads work but writes fail',()=>{
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('full','QuotaExceededError');});
 click(button('A／B 分組'));first();for(let n=0;n<3;n++)click(label('取得提示'));
 act(()=>root.unmount());root=createRoot(host);act(()=>root.render(<MinesweeperGame onBack={()=>undefined}/>));
 click(button('A／B 分組'));first();expect(host.textContent).toContain('提示練習');expect(host.textContent).toContain('A 組 0 分');
});

it('uses the selected tier mine total in the live flag counter',()=>{
 click(button('挑戰'));first();expect(host.textContent).toContain('已標記 0／8 顆');expect(host.textContent).toContain('旗數推估剩 8 顆');
});
it('keeps the permanent title consistent with all three actual mine totals',()=>{
 expect(host.textContent).toContain('6×6｜6 顆地雷');click(button('標準'));expect(host.textContent).toContain('6×6｜7 顆地雷');click(button('挑戰'));expect(host.textContent).toContain('6×6｜8 顆地雷');
});
