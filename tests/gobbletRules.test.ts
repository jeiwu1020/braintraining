import { describe, expect, it } from 'vitest';
import {
  applyGobbletMove,
  type GobbletBoard,
  type GobbletPiece,
} from '../services/gobblet';

const piece = (
  player: 1 | 2,
  size: 0 | 1 | 2,
  id: string,
): GobbletPiece => ({ player, size, id });

const boardWith = (stacks: Partial<Record<number, GobbletPiece[]>>): GobbletBoard =>
  Array.from({ length: 9 }, (_, index) => [...(stacks[index] ?? [])]);

describe('Gobblet Gobblers move resolution', () => {
  it('awards the opponent when a move exposes their line even if the mover also forms a line', () => {
    const board = boardWith({
      0: [piece(1, 0, 'a-0')],
      1: [piece(1, 0, 'a-1')],
      6: [piece(2, 0, 'b-6')],
      7: [piece(2, 0, 'b-7')],
      8: [piece(2, 0, 'b-hidden'), piece(1, 1, 'a-moving')],
    });

    const result = applyGobbletMove(
      board,
      { kind: 'board', index: 8 },
      2,
      1,
    );

    expect(result.winner).toBe(2);
  });

  it('allows the mover to win when the moved piece covers another piece in the exposed line', () => {
    const board = boardWith({
      0: [piece(1, 0, 'a-0')],
      3: [piece(1, 0, 'a-3')],
      6: [piece(2, 0, 'b-6')],
      7: [piece(2, 0, 'b-7')],
      8: [piece(2, 0, 'b-hidden'), piece(1, 1, 'a-moving')],
    });

    const result = applyGobbletMove(
      board,
      { kind: 'board', index: 8 },
      6,
      1,
    );

    expect(result.winner).toBe(1);
  });

  it('continues the game when the exposed opponent line is covered and nobody has a line', () => {
    const board = boardWith({
      6: [piece(2, 0, 'b-6')],
      7: [piece(2, 0, 'b-7')],
      8: [piece(2, 0, 'b-hidden'), piece(1, 1, 'a-moving')],
    });

    const result = applyGobbletMove(
      board,
      { kind: 'board', index: 8 },
      6,
      1,
    );

    expect(result.winner).toBeNull();
  });

  it('keeps ordinary supply moves on the normal three-in-a-row rule', () => {
    const board = boardWith({
      0: [piece(1, 0, 'a-0')],
      1: [piece(1, 0, 'a-1')],
    });

    const result = applyGobbletMove(
      board,
      { kind: 'supply', piece: piece(1, 0, 'a-new') },
      2,
      1,
    );

    expect(result.winner).toBe(1);
  });
});
