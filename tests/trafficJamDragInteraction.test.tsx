// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrafficJamGame from '../components/TrafficJamGame';

let host: HTMLDivElement;
let root: Root;
let captures: Map<Element, number>;
const originalCapture = ['setPointerCapture', 'hasPointerCapture', 'releasePointerCapture'].map(name => Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  captures = new Map();
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', { configurable: true, value: function (id: number) { captures.set(this, id); } });
  Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', { configurable: true, value: function (id: number) { return captures.get(this) === id; } });
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', { configurable: true, value: function () { captures.delete(this); } });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    const [row, col] = (this.getAttribute('data-traffic-cell') ?? '0,0').split(',').map(Number);
    return { x: col * 40, y: row * 40, left: col * 40, top: row * 40, right: col * 40 + 38, bottom: row * 40 + 38, width: 38, height: 38, toJSON: () => ({}) };
  });
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
  act(() => root.render(<TrafficJamGame onBack={() => undefined} />));
  // Keep pointer regressions on the unchanged two-move introductory fixture.
  const tier = host.querySelector('select[aria-label="塞車關卡難度"]') as HTMLSelectElement;
  act(() => { tier.value = 'BEGINNER'; tier.dispatchEvent(new Event('change', { bubbles: true })); });
});
afterEach(() => {
  act(() => root.unmount()); host.remove(); vi.restoreAllMocks();
  ['setPointerCapture', 'hasPointerCapture', 'releasePointerCapture'].forEach((name, index) => {
    const original = originalCapture[index];
    if (original) Object.defineProperty(HTMLElement.prototype, name, original);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
  });
});
const car = (id: string) => host.querySelector(`[data-traffic-car="${id}"]`) as HTMLButtonElement;
const byText = (text: string) => [...host.querySelectorAll('button')].find(item => item.textContent === text)!;
const click = (element: Element) => act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
const pointer = (target: Element | Window, type: string, x: number, y: number, id = 1, primary = true, pointerType = 'touch') => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: type === 'pointerup' ? 0 : 1 });
  Object.defineProperties(event, { pointerId: { value: id }, pointerType: { value: pointerType }, isPrimary: { value: primary } });
  act(() => target.dispatchEvent(event));
};
const drag = (id: string, dx: number, dy: number) => {
  const target = car(id); pointer(target, 'pointerdown', 100, 100); pointer(target, 'pointermove', 100 + dx, 100 + dy); pointer(target, 'pointerup', 100 + dx, 100 + dy);
};
const steps = () => host.querySelector('[data-traffic-steps]')?.textContent;

