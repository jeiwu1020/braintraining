import React, { useEffect, useState } from "react";
import GameShell from "../game-ui/GameShell";
import { Engine, savedSettings } from "../../games/playground/session";
import { other, Settings } from "../../games/playground/types";
import {
  applyTowers,
  buildTargets,
  createTowers,
  legalTowerActions,
  moveTargets,
  TowerAction,
  towerCoord,
  towerOccupant,
  TowerState,
  validTowerAction,
} from "../../games/playground/cloud-towers/rules";
import { chooseTowers } from "../../games/playground/cloud-towers/ai";
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

const engine: Engine<TowerState, TowerAction> = {
  create: createTowers,
  apply: applyTowers,
  validAction: validTowerAction,
};

const makeWorker = () =>
  new Worker(
    new URL("../../games/playground/cloud-towers/ai.worker.ts", import.meta.url),
    { type: "module" },
  );

export default function CloudTowers({ onBack }: { onBack: () => void }) {
  const game = useSession("cloud-towers", engine),
    { state: s, session, token } = game;
  const [settings, setSettings] = useState<Settings>(() => savedSettings("cloud-towers"));
  const [fromCell, setFromCell] = useState<number | null>(null);
  const [toCell, setToCell] = useState<number | null>(null);
  const [buildCell, setBuildCell] = useState<number | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);

  useEffect(() => {
    setFromCell(null);
    setToCell(null);
    setBuildCell(null);
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
  const ai = useAi<TowerAction>(
    aiTurn,
    token,
    makeWorker,
    s ? { state: s, options: aiOptions } : {},
    () => chooseTowers(s!, aiOptions),
  );

  if (game.corrupt) {
    return <Recovery onBack={onBack} onReset={() => game.clear()} />;
  }

  const rulesModal = dialog === "rules" && (
    <Modal title="雲頂雙塔・規則說明" onClose={() => setDialog(null)}>
      <ol>
        <li>每隊共有 2 位建築師，回合開始時選 1 位移動到相鄰 8 格之一。</li>
        <li>高度限制：每次移動**最多只能往上爬 1 層**（例如 1F→2F），往下跳則不限層數。</li>
        <li>若移動後直接站上 **3F 高塔**，立刻贏得勝利！否則必須在剛站穩的建築師周圍 8 格選一處空地**加蓋 1 層**。</li>
        <li>第 4 次加蓋會封上藍色**穹頂**，之後任何人都不能站上或再蓋。</li>
      </ol>
    </Modal>
  );

  if (!s || !session) {
    return (
      <>
        <Setup
          game="cloud-towers"
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
  const legalMovesForFrom = fromCell !== null && toCell === null ? moveTargets(s, fromCell) : [];
  const instantWin = fromCell !== null && toCell !== null && s.heights[toCell] === 3;
  const legalBuildsForTo =
    fromCell !== null && toCell !== null && !instantWin ? buildTargets(s, fromCell, toCell) : [];
  const readyToConfirm =
    fromCell !== null && toCell !== null && (instantWin || buildCell !== null);

  const winner =
    s.result === "tie"
      ? "纏鬥平手"
      : `${teamLabel(s.result as "A" | "B", session.settings.mode)}獲勝！`;

  return (
    <GameShell
      className="pg-shell pg-towers"
      title="雲頂雙塔"
      subtitle={modeTitle(session.settings)}
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
          <div className="pg-tower-grid" role="grid" aria-label="雲頂雙塔 5×5 海島">
            {s.heights.map((h, idx) => {
              const isReef = s.reefs.includes(idx);
              const occ = towerOccupant(s, idx);
              const isOwn = occ === s.turn && !aiTurn && !finished;
              const canSelectUnit = isOwn && toCell === null;
              const isMoveOpt = legalMovesForFrom.includes(idx);
              const isBuildOpt = legalBuildsForTo.includes(idx);
              const isChosen =
                fromCell === idx || toCell === idx || buildCell === idx;
              const coord = towerCoord(idx);
              const clickable = canSelectUnit || isMoveOpt || isBuildOpt;

              const displayOcc =
                fromCell !== null && toCell !== null && idx === fromCell
                  ? null
                  : fromCell !== null && toCell !== null && idx === toCell
                    ? s.turn
                    : occ;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!clickable}
                  className={[
                    "pg-tower-cell",
                    isReef ? "reef" : `h-${h}`,
                    isChosen ? "selected-unit" : "",
                    isMoveOpt ? "legal-move" : "",
                    isBuildOpt ? "legal-build" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`${coord} ${isReef ? "礁石" : h === 4 ? "穹頂封鎖" : `${h}樓`}${occ ? ` ${occ}隊建築師` : ""}`}
                  onClick={() => {
                    if (canSelectUnit) {
                      setFromCell(idx);
                      setToCell(null);
                      setBuildCell(null);
                    } else if (isMoveOpt) {
                      setToCell(idx);
                      setBuildCell(null);
                    } else if (isBuildOpt) {
                      setBuildCell(idx);
                    }
                  }}
                >
                  {isReef ? (
                    <span className="text-xs font-bold">海礁</span>
                  ) : (
                    <>
                      <span className="pg-floor-badge">
                        {h === 4 ? "穹頂" : h === 0 ? "平地" : `${h}F`}
                      </span>
                      {displayOcc && (
                        <span className={`pg-builder-token ${displayOcc}`}>
                          {displayOcc}
                        </span>
                      )}
                      {!displayOcc && h === 4 && (
                        <span className="text-xs font-bold">封閉</span>
                      )}
                    </>
                  )}
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
              <span>最高 {Math.max(...s.builders.A.map((p) => s.heights[p]))}F</span>
            </div>
            <div className={`pg-team-badge team-B ${!finished && s.turn === "B" ? "active-turn" : ""}`}>
              <span>{teamLabel("B", session.settings.mode)}</span>
              <span>最高 {Math.max(...s.builders.B.map((p) => s.heights[p]))}F</span>
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
              <div className="pg-preview" aria-live="polite">
                {legalTowerActions(s, s.turn).length === 0 ? (
                  <strong>無路可走，請撤回或重開。</strong>
                ) : aiTurn ? (
                  <>
                    <strong>
                      {ai.failed
                        ? "電腦暫時無法行動"
                        : ai.ready
                          ? "電腦準備好了"
                          : "電腦推算登頂路線中…"}
                    </strong>
                    <small>按下下方按鈕才推進電腦行動。</small>
                  </>
                ) : fromCell === null ? (
                  <strong>第 1 步：點選一位己方建築師（{s.turn}）</strong>
                ) : toCell === null ? (
                  <>
                    <strong>第 2 步：點擊綠框鄰近格移動（最多爬高 1 層）</strong>
                    <small>目前起點：{towerCoord(fromCell)}（{s.heights[fromCell]}F）</small>
                  </>
                ) : instantWin ? (
                  <>
                    <strong>登上 3F 高塔 {towerCoord(toCell)}！直接獲勝</strong>
                    <small>不需再加蓋，按下確認即可奪冠。</small>
                  </>
                ) : buildCell === null ? (
                  <>
                    <strong>第 3 步：點擊橘色虛線格加蓋 1 層</strong>
                    <small>已移至 {towerCoord(toCell)}，選一格周圍建築升層。</small>
                  </>
                ) : (
                  <>
                    <strong>
                      移至 {towerCoord(toCell)} ＋ 在 {towerCoord(buildCell)} 蓋至{" "}
                      {s.heights[buildCell] + 1 === 4 ? "穹頂封頂" : `${s.heights[buildCell] + 1}F`}
                    </strong>
                    <small>確認無誤後即可完成本手。</small>
                  </>
                )}
              </div>

              <div className="pg-confirm-row">
                <button
                  className="pg-primary"
                  disabled={aiTurn ? !ai.ready : !readyToConfirm}
                  onClick={() => {
                    if (aiTurn && ai.ready) {
                      game.commit(ai.ready.action, token);
                    } else if (fromCell !== null && toCell !== null && readyToConfirm) {
                      game.commit(
                        instantWin
                          ? { type: "turn", from: fromCell, to: toCell }
                          : { type: "turn", from: fromCell, to: toCell, build: buildCell! },
                        token,
                      );
                    }
                  }}
                >
                  {aiTurn ? "看電腦行動" : instantWin ? "確認登頂獲勝" : "確認移動＋加蓋"}
                </button>
                <button
                  disabled={aiTurn || fromCell === null}
                  onClick={() => {
                    setFromCell(null);
                    setToCell(null);
                    setBuildCell(null);
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
