import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import VerbalMemoryGame from '../components/VerbalMemoryGame';

describe('Verbal Memory FACILITATOR LIGHT acceptance', () => {
  it('keeps both complete grids visible in a centered, remaining-height landscape stage', () => {
    const normalMarkup = renderToStaticMarkup(
      <VerbalMemoryGame difficulty="NORMAL" onBack={() => undefined} />,
    );
    const advancedMarkup = renderToStaticMarkup(
      <VerbalMemoryGame difficulty="ADVANCED" onBack={() => undefined} />,
    );
    const source = readFileSync(
      new URL('../components/VerbalMemoryGame.tsx', import.meta.url),
      'utf8',
    );

    expect(normalMarkup).toContain('data-verbal-memory-root="true"');
    expect(normalMarkup).toContain('data-verbal-memory-main="true"');
    expect(normalMarkup).toContain('data-verbal-memory-grid="true"');
    expect(normalMarkup).toContain('data-verbal-memory-mode="NORMAL"');
    expect(advancedMarkup).toContain('data-verbal-memory-mode="ADVANCED"');
    expect(normalMarkup).toContain('aria-label="返回遊戲選單"');
    expect(normalMarkup).toContain('aria-label="重新開始"');

    expect(source).toContain('pairsCount = isAdvanced ? 10 : 8');
    expect(source).toContain('repeat(${isAdvanced ? 5 : 4}, minmax(0, 1fr))');
    expect(source).toContain('data-verbal-memory-card="true"');
    expect(source).toContain('aria-label={`第 ${index + 1} 張牌');
    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('max-h-[100dvh]');
    expect(source).toContain('min-h-0');
    expect(source).toContain('justify-center');
    expect(source).toContain('overflow-hidden');
    expect(source).not.toContain('landscape:max-w-[60vh]');
    expect(source).not.toContain('landscape:overflow-y-auto');
    expect(source).toContain('aspect-square');
    expect(source).toContain('orientation: landscape');
    expect(source).toContain('max-height: 480px');
    expect(source).toContain('500');
    expect(source).toContain('1500');
    expect(source).toContain('2000 - Math.floor(timeSeconds) * 10');
    expect(source).toContain('setIsComplete(true);');
    expect(source).toContain('aria-label="返回遊戲選單"');
    expect(source).toContain('aria-label="重新開始"');
  });
});
