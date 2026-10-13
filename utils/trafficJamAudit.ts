import type { TrafficCar } from './facilitatedPuzzleRules';
import { tryTrafficMove, type TrafficMove } from './trafficJamModel';

export interface TrafficSolutionMetrics {
  participatingCars: number;
  reversalsInSolution: number;
  reversingCars: string[];
  /** Longest first-move prerequisite chain in this verified solution, not a clinical rating. */
  dependencyDepth: number;
  dependencyChain: string[];
}
const cells = (car: TrafficCar): [number, number][] => Array.from({ length: car.length }, (_, offset) => [car.row + (car.axis === 'V' ? offset : 0), car.col + (car.axis === 'H' ? offset : 0)]);
const transforms = [
  (r: number, c: number) => [r, c], (r: number, c: number) => [r, 5 - c],
  (r: number, c: number) => [5 - r, c], (r: number, c: number) => [5 - r, 5 - c],
  (r: number, c: number) => [c, r], (r: number, c: number) => [c, 5 - r],
  (r: number, c: number) => [5 - c, r], (r: number, c: number) => [5 - c, 5 - r],
];
/** Ignores names and colors and folds all eight rotations/reflections together. */
export function trafficGeometrySignature(cars: readonly TrafficCar[]): string {
  return transforms.map(transform => cars.map(car => `${car.target ? 'X' : '_'}:${cells(car).map(([r, c]) => transform(r, c).join(',')).sort().join(';')}`).sort().join('|')).sort()[0];
}
/** Also excludes different scrambles of the same car lanes/lengths from counting as new structures. */
export function trafficTopologySignature(cars: readonly TrafficCar[]): string {
  return transforms.map(transform => cars.map(car => {
    const transformed = cells(car).map(([r, c]) => transform(r, c));
    const horizontal = transformed.every(([r]) => r === transformed[0][0]);
    return `${car.target ? 'X' : '_'}:${horizontal ? 'H' : 'V'}:${transformed[0][horizontal ? 0 : 1]}:${car.length}`;
  }).sort().join('|')).sort()[0];
}

export function analyzeTrafficSolution(initial: readonly TrafficCar[], solution: readonly TrafficMove[]): TrafficSolutionMetrics {
  const initialOccupancy = new Map(initial.flatMap(car => cells(car).map(([r, c]) => [`${r},${c}`, car.id] as const)));
  const chains = new Map<string, string[]>();
  const lastDirection = new Map<string, number>();
  const reversingCars = new Set<string>();
  let reversalsInSolution = 0;
  let cars = initial.map(car => ({ ...car }));
  let longest: string[] = [];
  for (const move of solution) {
    const car = cars.find(candidate => candidate.id === move.carId);
    const next = tryTrafficMove(cars, move);
    if (!car || !next) throw new Error(`Invalid traffic solution move: ${move.carId} ${move.distance}`);
    const sign = Math.sign(move.distance);
    if (lastDirection.has(car.id) && lastDirection.get(car.id) !== sign) { reversalsInSolution += 1; reversingCars.add(car.id); }
    lastDirection.set(car.id, sign);
    if (!chains.has(car.id)) {
      let predecessor: string[] = [];
      for (let distance = sign; Math.abs(distance) <= Math.abs(move.distance); distance += sign) {
        const moving = { ...car, row: car.row + (car.axis === 'V' ? distance : 0), col: car.col + (car.axis === 'H' ? distance : 0) };
        for (const [r, c] of cells(moving)) {
          const blocker = initialOccupancy.get(`${r},${c}`);
          const chain = blocker && blocker !== car.id ? chains.get(blocker) : undefined;
          if (chain && chain.length > predecessor.length) predecessor = chain;
        }
      }
      const chain = [...predecessor, car.id];
      chains.set(car.id, chain);
      if (chain.length > longest.length) longest = chain;
    }
    cars = next;
  }
  return { participatingCars: lastDirection.size, reversalsInSolution, reversingCars: [...reversingCars].sort(), dependencyDepth: Math.max(0, longest.length - 1), dependencyChain: longest };
}
