import { coordinateLabel, countAdjacentMines, revealMinesweeperRegion, type MinesweeperPuzzleDefinition } from './facilitatedPuzzleRules';

export type MinesweeperTier = 'BEGINNER' | 'STANDARD' | 'CHALLENGE';
export type MineTechnique = 'SINGLE' | 'SUBSET' | 'GLOBAL';
export interface MineObservation { rows: number; columns: number; totalMines: number; numbers: Record<string, number>; flags: readonly string[] }
export interface MineInference {
  technique: MineTechnique; action: 'REVEAL' | 'FLAG'; targets: string[]; clues: string[]; related: string[]; explanation: string;
}
export const mineCoordinate = (key: string): string => { const [row, col] = key.split(',').map(Number); return coordinateLabel(row, col); };
export const mineCells = (rows: number, columns: number): string[] => Array.from({ length: rows * columns }, (_, i) => `${Math.floor(i / columns)},${i % columns}`);
export const mineNeighbors = (key: string, rows: number, columns: number): string[] => {
  const [row, col] = key.split(',').map(Number);
  return mineCells(rows, columns).filter(cell => { const [r, c] = cell.split(',').map(Number); return cell !== key && Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1; });
};
const labels = (cells: readonly string[]) => cells.map(mineCoordinate).join('、');
interface Constraint { clue: string; cells: string[]; remaining: number }

/** Uses only the public numbers, flags and total. Hidden mine positions are never an inference input. */
export const inferMinesweeperStep = (board: MineObservation, allowed: readonly MineTechnique[] = ['SINGLE', 'SUBSET', 'GLOBAL']): MineInference | null => {
  const flags = new Set(board.flags);
  const unknown = mineCells(board.rows, board.columns).filter(key => !(key in board.numbers) && !flags.has(key));
  const constraints: Constraint[] = Object.keys(board.numbers).sort().map(clue => {
    const neighbors = mineNeighbors(clue, board.rows, board.columns);
    return { clue, cells: neighbors.filter(key => unknown.includes(key)), remaining: board.numbers[clue] - neighbors.filter(key => flags.has(key)).length };
  });
  const remaining = board.totalMines - flags.size;
  if (remaining < 0 || remaining > unknown.length || constraints.some(c => c.remaining < 0 || c.remaining > c.cells.length)) return null;
  const direct = (constraint: Constraint, technique: MineTechnique): MineInference | null => {
    if (!constraint.cells.length || (constraint.remaining !== 0 && constraint.remaining !== constraint.cells.length)) return null;
    const action = constraint.remaining === 0 ? 'REVEAL' : 'FLAG';
    return { technique, action, targets: constraint.cells, clues: constraint.clue === 'GLOBAL' ? [] : [constraint.clue], related: constraint.cells,
      explanation: `${constraint.clue === 'GLOBAL' ? '全盤' : `${mineCoordinate(constraint.clue)} 的數字 ${board.numbers[constraint.clue]}`}扣除已標記後，${constraint.cells.length} 個未知格還有 ${constraint.remaining} 雷，所以 ${labels(constraint.cells)} ${action === 'REVEAL' ? '都安全' : '都是雷'}。` };
  };
  if (allowed.includes('SINGLE')) for (const c of constraints) { const step = direct(c, 'SINGLE'); if (step) return step; }
  const compare = (small: Constraint, large: Constraint, technique: MineTechnique): MineInference | null => {
    if (!small.cells.length || small.cells.length >= large.cells.length || !small.cells.every(key => large.cells.includes(key))) return null;
    const difference = large.cells.filter(key => !small.cells.includes(key));
    const differenceMines = large.remaining - small.remaining;
    if (differenceMines !== 0 && differenceMines !== difference.length) return null;
    const action = differenceMines === 0 ? 'REVEAL' : 'FLAG';
    return { technique, action, targets: difference, clues: [small.clue, ...(large.clue === 'GLOBAL' ? [] : [large.clue])], related: [...new Set([...small.cells, ...large.cells])],
      explanation: `${mineCoordinate(small.clue)} 的未知鄰格（${labels(small.cells)}）還有 ${small.remaining} 雷；${large.clue === 'GLOBAL' ? '全盤未知格' : `${mineCoordinate(large.clue)} 的未知鄰格`}包含這些格，還有 ${large.remaining} 雷。多出的 ${labels(difference)} 還有 ${differenceMines} 雷，所以${action === 'REVEAL' ? '都安全' : '都是雷'}。` };
  };
  if (allowed.includes('SUBSET')) for (const small of constraints) for (const large of constraints) { const step = compare(small, large, 'SUBSET'); if (step) return step; }
  if (allowed.includes('GLOBAL')) {
    const global = { clue: 'GLOBAL', cells: unknown, remaining };
    const step = direct(global, 'GLOBAL'); if (step) return step;
    for (const local of constraints) { const compared = compare(local, global, 'GLOBAL'); if (compared) return compared; }
  }
  return null;
};

export const mineObservation = (puzzle: MinesweeperPuzzleDefinition, revealed: ReadonlySet<string>, flags: ReadonlySet<string>): MineObservation => {
  const mines = new Set(puzzle.mines);
  return { rows: puzzle.rows, columns: puzzle.columns, totalMines: mines.size, flags: [...flags], numbers: Object.fromEntries([...revealed].filter(key => !mines.has(key)).map(key => {
    const [row, col] = key.split(',').map(Number); return [key, countAdjacentMines(row, col, mines, puzzle.rows, puzzle.columns)];
  })) };
};

export const solveMinesweeperTrace = (puzzle: MinesweeperPuzzleDefinition, allowed: readonly MineTechnique[] = ['SINGLE', 'SUBSET', 'GLOBAL']): { solved: boolean; steps: MineInference[]; initialRevealed: string[] } => {
  const mines = new Set(puzzle.mines); const flags = new Set<string>();
  let revealed = revealMinesweeperRegion(puzzle.start, mines, new Set(), flags, puzzle.rows, puzzle.columns);
  const initialRevealed = [...revealed]; const steps: MineInference[] = [];
  for (let pass = 0; pass < puzzle.rows * puzzle.columns * 2 && revealed.size < puzzle.rows * puzzle.columns - mines.size; pass++) {
    const step = inferMinesweeperStep(mineObservation(puzzle, revealed, flags), allowed); if (!step) break;
    if (step.targets.some(key => (step.action === 'FLAG') !== mines.has(key))) return { solved: false, steps, initialRevealed };
    steps.push(step);
    if (step.action === 'FLAG') step.targets.forEach(key => flags.add(key));
    else step.targets.forEach(key => { revealed = revealMinesweeperRegion(key, mines, revealed, flags, puzzle.rows, puzzle.columns); });
  }
  return { solved: revealed.size === puzzle.rows * puzzle.columns - mines.size, steps, initialRevealed };
};

export const gradeMinesweeperPuzzle = (puzzle: MinesweeperPuzzleDefinition): MinesweeperTier | null => {
  if (solveMinesweeperTrace(puzzle, ['SINGLE']).solved) return 'BEGINNER';
  if (solveMinesweeperTrace(puzzle, ['SINGLE', 'SUBSET']).solved) return 'STANDARD';
  return solveMinesweeperTrace(puzzle).solved ? 'CHALLENGE' : null;
};
