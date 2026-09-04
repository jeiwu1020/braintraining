import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { advancedThoughts, normalThoughts } from '../data/positiveData';

describe('Positive Reappraisal facilitator LIGHT acceptance', () => {
  it('keeps the ten-scenario pool and original reveal/advance flow', () => {
    const source = readFileSync('components/PositiveReappraisalGame.tsx', 'utf8');

    expect(normalThoughts.length).toBeGreaterThanOrEqual(10);
    expect(advancedThoughts.length).toBeGreaterThanOrEqual(10);
    expect([...normalThoughts, ...advancedThoughts].every(scenario => (
      scenario.event && scenario.negativeThought && scenario.reframes.length > 0
    ))).toBe(true);
    expect(source).toContain('const allScenarios = isAdvanced ? advancedThoughts : normalThoughts;');
    expect(source).toContain('.slice(0, 10)');
    expect(source).toContain('setCurrentIndex(0)');
    expect(source).toContain('setShowReframes(false)');
    expect(source).toContain('setShowReframes(true)');
    expect(source).toContain('setCurrentIndex(currentIndex + 1)');
    expect(source).toContain('onBack();');
    expect(source).toContain('currentScenario.event');
    expect(source).toContain('currentScenario.negativeThought');
    expect(source).toContain('currentScenario.reframes.map');
  });

  it('uses a dedicated fullscreen safe-area layout without GameShell or fixed footer overlay', () => {
    const source = readFileSync('components/PositiveReappraisalGame.tsx', 'utf8');

    expect(source).toContain('data-positive-root');
    expect(source).toContain('data-positive-safe-stage');
    expect(source).toContain('data-positive-layout');
    expect(source).toContain('data-positive-header');
    expect(source).toContain('data-positive-main');
    expect(source).toContain('data-positive-event');
    expect(source).toContain('data-positive-negative');
    expect(source).toContain('data-positive-reveal');
    expect(source).toContain('data-positive-reframes');
    expect(source).toContain('data-positive-footer');
    expect(source).toContain('app-safe-screen');
    expect(source).toContain('aria-label="返回遊戲選單"');
    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('min-h-[100dvh]');
    expect(source).toContain('max-h-[100dvh]');
    expect(source).toContain('overflow-hidden');
    expect(source).not.toContain('GameShell');
    expect(source).not.toContain('fixed bottom-0 left-0 right-0');
    expect(source).not.toContain('pb-20');
    expect(source).not.toContain('pb-24');
    expect(source).not.toContain('landscape:pb-16');
  });

  it('protects readable two-column facilitator content and local long-text scroll', () => {
    const source = readFileSync('components/PositiveReappraisalGame.tsx', 'utf8');
    const css = readFileSync('index.css', 'utf8');

    expect(source).toContain('landscape:flex-row');
    expect(source).toContain('flex-1 min-h-0');
    expect(source).toContain('overflow-y-auto');
    expect(source).toContain('顯示轉念思考 (解套方法)');
    expect(source).toContain('如果換個角度想');
    expect(source).toContain('可以試著這樣想');
    expect(source).toContain('下一個情境');
    expect(source).toContain('完成挑戰');
    expect(source).not.toContain('landscape:text-[10px]');
    expect(source).not.toContain('landscape:py-1.5');
    expect(source).not.toContain('truncate');
    expect(source).not.toContain('line-clamp');
    expect(source).toContain('min-h-11');
    expect(css).toContain('[data-positive-root]');
    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(css).toContain('[data-positive-root] [data-positive-main]');
    expect(css).toContain('overflow-y: auto');
  });
});
