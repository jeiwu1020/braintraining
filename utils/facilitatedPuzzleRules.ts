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
    return rowDistance <= 1 && colDistance <= 1 && rowDistance + colDistance > 0;
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
