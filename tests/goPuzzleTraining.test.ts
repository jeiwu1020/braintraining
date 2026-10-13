import { describe, expect, it } from 'vitest';
import { PUBLISHED_GO_PUZZLES, parsePuzzleBoard, validatePuzzleDefinitions, type GoPuzzle } from '../data/goPuzzles';
import { advancePuzzle, hasPuzzleGoal, nextPuzzleMoves, validatePuzzleTraining, type GoPuzzlePosition } from '../utils/goPuzzleTraining';

const puzzle = (id: string) => PUBLISHED_GO_PUZZLES.find(p => p.id === id)!;
const initial = (p: GoPuzzle): GoPuzzlePosition => ({ board: parsePuzzleBoard(p.initialBoard), moves: [], koPoint: null, status: 'UNSOLVED', feedback: '' });
const clone = (p: GoPuzzle) => structuredClone(p);

describe('Original Go puzzle branch evaluator', () => {
  it('replays every declared branch to its actual board goal without changing the source', () => {
    for (const p of PUBLISHED_GO_PUZZLES.filter(item => item.training)) {
      const source = JSON.stringify(p);
      for (const line of p.training!.lines) {
        let position = initial(p);
        for (const [index, move] of line.moves.entries()) {
          position = advancePuzzle(p, position, move);
          expect(position.moves).toHaveLength(index + 1);
          expect(position.status).toBe(index === line.moves.length - 1 ? 'CORRECT' : 'UNSOLVED');
        }
        expect(hasPuzzleGoal(position.board, p.training!.goal)).toBe(true);
      }
      expect(JSON.stringify(p)).toBe(source);
    }
  });
  it('returns only the legal recorded replies for the selected prefix', () => {
    const p = puzzle('straight-three-kill');
    expect(nextPuzzleMoves(p, [])).toEqual([{ r: 1, c: 1 }]);
    expect(nextPuzzleMoves(p, [{ r: 1, c: 1 }])).toEqual([{ r: 1, c: 0 }, { r: 1, c: 2 }]);
    expect(nextPuzzleMoves(p, [{ r: 1, c: 1 }, { r: 1, c: 2 }])).toEqual([{ r: 1, c: 0 }]);
    expect(nextPuzzleMoves(p, [{ r: 8, c: 8 }])).toEqual([]);
  });
  it('preserves board and progress for occupied, out-of-bounds, and unlisted legal choices', () => {
    const p = puzzle('two-eyes-1'), start = initial(p);
    for (const move of [{ r: 0, c: 0 }, { r: -1, c: 0 }, { r: NaN, c: 0 }, { r: 8, c: 8 }]) {
      const next = advancePuzzle(p, start, move);
      expect(next.board).toBe(start.board); expect(next.moves).toBe(start.moves);
      expect(next.status).toBe('UNSOLVED'); expect(next.feedback.length).toBeGreaterThan(0);
    }
    expect(advancePuzzle(p, start, { r: 8, c: 8 }).feedback).toContain('合法，但未收錄');
  });
  it('does not accept another move after completion', () => {
    const p = puzzle('two-eyes-1'), done = advancePuzzle(p, initial(p), { r: 1, c: 1 });
    expect(advancePuzzle(p, done, { r: 8, c: 8 })).toBe(done);
  });
  it('keeps source first-move acceptance explicitly separate from proof', () => {
    const p = puzzle('ggg-easy-01'); const next = advancePuzzle(p, initial(p), p.solutionMoves[0].playerMove);
    expect(next.status).toBe('CORRECT'); expect(next.feedback).toContain('符合參考首手'); expect(next.feedback).toContain('未完整驗證'); expect(p.training).toBeUndefined();
  });
});

