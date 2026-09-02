import React, { useState, useEffect } from 'react';
import { RefreshCw, Play } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import GridFocusScreen from './game-ui/GridFocusScreen';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const COLORS = [
  { id: 0, color: 'bg-red-500', active: 'bg-red-300', name: '紅色' },
  { id: 1, color: 'bg-blue-500', active: 'bg-blue-300', name: '藍色' },
  { id: 2, color: 'bg-yellow-400', active: 'bg-yellow-200', name: '黃色' },
  { id: 3, color: 'bg-green-500', active: 'bg-green-300', name: '綠色' },
];

const SimonSaysGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [level, setLevel] = useState(isAdvanced ? 4 : 3);
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isLastRoundCorrect, setIsLastRoundCorrect] = useState<boolean | null>(null);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const TOTAL_ROUNDS = 10;

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const initGame = () => {
    setRound(1);
    setScore(0);
    setIsComplete(false);
    setShowResult(false);
    generateSequence(1, isAdvanced ? 4 : 3);
  };

  const generateSequence = (currentRound: number, currentLevel: number) => {
    const newSeq = Array.from({ length: currentLevel }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setPlayerSequence([]);
    setIsWaitingForPlayer(false);
    setShowResult(false);
    setIsLastRoundCorrect(null);
  };

  const playSequence = async () => {
    setIsPlaying(true);
    setIsWaitingForPlayer(false);
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(sequence[i]);
      soundService.playGameSound('HIGH');
      
      await new Promise(resolve => setTimeout(resolve, isAdvanced ? 300 : 500));
      setActiveColor(null);
    }
    
    setIsPlaying(false);
    setIsWaitingForPlayer(true);
    setRoundStartTime(Date.now());
  };

  const handleNextRound = (isCorrect: boolean, timeTaken: number) => {
    setShowResult(true);
    setIsLastRoundCorrect(isCorrect);
    
    if (isCorrect) {
      const roundScore = Math.max(10, 100 - Math.floor(timeTaken) * 2);
      setScore(prev => prev + roundScore);
      soundService.playWin();
    } else {
      soundService.playWrong();
    }

    setTimeout(() => {
      if (round < TOTAL_ROUNDS) {
        const nextRound = round + 1;
        setRound(nextRound);
        // Increase level slightly every 3 rounds
        const nextLevel = (isAdvanced ? 4 : 3) + Math.floor(nextRound / 3);
        setLevel(nextLevel);
        generateSequence(nextRound, nextLevel);
      } else {
        setIsComplete(true);
        soundService.playWin();
      }
    }, 2500);
  };

  const handleColorClick = (colorId: number) => {
    if (!isWaitingForPlayer || isPlaying || showResult || isComplete) return;

    soundService.playGameSound('LOW');
    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 200);

    const newPlayerSeq = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSeq);

    // Check correctness
    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      // Wrong
      setIsWaitingForPlayer(false);
      handleNextRound(false, 0);
      return;
    }

    // Correct so far
    if (newPlayerSeq.length === sequence.length) {
      // Level complete
      setIsWaitingForPlayer(false);
      const timeTaken = (Date.now() - roundStartTime) / 1000;
      handleNextRound(true, timeTaken);
    }
  };

  const getSequenceText = () => {
    return sequence.map(id => COLORS.find(c => c.id === id)?.name).join(' ➔ ');
  };

  return (
    <GridFocusScreen
      title="順序記憶"
      subtitle={`記住並重現顏色順序（長度 ${level}）`}
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className={isAdvanced ? 'bg-indigo-50' : 'bg-emerald-50'}
      statusClassName={isAdvanced ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}
      advancedClassName="bg-indigo-600"
      playfieldLabel="顏色順序矩陣"
      supportLabel="順序播放與結果"
      playfieldClassName="flex items-center justify-center overflow-hidden"
      supportClassName="flex items-center justify-center overflow-auto"
      actions={(
        <button onClick={initGame} aria-label="重新開始" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"><RefreshCw size={22} /></button>
      )}
      support={(
          <div className={`flex flex-col items-center justify-center text-center ${isComplete ? 'hidden' : ''}`}>
            <h3 className="text-xl landscape:text-lg lg:text-3xl font-bold text-gray-700 mb-2 lg:mb-4 h-10">
              {showResult ? '正確順序是：' : isPlaying ? '請記住順序...' : isWaitingForPlayer ? '請說出順序！' : '準備好開始了嗎？'}
            </h3>
            
            {showResult && (
              <div className="flex flex-col items-center gap-2 lg:gap-4 animate-bounce-in">
                <div className={`text-lg landscape:text-base lg:text-3xl font-bold px-6 py-2 lg:px-8 lg:py-3 rounded-full shadow-sm ${isLastRoundCorrect ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-red-100 text-red-700 border-2 border-red-300'}`}>
                  {isLastRoundCorrect ? '🎉 答對了！' : '❌ 答錯了！'}
                </div>
                <div className="text-xl landscape:text-lg lg:text-4xl font-bold text-blue-600 bg-white px-4 py-2 lg:px-6 lg:py-4 rounded-2xl shadow-md">
                  {getSequenceText()}
                </div>
              </div>
            )}

            {!isPlaying && !isWaitingForPlayer && !showResult && (
              <button 
                onClick={playSequence}
                className="px-6 py-3 landscape:px-4 landscape:py-2 lg:px-8 lg:py-4 bg-blue-500 text-white rounded-full font-bold text-xl landscape:text-lg lg:text-2xl shadow-md hover:bg-blue-600 flex items-center gap-2 mx-auto transition-transform active:scale-95"
              >
                <Play size={24} className="lg:w-7 lg:h-7" /> 播放順序
              </button>
            )}
          </div>
      )}
      playfield={(
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className={`grid h-full max-h-64 aspect-square grid-cols-2 gap-3 sm:gap-4 ${isComplete ? 'pointer-events-none opacity-50' : ''}`}>
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleColorClick(c.id)}
                  disabled={!isWaitingForPlayer || isPlaying}
                  className={`
                    min-h-11 aspect-square rounded-2xl shadow-lg transition-all duration-200 border-4 border-white/20
                    ${activeColor === c.id ? c.active + ' scale-95 ring-8 ring-white/50' : c.color + ' hover:scale-105'}
                    ${!isWaitingForPlayer ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
                  `}
                />
              ))}
            </div>

            {/* Progress dots for player input */}
            <div className="mt-4 flex h-4 gap-2">
              {isWaitingForPlayer && Array.from({ length: sequence.length }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 lg:w-6 lg:h-6 rounded-full transition-colors duration-300 ${i < playerSequence.length ? 'bg-green-500 shadow-md' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
      )}
      feedback={isComplete ? <span className="text-green-700">挑戰完成！總得分：{score} 分</span> : showResult ? <span className={isLastRoundCorrect ? 'text-green-700' : 'text-red-700'}>{isLastRoundCorrect ? '答對了！' : `答錯了！正確順序：${getSequenceText()}`}</span> : undefined}
    />
  );
};

export default SimonSaysGame;
