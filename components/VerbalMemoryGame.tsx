import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, Timer, Trophy } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];

const VerbalMemoryGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const pairsCount = isAdvanced ? 10 : 8; // 20 cards vs 16 cards
  
  const [cards, setCards] = useState<{id: number, content: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const initGame = () => {
    const selectedEmojis = EMOJIS.slice(0, pairsCount);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(deck);
    setFlippedIndices([]);
    setIsComplete(false);
    setIsLocked(false);
    setStartTime(Date.now());
    setScore(0);
    setTimeTaken(0);
  };

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    soundService.playGameSound('HIGH');
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [firstIndex, secondIndex] = newFlipped;
      
      if (newCards[firstIndex].content === newCards[secondIndex].content) {
        setTimeout(() => {
          soundService.playWin();
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setIsLocked(false);
          
          if (matchedCards.every(c => c.isMatched)) {
            const timeSeconds = (Date.now() - startTime) / 1000;
            setTimeTaken(timeSeconds);
            // Base score 2000, minus 10 points per second
            setScore(Math.max(100, 2000 - Math.floor(timeSeconds) * 10));
            setIsComplete(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          soundService.playWrong();
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1500);
      }
    }
  };

  return (
    <div
      data-verbal-memory-root="true"
      data-verbal-memory-mode={isAdvanced ? 'ADVANCED' : 'NORMAL'}
      className={`verbal-memory-root flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden ${isAdvanced ? 'bg-indigo-50' : 'bg-emerald-50'}`}
    >
      <style>{`\
        .verbal-memory-root { box-sizing: border-box; }\
        .verbal-memory-main { min-height: 0; }\
        .verbal-memory-grid { box-sizing: border-box; }\
        @media (orientation: landscape) and (max-height: 480px) {\
          .verbal-memory-main { overflow: hidden; }\
          .verbal-memory-grid { height: min(100%, 30rem); width: auto; max-width: 100%; aspect-ratio: 1 / 1; }\
          .verbal-memory-grid[data-verbal-memory-mode="ADVANCED"] { aspect-ratio: 5 / 4; }\
          .verbal-memory-grid--complete { height: min(8rem, 30%); max-height: 8rem; }\
          .verbal-memory-card-face { font-size: clamp(2.75rem, 13vh, 4rem); line-height: 1; }\
        }\
        @media (orientation: portrait) {\
          .verbal-memory-root { height: auto; min-height: 100dvh; max-height: none; overflow-y: auto; }\
          .verbal-memory-main { overflow-y: auto; }\
          .verbal-memory-grid { width: min(90vw, 64rem); max-width: 100%; }\
        }\
      `}</style>
      <div className="flex-none p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <button onClick={onBack} aria-label="返回遊戲選單" className="min-h-11 min-w-11 flex items-center justify-center p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${isAdvanced ? 'text-indigo-800' : 'text-emerald-800'}`}>記憶翻牌 (團體版)</h2>
          <p className="text-xs text-gray-500">{isAdvanced ? '20張牌挑戰' : '16張牌挑戰'}</p>
        </div>
        <button onClick={initGame} aria-label="重新開始" className="min-h-11 min-w-11 flex items-center justify-center p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <RefreshCw size={24} />
        </button>
      </div>

      <div data-verbal-memory-main="true" className={`verbal-memory-main flex min-h-0 flex-1 flex-col items-center justify-center p-4 w-full ${isComplete ? 'overflow-hidden' : 'overflow-y-auto landscape:overflow-hidden'}`}>
        {isComplete && (
          <div data-verbal-memory-completion="true" className="mb-2 flex w-full max-w-md shrink-0 flex-col items-center rounded-3xl border-4 border-green-200 bg-white p-4 shadow-lg animate-bounce-in landscape:p-3">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
            <h3 className="text-2xl font-bold text-green-600 mb-2">全部配對成功！</h3>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <Timer className="text-blue-500 mb-1" />
                <span className="text-gray-600 font-bold">{Math.floor(timeTaken)} 秒</span>
              </div>
              <div className="flex flex-col items-center">
                <Trophy className="text-yellow-500 mb-1" />
                <span className="text-gray-600 font-bold">{score} 分</span>
              </div>
            </div>
          </div>
        )}

        <div 
          data-verbal-memory-grid="true"
          data-verbal-memory-mode={isAdvanced ? 'ADVANCED' : 'NORMAL'}
          className={`verbal-memory-grid grid shrink-0 gap-2 landscape:gap-1 lg:gap-4 w-full max-w-[90vw] lg:max-w-4xl ${isComplete ? 'verbal-memory-grid--complete opacity-50 pointer-events-none' : ''}`}
          style={{ 
            gridTemplateColumns: `repeat(${isAdvanced ? 5 : 4}, minmax(0, 1fr))` 
          }}
        >
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              data-verbal-memory-card="true"
              aria-label={`第 ${index + 1} 張牌${card.isFlipped || card.isMatched ? `，${card.content}` : ''}${card.isMatched ? '，已配對' : ''}`}
              className={`
                aspect-[4/3] landscape:aspect-square rounded-xl text-3xl landscape:text-2xl md:text-5xl flex items-center justify-center shadow-md transition-all duration-300 transform border-2
                ${card.isFlipped || card.isMatched ? 'bg-white border-gray-200' : 'bg-blue-500 border-blue-600 hover:bg-blue-600 active:scale-95'}
                ${card.isMatched ? 'opacity-50' : ''}
              `}
            >
              {card.isFlipped || card.isMatched ? (
                <span className="verbal-memory-card-face animate-fade-in">{card.content}</span>
              ) : (
                <span className="text-white font-bold text-4xl landscape:text-2xl md:text-6xl">{index + 1}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerbalMemoryGame;
