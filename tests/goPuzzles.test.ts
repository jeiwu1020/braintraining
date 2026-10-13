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

  it('uses distinct, attributed SGF source problems instead of transformed duplicates', () => {
    const imported = PUBLISHED_GO_PUZZLES.filter(puzzle => puzzle.source?.originalId.startsWith('ggg-easy-'));

    expect(imported).toHaveLength(12);
    expect(imported.every(puzzle => puzzle.source?.license === 'CC BY-NC-SA 4.0')).toBe(true);
    expect(PUBLISHED_GO_PUZZLES.some(puzzle => /-(mirror|rotate)$/.test(puzzle.id))).toBe(false);
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

import { getGroupAndLiberties, getAdjacentPoints, playGoMove } from '../services/goEngine';
import { parsePuzzleBoard } from '../data/goPuzzles';

describe('Original life-and-death evidence', () => {
  it('strengthens four original shapes with replayable branches, without replacing their boards', () => {
    const originals = PUBLISHED_GO_PUZZLES.filter(p => ['two-eyes-1', 'bent-three-live', 'straight-three-kill', 'bent-three-kill'].includes(p.id));
    expect(originals).toHaveLength(4);
    for (const puzzle of originals) {
      const training = puzzle.training;
      expect(training, puzzle.id).toBeDefined();
      expect(puzzle.boardSize).toBe(9);
      expect(training.lines.length).toBeGreaterThanOrEqual(training.goal.kind === 'CAPTURE' ? 2 : 1);
      for (const line of training.lines) {
        let board = parsePuzzleBoard(puzzle.initialBoard), ko = null;
        for (const [index, point] of line.moves.entries()) {
          const result = playGoMove(board, point.r, point.c, index % 2 ? 'WHITE' : 'BLACK', ko);
          expect(result.isLegal, `${puzzle.id}/${line.id}/${index}`).toBe(true);
          board = result.nextBoard; ko = result.koPoint;
        }
        if (training.goal.kind === 'CAPTURE') {
          for (const point of training.goal.stones) expect(board[point.r][point.c]).not.toBe('WHITE');
        } else {
          expect(board[training.goal.anchor.r][training.goal.anchor.c]).toBe('BLACK');
          expect(new Set(training.goal.eyes.map(p => `${p.r},${p.c}`)).size).toBe(2);
          for (const eye of training.goal.eyes) {
            expect(board[eye.r][eye.c]).toBe('EMPTY');
            for (const edge of getAdjacentPoints(eye.r, eye.c, 9)) {
              expect(board[edge.r][edge.c]).toBe('BLACK');
              const liberties = getGroupAndLiberties(board, edge.r, edge.c).liberties;
              expect(training.goal.eyes.every(e => liberties.some(p => p.r === e.r && p.c === e.c))).toBe(true);
            }
            expect(playGoMove(board, eye.r, eye.c, 'WHITE').isLegal).toBe(false);
          }
        }
      }
    }
  });
  it('labels every remaining original/source problem as a first-move reference', () => {
    const references = PUBLISHED_GO_PUZZLES.filter(p => !p.training);
    expect(references).toHaveLength(16);
    expect(references.every(p => p.verification.note.includes('未完整驗證'))).toBe(true);
    expect(PUBLISHED_GO_PUZZLES.filter(p => p.source).every(p => p.boardSize === 19)).toBe(true);
  });
});
