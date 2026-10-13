import{expect,it}from'vitest';import{applySevensCard,isSevensPlayable,solveSevensOrders,type SevensPuzzle,type SevensCardData}from'../utils/sevensRules';
const c=(suit:SevensCardData['suit'],rank:number):SevensCardData=>({id:`${suit}-${rank}`,suit,rank});
it('opens each suit only at seven and extends exactly one endpoint without wrap',()=>{
 const board={spade:{min:6,max:8}};expect(isSevensPlayable(board,c('spade',5))).toBe(true);expect(isSevensPlayable(board,c('spade',9))).toBe(true);expect(isSevensPlayable(board,c('heart',7))).toBe(true);for(const card of [c('spade',6),c('spade',10),c('heart',8),c('heart',0)])expect(isSevensPlayable(board,card)).toBe(false);
 expect(applySevensCard(board,c('spade',5))).toEqual({spade:{min:5,max:8}});expect(board.spade.min).toBe(6);
});
it('accepts multiple dependency-respecting orders and distinguishes early public opening',()=>{
 const p:SevensPuzzle={id:'short',tier:'STANDARD',title:'',focus:'',board:{spade:{min:7,max:7},heart:{min:7,max:7}},hand:[c('spade',6),c('spade',5),c('heart',8)],targetMoves:3};
 expect(solveSevensOrders(p)).toHaveLength(3);const challenge={...p,tier:'CHALLENGE' as const,opponent:c('spade',4)};expect(solveSevensOrders(challenge)).toHaveLength(2);expect(solveSevensOrders(challenge).every(path=>path.at(-1)==='spade-5')).toBe(true);
});
