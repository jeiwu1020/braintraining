import { describe, expect, it } from 'vitest';
import { NONOGRAM_PUZZLES } from '../data/nonogramPuzzles';
import { createNonogramSession, setNonogramTool, toggleNonogramDraft, commitNonogramBatch, undoNonogramBatch, hintNonogram, restartNonogram } from '../utils/nonogramSession';
const puzzle = NONOGRAM_PUZZLES[0];
const fullDraft = () => Object.fromEntries([...puzzle.pattern.join('')].map((cell, index) => [index, cell === '1' ? 'FILLED' as const : 'CROSSED' as const]));

describe('whole inference nonogram rounds', () => {
  it('stages explicit mixed marks without changing the board, score or group', () => {
    let state = createNonogramSession(puzzle, 'TEAMS');
    state = toggleNonogramDraft(state, puzzle, 0);
    state = toggleNonogramDraft(setNonogramTool(state, 'CROSSED'), puzzle, 3);
    expect(state.marks).toEqual({}); expect(state.team).toBe('A'); expect(state.scores).toEqual({ A: 0, B: 0 });
    expect(state.draft).toEqual({ 0: 'FILLED', 3: 'CROSSED' });
    const next = commitNonogramBatch(state, puzzle, state.revision);
    expect(next.marks).toEqual(state.draft); expect(next.team).toBe('B'); expect(next.history).toHaveLength(1);
    expect(commitNonogramBatch(next, puzzle, state.revision)).toBe(next);
  });
  it('rejects out-of-range, wrong-puzzle and no-op drafts without consuming a turn', () => {
    const initial = createNonogramSession(puzzle, 'TEAMS');
    expect(toggleNonogramDraft(initial, puzzle, 25)).toBe(initial);
    expect(toggleNonogramDraft(initial, puzzle, -1)).toBe(initial);
    expect(commitNonogramBatch(initial, NONOGRAM_PUZZLES[1], initial.revision)).toBe(initial);
    const once = commitNonogramBatch(toggleNonogramDraft(initial, puzzle, 0), puzzle, initial.revision);
    const repeated = commitNonogramBatch({ ...once, draft: { 0: 'FILLED' } }, puzzle, once.revision);
    expect(repeated.team).toBe('B'); expect(repeated.history).toHaveLength(1); expect(repeated.draft).toEqual({});
  });
  it('requires explicit crosses as well as fills for completion', () => {
    const initial = createNonogramSession(puzzle, 'TEAMS');
    const onlyFilled = Object.fromEntries(Object.entries(fullDraft()).filter(([, mark]) => mark === 'FILLED'));
    expect(commitNonogramBatch({ ...initial, draft: onlyFilled }, puzzle, 0).finished).toBe(false);
  });
  it('undo restores complete marks, draft, scoring, team and completion in one operation', () => {
    const initial = { ...createNonogramSession(puzzle, 'TEAMS'), draft: fullDraft() };
    const finished = commitNonogramBatch(initial, puzzle, 0);
    expect(finished.finished).toBe(true); expect(finished.scores.A).toBe(1); expect(finished.team).toBe('B');
    const undone = undoNonogramBatch(finished);
    expect(undone.marks).toEqual({}); expect(undone.draft).toEqual(fullDraft()); expect(undone.finished).toBe(false);
    expect(undone.scores.A).toBe(0); expect(undone.team).toBe('A');
    expect(commitNonogramBatch(undone, puzzle, undone.revision).scores.A).toBe(1);
  });
  it('keeps exact-answer knowledge across undo, reset and a later revisit', () => {
    let state = createNonogramSession(puzzle, 'TEAMS');
    state = hintNonogram(hintNonogram(state, puzzle), puzzle);
    expect(state.revealedIds).toEqual([]);
    state = commitNonogramBatch(toggleNonogramDraft(state, puzzle, 0), puzzle, state.revision);
    for (let i = 0; i < 3; i++) state = hintNonogram(state, puzzle);
    expect(state.revealedIds).toContain(puzzle.id);
    state = undoNonogramBatch(state); expect(state.hintDepth).toBe(2); expect(state.revealedIds).toContain(puzzle.id);
    state = restartNonogram(state, NONOGRAM_PUZZLES[1]); state = restartNonogram(state, puzzle);
    expect(state.revealedIds).toContain(puzzle.id);
    state = commitNonogramBatch({ ...state, draft: fullDraft() }, puzzle, state.revision);
    expect(state.finished).toBe(true); expect(state.scores).toEqual({ A: 0, B: 0 }); expect(state.recent).toContain('提示練習');
  });
  it('does not re-award the same puzzle after retrying or revisiting', () => {
    let state = commitNonogramBatch({ ...createNonogramSession(puzzle, 'TEAMS'), draft: fullDraft() }, puzzle, 0);
    state = restartNonogram(restartNonogram(state, NONOGRAM_PUZZLES[1]), puzzle);
    expect(state.history).toHaveLength(0);
    state = commitNonogramBatch({ ...state, draft: fullDraft() }, puzzle, state.revision);
    expect(state.scores).toEqual({ A: 1, B: 0 }); expect(state.recent).toContain('已計分');
  });
  it('reports contradiction without leaking another solution or scoring', () => {
    let state = createNonogramSession(puzzle, 'TEAMS');
    state = commitNonogramBatch({ ...state, draft: { 5: 'CROSSED' } }, puzzle, 0);
    expect(state.recent).toContain('第 2 列'); expect(state.recent).toContain('衝突');
    for (let i = 0; i < 3; i++) state = hintNonogram(state, puzzle);
    expect(state.revealedIds).toEqual([]); expect(state.scores).toEqual({ A: 0, B: 0 });
  });
});
