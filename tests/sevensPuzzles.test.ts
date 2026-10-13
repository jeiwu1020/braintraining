import{expect,it}from'vitest';import{SEVENS_PUZZLES}from'../data/sevensPuzzles';import{solveSevensOrders,applySevensCard,isSevensPlayable}from'../utils/sevensRules';
it('has twelve verified short rounds including genuine public-opening traps',()=>{
 expect(SEVENS_PUZZLES).toHaveLength(12);for(const tier of ['BEGINNER','STANDARD','CHALLENGE'])expect(SEVENS_PUZZLES.filter(p=>p.tier===tier)).toHaveLength(4);
 for(const p of SEVENS_PUZZLES){const paths=solveSevensOrders(p);expect(paths.length,p.id).toBeGreaterThan(0);expect(new Set(p.hand.map(c=>`${c.suit}-${c.rank}`)).size).toBe(p.hand.length);for(const path of paths){let b=p.board;path.forEach((id,i)=>{const card=p.hand.find(c=>c.id===id)!;b=applySevensCard(b,card)!;expect(b).not.toBeNull();if(p.opponent&&i<path.length-1)expect(isSevensPlayable(b,p.opponent)).toBe(false);});}if(p.tier==='CHALLENGE')expect(solveSevensOrders({...p,opponent:undefined}).length).toBeGreaterThan(paths.length);}
});
it('never duplicates a public hand or opponent card inside the already played board range',()=>{
 for(const p of SEVENS_PUZZLES)for(const c of [...p.hand,...(p.opponent?[p.opponent]:[])]){const row=p.board[c.suit];expect(!row||c.rank<row.min||c.rank>row.max,`${p.id}: ${c.id}`).toBe(true);}
});
