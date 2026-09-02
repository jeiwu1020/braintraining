import type { ReactNode } from 'react';

interface SplitChoiceLayoutProps {
  question: ReactNode;
  choices: ReactNode;
  feedback?: ReactNode;
  questionLabel?: string;
  choicesLabel?: string;
  className?: string;
  questionClassName?: string;
  choicesClassName?: string;
}

const SplitChoiceLayout = ({
  question,
  choices,
  feedback,
  questionLabel = '題目區',
  choicesLabel = '作答區',
  className = '',
  questionClassName = '',
  choicesClassName = '',
}: SplitChoiceLayoutProps) => (
  <div
    data-layout-preset="split-choice"
    className={`split-choice-layout relative grid h-full min-h-0 w-full gap-3 overflow-hidden p-2 sm:p-3 ${className}`}
  >
    <section
      aria-label={questionLabel}
      className={`min-h-0 min-w-0 overflow-y-auto ${questionClassName}`}
    >
      {question}
    </section>

    <section
      aria-label={choicesLabel}
      className={`min-h-0 min-w-0 overflow-y-auto ${choicesClassName}`}
    >
      {choices}
    </section>

    {feedback && (
      <div
        role="status"
        aria-live="polite"
        data-layout-region="feedback"
        className="split-choice-layout__feedback col-span-full flex min-h-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 px-5 py-1 text-center text-sm font-bold shadow-lg backdrop-blur-sm sm:text-base"
      >
        {feedback}
      </div>
    )}
  </div>
);

export default SplitChoiceLayout;
