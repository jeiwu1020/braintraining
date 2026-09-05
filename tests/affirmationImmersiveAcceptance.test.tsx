import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const source = () => readFileSync('components/AffirmationCardGame.tsx', 'utf8');
const css = () => readFileSync('index.css', 'utf8');

describe('Affirmation immersive LIGHT acceptance', () => {
  it('protects the affirmation pool, flip, no-repeat next draw, and 400ms guard', () => {
    const code = source();

    vi.useFakeTimers();
    expect(code).toContain('const affirmations = [');
    expect(code).toContain(' affirmations.length');
    expect(code).toContain('const [currentIndex, setCurrentIndex] = useState(0);');
    expect(code).toContain('const [isFlipped, setIsFlipped] = useState(false);');
    expect(code).toContain('if (isAnimating) return;');
    expect(code).toContain('setIsFlipped(false);');
    expect(code).toContain('do {');
    expect(code).toContain('while (next === prev && affirmations.length > 1);');
    expect(code).toContain('setTimeout');
    expect(code).toContain('}, 400);');
    expect(code).toContain('nextTimeoutRef');
    expect(code).toContain('clearTimeout(nextTimeoutRef.current);');
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('uses a safe immersive stage and a height-aware card-first landscape composition', () => {
    const code = source();
    const styles = css();

    for (const hook of [
      'data-affirmation-root',
      'data-affirmation-safe-stage',
      'data-affirmation-layout',
      'data-affirmation-back',
      'data-affirmation-copy',
      'data-affirmation-card',
      'data-affirmation-next',
    ]) {
      expect(code).toContain(hook);
    }

    expect(code).toContain('app-safe-screen');
    expect(code).toContain('h-[100dvh]');
    expect(code).toContain('min-h-[100dvh]');
    expect(code).toContain('max-h-[100dvh]');
    expect(code).toContain('overflow-hidden');
    expect(code).not.toContain('GameShell');
    expect(code).toContain('aspect-[3/4]');
    expect(code).toContain('min-h-11');
    expect(code).toContain('aria-label="返回遊戲選單"');

    expect(styles).toContain('[data-affirmation-root]');
    expect(styles).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(styles).toContain('[data-affirmation-root] .affirmation-main');
    expect(styles).toContain('grid-template-columns');
    expect(styles).toContain('[data-affirmation-root] .affirmation-card');
    expect(styles).toContain('aspect-ratio: 3 / 4');
  });

  it('keeps the card accessible, preserves visible content, and allows bounded card-local text flow', () => {
    const code = source();
    const styles = css();

    expect(code).toContain('aria-label="翻開肯定小卡"');
    expect(code).toContain('aria-pressed={isFlipped}');
    expect(code).toContain('data-affirmation-next');
    expect(code).toContain('再抽一張');
    expect(code).toContain('點擊翻開');
    expect(code).toContain('"{affirmations[currentIndex]}"');
    expect(styles).toContain('.affirmation-card-back-content');
    expect(styles).toContain('overflow-y: auto');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
