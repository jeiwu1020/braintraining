import React from "react";
import TableGame from "./TableGame";
import "./workshop-artboard.css";
import {
  workshopEngine,
  WorkshopState,
  WorkshopAction,
  STATIONS,
  STATION_NAMES,
  workshopError,
  craftableCount,
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
  wood: "取 2 份原料（上限 6）",
  metal: "取 3 份原料（上限 6）",
  craft: "2 原料 → 1 成品（一次全做）",
  upgrade: "2 原料 → 立刻 ＋4 分",
  ship: "賣出全部成品（每件 ＋6 分）",
};

function WorkshopTable({
  state: s,
  choose,
}: {
  state: WorkshopState;
  choose: (a: WorkshopAction, l: string) => void;
}) {
  const cur = s.stock[s.turn];
  const remainingDays = s.limit - s.round + (s.phase === "playing" ? 1 : 0);
  const canCraft = craftableCount(cur);

  const restButton = (
    <button
      className="wk-station wk-rest"
      aria-describedby="wk-rest-info"
      aria-label={
        s.phase === "round_summary"
          ? s.round === s.limit
            ? "查看總結果"
            : "下一工作日"
          : "安排休息"
      }
      onClick={() =>
        s.phase === "round_summary"
          ? choose(
              { type: "next" },
              s.round === s.limit
                ? "最後工作日已完成，查看總分。"
                : "進入下一工作日，清空工作站並補回工匠。",
            )
          : choose(
              { type: "rest" },
              cur.materials < 6
                ? "安排 1 位工匠休息（不占站），領取 ＋1 原料。"
                : "安排 1 位工匠休息（不占站，原料已滿 6）。",
            )
      }
    >
      <svg
        className="wk-station-art"
        viewBox="1024 512 512 512"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="wk-crop-rest">
            <rect x="1024" y="512" width="512" height="512" />
          </clipPath>
        </defs>
        <image
          clipPath="url(#wk-crop-rest)"
          href="/assets/playground/workshop/stations-atlas-v1.png"
          width="1536"
          height="1024"
        />
      </svg>
      <b>{s.phase === "round_summary" ? "今日完成" : "休息區"}</b>
      <span className="wk-recipe" id="wk-rest-info">
        {s.phase === "round_summary" ? (
          "庫存保留 · 隔日換先手"
        ) : (
          <>
            ＋1 原料（不占站）
            <br />
            上限 6 份
          </>
        )}
      </span>
      <small>
        {s.phase === "round_summary"
          ? s.round === s.limit
            ? "查看總結果"
            : "下一工作日"
          : cur.materials < 6
            ? "休息 · ＋1原料"
            : "休息（原料已滿）"}
      </small>
    </button>
  );

  return (
    <div className="tg-workshop-desk">
      <section className="tg-workshop-ledger pg-paper">
        <table aria-label="兩隊工坊庫存與工匠">
          <thead>
            <tr>
              <th>庫存</th>
              {(["A", "B"] as const).map((t) => (
                <th
                  key={t}
                  className={s.turn === t ? "tg-ledger-active" : ""}
                >
                  {t}隊{s.turn === t ? " ◀" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["materials", "原料", "/6"],
                ["goods", "成品", "/4"],
                ["workers", "工匠", ""],
                ["score", "分數", ""],
              ] as const
            ).map(([key, name, max]) => (
              <tr key={key}>
                <th>{name}</th>
                {(["A", "B"] as const).map((t) => (
                  <td
                    key={t}
                    className={s.turn === t ? "tg-ledger-active" : ""}
                  >
                    {key === "workers" ? s.workers[t] : s.stock[t][key]}
                    {max}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="tg-workshop-options">
        <b>
          {s.phase === "round_summary"
            ? "工作日結算"
            : `輪到 ${s.turn} 隊 · 直接點工作站派工`}
        </b>
      </div>
      <div className="tg-station-table" aria-label="五個共用工作站與休息區">
        {STATIONS.map((st, i) => {
          const action: WorkshopAction = { type: "use", station: st },
            error = workshopError(s, action),
            occupied = s.occupied[st];
          const liveActionLabel =
            st === "craft" && canCraft > 0
              ? `派工 · 做 ${canCraft} 件`
              : st === "ship" && cur.goods > 0
                ? `出貨 · ＋${cur.goods * 6} 分`
                : "點此派工";
          const confirmSummary =
            st === "craft"
              ? `將 ${canCraft * 2} 份原料一次做成 ${canCraft} 件成品。`
              : st === "ship"
                ? `賣出全部 ${cur.goods} 件成品，立刻得 ${cur.goods * 6} 分。`
                : info[st];

          return (
            <button
              key={st}
              className={`wk-station ${occupied ? "wk-station-used" : ""}`}
              aria-label={`使用${STATION_NAMES[st]}`}
              aria-describedby={`wk-info-${st} wk-status-${st} wk-cost-${st}`}
              title={error || info[st]}
              disabled={!!error}
              onClick={() =>
                choose(
                  action,
                  `${s.turn}隊派工匠到${STATION_NAMES[st]}：${confirmSummary}`,
                )
              }
            >
              <svg
                className="wk-station-art"
                viewBox={`${(i % 3) * 512} ${Math.floor(i / 3) * 512} 512 512`}
                aria-hidden="true"
              >
                <defs>
                  <clipPath id={`wk-crop-${st}`}>
                    <rect
                      x={(i % 3) * 512}
                      y={Math.floor(i / 3) * 512}
                      width="512"
                      height="512"
                    />
                  </clipPath>
                </defs>
                <image
                  clipPath={`url(#wk-crop-${st})`}
                  href="/assets/playground/workshop/stations-atlas-v1.png"
                  width="1536"
                  height="1024"
                />
              </svg>
              <b>{STATION_NAMES[st]}</b>
              <span id={`wk-info-${st}`} className="wk-recipe">
                {
                  {
                    wood: (
                      <>
                        取 2 原料
                        <br />
                        （穩拿補給）
                      </>
                    ),
                    metal: (
                      <>
                        取 3 原料
                        <br />
                        （搶先高產）
                      </>
                    ),
                    craft: (
                      <>
                        每 2 原料→1 成品
                        <br />
                        一鍵全做
                      </>
                    ),
                    upgrade: (
                      <>
                        2 原料→＋4 分
                        <br />
                        （急單直出）
                      </>
                    ),
                    ship: (
                      <>
                        賣全部成品
                        <br />
                        每件 ＋6 分
                      </>
                    ),
                  }[st]
                }
              </span>
              <span className="sr-only" id={`wk-cost-${st}`}>
                每次使用 1 位工匠。{error || "可以派工。"}
              </span>
              <small
                id={`wk-status-${st}`}
                className={occupied ? "wk-occupied" : ""}
              >
                {occupied
                  ? `${occupied}隊已占用`
                  : error
                    ? "條件不足"
                    : liveActionLabel}
              </small>
            </button>
          );
        })}
        {restButton}
      </div>
      <p className="tg-desk-note">
        {s.phase === "playing" ? "含今日剩" : "剩餘"} {remainingDays} 日 ·
        五個工作站每天各限 1 隊使用 · 最後只比累積分數，剩餘原料與成品不計分
      </p>
    </div>
  );
}

export default function Workshop({ onBack }: { onBack: () => void }) {
  return (
    <TableGame
      game="workshop"
      engine={workshopEngine}
      onBack={onBack}
      art={<WorkshopArt />}
      summary={(s) =>
        `第 ${s.round} / ${s.limit} 日・輪到 ${s.turn}隊・五站共用`
      }
      steps={[
        "用單一「原料」管理工坊：去林場（＋2）或大料倉（＋3）拿原料，最多囤 6 份。",
        "去加工臺一次把原料全做成成品（2 原料→1 成品），再去出貨埠一口氣賣掉（每件＋6 分）！",
        "共用站被搶走時，也能搶「急單櫃」（2 原料立刻＋4 分）或去「休息區」（＋1 原料、不占站）。",
      ]}
      demo={[
        "示範：第 1 手先搶「大料倉」拿 3 份原料（共有 4 份），下一手進「加工臺」能直接做成 2 件成品！",
        "若對手搶先占走加工臺或出貨埠，改走「急單櫃」立刻把 2 份原料變 ＋4 分，完全不卡手！",
        "進階模式每天每隊有 3 位工匠（合計 6 人），五個站一定不夠分，早點卡位或利用休息區＋1 原料很關鍵。",
      ]}
      rules={
        <>
          <p>
            兩隊各經營一間工坊，共用 5 個工作站。每站每天兩隊合計只能使用 1 次，先搶先贏！一般 4 個工作日、每日每隊 2 位工匠；進階 5 個工作日、每日每隊 3 位工匠。
          </p>
          <ol>
            <li>每天交換先手；輪流派 1 位工匠點選工作站或休息區。</li>
            <li>
              <strong>林場／大料倉</strong>：分別拿 ＋2 / ＋3 原料（原料上限 6）。
            </li>
            <li>
              <strong>加工臺</strong>：自動把手上原料盡量做成成品（每 2 原料→1 成品，成品上限 4）。
            </li>
            <li>
              <strong>急單櫃</strong>：立刻花 2 原料直接獲得 ＋4 分（不經過成品、不用搶出貨）。
            </li>
            <li>
              <strong>出貨埠</strong>：一次賣出全部成品，每件獲得 ＋6 分！
            </li>
            <li>
              <strong>休息區</strong>：不占工作站，讓工匠領 ＋1 原料（原料已滿 6 時仍可休息推進）。最後比較總分，剩餘原料與成品不計分。
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
              {t}隊總分 <b>{s.stock[t].score}</b>；剩原料{" "}
              {s.stock[t].materials}、成品 {s.stock[t].goods}（不另計分）
            </p>
          ))}
        </>
      )}
    >
      {(c) => <WorkshopTable state={c.state} choose={c.choose} />}
    </TableGame>
  );
}
