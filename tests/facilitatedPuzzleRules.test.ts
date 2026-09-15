import { describe, expect, it } from 'vitest';
import {
  applyHanoiMove,
  applyNimMove,
  advanceTeam,
  awardTeam,
  countAdjacentMines,
  isLogicGridSolved,
  isNonogramSolved,
  isValidWordPath,
  moveTrafficCar,
  solveMatchstickMove,
  type TrafficCar,
} from '../utils/facilitatedPuzzleRules';
import { TRAFFIC_JAM_LEVELS } from '../components/TrafficJamGame';
import { WORD_PATH_PUZZLES } from '../components/WordPathGame';

describe('facilitated puzzle rules', () => {
  it('moves a traffic car only along its axis without crossing another car', () => {
    const cars: TrafficCar[] = [
      { id: 'X', row: 2, col: 1, length: 2, axis: 'H' },
      { id: 'B', row: 1, col: 3, length: 3, axis: 'V' },
    ];

    expect(moveTrafficCar(cars, 'X', 1, 6)).toEqual(cars);
    expect(moveTrafficCar(cars, 'B', 2, 6)).toEqual([
      cars[0],
      { ...cars[1], row: 3 },
    ]);
  });

  it('counts every mine touching a cell, including diagonals', () => {
    const mines = new Set(['0,0', '0,1', '2,2']);
    expect(countAdjacentMines(1, 1, mines, 4, 4)).toBe(3);
    expect(countAdjacentMines(3, 0, mines, 4, 4)).toBe(0);
  });

  it('requires the exact filled pattern to solve a nonogram', () => {
    const solution = new Set(['0,0', '1,1']);
    expect(isNonogramSolved(new Set(['0,0']), solution)).toBe(false);
    expect(isNonogramSolved(new Set(['0,0', '1,1']), solution)).toBe(true);
    expect(isNonogramSolved(new Set(['0,0', '1,1', '2,2']), solution)).toBe(false);
  });

  it('allows only a top Hanoi disk onto an empty rod or a larger disk', () => {
    const rods = [[3, 2, 1], [], []];
    expect(applyHanoiMove(rods, 0, 2)).toEqual([[3, 2], [], [1]]);
    expect(applyHanoiMove([[3], [2, 1], []], 0, 1)).toEqual([[3], [2, 1], []]);
  });

  it('solves a logic grid only when each row selects the matching column', () => {
    const solution = [1, 2, 0];
    expect(isLogicGridSolved([1, 2, 0], solution)).toBe(true);
    expect(isLogicGridSolved([1, 0, 2], solution)).toBe(false);
    expect(isLogicGridSolved([1, null, 0], solution)).toBe(false);
  });

  it('accepts only the intended matchstick source and destination', () => {
    expect(solveMatchstickMove('B2', 'A2', { source: 'B2', target: 'A2' })).toBe(true);
    expect(solveMatchstickMove('B1', 'A2', { source: 'B2', target: 'A2' })).toBe(false);
  });

  it('validates adjacent word paths without reusing a cell', () => {
    expect(isValidWordPath([0, 1, 5, 4], 4)).toBe(true);
    expect(isValidWordPath([0, 2], 4)).toBe(false);
    expect(isValidWordPath([0, 1, 0], 4)).toBe(false);
  });

  it('removes stones from exactly one legal pile and reports the winning move', () => {
    expect(applyNimMove([1, 3, 5], 1, 2, false)).toEqual({ piles: [1, 1, 5], finished: false, moverWon: false });
    expect(applyNimMove([0, 0, 1], 2, 1, false)).toEqual({ piles: [0, 0, 0], finished: true, moverWon: true });
    expect(applyNimMove([0, 0, 1], 2, 1, true)).toEqual({ piles: [0, 0, 0], finished: true, moverWon: false });
    expect(applyNimMove([1, 3, 5], 1, 4, false)).toBeNull();
  });

  it('alternates facilitated teams and awards only the completing team', () => {
    expect(advanceTeam('A')).toBe('B');
    expect(advanceTeam('B')).toBe('A');
    expect(awardTeam({ A: 2, B: 1 }, 'B')).toEqual({ A: 2, B: 2 });
  });

  it('ships a solvable advanced traffic-jam layout', () => {
    let cars = TRAFFIC_JAM_LEVELS.ADVANCED;
    cars = moveTrafficCar(cars, 'D', 1, 6);
    cars = moveTrafficCar(cars, 'B', 3, 6);
    cars = moveTrafficCar(cars, 'X', 4, 6);
    expect(cars.find(car => car.id === 'X')?.col).toBe(4);
  });

  it('keeps every advanced target word traceable through adjacent cells', () => {
    const puzzle = WORD_PATH_PUZZLES.ADVANCED;
    const canTrace = (word: string): boolean => {
      const search = (characterIndex: number, path: number[]): boolean => {
        if (characterIndex === word.length) return true;
        return puzzle.grid.some((character, index) =>
          character === word[characterIndex]
          && !path.includes(index)
          && (path.length === 0 || isValidWordPath([...path, index], puzzle.columns))
          && search(characterIndex + 1, [...path, index]),
        );
      };
      return search(0, []);
    };

    expect(puzzle.words.filter(word => !canTrace(word))).toEqual([]);
  });
});
