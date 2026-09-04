import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('safe-area integration acceptance', () => {
  it('keeps edge-to-edge PWA rendering while protecting non-GameShell content', () => {
    const html = readFileSync('index.html', 'utf8');
    const css = readFileSync('index.css', 'utf8');
    const app = readFileSync('App.tsx', 'utf8');
    const price = readFileSync('components/PriceEstimationGame.tsx', 'utf8');

    expect(html).toContain('viewport-fit=cover');
    expect(css).toContain('.app-safe-screen');
    expect(css).toContain('env(safe-area-inset-left, 0px)');
    expect(css).toContain('env(safe-area-inset-right, 0px)');
    expect(css).toContain('padding-top: env(safe-area-inset-top, 0px)');
    expect(css).toMatch(/body\s*\{[^}]*min-height:\s*100dvh/s);
    expect(css).not.toMatch(/(?:html|body|#root)[^{]*\{[^}]*padding-(?:top|right|bottom|left)\s*:/s);
    expect(css).toContain('.game-shell');
    expect(css).toContain('padding-bottom: env(safe-area-inset-bottom, 0px)');

    expect(app).toContain('data-main-menu-root');
    expect(app).toContain('data-main-menu-sidebar');
    expect(app).toContain('data-main-menu-cards');
    expect(app).toContain('app-safe-screen');
    expect(app).toContain('fixed inset-0');
    expect(price).toContain('app-safe-screen');
    expect(price).not.toContain('game-shell');
  });
});
