import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ZoomGame, { calculateZoomPotentialScore } from '../components/ZoomGame';

describe('Zoom Game FACILITATOR LIGHT scoring acceptance', () => {
  it('calculates potential score from successful hint actions with a 25-point floor', () => {
    expect(calculateZoomPotentialScore(0)).toBe(100);
    expect(calculateZoomPotentialScore(1)).toBe(85);
    expect(calculateZoomPotentialScore(2)).toBe(70);
    expect(calculateZoomPotentialScore(3)).toBe(55);
    expect(calculateZoomPotentialScore(4)).toBe(40);
    expect(calculateZoomPotentialScore(5)).toBe(25);
    expect(calculateZoomPotentialScore(6)).toBe(25);
  });

  it('renders the current potential score and preserves the approved game contract', () => {
    const markup = renderToStaticMarkup(
      <ZoomGame difficulty="NORMAL" onBack={() => undefined} />,
    );
    const source = readFileSync(
      new URL('../components/ZoomGame.tsx', import.meta.url),
      'utf8',
    );

    expect(markup).toContain('本題可得：100 分');
    expect(markup).toContain('總分：0');
    expect(markup).toContain('aria-label="返回遊戲選單"');
    expect(markup).toContain('aria-label="重新開始"');

    expect(source).toContain('const [currentRoundScore, setCurrentRoundScore] = useState(100)');
    expect(source).toContain('Math.max(25, prev - 15)');
    expect(source).toContain('setCurrentRoundScore(100)');
    expect(source).not.toContain('roundStartTime');
    expect(source).not.toContain('timeTaken');
    expect(source).not.toContain('100 - Math.floor(timeTaken) * 2');
    expect(source).toContain('setZoomLevel(isAdvanced ? 8 : 5)');
    expect(source).toContain('(isAdvanced ? 1.5 : 1)');
    expect(source).toContain('setZoomLevel(1);');
    expect(source).toContain('setScore(prev => prev + currentRoundScore);');
    expect(source).toContain('soundService.playWrong();');
    expect(source).toContain('本題可得分數減少 15 分');
    expect(source).toContain('landscape:w-40 landscape:h-40');
    expect(source).toContain('min-h-11');
  });
});
