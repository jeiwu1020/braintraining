import type { WordPathPuzzle } from '../data/wordPathPuzzles';

export function validWordPath(path: readonly number[], puzzle: WordPathPuzzle): boolean {
  if (new Set(path).size !== path.length) return false;
  return path.every((cell, index) => {
    if (!Number.isInteger(cell) || cell < 0 || cell >= puzzle.grid.length) return false;
    if (index === 0) return true;
    const before = path[index - 1];
    return Math.abs(Math.floor(cell / puzzle.columns) - Math.floor(before / puzzle.columns))
      + Math.abs(cell % puzzle.columns - before % puzzle.columns) === 1;
  });
}
export const wordPathText = (path: readonly number[], puzzle: WordPathPuzzle): string => path.map(cell => puzzle.grid[cell]).join('');
export const wordPathCoordinates = (path: readonly number[], puzzle: WordPathPuzzle): string => path.map(cell => `${String.fromCharCode(65 + cell % puzzle.columns)}${Math.floor(cell / puzzle.columns) + 1}`).join(' → ');
export const wordPathKey = (puzzle: WordPathPuzzle, word: string, path: readonly number[]): string => `${puzzle.id}::${word}${puzzle.goal === 'TWO_PATHS' ? `::${path.join(',')}` : ''}`;
