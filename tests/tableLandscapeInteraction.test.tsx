// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect} from 'vitest';
import Lighthouse from '../components/playground/Lighthouse';
import Garden from '../components/playground/Garden';
import {PREFIX} from '../games/playground/session';
import Lantern from '../components/playground/Lantern';
import Workshop from '../components/playground/Workshop';
import Auction from '../components/playground/Auction';
import {replay} from '../games/playground/session';
import {lanternEngine} from '../games/playground/lantern/rules';
import {workshopEngine} from '../games/playground/workshop/rules';
import {auctionEngine} from '../games/playground/auction/rules';

let host:HTMLDivElement,root:Root;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
beforeEach(()=>{sessionStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();});

const button=(name:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===name||b.ariaLabel===name)!;
const click=(name:string)=>{const b=button(name);expect(b,name).toBeTruthy();expect(b.disabled,name).toBe(false);act(()=>b.click());};
const saved=(game:string)=>{
  const suffix = (game === 'lighthouse' || game === 'workshop') ? '.rules-v3' : game === 'garden' ? '.rules-v2' : '';
  return JSON.parse(sessionStorage.getItem(`${PREFIX}.${game}${suffix}`)!);
};
const select=(label:string,value:string)=>{const el=host.querySelector(`select[aria-label="${label}"]`) as HTMLSelectElement;expect(el).toBeTruthy();act(()=>{el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));});};
const commit=(label:string)=>{click(label);click('確認行動');};

it('lighthouse practice uses actual AP, cargo, sailing and auto-delivery without writing a session',()=>{
  act(()=>root.render(<Lighthouse onBack={()=>{}}/>));click('開始本局');
  for(const label of ['裝入燈油 2、糧食 1','航向白礁（自動交貨）']) click(label);
  expect(host.textContent).toContain('補給完成');expect(host.textContent).toContain('船艙 0/4');
  expect(sessionStorage.getItem(`${PREFIX}.lighthouse.rules-v3`)).toBeNull();
  click('開始正式局');expect(saved('lighthouse').actions).toHaveLength(0);
});

it('map destinations auto-deliver on arrival with tactile cargo steppers',()=>{
  act(()=>root.render(<Lighthouse onBack={()=>{}}/>));click('開始本局');click('開始正式局');
  expect(host.querySelectorAll('select')).toHaveLength(0);
  click('增加燈油');
  expect(host.querySelector('[data-testid="load-fuel"]')?.textContent).toBe('2');
  click('裝入目前貨單');click('確認行動');
  expect(button('遠岬燈塔 · 1 行動').disabled).toBe(true);
  click('白礁燈塔 · 1 行動');click('確認行動');
  expect(saved('lighthouse').actions).toHaveLength(2);
  expect(host.textContent).toContain('船艙 0 / 4');
  expect(host.querySelector('[aria-label="完整航線與三座燈塔需求"]')?.textContent).toContain('補給完成');
});

it('garden practice rotates and calculates a real score, without touching a live journal',()=>{
  act(()=>root.render(<Garden onBack={()=>{}}/>));click('開始本局');click('試轉90°');
  expect(host.textContent).toContain('方向 90°');click('放入標示位置');
  expect(host.textContent).toContain('現在輪到B隊');expect(sessionStorage.getItem(`${PREFIX}.garden.rules-v2`)).toBeNull();
});

it('advanced garden offers all 36 cells and coordinate selection without committing; comparison does not change the move',()=>{
  act(()=>root.render(<Garden onBack={()=>{}}/>));click('進階');click('開始本局');click('開始正式局');
  expect(host.querySelectorAll('.tg-garden-active .tg-garden-cell')).toHaveLength(36);
  const v=host.querySelector('[data-valid-anchor="true"]')!;const lbl=v.getAttribute('aria-label')!;const col=String(lbl.charCodeAt(0)-65);const row=String(Number(lbl.match(/^[A-F](\d+)/)![1])-1);click('座標');select('落點欄',col);select('落點列',row);click('回到花園');expect(button('放置地形').disabled).toBe(false);
  click('對照花園');expect(host.querySelector('[role="dialog"]')?.textContent).toContain('兩隊花園對照');click('關閉');
  click('放置地形');expect(host.querySelector('[role="dialog"]')).toBeNull();expect(saved('garden').actions).toHaveLength(0);click('確認行動');
  expect(saved('garden').actions).toHaveLength(1);expect(host.textContent).toContain('B隊花園');
});

it('lantern table buttons place and move directly on the board with even scoring and zero dropdowns',()=>{
  act(()=>root.render(<Lantern onBack={()=>{}}/>));click('開始本局');click('開始正式局');
  expect(host.querySelectorAll('select')).toHaveLength(0);
  click('2 盞');commit('放置到茶巷');commit('放置到河畔');
  click('移動');expect(host.querySelector('.ln-forecast')).toBeTruthy();
  click('1 盞');
  click('從河畔移出');
  expect(button('移動到茶巷').getAttribute('aria-describedby')).toBe('ln-public-0');
  commit('移動到戲臺');
  click('從茶巷移出');
  commit('移動到牌樓');
  commit('等待布局');commit('等待布局');
  const state=replay(saved('lantern'),lanternEngine).at(-1)!;
  expect(state.phase).toBe('round_summary');expect(state.districts).toEqual([[1,0],[0,1],[0,1],[1,0]]);
  expect(state.totals).toEqual({A:6,B:6});expect(host.querySelectorAll('.ln-district')).toHaveLength(4);
  expect(host.querySelectorAll('.ln-public-values > span')).toHaveLength(12);expect(host.querySelectorAll('.ln-team-counts > span')).toHaveLength(8);
});

it('workshop ledger and 1-tap station controls support gathering, batch crafting, rush orders and shipping',()=>{
  act(()=>root.render(<Workshop onBack={()=>{}}/>));click('進階');click('開始本局');click('開始正式局');
  expect(host.querySelectorAll('select')).toHaveLength(0);
  commit('使用大料倉'); // A +3 materials -> 4
  commit('使用林場');   // B +2 materials -> 3
  commit('使用加工臺'); // A 4 -> 2 goods
  commit('使用急單櫃'); // B 2 -> +4 score
  commit('使用出貨埠'); // A 2 goods -> +12 score
  commit('安排休息');   // B +1 materials -> 2
  const state=replay(saved('workshop'),workshopEngine).at(-1)!;
  expect(state.stock.A.score).toBe(12);
  expect(state.stock.B.score).toBe(4);
  expect(state.phase).toBe('round_summary');
});

it('auction keeps all eight public lots and collection composition available through a genuine sale',()=>{
  act(()=>root.render(<Auction onBack={()=>{}}/>));click('進階');click('開始本局');click('開始正式局');
  expect(host.querySelectorAll('.tg-auction-itinerary article')).toHaveLength(8);
  commit('+1 枚');commit('+1 枚');commit('退出本件');
  const state=replay(saved('auction'),auctionEngine).at(-1)!;
  expect(state.budgets).toEqual({A:22,B:20});expect(state.collections.B).toHaveLength(1);
  click('成交明細');expect(host.querySelector('[role="dialog"]')?.textContent).toContain(state.collections.B[0].name);click('關閉');
  expect(saved('auction').actions).toHaveLength(3);
});
