import React, {useEffect, useRef, useState} from 'react';
import {PLAYGROUND_CATALOG} from '../../data/playgroundCatalog';
import './new-boardgames.css';
export type NewBoardgameId = 'beans' | 'lost' | 'animals' | 'borrow';
const CHANNEL='braintraining-four-tables-v1';
type Level='normal'|'advanced';
type Mode='ai'|'local'|'solo';
const dual=(game:NewBoardgameId)=>game==='beans'||game==='borrow';
const settingKey=(game:NewBoardgameId)=>`braintraining.playground.four-tables.v1.settings.${game}`;
function readSettings(game:NewBoardgameId):{level:Level;mode:Mode}{
  const fallback={level:'normal' as Level,mode:(dual(game)?'ai':'solo') as Mode};
  try{const s=JSON.parse(localStorage.getItem(settingKey(game))||'null');return {level:s?.level==='advanced'?'advanced':'normal',mode:dual(game)&&s?.mode==='local'?'local':fallback.mode}}catch{return fallback}
}
export default function NewBoardgame({game,onBack}:{game:NewBoardgameId;onBack:()=>void}){
  const c=PLAYGROUND_CATALOG.find(c=>c.id===game)!;
  const [settings,setSettings]=useState(()=>readSettings(game));
  const [started,setStarted]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
  const frame=useRef<HTMLIFrameElement>(null);
  useEffect(()=>{if(!started)return;const receive=(event:MessageEvent)=>{
    if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||event.data?.channel!==CHANNEL)return;
    if(event.data.type==='ready'){setReady(true);setError(false)}
    if(event.data.type==='exit')onBack();
    if(event.data.type==='error'){setError(true);setReady(false)}
  };window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive)},[started,onBack]);
  useEffect(()=>{if(!started||ready||error)return;const timer=window.setTimeout(()=>setError(true),15000);return()=>window.clearTimeout(timer)},[started,ready,error,attempt]);
  const begin=()=>{try{localStorage.setItem(settingKey(game),JSON.stringify(settings))}catch{}setStarted(true);setReady(false);setError(false)};
  if(started)return <section className="nb-room" aria-label={`${c.title}遊戲桌`}>
    <iframe key={attempt} ref={frame} className={ready?'nb-frame':'nb-frame nb-loading-frame'} title={`${c.title}遊戲桌`} src={`/boardgames-v5/index.html?game=${game}&mode=${settings.mode}&level=${settings.level}`} onError={()=>setError(true)}/>
    {!ready&&<div className="nb-load-panel pg-paper"><h1>{c.title}</h1>{error?<p role="alert">遊戲桌尚未載入完成，請重新載入或返回目錄。</p>:<p role="status">正在擺好遊戲桌…</p>}<div className="nb-actions">{error&&<button className="pg-primary" onClick={()=>{setError(false);setReady(false);setAttempt(n=>n+1)}}>重新載入</button>}<button onClick={onBack}>返回桌遊新樂園</button></div></div>}
  </section>;
  return <section className="nb-setup pg-paper" aria-label={`${c.title}設定`}>
    <header className="nb-setup-heading"><div><p className="pg-eyebrow">桌遊新樂園</p><h1>{c.title}</h1><p>{c.description}</p></div><button onClick={onBack}>返回桌遊新樂園</button></header>
    <div className="nb-setup-body"><div className={`nb-setup-art nb-art-${game}`} aria-hidden="true"/><div className="nb-setup-controls">
      <fieldset><legend>遊戲難度</legend><div className="nb-choice">{(['normal','advanced'] as const).map(level=><button key={level} aria-pressed={settings.level===level} onClick={()=>setSettings(s=>({...s,level}))}>{level==='normal'?'一般':'進階'}</button>)}</div><p>{c.difficultyDescriptions[settings.level]}</p></fieldset>
      {dual(game)?<fieldset><legend>一起怎麼玩</legend><div className="nb-choice"><button aria-pressed={settings.mode==='ai'} onClick={()=>setSettings(s=>({...s,mode:'ai'}))}>挑戰電腦</button><button aria-pressed={settings.mode==='local'} onClick={()=>setSettings(s=>({...s,mode:'local'}))}>同機雙人</button></div></fieldset>:<p className="nb-cooperative">單人／一起討論 · 不限時間</p>}
      <p className="nb-storage-note">離開或重新整理會結束本局。這四款目前不儲存對局進度、不計入平台統計；設定與教學紀錄只保留在此裝置。</p>
      {game==='borrow'&&<p className="nb-teaching-note">第一次開始會直接帶你操作，可隨時跳過或重看教學。</p>}
      <button className="pg-primary nb-begin" onClick={begin}>開始遊戲</button>
    </div></div>
  </section>
}
