import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const source = () => readFileSync('components/BreathingExercise.tsx', 'utf8');
const css = () => readFileSync('index.css', 'utf8');

describe('Breathing immersive reference acceptance', () => {
  it('protects the five-cycle countdown and 4/7/8 breathing semantics', () => {
    const code = source();

    vi.useFakeTimers();
    expect(code).toContain('const TOTAL_CYCLES = 5;');
    expect(code).toContain('useState(3)');
    expect(code).toContain("setPhase('Inhale')");
    expect(code).toContain("setPhase('Hold')");
    expect(code).toContain("setPhase('Exhale')");
    expect(code).toContain("setSeconds(4)");
    expect(code).toContain("setSeconds(7)");
    expect(code).toContain("setSeconds(8)");
    expect(code).toContain('setDuration(4000)');
    expect(code).toContain('setDuration(0)');
    expect(code).toContain('setDuration(8000)');
    expect(code).toContain('setScale(1.5)');
    expect(code).toMatch(/setScale\(1(?:\.0)?\)/);
    expect(code).toContain('cyclesRef.current += 1;');
    expect(code).toContain('setIsFinished(true);');
    expect(code).toContain('timeoutsRef.current.forEach(clearTimeout);');
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('uses a dedicated fullscreen safe stage without introducing GameShell', () => {
    const code = source();

    for (const hook of [
      'data-breathing-root',
      'data-breathing-safe-stage',
      'data-breathing-layout',
      'data-breathing-back',
      'data-breathing-countdown',
      'data-breathing-active',
      'data-breathing-stimulus',
      'data-breathing-progress',
      'data-breathing-helper',
      'data-breathing-complete',
    ]) {
      expect(code).toContain(hook);
    }

    expect(code).toContain('app-safe-screen');
    expect(code).toContain('h-[100dvh]');
    expect(code).toContain('min-h-[100dvh]');
    expect(code).toContain('max-h-[100dvh]');
    expect(code).toContain('overflow-hidden');
    expect(code).not.toContain('GameShell');
    expect(code).toContain('aria-label="返回遊戲選單"');
    expect(code).toContain('min-h-11');
    expect(code).toContain('min-w-11');
  });

  it('keeps the immersive stimulus, metadata, and completion wording', () => {
    const code = source();

    expect(code).toContain('呼吸律動');
    expect(code).toContain('循環 {Math.min(completedCycles + 1, TOTAL_CYCLES)} / {TOTAL_CYCLES}');
    expect(code).toContain('用鼻子緩慢吸氣...');
    expect(code).toContain('屏住呼吸...');
    expect(code).toContain('用嘴巴慢慢吐氣...');
    expect(code).toContain('吸氣時圓圈變大，吐氣時圓圈變小。');
    expect(code).toContain('跟隨節奏放鬆身心。');
    expect(code).toContain('呼吸練習完成');
    expect(code).toContain('你已經完成了 {TOTAL_CYCLES} 個循環的深呼吸。');
    expect(code).toContain('回到主選單');
    expect(code).toContain('data-breathing-stimulus');
    expect(code).toContain('overflow-visible');
  });

  it('defines a short-landscape contract without disabling functional breathing motion', () => {
    const styles = css();

    expect(styles).toContain('[data-breathing-root]');
    expect(styles).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(styles).toContain('[data-breathing-root] .breathing-active');
    expect(styles).toContain('[data-breathing-root] .breathing-stimulus-stage');
    expect(styles).toContain('overflow: visible');
    expect(styles).toContain('grid-template-columns');
    expect(styles).toContain('[data-breathing-root] .breathing-complete-card');
    expect(styles).not.toContain('[data-breathing-root] .breathing-active { animation: none');
  });
});
