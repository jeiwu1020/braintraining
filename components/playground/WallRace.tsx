import React, { useEffect, useRef, useState } from "react";
import GameShell from "../game-ui/GameShell";
import { Engine, savedSettings } from "../../games/playground/session";
import { other, Settings } from "../../games/playground/types";
import {
  applyWall,
  coord,
  createWall,
  moves,
  path,
  Wall,
  WallAction,
  wallEdges,
  wallError,
  WallState,
} from "../../games/playground/wall-race/rules";
import { fallbackWall } from "../../games/playground/wall-race/ai";
import { useAi, useSession } from "./useSession";
import {
  ConfirmDialog,
  Modal,
  modeTitle,
  Recovery,
  SessionMenu,
  Setup,
  teamLabel,
  useRoving,
} from "./Common";
const engine: Engine<WallState, WallAction> = {
  create: (_, level, starter) => createWall(level, starter),
  apply: applyWall,
  validAction: (a: any): a is WallAction =>
    (a?.type === "move" && Number.isInteger(a.to) && a.to >= 0 && a.to < 25) ||
    (a?.type === "wall" &&
      a.wall &&
      Number.isInteger(a.wall.x) &&
      Number.isInteger(a.wall.y) &&
      ["h", "v"].includes(a.wall.dir)),
};
const makeWorker = () =>
  new Worker(
    new URL("../../games/playground/wall-race/ai.worker.ts", import.meta.url),
    { type: "module" },
  );
