import playwright from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs';
const baseUrl=process.env.BASE_URL||'http://127.0.0.1:3000';
const browser=await playwright.chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900}}), errors=[], results=[], matrix=[];
page.on('pageerror',e=>errors.push(String(e)));
const click=async name=>page.getByRole('button',{name,exact:true}).click();
const enter=async game=>{await page.getByRole('button',{name:/桌遊新樂園/}).click();await page.locator(`[data-game-card="${game}"] button`).first().click();await page.locator('.pg-shell').waitFor();};
const saved=async game=>page.evaluate(g=>JSON.parse(sessionStorage.getItem(`braintraining.playground.v1.${g}`)),game);
async function measure(game,phase,width,height){
 await page.setViewportSize({width,height});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const measurement=await page.evaluate(()=>({width:innerWidth,height:innerHeight,docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight,buttons:[...document.querySelectorAll('.pg-shell button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>({label:b.ariaLabel||b.textContent,w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})),scrollAreas:[...document.querySelectorAll('.pg-shell main,.pg-setup-controls,.pg-control-panel')].map(b=>({class:b.className,height:b.clientHeight,scroll:b.scrollHeight,overflow:getComputedStyle(b).overflowY}))}));
 if(measurement.docWidth>width||measurement.docHeight>height)throw Error(`${game} ${phase} ${width}: document overflow`);
 if(measurement.buttons.some(b=>b.w<43.9||b.h<43.9))throw Error(`${game} ${phase} ${width}: undersized button ${JSON.stringify(measurement.buttons.filter(b=>b.w<43.9||b.h<43.9))}`);
 await page.screenshot({path:`/tmp/braintraining-ai-qa/${game}-${phase}-${width}.png`});
 return {...measurement,phase};
}
try {
 for(const game of ['night-market','wall-race']){
  await page.goto(baseUrl);await page.evaluate(()=>sessionStorage.clear());await page.reload();await enter(game);
  if(await page.getByLabel('電腦難度',{exact:true}).count())throw Error('team AI controls visible');
  await click('單人');await click('進階');await click('輕鬆');
  const measurements=[];
  for(const [w,h] of [[1440,900],[390,844],[640,360],[852,393]]) measurements.push(await measure(game,'setup',w,h));
  await click('兩隊');if(await page.getByLabel('電腦難度',{exact:true}).count())throw Error('team AI controls visible after toggle');
  await click('單人');if(await page.getByRole('button',{name:'輕鬆',exact:true}).getAttribute('aria-pressed')!=='true')throw Error('choice lost');
  await click('玩法');await click('關閉');await click('玩法');await page.keyboard.press('Escape');
  await click('開始本局');await click('關閉');if(await saved(game))throw Error('tutorial cancellation started game');
  await click('開始本局');await click('略過並開始');
  const original=await saved(game);if(original.settings.aiDifficulty!=='easy'||original.settings.level!=='advanced')throw Error('wrong settings');
  for(const [w,h] of [[1440,900],[390,844],[640,360],[852,393]])measurements.push(await measure(game,'playing',w,h));
  if(game==='night-market')await page.locator('[data-market-slot="0"]').click();else await page.getByRole('button',{name:'C4，可走',exact:true}).click();
  await click('取消');if((await saved(game)).actions.length)throw Error('cancel committed');
  if(game==='night-market')await page.locator('[data-market-slot="0"]').click();else await page.getByRole('button',{name:'C4，可走',exact:true}).click();
  await click(game==='night-market'?'確認拿取':'確認走棋');
  await page.getByText('電腦準備好了',{exact:true}).waitFor();
  if((await saved(game)).actions.length!==1)throw Error('AI auto committed');
  await click('看電腦行動');if((await saved(game)).actions.length!==2)throw Error('AI reveal failed');
  await click('選項');await click('重新設定…');await click('保留本局');
  if((await saved(game)).actions.length!==2)throw Error('menu cancellation cleared');
  await click('選項');await click('關閉');await click('選項');await page.keyboard.press('Escape');
  await click('撤回');if((await saved(game)).actions.length)throw Error('pair undo failed');
  await page.getByRole('button',{name:'返回桌遊新樂園',exact:true}).click();await page.locator(`[data-game-card="${game}"] button`).first().click();
  if((await saved(game)).id!==original.id)throw Error('continue failed');
  await page.reload();await enter(game);if((await saved(game)).id!==original.id)throw Error('refresh failed');
  await click('選項');await click('重新設定…');await click('確定');
  if(await page.getByRole('button',{name:'輕鬆',exact:true}).getAttribute('aria-pressed')!=='true')throw Error('reset lost difficulty');
  await click('兩隊');await click('開始本局');
  if((await saved(game)).settings.mode!=='teams')throw Error('teams mode wrong');
  if(await page.getByRole('button',{name:'看電腦行動',exact:true}).count())throw Error('teams AI active');
  results.push({game,measurements,soloWorker:true,explicitReveal:true,cancel:true,menu:true,undo:true,backContinue:true,refresh:true,reset:true,teamsUnaffected:true});
 }
 for(const game of ['night-market','wall-race'])for(const level of ['normal','advanced'])for(const [difficulty,label] of [['easy','輕鬆'],['standard','標準'],['challenge','挑戰']]){
  await page.goto(baseUrl);await page.evaluate(()=>sessionStorage.clear());await page.reload();await enter(game);
  await click('單人');await click(level==='normal'?'一般':'進階');await click(label);
  await click('開始本局');await click('略過並開始');
  if(game==='night-market')await page.locator('[data-market-slot="0"]').click();else await page.getByRole('button',{name:'C4，可走',exact:true}).click();
  await click(game==='night-market'?'確認拿取':'確認走棋');await page.getByText('電腦準備好了',{exact:true}).waitFor();
  if(await page.getByText('使用合法備用選擇',{exact:true}).count())throw Error(`${game} ${level}/${difficulty} real worker fell back`);
  if((await saved(game)).actions.length!==1)throw Error('matrix AI auto committed');
  await click('看電腦行動');const journal=await saved(game);
  if(journal.actions.length!==2||journal.settings.level!==level||journal.settings.aiDifficulty!==difficulty)throw Error('matrix journal mismatch');
  matrix.push({game,level,difficulty,realWorker:true,explicitReveal:true,actions:journal.actions});
 }

} finally {
 fs.writeFileSync('docs/qa/ai-difficulty-browser.json',JSON.stringify({kind:'Desktop Chromium emulated viewports; physical touch/iOS not tested',baseUrl,results,matrix,errors},null,2));
 await browser.close();
}
if(errors.length)throw Error(errors.join('\n'));
console.log('Both games: all 12 real-worker rule/difficulty combinations, four viewports, cancellation, menus, undo, continue, refresh and teams passed.');
