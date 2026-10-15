// @vitest-environment jsdom
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {afterEach,expect,it,vi} from 'vitest';
import {readExperienceHeight,useExperienceViewport} from '../components/experience-ui/useExperienceViewport';
import {readFileSync} from 'node:fs';
afterEach(()=>vi.unstubAllGlobals());
it('uses available visual height without shrinking a pinch-zoomed layout',()=>{
 expect(readExperienceHeight(390,{height:290,scale:1})).toBe(290);
 expect(readExperienceHeight(290,{height:390,scale:1})).toBe(290);
 expect(readExperienceHeight(390,{height:180,scale:2})).toBeNull();
 expect(readExperienceHeight(290)).toBe(290);
});
it('responds to browser chrome resize and preserves the layout while zooming',()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 const viewport=Object.assign(new EventTarget(),{height:290,scale:1});const cleanup=vi.spyOn(viewport,'removeEventListener');const windowCleanup=vi.spyOn(window,'removeEventListener');vi.stubGlobal('visualViewport',viewport);vi.stubGlobal('innerHeight',390);
 const host=document.createElement('div'),root=createRoot(host);function Probe(){return <div style={useExperienceViewport()}/>;}
 act(()=>root.render(<Probe/>));expect(host.firstElementChild?.getAttribute('style')).toContain('290px');
 act(()=>{viewport.height=240;viewport.dispatchEvent(new Event('resize'));});expect(host.firstElementChild?.getAttribute('style')).toContain('240px');
 act(()=>{viewport.height=120;viewport.scale=2;viewport.dispatchEvent(new Event('resize'));});expect(host.firstElementChild?.getAttribute('style')).toContain('240px');
 act(()=>{viewport.height=290;viewport.scale=1;viewport.dispatchEvent(new Event('resize'));});expect(host.firstElementChild?.getAttribute('style')).toContain('290px');
 act(()=>root.unmount());expect(cleanup).toHaveBeenCalledWith('resize',expect.any(Function));expect(windowCleanup).toHaveBeenCalledWith('resize',expect.any(Function));cleanup.mockRestore();windowCleanup.mockRestore();
});
it('keeps the fixes scoped, safe-area aware, readable and scrollable',()=>{
 const ll=readFileSync('components/lectures/mobile-viewport.css','utf8');
 const pg=readFileSync('components/playground/mobile-viewport.css','utf8');
 for(const css of [ll,pg]){expect(css).toContain('env(safe-area-inset-bottom');expect(css).toContain('env(safe-area-inset-left');expect(css).toContain('text-size-adjust: 100%');expect(css).toContain('overflow-y: auto');expect(css).toContain('--experience-height');}
 expect(ll).toContain('minmax(148px');expect(ll).not.toContain('74px');
 expect(pg).toContain('.pg-gallery .pg-collection');expect(pg).toContain('min-height: 140px');
});
