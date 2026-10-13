import{expect,it}from'vitest';import{canCaptureTen,tenPoints,solveTenCaptures,type TenCard,type TenPuzzle}from'../utils/chineseTenRules';
const c=(suit:TenCard['suit'],rank:number):TenCard=>({id:`${suit}-${rank}`,suit,rank});
it('matches numeric complements or equal ranks10–K only, with explicit points',()=>{
 for(let a=1;a<=13;a++)for(let b=1;b<=13;b++)expect(canCaptureTen(c('heart',a),c('club',b))).toBe(a<10&&b<10?a+b===10:a===b&&a>=10);
 expect(tenPoints(c('spade',1))).toBe(30);expect(tenPoints(c('heart',1))).toBe(20);expect(tenPoints(c('diamond',9))).toBe(10);expect(tenPoints(c('club',13))).toBe(0);expect(tenPoints(c('heart',8))).toBe(8);
});
it('evaluates both public captures including the known next table card instead of greedy first points',()=>{
 const p:TenPuzzle={id:'lookahead',tier:'CHALLENGE',title:'',focus:'',hand:[c('diamond',9),c('club',4)],table:[c('heart',1),c('heart',6)],captures:2,incoming:c('spade',1)};
 const solved=solveTenCaptures(p);expect(solved.maxPoints).toBe(46);expect(solved.plans).toHaveLength(1);expect(solved.plans[0][0]).toEqual({handId:'club-4',tableId:'heart-6'});expect(solved.plans[0][1]).toEqual({handId:'diamond-9',tableId:'spade-1'});
});
