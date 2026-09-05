import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = () => readFileSync('components/MandalaGame.tsx', 'utf8');
const css = () => readFileSync('index.css', 'utf8');

describe('Mandala immersive FULL acceptance', () => {
  it('preserves DRAW/VOICE, eight-way symmetry, colors, brush range, and canvas actions', () => {
    const code = source();

    expect(code).toContain("type Mode = 'DRAW' | 'VOICE';");
    expect(code).toContain("const [mode, setMode] = useState<Mode>('DRAW');");
    expect(code).toContain('const symmetry = 8');
    expect(code).toContain("const colors = ['#f8fafc', '#fca5a5', '#fcd34d', '#86efac', '#60a5fa', '#a78bfa', '#f472b6'];");
    expect(code).toContain('min="1" max="10"');
    expect(code).toContain('drawSymmetric');
    expect(code).toContain('toDataURL');
    expect(code).toContain("link.download = 'mandala.png'");
    expect(code).toContain('getCoordinates');
    expect(code).toContain('getBoundingClientRect()');
  });

  it('cleans microphone, analyser, audio context, and voice RAF on stop, mode switch, and unmount', () => {
    const code = source();

    expect(code).toContain('navigator.mediaDevices.getUserMedia');
    expect(code).toContain('stream.getTracks().forEach(track => track.stop())');
    expect(code).toContain('cancelAnimationFrame');
    expect(code).toContain('audioCtxRef.current.close()');
    expect(code).toContain('audioCtxRef.current = null');
    expect(code).toContain('analyserRef.current = null');
    expect(code).toContain('streamRef.current = null');
    expect(code).toContain('modeRef.current');
    expect(code).toContain("modeRef.current !== 'VOICE'");
  });

  it('uses a safe immersive stage with a compact control rail and dominant square canvas', () => {
    const code = source();
    const styles = css();

    for (const hook of [
      'data-mandala-root',
      'data-mandala-safe-stage',
      'data-mandala-layout',
      'data-mandala-back',
      'data-mandala-controls',
      'data-mandala-canvas',
      'data-mandala-mode',
      'data-mandala-mic',
    ]) {
      expect(code).toContain(hook);
    }

    expect(code).toContain('app-safe-screen');
    expect(code).toContain('h-[100dvh]');
    expect(code).toContain('min-h-[100dvh]');
    expect(code).toContain('max-h-[100dvh]');
    expect(code).toContain('overflow-hidden');
    expect(code).toContain('touch-none');
    expect(code).toContain('aria-label="返回遊戲選單"');
    expect(code).not.toContain('GameShell');

    expect(styles).toContain('[data-mandala-root]');
    expect(styles).toContain('[data-mandala-root] .mandala-controls');
    expect(styles).toContain('[data-mandala-root] .mandala-canvas-stage');
    expect(styles).toContain('aspect-ratio: 1');
    expect(styles).toContain('@media (orientation: landscape) and (max-height: 480px)');
  });

  it('labels modes, colors, tools, brush, and microphone states without color-only semantics', () => {
    const code = source();

    expect(code).toContain('aria-pressed={mode === \'DRAW\'}');
    expect(code).toContain('aria-pressed={mode === \'VOICE\'}');
    expect(code).toContain('aria-pressed={color === c}');
    expect(code).toContain('選擇顏色');
    expect(code).toContain('aria-label="筆刷大小"');
    expect(code).toContain('aria-label="清除畫布"');
    expect(code).toContain('aria-label="下載作品"');
    expect(code).toContain("aria-label={isRecording ? '停止聲控繪圖' : '開始聲控繪圖'}");
    expect(code).toContain('min-h-11');
    expect(code).toContain('min-h-12');
  });
});
