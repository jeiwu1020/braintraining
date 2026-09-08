import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ConnectFourGame, {
  findConnectFourWinningCells,
  getConnectFourPreviewColor,
  getConnectFourValidRow,
} from '../components/ConnectFourGame';
import BoardSidebarLayout from '../components/game-ui/BoardSidebarLayout';

const emptyBoard = () => Array.from({ length: 6 }, () => Array(7).fill(0));

describe('ConnectFourGame board-sidebar migration', () => {
  it('wires the real game through the board-sidebar layout contract', () => {
    const board = emptyBoard();
    board[5][0] = 1;
    const markup = renderToStaticMarkup(
      <ConnectFourGame difficulty="NORMAL" initialBoard={board} onBack={() => undefined} />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="board-sidebar"');
    expect(markup).toContain('data-layout-region="board"');
    expect(markup).toContain('data-layout-region="sidebar"');
    expect(markup).not.toContain('data-layout-region="feedback"');
    expect(markup).toContain('四子棋');
    expect(markup).toContain('單人');
    expect(markup).toContain('紅方回合');
    expect(markup).toContain('在 A 欄落子');
    expect(markup).toContain('data-game-mode-selector="true"');
    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toMatch(/data-game-mode-option="PVE"[^>]*aria-pressed="true"/);
    expect(markup).not.toContain('切換遊戲模式');
    expect(markup).toContain('A');
    expect(markup).toContain('B');
    expect(markup).toContain('C');
    expect(markup).toContain('D');
    expect(markup).toContain('E');
    expect(markup).toContain('F');
    expect(markup).toContain('G');
    expect(markup.match(/data-column="[A-G]"/g)).toHaveLength(7);
    expect(markup.match(/data-connect-four-board-column-action="true"/g)).toHaveLength(7);
    expect(markup.match(/touch-auto/g)).toHaveLength(7);
    expect(markup.match(/data-connect-four-preview-on-pointerup="true"/g)).toHaveLength(7);
    expect(markup.match(/data-connect-four-hole="true"/g)).toHaveLength(42);
    expect(markup).toContain('aspect-square');
  });

  it('provides larger mobile column selectors with a preview-before-confirm flow', () => {
    const markup = renderToStaticMarkup(
      <ConnectFourGame difficulty="NORMAL" initialBoard={emptyBoard()} onBack={() => undefined} />,
    );

    expect(markup).toContain('data-connect-four-mobile-picker="true"');
    expect((markup.match(/data-column-picker="[A-G]"/g) ?? [])).toHaveLength(7);
    expect(markup).toContain('先選欄位，再確認落子');
    expect(markup).toContain('min-h-11');
  });

  it('gives the mobile confirmation controls a wider landscape sidebar', () => {
    const markup = renderToStaticMarkup(
      <ConnectFourGame difficulty="NORMAL" initialBoard={emptyBoard()} onBack={() => undefined} />,
    );

    expect(markup).toContain('connect-four-layout');
    expect(markup).toContain('min-h-12');
  });

  it('uses the active player color for a board-column preview', () => {
    expect(getConnectFourPreviewColor(true)).toBe('bg-red-500');
    expect(getConnectFourPreviewColor(false)).toBe('bg-yellow-400');
  });

  it('preserves gravity placement semantics', () => {
    const board = emptyBoard();
    expect(getConnectFourValidRow(board, 2)).toBe(5);
    board[5][2] = 1;
    expect(getConnectFourValidRow(board, 2)).toBe(4);
    for (let row = 0; row < 6; row += 1) board[row][2] = 1;
    expect(getConnectFourValidRow(board, 2)).toBe(-1);
  });

  it('keeps the shared feedback row optional when a game supplies feedback', () => {
    const markup = renderToStaticMarkup(
      <BoardSidebarLayout board={<div>board</div>} sidebar={<div>sidebar</div>} feedback={<span>status</span>} />,
    );

    expect(markup).toContain('data-layout-region="feedback"');
    expect(markup).toContain('status');
  });

  it('preserves horizontal, vertical, and diagonal win detection', () => {
    const horizontal = emptyBoard();
    horizontal[5].splice(0, 4, 1, 1, 1, 1);
    expect(findConnectFourWinningCells(horizontal, 1)).toHaveLength(4);

    const vertical = emptyBoard();
    for (let row = 2; row < 6; row += 1) vertical[row][3] = 2;
    expect(findConnectFourWinningCells(vertical, 2)).toHaveLength(4);

    const diagonal = emptyBoard();
    diagonal[5][0] = 1;
    diagonal[4][1] = 1;
    diagonal[3][2] = 1;
    diagonal[2][3] = 1;
    expect(findConnectFourWinningCells(diagonal, 1)).toHaveLength(4);
  });
});
