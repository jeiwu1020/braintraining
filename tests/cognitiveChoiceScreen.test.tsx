import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CognitiveChoiceScreen from '../components/game-ui/CognitiveChoiceScreen';

describe('CognitiveChoiceScreen', () => {
  it('keeps a cognitive stimulus and its answers in the shared landscape regions', () => {
    const markup = renderToStaticMarkup(
      <CognitiveChoiceScreen
        title="圖形推理王"
        subtitle="觀察規律後選出答案"
        difficulty="ADVANCED"
        round={3}
        totalRounds={10}
        score={35}
        onBack={() => undefined}
        questionLabel="圖形規律題目區"
        choicesLabel="圖形規律作答區"
        question={<div>🔵 🟡 🔵 ?</div>}
        choices={<button type="button">🟡</button>}
        feedback="答對了！"
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="split-choice"');
    expect(markup).toContain('aria-label="圖形規律題目區"');
    expect(markup).toContain('aria-label="圖形規律作答區"');
    expect(markup).toContain('第 3/10 題');
    expect(markup).toContain('35');
    expect(markup).toContain('進階');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('答對了！');
  });
});
