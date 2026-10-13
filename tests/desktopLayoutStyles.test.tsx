// @vitest-environment jsdom
// Executes the real Tailwind and desktop styles against rendered game markup.
// JSDOM cannot perform layout: these are cascade/activation checks, not pixel screenshots.
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync, existsSync } from 'node:fs';
import postcss, { type Container } from 'postcss';
import tailwind from 'tailwindcss';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import GuessCardGame from '../components/GuessCardGame';
import PyramidGame from '../components/PyramidGame';
import WordPathGame from '../components/WordPathGame';
import MatchstickGame from '../components/MatchstickGame';
import LogicDetectiveGame from '../components/LogicDetectiveGame';
import NonogramGame from '../components/NonogramGame';
import MinesweeperGame from '../components/MinesweeperGame';
import NimGame from '../components/NimGame';
import HanoiGame from '../components/HanoiGame';
import TrafficJamGame from '../components/TrafficJamGame';
import QwirkleGame from '../components/QwirkleGame';
import RummikubGame from '../components/RummikubGame';
import MahjongMeldsGame from '../components/MahjongMeldsGame';
import SevensGame from '../components/SevensGame';
import ChineseTenGame from '../components/ChineseTenGame';
import { WeiqiBoard } from '../components/WeiqiBoard';
import { createEmptyBoard } from '../services/goEngine';

