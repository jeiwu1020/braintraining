// @vitest-environment jsdom
import React,{act} from 'react';import{createRoot,type Root}from'react-dom/client';import{afterEach,beforeEach,expect,it,vi}from'vitest';import NimGame from '../components/NimGame';
let host:HTMLDivElement,root:Root;const onBack=vi.fn();
const button=(name:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===name||b.getAttribute('aria-label')===name)!;
const click=(name:string)=>{expect(button(name)).toBeTruthy();act(()=>button(name).click());};
const take=(pile:string,amount:number)=>{click(`石堆 ${pile}`);click(String(amount));click(`確認拿取 ${amount} 顆`);};
beforeEach(()=>{sessionStorage.clear();(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;onBack.mockClear();host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);act(()=>root.render(<NimGame onBack={onBack}/>));});afterEach(()=>{act(()=>root.unmount());host.remove();});
it('restores three full horizontal piles and the original take controls',()=>{
 for(const [p,n] of [['A',3],['B',4],['C',5]])expect(button(`石堆 ${p}`).textContent).toContain(`${p} 堆：${n} 顆`);
 expect(host.querySelector('select')).toBeNull();take('B',2);expect(button('石堆 B').textContent).toContain('B 堆：2 顆');expect(button('執行教學對手')).toBeTruthy();
});
it('restores advanced piles and last-taker-loses rule',()=>{
 act(()=>root.render(<NimGame key="advanced" difficulty="ADVANCED" onBack={onBack}/>));
 for(const [p,n] of [['A',1],['B',3],['C',5],['D',7]])expect(button(`石堆 ${p}`).textContent).toContain(`${p} 堆：${n} 顆`);
 expect(host.textContent).toContain('拿到最後一顆者輸');
});
it('keeps the teaching opponent manual and undoes its reply',()=>{
 take('C',1);expect(button('執行教學對手')).toBeTruthy();const board=host.querySelector('[aria-label="石堆 A"]')!.parentElement!.textContent;
 click('執行教學對手');click('復原上一步');expect(button('執行教學對手')).toBeTruthy();expect(host.querySelector('[aria-label="石堆 A"]')!.parentElement!.textContent).toBe(board);
});
it('undo restores the winner score without changing the original competitive flow',()=>{
 click('A／B 對戰');take('A',3);take('B',4);take('C',5);expect(host.textContent).toContain('A 組獲勝');expect(host.textContent).toContain('A 組 1 分');click('復原上一步');expect(host.textContent).toContain('A 組 0 分');expect(host.textContent).toContain('目前：A 組');
});
it('preserves the requested exit confirmation for an unsubmitted selection',()=>{
 click('石堆 A');click('返回遊戲目錄');click('繼續活動');expect(onBack).not.toHaveBeenCalled();expect(button('石堆 A').getAttribute('aria-pressed')).toBe('true');click('返回遊戲目錄');click('確認離開');expect(onBack).toHaveBeenCalledTimes(1);
});

it('keeps exact strategy help marked as practice through undo and restart',()=>{
 click('A／B 對戰');click('取得提示');take('A',3);take('B',4);take('C',5);expect(host.textContent).toContain('提示練習');expect(host.textContent).toContain('A 組 0 分');click('復原上一步');take('C',5);expect(host.textContent).toContain('A 組 0 分');
 click('重新開始');click('確認繼續');take('A',3);take('B',4);take('C',5);expect(host.textContent).toContain('A 組 0 分');
});
it('records only one take on a repeated confirmation before render',()=>{
 click('A／B 對戰');click('石堆 A');const target=button('確認拿取 1 顆');act(()=>{target.click();target.click();});click('復原上一步');expect(button('石堆 A').textContent).toContain('A 堆：3 顆');expect(button('復原上一步').disabled).toBe(true);
});
it('keeps snapshots aligned on repeated undo events before render',()=>{
 click('A／B 對戰');take('A',1);take('B',1);const undo=button('復原上一步');act(()=>{undo.click();undo.click();});expect(button('石堆 A').textContent).toContain('A 堆：2 顆');expect(button('石堆 B').textContent).toContain('B 堆：4 顆');expect(button('復原上一步').disabled).toBe(false);click('復原上一步');expect(button('石堆 A').textContent).toContain('A 堆：3 顆');
});
