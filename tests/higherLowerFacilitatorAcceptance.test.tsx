import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import HigherLowerGame, {
  buildHigherLowerDeck,
  drawNextCard,
  MAX_ROUNDS,
  resolveHigherLowerRound,
  SUITS,
} from '../components/HigherLowerGame';

describe('Higher/Lower facilitator LIGHT acceptance', () => {
  it('keeps NORMAL and ADVANCED deck contracts deterministic', () => {
    expect(MAX_ROUNDS).toBe(10);
    expect(SUITS.map(suit => suit.symbol)).toEqual(['♠️', '♥️', '♦️', '♣️']);
    expect(SUITS.map(suit => suit.value)).toEqual([4, 3, 2, 1]);

    const normalDeck = buildHigherLowerDeck(false, () => 0.5);
    const advancedDeck = buildHigherLowerDeck(true, () => 0.5);

    expect(normalDeck).toHaveLength(40);
    expect(new Set(normalDeck.map(card => card.value))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    expect(normalDeck.every(card => !card.isJoker)).toBe(true);
    expect(normalDeck.every(card => card.absoluteValue === card.value * 10 + card.suitValue)).toBe(true);

    expect(advancedDeck).toHaveLength(54);
    expect(advancedDeck.filter(card => card.isJoker)).toHaveLength(2);
    expect(advancedDeck.filter(card => !card.isJoker).map(card => card.display)).toContain('A');
    expect(advancedDeck.filter(card => !card.isJoker).map(card => card.display)).toContain('J');
    expect(advancedDeck.filter(card => !card.isJoker).map(card => card.display)).toContain('Q');
    expect(advancedDeck.filter(card => !card.isJoker).map(card => card.display)).toContain('K');
    expect(advancedDeck.at(-1)?.isJoker).toBe(false);
    expect(advancedDeck.slice(-11).some(card => card.isJoker)).toBe(true);
  });

  it('preserves comparison, PASS, wrong-score, and Joker result semantics', () => {
    const current = { absoluteValue: 42, isJoker: false };
    const higher = { absoluteValue: 51, isJoker: false };
    const joker = { absoluteValue: 999, isJoker: true };

    expect(resolveHigherLowerRound(current, higher, 'HIGHER', 'PASS')).toEqual({
      aMsg: '+10', bMsg: '0 (Pass)', mainMsg: '結果是... 更大！', aDelta: 10, bDelta: 0,
    });
    expect(resolveHigherLowerRound(current, higher, 'LOWER', 'LOWER')).toEqual({
      aMsg: '-10', bMsg: '-10', mainMsg: '結果是... 更大！', aDelta: -10, bDelta: -10,
    });
    expect(resolveHigherLowerRound(current, joker, 'LOWER', 'HIGHER')).toEqual({
      aMsg: '+20', bMsg: '+20', mainMsg: '幸運鬼牌！雙方直接加20分！🎉', aDelta: 20, bDelta: 20,
    });
  });

  it('retains same-number avoidance and returns skipped cards to the deck bottom', () => {
    const card = (value: number) => ({
      value,
      suitSymbol: '♠️',
      suitValue: 4,
      color: 'text-slate-800',
      display: String(value),
      absoluteValue: value * 10 + 4,
      isJoker: false,
    });
    const result = drawNextCard([card(2), card(3), card(5)], card(5));

    expect(result.nextCard.value).toBe(3);
    expect(result.deck.map(nextCard => nextCard.value)).toEqual([5, 2]);
  });

  it('keeps the dedicated fullscreen layout and accessible facilitator controls', () => {
    const markup = renderToStaticMarkup(
      <HigherLowerGame difficulty="NORMAL" onBack={() => undefined} />,
    );
    const source = readFileSync('components/HigherLowerGame.tsx', 'utf8');
    const css = readFileSync('index.css', 'utf8');

    expect(markup).toContain('aria-label="返回遊戲選單"');
    expect(markup).toContain('aria-label="查看遊戲規則"');
    expect(markup).toContain('aria-label="重新開始"');
    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('min-h-[100dvh]');
    expect(source).toContain('max-h-[100dvh]');
    expect(source).toContain('overflow-hidden');
    expect(source).toContain('app-safe-screen');
    expect(source).toContain('data-higher-lower-root');
    expect(source).toContain('data-higher-lower-safe-stage');
    expect(source).toContain('data-higher-lower-layout');
    expect(source).toContain('data-higher-lower-header');
    expect(source).toContain('data-higher-lower-scoreboard');
    expect(source).toContain('data-higher-lower-card-stage');
    expect(source).toContain('data-higher-lower-action');
    expect(source).toContain('data-higher-lower-gameover');
    expect(source).toContain('data-higher-lower-rules');
    expect(source).toContain('A 組');
    expect(source).toContain('B 組');
    expect(source).toContain('回合');
    expect(source).toContain('上一張');
    expect(source).toContain('現在的牌');
    expect(source).toContain('開牌！');
    expect(source).toContain('下一回合');
    expect(source).toContain('查看結果');
    expect(source).toContain('再玩一次');
    expect(source).not.toContain('GameShell');
    expect(source).not.toContain('landscape:py-1');
    expect(source).toContain('aria-pressed');
    expect(source).toContain('aria-label="關閉遊戲規則"');
    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain('higher-lower-team-header');
    expect(source).toContain('higher-lower-reveal-choice');
    expect(source).toContain('higher-lower-reveal-delta');
    expect(source).toContain('higher-lower-card-group');
    expect(source).toContain('higher-lower-action-bar');
    expect(source).toContain('higher-lower-action-button--reveal');
    expect(source).toContain('higher-lower-action-button--next');
    expect(source).toContain('inline-flex');
    expect(source).toContain('whitespace-nowrap');
    expect(source).not.toContain('higher-lower-card-label absolute');

    expect(css).toContain('[data-higher-lower-root]');
    expect(css).toContain('[data-higher-lower-card-stage]');
    expect(css).toContain('[data-higher-lower-rules]');
    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(css).toContain('max-height: calc(100dvh');
    expect(css).toContain('overflow-y: auto');
    expect(css).toContain('.higher-lower-team-header');
    expect(css).toContain('.higher-lower-reveal-choice');
    expect(css).toContain('.higher-lower-action-bar');
    expect(css).toContain('white-space: nowrap');
  });
});
