import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface GameShellProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
  backLabel?: string;
  className?: string;
  contentClassName?: string;
}

const GameShell = ({
  title,
  onBack,
  children,
  subtitle,
  status,
  actions,
  backLabel = '返回遊戲目錄',
  className = '',
  contentClassName = '',
}: GameShellProps) => (
  <div
    data-layout="mobile-landscape-game"
    className={`game-shell flex w-full flex-col overflow-hidden bg-slate-50 text-slate-900 ${className}`}
  >
    <header className="game-shell__header flex shrink-0 items-center gap-2 border-b border-black/10 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur-sm sm:gap-3 sm:px-3">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
      >
        <ArrowLeft aria-hidden="true" className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold leading-tight sm:text-lg">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs leading-tight text-slate-600 sm:text-sm">{subtitle}</p>
        )}
      </div>

      {status && (
        <div aria-live="polite" className="shrink-0 text-sm font-semibold sm:text-base">
          {status}
        </div>
      )}

      {actions && (
        <div aria-label="遊戲操作" className="flex shrink-0 items-center gap-1 sm:gap-2">
          {actions}
        </div>
      )}
    </header>

    <main
      aria-label={`${title}遊戲區`}
      className={`min-h-0 flex-1 overflow-hidden ${contentClassName}`}
    >
      {children}
    </main>
  </div>
);

export default GameShell;
