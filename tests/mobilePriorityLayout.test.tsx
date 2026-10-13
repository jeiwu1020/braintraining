// @vitest-environment jsdom
// DOM and shipped CSS contracts only. This does not claim pixel-layout coverage.
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import LogicDetectiveGame from '../components/LogicDetectiveGame';
import WordPathGame from '../components/WordPathGame';
import NimGame from '../components/NimGame';
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT = true; sessionStorage.clear(); host=document.createElement('div');document.body.append(host);root=createRoot(host); });
afterEach(() => {act(()=>root.unmount());host.remove();vi.restoreAllMocks();});
const render = (element: React.ReactNode) => act(()=>root.render(element));
const textButton = (text:string) => [...host.querySelectorAll('button')].find(b=>b.textContent===text)!;
const click = (b:Element) => act(()=>b.dispatchEvent(new MouseEvent('click',{bubbles:true})));
it('puts all detective clues in an identified primary region, separate from mode and auxiliary derivations',()=>{
 render(<LogicDetectiveGame onBack={()=>{}} difficulty="ADVANCED"/>);
 const primary=host.querySelector('[data-facilitated-primary]');
 expect(primary?.querySelectorAll('[aria-label^="線索 "]')).toHaveLength(4);
 expect(primary?.querySelector('[data-facilitated-mode-selector]')).toBeNull();
 expect(host.querySelector('[data-logic-tools]')).not.toBeNull();
 expect(host.querySelector('[data-logic-submit]')).not.toBeNull();
});
it('keeps challenge comparison with its board so clues do not follow a second table',()=>{
 render(<LogicDetectiveGame onBack={()=>{}}/>);click(textButton('挑戰'));
 expect(host.querySelector('[data-layout-region="board"] [data-logic-candidates]')).not.toBeNull();
 expect(host.querySelector('[data-facilitated-primary] [data-logic-candidates]')).toBeNull();
 expect(host.querySelectorAll('[aria-label^="線索 "]')).toHaveLength(4);
 click(textButton('排除甲案'));click(host.querySelector('[aria-label^="線索 1："]')!);
 click(textButton('確認推論'));
 expect(host.textContent).toContain('配對完成');
});
it('keeps optional path history collapsed but leaves actual targets and draft available',()=>{
 render(<WordPathGame onBack={()=>{}}/>);
 expect(host.querySelector('[data-word-path-targets]')?.closest('details')).toBeNull();
 expect(host.querySelector('details[data-word-path-history]')?.hasAttribute('open')).toBe(false);
 expect(host.querySelector('[data-word-path-draft]')?.closest('details')).toBeNull();
});
it('keeps the original Nim board while moving the existing take button to the non-scrolling control slot',()=>{
 render(<NimGame onBack={()=>{}}/>);
 expect(host.querySelectorAll('.nim-pile')).toHaveLength(3);
 expect(host.querySelector('[data-facilitated-controls]')?.textContent).toContain('確認拿取');
});
it('loads the short-landscape styles separately and gates all priority changes away from desktop',()=>{
 const css=existsSync('mobile-priority.css')?readFileSync('mobile-priority.css','utf8'):'';
 expect(css).toContain('@media (orientation: landscape) and (max-height: 480px)');
 expect(css).toContain('[data-facilitated-primary]');
 expect(css).toContain('.desktop-game--detective');
 expect(readFileSync('index.html','utf8')).toContain('href="/mobile-priority.css"');
});
it('keeps only the Nim commit action fixed when the seven-stone selection and practice text are long',()=>{
 render(<NimGame onBack={()=>{}} difficulty="ADVANCED"/>);
 click(textButton('A／B 對戰'));
 click(host.querySelector('[aria-label="取得提示"]')!);
 click(host.querySelector('[aria-label="石堆 D"]')!);
 const controls=host.querySelector('[data-facilitated-controls]')!;
 const details=host.querySelector('[data-facilitated-details]')!;
 expect(controls.contains(textButton('確認拿取 1 顆'))).toBe(true);
 expect(controls.contains(textButton('7'))).toBe(false);
 expect(details.contains(textButton('7'))).toBe(true);
 expect(details.textContent).toContain('提示練習');
 click(textButton('7'));
 expect(controls.textContent).toContain('確認拿取 7 顆');
});
