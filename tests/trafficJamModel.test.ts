import { describe, expect, it } from 'vitest';
import type { TrafficCar } from '../utils/facilitatedPuzzleRules';
import { commitTrafficMove, createTrafficSession, prepareTrafficMove, solveTrafficJam, tryTrafficMove, undoTrafficMove, validateTrafficBoard } from '../utils/trafficJamModel';

const direct: TrafficCar[] = [
  { id: 'X', row: 2, col: 1, axis: 'H', length: 2, target: true },
  { id: 'B', row: 1, col: 3, axis: 'V', length: 3 },
];
const chain: TrafficCar[] = [
  { id: 'X', row: 2, col: 0, axis: 'H', length: 2, target: true },
  { id: 'B', row: 1, col: 3, axis: 'V', length: 3 },
  { id: 'C', row: 4, col: 2, axis: 'H', length: 2 },
];

describe('traffic board and whole-command solver', () => {
  it('accepts a legal six-by-six board without changing it', () => {
    const before = JSON.stringify(direct);
    expect(validateTrafficBoard(direct)).toEqual([]);
    expect(JSON.stringify(direct)).toBe(before);
  });
  it.each([
    [{ ...direct[0], row: 6 }, direct[1]],
    [direct[0], { ...direct[1], col: 1 }],
    [direct[0], { ...direct[1], length: 1 }],
    [direct[0], { ...direct[1], row: 1.5 }],
    [direct[0], { ...direct[1], id: 'X' }],
    [{ ...direct[0], row: 1 }, direct[1]],
    [{ ...direct[0], target: false }, direct[1]],
  ])('rejects invalid shape, overlap, duplicate IDs, or exit row %#', (...cars) => {
    expect(validateTrafficBoard(cars)).not.toEqual([]);
  });
  it('rejects a command that crosses a car even when its destination is empty', () => {
    expect(tryTrafficMove(direct, { carId: 'X', distance: 3 })).toBeNull();
    expect(direct[0].col).toBe(1);
  });
  it.each([0, 0.5, Infinity, NaN, 10])('rejects invalid distance %s atomically', distance => {
    expect(tryTrafficMove(direct, { carId: 'B', distance })).toBeNull();
  });
  it('moves multiple squares as one complete move, without mutating the input', () => {
    const next = tryTrafficMove(direct, { carId: 'B', distance: 2 });
    expect(next?.[1].row).toBe(3);
    expect(direct[1].row).toBe(1);
  });
  it('finds the shortest number of whole moves, not grid clicks', () => {
    const result = solveTrafficJam(direct);
    expect(result.status).toBe('SOLVED');
    expect(result.moves).toEqual([{ carId: 'B', distance: 2 }, { carId: 'X', distance: 3 }]);
  });
  it('finds a genuine prerequisite chain', () => {
    const result = solveTrafficJam(chain);
    expect(result.status).toBe('SOLVED');
    expect(result.moves).toHaveLength(3);
    expect(result.moves[0].carId).toBe('C');
  });
  it('distinguishes a search limit from a proven dead end', () => {
    expect(solveTrafficJam(chain, { maxStates: 1 }).status).toBe('LIMIT');
    const blocked = [direct[0], { ...direct[1], row: 0 }, { id: 'C', row: 3, col: 3, axis: 'V' as const, length: 3 }];
    expect(solveTrafficJam(blocked).status).toBe('UNSOLVABLE');
  });
});

