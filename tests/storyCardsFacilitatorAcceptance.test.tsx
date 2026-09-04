import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import StoryCardsGame, { CARDS, generateStoryCards } from '../components/StoryCardsGame';

describe('Story Cards facilitator LIGHT acceptance', () => {
  it('preserves the 4/5-card interaction model and makes touch zoom controls safe', () => {
    const normalMarkup = renderToStaticMarkup(<StoryCardsGame onBack={() => undefined} />);
    const advancedMarkup = renderToStaticMarkup(<StoryCardsGame onBack={() => undefined} isAdvanced />);
    const source = readFileSync('components/StoryCardsGame.tsx', 'utf8');

    expect((normalMarkup.match(/放大第/g) ?? [])).toHaveLength(4);
    expect((advancedMarkup.match(/放大第/g) ?? [])).toHaveLength(5);
    expect(normalMarkup).toContain('返回遊戲選單');
    expect(advancedMarkup).toContain('放大第 1 張卡');
    expect(source).toContain('setCards(getRandomCards(cards))');
    expect(source).toContain('setZoomIndex(idx)');
    expect(source).toContain('toggleActive(idx)');
    expect(source).toContain('aria-label="關閉放大檢視"');
    expect(source).toContain('min-h-11 min-w-11');
    expect(source).toContain('min-h-11 min-w-11');
    expect(source).toContain('@media (hover: hover) and (pointer: fine)');
    expect(source).toContain('story-cards-zoom absolute top-1 left-1');
    expect(source).not.toContain('story-cards-zoom absolute top-1 right-1');
    expect(source).not.toContain('absolute -top-1 -right-1');
    expect(source).not.toContain('scale-105');
    expect(source).toContain('overflow-visible');
    expect(source).toContain('gap-2');
    expect(source).toContain('numCards = isAdvanced ? 5 : 4');
  });

  it('generates category-diverse sets and excludes the immediately previous set', () => {
    const stableRandom = () => 0.37;
    const categories = new Set(CARDS.map(card => card.type));
    const counts = [...categories].map(type => CARDS.filter(card => card.type === type).length);

    expect(CARDS).toHaveLength(60);
    expect(categories).toEqual(new Set(['人', '事', '時', '地', '物']));
    expect(counts).toEqual([12, 12, 12, 12, 12]);

    const normal = generateStoryCards({ count: 4, advanced: false, random: stableRandom });
    const advanced = generateStoryCards({ count: 5, advanced: true, random: stableRandom });

    expect(new Set(normal.map(card => card.type)).size).toBe(4);
    expect(new Set(advanced.map(card => card.type))).toEqual(new Set(['人', '事', '時', '地', '物']));
    expect(advanced.every(card => card.active === false)).toBe(true);

    const next = generateStoryCards({ count: 5, advanced: true, exclude: advanced, random: stableRandom });
    const previousKeys = new Set(advanced.map(card => `${card.type}:${card.text}`));
    expect(next.every(card => !previousKeys.has(`${card.type}:${card.text}`))).toBe(true);
  });
});
