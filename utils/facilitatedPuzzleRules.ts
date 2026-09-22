export type TrafficAxis = 'H' | 'V';

export interface TrafficCar {
  id: string;
  row: number;
  col: number;
  length: number;
  axis: TrafficAxis;
  color?: string;
  target?: boolean;
}

const trafficCells = (car: TrafficCar): string[] =>
  Array.from({ length: car.length }, (_, offset) =>
    car.axis === 'H'
      ? `${car.row},${car.col + offset}`
      : `${car.row + offset},${car.col}`,
  );

export const moveTrafficCar = (
  cars: readonly TrafficCar[],
  carId: string,
  distance: number,
  size: number,
): TrafficCar[] => {
  const carIndex = cars.findIndex(car => car.id === carId);
  if (carIndex < 0 || distance === 0) return cars.map(car => ({ ...car }));

  let moving = { ...cars[carIndex] };
  const others = new Set(
    cars.flatMap((car, index) => index === carIndex ? [] : trafficCells(car)),
  );
  const direction = Math.sign(distance);

  for (let step = 0; step < Math.abs(distance); step += 1) {
    const next = {
      ...moving,
      row: moving.row + (moving.axis === 'V' ? direction : 0),
      col: moving.col + (moving.axis === 'H' ? direction : 0),
    };
    const cells = trafficCells(next).map(key => key.split(',').map(Number));
    if (cells.some(([row, col]) => row < 0 || col < 0 || row >= size || col >= size || others.has(`${row},${col}`))) {
      return cars.map(car => ({ ...car }));
    }
    moving = next;
  }

  return cars.map((car, index) => index === carIndex ? moving : { ...car });
};

export const isTrafficJamSolved = (cars: readonly TrafficCar[], size: number): boolean => {
  const target = cars.find(car => car.target);
  return Boolean(target && target.axis === 'H' && target.col + target.length === size);
};

export const countAdjacentMines = (
  row: number,
  col: number,
  mines: ReadonlySet<string>,
  rows: number,
  cols: number,
): number => {
  let count = 0;
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;
      if (nextRow >= 0 && nextCol >= 0 && nextRow < rows && nextCol < cols && mines.has(`${nextRow},${nextCol}`)) {
        count += 1;
      }
    }
  }
  return count;
};

export interface MinesweeperPuzzleDefinition {
  rows: number;
  columns: number;
  mines: readonly string[];
  start: string;
}

export interface GenerateMinesweeperPuzzleOptions {
  rows: number;
  columns: number;
  mineCount: number;
  start: string;
  random?: () => number;
  excludedLayouts?: readonly string[];
  maxAttempts?: number;
}

const neighboringCells = (key: string, rows: number, columns: number): string[] => {
  const [row, col] = key.split(',').map(Number);
  const cells: string[] = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;
      if (nextRow >= 0 && nextCol >= 0 && nextRow < rows && nextCol < columns) cells.push(`${nextRow},${nextCol}`);
    }
  }
  return cells;
};

export const revealMinesweeperRegion = (
  startKey: string,
  mines: ReadonlySet<string>,
  alreadyRevealed: ReadonlySet<string>,
  flags: ReadonlySet<string>,
  rows: number,
  columns: number,
): Set<string> => {
  const revealed = new Set(alreadyRevealed);
  const queue = [startKey];
  while (queue.length > 0) {
    const key = queue.shift()!;
    if (revealed.has(key) || mines.has(key) || flags.has(key)) continue;
    revealed.add(key);
    const [row, col] = key.split(',').map(Number);
    if (countAdjacentMines(row, col, mines, rows, columns) !== 0) continue;
    queue.push(...neighboringCells(key, rows, columns));
  }
  return revealed;
};

