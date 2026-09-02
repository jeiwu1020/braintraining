import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GridFocusLayout from '../components/game-ui/GridFocusLayout';

describe('GridFocusLayout', () => {
  it('keeps the playfield, optional support panel, and feedback in distinct regions', () => {
    const markup = renderToStaticMarkup(
      <GridFocusLayout
        playfieldLabel="圖案矩陣"
        supportLabel="目標圖案"
        playfield={<button type="button">A1</button>}
        support={<div>請找出 🍎</div>}
        feedback="再仔細看看喔！"
      />,
    );

    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="圖案矩陣"');
    expect(markup).toContain('aria-label="目標圖案"');
    expect(markup).toContain('data-layout-region="feedback"');
    expect(markup.indexOf('data-layout-region="feedback"')).toBeGreaterThan(
      markup.indexOf('aria-label="目標圖案"'),
    );
  });

  it('supports a full-width playfield when no support panel is needed', () => {
    const markup = renderToStaticMarkup(
      <GridFocusLayout playfield={<div>4 × 4</div>} />,
    );

    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="主要遊戲區"');
    expect(markup).not.toContain('data-layout-region="support"');
  });
});
