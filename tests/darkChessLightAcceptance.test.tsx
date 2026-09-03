import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DarkChessGame from '../components/DarkChessGame';

describe('DarkChess LIGHT acceptance', () => {
  it('keeps the real 4×8 board while exposing shared mode and labelled controls', () => {
    const markup = renderToStaticMarkup(
      <DarkChessGame difficulty="NORMAL" onBack={() => undefined} />,
    );

    expect(markup).toContain('data-game-mode-selector="true"');
    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toMatch(/data-game-mode-option="PVE"[^>]*aria-pressed="true"/);
    expect(markup).toContain('aria-label="返回"');
    expect(markup).toContain('aria-label="悔棋"');
    expect(markup).toContain('aria-label="遊戲規則"');
    expect(markup).toContain('aria-label="重新開始"');
    expect((markup.match(/data-dark-chess-cell=/g) ?? [])).toHaveLength(32);
    expect((markup.match(/data-dark-chess-toolbar=/g) ?? [])).toHaveLength(4);
    expect(markup).toContain('data-dark-chess-piece-layer="true"');
  });
});
