import { describe, expect, it } from 'vitest';
import { applyHanoiCommand, hanoiMoves, solveHanoi, validateHanoi } from '../utils/hanoiRules';
describe('small Hanoi planning', () => {
  it('validates unique disk sizes and bottom-to-top order', () => {
    expect(validateHanoi([[3,2],[1],[]])).toBe(true);
    expect(validateHanoi([[1,2],[],[]])).toBe(false);
    expect(validateHanoi([[2,1],[1],[]])).toBe(false);
    expect(validateHanoi([[4,2],[],[]])).toBe(false);
  });
  it('only moves one top disk without changing rejected commands', () => {
    const rods = [[3,2],[1],[]];
    expect(applyHanoiCommand(rods,{from:0,to:1})).toBe(rods);
    expect(applyHanoiCommand(rods,{from:0,to:0})).toBe(rods);
    expect(applyHanoiCommand(rods,{from:0,to:2})).toEqual([[3],[1],[2]]);
    expect(hanoiMoves(rods)).toHaveLength(3);
  });
  it('finds shortest continuations from complete towers and arbitrary legal midgames', () => {
    expect(solveHanoi([[2,1],[],[]],2)).toHaveLength(3);
    expect(solveHanoi([[3,2,1],[],[]],2)).toHaveLength(7);
    expect(solveHanoi([[4,3,2,1],[],[]],2)).toHaveLength(15);
    const rods = [[1],[],[3,2]];
    expect(solveHanoi(rods,2)).toEqual([{from:0,to:2,disk:1}]);
    expect(solveHanoi([[],[],[3,2,1]],2)).toEqual([]);
  });
  it('replays every solution without breaking the size rule', () => {
    for(let code=0;code<81;code++) {
      let value=code; let rods:number[][]=[[],[],[]];
      for(let disk=4;disk>=1;disk--){rods[value%3].push(disk);value=Math.floor(value/3);}
      const moves=solveHanoi(rods,2)!;
      for(const move of moves){rods=applyHanoiCommand(rods,move);expect(validateHanoi(rods)).toBe(true);}
      expect(rods).toEqual([[],[],[4,3,2,1]]);
    }
  });
});
