import { describe, expect, it } from 'vitest';
import { TRAFFIC_JAM_PUZZLES } from '../data/trafficJamLevels';
import { analyzeTrafficSolution, trafficGeometrySignature, trafficTopologySignature } from '../utils/trafficJamAudit';
import { commitTrafficCommand, createTrafficSession, describeTrafficMove, legalTrafficMoves, requestTrafficHint, solveTrafficJam } from '../utils/trafficJamModel';

describe('traffic bank structural audit', () => {
  it('counts a hand-checkable C → B → X prerequisite chain', () => {
    const level = TRAFFIC_JAM_PUZZLES.find(candidate => candidate.id === 'beginner-5')!;
    expect(analyzeTrafficSolution(level.cars, level.solution)).toEqual({ participatingCars: 3, reversalsInSolution: 0, reversingCars: [], dependencyDepth: 2, dependencyChain: ['C', 'B', 'X'] });
  });
  it('folds recolors, relabels and reflections together', () => {
    const cars = TRAFFIC_JAM_PUZZLES[0].cars;
    const renamed = cars.map(car => ({ ...car, id: car.target ? 'X' : 'Z', color: 'different' }));
    const reflected = cars.map(car => ({ ...car, col: 6 - car.col - (car.axis === 'H' ? car.length : 1) }));
    expect(trafficGeometrySignature(renamed)).toBe(trafficGeometrySignature(cars));
    expect(trafficGeometrySignature(reflected)).toBe(trafficGeometrySignature(cars));
    expect(trafficTopologySignature(reflected)).toBe(trafficTopologySignature(cars));
  });
  it('does not count merely shifting a car within its lane as a new structure', () => {
    const cars = TRAFFIC_JAM_PUZZLES[0].cars;
    const shifted = cars.map(car => car.id === 'B' ? { ...car, row: car.row + 1 } : { ...car });
    expect(trafficGeometrySignature(shifted)).not.toBe(trafficGeometrySignature(cars));
    expect(trafficTopologySignature(shifted)).toBe(trafficTopologySignature(cars));
  });
  it.each(TRAFFIC_JAM_PUZZLES)('$id reports a complete search result for its reversal requirement', level => {
    const result = solveTrafficJam(level.cars, { forbidDirectionChanges: true });
    expect(result.status).toBe(level.requiresReversal ? 'UNSOLVABLE' : 'SOLVED');
  });
  it.each(TRAFFIC_JAM_PUZZLES.filter(level => level.tier !== 'BEGINNER'))('$id produces a legal current-position hint after a mid-game detour', level => {
    let state = createTrafficSession(level.cars, 'COOP');
    const halfway = Math.floor(level.solution.length / 2);
    for (const move of level.solution.slice(0, halfway)) state = commitTrafficCommand(state, move, state.revision);
    const expectedNext = level.solution[halfway];
    const detour = legalTrafficMoves(state.cars).find(move => move.carId !== expectedNext.carId || move.distance !== expectedNext.distance);
    expect(detour).toBeDefined();
    state = commitTrafficCommand(state, detour!, state.revision);
    const solved = solveTrafficJam(state.cars);
    expect(solved.status).toBe('SOLVED');
    expect(solved.moves.length).toBeGreaterThan(0);
    const before = state;
    for (let depth = 0; depth < 3; depth += 1) state = requestTrafficHint(state, level.hints);
    expect(state.recentAction).toContain(describeTrafficMove(state.cars, solved.moves[0]));
    expect(state.cars).toEqual(before.cars);
    expect(state.steps).toBe(before.steps);
    expect(state.solutionRevealed).toBe(true);
  });
});
