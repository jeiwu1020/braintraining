import React from 'react';

export type GameMode = 'PVE' | 'PVP';

interface GameModeSelectorProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  className?: string;
  disabled?: boolean;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ value, onChange, className = '', disabled = false }) => (
  <div data-game-mode-selector="true" className={`w-full ${className}`}>
    <div className="mb-1 text-xs font-semibold text-slate-600">遊戲模式</div>
    <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
      <button
        type="button"
        data-game-mode-option="PVE"
        aria-label="單人模式，與電腦對戰"
        aria-pressed={value === 'PVE'}
        disabled={disabled}
        onClick={() => { if (value !== 'PVE') onChange('PVE'); }}
        className={`flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-md border px-2 py-1 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50 ${value === 'PVE' ? 'border-slate-700 bg-white text-slate-900 shadow-sm' : 'border-transparent bg-transparent text-slate-600 hover:bg-white/70'}`}
      >
        <span>單人</span>
      </button>
      <button
        type="button"
        data-game-mode-option="PVP"
        aria-label="雙人模式，兩位玩家輪流"
        aria-pressed={value === 'PVP'}
        disabled={disabled}
        onClick={() => { if (value !== 'PVP') onChange('PVP'); }}
        className={`flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-md border px-2 py-1 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50 ${value === 'PVP' ? 'border-slate-700 bg-white text-slate-900 shadow-sm' : 'border-transparent bg-transparent text-slate-600 hover:bg-white/70'}`}
      >
        <span>雙人</span>
      </button>
    </div>
  </div>
);

export default GameModeSelector;
