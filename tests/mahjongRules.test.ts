import{expect,it}from'vitest';import{mahjongCompletions,isMahjongGroup,mahjongDiscardOptions,type MeldTile}from'../utils/mahjongRules';
const t=(value:number,suit:MeldTile['suit']='wan'):MeldTile=>({value,suit});
it('distinguishes runs, triplets and pairs without suit mixing or wraparound',()=>{
 expect(isMahjongGroup([t(3),t(4),t(5)],'RUN')).toBe(true);expect(isMahjongGroup([t(3),t(4,'tong'),t(5)],'RUN')).toBe(false);expect(isMahjongGroup([t(8),t(9),t(1)],'RUN')).toBe(false);
 expect(isMahjongGroup([t(1,'zi'),t(2,'zi'),t(3,'zi')],'RUN')).toBe(false);expect(isMahjongGroup([t(5,'zi'),t(5,'zi'),t(5,'zi')],'TRIPLET')).toBe(true);expect(isMahjongGroup([t(2),t(2)],'PAIR')).toBe(true);
});
it('finds both ends, closed waits and boundary waits as complete sets',()=>{
 expect(mahjongCompletions([t(3),t(4)],'RUN')).toEqual([t(2),t(5)]);expect(mahjongCompletions([t(4),t(6)],'RUN')).toEqual([t(5)]);expect(mahjongCompletions([t(1),t(2)],'RUN')).toEqual([t(3)]);expect(mahjongCompletions([t(7,'zi')],'PAIR')).toEqual([t(7,'zi')]);
});
it('compares every discard, accepting tied best plans instead of a single stored answer',()=>{
 const choices=mahjongDiscardOptions([t(3),t(4),t(6)]);expect(choices.map(c=>c.completions.length)).toEqual([1,0,2]);expect(choices.filter(c=>c.best).map(c=>c.index)).toEqual([2]);
 expect(mahjongDiscardOptions([t(2),t(3),t(4)]).filter(c=>c.best).map(c=>c.index)).toEqual([0,2]);
 expect(mahjongDiscardOptions([t(1),t(2),t(4)]).filter(c=>c.best).map(c=>c.index)).toEqual([0,2]);
});