describe('traffic pointer drag interaction', () => {
  it('follows the car axis live, snaps on release and advances exactly one team', () => {
    click(byText('A／B 分組'));
    const target = car('B'); pointer(target, 'pointerdown', 100, 100); pointer(target, 'pointermove', 170, 174);
    expect(target.style.transform).toBe('translateY(74px)');
    expect(steps()).toContain('策略步數：0');
    expect(host.querySelector('[data-traffic-preview]')?.getAttribute('aria-label')).toContain('D4～D6');
    expect(byText('確認整步').disabled).toBe(true);
    pointer(target, 'pointerup', 170, 174); pointer(target, 'pointerup', 170, 174);
    expect(car('B').getAttribute('aria-label')).toContain('D4～D6');
    expect(steps()).toContain('策略步數：1');
    expect(host.textContent).toMatch(/目前[： ]B 組/);
    expect(captures.size).toBe(0);
  });
  it('clamps at blockers and boundaries, then shares completion scoring and undo', () => {
    click(byText('A／B 分組'));
    drag('X', 999, 0); expect(steps()).toContain('策略步數：0');
    drag('B', 0, 999); expect(steps()).toContain('策略步數：1');
    drag('X', 999, 0); expect(steps()).toContain('策略步數：2');
    expect(host.textContent).toContain('B 組 1 分');
    click(host.querySelector('[aria-label="復原上一步"]')!);
    expect(host.textContent).toContain('B 組 0 分');
    expect(car('X').getAttribute('aria-label')).toContain('B3～C3');
    expect(steps()).toContain('策略步數：1');
  });
  it('ignores perpendicular motion, taps and releases within half a cell', () => {
    drag('B', 80, 0); drag('B', 0, 0); drag('B', 0, 19);
    expect(steps()).toContain('策略步數：0');
    expect(car('B').getAttribute('aria-label')).toContain('D2～D4');
    drag('B', 0, 20);
    expect(steps()).toContain('策略步數：1');
    expect(car('B').getAttribute('aria-label')).toContain('D3～D5');
  });
  it.each(['pointercancel', 'lostpointercapture', 'blur', 'resize', 'Escape'])('cancels %s without applying or retaining a command', type => {
    const target = car('B'); pointer(target, 'pointerdown', 100, 100); pointer(target, 'pointermove', 100, 180);
    expect(host.querySelector('[data-traffic-preview]')).not.toBeNull();
    if (type === 'blur' || type === 'resize') act(() => window.dispatchEvent(new Event(type)));
    else if (type === 'Escape') act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    else pointer(target, type, 100, 180);
    pointer(target, 'pointerup', 100, 180);
    expect(steps()).toContain('策略步數：0');
    expect(car('B').getAttribute('aria-label')).toContain('D2～D4');
    expect(host.querySelector('[data-traffic-preview]')).toBeNull();
    expect(byText('確認整步').disabled).toBe(true);
    expect(captures.size).toBe(0);
  });
  it('cancels on a second finger even when it starts outside the car', () => {
    const target = car('B'); pointer(target, 'pointerdown', 100, 100); pointer(target, 'pointermove', 100, 180);
    expect(host.querySelector('[data-traffic-preview]')).not.toBeNull();
    pointer(host, 'pointerdown', 400, 100, 2, false);
    pointer(target, 'pointerup', 100, 180);
    expect(steps()).toContain('策略步數：0');
    expect(host.querySelector('[data-traffic-preview]')).toBeNull();
    expect(captures.size).toBe(0);
  });
  it.each(['pen', 'mouse'])('cancels mixed primary touch + %s without starting a replacement drag', pointerType => {
    pointer(car('B'), 'pointerdown', 100, 100, 1, true, 'touch');
    pointer(car('B'), 'pointermove', 100, 180, 1, true, 'touch');
    expect(host.querySelector('[data-traffic-preview]')).not.toBeNull();
    pointer(car('X'), 'pointerdown', 100, 100, 2, true, pointerType);
    pointer(car('X'), 'pointermove', 60, 100, 2, true, pointerType);
    pointer(car('X'), 'pointerup', 60, 100, 2, true, pointerType);
    pointer(car('B'), 'pointerup', 100, 180, 1, true, 'touch');
    expect(steps()).toContain('策略步數：0');
    expect(car('X').getAttribute('aria-label')).toContain('B3～C3');
    expect(car('B').getAttribute('aria-label')).toContain('D2～D4');
    expect(host.querySelector('[data-traffic-preview]')).toBeNull();
    expect(captures.size).toBe(0);
    // A genuinely new gesture remains usable after both canceled pointers finish.
    drag('B', 0, 80);
    expect(steps()).toContain('策略步數：1');
  });
  it('keeps later primary-pen attempts canceled until the original touch is released', () => {
    pointer(car('B'), 'pointerdown', 100, 100, 1, true, 'touch');
    pointer(car('B'), 'pointermove', 100, 180, 1, true, 'touch');
    for (let attempt = 0; attempt < 2; attempt += 1) {
      pointer(car('X'), 'pointerdown', 100, 100, 2, true, 'pen');
      pointer(car('X'), 'pointermove', 60, 100, 2, true, 'pen');
      pointer(car('X'), 'pointerup', 60, 100, 2, true, 'pen');
      expect(steps()).toContain('策略步數：0');
    }
    pointer(car('B'), 'pointerup', 100, 180, 1, true, 'touch');
    drag('B', 0, 80);
    expect(steps()).toContain('策略步數：1');
  });
  it('does not start a gesture for a non-primary pointer', () => {
    const target = car('B'); pointer(target, 'pointerdown', 100, 100, 2, false); pointer(target, 'pointermove', 100, 180, 2, false); pointer(target, 'pointerup', 100, 180, 2, false);
    expect(steps()).toContain('策略步數：0');
    expect(captures.size).toBe(0);
  });
  it('leaves the board untouched if pointer capture is unavailable', () => {
    Object.defineProperty(car('B'), 'setPointerCapture', { value: () => { throw new Error('Capture unavailable'); }, configurable: true });
    drag('B', 0, 80);
    expect(steps()).toContain('策略步數：0');
    expect(car('B').getAttribute('aria-label')).toContain('D2～D4');
    expect(host.querySelector('[data-traffic-preview]')).toBeNull();
  });
  it('leaves touch scrolling enabled outside the car and releases capture on unmount', () => {
    expect(car('B').style.touchAction).toBe('none');
    expect(host.querySelector<HTMLElement>('[data-layout-region="sidebar"]')!.style.touchAction).not.toBe('none');
    pointer(car('B'), 'pointerdown', 100, 100);
    expect(captures.size).toBe(1);
    act(() => root.render(null));
    expect(captures.size).toBe(0);
  });
});

