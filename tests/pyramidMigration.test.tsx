import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PyramidGame, {
  canPairPyramidValues,
  isPyramidCardCovered,
  isSingleKingRemovable,
  type Card,
  type PyramidInitialSession,
} from '../components/PyramidGame';

const card = (id: string, value: number, suit: Card['suit'] = 'hearts'): Card => ({
  id,
  suit,
  value,
  faceUp: true,
});

const deterministicPyramid: (Card | null)[][] = [
  [card('top', 1)],
  [null, null],
  [null, null, null],
  [null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null, null],
  [card('bottom', 13), null, null, null, null, null, null],
];

const deterministicSession: PyramidInitialSession = {
  gameState: 'PLAYING',
  pyramid: deterministicPyramid,
  stock: [card('stock-7', 7, 'spades')],
  waste: [card('waste-12', 12, 'diamonds')],
  timerMode: 'UP',
  time: 12,
  score: 26,
};

describe('PyramidGame grid-focus migration', () => {
  it('wires the real PyramidGame through the grid-focus layout contract', () => {
    const markup = renderToStaticMarkup(
      <PyramidGame
        difficulty="NORMAL"
        initialSession={deterministicSession}
        onBack={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('data-layout-region="playfield"');
    expect(markup).toContain('data-layout-region="support"');
    expect(markup).toContain('data-layout-region="feedback"');
    expect(markup).toContain('金字塔接龍');
    expect(markup).toContain('分數');
    expect(markup).toContain('0:12');
    expect(markup).toContain('翻下一張牌');
    expect(markup).toContain('廢牌');
    expect(markup.indexOf('data-layout-region="playfield"')).toBeLessThan(markup.indexOf('aria-label="紅心 A，可選"'));
    expect(markup.indexOf('aria-label="紅心 A，可選"')).toBeLessThan(markup.indexOf('data-layout-region="support"'));
  });

  it('keeps covered-card semantics deterministic', () => {
    const smallPyramid: (Card | null)[][] = [
      [card('top', 4)],
      [card('left', 5), card('right', 8)],
    ];

    expect(isPyramidCardCovered(smallPyramid, 0, 0)).toBe(true);
    smallPyramid[1][0] = null;
    expect(isPyramidCardCovered(smallPyramid, 0, 0)).toBe(true);
    smallPyramid[1][1] = null;
    expect(isPyramidCardCovered(smallPyramid, 0, 0)).toBe(false);
  });

  it('protects the existing K and sum-to-13 pair rules', () => {
    expect(isSingleKingRemovable(13)).toBe(true);
    expect(isSingleKingRemovable(12)).toBe(false);
    expect(canPairPyramidValues(6, 7)).toBe(true);
    expect(canPairPyramidValues(1, 12)).toBe(true);
    expect(canPairPyramidValues(5, 7)).toBe(false);
  });
});
