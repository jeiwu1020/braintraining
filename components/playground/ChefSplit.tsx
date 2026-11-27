import React, { useEffect, useState } from "react";
import GameShell from "../game-ui/GameShell";
import { Engine, savedSettings } from "../../games/playground/session";
import { other, Settings, TEAMS } from "../../games/playground/types";
import {
  applyChefSplit,
  ChefAction,
  ChefState,
  createChefSplit,
  Dish,
  DISH_INFO,
  scoreChefCollection,
  SWEET_DISHES,
  validChefAction,
} from "../../games/playground/chef-split/rules";
import { chooseChefSplit } from "../../games/playground/chef-split/ai";
import { useAi, useSession } from "./useSession";
import {
  ConfirmDialog,
  Modal,
  modeTitle,
  Recovery,
  SessionMenu,
  Setup,
  teamLabel,
} from "./Common";
import "./four-new-games.css";

const engine: Engine<ChefState, ChefAction> = {
  create: createChefSplit,
  apply: applyChefSplit,
  validAction: validChefAction,
};

const makeWorker = () =>
  new Worker(
    new URL("../../games/playground/chef-split/ai.worker.ts", import.meta.url),
    { type: "module" },
  );

function DishIcon({ dish }: { dish: Dish }) {
  if (dish === "tart") {
    return (
      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 26 L40 26 L34 40 L14 40 Z" fill="#d9a05b" stroke="#7c4e24" strokeWidth="2.2" />
        <circle cx="18" cy="21" r="6" fill="#e14d5c" />
        <circle cx="29" cy="20" r="6.5" fill="#e14d5c" />
        <circle cx="24" cy="14" r="6" fill="#f06472" />
        <path d="M22 8 L26 6 L25 11 Z" fill="#4f8f53" />
      </svg>
    );
  }
  if (dish === "matcha") {
    return (
      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="25" r="15" fill="#639a48" stroke="#365c24" strokeWidth="2.2" />
        <circle cx="24" cy="25" r="9.5" fill="#f7f1de" />
        <circle cx="24" cy="25" r="4.5" fill="#79af5b" />
      </svg>
    );
  }
  if (dish === "pudding") {
    return (
      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M12 38 L16 18 L32 18 L36 38 Z" fill="#f7c85c" stroke="#996820" strokeWidth="2.2" />
        <path d="M15 18 Q24 14 33 18 L32 23 Q24 21 16 23 Z" fill="#7a3e16" />
      </svg>
    );
  }
  if (dish === "macaron") {
    return (
      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="10" y="14" width="28" height="9" rx="5" fill="#e894a8" stroke="#994b60" strokeWidth="2" />
        <rect x="12" y="23" width="24" height="5" rx="2" fill="#fff3d6" />
        <rect x="10" y="28" width="28" height="9" rx="5" fill="#a2d2b5" stroke="#477a5c" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="26" r="14" fill="#3a3330" stroke="#1c1715" strokeWidth="2.5" />
      <path d="M16 21 L22 25 M27 19 L33 24 M19 31 L29 29" stroke="#d97b38" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ChefSplit({ onBack }: { onBack: () => void }) {
  const game = useSession("chef-split", engine),
    { state: s, session, token } = game;
  const [settings, setSettings] = useState<Settings>(() => savedSettings("chef-split"));
  const [leftIndices, setLeftIndices] = useState<number[]>([0, 1]);
  const [pickedPlate, setPickedPlate] = useState<"left" | "right" | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);

  useEffect(() => {
    if (s?.stage === "split") {
      const half = Math.max(1, Math.floor(s.tray.length / 2));
      setLeftIndices(Array.from({ length: half }, (_, i) => i));
    }
    setPickedPlate(null);
  }, [token, s?.stage, s?.tray.length]);

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
  const ai = useAi<ChefAction>(
    aiTurn,
    token,
    makeWorker,
    s ? { state: s, options: aiOptions } : {},
    () => chooseChefSplit(s!, aiOptions),
  );

  if (game.corrupt) {
    return <Recovery onBack={onBack} onReset={() => game.clear()} />;
  }

  const rulesModal = dialog === "rules" && (
    <Modal title="主廚分雙盤・規則說明" onClose={() => setDialog(null)}>
      <ol>
        <li>全場共 6 輪，兩隊輪流擔任「主廚」與「先選客人」。</li>
        <li><strong>主廚分盤</strong>：點擊本輪點心調整左右盤位置（每盤至少 1 份），確認分盤。</li>
        <li><strong>客人挑盤</strong>：客人先從左右盤選一盤收下，剩餘那一盤歸主廚！</li>
      </ol>
      <h3>甜點計分方式</h3>
      <ul>
        {(["tart", "matcha", "pudding", "macaron", "charred"] as Dish[]).map((d) => (
          <li key={d}>
            <strong>{DISH_INFO[d].name}</strong>：{DISH_INFO[d].rule}
          </li>
        ))}
      </ul>
    </Modal>
  );

  if (!s || !session) {
    return (
      <>
        <Setup
          game="chef-split"
          settings={settings}
          onChange={setSettings}
          onStart={() => game.start(settings)}
          onBack={onBack}
          onRules={() => setDialog("rules")}
        />
        {rulesModal}
      </>
    );
  }

  const finished = s.phase === "finished";
  const scores = {
    A: scoreChefCollection(s.collections.A),
    B: scoreChefCollection(s.collections.B),
  };

  const leftSet = new Set(leftIndices);
  const leftPreview = s.tray.filter((_, i) => leftSet.has(i));
  const rightPreview = s.tray.filter((_, i) => !leftSet.has(i));
  const splitValid = leftPreview.length >= 1 && rightPreview.length >= 1;

  const winner =
    s.result === "tie"
      ? "雙方同分共享主廚榮譽"
      : `${teamLabel(s.result as "A" | "B", session.settings.mode)}獲勝！`;

  return (
    <GameShell
      className="pg-shell pg-chef"
      title="主廚分雙盤"
      subtitle={`${modeTitle(session.settings)}・第 ${s.round}／${s.totalRounds} 輪`}
      onBack={onBack}
      backLabel="返回桌遊新樂園"
      actions={
        <>
          <button className="pg-button" onClick={() => game.undo()} disabled={!game.canUndo()}>
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
      <div className="pg-four-stage" data-phase={aiTurn ? "awaiting_ai_reveal" : s.phase}>
        <div className="pg-four-arena">
          <div className="pg-chef-counter">
            <div className="pg-chef-hands">
              {TEAMS.map((t) => {
                const sc = scores[t];
                return (
                  <section key={t} className={`pg-chef-card-box ${t}`} aria-label={`${t}隊餐桌`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>
                        {t === "A" ? "●" : "▲"} {teamLabel(t, session.settings.mode)}
                        {!finished && s.splitter === t ? "（本輪主廚）" : ""}
                      </span>
                      <span className="tabular-nums text-lg">{sc.total} 分</span>
                    </div>
                    <div className="pg-dish-pills">
                      {SWEET_DISHES.map((d) => (
                        <span key={d} className="pg-dish-stat">
                          {DISH_INFO[d].name} <b>{sc.counts[d]}</b>
                        </span>
                      ))}
                      {sc.counts.charred > 0 && (
                        <span className="pg-dish-stat">
                          焦黑 <b>{sc.counts.charred}</b>
                        </span>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {!finished && s.stage === "split" && (
              <div className="pg-plate-zone" aria-label="主廚分盤區">
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>點擊點心切換「左盤」或「右盤」（目前左 {leftPreview.length} / 右 {rightPreview.length}）</span>
                </div>
                <div className="pg-dish-grid" style={{ ["--dish-cols" as string]: s.tray.length === 4 ? 4 : 5 }}>
                  {s.tray.map((dish, idx) => {
                    const inLeft = leftSet.has(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={aiTurn}
                        className={`pg-dish-btn ${inLeft ? "left" : "right"}`}
                        aria-label={`${DISH_INFO[dish].name} 目前在${inLeft ? "左盤" : "右盤"}`}
                        onClick={() => {
                          setLeftIndices((prev) =>
                            prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx],
                          );
                        }}
                      >
                        <DishIcon dish={dish} />
                        <span className="text-xs font-bold">{DISH_INFO[dish].name}</span>
                        <span className="text-xs">{inLeft ? "← 左盤" : "右盤 →"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!finished && s.stage === "choose" && s.plates && (
              <div className="pg-plates-split" aria-label="左右雙盤選擇">
                {(["left", "right"] as const).map((side) => {
                  const items = s.plates![side];
                  const afterScore =
                    scoreChefCollection([...s.collections[s.turn], ...items]).total -
                    scores[s.turn].total;
                  return (
                    <button
                      key={side}
                      type="button"
                      disabled={aiTurn}
                      className={`pg-plate-zone text-left ${pickedPlate === side ? "selected-plate" : ""}`}
                      onClick={() => setPickedPlate(side)}
                    >
                      <div className="flex items-center justify-between w-full font-bold">
                        <span>{side === "left" ? "左盤" : "右盤"}（{items.length} 份）</span>
                        <span className="tabular-nums">
                          預計 {afterScore >= 0 ? `+${afterScore}` : afterScore} 分
                        </span>
                      </div>
                      <div className="pg-dish-grid">
                        {items.map((dish, i) => (
                          <span key={i} className="pg-dish-stat">
                            <DishIcon dish={dish} />
                            {DISH_INFO[dish].name}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="pg-board-last" aria-live="polite">
            {s.last}
          </div>
        </div>

        <aside className="pg-control-panel pg-paper">
          <h2 aria-live="polite">
            {finished
              ? winner
              : aiTurn
                ? "▲ 電腦回合"
                : s.stage === "split"
                  ? `第 ${s.round} 輪・${teamLabel(s.turn, session.settings.mode)}分盤`
                  : `第 ${s.round} 輪・${teamLabel(s.turn, session.settings.mode)}先選`}
          </h2>
          <div className="pg-four-scores">
            <div className={`pg-team-badge team-A ${!finished && s.turn === "A" ? "active-turn" : ""}`}>
              <span>{teamLabel("A", session.settings.mode)}</span>
              <span>{scores.A.total} 分</span>
            </div>
            <div className={`pg-team-badge team-B ${!finished && s.turn === "B" ? "active-turn" : ""}`}>
              <span>{teamLabel("B", session.settings.mode)}</span>
              <span>{scores.B.total} 分</span>
            </div>
          </div>

          {finished ? (
            <>
              <p>下局自動交換首輪主廚。</p>
              <button
                className="pg-primary"
                onClick={() => game.start(session.settings, other(session.starter))}
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
              <div className="pg-preview" aria-live="polite">
                {aiTurn ? (
                  <>
                    <strong>
                      {ai.failed
                        ? "電腦暫時無法行動"
                        : ai.ready
                          ? "電腦已做好決定"
                          : "電腦盤算策略中…"}
                    </strong>
                    <small>點擊下方按鈕才推進電腦行動。</small>
                  </>
                ) : s.stage === "split" ? (
                  splitValid ? (
                    <>
                      <strong>
                        左盤 {leftPreview.length} 份 ／ 右盤 {rightPreview.length} 份
                      </strong>
                      <small>點左側點心可調整左右盤，確定後對手先選。</small>
                    </>
                  ) : (
                    <strong>左右兩盤都必須至少保留 1 份點心！</strong>
                  )
                ) : pickedPlate ? (
                  <>
                    <strong>已預選「{pickedPlate === "left" ? "左盤" : "右盤"}」</strong>
                    <small>剩餘另一盤將自動歸主廚 {teamLabel(s.splitter, session.settings.mode)}。</small>
                  </>
                ) : (
                  <strong>請點擊「左盤」或「右盤」收下甜點</strong>
                )}
              </div>

              <div className="pg-confirm-row">
                <button
                  className="pg-primary"
                  disabled={
                    aiTurn
                      ? !ai.ready
                      : s.stage === "split"
                        ? !splitValid
                        : pickedPlate === null
                  }
                  onClick={() => {
                    if (aiTurn && ai.ready) {
                      game.commit(ai.ready.action, token);
                    } else if (s.stage === "split" && splitValid) {
                      game.commit({ type: "split", leftIndices }, token);
                    } else if (s.stage === "choose" && pickedPlate) {
                      game.commit({ type: "choose", plate: pickedPlate }, token);
                    }
                  }}
                >
                  {aiTurn
                    ? "看電腦行動"
                    : s.stage === "split"
                      ? "確認分盤"
                      : "確認選盤"}
                </button>
                <button
                  disabled={aiTurn || s.stage === "split" || pickedPlate === null}
                  onClick={() => setPickedPlate(null)}
                >
                  取消
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {rulesModal}
      {dialog === "menu" && (
        <SessionMenu
          onClose={() => setDialog(null)}
          onRestart={() => setDialog("confirm-restart")}
          onSetup={() => setDialog("confirm-setup")}
          onAbandon={() => setDialog("confirm-abandon")}
        />
      )}
      {dialog === "confirm-restart" && (
        <ConfirmDialog
          title="重開本局？"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            game.start(session.settings);
            setDialog(null);
          }}
        />
      )}
      {dialog === "confirm-setup" && (
        <ConfirmDialog
          title="回設定畫面？"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setSettings(session.settings);
            game.clear();
            setDialog(null);
          }}
        />
      )}
      {dialog === "confirm-abandon" && (
        <ConfirmDialog
          title="放棄本局？"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            game.clear();
            setDialog(null);
            onBack();
          }}
        />
      )}
    </GameShell>
  );
}
