import {expect,it} from 'vitest';
import {NIM_PUZZLES} from '../data/nimPuzzles';
import {createNimSession,prepareNim,commitNim,playNimOpponent,undoNim,hintNim,restartNim} from '../utils/nimSession';
const p=NIM_PUZZLES[0];
it('previews a complete command and handles normal and misere winners correctly',()=>{
 const start=createNimSession(p,'TEAMS');const draft=prepareNim(start,1,1);expect(draft.piles).toEqual([0,1]);
 const done=commitNim(draft,p,draft.revision);expect(done.result).toBe('A');expect(done.scores).toEqual({A:1,B:0});
 const reverse=commitNim(prepareNim({...start,rule:'MISERE'},1,1),p,0);expect(reverse.result).toBe('B');expect(reverse.scores).toEqual({A:0,B:1});
 expect(commitNim(done,p,draft.revision)).toBe(done);
});
it('fully restores the winning turn and its draft, score and next group',()=>{
 const start=prepareNim(createNimSession(p,'TEAMS'),1,1);const undo=undoNim(commitNim(start,p,0));
 expect(undo.piles).toEqual(start.piles);expect(undo.scores).toEqual(start.scores);expect(undo.team).toBe('A');expect(undo.selection).toEqual(start.selection);expect(undo.result).toBeNull();
});
it('executes the teaching opponent only on explicit request and undoes that reply separately',()=>{
 const task=NIM_PUZZLES[5];let s=prepareNim(createNimSession(task),2,1);s=commitNim(s,task,0);expect(s.opponentPending).toBe(true);
 const before=s.piles;expect(commitNim(prepareNim(s,0,1),task,s.revision)).toBe(s);
 const reply=playNimOpponent(s,task,s.revision);expect(reply.piles).not.toEqual(before);expect(reply.opponentPending).toBe(false);
 const undo=undoNim(reply);expect(undo.piles).toEqual(before);expect(undo.opponentPending).toBe(true);
 expect(playNimOpponent(reply,task,s.revision)).toBe(reply);
});
it('rejects impossible quantities without switching group or changing history',()=>{
 const s=prepareNim(createNimSession(p,'TEAMS'),1,2);const result=commitNim(s,p,0);expect(result.piles).toEqual(s.piles);expect(result.history).toHaveLength(0);expect(result.team).toBe('A');
});
it('retains revealed knowledge across undo, replay, rule comparison and mode changes',()=>{
 let s=createNimSession(p,'TEAMS');for(let n=0;n<3;n++)s=hintNim(s,p);expect(s.revealed).toContain(`${p.id}:NORMAL`);
 s=commitNim(s,p,s.revision);expect(s.scores).toEqual({A:0,B:0});s=undoNim(s);s=restartNim(s,NIM_PUZZLES[1]);s=restartNim(s,p,'MISERE');s=restartNim(s,p,'NORMAL','COOP');s=restartNim(s,p,'NORMAL','TEAMS');
 s=commitNim(prepareNim(s,1,1),p,s.revision);expect(s.scores).toEqual({A:0,B:0});
});
it('does not farm completion points by retrying the same puzzle and rule',()=>{
 let s=commitNim(prepareNim(createNimSession(p,'TEAMS'),1,1),p,0);s=restartNim(s,p);s=commitNim(prepareNim(s,1,1),p,s.revision);expect(s.scores).toEqual({A:1,B:0});
});
