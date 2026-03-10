
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, Volume2, Play, CheckCircle, XCircle } from 'lucide-react';
import { SoundLevel, Difficulty } from '../types';
import { generateSoundLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const SoundGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50 p-4 animate-fade-in">
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
    );
  }

  if (loading || !level) {
    return <div className="min-h-screen bg-indigo-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500 w-12 h-12" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-indigo-50 overflow-hidden relative">
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-indigo-800 shadow-sm hover:bg-indigo-100"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-4">
          {difficulty === 'ADVANCED' && <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs">進階</span>}
          <div className="text-indigo-800 font-bold">第 {round} / {TOTAL_ROUNDS} 題</div>
          <div className="flex items-center bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 font-bold"><Trophy size={16} className="mr-2"/> {score}</div>
        </div>
      </div>

      {/* Main Content - Flex-row on Landscape */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center p-4 gap-6 sm:gap-12 w-full max-w-5xl mx-auto overflow-hidden">
        
        {/* Left: Options Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md aspect-square sm:aspect-auto sm:h-full sm:max-h-[60vh]">
          {level.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={!!feedback}
              className={`
                rounded-xl shadow-md border-2 p-2 sm:p-4 flex flex-col items-center justify-center transition-all active:scale-95 h-full
                ${feedback === 'correct' && opt.isCorrect ? 'bg-green-100 border-green-500' : ''}
                ${feedback === 'wrong' && idx === selectedIndex ? 'bg-red-100 border-red-300' : 'bg-white border-indigo-100 hover:border-indigo-300'}
              `}
            >
              <span className="text-4xl sm:text-5xl mb-2">{opt.icon}</span>
              <span className="text-gray-700 font-bold text-lg">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Play Button & Instructions */}
        <div className="flex-none flex flex-col items-center gap-4">
            <button 
                onClick={() => playSound(level.soundType)}
                className={`
                    w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-2xl border-8 flex flex-col items-center justify-center transition-transform active:scale-95
                    ${isPlaying ? 'bg-indigo-200 border-indigo-400 scale-105' : 'bg-white border-indigo-100 hover:bg-indigo-50'}
                `}
            >
                <Volume2 size={48} className={`mb-1 ${isPlaying ? 'text-indigo-600 animate-pulse' : 'text-indigo-400'}`} />
                <span className="text-indigo-900 font-bold text-base">播放聲音</span>
            </button>
            <div className="text-gray-500 font-bold bg-white/50 px-4 py-1 rounded-full">請選擇對應的聲音</div>
        </div>

        {/* Feedback Overlay */}
        {feedback && (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-3xl shadow-2xl border-4 z-50 animate-bounce-short flex items-center gap-3 ${feedback === 'correct' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
                {feedback === 'correct' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                <span className="text-2xl font-bold">{feedback === 'correct' ? "答對了！" : "再想想看"}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default SoundGame;
