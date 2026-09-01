
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy, CheckCircle } from 'lucide-react';
import { MarketLevel, Difficulty } from '../types';
import { generateMarketLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import SplitChoiceLayout from './game-ui/SplitChoiceLayout';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const MarketGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<MarketLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [wrongOption, setWrongOption] = useState<number | null>(null);
  
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
    setWrongOption(null);
    
    const { level: data, index } = await generateMarketLevel(usedIndices, difficulty as Difficulty);
    
    setLevel(data);
    setUsedIndices(prev => [...prev, index]);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const calculateScore = () => {
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let bonus = 0;
      if (timeTaken < 5) bonus = 10;
      else if (timeTaken < 10) bonus = 5;
      return 20 + bonus;
  }

  const handleOptionClick = (value: number) => {
    if (!level || feedback === 'correct') return;

    if (value === level.correctAnswer) {
      const roundScore = calculateScore();
      setScore(s => s + roundScore);
      setFeedback('correct');
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
      setFeedback('wrong');
      setWrongOption(value);
      soundService.playWrong();
      setTimeout(() => {
          setFeedback(null);
          setWrongOption(null);
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
        title="快樂市集"
        subtitle={difficulty === 'ADVANCED' ? '進階金錢管理' : '生活算術與採購練習'}
        onBack={onBack}
        className="bg-green-50"
        contentClassName="flex items-center justify-center p-3"
      >
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-green-200">
              <Trophy className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-900 mb-2">採購完成！</h2>
              <div className="text-6xl font-black text-green-600 mb-4">{score}</div>
              <p className="text-gray-600 mb-8">
                  你的算術能力很棒！<br/>金錢管理沒問題。
              </p>
              <div className="flex gap-4">
                   <button 
                      onClick={onBack}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                  >
                      回主選單
                  </button>
                  <button 
                      onClick={handleRestart}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg"
                  >
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
        title="快樂市集"
        subtitle={difficulty === 'ADVANCED' ? '進階金錢管理' : '生活算術與採購練習'}
        onBack={onBack}
        className="bg-green-50"
        contentClassName="flex items-center justify-center"
      >
        <div role="status" aria-live="polite" className="flex flex-col items-center">
          <Loader2 aria-hidden="true" className="mb-4 h-12 w-12 animate-spin text-green-600" />
          <p className="text-green-800">準備市集中...</p>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="快樂市集"
      subtitle={difficulty === 'ADVANCED' ? '進階金錢管理' : '生活算術與採購練習'}
      onBack={onBack}
      className="bg-green-50"
      contentClassName="relative"
      status={(
        <div className="flex items-center gap-1.5 sm:gap-2">
          {difficulty === 'ADVANCED' && (
            <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">進階</span>
          )}
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800 sm:px-3 sm:text-sm">
            第 {round}/{TOTAL_ROUNDS} 題
          </span>
          <span className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800 sm:px-3 sm:text-sm">
            <Trophy aria-hidden="true" className="mr-1 h-4 w-4" /> {score}
          </span>
        </div>
      )}
    >
      <SplitChoiceLayout
        className="mx-auto max-w-5xl"
        questionClassName="flex flex-col items-center justify-center rounded-3xl border-2 border-green-100 bg-white p-3 shadow-lg sm:p-5"
        choicesClassName="flex flex-col justify-center gap-3 pr-1 sm:gap-4"
        question={(
          <>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 text-center sticky top-0 bg-white/95 py-2 z-10">{level.question}</h2>

            <div className="flex flex-wrap justify-center gap-4 mb-2 w-full">
                {level.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center p-2 bg-green-50 rounded-xl border border-green-200 w-24 sm:w-28 shrink-0">
                        <div className="text-4xl sm:text-5xl mb-1">{item.icon}</div>
                        <div className="font-bold text-gray-700 mb-1 text-sm sm:text-base whitespace-nowrap">{item.name}</div>
                        <div className="bg-green-600 text-white px-3 py-0.5 rounded-full text-xs sm:text-sm font-bold shadow-sm">
                            ${item.price}
                        </div>
                    </div>
                ))}
            </div>
          </>
        )}
        choices={(
          <>
            {level.options.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    className={`
                        w-full py-4 sm:py-6 landscape:py-3 md:landscape:py-4 rounded-2xl text-2xl sm:text-3xl font-bold shadow-md border-2 transition-all active:scale-95 flex items-center justify-center shrink-0
                        ${feedback === 'correct' && opt === level.correctAnswer ? 'bg-green-500 text-white border-green-600' : ''}
                        ${feedback === 'wrong' && opt === wrongOption ? 'bg-gray-100 text-gray-400 border-gray-200 shake' : ''}
                        ${!feedback || (feedback === 'wrong' && opt !== wrongOption) ? 'bg-white text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300' : ''}
                    `}
                    disabled={feedback === 'correct'}
                >
                    <span className="mr-1">$</span> {opt}
                    {feedback === 'correct' && opt === level.correctAnswer && <CheckCircle className="ml-3 w-6 h-6 animate-bounce" />}
                </button>
            ))}
          </>
        )}
        feedback={feedback === 'wrong' ? (
          <span className="whitespace-nowrap text-red-600">算錯囉，再試一次！</span>
        ) : undefined}
      />
    </GameShell>
  );
};

export default MarketGame;
