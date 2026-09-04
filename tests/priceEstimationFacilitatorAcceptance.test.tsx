import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Price Estimation facilitator LIGHT acceptance', () => {
  it('keeps gameplay semantics and bounds the completion state in short landscape', () => {
    const source = readFileSync('components/PriceEstimationGame.tsx', 'utf8');
    const css = readFileSync('index.css', 'utf8');

    expect(source).toContain('NORMAL_ITEMS');
    expect(source).toContain('ADVANCED_ITEMS');
    expect(source).toContain('TOTAL_ROUNDS = 10');
    expect(source).toContain('usedIndices');
    expect(source).toContain('Math.max(10, 100 - Math.floor(timeTaken) * 2)');
    expect(source).toContain('data-price-root');
    expect(source).toContain('data-price-main');
    expect(source).toContain('data-price-stats');
    expect(source).toContain('data-price-completion');
    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('overflow-hidden');
    expect(source).toContain('aria-label="返回遊戲選單"');
    expect(source).toContain('aria-label="重新開始"');
    expect(source).toContain('min-h-11 min-w-11');
    expect(source).toContain('!isComplete');
    expect(source).not.toContain('mt-12');
    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(css).toContain('.price-estimation-completion');
    expect(css).toContain('.price-estimation-main');
    expect(source).toContain('setScore(prev => prev + roundScore)');
    expect(source).toContain('soundService.playWin()');
    expect(source).toContain('soundService.playWrong()');
  });
});
