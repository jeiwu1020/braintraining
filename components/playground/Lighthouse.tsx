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

const PORT_POSITION = [
  [13, 45],
  [38, 30],
  [87, 45],
  [63, 63],
];

function SupplyBoat() {
  return (
    <svg viewBox="0 0 90 64" className="lh-supply-boat" aria-hidden="true">
      <path
        d="M7 45q37 15 75-2l-13 15H22z"
        fill="#db9b55"
        stroke="#f2d7a0"
        strokeWidth="2"
      />
      <path d="M29 43V27h27v17" fill="#efe3bf" />
      <path d="M25 27 42 18 61 27" fill="#b16f50" />
      <path
        d="M51 25V8M50 9l18 6-18 6"
        fill="#d8d5ae"
        stroke="#cfb989"
        strokeWidth="2"
      />
      <path
        d="M9 61q15-5 28 0t27 0t22-1"
        fill="none"
        stroke="#a9d3cc"
        strokeWidth="2"
      />
      <rect x="34" y="31" width="9" height="8" rx="1" fill="#2a5863" />
      <path d="M58 42V33h12v9" fill="#91784c" />
    </svg>
  );
}

function NavigationChart({
  state: s,
  choose,
}: {
  state: LighthouseState;
  choose?: (a: LighthouseAction, label: string) => void;
}) {
  const legal = legalLighthouse(s);
  return (
    <div
      className="tg-navigation-chart lh-island-chart"
      aria-label="完整航線與三座燈塔需求"
    >
      <svg
        className="tg-route-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="chart-waves"
            width="15"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M2 8q3-2 6 0t6 0"
              fill="none"
              stroke="#c3d5bd"
              strokeOpacity=".12"
              strokeWidth=".3"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#chart-waves)" />
        {ROUTES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={PORT_POSITION[a][0]}
            y1={PORT_POSITION[a][1]}
            x2={PORT_POSITION[b][0]}
            y2={PORT_POSITION[b][1]}
            stroke={a === 2 || b === 2 ? "#e9bf79" : "#c8ddd1"}
            strokeWidth=".5"
            strokeDasharray="1.3 1.2"
            opacity=".7"
          />
        ))}
      </svg>
      <span className="lh-chart-compass" aria-hidden="true">
        ✧<small>N</small>
      </span>
      {PORTS.map((name, to) => {
        const available = legal.some((a) => a.type === "sail" && a.to === to),
          current = s.at === to;
        const connected = ROUTES.some(
          ([a, b]) => (a === s.at && b === to) || (b === s.at && a === to),
        );
        const need = s.needs[to],
          completed = to > 0 && need[0] + need[1] === 0;
        const cost = sailCost(s, to);
        return (
          <button
            key={name}
            className={`lh-island lh-island-${to} ${current ? "lh-island-current" : ""} ${completed ? "lh-island-complete" : ""}`}
            disabled={!choose || !available}
            aria-label={`${name} · ${cost} 行動${need[0] + need[1] > 4 ? " · 需求超過4箱，須分批補給" : ""}`}
            onClick={() =>
              choose?.(
                { type: "sail", to },
                `航向${name}（花費 ${cost} 行動）${to > 0 && s.cargo[0] + s.cargo[1] > 0 ? "，抵達自動卸貨。" : "。"}`,
              )
            }
          >
            <span
              className={`lh-island-art lh-atlas-${to}`}
              aria-hidden="true"
            />
            {current && (
              <span className="lh-moored">
                <SupplyBoat />
                <b>停靠</b>
              </span>
            )}
            <span className="lh-island-label">
              <strong>{name.replace("燈塔", "")}</strong>
              <span>
                {to === 0
                  ? "補給出發地"
                  : completed
                    ? "✓ 補給完成"
                    : `燈油 ${need[0]} · 糧食 ${need[1]}`}
              </span>
            </span>
            <span className="lh-island-status">
              {current
                ? "船在這裡"
                : s.phase !== "playing"
                  ? "今日已完成"
                  : available
                    ? cost === 2
                      ? "風浪 2 行動"
                      : "航行 1 行動"
                    : connected
                      ? `需 ${cost} 行動`
                      : "無直達航線"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Voyage({
  state: s,
  choose,
}: {
  state: LighthouseState;
  choose: (a: LighthouseAction, l: string) => void;
}) {
  const [fuel, setFuel] = useState(1);
  const [food, setFood] = useState(1);
  const freeSpace = Math.max(0, 4 - (s.cargo[0] + s.cargo[1]));
  const legal = legalLighthouse(s);
  const completed = s.needs.slice(1).filter((n) => n[0] + n[1] === 0).length;
  const allowed = (a: LighthouseAction) =>
    legal.some((x) => JSON.stringify(x) === JSON.stringify(a));

  const adjustFuel = (delta: number) => {
    setFuel((prev) => Math.max(0, Math.min(4, prev + delta)));
  };
  const adjustFood = (delta: number) => {
    setFood((prev) => Math.max(0, Math.min(4, prev + delta)));
  };

  return (
    <div className="lh-voyage">
      <div className="lh-weather-log" aria-label="公開海況與補給期限">
        <div>
          <b>今日 {s.weather[s.round - 1] ? "風浪 ≋" : "平穩 ～"}</b>
          <span>
            明日{" "}
            {s.round === s.limit
              ? "期限到期"
              : s.weather[s.round]
                ? "風浪 ≋"
                : "平穩 ～"}
          </span>
        </div>
        <span className="lh-route-key">遠岬風浪 2 行動 · 抵達自動交貨</span>
        <strong>補給 {completed} / 3塔</strong>
      </div>
      <NavigationChart state={s} choose={choose} />
      <aside className="lh-ship-deck" aria-label="補給船與當下可用行動">
        <div className="lh-cargo-manifest">
          <strong>
            船艙 <b>{s.cargo[0] + s.cargo[1]}</b>
            <small> / 4</small>
          </strong>
          <span aria-label={`燈油 ${s.cargo[0]}、糧食 ${s.cargo[1]}`}>
            燈油 {s.cargo[0]} · 糧食 {s.cargo[1]}
          </span>
          <span className="lh-ready">剩 {s.ap} 行動</span>
        </div>
        {s.phase === "round_summary" ? (
          <div className="lh-dock-task lh-day-end">
            <strong>今日航程完成</strong>
            <span>討論好明日方向，再繼續出發。</span>
            <button
              className="pg-primary"
              aria-label="下一回合"
              onClick={() =>
                choose({ type: "next" }, "進入下一回合，今日海況將更新。")
              }
            >
              下一回合 →
            </button>
          </div>
        ) : (
          <>
            {s.at === 0 ? (
              <div className="lh-dock-task">
                <strong>
                  母港裝貨 <small>剩餘空間 {freeSpace} 箱 · 耗 1 行動</small>
                </strong>
                <div className="lh-load-order">
                  <div className="lh-stepper">
                    <span>燈油</span>
                    <button
                      type="button"
                      aria-label="減少燈油"
                      disabled={fuel <= 0}
                      onClick={() => adjustFuel(-1)}
                    >
                      −
                    </button>
                    <b data-testid="load-fuel">{fuel}</b>
                    <button
                      type="button"
                      aria-label="增加燈油"
                      disabled={fuel + food >= freeSpace}
                      onClick={() => adjustFuel(1)}
                    >
                      ＋
                    </button>
                  </div>
                  <div className="lh-stepper">
                    <span>糧食</span>
                    <button
                      type="button"
                      aria-label="減少糧食"
                      disabled={food <= 0}
                      onClick={() => adjustFood(-1)}
                    >
                      −
                    </button>
                    <b data-testid="load-food">{food}</b>
                    <button
                      type="button"
                      aria-label="增加糧食"
                      disabled={fuel + food >= freeSpace}
                      onClick={() => adjustFood(1)}
                    >
                      ＋
                    </button>
                  </div>
                  <button
                    className="pg-primary"
                    aria-label="裝入目前貨單"
                    disabled={!allowed({ type: "load", fuel, food })}
                    onClick={() =>
                      choose(
                        { type: "load", fuel, food },
                        `裝入燈油 ${fuel}、糧食 ${food}，花費 1 行動。`,
                      )
                    }
                  >
                    裝入船艙
                  </button>
                </div>
              </div>
            ) : (
              <div className="lh-dock-task lh-unload-task">
                <strong>
                  停靠{PORTS[s.at].replace("燈塔", "")}
                  <small>抵達時已自動交貨</small>
                </strong>
                <div>
                  <span>
                    {s.needs[s.at][0] + s.needs[s.at][1] === 0
                      ? "✓ 本座燈塔已全部完成！點海圖直接航向下一站。"
                      : `尚需 燈油 ${s.needs[s.at][0]} · 糧食 ${s.needs[s.at][1]}，點海圖航向鄰港或回母港補貨。`}
                  </span>
                </div>
              </div>
            )}
            <div className="lh-deck-secondary">
              <span>航行點擊上方海圖</span>
              <div>
                <button
                  onClick={() =>
                    choose({ type: "wait" }, "原地等待，結束這 1 行動。")
                  }
                >
                  等待 1 行動
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function LighthouseLesson() {
  const [s, setState] = useState(() => createLighthouse(7, "normal", "A"));
  const [step, setStep] = useState(0);
  const actions: LighthouseAction[] = [
    { type: "load", fuel: 2, food: 1 },
    { type: "sail", to: 1 },
  ];
  const labels = ["裝入燈油 2、糧食 1", "航向白礁（自動交貨）"];
  return (
    <section className="tg-demo tg-real-lesson">
      <h3>操作練習：裝貨出航就自動交貨</h3>
      <p>這裡使用正式規則，不寫入本局進度。</p>
      <NavigationChart state={s} />
      <p aria-live="polite">
        {s.message} 船艙 {s.cargo[0] + s.cargo[1]}/4；第{s.round}回合，剩
        {s.ap}行動。
      </p>
      {step < actions.length ? (
        <button
          onClick={() => {
            setState(applyLighthouse(s, actions[step]));
            setStep(step + 1);
          }}
        >
          {labels[step]}
        </button>
      ) : (
        <button
          onClick={() => {
            setState(createLighthouse(7, "normal", "A"));
            setStep(0);
          }}
        >
          再練一次
        </button>
      )}
    </section>
  );
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
        "看三座燈塔需要的燈油與糧食，先用＋／−在母港裝滿船艙（上限 4 箱）。",
        "每回合 2 行動：裝貨、航行各耗 1 行動，抵達燈塔自動交貨不另耗行動！",
        "風浪日進出最右側「遠岬」需 2 行動，一般 7 回合、進階 8 回合內送完獲勝。",
      ]}
      demo={[
        "母港先裝入 2 箱燈油、1 箱糧食（船艙 3/4，耗 1 行動）。",
        "再點海圖「白礁」航過去：一抵達就自動交付全部符合需求，立刻亮燈！",
        "燈油與糧食都是送給燈塔的補給品，開船不會耗油；進階局有一座燈塔需 5 箱，要分兩趟送。",
      ]}
      rules={
        <>
          <p>
            全團體共同駕駛一艘補給船（船艙上限 4 箱）。一般模式共 8 箱、限 7 回合；進階共 12 箱（有一塔需 5 箱、須分批運送）、限 8 回合。燈油與糧食皆為交付物資，航行本身不耗油。
          </p>
          <ol>
            <li>每回合有 2 行動；裝貨耗 1 行動，點海圖航行通常耗 1 行動。用完按「下一回合」。</li>
            <li>
              <strong>抵達自動交貨</strong>：開船到達燈塔時，會自動把船上符合該塔需求的燈油與糧食交出，不需額外花行動卸貨！
            </li>
            <li>
              <strong>風浪海況</strong>：今日與明日天氣公開。平穩時每條航線皆 1 行動；風浪日只有進出最右側「遠岬」的航線需要 2 行動，其餘仍為 1 行動。
            </li>
            <li>三座燈塔全部需求歸零立即合作勝利！</li>
          </ol>
        </>
      }
      result={(s) => (
        <>
          <h3>{s.won ? "海岸重新亮起來了" : "補給任務未完成"}</h3>
          <p>
            使用 {s.round} 回合；尚缺{" "}
            {s.needs.flat().reduce((a, b) => a + b, 0)}{" "}
            箱。可一起討論哪趟裝貨或航線值得調整。
          </p>
        </>
      )}
    >
      {(c) => <Voyage state={c.state} choose={c.choose} />}
    </TableGame>
  );
}
