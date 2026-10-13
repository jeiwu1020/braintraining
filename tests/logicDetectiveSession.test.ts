import { beforeAll, describe, expect, it } from 'vitest';
import { LOGIC_PUZZLES } from '../data/logicDetectivePuzzles';
import { satisfiesLogicClue } from '../utils/logicDetectiveRules';
let api: typeof import('../utils/logicDetectiveSession');
beforeAll(async () => { api = await import('../utils/logicDetectiveSession').catch(() => ({} as typeof api)); });
const puzzle = LOGIC_PUZZLES[0];
const prepare = (state: ReturnType<typeof api.createLogicSession>, row: number, col: number, mark: 'YES'|'NO'|'UNKNOWN') => api.prepareLogicDecision(state, puzzle, {row,col,mark});
const confirm = (state: ReturnType<typeof api.createLogicSession>, row: number, col: number, mark: 'YES'|'NO'|'UNKNOWN', auto = true) => api.confirmLogicDecision(prepare(state,row,col,mark), puzzle, auto);

describe('one spoken deduction per logic turn', () => {
  it('prepares without touching marks or turns, then commits all automatic changes in one batch', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    const start = api.createLogicSession(puzzle, 'TEAMS');
    const draft = prepare(start,0,1,'YES');
    expect(draft.marks).toEqual({}); expect(draft.team).toBe('A'); expect(draft.scores).toEqual({A:0,B:0});
    const done = api.confirmLogicDecision(draft,puzzle,true);
    expect(done.marks['0,1']).toBe('YES'); expect(done.derived).toHaveLength(4);
    expect(done.team).toBe('B'); expect(done.scores).toEqual({A:1,B:0}); expect(done.history).toHaveLength(1);
    expect(done.selection).toBeNull();
    expect(api.confirmLogicDecision(done,puzzle,true)).toBe(done);
  });
  it('ignores repeated marks, invalid coordinates and unsupported conclusions without score, turn or history', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    const state = confirm(api.createLogicSession(puzzle,'TEAMS'),0,1,'YES');
    const repeat = confirm(state,0,1,'YES');
    expect(repeat.scores).toEqual(state.scores); expect(repeat.team).toBe(state.team); expect(repeat.history).toHaveLength(1);
    expect(prepare(state,9,9,'YES')).toBe(state);
    const wrong = confirm(state,1,0,'YES');
    expect(wrong.marks).toEqual(state.marks); expect(wrong.history).toHaveLength(1); expect(wrong.team).toBe(state.team); expect(wrong.scores).toEqual(state.scores);
    expect(wrong.recent).toContain('線索');
  });
  it('restores the whole batch, including score, current team, finished state, draft and hint stage', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    let state = confirm(api.createLogicSession(puzzle,'TEAMS'),0,1,'YES');
    state = api.requestLogicHint(state,puzzle);
    const before = prepare(state,1,0,'NO');
    const done = api.confirmLogicDecision(before,puzzle,true);
    expect(done.finished).toBe(true); expect(done.scores).toEqual({A:1,B:1}); expect(done.team).toBe('A');
    const undo = api.undoLogicDecision(done);
    expect(undo).toEqual(before);
    expect(api.confirmLogicDecision(undo,puzzle,true).scores).toEqual({A:1,B:1});
  });
  it('clearing is an unscored correction and cannot farm points by restoring already derived marks', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    let state = confirm(api.createLogicSession(puzzle,'TEAMS'),0,1,'YES');
    state = confirm(state,1,1,'UNKNOWN');
    expect(state.marks['1,1']).toBeUndefined(); expect(state.team).toBe('B'); expect(state.scores).toEqual({A:1,B:0});
    state = confirm(state,1,1,'NO');
    expect(state.scores).toEqual({A:1,B:0}); expect(state.team).toBe('B');
  });
  it('does not apply automatic changes merely by changing a setting or preparing a cell', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    const manual = confirm(api.createLogicSession(puzzle),0,1,'YES',false);
    expect(manual.marks).toEqual({'0,1':'YES'});
    const selected = prepare(manual,1,0,'NO');
    expect(selected.marks).toEqual(manual.marks);
    const automatic = api.confirmLogicDecision(selected,puzzle,true);
    expect(automatic.finished).toBe(true);
  });
});

