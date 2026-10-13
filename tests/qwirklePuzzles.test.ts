import { beforeAll, describe, expect, it } from 'vitest';
import { evaluateQwirkleMove, validateQwirkleBoard } from '../utils/qwirkleRules';
let data: typeof import('../data/qwirklePuzzles');
let api: typeof import('../utils/qwirkleRules');
beforeAll(async () => {
  data = await import('../data/qwirklePuzzles').catch(() => ({} as typeof data));
  api = await import('../utils/qwirkleRules');
});
describe('verified three-tier Qwirkle puzzle bank', () => {
  it('has three distinct, readable puzzles per tier and four visible warm-up choices', () => {
    expect(data.QWIRKLE_PUZZLES).toBeInstanceOf(Array);
    for (const tier of ['BEGINNER', 'STANDARD', 'CHALLENGE']) {
      const puzzles = data.QWIRKLE_PUZZLES.filter(p => p.tier === tier);
      expect(puzzles).toHaveLength(3);
      for (const puzzle of puzzles) {
        expect(validateQwirkleBoard(puzzle.board)).toEqual([]);
        expect(new Set(puzzle.targets.map(t => t.id)).size).toBe(puzzle.targets.length);
        expect(new Set(puzzle.hand.map(t => t.id)).size).toBe(puzzle.hand.length);
        expect(puzzle.hand).toHaveLength(4);
        expect(puzzle.hints).toHaveLength(2);
        const positions = [...puzzle.board, ...puzzle.targets];
        expect(Math.max(...positions.map(p => p.x)) - Math.min(...positions.map(p => p.x))).toBeLessThanOrEqual(5);
        expect(Math.max(...positions.map(p => p.y)) - Math.min(...positions.map(p => p.y))).toBeLessThanOrEqual(3);
      }
    }
    expect(new Set(data.QWIRKLE_PUZZLES.map(p => p.id)).size).toBe(9);
  });
  it('derives every accepted answer from board rules instead of hard-coded correct IDs', () => {
    expect(api.solveQwirklePuzzle).toBeTypeOf('function');
    for (const puzzle of data.QWIRKLE_PUZZLES) {
      const solutions = api.solveQwirklePuzzle(puzzle);
      expect(solutions.length, puzzle.id).toBeGreaterThan(0);
      for (const solution of solutions) {
        let board = puzzle.board;
        let total = 0;
        for (const move of solution.moves) {
          const result = evaluateQwirkleMove(board, move.tile, move.target);
          expect(result.valid, `${puzzle.id}:${move.target.id}`).toBe(true);
          total += result.score;
          board = [...board, { ...move.target, tile: move.tile }];
        }
        expect(solution.score).toBe(total);
      }
    }
  });
  it('requires both axes in standard solutions and has genuinely suboptimal two-step plans in challenges', () => {
    expect(api.solveQwirklePuzzle).toBeTypeOf('function');
    for (const puzzle of data.QWIRKLE_PUZZLES.filter(p => p.tier === 'STANDARD')) {
      const solutions = api.solveQwirklePuzzle(puzzle);
      for (const solution of solutions) {
        const move = solution.moves[0];
        const result = evaluateQwirkleMove(puzzle.board, move.tile, move.target);
        expect(result.horizontal).toBeGreaterThan(1);
        expect(result.vertical).toBeGreaterThan(1);
      }
      expect(puzzle.targets.length).toBeGreaterThan(1);
    }
    for (const puzzle of data.QWIRKLE_PUZZLES.filter(p => p.tier === 'CHALLENGE')) {
      expect(puzzle.nextTile).toBeDefined();
      const solutions = api.solveQwirklePuzzle(puzzle);
      const firstMoves = puzzle.hand.flatMap(tile => puzzle.targets.filter(target => evaluateQwirkleMove(puzzle.board, tile, target).valid).map(target => ({ tile, target })));
      const hasDeadEnd = firstMoves.some(move => !solutions.some(solution => solution.moves[0].tile.id === move.tile.id && solution.moves[0].target.id === move.target.id));
      expect(new Set(solutions.map(solution => solution.score)).size > 1 || hasDeadEnd, puzzle.id).toBe(true);
      expect(solutions.every(solution => solution.moves.length === 2)).toBe(true);
      expect(firstMoves.length).toBeGreaterThan(1);
    }
    const trap = data.QWIRKLE_PUZZLES.find(p => p.id === 'plan-corner')!;
    const highestImmediate = Math.max(...trap.hand.flatMap(tile => trap.targets.map(target => evaluateQwirkleMove(trap.board, tile, target).score)));
    const bestFirst = api.solveQwirklePuzzle(trap)[0].moves[0];
    expect(evaluateQwirkleMove(trap.board, bestFirst.tile, bestFirst.target).score).toBeLessThan(highestImmediate);
  });
});
