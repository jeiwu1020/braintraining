
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, Clock, CheckCircle } from 'lucide-react';
import { StroopLevel, Difficulty } from '../types';
import { generateStroopLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const StroopGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 p-4 animate-fade-in">
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
      </div>
    );
  }

  if (loading || !level) {
      return <div className="min-h-screen bg-rose-50 flex items-center justify-center"><Loader2 className="animate-spin text-rose-500"/></div>;
  }

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-300 ${feedback === 'wrong' ? 'bg-red-50' : 'bg-rose-50'}`}>
       {/* Header */}
       <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
            <button onClick={onBack} className="p-2 bg-white rounded-full text-rose-800 shadow-sm hover:bg-rose-100">
            <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-4">
                {difficulty === 'ADVANCED' && <span className="bg-rose-600 text-white px-2 py-1 rounded text-xs">進階</span>}
                <div className="text-rose-800 font-bold">第 {round} / {TOTAL_ROUNDS} 題</div>
                <div className="flex items-center bg-rose-100 px-3 py-1 rounded-full text-rose-800 font-bold">
                    <Trophy size={16} className="mr-2"/> {score}
                </div>
            </div>
        </div>

        {/* Main Content - Allow scrolling if height is small (landscape) */}
        <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 min-h-full">
                
                {/* Left Side: Question */}
                <div className="flex-none flex flex-col items-center justify-center max-w-sm">
                    <p className="text-gray-500 text-lg mb-2 text-center shrink-0">
                        請回答這個字的 <span className="font-bold text-black underline decoration-rose-500 decoration-4">顏色</span>
                    </p>
                    
                    {/* The Stroop Word - Responsive Sizing */}
                    <div className="bg-white rounded-3xl shadow-xl border-4 border-rose-100 w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center relative shrink-0">
                        <span className={`text-7xl sm:text-9xl font-black ${level.colorCode}`}>
                            {level.text}
                        </span>
                        
                        {/* Feedback Overlay */}
                        {feedback === 'correct' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl animate-fade-in z-20">
                                <div className="text-green-600 flex flex-col items-center">
                                    <CheckCircle className="w-16 h-16 mb-2" />
                                    <span className="text-3xl font-bold">答對了！</span>
                                </div>
                            </div>
                        )}
                        {feedback === 'wrong' && (
                             <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl animate-fade-in z-20">
                                <div className="text-red-500 flex flex-col items-center">
                                    <span className="text-3xl font-bold">看錯囉！</span>
                                    <span className="text-xl mt-2">是 {level.colorName} 色</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Options - Responsive Grid */}
                <div className="flex-none w-full max-w-sm grid grid-cols-3 gap-3 sm:gap-4 content-center">
                    {level.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(opt)}
                            disabled={feedback !== null}
                            className="py-3 sm:py-4 bg-white border-2 border-rose-200 rounded-xl text-xl sm:text-2xl font-bold text-gray-700 shadow-md hover:bg-rose-100 active:scale-95 transition-all disabled:opacity-50 h-20 sm:h-24 flex items-center justify-center"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default StroopGame;
