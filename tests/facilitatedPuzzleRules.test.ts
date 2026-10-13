import { describe, expect, it } from 'vitest';
import {
  applyHanoiMove,
  applyLogicMark,
  applyNimMove,
  advanceTeam,
  awardTeam,
  classifyWordSubmission,
  continueAfterMinesweeperHit,
  countAdjacentMines,
  countLogicPuzzleSolutions,
  generateMinesweeperPuzzle,
  isLogicGridSolved,
  isMinesweeperPuzzleNoGuess,
  isNonogramSolved,
  isValidWordPath,
  moveTrafficCar,
  revealMinesweeperRegion,
  revealTriggeredMine,
  resolveMinesweeperTeamTurn,
  solveMatchstickMove,
  type TrafficCar,
} from '../utils/facilitatedPuzzleRules';
import { TRAFFIC_JAM_LEVELS } from '../components/TrafficJamGame';
import { solveTrafficJam } from '../utils/trafficJamModel';
import { WORD_PATH_PUZZLES } from '../components/WordPathGame';
import { LOGIC_DETECTIVE_PUZZLES } from '../components/LogicDetectiveGame';
import { LOGIC_PUZZLES } from '../data/logicDetectivePuzzles';
import { solveLogicPuzzle, satisfiesLogicClue } from '../utils/logicDetectiveRules';

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
    const solved = solveTrafficJam(cars);
    expect(solved.status).toBe('SOLVED');
    for (const move of solved.moves) cars = moveTrafficCar(cars, move.carId, move.distance, 6);
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

  it('generates a no-guess Minesweeper board after the first click and protects its surrounding cells', () => {
    let seed = 123456789;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    const puzzle = generateMinesweeperPuzzle({ rows: 6, columns: 8, mineCount: 8, start: '2,3', random });
    const protectedCells = new Set(['1,2', '1,3', '1,4', '2,2', '2,3', '2,4', '3,2', '3,3', '3,4']);

    expect(puzzle.mines).toHaveLength(8);
    expect(puzzle.mines.filter(cell => protectedCells.has(cell))).toEqual([]);
    expect(isMinesweeperPuzzleNoGuess(puzzle)).toBe(true);
    expect(revealMinesweeperRegion(puzzle.start, new Set(puzzle.mines), new Set(), new Set(), puzzle.rows, puzzle.columns).size).toBeGreaterThanOrEqual(9);
  });

  it('uses fresh randomness to create different Minesweeper layouts', () => {
    const seeded = (initial: number) => {
      let seed = initial;
      return () => {
        seed = (1664525 * seed + 1013904223) >>> 0;
        return seed / 0x100000000;
      };
    };
    const first = generateMinesweeperPuzzle({ rows: 5, columns: 7, mineCount: 5, start: '2,3', random: seeded(11) });
    const second = generateMinesweeperPuzzle({ rows: 5, columns: 7, mineCount: 5, start: '2,3', random: seeded(29), excludedLayouts: [first.mines.join('|')] });

    expect(second.mines).not.toEqual(first.mines);
    expect(isMinesweeperPuzzleNoGuess(second)).toBe(true);
  });

  it('rejects Minesweeper layouts whose first cascade falls outside the configured range', () => {
    expect(() => generateMinesweeperPuzzle({
      rows: 5,
      columns: 7,
      mineCount: 6,
      start: '2,3',
      minInitialReveal: 1,
      maxInitialReveal: 8,
      maxAttempts: 20,
    })).toThrow('Unable to generate a no-guess Minesweeper board.');

    const puzzle = generateMinesweeperPuzzle({
      rows: 5,
      columns: 7,
      mineCount: 6,
      start: '2,3',
      minInitialReveal: 9,
      maxInitialReveal: 13,
    });
    const opened = revealMinesweeperRegion(puzzle.start, new Set(puzzle.mines), new Set(), new Set(), puzzle.rows, puzzle.columns);
    expect(opened.size).toBeGreaterThanOrEqual(9);
    expect(opened.size).toBeLessThanOrEqual(13);
    expect(isMinesweeperPuzzleNoGuess(puzzle)).toBe(true);
  });

  it('scores only committed Minesweeper decisions and passes the turn after a mine', () => {
    const safe = resolveMinesweeperTeamTurn({ A: 0, B: 0 }, 'A', 'SAFE');
    expect(safe).toEqual({ scores: { A: 1, B: 0 }, nextTeam: 'B' });

    const completed = resolveMinesweeperTeamTurn({ A: 2, B: 1 }, 'B', 'SAFE', true);
    expect(completed).toEqual({ scores: { A: 2, B: 3 }, nextTeam: 'B' });

    const mine = resolveMinesweeperTeamTurn({ A: 1, B: 3 }, 'A', 'MINE');
    expect(mine).toEqual({ scores: { A: 0, B: 3 }, nextTeam: 'B' });

    expect(resolveMinesweeperTeamTurn({ A: 1, B: 1 }, 'A', 'FLAG_ADDED')).toEqual({ scores: { A: 1, B: 1 }, nextTeam: 'B' });
    expect(resolveMinesweeperTeamTurn({ A: 1, B: 1 }, 'A', 'FLAG_REMOVED')).toEqual({ scores: { A: 1, B: 1 }, nextTeam: 'A' });
    expect(resolveMinesweeperTeamTurn({ A: 1, B: 1 }, 'A', 'INVALID')).toEqual({ scores: { A: 1, B: 1 }, nextTeam: 'A' });
  });

  it('reveals only the triggered mine and converts it to a neutral flag when play continues', () => {
    const revealed = revealTriggeredMine(new Set(['0,0', '0,1']), '2,2');
    expect([...revealed].sort()).toEqual(['0,0', '0,1', '2,2']);

    const continued = continueAfterMinesweeperHit(revealed, new Set(['1,1']), new Set(), '2,2');
    expect([...continued.revealed].sort()).toEqual(['0,0', '0,1']);
    expect([...continued.flags].sort()).toEqual(['1,1', '2,2']);
    expect([...continued.neutralFlags]).toEqual(['2,2']);
  });

  it('auto-organizes a logic grid only when the facilitator enables it', () => {
    const manual = applyLogicMark({}, 0, 0, 'YES', 3, false);
    expect(manual).toEqual({ '0,0': 'YES' });

    const organized = applyLogicMark({}, 0, 0, 'YES', 3, true);
    expect(organized).toMatchObject({ '0,0': 'YES', '0,1': 'NO', '0,2': 'NO', '1,0': 'NO', '2,0': 'NO' });

    const completed = applyLogicMark({ '0,0': 'NO', '0,1': 'NO' }, 1, 2, 'NO', 3, true);
    expect(completed['0,2']).toBe('YES');
  });

  it('provides three uniquely solvable cases in each reasoning tier', () => {
    expect(LOGIC_PUZZLES).toHaveLength(9);
    for (const tier of ['BEGINNER', 'STANDARD', 'CHALLENGE']) expect(LOGIC_PUZZLES.filter(puzzle => puzzle.tier === tier)).toHaveLength(3);
    expect(LOGIC_DETECTIVE_PUZZLES.NORMAL).toEqual(LOGIC_PUZZLES.filter(puzzle => puzzle.tier === 'BEGINNER'));
    expect(LOGIC_DETECTIVE_PUZZLES.ADVANCED).toEqual(LOGIC_PUZZLES.filter(puzzle => puzzle.tier === 'STANDARD'));
    for (const puzzle of LOGIC_PUZZLES) expect(solveLogicPuzzle(puzzle)).toEqual([puzzle.solution]);
  });

  it('keeps structured clues consistent with the authored unique solution', () => {
    for (const puzzle of LOGIC_PUZZLES) {
      expect(puzzle.clues.every(clue => satisfiesLogicClue(puzzle.solution, clue))).toBe(true);
      expect(puzzle.people.length).toBe(puzzle.choices.length);
      expect(new Set(puzzle.solution).size).toBe(puzzle.people.length);
    }
  });

  it('varies inference structures instead of repeating only negative matches', () => {
    for (const tier of ['STANDARD', 'CHALLENGE']) {
      const bank = LOGIC_PUZZLES.filter(puzzle => puzzle.tier === tier);
      expect(new Set(bank.map(puzzle => puzzle.strategy)).size).toBe(3);
      const kinds = new Set(bank.flatMap(puzzle => puzzle.clues.map(clue => clue.kind)));
      expect(kinds.has('OPTIONS')).toBe(true);
      expect(kinds.has('ORDER')).toBe(true);
      expect(kinds.has('EXACTLY_ONE')).toBe(true);
    }
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
