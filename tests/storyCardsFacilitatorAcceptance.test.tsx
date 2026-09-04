import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import StoryCardsGame from '../components/StoryCardsGame';

describe('Story Cards facilitator LIGHT acceptance', () => {
  it('preserves the 4/5-card interaction model and makes touch zoom controls safe', () => {
    const normalMarkup = renderToStaticMarkup(<StoryCardsGame onBack={() => undefined} />);
    const advancedMarkup = renderToStaticMarkup(<StoryCardsGame onBack={() => undefined} isAdvanced />);
    const source = readFileSync('components/StoryCardsGame.tsx', 'utf8');

    expect((normalMarkup.match(/放大第/g) ?? [])).toHaveLength(4);
    expect((advancedMarkup.match(/放大第/g) ?? [])).toHaveLength(5);
    expect(normalMarkup).toContain('返回遊戲選單');
    expect(advancedMarkup).toContain('放大第 1 張卡');
    expect(source).toContain('setCards(getRandomCards())');
    expect(source).toContain('setZoomIndex(idx)');
    expect(source).toContain('toggleActive(idx)');
    expect(source).toContain('aria-label="關閉放大檢視"');
    expect(source).toContain('min-h-11 min-w-11');
    expect(source).toContain('min-h-11 min-w-11');
    expect(source).toContain('@media (hover: hover) and (pointer: fine)');
    expect(source).not.toContain('absolute -top-1 -right-1');
    expect(source).not.toContain('scale-105');
    expect(source).toContain('overflow-visible');
    expect(source).toContain('gap-2');
    expect(source).toContain('numCards = isAdvanced ? 5 : 4');
  });
});
