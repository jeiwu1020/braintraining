
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy, HelpCircle } from 'lucide-react';
import { OddOneLevel, Difficulty } from '../types';
import { generateOddOneLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import GridFocusScreen from './game-ui/GridFocusScreen';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const OddOneGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }: Props) => {
  const [level, setLevel] = useState<OddOneLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showReason, setShowReason] = useState(false);
  
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
    setShowReason(false);
    
    // Pass usedIndices to exclude duplicates
    const { level: data, index } = await generateOddOneLevel(usedIndices, difficulty as Difficulty);
    
    setLevel(data);
    setUsedIndices(prev => [...prev, index]);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const handleItemClick = (index: number) => {
    if (!level || feedback) return;
    setSelectedIndex(index);

    if (index === level.correctIndex) {
      setFeedback('correct');
      soundService.playCorrect();
      
      // Time-based scoring
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let points = 10;
      if (timeTaken < 3) points += 10;      // < 3s: 20 pts
      else if (timeTaken < 5) points += 5;  // < 5s: 15 pts
      
      setScore(s => s + points);
      
      if(level.reason) setShowReason(true);
      
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
          startRound();
        } else {
          setIsFinished(true);
          soundService.playWin();
        }
      }, level.reason ? 2500 : 1500); // Give time to read reason
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
      <GameShell title="誰是異類" subtitle="本回合完成" onBack={onBack} className="bg-orange-50">
       <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-orange-200">
          <Trophy className="w-20 h-20 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-orange-900 mb-2">挑戰完成！</h2>
          <div className="text-6xl font-black text-orange-600 mb-4">{score}</div>
          <p className="text-gray-600 mb-8">你的分類概念很強！</p>
          <div className="flex gap-4">
            <button onClick={onBack} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">回主選單</button>
            <button onClick={handleRestart} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg">再玩一次</button>
          </div>
        </div>
       </div>
      </GameShell>
    );
  }

  if (loading || !level) {
    return (
      <GameShell title="誰是異類" subtitle="找出分類不同的項目" onBack={onBack} className="bg-orange-50">
        <div role="status" className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-12 h-12" /></div>
      </GameShell>
    );
  }

  return (
    <GridFocusScreen
      title="誰是異類"
      subtitle="找出分類不同的項目"
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className="bg-orange-50"
      statusClassName="bg-orange-100 text-orange-800"
      advancedClassName="bg-orange-600"
      playfieldLabel="異類圖案矩陣"
      playfieldClassName="flex flex-col items-center justify-center gap-3 overflow-hidden"
      playfield={(
       <>
        <h2 className="flex shrink-0 items-center text-xl font-bold text-orange-900 sm:text-2xl"><HelpCircle className="mr-2"/> 哪一個不一樣？</h2>
        <div className="grid h-full max-h-64 w-full max-w-6xl grid-cols-2 items-stretch gap-3 sm:grid-cols-4 sm:gap-4">
          {level.items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleItemClick(idx)}
              disabled={!!feedback}
              className={`
                min-h-0 rounded-2xl shadow-lg border-4 flex flex-col items-center justify-center p-2 sm:p-4 transition-all active:scale-95
                ${feedback === 'correct' && idx === level.correctIndex ? 'bg-green-100 border-green-500' : ''}
                ${feedback === 'wrong' && idx === selectedIndex ? 'bg-red-100 border-red-300' : 'bg-white border-orange-100 hover:bg-orange-50'}
                ${feedback && idx !== level.correctIndex && idx !== selectedIndex ? 'opacity-50' : ''}
              `}
            >
              <span className="text-5xl sm:text-6xl mb-2">{item.icon}</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-700">{item.text}</span>
            </button>
          ))}
        </div>
       </>
      )}
      feedback={feedback ? (
        <span className={feedback === 'correct' ? 'text-green-700' : 'text-red-700'}>
          {feedback === 'correct' ? `答對了！${showReason && level.reason ? ` 💡 ${level.reason}` : ''}` : '再想想看'}
        </span>
      ) : undefined}
    />
  );
};

export default OddOneGame;
