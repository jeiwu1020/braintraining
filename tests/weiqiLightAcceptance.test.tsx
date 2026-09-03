import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { WeiqiGame } from '../components/WeiqiGame';

const originalWindow = globalThis.window;

afterEach(() => {
  if (originalWindow) {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  } else {
    Reflect.deleteProperty(globalThis, 'window');
  }
});

describe('Weiqi LIGHT acceptance', () => {
  it('keeps the specialized compact landscape layout and three-mode control model', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        innerWidth: 640,
        innerHeight: 360,
        matchMedia: () => ({ matches: true }),
      },
    });

    const markup = renderToStaticMarkup(
      <WeiqiGame difficulty="NORMAL" onBack={() => undefined} />,
    );

    expect(markup).toContain('data-weiqi-layout="landscape"');
    expect(markup).not.toContain('data-game-mode-selector');

    expect(markup).toContain('data-weiqi-mode="AI"');
    expect(markup).toContain('data-weiqi-mode="PVP"');
    expect(markup).toContain('data-weiqi-mode="PUZZLE"');
    expect(markup).toMatch(/data-weiqi-mode="AI"[^>]*aria-pressed="true"/);
    expect(markup).toContain('aria-label="人機模式"');
    expect(markup).toContain('aria-label="AB組模式"');
    expect(markup).toContain('aria-label="死活題模式"');

    expect(markup).toContain('aria-label="返回"');
    expect(markup).toContain('aria-label="遊戲規則"');
    expect(markup).toContain('aria-label="重新開始"');
    expect(markup).toContain('aria-label="悔棋"');
    expect(markup).toContain('aria-label="虛手"');
    expect(markup).toContain('aria-label="形勢估算"');
    expect(markup).toContain('aria-label="認輸"');
    expect(markup).toContain('data-weiqi-board-size="9"');
    expect(markup).toContain('data-weiqi-difficulty="NORMAL"');
  });
});
