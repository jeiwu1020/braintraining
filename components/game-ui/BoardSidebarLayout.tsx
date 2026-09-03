import type { ReactNode } from 'react';

interface BoardSidebarLayoutProps {
  board: ReactNode;
  sidebar: ReactNode;
  feedback?: ReactNode;
  boardLabel?: string;
  sidebarLabel?: string;
  className?: string;
  boardClassName?: string;
  sidebarClassName?: string;
  feedbackClassName?: string;
}

const BoardSidebarLayout = ({
  board,
  sidebar,
  feedback,
  boardLabel = '主要棋盤',
  sidebarLabel = '遊戲資訊與操作',
  className = '',
  boardClassName = '',
  sidebarClassName = '',
  feedbackClassName = '',
}: BoardSidebarLayoutProps) => (
  <div
    data-layout-preset="board-sidebar"
    className={`board-sidebar-layout grid h-full min-h-0 w-full gap-2 overflow-hidden p-2 sm:gap-3 sm:p-3 ${className}`}
  >
    <section
      aria-label={boardLabel}
      data-layout-region="board"
      className={`min-h-0 min-w-0 overflow-hidden ${boardClassName}`}
    >
      {board}
    </section>

    <aside
      aria-label={sidebarLabel}
      data-layout-region="sidebar"
      className={`min-h-0 min-w-0 overflow-auto ${sidebarClassName}`}
    >
      {sidebar}
    </aside>

    {feedback && (
      <div
        role="status"
        aria-live="polite"
        data-layout-region="feedback"
        className={`board-sidebar-layout__feedback col-span-full flex min-h-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 px-4 py-1 text-center text-sm font-bold shadow-lg backdrop-blur-sm sm:text-base ${feedbackClassName}`}
      >
        {feedback}
      </div>
    )}
  </div>
);

export default BoardSidebarLayout;
