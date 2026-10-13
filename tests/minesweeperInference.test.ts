import { describe, expect, it } from 'vitest';
import * as inference from '../utils/minesweeperInference';

describe('explainable Minesweeper reasoning', () => {
  it('derives a mine from one visible number, without consulting hidden mines', () => {
    expect(inference.inferMinesweeperStep).toBeTypeOf('function');
    const step = inference.inferMinesweeperStep({ rows: 2, columns: 2, totalMines: 1, numbers: { '0,0': 1, '1,0': 1, '1,1': 1 }, flags: [] });
    expect(step).toMatchObject({ technique: 'SINGLE', action: 'FLAG', targets: ['0,1'] });
    expect(step?.explanation).toContain('A1');
  });
  it('uses an actual strict subset after single-number deductions are exhausted', () => {
    const board = { rows: 2, columns: 3, totalMines: 2, numbers: { '1,0': 1, '1,1': 2, '1,2': 1 }, flags: [] };
    expect(inference.inferMinesweeperStep(board, ['SINGLE'])).toBeNull();
    expect(inference.inferMinesweeperStep(board)).toMatchObject({ technique: 'SUBSET', action: 'FLAG', targets: ['0,2'], clues: ['1,0', '1,1'] });
  });
  it('combines a local number with the whole-board remaining mine count', () => {
    const board = { rows: 2, columns: 4, totalMines: 1, numbers: { '1,0': 1, '1,1': 1 }, flags: [] };
    expect(inference.inferMinesweeperStep(board, ['SINGLE', 'SUBSET'])).toMatchObject({ technique: 'SUBSET' });
    const globalOnly = inference.inferMinesweeperStep(board, ['GLOBAL']);
    expect(globalOnly).toMatchObject({ technique: 'GLOBAL', action: 'REVEAL' });
    expect(globalOnly?.targets).toContain('0,3');
    expect(globalOnly?.explanation).toContain('全盤');
  });
  it('does not fabricate an inference when flags contradict a visible number', () => {
    expect(inference.inferMinesweeperStep({ rows: 2, columns: 2, totalMines: 1, numbers: { '0,0': 0 }, flags: ['0,1'] })).toBeNull();
  });
});