export const isMinesweeperPuzzleNoGuess = (puzzle: MinesweeperPuzzleDefinition): boolean => {
  const mines = new Set(puzzle.mines);
  let revealed = revealMinesweeperRegion(puzzle.start, mines, new Set(), new Set(), puzzle.rows, puzzle.columns);
  const knownMines = new Set<string>();
  const allCells = Array.from({ length: puzzle.rows * puzzle.columns }, (_, index) => `${Math.floor(index / puzzle.columns)},${index % puzzle.columns}`);

  for (let pass = 0; pass < puzzle.rows * puzzle.columns * 2; pass += 1) {
    let changed = false;
    const constraints = [...revealed].map(key => {
      const [row, col] = key.split(',').map(Number);
      const adjacent = neighboringCells(key, puzzle.rows, puzzle.columns);
      const unknown = adjacent.filter(cell => !revealed.has(cell) && !knownMines.has(cell));
      const remaining = countAdjacentMines(row, col, mines, puzzle.rows, puzzle.columns) - adjacent.filter(cell => knownMines.has(cell)).length;
      return { unknown, remaining };
    }).filter(item => item.unknown.length > 0);

    for (const constraint of constraints) {
      if (constraint.remaining === 0) {
        for (const cell of constraint.unknown) {
          const next = revealMinesweeperRegion(cell, mines, revealed, knownMines, puzzle.rows, puzzle.columns);
          if (next.size > revealed.size) { revealed = next; changed = true; }
        }
      } else if (constraint.remaining === constraint.unknown.length) {
        for (const cell of constraint.unknown) if (!knownMines.has(cell)) { knownMines.add(cell); changed = true; }
      }
    }

    for (const left of constraints) {
      for (const right of constraints) {
        if (left === right || left.unknown.length >= right.unknown.length) continue;
        if (!left.unknown.every(cell => right.unknown.includes(cell))) continue;
        const difference = right.unknown.filter(cell => !left.unknown.includes(cell));
        const remaining = right.remaining - left.remaining;
        if (remaining === 0) {
          for (const cell of difference) {
            const next = revealMinesweeperRegion(cell, mines, revealed, knownMines, puzzle.rows, puzzle.columns);
            if (next.size > revealed.size) { revealed = next; changed = true; }
          }
        } else if (remaining === difference.length) {
          for (const cell of difference) if (!knownMines.has(cell)) { knownMines.add(cell); changed = true; }
        }
      }
    }

    const unresolved = allCells.filter(cell => !revealed.has(cell) && !knownMines.has(cell));
    const minesRemaining = mines.size - knownMines.size;
    if (minesRemaining === 0) {
      for (const cell of unresolved) {
        const next = revealMinesweeperRegion(cell, mines, revealed, knownMines, puzzle.rows, puzzle.columns);
        if (next.size > revealed.size) { revealed = next; changed = true; }
      }
    } else if (minesRemaining === unresolved.length) {
      for (const cell of unresolved) if (!knownMines.has(cell)) { knownMines.add(cell); changed = true; }
    }

    if (!changed) break;
  }
  return allCells.every(cell => mines.has(cell) || revealed.has(cell));
};

export const generateMinesweeperPuzzle = ({
  rows,
  columns,
  mineCount,
  start,
  random = Math.random,
  excludedLayouts = [],
  maxAttempts = 4000,
}: GenerateMinesweeperPuzzleOptions): MinesweeperPuzzleDefinition => {
  const [startRow, startColumn] = start.split(',').map(Number);
  if (!Number.isInteger(startRow) || !Number.isInteger(startColumn) || startRow < 0 || startColumn < 0 || startRow >= rows || startColumn >= columns) {
    throw new Error('Invalid Minesweeper starting cell.');
  }

  const protectedCells = new Set([start, ...neighboringCells(start, rows, columns)]);
  const candidates = Array.from({ length: rows * columns }, (_, index) => `${Math.floor(index / columns)},${index % columns}`)
    .filter(cell => !protectedCells.has(cell));
  if (mineCount < 1 || mineCount > candidates.length) throw new Error('Invalid Minesweeper mine count.');

  const excluded = new Set(excludedLayouts);
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const shuffled = [...candidates];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    const mines = shuffled.slice(0, mineCount).sort();
    const layout = mines.join('|');
    if (excluded.has(layout)) continue;
    const puzzle = { rows, columns, mines, start };
    if (isMinesweeperPuzzleNoGuess(puzzle)) return puzzle;
  }

  throw new Error('Unable to generate a no-guess Minesweeper board.');
};

export type MinesweeperTeamAction = 'SAFE' | 'MINE' | 'FLAG_ADDED' | 'FLAG_REMOVED' | 'INVALID';

