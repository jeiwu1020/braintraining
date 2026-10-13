import{expect,it}from'vitest';import{RUMMI_PUZZLES}from'../data/rummikubPuzzles';import{createRummiSession,selectRummiHand,selectRummiPlan,confirmRummi,hintRummi,undoRummi,restartRummi}from'../utils/rummikubSession';
const beginner=RUMMI_PUZZLES[0],standard=RUMMI_PUZZLES[4],challenge=RUMMI_PUZZLES[8];
it('previews without points, confirms once and restores the whole finished turn',()=>{
 let s=createRummiSession(beginner,'TEAMS');s=selectRummiHand(s,beginner,'r7');expect(s.scores.A).toBe(0);expect(s.team).toBe('A');s=confirmRummi(s,beginner);expect(s.finished).toBe(true);expect(s.scores.A).toBe(1);expect(s.team).toBe('B');expect(confirmRummi(s,beginner)).toBe(s);s=undoRummi(s);expect(s.finished).toBe(false);expect(s.hand).toEqual(['r7']);expect(s.scores.A).toBe(0);expect(s.team).toBe('A');
});
it('rejects whole-table residual and leaves one group discussing the same task',()=>{
 let s=createRummiSession(standard,'TEAMS');s=selectRummiPlan(s,standard,'plan-2');s=confirmRummi(s,standard);expect(s.finished).toBe(false);expect(s.history).toHaveLength(0);expect(s.recent).toContain('第 1 組');expect(s.team).toBe('A');
});
it('requires the selected hand to match the whole plan and accepts both equally good solutions',()=>{
 for(const [ids,plan] of [[['r7','r8'],'plan-1'],[['b6','k6'],'plan-2']] as const){let s=createRummiSession(challenge,'TEAMS');for(const id of ids)s=selectRummiHand(s,challenge,id);s=selectRummiPlan(s,challenge,plan);expect(confirmRummi(s,challenge).scores.A).toBe(1);}
 let s=selectRummiPlan(createRummiSession(challenge,'TEAMS'),challenge,'plan-1');s=selectRummiHand(s,challenge,'r7');expect(confirmRummi(s,challenge).finished).toBe(false);
});
it('distinguishes legal but suboptimal whole-table plans from illegal ones',()=>{
 const p=RUMMI_PUZZLES[10];let s=createRummiSession(p);s=selectRummiHand(s,p,'b3');s=selectRummiPlan(s,p,'plan-3');s=confirmRummi(s,p);expect(s.finished).toBe(false);expect(s.recent).toContain('合法');expect(s.recent).toContain('更多');
});
it('keeps exact-answer knowledge through undo, reset, mode, and question revisit without granting points',()=>{
 let s=createRummiSession(challenge,'TEAMS');s=selectRummiHand(s,challenge,'r7');s=selectRummiHand(s,challenge,'r8');s=selectRummiPlan(s,challenge,'plan-1');s=confirmRummi(s,challenge);s=undoRummi(s);for(let i=0;i<3;i++)s=hintRummi(s,challenge);expect(s.revealed).toContain(challenge.id);s=confirmRummi(s,challenge);expect(s.scores.A).toBe(0);s=undoRummi(s);s=restartRummi(s,beginner,'COOP');s=restartRummi(s,challenge,'TEAMS');expect(s.revealed).toContain(challenge.id);
});
it('does not award the same puzzle twice while retaining score across question changes',()=>{
 let s=createRummiSession(beginner,'TEAMS');s=confirmRummi(selectRummiHand(s,beginner,'r7'),beginner);s=restartRummi(s,beginner);s=confirmRummi(selectRummiHand(s,beginner,'r3'),beginner);expect(s.scores).toEqual({A:1,B:0});expect(restartRummi(s,standard).scores).toEqual({A:1,B:0});
});
