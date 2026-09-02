import type { ReactNode } from 'react';
import { Trophy } from 'lucide-react';
import type { Difficulty } from '../../types';
import GameShell from './GameShell';
import GridFocusLayout from './GridFocusLayout';

interface GridFocusScreenProps {
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  round: number;
  totalRounds: number;
  score: number;
  onBack: () => void;
  playfield: ReactNode;
  support?: ReactNode;
  feedback?: ReactNode;
  actions?: ReactNode;
  playfieldLabel?: string;
  supportLabel?: string;
  className?: string;
  layoutClassName?: string;
  playfieldClassName?: string;
  supportClassName?: string;
  statusClassName?: string;
  advancedClassName?: string;
}

const GridFocusScreen = ({
  title,
  subtitle,
  difficulty,
  round,
  totalRounds,
  score,
  onBack,
  playfield,
  support,
  feedback,
  actions,
  playfieldLabel,
  supportLabel,
  className = 'bg-slate-50',
  layoutClassName,
  playfieldClassName,
  supportClassName,
  statusClassName = 'bg-slate-100 text-slate-800',
  advancedClassName = 'bg-slate-700',
}: GridFocusScreenProps) => (
  <GameShell
    title={title}
    subtitle={subtitle}
    onBack={onBack}
    actions={actions}
    className={className}
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
    <GridFocusLayout
      className={layoutClassName}
      playfieldLabel={playfieldLabel}
      supportLabel={supportLabel}
      playfieldClassName={playfieldClassName}
      supportClassName={supportClassName}
      playfield={playfield}
      support={support}
      feedback={feedback}
    />
  </GameShell>
);

export default GridFocusScreen;
