import React, { useState } from "react";
import { PLAYGROUND_CATALOG, PlaygroundId } from "../../data/playgroundCatalog";
import { clearSaved, readSaved } from "../../games/playground/session";
import { ConfirmDialog } from "./Common";
import { readMasterSaved } from "../../games/playground/night-market/masterSession";
import "./playground.css";
import "./mobile-viewport.css";
import "./new-boardgames.css";
import NewBoardgameArt from "./NewBoardgameArt";
import "./table-games.css";
import { useExperienceViewport } from "../experience-ui/useExperienceViewport";
const NightMarket = React.lazy(() => import("./NightMarket"));
const NightMarketMaster = React.lazy(() => import("./NightMarketMaster"));
const WallRace = React.lazy(() => import("./WallRace"));
const Lighthouse = React.lazy(() => import("./Lighthouse"));
const Garden = React.lazy(() => import("./Garden"));
const Lantern = React.lazy(() => import("./Lantern"));
const Workshop = React.lazy(() => import("./Workshop"));
const Auction = React.lazy(() => import("./Auction"));
const FrogPond = React.lazy(() => import("./FrogPond"));
const CloudTowers = React.lazy(() => import("./CloudTowers"));
const ChefSplit = React.lazy(() => import("./ChefSplit"));
const SumoPush = React.lazy(() => import("./SumoPush"));
const NewBoardgame = React.lazy(() => import("./NewBoardgame"));
const NEW_GAMES = new Set(["beans", "lost", "animals", "borrow"]);
const SCREENS = { "night-market": NightMarket, "wall-race": WallRace, lighthouse: Lighthouse, garden: Garden, lantern: Lantern, workshop: Workshop, auction: Auction, "frog-pond": FrogPond, "cloud-towers": CloudTowers, "chef-split": ChefSplit, "sumo-push": SumoPush };
export default function Playground({ onBack }: { onBack: () => void }) {
  const viewportStyle = useExperienceViewport();
  const [game, setGame] = useState<PlaygroundId | null>(null),
    [reset, setReset] = useState<PlaygroundId | null>(null);
  const [nightMaster, setNightMaster] = useState(false);
  const isNew = game !== null && NEW_GAMES.has(game);
  if (isNew) return <div className="pg-viewport" style={viewportStyle}><React.Suspense fallback={<div className="pg-loading" role="status">正在擺好桌遊…</div>}><NewBoardgame game={game as "beans" | "lost" | "animals" | "borrow"} onBack={() => setGame(null)} /></React.Suspense></div>;
  const Screen = game === "night-market" && nightMaster ? NightMarketMaster : game ? SCREENS[game as keyof typeof SCREENS] : null;
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
          <p className="pg-eyebrow">一起收藏桌上時光</p>
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
              {NEW_GAMES.has(c.id) && <NewBoardgameArt game={c.id}/>}
              {(c.id === "night-market" || c.id === "wall-race") && <span>{c.title}</span>}
            </div>
            <div className="pg-box-label pg-paper">
              <h2>{c.title}</h2>
              <p>{c.description}</p>
              <p className="pg-box-modes">{c.id === "lighthouse" ? "全團體合作" : ["lost", "animals"].includes(c.id) ? "單人／一起討論" : ["garden", "lantern", "workshop", "auction", "beans", "borrow"].includes(c.id) ? "兩隊對局" : "單人／兩隊"}　一般／進階</p>
              <button className="pg-primary" onClick={() => { setNightMaster(false); setGame(c.id); }}>
                {readSaved(c.id) ? "繼續本局" : c.action}　›
              </button>
              {c.id === "night-market" && <button className="pg-primary" data-master-entry onClick={() => { setNightMaster(true); setGame(c.id); }}>{readMasterSaved() ? "繼續大師版" : "開啟大師版"}　›</button>}
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
            setNightMaster(false);
            setGame(reset);
            setReset(null);
          }}
        />
      )}
    </div>
  );
}

