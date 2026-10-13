import { describe, expect, it } from 'vitest';
import { TRAFFIC_JAM_PUZZLES } from '../data/trafficJamLevels';
import { commitTrafficCommand, createTrafficSession, previewTrafficDrag, requestTrafficHint, undoTrafficMove } from '../utils/trafficJamModel';

const cars = TRAFFIC_JAM_PUZZLES[0].cars;
describe('axis drag projection and atomic whole-command commit', () => {
  it('snaps to the nearest cell while preserving continuous visual displacement', () => {
    expect(previewTrafficDrag(cars, 'B', 59, 40)).toEqual({ distance: 1, offsetPx: 59 });
    expect(previewTrafficDrag(cars, 'B', 60, 40)).toEqual({ distance: 2, offsetPx: 60 });
    expect(previewTrafficDrag(cars, 'B', 19, 40)).toEqual({ distance: 0, offsetPx: 19 });
  });
  it('never tunnels through a blocker or continues beyond a boundary', () => {
    expect(previewTrafficDrag(cars, 'X', 1000, 40)).toEqual({ distance: 0, offsetPx: 0 });
    expect(previewTrafficDrag(cars, 'B', 1000, 40)).toEqual({ distance: 2, offsetPx: 80 });
    expect(previewTrafficDrag(cars, 'X', -1000, 40)).toEqual({ distance: -1, offsetPx: -40 });
  });
  it('uses symmetric half-cell rounding for left/up movement', () => {
    expect(previewTrafficDrag(cars, 'X', -19, 40).distance).toBe(0);
    expect(previewTrafficDrag(cars, 'X', -20, 40).distance).toBe(-1);
  });
  it.each([[NaN, 40], [Infinity, 40], [40, 0], [40, -1], [40, NaN]])('safely ignores invalid geometry %s / %s', (delta, size) => {
    expect(previewTrafficDrag(cars, 'B', delta, size)).toEqual({ distance: 0, offsetPx: 0 });
  });
  it('ignores an unknown car', () => {
    expect(previewTrafficDrag(cars, 'unknown', 80, 40)).toEqual({ distance: 0, offsetPx: 0 });
  });
  it('shares the whole-move transaction, guards stale repeats and undoes scoring', () => {
    const initial = createTrafficSession(cars, 'TEAMS');
    const moved = commitTrafficCommand(initial, { carId: 'B', distance: 2 }, initial.revision);
    expect(moved.steps).toBe(1);
    expect(moved.activeTeam).toBe('B');
    expect(commitTrafficCommand(moved, { carId: 'X', distance: 3 }, initial.revision)).toBe(moved);
    const finished = commitTrafficCommand(moved, { carId: 'X', distance: 3 }, moved.revision);
    expect(finished.scores).toEqual({ A: 0, B: 1 });
    expect(undoTrafficMove(finished).scores).toEqual({ A: 0, B: 0 });
  });
  it('zero-distance releases do not replace a pending button command or count steps', () => {
    const initial = createTrafficSession(cars, 'TEAMS');
    expect(commitTrafficCommand(initial, { carId: 'B', distance: 0 }, initial.revision)).toBe(initial);
    expect(commitTrafficCommand(initial, null, initial.revision)).toBe(initial);
  });
  it('preserves revealed-hint no-score rules through drag completion and undo', () => {
    let state = createTrafficSession(cars, 'TEAMS');
    for (let i = 0; i < 3; i += 1) state = requestTrafficHint(state);
    const moved = commitTrafficCommand(state, { carId: 'B', distance: 2 }, state.revision);
    const finished = commitTrafficCommand(moved, { carId: 'X', distance: 3 }, moved.revision);
    expect(finished.finished).toBe(true);
    expect(finished.scores).toEqual({ A: 0, B: 0 });
    expect(undoTrafficMove(finished).solutionRevealed).toBe(true);
  });
});
