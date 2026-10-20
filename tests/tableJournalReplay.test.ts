import { expect, it } from 'vitest';
import { auctionEngine, createAuction, applyAuction, AuctionAction } from '../games/playground/auction/rules';
import { restore, replay } from '../games/playground/session';
it('retains and restores a full high-bid advanced auction through every sale', () => {
 let s=createAuction(7,'advanced','A'); const actions:AuctionAction[]=[];
 while(s.phase!=='finished') {
  const a:AuctionAction=s.phase==='round_summary'?{type:'next'}:s.price+1<=s.budgets[s.turn]?{type:'bid'}:{type:'pass'};
  actions.push(a);s=applyAuction(s,a); expect(actions.length).toBeLessThan(129);
 }
 expect(actions.length).toBeGreaterThan(40);
 const journal={version:1,game:'auction',id:'long-auction',seed:7,aiSeed:7,starter:'A',settings:{mode:'teams',level:'advanced'},actions};
 const saved=restore(JSON.stringify(journal),'auction',auctionEngine);
 expect(replay(saved,auctionEngine).at(-1)).toEqual(s);
});