type Viewport = { width: number; height: number; pointer: 'fine' | 'coarse'; hover: 'hover' | 'none' };
const desktop: Viewport = { width: 1366, height: 768, pointer: 'fine', hover: 'hover' };
// A bounded CSS media evaluator lets JSDOM exercise the shipped media rules.
// The viewport comes from each fixture, never from implementation constants.
function matches(query: string, viewport: Viewport): boolean {
  return query.split(',').some(part => {
    const features = [...part.matchAll(/\(([^:()]+):\s*([^()]+)\)/g)];
    if (!features.length) return part.trim() === 'all' || part.trim() === 'screen';
    return features.every(([, name, raw]) => {
      const value = raw.trim();
      const px = parseFloat(value) * (value.endsWith('rem') ? 16 : 1);
      switch (name.trim()) {
        case 'min-width': return viewport.width >= px;
        case 'max-width': return viewport.width <= px;
        case 'min-height': return viewport.height >= px;
        case 'max-height': return viewport.height <= px;
        case 'orientation': return value === (viewport.width > viewport.height ? 'landscape' : 'portrait');
        case 'pointer': return value === viewport.pointer;
        case 'hover': return value === viewport.hover;
        case 'display-mode': return value === 'browser';
        case 'prefers-reduced-motion': return value === 'no-preference';
        default: return false;
      }
    });
  });
}
function activeCss(css: string, viewport: Viewport): string {
  const collect = (container: Container): string => (container.nodes ?? []).map(node => {
    // JSDOM CSSOM cannot parse Tailwind's escaped empty pseudo-content selector.
    // Pseudo-elements do not participate in the game objects measured here.
    if (node.type === 'rule') return node.selector.includes('::after') || node.selector.includes('::before') ? '' : node.toString();
    if (node.type === 'atrule' && node.name === 'media') return matches(node.params, viewport) ? collect(node) : '';
    return '';
  }).join('\n');
  return collect(postcss.parse(css));
}
const onBack = vi.fn();
const fixtures = [
  ['guess-card-value', <GuessCardGame onBack={onBack} difficulty="ADVANCED"/>, '[data-candidate-grid] .guess-card-value', 'fontSize', '2rem'],
  ['guess-card-suit', <GuessCardGame onBack={onBack} difficulty="ADVANCED"/>, '[data-candidate-grid] .guess-card-suit', 'fontSize', '2.5rem'],
  ['pyramid', <PyramidGame onBack={onBack} difficulty="NORMAL" initialSession={{gameState:'PLAYING', pyramid: [[{id:'king', suit:'hearts',value:13,faceUp:true}]]}}/>, '.pyramid-card', 'width', 'var(--pyramid-card-width)'],
  ['word', <WordPathGame onBack={onBack}/>, '[data-word-path-cell="0"]', 'fontSize', '2.25rem'],
  ['matchsticks', <MatchstickGame onBack={onBack}/>, '[data-matchstick-equation] svg', 'height', '12rem'],
  ['detective', <LogicDetectiveGame onBack={onBack}/>, '[role="gridcell"] button', 'minHeight', '5rem'],
  ['nonogram', <NonogramGame onBack={onBack}/>, '[data-nonogram-cell="0"]', 'fontSize', '2rem'],
  ['mines', <MinesweeperGame onBack={onBack}/>, '[role="gridcell"] button', 'fontSize', '2rem'],
  ['nim', <NimGame onBack={onBack}/>, '[aria-label="石堆 A"] [aria-hidden] > span', 'height', '3rem'],
  ['hanoi', <HanoiGame onBack={onBack}/>, '[aria-label="1 號圓盤"]', 'fontSize', '1.5rem'],
  ['traffic', <TrafficJamGame onBack={onBack}/>, '[data-traffic-label]', 'fontSize', '1.5rem'],
  ['qwirkle', <QwirkleGame onBack={onBack}/>, '[data-qwirkle-option] svg', 'height', '3rem'],
  ['rummikub', <RummikubGame onBack={onBack}/>, 'button[aria-label^="手牌 1 "]', 'minWidth', '4.5rem'],
  ['mahjong', <MahjongMeldsGame onBack={onBack}/>, '[aria-label^="手牌 "]', 'minWidth', '5.5rem'],
  ['sevens', <SevensGame onBack={onBack}/>, '[aria-label^="手牌 "]', 'minHeight', '7.5rem'],
  ['redpoints', <ChineseTenGame onBack={onBack}/>, '[aria-label^="桌牌 "]', 'minHeight', '7.5rem'],
  ['go', <div data-weiqi-layout="standard"><WeiqiBoard board={createEmptyBoard(9)} boardSize={9} currentTurn="BLACK" lastMove={null} hoveredPoint={null} setHoveredPoint={()=>undefined} onCellClick={()=>undefined}/></div>, '.weiqi-coordinate-label', 'fontSize', '1rem'],
] as const;
let host: HTMLDivElement, root: Root, base: HTMLStyleElement, enhancement: HTMLStyleElement;
let baseCss = '', desktopCss = '';
beforeAll(async () => {
  baseCss = (await postcss([tailwind('./tailwind.config.cjs')]).process(readFileSync('index.css', 'utf8'), { from: 'index.css' })).css;
  desktopCss = existsSync('desktop-layout.css') ? readFileSync('desktop-layout.css', 'utf8') : '';
});
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  sessionStorage.clear(); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
  base = document.createElement('style'); enhancement = document.createElement('style'); document.head.append(base, enhancement);
});
afterEach(() => { act(() => root.unmount()); host.remove(); base.remove(); enhancement.remove(); vi.restoreAllMocks(); });
function render(viewport: Viewport, element: React.ReactNode) {
  base.textContent = activeCss(baseCss, viewport); enhancement.textContent = activeCss(desktopCss, viewport);
  act(() => root.render(element));
}
describe('desktop-only game readability', () => {
  it.each(fixtures)('enlarges the meaningful %s game object on a desktop', (_name, element, selector, property, expected) => {
    render(desktop, element);
    const target = host.querySelector(selector);
    expect(target, `game object ${selector}`).not.toBeNull();
    expect(getComputedStyle(target!)[property]).toBe(expected);
  });
  it.each([
    [640, 360, 'coarse', 'none'], [844, 390, 'coarse', 'none'], [932, 430, 'coarse', 'none'],
    [1200, 480, 'fine', 'hover'], [1280, 600, 'fine', 'hover'], [1024, 768, 'coarse', 'none'],
    [1366, 1024, 'coarse', 'none'], [980, 700, 'fine', 'hover'], [1100, 1300, 'fine', 'hover'],
  ] as const)('adds no desktop styles for protected %sx%s %s/%s viewports', (width, height, pointer, hover) => {
    const viewport = { width, height, pointer, hover };
    expect(activeCss(desktopCss, viewport).trim()).toBe('');
  });
  it('leaves other games outside the opt-in scope unchanged even on desktop', () => {
    render(desktop, <div className="game-shell"><h1 className="text-lg">Unchanged</h1><button className="min-h-11 text-sm">Action</button></div>);
    const button = host.querySelector('button')!;
    const withEnhancement = [getComputedStyle(button).minHeight, getComputedStyle(button).fontSize];
    enhancement.textContent = '';
    expect(withEnhancement).toEqual([getComputedStyle(button).minHeight, getComputedStyle(button).fontSize]);
  });
  it('keeps Word Path selection a draft until the existing submit action', () => {
    render(desktop, <WordPathGame onBack={onBack}/>);
    act(() => (host.querySelector('[data-word-path-cell="0"]') as HTMLButtonElement).click());
    expect(host.querySelector('[data-word-path-cell="0"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[data-word-path-progress]')?.textContent).toContain('0/4');
  });
});

