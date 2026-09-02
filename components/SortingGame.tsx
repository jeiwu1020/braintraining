
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ThumbsUp, AlertCircle, Trophy, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { SortingLevel, Difficulty } from '../types';
import { generateSortingLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import CognitiveChoiceScreen from './game-ui/CognitiveChoiceScreen';
import GameShell from './game-ui/GameShell';

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
      <GameShell title="分類大師" subtitle="本回合完成" onBack={onBack} className="bg-orange-50">
      <div className="flex h-full flex-col overflow-hidden">
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
      </GameShell>
    );
  }

  if (loading || !level) {
    return (
      <GameShell title="分類大師" subtitle="判斷物品所屬類別" onBack={onBack} className="bg-orange-50">
        <div role="status" className="flex h-full flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-orange-700 text-lg">AI 正在準備題目中...</p>
        </div>
      </GameShell>
    );
  }

  const currentItem = level.items[0];
  const correctCategoryName = currentItem.category === 'A' ? level.categoryA : level.categoryB;

  return (
    <CognitiveChoiceScreen
      title="分類大師"
      subtitle="判斷物品所屬類別"
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className="bg-orange-50"
      statusClassName="bg-orange-100 text-orange-800"
      advancedClassName="bg-orange-600"
      questionLabel="分類題目區"
      choicesLabel="分類作答區"
      questionClassName={`relative flex flex-col items-center justify-center rounded-3xl border-4 bg-white p-4 text-center shadow-xl ${feedback === 'correct' ? 'border-green-400 bg-green-50' : feedback === 'wrong' ? 'border-red-400 bg-red-50' : 'border-white'}`}
      choicesClassName="flex flex-col justify-center gap-3 pr-1"
      question={(
        <>
          <div className="absolute right-4 top-4">
            {feedback === 'correct' && <ThumbsUp className="h-10 w-10 text-green-500" />}
            {feedback === 'wrong' && <AlertCircle className="h-10 w-10 text-red-500" />}
          </div>
          <h2 className="mb-3 text-5xl font-bold leading-tight tracking-wider text-gray-800 sm:text-7xl">{currentItem.name}</h2>
          <p className="rounded-full bg-gray-100 px-4 py-1 text-lg text-gray-500">屬於哪一類？</p>
        </>
      )}
      choices={(
        <>
          {(['A', 'B'] as const).map(category => {
            const isCorrectCategory = currentItem.category === category;
            return (
              <button
                key={category}
                disabled={showResult}
                onClick={() => handleSort(category)}
                className={`relative flex min-h-20 items-center justify-center rounded-2xl border-4 py-2 text-2xl font-bold shadow-md transition-all active:scale-95 sm:text-3xl ${!showResult ? (category === 'A' ? 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100' : 'border-green-200 bg-green-50 text-green-900 hover:bg-green-100') : isCorrectCategory ? 'border-green-600 bg-green-500 text-white ring-4 ring-green-200' : 'border-gray-200 bg-gray-100 text-gray-400 opacity-50'}`}
              >
                {category === 'A' ? level.categoryA : level.categoryB}
                {showResult && isCorrectCategory && <CheckCircle className="absolute right-4 h-6 w-6" />}
              </button>
            );
          })}
          {showResult && (
            <button onClick={handleNext} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg transition-transform hover:bg-orange-600 active:scale-95">
              {round < TOTAL_ROUNDS ? '下一題' : '查看成績'} <ArrowRight size={24} />
            </button>
          )}
        </>
      )}
      feedback={showResult ? (
        <span className={feedback === 'correct' ? 'text-green-700' : 'text-red-700'}>
          {feedback === 'correct' ? '答對了！' : `答錯囉！正確分類是 ${correctCategoryName}`}
        </span>
      ) : undefined}
    />
  );
};

export default SortingGame;
