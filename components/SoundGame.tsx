
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy, Volume2 } from 'lucide-react';
import { SoundLevel, Difficulty } from '../types';
import { generateSoundLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import CognitiveChoiceScreen from './game-ui/CognitiveChoiceScreen';
import GameShell from './game-ui/GameShell';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const SoundGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }: Props) => {
  const [level, setLevel] = useState<SoundLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const startTimeRef = useRef<number>(0);

  // Used Indices Tracking
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setFeedback(null);
    setSelectedIndex(null);
    
    // Pass usedIndices to exclude duplicates
    const { level: data, index } = await generateSoundLevel(usedIndices, difficulty as Difficulty);
    
    setLevel(data);
    setUsedIndices(prev => [...prev, index]);
    
    setLoading(false);
    
    // Auto play sound after slight delay
    setTimeout(() => playSound(data.soundType), 500);
    
    startTimeRef.current = Date.now();
  };

  const playSound = (type: any) => {
      setIsPlaying(true);
      soundService.playGameSound(type);
      setTimeout(() => setIsPlaying(false), 1000);
  }

  const handleOptionClick = (index: number) => {
    if (!level || feedback) return;
    setSelectedIndex(index);

    if (level.options[index].isCorrect) {
      setFeedback('correct');
      soundService.playCorrect();
      
      // Time-based scoring
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let points = 10;
      if (timeTaken < 3) points += 10;      // < 3s: 20 pts
      else if (timeTaken < 5) points += 5;  // < 5s: 15 pts
      
      setScore(s => s + points);
      
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
      soundService.playWrong();
      setTimeout(() => {
        setFeedback(null);
        setSelectedIndex(null);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setUsedIndices([]); // Reset history
    setIsFinished(false);
    startRound();
  };

  if (isFinished) {
    return (
      <GameShell title="聽音辨位" subtitle="聽聲音，找出對應物件" onBack={onBack} className="bg-indigo-50">
       <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-indigo-200">
          <Trophy className="w-20 h-20 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-indigo-900 mb-2">聽力絕佳！</h2>
          <div className="text-6xl font-black text-indigo-600 mb-4">{score}</div>
          <p className="text-gray-600 mb-8">你的專注力很棒！</p>
          <div className="flex gap-4">
            <button onClick={onBack} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">回主選單</button>
            <button onClick={handleRestart} className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 shadow-lg">再玩一次</button>
          </div>
        </div>
       </div>
      </GameShell>
    );
  }

  if (loading || !level) {
    return (
      <GameShell title="聽音辨位" subtitle="聽聲音，找出對應物件" onBack={onBack} className="bg-indigo-50">
        <div role="status" className="flex h-full items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
        </div>
      </GameShell>
    );
  }

  return (
    <CognitiveChoiceScreen
      title="聽音辨位"
      subtitle="聽聲音，找出對應物件"
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className="bg-indigo-50"
      statusClassName="bg-indigo-100 text-indigo-800"
      advancedClassName="bg-indigo-600"
      questionLabel="聲音播放區"
      choicesLabel="聲音作答區"
      questionClassName="flex items-center justify-center rounded-3xl border-2 border-indigo-100 bg-white p-3 shadow-lg sm:p-5"
      choicesClassName="flex items-center justify-center pr-1"
      question={(
        <div className="flex flex-col items-center gap-3">
          <button
              onClick={() => playSound(level.soundType)}
              className={`
                  flex h-28 w-28 flex-col items-center justify-center rounded-full border-8 shadow-xl transition-transform active:scale-95 sm:h-36 sm:w-36
                  ${isPlaying ? 'bg-indigo-200 border-indigo-400 scale-105' : 'bg-white border-indigo-100 hover:bg-indigo-50'}
              `}
          >
              <Volume2 size={44} className={`mb-1 ${isPlaying ? 'text-indigo-600 animate-pulse' : 'text-indigo-400'}`} />
              <span className="text-indigo-900 font-bold text-sm sm:text-base">播放聲音</span>
          </button>
          <p className="text-center font-bold text-gray-500">請選擇對應的聲音</p>
        </div>
      )}
      choices={(
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
          {level.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={!!feedback}
              className={`
                min-h-[76px] rounded-xl shadow-md border-2 p-2 sm:min-h-[96px] sm:p-4 flex flex-col items-center justify-center transition-all active:scale-95
                ${feedback === 'correct' && opt.isCorrect ? 'bg-green-100 border-green-500' : ''}
                ${feedback === 'wrong' && idx === selectedIndex ? 'bg-red-100 border-red-300' : 'bg-white border-indigo-100 hover:border-indigo-300'}
              `}
            >
              <span className="text-4xl sm:text-5xl mb-2">{opt.icon}</span>
              <span className="text-gray-700 font-bold text-lg">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
      feedback={feedback === 'correct' ? '答對了！' : feedback === 'wrong' ? '再想想看' : undefined}
    />
  );
};

export default SoundGame;
