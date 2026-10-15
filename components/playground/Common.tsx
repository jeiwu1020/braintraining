import React, { useEffect, useRef } from "react";
import { PlaygroundId, PLAYGROUND_CATALOG } from "../../data/playgroundCatalog";
import { PREFIX } from "../../games/playground/session";
import { Settings, Team } from "../../games/playground/types";
import GameShell from "../game-ui/GameShell";
export const teamLabel = (team: Team, mode: string) =>
  `${team === "A" ? "●" : "▲"} ${team} 隊${mode === "solo" && team === "B" ? "・電腦" : ""}`;
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const root = ref.current;
    root?.querySelector<HTMLElement>("button")?.focus();
    return () => before?.focus();
  }, []);
  return (
    <div
      className="pg-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="pg-modal pg-paper"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
          if (e.key === "Tab") {
            const nodes = Array.from(
              ref.current?.querySelectorAll(
                'button:not(:disabled),[tabindex="0"]',
              ) ?? [],
            ) as HTMLElement[];
            const first = nodes[0],
              last = nodes.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <header>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="關閉">
            關閉
          </button>
        </header>
        <div className="pg-modal-content">{children}</div>
      </div>
    </div>
  );
}
export function Setup({
  game,
  settings,
  onChange,
  onStart,
  onBack,
  onRules,
}: {
  game: PlaygroundId;
  settings: Settings;
  onChange: (s: Settings) => void;
  onStart: () => void;
  onBack: () => void;
  onRules: () => void;
}) {
  const c = PLAYGROUND_CATALOG.find((c) => c.id === game)!;
  const [teaching, setTeaching] = React.useState(false),
    [example, setExample] = React.useState(false);
  const begin = () => {
    try {
      sessionStorage.setItem(`${PREFIX}.${game}.tutorial`, "seen");
    } catch {}
    setTeaching(false);
    onStart();
  };
  const start = () => {
    try {
      if (sessionStorage.getItem(`${PREFIX}.${game}.tutorial`) === "seen") {
        onStart();
        return;
      }
    } catch {}
    setTeaching(true);
  };
  const steps =
    game === "night-market"
      ? ["從四張菜選一張", "看餐盤組合得分", "每人六張，玩兩輪比總分"]
      : ["走一格，或放一面牆", "不能把任何一方的路封死", "先到對岸就贏"];
  return (
    <>
      <GameShell
        className="pg-shell"
        title={c.title}
        subtitle="先選模式與難度，再開始本局"
        onBack={onBack}
        backLabel="返回桌遊新樂園"
        actions={
          <>
            <button className="pg-button" onClick={() => setTeaching(true)}>
              三步教學
            </button>
            <button className="pg-button" onClick={onRules}>
              玩法
            </button>
          </>
        }
      >
        <div className="pg-setup">
          <div className={`pg-box-art pg-art-${game}`} aria-hidden="true">
            <span>{c.title}</span>
          </div>
          <section className="pg-paper pg-setup-controls">
            <h2>一起來玩一局</h2>
            <div className="pg-choice" aria-label="遊玩模式">
              {(["teams", "solo"] as const).map((mode) => (
                <button
                  key={mode}
                  aria-pressed={settings.mode === mode}
                  onClick={() => onChange({ ...settings, mode })}
                >
                  {mode === "teams" ? "兩隊" : "單人"}
                </button>
              ))}
            </div>
            <p>
              {settings.mode === "teams"
                ? "A、B 兩隊共用畫面輪流"
                : "你或全團體對電腦，按鈕揭示電腦行動"}
            </p>
            <div className="pg-choice" aria-label="難度">
              {(["normal", "advanced"] as const).map((level) => (
                <button
                  key={level}
                  aria-pressed={settings.level === level}
                  onClick={() => onChange({ ...settings, level })}
                >
                  {level === "normal" ? "一般" : "進階"}
                </button>
              ))}
            </div>
            <p>{c.difficultyDescriptions[settings.level]}</p>
            <button className="pg-primary" onClick={start}>
              開始本局
            </button>
          </section>
        </div>
      </GameShell>
      {teaching && (
        <Modal title="先看三步，再開局" onClose={() => setTeaching(false)}>
          <ol>
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {game === "night-market" && (
            <div className="pg-tutorial-example">
              <p>試選示範：餐盤已有 1 個飯糰（1 分）。</p>
              <button
                aria-pressed={example}
                onClick={() => setExample(!example)}
              >
                {example ? "✓ 已預選第 2 個飯糰" : "試選第 2 個飯糰"}
              </button>
              <p aria-live="polite">
                {example
                  ? "預選後湊一對：1 分 → 5 分，增加 4 分。"
                  : "先看得分變化，再按確認；這裡不計入正式局。"}
              </p>
            </div>
          )}
          <div className="pg-choice">
            <button onClick={begin}>略過並開始</button>
            <button className="pg-primary" onClick={begin}>
              開始
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Recovery({
  onReset,
  onBack,
}: {
  onReset: () => void;
  onBack: () => void;
}) {
  return (
    <GameShell
      className="pg-shell"
      title="暫存無法繼續"
      onBack={onBack}
      backLabel="返回桌遊新樂園"
    >
      <div className="pg-centered">
        <section className="pg-paper">
          <h2>這份暫存無法繼續，請重新開局</h2>
          <p>只會清除這款桌遊的暫存。</p>
          <button className="pg-primary" onClick={onReset}>
            重新開局
          </button>
        </section>
      </div>
    </GameShell>
  );
}
export function useRoving(
  count: number,
  columns: number,
  confirmRef: React.RefObject<HTMLButtonElement>,
) {
  const [focus, setFocus] = React.useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % count;
    else if (e.key === "ArrowLeft") next = (i - 1 + count) % count;
    else if (e.key === "ArrowDown") next = (i + columns) % count;
    else if (e.key === "ArrowUp") next = (i - columns + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    else if (e.key === "Enter" || e.key === " ") {
      setTimeout(() => confirmRef.current?.focus(), 0);
      return;
    } else return;
    e.preventDefault();
    setFocus(next);
    refs.current[next]?.focus();
  };
  return { focus, setFocus, refs, onKeyDown };
}
export function SessionMenu({
  onClose,
  onRestart,
  onSetup,
  onAbandon,
}: {
  onClose: () => void;
  onRestart: () => void;
  onSetup: () => void;
  onAbandon: () => void;
}) {
  return (
    <Modal title="本局選項" onClose={onClose}>
      <p>返回桌遊新樂園會保留本局。以下操作會清除目前進度。</p>
      <div className="pg-stack">
        <button onClick={onRestart}>重開本局…</button>
        <button onClick={onSetup}>重新設定…</button>
        <button onClick={onAbandon}>放棄本局…</button>
      </div>
    </Modal>
  );
}
export function ConfirmDialog({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>目前已確認的進度將清除。放棄只標示未完成，不計勝負。</p>
      <div className="pg-choice">
        <button onClick={onCancel}>保留本局</button>
        <button className="pg-primary" onClick={onConfirm}>
          確定
        </button>
      </div>
    </Modal>
  );
}
export const modeTitle = (settings: Settings) =>
  `${settings.mode === "teams" ? "兩隊" : "單人"}・${settings.level === "normal" ? "一般" : "進階"}`;
