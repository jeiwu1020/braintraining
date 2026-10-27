import React, { useEffect, useRef, useState } from "react";
import GameShell from "../game-ui/GameShell";
import {
  AI_DIFFICULTY_LABELS,
  TEAMS,
  other,
  type AiDifficulty,
} from "../../games/playground/types";
import {
  MASTER_FOODS,
  MASTER_FOOD_NAMES,
  MASTER_FOOD_GROUPS,
  MASTER_ORDERS,
  masterCounts,
  masterOrderProgress,
  masterCompactProgress,
  matchesMasterOrder,
  observeMaster,
  scoreMaster,
  scoreMasterCounts,
  type MasterAction,
  type MasterFood,
} from "../../games/playground/night-market/masterRules";
import {
  readMasterSettings,
  type MasterSettings,
} from "../../games/playground/night-market/masterSession";
import { chooseMaster } from "../../games/playground/night-market/masterAi";
import { useAi } from "./useSession";
import { useMasterSession } from "./useMasterSession";
import { Modal, ConfirmDialog, teamLabel, useRoving } from "./Common";
import "./night-market-master.css";

const makeWorker = () =>
  new Worker(
    new URL(
      "../../games/playground/night-market/masterAi.worker.ts",
      import.meta.url,
    ),
    { type: "module" },
  );
export const masterArt = (food: MasterFood) =>
  ["noodle", "chicken", "tea"].includes(food)
    ? `/playground/master/${food}-v1.webp`
    : `/playground/${food}.webp`;
