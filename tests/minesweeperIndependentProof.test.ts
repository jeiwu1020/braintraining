import { describe, expect, it } from 'vitest';
import { MINESWEEPER_SEEDS, generateGradedMinesweeper } from '../data/minesweeperPuzzles';
import { gradeMinesweeperPuzzle, solveMinesweeperTrace } from '../utils/minesweeperInference';

// Independent reference geometry and flood fill: no production inference, observation,
// neighboring-cell, reveal, or counting helper is used to check a claimed deduction.
const all = Array.from({length:36},(_,i)=>`${Math.floor(i/6)},${i%6}`);
const neighbors = (cell:string) => {
 const [row,col]=cell.split(',').map(Number);
 return all.filter(other=>{const [r,c]=other.split(',').map(Number);return other!==cell && Math.abs(r-row)<=1 && Math.abs(c-col)<=1;});
};
const adjacent = (cell:string,mines:Set<string>)=>neighbors(cell).filter(c=>mines.has(c)).length;
const flood = (cell:string, mines:Set<string>, revealed:Set<string>)=>{
 const queue=[cell];while(queue.length){const key=queue.pop()!;if(mines.has(key)||revealed.has(key))continue;revealed.add(key);if(adjacent(key,mines)===0)queue.push(...neighbors(key));}
};

describe('independent Minesweeper proof replay',()=>{
 it('every non-single deduction holds in every mine placement compatible with the visible numbers',()=>{
  let checked=0;
  for(const puzzle of MINESWEEPER_SEEDS){
   const mines=new Set(puzzle.mines); const revealed=new Set<string>();const flags=new Set<string>();flood(puzzle.start,mines,revealed);
   for(const step of solveMinesweeperTrace(puzzle).steps){
    expect(step.targets.every(c=>!revealed.has(c)&&!flags.has(c))).toBe(true);
    if(step.technique!=='SINGLE'){
     const unknown=all.filter(c=>!revealed.has(c)&&!flags.has(c));
     const equations=[...revealed].map(c=>({indices:neighbors(c).filter(n=>unknown.includes(n)).map(n=>unknown.indexOf(n)), count:adjacent(c,mines)-neighbors(c).filter(n=>flags.has(n)).length}));
     const candidate=new Set<number>();let worlds=0;
     const enumerate=(index:number,left:number)=>{
      if(left<0||left>unknown.length-index)return;
      if(equations.some(e=>{const placed=e.indices.filter(i=>i<index&&candidate.has(i)).length;const available=e.indices.filter(i=>i>=index).length;return placed>e.count||placed+available<e.count;}))return;
      if(index===unknown.length){worlds++;for(const target of step.targets)expect(candidate.has(unknown.indexOf(target))).toBe(step.action==='FLAG');return;}
      enumerate(index+1,left);candidate.add(index);enumerate(index+1,left-1);candidate.delete(index);
     };
     enumerate(0,mines.size-flags.size);expect(worlds).toBeGreaterThan(0);checked++;
    }
    for(const target of step.targets){expect(mines.has(target)).toBe(step.action==='FLAG');if(step.action==='FLAG')flags.add(target);else flood(target,mines,revealed);}
   }
   expect(revealed.size).toBe(36 - mines.size);
  }
  expect(checked).toBeGreaterThan(50);
 }, 30000);
 it('retains exact grading for every selectable transform, not just a single lucky draw',()=>{
  let checked=0;
  for(const tier of ['BEGINNER','STANDARD','CHALLENGE'] as const)for(const start of all){
   const seen:string[]=[];
   for(let i=0;i<10;i++){
    const puzzle=generateGradedMinesweeper(tier,start,seen,()=>0);if(puzzle.repeated)break;
    seen.push(puzzle.id);expect(gradeMinesweeperPuzzle(puzzle)).toBe(tier);checked++;
   }
  }
  expect(checked).toBe(432);
 });
});
