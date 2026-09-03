import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DotsAndBoxesGame, { getCompletedBoxesForEdge, isDotsBoxComplete } from '../components/DotsAndBoxesGame';

const emptyH = () => Array.from({ length: 5 }, () => Array(4).fill(0));
const emptyV = () => Array.from({ length: 4 }, () => Array(5).fill(0));
const emptySquares = () => Array.from({ length: 4 }, () => Array(4).fill(0));

describe('DotsAndBoxesGame board-sidebar migration', () => {
  it('wires the real edge-based game through BoardSidebarLayout', () => {
    const markup = renderToStaticMarkup(
      <DotsAndBoxesGame
        initialHLines={emptyH()}
        initialVLines={emptyV()}
        initialSquares={emptySquares()}
        onBack={() => undefined}
      />,
    );
    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="board-sidebar"');
    expect(markup).toContain('data-layout-region="board"');
    expect(markup).toContain('data-layout-region="sidebar"');
    expect(markup).not.toContain('data-layout-region="feedback"');
    expect(markup).toContain('data-board-coordinate-model="edge"');
    expect(markup).toContain('data-dots-rows="4"');
    expect(markup).toContain('data-dots-cols="4"');
    expect((markup.match(/data-dots-edge=/g) ?? [])).toHaveLength(40);
    expect((markup.match(/data-dots-box=/g) ?? [])).toHaveLength(16);
    expect((markup.match(/data-dots-dot=/g) ?? [])).toHaveLength(25);
    expect(markup).toContain('點格棋');
    expect(markup).toContain('紅方');
    expect(markup).toContain('電腦');
    expect(markup).toContain('data-game-mode-selector="true"');
    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toMatch(/data-game-mode-option="PVE"[^>]*aria-pressed="true"/);
    expect(markup).not.toContain('切換遊戲模式');
  });

  it('preserves single and double box completion semantics', () => {
    const h = emptyH();
    const v = emptyV();
    h[0][0] = 1; h[1][0] = 1; v[0][0] = 1;
    expect(isDotsBoxComplete(0, 0, h, v)).toBe(false);
    expect(getCompletedBoxesForEdge('v', 0, 1, h, v)).toEqual([]);
    v[0][1] = 1;
    expect(isDotsBoxComplete(0, 0, h, v)).toBe(true);
    expect(getCompletedBoxesForEdge('v', 0, 1, h, v)).toEqual([{ r: 0, c: 0 }]);

    const h2 = emptyH();
    const v2 = emptyV();
    h2[0][0] = 1; h2[1][0] = 1; h2[0][1] = 1; h2[1][1] = 1;
    v2[0][0] = 1; v2[0][2] = 1;
    v2[0][1] = 1;
    expect(getCompletedBoxesForEdge('v', 0, 1, h2, v2)).toEqual([{ r: 0, c: 0 }, { r: 0, c: 1 }]);
  });
});
