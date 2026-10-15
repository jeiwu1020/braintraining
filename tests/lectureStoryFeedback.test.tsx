// @vitest-environment jsdom
import React,{act} from 'react';
import {createRoot,Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import Lectures from '../components/lectures/Lectures';
import {STORY_SCREENS} from '../data/lectures/story01';
import {CHAPTERS} from '../data/lectures/lesson01';
import {newLessonSession,LESSON_SESSION_KEY,readLessonSession} from '../components/lectures/session';
let root:Root,host:HTMLDivElement;
const click=(name:string)=>{const b=[...host.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent?.trim()===name||b.getAttribute('aria-label')===name);expect(b,`button ${name}`).toBeTruthy();act(()=>b!.click());};
const mount=(page=0)=>{sessionStorage.setItem(LESSON_SESSION_KEY,JSON.stringify({...newLessonSession(),page,started:true}));act(()=>root.render(<Lectures onBack={()=>undefined}/>));};
beforeEach(()=>{sessionStorage.clear();history.replaceState(null,'','#lectures/lesson-01');vi.stubGlobal('scrollTo',vi.fn());(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.unstubAllGlobals();});
it('has four connected missions and forty distinct immediate-feedback choices',()=>{
 expect(CHAPTERS.map(c=>c.first)).toEqual([0,6,11,16]);
 expect(STORY_SCREENS.filter(s=>s.challenge).map(s=>s.n)).toEqual([6,11,15,21]);
 expect(STORY_SCREENS[8].interaction.choices[2].text).toContain('目前資訊不足');
 const choices=STORY_SCREENS.flatMap(s=>[...s.interaction.choices,...(s.challenge?.choices??[])]);expect(choices).toHaveLength(40);
 choices.forEach(c=>{expect(c.feedback.confirmed).toBeTruthy();expect(c.feedback.missing).toBeTruthy();expect(c.feedback.next).toBeTruthy();});
 expect(JSON.stringify(STORY_SCREENS)).not.toMatch(/https?:\/\/|tel:|javascript:|data:/i);
});
for(const screen of STORY_SCREENS.filter(s=>s.interaction.choices.length))it(`page ${screen.n}: context first, every choice immediately explains and permits retry/continue`,()=>{
 mount(screen.n-1);screen.contextFacts.forEach(f=>expect(host.textContent).toContain(f));expect(host.querySelector('.ll-decision-choices')).toBeNull();
 click('比較下一步');
 for(const choice of screen.interaction.choices){click(choice.text);const feedback=host.querySelector('.ll-choice-feedback');expect(feedback?.textContent).toContain(choice.feedback.missing);expect(feedback?.textContent).toContain(choice.feedback.next);expect(Number(host.querySelector('[data-page]')?.getAttribute('data-page'))).toBe(screen.n);click('再試一個');}
 click(screen.interaction.choices[0].text);click('下一頁');expect(Number(host.querySelector('[data-page]')?.getAttribute('data-page'))).toBe(screen.n+1);
});
for(const screen of STORY_SCREENS.filter(s=>s.challenge))it(`page ${screen.n}: optional challenge has its own context and immediate feedback`,()=>{
 mount(screen.n-1);click('選做延伸');screen.challenge!.contextFacts.forEach(f=>expect(host.textContent).toContain(f));click('比較下一步');
 for(const choice of screen.challenge!.choices){click(choice.text);expect(host.querySelector('.ll-choice-feedback')?.textContent).toContain(choice.feedback.missing);click('再試一個');}
 click(screen.challenge!.choices[0].text);click('回到主故事');expect(Number(host.querySelector('[data-page]')?.getAttribute('data-page'))).toBe(screen.n);
 expect(readLessonSession().challengeVisited[screen.n-1]).toBe(true);
});
it('restores feedback and retry without resetting reveals or previous mission discussion',()=>{
 mount(1);click('比較下一步');click(STORY_SCREENS[1].interaction.choices[0].text);click('下一頁');click('上一頁');expect(host.querySelector('.ll-choice-feedback')).toBeTruthy();
 act(()=>root.unmount());root=createRoot(host);act(()=>root.render(<Lectures onBack={()=>undefined}/>));expect(host.querySelector('.ll-choice-feedback')).toBeTruthy();click('再試一個');expect(readLessonSession().discussed[1]).toBe(true);expect(readLessonSession().page).toBe(1);
});
it('migrates old progress without assigning an old answer to a different new option',()=>{
 sessionStorage.setItem(LESSON_SESSION_KEY,JSON.stringify({version:1,page:7,started:true,revealed:{7:2},selected:{1:1}}));const s=readLessonSession();expect(s.page).toBe(7);expect(s.revealed[7]).toBe(2);expect(s.selected).toEqual({});expect(s.started).toBe(true);
});

it('restarts full reasons at the first segment after a new choice without resetting progress',()=>{
 mount(1);click('比較下一步');click(STORY_SCREENS[1].interaction.choices[0].text);click('看完整理由');click('繼續看理由');expect(host.querySelector('.ll-reveal-count')?.textContent).toBe('2 / 2');
 click('回到討論選項');click(STORY_SCREENS[1].interaction.choices[2].text);click('看完整理由');expect(host.querySelector('.ll-reveal-count')?.textContent).toBe('1 / 2');
 expect(readLessonSession().selected[1]).toBe(2);expect(readLessonSession().contextSeen[1]).toBe(true);expect(readLessonSession().page).toBe(1);
 click('繼續看理由');expect(host.querySelector('.ll-reveal-count')?.textContent).toBe('2 / 2');
});
