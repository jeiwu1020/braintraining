import type { ReactNode } from 'react';

interface GridFocusLayoutProps {
  playfield: ReactNode;
  support?: ReactNode;
  feedback?: ReactNode;
  playfieldLabel?: string;
  supportLabel?: string;
  className?: string;
  playfieldClassName?: string;
  supportClassName?: string;
  feedbackClassName?: string;
}

const GridFocusLayout = ({
  playfield,
  support,
  feedback,
  playfieldLabel = '主要遊戲區',
  supportLabel = '遊戲輔助區',
  className = '',
  playfieldClassName = '',
  supportClassName = '',
  feedbackClassName = '',
}: GridFocusLayoutProps) => (
  <div
    data-layout-preset="grid-focus"
    className={`grid-focus-layout grid h-full min-h-0 w-full gap-2 overflow-hidden p-2 sm:gap-3 sm:p-3 ${className}`}
  >
    <section
      aria-label={playfieldLabel}
      data-layout-region="playfield"
      className={`min-h-0 min-w-0 overflow-auto ${playfieldClassName}`}
    >
      {playfield}
    </section>

    {support && (
      <aside
        aria-label={supportLabel}
        data-layout-region="support"
        className={`min-h-0 min-w-0 overflow-auto ${supportClassName}`}
      >
        {support}
      </aside>
    )}

    {feedback && (
      <div
        role="status"
        aria-live="polite"
        data-layout-region="feedback"
        className={`grid-focus-layout__feedback col-span-full flex min-h-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 px-5 py-1 text-center text-sm font-bold shadow-lg backdrop-blur-sm sm:text-base ${feedbackClassName}`}
      >
        {feedback}
      </div>
    )}
  </div>
);

export default GridFocusLayout;
