import React, { useEffect, useMemo, useState } from "react";
import TableGame, { TableContext } from "./TableGame";
import "./garden-artboard.css";
import { Modal } from "./Common";
import {
  gardenEngine,
  GardenState,
  GardenAction,
  CellTerrain,
  SEASONS,
  SEASON_ORDER,
  currentSeason,
  rotated,
  placementError,
  placements,
  resolveCellAnchor,
  teamScore,
  formatGardenDelta,
  gardenHighlights,
  applyGarden,
  createGarden,
} from "../../games/playground/garden/rules";

export function TerrainMark({ kind }: { kind: CellTerrain }) {
  if (kind === "rose") {
    return (
      <svg
        className="gdn-terrain gdn-rose"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#fbece9" />
        <path d="M14 48c2-11 10-16 18-14-4 9-10 14-18 14z" fill="#528c68" />
        <path d="M50 48c-2-11-10-16-18-14 4 9 10 14 18 14z" fill="#3d7353" />
        <g transform="translate(32 30)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-11"
              rx="8.5"
              ry="12"
              fill="#e45d56"
              transform={`rotate(${deg})`}
            />
          ))}
          {[36, 108, 180, 252, 324].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-7.5"
              rx="5.5"
              ry="8"
              fill="#f38b7f"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="6" fill="#fff2cf" />
          <circle cx="0" cy="0" r="2.8" fill="#d98926" />
        </g>
      </svg>
    );
  }
  if (kind === "gold") {
    return (
      <svg
        className="gdn-terrain gdn-gold"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#fdf5dc" />
        <path d="M15 49c2-10 9-14 17-12-3 8-9 12-17 12z" fill="#4f8a64" />
        <path d="M49 49c-2-10-9-14-17-12 3 8 9 12 17 12z" fill="#3e7552" />
        <g transform="translate(32 30)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-12.5"
              rx="5.2"
              ry="10.5"
              fill={deg % 90 === 0 ? "#f2a922" : "#f7c948"}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="8.2" fill="#70441f" />
          <circle cx="0" cy="0" r="4.5" fill="#9c622b" />
        </g>
      </svg>
    );
  }
  if (kind === "fountain") {
    return (
      <svg
        className="gdn-terrain gdn-fountain"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#dff2f4" />
        <circle cx="32" cy="32" r="23" fill="#2a7f8e" />
        <circle cx="32" cy="32" r="18" fill="#3da3b3" />
        <circle
          cx="32"
          cy="32"
          r="12.5"
          fill="none"
          stroke="#bcecf2"
          strokeWidth="2.2"
        />
        <circle cx="32" cy="32" r="7" fill="#eefbfc" />
        <path
          d="M32 21v22M21 32h22"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      className="gdn-terrain gdn-path"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#e8ede6" />
      <circle cx="15" cy="18" r="5.5" fill="#5e9471" opacity="0.65" />
      <circle cx="49" cy="46" r="6" fill="#4f8563" opacity="0.65" />
      <rect x="11" y="13" width="21" height="17" rx="7" fill="#91a29b" />
      <rect x="13" y="14" width="17" height="12" rx="5.5" fill="#b7c4be" />
      <rect x="33" y="19" width="20" height="16" rx="7" fill="#82948d" />
      <rect x="35" y="20" width="16" height="11" rx="5" fill="#aab9b2" />
      <rect x="15" y="34" width="24" height="17" rx="7.5" fill="#889a93" />
      <rect x="17" y="35" width="20" height="12" rx="5.5" fill="#c1cdc7" />
    </svg>
  );
}

