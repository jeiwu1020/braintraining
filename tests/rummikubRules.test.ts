import {describe,expect,it} from 'vitest';
import {isRummiGroup,validateRummiPlan,solveRummiTable,type RummiPuzzle,type RummiTile} from '../utils/rummikubRules';
const tile=(id:string,color:RummiTile['color'],number:number):RummiTile=>({id,color,number});
const r=(n:number)=>tile(`r${n}`,'red',n),b=(n:number)=>tile(`b${n}`,'blue',n),k=(n:number)=>tile(`k${n}`,'black',n);
const p:RummiPuzzle={id:'split',tier:'CHALLENGE',title:'split',focus:'all groups',table:[[r(3),r(4),r(5),r(6)]],hand:[r(7),r(8),b(6),k(6)],plans:[]};
describe('complete Rummikub table rules',()=>{
 it('accepts unordered runs and distinct-color sets, rejects residuals, wraps and duplicate colors',()=>{
  expect(isRummiGroup([r(6),r(4),r(5)])).toBe(true);expect(isRummiGroup([r(6),b(6),k(6)])).toBe(true);
  for(const bad of [[r(3),r(4)],[r(12),r(13),r(1)],[r(4),r(6),r(7)],[r(6),tile('r6b','red',6),b(6)]])expect(isRummiGroup(bad)).toBe(false);
 });
 it('requires every original table tile exactly once and rejects duplication, unknown or missing tiles',()=>{
  expect(validateRummiPlan(p,[['r3','r4','r5'],['r6','b6','k6']]).valid).toBe(true);
  for(const bad of [[['r3','r4','r5']],[['r3','r4','r5'],['r6','b6','k6'],['r6','r7','r8']],[['r3','r4','r5'],['r6','b6','missing']]])expect(validateRummiPlan(p,bad).valid).toBe(false);
 });
 it('distinguishes a legal addition from the maximum hand count and finds alternative groupings',()=>{
  expect(validateRummiPlan(p,[['r3','r4','r5','r6','r7']])).toMatchObject({valid:true,placed:['r7']});
  const solved=solveRummiTable(p);expect(solved.maxPlaced).toBe(2);expect(solved.plans.some(plan=>plan.flat().includes('b6'))).toBe(true);expect(solved.plans.some(plan=>plan.flat().includes('r8'))).toBe(true);
  solved.plans.forEach(plan=>expect(validateRummiPlan(p,plan).valid).toBe(true));
 });
});
