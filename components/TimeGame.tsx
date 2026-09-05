
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy, Clock } from 'lucide-react';
import { TimeLevel, Difficulty } from '../types';
import { generateTimeLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import SplitChoiceLayout from './game-ui/SplitChoiceLayout';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

// Simple Analog Clock Component
const AnalogClock = ({ hour, minute }: { hour: number, minute: number }) => {
    const minuteDeg = minute * 6;
    const hourDeg = (hour % 12) * 30 + minute * 0.5;
    return (
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full border-4 sm:border-8 border-slate-700 bg-white shadow-xl flex items-center justify-center">
            {/* Markers */}
            {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute w-1 h-2 sm:h-3 bg-slate-300" style={{ transform: `rotate(${i * 30}deg) translateY(-420%)` }} />
            ))}
            {/* Hour Hand */}
            <div className="absolute w-1.5 sm:w-2 h-12 sm:h-16 bg-slate-800 rounded-full origin-bottom" style={{ transform: `rotate(${hourDeg}deg) translateY(-50%)`, bottom: '50%' }} />
            {/* Minute Hand */}
            <div className="absolute w-1 h-16 sm:h-24 bg-slate-500 rounded-full origin-bottom" style={{ transform: `rotate(${minuteDeg}deg) translateY(-50%)`, bottom: '50%' }} />
            {/* Center Dot */}
            <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-slate-800 rounded-full z-10" />
        </div>
    );
};

interface TimeRoundViewProps {
  level: TimeLevel;
  difficulty: Difficulty;
  round: number;
  score: number;
  feedback: 'correct' | 'wrong' | null;
  selectedOption: string | null;
  onBack: () => void;
  onOptionClick: (option: string) => void;
}

export const TimeRoundView = ({
  level,
  difficulty,
  round,
  score,
  feedback,
  selectedOption,
  onBack,
  onOptionClick,
}: TimeRoundViewProps) => (
  <GameShell
    title="時間管家"
    subtitle={difficulty === 'ADVANCED' ? '進階時間計算與規劃' : '看懂時鐘，建立時間觀念'}
    onBack={onBack}
    className="bg-slate-50"
    contentClassName="relative"
    status={(
      <div className="flex items-center gap-1.5 sm:gap-2">
        {difficulty === 'ADVANCED' && (
          <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-white">進階</span>
        )}
        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-800 sm:px-3 sm:text-sm">
          第 {round}/{TOTAL_ROUNDS} 題
        </span>
        <span className="flex items-center rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-800 sm:px-3 sm:text-sm">
          <Trophy aria-hidden="true" className="mr-1 h-4 w-4" /> {score}
        </span>
      </div>
    )}
  >
    <SplitChoiceLayout
      className="mx-auto max-w-5xl"
      questionLabel="時間題目區"
      choicesLabel="時間作答區"
      questionClassName="flex flex-col items-center justify-center rounded-3xl border-2 border-slate-200 bg-white p-3 text-center shadow-lg sm:p-5"
      choicesClassName="flex flex-col justify-center gap-3 pr-1 sm:gap-4"
      question={(
        <>
          {level.type === 'CLOCK' && level.clockTime ? (
            <AnalogClock hour={level.clockTime.hour} minute={level.clockTime.minute} />
          ) : (
            <Clock aria-hidden="true" className="h-24 w-24 text-slate-300 sm:h-32 sm:w-32" />
          )}
          <h2 className="mt-3 text-xl font-bold leading-snug text-slate-800 sm:text-2xl">
            {level.question}
          </h2>
        </>
      )}
      choices={level.options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onOptionClick(option)}
          disabled={!!feedback}
          className={`w-full shrink-0 rounded-2xl border-2 py-3 text-xl font-bold shadow-md transition-all active:scale-95 sm:text-2xl md:py-4 ${
            feedback === 'correct' && option === level.correctAnswer
              ? 'border-green-600 bg-green-500 text-white'
              : feedback === 'wrong' && option === selectedOption
                ? 'border-red-300 bg-red-100 text-red-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          {option}
        </button>
      ))}
      feedback={feedback ? (
        <span className={`whitespace-nowrap ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
          {feedback === 'correct' ? '答對了！' : '再想想看'}
        </span>
      ) : undefined}
    />
  </GameShell>
);

const TimeGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }: Props) => {
  const [level, setLevel] = useState<TimeLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Used Indices Tracking
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setFeedback(null);
    setSelectedOption(null);
    
    // Pass usedIndices to exclude already played questions
    const { level: data, index } = await generateTimeLevel(usedIndices, difficulty as Difficulty);
    
    setLevel(data);
    setUsedIndices(prev => [...prev, index]);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const handleOptionClick = (option: string) => {
    if (!level || feedback) return;
    setSelectedOption(option);

    if (option === level.correctAnswer) {
      setFeedback('correct');
      soundService.playCorrect();
      setScore(s => s + 10);
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
          startRound();
        } else {
          setIsFinished(true);
          soundService.playWin();
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      soundService.playWrong();
      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setUsedIndices([]); // Reset history
    setIsFinished(false);
    startRound();
  };

  if (isFinished) {
    return (
      <GameShell
        title="時間管家"
        subtitle="本回合完成"
        onBack={onBack}
        className="bg-slate-50"
        contentClassName="flex items-center justify-center overflow-y-auto p-4"
      >
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-slate-200">
          <Trophy className="w-20 h-20 text-slate-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">時間大師！</h2>
          <div className="text-6xl font-black text-slate-600 mb-4">{score}</div>
          <p className="text-gray-600 mb-8">你的時間觀念很棒！</p>
          <div className="flex gap-4">
            <button onClick={onBack} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">回主選單</button>
            <button onClick={handleRestart} className="flex-1 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 shadow-lg">再玩一次</button>
          </div>
        </div>
      </GameShell>
    );
  }

  if (loading || !level) {
    return (
      <GameShell
        title="時間管家"
        subtitle={difficulty === 'ADVANCED' ? '進階時間計算與規劃' : '看懂時鐘，建立時間觀念'}
        onBack={onBack}
        className="bg-slate-50"
        contentClassName="flex items-center justify-center"
      >
        <div role="status" aria-live="polite" className="flex flex-col items-center text-slate-700">
          <Loader2 aria-hidden="true" className="mb-4 h-12 w-12 animate-spin text-slate-500" />
          <p>準備時間題目中...</p>
        </div>
      </GameShell>
    );
  }

  return (
    <TimeRoundView
      level={level}
      difficulty={difficulty}
      round={round}
      score={score}
      feedback={feedback}
      selectedOption={selectedOption}
      onBack={onBack}
      onOptionClick={handleOptionClick}
    />
  );
};

export default TimeGame;
