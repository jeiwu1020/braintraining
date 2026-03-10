
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, ArrowRight, RotateCcw, Check, Eye } from 'lucide-react';
import { StepsLevel, StepItem, Difficulty } from '../types';
import { generateStepsLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const StepsGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<StepsLevel | null>(null);
  const [availableSteps, setAvailableSteps] = useState<StepItem[]>([]);
  const [userOrder, setUserOrder] = useState<StepItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // Track used titles to prevent repetition in a session
  const [usedTitles, setUsedTitles] = useState<string[]>([]);
  
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setIsCorrect(false);
    setShowError(false);
    setUserOrder([]);
    
    // Pass current history and difficulty
    const data = await generateStepsLevel(usedTitles, difficulty as Difficulty);
    setLevel(data);
    setAvailableSteps(data.steps); 
    
    // Add new title to history
    setUsedTitles(prev => [...prev, data.title]);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const calculateScore = () => {
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let bonus = 0;
      if (timeTaken < 10) bonus = 10;
      else if (timeTaken < 20) bonus = 5;
      return 20 + bonus;
  }

  const handleSelectStep = (step: StepItem) => {
    if (isCorrect) return;
    setUserOrder([...userOrder, step]);
    setAvailableSteps(availableSteps.filter(s => s.id !== step.id));
    setShowError(false);
  };

  const handleDeselectStep = (step: StepItem) => {
    if (isCorrect) return;
    setAvailableSteps([...availableSteps, step]);
    setUserOrder(userOrder.filter(s => s.id !== step.id));
    setShowError(false);
  };

  const handleReset = () => {
     if (!level || isCorrect) return;
     setAvailableSteps([...availableSteps, ...userOrder]);
     setUserOrder([]);
  };

  const handleNextLevel = () => {
    if (round < TOTAL_ROUNDS) {
        setRound(r => r + 1);
        startRound();
    } else {
        setIsFinished(true);
        soundService.playWin();
    }
  };

  const checkAnswer = () => {
    if (!level) return;
    
    // If already correct, button acts as Next
    if (isCorrect) {
        handleNextLevel();
        return;
    }

    let correct = true;
    for (let i = 0; i < userOrder.length; i++) {
        if (userOrder[i].order !== i + 1) {
            correct = false;
            break;
        }
    }

    if (correct && userOrder.length === level.steps.length) {
        setIsCorrect(true);
        const roundScore = calculateScore();
        setScore(s => s + roundScore);
        soundService.playCorrect();
    } else {
        setShowError(true);
        soundService.playWrong();
        setTimeout(() => setShowError(false), 2000);
    }
  };
  
  const handleShowAnswer = () => {
      if (!level || isCorrect) return;

      const allSteps = [...userOrder, ...availableSteps];
      allSteps.sort((a, b) => a.order - b.order);

      setUserOrder(allSteps);
      setAvailableSteps([]);
      setIsCorrect(true);
      
      // Do NOT add score
      soundService.playCorrect();
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setIsFinished(false);
    setUsedTitles([]); // Reset history on restart
    startRound();
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50 p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-purple-200">
              <Check className="w-20 h-20 text-purple-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-purple-900 mb-2">步驟大師！</h2>
              <div className="text-6xl font-black text-purple-600 mb-4">{score}</div>
              <p className="text-gray-600 mb-8">
                  你的邏輯非常清晰！<br/>做事井然有序。
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
                      className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 shadow-lg"
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-purple-800">準備步驟中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-purple-50 overflow-hidden relative">
      {/* Header - Extremely Compact */}
      <div className="flex-none px-3 py-1 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10 h-12">
        <button onClick={onBack} className="p-1.5 bg-white rounded-full text-purple-800 shadow-sm hover:bg-purple-100">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
             {difficulty === 'ADVANCED' && <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">進階</span>}
             <div className="px-2 py-0.5 bg-purple-100 rounded-full text-purple-800 font-bold text-xs sm:text-sm">
                題 {round}/{TOTAL_ROUNDS}
             </div>
             <div className="flex items-center bg-purple-100 px-2 py-0.5 rounded-full text-purple-800 font-bold text-sm">
                <Trophy size={14} className="mr-1"/> {score}
             </div>
        </div>
        <button onClick={startRound} className="px-3 py-1 bg-white rounded-full text-purple-600 text-xs sm:text-sm font-medium hover:bg-purple-100 shadow-sm">
            跳過
        </button>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row p-2 max-w-6xl mx-auto w-full gap-2 relative overflow-hidden min-h-0">
        
        {/* Game Area: Split View in Landscape, Vertical Stack in Portrait */}
        
        {/* Left/Top: Answer Drop Zone + Controls */}
        <div className="flex-[1.2] flex flex-col min-h-0 bg-white/60 rounded-xl border-2 border-purple-200 shadow-inner overflow-hidden relative">
            
            {/* Embedded Title Header */}
            <div className="flex-none bg-purple-100/50 p-2 text-center border-b border-purple-200">
                <h2 className="text-base sm:text-lg font-bold text-purple-900 truncate leading-tight">
                    題目：<span className="text-purple-700">{level.title}</span>
                </h2>
                <div className="text-purple-400 text-xs">請依序點擊右方選項</div>
            </div>
            
            {/* Answer Content - Flex Wrap (Auto-width) */}
            <div className="flex-1 overflow-y-auto p-2">
                 <div className="flex flex-wrap gap-2 content-start items-center">
                    {userOrder.length === 0 && (
                        <div className="w-full h-20 flex items-center justify-center text-purple-300 font-bold text-sm">
                            答案區 (空白)
                        </div>
                    )}
                    
                    {userOrder.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <button 
                                onClick={() => handleDeselectStep(step)}
                                className="group w-auto bg-white border border-purple-300 text-purple-900 px-3 py-1.5 rounded-full font-bold shadow-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center gap-2 animate-fade-in text-sm sm:text-base whitespace-nowrap"
                            >
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs group-hover:bg-red-100 group-hover:text-red-600">
                                    {idx + 1}
                                </div>
                                {step.text}
                            </button>
                            {/* Visual connector */}
                            {idx < userOrder.length - 1 && (
                                <ArrowRight className="text-purple-200 w-4 h-4" />
                            )}
                        </React.Fragment>
                    ))}
                 </div>
            </div>

            {/* Controls - Docked inside the Left/Top Pane at bottom */}
            <div className="flex-none p-2 bg-white/50 border-t border-purple-100 flex gap-2">
                <button 
                    onClick={handleShowAnswer}
                    disabled={isCorrect}
                    className="p-2 sm:px-4 bg-yellow-100 text-yellow-700 rounded-lg shadow-sm disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-1"
                >
                    <Eye size={18} />
                    <span className="text-sm font-bold hidden sm:inline">答案</span>
                </button>
                <button 
                    onClick={handleReset}
                    disabled={userOrder.length === 0 || isCorrect}
                    className="p-2 sm:px-4 bg-gray-200 text-gray-700 rounded-lg shadow-sm disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-1"
                >
                    <RotateCcw size={18} />
                    <span className="text-sm font-bold hidden sm:inline">重置</span>
                </button>
                <button 
                    onClick={checkAnswer}
                    disabled={availableSteps.length > 0 && !isCorrect}
                    className={`
                        flex-1 text-white text-base font-bold rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 py-2
                        ${isCorrect ? 'bg-green-600' : 'bg-purple-600'}
                    `}
                >
                    {isCorrect ? "下一題" : "確認"}
                    {isCorrect ? <ArrowRight size={18} /> : <Check size={18} />}
                </button>
            </div>
        </div>

        {/* Right/Bottom: Source Options - Compact Flex Wrap */}
        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-purple-100 flex flex-col overflow-hidden">
                <div className="flex-none bg-gray-50 p-1.5 text-center text-gray-400 text-xs border-b border-gray-100">
                    選項區
                </div>
                
                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-2">
                    {/* Flex Wrap for auto width */}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start content-start">
                    {availableSteps.map(step => (
                        <button 
                            key={step.id}
                            onClick={() => handleSelectStep(step)}
                            className="w-auto bg-purple-50 text-purple-900 border border-purple-200 px-3 py-2 rounded-lg font-bold shadow-sm hover:bg-purple-100 hover:border-purple-300 active:scale-95 transition-all text-sm sm:text-base whitespace-nowrap"
                        >
                            {step.text}
                        </button>
                    ))}
                    </div>
                </div>
        </div>

        {showError && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 border-2 border-red-400 text-red-700 px-6 py-3 rounded-2xl font-bold shadow-2xl animate-bounce-short text-lg whitespace-nowrap z-50 pointer-events-none">
                 順序不對喔！
             </div>
        )}

      </div>
    </div>
  );
};

export default StepsGame;
