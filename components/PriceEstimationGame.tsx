import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Timer, Trophy } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const NORMAL_ITEMS = [
  { name: '一杯珍珠奶茶', options: [15, 60, 250], correct: 60 },
  { name: '一個排骨便當', options: [40, 100, 350], correct: 100 },
  { name: '一串抽取式衛生紙 (10包)', options: [30, 120, 500], correct: 120 },
  { name: '一瓶 600ml 礦泉水', options: [5, 20, 80], correct: 20 },
  { name: '一顆茶葉蛋', options: [3, 13, 50], correct: 13 },
  { name: '一碗陽春麵', options: [20, 50, 150], correct: 50 },
  { name: '一杯超商大杯美式咖啡', options: [25, 45, 100], correct: 45 },
  { name: '一份麥當勞大麥克套餐', options: [60, 140, 300], correct: 140 },
  { name: '一包科學麵', options: [5, 10, 25], correct: 10 },
  { name: '一罐可口可樂 (330ml)', options: [10, 25, 60], correct: 25 },
  { name: '一碗滷肉飯 (小)', options: [15, 35, 80], correct: 35 },
  { name: '一份炸雞排', options: [40, 80, 150], correct: 80 },
  { name: '一杯星巴克拿鐵 (大)', options: [60, 135, 250], correct: 135 },
  { name: '一包洋芋片', options: [15, 35, 80], correct: 35 },
  { name: '一瓶鮮奶 (900ml)', options: [40, 90, 180], correct: 90 },
  { name: '一個菠蘿麵包', options: [15, 30, 60], correct: 30 },
  { name: '一杯豆漿', options: [10, 20, 45], correct: 20 },
  { name: '一份蛋餅', options: [15, 35, 70], correct: 35 },
  { name: '一個飯糰', options: [20, 40, 80], correct: 40 },
  { name: '一碗蚵仔麵線', options: [30, 60, 120], correct: 60 },
  { name: '一份臭豆腐', options: [30, 60, 120], correct: 60 },
  { name: '一碗牛肉麵', options: [70, 150, 300], correct: 150 },
  { name: '一份水餃十顆', options: [35, 70, 140], correct: 70 },
  { name: '一碗酸辣湯', options: [20, 40, 80], correct: 40 },
  { name: '一份燙青菜', options: [20, 40, 80], correct: 40 },
  { name: '一杯木瓜牛奶', options: [30, 60, 120], correct: 60 },
  { name: '一碗剉冰', options: [35, 70, 150], correct: 70 },
  { name: '一份車輪餅', options: [10, 20, 45], correct: 20 },
  { name: '一根香腸', options: [15, 35, 70], correct: 35 },
  { name: '一包抽取式濕紙巾', options: [25, 50, 100], correct: 50 },
  { name: '一條牙膏', options: [40, 80, 160], correct: 80 },
  { name: '一支牙刷', options: [25, 50, 100], correct: 50 },
  { name: '一瓶洗髮精', options: [75, 150, 300], correct: 150 },
  { name: '一塊香皂', options: [15, 30, 60], correct: 30 },
  { name: '一包洗衣粉', options: [60, 120, 240], correct: 120 },
  { name: '一瓶洗碗精', options: [40, 80, 160], correct: 80 },
  { name: '一把雨傘', options: [75, 150, 300], correct: 150 },
  { name: '一雙藍白拖', options: [30, 60, 120], correct: 60 },
  { name: '一件輕便雨衣', options: [15, 30, 60], correct: 30 },
  { name: '一包醫療口罩 (50入)', options: [50, 100, 200], correct: 100 },
  { name: '一盒OK繃', options: [25, 50, 100], correct: 50 },
  { name: '一瓶優酪乳', options: [30, 60, 120], correct: 60 },
  { name: '一盒洗選蛋 (10顆)', options: [40, 80, 160], correct: 80 },
  { name: '一包白米 (2kg)', options: [125, 250, 500], correct: 250 },
  { name: '一瓶醬油', options: [40, 80, 160], correct: 80 },
  { name: '一包鹽', options: [10, 20, 40], correct: 20 },
  { name: '一包特級砂糖', options: [20, 40, 80], correct: 40 },
  { name: '一瓶沙拉油', options: [75, 150, 300], correct: 150 },
  { name: '一罐鮪魚罐頭', options: [25, 50, 100], correct: 50 },
  { name: '一罐玉米罐頭', options: [20, 40, 80], correct: 40 }
];

