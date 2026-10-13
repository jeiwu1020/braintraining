import { describe, expect, it } from 'vitest';
import { NONOGRAM_PUZZLES } from '../data/nonogramPuzzles';
import { analyzeNonogram, getNonogramClues, solveNonogram } from '../utils/nonogramRules';

describe('technique-graded unique nonogram bank', () => {
  it('contains three distinct picture puzzles per tier', () => {
    expect(NONOGRAM_PUZZLES).toHaveLength(9);
    expect(new Set(NONOGRAM_PUZZLES.map(puzzle => puzzle.id)).size).toBe(9);
    expect(new Set(NONOGRAM_PUZZLES.map(puzzle => puzzle.pattern.join(''))).size).toBe(9);
    for (const tier of ['BEGINNER', 'STANDARD', 'CHALLENGE']) expect(NONOGRAM_PUZZLES.filter(puzzle => puzzle.tier === tier)).toHaveLength(3);
  });
  it('proves each puzzle has exactly one complete solution and requires no guessing', () => {
    for (const puzzle of NONOGRAM_PUZZLES) {
      expect([5, 6]).toContain(puzzle.pattern.length);
      expect(puzzle).toHaveProperty('pictureName');
      expect(puzzle).toHaveProperty('pictureColor');
      expect(solveNonogram(puzzle.pattern), puzzle.id).toEqual([puzzle.pattern]);
      expect(analyzeNonogram(puzzle.pattern).solved, puzzle.id).toBe(true);
    }
  });
  it('grades inference structure instead of enlarging the board', () => {
    for (const puzzle of NONOGRAM_PUZZLES) {
      const analysis = analyzeNonogram(puzzle.pattern);
      if (puzzle.tier === 'BEGINNER') {
        expect(analysis.initialExact).toBeGreaterThanOrEqual(2);
        expect(analysis.rounds).toBeLessThanOrEqual(2);
      } else if (puzzle.tier === 'STANDARD') {
        expect(analysis.rounds).toBe(3);
        expect(analysis.cross).toBeGreaterThan(0);
      } else {
        expect(analysis.rounds).toBeGreaterThanOrEqual(5);
        expect(analysis.cross).toBeGreaterThan(0);
      }
    }
  });
});
