// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NightMarket from '../components/playground/NightMarket';
import WallRace from '../components/playground/WallRace';
import { chooseNight } from '../games/playground/night-market/ai';
import * as N from '../games/playground/night-market/rules';
import { chooseWall, fallbackWall } from '../games/playground/wall-race/ai';
import * as W from '../games/playground/wall-race/rules';
import { PREFIX, replay, restore, type SavedSession } from '../games/playground/session';
import type { AiDifficulty, Level } from '../games/playground/types';

type Game = 'night-market' | 'wall-race';
type Action = N.NightAction | W.WallAction;
let host: HTMLDivElement, root: Root;

// The worker transport is controlled, while every returned move uses the real AI.
class WorkerHarness {
  static all: WorkerHarness[] = [];
  static throws = false;
  request: any;
  onmessage?: (event: any) => void;
  onerror?: (event: any) => void;
  terminated = false;
  constructor() {
    if (WorkerHarness.throws) throw new Error('worker unavailable');
    WorkerHarness.all.push(this);
  }
  postMessage(request: any) { this.request = request; }
  terminate() { this.terminated = true; }
  respond(action: Action) { act(() => this.onmessage?.({ data: { id: this.request.id, action } })); }
}

beforeEach(() => {
  sessionStorage.clear();
  WorkerHarness.all = []; WorkerHarness.throws = false;
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('Worker', WorkerHarness);
  // Fake only the watchdog, keeping the chooser's work bounded by its node budget.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  vi.spyOn(performance, 'now').mockReturnValue(0);
  host = document.createElement('div'); document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount()); host.remove();
  vi.restoreAllMocks(); vi.useRealTimers(); vi.unstubAllGlobals();
});

function button(text: string) {
  const found = [...host.querySelectorAll('button')].find(b => b.textContent === text);
  expect(found, text).toBeTruthy();
  return found!;
}
function click(text: string) { act(() => button(text).click()); }
function mount(game: Game) {
  act(() => root.render(game === 'night-market' ? <NightMarket onBack={() => {}} /> : <WallRace onBack={() => {}} />));
}
function remount(game: Game) { act(() => root.unmount()); root = createRoot(host); mount(game); }
function saved(game: Game): SavedSession<any> { return JSON.parse(sessionStorage.getItem(`${PREFIX}.${game}`)!); }
function store(value: SavedSession<any>) { sessionStorage.setItem(`${PREFIX}.${value.game}`, JSON.stringify(value)); }
function latestWorker() { return WorkerHarness.all.at(-1)!; }
function firstAction(game: Game): Action {
  return game === 'night-market' ? { type: 'pick', slot: 0 } : { type: 'move', to: 17 };
}
function record(game: Game, level: Level, difficulty?: AiDifficulty): SavedSession<any> {
  return {
    version: 1, game, id: 'ai-lifecycle',
    settings: { mode: 'solo', level, ...(difficulty === undefined ? {} : { aiDifficulty: difficulty }) },
    seed: 27, aiSeed: 0xf1234567, starter: 'A', actions: [firstAction(game)],
  };
}
function engine(game: Game): any {
  return game === 'night-market'
    ? { create: N.createNight, apply: N.applyNight, validAction: (a: any) => a?.type === 'pick' || a?.type === 'next-round' }
    : { create: (_: number, level: Level, starter: 'A' | 'B') => W.createWall(level, starter), apply: W.applyWall, validAction: (a: any) => a?.type === 'move' || a?.type === 'wall' };
}
function state(value: SavedSession<any>): any { return replay(value, engine(value.game as Game)).at(-1)!; }
function seed(value: SavedSession<any>) {
  const s = state(value);
  return value.game === 'night-market'
    ? (value.aiSeed ^ (s.round * 97) ^ s.picks) >>> 0
    : (value.aiSeed + s.ply) >>> 0;
}
function realWorkerAction(game: Game, request: any): Action {
  if (game === 'night-market') return { type: 'pick', slot: chooseNight(request.observation, request.seed, request.difficulty) };
  // A fixed node budget and clock remove machine speed from iterative deepening.
  return chooseWall(request.state, undefined, 250, request.options).action;
}
function backup(value: SavedSession<any>): Action {
  const s = state(value), difficulty = value.settings.aiDifficulty;
  return value.game === 'night-market'
    ? { type: 'pick', slot: difficulty === undefined ? s.market.findIndex(Boolean) : chooseNight(N.observeNight(s), seed(value), difficulty) }
    : fallbackWall(s, { difficulty, seed: seed(value) });
}
function humanFirst(game: Game) {
  const cell = host.querySelector(game === 'night-market' ? '[data-market-slot="0"]' : '[data-cell="C4"]') as HTMLButtonElement;
  expect(cell).toBeTruthy(); act(() => cell.click());
  click(game === 'night-market' ? '確認拿取' : '確認走棋');
}
function assertPayload(game: Game, value: SavedSession<any>, request: any) {
  expect(request.id).toBe(`${value.id}:${value.actions.length}`);
  if (game === 'night-market') {
    expect(request.seed).toBe(seed(value));
    expect(request.difficulty).toBe(value.settings.aiDifficulty);
    expect(request.observation).toEqual(N.observeNight(state(value)));
    expect(request.observation).not.toHaveProperty('seed');
    expect(request.observation).not.toHaveProperty('deck');
    expect(request.observation).not.toHaveProperty('aiDifficulty');
  } else {
    expect(request.options).toEqual({ difficulty: value.settings.aiDifficulty, seed: seed(value) });
    expect(request.state).toEqual(state(value));
    expect(request.state).not.toHaveProperty('aiDifficulty');
  }
  expect(seed(value)).not.toBe(value.seed);
}
function equivalentBoardSeeds(game: Game, level: Level): [number, number] {
  if (game === 'wall-race') return [1, 2];
  const seen = new Map<string, number>();
  for (let boardSeed = 1; boardSeed <= 5000; boardSeed++) {
    const key = JSON.stringify(N.observeNight(N.createNight(boardSeed, level, 'B')));
    const previous = seen.get(key);
    if (previous !== undefined) return [previous, boardSeed];
    seen.set(key, boardSeed);
  }
  throw new Error('No equivalent public opening found');
}

