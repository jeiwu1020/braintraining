
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Sun, CheckCircle } from 'lucide-react';
import { ShadowLevel, Difficulty } from '../types';
import { generateShadowLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import CognitiveChoiceScreen from './game-ui/CognitiveChoiceScreen';
import GameShell from './game-ui/GameShell';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const ShadowGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }: Props) => {
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
      <GameShell title="影子猜猜看" subtitle="從輪廓找出正確物件" onBack={onBack} className="bg-slate-100">
       <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4 animate-fade-in">
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
      </GameShell>
    );
  }

  if (loading || !level) {
    return (
      <GameShell title="影子猜猜看" subtitle="從輪廓找出正確物件" onBack={onBack} className="bg-slate-50">
        <div role="status" className="flex h-full flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-slate-600 animate-spin mb-4" />
          <p className="text-slate-800">準備影子中...</p>
        </div>
      </GameShell>
    );
  }

  // Layout Logic for Responsive Grid
  // Normal (4 opts): 2x2
  // Advanced (6 opts): 
  //   - Portrait: 2 cols x 3 rows
  //   - Landscape: 3 cols x 2 rows (Better for fitting on short screens)
  const isAdvanced = level.options.length > 4;
  const gridColsClass = isAdvanced ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';
  
  return (
    <CognitiveChoiceScreen
      title="影子猜猜看"
      subtitle="從輪廓找出正確物件"
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className="bg-slate-100"
      statusClassName="bg-slate-200 text-slate-800"
      advancedClassName="bg-slate-700"
      questionLabel="影子題目區"
      choicesLabel="影子作答區"
      questionClassName="flex items-center justify-center rounded-3xl border-2 border-slate-200 bg-white p-3 shadow-lg sm:p-5"
      choicesClassName="flex items-center justify-center pr-1"
      question={(
        <div className="flex flex-col items-center justify-center">
             <div className="text-7xl sm:text-8xl md:text-9xl filter drop-shadow-lg mb-2 animate-bounce-short">
                 {level.target}
             </div>
             <p className="text-slate-500 font-bold text-base md:text-lg text-center">它的影子是哪一個？</p>
        </div>
      )}
      choices={(
            <div className={`grid ${gridColsClass} w-full gap-3 sm:gap-4`}>
                {level.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        className={`
                            w-full min-h-[76px] sm:min-h-[96px] rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 p-2 border-2
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
      )}
      feedback={showErrorMsg ? '再看清楚一點喔！' : feedback === 'correct' ? '找到了！' : undefined}
    />
  );
};

export default ShadowGame;
