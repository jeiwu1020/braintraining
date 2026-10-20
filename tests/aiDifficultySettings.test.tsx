// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NightMarket from '../components/playground/NightMarket';
import WallRace from '../components/playground/WallRace';
import { newSession, PREFIX, replay, restore, savedSettings } from '../games/playground/session';
import * as N from '../games/playground/night-market/rules';
import * as W from '../games/playground/wall-race/rules';
import { Settings } from '../games/playground/types';

let host: HTMLDivElement, root: Root;
class WorkerStub {
  static all: WorkerStub[] = [];
  request: any; onmessage: any; onerror: any; terminated = false;
  constructor() { WorkerStub.all.push(this); }
  postMessage(request: any) { this.request = request; }
  terminate() { this.terminated = true; }
}
const click = (name: string) => {
  const b = [...host.querySelectorAll('button')].find(b => b.textContent === name || b.getAttribute('aria-label') === name);
  expect(b, name).toBeTruthy(); act(() => b!.click());
};
const mount = (game: string) => act(() => root.render(game === 'night-market' ? <NightMarket onBack={() => {}}/> : <WallRace onBack={() => {}}/>));
const remount = (game: string) => { act(() => root.unmount()); root = createRoot(host); mount(game); };
const journal = (game: string) => JSON.parse(sessionStorage.getItem(`${PREFIX}.${game}`)!);
const record = (game: string, settings: any) => ({ version: 1, game, id: 'compat', settings, seed: 42, aiSeed: 91, starter: 'A', actions: [] });
beforeEach(() => {
  sessionStorage.clear(); WorkerStub.all = [];
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('Worker', WorkerStub);
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

for (const game of ['night-market', 'wall-race'] as const) {
  describe(game, () => {
    it('defaults fresh settings to standard only for these two games', () => {
      expect(savedSettings(game)).toEqual({ mode: 'teams', level: 'normal', aiDifficulty: 'standard' });
      expect(savedSettings('garden')).toEqual({ mode: 'teams', level: 'normal' });
    });
    it('shows solo-only independent controls and preserves the choice across mode/level changes', () => {
      mount(game);
      expect(host.querySelector('[aria-label="電腦難度"]')).toBeNull();
      click('單人');
      const choices = () => host.querySelector('[aria-label="電腦難度"]')!;
      expect(choices()).toBeTruthy();
      expect(choices().querySelector('[aria-pressed="true"]')?.textContent).toBe('標準');
      click('輕鬆'); click('進階'); click('兩隊');
      expect(choices()).toBeNull();
      click('單人');
      expect(choices().querySelector('[aria-pressed="true"]')?.textContent).toBe('輕鬆');
      click('開始本局'); click('略過並開始');
      expect(journal(game).settings).toEqual({mode: 'solo', level: 'advanced', aiDifficulty: 'easy'});
      expect(host.querySelector('.game-shell__header')?.textContent).toContain('輕鬆電腦');
      click('選項'); click('重新設定…'); click('保留本局');
      expect(journal(game).settings.aiDifficulty).toBe('easy');
      click('選項'); click('重開本局…'); click('確定');
      expect(journal(game).settings.aiDifficulty).toBe('easy');
      remount(game);
      expect(journal(game).settings.aiDifficulty).toBe('easy');
      click('選項'); click('重新設定…'); click('確定');
      expect(choices().querySelector('[aria-pressed="true"]')?.textContent).toBe('輕鬆');
    });
    it.each(['normal','advanced'] as const)('does not silently migrate old %s settings or sessions', level => {
      const old = record(game, {mode:'solo', level});
      sessionStorage.setItem(`${PREFIX}.${game}`, JSON.stringify(old));
      sessionStorage.setItem(`${PREFIX}.${game}.settings`, JSON.stringify(old.settings));
      expect(savedSettings(game)).toEqual(old.settings);
      mount(game); remount(game);
      expect(journal(game)).toEqual(old);
      expect(host.querySelector('.game-shell__header')?.textContent).toContain('舊版電腦');
      click('選項'); click('重開本局…'); click('確定');
      expect(journal(game).settings).toEqual(old.settings);
      click('選項'); click('重新設定…'); click('確定');
      expect(host.textContent).toContain('沿用舊版');
      expect(host.querySelector('[aria-label="電腦難度"] [aria-pressed="true"]')).toBeNull();
      click('挑戰'); click('開始本局'); click('略過並開始');
      expect(journal(game).settings.aiDifficulty).toBe('challenge');
    });
    it.each(['easy','standard','challenge'] as const)('replays and restores %s settings without affecting rules', difficulty => {
      const engine: any = game === 'night-market'
        ? {create:N.createNight,apply:N.applyNight,validAction:(a:any)=>a?.type==='pick'}
        : {create:(_:number,l:any,t:any)=>W.createWall(l,t),apply:W.applyWall,validAction:(a:any)=>a?.type==='move'};
      const v = {...record(game, {mode:'solo',level:'advanced',aiDifficulty:difficulty}),actions:game==='night-market' ? [{type:'pick',slot:0}] : [{type:'move',to:17}]};
      const restored = restore(JSON.stringify(v),game,engine);
      expect(restored).toEqual(v);
      expect(replay(restored,engine)).toEqual(replay(v as any,engine));
      expect(replay(restored,engine)).toEqual(replay({...v,settings:{mode:'teams',level:'advanced'}} as any,engine));
    });
    it('rejects malformed AI fields instead of changing the strategy silently', () => {
      const engine:any = game==='night-market' ? {create:N.createNight,apply:N.applyNight,validAction:()=>true} : {create:(_:number,l:any,t:any)=>W.createWall(l,t),apply:W.applyWall,validAction:()=>true};
      for(const aiDifficulty of [null,'expert',2,{}])
        expect(()=>restore(JSON.stringify(record(game,{mode:'solo',level:'normal',aiDifficulty})),game,engine)).toThrow();
    });
  });
}
it('generates independent game and AI seeds and preserves optional legacy settings', () => {
  const spy=vi.spyOn(crypto,'getRandomValues').mockImplementation((array:any)=>{array[0]=17;array[1]=93;return array;});
  const s=newSession('night-market',{mode:'solo',level:'normal'});
  expect(s.seed).toBe(17); expect(s.aiSeed).toBe(93); expect(s.settings).not.toHaveProperty('aiDifficulty'); spy.mockRestore();
});
