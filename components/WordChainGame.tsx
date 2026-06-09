import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Plus, Timer, Trophy } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const NORMAL_CATEGORIES = [
  '紅色的食物', '綠色的食物', '黃色的食物', '白色的食物', '黑色的食物', '兩個字的水果', '三個字的水果', '可以在天上飛的動物', '可以在水裡游的動物', '四隻腳的動物',
  '兩隻腳的動物', '沒有腳的動物', '有尾巴的動物', '有殼的動物', '圓形的東西', '長條形的東西', '方形的東西', '有輪子的東西', '需要用電的物品', '會發出聲音的物品',
  '會發光的物品', '軟軟的東西', '硬硬的東西', '冰冷的東西', '熱騰騰的東西', '甜的食物', '鹹的食物', '酸的食物', '辣的食物', '苦的食物',
  '有味道的東西', '臭臭的東西', '香香的東西', '黏黏的東西', '滑滑的東西', '粗糙的東西', '尖銳的東西', '易碎的東西', '沉重的東西', '輕飄飄的東西',
  '透明的東西', '可以摺疊的東西', '需要排隊的地方', '可以在便利商店買到的東西', '有螢幕的電子產品', '需要戴帽子的職業', '有弦的樂器', '需要用到水的活動', '可以在夜市玩到的遊戲', '台灣常見的姓氏'
];

const ADVANCED_CATEGORIES = [
  '去海邊會帶的東西', '去露營會帶的東西', '去超市會買的東西', '放在冰箱裡的東西', '放在包包裡的東西', '放在書桌上的東西', '放在浴室裡的東西', '放在客廳裡的東西', '放在廚房裡的東西', '放在臥室裡的東西',
  '早餐店賣的食物', '夜市賣的小吃', '麥當勞賣的食物', '麵包店賣的東西', '飲料店賣的飲料', '菜市場賣的東西', '文具店賣的東西', '藥局賣的東西', '五金行賣的東西', '花店賣的東西',
  '遊樂園裡的設施', '公園裡的東西', '學校裡的東西', '醫院裡的東西', '銀行裡的東西', '餐廳裡的東西', '電影院裡的東西', '飛機上的東西', '火車上的東西', '捷運上的東西',
  '婚禮上會出現的東西', '生日派對會出現的東西', '過年會出現的東西', '中秋節會出現的東西', '端午節會出現的東西', '聖誕節會出現的東西', '萬聖節會出現的東西', '颱風天會出現的東西', '下雨天會用到的東西', '寒流來會用到的東西',
  '去游泳會帶的東西', '去爬山會帶的東西', '去圖書館會做的事', '在公園會做的事', '在家裡會做的事', '讓人開心的事', '讓人害怕的事', '讓人覺得累的事', '讓人覺得熱的事', '讓人覺得冷的事'
];

const WordChainGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const categories = isAdvanced ? ADVANCED_CATEGORIES : NORMAL_CATEGORIES;
  
  const [category, setCategory] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  useEffect(() => {
    initGame(true);
  }, [difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      soundService.playWin();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const initGame = (resetHistory = false) => {
    let currentUsed = usedIndices;
    if (resetHistory) {
        currentUsed = [];
        setUsedIndices([]);
    }
    
    let availableIndices = categories.map((_, idx) => idx).filter(idx => !currentUsed.includes(idx));
    if (availableIndices.length === 0) {
        availableIndices = categories.map((_, idx) => idx);
        currentUsed = [];
        setUsedIndices([]);
    }
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedIndices([...currentUsed, randomIndex]);
    
    setCategory(categories[randomIndex]);
    setScore(0);
    setTimeLeft(60);
    setIsActive(false);
  };

  const startGame = () => {
    setIsActive(true);
    soundService.playGameSound('HIGH');
  };

  const handleAddScore = () => {
    if (isActive) {
      setScore(prev => prev + 1);
      soundService.playGameSound('RISE');
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] ${isAdvanced ? 'bg-indigo-50' : 'bg-emerald-50'} overflow-hidden`}>
      <div className="flex-none p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${isAdvanced ? 'text-indigo-800' : 'text-emerald-800'}`}>語意聯想</h2>
          <p className="text-xs text-gray-500">{isAdvanced ? '進階條件限制' : '生活類別聯想'}</p>
        </div>
        <button onClick={() => initGame(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col landscape:flex-row lg:flex-col items-center justify-center p-4 gap-4 lg:gap-0">
        
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="text-center mb-4 lg:mb-12">
            <h3 className="text-xl landscape:text-lg lg:text-2xl text-gray-600 mb-2 font-medium">請說出屬於以下類別的詞彙：</h3>
            <div className="text-4xl landscape:text-3xl lg:text-6xl font-bold text-blue-600 bg-white px-6 py-4 lg:px-8 lg:py-6 rounded-3xl shadow-md border-4 border-blue-100">
              {category}
            </div>
          </div>

          <div className="mt-4 lg:mt-12 flex gap-4">
            {!isActive && timeLeft === 60 ? (
              <button 
                onClick={startGame}
                className="px-8 py-3 landscape:px-6 landscape:py-2 lg:px-12 lg:py-4 bg-green-500 text-white rounded-full font-bold text-xl landscape:text-lg lg:text-2xl shadow-lg hover:bg-green-600 active:scale-95 transition-all"
              >
                開始計時
              </button>
            ) : (
              <button 
                onClick={handleAddScore}
                disabled={!isActive}
                className={`flex items-center gap-2 px-8 py-3 landscape:px-6 landscape:py-2 lg:px-12 lg:py-4 rounded-full font-bold text-xl landscape:text-lg lg:text-2xl shadow-lg transition-all ${isActive ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <Plus size={24} className="lg:w-8 lg:h-8" />
                加 1 分
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row landscape:flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-center w-full max-w-3xl flex-1">
          
          {/* Timer */}
          <div className="flex flex-col items-center bg-white p-4 lg:p-6 rounded-3xl shadow-lg border-2 border-gray-100 w-40 landscape:w-48 lg:w-64">
            <Timer size={32} className={`lg:w-12 lg:h-12 ${timeLeft <= 10 && isActive ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <div className={`text-4xl lg:text-6xl font-bold mt-2 lg:mt-4 ${timeLeft <= 10 && isActive ? 'text-red-500' : 'text-gray-800'}`}>
              {timeLeft}
            </div>
            <div className="text-gray-500 mt-1 lg:mt-2 font-medium text-sm lg:text-base">剩餘秒數</div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center bg-white p-4 lg:p-6 rounded-3xl shadow-lg border-2 border-gray-100 w-40 landscape:w-48 lg:w-64">
            <Trophy size={32} className="text-yellow-500 lg:w-12 lg:h-12" />
            <div className="text-4xl lg:text-6xl font-bold mt-2 lg:mt-4 text-gray-800">
              {score}
            </div>
            <div className="text-gray-500 mt-1 lg:mt-2 font-medium text-sm lg:text-base">成功聯想數</div>
          </div>

        </div>

        {!isActive && timeLeft === 0 && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4 animate-bounce-in">
              <Trophy className="w-24 h-24 text-yellow-500 mb-4" />
              <h3 className="text-4xl font-bold text-gray-800 mb-4">時間到！</h3>
              <p className="text-2xl text-gray-600 mb-8 text-center">
                成功聯想了 <br/>
                <span className="text-6xl font-black text-blue-600 block mt-4">{score}</span> 
                <span className="text-xl mt-2 block">個詞彙</span>
              </p>
              <button 
                onClick={() => initGame(false)} 
                className="w-full py-4 bg-green-500 text-white rounded-full font-bold text-2xl hover:bg-green-600 active:scale-95 transition-all shadow-lg"
              >
                再玩一次
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WordChainGame;
