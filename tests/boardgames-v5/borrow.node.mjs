import test from 'node:test';
import assert from 'node:assert/strict';
import {createState, movesFor, play, pass, allMoves, chooseAI, positionKey} from '../../public/boardgames-v5/games/borrow.mjs';
test('initial state has six pieces and distinct cards',()=>{let s=createState();assert.equal(s.pieces.length,6);assert.equal(new Set([...s.cards.flat(),s.center]).size,5)});
test('movements mirror for upper player',()=>{let s=createState();s.pieces=[{id:'a',team:0,king:true,x:2,y:3},{id:'b',team:1,king:true,x:2,y:1}];s.cards=[[0,1],[0,1]];assert.ok(movesFor(s,'a',0).some(m=>m.x===2&&m.y===1));s.turn=1;assert.ok(movesFor(s,'b',0).some(m=>m.x===2&&m.y===3))});
test('legal move exchanges card and turn, no mutation',()=>{let s=createState(),m=allMoves(s)[0],n=play(s,m);assert.equal(n.center,s.cards[0][m.slot]);assert.equal(n.cards[0][m.slot],s.center);assert.equal(n.turn,1);assert.equal(s.ply,0);assert.equal(n.ply,1)});
test('reject illegal moves',()=>{let s=createState();assert.throws(()=>play(s,{id:'p0k',slot:0,x:8,y:8}))});
test('capture leader wins',()=>{let s=createState();s.pieces=[{id:'a',team:0,king:true,x:2,y:3},{id:'b',team:1,king:true,x:2,y:1}];s.cards[0]=[0,1];assert.equal(play(s,{id:'a',slot:0,x:2,y:1}).winner,0)});
test('goal wins',()=>{let s=createState();s.pieces=[{id:'a',team:0,king:true,x:2,y:2},{id:'b',team:1,king:true,x:0,y:0}];s.cards[0]=[0,1];assert.equal(play(s,{id:'a',slot:0,x:2,y:0}).winner,0)});
test('pass forbidden when legal move exists',()=>assert.throws(()=>pass(createState(),0)));
test('blocked side exchanges and passes',()=>{let s=createState();s.pieces=[];let n=pass(s,0);assert.equal(n.turn,1);assert.equal(n.center,s.cards[0][0])});
test('60 ply bounded draw',()=>{let s=createState();s.ply=59;assert.equal(play(s,allMoves(s)[0]).winner,'draw')});
test('third position occurrence draws',()=>{let s=createState(),m=allMoves(s)[0],n=play(s,m);s.seen[positionKey(n)]=2;assert.equal(play(s,m).winner,'draw')});
test('AI chooses legal actions over complete matches',()=>{for(let game=0;game<10;game++){let s=createState();while(s.winner===null){let a=chooseAI(s);s=a.pass?pass(s,a.slot):play(s,a);assert.ok(s.ply<=60)}assert.notEqual(s.winner,null)}});
test('own landing blocked but jumps over intervening piece',()=>{let s=createState();s.cards[0]=[0,1];s.pieces=[{id:'a',team:0,king:true,x:2,y:3},{id:'c',team:0,king:false,x:2,y:2},{id:'b',team:1,king:true,x:0,y:0}];assert.ok(movesFor(s,'a',0).some(m=>m.x===2&&m.y===1));s.pieces.push({id:'d',team:0,king:false,x:2,y:1});assert.ok(!movesFor(s,'a',0).some(m=>m.x===2&&m.y===1))});
test('only leader entering goal wins',()=>{let s=createState();s.cards[0]=[0,1];s.pieces=[{id:'a',team:0,king:false,x:2,y:2},{id:'k',team:0,king:true,x:4,y:4},{id:'b',team:1,king:true,x:0,y:0}];assert.equal(play(s,{id:'a',slot:0,x:2,y:0}).winner,null)});
test('new game does not retain previous cards or position',()=>{let a=createState(),b=play(a,allMoves(a)[0]),c=createState();assert.deepEqual(a,c);assert.notEqual(positionKey(b),positionKey(c))});
import {createTutorial,tutorialAction} from '../../public/boardgames-v5/games/borrow.mjs';
test('tutorial requires piece card move, uses real exchange and opponent consequence, then actual win',()=>{let t=createTutorial();assert.equal(t.stage,'piece');assert.equal(tutorialAction(t,{type:'card',slot:0}),t);t=tutorialAction(t,{type:'piece',id:'p0k'});assert.equal(t.stage,'card');t=tutorialAction(t,{type:'card',slot:0});assert.equal(t.stage,'move');t=tutorialAction(t,{type:'move',move:{id:'p0k',slot:0,x:2,y:2}});assert.equal(t.stage,'exchange');assert.equal(t.state.center,0);assert.equal(t.state.cards[0][0],4);t=tutorialAction(t,{type:'next'});assert.equal(t.stage,'opponent');assert.equal(t.state.cards[1][1],0);t=tutorialAction(t,{type:'next'});assert.equal(t.stage,'win-piece');t=tutorialAction(t,{type:'piece',id:'p0k'});t=tutorialAction(t,{type:'card',slot:0});t=tutorialAction(t,{type:'move',move:{id:'p0k',slot:0,x:2,y:0}});assert.equal(t.stage,'complete');assert.equal(t.state.winner,0)});
test('tutorial state independent from match, invalid actions do not progress',()=>{let match=createState(),before=structuredClone(match),t=createTutorial();assert.equal(tutorialAction(t,{type:'piece',id:'p1k'}),t);assert.deepEqual(match,before);let second=createTutorial();t.state.pieces[0].x=4;assert.equal(second.state.pieces[0].x,2)});
test('both difficulty AIs are legal over full games',()=>{for(const difficulty of ['normal','advanced']){let s=createState();while(s.winner===null){const m=chooseAI(s,difficulty);s=m.pass?pass(s,m.slot):play(s,m)}assert.ok(s.ply<=60)}});
import {createRequire} from 'node:module';
import {mount} from '../../public/boardgames-v5/games/borrow.mjs';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
test('tutorial actual UI preserves competitive state, pause blocks tutorial and retry keeps level',()=>{const dom=new JSDOM('<div id="root"></div>');const root=dom.window.document.querySelector('#root');let paused=false,finished=0;const api=mount(root,{mode:'local',difficulty:'advanced',isPaused:()=>paused,onFinish:()=>finished++});root.querySelector('[data-tutorial]').click();const click=s=>{const b=root.querySelector(s);assert.ok(b,s);b.click()};click('[data-cell="22"]');click('[data-cell="12"]');click('[data-confirm]');const saved=root.querySelector('.borrow-status').textContent;api.tutorial();assert.match(root.textContent,/互動教學/);paused=true;click('[data-cell="22"]');assert.match(root.querySelector('.borrow-instruction').textContent,/1 · 選棋子/);paused=false;click('[data-cell="22"]');click('[data-card="0"]');click('[data-cell="12"]');click('[data-confirm]');assert.match(root.querySelector('.borrow-instruction').textContent,/4 · 用過的卡/);click('[data-next]');assert.match(root.querySelector('.borrow-instruction').textContent,/5 · 對手/);click('[data-next]');click('[data-cell="12"]');click('[data-card="0"]');click('[data-cell="2"]');click('[data-confirm]');assert.match(root.querySelector('.borrow-instruction').textContent,/教學完成/);assert.equal(finished,0);click('[data-next]');assert.equal(root.querySelector('.borrow-status').textContent,saved);api.tutorial();click('[data-tutorial]');assert.equal(root.querySelector('.borrow-status').textContent,saved);api.restart();assert.match(root.querySelector('.borrow-status').textContent,/進階/);assert.match(root.querySelector('.borrow-status').textContent,/1\/60/);api.destroy();assert.equal(root.innerHTML,'');dom.window.close()});
test('advanced lookahead can choose differently from immediate evaluation',()=>{let seed=17;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};let different=false;for(let game=0;game<15&&!different;game++){let s=createState();for(let ply=0;ply<35&&s.winner===null;ply++){if(JSON.stringify(chooseAI(s,'normal'))!==JSON.stringify(chooseAI(s,'advanced')))different=true;let ms=allMoves(s),m=ms[Math.floor(rand()*ms.length)];s=m?play(s,m):pass(s,0)}}assert.ok(different)});

test('topcards display opponent mini diagrams and double-tapping destination commits move', () => {
  const dom = new JSDOM('<div id="root"></div>');
  const root = dom.window.document.querySelector('#root');
  const api = mount(root, { mode: 'local', difficulty: 'normal' });
  try {
    root.querySelector('[data-tutorial]').click();
    assert.equal(root.querySelectorAll('.borrow-topcard .borrow-diagram').length, 2);
    // Select p0k at (2,4)=22, slot 0 is default ('躍進', dy=-2 -> (2,2)=12), tap 12 twice to commit!
    root.querySelector('[data-cell="22"]').click();
    root.querySelector('[data-cell="12"]').click();
    assert.ok(root.querySelector('[data-cell="12"].destination'));
    root.querySelector('[data-cell="12"]').click();
    assert.match(root.querySelector('.borrow-status').textContent, /松隊的回合/);
  } finally {
    api.destroy();
    dom.window.close();
  }
});
