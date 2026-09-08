import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appSource = readFileSync('App.tsx', 'utf8');
const stylesheet = readFileSync('index.css', 'utf8');

describe('mobile landscape gate', () => {
  it('mounts a non-layout-shifting gate for active games only', () => {
    expect(appSource).toContain('MobileLandscapeGate');
    expect(appSource).toContain("gameState !== GameState.MENU");
  });

  it('provides an accessible rotation message and PWA guidance', () => {
    const componentPath = 'components/game-ui/MobileLandscapeGate.tsx';

    expect(existsSync(componentPath)).toBe(true);

    const componentSource = readFileSync(componentPath, 'utf8');
    expect(componentSource).toContain('data-mobile-landscape-gate');
    expect(componentSource).toContain('請將手機轉為橫向');
    expect(componentSource).toContain('加入主畫面');
    expect(componentSource).toContain('role="dialog"');
  });

  it('limits the gate to coarse-pointer portrait phones', () => {
    expect(stylesheet).toContain(
      '@media (orientation: portrait) and (pointer: coarse) and (max-width: 767px)',
    );
    expect(stylesheet).toContain('.mobile-landscape-gate');
    expect(stylesheet).toContain('position: fixed');
  });
});
