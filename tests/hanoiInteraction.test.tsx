// @vitest-environment jsdom
import React,{act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import HanoiGame from '../components/HanoiGame';
let host:HTMLDivElement,root:Root;const onBack=vi.fn();
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;onBack.mockClear();host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);act(()=>root.render(<HanoiGame onBack={onBack}/>));});
afterEach(()=>{act(()=>root.unmount());host.remove();});
const button=(name:string)=>[...host.querySelectorAll('button')].find(item=>item.textContent===name||item.getAttribute('aria-label')===name)!;
const click=(name:string)=>{expect(button(name)).toBeTruthy();act(()=>button(name).click());};
const move=(from:string,to:string)=>{click(`柱子 ${from}`);click(`柱子 ${to}`);};
it('restores the complete three-disk A-to-C board and direct two-click movement',()=>{
 expect(button('柱子 A').querySelectorAll('[aria-label$="號圓盤"]')).toHaveLength(3);
 expect(host.querySelector('select')).toBeNull();expect(button('確認移動')).toBeUndefined();
 move('A','C');expect(button('柱子 C').textContent).toContain('1');expect(button('柱子 A').querySelectorAll('[aria-label$="號圓盤"]')).toHaveLength(2);
});
it('restores four disks for advanced without a separate puzzle tier',()=>{
 act(()=>root.render(<HanoiGame key="advanced" difficulty="ADVANCED" onBack={onBack}/>));
 expect(button('柱子 A').querySelectorAll('[aria-label$="號圓盤"]')).toHaveLength(4);expect(host.textContent).toContain('最少 15 步');
});
it('counts seven moves correctly and undoes the winning score and team together',()=>{
 click('A／B 分組');for(const [a,b] of [['A','C'],['A','B'],['C','B'],['A','C'],['B','A'],['B','C'],['A','C']])move(a,b);
 expect(host.textContent).toContain('共使用 7 步');expect(host.textContent).toContain('A 組 1 分');
 click('復原上一步');expect(host.textContent).toContain('A 組 0 分');expect(host.textContent).toContain('目前：A 組');
 move('A','C');expect(host.textContent).toContain('A 組 1 分');
});
it('cancels same-rod selection, rejects an oversized move and guards leaving a draft',()=>{
 click('柱子 A');click('柱子 A');expect(button('柱子 A').getAttribute('aria-pressed')).toBe('false');expect(button('復原上一步').disabled).toBe(true);
 move('A','C');move('A','C');expect(button('柱子 C').querySelectorAll('[aria-label$="號圓盤"]')).toHaveLength(1);
 click('柱子 A');click('返回遊戲目錄');click('繼續活動');expect(onBack).not.toHaveBeenCalled();expect(button('柱子 A').getAttribute('aria-pressed')).toBe('true');click('返回遊戲目錄');click('確認離開');expect(onBack).toHaveBeenCalledTimes(1);
});
it('commits only one move when the destination receives two events before render',()=>{
 click('柱子 A');const target=button('柱子 C');act(()=>{target.click();target.click();});click('復原上一步');expect(button('柱子 A').querySelectorAll('[aria-label$="號圓盤"]')).toHaveLength(3);expect(button('復原上一步').disabled).toBe(true);
});
it('keeps history and board aligned when undo receives repeated events in one render',()=>{
 move('A','C');move('A','B');const undo=button('復原上一步');act(()=>{undo.click();undo.click();});expect(button('柱子 B').querySelectorAll('[aria-label$="號圓盤"]')).toHaveLength(0);expect(button('柱子 C').querySelectorAll('[aria-label$="號圓盤"]')).toHaveLength(1);expect(button('復原上一步').disabled).toBe(false);click('復原上一步');expect(button('柱子 A').querySelectorAll('[aria-label$="號圓盤"]')).toHaveLength(3);
});
