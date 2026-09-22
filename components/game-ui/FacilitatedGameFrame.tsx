import React, { useState, type ReactNode } from 'react';
import { Lightbulb, RefreshCw, RotateCcw, ScrollText } from 'lucide-react';
import { RulesModal } from '../RulesModal';
import BoardSidebarLayout from './BoardSidebarLayout';
import GameShell from './GameShell';

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
          onClick={() => onChange(mode)}
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
}) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <GameShell
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      actions={(
        <>
          <button type="button" aria-label="開啟遊戲說明" onClick={() => setShowRules(true)} className={iconButton}>
            <ScrollText className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label={undoLabel} title={undoLabel} onClick={onUndo} disabled={!canUndo} className={iconButton}>
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label={resetLabel} title={resetLabel} onClick={onReset} className={iconButton}>
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label="取得提示" onClick={onHint} className={iconButton}>
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}
    >
      <BoardSidebarLayout
        boardLabel={boardLabel ?? `${title}盤面`}
        board={children}
        feedback={feedback}
        boardClassName="!overflow-auto flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-1 sm:p-2"
        sidebarClassName="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3"
        sidebar={(
          <div className="flex min-h-full flex-col gap-2">
            <FacilitatedModeSelector
              value={mode}
              onChange={onModeChange}
              coopLabel={coopLabel}
              teamsLabel={teamsLabel}
            />

            {mode === 'TEAMS' && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-center">
                <div className="text-sm font-bold text-indigo-900">目前：{currentTeam} 組</div>
                <div className="mt-1 grid grid-cols-2 gap-1 text-sm font-semibold text-slate-700">
                  <span>A 組 {scores.A} 分</span>
                  <span>B 組 {scores.B} 分</span>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2" aria-live="polite">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">最近操作</div>
              <div className="mt-0.5 text-sm font-semibold leading-snug text-slate-800">{recentAction}</div>
            </div>

            {sidebar}
          </div>
        )}
      />

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
