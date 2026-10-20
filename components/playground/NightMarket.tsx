import React, { useEffect, useRef, useState } from "react";
import GameShell from "../game-ui/GameShell";
import { Engine, savedSettings } from "../../games/playground/session";
import { other, Settings, TEAMS } from "../../games/playground/types";
import { chooseNight } from "../../games/playground/night-market/ai";
import {
  applyNight,
  counts,
  createNight,
  FOOD_NAMES,
  FOODS,
  matchesOrder,
  NightAction,
  NightState,
  observeNight,
  ORDERS,
  scoreCounts,
  scoreNight,
} from "../../games/playground/night-market/rules";
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
const engine: Engine<NightState, NightAction> = {
  create: createNight,
  apply: applyNight,
  validAction: (a: any): a is NightAction =>
    a?.type === "next-round" ||
    (a?.type === "pick" &&
      Number.isInteger(a.slot) &&
      a.slot >= 0 &&
      a.slot < 4),
};
const makeWorker = () =>
  new Worker(
    new URL(
      "../../games/playground/night-market/ai.worker.ts",
      import.meta.url,
    ),
    { type: "module" },
  );
export default function NightMarket({ onBack }: { onBack: () => void }) {
  const game = useSession("night-market", engine),
    { state: s, session, token } = game;
  const [settings, setSettings] = useState<Settings>(() =>
    savedSettings("night-market"),
  );
  const [reviewedRound, setReviewedRound] = useState<string | null>(null);
  const [selection, setSelection] = useState<{
      slot: number;
      token: string;
    } | null>(null),
    [dialog, setDialog] = useState<string | null>(null);
  const confirm = useRef<HTMLButtonElement>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const grid = useRoving(4, 2, confirm);
  const aiTurn = !!(
    s &&
    session?.settings.mode === "solo" &&
    s.turn === "B" &&
    s.phase === "playing"
  );
  const aiSeed = s && session
    ? (session.aiSeed ^ (s.round * 97) ^ s.picks) >>> 0
    : 0;
  const ai = useAi<NightAction>(
    aiTurn,
    token,
    makeWorker,
    s
      ? {
          observation: observeNight(s),
          seed: aiSeed,
          difficulty: session!.settings.aiDifficulty,
        }
      : {},
    () => ({
      type: "pick",
      slot: session!.settings.aiDifficulty === undefined
        ? s!.market.findIndex(Boolean)
        : chooseNight(observeNight(s!), aiSeed, session!.settings.aiDifficulty),
    }),
  );
  useEffect(() => setSelection(null), [token]);
  useEffect(() => {
    if (s && s.phase !== "playing" && reviewedRound !== token)
      reviewButton.current?.focus();
  }, [s?.phase, token, reviewedRound]);
  const selected = selection?.token === token ? selection.slot : null;
  const clear = () => {
    setSelection(null);
    grid.refs.current[grid.focus]?.focus();
  };
  const settingsNow = session?.settings ?? settings;
  const rules = dialog === "rules" && (
    <Modal title="夜市選菜會玩法" onClose={() => setDialog(null)}>
      <ol>
        <li>從四張公開菜色選一張，先預覽，再確認。</li>
        <li>看雙方餐盤，選擇當下分數或下一個組合。</li>
        <li>每人六張，玩兩輪比總分。第 2 輪換先手，同分共享勝利。</li>
      </ol>
      <h3>三種菜怎麼算分</h3>
      <p>
        飯糰：每 2 個 5 分，剩 1 個另加 1 分。玉米：每支 2 分。豆花：首碗 4
        分，之後每碗 1 分。
      </p>
      <p>
        例如 2 飯糰＋3 玉米＋1 豆花＝5＋6＋4＝15 分。預選第 1 碗豆花會加 4
        分；按確認前不入帳。
      </p>
      <h3>進階公開訂單</h3>
      <p>
        進階模式每輪從四種訂單隨機抽出兩種；本輪只有畫面顯示的兩種有效，雙方都可完成。
        每人拿滿 6 張後才結算符合的訂單加分，中途符合不先加分。
        第 2 輪重新抽選，可能與上一輪重複。
      </p>
      <h3>可能抽到的四種訂單</h3>
      {Object.entries(ORDERS).map(([id, o]) => (
        <p key={id}>
          {o.name}：{o.condition}，＋{o.points} 分。
        </p>
      ))}
      <p>「整整齊齊」忽略 0 張菜色。</p>
      <p>
        每輪 18 張，三種各 6
        張；補牌留在原槽位，最後一手不補。未知牌序不公開，剩餘牌庫張數公開。
      </p>
      <h3>操作與暫存</h3>
      <p>
        方向鍵移動牌格焦點，Enter 預選後焦點到確認；Escape
        取消。兩隊可撤回一手；單人回到上個人方決策。換輪與結算後不能撤回上一輪。
      </p>
      <p>
        返回會保留本局；同一分頁重新整理後可繼續，關閉分頁不保證保留。電腦不會自動出手，按「看電腦行動」才揭示。
      </p>
    </Modal>
  );
  if (game.corrupt) return <Recovery onReset={game.clear} onBack={onBack} />;
  if (!s || !session)
    return (
      <>
        <Setup
          game="night-market"
          settings={settings}
          onChange={setSettings}
          onStart={() => game.start(settings)}
          onBack={onBack}
          onRules={() => setDialog("rules")}
        />
        {rules}
      </>
    );
  const remainingFood = observeNight(s).unknown;
  const currentScore = scoreNight(s, s.turn).base;
  const preview =
    selected !== null && s.market[selected]
      ? scoreCounts(counts([...s.hands[s.turn], s.market[selected]!])).base
      : null;
  const floor =
    s.round === 2
      ? session.actions.findIndex((a) => a.type === "next-round") + 1
      : 0;
  const scores = {
    A: scoreNight(s, "A").total + s.previous.A,
    B: scoreNight(s, "B").total + s.previous.B,
  };
  const finished = s.phase === "finished",
    summary = s.phase !== "playing";
  const showSummary = summary && reviewedRound === token;
  const lastTeam = other(s.turn);
  const lastCard = summary ? s.hands[lastTeam].at(-1) : undefined;
  const beforeLastScore = lastCard
    ? scoreCounts(counts(s.hands[lastTeam].slice(0, -1))).base
    : 0;
  const winner =
    scores.A === scores.B
      ? "同分，共享勝利"
      : `${scores.A > scores.B ? "A" : "B"} 隊獲勝`;
  return (
    <GameShell
      className="pg-shell pg-night"
      title="夜市選菜會"
      subtitle={`${modeTitle(session.settings)}・第 ${s.round} 輪／共 2 輪`}
      onBack={onBack}
      backLabel="返回桌遊新樂園"
      actions={
        <>
          <button
            className="pg-button"
            onClick={() => game.undo(floor)}
            disabled={!game.canUndo(floor)}
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
        <div className="pg-night-table">
          <div className="pg-receipts">
            {TEAMS.map((t) => {
              const c = counts(s.hands[t]);
              return (
                <section
                  key={t}
                  className={`pg-receipt pg-paper pg-team-${t}`}
                  aria-label={`${t} 隊餐盤`}
                >
                  <div>
                    <strong>{teamLabel(t, session.settings.mode)}</strong>
                    <span>已拿 {s.hands[t].length}／6</span>
                    <b>
                      {scoreNight(s, t).total}
                      <small> 分</small>
                    </b>
                  </div>
                  <div className="pg-counts">
                    {FOODS.map((f) => (
                      <span key={f}>
                        {f === "corn" ? "玉米" : FOOD_NAMES[f]} <b>{c[f]}</b>
                      </span>
                    ))}
                  </div>
                  {s.round === 2 && (
                    <span className="pg-previous">首輪 {s.previous[t]} 分</span>
                  )}
                </section>
              );
            })}
          </div>
          {s.orders.length > 0 && (
            <div className="pg-orders" aria-label="本輪公開訂單">
              <span className="pg-orders-label">
                本輪啟用 {s.orders.length}／{Object.keys(ORDERS).length} 種訂單
              </span>
              {s.orders.map((o) => (
                <div
                  key={o}
                  role="group"
                  aria-label={`${ORDERS[o].name}：${ORDERS[o].condition}，加 ${ORDERS[o].points} 分`}
                >
                  <b className="pg-order-title">
                    {ORDERS[o].name}＋{ORDERS[o].points}
                  </b>
                  <span className="pg-order-condition">
                    {ORDERS[o].condition}
                    <b className="pg-order-compact-points">
                      ＋{ORDERS[o].points}
                    </b>
                  </span>
                  <span>
                    {TEAMS.map(
                      (t) =>
                        `${t} ${matchesOrder(counts(s.hands[t]), o) ? "✓目前符合" : "○未符合"}`,
                    ).join("　")}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="pg-deck-foods" role="group" aria-label="牌庫未翻開">
            <strong>牌庫未翻開</strong>
            {FOODS.map((food) => (
              <span key={food}>{food === "corn" ? "玉米" : FOOD_NAMES[food]} <b>{remainingFood[food]}</b> 張</span>
            ))}
          </div>
          {!summary ? (
            <div className="pg-market" role="group" aria-label="四張公開菜牌">
              {s.market.map((card, i) => (
                <button
                  key={i}
                  ref={(el) => {
                    grid.refs.current[i] = el;
                  }}
                  tabIndex={grid.focus === i ? 0 : -1}
                  onFocus={() => grid.setFocus(i)}
                  onKeyDown={(e) => grid.onKeyDown(e, i)}
                  onClick={() => {
                    if (!aiTurn && card) setSelection({ slot: i, token });
                  }}
                  aria-disabled={aiTurn || !card}
                  aria-pressed={selected === i}
                  aria-label={`${i + 1} 號${card ? FOOD_NAMES[card.food] : "空位"}`}
                  className={`pg-food-card ${selected === i ? "is-selected" : ""}`}
                  data-market-slot={i}
                >
                  <span className="pg-card-number">{i + 1}</span>
                  {card && (
                    <>
                      <img
                        className="pg-food-art"
                        src={`/playground/${card.food}.webp`}
                        alt=""
                      />
                      <span className="pg-food-name">
                        {FOOD_NAMES[card.food]}
                      </span>
                    </>
                  )}
                  {selected === i && (
                    <span className="pg-selected-mark" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : !showSummary && lastCard ? (
            <section className="pg-last-pick pg-paper" aria-label="最後一手">
              <div className="pg-last-pick-copy" id="night-last-pick-detail">
                <span className="pg-last-pick-kicker">第 {s.round} 輪・最後一手</span>
                <h2>{s.last}</h2>
                <p>餐盤已更新，先看清楚這一手，再查看結算。</p>
                <strong>
                  基本菜分 {beforeLastScore} → {scoreNight(s, lastTeam).base} 分
                </strong>
                <small>公開訂單加分會在結算明細列出</small>
              </div>
              <img
                className="pg-last-pick-food"
                src={`/playground/${lastCard.food}.webp`}
                alt={FOOD_NAMES[lastCard.food]}
              />
            </section>
          ) : (
            <section
              className="pg-round-summary pg-paper"
              aria-label="本輪結算"
            >
              <h2>{finished ? winner : "第 1 輪完成"}</h2>
              <div className="pg-score-details">
                {TEAMS.map((t) => {
                  const score = scoreNight(s, t);
                  return (
                    <div key={t}>
                      <h3>{teamLabel(t, session.settings.mode)}</h3>
                      <p>
                        飯糰 {score.parts[0]}＋玉米 {score.parts[1]}＋豆花{" "}
                        {score.parts[2]}
                      </p>
                      {s.orders.length > 0 && <p>訂單加分 {score.bonus}</p>}
                      <strong>
                        本輪 {score.total} 分
                        {finished ? `・總分 ${scores[t]}` : ""}
                      </strong>
                    </div>
                  );
                })}
              </div>
              <p>
                {finished
                  ? "兩輪總分已結算。下一局交換先手。"
                  : "第 2 輪交換先手，餐盤重新開始。"}
              </p>
            </section>
          )}
          <div className="pg-scoring-ribbon">
            <span>
              飯糰成對 <b>5</b> 分
            </span>
            <span>
              玉米每支 <b>2</b> 分
            </span>
            <span>
              首碗豆花 <b>4</b> 分
            </span>
          </div>
        </div>
        <aside className="pg-control-panel pg-paper">
          <h2 aria-live="polite">
            {summary
              ? showSummary ? "本輪結算" : "看看最後一手"
              : aiTurn
                ? "▲ 電腦回合"
                : `輪到 ${teamLabel(s.turn, "teams")}`}
          </h2>
          {!summary && (
            <>
              <div className="pg-preview" aria-live="polite">
                {aiTurn ? (
                  <>
                    <strong>
                      {ai.failed
                        ? "電腦暫時無法行動"
                        : ai.ready
                          ? "電腦準備好了"
                          : "電腦思考中…"}
                    </strong>
                    <span>
                      {ai.ready?.fallback
                        ? "使用合法備用選擇"
                        : "按下才顯示電腦行動"}
                    </span>
                  </>
                ) : selected !== null ? (
                  <>
                    <span>
                      已選 {selected + 1} 號
                      {FOOD_NAMES[s.market[selected]!.food]}
                    </span>
                    <strong>
                      {currentScore} → {preview} 分
                    </strong>
                    <small>基本菜分，訂單於輪末計算</small>
                  </>
                ) : (
                  <>
                    <strong>選一張，再確認</strong>
                    <span>四張菜色都公開</span>
                  </>
                )}
              </div>
              <button
                ref={confirm}
                className="pg-primary"
                disabled={aiTurn ? !ai.ready : selected === null}
                onClick={() => {
                  if (aiTurn && ai.ready) game.commit(ai.ready.action, token);
                  else if (selected !== null)
                    game.commit(
                      { type: "pick", slot: selected },
                      selection!.token,
                    );
                }}
              >
                {aiTurn ? "看電腦行動" : "確認拿取"}
              </button>
              <button disabled={selected === null} onClick={clear}>
                取消
              </button>
              <div className="pg-last-action" aria-live="polite">
                {s.last}
              </div>
              <span className="pg-deck-count">牌庫剩 {s.deck.length} 張</span>
            </>
          )}
          {summary && (
            <>
              <p className="pg-last-action" aria-label="最後拿取紀錄" aria-live="polite">
                {s.last}
              </p>
              {!showSummary ? (
                <button ref={reviewButton} className="pg-primary" aria-describedby="night-last-pick-detail" onClick={() => setReviewedRound(token)}>
                  查看結算
                </button>
              ) : (
              <>
              <p>{finished ? winner : "雙方各拿滿六張"}</p>
              <button
                className="pg-primary"
                onClick={() => {
                  if (finished)
                    game.start(session.settings, other(session.starter));
                  else game.commit({ type: "next-round" }, token);
                }}
              >
                {finished ? "再玩一局" : "開始第 2 輪"}
              </button>
              <button onClick={onBack}>返回桌遊新樂園</button>
              {finished && (
                <button
                  onClick={() => {
                    setSettings(session.settings);
                    game.clear();
                  }}
                >
                  重新設定
                </button>
              )}
              </>
              )}
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
