import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
it('places a separate lazy lecture entry after the existing playground',()=>{
 expect(app).toContain("React.lazy(() => import('./components/lectures/Lectures'))");
 expect(app.indexOf('>職能講座</h3>')).toBeGreaterThan(app.indexOf('>桌遊新樂園</h3>'));
 expect(app).toContain('onOpenLectures');
 expect(app.match(/<Lectures[^>]*>/)?.[0]).not.toContain('difficulty');
});
it('does not change the existing game catalog or playground content',()=>{
 const catalog=readFileSync(new URL('../data/gameCatalog.ts',import.meta.url),'utf8');
 expect(catalog).not.toContain('lecture');
 const market=readFileSync(new URL('../components/playground/NightMarket.tsx',import.meta.url),'utf8');
 expect(market).toContain('pg-order-condition');
});
