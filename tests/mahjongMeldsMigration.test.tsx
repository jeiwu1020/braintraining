import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MahjongMeldsGame, MahjongRoundLayout, MahjongTile, calculateTimeScore, resolveMahjongAnswer } from '../components/MahjongMeldsGame';

const deterministicQuestion = {
  id: 101,
  type: 'meld_run' as const,
  title: '順子測試',
  prompt: '找出能完成順子的牌',
  hand: [
    { id: 'hand-3-wan', suit: 'wan' as const, value: 3, name: '三萬' },
    { id: 'hand-4-wan', suit: 'wan' as const, value: 4, name: '四萬' },
  ],
  options: [
    { id: 'option-5-wan', suit: 'wan' as const, value: 5, name: '五萬' },
    { id: 'option-9-wan', suit: 'wan' as const, value: 9, name: '九萬' },
  ],
  correctAnswerId: 'option-5-wan',
  explanation: '三萬、四萬、五萬可以組成順子。',
  meldTypeLabel: '順子搭子',
};

describe('MahjongMeldsGame grid-focus migration', () => {
  it('keeps the mahjong playfield, task support, and answered feedback in distinct regions', () => {
    const markup = renderToStaticMarkup(
      <MahjongRoundLayout
        difficulty="ADVANCED"
        currentIndex={2}
        totalQuestions={8}
        score={140}
        elapsedTime={3.4}
        playfield={<div>三萬 四萬 五萬</div>}
        support={<div>順子搭子：找出缺少的牌</div>}
        feedback={<span>答對！下一題</span>}
        teamMode="SOLO"
        onBack={() => undefined}
        onToggleTeam={() => undefined}
        onShowRules={() => undefined}
        onRestart={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="麻將牌桌面"');
    expect(markup).toContain('aria-label="麻將題目資訊"');
    expect(markup).toContain('data-layout-region="feedback"');
    expect(markup).toContain('順子搭子：找出缺少的牌');
    expect(markup).toContain('答對！下一題');
    expect(markup).toContain('進階');
    expect(markup).toContain('140 分');
  });

  it('keeps answer tiles keyboard-addressable and preserves speed-score boundaries', () => {
    const markup = renderToStaticMarkup(
      <MahjongTile
        tile={{ id: 'opt-5', suit: 'wan', value: 5, name: '五萬' }}
        onClick={() => undefined}
      />,
    );

    expect(markup).toContain('aria-label="選擇五萬"');
    expect(markup).toContain('type="button"');
    expect(calculateTimeScore(2.5).score).toBe(100);
    expect(calculateTimeScore(2.6).score).toBe(85);
    expect(calculateTimeScore(12.1).score).toBe(40);
  });

  it('wires MahjongMeldsGame through the grid-focus layout contract', () => {
    const markup = renderToStaticMarkup(
      <MahjongMeldsGame
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
    expect(markup).toContain('找出能完成順子的牌');
  });

  it('preserves the answer-to-feedback state transition for a known option', () => {
    expect(resolveMahjongAnswer({ optionId: 'option-5-wan', correctAnswerId: 'option-5-wan', elapsedSeconds: 2.4 })).toEqual({
      isAnswered: true,
      isCorrect: true,
      earnedScore: 100,
    });
    expect(resolveMahjongAnswer({ optionId: 'option-9-wan', correctAnswerId: 'option-5-wan', elapsedSeconds: 2.4 })).toEqual({
      isAnswered: true,
      isCorrect: false,
      earnedScore: 0,
    });
  });
});
