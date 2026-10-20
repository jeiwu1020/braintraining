import playwright from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.QA_OUTPUT || '/workspace/night-market-layout/after';
const captureOnly = process.env.CAPTURE_ONLY === '1';
const phaseFilter = process.env.PHASE_FILTER?.split(',');
const caseFilter = process.env.CASE_FILTER;
const viewFilter = process.env.VIEW_FILTER?.split(',');
fs.mkdirSync(output, { recursive: true });
const compile = text => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const url = text => `data:text/javascript;base64,${Buffer.from(text).toString('base64')}`;
const types = url(compile(fs.readFileSync(new URL('../../games/playground/types.ts', import.meta.url), 'utf8')));
const rules = await import(url(compile(fs.readFileSync(new URL('../../games/playground/night-market/rules.ts', import.meta.url), 'utf8')).replace(/from "\.\.\/types"/g, `from "${types}"`)));
const key = 'braintraining.playground.v1.night-market';
const views = [
  { w:844,h:390 }, { w:896,h:414 }, { w:932,h:430 }, { w:768,h:353 },
  { w:844,h:320 }, { w:896,h:344 }, { w:932,h:360 },
  { w:844,h:390,visible:300 }, { w:896,h:414,visible:324 }, { w:932,h:430,visible:340 },
  { w:844,h:390,visible:320,safe:true },
  { w:390,h:844 }, { w:1440,h:900 },
].filter(v=>!viewFilter||viewFilter.includes(`${v.w}x${v.h}${v.visible?`@${v.visible}`:''}${v.safe?'-safe':''}`));
const browser = await playwright.chromium.launch({ executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'] });
const results = [], flows = [], errors = [], knownResourceErrors = [];
const click = (page, name) => page.getByRole('button',{name,exact:true}).click();
const saved = page => page.evaluate(key => sessionStorage.getItem(key), key);
function fixture(mode, level, phase) {
  const actions = []; let s = rules.createNight(27,level,'A');
  const add = a => { s = rules.applyNight(s,a); actions.push(a); };
  if (phase.startsWith('final')||phase.startsWith('round2')) {
    for(let i=0;i<12;i++)add({type:'pick',slot:i%4}); add({type:'next-round'});
    for(let i=0;i<(phase.startsWith('final')?12:phase==='round2-ai'?2:1);i++)add({type:'pick',slot:i%4});
  } else for(let i=0;i<(phase.startsWith('round')?12:phase==='ai'?3:2);i++)add({type:'pick',slot:i%4});
  // Deliberately retain the old envelope without aiDifficulty.
  return {version:1,game:'night-market',id:`legacy-layout-${mode}-${level}-${phase}`,settings:{mode,level},seed:27,aiSeed:2,starter:'A',actions};
}
async function open(journal) {
  const context = await browser.newContext({viewport:{width:844,height:390}});
  await context.addInitScript(({key,journal}) => {
    const native = window.visualViewport;
    const viewport = new EventTarget();
    Object.defineProperties(viewport,{height:{get:()=>window.__qaVisibleHeight??native.height},scale:{get:()=>1}});
    native.addEventListener('resize',()=>viewport.dispatchEvent(new Event('resize')));
    Object.defineProperty(window,'visualViewport',{value:viewport,configurable:true});
    if(journal && !sessionStorage.getItem(key))sessionStorage.setItem(key,JSON.stringify(journal));
    if(!sessionStorage.getItem('layout-unrelated-sentinel'))sessionStorage.setItem('layout-unrelated-sentinel','preserve-me');
  },{key,journal});
  const page = await context.newPage();
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{
    if(m.type()!=='error')return;
    const error={text:m.text(),url:m.location().url};
    (error.url.startsWith('https://fonts.googleapis.com/')||error.url.endsWith('/favicon.ico')?knownResourceErrors:errors).push(error);
  });
  await page.goto(base);
  await page.getByRole('button',{name:/桌遊新樂園/}).click();
  await page.locator('[data-game-card="night-market"] button').first().click();
  return {context,page};
}
async function measure(page, label, phase) {
  for(const view of views) {
    await page.setViewportSize({width:view.w,height:view.h});
    await page.evaluate(visible=>{window.__qaVisibleHeight=visible;visualViewport.dispatchEvent(new Event('resize'));},view.visible??null);
    await page.locator('.pg-viewport').evaluate((el,safe)=>{for(const [side,value] of Object.entries({left:safe?44:0,right:safe?44:0,bottom:safe?16:0}))el.style.setProperty(`--experience-safe-${side}`,`${value}px`);},!!view.safe);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.locator('.pg-night main,.pg-control-panel,.pg-round-summary').evaluateAll(nodes=>nodes.forEach(el=>{el.scrollTop=0;el.scrollLeft=0;}));
    const m = await page.evaluate(()=>{
      const rect=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {tag:el.tagName,name:el.getAttribute('aria-label')||el.className,text:el.innerText,x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,fontSize:s.fontSize,display:s.display,overflowY:s.overflowY};};
      const selectors=['.game-shell__header','.pg-night main','.pg-play-layout','.pg-night-table','.pg-receipts','.pg-orders','.pg-deck-foods','.pg-market','.pg-round-summary','.pg-last-pick','.pg-control-panel','.pg-scoring-ribbon'];
      const critical=[...document.querySelectorAll('.pg-receipt,.pg-receipt .pg-counts,.pg-previous,.pg-orders,.pg-deck-foods,.pg-scoring-ribbon,.pg-control-panel > h2,.pg-preview,.pg-control-panel > button,.pg-last-action,.pg-deck-count,.pg-score-details,.pg-last-pick,.pg-last-pick-copy,.pg-night .game-shell__header button,[data-market-slot]')].map(rect);
      return {width:innerWidth,height:innerHeight,visibleHeight:visualViewport.height,docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight,boxes:Object.fromEntries(selectors.map(s=>[s,document.querySelector(s)?rect(document.querySelector(s)):null])),critical,cards:[...document.querySelectorAll('[data-market-slot]')].map(rect)};
    });
    const record={label,phase,view,...m}; results.push(record);
    const compact=view.w>view.h&&view.h<=600&&view.w<=1100;
    const failures=[];
    if(m.docWidth>view.w||m.docHeight>view.h)failures.push('document overflow');
    if(compact) {
      for(const box of m.critical) {
        if(box.display==='none'||!box.w||!box.h) { failures.push(`hidden ${box.name}`); continue; }
        if(box.x<-.5||box.y<-.5||box.right>view.w+.5||box.bottom>m.visibleHeight+.5)failures.push(`clipped ${box.name} bottom=${box.bottom}`);
        if(box.scrollWidth>box.clientWidth+1)failures.push(`text width overflow ${box.name}`);
      }
      for(const card of m.cards)if(card.w<44||card.h<44)failures.push('dish target under 44px');
      for(const button of m.critical.filter(b=>b.tag==='BUTTON'))if(button.w<44||button.h<44)failures.push(`button target under 44px: ${button.text}`);
      const main=m.boxes['.pg-night main'], panel=m.boxes['.pg-control-panel'];
      if(main.scrollHeight>main.clientHeight+1)failures.push('main requires vertical scroll');
      if(panel.scrollHeight>panel.clientHeight+1)failures.push('primary controls require scroll');
      for(const name of ['.pg-round-summary','.pg-last-pick']) {
        const box=m.boxes[name];
        if(box&&box.scrollHeight>box.clientHeight+1)failures.push(`settlement text requires local scroll: ${name}`);
      }
      for(const child of m.critical.filter(b=>['pg-score-details','pg-last-pick-copy'].includes(b.name))) {
        const parent=m.boxes[child.name==='pg-score-details'?'.pg-round-summary':'.pg-last-pick'];
        if(child.bottom>parent.bottom+.5)failures.push(`settlement text clipped: ${child.name}`);
      }
      if(label.includes('advanced')&&!m.boxes['.pg-orders']?.h)failures.push('current order goals hidden');
    }
    record.failures=failures;
    if((!view.visible&&([844,896,932].includes(view.w))||view.w===390||view.w===1440||view.safe)&&label==='teams-advanced')await page.screenshot({path:`${output}/${label}-${phase}-${view.w}x${view.h}${view.safe?'-safe':''}.png`});
    if(!captureOnly)assert.deepEqual(failures,[],`${label}/${phase}/${JSON.stringify(view)}`);
  }
}
try {
  for(const mode of ['teams','solo'])for(const level of ['normal','advanced']) {
    const label=`${mode}-${level}`;
    if(caseFilter&&caseFilter!==label)continue;
    // Exercise real setup; use a fresh browser context, never clear existing storage.
    let context,page;
    if(!phaseFilter) {
    ({context,page}=await open(null));
    await click(page,mode==='solo'?'單人':'兩隊'); await click(page,level==='advanced'?'進階':'一般');
    if(mode==='solo')for(const name of ['輕鬆','標準','挑戰'])assert.equal(await page.getByRole('button',{name,exact:true}).count(),1);
    await click(page,'開始本局'); await click(page,'略過並開始');
    await page.locator('.pg-night').waitFor(); await measure(page,label,'new-unselected');
    const fresh=JSON.parse(await saved(page)); assert.equal(fresh.settings.mode,mode); assert.equal(fresh.settings.level,level);
    flows.push({label,newGame:true,aiSettingsUnchanged:true}); await context.close();
    }
    for(const phase of ['unselected','selected','round2-unselected','round2-selected',...(mode==='solo'?['ai','round2-ai']:[]),'round-last','round-summary','final-last','final-summary'].filter(p=>!phaseFilter||phaseFilter.includes(p))) {
      const journal=fixture(mode,level,phase); ({context,page}=await open(journal)); await page.locator('.pg-night').waitFor();
      if(phase==='selected'||phase==='round2-selected')await page.locator('[data-market-slot="0"]').click();
      if(phase==='ai'||phase==='round2-ai')await page.getByText('電腦準備好了',{exact:true}).waitFor();
      if(phase.endsWith('summary'))await click(page,'查看結算');
      const before=await saved(page); assert.deepEqual(JSON.parse(before),journal);
      await measure(page,label,phase);
      assert.equal(await saved(page),before,'viewport rotation must not rewrite legacy save');
      if(phase==='selected'||phase==='round2-selected') {
        assert.equal(await page.locator('[data-market-slot="0"]').getAttribute('aria-pressed'),'true'); await click(page,'取消');
        assert.equal(await saved(page),before,'cancelling selection must not commit');
      }
      if(phase==='unselected') {
        await page.setViewportSize({width:844,height:390});
        await page.locator('[data-market-slot="0"]').focus(); await page.keyboard.press('ArrowDown');
        assert.equal(await page.locator('[data-market-slot="2"]').evaluate(el=>document.activeElement===el),true);
        await click(page,'規則'); await page.locator('.pg-modal-content').evaluate(el=>{el.scrollTop=el.scrollHeight;}); await page.keyboard.press('Escape');
        await click(page,'選項'); await click(page,'關閉');
        assert.equal(await saved(page),before);
        await click(page,'返回桌遊新樂園'); await page.locator('[data-game-card="night-market"] button').first().click();
        await page.locator('.pg-night').waitFor(); assert.equal(await saved(page),before);
        await page.reload(); await page.getByRole('button',{name:/桌遊新樂園/}).click(); await page.locator('[data-game-card="night-market"] button').first().click();
        await page.locator('.pg-night').waitFor(); assert.equal(await saved(page),before);
      }
      if(phase==='ai'||phase==='round2-ai') { assert.equal(JSON.parse(await saved(page)).actions.length,journal.actions.length); await click(page,'看電腦行動'); assert.equal(JSON.parse(await saved(page)).actions.length,journal.actions.length+1); }
      assert.equal(await page.evaluate(()=>sessionStorage.getItem('layout-unrelated-sentinel')),'preserve-me');
      flows.push({label,phase,legacySavePreserved:true,unrelatedStoragePreserved:true}); await context.close();
    }
  }
} finally {
  fs.writeFileSync(`${output}/results.json`,JSON.stringify({kind:'Desktop Chromium emulation; not physical iPhone. visualViewport shim explicitly simulates toolbar-reduced height.',base,captureOnly,results,flows,errors,knownResourceErrors},null,2));
  await browser.close();
}
assert.equal(errors.length,0,JSON.stringify(errors));
console.log(`${captureOnly?'BASELINE':'PASS'}: ${results.length} measurements, ${flows.length} flows, ${results.filter(r=>r.failures.length).length} failing layouts; ${errors.length} unexpected browser errors.`);
