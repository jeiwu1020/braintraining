import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

const CARDS = [
  // 人
  { text: '警察', emoji: '👮', type: '人' },
  { text: '奶奶', emoji: '👵', type: '人' },
  { text: '小偷', emoji: '🦹', type: '人' },
  { text: '醫生', emoji: '👨‍⚕️', type: '人' },
  { text: '小孩', emoji: '👦', type: '人' },
  // 事
  { text: '追趕', emoji: '🏃', type: '事' },
  { text: '跳舞', emoji: '💃', type: '事' },
  { text: '睡覺', emoji: '🛌', type: '事' },
  { text: '唱歌', emoji: '🎤', type: '事' },
  { text: '跌倒', emoji: '🤸', type: '事' },
  // 時
  { text: '早上', emoji: '🌅', type: '時' },
  { text: '半夜', emoji: '🌙', type: '時' },
  { text: '下雨天', emoji: '🌧️', type: '時' },
  { text: '冬天', emoji: '☃️', type: '時' },
  // 地
  { text: '公園', emoji: '🏞️', type: '地' },
  { text: '醫院', emoji: '🏥', type: '地' },
  { text: '學校', emoji: '🏫', type: '地' },
  { text: '海邊', emoji: '🏖️', type: '地' },
  { text: '家裡', emoji: '🏠', type: '地' },
  // 物
  { text: '蘋果', emoji: '🍎', type: '物' },
  { text: '手機', emoji: '📱', type: '物' },
  { text: '鑰匙', emoji: '🔑', type: '物' },
  { text: '錢包', emoji: '👛', type: '物' },
  { text: '腳踏車', emoji: '🚲', type: '物' }
];

const StoryCardsGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const numCards = isAdvanced ? 5 : 4; // Use 4 or 5 cards
  
  const getRandomCards = () => {
    // Try to pick from different categories if possible to make interesting stories
    const shuffled = [...CARDS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numCards).map((card, idx) => ({ id: idx, ...card, active: false }));
  };

  const [cards, setCards] = useState(getRandomCards());
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  const handleRefresh = () => {
    setCards(getRandomCards());
    setZoomIndex(null);
    soundService.playTone(500, 'triangle', 0.1);
  };

  const toggleActive = (idx: number) => {
    if (zoomIndex !== null) return;
    const isNowActive = !cards[idx]?.active;
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, active: !c.active } : c));
    soundService.playTone(isNowActive ? 600 : 400, 'sine', 0.1); 
  };

  return (
    <div className="story-cards-root flex flex-col items-center justify-center min-h-[100dvh] bg-amber-50 p-2 sm:p-4 overflow-hidden">
      <style>{`\
        @media (hover: hover) and (pointer: fine) {\
          .story-cards-zoom { opacity: 0.72; }\
          .story-cards-zoom:hover { opacity: 1; }\
        }\
      `}</style>
      <button 
        onClick={onBack}
        aria-label="返回遊戲選單"
        className="absolute top-2 left-2 min-h-11 min-w-11 flex items-center justify-center p-2 bg-white rounded-full shadow-md text-amber-600 hover:bg-amber-100 z-50 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full h-full max-w-6xl bg-white p-2 sm:p-6 rounded-3xl shadow-xl flex flex-col items-center border border-amber-100 overflow-hidden">
        
        {zoomIndex !== null ? (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in relative">
                <span className="text-[10rem] sm:text-[15rem] leading-none drop-shadow-2xl">
                    {cards[zoomIndex].emoji}
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-slate-700 mt-2 sm:mt-4">{cards[zoomIndex].text}</span>
                <button 
                    onClick={() => setZoomIndex(null)}
                    aria-label="關閉放大檢視"
                    className="absolute top-0 right-0 min-h-11 min-w-11 flex items-center justify-center p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors shadow-md"
                >
                    <ZoomOut size={32} />
                </button>
            </div>
        ) : (
            <div className="flex flex-col h-full w-full justify-between items-center py-2">
                <div className="flex justify-between items-center w-full px-4 sm:px-8 mb-2 sm:mb-4">
                    <h2 className="text-xl sm:text-3xl font-bold text-amber-900">故事聯想卡</h2>
                    <button 
                        onClick={handleRefresh}
                        className="min-h-11 flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-amber-500 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-amber-600 transition-all shadow-md active:scale-95"
                    >
                        <RefreshCw size={18} />
                        換一組
                    </button>
                </div>
                
                <div className="story-cards-stage flex flex-row justify-center items-center gap-1 sm:gap-4 w-full flex-1 px-1 sm:px-2 h-full min-h-[120px] overflow-visible">
                    {cards.map((card, idx) => (
                        <div key={card.id} className="relative group flex-1 min-w-0 max-w-[5rem] sm:max-w-[10rem] h-full flex flex-col justify-center">
                            <button
                                onClick={() => toggleActive(idx)}
                                className={`w-full aspect-[2/3] sm:w-36 sm:h-48 sm:aspect-auto flex flex-col items-center justify-center rounded-xl sm:rounded-3xl transition-all duration-300 shadow-sm sm:shadow-md border-2 sm:border-4 ${
                                    card.active 
                                        ? 'bg-amber-100 border-amber-400 ring-2 sm:ring-4 ring-amber-500 shadow-amber-200'
                                        : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-amber-300'
                                }`}
                            >
                                <span className="text-[9px] sm:text-xs font-bold text-slate-400 mb-0.5 sm:mb-1">{card.type}</span>
                                <span className="text-2xl sm:text-7xl mb-0.5 sm:mb-2">{card.emoji}</span>
                                <span className="text-[10px] sm:text-xl font-bold text-slate-700 truncate max-w-full px-1">{card.text}</span>
                            </button>
                            <button
                                onClick={() => setZoomIndex(idx)}
                                aria-label={`放大第 ${idx + 1} 張卡：${card.text}`}
                                className="story-cards-zoom absolute top-1 right-1 min-h-11 min-w-11 flex items-center justify-center p-2 bg-white border border-slate-200 rounded-full text-slate-600 shadow-md transition-opacity hover:bg-amber-50 hover:text-amber-600 z-10"
                                title="放大單張"
                            >
                                <ZoomIn size={12} className="sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default StoryCardsGame;
