import { describe, expect, it } from 'vitest';
import {
  applyHanoiMove,
  applyLogicMark,
  applyNimMove,
  advanceTeam,
  awardTeam,
  classifyWordSubmission,
  countAdjacentMines,
  countLogicPuzzleSolutions,
  isLogicGridSolved,
  isMinesweeperPuzzleNoGuess,
  isNonogramSolved,
  isValidWordPath,
  moveTrafficCar,
  revealMinesweeperRegion,
  solveMatchstickMove,
  type TrafficCar,
} from '../utils/facilitatedPuzzleRules';
import { TRAFFIC_JAM_LEVELS } from '../components/TrafficJamGame';
import { WORD_PATH_PUZZLES } from '../components/WordPathGame';
import { MINESWEEPER_PUZZLES } from '../components/MinesweeperGame';
import { LOGIC_DETECTIVE_PUZZLES } from '../components/LogicDetectiveGame';

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
    expect(isValidWordPath([0, 5], 4)).toBe(false);
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

  it('opens a zero region without uncovering a flagged cell', () => {
    const revealed = revealMinesweeperRegion(
      '0,0',
      new Set(['2,2']),
      new Set<string>(),
      new Set(['0,1']),
      3,
      3,
    );

    expect([...revealed].sort()).toEqual(['0,0', '1,0', '1,1', '2,0', '2,1']);
  });

  it('ships compact Minesweeper boards that start with a useful safe region and need no guesses', () => {
    const banks = MINESWEEPER_PUZZLES;
    expect(banks.NORMAL.length).toBeGreaterThanOrEqual(4);
    expect(banks.ADVANCED.length).toBeGreaterThanOrEqual(4);

    for (const puzzle of banks.NORMAL) {
      const opened = revealMinesweeperRegion(puzzle.start, new Set(puzzle.mines), new Set(), new Set(), puzzle.rows, puzzle.columns);
      expect(puzzle.mines).toHaveLength(5);
      expect(opened.size).toBeGreaterThanOrEqual(7);
      expect(isMinesweeperPuzzleNoGuess(puzzle)).toBe(true);
    }
    for (const puzzle of banks.ADVANCED) {
      const opened = revealMinesweeperRegion(puzzle.start, new Set(puzzle.mines), new Set(), new Set(), puzzle.rows, puzzle.columns);
      expect(puzzle.mines).toHaveLength(8);
      expect(opened.size).toBeGreaterThanOrEqual(5);
      expect(isMinesweeperPuzzleNoGuess(puzzle)).toBe(true);
    }
  });

  it('auto-organizes a logic grid only when the facilitator enables it', () => {
    const manual = applyLogicMark({}, 0, 0, 'YES', 3, false);
    expect(manual).toEqual({ '0,0': 'YES' });

    const organized = applyLogicMark({}, 0, 0, 'YES', 3, true);
    expect(organized).toMatchObject({ '0,0': 'YES', '0,1': 'NO', '0,2': 'NO', '1,0': 'NO', '2,0': 'NO' });

    const completed = applyLogicMark({ '0,0': 'NO', '0,1': 'NO' }, 1, 2, 'NO', 3, true);
    expect(completed['0,2']).toBe('YES');
  });

  it('provides twelve uniquely solvable logic cases for each difficulty', () => {
    const banks = LOGIC_DETECTIVE_PUZZLES;
    expect(banks.NORMAL).toHaveLength(12);
    expect(banks.ADVANCED).toHaveLength(12);
    for (const puzzle of [...banks.NORMAL, ...banks.ADVANCED]) {
      expect(countLogicPuzzleSolutions(puzzle.people.length, puzzle.constraints)).toBe(1);
    }
  });

  it('keeps every logic clue indirect and necessary to the unique solution', () => {
    for (const puzzle of [...LOGIC_DETECTIVE_PUZZLES.NORMAL, ...LOGIC_DETECTIVE_PUZZLES.ADVANCED]) {
      expect(puzzle.constraints).toHaveLength(puzzle.clues.length);
      expect(puzzle.constraints.every(constraint => constraint.relation === 'NOT')).toBe(true);
      expect(puzzle.clues.some(clue => clue.includes('選的是') || clue.includes('剩下的選項'))).toBe(false);
      puzzle.constraints.forEach((_, index) => {
        const withoutClue = puzzle.constraints.filter((__, clueIndex) => clueIndex !== index);
        expect(countLogicPuzzleSolutions(puzzle.people.length, withoutClue)).toBeGreaterThan(1);
      });
    }
  });

  it('varies which people must be resolved first across the logic puzzle bank', () => {
    const cluePattern = (puzzle: (typeof LOGIC_DETECTIVE_PUZZLES.NORMAL)[number] | (typeof LOGIC_DETECTIVE_PUZZLES.ADVANCED)[number]) =>
      puzzle.constraints.map(constraint => constraint.person).join(',');
    expect(new Set(LOGIC_DETECTIVE_PUZZLES.NORMAL.map(cluePattern)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(LOGIC_DETECTIVE_PUZZLES.ADVANCED.map(cluePattern)).size).toBeGreaterThanOrEqual(4);
  });

  it('uses all four straight directions in the normal word board and orthogonal turns in the advanced board', () => {
    const normal = WORD_PATH_PUZZLES.NORMAL as typeof WORD_PATH_PUZZLES.NORMAL & { paths: readonly (readonly number[])[] };
    const advanced = WORD_PATH_PUZZLES.ADVANCED as typeof WORD_PATH_PUZZLES.ADVANCED & { paths: readonly (readonly number[])[] };
    const direction = (from: number, to: number, columns: number) => {
      const rowDelta = Math.floor(to / columns) - Math.floor(from / columns);
      const colDelta = (to % columns) - (from % columns);
      return `${rowDelta},${colDelta}`;
    };

    expect(normal.paths).toHaveLength(normal.words.length);
    const normalDirections = new Set(normal.paths.map(path => direction(path[0], path[1], normal.columns)));
    expect(normalDirections).toEqual(new Set(['0,1', '0,-1', '1,0', '-1,0']));

    expect(advanced.paths).toHaveLength(advanced.words.length);
    expect(advanced.paths.filter(path => new Set(path.slice(1).map((cell, index) => direction(path[index], cell, advanced.columns))).size > 1).length).toBeGreaterThanOrEqual(4);
    for (const [difficulty, puzzle] of Object.entries(WORD_PATH_PUZZLES)) {
      puzzle.paths.forEach((path, index) => {
        expect(isValidWordPath(path, puzzle.columns), `${difficulty} ${puzzle.words[index]} path`).toBe(true);
        expect(path.map(cell => puzzle.grid[cell]).join('')).toBe(puzzle.words[index]);
      });
    }
  });

  it('routes unknown valid-path words to therapist review while accepting targets and common extensions', () => {
    expect(classifyWordSubmission('春天', ['春天'], [], [], new Set(['天花']))).toBe('TARGET');
    expect(classifyWordSubmission('天花', ['春天'], [], [], new Set(['天花']))).toBe('COMMON_EXTENSION');
    expect(classifyWordSubmission('春花', ['春天'], [], [], new Set(['天花']))).toBe('REVIEW');
    expect(classifyWordSubmission('春天', ['春天'], ['春天'], [], new Set(['天花']))).toBe('DUPLICATE');
    expect(classifyWordSubmission('春', ['春天'], [], [], new Set(['天花']))).toBe('TOO_SHORT');
  });
});
