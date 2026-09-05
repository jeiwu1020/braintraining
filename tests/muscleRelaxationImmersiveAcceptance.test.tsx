import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const source = () => readFileSync('components/MuscleRelaxationGame.tsx', 'utf8');
const css = () => readFileSync('index.css', 'utf8');

describe('Muscle relaxation immersive LIGHT acceptance', () => {
  it('protects the existing step order, durations, timer progression, and completion', () => {
    const code = source();

    vi.useFakeTimers();
    expect(code).toContain('const steps = [');
    for (const duration of [15, 5, 10, 20]) {
      expect(code).toContain(`duration: ${duration}`);
    }
    for (const part of ['準備', '雙手與手臂', '肩膀與脖子', '臉部', '胸部與腹部', '雙腿與雙腳', '全身掃描']) {
      expect(code).toContain(`part: '${part}'`);
    }
    expect(code).toContain('useState(steps[0].duration)');
    expect(code).toContain('if (isPlaying && timeLeft > 0)');
    expect(code).toContain('setTimeLeft(t => t - 1)');
    expect(code).toContain('setCurrentStep(s => s + 1);');
    expect(code).toContain('setIsFinished(true);');
    expect(code).toContain('setIsPlaying(false);');
    expect(code).toContain('setCurrentStep(0);');
    expect(code).toContain('setTimeLeft(steps[0].duration);');
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('preserves the music element, synthesized fallback, and cleanup behavior', () => {
    const code = source();

    expect(code).toContain('src="/relaxing-music.mp3"');
    expect(code).toContain('loop');
    expect(code).toContain('playsInline');
    expect(code).toContain('setAudioFailed(true);');
    expect(code).toContain('soundService.startRelaxAmbient()');
    expect(code).toContain('soundService.stopRelaxAmbient()');
    expect(code).toContain('audioRef.current.pause()');
    expect(code).toContain('audioRef.current?.pause();');
    expect(code).toContain('soundService.stopRelaxAmbient();');
  });

  it('uses a safe stage, safe floating controls, and short-landscape stimulus composition', () => {
    const code = source();
    const styles = css();

    for (const hook of [
      'data-muscle-root',
      'data-muscle-safe-stage',
      'data-muscle-layout',
      'data-muscle-back',
      'data-muscle-music',
      'data-muscle-active',
      'data-muscle-stimulus',
      'data-muscle-instruction',
      'data-muscle-controls',
      'data-muscle-complete',
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
    expect(code).toContain('aria-label={isMusicOn ?');
    expect(code).toContain('min-h-11');

    expect(styles).toContain('[data-muscle-root]');
    expect(styles).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(styles).toContain('[data-muscle-root] .muscle-active');
    expect(styles).toContain('grid-template-columns');
    expect(styles).toContain('[data-muscle-root] .muscle-status-circle');
  });

  it('keeps accessible action labels, progress, instruction, hold state, and completion copy', () => {
    const code = source();

    expect(code).toContain('aria-label="重新開始放鬆練習"');
    expect(code).toContain("aria-label={isPlaying ? '暫停放鬆' : '開始放鬆'}");
    expect(code).toContain('緊繃');
    expect(code).toContain('放鬆');
    expect(code).toContain('data-muscle-instruction');
    expect(code).toContain('放鬆完成');
    expect(code).toContain('回到主選單');
    expect(code).toContain('min-h-11');
  });
});
