// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect} from 'vitest';
import Lighthouse from '../components/playground/Lighthouse';
import Garden from '../components/playground/Garden';
import {PREFIX} from '../games/playground/session';
let host:HTMLDivElement,root:Root;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
beforeEach(()=>{sessionStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();});
const button=(name:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===name||b.ariaLabel===name)!;
const click=(name:string)=>{const b=button(name);expect(b,name).toBeTruthy();expect(b.disabled,name).toBe(false);act(()=>b.click());};
const saved=(game:string)=>JSON.parse(sessionStorage.getItem(`${PREFIX}.${game}${["lighthouse","workshop"].includes(game)?".rules-v2":""}`)!);
const select=(label:string,value:string)=>{const el=host.querySelector(`select[aria-label="${label}"]`) as HTMLSelectElement;expect(el).toBeTruthy();act(()=>{el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));});};
it('lighthouse practice uses actual AP, cargo, sailing, next day and delivery without writing a session',()=>{
  act(()=>root.render(<Lighthouse onBack={()=>{}}/>));click('開始本局');
  for(const label of ['裝入燃料2、糧食1','航向白礁','開始第2回合','卸貨補給']) click(label);
  expect(host.textContent).toContain('補給完成');expect(host.textContent).toContain('船艙 0/4');
  expect(sessionStorage.getItem(`${PREFIX}.lighthouse`)).toBeNull();
  click('開始正式局');expect(saved('lighthouse').actions).toHaveLength(0);
});
it('map destinations remain the real legal sail actions and contextual port controls preserve cargo',()=>{
  act(()=>root.render(<Lighthouse onBack={()=>{}}/>));click('開始本局');click('開始正式局');
  select('裝貨燃料','2');select('裝貨糧食','1');click('裝入目前貨單');click('確認行動');
  expect(button('遠岬燈塔 · 1 行動').disabled).toBe(true);
  click('白礁燈塔 · 1 行動');click('確認行動');
  expect(saved('lighthouse').actions).toHaveLength(2);expect(host.textContent).toContain('船艙 3 / 4');
  click('下一回合');click('確認行動');click('卸貨補給');click('取消選擇');
  expect(saved('lighthouse').actions).toHaveLength(3);
  click('卸貨補給');click('確認行動');expect(host.textContent).toContain('船艙 0 / 4');
  expect(host.querySelector('[aria-label="完整航線與三座燈塔需求"]')?.textContent).toContain('補給完成');
});
it('garden practice rotates and calculates a real score, without touching a live journal',()=>{
  act(()=>root.render(<Garden onBack={()=>{}}/>));click('開始本局');click('試轉90°');
  expect(host.textContent).toContain('方向 90°');click('放入標示位置');
  expect(host.textContent).toContain('現在輪到B隊');expect(sessionStorage.getItem(`${PREFIX}.garden`)).toBeNull();
});
it('advanced garden offers all 36 cells and coordinate selection without committing; comparison does not change the move',()=>{
  act(()=>root.render(<Garden onBack={()=>{}}/>));click('進階');click('開始本局');click('開始正式局');
  expect(host.querySelectorAll('.tg-garden-active .tg-garden-cell')).toHaveLength(36);
  click('座標');select('落點欄','0');select('落點列','0');click('回到花園');expect(button('預覽放置').disabled).toBe(false);
  click('對照花園');expect(host.querySelector('[role="dialog"]')?.textContent).toContain('兩隊花園對照');click('關閉');
  click('預覽放置');expect(saved('garden').actions).toHaveLength(0);click('確認行動');
  expect(saved('garden').actions).toHaveLength(1);expect(host.textContent).toContain('B隊花園');
});

import Lantern from '../components/playground/Lantern';
import Workshop from '../components/playground/Workshop';
import Auction from '../components/playground/Auction';
import {replay} from '../games/playground/session';
import {lanternEngine} from '../games/playground/lantern/rules';
import {workshopEngine} from '../games/playground/workshop/rules';
import {auctionEngine} from '../games/playground/auction/rules';
const commit=(label:string)=>{click(label);click('確認行動');};
it('lantern table buttons place and move actual pieces, keep all future values and record nonzero evaluation',()=>{
  act(()=>root.render(<Lantern onBack={()=>{}}/>));click('開始本局');click('開始正式局');
  select('本次花燈盞數','2');commit('放置到茶巷');commit('放置到河畔');
  // Round two starts with B, so move one of B's two river lanterns.
  click('移動');expect(host.querySelector('.ln-forecast')).toBeTruthy();expect(button('移動到茶巷').getAttribute('aria-describedby')).toBe('ln-public-0');select('出發街區','1');select('本次花燈盞數','1');commit('移動到戲臺');
  select('出發街區','0');commit('移動到牌樓');commit('等待布局');commit('等待布局');
  const state=replay(saved('lantern'),lanternEngine).at(-1)!;
  expect(state.phase).toBe('round_summary');expect(state.districts).toEqual([[1,0],[0,1],[0,1],[1,0]]);
  expect(state.totals).toEqual({A:7,B:7});expect(host.querySelectorAll('.ln-district')).toHaveLength(4);
  expect(host.querySelectorAll('.ln-public-values > span')).toHaveLength(12);expect(host.querySelectorAll('.ln-team-counts > span')).toHaveLength(8);
});
it('workshop ledger and station controls support processing, shipping and upgrading, including two-piece batches',()=>{
  act(()=>root.render(<Workshop onBack={()=>{}}/>));click('進階');click('開始本局');click('開始正式局');
  commit('使用木料站');commit('使用金屬站');commit('使用加工臺');commit('安排休息');commit('使用出貨埠');commit('安排休息');commit('下一工作日');
  commit('使用木料站');commit('使用金屬站');select('加工出貨件數','2');commit('使用加工臺');commit('使用升級坊');commit('使用出貨埠');commit('安排休息');
  const state=replay(saved('workshop'),workshopEngine).at(-1)!;
  expect(state.stock.A.score).toBe(4);expect(state.stock.A.level).toBe(1);expect(state.stock.B.score).toBe(8);
  expect(saved('workshop').actions).toContainEqual({type:'use',station:'craft',count:2});
  expect(saved('workshop').actions).toContainEqual({type:'use',station:'ship',count:2});
  expect(state.phase).toBe('round_summary');
});
it('auction keeps all eight public lots and collection composition available through a genuine sale',()=>{
  act(()=>root.render(<Auction onBack={()=>{}}/>));click('進階');click('開始本局');click('開始正式局');
  expect(host.querySelectorAll('.tg-auction-itinerary article')).toHaveLength(8);
  commit('加一枚籌碼');commit('加一枚籌碼');commit('退出本件');
  const state=replay(saved('auction'),auctionEngine).at(-1)!;
  expect(state.budgets).toEqual({A:22,B:20});expect(state.collections.B).toHaveLength(1);
  click('成交明細');expect(host.querySelector('[role="dialog"]')?.textContent).toContain(state.collections.B[0].name);click('關閉');
  expect(saved('auction').actions).toHaveLength(3);
});
