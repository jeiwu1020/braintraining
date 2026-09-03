import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ConditionalSnapGame from '../components/ConditionalSnapGame';

describe('Conditional Snap FACILITATOR LIGHT acceptance', () => {
  it('keeps the facilitator stage viewport-bound and exposes named controls', () => {
    const markup = renderToStaticMarkup(
      <ConditionalSnapGame onBack={() => undefined} />,
    );
    const source = readFileSync(
      new URL('../components/ConditionalSnapGame.tsx', import.meta.url),
      'utf8',
    );

    expect(markup).toContain('data-conditional-snap-root="true"');
    expect(markup).toContain('data-conditional-snap-target="true"');
    expect(markup).toContain('data-conditional-snap-stage="true"');
    expect(markup).toContain('data-conditional-snap-trigger="left"');
    expect(markup).toContain('data-conditional-snap-trigger="right"');
    expect(markup).toContain('aria-label="返回遊戲選單"');
    expect(markup).toContain('aria-label="遊戲規則"');
    expect(markup).toContain('aria-label="目標類別"');
    expect(markup).toContain('aria-label="切換圖片（左側）"');
    expect(markup).toContain('aria-label="切換圖片（右側）"');

    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('max-h-[100dvh]');
    expect(source).toContain('overflow-hidden');
    expect(source).toContain('orientation: landscape');
    expect(source).toContain('max-height: 480px');
    expect(source).not.toContain('max-width: 700px');
    expect(source).not.toContain('sm:max-w-md');
    expect(source).toContain('aspect-square');
    expect(source).toContain('rounded-full');
    expect(source).toContain('min-h-11');
    expect(source).toContain('data-conditional-snap-trigger="left"');
    expect(source).toContain('data-conditional-snap-trigger="right"');
    expect(source).toContain('const handleNext');
    expect(source).toContain('soundService.playCorrect()');
    expect(source).toContain("soundService.playTone(400, 'sine', 0.1)");
  });
});
