import playwright from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.QA_OUTPUT || '/workspace/tabletop-review';
fs.mkdirSync(`${output}/screenshots`, { recursive: true });
const browser = await playwright.chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [], knownResourceErrors = [], results = [], menu = [], images = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => {
  if (m.type() !== 'error') return;
  const error = { text: m.text(), url: m.location().url };
  if (error.url.startsWith('https://fonts.googleapis.com/') || error.url === `${baseUrl}/favicon.ico`) knownResourceErrors.push(error);
  else errors.push(error);
});
const games = ['lighthouse', 'garden', 'lantern', 'workshop', 'auction'];
const sizes = [[320, 568], [390, 844], [640, 360], [852, 393], [1440, 900]];
const click = async name => page.getByRole('button', { name, exact: true }).click();
const assert = (value, message) => { if (!value) throw Error(message); };
async function measure() {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return page.evaluate(() => {
    const modal = document.querySelector('.pg-modal');
    const content = document.querySelector('.pg-modal-content');
    const bounds = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
    return { width: innerWidth, height: innerHeight, docWidth: document.documentElement.scrollWidth, docHeight: document.documentElement.scrollHeight,
      modal: modal && bounds(modal), content: content && { ...bounds(content), clientHeight: content.clientHeight, scrollHeight: content.scrollHeight, scrollWidth: content.scrollWidth, clientWidth: content.clientWidth, scrollTop: content.scrollTop } };
  });
}
function verifyBounds(m, context) {
  assert(m.docWidth <= m.width && m.docHeight <= m.height, `${context}: document overflow ${JSON.stringify(m)}`);
  if (m.modal) {
    assert(m.modal.x >= -1 && m.modal.y >= -1 && m.modal.right <= m.width + 1 && m.modal.bottom <= m.height + 1, `${context}: dialog outside viewport`);
    assert(m.content.scrollWidth <= m.content.clientWidth + 1, `${context}: dialog horizontal overflow`);
  }
}
async function rules(game, level, phase, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await click('玩法');
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const text = await dialog.innerText();
  const required = {
    lighthouse: ['三個獨立行動', '航行不消耗燃料', '只有進出遠岬', '一般共8箱，進階共10箱'],
    garden: ['整片空白區', '斜角相接不算連通', '16＋4−3＝17分', '進階6×6'],
    lantern: ['第3、6、9回合兩隊都完成行動後', '開局全部公開', '各得2分', '不會補充預備花燈'],
    workshop: ['只有出貨會增加分數', '兩隊合計6位工匠', '至少1位必須休息', '都只派1位工匠'],
    auction: ['不立即扣款', 'A付3枚，B不付款', '本件不能再競標', '剩餘籌碼不加分'],
  };
  for (const phrase of required[game]) assert(text.includes(phrase), `${game}: missing ${phrase}`);
  const top = await measure(); verifyBounds(top, `${game}/${level}/${phase}/${w}`);
  if (level === 'normal' && phase === 'setup' && [390, 640].includes(w)) await page.screenshot({ path: `${output}/screenshots/${game}-rules-${w}.png` });
  await page.locator('.pg-modal-content').evaluate(el => { el.scrollTop = el.scrollHeight; });
  const bottom = await measure();
  if (level === 'normal' && phase === 'setup' && [390, 640].includes(w)) await page.screenshot({ path: `${output}/screenshots/${game}-rules-bottom-${w}.png` });
  assert(bottom.content.scrollHeight <= bottom.content.clientHeight || bottom.content.scrollTop > 0, `${game}: dialog will not scroll`);
  assert(await dialog.getByRole('button', { name: '教學與玩法說明', exact: true }).isVisible(), `${game}: final content inaccessible`);
  await click('關閉');
  assert(await page.getByRole('dialog').count() === 0, `${game}: close failed`);
  assert(await page.getByRole('button', { name: '玩法', exact: true }).evaluate(el => document.activeElement === el), `${game}: focus not restored`);
  await click('玩法');
  await page.keyboard.press('Escape');
  assert(await page.getByRole('dialog').count() === 0, `${game}: Escape failed`);
  return { game, level, phase, top, bottom, close: true, escape: true, focusRestored: true };
}
try {
  await page.goto(baseUrl);
  await page.evaluate(() => sessionStorage.clear()); await page.reload();
  await page.getByRole('button', { name: /桌遊新樂園/ }).click();
  await page.locator('.pg-gallery').waitFor();
  for (const game of games) {
    const card = page.locator(`[data-game-card="${game}"]`);
    assert(await card.locator('.pg-box-art span').count() === 0, `${game}: duplicate art title`);
    assert(await card.locator('.pg-box-label h2').innerText(), `${game}: missing accessible title`);
    assert(await card.locator('.pg-box-label p').first().innerText(), `${game}: missing description`);
    assert(await card.getByRole('button').first().getAttribute('aria-hidden') !== 'true', `${game}: hidden action`);
  }
  for (const game of ['night-market', 'wall-race']) assert(await page.locator(`[data-game-card="${game}"] .pg-box-art span`).count() === 1, `${game}: art title changed`);
  for (const game of games) {
    const response = await page.request.get(`${baseUrl}/playground/box-${game}.webp`);
    assert(response.status() === 200, `${game}: image HTTP ${response.status()}`);
    assert(response.headers()['content-type']?.startsWith('image/webp'), `${game}: unexpected image content type`);
  }
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h });
    const m = await measure(); verifyBounds(m, `menu/${w}`); menu.push(m);
    for (const game of games) {
      const card = page.locator(`[data-game-card="${game}"]`);
      await card.scrollIntoViewIfNeeded();
      const art = await card.locator('.pg-box-art').evaluate(async (el, game) => {
        const style = getComputedStyle(el), r = el.getBoundingClientRect();
        const expectedPath = `/playground/box-${game}.webp`;
        if (!style.backgroundImage.includes(expectedPath)) throw Error(`Wrong source for ${game}: ${style.backgroundImage}`);
        const image = new Image(); image.src = expectedPath; await image.decode();
        return { game, width: r.width, height: r.height, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, backgroundImage: style.backgroundImage, backgroundSize: style.backgroundSize, backgroundPosition: style.backgroundPosition, backgroundOrigin: style.backgroundOrigin };
      }, game);
      assert(art.naturalWidth === 1000 && art.naturalHeight === 750, `${game}: invalid image dimensions`);
      const reference = await page.locator('[data-game-card="night-market"] .pg-box-art').boundingBox();
      assert(Math.abs(art.height - reference.height) < 1, `${game}/${w}: image height differs from Night Market ${JSON.stringify(art)}`);
      assert(art.backgroundSize === 'cover', `${game}/${w}: image must preserve proportions with cover`);
      images.push({ viewport: { width: w, height: h }, ...art });
      if ([390, 640].includes(w)) await card.screenshot({ path: `${output}/screenshots/menu-${game}-${w}.png` });
    }
    await page.locator('.pg-collection').evaluate(el => { el.scrollTop = 0; });
    await page.locator('.pg-gallery').evaluate(el => { el.scrollTop = 0; });
    if ([390, 640, 1440].includes(w)) await page.screenshot({ path: `${output}/screenshots/menu-${w}.png` });
  }
  for (const game of games) for (const level of ['normal', 'advanced']) {
    await page.locator(`[data-game-card="${game}"] button`).first().click();
    await page.locator('.tg-setup').waitFor();
    await click(level === 'normal' ? '一般' : '進階');
    for (const [w, h] of sizes) results.push(await rules(game, level, 'setup', w, h));
    await click('開始本局');
    verifyBounds(await measure(), `${game}/${level}/tutorial`);
    await click('關閉');
    assert(await page.locator('.tg-setup').count() === 1, `${game}: tutorial close starts game`);
    await click('開始本局'); await click('開始正式局');
    await page.locator('.tg-live').waitFor();
    const before = await page.evaluate(() => JSON.stringify(sessionStorage));
    for (const [w, h] of sizes) results.push(await rules(game, level, 'playing', w, h));
    assert(await page.evaluate(() => JSON.stringify(sessionStorage)) === before, `${game}: rules changed saved game`);
    await click('返回桌遊新樂園');
    await page.locator(`[data-game-card="${game}"] button`).first().click();
    await page.locator('.tg-live').waitFor();
    assert(await page.evaluate(() => JSON.stringify(sessionStorage)) === before, `${game}: returning changed saved game`);
    await click('返回桌遊新樂園');
    if (level === 'normal') {
      await page.locator(`[data-game-card="${game}"]`).getByRole('button', { name: '重新設定', exact: true }).click();
      await click('確定');
      await click('返回桌遊新樂園');
    }
  }
} finally {
  fs.writeFileSync(`${output}/browser-results.json`, JSON.stringify({ kind: 'Desktop Chromium emulated viewports; physical iOS/touch unverified; approved Git-backed menu images integrated', baseUrl, menu, images, results, errors, knownResourceErrors }, null, 2));
  await browser.close();
}
assert(errors.length === 0, errors.join('\n'));
console.log(`PASS: ${results.length} rules checks; ${images.length} menu image/height checks; all five WebPs HTTP 200, image/webp and decode 1000x750; modal scroll/close/Escape/focus/return; 0 unexpected console errors; ${knownResourceErrors.length} known font/favicon resource errors (retained in JSON).`);
