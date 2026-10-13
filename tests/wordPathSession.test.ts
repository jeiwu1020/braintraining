import { describe, expect, it } from 'vitest';
import { WORD_PATH_BANK } from '../data/wordPathPuzzles';
import { validWordPath, wordPathText, wordPathKey } from '../utils/wordPathRules';
import { createWordPathSession, selectWordPathCell, clearWordPath, submitWordPath, reviewWordPath, undoWordPath, hintWordPath, startWordPathPuzzle, resetWordPathPuzzle, type WordPathSession } from '../utils/wordPathSession';
const beginner = WORD_PATH_BANK[0]; const standard = WORD_PATH_BANK[3]; const challenge = WORD_PATH_BANK[6];
const select = (s: WordPathSession, path: number[], puzzle = beginner) => path.reduce((state, cell) => selectWordPathCell(state, puzzle, cell), s);
const answer = (s: WordPathSession, path: number[], puzzle = beginner) => submitWordPath(select(s, path, puzzle), puzzle);

describe('word path validation', () => {
  it('rejects out-of-bounds, fractional, diagonal, wrapped, and repeated positions', () => {
    for (const path of [[-1, 0], [15, 16], [0, 0.5], [0, 5], [3, 4], [0, 1, 0]]) expect(validWordPath(path, beginner)).toBe(false);
    expect(validWordPath([0, 1], beginner)).toBe(true);
    expect(wordPathText([0, 1], beginner)).toBe('春天');
    expect(wordPathKey(challenge, '同心協力', [0, 1, 5, 6])).not.toBe(wordPathKey(challenge, '同心協力', [0, 4, 5, 9]));
    expect(wordPathKey(beginner, '春天', [0, 1])).toBe(wordPathKey(beginner, '春天', [10, 11]));
  });
});
describe('word path complete-turn state', () => {
  it('selects, rejects an illegal step, trims and clears without scoring or passing a turn', () => {
    let s = createWordPathSession(beginner, 'TEAMS');
    s = select(s, [0, 1]); const before = s;
    s = selectWordPathCell(s, beginner, 15); expect(s.path).toEqual([0, 1]);
    s = selectWordPathCell(s, beginner, 1); expect(s.path).toEqual([0]);
    s = clearWordPath(s); expect(s.path).toEqual([]); expect(s.team).toBe('A'); expect(s.turns).toBe(0); expect(s.scores).toEqual({ A: 0, B: 0 });
    expect(undoWordPath(s).path).toEqual([0]); expect(before.path).toEqual([0, 1]);
  });
  it('commits one complete target once and restores its path, team, score and completion on undo', () => {
    let s = createWordPathSession(beginner, 'TEAMS');
    for (const target of beginner.targets.slice(0, -1)) s = answer(s, target.paths[0]);
    const before = select(s, beginner.targets.at(-1)!.paths[0]);
    s = submitWordPath(before, beginner); expect(s.finished).toBe(true); expect(s.turns).toBe(4); expect(s.scores).toEqual({ A: 2, B: 2 });
    expect(submitWordPath(s, beginner)).toBe(s);
    const restored = undoWordPath(s); expect(restored.finished).toBe(false); expect(restored.path).toEqual(before.path); expect(restored.team).toBe(before.team); expect(restored.scores).toEqual(before.scores); expect(restored.found).toEqual(before.found);
    expect(submitWordPath(restored, beginner).scores).toEqual(s.scores);
  });
  it('counts a repeated complete target as one turn without duplicate progress or score', () => {
    let s = answer(createWordPathSession(beginner, 'TEAMS'), [0, 1]);
    s = answer(s, [0, 1]); expect(s.found).toHaveLength(1); expect(s.scores).toEqual({ A: 1, B: 0 }); expect(s.turns).toBe(2); expect(s.team).toBe('A'); expect(s.recent).toContain('已找過');
  });
  it('leaves a one-character incomplete submission selected without consuming a turn', () => {
    const s = submitWordPath(select(createWordPathSession(beginner, 'TEAMS'), [0]), beginner);
    expect(s.turns).toBe(0); expect(s.path).toEqual([0]); expect(s.team).toBe('A');
  });
  it('holds a non-goal word for explicit therapist review and scores it separately from target progress', () => {
    const s = submitWordPath(select(createWordPathSession(beginner, 'TEAMS'), [6, 10]), beginner);
    expect(s.pending?.word).toBe('健康'); expect(s.team).toBe('A'); expect(s.turns).toBe(0); expect(s.found).toHaveLength(0);
    const accepted = reviewWordPath(s, beginner, true);
    expect(accepted.extensions.map(item => item.word)).toEqual(['健康']); expect(accepted.found).toHaveLength(0); expect(accepted.finished).toBe(false); expect(accepted.scores.A).toBe(1); expect(accepted.turns).toBe(1); expect(accepted.team).toBe('B');
    expect(reviewWordPath(accepted, beginner, true)).toBe(accepted);
    const restored = undoWordPath(accepted); expect(restored.pending).toEqual(s.pending); expect(restored.path).toEqual(s.path); expect(restored.extensions).toEqual([]); expect(restored.team).toBe('A'); expect(restored.scores.A).toBe(0);
    expect(undoWordPath(restored).path).toEqual([6, 10]); expect(undoWordPath(restored).pending).toBeNull();
  });
  it('rejects a reviewed word as one zero-point turn and can restore the pending decision', () => {
    const pending = submitWordPath(select(createWordPathSession(beginner, 'TEAMS'), [0, 4]), beginner);
    const rejected = reviewWordPath(pending, beginner, false);
    expect(rejected.turns).toBe(1); expect(rejected.team).toBe('B'); expect(rejected.scores.A).toBe(0); expect(rejected.extensions).toHaveLength(0);
    expect(undoWordPath(rejected).pending).toEqual(pending.pending);
  });
  it('does not let a pending review change path or submit a second time', () => {
    const pending = submitWordPath(select(createWordPathSession(beginner), [6, 10]), beginner);
    expect(selectWordPathCell(pending, beginner, 0)).toBe(pending); expect(clearWordPath(pending)).toBe(pending); expect(submitWordPath(pending, beginner)).toBe(pending);
  });
  it('deduplicates accepted extension words on later submissions', () => {
    let s = reviewWordPath(submitWordPath(select(createWordPathSession(beginner, 'TEAMS'), [6, 10]), beginner), beginner, true);
    s = answer(s, [6, 10]); expect(s.pending).toBeNull(); expect(s.turns).toBe(2); expect(s.extensions).toHaveLength(1); expect(s.scores).toEqual({ A: 1, B: 0 });
  });
  it('requires two different physical paths to finish a challenge', () => {
    const [first, second] = challenge.targets[0].paths;
    let s = answer(createWordPathSession(challenge, 'TEAMS'), first, challenge);
    expect(s.finished).toBe(false); s = answer(s, first, challenge); expect(s.found).toHaveLength(1); expect(s.finished).toBe(false);
    s = answer(s, second, challenge); expect(s.found).toHaveLength(2); expect(s.finished).toBe(true); expect(s.scores).toEqual({ A: 2, B: 0 });
  });
  it('accepts additional valid challenge routes beyond the curated examples', () => {
    const s = answer(createWordPathSession(challenge), [0, 1, 5, 9], challenge);
    expect(s.found).toHaveLength(1); expect(s.pending).toBeNull();
  });
  it('never converts revealed solutions back into independent points through undo, reset, mode change or revisit', () => {
    let s = createWordPathSession(standard, 'TEAMS');
    s = hintWordPath(s, standard); expect(s.knowledge[standard.id].revealed).toBe(false);
    s = hintWordPath(s, standard); expect(s.knowledge[standard.id].revealed).toBe(true); expect(s.scores.A).toBe(0);
    s = answer(s, standard.targets[0].paths[0], standard); expect(s.found).toHaveLength(1); expect(s.scores.A).toBe(0);
    s = undoWordPath(s); expect(s.knowledge[standard.id].revealed).toBe(true);
    s = resetWordPathPuzzle(s, standard, 'COOP'); expect(s.knowledge[standard.id].revealed).toBe(true);
    s = startWordPathPuzzle(s, beginner); s = startWordPathPuzzle(s, standard);
    s = answer(s, standard.targets[0].paths[0], standard); expect(s.scores).toEqual({ A: 0, B: 0 }); expect(s.found[0].assisted).toBe(true);
  });
  it('keeps revealed knowledge when a hint follows a decision that is then undone', () => {
    let s = answer(createWordPathSession(standard, 'TEAMS'), standard.targets[0].paths[0], standard);
    s = hintWordPath(hintWordPath(s, standard), standard); s = undoWordPath(s);
    expect(s.found).toHaveLength(0); expect(s.scores.A).toBe(0); expect(s.knowledge[standard.id].revealed).toBe(true);
    expect(submitWordPath(s, standard).scores.A).toBe(0);
  });
  it('reveals full coordinates at the final hint level without auto-submitting or scoring', () => {
    let s = createWordPathSession(challenge, 'TEAMS');
    for (let i = 0; i < 3; i++) s = hintWordPath(s, challenge);
    expect(s.recent).toContain('A1'); expect(s.recent).toContain('B1'); expect(s.recent).toContain('C2');
    expect(s.path).toEqual([]); expect(s.turns).toBe(0); expect(s.found).toHaveLength(0);
  });
  it('retains cumulative credits across navigation and resets only this puzzle credit on replay', () => {
    let s = answer(createWordPathSession(beginner, 'TEAMS'), [0, 1]);
    s = startWordPathPuzzle(s, standard); s = answer(s, standard.targets[0].paths[0], standard);
    s = startWordPathPuzzle(s, beginner); s = answer(s, [0, 1]); expect(s.scores).toEqual({ A: 1, B: 1 });
    s = resetWordPathPuzzle(s, beginner); expect(s.scores).toEqual({ A: 0, B: 1 }); expect(s.found).toHaveLength(0);
    s = answer(s, [0, 1]); expect(s.scores).toEqual({ A: 1, B: 1 });
  });
});
