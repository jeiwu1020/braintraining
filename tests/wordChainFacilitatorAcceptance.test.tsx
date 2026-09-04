import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Word Chain facilitator LIGHT acceptance', () => {
  it('keeps the dedicated fullscreen game safe-area aware and touch-ready', () => {
    const source = readFileSync('components/WordChainGame.tsx', 'utf8');
    const css = readFileSync('index.css', 'utf8');

    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('max-h-[100dvh]');
    expect(source).toContain('overflow-hidden');
    expect(source).toContain('app-safe-screen');
    expect(source).toContain('data-word-chain-root');
    expect(source).toContain('data-word-chain-main');
    expect(source).toContain('data-word-chain-prompt');
    expect(source).toContain('data-word-chain-status');
    expect(source).toContain('data-word-chain-timeout');
    expect(source).toContain('aria-label="返回遊戲選單"');
    expect(source).toContain('aria-label="換一個題目"');
    expect(source).toContain('min-h-11 min-w-11');
    expect(source).toContain('setTimeLeft(60)');
    expect(source).toContain('setScore(prev => prev + 1)');
    expect(source).toContain('時間到！');
    expect(source).toContain('成功聯想了');
    expect(source).toContain('再玩一次');
    expect(source).toContain('fixed inset-0');
    expect(source).not.toContain('GameShell');
    expect(source).not.toContain('truncate');

    expect(css).toContain('.word-chain-main');
    expect(css).toContain('.word-chain-timeout');
    expect(css).toContain('.word-chain-timeout-card');
    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(css).toContain('word-chain');
    expect(css).not.toContain('max-width: 480px');
  });

  it('keeps the timer, score, prompt, and timeout result semantics visible', () => {
    const source = readFileSync('components/WordChainGame.tsx', 'utf8');

    expect(source).toContain('useState(60)');
    expect(source).toContain('timeLeft > 0');
    expect(source).toContain('setTimeLeft(prev => prev - 1)');
    expect(source).toContain('剩餘秒數');
    expect(source).toContain('成功聯想數');
    expect(source).toContain('請說出屬於以下類別的詞彙：');
    expect(source).toContain('setIsActive(false)');
    expect(source).toContain('soundService.playWin()');
  });
});
