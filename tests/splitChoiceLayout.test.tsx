import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SplitChoiceLayout from '../components/game-ui/SplitChoiceLayout';

describe('SplitChoiceLayout', () => {
  it('exposes separate question and answer regions to players', () => {
    const markup = renderToStaticMarkup(
      <SplitChoiceLayout
        question={<div>題目內容</div>}
        choices={<button type="button">答案選項</button>}
      />,
    );

    expect(markup).toContain('data-layout-preset="split-choice"');
    expect(markup).toContain('aria-label="題目區"');
    expect(markup).toContain('題目內容');
    expect(markup).toContain('aria-label="作答區"');
    expect(markup).toContain('答案選項');
  });

  it('announces answer feedback without replacing the playfield', () => {
    const markup = renderToStaticMarkup(
      <SplitChoiceLayout
        question="題目"
        choices="選項"
        feedback="答錯了，再試一次"
      />,
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('答錯了，再試一次');
  });
});
