import { describe, expect, it } from 'vitest';
import { HANOI_PUZZLES } from '../data/hanoiPuzzles';
import { hanoiComparison, solveHanoi, validateHanoi } from '../utils/hanoiRules';
it('has four legal distinct planning tasks per tier, with verified shortest continuations', () => {
  expect(HANOI_PUZZLES).toHaveLength(12);
  expect(new Set(HANOI_PUZZLES.map(p => JSON.stringify(p.rods))).size).toBe(12);
  for(const tier of ['BEGINNER','STANDARD','CHALLENGE']) expect(HANOI_PUZZLES.filter(p=>p.tier===tier)).toHaveLength(4);
  for(const p of HANOI_PUZZLES){
    expect(validateHanoi(p.rods),p.id).toBe(true);
    const distance=solveHanoi(p.rods,p.target)!.length;
    if(p.tier==='BEGINNER'){expect(distance).toBeGreaterThanOrEqual(1);expect(distance).toBeLessThanOrEqual(3);}
    if(p.tier==='STANDARD'){expect(p.rods.flat()).toHaveLength(3);expect(distance).toBeGreaterThanOrEqual(4);}
    if(p.tier==='CHALLENGE'){
      expect(distance).toBeGreaterThanOrEqual(8); expect(distance).toBeLessThan(15);
      const alternatives=hanoiComparison(p.rods,p.target);expect(alternatives.length).toBeGreaterThanOrEqual(2);
      expect(alternatives.at(-1)!.remaining).toBeGreaterThan(alternatives[0].remaining);
    }
  }
});