it('starts release settling at the same visible pixel position after changing grid coordinates',()=>{
 const animations:Array<{frames:Keyframe[]; options:KeyframeAnimationOptions|number|undefined}>=[];
 const original=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'animate');
 Object.defineProperty(HTMLElement.prototype,'animate',{configurable:true,value:function(frames:Keyframe[],options:KeyframeAnimationOptions){animations.push({frames,options});return {cancel:()=>undefined};}});
 try{
  const target=car('B');pointer(target,'pointerdown',100,100);pointer(target,'pointermove',100,174);pointer(target,'pointerup',100,174);
  expect(target.getAttribute('aria-label')).toContain('D4～D6');expect(animations).toHaveLength(1);
  expect(animations[0].frames).toEqual([{transform:'translateY(-6px)'},{transform:'translateY(0px)'}]);
  expect(steps()).toContain('策略步數：1');
 }finally{if(original)Object.defineProperty(HTMLElement.prototype,'animate',original);else delete (HTMLElement.prototype as any).animate;}
});
it('settles a sub-half-cell release back without recording a move and shows a distinct labeled target car',()=>{
 const frames:Keyframe[][]=[];const original=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'animate');
 Object.defineProperty(HTMLElement.prototype,'animate',{configurable:true,value:function(k:Keyframe[]){frames.push(k);return {cancel:()=>undefined};}});
 try{drag('B',0,19);expect(frames[0]).toEqual([{transform:'translateY(19px)'},{transform:'translateY(0px)'}]);expect(steps()).toContain('策略步數：0');expect(car('X').querySelector('[data-traffic-target]')?.textContent).toContain('目標');expect(car('X').querySelector('[data-traffic-label]')?.textContent).toBe('X');expect(car('B').querySelectorAll('[data-traffic-window]').length).toBe(2);}
 finally{if(original)Object.defineProperty(HTMLElement.prototype,'animate',original);else delete (HTMLElement.prototype as any).animate;}
});
it('cancels an unfinished settle before undo and respects reduced motion',()=>{
 const cancel=vi.fn(),animate=vi.fn(()=>({cancel}));const oldAnimate=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'animate');const oldMedia=Object.getOwnPropertyDescriptor(window,'matchMedia');
 Object.defineProperty(HTMLElement.prototype,'animate',{configurable:true,value:animate});
 Object.defineProperty(window,'matchMedia',{configurable:true,value:()=>({matches:false})});
 try{drag('B',0,74);expect(animate).toHaveBeenCalledTimes(1);click(host.querySelector('[aria-label="復原上一步"]')!);expect(cancel).toHaveBeenCalledTimes(1);expect(car('B').getAttribute('aria-label')).toContain('D2～D4');Object.defineProperty(window,'matchMedia',{configurable:true,value:()=>({matches:true})});drag('B',0,74);expect(animate).toHaveBeenCalledTimes(1);expect(steps()).toContain('策略步數：1');}
 finally{if(oldAnimate)Object.defineProperty(HTMLElement.prototype,'animate',oldAnimate);else delete (HTMLElement.prototype as any).animate;if(oldMedia)Object.defineProperty(window,'matchMedia',oldMedia);else delete (window as any).matchMedia;}
});
