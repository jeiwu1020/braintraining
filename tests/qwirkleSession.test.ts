import { beforeAll, describe, expect, it } from 'vitest';
import { QWIRKLE_PUZZLES } from '../data/qwirklePuzzles';
import { evaluateQwirkleMove, solveQwirklePuzzle } from '../utils/qwirkleRules';
let api: typeof import('../utils/qwirkleSession');
beforeAll(async () => { api = await import('../utils/qwirkleSession').catch(() => ({} as typeof api)); });
const warm = QWIRKLE_PUZZLES[0];
const challenge = QWIRKLE_PUZZLES.find(p => p.id === 'plan-corner')!;
const select = (state: ReturnType<typeof api.createQwirkleSession>, puzzle: typeof warm, tileId: string, targetId: string) => api.selectQwirkleTarget(api.selectQwirkleTile(state, puzzle, tileId), puzzle, targetId);
const complete = (state: ReturnType<typeof api.createQwirkleSession>, puzzle: typeof warm) => {
  for (const move of solveQwirklePuzzle(puzzle)[0].moves) state = api.confirmQwirkleMove(select(state, puzzle, move.tile.id, move.target.id), puzzle);
  return state;
};
describe('Qwirkle oral-decision session', () => {
  it('selection does not mutate board, score, or team; one confirmation scores exactly once', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    const initial = api.createQwirkleSession(warm, 'TEAMS');
    const selected = select(initial, warm, '1', 'P');
    expect(selected.board).toEqual(initial.board); expect(selected.team).toBe('A'); expect(selected.scores).toEqual({ A: 0, B: 0 });
    const done = api.confirmQwirkleMove(selected, warm);
    expect(done).toMatchObject({ team: 'B', finished: true, outcome: 'SUCCESS', scores: { A: 1, B: 0 } });
    expect(done.moves).toHaveLength(1);
    expect(api.confirmQwirkleMove(done, warm)).toBe(done);
  });
  it('rejects illegal input and a legal single-axis move without rotating or scoring', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    const bad = api.confirmQwirkleMove(select(api.createQwirkleSession(warm, 'TEAMS'), warm, '3', 'P'), warm);
    expect(bad).toMatchObject({ team: 'A', finished: false, scores: { A: 0, B: 0 } }); expect(bad.history).toHaveLength(0);
    const standard = QWIRKLE_PUZZLES.find(p => p.id === 'cross-corner')!;
    const single = api.confirmQwirkleMove(select(api.createQwirkleSession(standard, 'TEAMS'), standard, '3', 'Q'), standard);
    expect(single.recent).toContain('合法'); expect(single.recent).toContain('兩條');
    expect(single.team).toBe('A'); expect(single.moves).toHaveLength(0);
  });
  it('keeps both planning steps with the same team and scores a whole strategy only at the end', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    const [first, second] = solveQwirklePuzzle(challenge)[0].moves;
    let state = api.confirmQwirkleMove(select(api.createQwirkleSession(challenge, 'TEAMS'), challenge, first.tile.id, first.target.id), challenge);
    expect(state).toMatchObject({ team: 'A', finished: false, scores: { A: 0, B: 0 } });
    expect(api.confirmQwirkleMove(state, challenge)).toBe(state);
    state = api.confirmQwirkleMove(select(state, challenge, second.tile.id, second.target.id), challenge);
    expect(state).toMatchObject({ team: 'B', finished: true, outcome: 'SUCCESS', scores: { A: 1, B: 0 } });
    expect(state.moves).toHaveLength(2);
  });
  it('explains a legal dead end separately from an illegal move and restores the full decision', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    const initial = select(api.createQwirkleSession(challenge, 'TEAMS'), challenge, '1', 'P');
    expect(evaluateQwirkleMove(initial.board, challenge.hand[0], challenge.targets[0]).valid).toBe(true);
    const blocked = api.confirmQwirkleMove(initial, challenge);
    expect(blocked).toMatchObject({ outcome: 'DEAD_END', finished: true, team: 'A', scores: { A: 0, B: 0 } });
    expect(blocked.recent).toContain('合法');
    const restored = api.undoQwirkleDecision(blocked);
    expect(restored.board).toEqual(initial.board); expect(restored.team).toBe('A'); expect(restored.selection).toEqual(initial.selection); expect(restored.finished).toBe(false);
  });
  it('accepts legal lower-scoring plans as legal but not optimal', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    const puzzle = QWIRKLE_PUZZLES.find(p => p.id === 'plan-gap')!;
    const solutions = solveQwirklePuzzle(puzzle); const lower = solutions.find(s => s.score < solutions[0].score)!;
    let state = api.createQwirkleSession(puzzle, 'TEAMS');
    for (const move of lower.moves) state = api.confirmQwirkleMove(select(state, puzzle, move.tile.id, move.target.id), puzzle);
    expect(state).toMatchObject({ outcome: 'LEGAL_PLAN', finished: true, team: 'B', scores: { A: 0, B: 0 } });
    expect(state.recent).toContain('兩步都合法');
  });
  it('undoes a completed strategy score, team, and second placement atomically', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    const done = complete(api.createQwirkleSession(challenge, 'TEAMS'), challenge);
    const undone = api.undoQwirkleDecision(done);
    expect(undone).toMatchObject({ team: 'A', finished: false, scores: { A: 0, B: 0 } }); expect(undone.moves).toHaveLength(1);
    expect(api.confirmQwirkleMove(undone, challenge).scores.A).toBe(1);
  });
  it('records hints and reveal across clear, undo, reset, and revisiting the same puzzle', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    let state = api.createQwirkleSession(challenge, 'TEAMS');
    for (let i = 0; i < 3; i++) state = api.requestQwirkleHint(state, challenge);
    expect(state.revealed).toContain(challenge.id); expect(state.hintLevel).toBe(3);
    state = api.clearQwirkleDraft(state, challenge);
    expect(state.hintLevel).toBe(3); expect(state.revealed).toContain(challenge.id);
    state = complete(state, challenge);
    expect(state.scores).toEqual({ A: 0, B: 0 }); expect(state.recent).toContain('練習');
    state = api.undoQwirkleDecision(state); expect(state.revealed).toContain(challenge.id);
    state = api.resetQwirkleRound(state, challenge); expect(state.revealed).toContain(challenge.id); expect(state.hintLevel).toBe(3);
    state = api.startQwirklePuzzle(state, warm); state = api.startQwirklePuzzle(state, challenge);
    expect(state.revealed).toContain(challenge.id); expect(state.hintLevel).toBe(3);
  });
  it('keeps the current-position hint on step two and never repeats the first placement', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    const [first, second] = solveQwirklePuzzle(challenge)[0].moves;
    let state = api.confirmQwirkleMove(select(api.createQwirkleSession(challenge), challenge, first.tile.id, first.target.id), challenge);
    for (let i = 0; i < 3; i++) state = api.requestQwirkleHint(state, challenge);
    expect(state.selection).toEqual({ tileId: 'next', targetId: second.target.id }); expect(state.recent).toContain('第 2 步');
  });
  it('preserves other rounds on reset and prevents duplicate credit when revisiting a scored puzzle', () => {
    expect(api.createQwirkleSession).toBeTypeOf('function');
    let state = complete(api.createQwirkleSession(warm, 'TEAMS'), warm);
    const second = QWIRKLE_PUZZLES[1]; state = complete(api.startQwirklePuzzle(state, second), second);
    expect(state.scores).toEqual({ A: 1, B: 1 });
    state = api.resetQwirkleRound(state, second);
    expect(state.scores).toEqual({ A: 1, B: 0 }); expect(state.team).toBe('B');
    state = complete(api.startQwirklePuzzle(state, warm), warm);
    expect(state.scores).toEqual({ A: 1, B: 0 });
  });
});
