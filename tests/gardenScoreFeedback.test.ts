import { expect, it } from 'vitest';
import { createGarden, applyGarden, placements, scoreGarden } from '../games/playground/garden/rules';
import { tableAction } from '../components/playground/tableReview';
it('reports exact score-component changes for every legal tile in both modes', () => {
  for (const level of ['normal','advanced'] as const) {
    let s=createGarden(42,level,'A');
    for(let step=0;step<s.limit;step++) {
      const a=placements(s)[0] || {type:'discard' as const};
      const n=applyGarden(s,a), before=scoreGarden(s.boards[s.turn],s.size), after=scoreGarden(n.boards[s.turn],s.size);
      const delta=after.total-before.total;
      expect(tableAction('garden',s,a,n)).toContain(`本手 ${delta>=0?'+':''}${delta}分`);
      expect(n.message).toContain('花圃'); expect(n.message).toContain('步道'); expect(n.message).toContain('空洞');
      s=n;
    }
  }
});
