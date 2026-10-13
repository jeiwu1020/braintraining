import type { MinesweeperPuzzleDefinition } from '../utils/facilitatedPuzzleRules';
import type { MinesweeperTier } from '../utils/minesweeperInference';

export interface GradedMinesweeperPuzzle extends MinesweeperPuzzleDefinition { id: string; tier: MinesweeperTier; repeated: boolean }
export const MINESWEEPER_MINE_COUNTS: Record<MinesweeperTier, number> = { BEGINNER: 6, STANDARD: 7, CHALLENGE: 8 };
// Seed 20261013; first neighborhoods protected, every zero flood <=12 cells.
// Verified reference traces have >=6/8/10 inference actions, >=3 safe-reveal deductions.
// Rotations/reflections are variations, not additional original structures.
const recipes: Array<[MinesweeperTier, string, string[]]> = [
  ["BEGINNER", "0,0", ["0,2", "1,2", "1,4", "4,2", "4,3", "5,1"]],
  ["BEGINNER", "0,0", ["0,2", "1,2", "1,5", "2,2", "2,5", "5,2"]],
  ["BEGINNER", "0,0", ["0,2", "0,5", "1,2", "2,4", "3,5", "4,2"]],
  ["BEGINNER", "0,1", ["0,4", "1,5", "2,2", "3,0", "3,1", "4,2"]],
  ["BEGINNER", "0,1", ["0,3", "1,3", "2,0", "3,5", "4,3", "5,5"]],
  ["BEGINNER", "0,1", ["0,5", "1,5", "2,2", "2,5", "3,0", "4,2"]],
  ["BEGINNER", "0,2", ["0,4", "2,0", "2,1", "4,3", "4,4", "5,0"]],
  ["BEGINNER", "0,2", ["0,0", "0,5", "1,5", "3,2", "4,2", "4,3"]],
  ["BEGINNER", "0,2", ["0,5", "2,2", "3,0", "4,0", "4,5", "5,4"]],
  ["BEGINNER", "1,1", ["0,3", "0,4", "3,0", "3,1", "4,4", "5,3"]],
  ["BEGINNER", "1,1", ["0,3", "1,3", "2,3", "3,5", "4,1", "5,2"]],
  ["BEGINNER", "1,1", ["0,3", "1,3", "3,2", "3,3", "4,0", "5,3"]],
  ["BEGINNER", "1,2", ["0,4", "1,4", "2,5", "3,1", "4,2", "4,3"]],
  ["BEGINNER", "1,2", ["0,0", "0,5", "1,0", "3,3", "4,1", "4,3"]],
  ["BEGINNER", "1,2", ["0,0", "1,5", "2,4", "3,1", "4,0", "5,1"]],
  ["BEGINNER", "2,2", ["0,4", "0,5", "1,0", "1,4", "4,2", "5,4"]],
  ["BEGINNER", "2,2", ["0,1", "2,4", "4,0", "4,1", "5,0", "5,1"]],
  ["BEGINNER", "2,2", ["0,0", "0,5", "1,0", "1,4", "3,0", "4,3"]],
  ["STANDARD", "0,0", ["2,0", "2,3", "2,4", "3,0", "3,2", "4,3", "5,1"]],
  ["STANDARD", "0,0", ["0,4", "2,0", "2,2", "2,5", "4,1", "5,2", "5,5"]],
  ["STANDARD", "0,0", ["0,3", "1,3", "2,0", "3,4", "3,5", "4,4", "5,2"]],
  ["STANDARD", "0,1", ["0,3", "0,4", "0,5", "2,1", "2,3", "4,4", "5,5"]],
  ["STANDARD", "0,1", ["0,3", "0,4", "3,1", "3,5", "4,2", "5,0", "5,3"]],
  ["STANDARD", "0,1", ["2,0", "2,1", "2,2", "2,4", "3,1", "3,2", "4,3"]],
  ["STANDARD", "0,2", ["2,1", "2,3", "2,4", "3,4", "4,3", "4,4", "4,5"]],
  ["STANDARD", "0,2", ["0,4", "1,0", "2,3", "4,0", "4,2", "4,3", "5,3"]],
  ["STANDARD", "0,2", ["1,0", "2,0", "2,3", "2,5", "3,4", "4,3", "5,2"]],
  ["STANDARD", "1,1", ["0,4", "3,1", "3,3", "3,5", "4,2", "5,2", "5,3"]],
  ["STANDARD", "1,1", ["0,4", "2,4", "3,0", "3,2", "3,4", "4,4", "5,5"]],
  ["STANDARD", "1,1", ["1,3", "1,5", "3,5", "4,1", "4,3", "4,4", "5,0"]],
  ["STANDARD", "1,2", ["1,0", "1,4", "3,0", "3,2", "3,4", "4,0", "5,4"]],
  ["STANDARD", "1,2", ["1,4", "1,5", "3,0", "3,2", "3,4", "4,0", "5,0"]],
  ["STANDARD", "1,2", ["0,5", "1,4", "3,1", "3,2", "3,4", "5,3", "5,4"]],
  ["STANDARD", "2,2", ["0,0", "1,0", "1,4", "2,5", "3,4", "4,1", "4,2"]],
  ["STANDARD", "2,2", ["0,0", "1,4", "2,0", "2,5", "4,1", "4,2", "5,1"]],
  ["STANDARD", "2,2", ["0,0", "0,2", "0,5", "3,4", "4,1", "5,0", "5,4"]],
  ["CHALLENGE", "0,0", ["0,3", "0,4", "1,4", "1,5", "3,0", "3,2", "3,4", "3,5"]],
  ["CHALLENGE", "0,0", ["0,3", "1,2", "3,2", "3,4", "4,1", "4,3", "5,4", "5,5"]],
  ["CHALLENGE", "0,0", ["0,3", "0,5", "1,2", "3,2", "4,1", "4,4", "5,2", "5,3"]],
  ["CHALLENGE", "0,1", ["0,4", "2,1", "2,3", "3,1", "3,2", "4,1", "4,3", "5,5"]],
  ["CHALLENGE", "0,1", ["0,4", "1,3", "2,0", "2,5", "3,5", "4,4", "5,2", "5,4"]],
  ["CHALLENGE", "0,1", ["2,1", "2,4", "3,0", "3,1", "3,2", "4,2", "4,4", "5,4"]],
  ["CHALLENGE", "0,2", ["0,4", "2,0", "2,5", "3,3", "3,5", "4,0", "4,4", "5,4"]],
  ["CHALLENGE", "0,2", ["0,4", "1,4", "1,5", "2,1", "2,5", "3,3", "3,4", "5,0"]],
  ["CHALLENGE", "0,2", ["0,4", "1,4", "1,5", "2,5", "3,1", "4,3", "4,5", "5,5"]],
  ["CHALLENGE", "1,1", ["0,3", "1,5", "2,5", "3,2", "3,4", "4,1", "4,5", "5,5"]],
  ["CHALLENGE", "1,1", ["0,3", "2,3", "2,5", "3,0", "3,2", "4,1", "4,2", "5,3"]],
  ["CHALLENGE", "1,1", ["1,3", "2,4", "2,5", "4,0", "4,3", "4,4", "4,5", "5,4"]],
  ["CHALLENGE", "1,2", ["1,4", "3,1", "3,3", "3,5", "4,0", "4,4", "4,5", "5,4"]],
  ["CHALLENGE", "1,2", ["0,0", "0,4", "1,4", "1,5", "3,1", "3,2", "3,3", "3,4"]],
  ["CHALLENGE", "1,2", ["0,4", "3,0", "3,1", "3,2", "3,3", "4,1", "5,1", "5,3"]],
  ["CHALLENGE", "2,2", ["1,0", "1,4", "3,0", "3,4", "4,0", "4,1", "5,1", "5,2"]],
  ["CHALLENGE", "2,2", ["0,0", "0,1", "0,4", "1,4", "2,4", "2,5", "4,1", "5,4"]],
  ["CHALLENGE", "2,2", ["0,4", "1,0", "1,4", "4,0", "4,3", "4,4", "4,5", "5,4"]],
];

