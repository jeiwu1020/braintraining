import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MancalaGame from '../components/MancalaGame';

describe('Mancala LIGHT acceptance', () => {
  it('keeps the wide board while exposing shared mode and accessible controls', () => {
    const markup = renderToStaticMarkup(
      <MancalaGame difficulty="NORMAL" onBack={() => undefined} />,
    );

    expect(markup).toContain('data-game-mode-selector="true"');
    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toMatch(/data-game-mode-option="PVE"[^>]*aria-pressed="true"/);
    expect((markup.match(/data-mancala-pit=/g) ?? [])).toHaveLength(12);
    expect(markup).toContain('data-mancala-board="true"');
    expect(markup).toContain('data-mancala-store="P1"');
    expect(markup).toContain('data-mancala-store="P2"');
    expect((markup.match(/>A<|>B<|>C<|>D<|>E<|>F</g) ?? [])).toHaveLength(12);
    expect(markup).toContain('aria-label="返回"');
    expect(markup).toContain('aria-label="重新開始"');
  });
});
