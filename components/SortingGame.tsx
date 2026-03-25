
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, ThumbsUp, AlertCircle, Trophy, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { SortingLevel, Difficulty } from '../types';
import { generateSortingLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

interface RoundHistory {
  round: number;
  itemName: string;
  categoryAName: string;
  categoryBName: string;
  correctCategory: 'A' | 'B';
  isCorrect: boolean;
}

const TOTAL_ROUNDS = 10;

const SortingGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<SortingLevel | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showResult, setShowResult] = useState(false); // Review phase state
  
  // Session State
  const [round, setRound] = useState(1);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  
  // Used indices to prevent duplicates
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  
  const startTimeRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadLevel();
    return () => stopTimer();
  }, []);

  const startTimer = () => {
    stopTimer();
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const loadLevel = async () => {
    setLevel(null); 
    setLoading(true);
    setFeedback(null);
    setShowResult(false);
    
    // Generate unique level based on usedIndices
    const result = await generateSortingLevel(usedIndices, difficulty as Difficulty);
    
    // Mark this level index as used
    setUsedIndices(prev => [...prev, result.index]);
    
    const randomItem = result.level.items[Math.floor(Math.random() * result.level.items.length)];
    
    const singleItemLevel: SortingLevel = {
        ...result.level,
        items: [randomItem]
    };

    setLevel(singleItemLevel);
    setLoading(false);
    startTimer();
  };

  const calculateScore = () => {
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    let bonus = 0;
    if (timeTaken < 3) bonus = 10;
    else if (timeTaken < 6) bonus = 5;
    return 10 + bonus;
  };

  const handleSort = (selectedCategory: 'A' | 'B') => {
    if (!level || showResult) return;

    const currentItem = level.items[0];
    const isCorrect = currentItem.category === selectedCategory;

    stopTimer();

    if (isCorrect) {
      const roundScore = calculateScore();
      setScore(s => s + roundScore);
      setFeedback('correct');
      soundService.playCorrect();
    } else {
      setFeedback('wrong');
      soundService.playWrong();
    }

    // Record History
    setHistory(prev => [
      ...prev,
      {
        round: round,
        itemName: currentItem.name,
        categoryAName: level.categoryA,
        categoryBName: level.categoryB,
        correctCategory: currentItem.category,
        isCorrect: isCorrect
      }
    ]);

    setShowResult(true);
  };

  const handleNext = () => {
    if (round < TOTAL_ROUNDS) {
      setRound(r => r + 1);
      loadLevel();
    } else {
      setIsSessionFinished(true);
      soundService.playWin();
    }
  };

  const handleRestart = () => {
      setRound(1);
      setScore(0);
      setUsedIndices([]); // Reset tracking
      setHistory([]);
      setIsSessionFinished(false);
      
      setLoading(true);
      setFeedback(null);
      setShowResult(false);
      
      // Start over
      loadLevel();
  };

  if (isSessionFinished) {
    return (
      <div className="flex flex-col h-[100dvh] bg-orange-50 overflow-hidden">
        {/* Header */}
        <div className="flex-none p-4 flex justify-between items-center bg-white shadow-sm z-10">
            <h2 className="text-xl font-bold text-orange-800 flex items-center">
                <Trophy className="mr-2 text-orange-500" /> 挑戰完成
            </h2>
            <div className="text-2xl font-black text-orange-600">{score} 分</div>
        </div>

        {/* Scrollable Content - List all items */}
        <div className="flex-1 overflow-y-auto p-4 landscape:p-2">
            <div className="max-w-2xl mx-auto space-y-4 pb-24">
                <div className="bg-white p-6 rounded-2xl shadow-md text-center border-b-4 border-orange-200">
                    <p className="text-gray-600 mb-2">太棒了！你的分類能力非常好。</p>
                    <div className="text-sm text-gray-500">以下是你的完整答題紀錄：</div>
                </div>

                <div className="space-y-3">
                    {history.map((record, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 border-l-4 border-orange-300">
                            {/* Round Number */}
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                                {record.round}
                            </div>
                            
                            {/* Status Icon */}
                            <div className={`shrink-0 ${record.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                {record.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    {record.itemName}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    正確分類：
                                    <span className="font-medium text-orange-700 ml-1 px-2 py-0.5 bg-orange-50 rounded-md">
                                        {record.correctCategory === 'A' ? record.categoryAName : record.categoryBName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Bottom Actions - Fixed */}
        <div className="flex-none p-2 landscape:p-1.5 bg-white border-t border-orange-100 flex gap-4 z-20">
            <button 
                onClick={onBack}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
                回主選單
            </button>
            <button 
                onClick={handleRestart}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
                <RotateCcw size={20} /> 再玩一次
            </button>
        </div>
      </div>
    );
  }

  if (loading || !level) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-orange-50">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-orange-700 text-lg">AI 正在準備題目中...</p>
      </div>
    );
  }

  const currentItem = level.items[0];
  const correctCategoryName = currentItem.category === 'A' ? level.categoryA : level.categoryB;

  return (
    <div className="flex flex-col h-[100dvh] bg-orange-50 overflow-hidden relative">
      {/* Header */}
      <div className="flex-none p-2 sm:p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-orange-800 shadow-sm hover:bg-orange-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-4 items-center">
            {difficulty === 'ADVANCED' && <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">進階</span>}
          <div className="px-3 py-1 bg-orange-100 rounded-full text-orange-800 font-bold text-sm md:text-base">
             第 {round} / {TOTAL_ROUNDS} 題
          </div>
          <div className="flex items-center text-orange-800 font-bold bg-orange-100 px-3 py-1 rounded-full text-sm md:text-base">
            <Trophy size={16} className="mr-2" />
            {score}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-5xl mx-auto overflow-hidden">
        
          {/* Flex Container: Stacks vertically on mobile, Side-by-side on Landscape/Desktop */}
          {/* Constrain height to avoid overflow issues on landscape mobile */}
          <div className="flex flex-col sm:flex-row w-full gap-4 sm:gap-8 items-stretch justify-center h-full max-h-[85vh]">
            
            {/* Left: Card Display Area */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                <div className="relative w-full max-w-sm aspect-[4/3] sm:aspect-square flex items-center justify-center">
                    <div className={`
                        w-full h-full bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center border-4 p-4 text-center
                        transition-all duration-300 relative overflow-hidden
                        ${feedback === 'correct' ? 'border-green-400 bg-green-50' : ''}
                        ${feedback === 'wrong' ? 'border-red-400 bg-red-50' : 'border-white'}
                    `}>
                        {/* Status Icon Overlay */}
                        <div className="absolute top-4 right-4 transition-opacity duration-300">
                             {feedback === 'correct' && <ThumbsUp className="text-green-500 w-10 h-10 animate-bounce" />}
                             {feedback === 'wrong' && <AlertCircle className="text-red-500 w-10 h-10 animate-shake" />}
                        </div>

                        <h3 className="text-5xl sm:text-7xl font-bold text-gray-800 mb-4 tracking-wider leading-tight">
                            {currentItem.name}
                        </h3>
                        
                        {/* Dynamic Text */}
                        <div className="h-16 flex items-center justify-center">
                            {!showResult ? (
                                <p className="text-gray-500 text-lg animate-pulse bg-gray-100 px-4 py-1 rounded-full">屬於哪一類？</p>
                            ) : (
                                <div className="animate-fade-in-up">
                                    <p className={`text-xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
                                        {feedback === 'correct' ? '答對了！' : '答錯囉！'}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        它是 <span className="font-bold text-orange-600 underline">{correctCategoryName}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Buttons / Controls - Fixed Layout Strategy */}
            {/* The right column takes available space but has a max width. Content is flex-col. */}
            <div className="flex-none sm:flex-1 flex flex-col gap-3 justify-center min-w-[200px] sm:max-w-xs h-full">
                
                {/* Options Wrapper: Grows to fill space minus the footer */}
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                    {/* Option A */}
                    <button
                        disabled={showResult}
                        onClick={() => handleSort('A')}
                        className={`
                            flex-1 min-h-[4rem] py-2 rounded-2xl shadow-md flex flex-col items-center justify-center transition-all border-4 relative
                            ${!showResult ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200 active:scale-95' : ''}
                            ${showResult && currentItem.category === 'A' ? 'bg-green-500 text-white border-green-600 ring-4 ring-green-200 z-10' : ''}
                            ${showResult && currentItem.category !== 'A' ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-50' : ''}
                        `}
                    >
                        <span className="text-2xl sm:text-3xl font-bold">{level.categoryA}</span>
                        {showResult && currentItem.category === 'A' && <CheckCircle className="absolute right-4 w-6 h-6 text-white"/>}
                    </button>

                    {/* Option B */}
                    <button
                        disabled={showResult}
                        onClick={() => handleSort('B')}
                        className={`
                            flex-1 min-h-[4rem] py-2 rounded-2xl shadow-md flex flex-col items-center justify-center transition-all border-4 relative
                            ${!showResult ? 'bg-green-50 hover:bg-green-100 text-green-900 border-green-200 active:scale-95' : ''}
                            ${showResult && currentItem.category === 'B' ? 'bg-green-500 text-white border-green-600 ring-4 ring-green-200 z-10' : ''}
                            ${showResult && currentItem.category !== 'B' ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-50' : ''}
                        `}
                    >
                        <span className="text-2xl sm:text-3xl font-bold">{level.categoryB}</span>
                        {showResult && currentItem.category === 'B' && <CheckCircle className="absolute right-4 w-6 h-6 text-white"/>}
                    </button>
                </div>

                {/* Footer Area: Reserved space for Next Button to prevent layout shift */}
                {/* Fixed height ensures the options above don't resize when this button appears */}
                <div className="flex-none h-16 sm:h-20 shrink-0">
                    {showResult ? (
                        <button 
                            onClick={handleNext}
                            className="w-full h-full bg-orange-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-orange-600 flex items-center justify-center gap-2 transition-transform active:scale-95 animate-fade-in"
                        >
                            {round < TOTAL_ROUNDS ? "下一題" : "查看成績"} 
                            <ArrowRight size={24} />
                        </button>
                    ) : (
                        // Invisible placeholder to maintain layout structure
                        <div className="w-full h-full invisible" aria-hidden="true" />
                    )}
                </div>

            </div>
          </div>
      </div>
    </div>
  );
};

export default SortingGame;