const ADVANCED_ITEMS = [
  { name: '一台 125cc 機車', options: [20000, 80000, 250000], correct: 80000 },
  { name: '一支最新款 iPhone', options: [15000, 35000, 80000], correct: 35000 },
  { name: '一個月份的健保費 (一般人)', options: [200, 826, 3500], correct: 826 },
  { name: '搭高鐵從台北到高雄 (對號座)', options: [800, 1490, 2500], correct: 1490 },
  { name: '看一次一般感冒的掛號費', options: [50, 200, 800], correct: 200 },
  { name: '一台 50吋 4K 電視', options: [3000, 15000, 60000], correct: 15000 },
  { name: '一台 Gogoro 電動車', options: [30000, 70000, 150000], correct: 70000 },
  { name: '一個月份的國民年金', options: [500, 1186, 3000], correct: 1186 },
  { name: '一張台北到東京的來回機票 (廉航)', options: [3000, 8000, 25000], correct: 8000 },
  { name: '一台 Dyson 吸塵器', options: [5000, 15000, 40000], correct: 15000 },
  { name: '一台 PS5 遊戲機', options: [8000, 17500, 35000], correct: 17500 },
  { name: '一晚五星級飯店雙人房', options: [2000, 6000, 20000], correct: 6000 },
  { name: '一個月份的 Netflix 高級方案', options: [150, 390, 800], correct: 390 },
  { name: '配一副普通的近視眼鏡', options: [500, 2500, 10000], correct: 2500 },
  { name: '一台國產小轎車', options: [300000, 700000, 1500000], correct: 700000 },
  { name: '一台進口豪華休旅車', options: [800000, 2500000, 6000000], correct: 2500000 },
  { name: '一個月的台北市套房租金', options: [5000, 15000, 45000], correct: 15000 },
  { name: '一個月的手機吃到飽月租費', options: [199, 599, 1599], correct: 599 },
  { name: '一個月的家用網路費', options: [300, 899, 2500], correct: 899 },
  { name: '一個月的汽車停車位租金', options: [1000, 4000, 12000], correct: 4000 },
  { name: '一次汽車小保養', options: [1000, 3000, 8000], correct: 3000 },
  { name: '一條汽車輪胎', options: [1000, 3500, 10000], correct: 3500 },
  { name: '一次全身健康檢查', options: [3000, 15000, 50000], correct: 15000 },
  { name: '一顆植牙', options: [20000, 70000, 150000], correct: 70000 },
  { name: '一次洗牙掛號費', options: [50, 150, 500], correct: 150 },
  { name: '一次心理諮商 (一小時)', options: [500, 2500, 8000], correct: 2500 },
  { name: '一個月的連鎖健身房會費', options: [400, 1200, 3500], correct: 1200 },
  { name: '一堂一對一健身教練課', options: [500, 1500, 4000], correct: 1500 },
  { name: '一台 MacBook Pro', options: [20000, 60000, 150000], correct: 60000 },
  { name: '一台 iPad Air', options: [8000, 20000, 45000], correct: 20000 },
  { name: '一副 AirPods Pro', options: [2500, 7490, 15000], correct: 7490 },
  { name: '一支 Apple Watch', options: [4000, 13000, 30000], correct: 13000 },
  { name: '一台任天堂 Switch', options: [3000, 9000, 20000], correct: 9000 },
  { name: '一款 Switch 遊戲片', options: [500, 1500, 3500], correct: 1500 },
  { name: '一台雙門冰箱', options: [8000, 25000, 80000], correct: 25000 },
  { name: '一台滾筒洗衣機', options: [10000, 30000, 90000], correct: 30000 },
  { name: '一台分離式冷氣機', options: [12000, 35000, 100000], correct: 35000 },
  { name: '一台除濕機', options: [2500, 8000, 25000], correct: 8000 },
  { name: '一台空氣清淨機', options: [4000, 12000, 35000], correct: 12000 },
  { name: '一台微波爐', options: [1000, 3000, 9000], correct: 3000 },
  { name: '一台烤箱', options: [600, 2000, 6000], correct: 2000 },
  { name: '一台氣炸鍋', options: [1200, 3500, 10000], correct: 3500 },
  { name: '一場熱門演唱會門票', options: [1200, 3800, 12000], correct: 3800 },
  { name: '一張電影票', options: [150, 320, 800], correct: 320 },
  { name: '一個月的 Spotify 訂閱費', options: [50, 149, 450], correct: 149 },
  { name: '一個月的 YouTube Premium', options: [60, 199, 500], correct: 199 },
  { name: '一次國內兩天一夜旅遊', options: [1500, 5000, 15000], correct: 5000 },
  { name: '一次日本五天四夜跟團', options: [15000, 40000, 100000], correct: 40000 },
  { name: '一次歐洲十天跟團', options: [40000, 120000, 300000], correct: 120000 },
  { name: '一個名牌精品包', options: [25000, 80000, 250000], correct: 80000 }
];

const PriceEstimationGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const items = isAdvanced ? ADVANCED_ITEMS : NORMAL_ITEMS;
  
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<number[]>([]);
  const TOTAL_ROUNDS = 10;

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const generateWideOptions = (correctPrice: number) => {
    // Widen the gap significantly
    const lowPrice = Math.max(1, Math.floor(correctPrice * (Math.random() * 0.2 + 0.1))); // 10% to 30%
    const highPrice = Math.floor(correctPrice * (Math.random() * 3 + 3)); // 300% to 600%
    const options = [lowPrice, correctPrice, highPrice];
    return options.sort(() => Math.random() - 0.5);
  };

  const initGame = () => {
    const firstIndex = Math.floor(Math.random() * items.length);
    setCurrentItemIndex(firstIndex);
    setSelectedOption(null);
    setIsCorrect(null);
    setRound(1);
    setScore(0);
    setCorrectCount(0);
    setUsedIndices([firstIndex]);
    setIsComplete(false);
    setCurrentOptions(generateWideOptions(items[firstIndex].correct));
    setRoundStartTime(Date.now());
  };

  const handleNext = () => {
    if (round >= TOTAL_ROUNDS) {
      setIsComplete(true);
      soundService.playWin();
      return;
    }

    let nextIndex = Math.floor(Math.random() * items.length);
    while (usedIndices.includes(nextIndex) && usedIndices.length < items.length) {
      nextIndex = Math.floor(Math.random() * items.length);
    }
    
    setCurrentItemIndex(nextIndex);
    setSelectedOption(null);
    setIsCorrect(null);
    setRound(prev => prev + 1);
    setUsedIndices(prev => [...prev, nextIndex]);
    setCurrentOptions(generateWideOptions(items[nextIndex].correct));
    setRoundStartTime(Date.now());
  };

  const handleOptionClick = (price: number) => {
    if (selectedOption !== null || isComplete) return; // Already answered

    setSelectedOption(price);
    const correct = price === items[currentItemIndex].correct;
    setIsCorrect(correct);

    if (correct) {
      const timeTaken = (Date.now() - roundStartTime) / 1000;
      const roundScore = Math.max(10, 100 - Math.floor(timeTaken) * 2);
      setScore(prev => prev + roundScore);
      setCorrectCount(prev => prev + 1);
      soundService.playWin();
    } else {
      soundService.playWrong();
    }
  };

  const currentItem = items[currentItemIndex];

  return (
    <div className={`flex flex-col h-[100dvh] ${isAdvanced ? 'bg-indigo-50' : 'bg-emerald-50'} overflow-hidden`}>
      <div className="flex-none p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${isAdvanced ? 'text-indigo-800' : 'text-emerald-800'}`}>價格估算</h2>
          <p className="text-xs text-gray-500">{isAdvanced ? '高單價與生活規費' : '日常用品與小吃'}</p>
        </div>
        <button onClick={initGame} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto w-full">
        
        {/* Stats Bar */}
        <div className="w-full max-w-4xl flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm mb-4 border border-gray-100">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
            <Timer className="text-blue-500" />
            第 {round} / {TOTAL_ROUNDS} 關
          </div>
          <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
            <Trophy className="text-yellow-500" />
            分數: {score}
          </div>
        </div>

        {isComplete ? (
          <div className="mb-4 animate-bounce-in flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg border-4 border-green-200 w-full max-w-2xl mt-12">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            <h3 className="text-3xl font-bold text-green-600 mb-4">挑戰完成！</h3>
            <p className="text-2xl text-gray-700 font-bold mb-2">答對題數：{correctCount} / {TOTAL_ROUNDS} 題</p>
            <p className="text-2xl text-gray-700 font-bold">總得分：{score} 分</p>
          </div>
        ) : (
          <div className="flex flex-col landscape:flex-row lg:flex-col items-center justify-center gap-4 lg:gap-12 w-full">
            <div className="flex-1 flex flex-col items-center w-full">
              <div className="bg-white p-6 landscape:p-4 lg:p-12 rounded-3xl shadow-xl border-4 border-gray-100 w-full max-w-2xl text-center mb-4 lg:mb-12">
                <h3 className="text-xl landscape:text-lg lg:text-3xl text-gray-500 font-medium mb-2 lg:mb-6">請問這個大約多少錢？</h3>
                <div className="text-3xl landscape:text-2xl lg:text-5xl font-bold text-gray-800 leading-tight">
                  {currentItem.name}
                </div>
              </div>
              {selectedOption !== null && (
                <button 
                  onClick={handleNext}
                  className="hidden landscape:block lg:hidden mt-2 px-8 py-3 bg-blue-500 text-white rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 active:scale-95 transition-all animate-fade-in"
                >
                  {round >= TOTAL_ROUNDS ? '看結果' : '下一題'}
                </button>
              )}
            </div>

            <div className="flex-1 w-full flex flex-col items-center">
              <div className="grid grid-cols-1 landscape:grid-cols-1 lg:grid-cols-3 gap-3 landscape:gap-2 lg:gap-6 w-full max-w-4xl">
                {currentOptions.map((price, idx) => {
                  const isSelected = selectedOption === price;
                  const isActuallyCorrect = price === currentItem.correct;
                  
                  let btnClass = "bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300";
                  if (selectedOption !== null) {
                    if (isActuallyCorrect) {
                      btnClass = "bg-green-100 border-green-500 text-green-800 ring-4 ring-green-200 scale-105";
                    } else if (isSelected) {
                      btnClass = "bg-red-100 border-red-500 text-red-800 opacity-70";
                    } else {
                      btnClass = "bg-gray-50 border-gray-200 text-gray-400 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(price)}
                      disabled={selectedOption !== null}
                      className={`
                        relative py-4 landscape:py-3 lg:py-8 px-4 rounded-2xl border-4 shadow-md font-bold text-2xl landscape:text-xl lg:text-4xl transition-all duration-300
                        ${btnClass}
                      `}
                    >
                      ${price.toLocaleString()}
                      
                      {selectedOption !== null && isActuallyCorrect && (
                        <CheckCircle2 className="absolute top-2 right-2 lg:top-4 lg:right-4 text-green-500 w-6 h-6 lg:w-10 lg:h-10" />
                      )}
                      {isSelected && !isActuallyCorrect && (
                        <XCircle className="absolute top-2 right-2 lg:top-4 lg:right-4 text-red-500 w-6 h-6 lg:w-10 lg:h-10" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <button 
                  onClick={handleNext}
                  className="block landscape:hidden lg:block mt-8 lg:mt-16 px-12 py-4 bg-blue-500 text-white rounded-full font-bold text-2xl shadow-lg hover:bg-blue-600 active:scale-95 transition-all animate-fade-in"
                >
                  {round >= TOTAL_ROUNDS ? '看結果' : '下一題'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PriceEstimationGame;
