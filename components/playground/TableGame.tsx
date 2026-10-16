import React, { useEffect, useState } from "react";
import { PLAYGROUND_CATALOG, PlaygroundId } from "../../data/playgroundCatalog";
import { Engine, savedSettings } from "../../games/playground/session";
import { Settings, Team } from "../../games/playground/types";
import { useSession } from "./useSession";
import { Modal, ConfirmDialog, Recovery } from "./Common";
import GameShell from "../game-ui/GameShell";
import "./table-games.css";
import "./table-landscape.css";
export interface TableContext<S, A> {
  state: S;
  choose: (a: A, label: string) => void;
  pending: boolean;
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
  const j = useSession(p.game, p.engine);
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
  const c = PLAYGROUND_CATALOG.find((x) => x.id === p.game)!;
  const begin = () => {
    j.start({ ...settings, mode: "teams" });
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
                choose: (action, label) =>
                  setPending({ action, label, token: j.token }),
                pending: !!pending,
              })
            )}
          </div>
        )}
      </GameShell>
      {modal === "record" && <Modal title="最近一次行動" onClose={() => setModal(null)}><p>{j.state?.message}</p><p>已確認的進度會保留在此分頁。</p></Modal>}
      {pending && (
        <Modal title="確認這個選擇" onClose={() => setPending(null)}>
          <p>{pending.label}</p>
          <p>確認才會扣除資源或推進回合。</p>
          <div className="pg-choice">
            <button onClick={() => setPending(null)}>取消選擇</button>
            <button
              className="pg-primary"
              onClick={() => {
                j.commit(pending.action, pending.token);
                setPending(null);
              }}
            >
              確認行動
            </button>
          </div>
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
        <ConfirmDialog
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
