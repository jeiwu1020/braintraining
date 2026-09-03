import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GuessCardGame, { applyQuestionResult, getGuessCardGridColumns, type CardType } from '../components/GuessCardGame';

const deterministicCards: CardType[] = [
  { id: 1, color: 'RED', suit: '♥', value: '3', isEliminated: false },
  { id: 2, color: 'BLACK', suit: '♠', value: '3', isEliminated: false },
  { id: 3, color: 'RED', suit: '♥', value: '4', isEliminated: false },
  { id: 4, color: 'BLACK', suit: '♠', value: '4', isEliminated: false },
];

const advancedCards: CardType[] = Array.from({ length: 52 }, (_, index) => {
  const suits = ['♥', '♦', '♠', '♣'] as const;
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suit = suits[Math.floor(index / values.length)];
  const value = values[index % values.length];
  return {
    id: index + 1,
    color: suit === '♥' || suit === '♦' ? 'RED' : 'BLACK',
    suit,
    value,
    isEliminated: false,
  };
});

describe('GuessCardGame grid-focus migration', () => {
  it('wires GuessCardGame through the grid-focus layout contract', () => {
    const markup = renderToStaticMarkup(
      <GuessCardGame
        difficulty="NORMAL"
        initialCards={deterministicCards}
        initialTargetCard={deterministicCards[0]}
        onBack={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('data-layout-region="playfield"');
    expect(markup).toContain('data-layout-region="support"');
    expect(markup).toContain('data-layout-region="feedback"');
    expect(markup).toContain('邏輯猜牌');
    expect(markup).toContain('一般');
    expect(markup).toContain('100');
    expect(markup.indexOf('data-layout-region="playfield"')).toBeLessThan(markup.indexOf('aria-label="猜測紅心3"'));
    expect(markup.indexOf('aria-label="猜測紅心3"')).toBeLessThan(markup.indexOf('data-layout-region="support"'));
  });

  it('keeps question elimination semantics in the production resolver path', () => {
    const result = applyQuestionResult(deterministicCards, true, card => card.color === 'RED');

    expect(result.map(card => [card.id, card.isEliminated])).toEqual([
      [1, false],
      [2, true],
      [3, false],
      [4, true],
    ]);
  });

  it('keeps all advanced candidates visible in a fixed 13-column playfield grid', () => {
    const markup = renderToStaticMarkup(
      <GuessCardGame
        difficulty="ADVANCED"
        initialCards={advancedCards}
        initialTargetCard={advancedCards[0]}
        onBack={() => undefined}
      />,
    );
    const playfieldStart = markup.indexOf('data-layout-region="playfield"');
    const supportStart = markup.indexOf('data-layout-region="support"');
    const playfieldMarkup = markup.slice(playfieldStart, supportStart);

    expect(getGuessCardGridColumns('NORMAL')).toBe(8);
    expect(getGuessCardGridColumns('ADVANCED')).toBe(13);
    expect(markup).toContain('data-candidate-count="52"');
    expect(markup).toContain('data-candidate-columns="13"');
    expect(markup).toContain('data-candidate-scroll="none"');
    expect((playfieldMarkup.match(/aria-label="猜測/g) ?? []).length).toBe(52);
    expect(playfieldMarkup).not.toContain('overflow-y-auto');
  });
});
