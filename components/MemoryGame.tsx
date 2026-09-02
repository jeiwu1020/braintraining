
import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Footprints } from 'lucide-react';
import { MemoryCard, Difficulty } from '../types';
import { generateEncouragement } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

// Extended Emoji Pool for ~20 distinct themes/variations
// We will pick 8 random unique emojis from this list every game to ensure variety.
const EMOJIS = [
    // Animals
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    // Fruits & Food
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅', '🥑', '🍔', '🍕', '🍩', '🍦', '🍰',
    // Nature & Weather
    '🌵', '🌲', '🌳', '🌴', '🌻', '🌼', '🌷', '🌹', '🍀', '🍁', '🍄', '☀️', '🌤️', '🌈', '⚡', '❄️', '🔥', '💧',
    // Vehicles
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚜', '🛵', '🚲', '🚂', '✈️', '🚀', '🚁',
    // Sports & Activities
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '⛳', '⛸️', '🎣', '🎨', '🎬',
    // Objects
    '⌚', '📱', '💻', '📷', '💡', '🔦', '📕', '✏️', '🗝️', '🎁', '🎈', '🎉', '🧸', '👑', '💎', '🔔', '🚪', '🪑'
];

const MemoryGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [encouragement, setEncouragement] = useState("");
  const [isMismatchWaiting, setIsMismatchWaiting] = useState(false);

  const initializeGame = () => {
    // For Advanced: Maybe select emojis from same category to make it harder?
    // For now, random picking is challenging enough for 4x4.
    
    // 1. Pick 8 random unique emojis from the large pool
    const selectedEmojis: string[] = [];
    const pool = [...EMOJIS];
    
    while (selectedEmojis.length < 8) {
        if (pool.length === 0) break;
        const randomIndex = Math.floor(Math.random() * pool.length);
        selectedEmojis.push(pool[randomIndex]);
        pool.splice(randomIndex, 1); // remove to ensure uniqueness
    }

    // 2. Create pairs
    const gameItems = [...selectedEmojis, ...selectedEmojis];
    
    // 3. Shuffle
    for (let i = gameItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameItems[i], gameItems[j]] = [gameItems[j], gameItems[i]];
    }
    
    setCards(gameItems.map((emoji, index) => ({
      id: index,
      content: emoji,
      isFlipped: false,
      isMatched: false
    })));
    setFlippedIndices([]);
    setIsWon(false);
    setMoves(0);
    setEncouragement("");
    setIsMismatchWaiting(false);
    setIsProcessing(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (index: number) => {
    // Block clicks if processing, already flipped/matched, OR if waiting for manual reset
    if (isProcessing || isMismatchWaiting || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves(m => m + 1);
      
      const [firstIndex, secondIndex] = newFlipped;
      
      if (newCards[firstIndex].content === newCards[secondIndex].content) {
        // Match found - Auto proceed
        soundService.playCorrect(); // Sound for match
        setTimeout(() => {
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
          setCards(newCards);
          setFlippedIndices([]);
          setIsProcessing(false);
          
          if (newCards.every(c => c.isMatched)) {
            handleWin();
          }
        }, 500);
      } else {
        // No match - Wait for manual reset
        soundService.playWrong(); // Sound for mismatch
        setIsMismatchWaiting(true);
        setIsProcessing(false); 
      }
    }
  };

  const handleManualReset = () => {
    const newCards = [...cards];
    // Flip back the currently flipped cards that aren't matched
    flippedIndices.forEach(idx => {
        newCards[idx].isFlipped = false;
    });
    setCards(newCards);
    setFlippedIndices([]);
    setIsMismatchWaiting(false);
  };

  const handleWin = async () => {
    setIsWon(true);
    soundService.playWin(); // Sound for win
    const msg = await generateEncouragement(100);
    setEncouragement(msg);
  };

  return (
    <GameShell
      title="圖像記憶配對"
      subtitle="翻開卡片，找出相同圖案"
      onBack={onBack}
      className="bg-indigo-50"
      status={<div className="flex items-center rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-800">{difficulty === 'ADVANCED' && <span className="mr-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">進階</span>}<Footprints className="mr-1 h-4 w-4" />步數 {moves}</div>}
      actions={<button onClick={initializeGame} aria-label="重新開始" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-100 text-indigo-600 hover:bg-indigo-100"><RefreshCw size={20} /></button>}
    >
      <>
        <GridFocusLayout
          playfieldLabel="記憶配對矩陣"
          supportLabel="未配對操作"
          playfieldClassName="flex items-center justify-center overflow-hidden"
          supportClassName="flex items-center justify-center overflow-hidden"
          playfield={(
            <div className="relative flex h-full max-h-[30rem] aspect-square flex-col">
                {/* Column Labels (A-D) */}
                <div className="mb-0 flex pl-6">
                    {['A', 'B', 'C', 'D'].map(label => (
                        <div key={label} className="flex-1 text-center text-sm font-bold leading-none text-indigo-400 sm:text-base">
                            {label}
                        </div>
                    ))}
                </div>

                <div className="flex min-h-0 flex-1">
                    {/* Row Labels (1-4) */}
                    <div className="flex w-6 flex-col justify-around pr-0.5">
                        {[1, 2, 3, 4].map(label => (
                            <div key={label} className="flex flex-1 items-center justify-center text-sm font-bold text-indigo-400 sm:text-base">
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Grid - Adjusted for landscape (limit height) */}
                    <div className="grid h-full flex-1 grid-cols-4 gap-1 sm:gap-2">
                        {cards.map((card, index) => (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(index)}
                            disabled={isProcessing || isMismatchWaiting || card.isFlipped || card.isMatched}
                            className="relative min-h-11 w-full cursor-pointer perspective-1000 disabled:cursor-default"
                        >
                            {/* Card Inner */}
                            <div className={`
                                w-full h-full absolute inset-0
                                transition-all duration-500 transform
                                flex items-center justify-center
                                border-2 rounded-lg md:rounded-xl shadow-md
                                text-3xl md:text-5xl select-none
                                ${card.isFlipped || card.isMatched 
                                    ? 'bg-white border-indigo-400 rotate-y-180' 
                                    : 'bg-indigo-300 border-indigo-300'}
                                ${isMismatchWaiting && card.isFlipped && !card.isMatched ? 'border-red-400 ring-2 ring-red-200' : ''}
                            `}>
                                {/* We use a fixed container for the emoji to prevent layout shifts */}
                                <div className="w-full h-full flex items-center justify-center backface-hidden">
                                    {(card.isFlipped || card.isMatched) ? card.content : ''}
                                </div>
                            </div>
                        </button>
                        ))}
                    </div>
                </div>
            </div>
          )}
          support={isMismatchWaiting ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-indigo-100 bg-white/90 p-4 shadow-xl backdrop-blur-sm">
                    <div className="text-center text-gray-600 font-bold whitespace-nowrap">
                        沒配對成功<br className="hidden sm:block"/>請記住位置
                    </div>
                    <button 
                        onClick={handleManualReset}
                        className="bg-indigo-600 text-white text-lg font-bold px-6 py-2 rounded-xl shadow-md hover:bg-indigo-700 animate-pulse flex items-center whitespace-nowrap"
                    >
                        <RefreshCw className="mr-2 w-5 h-5" />
                        蓋上卡片
                    </button>
                </div>
          ) : undefined}
          feedback={isMismatchWaiting ? <span className="text-indigo-700">這兩張沒有配對，記住位置後再蓋上</span> : undefined}
        />

      {isWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-short">
            <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">恭喜完成！</h3>
            <p className="text-gray-500 mb-6">{encouragement || "很棒！大腦活化成功。"}</p>
            
            <div className="bg-indigo-50 rounded-xl p-4 mb-6 border-2 border-indigo-100">
                <p className="text-indigo-900 font-medium mb-1 text-sm">本次使用總步數</p>
                <div className="text-4xl md:text-6xl font-black text-indigo-600 flex items-center justify-center">
                    {moves}
                    <span className="text-xl md:text-2xl ml-2 font-normal text-indigo-400">步</span>
                </div>
            </div>

            <button
              onClick={initializeGame}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              再挑戰一次
            </button>
          </div>
        </div>
      )}
      </>
    </GameShell>
  );
};

export default MemoryGame;
