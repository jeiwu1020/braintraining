// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import NightMarket from '../components/playground/NightMarket';
import { applyNight, createNight, FOOD_NAMES, type NightAction } from '../games/playground/night-market/rules';
import { PREFIX } from '../games/playground/session';

let root: Root, host: HTMLDivElement;
beforeEach(() => {
  sessionStorage.clear();
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('Worker', class { postMessage() {} terminate() {} });
  host = document.createElement('div'); document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
function seedRound(round: 1 | 2) {
  let s = createNight(27, 'advanced', 'A');
  const actions: NightAction[] = [];
  for (let r = 1; r <= round; r++) {
    if (r === 2) { const a = { type: 'next-round' } as const; actions.push(a); s = applyNight(s, a); }
    for (let i = 0; i < 12; i++) { const a = { type: 'pick', slot: i % 4 } as const; actions.push(a); s = applyNight(s, a); }
  }
  const journal = { version: 1, game: 'night-market', id: 'last-pick-test', settings: { mode: 'teams', level: 'advanced' }, seed: 27, aiSeed: 2, starter: 'A', actions };
  sessionStorage.setItem(`${PREFIX}.night-market`, JSON.stringify(journal));
  return { s, journal };
}
function render() { act(() => root.render(<NightMarket onBack={() => undefined} />)); }
function click(text: string) {
  const button = [...host.querySelectorAll('button')].find(b => b.textContent === text);
  expect(button).toBeTruthy(); act(() => button!.click());
}
for (const round of [1, 2] as const) {
  it(`keeps round ${round}'s final food visible before and after deliberate score reveal`, () => {
    const { s, journal } = seedRound(round); render();
    const team = s.turn === 'A' ? 'B' : 'A';
    const food = s.hands[team].at(-1)!.food;
    expect(host.querySelector('[aria-label="最後一手"]')?.textContent).toContain(FOOD_NAMES[food]);
    expect(host.querySelector('[aria-label="最後一手"]')?.textContent).toContain(`${team} 隊`);
    expect(host.querySelector('[aria-label="最後一手"] img')?.getAttribute('src')).toContain(food);
    expect(host.querySelector('[aria-label="本輪結算"]')).toBeNull();
    expect(host.querySelectorAll('[data-market-slot]').length).toBe(0);
    click('查看結算');
    expect(host.querySelector('[aria-label="本輪結算"]')).toBeTruthy();
    expect(host.querySelector('[aria-label="最後拿取紀錄"]')?.textContent).toContain(FOOD_NAMES[food]);
    expect(JSON.parse(sessionStorage.getItem(`${PREFIX}.night-market`)!)).toEqual(journal);
    if (round === 1) {
      click('開始第 2 輪');
      expect(host.querySelector('[aria-label="最後一手"]')).toBeNull();
      expect(host.querySelectorAll('[data-market-slot]').length).toBe(4);
    }
  });
}
it('restores the final choice from the existing journal after remount without replaying a pick', () => {
  const { s, journal } = seedRound(2); render(); click('查看結算');
  act(() => root.unmount()); root = createRoot(host); render();
  expect(host.querySelector('[aria-label="最後一手"]')?.textContent).toContain(s.last);
  expect(JSON.parse(sessionStorage.getItem(`${PREFIX}.night-market`)!)).toEqual(journal);
});

it('reveals the actual final confirmed pick, keeps both final plates, and does not auto-advance', () => {
  const { journal, s } = seedRound(1);
  journal.actions.pop();
  sessionStorage.setItem(`${PREFIX}.night-market`, JSON.stringify(journal));
  render();
  act(() => (host.querySelector('[data-market-slot="3"]') as HTMLButtonElement).click());
  click('確認拿取');
  expect(host.querySelector('[aria-label="最後一手"]')?.textContent).toContain(s.last);
  expect(host.querySelector('[aria-label="A 隊餐盤"]')?.textContent).toContain('已拿 6／6');
  expect(host.querySelector('[aria-label="B 隊餐盤"]')?.textContent).toContain('已拿 6／6');
  expect(document.activeElement?.textContent).toBe('查看結算');
  expect(host.querySelector('[aria-label="本輪結算"]')).toBeNull();
  expect(JSON.parse(sessionStorage.getItem(`${PREFIX}.night-market`)!).actions).toHaveLength(12);
});

it('shows the last computer pick only after the facilitator reveals that action', () => {
  let worker: any;
  vi.stubGlobal('Worker', class {
    request: any; onmessage: any;
    constructor() { worker = this; }
    postMessage(request: any) { this.request = request; }
    terminate() {}
  });
  const { journal, s } = seedRound(1);
  journal.actions.pop();
  journal.settings.mode = 'solo';
  sessionStorage.setItem(`${PREFIX}.night-market`, JSON.stringify(journal));
  render();
  act(() => worker.onmessage({ data: { id: worker.request.id, action: { type: 'pick', slot: 3 } } }));
  expect(host.querySelector('[aria-label="最後一手"]')).toBeNull();
  click('看電腦行動');
  expect(host.querySelector('[aria-label="最後一手"]')?.textContent).toContain(s.last);
  expect(host.querySelector('[aria-label="本輪結算"]')).toBeNull();
  click('查看結算');
  expect(host.querySelector('[aria-label="最後拿取紀錄"]')?.textContent).toContain(s.last);
});

for (const level of ['normal', 'advanced'] as const) {
  it(`shows accurate hidden-deck food counts in ${level} without exposing card order`, () => {
    const { journal } = seedRound(1);
    journal.actions = journal.actions.slice(0, 5);
    journal.settings.level = level;
    sessionStorage.setItem(`${PREFIX}.night-market`, JSON.stringify(journal));
    let state = createNight(27, level, 'A');
    for (const action of journal.actions) state = applyNight(state, action);
    render();
    const row = host.querySelector('[aria-label="牌庫未翻開"]')!;
    expect(row).toBeTruthy();
    const values = [...row.querySelectorAll('b')].map(el => Number(el.textContent));
    expect(values).toEqual(['rice', 'corn', 'tofu'].map(food => state.deck.filter(c => c.food === food).length));
    expect(values.reduce((a,b) => a+b,0)).toBe(state.deck.length);
    act(() => (host.querySelector('[data-market-slot="0"]') as HTMLButtonElement).click());
    click('確認拿取');
    state = applyNight(state, {type:'pick', slot:0});
    expect([...row.querySelectorAll('b')].map(el => Number(el.textContent)))
      .toEqual(['rice', 'corn', 'tofu'].map(food => state.deck.filter(c => c.food === food).length));
  });
}

// Actual compact-viewport geometry is covered by
// docs/qa/night-market-landscape-browser.mjs (all four dishes and actions fit).
it('keeps a short settlement panel scrollable from its heading to the closing text', () => {
  const css = readFileSync('components/playground/playground.css', 'utf8');
  const summaryRule = css.match(/\.pg-night \.pg-round-summary\s*\{([^}]+)\}/)?.[1];
  expect(summaryRule).toMatch(/overflow-y:\s*auto;/);
  expect(summaryRule).toMatch(/justify-content:\s*flex-start;/);
});
