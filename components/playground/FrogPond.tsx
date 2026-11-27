import React, { useEffect, useState } from "react";
import GameShell from "../game-ui/GameShell";
import { Engine, savedSettings } from "../../games/playground/session";
import { other, Settings } from "../../games/playground/types";
import {
  applyFrogPond,
  createFrogPond,
  FrogAction,
  frogCoord,
  FrogState,
  legalMoves,
  movesFrom,
  occupantAt,
  validFrogAction,
} from "../../games/playground/frog-pond/rules";
import { chooseFrogPond } from "../../games/playground/frog-pond/ai";
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

const engine: Engine<FrogState, FrogAction> = {
  create: createFrogPond,
  apply: applyFrogPond,
  validAction: validFrogAction,
};

const makeWorker = () =>
  new Worker(
    new URL("../../games/playground/frog-pond/ai.worker.ts", import.meta.url),
    { type: "module" },
  );

function PadArt({ lotuses }: { lotuses: number }) {
  return (
    <svg className="pg-pad-svg" viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 6 A26 26 0 1 1 11 16 L32 32 Z"
        fill="#6fb267"
        stroke="#2c6334"
        strokeWidth="2.5"
      />
      <path d="M32 32 L15 47 M32 32 L49 46 M32 32 L46 16" stroke="#4f8f4b" strokeWidth="1.6" />
      {Array.from({ length: lotuses }).map((_, idx) => {
        const cx = lotuses === 1 ? 26 : lotuses === 2 ? 20 + idx * 16 : 16 + idx * 12;
        const cy = lotuses === 3 && idx === 1 ? 18 : 26;
        return (
          <g key={idx} transform={`translate(${cx} ${cy})`}>
            <circle r="6.5" fill="#f7b2c4" stroke="#b94c6c" strokeWidth="1.4" />
            <circle r="3" fill="#ffe799" />
          </g>
        );
      })}
    </svg>
  );
}

function FrogToken({ team }: { team: "A" | "B" }) {
  const fill = team === "A" ? "#1d7567" : "#c6591a";
  const light = team === "A" ? "#7cd6c4" : "#f6b286";
  return (
    <svg className="pg-frog-token" viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="36" rx="18" ry="15" fill={fill} stroke="#fff8e8" strokeWidth="2.5" />
      <ellipse cx="32" cy="38" rx="10" ry="8" fill={light} opacity="0.55" />
      <circle cx="22" cy="22" r="6" fill={fill} stroke="#fff8e8" strokeWidth="2" />
      <circle cx="42" cy="22" r="6" fill={fill} stroke="#fff8e8" strokeWidth="2" />
      <circle cx="22" cy="22" r="2.6" fill="#fffdf5" />
      <circle cx="42" cy="22" r="2.6" fill="#fffdf5" />
      <circle cx="22.5" cy="22" r="1.2" fill="#182420" />
      <circle cx="42.5" cy="22" r="1.2" fill="#182420" />
    </svg>
  );
}

