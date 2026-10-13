import type { LogicClue, LogicPuzzle } from '../data/logicDetectivePuzzles';
export type LogicMark = 'UNKNOWN' | 'YES' | 'NO';
export type LogicMarks = Record<string, LogicMark>;
export interface LogicDecision { row: number; col: number; mark: LogicMark }
export interface LogicDerivation extends LogicDecision { reason: string }
export const logicCoordinate = (row: number, col: number): string => `${String.fromCharCode(65 + col)}${row + 1}`;

export const satisfiesLogicClue = (assignment: readonly number[], clue: LogicClue): boolean => {
  switch (clue.kind) {
    case 'MATCH': return clue.relation === 'IS' ? assignment[clue.person] === clue.choice : assignment[clue.person] !== clue.choice;
    case 'OPTIONS': return clue.choices.includes(assignment[clue.person]);
    case 'ORDER': return clue.gap === undefined ? assignment[clue.earlier] < assignment[clue.later] : assignment[clue.later] - assignment[clue.earlier] === clue.gap;
    case 'EXACTLY_ONE': return clue.options.filter(option => assignment[option.person] === option.choice).length === 1;
  }
};

export const describeLogicClue = (puzzle: Pick<LogicPuzzle, 'people' | 'choices'>, clue: LogicClue): string => {
  const { people, choices } = puzzle;
  switch (clue.kind) {
    case 'MATCH': return `${people[clue.person]}${clue.relation === 'IS' ? '選' : '沒有選'}「${choices[clue.choice]}」。`;
    case 'OPTIONS': return `${people[clue.person]}只可能選${clue.choices.map(choice => `「${choices[choice]}」`).join('或')}。`;
    case 'ORDER': return clue.gap === undefined ? `${people[clue.earlier]}比${people[clue.later]}早。` : `${people[clue.later]}在${people[clue.earlier]}的下${clue.gap === 1 ? '一' : clue.gap}個時段。`;
    case 'EXACTLY_ONE': return `以下恰好一件成立：${clue.options.map(option => `${people[option.person]}選「${choices[option.choice]}」`).join('；')}。`;
  }
};

/** Enumerates at most 4! complete one-to-one assignments. No stored answer is consulted. */
export const solveLogicPuzzle = (puzzle: Pick<LogicPuzzle, 'people' | 'clues'>, marks: LogicMarks = {}): number[][] => {
  const solutions: number[][] = [];
  const visit = (assignment: number[]) => {
    if (assignment.length === puzzle.people.length) {
      if (puzzle.clues.every(clue => satisfiesLogicClue(assignment, clue))) solutions.push(assignment);
      return;
    }
    const row = assignment.length;
    for (let col = 0; col < puzzle.people.length; col += 1) {
      if (assignment.includes(col) || marks[`${row},${col}`] === 'NO') continue;
      if (Array.from({ length: puzzle.people.length }, (_, other) => other).some(other => other !== col && marks[`${row},${other}`] === 'YES')) continue;
      visit([...assignment, col]);
    }
  };
  visit([]);
  return solutions;
};

/** Applies exactly one requested mark, then only mechanical one-to-one consequences. */
export const applyLogicDecision = (current: LogicMarks, decision: LogicDecision, size: number, autoOrganize: boolean): { marks: LogicMarks; derived: LogicDerivation[]; changed: boolean; error?: string } => {
  const { row, col, mark } = decision; const key = `${row},${col}`;
  const unchanged = (error?: string) => ({ marks: current, derived: [], changed: false, error });
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || col < 0 || row >= size || col >= size) return unchanged('找不到這個配對格。');
  if ((current[key] ?? 'UNKNOWN') === mark) return unchanged();
  const marks = { ...current };
  if (mark === 'UNKNOWN') { delete marks[key]; return { marks, derived: [], changed: true }; }
  marks[key] = mark;
  // Reject contradictions before propagation; never silently replace an existing circle.
  if (solveLogicPuzzle({ people: Array.from({ length: size }, () => ''), clues: [] }, marks).length === 0) return unchanged('這個標記與目前的一對一配對衝突。');
  const derived: LogicDerivation[] = [];
  if (!autoOrganize) return { marks, derived, changed: true };
  const put = (r: number, c: number, value: 'YES' | 'NO', reason: string) => {
    if ((marks[`${r},${c}`] ?? 'UNKNOWN') !== 'UNKNOWN') return false;
    marks[`${r},${c}`] = value; derived.push({ row: r, col: c, mark: value, reason }); return true;
  };
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < size; r += 1) for (let c = 0; c < size; c += 1) {
      if (marks[`${r},${c}`] !== 'YES') continue;
      for (let other = 0; other < size; other += 1) {
        if (other !== c) changed = put(r, other, 'NO', `${logicCoordinate(r,c)} 已確認，同一人只能選一項。`) || changed;
        if (other !== r) changed = put(other, c, 'NO', `${logicCoordinate(r,c)} 已確認，同一選項只能給一人。`) || changed;
      }
    }
    for (let index = 0; index < size; index += 1) {
      const rowChoices = Array.from({ length: size }, (_, c) => c).filter(c => marks[`${index},${c}`] !== 'NO');
      const colChoices = Array.from({ length: size }, (_, r) => r).filter(r => marks[`${r},${index}`] !== 'NO');
      if (rowChoices.length === 1) changed = put(index, rowChoices[0], 'YES', `第 ${index + 1} 列只剩這一個選項。`) || changed;
      if (colChoices.length === 1) changed = put(colChoices[0], index, 'YES', `${String.fromCharCode(65 + index)} 欄只剩這一個人物。`) || changed;
    }
  }
  return { marks, derived, changed: true };
};