function MiniTile({ tile, rotation = 0 }: { tile: any; rotation?: number }) {
  const cells = rotated(tile, rotation);
  return (
    <div
      className="tg-mini-tile"
      style={{
        gridTemplateColumns: `repeat(${Math.max(...cells.map((c) => c.x)) + 1},var(--tile-cell, 26px))`,
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
      aria-label="現代幾何庭園：四季花圃與中央噴泉"
      role="img"
    >
      <defs>
        <linearGradient id="gdnBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b3a32" />
          <stop offset="100%" stopColor="#102520" />
        </linearGradient>
        <linearGradient id="gdnLawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f2e8" />
          <stop offset="100%" stopColor="#e5eadf" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="500" height="280" rx="22" fill="url(#gdnBg)" />
      <rect
        x="34"
        y="24"
        width="432"
        height="208"
        rx="20"
        fill="url(#gdnLawn)"
      />
      <path
        d="M52 192 C140 192, 180 128, 250 128 C320 128, 360 64, 448 64"
        fill="none"
        stroke="#cad6cf"
        strokeWidth="30"
        strokeLinecap="round"
      />
      {[82, 134, 186, 314, 366, 418].map((cx, i) => (
        <rect
          key={i}
          x={cx - 12}
          y={i < 3 ? 176 - i * 24 : 114 - (i - 3) * 25}
          width="24"
          height="16"
          rx="6"
          fill="#9cb0a6"
        />
      ))}
      <circle cx="110" cy="86" r="42" fill="#d9eadc" />
      <circle cx="102" cy="82" r="24" fill="#6ca380" opacity="0.35" />
      <circle cx="390" cy="176" r="44" fill="#fbe8df" />
      <circle cx="396" cy="174" r="24" fill="#e45d56" opacity="0.25" />
      {[
        [86, 76, "#e45d56", "#fff1cf"],
        [124, 68, "#f07b72", "#fff1cf"],
        [116, 102, "#e45d56", "#fff1cf"],
      ].map(([x, y, c1, c2], i) => (
        <g key={`r${i}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((d) => (
            <ellipse
              key={d}
              cx="0"
              cy="-7"
              rx="5"
              ry="7"
              fill={c1 as string}
              transform={`rotate(${d})`}
            />
          ))}
          <circle r="3.6" fill={c2 as string} />
        </g>
      ))}
      {[
        [374, 166],
        [408, 162],
        [394, 194],
      ].map(([x, y], i) => (
        <g key={`g${i}`} transform={`translate(${x} ${y})`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
            <ellipse
              key={d}
              cx="0"
              cy="-7"
              rx="3"
              ry="6"
              fill="#f3b229"
              transform={`rotate(${d})`}
            />
          ))}
          <circle r="4.5" fill="#70441f" />
        </g>
      ))}
      <circle cx="250" cy="128" r="36" fill="#2a7f8e" />
      <circle cx="250" cy="128" r="27" fill="#46aebf" />
      <circle
        cx="250"
        cy="128"
        r="17"
        fill="none"
        stroke="#c9f2f7"
        strokeWidth="2.5"
      />
      <circle cx="250" cy="128" r="8" fill="#ffffff" />
      {[
        ["#e06d88", "春"],
        ["#d99326", "夏"],
        ["#c9643b", "秋"],
        ["#4a8ba8", "冬"],
      ].map(([color, label], i) => (
        <g key={label} transform={`translate(${146 + i * 56} 252)`}>
          <rect x="-22" y="-12" width="44" height="22" rx="11" fill={color} />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="13"
            fontWeight="700"
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function GardenTable({
  state: s,
  choose,
  pending,
  confirmation,
}: TableContext<GardenState, GardenAction>) {
  const [slot, setSlot] = useState(0),
    [rotation, setRotation] = useState(0),
    [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(
      null,
    ),
    [viewedTeam, setViewedTeam] = useState<"A" | "B">(s.turn),
    [compare, setCompare] = useState(false),
    [coords, setCoords] = useState(false);

  useEffect(() => {
    setSlot(0);
    setRotation(0);
    setSelectedCell(null);
    setViewedTeam(s.turn);
  }, [s.ply, s.turn]);

  const season = currentSeason(s);
  const all = useMemo(() => placements(s), [s]);
  const resolved = selectedCell
    ? resolveCellAnchor(s, slot, rotation, selectedCell.x, selectedCell.y)
    : null;
  const anchor = resolved ? resolved.anchor : null;
  const action: Extract<GardenAction, { type: "place" }> | null = anchor
    ? { type: "place", slot, rotation, ...anchor }
    : null;
  const error = action
    ? placementError(s, action)
    : `點格子預覽：${season.desc}`;

  const scores = {
    A: teamScore(s, "A"),
    B: teamScore(s, "B"),
  };

  const preview = action && !error ? applyGarden(s, action) : null;
  const previewScores = preview
    ? {
        ...scores,
        [s.turn]: teamScore(preview, s.turn),
      }
    : scores;

  const ghost = anchor
    ? rotated(s.market[slot], rotation).map((c) => ({
        ...c,
        x: c.x + anchor.x,
        y: c.y + anchor.y,
      }))
    : [];

  const previewDelta = preview
    ? `${formatGardenDelta(scores[s.turn], previewScores[s.turn])}${preview.lastSeasonAward ? ` · 達成${preview.lastSeasonAward.title}` : ""}`
    : "";

  const statusText = pending
    ? all.length === 0
      ? `確認：${s.turn}隊本手略過？`
      : preview
        ? `確認：${previewDelta}`
        : "請確認這次放置"
    : preview
      ? previewDelta
      : error;

  const statusTone = pending
    ? "confirm"
    : preview
      ? "preview"
      : action && error
        ? "error"
        : "idle";

  const board = (team: "A" | "B", active: boolean) => {
    const displayBoard =
      active && preview ? preview.boards[team] : s.boards[team];
    const highlights = gardenHighlights(displayBoard, s.size);
    const baseScore = scores[team].total;
    const nextScore = previewScores[team].total;
    const delta = nextScore - baseScore;

    return (
      <section
        className={`tg-garden-block tg-garden-team-${team.toLowerCase()} ${active ? "tg-garden-active" : "tg-garden-other"} ${viewedTeam === team ? "tg-garden-viewed" : ""}`}
        key={team}
        aria-label={`${team}隊花園`}
      >
        <div className="tg-garden-caption">
          <h2>
            <span className="gdn-team-badge">{team === "A" ? "●" : "▲"}</span>{" "}
            {team}隊{" "}
            <strong>
              {active && preview ? `${nextScore}分` : `${baseScore}分`}
            </strong>
          </h2>
          {active ? (
            <span className="gdn-turn-pill">
              {preview
                ? `預覽 ${delta >= 0 ? `+${delta}` : delta}`
                : "本手造園"}
            </span>
          ) : viewedTeam !== s.turn ? (
            <button
              type="button"
              className="gdn-return-pill"
              onClick={() => setViewedTeam(s.turn)}
            >
              回{s.turn}隊
            </button>
          ) : (
            <span className="gdn-wait-pill">待命中</span>
          )}
        </div>
        <div className="tg-grid-wrap">
          <div
            className="tg-coordinate-board"
            data-board-team={team}
            style={{ "--garden-size": s.size } as React.CSSProperties}
          >
            <span />
            {Array.from({ length: s.size }, (_, i) => (
              <b key={i}>{String.fromCharCode(65 + i)}</b>
            ))}
            {Array.from({ length: s.size }, (_, y) => (
              <React.Fragment key={y}>
                <b>{y + 1}</b>
                {Array.from({ length: s.size }, (_, x) => {
                  const idx = y * s.size + x;
                  const kind = s.boards[team][idx],
                    ghostCell = active
                      ? ghost.find((c) => c.x === x && c.y === y)
                      : null;
                  const cellCheck = active
                    ? resolveCellAnchor(s, slot, rotation, x, y)
                    : null;
                  const valid = Boolean(cellCheck?.valid);
                  const bonus = highlights.doubledFlowers.has(idx)
                    ? "flower"
                    : highlights.connectedPaths.has(idx)
                      ? "path"
                      : "";
                  const inside =
                    kind || ghostCell ? (
                      <TerrainMark kind={kind || ghostCell!.kind} />
                    ) : null;

                  if (kind === "fountain" || !active) {
                    return (
                      <div
                        className="tg-garden-cell"
                        data-terrain={kind || ""}
                        data-bonus={bonus}
                        key={x}
                      >
                        {inside}
                      </div>
                    );
                  }
                  return (
                    <button
                      key={x}
                      disabled={pending}
                      className={`tg-garden-cell ${ghostCell ? "tg-ghost" : ""} ${ghostCell && error ? "tg-invalid-ghost" : ""}`}
                      data-valid-anchor={valid}
                      data-terrain={kind || ghostCell?.kind || ""}
                      data-bonus={bonus}
                      aria-pressed={
                        selectedCell?.x === x && selectedCell?.y === y
                      }
                      aria-label={`${String.fromCharCode(65 + x)}${y + 1}，${kind ? { rose: "珊瑚花", gold: "金陽花", path: "小徑", fountain: "中央噴泉" }[kind] : valid ? "可放" : "此方向不可放"}`}
                      onClick={() => {
                        setSelectedCell({ x, y });
                        setViewedTeam(team);
                      }}
                    >
                      {inside}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="tg-garden-desk" data-turn={s.turn} data-season={season.id}>
      <div className="tg-garden-tabs" role="tablist" aria-label="切換兩隊花園">
        {(["A", "B"] as const).map((team) => (
          <button
            key={team}
            type="button"
            role="tab"
            aria-selected={viewedTeam === team}
            className={`gdn-tab gdn-tab-${team.toLowerCase()} ${s.turn === team ? "is-turn" : ""}`}
            onClick={() => setViewedTeam(team)}
          >
            <span>
              {team === "A" ? "●" : "▲"} {team}隊花園
            </span>
            <strong>{scores[team].total}分</strong>
            {s.turn === team && <em>本手</em>}
          </button>
        ))}
      </div>
      {board("A", s.turn === "A")}
      <aside className="tg-garden-tools pg-paper" aria-label="造園工作檯">
        <div className="gdn-seasons-panel" aria-label="四季規則與目前回合">
          <div className="gdn-panel-meta">
            <span className="gdn-base-rule">基礎：3連花・連泉徑 2分</span>
            <span className="gdn-round-turn">
              第 {Math.min(s.ply + 1, s.limit)}/{s.limit} 手 · {rotation * 90}°
            </span>
          </div>
          <div className="gdn-seasons-grid">
            {SEASON_ORDER.map((id) => {
              const info = SEASONS[id];
              const isCurrent = season.id === id;
              const isPast =
                SEASON_ORDER.indexOf(id) < SEASON_ORDER.indexOf(season.id);
              return (
                <div
                  key={id}
                  className={`gdn-season-card season-${id} ${isCurrent ? "is-current" : ""} ${isPast ? "is-past" : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <div className="gdn-season-top">
                    <span className="gdn-season-name">
                      {info.name} ＋{info.bonus}
                    </span>
                    {isCurrent && <em className="gdn-season-now">本回</em>}
                  </div>
                  <strong className="gdn-season-rule">{info.compact}</strong>
                </div>
              );
            })}
          </div>
        </div>
        <div className="tg-tile-market">
          {s.market.map((tile, i) => (
            <button
              key={i}
              disabled={pending}
              aria-label={`選地形${i + 1}`}
              aria-pressed={slot === i}
              data-tile-available={all.some((a) => a.slot === i)}
              onClick={() => {
                setSlot(i);
                setViewedTeam(s.turn);
              }}
            >
              <b>
                {slot === i ? "✓ " : ""}
                {i + 1}
              </b>
              <MiniTile tile={tile} rotation={slot === i ? rotation : 0} />
              {!all.some((a) => a.slot === i) && <small>無落點</small>}
            </button>
          ))}
        </div>
        <div className={`gdn-status-box is-${statusTone}`} role="status">
          <p>{statusText}</p>
        </div>
        <div className="gdn-action-slot">
          {pending && confirmation ? (
            confirmation
          ) : (
            <div className="gdn-main-actions">
              <button
                disabled={pending}
                onClick={() => {
                  setRotation((rotation + 1) % 4);
                  setViewedTeam(s.turn);
                }}
              >
                旋轉90°
              </button>
              {all.length === 0 ? (
                <button
                  className="pg-primary"
                  disabled={pending}
                  onClick={() =>
                    choose(
                      { type: "discard" },
                      `${s.turn}隊三塊地形都沒有合法落點，確認本手略過？`,
                    )
                  }
                >
                  本手略過
                </button>
              ) : (
                <button
                  className="pg-primary"
                  disabled={pending || !action || !!error}
                  onClick={() => {
                    if (action && preview) {
                      const nextScore = teamScore(preview, s.turn).total;
                      const delta = nextScore - scores[s.turn].total;
                      choose(
                        action,
                        `${s.turn}隊放地形${slot + 1}（${rotation * 90}°），本手 ${delta >= 0 ? `+${delta}` : delta} 分，暫計 ${nextScore} 分。`,
                      );
                    }
                  }}
                >
                  放置地形
                </button>
              )}
            </div>
          )}
        </div>
        <span className="sr-only" role="status">
          {error ||
            `${String.fromCharCode(65 + selectedCell!.x)}${selectedCell!.y + 1} 可放`}
        </span>
        <div className="gdn-utility-row">
          <div className="gdn-next-chip" aria-label="下張補牌預告">
            <span>下張</span>
            {s.deck[0] && <MiniTile tile={s.deck[0]} />}
          </div>
          <button disabled={pending} onClick={() => setCoords(true)}>
            座標
          </button>
          <button disabled={pending} onClick={() => setCompare(true)}>
            對照花園
          </button>
        </div>
      </aside>
      {board("B", s.turn === "B")}
      {coords && (
        <Modal title="座標輔助選擇" onClose={() => setCoords(false)}>
          <p>也可直接點花園空格選落點。系統會自動把選中地形對齊到該格。</p>
          <div className="tg-coordinate-input">
            <label>
              欄
              <select
                aria-label="落點欄"
                value={selectedCell?.x ?? ""}
                onChange={(e) =>
                  setSelectedCell({
                    x: Number(e.target.value),
                    y: selectedCell?.y ?? 0,
                  })
                }
              >
                <option value="" disabled>
                  選欄
                </option>
                {Array.from({ length: s.size }, (_, x) => (
                  <option key={x} value={x}>
                    {String.fromCharCode(65 + x)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              列
              <select
                aria-label="落點列"
                value={selectedCell?.y ?? ""}
                onChange={(e) =>
                  setSelectedCell({
                    x: selectedCell?.x ?? 0,
                    y: Number(e.target.value),
                  })
                }
              >
                <option value="" disabled>
                  選列
                </option>
                {Array.from({ length: s.size }, (_, y) => (
                  <option key={y} value={y}>
                    {y + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="pg-primary" onClick={() => setCoords(false)}>
            回到花園
          </button>
        </Modal>
      )}
      {compare && (
        <Modal title="兩隊花園對照" onClose={() => setCompare(false)}>
          <div className="tg-compare-gardens">
            {board("A", false)}
            {board("B", false)}
          </div>
        </Modal>
      )}
    </div>
  );
}

function GardenLesson() {
  const [s, setState] = useState(() => createGarden(7, "normal", "A")),
    [rotation, setRotation] = useState(0),
    [placed, setPlaced] = useState(false);
  const move = placements(s).find(
    (a) => a.slot === 0 && a.rotation === rotation,
  )!;
  const before = teamScore(s, "A");
  return (
    <section className="tg-demo tg-real-lesson">
      <h3>操作練習：從中央噴泉開始造園</h3>
      <p>雙方開局正中央都有「噴泉」，緊鄰噴泉即可展開造園。</p>
      <div className="tg-lesson-garden">
        <div className="tg-lesson-grid">
          {s.boards.A.map((kind, i) => {
            const ghost =
              !placed &&
              move &&
              rotated(s.market[0], rotation).find(
                (c) =>
                  c.x + move.x === i % s.size &&
                  c.y + move.y === Math.floor(i / s.size),
              );
            return (
              <div className={ghost ? "tg-lesson-ghost" : ""} key={i}>
                {kind || ghost ? (
                  <TerrainMark kind={kind || ghost!.kind} />
                ) : null}
              </div>
            );
          })}
        </div>
        <div>
          <MiniTile tile={s.market[0]} rotation={rotation} />
          <p aria-live="polite">
            方向 {rotation * 90}° · A隊 {before.total}分
          </p>
          {!placed ? (
            <>
              <button onClick={() => setRotation((rotation + 1) % 4)}>
                試轉90°
              </button>
              <button
                disabled={!move}
                onClick={() => {
                  setState(applyGarden(s, move));
                  setPlaced(true);
                }}
              >
                放入標示位置
              </button>
            </>
          ) : (
            <>
              <p>地形已落下並結算春季賞。現在輪到B隊。</p>
              <button
                onClick={() => {
                  setState(createGarden(7, "normal", "A"));
                  setPlaced(false);
                  setRotation(0);
                }}
              >
                再練一次
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
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
        `${currentSeason(s).name}・第 ${Math.min(s.ply + 1, s.limit)}/${s.limit} 手・輪到 ${s.turn} 隊`
      }
      steps={[
        "每手從 3 塊板塊選 1 塊並旋轉，緊鄰中央噴泉或自己花園放下；下方預告「下張」補牌，降低抽牌運氣。",
        "同色花上下左右連滿 3 格變每格 2 分（斜角不算）；小徑只要連到中央噴泉也變每格 2 分。",
        "四季各有獨立目標（＋2～＋3 分），所有板塊最多含 2 格同色花，必須跨回合佈局規劃才拿得到高分。",
      ]}
      demo={[
        "操作區常駐顯示四季完整目標與「下張」補牌，能算出對手下一手會補進什麼牌。",
        "關鍵策略：春季別把噴泉四邊用花圍死，以免秋季小徑連不到噴泉；同時培養紅、金花海搶冬季 ＋3 分！",
      ]}
      rules={
        <>
          <p>
            兩隊輪流造園（A 隊在左、B 隊在右），開局正中央皆有一座「噴泉」。一般 5×5 共 8 手（四季各 1 輪），進階 6×6 共 16 手（每季 2 輪）。牌庫採均衡配比且<strong>單張最多只有 2 格同色花</strong>，需靠跨手佈局拼成花海，後段並穩定出現 2 格收尾板塊避免卡關。
          </p>
          <ol>
            <li>
              <strong>放置規則與公開「下張」：</strong>
              每手從 3 塊公開地形選 1 塊，旋轉後放在不重疊且至少一邊緊鄰噴泉或自己已有板塊的位置。左下角會公開預告「下張」補牌，讓雙方都能預判搶牌與卡位。
            </li>
            <li>
              <strong>常駐基礎計分（每一手都算）：</strong>
              珊瑚花或金陽花<strong>上下左右相連 ≥3 格</strong>即成花海，該區每格 2 分（未滿 3 格每格 1 分，<strong>斜角不算相連</strong>）；石板小徑只要連通到中央噴泉，整條每格 2 分（未連通每格 1 分）。
            </li>
            <li>
              <strong>四季當令賞（彼此獨立、於當季結算，已得不扣）：</strong>
              <ul>
                <li><strong>春季（＋2 分）：</strong>本手放下的板塊有任一花朵緊鄰中央噴泉。</li>
                <li><strong>夏季（＋2 分）：</strong>本手湊出新花海，或把原本 ≥3 格花海再擴大。</li>
                <li><strong>秋季（＋2 分）：</strong>本手放下的板塊含小徑，且成功連通或延長連泉小徑。</li>
                <li><strong>冬季（＋3 分）：</strong>花園同時具備「紅花海（≥3 格）＋ 金花海（≥3 格）＋ 連泉小徑」（每隊限領一次）。</li>
              </ul>
            </li>
            <li>
              <strong>策略提示：</strong>
              噴泉只有上下左右 4 個入口！春季別把噴泉四邊全種滿花，否則秋季小徑會無法直接接上噴泉；並趁春夏同步鋪出紅花與金花，冬季才能一舉領走 ＋3 分。
            </li>
          </ol>
        </>
      }
      result={(s) => (
        <>
          {(["A", "B"] as const).map((t) => {
            const v = teamScore(s, t);
            return (
              <p key={t}>
                <b>
                  {t}隊 {v.total} 分
                </b>
                ：花圃 {v.flowers} ＋ 小徑 {v.paths}
                {v.season ? ` ＋ 季節賞 ${v.season}` : ""}
              </p>
            );
          })}
          <h3>
            {teamScore(s, "A").total === teamScore(s, "B").total
              ? "兩隊同分，共同獲勝"
              : `${teamScore(s, "A").total > teamScore(s, "B").total ? "A" : "B"}隊獲勝`}
          </h3>
        </>
      )}
    >
      {(c) => <GardenTable {...c} />}
    </TableGame>
  );
}
