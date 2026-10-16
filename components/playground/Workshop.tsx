import React, { useState } from "react";
import TableGame from "./TableGame";
import "./workshop-artboard.css";
import {
  workshopEngine,
  WorkshopState,
  WorkshopAction,
  STATIONS,
  STATION_NAMES,
  workshopError,
} from "../../games/playground/workshop/rules";
export function WorkshopArt() {
  return (
    <svg
      className="tg-theme-art"
      viewBox="0 0 500 280"
      role="img"
      aria-label="木質工坊的工具與手作成品"
    >
      <rect
        x="5"
        y="5"
        width="490"
        height="270"
        rx="24"
        fill="#b89468"
        stroke="#e5cc9c"
        strokeWidth="5"
      />
      <path
        d="M15 65h470M15 130h470M15 205h470"
        stroke="#6e523a"
        strokeWidth="3"
        opacity=".4"
      />
      <path
        d="m110 65 35-25 45 65-35 25z"
        fill="#c7c6ad"
        stroke="#4c534c"
        strokeWidth="4"
      />
      <path d="m166 109 65 89" stroke="#583c2e" strokeWidth="17" />
      <path d="M300 35v150" stroke="#e9d7ad" strokeWidth="23" />
      <path
        d="M265 40h70v50h-70z"
        fill="#4c625e"
        stroke="#d1c6a4"
        strokeWidth="5"
      />
      <path
        d="m60 215 38-42 55 42-55 30zM330 205l40-45 60 45-60 30z"
        fill="#e0c391"
        stroke="#815b3b"
        strokeWidth="4"
      />
      <path
        d="M390 50v75m-20-55 40 35m0-35-40 35"
        stroke="#697a70"
        strokeWidth="10"
      />
      <circle
        cx="270"
        cy="214"
        r="24"
        fill="#9a6a46"
        stroke="#f0dbaf"
        strokeWidth="7"
      />
    </svg>
  );
}
const info = {
  wood: "取木料 2＋等級（上限6）",
  metal: "取金屬 2＋等級（上限6）",
  craft: "每件：木料1＋金屬1 → 成品1",
  upgrade: "木料2＋金屬1 → 等級＋1",
  ship: "每件成品 → 4＋2×等級 分",
};
function WorkshopTable({state:s,choose}:{state:WorkshopState;choose:(a:WorkshopAction,l:string)=>void}) {
  const [count,setCount]=useState(1);
  return <div className="tg-workshop-desk">
    <section className="tg-workshop-ledger pg-paper"><table aria-label="兩隊工坊庫存與工匠"><thead><tr><th>庫存</th>{(['A','B'] as const).map(t=><th key={t} className={s.turn===t?'tg-ledger-active':''}>{t}隊{s.turn===t?' ◀':''}</th>)}</tr></thead><tbody>{([['wood','木料','/6'],['metal','金屬','/6'],['goods','成品','/3'],['level','等級','/2'],['workers','工匠',''],['score','分數','']] as const).map(([key,name,max])=><tr key={key}><th>{name}</th>{(['A','B'] as const).map(t=><td key={t} className={s.turn===t?'tg-ledger-active':''}>{key==='workers'?s.workers[t]:s.stock[t][key]}{max}</td>)}</tr>)}</tbody></table></section>
    <div className="tg-workshop-options"><b>{s.phase==='round_summary'?'工作日結算':`輪到 ${s.turn} 隊`}</b>{s.phase!=='round_summary'&&<label>加工／出貨<select aria-label="加工出貨件數" value={count} onChange={e=>setCount(Number(e.target.value))}><option value="1">1件</option><option value="2">2件</option></select></label>}</div>
    <div className="tg-station-table" aria-label="五個共用工作站與休息區">{STATIONS.map((st,i)=>{const action:WorkshopAction={type:'use',station:st,count:st==='craft'||st==='ship'?count:1},error=workshopError(s,action),occupied=s.occupied[st];return <button key={st} className={`wk-station ${occupied?'wk-station-used':''}`} aria-label={`使用${STATION_NAMES[st]}`} aria-describedby={`wk-info-${st} wk-status-${st} wk-cost-${st}`} title={error||info[st]} disabled={!!error} onClick={()=>choose(action,`${s.turn}隊使用${STATION_NAMES[st]}。${info[st]}${st==='craft'||st==='ship'?`，本次${count}件。`:''}花費1位工匠。`)}>
      <svg className="wk-station-art" viewBox={`${i%3*512} ${Math.floor(i/3)*512} 512 512`} aria-hidden="true"><defs><clipPath id={`wk-crop-${st}`}><rect x={i%3*512} y={Math.floor(i/3)*512} width="512" height="512"/></clipPath></defs><image clipPath={`url(#wk-crop-${st})`} href="/assets/playground/workshop/stations-atlas-v1.png" width="1536" height="1024"/></svg>
      <b>{STATION_NAMES[st]}</b><span id={`wk-info-${st}`} className="wk-recipe">{{wood:<>取木料<br/>2＋等級</>,metal:<>取金屬<br/>2＋等級</>,craft:<>每件：木1＋金1<br/>→ 成品1</>,upgrade:<>木2＋金1<br/>→ 等級＋1</>,ship:<>每件成品<br/>4＋2×等級 分</>}[st]}</span><span className="sr-only" id={`wk-cost-${st}`}>每次使用1位工匠。{st==='craft'||st==='ship'?`本次${count}件。`:''}{error||'可以派工。'}</span><small id={`wk-status-${st}`} className={occupied?'wk-occupied':''}>{occupied?`${occupied}隊已占用`:error?'條件不足':st==='craft'||st==='ship'?`派工 · ${count}件`:'點此派工'}</small>
    </button>;})}
    <button className="wk-station wk-rest" aria-describedby="wk-rest-info" aria-label={s.phase==='round_summary'?(s.round===s.limit?'查看總結果':'下一工作日'):'安排休息'} onClick={()=>s.phase==='round_summary'?choose({type:'next'},s.round===s.limit?'最後工作日已完成，查看出貨總分。':'進入下一工作日，清空工作站並補回工匠。'):choose({type:'rest'},'安排1位工匠休息，不占用工作站，也不獲得資源。')}>
      <svg className="wk-station-art" viewBox="1024 512 512 512" aria-hidden="true"><defs><clipPath id="wk-crop-rest"><rect x="1024" y="512" width="512" height="512"/></clipPath></defs><image clipPath="url(#wk-crop-rest)" href="/assets/playground/workshop/stations-atlas-v1.png" width="1536" height="1024"/></svg><b>{s.phase==='round_summary'?'今日完成':'休息區'}</b><span className="wk-recipe" id="wk-rest-info">{s.phase==='round_summary'?'庫存保留 · 隔日換先手':<>用1工匠<br/>不占工作站</>}</span><small>{s.phase==='round_summary'?(s.round===s.limit?'查看總結果':'下一工作日'):'安排休息'}</small>
    </button></div>
    <p className="tg-desk-note">每次派1位工匠 · 最後只計出貨分數，剩餘材料與成品不加分。</p>
  </div>;
}
export default function Workshop({ onBack }: { onBack: () => void }) {
  return (
    <TableGame
      game="workshop"
      engine={workshopEngine}
      onBack={onBack}
      art={<WorkshopArt />}
      summary={(s) => `第 ${s.round} / ${s.limit} 日・輪到 ${s.turn}隊・五站共用`}
      steps={[
        "看兩隊材料、成品與剩餘工匠，挑選空工作站。",
        "取材、加工、升級或出貨，一次派出一位工匠；被占的站當日不能再用。",
        "兩隊工匠用完後進下一日，最後比較出貨總分。",
      ]}
      demo={[
        "示範：工坊有木料2、金屬1、成品1，現在等級0。",
        "直接出貨1件能立刻拿4分。若改去升級坊，先付木料2＋金屬1，本手沒有分數。",
        "升級到1級後，每件出貨6分，取材每次3單位；但要等空站與剩餘工作日，投資才會回本。",
      ]}
      rules={
        <>
          <p>
            兩隊各經營自己的工坊，共用五個工作站。一般5工作日、每隊每日2位工匠；進階6工作日、每隊每日3位。起始各有木料1、金屬1，等級0。
          </p>
          <ol>
            <li>
              第1日A先手，之後每日交換先手。輪流派1位工匠；對方用完時本隊可連續操作。當日占用的站，任一隊都不能再用。
            </li>
            <li>
              木料／金屬站一次取2＋工坊等級單位；各上限6，超過只取到6。已滿不能使用該站。
            </li>
            <li>加工臺可一次做1或2件，每件需木料1、金屬1。成品最多3件。</li>
            <li>
              升級坊花木料2、金屬1升1級，最高2級。升級永久增加取材量與出貨分數。
            </li>
            <li>
              出貨埠可一次出1或2件，每件得4＋2×目前等級分。加工、出貨批量都只使用1位工匠、占1站。
            </li>
            <li>
              也可安排休息使用1工匠，不占站、不取資源。工匠全用完後確認結算，下一日工匠補滿、工作站清空，庫存／等級／分數保留。
            </li>
            <li>
              最後一天完成後比較出貨總分，剩餘材料、成品與等級不加分；同分共同獲勝。
            </li>
          </ol>
        </>
      }
      result={(s) => (
        <>
          <h3>
            {s.stock.A.score === s.stock.B.score
              ? "兩隊同分，共同獲勝"
              : `${s.stock.A.score > s.stock.B.score ? "A" : "B"}隊獲勝`}
          </h3>
          {(["A", "B"] as const).map((t) => (
            <p key={t}>
              {t}隊出貨總分 <b>{s.stock[t].score}</b>；等級 {s.stock[t].level}
              、剩成品 {s.stock[t].goods}（不另計分）
            </p>
          ))}
        </>
      )}
    >
      {(c) => <WorkshopTable state={c.state} choose={c.choose} />}
    </TableGame>
  );
}
