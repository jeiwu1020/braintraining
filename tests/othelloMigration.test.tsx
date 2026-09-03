import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import OthelloGame, {
  applyOthelloMove,
  getOthelloValidMoves,
  isOthelloValidMove,
} from '../components/OthelloGame';

const emptyBoard = () => Array.from({ length: 8 }, () => Array(8).fill(0));

const initialBoard = () => {
  const board = emptyBoard();
  board[3][3] = 2;
  board[3][4] = 1;
  board[4][3] = 1;
  board[4][4] = 2;
  return board;
};

describe('OthelloGame board-sidebar migration', () => {
  it('wires the real game through the cell-based board-sidebar contract', () => {
    const markup = renderToStaticMarkup(
      <OthelloGame difficulty="NORMAL" initialBoard={initialBoard()} onBack={() => undefined} />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="board-sidebar"');
    expect(markup).toContain('data-layout-region="board"');
    expect(markup).toContain('data-layout-region="sidebar"');
    expect(markup).not.toContain('data-layout-region="feedback"');
    expect(markup).toContain('data-board-coordinate-model="cell"');
    expect((markup.match(/data-othello-cell=/g) ?? [])).toHaveLength(64);
    expect(markup).toContain('data-othello-cell="A1"');
    expect(markup).toContain('data-othello-cell="H8"');
    expect(markup).toContain('黑白棋');
    expect(markup).toContain('黑棋');
    expect(markup).toContain('白棋');
    expect((markup.match(/<strong class="text-lg">2<\/strong>/g) ?? [])).toHaveLength(2);
    expect(markup).toContain('黑方回合');
  });

  it('preserves initial legal moves, flipping, and invalid move semantics', () => {
    const board = initialBoard();
    const moves = getOthelloValidMoves(board, 1);
    expect(moves).toEqual([
      { r: 2, c: 3 },
      { r: 3, c: 2 },
      { r: 4, c: 5 },
      { r: 5, c: 4 },
    ]);
    expect(isOthelloValidMove(board, 0, 0, 1)).toBe(false);

    const nextBoard = applyOthelloMove(board, 2, 3, 1);
    expect(nextBoard[2][3]).toBe(1);
    expect(nextBoard[3][3]).toBe(1);
    expect(nextBoard[3][4]).toBe(1);
    expect(nextBoard[4][4]).toBe(2);
  });
});