describe('traffic round transactions', () => {
  it('preview changes no board, score, steps, or team', () => {
    const initial = createTrafficSession(direct, 'TEAMS');
    const preview = prepareTrafficMove(initial, { carId: 'B', distance: 2 });
    expect(preview.cars).toEqual(initial.cars);
    expect(preview.activeTeam).toBe('A');
    expect(preview.scores).toEqual({ A: 0, B: 0 });
    expect(preview.steps).toBe(0);
    expect(preview.pendingMove).toEqual({ carId: 'B', distance: 2 });
  });
  it('commits a two-square oral command once and passes to the other team once', () => {
    const preview = prepareTrafficMove(createTrafficSession(direct, 'TEAMS'), { carId: 'B', distance: 2 });
    const next = commitTrafficMove(preview, preview.revision);
    expect(next.cars[1].row).toBe(3);
    expect(next.steps).toBe(1);
    expect(next.squaresMoved).toBe(2);
    expect(next.activeTeam).toBe('B');
    expect(next.pendingMove).toBeNull();
    expect(commitTrafficMove(next, preview.revision)).toBe(next);
  });
  it('invalid preview and confirm do not consume a turn', () => {
    const initial = createTrafficSession(direct, 'TEAMS');
    const preview = prepareTrafficMove(initial, { carId: 'X', distance: 3 });
    expect(commitTrafficMove(preview)).toBe(preview);
    expect(preview.steps).toBe(0);
    expect(preview.activeTeam).toBe('A');
  });
  it('undo after completion restores board, owner, score, steps, selection and completion', () => {
    let state = commitTrafficMove(prepareTrafficMove(createTrafficSession(direct, 'TEAMS'), { carId: 'B', distance: 2 }));
    const before = prepareTrafficMove(state, { carId: 'X', distance: 3 });
    state = commitTrafficMove(before);
    expect(state.finished).toBe(true);
    expect(state.scores).toEqual({ A: 0, B: 1 });
    expect(state.activeTeam).toBe('B');
    expect(state.steps).toBe(2);
    expect(commitTrafficMove(state)).toBe(state);
    const restored = undoTrafficMove(state);
    expect(restored.cars).toEqual(before.cars);
    expect(restored.scores).toEqual({ A: 0, B: 0 });
    expect(restored.activeTeam).toBe('B');
    expect(restored.steps).toBe(1);
    expect(restored.squaresMoved).toBe(2);
    expect(restored.selectedCarId).toBe('X');
    expect(restored.finished).toBe(false);
    const completedAgain = commitTrafficMove(restored);
    expect(completedAgain.scores).toEqual({ A: 0, B: 1 });
    expect(completedAgain.steps).toBe(2);
  });
  it('undo rejects stale confirmations and restores the first active team', () => {
    const preview = prepareTrafficMove(createTrafficSession(direct, 'TEAMS'), { carId: 'B', distance: 2 });
    const moved = commitTrafficMove(preview);
    const restored = undoTrafficMove(moved);
    expect(restored.activeTeam).toBe('A');
    expect(restored.steps).toBe(0);
    expect(commitTrafficMove(restored, preview.revision)).toBe(restored);
  });
  it('cooperation never assigns points or changes teams', () => {
    let state = createTrafficSession(direct, 'COOP');
    for (const move of solveTrafficJam(direct).moves) state = commitTrafficMove(prepareTrafficMove(state, move));
    expect(state.finished).toBe(true);
    expect(state.scores).toEqual({ A: 0, B: 0 });
    expect(state.activeTeam).toBe('A');
  });
});


describe('traffic hint transaction boundaries', () => {
  it('restores reversible hint depth but never forgets an exposed solution', () => {
    let before = { ...createTrafficSession(direct, 'TEAMS'), hintDepth: 2, solutionRevealed: false };
    let moved = commitTrafficMove(prepareTrafficMove(before, { carId: 'B', distance: 2 }));
    expect(moved.hintDepth).toBe(0);
    moved = { ...moved, hintDepth: 3, solutionRevealed: true };
    const undone = undoTrafficMove(moved);
    expect(undone.hintDepth).toBe(2);
    expect(undone.solutionRevealed).toBe(true);
    let replay = commitTrafficMove(prepareTrafficMove(undone, { carId: 'B', distance: 2 }));
    replay = commitTrafficMove(prepareTrafficMove(replay, { carId: 'X', distance: 3 }));
    expect(replay.finished).toBe(true);
    expect(replay.scores).toEqual({ A: 0, B: 0 });
  });
});