export default function FrogPond({ onBack }: { onBack: () => void }) {
  const game = useSession("frog-pond", engine),
    { state: s, session, token } = game;
  const [settings, setSettings] = useState<Settings>(() => savedSettings("frog-pond"));
  const [pickedFrog, setPickedFrog] = useState<number | null>(null);
  const [pickedTarget, setPickedTarget] = useState<number | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);

  useEffect(() => {
    setPickedFrog(null);
    setPickedTarget(null);
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
  const ai = useAi<FrogAction>(
    aiTurn,
    token,
    makeWorker,
    s ? { state: s, options: aiOptions } : {},
    () => chooseFrogPond(s!, aiOptions),
  );

  if (game.corrupt) {
    return (
      <Recovery
        onBack={onBack}
        onReset={() => {
          game.clear();
        }}
      />
    );
  }

  const rulesModal = dialog === "rules" && (
    <Modal title="池塘跳荷葉・規則說明" onClose={() => setDialog(null)}>
      <ol>
        <li>輪到你時，先點選己方一隻青蛙，再沿直、橫或斜線跳到任一片尚存的空荷葉上。</li>
        <li>跳躍路線不能跨越空水域或其他青蛙。</li>
        <li>青蛙出發的那片荷葉會沉入水底消失，並將上面的 1～3 朵蓮花收進己方分數。</li>
        <li>若對手所有青蛙都無路可跳而你仍有路，你將連續跳躍收葉；雙方皆無路時，青蛙腳下最後那片荷葉也會算入分數，總數較多者勝。</li>
      </ol>
    </Modal>
  );

  if (!s || !session) {
    return (
      <>
        <Setup
          game="frog-pond"
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
  const allMoves = legalMoves(s, s.turn);
  const validTargets = pickedFrog !== null ? movesFrom(s, pickedFrog) : [];
  const winner =
    s.result === "tie"
      ? "雙方同分平手"
      : `${teamLabel(s.result as "A" | "B", session.settings.mode)}獲勝！`;

  return (
    <GameShell
      className="pg-shell pg-frog"
      title="池塘跳荷葉"
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
          <div
            className="pg-pond-grid"
            style={{ gridTemplateColumns: `repeat(${s.size}, minmax(0, 1fr))` }}
            role="grid"
            aria-label="荷葉池塘棋盤"
          >
            {s.pads.map((lotus, idx) => {
              const occ = occupantAt(s, idx);
              const isOwn = occ === s.turn && !aiTurn && !finished;
              const isSelectedFrog = pickedFrog === idx;
              const isTarget = validTargets.includes(idx);
              const isPreview = pickedTarget === idx;
              const coord = frogCoord(idx, s.size);
              const clickable = isOwn || isTarget;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!clickable}
                  className={[
                    "pg-pond-cell",
                    lotus > 0 ? "has-pad" : "water",
                    isSelectedFrog ? "selected-source" : "",
                    isTarget ? "legal-target" : "",
                    isPreview ? "preview-target" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`${coord}${occ ? ` ${occ}隊青蛙` : ""}${lotus > 0 ? ` ${lotus}朵蓮花` : " 空水區"}`}
                  onClick={() => {
                    if (isOwn) {
                      setPickedFrog(idx);
                      setPickedTarget(null);
                    } else if (isTarget && pickedFrog !== null) {
                      if (pickedTarget === idx) {
                        game.commit({ type: "move", frog: pickedFrog, to: idx }, token);
                      } else {
                        setPickedTarget(idx);
                      }
                    }
                  }}
                >
                  {lotus > 0 && <PadArt lotuses={lotus} />}
                  {occ && <FrogToken team={occ} />}
                  {occ && <span className={`pg-frog-tag ${occ}`}>{occ}</span>}
                  {lotus > 0 && !occ && <span className="pg-lotus-num">{lotus}</span>}
                  {lotus > 0 && occ && <span className="pg-lotus-num">{lotus}</span>}
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
              <span>{s.scores.A} 朵</span>
            </div>
            <div className={`pg-team-badge team-B ${!finished && s.turn === "B" ? "active-turn" : ""}`}>
              <span>{teamLabel("B", session.settings.mode)}</span>
              <span>{s.scores.B} 朵</span>
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
                {allMoves.length === 0 ? (
                  <strong>無合法跳躍，請撤回或重開。</strong>
                ) : aiTurn ? (
                  <>
                    <strong>
                      {ai.failed
                        ? "電腦暫時無法行動"
                        : ai.ready
                          ? "電腦準備好了"
                          : "電腦計算跳躍路線中…"}
                    </strong>
                    <small>點擊下方按鈕才推進電腦行動。</small>
                  </>
                ) : pickedFrog === null ? (
                  <strong>請先點擊池塘上的一隻己方青蛙（{s.turn}）</strong>
                ) : pickedTarget === null ? (
                  <>
                    <strong>
                      已選 {frogCoord(pickedFrog, s.size)} 青蛙（腳下 {s.pads[pickedFrog]} 朵蓮花）
                    </strong>
                    <small>請點擊亮框荷葉落點；點兩下可直接確認。</small>
                  </>
                ) : (
                  <>
                    <strong>
                      跳至 {frogCoord(pickedTarget, s.size)}（收下 {s.pads[pickedFrog]} 朵蓮花）
                    </strong>
                    <small>可點「確認跳躍」或直接再點一次該目標格。</small>
                  </>
                )}
              </div>

              <div className="pg-confirm-row">
                <button
                  className="pg-primary"
                  disabled={
                    aiTurn
                      ? !ai.ready
                      : pickedFrog === null || pickedTarget === null
                  }
                  onClick={() => {
                    if (aiTurn && ai.ready) {
                      game.commit(ai.ready.action, token);
                    } else if (pickedFrog !== null && pickedTarget !== null) {
                      game.commit({ type: "move", frog: pickedFrog, to: pickedTarget }, token);
                    }
                  }}
                >
                  {aiTurn ? "看電腦行動" : "確認跳躍"}
                </button>
                <button
                  disabled={aiTurn || (pickedFrog === null && pickedTarget === null)}
                  onClick={() => {
                    setPickedFrog(null);
                    setPickedTarget(null);
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
