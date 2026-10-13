import{expect,it}from'vitest';import{RUMMI_PUZZLES}from'../data/rummikubPuzzles';import{isRummiGroup,solveRummiTable,validateRummiPlan}from'../utils/rummikubRules';
it('offers twelve rule-verified distinct public tasks with complete valid alternative plans',()=>{
 expect(RUMMI_PUZZLES).toHaveLength(12);for(const tier of ['BEGINNER','STANDARD','CHALLENGE'])expect(RUMMI_PUZZLES.filter(p=>p.tier===tier)).toHaveLength(4);
 for(const p of RUMMI_PUZZLES){expect(p.table.every(isRummiGroup),p.id).toBe(true);expect(new Set([...p.table.flat(),...p.hand].map(t=>t.id)).size).toBe(p.table.flat().length+p.hand.length);const solved=solveRummiTable(p);expect(solved.maxPlaced,p.id).toBeGreaterThan(0);const checked=p.plans.map(plan=>validateRummiPlan(p,plan.groups));expect(checked.some(plan=>plan.valid&&(p.tier==='BEGINNER'?plan.placed.length===1:plan.placed.length===solved.maxPlaced)),p.id).toBe(true);expect(checked.some(plan=>!plan.valid),p.id).toBe(true);}
});
it('has real reorganization tradeoffs rather than color-only extension questions',()=>{
 const challenges=RUMMI_PUZZLES.filter(p=>p.tier==='CHALLENGE');expect(challenges.map(p=>solveRummiTable(p).maxPlaced)).toEqual([2,2,3,5]);
 expect(challenges.slice(0,2).every(p=>p.plans.filter(plan=>{const r=validateRummiPlan(p,plan.groups);return r.valid&&r.placed.length===2;}).length>=2)).toBe(true);
});
