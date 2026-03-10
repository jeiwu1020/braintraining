
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, RotateCcw, Check, XCircle, Trophy, Send, Eye, ArrowRight } from 'lucide-react';
import { SentenceLevel, Difficulty } from '../types';
import { generateSentenceLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const SentenceGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<SentenceLevel | null>(null);
  const [userAnswer, setUserAnswer] = useState<{id: string, text: string}[]>([]);
  const [availableWords, setAvailableWords] = useState<{id: string, text: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showError, setShowError] = useState(false);

  // Session & Scoring
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Used Indices Tracking
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = async () => {
    setLoading(true);
    setIsCorrect(false);
    setShowError(false);
    setUserAnswer([]);
    
    // Pass usedIndices
    const { level: data, index } = await generateSentenceLevel(usedIndices, difficulty as Difficulty);
    
    // Track usage
    setUsedIndices(prev => [...prev, index]);

    setLevel(data);
    setAvailableWords(data.scrambled);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const calculateScore = () => {
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    // Base 20 pts. Speed bonus: if < 5s, +10. if < 10s, +5.
    let bonus = 0;
    if (timeTaken < 5) bonus = 10;
    else if (timeTaken < 10) bonus = 5;
    return 20 + bonus;
  };

  const handleSelectWord = (word: {id: string, text: string}) => {
    if (isCorrect) return;
    setShowError(false);
    setUserAnswer([...userAnswer, word]);
    setAvailableWords(availableWords.filter(w => w.id !== word.id));
  };

  const handleDeselectWord = (word: {id: string, text: string}) => {
    if (isCorrect) return;
    setShowError(false);
    setAvailableWords([...availableWords, word]);
    setUserAnswer(userAnswer.filter(w => w.id !== word.id));
  };

  const handleNextLevel = () => {
    if (round < TOTAL_ROUNDS) {
        setRound(r => r + 1);
        startNewRound();
     } else {
        setIsSessionFinished(true);
        soundService.playWin(); // Win sound for session completion
     }
  };

  const checkAnswer = () => {
    if (!level) return;

    // If already correct, the button acts as "Next Level"
    if (isCorrect) {
        handleNextLevel();
        return;
    }

    const currentString = userAnswer.map(w => w.text).join('');
    if (currentString === level.original) {
        // Correct
        const roundScore = calculateScore();
        setTotalScore(s => s + roundScore);
        setIsCorrect(true);
        soundService.playCorrect();
    } else {
        // Wrong (No penalty)
        setShowError(true);
        soundService.playWrong();
        setTimeout(() => setShowError(false), 2000);
    }
  };

  const handleShowAnswer = () => {
    if (!level || isCorrect) return;

    // Combine all words
    const allWords = [...userAnswer, ...availableWords];
    // Sort based on ID (which is index-char, e.g., "0-早")
    allWords.sort((a, b) => {
        const indexA = parseInt(a.id.split('-')[0]);
        const indexB = parseInt(b.id.split('-')[0]);
        return indexA - indexB;
    });

    setUserAnswer(allWords);
    setAvailableWords([]);
    setIsCorrect(true);
    // Do NOT add score
    soundService.playCorrect(); // Still play correct sound
  };

  const resetCurrent = () => {
    if (!level) return;
    setIsCorrect(false);
    setShowError(false);
    setUserAnswer([]);
    setAvailableWords(level.scrambled);
  }

  const handleRestart = () => {
      setRound(1);
      setTotalScore(0);
      setUsedIndices([]); // Reset history
      setIsSessionFinished(false);
      startNewRound();
  };

  if (isSessionFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-pink-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-pink-200 my-4">
              <Trophy className="w-20 h-20 text-pink-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-pink-900 mb-2">練習完成！</h2>
              <div className="text-6xl font-black text-pink-600 mb-4">{totalScore}</div>
              <p className="text-gray-600 mb-8">
                  你的造句能力很棒！<br/>邏輯非常清晰。
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
                      className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 shadow-lg"
                  >
                      再玩一次
                  </button>
              </div>
          </div>
      </div>
    );
}

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-pink-50">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-pink-700">準備句子中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-pink-50 overflow-hidden">
      {/* Header - Compact */}
      <div className="flex-none px-4 py-1 sm:py-2 flex justify-between items-center bg-white/50 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-pink-800 shadow-sm hover:bg-pink-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
            {difficulty === 'ADVANCED' && <span className="bg-pink-600 text-white px-2 py-1 rounded text-xs">進階</span>}
             <div className="px-3 py-1 bg-pink-100 rounded-full text-pink-800 font-bold text-sm">
                第 {round} / {TOTAL_ROUNDS} 題
             </div>
             <div className="flex items-center bg-pink-100 px-3 py-1 rounded-full text-pink-800 font-bold">
                <Trophy size={16} className="mr-2"/> {totalScore}
             </div>
        </div>
        <button onClick={startNewRound} className="px-3 py-1 bg-white rounded-full text-pink-600 text-sm font-medium hover:bg-pink-100 shadow-sm">
            跳過
        </button>
      </div>

      {/* Main Layout: Flex Column */}
      <div className="flex-1 flex flex-col items-center p-1 sm:p-2 max-w-4xl mx-auto w-full gap-1 sm:gap-2 relative overflow-hidden">
        
        {/* Error Toast */}
        {showError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-bounce-short z-50 bg-red-100 border-2 border-red-400 text-red-700 px-6 py-3 rounded-full flex items-center shadow-lg whitespace-nowrap">
                <XCircle className="w-6 h-6 mr-2" />
                <span className="font-bold">順序不對喔，再試試看！</span>
            </div>
        )}

        {/* TOP: Answer Area - Reduced Height */}
        <div className="w-full flex-none flex flex-col items-center justify-center bg-white/40 rounded-xl p-1 sm:p-2">
             {/* Hide label on mobile to save vertical space */}
             <p className="text-gray-500 mb-1 text-sm self-start pl-2 hidden sm:block">請組成通順的句子：</p>
             <div className={`
                w-full min-h-[3rem] sm:min-h-[4rem]
                bg-white rounded-xl shadow-inner p-1 sm:p-2 
                flex flex-nowrap items-center gap-2 overflow-x-auto
                border-4 transition-colors duration-300 
                ${isCorrect ? 'border-green-400 bg-green-50' : showError ? 'border-red-300 bg-red-50' : 'border-pink-200'}
             `}>
                {userAnswer.length === 0 && !isCorrect && (
                   <span className="text-gray-300 text-base sm:text-lg w-full text-center">答案區</span>
                )}
                {userAnswer.map(word => (
                    <button 
                        key={word.id} 
                        onClick={() => handleDeselectWord(word)}
                        className="flex-shrink-0 bg-pink-500 text-white text-lg sm:text-2xl font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md hover:bg-pink-600 transition-all animate-fade-in"
                    >
                        {word.text}
                    </button>
                ))}
                {isCorrect && <Check className="text-green-500 w-8 h-8 sm:w-10 sm:h-10 ml-2 animate-bounce flex-shrink-0"/>}
             </div>
        </div>

        {/* BOTTOM: Source Words & Controls - Use full remaining height */}
        <div className="flex-1 w-full relative min-h-0 bg-white/30 rounded-2xl border border-pink-100 overflow-hidden">
            
            {/* Scrollable Word List - Absolute fill with padding at bottom for floating buttons */}
            <div className="absolute inset-0 overflow-y-auto content-start p-2 pb-20">
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {availableWords.map(word => (
                        <button 
                            key={word.id} 
                            onClick={() => handleSelectWord(word)}
                            className="bg-white text-pink-700 text-lg sm:text-2xl font-bold px-4 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl shadow border-2 border-pink-100 hover:border-pink-300 active:scale-95 transition-all"
                        >
                            {word.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls - Floating Buttons */}
            
            {/* Left Group: Show Answer & Reset */}
            <div className="absolute bottom-3 left-3 flex gap-2 z-20">
                 <button 
                    onClick={handleShowAnswer}
                    disabled={isCorrect}
                    className="flex items-center justify-center p-3 sm:px-4 sm:py-2 bg-yellow-100/90 backdrop-blur-sm text-yellow-700 rounded-full shadow-lg border border-yellow-200 hover:bg-yellow-200 transition disabled:opacity-50 active:scale-95"
                    title="看答案 (不計分)"
                >
                    <Eye size={20} />
                    <span className="ml-1 text-sm font-bold hidden sm:inline">看答案</span>
                </button>
                
                <button 
                    onClick={resetCurrent}
                    disabled={isCorrect}
                    className="flex items-center justify-center p-3 sm:px-4 sm:py-2 bg-gray-100/90 backdrop-blur-sm text-gray-600 rounded-full shadow-lg border border-gray-200 hover:bg-gray-200 transition disabled:opacity-50 active:scale-95"
                >
                    <RotateCcw size={20} />
                    <span className="ml-1 text-sm font-bold hidden sm:inline">重置</span>
                </button>
            </div>
            
            {/* Confirm: Bottom Right */}
            <button 
                onClick={checkAnswer}
                disabled={userAnswer.length === 0 && !isCorrect}
                className={`
                    absolute bottom-3 right-3 flex items-center justify-center py-3 px-5 
                    backdrop-blur-sm text-white rounded-full font-bold shadow-xl 
                    transition z-20 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-pink-500/95 hover:bg-pink-600'}
                `}
            >
                <span className="mr-1 text-sm sm:text-base">{isCorrect ? "下一題" : "確認"}</span>
                {isCorrect ? <ArrowRight size={18} /> : <Send size={18} />}
            </button>

        </div>

      </div>
    </div>
  );
};

export default SentenceGame;
