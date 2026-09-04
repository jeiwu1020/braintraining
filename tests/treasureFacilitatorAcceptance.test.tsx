import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import TreasureGame, {
  applyCellScore,
  buildTreasureCells,
  calculateTimeBonus,
  countAdjacentTreasures,
  hasFoundAllTreasures,
  PREVIEW_SECONDS_MAX,
  PREVIEW_SECONDS_MIN,
  TREASURE_GAME_RULES,
} from '../components/TreasureGame';

describe('Treasure facilitator LIGHT acceptance', () => {
  it('keeps the normal and advanced board contracts deterministic', () => {
    expect(TREASURE_GAME_RULES.NORMAL).toEqual({ gridSize: 4, totalTreasures: 5, bombCount: 0 });
    expect(TREASURE_GAME_RULES.ADVANCED).toEqual({ gridSize: 5, totalTreasures: 7, bombCount: 4 });

    const normalCells = buildTreasureCells(4, 5, 0, () => 0.5);
    const advancedCells = buildTreasureCells(5, 7, 4, () => 0.5);

    expect(normalCells).toHaveLength(16);
    expect(new Set(normalCells.map(cell => cell.emoji)).size).toBe(16);
    expect(normalCells.filter(cell => cell.type === 'TREASURE')).toHaveLength(5);
    expect(normalCells.filter(cell => cell.type === 'BOMB')).toHaveLength(0);

    expect(advancedCells).toHaveLength(25);
    expect(new Set(advancedCells.map(cell => cell.emoji)).size).toBe(25);
    expect(advancedCells.filter(cell => cell.type === 'TREASURE')).toHaveLength(7);
    expect(advancedCells.filter(cell => cell.type === 'BOMB')).toHaveLength(4);
  });

  it('preserves scoring, radar adjacency, time bonus, and completion semantics', () => {
    expect(applyCellScore(0, 'TREASURE')).toBe(10);
    expect(applyCellScore(20, 'BOMB')).toBe(15);
    expect(applyCellScore(3, 'BOMB')).toBe(0);
    expect(applyCellScore(20, 'EMPTY')).toBe(20);
    expect(calculateTimeBonus(0)).toBe(50);
    expect(calculateTimeBonus(49)).toBe(1);
    expect(calculateTimeBonus(50)).toBe(0);
    expect(calculateTimeBonus(90)).toBe(0);
    expect(hasFoundAllTreasures(4, 5)).toBe(false);
    expect(hasFoundAllTreasures(5, 5)).toBe(true);

    const cells = buildTreasureCells(4, 0, 0, () => 0.5).map(cell => ({ ...cell, type: 'EMPTY' as const }));
    cells[1].type = 'TREASURE';
    cells[10].type = 'TREASURE';
    cells[15].type = 'BOMB';
    expect(countAdjacentTreasures(6, cells, 4)).toBe(2);
  });

  it('renders the dedicated safe stage, compact setup controls, and named cells', () => {
    const markup = renderToStaticMarkup(
      <TreasureGame difficulty="NORMAL" onBack={() => undefined} />,
    );
    const source = readFileSync('components/TreasureGame.tsx', 'utf8');
    const css = readFileSync('index.css', 'utf8');

    expect(markup).toContain('data-treasure-root="true"');
    expect(markup).toContain('data-treasure-safe-stage="true"');
    expect(markup).toContain('data-treasure-setup="true"');
    expect(markup).toContain('開局預覽寶藏位置');
    expect(markup).toContain('開啟雷達提示');
    expect(markup).toContain('開始遊戲');
    expect(markup).toContain('aria-label="返回遊戲選單"');
    expect(markup).toContain('aria-label="重新開始"');
    expect(markup).toContain('aria-label="減少預覽時間"');
    expect(markup).toContain('aria-label="增加預覽時間"');

    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('min-h-[100dvh]');
    expect(source).toContain('max-h-[100dvh]');
    expect(source).toContain('overflow-hidden');
    expect(source).toContain('app-safe-screen');
    expect(source).toContain('data-treasure-layout');
    expect(source).toContain('data-treasure-header');
    expect(source).toContain('data-treasure-stage');
    expect(source).toContain('data-treasure-status');
    expect(source).toContain('data-treasure-grid');
    expect(source).toContain('data-treasure-gameover');
    expect(source).toContain('min-h-11 min-w-11');
    expect(source).toContain('const [enablePreview, setEnablePreview] = useState(true)');
    expect(source).toContain('const [enableRadar, setEnableRadar] = useState(false)');
    expect(source).toContain('const [previewSeconds, setPreviewSeconds] = useState(3)');
    expect(source).toContain('setScore(0)');
    expect(source).toContain('setTreasuresFound(0)');
    expect(source).toContain('setElapsedSeconds(0)');
    expect(source).toContain('setGameState(\'PREVIEW\')');
    expect(source).toContain('previewSeconds * 1000');
    expect(source).toContain('setGameState(\'PLAYING\')');
    expect(source).toContain('setElapsedSeconds(s => s + 1)');
    expect(source).toContain("type === 'EMPTY' && enableRadar");
    expect(source).not.toContain('landscape:max-w-[60vh]');
    expect(source).not.toContain('landscape:max-h-[60vh]');
    expect(source).not.toContain('GameShell');
    expect(source).toContain('尚未挖掘');
    expect(source).toContain('cell.type === \'TREASURE\'');
    expect(source).toContain('cell.type === \'BOMB\'');

    expect(css).toContain('[data-treasure-root]');
    expect(css).toContain('[data-treasure-stage]');
    expect(css).toContain('[data-treasure-grid]');
    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).not.toContain('.treasure-grid { max-height: 60vh');
    expect(PREVIEW_SECONDS_MIN).toBe(1);
    expect(PREVIEW_SECONDS_MAX).toBe(10);
  });
});
