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

export function ArtifactArt({
  kind = "ceramic",
  id,
  name,
}: {
  kind?: ExhibitKind;
  id?: number;
  name?: string;
}) {
  const index = id ?? (kind === "ceramic" ? 0 : kind === "bronze" ? 1 : 2);
  const [x, y, w, h] = [
    [0, 0, 384, 512],
    [384, 0, 384, 512],
    [768, 0, 480, 512],
    [1248, 0, 288, 512],
    [0, 512, 384, 512],
    [384, 512, 420, 512],
    [804, 512, 348, 512],
    [1152, 512, 384, 512],
  ][index];
  return (
    <svg
      className="tg-artifact"
      viewBox={`${x} ${y} ${w} ${h}`}
      role="img"
      aria-label={`${name || KIND_NAMES[kind]}展品插畫`}
    >
      <defs>
        <clipPath id={`auction-crop-${index}`}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <image
        clipPath={`url(#auction-crop-${index})`}
        href="/assets/playground/auction/exhibits-atlas-v1.png"
        width="1536"
        height="1024"
      />
    </svg>
  );
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

function AuctionTable({
  state: s,
  choose,
  confirmation,
}: {
  state: AuctionState;
  choose: (a: AuctionAction, l: string) => void;
  confirmation?: React.ReactNode;
}) {
  const e = s.exhibits[s.lot],
    last = s.sales.at(-1);
  const [details, setDetails] = useState(false);
  return (
    <div className="tg-auction-desk">
      <section className="tg-auction-collections">
        {(["A", "B"] as const).map((t) => {
          const score = exhibitionScore(s.collections[t], s.budgets[t]);
          return (
            <article
              className={s.turn === t ? "tg-collection-active" : ""}
              key={t}
            >
              <h2>
                {t}隊 <strong>{s.budgets[t]}枚</strong>
                <span>{score.total}分</span>
              </h2>
              <p>
                陶{score.counts.ceramic} · 銅{score.counts.bronze} · 畫
                {score.counts.scroll} ／ {score.sets}套（含餘幣+{score.chipBonus}）
              </p>
            </article>
          );
        })}
        <button
          className="tg-auction-detail-toggle"
          onClick={() => setDetails(true)}
        >
          成交明細
        </button>
      </section>
      <section className="tg-auction-display pg-paper">
        <div className="tg-current-art">
          <ArtifactArt kind={e.kind} id={e.id} name={e.name} />
          <div>
            <span>
              第{s.lot + 1}件 · {KIND_NAMES[e.kind]}
            </span>
            <h2>{e.name}</h2>
            <b>{e.points}分</b>
          </div>
        </div>
        <div className="tg-auction-decision">
          {confirmation ||
            (s.phase === "round_summary" ? (
              <>
                <h3>{last?.owner ? "本件成交" : "本件流標"}</h3>
                <p>
                  {last?.owner
                    ? `${last.owner}隊取得，支付${last.price}枚`
                    : "兩隊退出，無人付款"}
                </p>
                <button
                  className="pg-primary"
                  onClick={() =>
                    choose(
                      { type: "next" },
                      s.lot === s.exhibits.length - 1
                        ? "全部展品拍賣結束，查看展覽總分。"
                        : "下一件叫價從0開始，先叫價隊伍交換。",
                    )
                  }
                >
                  {s.lot === s.exhibits.length - 1
                    ? "查看展覽總分"
                    : "下一件展品"}
                </button>
              </>
            ) : (
              <>
                <h3>
                  {s.leader ? `${s.leader}隊最高` : "尚未叫價"}{" "}
                  <strong>{s.price}枚</strong>
                </h3>
                <p>
                  輪到{s.turn}隊（剩 {s.budgets[s.turn]} 枚）· 選加價幅度或退出
                </p>
                <div className="tg-action-grid tg-auction-bids">
                  {([1, 2, 3] as const).map((amt) => (
                    <button
                      key={amt}
                      className={amt === 1 ? "pg-primary" : ""}
                      disabled={s.price + amt > s.budgets[s.turn]}
                      onClick={() =>
                        choose(
                          amt === 1 ? { type: "bid" } : { type: "bid", amount: amt },
                          `${s.turn}隊叫價至${s.price + amt}枚遊戲籌碼（+${amt}）。得標才付全額；被加價超過就不扣。`,
                        )
                      }
                    >
                      +{amt} 枚
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      choose(
                        { type: "pass" },
                        s.leader
                          ? `${s.turn}隊退出本件，${s.leader}隊將以${s.price}枚取得展品。`
                          : `${s.turn}隊退出本件，之後不能再加入本件競價。`,
                      )
                    }
                  >
                    退出本件
                  </button>
                </div>
                {s.price + 1 > s.budgets[s.turn] && (
                  <p className="tg-budget-warning" role="status">
                    預算不足，請退出本件。
                  </p>
                )}
              </>
            ))}
        </div>
      </section>
      <section
        className="tg-auction-itinerary"
        aria-label="全部公開展品，依拍賣順序"
      >
        {s.exhibits.map((x, i) => (
          <article
            key={x.id}
            className={i === s.lot ? "tg-itinerary-current" : ""}
          >
            <b>
              {i + 1}. {x.name}
            </b>
            <span>
              {KIND_NAMES[x.kind]} · {x.points}分
            </span>
            <small>
              {i < s.sales.length
                ? s.sales[i].owner
                  ? `${s.sales[i].owner}隊 ${s.sales[i].price}枚`
                  : "流標"
                : i === s.lot
                  ? "正在競拍"
                  : "待拍"}
            </small>
          </article>
        ))}
      </section>
      <div className="tg-auction-footer">
        <p className="tg-desk-note">
          陶瓷＋銅器＋書畫，每套＋5分 · 每剩 3 枚籌碼＋1分
        </p>
      </div>
      {details && (
        <Modal title="展覽與成交明細" onClose={() => setDetails(false)}>
          {(["A", "B"] as const).map((t) => {
            const score = exhibitionScore(s.collections[t], s.budgets[t]);
            return (
              <section key={t}>
                <h3>
                  {t}隊 {score.total}分：展品{score.base}＋套組{score.bonus}＋餘幣{score.chipBonus}
                </h3>
                <p>
                  {s.collections[t]
                    .map((x) => `${x.name}（${x.points}分，${x.price}枚）`)
                    .join("、") || "尚未取得展品"}
                </p>
              </section>
            );
          })}
          <p>全部都是遊戲籌碼，不涉及真錢；每剩 3 枚籌碼在結算時＋1 分。</p>
        </Modal>
      )}
    </div>
  );
}

export default function Auction({ onBack }: { onBack: () => void }) {
  return (
    <TableGame
      game="auction"
      engine={auctionEngine}
      onBack={onBack}
      art={<AuctionArt />}
      summary={(s) =>
        `第 ${s.lot + 1} / ${s.exhibits.length} 件・${s.turn}隊決策・遊戲籌碼`
      }
      steps={[
        "全部展品順序、分數與兩隊籌碼皆公開，每剩 3 枚籌碼最後＋1 分。",
        "輪流點「+1 枚 / +2 枚 / +3 枚」快速加價，或選「退出本件」。",
        "只有得標方扣籌碼；最後合計展品分數、三類套組（+5分）與餘幣折分。",
      ]}
      demo={[
        "示範：現在最高 2 枚，輪到 A 隊可以直接點「+2 枚」喊到 4 枚，加速逼對手表態！",
        "若 B 隊覺得太貴選「退出本件」，A 隊才付 4 枚得標，B 隊一毛不扣。",
        "省下來的籌碼也不是沒用：每剩 3 枚就能在結算時＋1 分，省錢也能拼逆轉！",
      ]}
      rules={
        <>
          <p>
            這是公開遊戲籌碼拍賣，不涉及真錢。一般 6 件展品、每隊 18 枚；進階 8 件、每隊 22 枚。全部展品、順序與分數開局公開。
          </p>
          <ol>
            <li>
              每件從 0 開始，兩隊輪流選擇「+1 枚 / +2 枚 / +3 枚」或「退出本件」。不能超過己方剩餘籌碼，且必須高於目前最高價。
            </li>
            <li>
              只有得標方在成交時扣除最終金額，被超價或退出的一方完全不扣籌碼。
            </li>
            <li>
              先手在尚未叫價時直接退出，另一隊可直接加價（如 +1/+2/+3 枚）得標，或也退出讓本件流標。
            </li>
            <li>
              全部拍賣結束後計分：展品總分 ＋ 每套「陶瓷＋銅器＋書畫」5 分 ＋ 每剩 3 枚籌碼 1 分（無條件捨去）。最高分獲勝！
            </li>
          </ol>
        </>
      }
      result={(s) => {
        const a = exhibitionScore(s.collections.A, s.budgets.A),
          b = exhibitionScore(s.collections.B, s.budgets.B);
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
                  {t}隊 <b>{v.total}分</b>：展品{v.base}＋{v.sets}套×5分＋餘
                  {s.budgets[t]}枚折{v.chipBonus}分。
                </p>
              );
            })}
          </>
        );
      }}
    >
      {(c) => (
        <AuctionTable
          state={c.state}
          choose={c.choose}
          confirmation={c.confirmation}
        />
      )}
    </TableGame>
  );
}
