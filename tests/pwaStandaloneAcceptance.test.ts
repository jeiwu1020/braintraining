import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('iOS standalone viewport hardening', () => {
  it('keeps the standalone metadata, manifest, and dynamic viewport chain aligned', () => {
    const html = readFileSync('index.html', 'utf8');
    const css = readFileSync('index.css', 'utf8');
    const app = readFileSync('App.tsx', 'utf8');
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));

    expect(html).toContain('viewport-fit=cover');
    expect(html).toContain('mobile-web-app-capable');
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).toContain('black-translucent');
    expect(html).toContain('apple-mobile-web-app-title');
    expect(html).toContain('theme-color');
    expect(html).toContain('content="#f0fdf4"');
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest"');
    expect(html).not.toContain('user-scalable=no');
    expect(html).not.toContain('maximum-scale=1');

    expect(manifest).toEqual({
      name: '綜合腦訓練',
      short_name: '腦訓練',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#f0fdf4',
      theme_color: '#f0fdf4',
      lang: 'zh-TW',
    });

    expect(css).toMatch(/body\s*\{/);
    expect(css).toMatch(/#root\s*\{/);
    expect(css).toContain('min-height: 100dvh');
    expect(css).not.toMatch(/body\s*\{[^}]*padding\s*:/s);
    expect(css).toContain('padding-top: env(safe-area-inset-top, 0px)');
    expect(css).toContain('height: 100dvh');
    expect(app).not.toContain('min-h-screen');
    expect(app).toContain('min-h-[100dvh]');
  });
});
