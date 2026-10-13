import { beforeAll, describe, expect, it } from 'vitest';
let rules: typeof import('../utils/logicDetectiveRules');
let data: typeof import('../data/logicDetectivePuzzles');
beforeAll(async () => {
  rules = await import('../utils/logicDetectiveRules').catch(() => ({} as typeof rules));
  data = await import('../data/logicDetectivePuzzles').catch(() => ({} as typeof data));
});

describe('structured logic detective puzzles', () => {
  it('offers three distinct small puzzles per tier, each with exactly one proven solution', () => {
    expect(data.LOGIC_PUZZLES).toBeDefined();
    for (const tier of ['BEGINNER', 'STANDARD', 'CHALLENGE'] as const) {
      const bank = data.LOGIC_PUZZLES.filter(p => p.tier === tier);
      expect(bank).toHaveLength(3);
      expect(new Set(bank.map(p => p.strategy)).size).toBe(3);
      for (const puzzle of bank) {
        expect(puzzle.people.length).toBeLessThanOrEqual(4);
        expect(rules.solveLogicPuzzle(puzzle)).toEqual([puzzle.solution]);
        expect(puzzle.clues.every(clue => rules.satisfiesLogicClue(puzzle.solution, clue))).toBe(true);
        expect(puzzle.clues.every(clue => rules.describeLogicClue(puzzle, clue).length > 4)).toBe(true);
      }
    }
  });
  it('uses short direct beginner clues and different relational structures above beginner', () => {
    expect(data.LOGIC_PUZZLES).toBeDefined();
    const beginners = data.LOGIC_PUZZLES.filter(p => p.tier === 'BEGINNER');
    expect(beginners.every(p => p.people.length === 3 && p.clues.every(c => c.kind === 'MATCH'))).toBe(true);
    expect(beginners.some(p => p.clues.some(c => c.kind === 'MATCH' && c.relation === 'IS'))).toBe(true);
    for (const tier of ['STANDARD', 'CHALLENGE'] as const) {
      const bank = data.LOGIC_PUZZLES.filter(p => p.tier === tier);
      expect(new Set(bank.map(p => p.clues.map(c => c.kind).sort().join(','))).size).toBe(3);
    }
  });
  it('provides two challenge candidates with exactly one consistent assignment and a testable contradiction', () => {
    expect(data.LOGIC_PUZZLES).toBeDefined();
    for (const p of data.LOGIC_PUZZLES.filter(p => p.tier === 'CHALLENGE')) {
      expect(p.candidates).toHaveLength(2);
      expect(p.candidates!.filter(candidate => p.clues.every(clue => rules.satisfiesLogicClue(candidate, clue)))).toEqual([p.solution]);
      expect(new Set(p.candidates!.map(c => c.join(','))).size).toBe(2);
      for (const candidate of p.candidates!) expect(new Set(candidate).size).toBe(p.people.length);
    }
  });
  it('evaluates each clue structure against matching and contradictory assignments', () => {
    expect(rules.satisfiesLogicClue).toBeTypeOf('function');
    expect(rules.satisfiesLogicClue([0,1,2], { kind: 'MATCH', person: 0, choice: 0, relation: 'NOT' })).toBe(false);
    expect(rules.satisfiesLogicClue([0,1,2], { kind: 'OPTIONS', person: 0, choices: [1,2] })).toBe(false);
    expect(rules.satisfiesLogicClue([0,2,1], { kind: 'ORDER', earlier: 0, later: 1, gap: 1 })).toBe(false);
    expect(rules.satisfiesLogicClue([0,1,2], { kind: 'EXACTLY_ONE', options: [{person: 0, choice: 0}, {person: 1, choice: 1}] })).toBe(false);
  });
});

describe('explainable one-to-one batches', () => {
  it('never reads clues or answers when automatically organizing a chosen action', () => {
    expect(rules.applyLogicDecision).toBeTypeOf('function');
    const manual = rules.applyLogicDecision({}, { row: 0, col: 1, mark: 'YES' }, 3, false);
    expect(manual.marks).toEqual({ '0,1': 'YES' }); expect(manual.derived).toEqual([]);
    const automatic = rules.applyLogicDecision({}, { row: 0, col: 1, mark: 'YES' }, 3, true);
    expect(automatic.marks).toMatchObject({ '0,1': 'YES', '0,0': 'NO', '0,2': 'NO', '1,1': 'NO', '2,1': 'NO' });
    expect(automatic.derived).toHaveLength(4);
    expect(automatic.derived.every(step => step.reason.length > 5)).toBe(true);
  });
  it('chains only visible row/column deductions and reports every changed cell', () => {
    expect(rules.applyLogicDecision).toBeTypeOf('function');
    const result = rules.applyLogicDecision({ '0,0': 'NO' }, { row: 0, col: 1, mark: 'NO' }, 3, true);
    expect(result.marks['0,2']).toBe('YES');
    expect(result.derived.find(step => step.row === 0 && step.col === 2)?.reason).toContain('只剩');
    expect(Object.keys(result.marks)).toHaveLength(1 + 1 + result.derived.length);
  });
  it('does not expand no-ops, clearing, or contradictory visible boards', () => {
    expect(rules.applyLogicDecision).toBeTypeOf('function');
    const marks = { '0,0': 'YES' as const };
    expect(rules.applyLogicDecision(marks, { row: 0, col: 0, mark: 'YES' }, 3, true).changed).toBe(false);
    const cleared = rules.applyLogicDecision(marks, { row: 0, col: 0, mark: 'UNKNOWN' }, 3, true);
    expect(cleared.marks).toEqual({}); expect(cleared.derived).toEqual([]);
    const bad = rules.applyLogicDecision(marks, { row: 0, col: 1, mark: 'YES' }, 3, true);
    expect(bad.changed).toBe(false); expect(bad.error).toBeTruthy();
  });
});
