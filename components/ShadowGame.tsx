
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, Sun, CheckCircle } from 'lucide-react';
import { ShadowLevel, Difficulty } from '../types';
import { generateShadowLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const ShadowGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<ShadowLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Use string array to track IDs (works for both index strings and emoji strings)
  const [usedIds, setUsedIds] = useState<string[]>([]);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setFeedback(null);
    setWrongIndex(null);
    setShowErrorMsg(false);
    
    // Pass usedIds
    const { level: data, id } = await generateShadowLevel(usedIds, difficulty as Difficulty);
    
    setLevel(data);
    setUsedIds(prev => [...prev, id]);

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

  const handleOptionClick = (idx: number) => {
    if (!level || feedback === 'correct') return;

    if (idx === level.correctIndex) {
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
      setWrongIndex(idx);
      setShowErrorMsg(true);
      soundService.playWrong();
      setTimeout(() => {
        setFeedback(null);
        setWrongIndex(null);
        setShowErrorMsg(false);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setUsedIds([]); // Reset history
    setIsFinished(false);
    startRound();
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-slate-300">
              <Sun className="w-20 h-20 text-slate-800 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-2">觀察入微！</h2>
              <div className="text-6xl font-black text-slate-700 mb-4">{score}</div>
              <p className="text-gray-600 mb-8">
                  你的視覺辨識能力很強！<br/>完全難不倒你。
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
                      className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 shadow-lg"
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-12 h-12 text-slate-600 animate-spin mb-4" />
        <p className="text-slate-800">準備影子中...</p>
      </div>
    );
  }

  // Layout Logic for Responsive Grid
  // Normal (4 opts): 2x2
  // Advanced (6 opts): 
  //   - Portrait: 2 cols x 3 rows
  //   - Landscape: 3 cols x 2 rows (Better for fitting on short screens)
  const isAdvanced = level.options.length > 4;
  const gridColsClass = isAdvanced ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';
  
  // Option container width strategy
  // Advanced needs more width in landscape to fit 3 cols comfortably
  const optionsContainerClass = isAdvanced 
    ? 'w-full sm:w-[50vw] max-w-2xl' 
    : 'w-full sm:w-auto max-w-md';

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden relative">
      {/* Header */}
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-slate-800 shadow-sm hover:bg-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
            {difficulty === 'ADVANCED' && <span className="bg-slate-600 text-white px-2 py-1 rounded text-xs">進階</span>}
             <div className="px-3 py-1 bg-slate-200 rounded-full text-slate-800 font-bold text-sm">
                第 {round} / {TOTAL_ROUNDS} 題
             </div>
             <div className="flex items-center bg-slate-200 px-3 py-1 rounded-full text-slate-800 font-bold">
                <Trophy size={16} className="mr-2"/> {score}
             </div>
        </div>
      </div>

      {/* Main Content: Flex-col on portrait, Flex-row on landscape/large screens */}
      {/* Added max-h constraint and overflow handling for landscape mobile */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center p-2 sm:p-4 gap-4 md:gap-8 overflow-y-auto w-full max-w-5xl mx-auto">
        
        {/* Target Area (Left on Landscape) */}
        <div className="flex-none sm:flex-1 bg-white p-4 md:p-8 rounded-[2rem] shadow-xl border-4 border-white ring-4 ring-slate-200 flex flex-col items-center justify-center w-full sm:w-auto h-auto min-h-[160px] sm:h-full max-h-[35vh] sm:max-h-[60vh]">
             <div className="text-7xl sm:text-8xl md:text-9xl filter drop-shadow-lg mb-2 animate-bounce-short">
                 {level.target}
             </div>
             <p className="text-slate-500 font-bold text-base md:text-lg text-center">它的影子是哪一個？</p>
        </div>

        {/* Options Area (Right on Landscape) */}
        <div className={`flex-none sm:flex-[1.5] ${optionsContainerClass} min-h-0`}>
            <div className={`grid ${gridColsClass} gap-3 sm:gap-4 w-full h-full`}>
                {level.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        className={`
                            w-full h-full min-h-[80px] sm:min-h-[100px] rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 p-2 border-2
                            ${feedback === 'correct' && idx === level.correctIndex ? 'bg-green-100 border-green-500 scale-105 z-10' : ''}
                            ${feedback === 'wrong' && idx === wrongIndex ? 'bg-red-100 border-red-400 shake' : 'border-transparent'}
                            ${!feedback || (feedback === 'wrong' && idx !== wrongIndex) ? 'bg-white shadow-md hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1' : ''}
                        `}
                        disabled={feedback === 'correct'}
                    >
                        {/* Number label */}
                        <div className="absolute top-1 left-2 sm:top-2 sm:left-3 text-slate-400 font-bold text-base sm:text-lg">
                            {idx + 1}
                        </div>

                        {/* Render the emoji as a black silhouette */}
                        <span 
                            className="transition-all duration-500 text-5xl sm:text-6xl md:text-7xl mb-1"
                            style={{ 
                                filter: feedback === 'correct' && idx === level.correctIndex ? 'none' : 'brightness(0)',
                                opacity: feedback === 'correct' && idx === level.correctIndex ? 1 : 0.7 
                            }}
                        >
                            {opt}
                        </span>
                        
                        {/* Overlay Success Icon */}
                        {feedback === 'correct' && idx === level.correctIndex && (
                            <div className="absolute -top-2 -right-2 bg-white rounded-full">
                                <CheckCircle className="text-green-500 w-8 h-8" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Error Feedback Text (Fixed Position) */}
        {showErrorMsg && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-600 px-8 py-4 rounded-2xl font-bold shadow-2xl animate-bounce-short text-xl whitespace-nowrap z-50 border-2 border-red-200 pointer-events-none">
                再看清楚一點喔！
            </div>
        )}

      </div>
    </div>
  );
};

export default ShadowGame;