for (const game of ['night-market', 'wall-race'] as const) {
  describe(`${game} AI lifecycle`, () => {
    for (const level of ['normal', 'advanced'] as const) {
      it(`${level}: identical public positions use the AI seed independently of the board seed`, () => {
        const [firstSeed, secondSeed] = equivalentBoardSeeds(game, level);
        expect(firstSeed).not.toBe(secondSeed);
        for (const difficulty of ['easy', 'standard', 'challenge'] as const) {
          const value = { ...record(game, level, difficulty), seed: firstSeed, starter: 'B' as const, actions: [] };
          act(() => root.unmount()); root = createRoot(host); store(value); mount(game);
          const firstRequest = latestWorker().request;
          const firstChoice = realWorkerAction(game, firstRequest);
          assertPayload(game, value, firstRequest);
          const changedBoardSeed = { ...value, seed: secondSeed };
          act(() => root.unmount()); root = createRoot(host); store(changedBoardSeed); mount(game);
          assertPayload(game, changedBoardSeed, latestWorker().request);
          expect(latestWorker().request).toEqual(firstRequest);
          expect(realWorkerAction(game, latestWorker().request)).toEqual(firstChoice);
          if (game === 'night-market') expect(state(value).deck).not.toEqual(state(changedBoardSeed).deck);
        }
      });

      for (const difficulty of ['easy', 'standard', 'challenge'] as const) {
        const label = `${level}/${difficulty}`;

        it(`${label}: sends the independent AI seed and policy, and waits for an explicit reveal`, () => {
          const value = record(game, level, difficulty); store(value); mount(game);
          const worker = latestWorker(); assertPayload(game, value, worker.request);
          expect(button('看電腦行動').disabled).toBe(true);
          const action = realWorkerAction(game, worker.request);
          expect(() => engine(game).apply(state(value), action)).not.toThrow();
          worker.respond(action);
          expect(worker.terminated).toBe(true);
          expect(saved(game)).toEqual(value);
          expect(button('看電腦行動').disabled).toBe(false);
          act(() => vi.advanceTimersByTime(2500));
          expect(saved(game)).toEqual(value);
          click('看電腦行動');
          expect(saved(game).actions).toEqual([...value.actions, action]);
          const restored = restore(JSON.stringify(saved(game)), game, engine(game));
          expect(state(restored)).toEqual(engine(game).apply(state(value), action));
          remount(game);
          expect(state(saved(game))).toEqual(state(restored));
        });

        for (const failure of ['constructor', 'error', 'timeout'] as const) {
          it(`${label}: ${failure} fallback uses the selected policy and seed without auto-playing`, () => {
            const value = record(game, level, difficulty), action = backup(value);
            store(value); WorkerHarness.throws = failure === 'constructor'; mount(game);
            if (failure === 'error') act(() => latestWorker().onerror?.({}));
            if (failure === 'timeout') act(() => vi.advanceTimersByTime(2000));
            expect(host.textContent).toContain('使用合法備用選擇');
            expect(saved(game)).toEqual(value);
            expect(button('看電腦行動').disabled).toBe(false);
            click('看電腦行動');
            expect(saved(game).actions).toEqual([...value.actions, action]);
            expect(state(saved(game))).toEqual(engine(game).apply(state(value), action));
          });
        }

        it(`${label}: remount and undo reproduce the same choice at the same position`, () => {
          const value = record(game, level, difficulty); store(value); mount(game);
          const request = latestWorker().request, action = realWorkerAction(game, request);
          latestWorker().respond(action);
          remount(game);
          expect(latestWorker().request).toEqual(request);
          expect(button('看電腦行動').disabled).toBe(true);
          const remounted = realWorkerAction(game, latestWorker().request);
          expect(remounted).toEqual(action); latestWorker().respond(remounted); click('看電腦行動');
          click('撤回');
          expect(saved(game).actions).toEqual([]);
          expect(saved(game).aiSeed).toBe(value.aiSeed);
          humanFirst(game);
          expect(latestWorker().request).toEqual(request);
          const replayed = realWorkerAction(game, latestWorker().request);
          expect(replayed).toEqual(action); latestWorker().respond(replayed); click('看電腦行動');
          expect(saved(game).actions).toEqual([...value.actions, action]);
        });

        it(`${label}: ignores an undone worker even when the position token is reused`, () => {
          const value = record(game, level, difficulty); store(value); mount(game);
          const stale = latestWorker(), action = backup(value);
          click('撤回');
          expect(stale.terminated).toBe(true); expect(saved(game).actions).toEqual([]);
          humanFirst(game);
          const current = latestWorker();
          expect(current).not.toBe(stale); expect(current.request.id).toBe(stale.request.id);
          stale.respond(action);
          act(() => stale.onerror?.({}));
          expect(button('看電腦行動').disabled).toBe(true);
          expect(saved(game)).toEqual(value);
          current.respond(action); click('看電腦行動');
          expect(saved(game).actions).toEqual([...value.actions, action]);
        });

        it(`${label}: reset cancels a pending worker and ignores its later reply`, () => {
          const value = record(game, level, difficulty); store(value); mount(game);
          const stale = latestWorker(), action = backup(value);
          click('選項'); click('重開本局…'); click('確定');
          const reset = saved(game);
          expect(reset.id).not.toBe(value.id); expect(reset.settings).toEqual(value.settings);
          expect(reset.actions).toEqual([]); expect(stale.terminated).toBe(true);
          stale.respond(action); act(() => stale.onerror?.({}));
          act(() => vi.advanceTimersByTime(2000));
          expect(saved(game)).toEqual(reset);
          expect([...host.querySelectorAll('button')].some(b => b.textContent === '看電腦行動')).toBe(false);
        });
      }

      it(`${level}: legacy sessions keep an absent difficulty through worker errors and remount`, () => {
        const value = record(game, level); store(value); mount(game);
        const request = latestWorker().request;
        if (game === 'night-market') expect(request.difficulty).toBeUndefined();
        else expect(request.options?.difficulty).toBeUndefined();
        act(() => latestWorker().onerror?.({}));
        expect(saved(game).settings).not.toHaveProperty('aiDifficulty');
        click('看電腦行動');
        expect(saved(game).actions).toEqual([...value.actions, backup(value)]);
        remount(game);
        expect(saved(game).settings).not.toHaveProperty('aiDifficulty');
        expect(host.querySelector('.game-shell__header')?.textContent).toContain('舊版電腦');
      });
    }

    it.each(['easy', 'standard', 'challenge'] as const)('another game preserves %s and gets a fresh AI seed', difficulty => {
      const value = record(game, 'advanced', difficulty); value.actions = [];
      if (game === 'night-market') {
        for (let round = 1; round <= 2; round++) {
          if (round === 2) value.actions.push({ type: 'next-round' });
          for (let pick = 0; pick < 12; pick++) value.actions.push({ type: 'pick', slot: pick % 4 });
        }
      } else {
        value.actions = [17, 3, 12, 8, 7, 13, 2].map(to => ({ type: 'move', to }));
      }
      expect(state(value).phase).toBe('finished'); store(value); mount(game);
      if (game === 'night-market') click('查看結算');
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((array: any) => { array[0] = 111; array[1] = 222; return array; });
      click('再玩一局');
      expect(saved(game).settings).toEqual(value.settings);
      expect(saved(game).starter).toBe('B');
      expect(saved(game).aiSeed).toBe(222); expect(saved(game).aiSeed).not.toBe(value.aiSeed);
      expect(saved(game).actions).toEqual([]);
      assertPayload(game, saved(game), latestWorker().request);
    });
  });
}
