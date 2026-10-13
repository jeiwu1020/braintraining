// @vitest-environment jsdom
import React,{act}from'react';import{createRoot,type Root}from'react-dom/client';import{afterEach,beforeEach,expect,it}from'vitest';import MahjongMeldsGame from '../components/MahjongMeldsGame';
let host:HTMLDivElement,root:Root;
const button=(name:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===name||b.getAttribute('aria-label')===name)!;
const click=(name:string)=>{expect(button(name)).toBeTruthy();act(()=>button(name).click());};
const tier=(value:string)=>{const s=host.querySelector('[aria-label="麻將推理階段"]') as HTMLSelectElement;expect(s).toBeTruthy();act(()=>{s.value=value;s.dispatchEvent(new Event('change',{bubbles:true}));});};
beforeEach(()=>{sessionStorage.clear();(globalThis as{IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);act(()=>root.render(<MahjongMeldsGame onBack={()=>undefined}/>));});afterEach(()=>{act(()=>root.unmount());host.remove();});
it('previews a named tile and only scores a confirmed full answer, with complete undo',()=>{
 click('A／B 分組');click('候選 三萬');expect(host.textContent).toContain('A 組 0 分');click('確認答案');expect(host.textContent).toContain('A 組 1 分');click('復原上一步');expect(host.textContent).toContain('A 組 0 分');expect(button('候選 三萬').getAttribute('aria-pressed')).toBe('true');
});
it('accepts both ends together and does not mark a second valid tile wrong',()=>{
 tier('STANDARD');click('A／B 分組');click('候選 二萬');click('確認答案');expect(host.textContent).toContain('選牌仍不完整');click('候選 五萬');click('確認答案');expect(host.textContent).toContain('A 組 1 分');expect(host.textContent).toContain('二萬、五萬');
});
it('builds a two-stage discard plan under one group before handing off',()=>{
 tier('CHALLENGE');click('A／B 分組');click('捨第 3 張 六萬');click('確認捨牌');expect(host.textContent).toContain('目前：A 組');click('候選 二萬');click('候選 五萬');click('確認答案');expect(host.textContent).toContain('目前：B 組');expect(host.textContent).toContain('A 組 1 分');click('復原上一步');expect(host.textContent).toContain('A 組 0 分');
});
it('protects drafts, uses the exit wording and preserves answer knowledge on remount',()=>{
 click('候選 三萬');click('返回遊戲目錄');expect(button('確認離開')).toBeTruthy();click('繼續活動');expect(button('候選 三萬').getAttribute('aria-pressed')).toBe('true');
 for(let n=0;n<3;n++)click('取得提示');act(()=>root.unmount());root=createRoot(host);act(()=>root.render(<MahjongMeldsGame onBack={()=>undefined}/>));click('A／B 分組');click('候選 三萬');click('確認答案');expect(host.textContent).toContain('提示練習');expect(host.textContent).toContain('A 組 0 分');
});
