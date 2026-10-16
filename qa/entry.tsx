import React from 'react';
import {createRoot} from 'react-dom/client';
import Lighthouse from '../components/playground/Lighthouse';
import Garden from '../components/playground/Garden';
import Lantern from '../components/playground/Lantern';
import Workshop from '../components/playground/Workshop';
import Auction from '../components/playground/Auction';
import {PREFIX} from '../games/playground/session';
import {lighthouseEngine} from '../games/playground/lighthouse/rules';
import {gardenEngine,placements} from '../games/playground/garden/rules';
import {lanternEngine} from '../games/playground/lantern/rules';
import {workshopEngine} from '../games/playground/workshop/rules';
import {auctionEngine} from '../games/playground/auction/rules';
import {useExperienceViewport} from '../components/experience-ui/useExperienceViewport';
import '../index.css';
import '../desktop-layout.css';
import '../mobile-priority.css';
import '../responsive-polish.css';
import '../components/playground/playground.css';
import '../components/playground/mobile-viewport.css';
import '../components/playground/table-games.css';
import '../components/playground/table-landscape.css';
const q=new URLSearchParams(location.search),game=q.get('game')||'lighthouse',level=q.get('level')==='advanced'?'advanced':'normal';
const screens={lighthouse:Lighthouse,garden:Garden,lantern:Lantern,workshop:Workshop,auction:Auction};
const engines={lighthouse:lighthouseEngine,garden:gardenEngine,lantern:lanternEngine,workshop:workshopEngine,auction:auctionEngine};
const engine=engines[game]||lighthouseEngine,Screen=screens[game]||Lighthouse;
const actions:any[]=[];let state=engine.create(7,level,'A');
const add=(action:any)=>{state=(engine as any).apply(state,action);actions.push(action);};
if(q.get('state')==='mid'){
 if(game==='garden')for(let i=0;i<6;i++){const moves=placements(state as any);add(moves[(i*5)%moves.length]||{type:'discard'});}
 if(game==='lighthouse')for(const a of [{type:'load',fuel:2,food:1},{type:'sail',to:1},{type:'next'},{type:'unload'}])add(a);
 if(game==='lantern')for(const a of [{type:'place',to:0,count:2},{type:'place',to:1,count:2},{type:'move',from:1,to:2,count:1},{type:'move',from:0,to:3,count:1}])add(a);
 if(game==='workshop')for(const a of [{type:'use',station:'wood',count:1},{type:'use',station:'metal',count:1},{type:'use',station:'craft',count:1}])add(a);
 if(game==='auction')for(let i=0;i<3;i++){add({type:'bid'});add({type:'pass'});add({type:'next'});}
}
if(q.get('state')!=='setup'&&(q.get('fresh')!=='0'||!sessionStorage.getItem(`${PREFIX}.${game}`)))sessionStorage.setItem(`${PREFIX}.${game}`,JSON.stringify({version:1,game,id:`landscape-qa-${game}-${level}`,settings:{mode:'teams',level},seed:7,aiSeed:7,starter:'A',actions}));
if(q.get('state')==='setup')sessionStorage.removeItem(`${PREFIX}.${game}`);
function Harness(){const viewport=useExperienceViewport();return <div className="pg-viewport" style={{...viewport,...(q.get('safe')==='1'?{'--experience-safe-left':'30px','--experience-safe-right':'16px','--experience-safe-bottom':'10px'}:{})} as React.CSSProperties}><Screen onBack={()=>{document.body.setAttribute('data-back','true');}}/></div>;}
createRoot(document.getElementById('root')!).render(<Harness/>);
