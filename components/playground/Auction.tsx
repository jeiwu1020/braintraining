import React, { useState } from "react";
import { Modal } from "./Common";
import TableGame from "./TableGame";
import "./auction-artboard.css";
import {
  auctionEngine,
  AuctionState,
  AuctionAction,
  ExhibitKind,
  KIND_NAMES,
  exhibitionScore,
} from "../../games/playground/auction/rules";
export function ArtifactArt({ kind = "ceramic", id, name }: { kind?: ExhibitKind; id?: number; name?: string }) {
  const index=id??(kind==='ceramic'?0:kind==='bronze'?1:2);
  const [x,y,w,h]=[[0,0,384,512],[384,0,384,512],[768,0,480,512],[1248,0,288,512],[0,512,384,512],[384,512,420,512],[804,512,348,512],[1152,512,384,512]][index];
  return <svg className="tg-artifact" viewBox={`${x} ${y} ${w} ${h}`} role="img" aria-label={`${name||KIND_NAMES[kind]}展品插畫`}><defs><clipPath id={`auction-crop-${index}`}><rect x={x} y={y} width={w} height={h}/></clipPath></defs><image clipPath={`url(#auction-crop-${index})`} href="/assets/playground/auction/exhibits-atlas-v1.png" width="1536" height="1024"/></svg>;
}
export function AuctionArt() {
  return (
    <div className="tg-museum-cover">
      <ArtifactArt kind="ceramic" />
      <ArtifactArt kind="bronze" />
      <ArtifactArt kind="scroll" />
    </div>
  );
}
function AuctionTable({state:s,choose,confirmation}:{state:AuctionState;choose:(a:AuctionAction,l:string)=>void;confirmation?:React.ReactNode}) {
  const e=s.exhibits[s.lot],last=s.sales.at(-1);const [details,setDetails]=useState(false);
  return <div className="tg-auction-desk">
    <section className="tg-auction-collections">{(['A','B'] as const).map(t=>{const score=exhibitionScore(s.collections[t]);return <article className={s.turn===t?'tg-collection-active':''} key={t}><h2>{t}隊 <strong>{s.budgets[t]}枚</strong><span>{score.total}分</span></h2><p>陶{score.counts.ceramic} · 銅{score.counts.bronze} · 畫{score.counts.scroll} ／ {score.sets}套</p></article>;})}<button className="tg-auction-detail-toggle" onClick={()=>setDetails(true)}>成交明細</button></section>
    <section className="tg-auction-display pg-paper"><div className="tg-current-art"><ArtifactArt kind={e.kind} id={e.id} name={e.name}/><div><span>第{s.lot+1}件 · {KIND_NAMES[e.kind]}</span><h2>{e.name}</h2><b>{e.points}分</b></div></div>
      <div className="tg-auction-decision">{confirmation || (s.phase==='round_summary'?<><h3>{last?.owner?'本件成交':'本件流標'}</h3><p>{last?.owner?`${last.owner}隊取得，支付${last.price}枚`:'兩隊退出，無人付款'}</p><button className="pg-primary" onClick={()=>choose({type:'next'},s.lot===s.exhibits.length-1?'全部展品拍賣結束，查看展覽總分。':'下一件叫價從0開始，先叫價隊伍交換。')}>{s.lot===s.exhibits.length-1?'查看展覽總分':'下一件展品'}</button></>:<><h3>{s.leader?`${s.leader}隊最高`:'尚未叫價'} <strong>{s.price}枚</strong></h3><p>輪到{s.turn}隊 · 再加至 {s.price+1} 枚</p><div className="tg-action-grid"><button className="pg-primary" disabled={s.price+1>s.budgets[s.turn]} onClick={()=>choose({type:'bid'},`${s.turn}隊叫價${s.price+1}枚遊戲籌碼。若得標才付全額；被加價超過就不扣。`)}>加一枚籌碼</button><button onClick={()=>choose({type:'pass'},s.leader?`${s.turn}隊退出本件，${s.leader}隊將以${s.price}枚取得展品。`:`${s.turn}隊退出本件，之後不能再加入本件競價。`)}>退出本件</button></div>{s.price+1>s.budgets[s.turn]&&<p className="tg-budget-warning" role="status">預算不足，請退出本件。</p>}</>)}</div>
    </section>
    <section className="tg-auction-itinerary" aria-label="全部公開展品，依拍賣順序">{s.exhibits.map((x,i)=><article key={x.id} className={i===s.lot?'tg-itinerary-current':''}><b>{i+1}. {x.name}</b><span>{KIND_NAMES[x.kind]} · {x.points}分</span><small>{i<s.sales.length?s.sales[i].owner?`${s.sales[i].owner}隊 ${s.sales[i].price}枚`:'流標':i===s.lot?'正在競拍':'待拍'}</small></article>)}</section>
    <div className="tg-auction-footer"><p className="tg-desk-note">陶瓷＋銅器＋書畫，每套＋5分 · 剩餘籌碼不加分</p></div>
    {details&&<Modal title="展覽與成交明細" onClose={()=>setDetails(false)}>{(['A','B'] as const).map(t=>{const score=exhibitionScore(s.collections[t]);return <section key={t}><h3>{t}隊 {score.total}分：展品{score.base}＋套組{score.bonus}</h3><p>{s.collections[t].map(x=>`${x.name}（${x.points}分，${x.price}枚）`).join('、')||'尚未取得展品'}</p></section>;})}<p>全部都是遊戲籌碼，不涉及真錢。</p></Modal>}
  </div>;
}
export default function Auction({ onBack }: { onBack: () => void }) {
  return (
    <TableGame
      game="auction"
      engine={auctionEngine}
      onBack={onBack}
      art={<AuctionArt />}
      summary={(s) => `第 ${s.lot + 1} / ${s.exhibits.length} 件・${s.turn}隊決策・遊戲籌碼`}
      steps={[
        "先看全部展品、分數與兩隊剩餘遊戲籌碼。",
        "兩隊輪流把公開叫價加一枚，或退出本件。",
        "得標才付款；最後比展品分數加三類套組分數。",
      ]}
      demo={[
        "示範：A叫價3枚，B可加一枚到4枚，或退出。兩隊預算尚未扣除。",
        "B加到4枚後，A選退出：B取得展品並付4枚，A完全不扣籌碼。",
        "若這件補齊B的陶瓷、銅器、書畫套組，除展品分數外再加5分；也可保留籌碼競爭後面的高分展品。",
      ]}
      rules={
        <>
          <p>
            這是公開遊戲籌碼拍賣，不涉及真錢。一般6件展品、每隊18枚；進階8件、每隊22枚。全部展品、順序、類別與分數從開局就公開。
          </p>
          <ol>
            <li>
              每件從叫價0開始，兩隊輪流「加一枚籌碼」或「退出本件」。加一枚代表把目前最高叫價提高1，並非立即扣款。
            </li>
            <li>
              每次出價只把目前價格加1，不立即扣款；只能叫出不超過自己剩餘預算的價格。新最高方出現後，前一方的叫價自動失效；沒有私密出價。
            </li>
            <li>
              有人退出時，另一隊若已有最高叫價，就以該價取得展品，僅得標方支付最後價格的全額。例如A叫1、B叫2、A叫3、B退出，A付3枚，B不付款。若第一隊在尚未叫價時退出，另一隊可用1枚取得，或也退出讓本件流標。退出後本件不能再競標，要等下一件才能加入。
            </li>
            <li>
              成交或流標後明確查看結果，再按下一件；先叫價隊伍逐件交換。籌碼不補充，預算不足只能退出本件。
            </li>
            <li>
              最後將各自展品分數相加。每湊一套「陶瓷＋銅器＋書畫」加5分，同一件不能重複組套。剩餘籌碼不加分。
            </li>
            <li>
              展覽總分較高者獲勝，同分共同獲勝。兩隊可用公開資料討論，所有決策都先預選、再確認。
            </li>
          </ol>
        </>
      }
      result={(s) => {
        const a = exhibitionScore(s.collections.A),
          b = exhibitionScore(s.collections.B);
        return (
          <>
            <h3>
              {a.total === b.total
                ? "展覽同分，共同獲勝"
                : `${a.total > b.total ? "A" : "B"}隊展覽獲勝`}
            </h3>
            {(["A", "B"] as const).map((t) => {
              const v = t === "A" ? a : b;
              return (
                <p key={t}>
                  {t}隊 <b>{v.total}分</b>：展品{v.base}＋{v.sets}套×5分；剩
                  {s.budgets[t]}枚遊戲籌碼（不加分）。
                </p>
              );
            })}
          </>
        );
      }}
    >
      {(c) => <AuctionTable state={c.state} choose={c.choose} confirmation={c.confirmation} />}
    </TableGame>
  );
}
