import { describe, expect, it } from 'vitest';
import { HANOI_PUZZLES } from '../data/hanoiPuzzles';
import { solveHanoi } from '../utils/hanoiRules';
import { createHanoiSession, selectHanoiRod, commitHanoiMove, undoHanoiMove, hintHanoi, restartHanoi } from '../utils/hanoiSession';
const p=HANOI_PUZZLES[0];
const draft=(s:ReturnType<typeof createHanoiSession>,from:number,to:number)=>selectHanoiRod(selectHanoiRod(s,from),to);
describe('spoken Hanoi plans',()=>{
 it('previews both rods and commits exactly once, including the one-step completion',()=>{
  const start=createHanoiSession(p,'TEAMS');const selected=draft(start,0,2);
  expect(selected.rods).toEqual(start.rods);expect(selected.steps).toBe(0);
  const done=commitHanoiMove(selected,p,selected.revision);expect(done.finished).toBe(true);expect(done.steps).toBe(1);expect(done.scores).toEqual({A:1,B:0});expect(done.team).toBe('B');
  expect(commitHanoiMove(done,p,selected.revision)).toBe(done);
  const undo=undoHanoiMove(done);expect(undo.rods).toEqual(start.rods);expect(undo.steps).toBe(0);expect(undo.team).toBe('A');expect(undo.scores).toEqual({A:0,B:0});expect(undo.to).toBe(2);
 });
 it('keeps one group for a whole short plan and alternates only on completion',()=>{
  const task=HANOI_PUZZLES[2];let state=createHanoiSession(task,'TEAMS');
  for(const move of solveHanoi(task.rods,task.target)!){expect(state.team).toBe('A');state=draft(state,move.from,move.to);state=commitHanoiMove(state,task,state.revision);}
  expect(state.team).toBe('B');expect(restartHanoi(state,p).team).toBe('B');expect(state.steps).toBe(3);
 });
 it('does not move or spend a round for an illegal or incomplete command',()=>{
  const task=HANOI_PUZZLES[4];const start=createHanoiSession(task,'TEAMS');
  expect(commitHanoiMove(start,task,0)).toBe(start);
  const selected=draft(createHanoiSession(HANOI_PUZZLES[6],'TEAMS'),1,0);
  const invalid=commitHanoiMove(selected,HANOI_PUZZLES[6],0);expect(invalid.rods).toEqual(selected.rods);expect(invalid.steps).toBe(0);expect(invalid.history).toHaveLength(0);
 });
 it('retains full-answer knowledge across undo, reset, revisiting and mode changes',()=>{
  const task=HANOI_PUZZLES[2];let state=createHanoiSession(task,'TEAMS');
  const first=solveHanoi(task.rods,2)![0];state=draft(state,first.from,first.to);state=commitHanoiMove(state,task,0);
  state=hintHanoi(hintHanoi(hintHanoi(state,task),task),task);expect(state.revealed).toContain(task.id);
  state=undoHanoiMove(state);expect(state.hintDepth).toBe(0);expect(state.revealed).toContain(task.id);
  state=restartHanoi(restartHanoi(state,p),task,'COOP');state=restartHanoi(state,task,'TEAMS');
  for(const move of solveHanoi(task.rods,2)!){state=draft(state,move.from,move.to);state=commitHanoiMove(state,task,state.revision);}
  expect(state.finished).toBe(true);expect(state.scores).toEqual({A:0,B:0});expect(state.recent).toContain('提示練習');
 });
 it('does not repeatedly credit a completed puzzle after a retry or a full revisit',()=>{
  let state=draft(createHanoiSession(p,'TEAMS'),0,2);state=commitHanoiMove(state,p,0);state=restartHanoi(restartHanoi(state,HANOI_PUZZLES[1]),p);
  state=draft(state,0,2);state=commitHanoiMove(state,p,state.revision);expect(state.scores).toEqual({A:1,B:0});
 });
 it('hint stages follow the current board and exact demonstration never auto-commits',()=>{
  const task=HANOI_PUZZLES[4];let state=createHanoiSession(task);
  const before=state.rods;for(let i=0;i<3;i++)state=hintHanoi(state,task);
  expect(state.rods).toEqual(before);expect(state.steps).toBe(0);expect(state.to).not.toBeNull();
  state=commitHanoiMove(state,task,state.revision);for(let i=0;i<3;i++)state=hintHanoi(state,task);
  const expected=solveHanoi(state.rods,task.target)![0];expect([state.from,state.to]).toEqual([expected.from,expected.to]);
 });
});
