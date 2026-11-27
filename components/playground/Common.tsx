import React, { useEffect, useRef } from "react";
import { PlaygroundId, PLAYGROUND_CATALOG } from "../../data/playgroundCatalog";
import { PREFIX } from "../../games/playground/session";
import { AI_DIFFICULTY_LABELS, AiDifficulty, Settings, Team } from "../../games/playground/types";
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
  const stepsMap: Record<string, string[]> = {
    "night-market": ["從四張菜選一張", "看餐盤組合得分", "每人六張，玩兩輪比總分"],
    "wall-race": ["走一格，或放一面牆", "不能把任何一方的路封死", "先到對岸就贏"],
    "frog-pond": ["點選己方青蛙，沿直橫斜線跳到空荷葉", "出發的荷葉沉入水底並獲得蓮花分數", "無路可跳即收尾，最後總蓮花多者勝"],
    "cloud-towers": ["移動己方建築師至相鄰格（最多爬高 1 層）", "在落點周圍相鄰格加蓋 1 層（到 4 層變穹頂）", "先站上 3F 高塔或困住對手立即獲勝"],
    "chef-split": ["主廚將本輪點心切分成左右兩盤（各至少 1 份）", "客人先挑走一盤，主廚收下剩餘那一盤", "兩隊輪流擔任主廚共 6 輪，湊成套組比總分"],
    "sumo-push": ["選己方棋子往上下左右推動一格", "後方相連己棋多於前方阻力時可整排推動", "率先將指定數量的對手棋子推出擂台獲勝"],
  };
  const steps = stepsMap[game] ?? stepsMap["wall-race"];
  return (
    <>
      <GameShell
        className="pg-shell"
        title={c.title}
        subtitle="先選模式與玩法，單人可另選電腦難度"
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
            <h3>玩法</h3>
            <div className="pg-choice" aria-label="玩法難度">
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
            {settings.mode === "solo" && (
              <>
                <h3>電腦難度</h3>
                <div className="pg-choice" aria-label="電腦難度">
                  {(["easy", "standard", "challenge"] as AiDifficulty[]).map(difficulty => (
                    <button
                      key={difficulty}
                      aria-pressed={settings.aiDifficulty === difficulty}
                      onClick={() => onChange({ ...settings, aiDifficulty: difficulty })}
                    >
                      {AI_DIFFICULTY_LABELS[difficulty]}
                    </button>
                  ))}
                </div>
                <p className="pg-ai-description">
                  {!settings.aiDifficulty
                    ? "沿用舊版電腦：維持原本一般／進階策略。選擇上方難度後，新局才使用新設定。"
                    : settings.aiDifficulty === "easy"
                      ? "以自身收益為主，在接近最佳的合理選擇間變化，較少針對對手阻擋。"
                      : settings.aiDifficulty === "standard"
                        ? "評估自身收益與有限前瞻，兼顧眼前機會。"
                        : "認真計分與多步預判，主動卡位與反制對手。"}
                </p>
              </>
            )}
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
  `${settings.mode === "teams" ? "兩隊" : "單人"}・${settings.level === "normal" ? "一般" : "進階"}${settings.mode === "solo" ? `・${settings.aiDifficulty ? `${AI_DIFFICULTY_LABELS[settings.aiDifficulty]}電腦` : "舊版電腦"}` : ""}`;
