import { expect, it } from 'vitest';
import { createGarden, applyGarden, placements, teamScore } from '../games/playground/garden/rules';
import { tableAction } from '../components/playground/tableReview';
it('reports exact score-component changes including seasonal bonuses in both modes', () => {
  for (const level of ['normal','advanced'] as const) {
    let s=createGarden(42,level,'A');
    for(let step=0;step<s.limit;step++) {
      const a=placements(s)[0] || {type:'discard' as const};
      const n=applyGarden(s,a), before=teamScore(s,s.turn), after=teamScore(n,s.turn);
      const delta=after.total-before.total;
      expect(tableAction('garden',s,a,n)).toContain(`本手 ${delta>=0?'+':''}${delta}分`);
      expect(n.message).not.toContain('空洞');
      s=n;
    }
  }
});
