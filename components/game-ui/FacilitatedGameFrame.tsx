import React, { useState, type ReactNode } from 'react';
import { Lightbulb, RefreshCw, RotateCcw, ScrollText } from 'lucide-react';
import { RulesModal } from '../RulesModal';
import BoardSidebarLayout from './BoardSidebarLayout';
import GameShell from './GameShell';
import { useConfirmAction } from './useConfirmAction';

export type FacilitatedMode = 'COOP' | 'TEAMS';

interface FacilitatedModeSelectorProps {
  value: FacilitatedMode;
  onChange: (mode: FacilitatedMode) => void;
  coopLabel?: string;
  teamsLabel?: string;
}

export const FacilitatedModeSelector: React.FC<FacilitatedModeSelectorProps> = ({
  value,
  onChange,
  coopLabel = '全體合作',
  teamsLabel = 'A／B 分組',
}) => (
  <div data-facilitated-mode-selector="true">
    <div className="mb-1 text-sm font-bold text-slate-700">活動模式</div>
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
      {([
        ['COOP', coopLabel],
        ['TEAMS', teamsLabel],
      ] as const).map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => { if (mode !== value) onChange(mode); }}
          className={`min-h-11 rounded-lg border px-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${value === mode ? 'border-indigo-500 bg-white text-indigo-800 shadow-sm' : 'border-transparent text-slate-600'}`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

interface FacilitatedGameFrameProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  mode: FacilitatedMode;
  onModeChange: (mode: FacilitatedMode) => void;
  rules: string[];
  recentAction: string;
  children: ReactNode;
  sidebar?: ReactNode;
  currentTeam?: 'A' | 'B';
  scores?: { A: number; B: number };
  onUndo: () => void;
  onReset: () => void;
  onHint: () => void;
  canUndo?: boolean;
  undoLabel?: string;
  resetLabel?: string;
  boardLabel?: string;
  feedback?: ReactNode;
  coopLabel?: string;
  teamsLabel?: string;
  /** Includes uncommitted selections when a game can lose work before its first move. */
  hasProgress?: boolean;
  /** Frequently used actions remain visible below the scrollable information. */
  controls?: ReactNode;
  /** Infrequent, game-specific settings start collapsed. */
  settings?: ReactNode;
}

const iconButton = 'flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40';

const FacilitatedGameFrame: React.FC<FacilitatedGameFrameProps> = ({
  title,
  subtitle,
  onBack,
  mode,
  onModeChange,
  rules,
  recentAction,
  children,
  sidebar,
  currentTeam = 'A',
  scores = { A: 0, B: 0 },
  onUndo,
  onReset,
  onHint,
  canUndo = true,
  undoLabel = '復原上一步',
  resetLabel = '重新開始',
  boardLabel,
  feedback,
  coopLabel,
  teamsLabel,
  hasProgress = canUndo,
  controls,
  settings,
}) => {
  const [showRules, setShowRules] = useState(false);
  const { requestAction, confirmationDialog } = useConfirmAction(hasProgress);
  const changeMode = (nextMode: FacilitatedMode) => {
    if (nextMode === mode) return;
    requestAction(() => onModeChange(nextMode), '切換活動模式將重開目前遊戲並重新計分。是否繼續？');
  };

  return (
    <GameShell
      title={title}
      subtitle={subtitle}
      onBack={() => requestAction(onBack, '返回遊戲目錄將離開目前進度。是否繼續？', '確認離開')}
      actions={(
        <>
          <button type="button" aria-label="開啟遊戲說明" onClick={() => setShowRules(true)} className={iconButton}>
            <ScrollText className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label={undoLabel} title={undoLabel} onClick={onUndo} disabled={!canUndo} className={iconButton}>
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label={resetLabel} title={resetLabel} onClick={() => requestAction(onReset, '重新開始會重設目前盤面；累積分數依本活動的計分方式處理。是否繼續？')} className={iconButton}>
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label="取得提示" onClick={onHint} className={iconButton}>
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}
    >
      <BoardSidebarLayout
        className={controls ? 'facilitated-layout--fixed-controls' : ''}
        boardLabel={boardLabel ?? `${title}盤面`}
        board={children}
        feedback={controls ? undefined : feedback}
        boardClassName="!overflow-auto flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-1 sm:p-2"
        sidebarClassName={`rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 ${controls ? '!overflow-hidden' : ''}`}
        sidebar={(
          <div className={`flex flex-col gap-2 ${controls ? 'h-full min-h-0' : 'min-h-full'}`}>
            <div data-facilitated-details="true" className={controls ? 'min-h-0 flex-1 overflow-y-auto' : ''}>
            <div className="flex flex-col gap-2">
            {controls && feedback && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-sm font-bold text-emerald-900">{feedback}</div>}
            <FacilitatedModeSelector
              value={mode}
              onChange={changeMode}
              coopLabel={coopLabel}
              teamsLabel={teamsLabel}
            />

            {!controls && mode === 'TEAMS' && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-center">
                <div className="text-sm font-bold text-indigo-900">目前：{currentTeam} 組</div>
                <div className="mt-1 grid grid-cols-2 gap-1 text-sm font-semibold text-slate-700">
                  <span>A 組 {scores.A} 分</span>
                  <span>B 組 {scores.B} 分</span>
                </div>
              </div>
            )}

            {!controls && <div className="rounded-xl border border-amber-200 bg-amber-50 p-2" aria-live="polite">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">最近操作</div>
              <div className="mt-0.5 text-sm font-semibold leading-snug text-slate-800">{recentAction}</div>
            </div>}

            {sidebar}
            {settings && (
              <details data-facilitated-settings="true" className="rounded-xl border border-slate-200 bg-slate-50">
                <summary className="flex min-h-11 cursor-pointer items-center px-2 text-sm font-bold text-slate-800">活動設定</summary>
                <div className="border-t border-slate-200 p-2">{settings}</div>
              </details>
            )}
            </div>
            </div>
            {controls && (
              <div data-facilitated-controls="true" aria-label="目前回合操作" className="shrink-0 border-t border-slate-200 pt-2">
                <div data-facilitated-turn-status="true" tabIndex={0} aria-label="最近操作與目前組別" className="mb-1 max-h-16 overflow-y-auto rounded-lg bg-amber-50 px-2 py-1 text-sm leading-snug text-slate-800" aria-live="polite">
                  {mode === 'TEAMS' && <div className="font-bold text-indigo-900">目前：{currentTeam} 組 · A 組 {scores.A} 分／B 組 {scores.B} 分</div>}
                  <div className="font-semibold"><span className="sr-only">最近操作：</span>{recentAction}</div>
                </div>
                {controls}
              </div>
            )}
          </div>
        )}
      />
      {confirmationDialog}

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        title={`${title}｜遊戲說明`}
        rules={rules}
      />
    </GameShell>
  );
};

export default FacilitatedGameFrame;
