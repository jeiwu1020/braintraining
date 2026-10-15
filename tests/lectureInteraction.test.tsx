// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import Lectures from '../components/lectures/Lectures';
import {SCENES,LESSON_NOTES} from '../data/lectures/lesson01';
import {LESSON_SESSION_KEY} from '../components/lectures/session';
let root:Root,host:HTMLDivElement;
const button=(name:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent?.trim()===name||b.getAttribute('aria-label')===name)!;
const click=(name:string)=>{expect(button(name)).toBeTruthy();act(()=>button(name).click());};
const mount=()=>act(()=>root.render(<Lectures onBack={()=>undefined}/>));
const page=()=>Number(host.querySelector('[data-page]')?.getAttribute('data-page'));
beforeEach(()=>{sessionStorage.clear();history.replaceState(null,'','#lectures');vi.stubGlobal('scrollTo',vi.fn());(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.unstubAllGlobals();});
it('offers only one ready lesson; planning categories have no fake start button',()=>{mount();expect(host.textContent).toContain('六個生活主題');expect(host.querySelectorAll('.ll-topics button')).toHaveLength(6);act(()=>host.querySelectorAll<HTMLButtonElement>('.ll-topics button')[1].click());expect(host.textContent).toContain('仍在規劃中');expect(button('開始上課')).toBeUndefined();});
it('traverses every page without automatic reveal or accidental navigation',()=>{
 mount();click('開始上課');
 for(let i=0;i<24;i++){
  expect(page()).toBe(i+1);expect(host.querySelector('h1')?.textContent).toBe(SCENES[i].title);expect(host.querySelector('.ll-reveal')).toBeNull();
  expect(host.textContent).not.toContain(LESSON_NOTES[i].hint);expect(host.querySelectorAll('input,a[href]')).toHaveLength(0);
  if(i<23)click('下一頁');
 }
 click('完成課程');expect(button('續課 · 第 24 頁')).toBeTruthy();
});
it('separates selection from answers, preserves reveal on back and resume',()=>{
 mount();click('開始上課');click('下一頁');act(()=>host.querySelectorAll<HTMLButtonElement>('.ll-choices button')[1].click());expect(host.querySelector('.ll-reveal')).toBeNull();
 click('揭示提示與理由');expect(page()).toBe(2);expect(host.querySelector('.ll-reveal')?.textContent).toContain('「今晚前」');click('繼續看理由');expect(page()).toBe(2);expect(host.textContent).toContain('B 是較安全的起點');
 click('下一頁');click('上一頁');expect(host.textContent).toContain('B 是較安全的起點');
 click('返回職能講座首頁');click('續課 · 第 2 頁');expect(host.textContent).toContain('B 是較安全的起點');
 act(()=>root.unmount());root=createRoot(host);mount();expect(page()).toBe(2);expect(host.textContent).toContain('B 是較安全的起點');
 click('收起提示，重新討論');expect(host.querySelector('.ll-reveal')).toBeNull();expect(host.querySelectorAll('.ll-choices button')[1].getAttribute('aria-pressed')).toBe('true');
});
it('chapter jump, pause and keyboard escape preserve the current page',()=>{
 mount();click('開始上課');click('章節');expect(host.querySelector('[role=dialog]')).toBeTruthy();
 act(()=>host.querySelectorAll<HTMLButtonElement>('.ll-chapter-list button')[2].click());expect(page()).toBe(7);expect(host.querySelector('[role=dialog]')).toBeNull();
 click('暫停');expect(host.textContent).toContain('進度保留在第 7 頁');act(()=>host.querySelector('[role=dialog]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));expect(host.querySelector('[role=dialog]')).toBeNull();expect(page()).toBe(7);
 click('下一頁');click('示範下一步');click('示範下一步');expect(page()).toBe(8);expect(host.textContent).toContain('原本的購物 App');click('示範下一步');expect(host.querySelector('.ll-ring')).toBeTruthy();expect(button('已揭示完畢').disabled).toBe(true);
});
it('restart requires explicit confirmation; cancel keeps progress',()=>{
 mount();click('開始上課');click('下一頁');click('返回職能講座首頁');click('從頭開始');click('保留進度');expect(button('續課 · 第 2 頁')).toBeTruthy();click('從頭開始');click('重新開始');expect(page()).toBe(1);expect(JSON.parse(sessionStorage.getItem(LESSON_SESSION_KEY)!).revealed).toEqual({});
});
it('keeps full notes and verified sources on a separate prep page',()=>{
 mount();click('帶領者備課');expect(host.querySelectorAll('.ll-note')).toHaveLength(24);expect(host.textContent).toContain('最後查證：2026-10-15');expect(host.querySelectorAll('.ll-sources a')).toHaveLength(9);click('進入上課畫面');expect(page()).toBe(1);expect(host.querySelector('.ll-note')).toBeNull();expect(host.querySelector('.ll-sources')).toBeNull();
});
it('marks a fresh direct lesson link as started and resumes without clearing page or reveal',()=>{
 history.replaceState(null,'','#lectures/lesson-01');mount();expect(page()).toBe(1);click('下一頁');click('揭示提示與理由');
 act(()=>root.unmount());root=createRoot(host);mount();expect(page()).toBe(2);expect(host.querySelector('.ll-reveal-count')?.textContent).toBe('1 / 2');
 click('返回職能講座首頁');expect(button('續課 · 第 2 頁')).toBeTruthy();click('續課 · 第 2 頁');expect(page()).toBe(2);expect(host.querySelector('.ll-reveal-count')?.textContent).toBe('1 / 2');
});
