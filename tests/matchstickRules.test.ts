import { describe, expect, it } from 'vitest';
import { createMatchstickBoard, decodeMatchstickBoard, describeMatchstickPosition, getMatchstickPositions, moveMatchstick, solveMatchstick, validateMatchstickMove } from '../utils/matchstickRules';
import { MATCHSTICK_PUZZLES } from '../data/matchstickPuzzles';

describe('seven-segment matchstick rules', () => {
  it('round-trips every supported digit and both operators from actual segments', () => {
    for (let digit = 0; digit <= 9; digit += 1) {
      for (const operator of ['+', '-']) {
        const equation = `${digit}${operator}${digit}=${digit}`;
        expect(decodeMatchstickBoard(createMatchstickBoard(equation))?.equation).toBe(equation);
      }
    }
    expect(() => createMatchstickBoard('10+1=11')).toThrow();
  });

  it('moves exactly one physical segment and verifies arithmetic without a preset answer', () => {
    const board = createMatchstickBoard('6+4=4');
    const moved = moveMatchstick(board, { source: 'B2', target: 'A2' });
    expect(moved).not.toBeNull();
    expect(decodeMatchstickBoard(moved!)?.equation).toBe('8-4=4');
    expect(validateMatchstickMove(board, { source: 'B2', target: 'A2' }).valid).toBe(true);
    expect(Object.values(moved!).flat().length).toBe(Object.values(board).flat().length);
    expect(decodeMatchstickBoard(board)?.equation).toBe('6+4=4');
  });

  it('rejects occupied destinations, absent sources, invalid IDs, and edits to the fixed equals sign', () => {
    const board = createMatchstickBoard('6+4=4');
    for (const move of [
      { source: 'B2', target: 'A1' }, { source: 'A2', target: 'C1' },
      { source: 'D1', target: 'A2' }, { source: 'B2', target: 'D3' },
      { source: 'X1', target: 'A2' }, { source: 'B2', target: 'B2' },
    ]) expect(moveMatchstick(board, move)).toBeNull();
  });

  it('forbids only taking the plus horizontal bar, without adding other source restrictions', () => {
    const plus = createMatchstickBoard('6+4=4');
    expect(moveMatchstick(plus, { source: 'B1', target: 'A2' })).toBeNull();
    for (const source of getMatchstickPositions(plus, 'source').filter(id => id !== 'B1')) {
      expect(moveMatchstick(plus, { source, target: 'A2' })).not.toBeNull();
    }
    const minus = createMatchstickBoard('1-2=9');
    expect(moveMatchstick(minus, { source: 'B1', target: 'A1' })).not.toBeNull();
  });
  it('distinguishes unrecognisable shapes from a well-formed but false equation', () => {
    const board = createMatchstickBoard('6+4=4');
    expect(validateMatchstickMove(board, { source: 'A1', target: 'A2' })).toMatchObject({ valid: false, reason: 'SHAPE' });
    expect(validateMatchstickMove(board, { source: 'A5', target: 'E1' })).toMatchObject({ valid: false, reason: 'SHAPE' });
    expect(validateMatchstickMove(createMatchstickBoard('1+2=5'), { source: 'C5', target: 'C3' })).toMatchObject({ valid: false, reason: 'EQUATION', equation: '1+3=5' });
  });

  it('finds and accepts every different one-match solution, including within-digit and operator changes', () => {
    const board = createMatchstickBoard('1+2=5');
    const solutions = solveMatchstick(board);
    expect(solutions.map(solution => solution.equation).sort()).toEqual(['1+2=3', '7-2=5']);
    for (const solution of solutions) expect(validateMatchstickMove(board, solution).valid).toBe(true);
  });

  it('gives every segment a stable ID and a speakable token and position name', () => {
    const board = createMatchstickBoard('6+4=4');
    expect(describeMatchstickPosition(board, 'A2')).toBe('A2・左邊的 6・右上段');
    expect(describeMatchstickPosition(board, 'B2')).toBe('B2・加號・直棒');
    expect(getMatchstickPositions(board, 'source')).toContain('B2');
    expect(getMatchstickPositions(board, 'target')).toContain('A2');
    expect(getMatchstickPositions(board, 'source')).not.toContain('D1');
  });
});

describe('verified matchstick puzzle bank', () => {
  it('provides four puzzles per local tier with real one-match solutions', () => {
    expect(MATCHSTICK_PUZZLES).toHaveLength(12);
    for (const tier of ['BEGINNER', 'STANDARD', 'CHALLENGE']) {
      expect(MATCHSTICK_PUZZLES.filter(puzzle => puzzle.tier === tier)).toHaveLength(4);
    }
    expect(new Set(MATCHSTICK_PUZZLES.map(puzzle => puzzle.id)).size).toBe(12);
    for (const puzzle of MATCHSTICK_PUZZLES) {
      const board = createMatchstickBoard(puzzle.equation);
      expect(decodeMatchstickBoard(board)?.correct).toBe(false);
      const solutions = solveMatchstick(board, puzzle.guidedSource);
      expect(solutions.length).toBeGreaterThanOrEqual(puzzle.goal);
      for (const solution of solutions) expect(validateMatchstickMove(board, solution).valid).toBe(true);
      if (puzzle.tier === 'BEGINNER') expect(puzzle.guidedSource).toBeTruthy();
      if (puzzle.tier === 'CHALLENGE') expect(puzzle.goal).toBe(2);
    }
  });

  it('includes within-number, cross-number and operator reasoning in standard questions', () => {
    const techniques = MATCHSTICK_PUZZLES.filter(puzzle => puzzle.tier === 'STANDARD').flatMap(puzzle =>
      solveMatchstick(createMatchstickBoard(puzzle.equation)).map(move =>
        move.source[0] === move.target[0] ? 'WITHIN' : move.source[0] === 'B' || move.target[0] === 'B' ? 'OPERATOR' : 'ACROSS',
      ),
    );
    expect(new Set(techniques)).toEqual(new Set(['WITHIN', 'ACROSS', 'OPERATOR']));
  });
});
