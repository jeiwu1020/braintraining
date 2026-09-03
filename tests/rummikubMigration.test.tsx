import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  RummikubGame,
  RummikubTile,
  resolveRummikubAnswer,
} from '../components/RummikubGame';

const deterministicQuestion = {
  id: 201,
  type: 'run' as const,
  title: '同色順組測試',
  prompt: '選出可以接在紅4-紅5-紅6後面的牌',
  tableSets: [[
    { id: 'table-red-4', number: 4, color: 'red' as const },
    { id: 'table-red-5', number: 5, color: 'red' as const },
    { id: 'table-red-6', number: 6, color: 'red' as const },
  ]],
  options: [
    { id: 'option-red-7', number: 7, color: 'red' as const },
    { id: 'option-blue-7', number: 7, color: 'blue' as const },
    { id: 'option-red-8', number: 8, color: 'red' as const },
    { id: 'option-black-5', number: 5, color: 'black' as const },
  ],
  correctOptionId: 'option-red-7',
  explanation: '紅7可接在紅4-紅5-紅6後面。',
  badge: '同色順組',
};

describe('RummikubGame grid-focus migration', () => {
  it('wires RummikubGame through the grid-focus layout contract', () => {
    const markup = renderToStaticMarkup(
      <RummikubGame
        difficulty="NORMAL"
        initialQuestions={[deterministicQuestion]}
        onBack={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('data-layout-region="playfield"');
    expect(markup).toContain('data-layout-region="support"');
    expect(markup).toContain('data-layout-region="feedback"');
    expect(markup).toContain('選出可以接在紅4-紅5-紅6後面的牌');
    expect(markup.indexOf('data-layout-region="playfield"')).toBeLessThan(markup.indexOf('aria-label="選擇紅色7"'));
    expect(markup.indexOf('aria-label="選擇紅色7"')).toBeLessThan(markup.indexOf('data-layout-region="support"'));
  });

  it('keeps Rummikub answer tiles accessible and protects the answer result', () => {
    const markup = renderToStaticMarkup(
      <RummikubTile tile={{ id: 'option-red-7', number: 7, color: 'red' }} onClick={() => undefined} />,
    );

    expect(markup).toContain('aria-label="選擇紅色7"');
    expect(markup).toContain('type="button"');
    expect(resolveRummikubAnswer({ optionId: 'option-red-7', correctOptionId: 'option-red-7', elapsedSeconds: 2.4 })).toEqual({
      isAnswered: true,
      isCorrect: true,
      earnedScore: 100,
    });
    expect(resolveRummikubAnswer({ optionId: 'option-blue-7', correctOptionId: 'option-red-7', elapsedSeconds: 2.4 })).toEqual({
      isAnswered: true,
      isCorrect: false,
      earnedScore: 0,
    });
  });
});
