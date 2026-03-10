
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, Heart } from 'lucide-react';
import { EmotionLevel, Difficulty } from '../types';
import { generateEmotionLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4 animate-fade-in">
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
      </div>
    );
  }

  if (loading || !level) {
      return <div className="min-h-screen bg-pink-50 flex items-center justify-center"><Loader2 className="animate-spin text-pink-500"/></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-pink-50 overflow-hidden relative">
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-pink-800 shadow-sm hover:bg-pink-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
            {difficulty === 'ADVANCED' && <span className="bg-pink-600 text-white px-2 py-1 rounded text-xs">進階</span>}
            <div className="text-pink-800 font-bold">第 {round} / {TOTAL_ROUNDS} 題</div>
             <div className="flex items-center bg-pink-100 px-3 py-1 rounded-full text-pink-800 font-bold">
                <Trophy size={16} className="mr-2"/> {score}
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center p-4 gap-6 max-w-5xl mx-auto w-full relative overflow-hidden">
          
          {/* Question Card */}
          <div className="flex-1 bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border-4 border-pink-100 text-center flex flex-col items-center justify-center h-auto max-h-[40vh] sm:max-h-full w-full sm:w-auto overflow-y-auto">
              {level.emoji && (
                  <div className="text-7xl sm:text-9xl mb-4 sm:mb-6 animate-bounce-short">
                      {level.emoji}
                  </div>
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed">
                  {level.question}
              </h3>
          </div>

          {/* Feedback Overlay Message */}
          {errorMsg && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-short pointer-events-none">
                  <div className="bg-red-100 text-red-600 px-8 py-4 rounded-2xl font-bold shadow-2xl border-2 border-red-200 text-2xl whitespace-nowrap">
                      {errorMsg}
                  </div>
              </div>
          )}

          {/* Options */}
          <div className="flex-none w-full sm:w-64 grid grid-cols-1 gap-3 sm:gap-4 overflow-y-auto">
              {level.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    className={`
                        py-4 px-2 rounded-xl text-xl font-bold shadow-md transition-all active:scale-95 border-2 min-h-[4rem] flex items-center justify-center
                        ${feedback === 'correct' && opt === level.correctAnswer ? 'bg-green-500 text-white border-green-600' : ''}
                        ${feedback === 'wrong' && opt === wrongOption ? 'bg-gray-100 text-gray-400 border-gray-200 shake' : ''}
                        ${!feedback || (feedback === 'wrong' && opt !== wrongOption) ? 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50' : ''}
                    `}
                  >
                      {opt}
                  </button>
              ))}
          </div>

      </div>
    </div>
  );
};

export default EmotionGame;
