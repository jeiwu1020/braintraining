import React, { useState } from "react";
import { PLAYGROUND_CATALOG, PlaygroundId } from "../../data/playgroundCatalog";
import { clearSaved, readSaved } from "../../games/playground/session";
import { ConfirmDialog } from "./Common";
import "./playground.css";
import "./mobile-viewport.css";
import { useExperienceViewport } from "../experience-ui/useExperienceViewport";
const NightMarket = React.lazy(() => import("./NightMarket"));
const WallRace = React.lazy(() => import("./WallRace"));
const SCREENS = { "night-market": NightMarket, "wall-race": WallRace };
export default function Playground({ onBack }: { onBack: () => void }) {
  const viewportStyle = useExperienceViewport();
  const [game, setGame] = useState<PlaygroundId | null>(null),
    [reset, setReset] = useState<PlaygroundId | null>(null);
  const Screen = game ? SCREENS[game] : null;
  if (Screen)
    return (
      <div className="pg-viewport" style={viewportStyle}><React.Suspense
        fallback={
          <div className="pg-loading" role="status">
            正在擺好桌遊…
          </div>
        }
      >
        <Screen onBack={() => setGame(null)} />
      </React.Suspense></div>
    );
  return (
    <div className="pg-gallery app-safe-screen" style={viewportStyle}>
      <aside className="pg-gallery-intro pg-paper">
        <button onClick={onBack}>← 首頁</button>
        <div>
          <p className="pg-eyebrow">兩款桌上時光</p>
          <h1>
            桌遊
            <br />
            新樂園
          </h1>
          <p>口述決策，輪流出招</p>
          <p className="pg-intro-small">先選遊戲，再選模式</p>
        </div>
        <p className="pg-scroll-hint">卡片可上下滑動</p>
        <div className="pg-decoration" aria-hidden="true">
          ● ▰ ▲
        </div>
      </aside>
      <main className="pg-collection" aria-label="桌遊新樂園遊戲目錄，可上下捲動" tabIndex={0}>
        {PLAYGROUND_CATALOG.map((c) => (
          <article className="pg-game-box" key={c.id} data-game-card={c.id}>
            <div className={`pg-box-art pg-art-${c.id}`} aria-hidden="true">
              <span>{c.title}</span>
            </div>
            <div className="pg-box-label pg-paper">
              <h2>{c.title}</h2>
              <p>{c.description}</p>
              <p className="pg-box-modes">單人／兩隊　一般／進階</p>
              <button className="pg-primary" onClick={() => setGame(c.id)}>
                {readSaved(c.id) ? "繼續本局" : c.action}　›
              </button>
              {readSaved(c.id) && (
                <button
                  className="pg-reset-link"
                  onClick={() => setReset(c.id)}
                >
                  重新設定
                </button>
              )}
            </div>
          </article>
        ))}
      </main>
      {reset && (
        <ConfirmDialog
          title="重新設定這款桌遊？"
          onCancel={() => setReset(null)}
          onConfirm={() => {
            clearSaved(reset);
            setGame(reset);
            setReset(null);
          }}
        />
      )}
    </div>
  );
}
