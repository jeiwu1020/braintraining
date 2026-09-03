import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MazeNavigatorGame from '../components/MazeNavigatorGame';

describe('Maze Navigator LIGHT acceptance', () => {
  it('keeps the specialized landscape maze architecture with accessible controls', () => {
    const markup = renderToStaticMarkup(
      <MazeNavigatorGame isAdvanced={false} onBack={() => undefined} />,
    );

    expect(markup).toContain('data-maze-grid="true"');
    expect(markup).toContain('data-maze-rows="7"');
    expect(markup).toContain('data-maze-cols="9"');
    expect((markup.match(/data-maze-cell=/g) ?? [])).toHaveLength(63);
    expect(markup).toContain('aria-label="返回"');
    expect(markup).toContain('aria-label="遊戲規則"');
    expect(markup).toContain('aria-label="開始語音控制"');
    expect(markup).toContain('aria-label="向上移動"');
    expect(markup).toContain('aria-label="向下移動"');
    expect(markup).toContain('aria-label="向左移動"');
    expect(markup).toContain('aria-label="向右移動"');
    expect(markup).not.toContain('data-game-mode-selector');
    expect(markup).not.toContain('data-layout-preset="board-sidebar"');
  });

  it('preserves the advanced 9×13 maze contract', () => {
    const markup = renderToStaticMarkup(
      <MazeNavigatorGame isAdvanced onBack={() => undefined} />,
    );

    expect(markup).toContain('data-maze-rows="9"');
    expect(markup).toContain('data-maze-cols="13"');
    expect((markup.match(/data-maze-cell=/g) ?? [])).toHaveLength(117);
  });
});
