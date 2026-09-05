import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = () => readFileSync('components/StarryRippleGame.tsx', 'utf8');
const css = () => readFileSync('index.css', 'utf8');

describe('Starry Ripple immersive LIGHT acceptance', () => {
  it('keeps the canvas edge-to-edge while constraining chrome to a safe overlay', () => {
    const code = source();
    const styles = css();

    for (const hook of [
      'data-starry-root',
      'data-starry-canvas',
      'data-starry-safe-overlay',
      'data-starry-back',
      'data-starry-instruction',
    ]) {
      expect(code).toContain(hook);
    }

    expect(code).toContain('app-safe-screen');
    expect(code).toContain('h-[100dvh]');
    expect(code).toContain('min-h-[100dvh]');
    expect(code).toContain('max-h-[100dvh]');
    expect(code).toContain('overflow-hidden');
    expect(code).toContain('pointer-events-none');
    expect(code).toContain('aria-label="返回遊戲選單"');
    expect(code).toContain('min-h-11');
    expect(code).not.toContain('GameShell');

    expect(styles).toContain('[data-starry-root]');
    expect(styles).toContain('[data-starry-root] .starry-canvas');
    expect(styles).toContain('[data-starry-root] .starry-safe-overlay');
    expect(styles).toContain('@media (orientation: landscape) and (max-height: 480px)');
  });

  it('preserves tap/drag ripples and cleans the canvas loop and resize listener', () => {
    const code = source();

    expect(code).toContain('handlePointerDown');
    expect(code).toContain('handlePointerMove');
    expect(code).toContain('if (e.buttons !== 1) return;');
    expect(code).toContain('getBoundingClientRect()');
    expect(code).toContain('requestAnimationFrame');
    expect(code).toContain('cancelAnimationFrame');
    expect(code).toContain("window.addEventListener('resize', resize)");
    expect(code).toContain("window.removeEventListener('resize', resize)");
    expect(code).toContain('devicePixelRatio');
    expect(code).toContain('ctx.setTransform');
    expect(code).toContain('touch-none');
  });

  it('does not replace the immersive interaction with controls or outcome UI', () => {
    const code = source();

    expect(code).toContain('starsRef.current');
    expect(code).toContain('ripplesRef.current');
    expect(code).toContain('Math.random()');
    expect(code).toContain('onPointerDown={handlePointerDown}');
    expect(code).toContain('onPointerMove={handlePointerMove}');
    expect(code).not.toContain('setInterval');
  });
});
