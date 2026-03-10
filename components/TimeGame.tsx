
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { TimeLevel, Difficulty } from '../types';
import { generateTimeLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

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

const TimeGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 animate-fade-in">
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
      </div>
    );
  }

  if (loading || !level) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-slate-500 w-12 h-12" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-slate-800 shadow-sm hover:bg-slate-100"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-4">
          {difficulty === 'ADVANCED' && <span className="bg-slate-600 text-white px-2 py-1 rounded text-xs">進階</span>}
          <div className="text-slate-800 font-bold">第 {round} / {TOTAL_ROUNDS} 題</div>
          <div className="flex items-center bg-slate-200 px-3 py-1 rounded-full text-slate-800 font-bold"><Trophy size={16} className="mr-2"/> {score}</div>
        </div>
      </div>

      {/* Main Content - Flex Row on Landscape */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center p-4 gap-6 sm:gap-12 w-full max-w-5xl mx-auto overflow-hidden">
        
        {/* Left Side: Clock / Visual */}
        <div className="flex-1 flex justify-center items-center">
            <div className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-slate-100 flex flex-col items-center justify-center w-full max-w-xs aspect-square">
                {level.type === 'CLOCK' && level.clockTime ? (
                    <AnalogClock hour={level.clockTime.hour} minute={level.clockTime.minute} />
                ) : (
                    <Clock size={120} className="text-slate-300" />
                )}
            </div>
        </div>

        {/* Right Side: Question & Options */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center sm:text-left">{level.question}</h2>
            
            <div className="grid grid-cols-1 gap-3 w-full">
                {level.options.map((opt, idx) => (
                    <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    disabled={!!feedback}
                    className={`
                        py-3 sm:py-4 rounded-xl text-2xl font-bold shadow-md border-2 transition-all active:scale-95
                        ${feedback === 'correct' && opt === level.correctAnswer ? 'bg-green-500 text-white border-green-600' : ''}
                        ${feedback === 'wrong' && opt === selectedOption ? 'bg-red-100 border-red-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}
                    `}
                    >
                    {opt}
                    </button>
                ))}
            </div>
        </div>

        {/* Feedback Overlay */}
        {feedback && (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-3xl shadow-2xl border-4 z-50 animate-bounce-short flex items-center gap-3 ${feedback === 'correct' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
                {feedback === 'correct' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                <span className="text-2xl font-bold">{feedback === 'correct' ? "答對了！" : "再想想看"}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default TimeGame;
