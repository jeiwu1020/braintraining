import{expect,it}from'vitest';import{MAHJONG_PUZZLES}from'../data/mahjongPuzzles';import{mahjongCompletions,mahjongDiscardOptions,meldTileKey}from'../utils/mahjongRules';import{createMahjongSession,selectMahjongTile,selectMahjongDiscard,confirmMahjong,undoMahjong,hintMahjong,restartMahjong}from'../utils/mahjongSession';
const p=MAHJONG_PUZZLES[0];
const choose=(s:ReturnType<typeof createMahjongSession>,keys:string[])=>keys.reduce((state,key)=>selectMahjongTile(state,key),s);
it('previews a tile and confirms once, restoring the completed score and choice on undo',()=>{
 const start=createMahjongSession(p,'TEAMS');const draft=selectMahjongTile(start,'wan:3');expect(draft.finished).toBe(false);expect(draft.scores).toEqual({A:0,B:0});
 const done=confirmMahjong(draft,p);expect(done.finished).toBe(true);expect(done.team).toBe('B');expect(done.scores).toEqual({A:1,B:0});expect(confirmMahjong(done,p)).toBe(done);
 const undo=undoMahjong(done);expect(undo.selected).toEqual(['wan:3']);expect(undo.scores).toEqual({A:0,B:0});expect(undo.team).toBe('A');
});
it('requires both ends at standard tier, not just a stored preferred answer',()=>{
 const task=MAHJONG_PUZZLES[4];let s=selectMahjongTile(createMahjongSession(task,'TEAMS'),'wan:2');s=confirmMahjong(s,task);expect(s.finished).toBe(false);expect(s.scores).toEqual({A:0,B:0});expect(s.team).toBe('A');
 s=selectMahjongTile(s,'wan:5');expect(confirmMahjong(s,task).finished).toBe(true);
 s=choose(createMahjongSession(task),['wan:2','wan:5','wan:6']);expect(confirmMahjong(s,task).finished).toBe(false);
});
it('keeps one group through discard then all waits and undoes each whole stage',()=>{
 const task=MAHJONG_PUZZLES[8];let s=selectMahjongDiscard(createMahjongSession(task,'TEAMS'),2);s=confirmMahjong(s,task);expect(s.stage).toBe('COMPLETIONS');expect(s.team).toBe('A');expect(s.scores).toEqual({A:0,B:0});
 s=choose(s,['wan:2','wan:5']);const done=confirmMahjong(s,task);expect(done.finished).toBe(true);expect(done.team).toBe('B');
 const undo=undoMahjong(done);expect(undo.stage).toBe('COMPLETIONS');expect(undo.selected).toEqual(['wan:2','wan:5']);expect(undo.scores).toEqual({A:0,B:0});expect(undoMahjong(undo).stage).toBe('DISCARD');
});
it('accepts every equally best discard and refuses an otherwise legal but narrower wait',()=>{
 for(const task of MAHJONG_PUZZLES.filter(p=>p.tier==='CHALLENGE'))for(const option of mahjongDiscardOptions(task.hand).filter(c=>c.completions.length)){
  let s=confirmMahjong(selectMahjongDiscard(createMahjongSession(task),option.index),task);s=choose(s,option.completions.map(meldTileKey));expect(confirmMahjong(s,task).finished).toBe(option.best);
 }
});
it('retains exact-answer knowledge across undo, reset and revisiting, without repeat points',()=>{
 let s=selectMahjongTile(createMahjongSession(p,'TEAMS'),'wan:3');s=confirmMahjong(s,p);s=undoMahjong(s);for(let n=0;n<3;n++)s=hintMahjong(s,p);
 s=restartMahjong(restartMahjong(s,MAHJONG_PUZZLES[1]),p);s=confirmMahjong(selectMahjongTile(s,'wan:3'),p);expect(s.scores).toEqual({A:0,B:0});expect(s.revealed).toContain(p.id);
 let clean=confirmMahjong(selectMahjongTile(createMahjongSession(p,'TEAMS'),'wan:3'),p);clean=restartMahjong(clean,p);clean=confirmMahjong(selectMahjongTile(clean,'wan:3'),p);expect(clean.scores).toEqual({A:1,B:0});
});
it('keeps impossible option keys from completing a question',()=>{
 const s=selectMahjongTile(createMahjongSession(p),'wan:99');expect(confirmMahjong(s,p).finished).toBe(false);
});
it('a hint never silently rewrites an already confirmed discard',()=>{
 const task=MAHJONG_PUZZLES[8];let s=confirmMahjong(selectMahjongDiscard(createMahjongSession(task),0),task);
 for(let n=0;n<3;n++)s=hintMahjong(s,task);expect(s.discard).toBe(0);expect(s.stage).toBe('COMPLETIONS');expect(s.recent).toContain('重選捨牌');
});