export const resolveMinesweeperTeamTurn = (
  scores: Record<'A' | 'B', number>,
  team: 'A' | 'B',
  action: MinesweeperTeamAction,
  completed = false,
): { scores: Record<'A' | 'B', number>; nextTeam: 'A' | 'B' } => {
  if (action === 'SAFE') {
    return {
      scores: { ...scores, [team]: scores[team] + (completed ? 2 : 1) },
      nextTeam: completed ? team : (team === 'A' ? 'B' : 'A'),
    };
  }
  if (action === 'MINE') {
    return { scores: { ...scores, [team]: scores[team] - 1 }, nextTeam: team === 'A' ? 'B' : 'A' };
  }
  if (action === 'FLAG_ADDED') return { scores: { ...scores }, nextTeam: team === 'A' ? 'B' : 'A' };
  return { scores: { ...scores }, nextTeam: team };
};

export const revealTriggeredMine = (
  revealed: ReadonlySet<string>,
  mine: string,
): Set<string> => new Set([...revealed, mine]);

export const continueAfterMinesweeperHit = (
  revealed: ReadonlySet<string>,
  flags: ReadonlySet<string>,
  neutralFlags: ReadonlySet<string>,
  mine: string,
): { revealed: Set<string>; flags: Set<string>; neutralFlags: Set<string> } => {
  const nextRevealed = new Set(revealed);
  nextRevealed.delete(mine);
  return {
    revealed: nextRevealed,
    flags: new Set([...flags, mine]),
    neutralFlags: new Set([...neutralFlags, mine]),
  };
};

export type LogicMark = 'UNKNOWN' | 'NO' | 'YES';
export interface LogicConstraint { person: number; choice: number; relation: 'IS' | 'NOT' }

export const applyLogicMark = (
  marks: Readonly<Record<string, LogicMark>>,
  row: number,
  col: number,
  mark: LogicMark,
  size: number,
  autoOrganize: boolean,
): Record<string, LogicMark> => {
  const next: Record<string, LogicMark> = { ...marks, [`${row},${col}`]: mark };
  if (!autoOrganize) return next;

  for (let pass = 0; pass < size * size; pass += 1) {
    let changed = false;
    for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
      const yesCol = Array.from({ length: size }, (_, index) => index).find(index => next[`${rowIndex},${index}`] === 'YES');
      if (yesCol !== undefined) {
        for (let index = 0; index < size; index += 1) if (index !== yesCol && next[`${rowIndex},${index}`] !== 'NO') { next[`${rowIndex},${index}`] = 'NO'; changed = true; }
      } else {
        const unknown = Array.from({ length: size }, (_, index) => index).filter(index => (next[`${rowIndex},${index}`] ?? 'UNKNOWN') === 'UNKNOWN');
        if (unknown.length === 1) { next[`${rowIndex},${unknown[0]}`] = 'YES'; changed = true; }
      }
    }
    for (let colIndex = 0; colIndex < size; colIndex += 1) {
      const yesRow = Array.from({ length: size }, (_, index) => index).find(index => next[`${index},${colIndex}`] === 'YES');
      if (yesRow !== undefined) {
        for (let index = 0; index < size; index += 1) if (index !== yesRow && next[`${index},${colIndex}`] !== 'NO') { next[`${index},${colIndex}`] = 'NO'; changed = true; }
      } else {
        const unknown = Array.from({ length: size }, (_, index) => index).filter(index => (next[`${index},${colIndex}`] ?? 'UNKNOWN') === 'UNKNOWN');
        if (unknown.length === 1) { next[`${unknown[0]},${colIndex}`] = 'YES'; changed = true; }
      }
    }
    if (!changed) break;
  }
  return next;
};

export const countLogicPuzzleSolutions = (size: number, constraints: readonly LogicConstraint[]): number => {
  const permutations = (values: number[]): number[][] => values.length <= 1
    ? [values]
    : values.flatMap((value, index) => permutations(values.filter((_, itemIndex) => itemIndex !== index)).map(rest => [value, ...rest]));
  return permutations(Array.from({ length: size }, (_, index) => index)).filter(solution => constraints.every(constraint =>
    constraint.relation === 'IS'
      ? solution[constraint.person] === constraint.choice
      : solution[constraint.person] !== constraint.choice,
  )).length;
};

export type WordSubmissionKind = 'TOO_SHORT' | 'DUPLICATE' | 'TARGET' | 'COMMON_EXTENSION' | 'REVIEW';
export const classifyWordSubmission = (
  word: string,
  targets: readonly string[],
  foundTargets: readonly string[],
  foundExtensions: readonly string[],
  commonWords: ReadonlySet<string>,
): WordSubmissionKind => {
  if (word.length < 2) return 'TOO_SHORT';
  if (foundTargets.includes(word) || foundExtensions.includes(word)) return 'DUPLICATE';
  if (targets.includes(word)) return 'TARGET';
  if (commonWords.has(word)) return 'COMMON_EXTENSION';
  return 'REVIEW';
};

