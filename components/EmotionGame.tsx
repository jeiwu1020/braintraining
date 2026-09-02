
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy, Heart } from 'lucide-react';
import { EmotionLevel, Difficulty } from '../types';
import { generateEmotionLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import SplitChoiceLayout from './game-ui/SplitChoiceLayout';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

interface EmotionRoundViewProps {
  level: EmotionLevel;
  difficulty: Difficulty;
  round: number;
  score: number;
  feedback: 'correct' | 'wrong' | null;
  wrongOption: string | null;
  feedbackMessage: string | null;
  onBack: () => void;
  onOptionClick: (option: string) => void;
}

export const EmotionRoundView = ({
  level,
  difficulty,
  round,
  score,
  feedback,
  wrongOption,
  feedbackMessage,
  onBack,
  onOptionClick,
}: EmotionRoundViewProps) => (
  <GameShell
    title="情緒氣象台"
    subtitle={difficulty === 'ADVANCED' ? '辨識複雜與混合情緒' : '觀察表情與情境，理解感受'}
    onBack={onBack}
    className="bg-pink-50"
    contentClassName="relative"
    status={(
      <div className="flex items-center gap-1.5 sm:gap-2">
        {difficulty === 'ADVANCED' && (
          <span className="rounded-full bg-pink-600 px-2 py-1 text-xs text-white">進階</span>
        )}
        <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-bold text-pink-800 sm:px-3 sm:text-sm">
          第 {round}/{TOTAL_ROUNDS} 題
        </span>
        <span className="flex items-center rounded-full bg-pink-100 px-2 py-1 text-xs font-bold text-pink-800 sm:px-3 sm:text-sm">
          <Trophy aria-hidden="true" className="mr-1 h-4 w-4" /> {score}
        </span>
      </div>
    )}
  >
    <SplitChoiceLayout
      className="mx-auto max-w-5xl"
      questionLabel="情緒題目區"
      choicesLabel="情緒作答區"
      questionClassName="flex flex-col items-center justify-center rounded-3xl border-2 border-pink-100 bg-white p-4 text-center shadow-lg sm:p-6"
      choicesClassName="flex flex-col justify-center gap-3 pr-1 sm:gap-4"
      question={(
        <>
          {level.emoji && (
            <div aria-hidden="true" className="mb-2 text-6xl sm:mb-4 sm:text-8xl">
              {level.emoji}
            </div>
          )}
          <h2 className="text-xl font-bold leading-relaxed text-gray-800 sm:text-2xl">
            {level.question}
          </h2>
        </>
      )}
      choices={level.options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onOptionClick(option)}
          disabled={feedback === 'correct'}
          className={`flex min-h-14 w-full shrink-0 items-center justify-center rounded-2xl border-2 px-2 py-3 text-xl font-bold shadow-md transition-all active:scale-95 sm:min-h-16 sm:text-2xl ${
            feedback === 'correct' && option === level.correctAnswer
              ? 'border-green-600 bg-green-500 text-white'
              : feedback === 'wrong' && option === wrongOption
                ? 'border-gray-200 bg-gray-100 text-gray-400 shake'
                : 'border-pink-200 bg-white text-pink-700 hover:bg-pink-50'
          }`}
        >
          {option}
        </button>
      ))}
      feedback={feedbackMessage ? (
        <span className="whitespace-nowrap text-red-600">{feedbackMessage}</span>
      ) : feedback === 'correct' ? (
        <span className="whitespace-nowrap text-green-700">答對了！</span>
      ) : undefined}
    />
  </GameShell>
);

const EmotionGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<EmotionLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [wrongOption, setWrongOption] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasWrongAttempt, setHasWrongAttempt] = useState(false);
  
  // Track used indices to avoid repetition
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setFeedback(null);
    setWrongOption(null);
    setErrorMsg(null);
    setHasWrongAttempt(false);
    
    // Pass usedIndices to prevent repeats
    const { level: data, index } = await generateEmotionLevel(usedIndices, difficulty as Difficulty);
    setLevel(data);
    setUsedIndices(prev => [...prev, index]);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const calculateScore = () => {
      // If user has made a wrong attempt on this question, score is 0
      if (hasWrongAttempt) return 0;

      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let points = 10; // Base score
      
      // Speed bonus
      if (timeTaken < 3) points += 10;      // Super fast
      else if (timeTaken < 6) points += 5;  // Fast
      
      return points;
  }

  const handleOptionClick = (option: string) => {
      if (!level || feedback === 'correct') return;

      if (option === level.correctAnswer) {
          const points = calculateScore();
          setScore(s => s + points);
          setFeedback('correct');
          setErrorMsg(null);
          soundService.playCorrect();
          
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
          setHasWrongAttempt(true);
          setFeedback('wrong');
          setWrongOption(option);
          setErrorMsg("再想想看！");
          soundService.playWrong();
          
          setTimeout(() => {
              setFeedback(null);
              setWrongOption(null);
              setErrorMsg(null);
          }, 1500);
      }
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setIsFinished(false);
    setUsedIndices([]); // Reset history on restart
    startRound();
  };

  // Tiered Evaluation
  const getEvaluation = (finalScore: number) => {
      if (finalScore >= 160) return { title: "同理心大師！", desc: "你能精準且快速地感受到他人的情緒！" };
      if (finalScore >= 100) return { title: "很棒的觀察！", desc: "對情緒的觀察很敏銳喔。" };
      return { title: "再接再厲！", desc: "試著多想想別人的感受喔。" };
  };

  if (isFinished) {
    const evalResult = getEvaluation(score);
    return (
      <GameShell
        title="情緒氣象台"
        subtitle="本回合完成"
        onBack={onBack}
        className="bg-pink-50"
        contentClassName="flex items-center justify-center overflow-y-auto p-4"
      >
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-pink-200">
              <Heart className="w-20 h-20 text-pink-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-pink-900 mb-2">{evalResult.title}</h2>
              <div className="text-6xl font-black text-pink-600 mb-4">{score}</div>
              <p className="text-gray-600 mb-8">
                  {evalResult.desc}
              </p>
              <div className="flex gap-4">
                   <button onClick={onBack} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">
                      回主選單
                  </button>
                  <button onClick={handleRestart} className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 shadow-lg">
                      再玩一次
                  </button>
              </div>
          </div>
      </GameShell>
    );
  }

  if (loading || !level) {
      return (
        <GameShell
          title="情緒氣象台"
          subtitle={difficulty === 'ADVANCED' ? '辨識複雜與混合情緒' : '觀察表情與情境，理解感受'}
          onBack={onBack}
          className="bg-pink-50"
          contentClassName="flex items-center justify-center"
        >
          <div role="status" aria-live="polite" className="flex flex-col items-center text-pink-800">
            <Loader2 aria-hidden="true" className="mb-4 h-12 w-12 animate-spin text-pink-500" />
            <p>準備情緒題目中...</p>
          </div>
        </GameShell>
      );
  }

  return (
    <EmotionRoundView
      level={level}
      difficulty={difficulty}
      round={round}
      score={score}
      feedback={feedback}
      wrongOption={wrongOption}
      feedbackMessage={errorMsg}
      onBack={onBack}
      onOptionClick={handleOptionClick}
    />
  );
};

export default EmotionGame;
