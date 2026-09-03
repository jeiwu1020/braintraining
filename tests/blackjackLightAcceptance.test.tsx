import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import BlackjackGame from '../components/BlackjackGame';

describe('Blackjack LIGHT acceptance', () => {
  it('keeps the dedicated BOARD_TABLE setup contract and compact controls', () => {
    const markup = renderToStaticMarkup(
      <BlackjackGame difficulty="NORMAL" onBack={() => undefined} />,
    );
    const source = readFileSync(new URL('../components/BlackjackGame.tsx', import.meta.url), 'utf8');
    const globalStyles = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

    expect(markup).toContain('data-blackjack-screen="setup"');
    expect(markup).toContain('公開 21 點');
    expect(markup).toContain('自訂回合數');
    expect(markup).toContain('合作對抗莊家');
    expect(markup).toContain('雙組同步對抗');
    expect(markup).toContain('aria-label="返回模式選單"');
    expect(markup).toContain('data-blackjack-mode="DEALER"');
    expect(markup).toContain('data-blackjack-mode="PVP"');

    expect(source).toContain('data-blackjack-screen="play"');
    expect(source).toContain('data-blackjack-screen="gameover"');
    expect(source).toContain('data-blackjack-action="hit"');
    expect(source).toContain('data-blackjack-action="stand"');
    expect(source).toContain('data-blackjack-action="execute"');
    expect(source).toContain('data-blackjack-action="next-round"');
    expect(source).toContain('data-blackjack-action="return-menu"');
    expect(source).toContain('data-blackjack-player={isP1?\'P1\':\'P2\'}');
    expect(source).toContain('aria-label="返回選單"');
    expect(source).toContain('aria-label="遊戲規則"');
    expect(source).toContain('aria-label="執行回合"');
    expect(source).not.toContain('GameModeSelector');
    expect(source).toContain('orientation: landscape');
    expect(source).toContain('max-height: 480px');
    expect(source).not.toContain('max-width:700px');
    expect(source).not.toContain('max-[700px]:landscape');
    expect(source).toContain('aspect-[2/3]');
    expect(source).toContain('min-h-11');

    expect(globalStyles).toContain('(min-height: 371px) and (max-height: 480px)');
    expect(globalStyles).toContain('.blackjack-card');
    expect(globalStyles).toContain('width: 64px !important');
    expect(globalStyles).toContain('height: 96px !important');
    expect(globalStyles).toContain('justify-content: center !important');
  });
});
