
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, HelpCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { PatternLevel, Difficulty } from '../types';
import { generatePatternLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const PatternGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
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
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-blue-50 p-4 animate-fade-in">
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
      </div>
    );
  }

  if (loading || !level) {
    return (
      <div className="min-h-[100dvh] bg-blue-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-blue-50 overflow-hidden relative">
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-blue-800 shadow-sm hover:bg-blue-100"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-4">
          {difficulty === 'ADVANCED' && <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">進階</span>}
          <div className="text-blue-800 font-bold">第 {round} / {TOTAL_ROUNDS} 題</div>
          <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-bold"><Trophy size={16} className="mr-2"/> {score}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 landscape:p-1 landscape:gap-2 gap-4 sm:gap-8 overflow-y-auto">
        
        {/* Question Sequence */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg border-2 border-blue-100 w-full max-w-4xl flex flex-wrap justify-center gap-2 sm:gap-6 min-h-[80px] sm:min-h-[120px] landscape:min-h-[60px] items-center shrink-0">
          {level.sequence.map((item, idx) => {
            const isQuestionMark = item === '?';
            // If round is complete and this is the question mark, show the answer
            const content = (isQuestionMark && isRoundComplete) ? level.answer : item;
            // Highlight style for the revealed answer
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
        </div>

        {/* Options / Result Area - Fixed Height Container to prevent jumping */}
        <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px]">
            {!isRoundComplete ? (
                <>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
                    {level.options.map((opt, idx) => (
                        <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={!!feedback}
                        className={`
                            h-20 sm:h-24 rounded-2xl text-3xl sm:text-4xl shadow-md border-2 transition-all active:scale-95 flex items-center justify-center
                            ${feedback === 'wrong' && opt === selectedOption ? 'bg-red-100 border-red-300' : 'bg-white hover:bg-blue-50 border-blue-200'}
                        `}
                        >
                        {opt}
                        </button>
                    ))}
                    </div>
                    <div className="text-blue-400 font-bold text-base sm:text-lg mt-4 animate-fade-in">下一個是什麼？</div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-4 animate-fade-in-up w-full">
                    <div className="flex items-center gap-2 text-green-600 bg-green-100 px-6 py-2 rounded-full border-2 border-green-300">
                        <CheckCircle size={32} />
                        <span className="text-2xl font-bold">答對了！</span>
                    </div>
                    <button 
                        onClick={handleNext}
                        className="w-full sm:w-auto px-12 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl transition-all active:scale-95"
                    >
                        下一題 <ArrowRight className="ml-2" />
                    </button>
                </div>
            )}
        </div>

        {/* Wrong Feedback Overlay (Transient) */}
        {feedback === 'wrong' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-3xl shadow-2xl border-4 z-50 animate-bounce-short flex items-center gap-3 bg-red-100 border-red-500 text-red-700 pointer-events-none">
                <XCircle size={32} />
                <span className="text-2xl font-bold">再想想看</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default PatternGame;
