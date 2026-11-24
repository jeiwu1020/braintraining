import React, { useEffect, useMemo, useState } from "react";
import TableGame, { TableContext } from "./TableGame";
import { tableAction } from "./tableReview";
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
  resolveCellAnchor,
  scoreGarden,
  gardenHighlights,
  applyGarden,
  createGarden,
} from "../../games/playground/garden/rules";
export function TerrainMark({ kind }: { kind: Terrain }) {
  const [x, y] =
    kind === "rose" ? [0, 0] : kind === "gold" ? [627, 0] : [0, 627];
  return (
    <svg
      className={`gdn-terrain gdn-${kind}`}
      width="44"
      height="44"
      viewBox={`${x} ${y} 627 627`}
      aria-hidden="true"
    >
      <image
        href="/assets/playground/garden/terrain-atlas-v1.png"
        width="1254"
        height="1254"
      />
    </svg>
  );
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
    : "② 點花園格子，直接預覽落點";
  const scores = {
    A: scoreGarden(s.boards.A, s.size),
    B: scoreGarden(s.boards.B, s.size),
  };
  const preview = action && !error ? applyGarden(s, action) : null;
  const previewScores = preview
    ? {
        ...scores,
        [s.turn]: scoreGarden(preview.boards[s.turn], s.size),
      }
    : scores;
  const ghost = anchor
    ? rotated(s.market[slot], rotation).map((c) => ({
        ...c,
        x: c.x + anchor.x,
        y: c.y + anchor.y,
      }))
    : [];
  const entryRow = Math.floor(s.size / 2);
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
            {team}隊花園{" "}
            <strong>
              {active && preview ? `${baseScore}→${nextScore}分` : `${baseScore}分`}
            </strong>
            {active && preview && (
              <em className="gdn-delta-tag">
                {delta >= 0 ? `+${delta}` : delta}
              </em>
            )}
          </h2>
          <span className={active ? "gdn-turn-pill" : "gdn-wait-pill"}>
            {active ? "本手造園" : "待命中"}
          </span>
        </div>
        <p className="tg-garden-tally">
          花圃 {previewScores[team].flowers} ＋ 步道 {previewScores[team].paths}
        </p>
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
                <b
                  className={y === entryRow ? "gdn-entry-row" : ""}
                  title={y === entryRow ? "入口位於本列左側" : undefined}
                >
                  {y === entryRow ? (
                    <span className="gdn-entry-gate">入口▸</span>
                  ) : (
                    y + 1
                  )}
                </b>
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
                    ) : x === 0 && y === entryRow ? (
                      <span className="tg-entry">入口</span>
                    ) : null;
                  return active ? (
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
                      aria-label={`${String.fromCharCode(65 + x)}${y + 1}，${kind ? { rose: "玫瑰", gold: "金菊", path: "步道" }[kind] : valid ? "可放" : "此方向不可放"}`}
                      onClick={() => {
                        setSelectedCell({ x, y });
                        setViewedTeam(team);
                      }}
                    >
                      {inside}
                    </button>
                  ) : (
                    <div
                      className="tg-garden-cell"
                      data-terrain={kind || ""}
                      data-bonus={bonus}
                      key={x}
                    >
                      {inside}
                    </div>
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
    <div className="tg-garden-desk" data-turn={s.turn}>
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
        {viewedTeam !== s.turn && (
          <div className="gdn-viewing-banner">
            <span>目前檢視 {viewedTeam} 隊（輪到 {s.turn} 隊）</span>
            <button type="button" onClick={() => setViewedTeam(s.turn)}>
              回 {s.turn} 隊
            </button>
          </div>
        )}
        <div className="tg-market-title">
          <b>① 選地形</b>
          <span>
            {s.turn}隊第 {Math.floor(s.ply / 2) + 1}/{s.limit / 2} 塊
          </span>
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
        <div className="gdn-placement-guide">
          <b>
            {error ||
              `② 已選 ${String.fromCharCode(65 + selectedCell!.x)}${selectedCell!.y + 1}（可放）`}
          </b>
          <span>{rotation * 90}°</span>
        </div>
        {preview && action && (
          <p className="gdn-score-preview" role="status">
            {tableAction("garden", s, action, preview)}
          </p>
        )}
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
                    const nextScore = scoreGarden(
                      preview.boards[s.turn],
                      s.size,
                    ).total;
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
            <button
              className="gdn-coordinates-toggle"
              disabled={pending}
              onClick={() => setCoords(true)}
            >
              座標
            </button>
          </div>
        )}
        <span className="sr-only" role="status">
          {error ||
            `③ ${String.fromCharCode(65 + selectedCell!.x)}${selectedCell!.y + 1} 可放 · 虛線為預覽`}
        </span>
        <div className="tg-garden-comparison">
          <span>
            A隊 <b>{scores.A.total}</b> 分 · B隊 <b>{scores.B.total}</b> 分
          </span>
          <button disabled={pending} onClick={() => setCompare(true)}>
            對照花園
          </button>
        </div>
      </aside>
      {board("B", s.turn === "B")}
      <p className="tg-desk-note">
        同色花圃≥3格每格2分 · 連通入口步道每格2分 · 無扣分
      </p>
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
  const before = scoreGarden(s.boards.A, s.size);
  return (
    <section className="tg-demo tg-real-lesson">
      <h3>操作練習：旋轉後放入花園</h3>
      <p>與正式局相同的地形與計分。綠框表示這次的合法落點。</p>
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
              <p>地形已落下，得分由正式規則計算。現在輪到B隊。</p>
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
        `兩隊造園・第 ${Math.min(s.ply + 1, s.limit)} / ${s.limit} 手・輪到 ${s.turn} 隊`
      }
      steps={[
        "從三塊公開地形選一塊，可按「旋轉90°」調整方向。",
        "點花園任一格直接預覽落點，新地形須接到自己花園旁。",
        "確認放置不擋畫面；最後比「花圃＋步道」總分高者獲勝。",
      ]}
      demo={[
        "示範：選一塊有兩格玫瑰的地形，準備接在現有一格玫瑰旁。",
        "同色連成3格花圃，花圃分數由每格1分變成每格2分，共6分。",
        "步道連到左側入口每格2分；本遊戲沒有任何扣分。",
      ]}
      rules={
        <>
          <p>
            一般使用 5×5 花園（每隊選 6 塊）；進階 6×6 花園（每隊選 8
            塊）。兩隊輪流造園，A 隊花園固定在左，B 隊固定在右。
          </p>
          <ol>
            <li>
              <strong>選板與旋轉：</strong>
              每手從三塊公開地形選一塊，可旋轉 0°／90°／180°／270°；放置後會補上一塊新地形。
            </li>
            <li>
              <strong>相鄰接續：</strong>
              第一塊可放任意處；之後新地形至少有一格與自己原有花園上下左右相鄰。
            </li>
            <li>
              <strong>花圃加倍（≥3格）：</strong>
              同色玫瑰或金菊上下左右連成 3 格以上，該群每格算 2 分；不足 3
              格每格 1 分（玫瑰與金菊分開算）。
            </li>
            <li>
              <strong>入口步道（連入口）：</strong>
              步道每格 1 分；只要從左側「入口▸」連出去，整條連通的步道每格算 2
              分。
            </li>
            <li>
              <strong>無扣分決勝：</strong>
              不計算任何空洞扣分。僅在三塊地形都無處可放時才略過本手；最後以「花圃＋步道」總分高者獲勝，同分共同獲勝。
            </li>
          </ol>
          <p>
            計分例：連成 3 格的玫瑰得 6 分（3×2），連通入口的 2 格步道得 4
            分（2×2），合計 6＋4＝10 分。
          </p>
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
                ：花圃 {v.flowers} ＋ 步道 {v.paths}
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
      {(c) => <GardenTable {...c} />}
    </TableGame>
  );
}
