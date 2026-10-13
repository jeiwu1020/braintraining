import{expect,it}from'vitest';import{MAHJONG_PUZZLES}from'../data/mahjongPuzzles';import{mahjongCompletions,mahjongDiscardOptions,meldTileKey}from'../utils/mahjongRules';
it('provides four authored tasks per tier with complete legal answer choices',()=>{
 expect(MAHJONG_PUZZLES).toHaveLength(12);
 for(const tier of ['BEGINNER','STANDARD','CHALLENGE'])expect(MAHJONG_PUZZLES.filter(p=>p.tier===tier)).toHaveLength(4);
 for(const p of MAHJONG_PUZZLES){
  const correct=p.tier==='CHALLENGE'?mahjongDiscardOptions(p.hand).flatMap(option=>option.completions):mahjongCompletions(p.hand,p.group);
  expect(correct.length,p.id).toBeGreaterThan(0);const keys=p.options.map(meldTileKey);expect(new Set(keys).size).toBe(keys.length);for(const tile of correct)expect(keys,p.id).toContain(meldTileKey(tile));
 }
});
it('includes multi-ended waits and equally best discard plans rather than one-answer-only marking',()=>{
 expect(MAHJONG_PUZZLES.filter(p=>p.tier==='STANDARD').filter(p=>mahjongCompletions(p.hand,p.group).length===2).length).toBeGreaterThanOrEqual(2);
 expect(MAHJONG_PUZZLES.filter(p=>p.tier==='CHALLENGE').some(p=>mahjongDiscardOptions(p.hand).filter(c=>c.best).length===2)).toBe(true);
});