describe('Evidence validation rejects bad variations and false outcomes', () => {
  it('rejects a legal truncated kill line that has not actually captured its target', () => {
    const p = clone(puzzle('straight-three-kill')); p.training!.lines[0].moves = [{ r: 1, c: 1 }];
    expect(validatePuzzleDefinitions([p]).join()).toContain('終局未達成');
    expect(advancePuzzle(p, initial(p), { r: 1, c: 1 }).status).toBe('UNSOLVED');
  });
  it('rejects an occupied reply, an unlisted first move, even-length line, duplicate IDs and missing lines', () => {
    const p = clone(puzzle('straight-three-kill'));
    p.training!.lines[0].moves[1] = { r: 0, c: 0 };
    expect(validatePuzzleDefinitions([p]).join()).toContain('非法著');
    p.training!.lines = [{ id: 'bad', moves: [{ r: 8, c: 8 }, { r: 8, c: 7 }] }, { id: 'bad', moves: [{ r: 8, c: 8 }] }];
    const errors = validatePuzzleDefinitions([p]).join();
    expect(errors).toContain('以黑方開始及結束'); expect(errors).toContain('ID 重複'); expect(errors).toContain('首手不在參考');
    p.training!.lines = []; expect(validatePuzzleDefinitions([p]).join()).toContain('缺少驗證變化');
  });
  it('rejects malformed first moves as issues rather than throwing or indexing through an invalid row', () => {
    for (const point of [{ r: NaN, c: 0 }, { r: 1.5, c: 1 }, { r: 0, c: NaN }]) {
      const p = clone(puzzle('two-eyes-1')); p.acceptedMoves = [point];
      expect(() => validatePuzzleDefinitions([p])).not.toThrow();
      expect(validatePuzzleDefinitions([p]).join()).toContain('非法著');
    }
  });
  it('rejects goals whose target is empty, missing, occupied, duplicated or not the protected black group', () => {
    const capture = clone(puzzle('straight-three-kill')); capture.training!.goal = { kind: 'CAPTURE', stones: [] };
    expect(validatePuzzleDefinitions([capture]).join()).toContain('提子目標');
    capture.training!.goal = { kind: 'CAPTURE', stones: [{ r: 8, c: 8 }] };
    expect(validatePuzzleDefinitions([capture]).join()).toContain('提子目標');
    const p = puzzle('two-eyes-1'), done = advancePuzzle(p, initial(p), { r: 1, c: 1 });
    expect(hasPuzzleGoal(done.board, { kind: 'TWO_EYES', anchor: { r: 8, c: 8 }, eyes: [{ r: 1, c: 0 }, { r: 1, c: 2 }] })).toBe(false);
    expect(hasPuzzleGoal(done.board, { kind: 'TWO_EYES', anchor: { r: 0, c: 0 }, eyes: [{ r: 1, c: 0 }, { r: 1, c: 0 }] })).toBe(false);
    expect(hasPuzzleGoal(done.board, { kind: 'TWO_EYES', anchor: { r: 0, c: 0 }, eyes: [{ r: 1, c: 0 }, { r: 1, c: 1 }] })).toBe(false);
    const broken = done.board.map(row => [...row]); broken[0][2] = 'WHITE';
    expect(hasPuzzleGoal(broken, p.training!.goal)).toBe(false);
  });
  it('carries ko through a line instead of treating every ply as a new setup', () => {
    const p = clone(puzzle('straight-three-kill'));
    p.boardSize = 5; p.initialBoard = ['.BW..', 'BW.W.', '.BW..', '.....', '.....'];
    p.acceptedMoves = [{ r: 1, c: 2 }];
    p.training = { scope: 'test fixture', goal: { kind: 'CAPTURE', stones: [{ r: 1, c: 1 }] }, lines: [{ id: 'ko', moves: [{ r: 1, c: 2 }, { r: 1, c: 1 }, { r: 4, c: 4 }] }] };
    expect(validatePuzzleTraining(p, parsePuzzleBoard(p.initialBoard)).join()).toContain('非法著');
    const afterCapture = advancePuzzle(p, initial(p), { r: 1, c: 2 });
    expect(afterCapture.koPoint).toEqual({ r: 1, c: 1 });
    expect(advancePuzzle(p, afterCapture, { r: 1, c: 1 }).moves).toHaveLength(1);
  });
});