describe('hint knowledge is not reversible', () => {
  it('progresses observation, inference, demonstration without immediately playing the answer', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    let state = api.requestLogicHint(api.createLogicSession(puzzle,'TEAMS'),puzzle);
    expect(state.hintLevel).toBe(1); expect(state.recent).toContain('觀察'); expect(state.revealed).toEqual([]);
    state = api.requestLogicHint(state,puzzle);
    expect(state.hintLevel).toBe(2); expect(state.recent).toContain('推論'); expect(state.revealed).toContain(puzzle.id);
    state = api.requestLogicHint(state,puzzle);
    expect(state.hintLevel).toBe(3); expect(state.recent).toContain('示範'); expect(state.marks).toEqual({}); expect(state.selection).toMatchObject(puzzle.demonstration);
    state = api.confirmLogicDecision(state,puzzle,true);
    expect(state.scores).toEqual({A:0,B:0}); expect(state.recent).toContain('練習');
  });
  it('targets a remaining deduction after the opening hint was already applied', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    let state = confirm(api.createLogicSession(puzzle),0,1,'YES');
    for (let i = 0; i < 3; i += 1) state = api.requestLogicHint(state,puzzle);
    expect(state.selection).toMatchObject({row:1,col:0,mark:'NO'});
    expect(state.recent).toContain('第 2 條');
    expect(api.confirmLogicDecision(state,puzzle,true).finished).toBe(true);
  });
  it('keeps every successive demonstration useful until all non-challenge puzzles finish', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    for (const p of LOGIC_PUZZLES.filter(p => p.tier !== 'CHALLENGE')) {
      let state = api.createLogicSession(p,'TEAMS');
      for (let turn = 0; turn < p.people.length ** 2 && !state.finished; turn += 1) {
        for (let hint = 0; hint < 3; hint += 1) state = api.requestLogicHint(state,p);
        expect(state.selection).not.toBeNull();
        const {row,col,mark} = state.selection!;
        expect(state.marks[`${row},${col}`] ?? 'UNKNOWN').not.toBe(mark);
        state = api.confirmLogicDecision(state,p,true);
      }
      expect(state.finished).toBe(true); expect(state.scores).toEqual({A:0,B:0});
    }
  });
  it('retains knowledge across undo to a snapshot made before the reveal', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    let state = confirm(api.createLogicSession(puzzle,'TEAMS'),0,1,'YES');
    state = api.requestLogicHint(api.requestLogicHint(state,puzzle),puzzle);
    state = api.undoLogicDecision(state);
    expect(state.hintLevel).toBe(0); expect(state.revealed).toContain(puzzle.id);
    state = api.confirmLogicDecision(state,puzzle,true);
    expect(state.scores).toEqual({A:0,B:0});
  });
  it('preserves reveal status across clear, reset, mode changes and a full puzzle revisit', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    let state = api.requestLogicHint(api.requestLogicHint(api.createLogicSession(puzzle,'TEAMS'),puzzle),puzzle);
    state = api.clearLogicDraft(state);
    state = api.createLogicSession(puzzle,'TEAMS',state);
    state = api.createLogicSession(LOGIC_PUZZLES[1],'COOP',state);
    state = api.createLogicSession(puzzle,'TEAMS',state);
    expect(state.revealed).toContain(puzzle.id);
    state = confirm(state,0,1,'YES');
    state = confirm(state,1,0,'NO');
    expect(state.finished).toBe(true); expect(state.scores).toEqual({A:0,B:0});
  });
  it('keeps earned score across reset and another puzzle without awarding the same deduction again', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    let state = confirm(api.createLogicSession(puzzle,'TEAMS'),0,1,'YES');
    state = api.createLogicSession(LOGIC_PUZZLES[1],'TEAMS',state);
    state = api.createLogicSession(puzzle,'TEAMS',state);
    state = confirm(state,0,1,'YES');
    expect(state.scores).toEqual({A:1,B:0});
  });
});

describe('challenge hypotheses', () => {
  it.each(LOGIC_PUZZLES.filter(p => p.tier === 'CHALLENGE'))('requires both a rejected candidate and its genuine contradiction: $id', p => {
    expect(api.createLogicSession).toBeTypeOf('function');
    const badIndex = p.candidates!.findIndex(candidate => !p.clues.every(clue => satisfiesLogicClue(candidate,clue)));
    const clueIndex = p.clues.findIndex(clue => !satisfiesLogicClue(p.candidates![badIndex],clue));
    let state = api.createLogicSession(p,'TEAMS');
    state = api.prepareLogicHypothesis(state,p,badIndex,clueIndex);
    expect(state.finished).toBe(false); expect(state.marks).toEqual({});
    const done = api.confirmLogicHypothesis(state,p);
    expect(done.finished).toBe(true); expect(done.scores).toEqual({A:1,B:0}); expect(done.team).toBe('B');
    expect(done.recent).toContain(`第 ${clueIndex+1} 條`); expect(api.undoLogicDecision(done)).toEqual(state);
    const wrong = api.confirmLogicHypothesis(api.prepareLogicHypothesis(api.createLogicSession(p,'TEAMS'),p,1-badIndex,clueIndex),p);
    expect(wrong.finished).toBe(false); expect(wrong.scores).toEqual({A:0,B:0}); expect(wrong.history).toHaveLength(0);
  });
  it('demonstrates the rejected candidate and contradictory clue without scoring later', () => {
    expect(api.createLogicSession).toBeTypeOf('function');
    const p = LOGIC_PUZZLES.find(p => p.tier === 'CHALLENGE')!;
    let state = api.createLogicSession(p,'TEAMS');
    for (let i = 0; i < 3; i += 1) state = api.requestLogicHint(state,p);
    expect(state.hypothesis).toEqual({ candidate: 0, clue: 0 });
    state = api.confirmLogicHypothesis(state,p);
    expect(state.finished).toBe(true); expect(state.scores).toEqual({A:0,B:0});
  });
});

describe('consecutive group puzzles', () => {
  it('lets A and B alternate across all three one-inference challenge puzzles', () => {
    const bank = LOGIC_PUZZLES.filter(item => item.tier === 'CHALLENGE');
    let state = api.createLogicSession(bank[0], 'TEAMS');
    bank.forEach((p, index) => {
      if (index) state = api.createLogicSession(p, 'TEAMS', state);
      expect(state.team).toBe(index % 2 === 0 ? 'A' : 'B');
      const candidate = p.candidates!.findIndex(assignment => p.clues.some(clue => !satisfiesLogicClue(assignment, clue)));
      const clue = p.clues.findIndex(item => !satisfiesLogicClue(p.candidates![candidate], item));
      state = api.confirmLogicHypothesis(api.prepareLogicHypothesis(state, p, candidate, clue), p);
      expect(state.finished).toBe(true);
    });
    expect(state.scores).toEqual({ A: 2, B: 1 });
    expect(api.createLogicSession(bank[0], 'COOP', state).team).toBe('A');
  });
});
