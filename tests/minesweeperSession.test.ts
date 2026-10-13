import { describe, expect, it } from 'vitest';
import * as session from '../utils/minesweeperSession';
import { generateGradedMinesweeper } from '../data/minesweeperPuzzles';
import { inferMinesweeperStep, mineObservation, mineNeighbors, mineCells, solveMinesweeperTrace } from '../utils/minesweeperInference';

const puzzle = () => generateGradedMinesweeper('BEGINNER', '0,0', [], () => 0);
const start = () => session.confirmMineRound({ ...session.createMineSession('TEAMS'), selection: ['0,0'] }, puzzle());

describe('whole-reasoning Minesweeper session', () => {
 it('previews coordinates without changing board, scores, or team', () => {
  expect(session.createMineSession).toBeTypeOf('function');
  const state = session.createMineSession('TEAMS');
  const selected = session.selectMineCell(state, '0,0');
  expect(selected.selection).toEqual(['0,0']); expect(selected.revealed).toEqual([]); expect(selected.scores).toEqual({A:0,B:0}); expect(selected.team).toBe('A');
 });
 it('records a batch of inferred flags as one decision and no extra turn for no-op reveals or chords', () => {
  let state = start();
  const step = solveMinesweeperTrace(puzzle()).steps[0];
  state = { ...state, tool: step.action, selection: step.targets };
  const next = session.confirmMineRound(state);
  expect(next.history.length).toBe(state.history.length + 1); expect(next.team).not.toBe(state.team);
  expect(next.scores[state.team] - state.scores[state.team]).toBe(1);
  const noop = session.confirmMineRound({ ...next, tool: 'REVEAL', selection: [puzzle().start] });
  expect(noop.scores).toEqual(next.scores); expect(noop.team).toBe(next.team); expect(noop.history.length).toBe(next.history.length);
  const zeroChord = session.confirmMineRound({ ...next, tool: 'CHORD', selection: [puzzle().start] });
  expect(zeroChord.scores).toEqual(next.scores); expect(zeroChord.team).toBe(next.team);
 });
 it('undo restores the whole pre-confirmation draft, team, points, hint state, board and result', () => {
  const initial = start(); const hinted = session.requestMineHint(initial);
  const step = inferMinesweeperStep(mineObservation(puzzle(),new Set(initial.revealed),new Set(initial.flags)))!;
  const before = { ...hinted, tool: step.action, selection: step.targets };
  expect(session.undoMineRound(session.confirmMineRound(before))).toEqual(before);
 });
 it('keeps exact revealed knowledge through undo, reset, and a revisit', () => {
  let state = start(); const beforeHint = state;
  state = session.requestMineHint(session.requestMineHint(session.requestMineHint(state)));
  expect(state.exposedPuzzleIds).toContain(state.puzzle!.id);
  const undone = session.undoMineRound(state);
  expect(undone.exposedPuzzleIds).toContain(state.puzzle!.id);
  const reset = session.resetMineSession(state);
  const restarted = session.confirmMineRound({ ...reset, selection: ['0,0'] }, puzzle());
  expect(restarted.scores.A).toBe(0); expect(restarted.exposedPuzzleIds).toContain(state.puzzle!.id);
  const repeated = session.resetMineSession({ ...beforeHint, exposedPuzzleIds: state.exposedPuzzleIds });
  expect(session.confirmMineRound({...repeated, selection:['0,0']},puzzle()).scores.A).toBe(0);
 });
 it('reveals only the triggered mine, continues with a neutral flag, and undoes all of that round', () => {
  const state = { ...start(), selection: [puzzle().mines[0]] };
  const hit = session.confirmMineRound(state); expect(hit.result).toBe('MINE'); expect(hit.explodedMine).toBe(puzzle().mines[0]);
  expect(hit.revealed.filter(c => puzzle().mines.includes(c))).toEqual([puzzle().mines[0]]);
  const continued = session.continueMineSession(hit); expect(continued.result).toBe('PLAYING'); expect(continued.neutralFlags).toContain(puzzle().mines[0]);
  const undone = session.undoMineRound(continued); expect(undone.revealed).toEqual(state.revealed); expect(undone.scores).toEqual(state.scores); expect(undone.team).toBe(state.team);
  expect(undone.exposedPuzzleIds).toContain(puzzle().id);
 });
 it('does not farm participation points or turns by removing and replacing a flag', () => {
  const initial = start(); const mine=puzzle().mines[0];
  const first=session.confirmMineRound({...initial,tool:'FLAG',selection:[mine]});
  const removed=session.confirmMineRound({...first,tool:'FLAG',selection:[mine]});
  expect(removed.scores).toEqual(first.scores);expect(removed.team).toBe(first.team);
  const replaced=session.confirmMineRound({...removed,tool:'FLAG',selection:[mine]});
  expect(replaced.scores).toEqual(first.scores);expect(replaced.team).toBe(first.team);
 });
 it('finishes safely and fully restores finished, points, team and board on undo', () => {
  let state=start();
  for(let i=0;i<60 && state.result==='PLAYING';i++){
   const step=inferMinesweeperStep(mineObservation(state.puzzle!,new Set(state.revealed),new Set(state.flags)))!;
   const before={...state,tool:step.action,selection:step.targets};state=session.confirmMineRound(before);
   if(state.result==='WON'){expect(session.undoMineRound(state)).toEqual(before);break;}
  }
  expect(state.result).toBe('WON');
 });
 it('does not reward an already exhausted numbered chord even when its flag count matches', () => {
  const p=puzzle();const safe=mineCells(6,6).filter(c=>!p.mines.includes(c));
  const anchor=safe.find(c=>mineNeighbors(c,6,6).some(n=>p.mines.includes(n)) && safe.some(n=>n!==c&&!mineNeighbors(c,6,6).includes(n)))!;
  const distant=safe.find(c=>c!==anchor&&!mineNeighbors(anchor,6,6).includes(c))!;
  const state={...start(),tool:'CHORD' as const,selection:[anchor],flags:[...p.mines],revealed:safe.filter(c=>c!==distant)};
  const next=session.confirmMineRound(state);
  expect(next.history).toEqual(state.history);expect(next.team).toBe(state.team);expect(next.scores).toEqual(state.scores);expect(next.revealed).toEqual(state.revealed);
 });

});
