import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('Tailwind production migration acceptance', () => {
  it('uses local Tailwind/PostCSS and removes the runtime CDN', () => {
    const html = read('index.html');
    const packageJson = JSON.parse(read('package.json')) as {
      devDependencies?: Record<string, string>;
    };
    const devDependencies = packageJson.devDependencies ?? {};

    expect(html).not.toContain('https://cdn.tailwindcss.com');
    expect(devDependencies.tailwindcss).toBe('3.4.17');
    expect(devDependencies.postcss).toBeTruthy();
    expect(devDependencies.autoprefixer).toBeTruthy();
  });

  it('scans production source roots and keeps the CSS contract', () => {
    const tailwindConfig = read('tailwind.config.cjs');
    const postcssConfig = read('postcss.config.cjs');
    const indexCss = read('index.css');
    const html = read('index.html');

    for (const path of [
      './index.html',
      './index.tsx',
      './App.tsx',
      './components/**/*.{js,ts,jsx,tsx}',
      './data/**/*.{js,ts,jsx,tsx}',
      './services/**/*.{js,ts,jsx,tsx}',
      './utils/**/*.{js,ts,jsx,tsx}',
    ]) {
      expect(tailwindConfig).toContain(path);
    }

    expect(postcssConfig).toContain('tailwindcss');
    expect(postcssConfig).toContain('autoprefixer');
    expect(indexCss).toContain('@tailwind base;');
    expect(indexCss).toContain('@tailwind components;');
    expect(indexCss).toContain('@tailwind utilities;');
    expect(html.indexOf('href="/index.css"')).toBeLessThan(html.indexOf('href="/responsive-polish.css"'));
  });

  it('preserves the viewport and standalone metadata contract', () => {
    const html = read('index.html');

    expect(html).toContain('viewport-fit=cover');
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).toContain('type="importmap"');
    expect(html).toContain("@import url('https://fonts.googleapis.com");
  });
});
