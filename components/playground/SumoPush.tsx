import React, { useEffect, useState } from "react";
import GameShell from "../game-ui/GameShell";
import { Engine, savedSettings } from "../../games/playground/session";
import { other, Settings } from "../../games/playground/types";
import {
  applySumoPush,
  createSumoPush,
  DIR_LABELS,
  inspectPush,
  legalSumoActions,
  PushDir,
  SumoAction,
  sumoCoord,
  SumoState,
  validSumoAction,
} from "../../games/playground/sumo-push/rules";
import { chooseSumoPush } from "../../games/playground/sumo-push/ai";
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

const engine: Engine<SumoState, SumoAction> = {
  create: createSumoPush,
  apply: applySumoPush,
  validAction: validSumoAction,
};

const makeWorker = () =>
  new Worker(
    new URL("../../games/playground/sumo-push/ai.worker.ts", import.meta.url),
    { type: "module" },
  );

export default function SumoPush({ onBack }: { onBack: () => void }) {
  const game = useSession("sumo-push", engine),
    { state: s, session, token } = game;
  const [settings, setSettings] = useState<Settings>(() => savedSettings("sumo-push"));
  const [pickedFrom, setPickedFrom] = useState<number | null>(null);
  const [pickedDir, setPickedDir] = useState<PushDir | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);

  useEffect(() => {
    setPickedFrom(null);
    setPickedDir(null);
  }, [token]);

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
  const ai = useAi<SumoAction>(
    aiTurn,
    token,
    makeWorker,
    s ? { state: s, options: aiOptions } : {},
    () => chooseSumoPush(s!, aiOptions),
  );

  if (game.corrupt) {
    return <Recovery onBack={onBack} onReset={() => game.clear()} />;
  }

  const rulesModal = dialog === "rules" && (
    <Modal title="擂台推推樂・規則說明" onClose={() => setDialog(null)}>
      <ol>
        <li>點選自己的一枚棋子作為推擠後衛，並選擇「上、下、左、右」推進 1 格（最多 3 枚連成排）。</li>
        <li><strong>人多推得動人少</strong>：只要我方連成一排的棋子數量大於前方阻力（例如 2 推 1、3 推 2），就能把整排一起往前推 1 格！</li>
        <li>不可將自己的棋子推出擂台外，也不能隔著對方棋子推自己。</li>
        <li>先把指定數量的對手棋子推落擂台邊界即贏得勝利！</li>
      </ol>
    </Modal>
  );

  if (!s || !session) {
    return (
      <>
        <Setup
          game="sumo-push"
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
  const allMoves = legalSumoActions(s, s.turn);
  const preview =
    pickedFrom !== null && pickedDir !== null ? inspectPush(s, pickedFrom, pickedDir) : null;
  const dirs: PushDir[] = ["up", "down", "left", "right"];
  const winner =
    s.result === "tie"
      ? "雙方平手"
      : `${teamLabel(s.result as "A" | "B", session.settings.mode)}獲勝！`;

  return (
    <GameShell
      className="pg-shell pg-sumo"
      title="擂台推推樂"
      subtitle={`${modeTitle(session.settings)}・先推落 ${s.goal} 枚獲勝`}
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
          <div
            className="pg-sumo-grid"
            style={{ gridTemplateColumns: `repeat(${s.size}, minmax(0, 1fr))` }}
            role="grid"
            aria-label="木製相撲擂台"
          >
            {s.board.map((piece, idx) => {
              const isOwn = piece === s.turn && !aiTurn && !finished;
              const isFrom = pickedFrom === idx;
              const inOwnChain = preview?.ownCells.includes(idx) ?? false;
              const inRivalChain = preview?.rivalCells.includes(idx) ?? false;
              const coord = sumoCoord(idx, s.size);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isOwn}
                  className={[
                    "pg-sumo-cell",
                    isFrom ? "selected-from" : "",
                    inOwnChain ? "push-chain" : "",
                    inRivalChain ? "push-rival" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`${coord} ${piece === "A" ? "A隊棋子" : piece === "B" ? "B隊棋子" : piece === "C" ? "木箱" : "空位"}`}
                  onClick={() => {
                    if (isOwn) {
                      setPickedFrom(idx);
                      setPickedDir(null);
                    }
                  }}
                >
                  {(piece === "A" || piece === "B") && (
                    <span className={`pg-sumo-disc ${piece}`}>{piece}</span>
                  )}
                  {piece === "C" && <span className="pg-sumo-crate">箱</span>}
                </button>
              );
            })}
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
                : `輪到 ${teamLabel(s.turn, session.settings.mode)}`}
          </h2>
          <div className="pg-four-scores">
            <div className={`pg-team-badge team-A ${!finished && s.turn === "A" ? "active-turn" : ""}`}>
              <span>{teamLabel("A", session.settings.mode)}</span>
              <span>推落 {s.pushedOut.A}／{s.goal}</span>
            </div>
            <div className={`pg-team-badge team-B ${!finished && s.turn === "B" ? "active-turn" : ""}`}>
              <span>{teamLabel("B", session.settings.mode)}</span>
              <span>推落 {s.pushedOut.B}／{s.goal}</span>
            </div>
          </div>

          {finished ? (
            <>
              <p>盤面保留於左側，下局自動交換先手。</p>
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
              {!aiTurn && pickedFrom !== null && (
                <div className="pg-dir-pad" aria-label="推動方向">
                  {dirs.map((d) => {
                    const ok = !!inspectPush(s, pickedFrom, d);
                    return (
                      <button
                        key={d}
                        disabled={!ok}
                        aria-pressed={pickedDir === d}
                        onClick={() => setPickedDir(d)}
                      >
                        {DIR_LABELS[d]}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pg-preview" aria-live="polite">
                {allMoves.length === 0 ? (
                  <strong>無合法推進，請撤回或重開。</strong>
                ) : aiTurn ? (
                  <>
                    <strong>
                      {ai.failed
                        ? "電腦暫時無法行動"
                        : ai.ready
                          ? "電腦準備好了"
                          : "電腦布局推擠中…"}
                    </strong>
                    <small>點擊下方按鈕才推進電腦行動。</small>
                  </>
                ) : pickedFrom === null ? (
                  <strong>第 1 步：點選己方推動起點棋子（{s.turn}）</strong>
                ) : !preview ? (
                  <>
                    <strong>第 2 步：選擇上方亮起的推動方向</strong>
                    <small>已選 {sumoCoord(pickedFrom, s.size)}（需人多才能推動對方）</small>
                  </>
                ) : (
                  <>
                    <strong>
                      {sumoCoord(pickedFrom, s.size)} {DIR_LABELS[pickedDir!]}（{preview.ownCells.length} 枚
                      {preview.rivalCells.length ? ` 推 ${preview.rivalCells.length} 枚` : " 前進"}）
                    </strong>
                    <small>
                      {preview.pushedOff === other(s.turn)
                        ? "★ 這一步會把對手棋子推出擂台得分！"
                        : preview.pushedOff === "C"
                          ? "這一步會將中立木箱推離擂台。"
                          : "確認無誤後即可推進整排棋子。"}
                    </small>
                  </>
                )}
              </div>

              <div className="pg-confirm-row">
                <button
                  className="pg-primary"
                  disabled={aiTurn ? !ai.ready : !preview}
                  onClick={() => {
                    if (aiTurn && ai.ready) {
                      game.commit(ai.ready.action, token);
                    } else if (pickedFrom !== null && pickedDir !== null && preview) {
                      game.commit({ type: "push", from: pickedFrom, dir: pickedDir }, token);
                    }
                  }}
                >
                  {aiTurn ? "看電腦行動" : "確認推動"}
                </button>
                <button
                  disabled={aiTurn || pickedFrom === null}
                  onClick={() => {
                    setPickedFrom(null);
                    setPickedDir(null);
                  }}
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
