import {expect,it} from 'vitest';
import {NIM_PUZZLES} from '../data/nimPuzzles';
import {chooseNimOpponent,legalNimMoves} from '../utils/nimRules';
it('offers four bounded tasks per tier, without counting pile permutations as new puzzles',()=>{
 expect(NIM_PUZZLES).toHaveLength(12);
 for(const tier of ['BEGINNER','STANDARD','CHALLENGE'])expect(NIM_PUZZLES.filter(p=>p.tier===tier)).toHaveLength(4);
 for(const p of NIM_PUZZLES){expect(p.piles.every(n=>Number.isInteger(n)&&n>=0&&n<=5)).toBe(true);expect(p.piles.length).toBeLessThanOrEqual(4);expect(legalNimMoves(p.piles).length).toBeGreaterThan(0);}
 const keys=NIM_PUZZLES.map(p=>`${p.tier}:${[...p.piles].sort().join(',')}`);expect(new Set(keys).size).toBe(12);
});
it('challenge starting states genuinely change the strategic action when only the rule changes',()=>{
 for(const p of NIM_PUZZLES.filter(p=>p.tier==='CHALLENGE'))expect(chooseNimOpponent(p.piles,'NORMAL','STRATEGIC')).not.toEqual(chooseNimOpponent(p.piles,'MISERE','STRATEGIC'));
});