export const MINESWEEPER_SEEDS: GradedMinesweeperPuzzle[] = recipes.map(([tier, start, mines]) => ({ rows: 6, columns: 6, tier, start, mines, id: `mines6:${mines.join('|')}`, repeated: false }));

const transform = (key: string, variant: number): string => {
  let [row, col] = key.split(',').map(Number);
  if (variant >= 4) col = 5 - col;
  for (let rotation = 0; rotation < variant % 4; rotation++) [row, col] = [col, 5 - row];
  return `${row},${col}`;
};

/** Bounded recipe selection, with no runtime search loop and no dependency on a lucky random draw. */
export const generateGradedMinesweeper = (tier: MinesweeperTier, start: string, seen: readonly string[] = [], random: () => number = Math.random): GradedMinesweeperPuzzle => {
  const candidates: GradedMinesweeperPuzzle[] = [];
  for (const seed of MINESWEEPER_SEEDS.filter(puzzle => puzzle.tier === tier)) {
    for (let variant = 0; variant < 8; variant++) {
      if (transform(seed.start, variant) !== start) continue;
      const mines = seed.mines.map(key => transform(key, variant)).sort();
      const id = `mines6:${mines.join('|')}`;
      if (!candidates.some(candidate => candidate.id === id)) candidates.push({ ...seed, start, mines, id });
    }
  }
  if (!candidates.length) throw new Error('Invalid Minesweeper first coordinate or tier.');
  const unseen = candidates.filter(candidate => !seen.includes(candidate.id));
  const pool = unseen.length ? unseen : candidates;
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor((random() || 0) * pool.length)));
  return { ...pool[index], repeated: !unseen.length };
};
