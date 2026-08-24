import { describe, expect, it } from 'vitest';
import { PUBLISHED_GO_PUZZLES, validatePuzzleDefinitions } from '../data/goPuzzles';
import { shouldUseOpeningBook } from '../services/goEngine';
import { removeGoGroup } from '../services/goEngine';

describe('Go puzzle catalogue', () => {
  it('contains only verified, legal first-move solutions', () => {
    expect(PUBLISHED_GO_PUZZLES.length).toBeGreaterThan(0);
    expect(PUBLISHED_GO_PUZZLES.map(puzzle => puzzle.id)).not.toContain('wedge-tesuji');
    expect(PUBLISHED_GO_PUZZLES.map(puzzle => puzzle.id)).not.toContain('cross-cut-tesuji');
    expect(validatePuzzleDefinitions(PUBLISHED_GO_PUZZLES)).toEqual([]);
  });
});

describe('High-level Go AI', () => {
  it('does not force a hand-written joseki before evaluating the position', () => {
    expect(shouldUseOpeningBook('HARD')).toBe(false);
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