// Evaluate the shipped CSS arithmetic at explicit, hand-sized board slots.
// This checks the dimensional formula; it does not claim browser layout coverage.
function cssLength(expression: string, width: number, height: number, columns: number, rows: number) {
  const numeric = expression.replace(/var\(--qwirkle-columns\)/g, String(columns)).replace(/var\(--qwirkle-rows\)/g, String(rows))
    .replace(/([0-9.]+)cqw/g, (_, n) => String(Number(n) * width / 100))
    .replace(/([0-9.]+)cqh/g, (_, n) => String(Number(n) * height / 100))
    .replace(/([0-9.]+)rem/g, (_, n) => String(Number(n) * 16))
    .replace(/calc\(/g, '(').replace(/min\(/g, 'Math.min(');
  if (!/^[0-9.,()+*\/\s-]+$/.test(numeric.replace(/Math\.min/g, ''))) throw new Error(`Unexpected CSS arithmetic: ${numeric}`);
  return Function(`return ${numeric}`)() as number;
}
describe('desktop content that can exceed its slot', () => {
  it('fits a six-tile Qwirkle row inside the actual small-desktop board slot', () => {
    render({ ...desktop, width: 1024, height: 650 }, <QwirkleGame onBack={onBack}/>);
    const next = () => [...host.querySelectorAll('button')].find(button => button.textContent === '下一題')!;
    act(() => next().click()); act(() => next().click());
    const board = host.querySelector('[data-qwirkle-board]') as HTMLElement;
    expect(board.children.length).toBe(6);
    const side = cssLength(getComputedStyle(board).getPropertyValue('--qwirkle-cell'), 626, 300, 6, 1);
    expect(side).toBeGreaterThanOrEqual(80);
    expect(6 * side + 5 * 12).toBeLessThanOrEqual(626);
    expect(getComputedStyle(board.parentElement!).containerType).toBe('size');
  });
  it('fits the three-row Qwirkle challenge without clipping its first row', () => {
    render({ ...desktop, width: 1024, height: 650 }, <QwirkleGame onBack={onBack}/>);
    const select = host.querySelector('#qwirkle-tier') as HTMLSelectElement;
    act(() => { select.value = 'CHALLENGE'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    const next = () => [...host.querySelectorAll('button')].find(button => button.textContent === '下一題')!;
    act(() => next().click()); act(() => next().click());
    const board = host.querySelector('[data-qwirkle-board]') as HTMLElement;
    expect(board.children.length).toBe(9);
    const side = cssLength(getComputedStyle(board).getPropertyValue('--qwirkle-cell'), 626, 300, 3, 3);
    expect(side).toBeGreaterThanOrEqual(80);
    expect(3 * side + 2 * 12).toBeLessThanOrEqual(300);
    expect(getComputedStyle(board.parentElement!).alignItems).toBe('safe center');
  });
  it('keeps the top of a tall Rummikub preview reachable through overflow-safe alignment', () => {
    render(desktop, <RummikubGame onBack={onBack} difficulty="ADVANCED"/>);
    const panel = host.querySelector('.tabletop-presentation')!;
    expect(getComputedStyle(panel).alignSelf).toBe('safe center');
    expect(getComputedStyle(panel).marginTop).toBe('auto');
  });
});

it('keeps the revealed Word Path title and all four rows inside a short desktop board', () => {
  render({ ...desktop, width: 1024, height: 650 }, <WordPathGame onBack={onBack}/>);
  for (let step = 0; step < 3; step++) act(() => (host.querySelector('[aria-label="取得提示"]') as HTMLButtonElement).click());
  expect(host.querySelector('[data-word-path-assistance]')).not.toBeNull();
  const panel = host.querySelector('[data-word-path-puzzle]')!;
  const cell = cssLength(getComputedStyle(panel).getPropertyValue('--desktop-cell'), 626, 520, 4, 4);
  // Three 25.2px title lines, 8px title padding, 12px panel gap,
  // 32px coordinate header, and four 6px grid gaps.
  expect(4 * cell + 151.6).toBeLessThanOrEqual(520);
  expect(getComputedStyle(panel).alignSelf).toBe('safe center');
});

// Short-height CSS is checked independently of the desktop enhancement.
describe('short-landscape information priority', () => {
  const shortCss = readFileSync('mobile-priority.css', 'utf8');
  it.each([[852,393], [640,360], [844,390], [932,430]] as const)('prioritizes clues with readable controls at %sx%s', (width,height) => {
    const viewport: Viewport = {width,height,pointer:'coarse',hover:'none'};
    render(viewport, <LogicDetectiveGame onBack={onBack} difficulty="ADVANCED"/>);
    enhancement.textContent += activeCss(shortCss,viewport);
    expect(getComputedStyle(host.querySelector('[data-facilitated-primary]')!).order).toBe('-2');
    expect(getComputedStyle(host.querySelector('[data-facilitated-mode-options]')!).order).toBe('2');
    expect(getComputedStyle(host.querySelector('[data-facilitated-controls]')!).gridColumn).toBe('1 / -1');
    expect(getComputedStyle(host.querySelector('[data-facilitated-details]')!).gridRow).toBe('1');
    expect(getComputedStyle(host.querySelector('[data-logic-submit]')!).marginTop).toBe('0px');
    for (const button of host.querySelectorAll('[data-logic-tools] button, [data-logic-submit] button')) {
      expect(getComputedStyle(button).minHeight).toBe('2.75rem');
      expect(getComputedStyle(button).fontSize).toBe('1rem');
    }
    const clue = host.querySelector('[aria-label^="線索 1："]') as HTMLButtonElement;
    clue.focus(); expect(document.activeElement).toBe(clue);
  });
  it.each([[1024,650],[1366,768],[1920,1080],[390,844]] as const)('does not activate phone-priority layout at %sx%s', (width,height) => {
    expect(activeCss(shortCss,{width,height,pointer:'fine',hover:'hover'}).trim()).toBe('');
  });
  it('bounds an expanded current status without hiding its long text', () => {
    const viewport: Viewport = {width:852,height:393,pointer:'coarse',hover:'none'};
    render(viewport,<LogicDetectiveGame onBack={onBack} difficulty="ADVANCED"/>);
    enhancement.textContent += activeCss(shortCss,viewport);
    act(() => (host.querySelector('[aria-label="取得提示"]') as HTMLButtonElement).click());
    const status=host.querySelector('[data-facilitated-turn-status]') as HTMLElement;
    expect(status.textContent!.length).toBeGreaterThan(20);
    expect(getComputedStyle(status).maxHeight).toBe('3rem');
    expect(getComputedStyle(status).overflowY).toBe('auto');
    status.focus(); expect(document.activeElement).toBe(status);
  });
});

it.each([[720,480],[940,600],[1260,800]] as const)('fits a seven-row desktop pyramid and stock in a %sx%s playfield formula', (width,height) => {
  render(desktop,<PyramidGame onBack={onBack} difficulty="NORMAL" initialSession={{gameState:'PLAYING',pyramid: [[{id:'king',suit:'hearts',value:13,faceUp:true}]]}}/>);
  const table=host.querySelector('.pyramid-table')!;
  const cardWidth=cssLength(getComputedStyle(table).getPropertyValue('--pyramid-card-width'),width,height,7,7);
  expect(cardWidth).toBeGreaterThanOrEqual(72);
  // 7 cards, six 8px gaps, a 128px stock rail, a 12px gap and 16px table padding.
  expect(7*cardWidth+48+128+12+16).toBeLessThanOrEqual(width);
  expect(4*1.4*cardWidth+24).toBeLessThanOrEqual(height);
});
it.each([[568,320],[640,320],[640,360],[852,393]] as const)('keeps Nim commit outside the seven-choice scroller at %sx%s', (width,height)=>{
  const viewport: Viewport={width,height,pointer:'coarse',hover:'none'};
  render(viewport,<NimGame onBack={onBack} difficulty="ADVANCED"/>);
  enhancement.textContent += activeCss(readFileSync('mobile-priority.css','utf8'),viewport);
  const button=(text:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===text)!;
  act(()=>button('A／B 對戰').click());
  act(()=>(host.querySelector('[aria-label="取得提示"]') as HTMLButtonElement).click());
  act(()=>(host.querySelector('[aria-label="石堆 D"]') as HTMLButtonElement).click());
  const fixed=host.querySelector('[data-facilitated-controls]')!;
  const details=host.querySelector('[data-facilitated-details]')!;
  expect(getComputedStyle(host.querySelector('.facilitated-layout--fixed-controls')!).gridTemplateColumns).toBe('minmax(0, 1fr) minmax(10rem, 0.28fr)');
  expect(getComputedStyle(host.querySelector('[aria-label="選擇拿取數量"]')!).gridTemplateColumns).toBe('repeat(auto-fit, minmax(2.75rem, 1fr))');
  expect(fixed.querySelectorAll('button')).toHaveLength(1);
  expect(fixed.contains(button('確認拿取 1 顆'))).toBe(true);
  expect(details.contains(button('7'))).toBe(true);
  expect(getComputedStyle(details).overflowY).toBe('auto');
  expect(getComputedStyle(button('確認拿取 1 顆')).minHeight).toBe('2.75rem');
  expect(getComputedStyle(host.querySelector('[data-facilitated-turn-status]')!).maxHeight).toBe('4rem');
  // Fixed region: status <=64, margin4, top padding8, border1, commit44.
  // Even the 320px guard retains space for a locally scrolling choice list.
  expect(height-56-12-12-8-(64+4+8+1+44)).toBeGreaterThan(0);
});
