import { expect,it } from 'vitest';
import { getNimTeachingMove } from '../utils/facilitatedPuzzleRules';
import { legalNimMoves, nimWinning, chooseNimOpponent } from '../utils/nimRules';
it('corrects the last-large-pile misere teaching strategy',()=>{
 expect(getNimTeachingMove([0,0,1,2],true)).toEqual({pileIndex:3,amount:2});
 expect(getNimTeachingMove([1,1,3],true)).toEqual({pileIndex:2,amount:2});
});
it('follows the last-stone rule at terminal and one-pile states',()=>{
 expect(nimWinning([0,0],'NORMAL')).toBe(false);expect(nimWinning([0,0],'MISERE')).toBe(true);
 expect(nimWinning([1],'NORMAL')).toBe(true);expect(nimWinning([1],'MISERE')).toBe(false);
 expect(nimWinning([2],'MISERE')).toBe(true);expect(chooseNimOpponent([2],'MISERE','STRATEGIC')).toEqual({pileIndex:0,amount:1});
 expect(legalNimMoves([1,2])).toHaveLength(3);
});
it('all strategic moves from winning positions leave a losing reply state',()=>{
 for(const rule of ['NORMAL','MISERE'] as const)for(let a=0;a<=4;a++)for(let b=0;b<=4;b++)for(let c=0;c<=4;c++){
  const piles=[a,b,c];const move=chooseNimOpponent(piles,rule,'STRATEGIC');
  if(a+b+c===0){expect(move).toBeNull();continue;}
  expect(legalNimMoves(piles)).toContainEqual(move);
  if(nimWinning(piles,rule)){const next=[...piles];next[move!.pileIndex]-=move!.amount;expect(nimWinning(next,rule)).toBe(false);}
  const old=getNimTeachingMove(piles,rule==='MISERE')!;
  if(nimWinning(piles,rule)){const next=[...piles];next[old.pileIndex]-=old.amount;expect(nimWinning(next,rule)).toBe(false);}
 }
});
it('simple teaching mode is visible and deterministic, not secretly optimal',()=>{
 expect(chooseNimOpponent([1,3,2],'NORMAL','SIMPLE')).toEqual({pileIndex:1,amount:1});
 expect(chooseNimOpponent([1,3,2],'MISERE','SIMPLE')).toEqual({pileIndex:1,amount:1});
});
