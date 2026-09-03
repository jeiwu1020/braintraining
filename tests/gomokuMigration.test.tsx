import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GomokuGame, { findGomokuWinningLine } from '../components/GomokuGame';

const emptyBoard = () => Array.from({ length: 10 }, () => Array(10).fill(0));

describe('GomokuGame board-sidebar migration', () => {
  it('wires the real game through the board-sidebar layout contract', () => {
    const board = emptyBoard();
    board[0][0] = 1;
    const markup = renderToStaticMarkup(
      <GomokuGame difficulty="NORMAL" initialBoard={board} onBack={() => undefined} />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="board-sidebar"');
    expect(markup).toContain('data-layout-region="board"');
    expect(markup).toContain('data-layout-region="sidebar"');
    expect(markup).toContain('data-layout-region="feedback"');
    expect(markup).toContain('五子棋');
    expect(markup).toContain('目前模式：單人');
    expect(markup).toContain('黑棋回合');
    expect(markup).toContain('A1');
    expect(markup).toContain('A1，黑棋');
    expect(markup).toContain('在 B1 落黑棋');
  });

  it('preserves horizontal, vertical, and both diagonal five-in-a-row rules', () => {
    const horizontal = emptyBoard();
    horizontal[5].splice(1, 5, 1, 1, 1, 1, 1);
    expect(findGomokuWinningLine(horizontal, 1)).toHaveLength(5);

    const vertical = emptyBoard();
    for (let row = 1; row < 6; row += 1) vertical[row][4] = 2;
    expect(findGomokuWinningLine(vertical, 2)).toHaveLength(5);

    const diagonalDown = emptyBoard();
    for (let i = 0; i < 5; i += 1) diagonalDown[2 + i][1 + i] = 1;
    expect(findGomokuWinningLine(diagonalDown, 1)).toHaveLength(5);

    const diagonalUp = emptyBoard();
    for (let i = 0; i < 5; i += 1) diagonalUp[7 - i][1 + i] = 2;
    expect(findGomokuWinningLine(diagonalUp, 2)).toHaveLength(5);
  });
});
