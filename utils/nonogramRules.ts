export type NonogramMark = 'UNKNOWN' | 'FILLED' | 'CROSSED';
export type NonogramTier = 'BEGINNER' | 'STANDARD' | 'CHALLENGE';
export interface NonogramPuzzle { id: string; tier: NonogramTier; title: string; focus: string; pattern: string[]; pictureName?: string; pictureColor?: string }
export interface NonogramDeduction { axis: 'ROW' | 'COLUMN'; line: number; candidates: number; technique: 'EXACT' | 'OVERLAP' | 'CROSS'; cells: Array<{ index: number; mark: Exclude<NonogramMark, 'UNKNOWN'> }> }
const runs = (cells: readonly boolean[]): number[] => {
  const groups: number[] = []; let count = 0;
  for (const filled of [...cells, false]) { if (filled) count++; else if (count) { groups.push(count); count = 0; } }
  return groups.length ? groups : [0];
};

/** At most 64 line patterns; exhaustive enumeration avoids incomplete line heuristics. */
export const enumerateNonogramLine = (size: number, clues: readonly number[]): boolean[][] => {
  if (!Number.isInteger(size) || size < 1 || size > 6 || !clues.length || clues.some(n => !Number.isInteger(n) || n < 0)) return [];
  const key = clues.join(','); const patterns: boolean[][] = [];
  for (let mask = 0; mask < 2 ** size; mask++) {
    const cells = Array.from({ length: size }, (_, index) => Boolean(mask & (1 << index)));
    if (runs(cells).join(',') === key) patterns.push(cells);
  }
  return patterns;
};
export const getNonogramClues = (pattern: readonly string[]): { rows: number[][]; columns: number[][] } => {
  const size = pattern.length;
  if (size < 1 || size > 6 || pattern.some(row => row.length !== size || !/^[01]+$/.test(row))) throw new Error('數織盤面須為 1–6 格的正方形 0/1 圖。');
  return { rows: pattern.map(row => runs([...row].map(cell => cell === '1'))), columns: Array.from({ length: size }, (_, col) => runs(pattern.map(row => row[col] === '1'))) };
};

/** Counts complete boards (up to limit), not just the stored intended picture. */
export const solveNonogram = (pattern: readonly string[], limit = 2): string[][] => {
  const clues = getNonogramClues(pattern); const size = pattern.length;
  const rowPatterns = clues.rows.map(line => enumerateNonogramLine(size, line));
  const colPatterns = clues.columns.map(line => enumerateNonogramLine(size, line));
  const results: string[][] = []; const rows: boolean[][] = [];
  const search = (row: number) => {
    if (results.length >= limit) return;
    if (row === size) { results.push(rows.map(cells => cells.map(cell => cell ? '1' : '0').join(''))); return; }
    for (const candidate of rowPatterns[row]) {
      rows.push(candidate);
      if (colPatterns.every((options, col) => options.some(option => rows.every((cells, index) => cells[col] === option[index])))) search(row + 1);
      rows.pop();
      if (results.length >= limit) break;
    }
  };
  search(0); return results;
};

export const findNonogramDeductions = (pattern: readonly string[], marks: Record<number, NonogramMark>): NonogramDeduction[] => {
  const clues = getNonogramClues(pattern); const size = pattern.length; const output: NonogramDeduction[] = [];
  for (const axis of ['ROW', 'COLUMN'] as const) for (let line = 0; line < size; line++) {
    const indices = Array.from({ length: size }, (_, offset) => axis === 'ROW' ? line * size + offset : offset * size + line);
    const candidates = enumerateNonogramLine(size, (axis === 'ROW' ? clues.rows : clues.columns)[line]).filter(option => indices.every((index, offset) => !marks[index] || marks[index] === 'UNKNOWN' || (marks[index] === 'FILLED') === option[offset]));
    const cells: NonogramDeduction['cells'] = [];
    if (candidates.length) indices.forEach((index, offset) => {
      if (marks[index] && marks[index] !== 'UNKNOWN') return;
      if (candidates.every(option => option[offset])) cells.push({ index, mark: 'FILLED' });
      else if (candidates.every(option => !option[offset])) cells.push({ index, mark: 'CROSSED' });
    });
    const hasMarks = indices.some(index => marks[index] && marks[index] !== 'UNKNOWN');
    if (!candidates.length || cells.length) output.push({ axis, line, candidates: candidates.length, technique: hasMarks ? 'CROSS' : candidates.length === 1 ? 'EXACT' : 'OVERLAP', cells });
  }
  return output;
};

/** Each wave uses the previous wave's marks; rounds therefore measure row/column dependency. */
export const analyzeNonogram = (pattern: readonly string[]): { solved: boolean; rounds: number; initialExact: number; initialOverlap: number; cross: number } => {
  const marks: Record<number, NonogramMark> = {}; let rounds = 0; let cross = 0; let initialExact = 0; let initialOverlap = 0;
  while (rounds < pattern.length ** 2) {
    const deductions = findNonogramDeductions(pattern, marks);
    if (!rounds) { initialExact = deductions.filter(item => item.technique === 'EXACT').length; initialOverlap = deductions.filter(item => item.technique === 'OVERLAP').length; }
    if (deductions.some(item => !item.candidates) || !deductions.some(item => item.cells.length)) break;
    cross += deductions.filter(item => item.technique === 'CROSS').length;
    for (const deduction of deductions) for (const cell of deduction.cells) marks[cell.index] = cell.mark;
    rounds++;
  }
  return { solved: [...pattern.join('')].every((cell, index) => marks[index] === (cell === '1' ? 'FILLED' : 'CROSSED')), rounds, initialExact, initialOverlap, cross };
};
