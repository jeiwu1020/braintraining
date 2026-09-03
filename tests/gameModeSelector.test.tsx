import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GameModeSelector from '../components/game-ui/GameModeSelector';

describe('GameModeSelector', () => {
  it('always renders both mode options with explicit PVE selection', () => {
    const markup = renderToStaticMarkup(<GameModeSelector value="PVE" onChange={() => undefined} />);

    expect(markup).toContain('data-game-mode-selector="true"');
    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toContain('單人');
    expect(markup).toContain('雙人');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('aria-pressed="false"');
  });

  it('marks PVP as selected without removing the PVE option', () => {
    const markup = renderToStaticMarkup(<GameModeSelector value="PVP" onChange={() => undefined} />);

    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toMatch(/data-game-mode-option="PVP"[^>]*aria-pressed="true"/);
    expect(markup).toMatch(/data-game-mode-option="PVE"[^>]*aria-pressed="false"/);
  });
});
