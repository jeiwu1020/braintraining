
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { PatternLevel, Difficulty } from '../types';
import { generatePatternLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import CognitiveChoiceScreen from './game-ui/CognitiveChoiceScreen';
import GameShell from './game-ui/GameShell';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const PatternGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }: Props) => {
  const [level, setLevel] = useState<PatternLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const startTimeRef = useRef<number>(0);
  
  // Track used indices to avoid repeats in a session
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setFeedback(null);
    setSelectedOption(null);
    setIsRoundComplete(false);
    
    // Pass used indices to exclude them
    const { level: data, index } = await generatePatternLevel(usedIndices, difficulty as Difficulty);
    
    setLevel(data);
    setUsedIndices(prev => [...prev, index]); // Add current to history
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const handleOptionClick = (option: string) => {
    if (!level || feedback || isRoundComplete) return;
    setSelectedOption(option);

    if (option === level.answer) {
      setFeedback('correct');
      setIsRoundComplete(true);
      soundService.playCorrect();
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let points = 10;
      if (timeTaken < 5) points += 10;
      setScore(s => s + points);
      // Removed auto-advance logic
    } else {
      setFeedback('wrong');
      soundService.playWrong();
      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
      }, 1000);
    }
  };

  const handleNext = () => {
      if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
          startRound();
      } else {
          setIsFinished(true);
          soundService.playWin();
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
      <GameShell title="圖形推理王" subtitle="本回合完成" onBack={onBack} className="bg-blue-50" contentClassName="flex items-center justify-center overflow-y-auto p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-blue-200">
          <Trophy className="w-20 h-20 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-blue-900 mb-2">推理完成！</h2>
          <div className="text-6xl font-black text-blue-600 mb-4">{score}</div>
          <p className="text-gray-600 mb-8">你的邏輯非常清晰！</p>
          <div className="flex gap-4">
            <button onClick={onBack} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">回主選單</button>
            <button onClick={handleRestart} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg">再玩一次</button>
          </div>
        </div>
      </GameShell>
    );
  }

  if (loading || !level) {
    return (
      <GameShell title="圖形推理王" subtitle="觀察規律後選出下一個圖形" onBack={onBack} className="bg-blue-50" contentClassName="flex items-center justify-center">
        <div role="status" aria-live="polite" className="flex flex-col items-center text-blue-800">
          <Loader2 aria-hidden="true" className="mb-4 h-12 w-12 animate-spin text-blue-500" />
          <p>準備圖形題目中...</p>
        </div>
      </GameShell>
    );
  }

  return (
    <CognitiveChoiceScreen
      title="圖形推理王"
      subtitle={difficulty === 'ADVANCED' ? '挑戰更複雜的圖形規律' : '觀察規律後選出下一個圖形'}
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className="bg-blue-50"
      statusClassName="bg-blue-100 text-blue-800"
      advancedClassName="bg-blue-600"
      questionLabel="圖形規律題目區"
      choicesLabel="圖形規律作答區"
      questionClassName="flex flex-wrap items-center justify-center gap-3 rounded-3xl border-2 border-blue-100 bg-white p-4 shadow-lg sm:gap-6 sm:p-6"
      choicesClassName="flex flex-col items-center justify-center gap-3"
      question={(
        <>
          {level.sequence.map((item, idx) => {
            const isQuestionMark = item === '?';
            const content = (isQuestionMark && isRoundComplete) ? level.answer : item;
            const isRevealedAnswer = isQuestionMark && isRoundComplete;

            return (
                <div key={idx} className={`
                    text-4xl sm:text-6xl transition-all duration-500
                    ${isQuestionMark && !isRoundComplete ? 'text-blue-300 animate-pulse' : ''}
                    ${isRevealedAnswer ? 'text-green-600 scale-125 font-bold' : ''}
                `}>
                {(isQuestionMark && !isRoundComplete) ? <HelpCircle size={40} className="sm:w-16 sm:h-16" /> : content}
                </div>
            );
          })}
        </>
      )}
      choices={(
        <div className="flex w-full flex-col items-center justify-center gap-3">
            {!isRoundComplete ? (
                <>
                    <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
                    {level.options.map((opt, idx) => (
                        <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={!!feedback}
                        className={`
                            min-h-16 rounded-2xl text-3xl sm:text-4xl shadow-md border-2 transition-all active:scale-95 flex items-center justify-center
                            ${feedback === 'wrong' && opt === selectedOption ? 'bg-red-100 border-red-300' : 'bg-white hover:bg-blue-50 border-blue-200'}
                        `}
                        >
                        {opt}
                        </button>
                    ))}
                    </div>
                    <p className="font-bold text-blue-500">下一個是什麼？</p>
                </>
            ) : (
                <div className="flex w-full flex-col items-center gap-3 animate-fade-in-up">
                    <div className="flex items-center gap-2 text-green-600 bg-green-100 px-6 py-2 rounded-full border-2 border-green-300">
                        <CheckCircle size={32} />
                        <span className="text-2xl font-bold">答對了！</span>
                    </div>
                    <button 
                        onClick={handleNext}
                        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-8 font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
                    >
                        下一題 <ArrowRight className="ml-2" />
                    </button>
                </div>
            )}
        </div>
      )}
      feedback={feedback === 'wrong' ? <span className="text-red-700">再想想看</span> : undefined}
    />
  );
};

export default PatternGame;
