import { describe, expect, it } from 'vitest';
import { MATCHSTICK_PUZZLES } from '../data/matchstickPuzzles';
import { chooseMatchstickSource, chooseMatchstickTarget, clearMatchstickDraft, confirmMatchstickMove, createMatchstickSession, requestMatchstickHint, undoMatchstickDecision } from '../utils/matchstickSession';
import { createMatchstickBoard, solveMatchstick } from '../utils/matchstickRules';

const beginner = MATCHSTICK_PUZZLES.find(puzzle => puzzle.id === 'beginner-operator')!;
const challenge = MATCHSTICK_PUZZLES.find(puzzle => puzzle.id === 'challenge-two-ways')!;
const select = (state: ReturnType<typeof createMatchstickSession>, puzzle: typeof beginner, source: string, target: string) =>
  chooseMatchstickTarget(chooseMatchstickSource(state, puzzle, source), puzzle, target);

describe('one spoken decision per matchstick turn', () => {
  it('preselects the guided source and does not give selection, cancel or hints a turn or point', () => {
    let state = createMatchstickSession(beginner, 'TEAMS');
    expect(state.selection).toEqual({ source: 'B2', target: null });
    state = chooseMatchstickTarget(state, beginner, 'A2');
    state = clearMatchstickDraft(state, beginner);
    state = requestMatchstickHint(state, beginner);
    expect(state.team).toBe('A');
    expect(state.scores).toEqual({ A: 0, B: 0 });
    expect(state.history).toHaveLength(0);
  });

  it('awards one point and advances once for a complete correct decision; repeated submit is inert', () => {
    let state = select(createMatchstickSession(beginner, 'TEAMS'), beginner, 'B2', 'A2');
    state = confirmMatchstickMove(state, beginner);
    expect(state.finished).toBe(true);
    expect(state.scores).toEqual({ A: 1, B: 0 });
    expect(state.team).toBe('B');
    expect(state.history).toHaveLength(1);
    expect(confirmMatchstickMove(state, beginner)).toBe(state);
  });

  it('undo restores selection, score, team, found solutions and completion as a single snapshot', () => {
    const selected = select(createMatchstickSession(beginner, 'TEAMS'), beginner, 'B2', 'A2');
    const scored = confirmMatchstickMove(selected, beginner);
    const restored = undoMatchstickDecision(scored);
    expect(restored).toEqual(selected);
    expect(confirmMatchstickMove(restored, beginner).scores).toEqual({ A: 1, B: 0 });
  });

  it('leaves incomplete drafts alone and restores the original team after undoing an incorrect attempt', () => {
    const initial = createMatchstickSession(beginner, 'TEAMS');
    expect(confirmMatchstickMove(initial, beginner)).toBe(initial);
    const wrong = chooseMatchstickTarget(initial, beginner, 'C1');
    const rejected = confirmMatchstickMove(wrong, beginner);
    expect(rejected.finished).toBe(false);
    expect(rejected.team).toBe('B');
    expect(rejected.scores).toEqual({ A: 0, B: 0 });
    expect(undoMatchstickDecision(rejected)).toEqual(wrong);
  });

  it('requires two distinct valid solutions, rejects repeated credit and restores the first-solution state', () => {
    const solutions = solveMatchstick(createMatchstickBoard(challenge.equation));
    let state = createMatchstickSession(challenge, 'TEAMS');
    state = confirmMatchstickMove(select(state, challenge, solutions[0].source, solutions[0].target), challenge);
    expect(state.finished).toBe(false);
    expect(state.found).toHaveLength(1);
    expect(state.team).toBe('B');
    const duplicate = confirmMatchstickMove(select(state, challenge, solutions[0].source, solutions[0].target), challenge);
    expect(duplicate.scores).toEqual({ A: 1, B: 0 });
    expect(duplicate.team).toBe('B');
    expect(duplicate.history).toHaveLength(1);
    const secondDraft = select(state, challenge, solutions[1].source, solutions[1].target);
    const complete = confirmMatchstickMove(secondDraft, challenge);
    expect(complete.finished).toBe(true);
    expect(complete.scores).toEqual({ A: 1, B: 1 });
    expect(undoMatchstickDecision(complete)).toEqual(secondDraft);
  });

  it('keeps knowledge of a revealed second solution when undo restores an earlier decision', () => {
    let state = confirmMatchstickMove(select(createMatchstickSession(challenge, 'TEAMS'), challenge, 'B2', 'A1'), challenge);
    for (let hint = 0; hint < 3; hint += 1) state = requestMatchstickHint(state, challenge);
    expect(state.revealed).toContain('E6>E2');
    state = undoMatchstickDecision(state);
    expect(state.found).toHaveLength(0);
    expect(state.team).toBe('A');
    expect(state.scores).toEqual({ A: 0, B: 0 });
    expect(state.selection).toEqual({ source: 'B2', target: 'A1' });
    state = confirmMatchstickMove(select(state, challenge, 'E6', 'E2'), challenge);
    expect(state.found[0].assisted).toBe(true);
    expect(state.scores).toEqual({ A: 0, B: 0 });
  });

  it('keeps cooperative scores zero and excludes fully revealed answers from team scoring', () => {
    const cooperative = confirmMatchstickMove(select(createMatchstickSession(beginner), beginner, 'B2', 'A2'), beginner);
    expect(cooperative.scores).toEqual({ A: 0, B: 0 });
    let assisted = createMatchstickSession(beginner, 'TEAMS');
    for (let hint = 0; hint < 3; hint += 1) assisted = requestMatchstickHint(assisted, beginner);
    expect(assisted.hintLevel).toBe(3);
    expect(assisted.selection.target).toBe('A2');
    assisted = confirmMatchstickMove(assisted, beginner);
    expect(assisted.finished).toBe(true);
    expect(assisted.found[0].assisted).toBe(true);
    expect(assisted.scores).toEqual({ A: 0, B: 0 });
  });
});


it('does not accept the plus horizontal bar as a source through the session API', () => {
  const puzzle = MATCHSTICK_PUZZLES.find(item => item.id === 'standard-within')!;
  const state = createMatchstickSession(puzzle);
  expect(chooseMatchstickSource(state, puzzle, 'B1')).toBe(state);
  expect(chooseMatchstickSource(state, puzzle, 'B2').selection.source).toBe('B2');
  expect(chooseMatchstickSource(state, puzzle, 'A2').selection.source).toBe('A2');
});
