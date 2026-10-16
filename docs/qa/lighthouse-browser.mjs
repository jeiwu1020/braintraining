import playwright from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs';
const {chromium}=playwright;
const out='/workspace/braintraining/docs/qa';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:852,height:393}});const errors=[],resourceErrors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>resourceErrors.push({url:r.url(),error:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)resourceErrors.push({url:r.url(),status:r.status()});});
await page.goto(process.env.BASE_URL || 'http://localhost:3000');await page.getByRole('button',{name:/桌遊新樂園/}).click();await page.locator('[data-game-card="lighthouse"] button').first().click();await page.getByRole('button',{name:'開始本局',exact:true}).click();await page.getByRole('button',{name:'試做這一步',exact:true}).click();await page.getByRole('button',{name:'開始正式局',exact:true}).click();
process.on('uncaughtException',async e=>{console.error(e);console.error(await page.locator('body').innerText());console.error(await page.evaluate(()=>sessionStorage.getItem('braintraining.playground.v1.lighthouse')));await page.screenshot({path:`${out}/lighthouse-debug.png`});await browser.close();process.exit(1);});
const measurements=[];
for(const [width,height] of [[568,320],[667,375],[852,393],[1440,900]]){
 await page.setViewportSize({width,height});await page.screenshot({path:`${out}/lighthouse-${width}.png`});
 measurements.push(await page.evaluate(()=>({width:innerWidth,height:innerHeight,docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight,buttons:[...document.querySelectorAll('.tg-shell button')].filter(x=>x.getBoundingClientRect().width>0).map(x=>({label:x.textContent||x.ariaLabel,h:x.getBoundingClientRect().height,w:x.getBoundingClientRect().width})),panels:[...document.querySelectorAll('.tg-board,.tg-controls')].map(x=>({scroll:x.scrollHeight,client:x.clientHeight,overflow:getComputedStyle(x).overflowY}))})));
}
await page.setViewportSize({width:667,height:375});
const confirm=async()=>{await page.getByRole('button',{name:'確認行動',exact:true}).click();};
const act=async(name)=>{await page.getByRole('button',{name,exact:true}).click();await confirm();};
const next=async()=>{await page.locator('.tg-session').waitFor();if(await page.getByRole('button',{name:'下一回合',exact:true}).count())await act('下一回合');};
const load=async(fuel,food)=>{await next();await page.getByLabel('裝貨燃料',{exact:true}).selectOption(String(fuel));await page.getByLabel('裝貨糧食',{exact:true}).selectOption(String(food));await act('裝入目前貨單');};
const sail=async(name)=>{await next();let b=page.getByRole('button',{name:new RegExp(`^${name} ·`)});if(await b.isDisabled()){await act('等待');await next();}await b.click();await confirm();};
const unload=async()=>{await next();await act('卸貨補給');};
await page.getByRole('button',{name:'裝入目前貨單',exact:true}).click();await page.getByRole('button',{name:'取消選擇',exact:true}).click();
await load(2,1);await sail('白礁燈塔');await unload();await sail('母港');await load(1,2);await sail('白礁燈塔');await sail('遠岬燈塔');
await page.reload();await page.getByRole('button',{name:/桌遊新樂園/}).click();await page.locator('[data-game-card="lighthouse"] button').first().click();
await unload();await sail('白礁燈塔');await sail('母港');await load(1,1);await sail('松灣燈塔');await unload();
await page.getByText('海岸重新亮起來了',{exact:true}).waitFor();await page.screenshot({path:`${out}/lighthouse-result.png`});await page.getByRole('button',{name:'再玩一局',exact:true}).click();await page.getByRole('button',{name:'保留本局',exact:true}).click();await page.getByText('海岸重新亮起來了',{exact:true}).waitFor();await page.getByRole('button',{name:'再玩一局',exact:true}).click();await page.getByRole('button',{name:'確定',exact:true}).click();
const journal=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('braintraining.playground.v1.lighthouse')));if(journal.actions.length)throw Error('reset failed');
fs.writeFileSync(`${out}/lighthouse-browser.json`,JSON.stringify({kind:'Desktop Chromium emulated viewports, not physical devices',baseUrl:process.env.BASE_URL||'http://localhost:3000',measurements,errors,resourceErrors,completeGame:true,cancel:true,reload:true,restart:true},null,2));await browser.close();if(errors.length)throw Error(errors.join('\n'));if(measurements.some(m=>m.docWidth>m.width||m.docHeight>m.height||m.buttons.some(b=>b.h<44||b.w<44)))throw Error('viewport or touch bounds failed');console.log('Chromium complete game, interruption, cancel, restart and four viewport checks passed');
