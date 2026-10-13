import{expect,it}from'vitest';import{SEVENS_PUZZLES}from'../data/sevensPuzzles';import{createSevensSession,selectSevensCard,confirmSevensCard,undoSevens,hintSevens,restartSevens}from'../utils/sevensSession';
const simple=SEVENS_PUZZLES[0],sequence=SEVENS_PUZZLES[4],challenge=SEVENS_PUZZLES[8];
const move=(s:ReturnType<typeof createSevensSession>,p:typeof simple,id:string)=>confirmSevensCard(selectSevensCard(s,p,id),p);
it('only changes the real endpoint after confirmation and restores the complete winning turn',()=>{
 let s=createSevensSession(simple,'TEAMS');s=selectSevensCard(s,simple,'s6');expect(s.board.spade?.min).toBe(7);s=confirmSevensCard(s,simple);expect(s.board.spade?.min).toBe(6);expect(s.scores.A).toBe(1);expect(s.team).toBe('B');expect(confirmSevensCard(s,simple)).toBe(s);s=undoSevens(s);expect(s.board.spade?.min).toBe(7);expect(s.scores.A).toBe(0);expect(s.selected).toBe('s6');
});
it('does not execute illegal cards or rotate halfway through a three-move group round',()=>{
 let s=createSevensSession(sequence,'TEAMS');s=move(s,sequence,'s5');expect(s.history).toHaveLength(0);s=move(s,sequence,'s6');expect(s.team).toBe('A');s=move(s,sequence,'h8');s=move(s,sequence,'s5');expect(s.finished).toBe(true);expect(s.scores.A).toBe(1);expect(s.team).toBe('B');
});
it('shows a legal early opening as a planning miss, permits undo, and never calls it an illegal card',()=>{
 let s=createSevensSession(challenge,'TEAMS');s=move(s,challenge,'s6');s=move(s,challenge,'s5');expect(s.earlyOpen).toBe(true);expect(s.recent).toContain('合法');s=move(s,challenge,'h8');s=move(s,challenge,'h9');expect(s.finished).toBe(true);expect(s.success).toBe(false);expect(s.scores.A).toBe(0);expect(s.team).toBe('A');s=undoSevens(undoSevens(undoSevens(s)));expect(s.earlyOpen).toBe(false);for(const id of ['h8','h9','s5'])s=move(s,challenge,id);expect(s.success).toBe(true);expect(s.scores.A).toBe(1);
});
it('solves hints from current endpoints and preserves answer knowledge across all reversible state',()=>{
 let s=createSevensSession(sequence,'TEAMS');s=move(s,sequence,'s6');for(let n=0;n<3;n++)s=hintSevens(s,sequence);expect(s.recent).not.toContain('先出黑桃6');expect(s.revealed).toContain(sequence.id);s=undoSevens(s);s=restartSevens(s,sequence);for(const id of ['s6','h8','s5'])s=move(s,sequence,id);expect(s.scores.A).toBe(0);expect(s.success).toBe(true);
});
