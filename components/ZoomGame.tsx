import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ZoomOut, Eye, CheckCircle2, XCircle, Timer, Trophy } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const NORMAL_ITEMS = [
  { emoji: '🐘', name: '大象' }, { emoji: '🍕', name: '披薩' }, { emoji: '🌻', name: '向日葵' }, { emoji: '🚲', name: '腳踏車' }, { emoji: '🍎', name: '蘋果' },
  { emoji: '🐢', name: '烏龜' }, { emoji: '🎸', name: '吉他' }, { emoji: '🍔', name: '漢堡' }, { emoji: '🚗', name: '汽車' }, { emoji: '⚽', name: '足球' },
  { emoji: '📱', name: '手機' }, { emoji: '⌚', name: '手錶' }, { emoji: '👟', name: '鞋子' }, { emoji: '✂️', name: '剪刀' }, { emoji: '🔑', name: '鑰匙' },
  { emoji: '☂️', name: '雨傘' }, { emoji: '☕', name: '咖啡' }, { emoji: '🎁', name: '禮物' }, { emoji: '🍉', name: '西瓜' }, { emoji: '🦋', name: '蝴蝶' },
  { emoji: '🐶', name: '狗' }, { emoji: '🐱', name: '貓' }, { emoji: '🐭', name: '老鼠' }, { emoji: '🐰', name: '兔子' }, { emoji: '🐻', name: '熊' },
  { emoji: '🐼', name: '熊貓' }, { emoji: '🐯', name: '老虎' }, { emoji: '🦁', name: '獅子' }, { emoji: '🐮', name: '牛' }, { emoji: '🐷', name: '豬' },
  { emoji: '🐸', name: '青蛙' }, { emoji: '🐵', name: '猴子' }, { emoji: '🐔', name: '雞' }, { emoji: '🐧', name: '企鵝' }, { emoji: '🦉', name: '貓頭鷹' },
  { emoji: '🐴', name: '馬' }, { emoji: '🦄', name: '獨角獸' }, { emoji: '🐝', name: '蜜蜂' }, { emoji: '🐛', name: '毛毛蟲' }, { emoji: '🐌', name: '蝸牛' },
  { emoji: '🍓', name: '草莓' }, { emoji: '🍒', name: '櫻桃' }, { emoji: '🍑', name: '桃子' }, { emoji: '🍍', name: '鳳梨' }, { emoji: '🥝', name: '奇異果' },
  { emoji: '🍅', name: '番茄' }, { emoji: '🍆', name: '茄子' }, { emoji: '🌽', name: '玉米' }, { emoji: '🥕', name: '胡蘿蔔' }, { emoji: '🥦', name: '花椰菜' }
];

const ADVANCED_ITEMS = [
  { emoji: '🚁', name: '直升機' }, { emoji: '🏰', name: '城堡' }, { emoji: '🚀', name: '火箭' }, { emoji: '🗽', name: '自由女神' }, { emoji: '🌋', name: '火山' },
  { emoji: '🎡', name: '摩天輪' }, { emoji: '🔬', name: '顯微鏡' }, { emoji: '🗿', name: '摩艾石像' }, { emoji: '🗼', name: '東京鐵塔' }, { emoji: '🎢', name: '雲霄飛車' },
  { emoji: '🛰️', name: '人造衛星' }, { emoji: '🛸', name: '幽浮' }, { emoji: '🧬', name: 'DNA' }, { emoji: '🦠', name: '病毒' }, { emoji: '🧯', name: '滅火器' },
  { emoji: '🧭', name: '指南針' }, { emoji: '⚓', name: '船錨' }, { emoji: '🧯', name: '滅火器' }, { emoji: '💎', name: '鑽石' }, { emoji: '👑', name: '皇冠' },
  { emoji: '🔮', name: '水晶球' }, { emoji: '🎭', name: '面具' }, { emoji: '🎨', name: '調色盤' }, { emoji: '🎬', name: '打板' }, { emoji: '🎰', name: '吃角子老虎' },
  { emoji: '🛤️', name: '鐵軌' }, { emoji: '🛣️', name: '高速公路' }, { emoji: '🗺️', name: '世界地圖' }, { emoji: '🏔️', name: '雪山' }, { emoji: '🏕️', name: '露營帳篷' },
  { emoji: '🏖️', name: '沙灘傘' }, { emoji: '🏜️', name: '沙漠' }, { emoji: '🏝️', name: '荒島' }, { emoji: '🏞️', name: '國家公園' }, { emoji: '🔭', name: '望遠鏡' },
  { emoji: '📡', name: '衛星天線' }, { emoji: '💡', name: '燈泡' }, { emoji: '🔦', name: '手電筒' }, { emoji: '🏮', name: '燈籠' }, { emoji: '📓', name: '筆記本' },
  { emoji: '🧮', name: '算盤' }, { emoji: '🧰', name: '工具箱' }, { emoji: '🧲', name: '磁鐵' }, { emoji: '🧪', name: '試管' }, { emoji: '🧫', name: '培養皿' },
  { emoji: '🩺', name: '聽診器' }, { emoji: '💉', name: '注射器' }, { emoji: '💊', name: '藥丸' }, { emoji: '🌡️', name: '溫度計' }, { emoji: '♿', name: '輪椅' }
];

const ZoomGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const items = isAdvanced ? ADVANCED_ITEMS : NORMAL_ITEMS;
  
  const [currentItem, setCurrentItem] = useState(items[0]);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isRevealed, setIsRevealed] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const TOTAL_ROUNDS = 10;

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const initGame = () => {
    const firstIndex = Math.floor(Math.random() * items.length);
    setCurrentItem(items[firstIndex]);
    setZoomLevel(isAdvanced ? 8 : 5);
    setIsRevealed(false);
    setRound(1);
    setScore(0);
    setCorrectCount(0);
    setUsedIndices([firstIndex]);
    setIsComplete(false);
    setRoundStartTime(Date.now());
  };

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setIsComplete(true);
      soundService.playWin();
      return;
    }

    let nextIndex = Math.floor(Math.random() * items.length);
    while (usedIndices.includes(nextIndex) && usedIndices.length < items.length) {
      nextIndex = Math.floor(Math.random() * items.length);
    }
    
    setCurrentItem(items[nextIndex]);
    setZoomLevel(isAdvanced ? 8 : 5);
    setIsRevealed(false);
    setRound(prev => prev + 1);
    setUsedIndices(prev => [...prev, nextIndex]);
    setRoundStartTime(Date.now());
  };

  const handleCorrect = () => {
    const timeTaken = (Date.now() - roundStartTime) / 1000;
    const roundScore = Math.max(10, 100 - Math.floor(timeTaken) * 2);
    setScore(prev => prev + roundScore);
    setCorrectCount(prev => prev + 1);
    soundService.playWin();
    nextRound();
  };

  const handleWrong = () => {
    soundService.playWrong();
    nextRound();
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => Math.max(1, prev - (isAdvanced ? 1.5 : 1)));
      soundService.playGameSound('LOW');
    }
  };

  const handleReveal = () => {
    setZoomLevel(1);
    setIsRevealed(true);
    soundService.playWin();
  };

  return (
    <div className={`flex flex-col h-[100dvh] ${isAdvanced ? 'bg-indigo-50' : 'bg-emerald-50'} overflow-hidden`}>
      <div className="flex-none p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${isAdvanced ? 'text-indigo-800' : 'text-emerald-800'}`}>局部猜全貌</h2>
          <p className="text-xs text-gray-500">{isAdvanced ? '超高倍率放大' : '局部放大猜謎'}</p>
        </div>
        <button onClick={initGame} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto w-full">
        
        {/* Stats Bar */}
        <div className="w-full max-w-2xl flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm mb-4 border border-gray-100">
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
            <p className="text-2xl text-gray-700 font-bold mb-2">總得分：{score} 分</p>
            <p className="text-xl text-gray-600 font-bold">答對題數：{correctCount} / {TOTAL_ROUNDS} 題</p>
          </div>
        ) : (
          <div className="flex flex-col landscape:flex-row lg:flex-col items-center justify-center gap-4 lg:gap-8 w-full">
            <div className="relative w-64 h-64 landscape:w-40 landscape:h-40 lg:w-80 lg:h-80 bg-white rounded-3xl shadow-xl overflow-hidden flex items-center justify-center border-4 border-gray-200 mb-4 lg:mb-8 flex-shrink-0">
              <div 
                className="text-[150px] landscape:text-[100px] lg:text-[200px] leading-none"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transition: zoomLevel === (isAdvanced ? 8 : 5) ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                {currentItem.emoji}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              {isRevealed && (
                <div className="text-3xl landscape:text-2xl lg:text-4xl font-bold text-gray-800 mb-2 lg:mb-8 animate-bounce-in">
                  {currentItem.name}
                </div>
              )}

              <div className="flex gap-2 lg:gap-4">
                {!isRevealed ? (
                  <>
                    <button 
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 1}
                      className={`flex items-center gap-2 px-6 py-3 landscape:px-4 landscape:py-2 rounded-full font-bold text-lg landscape:text-base lg:text-lg transition-all ${zoomLevel <= 1 ? 'bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md active:scale-95'}`}
                    >
                      <ZoomOut size={24} className="landscape:w-5 landscape:h-5" />
                      縮小一點
                    </button>
                    
                    <button 
                      onClick={handleReveal}
                      className="flex items-center gap-2 px-6 py-3 landscape:px-4 landscape:py-2 rounded-full font-bold text-lg landscape:text-base lg:text-lg transition-all bg-green-500 text-white hover:bg-green-600 shadow-md active:scale-95"
                    >
                      <Eye size={24} className="landscape:w-5 landscape:h-5" />
                      看答案
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleCorrect}
                      className="flex items-center gap-2 px-8 py-4 landscape:px-6 landscape:py-3 rounded-full font-bold text-xl landscape:text-lg lg:text-xl transition-all bg-green-500 text-white hover:bg-green-600 shadow-md active:scale-95 animate-fade-in"
                    >
                      <CheckCircle2 size={28} className="landscape:w-6 landscape:h-6" />
                      答對
                    </button>
                    
                    <button 
                      onClick={handleWrong}
                      className="flex items-center gap-2 px-8 py-4 landscape:px-6 landscape:py-3 rounded-full font-bold text-xl landscape:text-lg lg:text-xl transition-all bg-red-500 text-white hover:bg-red-600 shadow-md active:scale-95 animate-fade-in"
                    >
                      <XCircle size={28} className="landscape:w-6 landscape:h-6" />
                      答錯
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoomGame;
