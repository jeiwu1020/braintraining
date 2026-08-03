import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

const CATEGORIES = {
    '動物': ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷'],
    '水果': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🍍'],
    '交通工具': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚'],
    '日常物品': ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾']
};

const ConditionalSnapGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const [targetCategory, setTargetCategory] = useState<string>('動物');
  const [currentEmoji, setCurrentEmoji] = useState('❓');

  const handleNext = () => {
    const categoryKeys = Object.keys(CATEGORIES);
    const randomCat = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const items = CATEGORIES[randomCat as keyof typeof CATEGORIES];
    const item = items[Math.floor(Math.random() * items.length)];
    
    setCurrentEmoji(item);
    
    if (randomCat === targetCategory) {
        soundService.playCorrect();
    } else {
        soundService.playTone(400, 'sine', 0.1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-rose-50 p-4">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md text-rose-600 hover:bg-rose-100 z-50 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full flex justify-center mb-4 sm:mb-8 mt-12 sm:mt-0">
          <div className="bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-sm border border-rose-100 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center">
              <span className="text-lg sm:text-xl font-bold text-slate-700">任務目標：看到</span>
              <select 
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="bg-rose-100 text-rose-700 font-bold text-lg sm:text-xl px-4 py-2 rounded-xl outline-none cursor-pointer hover:bg-rose-200 transition-colors"
              >
                  {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-lg sm:text-xl font-bold text-slate-700">請舉手並喊有！</span>
          </div>
      </div>

      <div className="w-full max-w-5xl flex justify-between items-center gap-2 sm:gap-12 flex-1">
          <button 
            onClick={handleNext}
            className="w-16 h-32 sm:w-24 sm:h-48 bg-white rounded-3xl shadow-lg border border-rose-100 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 active:scale-95 transition-all shrink-0"
          >
              <ChevronLeft size={48} />
          </button>
          
          <div className="flex-1 max-w-[40vh] sm:max-w-md aspect-square bg-white rounded-full shadow-2xl border-8 border-rose-100 flex items-center justify-center animate-fade-in relative overflow-hidden mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-50 to-transparent"></div>
              <span className="text-[20vh] sm:text-[12rem] leading-none drop-shadow-lg z-10 animate-bounce">
                  {currentEmoji}
              </span>
          </div>

          <button 
            onClick={handleNext}
            className="w-16 h-32 sm:w-24 sm:h-48 bg-white rounded-3xl shadow-lg border border-rose-100 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 active:scale-95 transition-all shrink-0"
          >
              <ChevronRight size={48} />
          </button>
      </div>
    </div>
  );
};

export default ConditionalSnapGame;
