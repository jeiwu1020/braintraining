import playwright from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:3001';
const output=process.env.QA_OUTPUT||'/workspace/menu-art-height/after';
fs.mkdirSync(output,{recursive:true});
const captureOnly=process.env.CAPTURE_ONLY==='1',failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};
const browser=await playwright.chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage(),results=[],errors=[];
page.on('pageerror',e=>errors.push(String(e)));
const games=['lighthouse','garden','lantern','workshop','auction'];
try {
 await page.goto(base);await page.getByRole('button',{name:/桌遊新樂園/}).click();await page.locator('.pg-gallery').waitFor();
 for(const [width,height] of [[1440,900],[1280,800],[320,568],[390,844],[640,360],[844,320],[844,390],[896,414],[932,430],[768,353]]) {
  await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const rows=await page.evaluate(async()=>{
   const rows=[];
   for(const card of document.querySelectorAll('[data-game-card]')) {
    const art=card.querySelector('.pg-box-art'),s=getComputedStyle(art),r=art.getBoundingClientRect();
    const source=s.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
    const image=new Image();image.src=source;await image.decode();
    rows.push({game:card.dataset.gameCard,width:r.width,height:r.height,aspectRatio:s.aspectRatio,flex:s.flex,backgroundSize:s.backgroundSize,position:s.backgroundPosition,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,source,artTitleCount:art.querySelectorAll('span').length,title:card.querySelector('h2').textContent,description:card.querySelector('.pg-box-label p').textContent});
   }
   return rows;
  });
  const reference=rows.find(r=>r.game==='night-market');
  for(const row of rows.filter(r=>games.includes(r.game))) {
   check(Math.abs(row.height-reference.height)<1,`${row.game}/${width}: image-area height ${row.height} vs night ${reference.height}`);
   check(row.flex===reference.flex,`${row.game}/${width}: flex differs from Night Market`);
   check(row.aspectRatio===reference.aspectRatio,`${row.game}/${width}: aspect rule differs from Night Market`);
   check(row.backgroundSize==='cover',`${row.game}: cover required`);
   check(row.naturalWidth===1000&&row.naturalHeight===750,`${row.game}: image size changed`);
   check(row.artTitleCount===0,`${row.game}: duplicate title`);check(row.title&&row.description,`${row.game}: caption missing`);
  }
  const doc=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
  check(doc.width<=width&&doc.height<=height,`document overflow at ${width}x${height}`);
  for(const id of ['night-market','wall-race',...games])await page.locator(`[data-game-card="${id}"]`).screenshot({path:`${output}/${id}-${width}x${height}.png`});
  results.push({viewport:{width,height},referenceImageHeight:reference.height,rows,doc});
 }
} finally {fs.writeFileSync(`${output}/results.json`,JSON.stringify({kind:'Desktop Chromium emulated viewports; image-area comparison, not whole-card height',base,captureOnly,results,failures,errors},null,2));await browser.close();}
assert.equal(errors.length,0);if(!captureOnly)assert.deepEqual(failures,[]);
console.log(`${captureOnly?'BASELINE':'PASS'}: ${results.length*5} image heights checked against Night Market; ${failures.length} failed checks; all files decode, cover crop, labels retained, no duplicate art titles or page overflow.`);
