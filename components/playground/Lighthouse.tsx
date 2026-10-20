import React, { useState } from "react";
import TableGame from "./TableGame";
import "./lighthouse-artboard.css";
import {
  lighthouseEngine,
  LighthouseState,
  LighthouseAction,
  PORTS,
  ROUTES,
  sailCost,
  legalLighthouse,
  createLighthouse,
  applyLighthouse,
  LIGHTHOUSE_MISSIONS,
} from "../../games/playground/lighthouse/rules";
const XY = [
  [90, 190],
  [260, 85],
  [480, 155],
  [320, 290],
];
export function SeaChart({ state }: { state?: LighthouseState }) {
  return (
    <svg
      className="tg-sea-chart"
      viewBox="0 0 570 365"
      role="img"
      aria-label="深藍海圖：母港連接白礁與松灣，兩者連接遠岬，白礁與松灣亦相連"
    >
      <defs>
        <radialGradient id="sea">
          <stop stopColor="#28667b" />
          <stop offset="1" stopColor="#0d2c46" />
        </radialGradient>
        <pattern
          id="waves"
          width="60"
          height="45"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 22q15-10 30 0t30 0"
            fill="none"
            stroke="#83b9bd"
            strokeOpacity=".16"
          />
        </pattern>
      </defs>
      <rect
        x="3"
        y="3"
        width="564"
        height="359"
        rx="22"
        fill="url(#sea)"
        stroke="#bc9c5b"
        strokeWidth="4"
      />
      <rect width="570" height="365" fill="url(#waves)" />
      {ROUTES.map(([a, b]) => (
        <path
          key={`${a}${b}`}
          d={`M${XY[a]}L${XY[b]}`}
          stroke="#bdcdbd"
          strokeWidth="2"
          strokeDasharray="7 7"
        />
      ))}
      <g fill="#c9b77e" fontSize="14" textAnchor="middle">
        <text x="490" y="300">
          N
        </text>
        <path d="m490 310-8 23 8-5 8 5z" fill="none" stroke="#c9b77e" />
      </g>
      {XY.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse
            rx="48"
            ry="22"
            fill="#789183"
            stroke="#c7bb8a"
            strokeWidth="2"
          />
          {i === 0 ? (
            <path
              d="M-25 0v-27h50V0M-30-27l30-23 30 23"
              fill="#b99867"
              stroke="#f1ddb1"
              strokeWidth="3"
            />
          ) : (
            <g>
              <path d="m-10 0 4-48h12l4 48z" fill="#f7eed6" />
              <path d="M-6-38H7M-7-24H8" stroke="#b45a46" strokeWidth="7" />
              <path d="m-12-49 12-12 12 12z" fill="#daa955" />
              <path d="M-17-46h34" stroke="#ffdf83" strokeWidth="4" />
            </g>
          )}
          {state?.at === i && (
            <g transform="translate(0 28)">
              <path d="m-19 0 8 13h23L22 0z" fill="#f6c56b" stroke="#fff2c5" />
              <path d="M0 0v-22L15-5H0" fill="#fff6da" />
            </g>
          )}
          <text
            y={i === 3 ? 56 : 53}
            fill="#fff4d5"
            textAnchor="middle"
            fontWeight="700"
            fontSize="20"
          >
            {PORTS[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}
const PORT_POSITION = [[13, 45], [38, 30], [87, 45], [63, 63]];
function SupplyBoat() {
  return <svg viewBox="0 0 90 64" className="lh-supply-boat" aria-hidden="true"><path d="M7 45q37 15 75-2l-13 15H22z" fill="#db9b55" stroke="#f2d7a0" strokeWidth="2"/><path d="M29 43V27h27v17" fill="#efe3bf"/><path d="M25 27 42 18 61 27" fill="#b16f50"/><path d="M51 25V8M50 9l18 6-18 6" fill="#d8d5ae" stroke="#cfb989" strokeWidth="2"/><path d="M9 61q15-5 28 0t27 0t22-1" fill="none" stroke="#a9d3cc" strokeWidth="2"/><rect x="34" y="31" width="9" height="8" rx="1" fill="#2a5863"/><path d="M58 42V33h12v9" fill="#91784c"/></svg>;
}
function NavigationChart({ state: s, choose }: { state: LighthouseState; choose?: (a: LighthouseAction, label: string) => void }) {
  const legal = legalLighthouse(s);
  return <div className="tg-navigation-chart lh-island-chart" aria-label="完整航線與三座燈塔需求">
    <svg className="tg-route-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs><pattern id="chart-waves" width="15" height="16" patternUnits="userSpaceOnUse"><path d="M2 8q3-2 6 0t6 0" fill="none" stroke="#c3d5bd" strokeOpacity=".12" strokeWidth=".3" /></pattern></defs>
      <rect width="100" height="100" fill="url(#chart-waves)" />
      {ROUTES.map(([a,b])=><line key={`${a}-${b}`} x1={PORT_POSITION[a][0]} y1={PORT_POSITION[a][1]} x2={PORT_POSITION[b][0]} y2={PORT_POSITION[b][1]} stroke={a===2 || b===2 ? '#e9bf79' : '#c8ddd1'} strokeWidth=".5" strokeDasharray="1.3 1.2" opacity=".7" />)}
    </svg>
    <span className="lh-chart-compass" aria-hidden="true">✧<small>N</small></span>
    {PORTS.map((name,to)=>{
      const available=legal.some(a=>a.type==='sail'&&a.to===to),current=s.at===to;
      const connected=ROUTES.some(([a,b])=>(a===s.at&&b===to)||(b===s.at&&a===to));
      const need=s.needs[to],completed=to>0&&need[0]+need[1]===0;
      return <button key={name} className={`lh-island lh-island-${to} ${current?'lh-island-current':''} ${completed?'lh-island-complete':''}`} disabled={!choose || !available} aria-label={`${name} · ${sailCost(s,to)} 行動${need[0]+need[1]>4?' · 需求超過4箱，須分批補給':''}`} onClick={()=>choose?.({type:'sail',to},`航向${name}，花費 ${sailCost(s,to)} 行動。`)}>
        <span className={`lh-island-art lh-atlas-${to}`} aria-hidden="true"/>
        {current&&<span className="lh-moored"><SupplyBoat/><b>停靠</b></span>}
        <span className="lh-island-label"><strong>{name.replace('燈塔','')}</strong><span>{to===0?'補給出發地':completed?'✓ 補給完成':`燃 ${need[0]}  ·  糧 ${need[1]}`}</span></span>
        <span className="lh-island-status">{current?'船在這裡':s.phase!=='playing'?'今日已完成':available?`航行 ${sailCost(s,to)} 行動`:connected?`需 ${sailCost(s,to)} 行動`:'無直達航線'}</span>
      </button>;
    })}
  </div>;
}
function Voyage({ state: s, choose }: { state: LighthouseState; choose: (a: LighthouseAction, l: string) => void }) {
  const [fuel,setFuel]=useState(1), [food,setFood]=useState(1);
  const legal=legalLighthouse(s),completed=s.needs.slice(1).filter(n=>n[0]+n[1]===0).length;
  const allowed=(a:LighthouseAction)=>legal.some(x=>JSON.stringify(x)===JSON.stringify(a));
  return <div className="lh-voyage">
    <div className="lh-weather-log" aria-label="公開海況與補給期限"><div><b>今日 {s.weather[s.round-1]?'風浪 ≋':'平穩 ～'}</b><span>明日 {s.round===s.limit?'期限到期':s.weather[s.round]?'風浪 ≋':'平穩 ～'}</span></div><span className="lh-route-key">金線風浪2行動 · 整備抵1</span><strong>補給 {completed} / 3塔</strong></div>
    <NavigationChart state={s} choose={choose}/>
    <aside className="lh-ship-deck" aria-label="補給船與當下可用行動">
      <div className="lh-cargo-manifest"><strong>船艙 <b>{s.cargo[0]+s.cargo[1]}</b><small> / 4</small></strong><span aria-label={`燃料 ${s.cargo[0]}、糧食 ${s.cargo[1]}`}>燃 {s.cargo[0]} · 糧 {s.cargo[1]}</span><span className="lh-ready">整備 {s.ready} / 2</span></div>
      {s.phase==='round_summary'?<div className="lh-dock-task lh-day-end"><strong>今日航程完成</strong><span>討論好明日方向，再繼續出發。</span><button className="pg-primary" aria-label="下一回合" onClick={()=>choose({type:'next'},'進入下一回合，今日海況將更換。')}>下一回合 →</button></div>:<>
        {s.at===0?<div className="lh-dock-task"><strong>母港裝貨 <small>每次耗1行動</small></strong><div className="lh-load-order"><label>燃<select aria-label="裝貨燃料" value={fuel} onChange={e=>setFuel(Number(e.target.value))}>{[0,1,2,3,4].map(n=><option key={n}>{n}</option>)}</select></label><label>糧<select aria-label="裝貨糧食" value={food} onChange={e=>setFood(Number(e.target.value))}>{[0,1,2,3,4].map(n=><option key={n}>{n}</option>)}</select></label><button className="pg-primary" aria-label="裝入目前貨單" disabled={!allowed({type:'load',fuel,food})} onClick={()=>choose({type:'load',fuel,food},`裝入燃料 ${fuel}、糧食 ${food}，花費1行動。`)}>裝入船艙</button></div></div>:<div className="lh-dock-task lh-unload-task"><strong>{PORTS[s.at].replace('燈塔','')}補給 <small>每次耗1行動</small></strong><div><span>尚需 燃料 {s.needs[s.at][0]} · 糧食 {s.needs[s.at][1]}</span><button className="pg-primary" disabled={!allowed({type:'unload'})} onClick={()=>choose({type:'unload'},'交付船上所有符合這座燈塔需求的貨物，花費1行動。')}>卸貨補給</button></div></div>}
        <div className="lh-deck-secondary"><span>各耗1行動</span><div><button disabled={!allowed({type:'rig'})} onClick={()=>choose({type:'rig'},'整備+1（最多2枚），花費1行動。')}>整備</button><button onClick={()=>choose({type:'wait'},'原地等待，花費1行動。')}>等待</button></div></div>
      </>}
    </aside>
  </div>;
}
function LighthouseLesson() {
  const [s,setState]=useState(()=>createLighthouse(7,'normal','A'));
  const [step,setStep]=useState(0);
  const actions:LighthouseAction[]=[{type:'load',fuel:2,food:1},{type:'sail',to:1},{type:'next'},{type:'unload'}];
  const labels=['裝入燃料2、糧食1','航向白礁','開始第2回合','卸貨補給'];
  return <section className="tg-demo tg-real-lesson"><h3>操作練習：完成白礁補給</h3><p>這裡使用正式規則，不寫入本局進度。</p><NavigationChart state={s}/><p aria-live="polite">{s.message} 船艙 {s.cargo[0]+s.cargo[1]}/4；第{s.round}回合，剩{s.ap}行動。</p>{step<actions.length?<button onClick={()=>{setState(applyLighthouse(s,actions[step]));setStep(step+1);}}>{labels[step]}</button>:<button onClick={()=>{setState(createLighthouse(7,'normal','A'));setStep(0);}}>再練一次</button>}</section>;
}
export default function Lighthouse({ onBack }: { onBack: () => void }) {
  return (
    <TableGame
      game="lighthouse"
      engine={lighthouseEngine}
      onBack={onBack}
      cooperative
      art={<SeaChart />}
      tutorial={<LighthouseLesson />}
      summary={(s) =>
        `${s.mission === undefined ? "合作補給" : LIGHTHOUSE_MISSIONS[s.mission].name}・第 ${s.round} / ${s.limit} 回合・剩 ${s.ap} 行動`
      }
      steps={[
        "看三座燈塔的燃料與糧食需求，母港裝貨。",
        "每回合兩行動：裝貨、航行、卸貨分別耗行動，抵達不會自動卸貨。",
        "看明日海況，在9回合內讓三座燈塔都完成補給。",
      ]}
      demo={[
        "母港準備裝入2箱燃料、1箱糧食。按「試做這一步」看結果。",
        "船艙3/4，剩1行動。選航向白礁，這回合就無法卸貨。",
        "下一回合在白礁卸貨：燃料2、糧食1一次交付完成，還剩1行動可航行。",
      ]}
      rules={
        <>
          <p>
            全團體共同控制一艘船，在9回合內完成三座燈塔的全部需求就獲勝；期限到仍未完成則任務未完成。一般共8箱。進階共12箱且風浪較多，每局抽出3組需求配置之一：白礁增援、遠岬輪補、松灣增援；同一局的配置不會中途改變。
          </p>
          <p>
            進階每組都有一座燈塔需要5箱，超過船艙上限，必須分批補給；不能只用「每塔各送一趟」完成。先看全圖需求，討論哪批貨可順路分送、哪座塔需要再訪，再配合今日與明日海況安排整備。
          </p>
          <ol>
            <li>每回合2行動；裝貨、航行、卸貨是三個獨立行動，抵達燈塔不會自動交貨。用完按「下一回合」，不會自動跳過討論。</li>
            <li>
              只能沿海圖虛線航行。平穩時每段耗1行動；風浪時只有進出遠岬的航段耗2行動，其他航段仍耗1行動。風浪進出遠岬時若有整備，會自動使用1枚，改耗1行動；沒有整備且只剩1行動時不能走這段。
            </li>
            <li>
              只在母港裝貨，耗1行動，可任選燃料與糧食數量，合計至少1箱且裝完船艙不超過4箱；母港供應不限。燃料與糧食都是要交付燈塔的貨物，航行不消耗燃料。
            </li>
            <li>
              卸貨耗1行動，一次交付所有符合當地剩餘需求的貨物；其餘保留。不能在母港卸貨。
            </li>
            <li>
              整備耗1行動，得1枚，最多存2枚；等待耗1行動。今日與明日海況始終公開，風浪不會損失貨物。
            </li>
            <li>最後一次交付立即判定勝利，即使是期限最後一行動也有效。</li>
          </ol>
        </>
      }
      result={(s) => (
        <>
          <h3>{s.won ? "海岸重新亮起來了" : "補給任務未完成"}</h3>
          <p>
            使用 {s.round} 回合；尚缺{" "}
            {s.needs.flat().reduce((a, b) => a + b, 0)}{" "}
            箱。可一起討論哪趟裝貨或航線值得改變。
          </p>
        </>
      )}
    >
      {(c) => <Voyage state={c.state} choose={c.choose} />}
    </TableGame>
  );
}