export const isNonogramSolved = (
  filled: ReadonlySet<string>,
  solution: ReadonlySet<string>,
): boolean => filled.size === solution.size && [...solution].every(cell => filled.has(cell));

export const getLineRuns = (values: readonly boolean[]): number[] => {
  const runs: number[] = [];
  let active = 0;
  for (const value of values) {
    if (value) active += 1;
    else if (active > 0) {
      runs.push(active);
      active = 0;
    }
  }
  if (active > 0) runs.push(active);
  return runs.length > 0 ? runs : [0];
};

export const applyHanoiMove = (
  rods: readonly (readonly number[])[],
  from: number,
  to: number,
): number[][] => {
  const next = rods.map(rod => [...rod]);
  if (from === to || from < 0 || to < 0 || from >= next.length || to >= next.length) return next;
  const disk = next[from][next[from].length - 1];
  const destinationTop = next[to][next[to].length - 1];
  if (disk === undefined || (destinationTop !== undefined && destinationTop < disk)) return next;
  next[from].pop();
  next[to].push(disk);
  return next;
};

export const isHanoiSolved = (rods: readonly (readonly number[])[], diskCount: number): boolean =>
  rods[2]?.length === diskCount;

export const isLogicGridSolved = (
  selections: readonly (number | null)[],
  solution: readonly number[],
): boolean => selections.length === solution.length && selections.every((selection, index) => selection === solution[index]);

export const solveMatchstickMove = (
  source: string | null,
  target: string | null,
  solution: { source: string; target: string },
): boolean => source === solution.source && target === solution.target;

export const isValidWordPath = (path: readonly number[], columns: number): boolean => {
  if (path.length === 0 || new Set(path).size !== path.length) return false;
  return path.slice(1).every((cell, index) => {
    const previous = path[index];
    const rowDistance = Math.abs(Math.floor(cell / columns) - Math.floor(previous / columns));
    const colDistance = Math.abs((cell % columns) - (previous % columns));
    return rowDistance + colDistance === 1;
  });
};

export interface NimMoveResult {
  piles: number[];
  finished: boolean;
  moverWon: boolean;
}

export const applyNimMove = (
  piles: readonly number[],
  pileIndex: number,
  amount: number,
  misere: boolean,
): NimMoveResult | null => {
  if (!Number.isInteger(amount) || amount < 1 || pileIndex < 0 || pileIndex >= piles.length || amount > piles[pileIndex]) {
    return null;
  }
  const next = [...piles];
  next[pileIndex] -= amount;
  const finished = next.every(count => count === 0);
  return { piles: next, finished, moverWon: finished ? !misere : false };
};

export const getNimTeachingMove = (piles: readonly number[], misere: boolean): { pileIndex: number; amount: number } | null => {
  const remaining = piles.reduce((sum, pile) => sum + pile, 0);
  if (remaining === 0) return null;
  if (misere && piles.filter(pile => pile > 1).length === 0) {
    const pileIndex = piles.findIndex(pile => pile > 0);
    return { pileIndex, amount: 1 };
  }
  const xor = piles.reduce((value, pile) => value ^ pile, 0);
  if (xor !== 0) {
    for (let pileIndex = 0; pileIndex < piles.length; pileIndex += 1) {
      const target = piles[pileIndex] ^ xor;
      if (target < piles[pileIndex]) return { pileIndex, amount: piles[pileIndex] - target };
    }
  }
  const pileIndex = piles.findIndex(pile => pile > 0);
  return pileIndex >= 0 ? { pileIndex, amount: 1 } : null;
};

export const coordinateLabel = (row: number, col: number): string =>
  `${String.fromCharCode(65 + col)}${row + 1}`;

export type FacilitatedTeam = 'A' | 'B';
export type FacilitatedScores = Record<FacilitatedTeam, number>;

export const advanceTeam = (team: FacilitatedTeam): FacilitatedTeam => team === 'A' ? 'B' : 'A';

export const awardTeam = (
  scores: FacilitatedScores,
  team: FacilitatedTeam,
  points = 1,
): FacilitatedScores => ({ ...scores, [team]: scores[team] + points });
