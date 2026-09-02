
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { FindLevel, Difficulty } from '../types';
import { generateFindLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import GridFocusScreen from './game-ui/GridFocusScreen';

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
        <GameShell title="眼明手快" subtitle="本回合完成" onBack={onBack} className="bg-yellow-50">
         <div className="flex h-full flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto">
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
        </GameShell>
      );
  }

  if (loading) {
    return (
      <GameShell title="眼明手快" subtitle="從矩陣中找出指定圖案" onBack={onBack} className="bg-yellow-50">
        <div role="status" className="flex h-full flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
          <p className="text-yellow-800">準備圖案中...</p>
        </div>
      </GameShell>
    );
  }

  if (!level) return null;

  return (
    <GridFocusScreen
      title="眼明手快"
      subtitle="從矩陣中找出指定圖案"
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={totalScore}
      onBack={onBack}
      className="bg-yellow-50"
      statusClassName="bg-yellow-100 text-yellow-800"
      advancedClassName="bg-yellow-600"
      playfieldLabel="視覺搜尋矩陣"
      supportLabel="指定目標圖案"
      playfieldClassName="flex items-center justify-center overflow-hidden"
      supportClassName="flex items-center justify-center overflow-hidden"
      support={(
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-100/80 p-4 shadow-sm">
                <span className="text-gray-700 font-medium text-sm sm:text-lg">請找出：</span>
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-yellow-400 bg-white shadow-inner">
                        <span className="text-3xl sm:text-5xl leading-none">{level.target}</span>
                </div>
            </div>
      )}
      playfield={(
            <div className="relative flex h-full max-h-[30rem] aspect-square items-center justify-center">
                <div className="flex flex-col w-full h-full">
                    {/* Column Labels (A-D) */}
                    <div className="mb-0 flex pl-6">
                        {['A', 'B', 'C', 'D'].map(label => (
                            <div key={label} className="flex-1 text-center text-sm font-bold leading-none text-yellow-700 sm:text-base">
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-1">
                        {/* Row Labels (1-4) */}
                        <div className="flex w-6 flex-col justify-around pr-0.5">
                            {[1, 2, 3, 4].map(label => (
                                <div key={label} className="flex flex-1 items-center justify-center text-sm font-bold leading-none text-yellow-700 sm:text-base">
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Buttons Grid - 4x4 */}
                        <div className="grid flex-1 grid-cols-4 gap-1 rounded-xl border-2 border-yellow-100 bg-white p-1 shadow-lg">
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
      )}
      feedback={errorMsg ? <span className="text-red-700">{errorMsg}</span> : showResult ? <span className="text-green-700">找到了！</span> : undefined}
    />
  );
};

export default FindGame;
