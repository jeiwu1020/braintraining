
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { OddOneLevel, Difficulty } from '../types';
import { generateOddOneLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const OddOneGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<OddOneLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showReason, setShowReason] = useState(false);
  
  const startTimeRef = useRef<number>(0);

  // Used Indices Tracking
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setFeedback(null);
    setSelectedIndex(null);
    setShowReason(false);
    
    // Pass usedIndices to exclude duplicates
    const { level: data, index } = await generateOddOneLevel(usedIndices, difficulty as Difficulty);
    
    setLevel(data);
    setUsedIndices(prev => [...prev, index]);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const handleItemClick = (index: number) => {
    if (!level || feedback) return;
    setSelectedIndex(index);

    if (index === level.correctIndex) {
      setFeedback('correct');
      soundService.playCorrect();
      
      // Time-based scoring
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let points = 10;
      if (timeTaken < 3) points += 10;      // < 3s: 20 pts
      else if (timeTaken < 5) points += 5;  // < 5s: 15 pts
      
      setScore(s => s + points);
      
      if(level.reason) setShowReason(true);
      
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
          startRound();
        } else {
          setIsFinished(true);
          soundService.playWin();
        }
      }, level.reason ? 2500 : 1500); // Give time to read reason
    } else {
      setFeedback('wrong');
      soundService.playWrong();
      setTimeout(() => {
        setFeedback(null);
        setSelectedIndex(null);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-orange-200">
          <Trophy className="w-20 h-20 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-orange-900 mb-2">挑戰完成！</h2>
          <div className="text-6xl font-black text-orange-600 mb-4">{score}</div>
          <p className="text-gray-600 mb-8">你的分類概念很強！</p>
          <div className="flex gap-4">
            <button onClick={onBack} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">回主選單</button>
            <button onClick={handleRestart} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg">再玩一次</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !level) {
    return <div className="min-h-screen bg-orange-50 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-12 h-12" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-orange-50 overflow-hidden relative">
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-orange-800 shadow-sm hover:bg-orange-100"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-4">
          {difficulty === 'ADVANCED' && <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">進階</span>}
          <div className="text-orange-800 font-bold">第 {round} / {TOTAL_ROUNDS} 題</div>
          <div className="flex items-center bg-orange-100 px-3 py-1 rounded-full text-orange-800 font-bold"><Trophy size={16} className="mr-2"/> {score}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6 w-full max-w-6xl mx-auto overflow-hidden">
        <h2 className="text-2xl font-bold text-orange-900 flex items-center shrink-0"><HelpCircle className="mr-2"/> 哪一個不一樣？</h2>
        
        {/* Responsive Grid: 2x2 on Portrait, 1 Row on Landscape (sm breakpoint usually triggers on landscape phones) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full h-auto aspect-square sm:aspect-auto sm:h-64 items-stretch">
          {level.items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleItemClick(idx)}
              disabled={!!feedback}
              className={`
                rounded-2xl shadow-lg border-4 flex flex-col items-center justify-center p-2 sm:p-4 transition-all active:scale-95
                ${feedback === 'correct' && idx === level.correctIndex ? 'bg-green-100 border-green-500' : ''}
                ${feedback === 'wrong' && idx === selectedIndex ? 'bg-red-100 border-red-300' : 'bg-white border-orange-100 hover:bg-orange-50'}
                ${feedback && idx !== level.correctIndex && idx !== selectedIndex ? 'opacity-50' : ''}
              `}
            >
              <span className="text-5xl sm:text-6xl mb-2">{item.icon}</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-700">{item.text}</span>
            </button>
          ))}
        </div>

        {/* Feedback Overlay - Always show if feedback exists */}
        {feedback && (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-3xl shadow-2xl border-4 z-50 animate-bounce-short flex flex-col items-center gap-2 ${feedback === 'correct' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
                <div className="flex items-center gap-2">
                    {feedback === 'correct' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                    <span className="text-2xl font-bold">{feedback === 'correct' ? "答對了！" : "再想想看"}</span>
                </div>
                {/* Show reason inside overlay if available and correct */}
                {feedback === 'correct' && showReason && level.reason && (
                    <div className="text-sm sm:text-base font-medium mt-1 bg-white/50 px-3 py-1 rounded-full whitespace-nowrap">
                        💡 {level.reason}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default OddOneGame;
