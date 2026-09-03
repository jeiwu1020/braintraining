import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';

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
  const [showRules, setShowRules] = useState(false);

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
    <div
      data-conditional-snap-root="true"
      className="conditional-snap-root flex h-[100dvh] min-h-0 max-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-rose-50 p-2 sm:p-4"
    >
      <style>{`\
        .conditional-snap-root { box-sizing: border-box; }\
        .conditional-snap-stage { min-height: 0; }\
        .conditional-snap-stimulus { height: min(100%, 30rem); width: auto; max-width: calc(100% - 7rem); }\
        .conditional-snap-trigger { width: clamp(3rem, 12vw, 6rem); height: min(100%, 12rem); min-height: 44px; }\
        @media (orientation: landscape) and (max-height: 480px) {\
          .conditional-snap-root { height: 100dvh; max-height: 100dvh; overflow: hidden; }\
          .conditional-snap-target { margin-top: 0; margin-bottom: 0.5rem; }\
          .conditional-snap-target-panel { padding-top: 0.375rem; padding-bottom: 0.375rem; }\
          .conditional-snap-stage { flex: 1 1 0%; width: 100%; }\
          .conditional-snap-stimulus { max-height: 100%; }\
          .conditional-snap-trigger { max-height: 12rem; }\
        }\
        @media (orientation: portrait) {\
          .conditional-snap-root { height: auto; min-height: 100dvh; max-height: none; overflow-y: auto; }\
          .conditional-snap-stimulus { height: auto; width: min(90vw, 30rem); max-width: 100%; }\
          .conditional-snap-trigger { height: 6rem; }\
        }\
      `}</style>
      <button 
        onClick={onBack}
        aria-label="返回遊戲選單"
        className="absolute top-2 left-2 z-50 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white p-2 text-rose-600 shadow-md transition-colors hover:bg-rose-100"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button 
              onClick={() => setShowRules(true)}
              aria-label="遊戲規則"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-rose-100 bg-white p-2 text-rose-600 shadow-sm transition-colors hover:bg-rose-50 active:scale-95"
              title="遊戲規則"
          >
              <HelpCircle size={24} />
          </button>
      </div>

      <RulesModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)}
          rules={[
              "設定一個「目標類別」（例如：動物）。",
              "由治療師點擊兩側的箭頭切換圖片。",
              "當畫面出現符合「目標類別」的圖片時，玩家需立刻舉手並喊有！",
              "這是一個訓練注意力與反應力的遊戲。"
          ]}
      />

      <div className="conditional-snap-target mt-8 mb-2 flex w-full shrink-0 justify-center sm:mt-0 sm:mb-4">
          <div className="conditional-snap-target-panel flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white/90 px-3 py-2 text-center shadow-sm backdrop-blur-md sm:px-6">
              <span className="text-base sm:text-xl font-bold text-slate-700">任務目標：看到</span>
              <select 
                aria-label="目標類別"
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="min-h-11 cursor-pointer rounded-xl bg-rose-100 px-3 py-1.5 text-base font-bold text-rose-700 outline-none transition-colors hover:bg-rose-200 sm:text-xl"
              >
                  {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-base sm:text-xl font-bold text-slate-700">請舉手並喊有！</span>
          </div>
      </div>

      <div data-conditional-snap-stage="true" className="conditional-snap-stage flex w-full max-w-5xl flex-1 items-center justify-between gap-2 sm:gap-12">
          <button 
            onClick={handleNext}
            aria-label="切換圖片（左側）"
            data-conditional-snap-trigger="left"
            className="conditional-snap-trigger flex shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-300 shadow-lg transition-all hover:bg-rose-50 hover:text-rose-500 active:scale-95"
          >
              <ChevronLeft size={32} className="sm:w-12 sm:h-12" />
          </button>
          
          <div data-conditional-snap-target="true" className="conditional-snap-stimulus relative mx-auto flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border-[6px] border-rose-100 bg-white shadow-2xl animate-fade-in sm:border-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-50 to-transparent"></div>
              <span className="z-10 max-w-full text-[clamp(4rem,22vmin,12rem)] leading-none drop-shadow-lg animate-bounce">
                  {currentEmoji}
              </span>
          </div>

          <button 
            onClick={handleNext}
            aria-label="切換圖片（右側）"
            data-conditional-snap-trigger="right"
            className="conditional-snap-trigger flex shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-300 shadow-lg transition-all hover:bg-rose-50 hover:text-rose-500 active:scale-95"
          >
              <ChevronRight size={32} className="sm:w-12 sm:h-12" />
          </button>
      </div>
    </div>
  );
};

export default ConditionalSnapGame;
