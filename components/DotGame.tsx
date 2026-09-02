
import React, { useState, useEffect } from 'react';
import { Loader2, Trophy, Eye, Play, ArrowRight } from 'lucide-react';
import { DotLevel, Difficulty } from '../types';
import { generateDotLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import GridFocusScreen from './game-ui/GridFocusScreen';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const DotGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<DotLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Feedback text
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setGameState('memorize');
    setUserSelection([]);
    setFeedbackText("");
    
    const data = await generateDotLevel(round, difficulty as Difficulty);
    setLevel(data);
    setLoading(false);
    
    // Countdown for memorize phase
    setCountdown(data.duration / 1000);
  };

  // Timer for Memorize Phase
  useEffect(() => {
    if (gameState === 'memorize' && level) {
        const timer = setTimeout(() => {
            setGameState('recall');
        }, level.duration);

        // Visual countdown
        const interval = setInterval(() => {
            setCountdown(c => Math.max(0, c - 0.1));
        }, 100);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }
  }, [gameState, level]);

  const handleCellClick = (index: number) => {
    if (gameState !== 'recall') return;

    // Toggle selection
    let newSelection = [...userSelection];
    if (newSelection.includes(index)) {
        newSelection = newSelection.filter(i => i !== index);
    } else {
        // Limit selection to number of dots
        if (level && newSelection.length < level.activeIndices.length) {
            newSelection.push(index);
        }
    }
    setUserSelection(newSelection);
  };

  const checkAnswer = () => {
      if (!level) return;
      
      const correctSet = new Set(level.activeIndices);
      const userSet = new Set(userSelection);
      
      // Check if sets match
      let isCorrect = true;
      if (correctSet.size !== userSet.size) isCorrect = false;
      for (let elem of userSet) {
          if (!correctSet.has(elem)) isCorrect = false;
      }

      if (isCorrect) {
          setScore(s => s + 20); // 20 pts per round
          setFeedbackText("太棒了！位置完全正確！");
          soundService.playCorrect();
      } else {
          setFeedbackText("再接再厲！看下面的正確答案。");
          soundService.playWrong();
      }

      setGameState('result');
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

  const handleRestart = () => {
      setRound(1);
      setScore(0);
      setIsFinished(false);
      startRound();
  };

  // Tiered Evaluation
  const getEvaluation = (finalScore: number) => {
      if (finalScore >= 160) return { title: "記憶大師！", desc: "你的空間記憶力超群！" };
      if (finalScore >= 100) return { title: "表現不錯！", desc: "大部分的位置都記住了。" };
      return { title: "繼續加油！", desc: "多練習幾次，你會進步的。" };
  };

  if (isFinished) {
    const evalResult = getEvaluation(score);
    return (
      <GameShell title="方塊在哪裡" subtitle="本回合完成" onBack={onBack} className="bg-cyan-50">
       <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-cyan-200">
              <Trophy className="w-20 h-20 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-cyan-900 mb-2">{evalResult.title}</h2>
              <div className="text-6xl font-black text-cyan-600 mb-4">{score}</div>
              <p className="text-gray-600 mb-8">
                  {evalResult.desc}
              </p>
              <div className="flex gap-4">
                   <button onClick={onBack} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">
                      回主選單
                  </button>
                  <button onClick={handleRestart} className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 shadow-lg">
                      再玩一次
                  </button>
              </div>
          </div>
       </div>
      </GameShell>
    );
  }

  if (loading || !level) {
      return <GameShell title="方塊在哪裡" subtitle="記住亮起的方塊位置" onBack={onBack} className="bg-cyan-50"><div role="status" className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-cyan-500"/></div></GameShell>;
  }

  // Dynamic sizing logic
  // Use vmin to keep it square and fitting within the smaller dimension of the screen
  const gridContainerStyle = {
      gridTemplateColumns: `repeat(${level.gridSize}, 1fr)`,
  };

  // Adjust font size based on grid density to prevent layout break
  const fontSizeClass = level.gridSize > 3 ? 'text-3xl sm:text-5xl' : 'text-4xl sm:text-6xl';

  return (
    <GridFocusScreen
      title="方塊在哪裡"
      subtitle="記住亮起的方塊位置"
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className="bg-cyan-50"
      statusClassName="bg-cyan-100 text-cyan-800"
      advancedClassName="bg-cyan-600"
      playfieldLabel="空間記憶矩陣"
      supportLabel="記憶階段控制"
      playfieldClassName="flex items-center justify-center overflow-hidden"
      supportClassName="flex items-center justify-center overflow-hidden"
      playfield={(
                <div 
                    className="grid h-full max-h-[28rem] aspect-square gap-2 rounded-2xl border-4 border-cyan-200 bg-white p-3 shadow-lg"
                    style={gridContainerStyle}
                >
                    {Array.from({ length: level.gridSize * level.gridSize }).map((_, idx) => {
                        let bgColor = "bg-cyan-50";
                        let borderColor = "border-cyan-100";
                        let textColor = "text-cyan-300";
                        
                        if (gameState === 'memorize') {
                            if (level.activeIndices.includes(idx)) {
                                bgColor = "bg-red-500";
                                borderColor = "border-red-600";
                                textColor = "text-transparent"; // Hide text in memorize phase
                            } else {
                                textColor = "text-transparent"; // Hide text in memorize phase
                            }
                        } else if (gameState === 'recall') {
                            if (userSelection.includes(idx)) {
                                bgColor = "bg-cyan-500";
                                borderColor = "border-cyan-600";
                                textColor = "text-white";
                            } else {
                                bgColor = "bg-cyan-50 hover:bg-cyan-100 cursor-pointer";
                            }
                        } else if (gameState === 'result') {
                            const wasCorrect = level.activeIndices.includes(idx);
                            const userSelected = userSelection.includes(idx);

                            if (wasCorrect && userSelected) {
                                bgColor = "bg-green-500"; // Correct hit
                                textColor = "text-white";
                            } else if (wasCorrect && !userSelected) {
                                bgColor = "bg-red-400 opacity-70"; // Missed
                                textColor = "text-white";
                            } else if (!wasCorrect && userSelected) {
                                bgColor = "bg-gray-400"; // Wrong selection
                                textColor = "text-white";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleCellClick(idx)}
                                disabled={gameState !== 'recall'}
                                className={`flex min-h-11 items-center justify-center rounded-lg border-2 transition-all duration-200 ${bgColor} ${borderColor}`}
                            >
                                <span className={`${fontSizeClass} font-black ${textColor} transition-opacity duration-300 select-none`}>
                                    {idx + 1}
                                </span>
                            </button>
                        )
                    })}
                </div>
      )}
      support={(
            <div className="flex flex-col items-center justify-center text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-cyan-900 mb-4 sm:mb-6">
                    {gameState === 'memorize' && <span className="flex flex-col items-center"><Eye className="mb-2 w-8 h-8"/> 記住方塊位置 <br/><span className="text-4xl mt-2 text-red-500">{countdown.toFixed(0)}</span></span>}
                    {gameState === 'recall' && <span className="flex flex-col items-center text-orange-600">點擊剛才的方塊位置</span>}
                    {gameState === 'result' && <span className="text-blue-600 text-3xl">答案揭曉</span>}
                </h2>

                {gameState === 'recall' && (
                    <button 
                        onClick={checkAnswer}
                        disabled={userSelection.length === 0}
                        className="px-8 py-3 sm:py-4 bg-cyan-600 text-white rounded-full font-bold shadow-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg sm:text-xl animate-fade-in"
                    >
                        <Play className="fill-current mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6"/> 確認答案
                    </button>
                )}

                {gameState === 'result' && (
                    <div className="flex flex-col items-center animate-fade-in-up w-full">
                        <button 
                            onClick={handleNextLevel}
                            className="px-8 py-3 sm:py-4 bg-cyan-600 text-white rounded-full font-bold shadow-lg hover:bg-cyan-700 flex items-center text-lg sm:text-xl"
                        >
                            下一題 <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6"/>
                        </button>
                    </div>
                )}
            </div>
      )}
      feedback={gameState === 'result' ? feedbackText : undefined}
    />
  );
};

export default DotGame;
