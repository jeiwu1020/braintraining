
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { MarketLevel, Difficulty } from '../types';
import { generateMarketLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4 animate-fade-in">
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
      </div>
    );
  }

  if (loading || !level) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-green-800">準備市集中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-green-50 overflow-hidden relative">
      {/* Header */}
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-green-800 shadow-sm hover:bg-green-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
            {difficulty === 'ADVANCED' && <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">進階</span>}
             <div className="px-3 py-1 bg-green-100 rounded-full text-green-800 font-bold text-sm">
                第 {round} / {TOTAL_ROUNDS} 題
             </div>
             <div className="flex items-center bg-green-100 px-3 py-1 rounded-full text-green-800 font-bold">
                <Trophy size={16} className="mr-2"/> {score}
             </div>
        </div>
      </div>

      {/* Main Content: Flex-col portrait, Flex-row landscape */}
      <div className="flex-1 flex flex-col sm:flex-row items-center p-2 sm:p-4 max-w-4xl mx-auto w-full gap-4 sm:gap-6 overflow-hidden">
        
        {/* Question Area - Left in Landscape */}
        <div className="flex-none sm:flex-1 w-full sm:h-full bg-white rounded-3xl p-4 sm:p-6 shadow-lg border-2 border-green-100 flex flex-col items-center justify-center animate-fade-in-up overflow-y-auto max-h-[45vh] sm:max-h-none">
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
        </div>

        {/* Options Area - Right in Landscape */}
        <div className="flex-none sm:flex-1 w-full sm:h-full flex flex-col justify-center gap-3 sm:gap-4 overflow-y-auto">
            {level.options.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    className={`
                        w-full py-4 sm:py-6 rounded-2xl text-2xl sm:text-3xl font-bold shadow-md border-2 transition-all active:scale-95 flex items-center justify-center shrink-0
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
        </div>

        {/* Feedback Message */}
        {feedback === 'wrong' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-600 px-6 py-3 rounded-full font-bold shadow-xl animate-bounce-short border-2 border-red-200 whitespace-nowrap z-50 pointer-events-none">
                算錯囉，再試一次！
            </div>
        )}
      </div>
    </div>
  );
};

export default MarketGame;
