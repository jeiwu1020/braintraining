import type { ReactNode } from 'react';
import { Trophy } from 'lucide-react';
import type { Difficulty } from '../../types';
import GameShell from './GameShell';
import SplitChoiceLayout from './SplitChoiceLayout';

interface CognitiveChoiceScreenProps {
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  round: number;
  totalRounds: number;
  score: number;
  onBack: () => void;
  question: ReactNode;
  choices: ReactNode;
  feedback?: ReactNode;
  questionLabel?: string;
  choicesLabel?: string;
  className?: string;
  questionClassName?: string;
  choicesClassName?: string;
  statusClassName?: string;
  advancedClassName?: string;
}

const CognitiveChoiceScreen = ({
  title,
  subtitle,
  difficulty,
  round,
  totalRounds,
  score,
  onBack,
  question,
  choices,
  feedback,
  questionLabel,
  choicesLabel,
  className = 'bg-slate-50',
  questionClassName = 'flex items-center justify-center rounded-3xl border-2 border-slate-200 bg-white p-3 shadow-lg sm:p-5',
  choicesClassName = 'flex flex-col justify-center gap-3 pr-1 sm:gap-4',
  statusClassName = 'bg-slate-100 text-slate-800',
  advancedClassName = 'bg-slate-700',
}: CognitiveChoiceScreenProps) => (
  <GameShell
    title={title}
    subtitle={subtitle}
    onBack={onBack}
    className={className}
    contentClassName="relative"
    status={(
      <div className="flex items-center gap-1.5 sm:gap-2">
        {difficulty === 'ADVANCED' && (
          <span className={`rounded-full px-2 py-1 text-xs text-white ${advancedClassName}`}>進階</span>
        )}
        <span className={`rounded-full px-2 py-1 text-xs font-bold sm:px-3 sm:text-sm ${statusClassName}`}>
          第 {round}/{totalRounds} 題
        </span>
        <span className={`flex items-center rounded-full px-2 py-1 text-xs font-bold sm:px-3 sm:text-sm ${statusClassName}`}>
          <Trophy aria-hidden="true" className="mr-1 h-4 w-4" /> {score}
        </span>
      </div>
    )}
  >
    <SplitChoiceLayout
      className="mx-auto max-w-5xl"
      questionLabel={questionLabel}
      choicesLabel={choicesLabel}
      questionClassName={questionClassName}
      choicesClassName={choicesClassName}
      question={question}
      choices={choices}
      feedback={feedback}
    />
  </GameShell>
);

export default CognitiveChoiceScreen;
