export type HanoiTier = 'BEGINNER' | 'STANDARD' | 'CHALLENGE';
export interface HanoiMove { from: number; to: number; disk: number }
export interface HanoiPuzzle { id: string; tier: HanoiTier; title: string; focus: string; rods: number[][]; target: number }
export const validateHanoi = (rods: readonly (readonly number[])[]): boolean => {
  if (rods.length !== 3) return false;
  const disks = rods.flat();
  if (!disks.length || disks.length > 4 || new Set(disks).size !== disks.length || disks.some(disk => !Number.isInteger(disk) || disk < 1 || disk > disks.length)) return false;
  return rods.every(rod => rod.every((disk, index) => !index || rod[index - 1] > disk));
};
export const hanoiMoves = (rods: readonly (readonly number[])[]): HanoiMove[] => {
  if (!validateHanoi(rods)) return [];
  return rods.flatMap((rod, from) => rod.length ? rods.flatMap((destination, to) => from !== to && (!destination.length || destination.at(-1)! > rod.at(-1)!) ? [{ from, to, disk: rod.at(-1)! }] : []) : []);
};
export const applyHanoiCommand = (rods: number[][], command: { from: number; to: number }): number[][] => {
  const move = hanoiMoves(rods).find(item => item.from === command.from && item.to === command.to);
  if (!move) return rods;
  const next = rods.map(rod => [...rod]); next[move.from].pop(); next[move.to].push(move.disk); return next;
};
export const isHanoiGoal = (rods: readonly (readonly number[])[], target: number): boolean => validateHanoi(rods) && rods[target]?.length === rods.flat().length;
const key = (rods: readonly (readonly number[])[]) => rods.map(rod => rod.join(',')).join('|');
/** Exhaustive BFS over at most 3^4 = 81 legal states. Each whole disk move costs one. */
export const solveHanoi = (rods: number[][], target: number): HanoiMove[] | null => {
  if (!validateHanoi(rods) || !Number.isInteger(target) || target < 0 || target > 2) return null;
  const queue = [{ rods, moves: [] as HanoiMove[] }]; const seen = new Set([key(rods)]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor]; if (isHanoiGoal(current.rods, target)) return current.moves;
    for (const move of hanoiMoves(current.rods)) {
      const next = applyHanoiCommand(current.rods, move); const stateKey = key(next);
      if (!seen.has(stateKey)) { seen.add(stateKey); queue.push({ rods: next, moves: [...current.moves, move] }); }
    }
  }
  return null;
};
export const hanoiComparison = (rods: number[][], target: number): Array<HanoiMove & { remaining: number }> => hanoiMoves(rods)
  .map(move => ({ ...move, remaining: solveHanoi(applyHanoiCommand(rods, move), target)!.length }))
  .sort((a, b) => a.remaining - b.remaining);
