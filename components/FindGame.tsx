
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, AlertCircle } from 'lucide-react';
import { FindLevel, Difficulty } from '../types';
import { generateFindLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const FindGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<FindLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Game Session State
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  
  // Used Indices Tracking
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  // Timer State
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startNewRound(1); // Start with round 1
  }, []);

  const startNewRound = async (currentRound: number) => {
    setLoading(true);
    setShowResult(false);
    setErrorMsg(null);
    
    // Pass currentRound, exclude usedIndices
    const { level: data, index } = await generateFindLevel(currentRound, usedIndices, difficulty as Difficulty);
    
    setLevel(data);
    setUsedIndices(prev => [...prev, index]);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const calculateScore = () => {
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const speedBonus = Math.max(0, 10 - Math.floor(timeTaken));
    return 10 + speedBonus;
  };

  const handleItemClick = (index: number) => {
    if (!level || showResult) return;

    if (index === level.targetPosition) {
        // Correct
        const roundScore = calculateScore();
        setTotalScore(s => s + roundScore);
        setShowResult(true);
        setErrorMsg(null);
        soundService.playCorrect();

        setTimeout(() => {
            if (round < TOTAL_ROUNDS) {
                const nextRound = round + 1;
                setRound(nextRound);
                startNewRound(nextRound);
            } else {
                setIsSessionFinished(true);
                soundService.playWin();
            }
        }, 1500);
    } else {
        // Wrong
        soundService.playWrong();
        setErrorMsg("再仔細看看喔！");
        setTimeout(() => setErrorMsg(null), 2000);
    }
  };

  const handleRestart = () => {
    setRound(1);
    setTotalScore(0);
    setUsedIndices([]); // Reset history
    setIsSessionFinished(false);
    startNewRound(1);
  };

  if (isSessionFinished) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-yellow-200 my-4">
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-yellow-900 mb-2">挑戰完成！</h2>
                <div className="text-6xl font-black text-yellow-600 mb-4">{totalScore}</div>
                <p className="text-gray-600 mb-8">
                    你的反應非常敏捷！<br/>繼續保持這樣的好眼力。
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
                        className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 shadow-lg"
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-yellow-800">準備圖案中...</p>
      </div>
    );
  }

  if (!level) return null;

  return (
    <div className="flex flex-col h-screen bg-yellow-50 overflow-hidden relative">
        {/* Header - Very compact */}
        <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-20">
            <button onClick={onBack} className="p-2 bg-white rounded-full text-yellow-800 shadow-sm hover:bg-yellow-100">
                <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-4">
                {difficulty === 'ADVANCED' && <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">進階</span>}
                 <div className="px-3 py-1 bg-yellow-100 rounded-full text-yellow-800 font-bold text-sm">
                    第 {round} / {TOTAL_ROUNDS} 題
                </div>
                <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 font-bold">
                    <Trophy size={16} className="mr-2"/> {totalScore}
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center p-2 gap-2 sm:gap-6 w-full h-full">
            
            {/* Target Instruction - Left (Landscape) or Top (Portrait) */}
            <div className="shrink-0 z-10 bg-yellow-100/80 p-2 sm:p-4 rounded-xl flex flex-row sm:flex-col items-center justify-center shadow-sm gap-3 sm:gap-4 border border-yellow-200">
                <span className="text-gray-700 font-medium text-sm sm:text-lg">請找出：</span>
                <div className="bg-white border-2 sm:border-4 border-yellow-400 rounded-lg sm:rounded-2xl w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center shadow-inner">
                        <span className="text-3xl sm:text-5xl leading-none">{level.target}</span>
                </div>
            </div>

            {/* Error Message Toast */}
            {errorMsg && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-short pointer-events-none">
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-xl flex items-center whitespace-nowrap">
                        <AlertCircle className="w-6 h-6 mr-2" />
                        <span className="font-bold text-lg">{errorMsg}</span>
                    </div>
                </div>
            )}

            {/* Grid Container Wrapper
                Logic: 
                - Portrait: Width constrained (90vw), Height adapts.
                - Landscape: Height constrained (75vh), Width adapts to maintain aspect ratio.
                This effectively "scales" the content to fit the screen without scrolling.
            */}
            <div className="
                relative flex justify-center items-center shrink-0
                w-[90vw] h-[90vw] max-w-[500px] max-h-[500px] 
                sm:w-auto sm:h-[75vh] sm:aspect-square
            ">
                <div className="flex flex-col w-full h-full">
                    {/* Column Labels (A-D) */}
                    <div className="flex pl-8 mb-1">
                        {['A', 'B', 'C', 'D'].map(label => (
                            <div key={label} className="flex-1 text-center font-bold text-yellow-700 text-lg md:text-xl">
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-1">
                        {/* Row Labels (1-4) */}
                        <div className="flex flex-col w-8 justify-around pr-1">
                            {[1, 2, 3, 4].map(label => (
                                <div key={label} className="flex-1 flex items-center justify-center font-bold text-yellow-700 text-lg md:text-xl">
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Buttons Grid - 4x4 */}
                        <div className="flex-1 grid grid-cols-4 gap-1.5 sm:gap-2 bg-white rounded-xl shadow-lg p-2 border-2 sm:border-4 border-yellow-100">
                            {Array.from({ length: level.gridSize }).map((_, index) => {
                                const isTarget = index === level.targetPosition;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleItemClick(index)}
                                        className={`
                                            w-full h-full flex items-center justify-center text-3xl md:text-4xl rounded-lg transition-all duration-200
                                            ${showResult && isTarget ? 'bg-green-200 border-2 border-green-500 scale-105 z-10' : 'bg-gray-50 hover:bg-yellow-50 active:bg-yellow-100'}
                                            ${showResult && !isTarget ? 'opacity-30' : ''}
                                        `}
                                    >
                                        <span className="pointer-events-none select-none">
                                            {isTarget ? level.target : level.distractor}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default FindGame;
