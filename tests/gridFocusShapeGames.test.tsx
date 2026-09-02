import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SetBoardView } from '../components/SetGame';
import { QwirkleRoundLayout } from '../components/QwirkleGame';

describe('grid-focus shape games', () => {
  it('keeps Set cards separate from timing and hint controls', () => {
    const markup = renderToStaticMarkup(
      <SetBoardView
        difficulty="ADVANCED"
        score={20}
        timeText="1:15"
        deckCount={24}
        message="這三張不是組合喔！"
        board={<button type="button">紫色菱形</button>}
        onBack={() => undefined}
        onShowRules={() => undefined}
        onReset={() => undefined}
        onHint={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="形色牌桌面"');
    expect(markup).toContain('aria-label="形色牌資訊區"');
    expect(markup).toContain('紫色菱形');
    expect(markup).toContain('剩餘 24 張');
    expect(markup).toContain('這三張不是組合喔！');
    expect(markup).toContain('進階');
  });

  it('keeps the Qwirkle board and answer tiles in separate regions', () => {
    const markup = renderToStaticMarkup(
      <QwirkleRoundLayout
        difficulty="NORMAL"
        currentIndex={1}
        totalQuestions={10}
        score={50}
        elapsedTime={3.2}
        board={<div>紅色形狀連線</div>}
        options={<button type="button">紅色星星</button>}
        feedback={<span>同色異形合法連線！</span>}
        onBack={() => undefined}
        onToggleTeam={() => undefined}
        onShowRules={() => undefined}
        onRestart={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="形色棋盤面"');
    expect(markup).toContain('aria-label="形色棋作答區"');
    expect(markup).toContain('紅色形狀連線');
    expect(markup).toContain('紅色星星');
    expect(markup).toContain('同色異形合法連線！');
    expect(markup).toContain('第 2/10 題');
  });
});
