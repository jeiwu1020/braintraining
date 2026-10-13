// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WeiqiBoard } from '../components/WeiqiBoard';
import { createEmptyBoard } from '../services/goEngine';

let host: HTMLDivElement, root: Root;
let reportSize: (width: number, height: number) => void;
let observer: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> };
const props = { board: createEmptyBoard(9), boardSize: 9, currentTurn: 'BLACK' as const, lastMove: null, hoveredPoint: null, setHoveredPoint: vi.fn(), onCellClick: vi.fn() };
const board = () => host.firstElementChild as HTMLElement;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); host.style.padding = '2px'; document.body.appendChild(host);
  vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({ width: 1260, height: 414 } as DOMRect);
  vi.stubGlobal('ResizeObserver', class {
    observe = vi.fn(); disconnect = vi.fn();
    constructor(callback: ResizeObserverCallback) {
      observer = this;
      reportSize = (width, height) => callback([{
        target: host, contentRect: new DOMRect(0, 0, width, height),
        borderBoxSize: [{ inlineSize: width + 4, blockSize: height + 4 }],
        contentBoxSize: [{ inlineSize: width, blockSize: height }],
        devicePixelContentBoxSize: [{ inlineSize: width, blockSize: height }],
      }], this as unknown as ResizeObserver);
    }
  });
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('standard Go board fits its actual content slot, not a fixed viewport subtraction', () => {
  it('keeps the entire square inside the screenshot-sized slot including coordinates and parent padding', () => {
    act(() => root.render(<WeiqiBoard {...props} />));
    expect(board().style.width).toBe('410px'); expect(board().style.height).toBe('410px');
    expect(observer.observe).toHaveBeenCalledWith(host); expect(host.querySelectorAll('[id^="go-cell-"]')).toHaveLength(81);
  });
  it.each([[1260, 414, 414], [1200, 340, 340], [1800, 760, 580], [720, 260, 260], [300, 480, 300]])('fits desktop/zoom content slots %sx%s with square side %s', (width, height, side) => {
    act(() => root.render(<WeiqiBoard {...props} />)); act(() => reportSize(width, height));
    expect(board().style.width).toBe(`${side}px`); expect(board().style.height).toBe(`${side}px`);
  });
  it('resizes when puzzle feedback grows and preserves all 19 lines, stones, and direct input', () => {
    const large = createEmptyBoard(19); large[0][0] = 'BLACK';
    act(() => root.render(<WeiqiBoard {...props} board={large} boardSize={19} />));
    act(() => reportSize(1200, 330)); expect(board().style.height).toBe('330px');
    act(() => reportSize(1200, 460)); expect(board().style.width).toBe('460px');
    expect(host.querySelectorAll('[id^="go-cell-"]')).toHaveLength(361); expect(host.querySelector('[data-go-stone="BLACK"]')).toBeTruthy();
    act(() => (host.querySelector('#go-cell-18-18') as HTMLButtonElement).click()); expect(props.onCellClick).toHaveBeenCalledWith(18, 18);
  });
  it('does not overflow a temporarily collapsed content slot and recovers on expansion', () => {
    act(() => root.render(<WeiqiBoard {...props} />)); act(() => reportSize(1200, 0));
    expect(board().style.height).toBe('0px'); act(() => reportSize(1200, 410)); expect(board().style.height).toBe('410px');
  });
  it('measures on resize even when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined); act(() => root.render(<WeiqiBoard {...props} />));
    expect(board().style.width).toBe('410px');
    vi.mocked(host.getBoundingClientRect).mockReturnValue({ width: 1000, height: 304 } as DOMRect);
    act(() => window.dispatchEvent(new Event('resize'))); expect(board().style.width).toBe('300px');
  });
  it('disconnects the observer when leaving the board', () => {
    act(() => root.render(<WeiqiBoard {...props} />)); const current = observer; act(() => root.render(<div />)); expect(current.disconnect).toHaveBeenCalledOnce();
  });
  it('does not alter the existing compact phone landscape sizing or add an observer', () => {
    act(() => root.render(<WeiqiBoard {...props} isLandscapeCompact />));
    expect(board().style.width).toContain('100vw - 280px');
    expect(board().style.width).toContain('100dvh - 12px');
    expect(board().style.height).toBe(board().style.width);
  });
});
