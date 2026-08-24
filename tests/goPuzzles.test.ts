import { describe, expect, it } from 'vitest';
import { PUBLISHED_GO_PUZZLES, validatePuzzleDefinitions } from '../data/goPuzzles';
import { shouldUseOpeningBook } from '../services/goEngine';
import { removeGoGroup } from '../services/goEngine';

describe('Go puzzle catalogue', () => {
  it('contains only verified, legal first-move solutions', () => {
    expect(PUBLISHED_GO_PUZZLES.length).toBeGreaterThanOrEqual(20);
    expect(PUBLISHED_GO_PUZZLES.map(puzzle => puzzle.id)).not.toContain('wedge-tesuji');
    expect(PUBLISHED_GO_PUZZLES.map(puzzle => puzzle.id)).not.toContain('cross-cut-tesuji');
    expect(validatePuzzleDefinitions(PUBLISHED_GO_PUZZLES)).toEqual([]);
  });
});

describe('High-level Go AI', () => {
  it('uses opening priorities only during the early game', () => {
    const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill('EMPTY')) as any;
    const midGameBoard = emptyBoard.map((row: string[]) => [...row]);
    for (let i = 0; i < 10; i++) midGameBoard[Math.floor(i / 9)][i % 9] = i % 2 ? 'WHITE' : 'BLACK';

    expect(shouldUseOpeningBook('HARD', emptyBoard)).toBe(true);
    expect(shouldUseOpeningBook('HARD', midGameBoard)).toBe(false);
  });
});

describe('Final scoring review', () => {
  it('removes an entire marked dead group before territory is counted', () => {
    const board = [
      ['BLACK', 'WHITE', 'WHITE'],
      ['BLACK', 'WHITE', 'EMPTY'],
      ['EMPTY', 'EMPTY', 'EMPTY'],
    ] as const;

    const result = removeGoGroup(board.map(row => [...row]), 0, 1);

    expect(result.removedColor).toBe('WHITE');
    expect(result.removedCount).toBe(3);
    expect(result.board[0][1]).toBe('EMPTY');
    expect(result.board[1][1]).toBe('EMPTY');
  });
});
