import React, { useState } from "react";
import TableGame from "./TableGame";
import "./lantern-artboard.css";
import {
  lanternEngine,
  LanternState,
  LanternAction,
  DISTRICTS,
  legalLantern,
  scoreDistricts,
} from "../../games/playground/lantern/rules";
export function LanternArt() {
  return (
    <svg
      className="tg-theme-art"
      viewBox="0 0 500 280"
      role="img"
      aria-label="暖光花燈街區"
    >
      <defs>
        <radialGradient id="lantern-glow">
          <stop stopColor="#ffce6a" stopOpacity=".75" />
          <stop offset="1" stopColor="#c36d3d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="500" height="280" rx="25" fill="#382d38" />
      {[70, 190, 310, 430].map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy={90 + (i % 2) * 30}
            r="90"
            fill="url(#lantern-glow)"
          />
          <path
            d={`M${x} 0v${55 + (i % 2) * 30}`}
            stroke="#b39264"
            strokeWidth="3"
          />
          <g transform={`translate(${x} ${90 + (i % 2) * 30})`}>
            <ellipse
              rx="29"
              ry="36"
              fill="#db9d4a"
              stroke="#f5cf87"
              strokeWidth="3"
            />
            <ellipse
              rx="13"
              ry="36"
              fill="none"
              stroke="#fbe0a1"
              strokeWidth="2"
            />
            <path
              d="M-15-35h30M-15 35h30M0 36v17"
              stroke="#9a4c38"
              strokeWidth="6"
            />
          </g>
        </g>
      ))}
      {[0, 100, 200, 300, 400].map((x, i) => (
        <g key={x} transform={`translate(${x} ${205 + (i % 2) * 10})`}>
          <path d="M10 10h80v65H10z" fill="#805147" />
          <path
            d="M0 15 45-15 95 15z"
            fill="#b27955"
            stroke="#d8b384"
            strokeWidth="3"
          />
          <path d="M25 30h20v25H25zM55 30h20v25H55z" fill="#e8b563" />
        </g>
      ))}
    </svg>
  );
}
function LanternTable({state:s,choose}:{state:LanternState;choose:(a:LanternAction,l:string)=>void}) {
  const [kind,setKind]=useState<'place'|'move'>('place'),[from,setFrom]=useState(0),[count,setCount]=useState(1);
  const legal=legalLantern(s),wave=Math.ceil(s.round/3)-1,predicted=scoreDistricts(s.districts,s.values[wave]);
  const allowed=(a:LanternAction)=>legal.some(x=>JSON.stringify(x)===JSON.stringify(a));
  return <div className="ln-festival">
    <div className="ln-score-ribbon"><strong>● A隊 {s.totals.A}分 <span>預備 {s.reserve.A}</span></strong><span>第{wave+1}評 · 第{(wave+1)*3}回合末</span><strong>▲ B隊 {s.totals.B}分 <span>預備 {s.reserve.B}</span></strong></div>
    <section className="ln-street-board" aria-label="四街區花燈與三次公開價值">
      {s.districts.map(([a,b],to)=>{const action:LanternAction=kind==='place'?{type:'place',to,count}:{type:'move',from,to,count};return <button className={`ln-district ln-district-${to}`} key={to} aria-describedby={`ln-public-${to}`} aria-label={`${kind==='place'?'放置到':'移動到'}${DISTRICTS[to]}`} disabled={!allowed(action)} onClick={()=>choose(action,kind==='place'?`${s.turn}隊使用${count}盞預備花燈放到${DISTRICTS[to]}。`:`${s.turn}隊從${DISTRICTS[from]}移${count}盞到${DISTRICTS[to]}。`)}>
        <span id={`ln-public-${to}`} className="tg-announcement">A隊{a}盞，B隊{b}盞。{s.values.map((v,i)=>`第${i+1}次評比${v[to]}分`).join('；')}。現在第{wave+1}次評比。</span><span className={`ln-district-art ln-atlas-${to}`} aria-hidden="true"/>
        <span className="ln-district-name">{DISTRICTS[to]}</span>
        <span className="ln-team-counts"><span className={a>b?'ln-team-leading':''} aria-label={`A隊${a}盞`}>● A <b>{a}</b></span><span className={b>a?'ln-team-leading':''} aria-label={`B隊${b}盞`}>▲ B <b>{b}</b></span></span>
        <span className="ln-public-values">{s.values.map((values,i)=><span key={i} className={wave===i?'ln-value-current':''} aria-label={`第${i+1}次評比${values[to]}分`}><small>{i+1}評</small><b>{values[to]}</b></span>)}</span>
      </button>;})}
    </section>
    <aside className="ln-planning-desk" aria-label="花燈布局操作">
      {s.phase==='round_summary'?<div className="ln-evaluation"><strong>本次計分 <span>A +{s.history.at(-1)?.points.A??0} · B +{s.history.at(-1)?.points.B??0}</span></strong><span>花燈保留，預備不補充。</span><button className="pg-primary" onClick={()=>choose({type:'next'},s.round===9?'三次評比已完成，查看最終總分。':'保留目前花燈，進入下一回合。')}>{s.round===9?'查看總結果':'繼續布局'}</button></div>:<>
        <div className="ln-mode"><strong>{s.turn}隊布局</strong><div className="pg-choice"><button aria-pressed={kind==='place'} onClick={()=>setKind('place')}>放置</button><button aria-pressed={kind==='move'} onClick={()=>setKind('move')}>移動</button></div></div>
        <label className="ln-quantity">本次盞數<select aria-label="本次花燈盞數" value={count} onChange={e=>setCount(Number(e.target.value))}><option>1</option><option>2</option></select></label>
        {kind==='move'?<label className="ln-source">出發街區<select aria-label="出發街區" value={from} onChange={e=>setFrom(Number(e.target.value))}>{DISTRICTS.map((d,i)=><option key={i} value={i}>{d} · 本隊{s.districts[i][s.turn==='A'?0:1]}盞</option>)}</select></label>:<div className="ln-instruction"><strong>點街區放入花燈 ↑</strong><span>領先取全分 · 平手分半</span></div>}
        <div className="ln-wait"><span className="ln-forecast" aria-label={`此刻評比：A隊${predicted.A}分，B隊${predicted.B}分`}>估 A{predicted.A} / B{predicted.B}</span><button className="ln-pass" onClick={()=>choose({type:'pass'},'保留資源與目前布局，等待一手。')}>等待布局</button></div>
      </>}
    </aside>
  </div>;
}
export default function Lantern({ onBack }: { onBack: () => void }) {
  return (
    <TableGame
      game="lantern"
      engine={lanternEngine}
      onBack={onBack}
      art={<LanternArt />}
      summary={(s) =>
        `第 ${s.round} / 9 回合・${s.turn}隊決策・第 ${Math.ceil(s.round / 3)} 次評比`
      }
      steps={[
        "看四個街區三次公開價值，兩隊輪流布局。",
        "一手放1～2盞，或移1～2盞到別區；也可以等待。",
        "第3、6、9回合各評比一次，三次總分高者獲勝。",
      ]}
      demo={[
        "示範：河畔本次值4分，下次只值2分。A隊有1盞、B隊有2盞。",
        "A再放2盞後成為3對2，本次能拿4分，但預備花燈就少2盞。",
        "也可從河畔移到下次值5分的茶巷：這次讓分，下次爭取更高價值。",
      ]}
      rules={
        <>
          <p>
            四街區只在第3、6、9回合兩隊都完成行動後評比，其他回合不計分。一般與進階的三次街區價值都在開局全部公開。一般每隊8盞、價值固定；進階每隊6盞、價值隨開局產生，局中不再變動。
          </p>
          <ol>
            <li>
              每回合兩隊各行動一次。第1回合A先手，下一回合由上一回合後手先行，交替先後。
            </li>
            <li>
              一手可從預備區放1或2盞到一街區，或將同一街區的1或2盞自家花燈移到另一街區；也可等待。放置會減少預備花燈，街區花燈持續保留，回合結束與評比後都不會補充預備花燈。
            </li>
            <li>
              街區花燈較多者拿該次公開價值。雙方相同且不為0，各拿一半，無條件捨去；例如價值5分，兩隊各有2盞，評比時各得2分。都為0時，兩隊都不得分。
            </li>
            <li>
              每次評比保留街區花燈，清楚查看入帳分數後按繼續布局。第三次後按查看總結果。
            </li>
            <li>
              總分較高者獲勝，同分共同獲勝。不能移動對方花燈、原地移動或超用預備區。
            </li>
          </ol>
        </>
      }
      result={(s) => (
        <>
          <h3>
            {s.totals.A === s.totals.B
              ? "兩隊同分，共同獲勝"
              : `${s.totals.A > s.totals.B ? "A" : "B"}隊獲勝`}
          </h3>
          <p>
            ● A隊 {s.totals.A} 分　▲ B隊 {s.totals.B} 分
          </p>
          {s.history.map((h, i) => (
            <p key={i}>
              第{i + 1}次：A +{h.points.A} ／ B +{h.points.B}
            </p>
          ))}
        </>
      )}
    >
      {(c) => <LanternTable state={c.state} choose={c.choose} />}
    </TableGame>
  );
}
