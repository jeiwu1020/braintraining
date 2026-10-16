import playwright from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs';
const game=process.argv[2]||'garden',out='/workspace/braintraining/docs/qa';
const browser=await playwright.chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:852,height:393}});const errors=[],resourceErrors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>resourceErrors.push({url:r.url(),error:r.failure()?.errorText}));
const click=async name=>page.getByRole('button',{name,exact:true}).click();const confirm=async()=>click('確認行動');
const enter=async()=>{await page.getByRole('button',{name:/桌遊新樂園/}).click();await page.locator(`[data-game-card="${game}"] button`).first().click();await page.locator('.tg-shell').waitFor();};
await page.goto(process.env.BASE_URL || 'http://localhost:3000');await enter();await click('開始本局');await click('試做這一步');await click('開始正式局');await page.locator('.tg-session').waitFor();
const measurements=[];
for(const [width,height] of [[568,320],[667,375],[852,393],[1440,900]]){await page.setViewportSize({width,height});await page.screenshot({path:`${out}/${game}-${width}.png`});measurements.push(await page.evaluate(()=>({width:innerWidth,height:innerHeight,docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight,buttons:[...document.querySelectorAll('.tg-shell button')].filter(x=>x.getBoundingClientRect().width>0).map(x=>({label:x.ariaLabel||x.textContent,h:x.getBoundingClientRect().height,w:x.getBoundingClientRect().width}))})));}
await page.setViewportSize({width:667,height:375});
let turns=0;
while(!await page.getByText('本局結果',{exact:true}).count()){
 if(turns>100)throw Error('did not terminate');
 if(game==='garden'){
  let cell=page.locator('[data-valid-anchor="true"]').first();if(!await cell.count()){let tile=page.locator('[data-tile-available="true"]').first();if(await tile.count()){await tile.click();cell=page.locator('[data-valid-anchor="true"]').first();for(let r=0;r<4&&!await cell.count();r++)await click('旋轉90°');}}
  if(await cell.count()){await cell.click();await click('預覽放置');}else await click('本手略過');
 }else if(game==='lantern'){
  if(await page.getByRole('button',{name:'繼續布局',exact:true}).count())await click('繼續布局');
  else if(await page.getByRole('button',{name:'查看總結果',exact:true}).count())await click('查看總結果');
  else {await page.getByLabel('本次花燈盞數',{exact:true}).selectOption('2');const place=page.getByRole('button',{name:/^放置到/}).filter({hasNot:page.locator('[disabled]')});const available=page.locator('.tg-action-grid button:not(:disabled)');if(await available.count())await available.first().click();else {await click('移動');const opts=await page.getByLabel('出發街區',{exact:true}).locator('option').all();let from=0;for(let i=0;i<opts.length;i++)if((await opts[i].textContent()).includes('本隊8盞')||(await opts[i].textContent()).includes('本隊6盞'))from=i;await page.getByLabel('出發街區',{exact:true}).selectOption(String(from));const move=page.locator('.tg-action-grid button:not(:disabled)');if(await move.count())await move.last().click();else await click('等待布局');}}
 }else if(game==='workshop'){
  if(await page.getByRole('button',{name:'下一工作日',exact:true}).count())await click('下一工作日');
  else if(await page.getByRole('button',{name:'查看總結果',exact:true}).count())await click('查看總結果');
  else {const available=page.locator('.tg-work-actions button:not(:disabled)');if(await available.count())await available.nth(turns%await available.count()).click();else await click('安排休息');}
 }else if(game==='auction'){
  if(await page.getByRole('button',{name:'下一件展品',exact:true}).count())await click('下一件展品');
  else if(await page.getByRole('button',{name:'查看展覽總分',exact:true}).count())await click('查看展覽總分');
  else {const bid=page.getByRole('button',{name:'加一枚籌碼',exact:true});if(!await bid.isDisabled()&&turns%4!==3)await bid.click();else await click('退出本件');}
 }else throw Error('unknown game');
 if(turns===0){await click('取消選擇');continueAfterCancel: {
  if(game==='garden')await click('預覽放置');else if(game==='lantern')await page.locator('.tg-action-grid button:not(:disabled)').first().click();else if(game==='workshop')await page.locator('.tg-work-actions button:not(:disabled)').first().click();else if(game==='auction')await click('加一枚籌碼');
 }}
 await confirm();turns++;
 if(turns===4){const before=await page.evaluate(g=>sessionStorage.getItem(`braintraining.playground.v1.${g}`),game);await page.reload();await enter();const after=await page.evaluate(g=>sessionStorage.getItem(`braintraining.playground.v1.${g}`),game);if(before!==after)throw Error('restore mismatch');}
 await page.locator('.tg-session').waitFor();
}
await page.screenshot({path:`${out}/${game}-result.png`});await click('再玩一局');await click('保留本局');await page.getByText('本局結果',{exact:true}).waitFor();await click('再玩一局');await click('確定');const journal=await page.evaluate(g=>JSON.parse(sessionStorage.getItem(`braintraining.playground.v1.${g}`)),game);if(journal.actions.length)throw Error('restart failed');
fs.writeFileSync(`${out}/${game}-browser.json`,JSON.stringify({kind:'Desktop Chromium emulated viewports, not physical devices',baseUrl:process.env.BASE_URL||'http://localhost:3000',measurements,errors,resourceErrors,turns,completeGame:true,cancel:true,reload:true,restart:true},null,2));await browser.close();if(errors.length)throw Error(errors.join('\n'));if(measurements.some(m=>m.docWidth>m.width||m.docHeight>m.height||m.buttons.some(b=>b.h<44||b.w<44)))throw Error('viewport or touch bounds failed');console.log(`${game}: complete game, interruption, cancel, restart and four viewport checks passed`);
