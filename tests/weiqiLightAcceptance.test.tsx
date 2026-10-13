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
  it('opens the original AI mode and full-size board controls', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        innerWidth: 640,
        innerHeight: 360,
        matchMedia: () => ({ matches: true }),
      },
    });

    const markup = renderToStaticMarkup(
      <WeiqiGame difficulty="NORMAL" onBack={() => undefined} />,
    );

    expect(markup).toContain('data-weiqi-layout="landscape"');
    expect(markup).not.toContain('短題合作');

    expect(markup).toContain('data-weiqi-mode="AI"');
    expect(markup).toContain('data-weiqi-mode="PVP"');
    expect(markup).toContain('data-weiqi-mode="PUZZLE"');
    expect(markup).toMatch(/data-weiqi-mode="AI"[^>]*aria-pressed="true"/);
    expect(markup).toContain('aria-label="人機模式"');
    expect(markup).toContain('aria-label="AB組模式"');
    expect(markup).toContain('aria-label="死活題模式"');

    expect(markup).toContain('aria-label="返回"');
    expect(markup).toContain('aria-label="9路棋盤"');
    expect(markup).toContain('aria-label="13路棋盤"');
    expect(markup).toContain('aria-label="19路棋盤"');
    expect(markup).not.toContain('確認落子');

  });
});