export default function NightMarketMaster({ onBack }: { onBack: () => void }) {
  const game = useMasterSession(),
    { state: s, journal, token } = game;
  const [settings, setSettings] = useState<MasterSettings>(readMasterSettings),
    [dialog, setDialog] = useState<string | null>(null),
    [reviewed, setReviewed] = useState<string | null>(null);
  const [selection, setSelection] = useState<{
    slot: number;
    token: string;
  } | null>(null);
  const confirm = useRef<HTMLButtonElement>(null),
    review = useRef<HTMLButtonElement>(null),
    grid = useRoving(4, 4, confirm);
  const selected = selection?.token === token ? selection.slot : null;
  const aiTurn = !!(
    s &&
    journal?.settings.mode === "solo" &&
    s.turn === "B" &&
    s.phase === "playing"
  );
  const aiSeed =
    s && journal ? (journal.aiSeed ^ (s.round * 97) ^ s.picks) >>> 0 : 0;
  const ai = useAi<MasterAction>(
    aiTurn,
    token,
    makeWorker,
    s
      ? {
          observation: observeMaster(s),
          seed: aiSeed,
          difficulty: journal!.settings.aiDifficulty,
        }
      : {},
    () => ({
      type: "pick",
      slot: chooseMaster(
        observeMaster(s!),
        aiSeed,
        journal!.settings.aiDifficulty,
      ),
    }),
  );
  useEffect(() => setSelection(null), [token]);
  useEffect(() => {
    if (s && s.phase !== "playing" && reviewed !== token)
      review.current?.focus();
  }, [s?.phase, token, reviewed]);
  const clearSelection = () => {
    setSelection(null);
    grid.refs.current[grid.focus]?.focus();
  };
  const rules = dialog === "rules" && (
    <Modal title="夜市大師版玩法" onClose={() => setDialog(null)}>
      <ol>
        <li>四張菜牌全部公開：選一張、看預覽、再確認。</li>
        <li>每隊每輪拿8張，仍然兩輪；第2輪換先手，餐盤與牌組重新開始。</li>
        <li>
          六種菜各4張，共24張。原槽補牌，最後一手不補。雙方餐盤與各菜未翻開數量公開。
        </li>
      </ol>
      <h3>菜分</h3>
      <p>
        飯糰每2張5分，餘1張另加1分；玉米每張2分；豆花首張4分、之後每張1分。麵線、雞排、冬瓜茶每張2分。
      </p>
      <h3>三張有效訂單</h3>
      <p>
        每輪只啟用畫面上的3／12種訂單，第二輪不重複第一輪訂單。雙方都可完成，每張訂單每隊每輪只加一次。同一張菜可以同時符合多張訂單，不消耗菜牌。滿8張才結算；「目前符合」不是已鎖定分數。
      </p>
      <p>
        四味剛好：拿到第5種會失效。整整齊齊：忽略0張，增加一張可能破壞偶數。主食＝飯糰、麵線；小吃＝玉米、雞排；甜飲＝豆花、冬瓜茶。
      </p>
      {Object.entries(MASTER_ORDERS).map(([id, o]) => (
        <p key={id}>
          <strong>
            {o.name}＋{o.points}：
          </strong>
          {o.condition}。
        </p>
      ))}
      <h3>預選與結算</h3>
      <p>
        2飯糰＋2玉米＋2豆花＋2冬瓜茶＝18菜分；若啟用四味剛好、甜點茶會、雙份分享，再加4＋4＋3＝29。最後豆花改麵線雖多1菜分，卻破壞四種條件，只得26。
      </p>
      <p>
        方向鍵移動，Enter預選、再確認；Escape取消。兩隊撤回一手；單人回到上一個人方決策。結算後不跨輪撤回。返回或重新整理可續局，關閉分頁不保證保留；大師版與舊玩法分開暫存。電腦只在按下「看電腦行動」後出手，不能看秘密牌序。
      </p>
    </Modal>
  );
  const resetDialog = dialog === "reset" && (
    <ConfirmDialog
      title="只重設大師版？"
      onCancel={() => setDialog(null)}
      onConfirm={() => {
        if (journal) setSettings(journal.settings);
        game.clear();
        setDialog(null);
      }}
    />
  );
  if (game.corrupt)
    return (
      <>
        <GameShell
          className="pg-shell pg-master"
          title="夜市選菜會・大師版"
          onBack={onBack}
        >
          <div className="nm-setup">
            <section className="pg-paper nm-setup-panel">
              <h2>大師版暫存無法繼續</h2>
              <p>
                可能是未知版本或內容損壞。原暫存仍保留，舊一般／進階局不受影響。
              </p>
              <button onClick={() => setDialog("reset")}>重新設定大師版</button>
            </section>
          </div>
        </GameShell>
        {resetDialog}
      </>
    );
  if (!s || !journal)
    return (
      <>
        <GameShell
          className="pg-shell pg-master"
          title="夜市選菜會・大師版"
          subtitle="六種菜・三張訂單・每隊8次・仍然兩輪"
          onBack={onBack}
          backLabel="返回桌遊新樂園"
          actions={<button onClick={() => setDialog("rules")}>玩法</button>}
        >
          <div className="nm-setup">
            <div className="nm-menu-art" aria-hidden="true">
              <div>
                {MASTER_FOODS.map((f) => (
                  <img key={f} src={masterArt(f)} alt="" />
                ))}
              </div>
              <strong>熟悉的夜市，更多的取捨</strong>
            </div>
            <section className="pg-paper nm-setup-panel">
              <h2>夜市大師，開桌了</h2>
              <p>搭配六種菜色，完成訂單，挑戰更高分！</p>
              <h3>遊玩模式</h3>
              <div className="pg-choice">
                {(["teams", "solo"] as const).map((mode) => (
                  <button
                    key={mode}
                    aria-pressed={settings.mode === mode}
                    onClick={() => setSettings({ ...settings, mode })}
                  >
                    {mode === "teams" ? "兩隊" : "單人"}
                  </button>
                ))}
              </div>
              {settings.mode === "solo" && (
                <>
                  <h3>電腦難度</h3>
                  <div className="pg-choice">
                    {(["easy", "standard", "challenge"] as AiDifficulty[]).map(
                      (d) => (
                        <button
                          key={d}
                          aria-pressed={settings.aiDifficulty === d}
                          onClick={() =>
                            setSettings({ ...settings, aiDifficulty: d })
                          }
                        >
                          {AI_DIFFICULTY_LABELS[d]}
                        </button>
                      ),
                    )}
                  </div>
                  <p>
                    {settings.aiDifficulty === "easy"
                      ? "以自身收益為主，較少卡對手。"
                      : settings.aiDifficulty === "standard"
                        ? "兼顧眼前菜分與下一個組合。"
                        : "考慮對手回應，但不讀秘密牌序。"}
                  </p>
                </>
              )}
              <p>
                ① 選一張，再確認
                <br />② 看三張訂單的取捨
                <br />③ 每隊8張，兩輪比總分
              </p>
              <button
                className="pg-primary"
                onClick={() => game.start(settings)}
              >
                開始大師版
              </button>
            </section>
          </div>
        </GameShell>
        {rules}
      </>
    );
  const summary = s.phase !== "playing",
    showSummary = summary && reviewed === token,
    finished = s.phase === "finished";
  const observation = observeMaster(s),
    mine = masterCounts(s.hands[s.turn]),
    current = scoreMasterCounts(mine, s.orders, true);
  const preview =
    selected !== null && s.market[selected]
      ? scoreMasterCounts(
          masterCounts([...s.hands[s.turn], s.market[selected]!]),
          s.orders,
          true,
        )
      : null;
  const lost = preview
      ? current.awarded.filter((o) => !preview.awarded.includes(o))
      : [],
    gained = preview
      ? preview.awarded.filter((o) => !current.awarded.includes(o))
      : [];
  const lastTeam = other(s.turn),
    lastCard = summary ? s.hands[lastTeam].at(-1) : undefined;
  const totals = {
    A: scoreMaster(s, "A").total + s.previous.A,
    B: scoreMaster(s, "B").total + s.previous.B,
  };
  const winner =
    totals.A === totals.B
      ? "同分，共享勝利"
      : `${totals.A > totals.B ? "A" : "B"}隊獲勝`;
  return (
    <GameShell
      className="pg-shell pg-master"
      title="夜市選菜會・大師版"
      subtitle={`${journal.settings.mode === "solo" ? `單人・${AI_DIFFICULTY_LABELS[journal.settings.aiDifficulty]}電腦` : "兩隊"}・第 ${s.round}／2 輪`}
      onBack={onBack}
      backLabel="返回桌遊新樂園"
      actions={
        <>
          <button onClick={game.undo} disabled={!game.canUndo}>
            撤回
          </button>
          <button onClick={() => setDialog("rules")}>玩法</button>
          <button onClick={() => setDialog("options")}>選項</button>
        </>
      }
    >
      <div
        className={`nm-layout ${showSummary ? "is-summary" : ""}`}
        data-phase={aiTurn ? "awaiting_ai_reveal" : s.phase}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !dialog) {
            e.preventDefault();
            clearSelection();
          }
        }}
      >
        <div className="nm-board">
          <div className="nm-receipts">
            {TEAMS.map((t) => {
              const c = masterCounts(s.hands[t]),
                score = scoreMaster(s, t);
              return (
                <section
                  key={t}
                  className={`pg-paper nm-receipt nm-team-${t}`}
                  aria-label={`${t} 隊餐盤`}
                >
                  <header>
                    <strong>{teamLabel(t, journal.settings.mode)}</strong>
                    <span>已拿 {s.hands[t].length}／8</span>
                    <b>
                      {score.total}
                      <small>分</small>
                    </b>
                    {s.round === 2 && (
                      <span className="nm-previous">首輪{s.previous[t]}</span>
                    )}
                  </header>
                  <div className="nm-counts">
                    {MASTER_FOODS.map((f) => (
                      <span key={f}>
                        {f === "corn" ? "玉米" : MASTER_FOOD_NAMES[f]}{" "}
                        <b>{c[f]}</b>
                      </span>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          {!showSummary && (
            <section className="nm-orders" aria-label="本輪公開訂單">
              <h2>
                本輪啟用 3／12 種訂單 <small>輪末才加分・雙方都可完成</small>
              </h2>
              <div>
                {s.orders.map((o) => (
                  <article
                    className="pg-paper nm-order"
                    key={o}
                    aria-label={`${MASTER_ORDERS[o].name}：${MASTER_ORDERS[o].condition}，加${MASTER_ORDERS[o].points}分`}
                  >
                    <strong className="nm-order-name">
                      {MASTER_ORDERS[o].name}
                    </strong>
                    <div className="nm-condition">
                      {MASTER_ORDERS[o].condition}
                      <b>＋{MASTER_ORDERS[o].points}</b>
                    </div>
                    <div className="nm-order-progress">
                      {TEAMS.map((t) => (
                        <span
                          key={t}
                          className={
                            matchesMasterOrder(masterCounts(s.hands[t]), o)
                              ? "is-met"
                              : ""
                          }
                        >
                          {t}{" "}
                          {matchesMasterOrder(masterCounts(s.hands[t]), o)
                            ? "✓"
                            : "○"}{" "}
                          <span className="nm-progress-full" aria-hidden="true">
                            {masterOrderProgress(masterCounts(s.hands[t]), o)}
                          </span>
                          <span
                            className="nm-progress-short"
                            aria-hidden="true"
                          >
                            {masterCompactProgress(masterCounts(s.hands[t]), o)}
                          </span>
                          <span className="sr-only">
                            {masterOrderProgress(masterCounts(s.hands[t]), o)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
          {!summary ? (
            <div className="nm-market" role="group" aria-label="四張公開菜牌">
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
                  aria-label={`${i + 1}號${card ? MASTER_FOOD_NAMES[card.food] : "空位"}`}
                  className={`nm-card ${selected === i ? "is-selected" : ""}`}
                  data-master-slot={i}
                >
                  <span className="nm-slot">{i + 1}</span>
                  {card && (
                    <>
                      <img src={masterArt(card.food)} alt="" />
                      <strong>{MASTER_FOOD_NAMES[card.food]}</strong>
                      <small>{MASTER_FOOD_GROUPS[card.food]}</small>
                    </>
                  )}
                  {selected === i && (
                    <span className="nm-selected" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : !showSummary && lastCard ? (
            <section className="pg-paper nm-last-pick" aria-label="最後一手">
              <img
                src={masterArt(lastCard.food)}
                alt={MASTER_FOOD_NAMES[lastCard.food]}
              />
              <div>
                <span>第{s.round}輪・最後一手</span>
                <h2>{s.last}</h2>
                <p>餐盤已更新，先看清楚再結算。</p>
                <strong>
                  基本菜分{" "}
                  {
                    scoreMasterCounts(
                      masterCounts(s.hands[lastTeam].slice(0, -1)),
                    ).base
                  }{" "}
                  → {scoreMaster(s, lastTeam).base} 分
                </strong>
              </div>
            </section>
          ) : (
            <section className="pg-paper nm-summary" aria-label="本輪結算">
              <h2>{finished ? winner : "第1輪完成"}</h2>
              <div className="nm-score-columns">
                {TEAMS.map((t) => {
                  const score = scoreMaster(s, t);
                  return (
                    <div key={t}>
                      <h3>{teamLabel(t, journal.settings.mode)}</h3>
                      <p className="nm-score-parts">
                        {MASTER_FOODS.map((f, i) => (
                          <span key={f}>
                            {f === "corn" ? "玉米" : MASTER_FOOD_NAMES[f]}{" "}
                            {score.parts[i]}
                          </span>
                        ))}
                      </p>
                      <p>
                        基本菜分 <b>{score.base}</b> ＋ 訂單{" "}
                        <b>{score.bonus}</b>
                      </p>
                      <ul>
                        {s.orders.map((o) => (
                          <li key={o} data-order-score={o}>
                            {score.awarded.includes(o) ? "✓" : "○"}{" "}
                            {MASTER_ORDERS[o].name}
                            <b>
                              ＋
                              {score.awarded.includes(o)
                                ? MASTER_ORDERS[o].points
                                : 0}
                            </b>
                          </li>
                        ))}
                      </ul>
                      <strong className="nm-round-total">
                        本輪 {score.total}分{finished && `・總分 ${totals[t]}`}
                      </strong>
                      {finished && (
                        <small>
                          首輪{s.previous[t]} ＋ 本輪{score.total}
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {!showSummary && (
            <footer className="nm-footer">
              <div className="nm-deck" aria-label="牌庫未翻開">
                <strong>未翻開</strong>
                {MASTER_FOODS.map((f) => (
                  <span key={f}>
                    {f === "corn" ? "玉米" : MASTER_FOOD_NAMES[f]}{" "}
                    <b>{observation.unknown[f]}</b>
                  </span>
                ))}
              </div>
              <div className="nm-scoring">
                飯糰每對5分、餘1張1分｜玉米2分｜豆花首張4、後續1｜新菜每張2分
              </div>
            </footer>
          )}
        </div>
        <aside className="pg-paper nm-controls">
          <h2 aria-live="polite">
            {summary
              ? showSummary
                ? "本輪結算"
                : "看看最後一手"
              : aiTurn
                ? "▲ 電腦回合"
                : `輪到 ${teamLabel(s.turn, "teams")}`}
          </h2>
          {!summary ? (
            <>
              <div className="nm-preview" aria-live="polite">
                {aiTurn ? (
                  <>
                    <strong>
                      {ai.failed
                        ? "電腦暫時無法行動"
                        : ai.ready
                          ? "電腦準備好了"
                          : "電腦思考中…"}
                    </strong>
                    <span>按下才顯示電腦行動</span>
                  </>
                ) : preview && selected !== null ? (
                  <>
                    <span>
                      已選{selected + 1}號{" "}
                      {MASTER_FOOD_NAMES[s.market[selected]!.food]}
                    </span>
                    <strong>
                      菜分 {current.base} → {preview.base}
                    </strong>
                    <span>
                      目前符合訂單 {current.bonus} → {preview.bonus}
                    </span>
                    {lost.length > 0 && (
                      <b className="nm-warning" role="status">
                        會失去：
                        {lost.map((o) => MASTER_ORDERS[o].name).join("、")}
                      </b>
                    )}
                    {gained.length > 0 && (
                      <b className="nm-gain">
                        可符合：
                        {gained.map((o) => MASTER_ORDERS[o].name).join("、")}
                      </b>
                    )}
                    <small>預估條件，滿8張才結算</small>
                  </>
                ) : (
                  <>
                    <strong>選一張，再確認</strong>
                    <span>先看菜分，也看訂單</span>
                  </>
                )}
              </div>
              <div className="nm-confirm-row">
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
                <button disabled={selected === null} onClick={clearSelection}>
                  取消
                </button>
              </div>
              <p className="nm-last-action" aria-live="polite">
                {s.last}
              </p>
              <small>牌庫剩{s.deck.length}張</small>
            </>
          ) : (
            <>
              <p className="nm-last-action" aria-label="最後拿取紀錄">
                {s.last}
              </p>
              {!showSummary ? (
                <button
                  ref={review}
                  className="pg-primary"
                  onClick={() => setReviewed(token)}
                >
                  查看結算
                </button>
              ) : (
                <>
                  <p>
                    {finished ? "兩輪總分已結算" : "下一輪換先手，重新選菜。"}
                  </p>
                  <button
                    className="pg-primary"
                    onClick={() =>
                      finished
                        ? game.rematch()
                        : game.commit({ type: "next-round" }, token)
                    }
                  >
                    {finished ? "再玩一局" : "開始第 2 輪"}
                  </button>
                  <button onClick={onBack}>返回桌遊新樂園</button>
                  {finished && (
                    <button onClick={() => setDialog("reset")}>重新設定</button>
                  )}
                </>
              )}
            </>
          )}
          {game.storageError && (
            <p role="alert" className="nm-warning">
              瀏覽器無法暫存，離開可能遺失本局。
            </p>
          )}
        </aside>
      </div>
      {rules}
      {resetDialog}
      {dialog === "options" && (
        <Modal title="大師版本局選項" onClose={() => setDialog(null)}>
          <p>返回會保留大師版本局；舊一般／進階的暫存不受影響。</p>
          <button onClick={() => setDialog("restart")}>重開大師版本局</button>
          <button onClick={() => setDialog("reset")}>重新設定大師版</button>
        </Modal>
      )}
      {dialog === "restart" && (
        <ConfirmDialog
          title="重開大師版本局？"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            game.start(journal.settings, journal.starter);
            setDialog(null);
          }}
        />
      )}
    </GameShell>
  );
}
