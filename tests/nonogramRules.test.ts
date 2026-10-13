import { describe, expect, it } from 'vitest';
import { enumerateNonogramLine, getNonogramClues, solveNonogram, findNonogramDeductions, analyzeNonogram } from '../utils/nonogramRules';

describe('nonogram line and complete solution rules', () => {
  it('enumerates exact packed groups, overlap, zero and impossible lines', () => {
    expect(enumerateNonogramLine(5, [2, 2])).toEqual([[true, true, false, true, true]]);
    expect(enumerateNonogramLine(5, [3])).toHaveLength(3);
    expect(enumerateNonogramLine(5, [0])).toEqual([[false, false, false, false, false]]);
    expect(enumerateNonogramLine(5, [3, 3])).toEqual([]);
  });
  it('derives row and column clues without relying on image names', () => {
    expect(getNonogramClues(['110', '010', '011'])).toEqual({ rows: [[2], [1], [2]], columns: [[1], [3], [1]] });
  });
  it('counts ambiguity instead of assuming the stored picture is unique', () => {
    expect(solveNonogram(['10', '01'])).toHaveLength(2);
    expect(solveNonogram(['11', '01'])).toEqual([['11', '01']]);
  });
  it('identifies overlap cells while leaving genuinely ambiguous cells unknown', () => {
    const result = findNonogramDeductions(['01110', '00000', '00000', '00000', '00000'], {});
    const row = result.find(item => item.axis === 'ROW' && item.line === 0)!;
    expect(row.technique).toBe('OVERLAP');
    expect(row.candidates).toBe(3);
    expect(row.cells).toEqual([{ index: 2, mark: 'FILLED' }]);
  });
  it('detects contradictory marks and never reveals a made-up forced cell', () => {
    const result = findNonogramDeductions(['11', '01'], { 0: 'CROSSED' });
    const row = result.find(item => item.axis === 'ROW' && item.line === 0)!;
    expect(row.candidates).toBe(0);
    expect(row.cells).toEqual([]);
  });
  it('reports a stalled deduction rather than guessing an ambiguous picture', () => {
    expect(analyzeNonogram(['10', '01']).solved).toBe(false);
    expect(analyzeNonogram(['11', '01']).solved).toBe(true);
  });
});
