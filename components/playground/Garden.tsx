import React, { useEffect, useMemo, useState } from "react";
import TableGame from "./TableGame";
import "./garden-artboard.css";
import { Modal } from "./Common";
import {
  gardenEngine,
  GardenState,
  GardenAction,
  Terrain,
  rotated,
  placementError,
  placements,
  scoreGarden,
  applyGarden,
  createGarden,
} from "../../games/playground/garden/rules";
export function TerrainMark({ kind }: { kind: Terrain }) {
  const [x,y]=kind==='rose'?[0,0]:kind==='gold'?[627,0]:[0,627];
  return <svg className={`gdn-terrain gdn-${kind}`} width="44" height="44" viewBox={`${x} ${y} 627 627`} aria-hidden="true"><image href="/assets/playground/garden/terrain-atlas-v1.png" width="1254" height="1254"/></svg>;
}
function MiniTile({ tile, rotation = 0 }: { tile: any; rotation?: number }) {
  const cells = rotated(tile, rotation);
  return (
    <div
      className="tg-mini-tile"
      style={{
        gridTemplateColumns: `repeat(${Math.max(...cells.map((c) => c.x)) + 1},var(--tile-cell, 28px))`,
      }}
    >
      {cells.map((c, i) => (
        <div key={i} style={{ gridColumn: c.x + 1, gridRow: c.y + 1 }}>
          <TerrainMark kind={c.kind} />
        </div>
      ))}
    </div>
  );
}
export function GardenArt() {
  return (
    <svg
      viewBox="0 0 500 280"
      className="tg-theme-art"
      aria-label="手繪庭園：花圃與石板小徑"
      role="img"
    >
      <rect
        x="6"
        y="6"
        width="488"
        height="268"
        rx="28"
        fill="#e5e0bf"
        stroke="#a99a65"
        strokeWidth="5"
      />
      <path
        d="M-5 180q110-130 225-35t285-30"
        fill="none"
        stroke="#b5a27b"
        strokeWidth="42"
      />
      <path
        d="M-5 180q110-130 225-35t285-30"
        fill="none"
        stroke="#ded0a8"
        strokeWidth="31"
        strokeDasharray="26 5"
      />
      {[
        [90, 70],
        [170, 85],
        [330, 215],
        [405, 190],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse rx="55" ry="30" fill="#83976b" />
          {[-20, 0, 20].map((v, j) => (
            <g key={j} transform={`translate(${v - 20} -32) scale(1.2)`}>
              <TerrainMark kind={i % 2 ? "gold" : "rose"} />
            </g>
          ))}
        </g>
      ))}
      <path d="M20 250h460" stroke="#917957" strokeWidth="3" />
      <text
        x="250"
        y="260"
        textAnchor="middle"
        fill="#4c654a"
        fontSize="18"
        letterSpacing="5"
      >
        春・夏・秋・冬
      </text>
    </svg>
  );
}
function GardenTable({ state: s, choose }: { state: GardenState; choose: (a: GardenAction, l: string) => void }) {
  const [slot,setSlot]=useState(0),[rotation,setRotation]=useState(0),[anchor,setAnchor]=useState<{x:number;y:number}|null>(null),[compare,setCompare]=useState(false),[coords,setCoords]=useState(false);
  useEffect(()=>{setSlot(0);setRotation(0);setAnchor(null);},[s.ply]);
  const all=useMemo(()=>placements(s),[s]);
  const action:Extract<GardenAction,{type:'place'}>|null=anchor?{type:'place',slot,rotation,...anchor}:null;
  const error=action?placementError(s,action):'② 點花園，選擇落點';
  const scores={A:scoreGarden(s.boards.A,s.size),B:scoreGarden(s.boards.B,s.size)};
  const other=s.turn==='A'?'B':'A';
  const ghost=anchor?rotated(s.market[slot],rotation).map(c=>({...c,x:c.x+anchor.x,y:c.y+anchor.y})):[];
  const board=(team:'A'|'B',active:boolean)=><section className={`tg-garden-block ${active?'tg-garden-active':'tg-garden-other'}`} key={team}>
    <div className="tg-garden-caption"><h2>{team}隊花園 <strong>{scores[team].total}分</strong></h2><span>{team===s.turn?'本手造園':'對手花園'}</span></div>
    <p className="tg-garden-tally">花圃 {scores[team].flowers} ＋ 步道 {scores[team].paths} − 空洞 {scores[team].penalty}</p>
    <div className="tg-grid-wrap"><div className="tg-coordinate-board" data-board-team={team} style={{'--garden-size':s.size} as React.CSSProperties}>
      <span/>{Array.from({length:s.size},(_,i)=><b key={i}>{String.fromCharCode(65+i)}</b>)}
      {Array.from({length:s.size},(_,y)=><React.Fragment key={y}><b className={y===Math.floor(s.size/2)?'gdn-entry-row':''} title={y===Math.floor(s.size/2)?'入口位於本列A欄':undefined}>{y+1}</b>{Array.from({length:s.size},(_,x)=>{
        const kind=s.boards[team][y*s.size+x],preview=active?ghost.find(c=>c.x===x&&c.y===y):null;
        const valid=active&&!placementError(s,{type:'place',slot,rotation,x,y});
        const inside=kind||preview?<TerrainMark kind={kind||preview!.kind}/>:x===0&&y===Math.floor(s.size/2)?<span className="tg-entry">入口</span>:null;
        return active?<button key={x} className={`tg-garden-cell ${preview?'tg-ghost':''} ${preview&&error?'tg-invalid-ghost':''}`} data-valid-anchor={valid} data-terrain={kind||preview?.kind||''} aria-pressed={anchor?.x===x&&anchor?.y===y} aria-label={`${String.fromCharCode(65+x)}${y+1}，${kind?{rose:'玫瑰',gold:'金菊',path:'步道'}[kind]:valid?'可放':'此方向不可放'}`} onClick={()=>setAnchor({x,y})}>{inside}</button>:<div className="tg-garden-cell" data-terrain={kind||''} key={x}>{inside}</div>;
      })}</React.Fragment>)}
    </div></div>
  </section>;
  return <div className="tg-garden-desk">
    {board(s.turn,true)}
    <aside className="tg-garden-tools pg-paper" aria-label="造園工作檯">
      <div className="tg-market-title"><b>① 選地形</b><span>本隊 {Math.floor(s.ply/2)+1}/{s.limit/2} 塊</span></div>
      <div className="tg-tile-market">{s.market.map((tile,i)=><button key={i} aria-label={`選地形${i+1}`} aria-pressed={slot===i} data-tile-available={all.some(a=>a.slot===i)} onClick={()=>{setSlot(i);setAnchor(null);}}><b>{slot===i?'✓ ':''}{i+1}</b><MiniTile tile={tile} rotation={slot===i?rotation:0}/>{!all.some(a=>a.slot===i)&&<small>無落點</small>}</button>)}</div>
      <div className="gdn-placement-guide"><b>{error||`② ${String.fromCharCode(65+anchor!.x)}${anchor!.y+1} 可放`}</b><span>{rotation*90}°</span></div>
      <div className="gdn-main-actions"><button onClick={()=>{setRotation((rotation+1)%4);setAnchor(null);}}>旋轉90°</button>
        {all.length===0?<button className="pg-primary" onClick={()=>choose({type:'discard'},'三塊地形都沒有合法落點，本手略過。')}>本手略過</button>:<button className="pg-primary" disabled={!action||!!error} onClick={()=>{if(action){const n=applyGarden(s,action);choose(action,`${s.turn}隊放置地形${slot+1}，方向${rotation*90}°，左上角 ${String.fromCharCode(65+anchor!.x)}${anchor!.y+1}。暫計 ${scoreGarden(n.boards[s.turn],s.size).total} 分。`);}}}>預覽放置</button>}<button className="gdn-coordinates-toggle" onClick={()=>setCoords(true)}>座標</button></div>
      <span className="sr-only" role="status">{error||`③ ${String.fromCharCode(65+anchor!.x)}${anchor!.y+1} 可放 · 虛線為預覽`}</span>
      <div className="tg-garden-comparison"><span>A隊 <b>{scores.A.total}</b> 分 · B隊 <b>{scores.B.total}</b> 分</span><button onClick={()=>setCompare(true)}>對照花園</button></div>
    </aside>
    <div className="tg-opponent-desktop">{board(other,false)}</div>
    <p className="tg-desk-note">花圃≥3格、入口步道：每格2分 · 封閉空洞：每格−3分</p>
    {coords&&<Modal title="座標輔助選擇" onClose={()=>setCoords(false)}><p>也可直接點花園空格選落點。座標是地形左上角。</p><div className="tg-coordinate-input">
        <label>欄<select aria-label="落點欄" value={anchor?.x??''} onChange={e=>setAnchor({x:Number(e.target.value),y:anchor?.y??0})}><option value="" disabled>選欄</option>{Array.from({length:s.size},(_,x)=><option key={x} value={x}>{String.fromCharCode(65+x)}</option>)}</select></label>
        <label>列<select aria-label="落點列" value={anchor?.y??''} onChange={e=>setAnchor({x:anchor?.x??0,y:Number(e.target.value)})}><option value="" disabled>選列</option>{Array.from({length:s.size},(_,y)=><option key={y} value={y}>{y+1}</option>)}</select></label>
</div><button className="pg-primary" onClick={()=>setCoords(false)}>回到花園</button></Modal>}
    {compare&&<Modal title="兩隊花園對照" onClose={()=>setCompare(false)}><div className="tg-compare-gardens">{board(s.turn,false)}{board(other,false)}</div></Modal>}
  </div>;
}
function GardenLesson(){
  const [s,setState]=useState(()=>createGarden(7,'normal','A')),[rotation,setRotation]=useState(0),[placed,setPlaced]=useState(false);
  const move=placements(s).find(a=>a.slot===0&&a.rotation===rotation)!;
  const before=scoreGarden(s.boards.A,s.size);
  return <section className="tg-demo tg-real-lesson"><h3>操作練習：旋轉後放入花園</h3><p>與正式局相同的地形與計分。綠框表示這次的合法落點。</p><div className="tg-lesson-garden"><div className="tg-lesson-grid">{s.boards.A.map((kind,i)=>{const ghost=!placed&&move&&rotated(s.market[0],rotation).find(c=>c.x+move.x===i%s.size&&c.y+move.y===Math.floor(i/s.size));return <div className={ghost?'tg-lesson-ghost':''} key={i}>{kind||ghost?<TerrainMark kind={kind||ghost!.kind}/>:null}</div>;})}</div><div><MiniTile tile={s.market[0]} rotation={rotation}/><p aria-live="polite">方向 {rotation*90}° · A隊 {before.total}分</p>{!placed?<><button onClick={()=>setRotation((rotation+1)%4)}>試轉90°</button><button disabled={!move} onClick={()=>{setState(applyGarden(s,move));setPlaced(true);}}>放入標示位置</button></>:<><p>地形已落下，得分由正式規則計算。現在輪到B隊。</p><button onClick={()=>{setState(createGarden(7,'normal','A'));setPlaced(false);setRotation(0);}}>再練一次</button></>}</div></div></section>;
}
export default function Garden({ onBack }: { onBack: () => void }) {
  return (
    <TableGame
      game="garden"
      engine={gardenEngine}
      onBack={onBack}
      art={<GardenArt />}
      tutorial={<GardenLesson />}
      summary={(s) =>
        `兩隊造園・第 ${Math.min(s.ply + 1, s.limit)} / ${s.limit} 手・輪到 ${s.turn} 隊`
      }
      steps={[
        "從三塊公開地形板選一塊，決定旋轉方向。",
        "點花園座標預覽，再確認；新板至少一邊接原有花園。",
        "比較兩隊花圃、入口步道與空洞，最後總分高者獲勝。",
      ]}
      demo={[
        "示範：選一塊有兩格玫瑰的地形，準備接在現有一格玫瑰旁。",
        "同色連成3格花圃，花圃分數由逐格1分變成每格2分，共6分。",
        "旋轉90°後可保留步道連接入口；花圃與步道都能得分，選擇不只一種。",
      ]}
      rules={
        <>
          <p>
            一般使用5×5花園，每隊選6塊；進階6×6，每隊選8塊。A隊先手，之後輪流。沒有私密資訊。
          </p>
          <ol>
            <li>
              每手從三塊公開地形選一塊，可旋轉0／90／180／270度，不可鏡射。確認落點後補上一塊。
            </li>
            <li>
              第一塊可放任何合法位置，之後至少一格與原有地形上下左右相鄰；不能超出邊界或覆蓋地形。座標是旋轉後外框左上角。
            </li>
            <li>
              同色花格上下左右連成花圃。每群達3格，每格2分；不足3格每格1分。玫瑰與金菊分開計算。
            </li>
            <li>
              步道每格1分；連通左側中間「入口」格的整群步道每格2分。步道格相鄰就視為連接。
            </li>
            <li>
              從空格沿上下左右相連的空格走，整片空白區都無法通到花園邊界，才算封閉空洞，每格扣3分。只要這片空白區有一格通到邊界，整片都不扣分；斜角相接不算連通。
            </li>
            <li>
              三塊板的所有方向都沒有落點時才可略過本手。最後一手後以花圃＋步道−空洞扣分決勝，同分共同獲勝。畫面隨時顯示暫計分。
            </li>
          </ol>
          <p>計分例：8格相連金菊得16分，2格連通入口的步道得4分，另有1格封閉空洞扣3分，合計16＋4−3＝17分。</p>
        </>
      }
      result={(s) => (
        <>
          {(["A", "B"] as const).map((t) => {
            const v = scoreGarden(s.boards[t], s.size);
            return (
              <p key={t}>
                <b>
                  {t}隊 {v.total} 分
                </b>
                ：花圃 {v.flowers} ＋ 步道 {v.paths} − 空洞 {v.penalty}（
                {v.holes}格）
              </p>
            );
          })}
          <h3>
            {scoreGarden(s.boards.A, s.size).total ===
            scoreGarden(s.boards.B, s.size).total
              ? "兩隊同分，共同獲勝"
              : `${scoreGarden(s.boards.A, s.size).total > scoreGarden(s.boards.B, s.size).total ? "A" : "B"}隊獲勝`}
          </h3>
        </>
      )}
    >
      {(c) => <GardenTable state={c.state} choose={c.choose} />}
    </TableGame>
  );
}
