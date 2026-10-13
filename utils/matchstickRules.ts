export type MatchstickSlot = 'A' | 'B' | 'C' | 'D' | 'E';
export type MatchstickBoard = Record<MatchstickSlot, number[]>;
export interface MatchstickMove { source: string; target: string }
export interface MatchstickSolution extends MatchstickMove { equation: string }
export interface DecodedMatchstickEquation { equation: string; correct: boolean; left: number; right: number }

// Digit segments clockwise: top, upper-right, lower-right, bottom,
// lower-left, upper-left, then middle. Operators use horizontal 1 / vertical 2.
export const MATCHSTICK_DIGITS: ReadonlyArray<ReadonlyArray<number>> = [
  [1, 2, 3, 4, 5, 6], [2, 3], [1, 2, 4, 5, 7], [1, 2, 3, 4, 7],
  [2, 3, 6, 7], [1, 3, 4, 6, 7], [1, 3, 4, 5, 6, 7], [1, 2, 3],
  [1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 6, 7],
];
export const MATCHSTICK_SEGMENT_NAMES = ['', '上段', '右上段', '右下段', '下段', '左下段', '左上段', '中段'];
export const MATCHSTICK_SLOTS: MatchstickSlot[] = ['A', 'B', 'C', 'D', 'E'];
const movableSlots: MatchstickSlot[] = ['A', 'B', 'C', 'E'];
const key = (segments: readonly number[]) => [...segments].sort((a, b) => a - b).join('');
const digitFor = (segments: readonly number[]) => MATCHSTICK_DIGITS.findIndex(digit => key(digit) === key(segments));

export const createMatchstickBoard = (equation: string): MatchstickBoard => {
  if (!/^\d[+-]\d=\d$/.test(equation)) throw new Error('火柴題必須是個位數加減等式。');
  return {
    A: [...MATCHSTICK_DIGITS[Number(equation[0])]], B: equation[1] === '+' ? [1, 2] : [1],
    C: [...MATCHSTICK_DIGITS[Number(equation[2])]], D: [1, 2], E: [...MATCHSTICK_DIGITS[Number(equation[4])]],
  };
};

export const decodeMatchstickBoard = (board: MatchstickBoard): DecodedMatchstickEquation | null => {
  const a = digitFor(board.A); const c = digitFor(board.C); const e = digitFor(board.E);
  const operator = key(board.B) === '12' ? '+' : key(board.B) === '1' ? '-' : null;
  if (a < 0 || c < 0 || e < 0 || !operator || key(board.D) !== '12') return null;
  const left = operator === '+' ? a + c : a - c;
  return { equation: `${a}${operator}${c}=${e}`, correct: left === e, left, right: e };
};

export const getMatchstickPositions = (board: MatchstickBoard, kind: 'source' | 'target'): string[] =>
  movableSlots.flatMap(slot => Array.from({ length: slot === 'B' ? 2 : 7 }, (_, index) => index + 1)
    .filter(segment => board[slot].includes(segment) === (kind === 'source'))
    .map(segment => `${slot}${segment}`));

/** The only extra source restriction: a plus sign keeps its horizontal bar. */
export const canTakeMatchstick = (board: MatchstickBoard, source: string): boolean =>
  getMatchstickPositions(board, 'source').includes(source) && !(source === 'B1' && key(board.B) === '12');

export const describeMatchstickPosition = (board: MatchstickBoard, id: string): string => {
  const slot = id[0] as MatchstickSlot; const segment = Number(id[1]);
  if (!getMatchstickPositions(board, 'source').concat(getMatchstickPositions(board, 'target')).includes(id)) return '無效位置';
  const token = slot === 'B' ? (key(board.B) === '12' ? '加號' : '減號')
    : `${slot === 'A' ? '左邊' : slot === 'C' ? '中間' : '右邊'}的 ${digitFor(board[slot])}`;
  return `${id}・${token}・${slot === 'B' ? (segment === 1 ? '橫棒' : '直棒') : MATCHSTICK_SEGMENT_NAMES[segment]}`;
};

export const moveMatchstick = (board: MatchstickBoard, move: MatchstickMove): MatchstickBoard | null => {
  if (!canTakeMatchstick(board, move.source)
      || !getMatchstickPositions(board, 'target').includes(move.target)) return null;
  const next = Object.fromEntries(MATCHSTICK_SLOTS.map(slot => [slot, [...board[slot]]])) as MatchstickBoard;
  const sourceSlot = move.source[0] as MatchstickSlot; const targetSlot = move.target[0] as MatchstickSlot;
  next[sourceSlot] = next[sourceSlot].filter(segment => segment !== Number(move.source[1]));
  next[targetSlot].push(Number(move.target[1]));
  next[targetSlot].sort((a, b) => a - b);
  return next;
};

export const validateMatchstickMove = (board: MatchstickBoard, move: MatchstickMove): {
  valid: boolean; reason?: 'MOVE' | 'SHAPE' | 'EQUATION'; equation?: string;
} => {
  const moved = moveMatchstick(board, move);
  if (!moved) return { valid: false, reason: 'MOVE' };
  const decoded = decodeMatchstickBoard(moved);
  if (!decoded) return { valid: false, reason: 'SHAPE' };
  return { valid: decoded.correct, ...(decoded.correct ? {} : { reason: 'EQUATION' as const }), equation: decoded.equation };
};

export const solveMatchstick = (board: MatchstickBoard, source?: string): MatchstickSolution[] => {
  const solutions: MatchstickSolution[] = [];
  for (const from of getMatchstickPositions(board, 'source')) {
    if (source && source !== from) continue;
    for (const target of getMatchstickPositions(board, 'target')) {
      const move = { source: from, target }; const result = validateMatchstickMove(board, move);
      if (result.valid && result.equation) solutions.push({ ...move, equation: result.equation });
    }
  }
  return solutions;
};
