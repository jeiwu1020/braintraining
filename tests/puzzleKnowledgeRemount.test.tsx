// @vitest-environment jsdom
import React,{act}from'react';import{createRoot,type Root}from'react-dom/client';import{afterEach,beforeEach,expect,it}from'vitest';
import WordPathGame from '../components/WordPathGame';import LogicDetectiveGame from '../components/LogicDetectiveGame';import NonogramGame from '../components/NonogramGame';import QwirkleGame from '../components/QwirkleGame';
let host:HTMLDivElement,root:Root;
beforeEach(()=>{sessionStorage.clear();(globalThis as{IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);});afterEach(()=>{act(()=>root.unmount());host.remove();});
it.each([[WordPathGame,'答案已揭示'],[LogicDetectiveGame,'本題已取得推論協助'],[NonogramGame,'提示練習'],[QwirkleGame,'已揭示，本題只練習']] as const)('retains exact answer knowledge after remounting %s',(Game,label)=>{
 act(()=>root.render(<Game onBack={()=>undefined}/>));for(let n=0;n<3;n++)act(()=>host.querySelector<HTMLButtonElement>('[aria-label="取得提示"]')!.click());
 act(()=>root.unmount());root=createRoot(host);act(()=>root.render(<Game onBack={()=>undefined}/>));expect(host.textContent).toContain(label);
});