const WallBar: React.FC<{ wall: Wall; ghost?: boolean; invalid?: boolean }> = ({
  wall,
  ghost = false,
  invalid = false,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pg-wall-bar ${wall.dir === "h" ? "horizontal" : "vertical"} ${ghost ? "ghost" : ""} ${invalid ? "invalid" : ""}`}
      style={
        wall.dir === "h"
          ? {
              left: `${wall.x * 20}%`,
              top: `${(wall.y + 1) * 20}%`,
              width: "40%",
            }
          : {
              left: `${(wall.x + 1) * 20}%`,
              top: `${wall.y * 20}%`,
              height: "40%",
            }
      }
    />
  );
};
export default function WallRace({ onBack }: { onBack: () => void }) {
  const game = useSession("wall-race", engine),
    { state: s, session, token } = game;
  const [settings, setSettings] = useState<Settings>(() =>
    savedSettings("wall-race"),
  );
  const [mode, setMode] = useState<"move" | "wall">("move"),
    [direction, setDirection] = useState<"h" | "v">("h");
  const [selection, setSelection] = useState<{
      to: number;
      token: string;
    } | null>(null),
    [dialog, setDialog] = useState<string | null>(null),
    [showPaths, setShowPaths] = useState(false),
    [jumpHelp, setJumpHelp] = useState(true);
  const confirm = useRef<HTMLButtonElement>(null),
    grid = useRoving(25, 5, confirm);
  const aiTurn = !!(
    s &&
    session?.settings.mode === "solo" &&
    s.turn === "B" &&
    s.phase === "playing"
  );
  const aiOptions = {
    difficulty: session?.settings.aiDifficulty,
    seed: ((session?.aiSeed ?? 0) + (s?.ply ?? 0)) >>> 0,
  };
  const ai = useAi<WallAction>(
    aiTurn,
    token,
    makeWorker,
    s ? { state: s, options: aiOptions } : {},
    () => fallbackWall(s!, aiOptions),
  );
  useEffect(() => {
    setSelection(null);
    setMode("move");
  }, [token]);
  const selected = selection?.token === token ? selection.to : null;
  const wall =
    selected !== null && mode === "wall"
      ? { x: selected % 5, y: Math.floor(selected / 5), dir: direction }
      : null;
  const error = s && wall ? wallError(s, wall) : null;
  const clear = () => {
    setSelection(null);
    grid.refs.current[grid.focus]?.focus();
  };
  const rules = dialog === "rules" && (
    <Modal title="築牆競走玩法" onClose={() => setDialog(null)}>
      <ol>
        <li>每手只做一件事：走棋，或放一面牆。</li>
        <li>不能封死任何一方通往對岸的路。</li>
        <li>A 往上到第 1 列；B 往下到第 5 列，先到對岸就贏。</li>
      </ol>
      <h3>走棋與相遇</h3>
      <p>
        平常上下左右走一格，也能往後。不能穿牆、出界或占對手格。相鄰而且中間無牆時，若對手正後方可通行，就只能直接跳到後方；若後方被牆或邊界擋住，才可往對手左右側跳。側邊仍須通行。系統標出全部合法目的格。
      </p>
      <h3>怎麼放牆</h3>
      <p>
        先選「築牆」，再點 A1–D4
        的大格作錨點，選橫或直。錨點是該格右下角交會點。例如 B2 橫牆擋
        B2–B3、C2–C3；B2 直牆擋 B2–C2、B3–C3。
      </p>
      <p>
        牆長兩格，不可重疊任何一段，也不可在同一錨點交叉。端點與 T
        字接觸可以。牆一旦確認就不能搬動，雙方都受影響。一般每隊 3 面，進階每隊
        5 面。
      </p>
      <p>
        確認前系統會忽略棋子占位，檢查雙方都還有路。看路線只是顯示當前可通行的路，並不保證勝利。
      </p>
      <h3>勝負、和局與撤回</h3>
      <p>
        到岸立即獲勝，第 80 手到岸也優先判勝。相同完整局面第三次出現，或完成 80
        手仍未到岸，都算和局。局面包含雙方位置、全部牆、剩餘牆與輪到誰。
      </p>
      <p>
        兩隊撤回一手；單人撤回到上一個人方決策。結束後不撤回。重玩交換先手，但不保證完全公平。
      </p>
      <p>
        方向鍵移動棋盤焦點，Enter 預選後焦點到確認；Escape
        取消。返回保留本局，同一分頁重新整理可繼續。電腦只會在按「看電腦行動」後出手。
      </p>
      <p>
        玩法參考常見的築牆競速機制，採本作小棋盤、牆量與和局規則；畫面與文案為本作設計。
      </p>
    </Modal>
  );
  if (game.corrupt) return <Recovery onReset={game.clear} onBack={onBack} />;
  if (!s || !session)
    return (
      <>
        <Setup
          game="wall-race"
          settings={settings}
          onChange={setSettings}
          onStart={() => game.start(settings)}
          onBack={onBack}
          onRules={() => setDialog("rules")}
        />
        {rules}
      </>
    );
  const legal = moves(s),
    noMoves = s.phase === "playing" && !legal.length;
  const aPath = showPaths ? path(s, "A") : [],
    bPath = showPaths ? path(s, "B") : [];
  const jumps = legal.filter(
    (p) =>
      Math.abs((p % 5) - (s.pawns[s.turn] % 5)) +
        Math.abs(Math.floor(p / 5) - Math.floor(s.pawns[s.turn] / 5)) >
      1,
  );
  const finished = s.phase === "finished";
  const winner =
    s.result === "A" || s.result === "B"
      ? `${s.result} 隊到岸獲勝`
      : s.result === "repetition"
        ? "和局：重複局面"
        : "和局：達到 80 手上限";
  const previewText = wall
    ? `${coord(selected!)} ${direction === "h" ? "橫" : "直"}牆`
    : selected !== null
      ? `走到 ${coord(selected)}`
      : "選一格，再確認";
  const blockedEdges = wall
    ? wallEdges(wall)
        .map((e) =>
          e
            .split(":")
            .map((p) => coord(Number(p)))
            .join("–"),
        )
        .join("、")
    : "";
  return (
    <GameShell
      className="pg-shell pg-wall"
      title="築牆競走"
      subtitle={`${modeTitle(session.settings)}・第 ${s.ply} 手${s.ply >= 60 ? "／最多 80 手" : ""}`}
      onBack={onBack}
      backLabel="返回桌遊新樂園"
      actions={
        <>
          <button
            className="pg-button"
            onClick={() => game.undo()}
            disabled={!game.canUndo()}
          >
            撤回
          </button>
          <button className="pg-button" onClick={() => setDialog("rules")}>
            規則
          </button>
          <button className="pg-button" onClick={() => setDialog("menu")}>
            選項
          </button>
        </>
      }
    >
      <div
        className="pg-play-layout"
        data-phase={aiTurn ? "awaiting_ai_reveal" : s.phase}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !dialog) {
            e.preventDefault();
            clear();
          }
        }}
      >
        <div className="pg-wall-area">
          <div className="pg-board-legend">
            <p>
              <b>● A 目標 ↑</b>
              <span>第 1 列</span>
            </p>
            <p>
              <b>▲ B 目標 ↓</b>
              <span>第 5 列</span>
            </p>
            <button
              aria-pressed={showPaths}
              onClick={() => setShowPaths(!showPaths)}
            >
              {showPaths ? "收起路線" : "看路線"}
            </button>
            {showPaths && <small>A／B 標記為可通行路，非保證勝路</small>}
          </div>
          <div className="pg-board-frame">
            <div className="pg-wall-grid" role="group" aria-label="五乘五棋盤">
              <span />
              {"ABCDE".split("").map((c) => (
                <span className="pg-axis" key={c}>
                  {c}
                </span>
              ))}
              {Array.from({ length: 5 }, (_, y) => (
                <React.Fragment key={y}>
                  <span className="pg-axis">{y + 1}</span>
                  {Array.from({ length: 5 }, (_, x) => {
                    const p = y * 5 + x,
                      pawn =
                        s.pawns.A === p ? "A" : s.pawns.B === p ? "B" : null;
                    const enabled =
                      !finished &&
                      !aiTurn &&
                      !noMoves &&
                      (mode === "move" ? legal.includes(p) : x < 4 && y < 4);
                    return (
                      <button
                        key={p}
                        ref={(el) => {
                          grid.refs.current[p] = el;
                        }}
                        tabIndex={grid.focus === p ? 0 : -1}
                        onFocus={() => grid.setFocus(p)}
                        onKeyDown={(e) => grid.onKeyDown(e, p)}
                        aria-label={`${coord(p)}${pawn ? `，${pawn} 隊棋子` : ""}${enabled ? (mode === "move" ? "，可走" : "，牆錨點") : ""}`}
                        aria-disabled={!enabled}
                        aria-pressed={selected === p}
                        data-cell={coord(p)}
                        className={`pg-cell ${enabled ? "available" : ""} ${selected === p ? "selected" : ""} ${pawn ? "occupied" : ""}`}
                        onClick={() => {
                          if (enabled) setSelection({ to: p, token });
                        }}
                      >
                        {pawn && (
                          <span className={`pg-pawn pawn-${pawn}`}>
                            <span>{pawn}</span>
                          </span>
                        )}
                        {!pawn && enabled && mode === "move" && (
                          <span className="pg-move-dot" aria-hidden="true" />
                        )}
                        {!pawn &&
                          showPaths &&
                          (aPath.includes(p) || bPath.includes(p)) && (
                            <span className="pg-path-mark">
                              {aPath.includes(p) ? "A" : ""}
                              {bPath.includes(p) ? "B" : ""}
                            </span>
                          )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
              <div className="pg-wall-layer">
                {s.walls.map((w, i) => (
                  <WallBar key={i} wall={w} />
                ))}
                {wall && !finished && (
                  <WallBar wall={wall} ghost invalid={!!error} />
                )}
              </div>
            </div>
          </div>
          <div className="pg-board-last" aria-live="polite">
            {s.last}
          </div>
        </div>
        <aside className="pg-control-panel pg-paper">
          <h2 aria-live="polite">
            {finished
              ? winner
              : noMoves
                ? "局面發生錯誤"
                : aiTurn
                  ? "▲ 電腦回合"
                  : `輪到 ${teamLabel(s.turn, "teams")}`}
          </h2>
          <div className="pg-wall-reserves">
            <span>
              ● A 剩牆 <b>{s.reserve.A}</b>
            </span>
            <span>
              ▲ B 剩牆 <b>{s.reserve.B}</b>
            </span>
          </div>
          {finished ? (
            <>
              <p>棋盤保留在左側，下局交換先手。</p>
              <button
                className="pg-primary"
                onClick={() =>
                  game.start(session.settings, other(session.starter))
                }
              >
                再玩一局
              </button>
              <button onClick={onBack}>返回桌遊新樂園</button>
              <button
                onClick={() => {
                  setSettings(session.settings);
                  game.clear();
                }}
              >
                重新設定
              </button>
            </>
          ) : (
            <>
              <div className="pg-choice" aria-label="行動種類">
                <button
                  aria-pressed={mode === "move"}
                  disabled={aiTurn}
                  onClick={() => {
                    setMode("move");
                    setSelection(null);
                  }}
                >
                  走棋
                </button>
                <button
                  aria-pressed={mode === "wall"}
                  disabled={aiTurn || s.reserve[s.turn] === 0}
                  onClick={() => {
                    setMode("wall");
                    setSelection(null);
                  }}
                >
                  築牆
                </button>
              </div>
              <div className="pg-orientation">
                {mode === "wall" ? (
                  <div className="pg-choice" aria-label="牆方向">
                    <button
                      aria-pressed={direction === "h"}
                      onClick={() => setDirection("h")}
                    >
                      橫
                    </button>
                    <button
                      aria-pressed={direction === "v"}
                      onClick={() => setDirection("v")}
                    >
                      直
                    </button>
                  </div>
                ) : jumpHelp && jumps.length > 0 && !aiTurn ? (
                  <div className="pg-inline-jump">
                    <p>相遇：可跳格已標出</p>
                    <button
                      aria-label="關閉相遇提示"
                      onClick={() => setJumpHelp(false)}
                    >
                      知道了
                    </button>
                  </div>
                ) : (
                  <p>
                    {aiTurn ? "按下才顯示電腦行動" : "可選目的格有圓點標記"}
                  </p>
                )}
              </div>
              <div
                className={`pg-preview ${error ? "pg-error" : ""}`}
                aria-live="polite"
              >
                {noMoves ? (
                  <strong>無合法動作，請撤回或重開。</strong>
                ) : aiTurn ? (
                  <>
                    <strong>
                      {ai.failed
                        ? "電腦暫時無法行動"
                        : ai.ready
                          ? "電腦準備好了"
                          : "電腦思考中…"}
                    </strong>
                    <small>
                      {ai.ready?.fallback
                        ? "使用合法備用選擇"
                        : "棋盤不會自動改動"}
                    </small>
                  </>
                ) : (
                  <>
                    <strong>{previewText}</strong>
                    {wall && <small>{error ?? `✓ 雙方仍可通行`}</small>}
                    {wall && (
                      <span className="pg-edge-description">
                        擋住 {blockedEdges}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="pg-confirm-row">
                <button
                  ref={confirm}
                  className="pg-primary"
                  disabled={
                    noMoves ||
                    (aiTurn ? !ai.ready : selected === null || !!error)
                  }
                  onClick={() => {
                    if (aiTurn && ai.ready) game.commit(ai.ready.action, token);
                    else if (selected !== null)
                      game.commit(
                        wall
                          ? { type: "wall", wall }
                          : { type: "move", to: selected },
                        selection!.token,
                      );
                  }}
                >
                  {aiTurn
                    ? "看電腦行動"
                    : mode === "wall"
                      ? "確認放牆"
                      : "確認走棋"}
                </button>
                <button disabled={selected === null} onClick={clear}>
                  取消
                </button>
              </div>
            </>
          )}
          {game.storageError && (
            <p role="alert">瀏覽器無法暫存，離開可能遺失本局。</p>
          )}
        </aside>
      </div>
      {rules}
      {dialog === "menu" && (
        <SessionMenu
          onClose={() => setDialog(null)}
          onRestart={() => setDialog("restart")}
          onSetup={() => setDialog("setup")}
          onAbandon={() => setDialog("abandon")}
        />
      )}
      {["restart", "setup", "abandon"].includes(dialog ?? "") && (
        <ConfirmDialog
          title={
            dialog === "restart"
              ? "重開本局？"
              : dialog === "setup"
                ? "重新設定？"
                : "放棄未完成的本局？"
          }
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            if (dialog === "restart")
              game.start(session.settings, session.starter);
            else {
              setSettings(session.settings);
              game.clear();
              if (dialog === "abandon") onBack();
            }
            setDialog(null);
          }}
        />
      )}
    </GameShell>
  );
}
