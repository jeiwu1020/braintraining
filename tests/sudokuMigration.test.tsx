import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SudokuGame, { findSudokuNextTarget, getSudokuValidNumbersCount, SudokuCell } from '../components/SudokuGame';

const puzzle4 = [
  [1, null, 3, 4],
  [3, 4, null, 2],
  [2, 1, 4, null],
  [4, 3, 2, 1],
];
const solution4 = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];
const cells = (puzzle: (number | null)[][]): SudokuCell[][] => puzzle.map(row => row.map(value => ({ value, isFixed: value !== null, isError: false })));

describe('SudokuGame board-sidebar migration', () => {
  it('wires the real normal game through the cell-based board-sidebar contract', () => {
    const markup = renderToStaticMarkup(<SudokuGame difficulty="NORMAL" initialPuzzle={puzzle4} initialSolution={solution4} onBack={() => undefined} />);
    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="board-sidebar"');
    expect(markup).toContain('data-layout-region="board"');
    expect(markup).toContain('data-layout-region="sidebar"');
    expect(markup).not.toContain('data-layout-region="feedback"');
    expect(markup).toContain('data-board-coordinate-model="cell"');
    expect(markup).toContain('data-sudoku-grid-size="4"');
    expect(markup).toContain('data-subgrid-size="2"');
    expect((markup.match(/data-sudoku-cell=/g) ?? [])).toHaveLength(16);
    expect(markup).toContain('data-sudoku-cell="A1"');
    expect(markup).toContain('data-sudoku-cell="D4"');
    expect(markup).toContain('數獨');
    expect(markup).toContain('一般');
    expect(markup).toContain('分數');
    expect(markup).toContain('自動選格');
  });

  it('renders all 81 advanced cells without moving them into a feedback region', () => {
    const advanced = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1));
    const puzzle = advanced.map(row => row.map(() => null));
    const markup = renderToStaticMarkup(<SudokuGame difficulty="ADVANCED" initialPuzzle={puzzle} initialSolution={advanced} onBack={() => undefined} />);
    expect(markup).toContain('data-sudoku-grid-size="9"');
    expect(markup).toContain('data-subgrid-size="3"');
    expect((markup.match(/data-sudoku-cell=/g) ?? [])).toHaveLength(81);
    expect(markup).not.toContain('data-layout-region="feedback"');
  });

  it('preserves row, column, and subgrid candidate constraints for auto targeting', () => {
    const current = cells(puzzle4);
    expect(getSudokuValidNumbersCount(current, 0, 1, 4, 2)).toBe(1);
    expect(findSudokuNextTarget(current, 4, 2)).toEqual({ r: 0, c: 1 });
  });
});
