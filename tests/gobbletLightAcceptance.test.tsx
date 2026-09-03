import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GobbletGame from '../components/GobbletGame';

describe('Gobblet LIGHT acceptance', () => {
  it('keeps the dual-inventory 3×3 layout with shared mode and labelled controls', () => {
    const markup = renderToStaticMarkup(
      <GobbletGame difficulty="NORMAL" onBack={() => undefined} />,
    );

    expect(markup).toContain('data-gobblet-layout="inventory-board-inventory"');
    expect(markup).toContain('data-game-mode-selector="true"');
    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toMatch(/data-game-mode-option="PVE"[^>]*aria-pressed="true"/);

    expect((markup.match(/data-gobblet-cell=/g) ?? [])).toHaveLength(9);
    expect(markup).toContain('data-gobblet-inventory-player="1"');
    expect(markup).toContain('data-gobblet-inventory-player="2"');
    expect((markup.match(/data-gobblet-inventory-player="1" data-gobblet-piece-size=/g) ?? [])).toHaveLength(6);
    expect((markup.match(/data-gobblet-inventory-player="2" data-gobblet-piece-size=/g) ?? [])).toHaveLength(6);
    expect(markup).toContain('data-gobblet-cell="A1"');
    expect(markup).toContain('aria-label="A1，空位"');

    expect(markup).toContain('aria-label="返回"');
    expect(markup).toContain('aria-label="悔棋"');
    expect(markup).toContain('aria-label="遊戲規則"');
    expect(markup).toContain('aria-label="重新開始"');
  });
});
