import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CheckersGame from '../components/CheckersGame';

describe('Checkers LIGHT acceptance', () => {
  it('keeps the specialized board and move-log architecture across orientations', () => {
    const markup = renderToStaticMarkup(
      <CheckersGame difficulty="NORMAL" onBack={() => undefined} />,
    );
    const source = readFileSync(new URL('../components/CheckersGame.tsx', import.meta.url), 'utf8');

    expect(markup).toContain('data-checkers-layout="board-move-log"');
    expect(markup).toContain('data-checkers-board="true"');
    expect((markup.match(/data-checkers-cell=/g) ?? []).length).toBeGreaterThanOrEqual(64);
    expect(markup).toContain('data-game-mode-selector="true"');
    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toMatch(/data-game-mode-option="PVE"[^>]*aria-pressed="true"/);
    expect(markup).toContain('單人');
    expect(markup).toContain('雙人');

    expect(markup).toContain('data-checkers-move-log="true"');
    expect(markup).toContain('data-checkers-portrait-support="true"');
    expect(markup).toContain('data-checkers-action="undo"');
    expect(markup).toContain('data-checkers-action="redo"');
    expect(markup).toContain('data-checkers-action="rules"');
    expect(markup).toContain('aria-label="返回"');
    expect(markup).toContain('aria-label="重新開始"');
    expect(markup).toContain('aria-label="悔棋"');
    expect(markup).toContain('aria-label="重做"');
    expect(markup).toContain('aria-label="規則說明"');
    expect(source).toContain('data-checkers-review-action="first"');
    expect(source).toContain('data-checkers-review-action="previous"');
    expect(source).toContain('data-checkers-review-action="next"');
    expect(source).toContain('data-checkers-review-action="last"');
    expect(source).toContain('<GameModeSelector');
    expect(source).toContain('max-h-28 overflow-y-auto');
    expect(source).not.toContain("setGameMode(p=>p==='PVE'?'PVP':'PVE')");
  });
});
