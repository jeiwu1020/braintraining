import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GridFocusScreen from '../components/game-ui/GridFocusScreen';

describe('GridFocusScreen', () => {
  it('combines the shared game header with the grid-focus regions and status', () => {
    const markup = renderToStaticMarkup(
      <GridFocusScreen
        title="眼明手快"
        subtitle="找出指定圖案"
        difficulty="ADVANCED"
        round={4}
        totalRounds={10}
        score={60}
        onBack={() => undefined}
        playfield={<button type="button">A1</button>}
        support={<div>目標 🍎</div>}
        feedback="找到了！"
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('第 4/10 題');
    expect(markup).toContain('60');
    expect(markup).toContain('進階');
    expect(markup).toContain('找到了！');
  });
});
