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

function LanternTable({
  state: s,
  choose,
}: {
  state: LanternState;
  choose: (a: LanternAction, l: string) => void;
}) {
  const [kind, setKind] = useState<"place" | "move">("place");
  const [from, setFrom] = useState<number | null>(null);
  const [count, setCount] = useState<1 | 2>(1);
  const legal = legalLantern(s);
  const wave = Math.ceil(s.round / 3) - 1;
  const stepInWave = ((s.round - 1) % 3) + 1;
  const predicted = scoreDistricts(s.districts, s.values[wave]);
  const ownIdx = s.turn === "A" ? 0 : 1;
  const activeFrom =
    kind === "move" && from !== null && s.districts[from][ownIdx] >= 1 ? from : null;
  const allowed = (a: LanternAction) =>
    legal.some((x) => JSON.stringify(x) === JSON.stringify(a));

  return (
    <div className="ln-festival">
      <div className="ln-score-ribbon">
        <strong>
          ● A隊 {s.totals.A}分 <span>預備 {s.reserve.A}</span>
        </strong>
        <span>
          第 {wave + 1}/3 輪 · 本輪第 {stepInWave}/3 步後評比
        </span>
        <strong>
          ▲ B隊 {s.totals.B}分 <span>預備 {s.reserve.B}</span>
        </strong>
      </div>
      <section className="ln-street-board" aria-label="四街區花燈與三次公開價值">
        {s.districts.map(([a, b], idx) => {
          const ownCount = s.districts[idx][ownIdx];
          if (kind === "move" && activeFrom === null) {
            const canStart = s.phase === "playing" && ownCount >= 1;
            return (
              <button
                className={`ln-district ln-district-${idx}`}
                key={idx}
                aria-describedby={`ln-public-${idx}`}
                aria-label={`從${DISTRICTS[idx]}移出`}
                disabled={!canStart}
                onClick={() => {
                  setFrom(idx);
                  if (ownCount < count) setCount(1);
                }}
              >
                <span id={`ln-public-${idx}`} className="tg-announcement">
                  A隊{a}盞，B隊{b}盞。
                  {s.values.map((v, i) => `第${i + 1}次評比${v[idx]}分`).join("；")}。現在第{wave + 1}次評比。
                </span>
                <span className={`ln-district-art ln-atlas-${idx}`} aria-hidden="true" />
                <span className="ln-district-name">{DISTRICTS[idx]}</span>
                <span className="ln-team-counts">
                  <span className={a > b ? "ln-team-leading" : ""} aria-label={`A隊${a}盞`}>
                    ● A <b>{a}</b>
                  </span>
                  <span className={b > a ? "ln-team-leading" : ""} aria-label={`B隊${b}盞`}>
                    ▲ B <b>{b}</b>
                  </span>
                </span>
                <span className="ln-public-values">
                  {s.values.map((values, i) => (
                    <span
                      key={i}
                      className={wave === i ? "ln-value-current" : ""}
                      aria-label={`第${i + 1}次評比${values[idx]}分`}
                    >
                      <small>{i + 1}評</small>
                      <b>{values[idx]}</b>
                    </span>
                  ))}
                </span>
              </button>
            );
          }

          if (kind === "move" && activeFrom === idx) {
            return (
              <button
                className={`ln-district ln-district-${idx} ln-district-source`}
                key={idx}
                aria-describedby={`ln-public-${idx}`}
                aria-label={`取消起點${DISTRICTS[idx]}`}
                disabled={s.phase !== "playing"}
                onClick={() => setFrom(null)}
              >
                <span id={`ln-public-${idx}`} className="tg-announcement">
                  已選起點 {DISTRICTS[idx]}，點此取消重選。
                </span>
                <span className="ln-source-badge">已選起點</span>
                <span className={`ln-district-art ln-atlas-${idx}`} aria-hidden="true" />
                <span className="ln-district-name">{DISTRICTS[idx]}</span>
                <span className="ln-team-counts">
                  <span className={a > b ? "ln-team-leading" : ""} aria-label={`A隊${a}盞`}>
                    ● A <b>{a}</b>
                  </span>
                  <span className={b > a ? "ln-team-leading" : ""} aria-label={`B隊${b}盞`}>
                    ▲ B <b>{b}</b>
                  </span>
                </span>
                <span className="ln-public-values">
                  {s.values.map((values, i) => (
                    <span
                      key={i}
                      className={wave === i ? "ln-value-current" : ""}
                      aria-label={`第${i + 1}次評比${values[idx]}分`}
                    >
                      <small>{i + 1}評</small>
                      <b>{values[idx]}</b>
                    </span>
                  ))}
                </span>
              </button>
            );
          }

          const action: LanternAction =
            kind === "place"
              ? { type: "place", to: idx, count }
              : { type: "move", from: activeFrom!, to: idx, count };
          return (
            <button
              className={`ln-district ln-district-${idx}`}
              key={idx}
              aria-describedby={`ln-public-${idx}`}
              aria-label={`${kind === "place" ? "放置到" : "移動到"}${DISTRICTS[idx]}`}
              disabled={!allowed(action)}
              onClick={() => {
                choose(
                  action,
                  kind === "place"
                    ? `${s.turn}隊使用${count}盞預備花燈放到${DISTRICTS[idx]}。`
                    : `${s.turn}隊從${DISTRICTS[activeFrom!]}移${count}盞到${DISTRICTS[idx]}。`,
                );
                if (kind === "move") setFrom(null);
              }}
            >
              <span id={`ln-public-${idx}`} className="tg-announcement">
                A隊{a}盞，B隊{b}盞。
                {s.values.map((v, i) => `第${i + 1}次評比${v[idx]}分`).join("；")}。現在第{wave + 1}次評比。
              </span>
              <span className={`ln-district-art ln-atlas-${idx}`} aria-hidden="true" />
              <span className="ln-district-name">{DISTRICTS[idx]}</span>
              <span className="ln-team-counts">
                <span className={a > b ? "ln-team-leading" : ""} aria-label={`A隊${a}盞`}>
                  ● A <b>{a}</b>
                </span>
                <span className={b > a ? "ln-team-leading" : ""} aria-label={`B隊${b}盞`}>
                  ▲ B <b>{b}</b>
                </span>
              </span>
              <span className="ln-public-values">
                {s.values.map((values, i) => (
                  <span
                    key={i}
                    className={wave === i ? "ln-value-current" : ""}
                    aria-label={`第${i + 1}次評比${values[idx]}分`}
                  >
                    <small>{i + 1}評</small>
                    <b>{values[idx]}</b>
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </section>
      <aside className="ln-planning-desk" aria-label="花燈布局操作">
        {s.phase === "round_summary" ? (
          <div className="ln-evaluation">
            <strong>
              第 {s.round / 3}/3 輪計分{" "}
              <span>
                A +{s.history.at(-1)?.points.A ?? 0} · B +{s.history.at(-1)?.points.B ?? 0}
              </span>
            </strong>
            <span>花燈保留在場上，預備花燈不補充。</span>
            <button
              className="pg-primary"
              onClick={() =>
                choose(
                  { type: "next" },
                  s.round === 9
                    ? "三次評比已完成，查看最終總分。"
                    : "保留目前花燈，進入下一輪布局。",
                )
              }
            >
              {s.round === 9 ? "查看總結果" : "繼續布局"}
            </button>
          </div>
        ) : (
          <>
            <div className="ln-mode">
              <strong>{s.turn}隊布局</strong>
              <div className="pg-choice">
                <button
                  type="button"
                  aria-pressed={kind === "place"}
                  onClick={() => {
                    setKind("place");
                    setFrom(null);
                  }}
                >
                  放置
                </button>
                <button
                  type="button"
                  aria-pressed={kind === "move"}
                  onClick={() => {
                    setKind("move");
                    setFrom(null);
                  }}
                >
                  移動
                </button>
              </div>
            </div>
            <div className="ln-quantity">
              <span id="ln-count-label">本次盞數</span>
              <div className="pg-choice ln-count-choice" role="group" aria-labelledby="ln-count-label">
                <button type="button" aria-pressed={count === 1} onClick={() => setCount(1)}>
                  1 盞
                </button>
                <button type="button" aria-pressed={count === 2} onClick={() => setCount(2)}>
                  2 盞
                </button>
              </div>
            </div>
            {kind === "move" ? (
              activeFrom === null ? (
                <div className="ln-instruction">
                  <strong>1. 點一區（移動起點）↑</strong>
                  <span>選有本隊花燈的街區，再點目標</span>
                </div>
              ) : (
                <div className="ln-instruction">
                  <strong>2. 點目標街區 ↑（從{DISTRICTS[activeFrom]}）</strong>
                  <span>
                    <button
                      type="button"
                      className="ln-clear-from"
                      onClick={() => setFrom(null)}
                    >
                      重選起點
                    </button>
                  </span>
                </div>
              )
            ) : (
              <div className="ln-instruction">
                <strong>點街區放入花燈 ↑</strong>
                <span>領先全拿 · 平手平分</span>
              </div>
            )}
            <div className="ln-wait">
              <span
                className="ln-forecast"
                aria-label={`此刻評比：A隊${predicted.A}分，B隊${predicted.B}分`}
              >
                估 A{predicted.A} / B{predicted.B}
              </span>
              <button
                className="ln-pass"
                onClick={() =>
                  choose({ type: "pass" }, "保留資源與目前布局，等待一手。")
                }
              >
                等待布局
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export default function Lantern({ onBack }: { onBack: () => void }) {
  return (
    <TableGame
      game="lantern"
      engine={lanternEngine}
      onBack={onBack}
      art={<LanternArt />}
      summary={(s) =>
        `第 ${Math.ceil(s.round / 3)}/3 輪・本輪第 ${((s.round - 1) % 3) + 1}/3 步後評比・${s.turn}隊決策`
      }
      steps={[
        "看四個街區三輪公開價值（皆為偶數），兩隊輪流布局。",
        "點「1 盞／2 盞」，直接點街區放入；選「移動」先點起點再點目標。",
        "每 3 回合（第 3、6、9 回合末）評比一次，領先全拿、平手對半分。",
      ]}
      demo={[
        "示範：河畔本輪值 4 分，下一輪只值 2 分。A隊 1 盞、B隊 2 盞。",
        "A 放 2 盞變 3 對 2，本輪拿 4 分；若打成 2 對 2 平手則各得 2 分。",
        "改點「移動」→ 點河畔 → 點下一輪高分的街區，可把舊燈調走搶分！",
      ]}
      rules={
        <>
          <p>
            全場共 9 回合、分三輪（第 3、6、9 回合末評比一次）。四個街區三輪價值開局全公開，皆為偶數（2／4／6／8 分）；一般每隊 8 盞、進階每隊 6 盞，預備花燈不補充。
          </p>
          <ol>
            <li>每回合兩隊各行動 1 次；下一回合由上一回合後手先行動。</li>
            <li>可放 1～2 盞預備花燈到任一街區，或將己方同街區 1～2 盞移到別區，也可等待。</li>
            <li>評比時花燈較多的一隊拿該街區全分；雙方相同且至少 1 盞，剛好各拿一半！都有 0 盞則不得分。</li>
            <li>評比後場上花燈全數保留，三輪總分高者獲勝（同分共享勝利）。</li>
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
              第{i + 1}輪：A +{h.points.A} ／ B +{h.points.B}
            </p>
          ))}
        </>
      )}
    >
      {(c) => <LanternTable state={c.state} choose={c.choose} />}
    </TableGame>
  );
}
