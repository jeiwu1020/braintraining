import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('standalone PWA viewport fallback', () => {
  it('keeps the existing PWA metadata and normal dynamic viewport baseline', () => {
    const html = readFileSync('index.html', 'utf8');
    const css = readFileSync('index.css', 'utf8');
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));

    expect(html).toContain('viewport-fit=cover');
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).toContain('apple-mobile-web-app-status-bar-style" content="black-translucent"');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#f0fdf4');
    expect(manifest.theme_color).toBe('#f0fdf4');

    expect(css).toMatch(/body\s*\{[^}]*min-height:\s*100dvh/s);
    expect(css).toMatch(/#root\s*\{[^}]*min-height:\s*100dvh/s);
  });

  it('uses a standalone-only 100vh fallback at the outer application shell', () => {
    const css = readFileSync('index.css', 'utf8');

    expect(css).toMatch(
      /@media\s*\(display-mode:\s*standalone\)\s*\{\s*body,\s*#root,\s*#root > div\[class~="min-h-\[100dvh\]"\]\s*\{\s*min-height:\s*100vh;/s,
    );
    expect(css).not.toMatch(
      /@media\s*\(display-mode:\s*standalone\)[^}]*padding-(?:top|right|bottom|left)\s*:/s,
    );
  });

  it('does not introduce JavaScript viewport or reload repair hacks', () => {
    const source = [
      readFileSync('App.tsx', 'utf8'),
      readFileSync('index.tsx', 'utf8'),
      readFileSync('index.html', 'utf8'),
    ].join('\n');

    expect(source).not.toMatch(/visualViewport|innerHeight|location\.reload|requestFullscreen/);
  });
});
