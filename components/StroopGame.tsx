
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { StroopLevel, Difficulty } from '../types';
import { generateStroopLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import CognitiveChoiceScreen from './game-ui/CognitiveChoiceScreen';
import GameShell from './game-ui/GameShell';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const StroopGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }: Props) => {
  const [level, setLevel] = useState<StroopLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Feedback States
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  // Timer for scoring
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setFeedback(null);
    // Pass previous text (if any) to prevent immediate repeat
    const previousText = level ? level.text : "";
    const data = await generateStroopLevel(difficulty as Difficulty, previousText);
    setLevel(data);
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const handleAnswer = (answer: string) => {
      if (!level || feedback !== null) return; // Prevent double clicks

      const isCorrect = answer === level.colorName;
      
      if (isCorrect) {
          const timeTaken = (Date.now() - startTimeRef.current) / 1000;
          
          // Scoring logic: Faster is better
          // Advanced mode expects faster reactions
          let points = 10;
          if (difficulty === 'ADVANCED') {
             if (timeTaken < 1.5) points += 10;
             else if (timeTaken < 3) points += 5;
          } else {
             if (timeTaken < 2) points += 10;
             else if (timeTaken < 4) points += 5;
          }
          
          // Streak bonus
          const finalScore = points + (streak * 2);

          setScore(s => s + finalScore);
          setStreak(s => s + 1);
          setFeedback('correct');
          soundService.playCorrect();
      } else {
          setStreak(0);
          setFeedback('wrong');
          soundService.playWrong();
      }

      // Delay then next
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
            setRound(r => r + 1);
            startRound();
        } else {
            setIsFinished(true);
            soundService.playWin();
        }
      }, 1000); 
  };

  const handleRestart = () => {
      setRound(1);
      setScore(0);
      setStreak(0);
      setLevel(null); // Reset level to clear history
      setIsFinished(false);
      startRound();
  }

  // Tiered Evaluation
  const getEvaluation = (finalScore: number) => {
      const threshold = difficulty === 'ADVANCED' ? 200 : 180;
      if (finalScore >= threshold) return { title: "反應神速！", desc: "你的大腦處理速度非常驚人！" };
      if (finalScore >= (threshold * 0.6)) return { title: "表現優異！", desc: "你的專注力保持得很好喔。" };
      return { title: "再接再厲！", desc: "慢慢練習，準確度最重要。" };
  };

  if (isFinished) {
    const evalResult = getEvaluation(score);
    return (
      <GameShell title="顏色陷阱" subtitle="本回合完成" onBack={onBack} className="bg-rose-50" contentClassName="flex items-center justify-center overflow-y-auto p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-rose-200">
              <Trophy className="w-20 h-20 text-rose-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-rose-900 mb-2">{evalResult.title}</h2>
              <div className="text-6xl font-black text-rose-600 mb-4">{score}</div>
              <p className="text-gray-600 mb-8">
                  {evalResult.desc}
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
                      className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg"
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
        <GameShell title="顏色陷阱" subtitle="回答文字顯示的顏色" onBack={onBack} className="bg-rose-50" contentClassName="flex items-center justify-center">
          <div role="status" aria-live="polite" className="flex flex-col items-center text-rose-800">
            <Loader2 aria-hidden="true" className="mb-4 h-12 w-12 animate-spin text-rose-500" />
            <p>準備顏色題目中...</p>
          </div>
        </GameShell>
      );
  }

  return (
    <CognitiveChoiceScreen
      title="顏色陷阱"
      subtitle={difficulty === 'ADVANCED' ? '快速辨識文字實際顯示的顏色' : '回答文字實際顯示的顏色'}
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className={feedback === 'wrong' ? 'bg-red-50' : 'bg-rose-50'}
      statusClassName="bg-rose-100 text-rose-800"
      advancedClassName="bg-rose-600"
      questionLabel="顏色刺激題目區"
      choicesLabel="顏色名稱作答區"
      questionClassName="flex flex-col items-center justify-center rounded-3xl border-2 border-rose-100 bg-white p-3 shadow-lg sm:p-5"
      choicesClassName="flex items-center justify-center"
      question={(
        <>
                    <p className="mb-3 text-center text-base text-gray-500 sm:text-lg">
                        請回答這個字的 <span className="font-bold text-black underline decoration-rose-500 decoration-4">顏色</span>
                    </p>
                    <div className="flex min-h-32 w-full items-center justify-center rounded-3xl border-4 border-rose-100 bg-white sm:min-h-36">
                        <span className={`text-7xl font-black sm:text-8xl ${level.colorCode}`}>
                            {level.text}
                        </span>
                    </div>
        </>
      )}
      choices={(
                <div className="grid w-full grid-cols-3 content-center gap-2 sm:gap-3">
                    {level.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(opt)}
                            disabled={feedback !== null}
                            className="flex min-h-16 items-center justify-center rounded-xl border-2 border-rose-200 bg-white py-3 text-xl font-bold text-gray-700 shadow-md transition-all hover:bg-rose-100 active:scale-95 disabled:opacity-50 sm:text-2xl"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
      )}
      feedback={feedback ? (
        <span className={feedback === 'correct' ? 'text-green-700' : 'text-red-700'}>
          {feedback === 'correct' ? '答對了！' : `看錯囉，正確是 ${level.colorName} 色`}
        </span>
      ) : undefined}
    />
  );
};

export default StroopGame;
