import React, { useEffect, useRef, useState } from "react";
import { PLAYGROUND_CATALOG, PlaygroundId } from "../../data/playgroundCatalog";
import { Engine, savedSettings, readSaved } from "../../games/playground/session";
import { Settings, Team } from "../../games/playground/types";
import { useSession } from "./useSession";
import { Modal, ConfirmDialog, Recovery } from "./Common";
import { tableScore, tableAction } from "./tableReview";
import GameShell from "../game-ui/GameShell";
import "./table-games.css";
import "./table-landscape.css";
export interface TableContext<S, A> {
  state: S;
  choose: (a: A, label: string) => void;
  pending: boolean;
  confirmation?: React.ReactNode;
}
interface Props<S, A> {
  onBack: () => void;
  game: PlaygroundId;
  engine: Engine<S, A>;
  cooperative?: boolean;
  rules: React.ReactNode;
  steps: string[];
  demo: string[];
  tutorial?: React.ReactNode;
  art: React.ReactNode;
  summary: (s: S) => string;
  result: (s: S) => React.ReactNode;
  children: (c: TableContext<S, A>) => React.ReactNode;
}
export default function TableGame<
  S extends { phase: string; turn: Team; message: string },
  A,
>(p: Props<S, A>) {
  const updatedRules = p.game === "lighthouse" || p.game === "workshop";
  const j = useSession(p.game, p.engine, updatedRules ? "rules-v2" : undefined);
  const [starter, setStarter] = useState<Team>("A");
  const comparisonKey = "braintraining.playground.lantern.comparison";
  const [comparison, setComparison] = useState<{ seed: number; summary: string } | null>(() => {
    if (p.game !== "lantern") return null;
    try { const value = JSON.parse(sessionStorage.getItem(comparisonKey) || "null"); return Number.isInteger(value?.seed) && typeof value?.summary === "string" ? value : null; } catch { return null; }
  });
  const rematch = (swap: boolean) => {
    const old = j.session!;
    const value = { seed: old.seed, summary: `${old.starter}隊先手，${j.state!.phase === "finished" ? "已完成" : "中途重開"}：${tableScore(p.game, j.state)}` };
    setComparison(value);
    try { sessionStorage.setItem(comparisonKey, JSON.stringify(value)); } catch {}
    j.start(old.settings, swap ? (old.starter === "A" ? "B" : "A") : old.starter, old.seed);
    setModal(null); setPending(null);
  };
  const [settings, setSettings] = useState<Settings>(() =>
    savedSettings(p.game),
  );
  const [modal, setModal] = useState<"rules" | "teach" | "reset" | "record" | null>(null),
    [demo, setDemo] = useState(0),
    [pending, setPending] = useState<{
      action: A;
      label: string;
      token: string;
    } | null>(null);
  const inlineCancel = useRef<HTMLButtonElement>(null);
  const auctionTrigger = useRef<string | null>(null);
  useEffect(() => {
    if (p.game !== "auction") return;
    if (pending) inlineCancel.current?.focus();
    else if (auctionTrigger.current) {
      const name = auctionTrigger.current;
      const target = [...document.querySelectorAll<HTMLButtonElement>("button")].find(b => !b.disabled && (b.ariaLabel || b.textContent) === name);
      (target || document.querySelector<HTMLButtonElement>(".tg-auction-decision button:not(:disabled), .tg-auction .tg-result button"))?.focus();
      auctionTrigger.current = null;
    }
  }, [pending, p.game]);
  const c = PLAYGROUND_CATALOG.find((x) => x.id === p.game)!;
  const begin = () => {
    j.start({ ...settings, mode: "teams" }, starter);
    setModal(null);
    setPending(null);
  };
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPending(null);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  if (j.corrupt) return <Recovery onBack={pBack} onReset={() => j.clear()} />;
  function pBack() {
    setPending(null);
    p.onBack?.();
  }
  return (
    <>
      <GameShell
        className={`pg-shell tg-shell tg-${p.game} ${j.state ? "tg-live" : ""}`}
        title={c.title}
        onBack={pBack}
        backLabel="返回桌遊新樂園"
        subtitle={
          j.state
            ? p.summary(j.state)
            : p.cooperative
              ? "全團體合作・公開討論"
              : "A／B兩隊輪流・公開決策"
        }
        actions={
          <>
            <button onClick={() => setModal("rules")}>玩法</button>
            {j.state && <button onClick={() => setModal("record")}>紀錄</button>}
            {j.state && (
              <button
                onClick={() => {
                  setPending(null);
                  setModal("reset");
                }}
              >
                重開
              </button>
            )}
          </>
        }
      >
        {!j.state ? (
          <div className="tg-setup">
            <div className="tg-cover">
              {p.art}
              <h2>{c.title}</h2>
              <p>{c.description}</p>
            </div>
            <section className="pg-paper tg-settings">
              <h2>{p.cooperative ? "一艘船，一個團隊" : "兩隊共用一張桌"}</h2>
              <p>成員口述選擇，由帶領者點選及確認。</p>
              <div className="pg-choice" aria-label="本款難度">
                {(["normal", "advanced"] as const).map((level) => (
                  <button
                    key={level}
                    aria-pressed={settings.level === level}
                    onClick={() => setSettings({ ...settings, level })}
                  >
                    {level === "normal" ? "一般" : "進階"}
                  </button>
                ))}
              </div>
              <p>{c.difficultyDescriptions[settings.level]}</p>
              {updatedRules && readSaved(p.game) && <p>本款規則已更新，請開啟新局。舊版暫存已另外保留，不會套用新規則改寫。</p>}
              {p.game === "lantern" && <div className="pg-choice" aria-label="選擇先手">{(["A", "B"] as Team[]).map(team => <button key={team} aria-pressed={starter === team} onClick={() => setStarter(team)}>{team}隊先手</button>)}</div>}
              <button
                className="pg-primary"
                onClick={() => {
                  setDemo(0);
                  setModal("teach");
                }}
              >
                開始本局
              </button>
            </section>
          </div>
        ) : (
          <div className="tg-session">
            <div className="tg-feedback tg-announcement" role="status">
              {j.state.message}
            </div>
            {p.game === "lantern" && comparison?.seed === j.session?.seed && <p className="tg-rematch-comparison">同局比較 · 上一局{comparison.summary}。本局 {j.session?.starter}隊先手。</p>}
            {j.storageError && (
              <p role="alert">此瀏覽器無法暫存，離開前請先完成本局。</p>
            )}
            {j.state.phase === "finished" ? (
              <section className="pg-paper tg-result">
                <h2>本局結果</h2>
                {p.result(j.state)}
                <button
                  className="pg-primary"
                  onClick={() => setModal("reset")}
                >
                  再玩一局
                </button>
                <button onClick={pBack}>返回收藏室</button>
              </section>
            ) : (
              p.children({
                state: j.state,
                choose: (action, label) => {
                  if (p.game === "auction" && document.activeElement instanceof HTMLButtonElement) auctionTrigger.current = document.activeElement.ariaLabel || document.activeElement.textContent;
                  setPending({ action, label, token: j.token });
                },
                pending: !!pending,
                confirmation: p.game === "auction" && pending ? <section className="tg-inline-confirm" aria-label="確認拍賣選擇" role="region"><p aria-live="polite">{pending.label}</p><div className="pg-choice"><button ref={inlineCancel} onClick={() => setPending(null)}>取消選擇</button><button className="pg-primary" onClick={() => { j.commit(pending.action, pending.token); setPending(null); }}>確認行動</button></div></section> : null,
              })
            )}
          </div>
        )}
      </GameShell>
      {modal === "record" && <Modal title="完整操作與得分回顧" onClose={() => setModal(null)}>
        <p>局號 {j.session?.seed} · {j.session?.starter}隊先手 · 已確認 {j.session?.actions.length} 步</p>
        <p>開局：{j.states[0]?.message} {j.states[0] && tableScore(p.game, j.states[0])}</p>
        <ol>{j.states.slice(1).map((state, i) => <li key={i} data-review-step={i + 1}><strong>第{i + 1}步 · {j.states[i].turn}隊</strong><p>{tableAction(p.game, j.states[i], j.session!.actions[i], state)}</p><p>{state.message}</p><small>{p.summary(state)} · {tableScore(p.game, state)}</small></li>)}</ol>
        <p>紀錄由每一步正式規則重播，重新整理後仍可查看。</p>
      </Modal>}
      {pending && p.game !== "auction" && (
        <Modal title="確認這個選擇" onClose={() => setPending(null)}>
          <p>{pending.label}</p><p>確認才會扣除資源或推進回合。</p>
          <div className="pg-choice"><button onClick={() => setPending(null)}>取消選擇</button><button className="pg-primary" onClick={() => { j.commit(pending.action, pending.token); setPending(null); }}>確認行動</button></div>
        </Modal>
      )}
      {modal === "rules" && (
        <Modal title={`${c.title}・完整玩法`} onClose={() => setModal(null)}>
          {p.rules}
          <h3>帶領方式與暫存</h3>
          <p>
            全體看同一畫面，先口述討論，再由帶領者操作。預選可取消或按
            Escape；只有確認才生效。返回收藏室及同分頁重新整理會保留已確認進度，關閉分頁不保證保留。
          </p>
          <button
            onClick={() => {
              setDemo(0);
              setModal("teach");
            }}
          >
            教學與玩法說明
          </button>
        </Modal>
      )}
      {modal === "teach" && (
        <Modal title="三步出發" onClose={() => setModal(null)}>
          <ol>
            {p.steps.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
          {p.tutorial || <section className="tg-demo">
            <h3>情境說明（不影響正式局）</h3>
            <p aria-live="polite">{p.demo[demo]}</p>
            <button onClick={() => setDemo((demo + 1) % p.demo.length)}>
              下一段說明
            </button>
          </section>}
          {!j.state && (
            <button className="pg-primary" onClick={begin}>
              開始正式局
            </button>
          )}
        </Modal>
      )}
      {modal === "reset" && (
        p.game === "lantern" ? <Modal title="再戰花燈街區" onClose={() => setModal(null)}>
          <p>同局保留三次公開價值，清空布局與分數。先後手可能影響結果，建議交換先手各玩一局，再比較兩局合計分數。</p>
          <div className="pg-choice"><button onClick={() => setModal(null)}>保留本局</button>
            <button onClick={() => { rematch(false); }}>同局再戰</button>
            <button onClick={() => { rematch(true); }}>同局交換先手</button>
            <button onClick={() => { j.start(j.session!.settings, j.session!.starter); setComparison(null); try { sessionStorage.removeItem(comparisonKey); } catch {} setModal(null); setPending(null); }}>全新一局</button></div>
        </Modal> : <ConfirmDialog
          title="重開這款桌遊？"
          onCancel={() => setModal(null)}
          onConfirm={() => {
            j.start(j.session!.settings);
            setModal(null);
            setPending(null);
          }}
        />
      )}
    </>
  );
}

