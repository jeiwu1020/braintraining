import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TrafficJamGame from '../components/TrafficJamGame';
import MinesweeperGame, { MinesweeperStatusCard } from '../components/MinesweeperGame';
import NonogramGame from '../components/NonogramGame';
import HanoiGame from '../components/HanoiGame';
import LogicDetectiveGame from '../components/LogicDetectiveGame';
import MatchstickGame from '../components/MatchstickGame';
import WordPathGame from '../components/WordPathGame';
import NimGame from '../components/NimGame';

const games = [
  ['塞車解謎', TrafficJamGame],
  ['合作踩地雷', MinesweeperGame],
  ['數織彩繪', NonogramGame],
  ['河內塔', HanoiGame],
  ['邏輯線索偵探', LogicDetectiveGame],
  ['移動火柴棒', MatchstickGame],
  ['字詞路徑', WordPathGame],
  ['取石子策略', NimGame],
] as const;

describe('new facilitated games', () => {
  it.each(games)('%s exposes facilitator controls, instructions, mode, and persistent activity feedback', (title, Component) => {
    const markup = renderToStaticMarkup(<Component difficulty="NORMAL" onBack={() => undefined} />);

    expect(markup).toContain(`aria-label="${title}遊戲區"`);
    expect(markup).toContain('aria-label="開啟遊戲說明"');
    expect(markup).toMatch(/aria-label="(?:復原上一步|誤觸復原)"/);
    expect(markup).toMatch(/aria-label="(?:重新開始|換新盤面)"/);
    expect(markup).toContain('aria-label="取得提示"');
    expect(markup).toContain('data-facilitated-mode-selector="true"');
    expect(markup).toContain('最近操作');
  });

  it('keeps coordinate labels visible on every grid-based activity', () => {
    const components = [TrafficJamGame, MinesweeperGame, NonogramGame, LogicDetectiveGame, WordPathGame];
    for (const Component of components) {
      const markup = renderToStaticMarkup(<Component difficulty="NORMAL" onBack={() => undefined} />);
      expect(markup).toContain('data-coordinate-grid="true"');
      expect(markup).toContain('aria-label="A1"');
    }
  });

  it('labels rods, match locations, and stone piles for spoken instructions', () => {
    expect(renderToStaticMarkup(<HanoiGame difficulty="NORMAL" onBack={() => undefined} />)).toContain('aria-label="柱子 A"');
    expect(renderToStaticMarkup(<MatchstickGame difficulty="NORMAL" onBack={() => undefined} />)).toContain('火柴 B2');
    expect(renderToStaticMarkup(<NimGame difficulty="NORMAL" onBack={() => undefined} />)).toContain('aria-label="石堆 A"');
  });

  it('starts Minesweeper covered and reserves undo for facilitator mis-taps', () => {
    const markup = renderToStaticMarkup(<MinesweeperGame difficulty="NORMAL" onBack={() => undefined} />);
    expect(markup.match(/，未翻開/g)).toHaveLength(36);
    expect(markup).toContain('aria-label="誤觸復原"');
    expect(markup).toContain('第一次請直接選擇座標');
    expect(markup).toContain('aria-label="換新盤面"');
    expect(markup).not.toMatch(/>換新盤面<\/button>/);
  });

  it('offers another round only inside the completed Minesweeper status card', () => {
    const markup = renderToStaticMarkup(
      <MinesweeperStatusCard result="WON" mode="TEAMS" scores={{ A: 4, B: 2 }} onContinue={() => undefined} onReset={() => undefined} />,
    );
    expect(markup).toContain('A 組獲勝');
    expect(markup).toContain('>再來一局</button>');
  });

  it.each(games)('%s keeps an independently scrollable board region on short landscape screens', (_title, Component) => {
    const markup = renderToStaticMarkup(<Component difficulty="ADVANCED" onBack={() => undefined} />);
    expect(markup).toMatch(/data-layout-region="board"[^>]*class="[^"]*!overflow-auto/);
  });
});
