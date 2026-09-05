import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = () => readFileSync('components/AmbientSoundGame.tsx', 'utf8');
const css = () => readFileSync('index.css', 'utf8');

describe('Ambient Sound immersive FULL acceptance', () => {
  it('keeps all five sound types, defaults, timer options, and generated audio behavior', () => {
    const code = source();

    for (const sound of ['RAIN', 'WAVES', 'WIND', 'FIRE', 'BOWL']) {
      expect(code).toContain(sound);
    }
    for (const volume of ['RAIN: 0.5', 'WAVES: 0.5', 'WIND: 0.3', 'FIRE: 0.6', 'BOWL: 0.4']) {
      expect(code).toContain(volume);
    }
    expect(code).toContain('const timerOptions = [5, 15, 30, 60]');
    expect(code).toContain('createNoiseBuffer');
    expect(code).toContain('buildSoundGenerator');
    expect(code).toContain('setTimeLeft(t =>');
    expect(code).toContain('return null;');
    expect(code).toContain('setIsPlaying(false);');
  });

  it('uses immutable sound state and closes every generated audio resource', () => {
    const code = source();

    expect(code).not.toContain('next[k as SoundType].active = false');
    expect(code).toContain('active: false');
    expect(code).toContain('source.disconnect()');
    expect(code).toContain('gain.disconnect()');
    expect(code).toContain('customNodes');
    expect(code).toContain('audioCtxRef.current.close()');
    expect(code).toContain('audioCtxRef.current = null');
    expect(code).toContain('clearInterval(timer)');
  });

  it('provides an edge-to-edge safe stage and short-landscape soundboard/session rail', () => {
    const code = source();
    const styles = css();

    for (const hook of [
      'data-ambient-root',
      'data-ambient-safe-stage',
      'data-ambient-layout',
      'data-ambient-back',
      'data-ambient-sounds',
      'data-ambient-session',
      'data-ambient-master',
    ]) {
      expect(code).toContain(hook);
    }

    expect(code).toContain('app-safe-screen');
    expect(code).toContain('h-[100dvh]');
    expect(code).toContain('min-h-[100dvh]');
    expect(code).toContain('max-h-[100dvh]');
    expect(code).toContain('overflow-hidden');
    expect(code).toContain('aria-label="返回遊戲選單"');
    expect(code).not.toContain('GameShell');

    expect(styles).toContain('[data-ambient-root]');
    expect(styles).toContain('[data-ambient-root] .ambient-sounds');
    expect(styles).toContain('[data-ambient-root] .ambient-session');
    expect(styles).toContain('grid-template-columns');
    expect(styles).toContain('@media (orientation: landscape) and (max-height: 480px)');
  });

  it('keeps every sound, volume, timer, and master control accessible', () => {
    const code = source();

    expect(code).toContain('aria-pressed={state.active}');
    expect(code).toContain('aria-label={`${label}音量`}');
    expect(code).toContain('aria-pressed={');
    expect(code).toContain('開始播放環境音');
    expect(code).toContain('暫停環境音');
    expect(code).toContain('min-h-11');
    expect(code).toContain('min-h-12');
  });
});
