import { revealMinesweeperRegion } from '../utils/facilitatedPuzzleRules';
import { describe, expect, it } from 'vitest';
import * as bank from '../data/minesweeperPuzzles';
import { gradeMinesweeperPuzzle, mineCells, mineNeighbors, solveMinesweeperTrace, type MinesweeperTier } from '../utils/minesweeperInference';

describe('verified three-tier Minesweeper bank', () => {
  it('contains several genuinely distinct generated structures in each tier', () => {
    expect(bank.MINESWEEPER_SEEDS).toBeDefined();
    for (const tier of ['BEGINNER', 'STANDARD', 'CHALLENGE'] as const) {
      const seeds = bank.MINESWEEPER_SEEDS.filter(p => p.tier === tier);
      expect(seeds.length).toBeGreaterThanOrEqual(3);
      const canonical = (mines: readonly string[]) => Array.from({length:8},(_,variant) => mines.map(key=>{
        let [r,c]=key.split(',').map(Number);if(variant>=4)c=5-c;for(let i=0;i<variant%4;i++)[r,c]=[c,5-r];return `${r},${c}`;
      }).sort().join('|')).sort()[0];
      expect(new Set(seeds.map(p => canonical(p.mines))).size).toBe(seeds.length);
      for (const puzzle of seeds) {
        expect(puzzle.rows).toBeLessThanOrEqual(6); expect(puzzle.columns).toBeLessThanOrEqual(6);
        expect(gradeMinesweeperPuzzle(puzzle)).toBe(tier);
        const trace = solveMinesweeperTrace(puzzle);
        expect(trace.solved).toBe(true); expect(trace.steps.length).toBeGreaterThan(0);
        if (tier === 'STANDARD') expect(trace.steps.some(s => s.technique === 'SUBSET')).toBe(true);
        if (tier === 'CHALLENGE') expect(trace.steps.some(s => s.technique === 'GLOBAL')).toBe(true);
      }
    }
  });
  it.each(['BEGINNER', 'STANDARD', 'CHALLENGE'] as MinesweeperTier[])('provides an exact-grade protected first move for every coordinate in %s', tier => {
    for (const start of mineCells(6, 6)) {
      const puzzle = bank.generateGradedMinesweeper(tier, start, [], () => 0);
      expect(puzzle.start).toBe(start); expect(gradeMinesweeperPuzzle(puzzle)).toBe(tier);
      expect(puzzle.mines.some(mine => [start, ...mineNeighbors(start, 6, 6)].includes(mine))).toBe(false);
    }
  });
  it('chooses an unseen recipe when available and terminates with a disclosed repeat when exhausted', () => {
    const first = bank.generateGradedMinesweeper('STANDARD', '0,0', [], () => 0);
    const second = bank.generateGradedMinesweeper('STANDARD', '0,0', [first.id], () => 0);
    expect(second.id).not.toBe(first.id); expect(second.repeated).toBe(false);
    const seen: string[] = []; let last = first;
    for (let i = 0; i < 30 && !last.repeated; i++) { last = bank.generateGradedMinesweeper('STANDARD', '0,0', seen, () => 0); seen.push(last.id); }
    expect(last.repeated).toBe(true);
  });
});

it('keeps openings and later zero floods bounded while preserving several public inference turns',()=>{
 for(const puzzle of bank.MINESWEEPER_SEEDS){
  const trace=solveMinesweeperTrace(puzzle);
  expect(trace.initialRevealed.length,puzzle.id).toBeLessThanOrEqual(12);
  expect(trace.steps.length,puzzle.id).toBeGreaterThanOrEqual(puzzle.tier==='BEGINNER'?6:puzzle.tier==='STANDARD'?8:10);
  expect(trace.steps.filter(s=>s.action==='REVEAL').length,puzzle.id).toBeGreaterThanOrEqual(3);
  for(const key of mineCells(6,6).filter(k=>!puzzle.mines.includes(k))) expect(revealMinesweeperRegion(key,new Set(puzzle.mines),new Set(),new Set(),6,6).size,puzzle.id).toBeLessThanOrEqual(12);
  expect(puzzle.mines.length).toBe(puzzle.tier==='BEGINNER'?6:puzzle.tier==='STANDARD'?7:8);
 }
});
