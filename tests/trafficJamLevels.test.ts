import { describe, expect, it } from 'vitest';
import { TRAFFIC_JAM_PUZZLES } from '../data/trafficJamLevels';
import { isTrafficSolved, solveTrafficJam, tryTrafficMove, validateTrafficBoard } from '../utils/trafficJamModel';

describe('curated six-by-six traffic puzzles', () => {
  it.each(['BEGINNER', 'STANDARD', 'CHALLENGE'] as const)('%s has twelve selectable puzzles', tier => {
    expect(TRAFFIC_JAM_PUZZLES.filter(level => level.tier === tier)).toHaveLength(12);
  });
  it('has unique stable identifiers and nonidentical boards', () => {
    expect(new Set(TRAFFIC_JAM_PUZZLES.map(level => level.id)).size).toBe(36);
    expect(new Set(TRAFFIC_JAM_PUZZLES.map(level => JSON.stringify(level.cars))).size).toBe(36);
  });
  it.each(TRAFFIC_JAM_PUZZLES)('$id has legal cars and a replayable verified shortest solution', level => {
    expect(validateTrafficBoard(level.cars)).toEqual([]);
    expect(isTrafficSolved(level.cars)).toBe(false);
    let cars = level.cars.map(car => ({ ...car }));
    for (const move of level.solution) {
      const next = tryTrafficMove(cars, move);
      expect(next, JSON.stringify(move)).not.toBeNull();
      cars = next!;
    }
    expect(isTrafficSolved(cars)).toBe(true);
    const shortest = solveTrafficJam(level.cars);
    expect(shortest.status).toBe('SOLVED');
    expect(shortest.moves.length).toBe(level.minimumMoves);
    expect(level.solution.length).toBe(level.minimumMoves);
    expect(new Set(level.solution.map(move => move.carId)).size).toBe(level.cars.length);
  });
  it.each(TRAFFIC_JAM_PUZZLES.filter(level => level.tier === 'STANDARD'))('$id needs prerequisite moves beyond directly moving exit blockers', level => {
    expect(level.minimumMoves).toBeGreaterThanOrEqual(8);
    const initiallyBlocking = level.cars.filter(car => car.axis === 'V' && car.row <= 2 && car.row + car.length > 2 && car.col > level.cars[0].col + 1).map(car => car.id);
    expect(level.solution.some(move => move.carId !== 'X' && !initiallyBlocking.includes(move.carId))).toBe(true);
  });
  it.each(TRAFFIC_JAM_PUZZLES.filter(level => level.tier === 'CHALLENGE'))('$id provably needs borrowing space and reversing a car', level => {
    expect(solveTrafficJam(level.cars, { forbidDirectionChanges: true }).status).toBe('UNSOLVABLE');
    expect(level.minimumMoves).toBeGreaterThanOrEqual(15);
  });
});
