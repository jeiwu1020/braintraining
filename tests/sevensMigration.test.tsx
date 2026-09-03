import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SevensCard, SevensGame, resolveSevensAnswer } from '../components/SevensGame';

const deterministicQuestion = {
  id: 901,
  type: 'extend_up' as const,
  title: '接牌測試',
  prompt: '黑桃7後面可以接哪一張？',
  boardCards: [{ suit: 'spade' as const, min: 7, max: 7 }],
  options: [
    { id: 'spade-8', suit: 'spade' as const, rank: 8, name: '黑桃8' },
    { id: 'heart-8', suit: 'heart' as const, rank: 8, name: '紅心8' },
    { id: 'spade-9', suit: 'spade' as const, rank: 9, name: '黑桃9' },
    { id: 'spade-6', suit: 'spade' as const, rank: 6, name: '黑桃6' },
  ],
  correctOptionId: 'spade-8',
  explanation: '黑桃8可接在黑桃7上方。',
  badge: '向上接牌',
};

describe('SevensGame grid-focus migration', () => {
  it('wires SevensGame through the grid-focus layout contract', () => {
    const markup = renderToStaticMarkup(<SevensGame difficulty="NORMAL" initialQuestions={[deterministicQuestion]} onBack={() => undefined} />);
    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('data-layout-region="playfield"');
    expect(markup).toContain('data-layout-region="support"');
    expect(markup).toContain('data-layout-region="feedback"');
    expect(markup).toContain('黑桃7後面可以接哪一張？');
    expect(markup.indexOf('data-layout-region="playfield"')).toBeLessThan(markup.indexOf('aria-label="選擇黑桃8"'));
    expect(markup.indexOf('aria-label="選擇黑桃8"')).toBeLessThan(markup.indexOf('data-layout-region="support"'));
  });

  it('keeps cards accessible and protects the playable-card answer result', () => {
    const markup = renderToStaticMarkup(<SevensCard card={deterministicQuestion.options[0]} onClick={() => undefined} />);
    expect(markup).toContain('aria-label="選擇黑桃8"');
    expect(markup).toContain('type="button"');
    expect(resolveSevensAnswer({ optionId: 'spade-8', correctOptionId: 'spade-8', elapsedSeconds: 2.4 })).toEqual({ isAnswered: true, isCorrect: true, earnedScore: 100 });
    expect(resolveSevensAnswer({ optionId: 'heart-8', correctOptionId: 'spade-8', elapsedSeconds: 2.4 })).toEqual({ isAnswered: true, isCorrect: false, earnedScore: 0 });
  });
});
