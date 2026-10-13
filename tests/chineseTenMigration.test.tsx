import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChineseTenGame, PlayingCard, createCard, resolveChineseTenAnswer } from '../components/ChineseTenGame';

const deterministicQuestion = {
  id: 1201,
  type: 'match' as const,
  title: '湊十測試',
  prompt: '桌面有方塊7，手牌哪一張能湊十？',
  tableCards: [createCard('table-diamond-7', 'diamond', 7), createCard('table-club-4', 'club', 4)],
  options: [createCard('option-heart-3', 'heart', 3), createCard('option-heart-7', 'heart', 7), createCard('option-club-2', 'club', 2), createCard('option-spade-6', 'spade', 6)],
  correctOptionId: 'option-heart-3',
  explanation: '紅心3與方塊7湊成10。',
  badge: '湊十配對',
};

describe('ChineseTenGame facilitated migration', () => {
  it('wires ChineseTenGame through the board-sidebar layout contract', () => {
    const markup = renderToStaticMarkup(<ChineseTenGame difficulty="NORMAL" initialQuestions={[deterministicQuestion]} onBack={() => undefined} />);
    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="board-sidebar"');
    expect(markup).toContain('data-layout-region="board"');
    expect(markup).toContain('data-layout-region="sidebar"');
    expect(markup).toContain('data-facilitated-controls="true"');
    expect(markup).toContain('桌面有方塊7，手牌哪一張能湊十？');
    expect(markup.indexOf('data-layout-region="board"')).toBeLessThan(markup.indexOf('aria-label="手牌 紅心3"'));
    expect(markup.indexOf('aria-label="手牌 紅心3"')).toBeLessThan(markup.indexOf('data-layout-region="sidebar"'));
  });

  it('keeps answer cards accessible and protects the production answer resolver', () => {
    const card = createCard('option-heart-3', 'heart', 3);
    const markup = renderToStaticMarkup(<PlayingCard card={card} onClick={() => undefined} />);
    expect(markup).toContain('aria-label="選擇紅心3"');
    expect(markup).toContain('type="button"');
    expect(resolveChineseTenAnswer({ optionId: 'option-heart-3', correctOptionId: 'option-heart-3', elapsedSeconds: 2.4 })).toEqual({ isAnswered: true, isCorrect: true, earnedScore: 100 });
    expect(resolveChineseTenAnswer({ optionId: 'option-heart-7', correctOptionId: 'option-heart-3', elapsedSeconds: 2.4 })).toEqual({ isAnswered: true, isCorrect: false, earnedScore: 0 });
  });
});
