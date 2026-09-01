import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GameShell from '../components/game-ui/GameShell';

describe('GameShell', () => {
  it('provides the shared accessible structure for a landscape game', () => {
    const markup = renderToStaticMarkup(
      <GameShell
        title="測試遊戲"
        subtitle="觀察後再作答"
        status={<span>分數 3</span>}
        actions={<button type="button">提示</button>}
        onBack={() => undefined}
      >
        <section>主要操作區</section>
      </GameShell>,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('<header');
    expect(markup).toContain('<h1');
    expect(markup).toContain('測試遊戲');
    expect(markup).toContain('觀察後再作答');
    expect(markup).toContain('分數 3');
    expect(markup).toContain('提示');
    expect(markup).toContain('aria-label="返回遊戲目錄"');
    expect(markup).toContain('type="button"');
    expect(markup).toContain('<main');
    expect(markup).toContain('aria-label="測試遊戲遊戲區"');
    expect(markup).toContain('主要操作區');
  });

  it('lets a game provide a more specific back label', () => {
    const markup = renderToStaticMarkup(
      <GameShell title="測試遊戲" backLabel="返回選單" onBack={() => undefined}>
        內容
      </GameShell>,
    );

    expect(markup).toContain('aria-label="返回選單"');
  });
});
