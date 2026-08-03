import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

const TARGETS = [
  { emoji: '🐘', name: '大象' }, { emoji: '🦒', name: '長頸鹿' }, { emoji: '🦓', name: '斑馬' },
  { emoji: '🦅', name: '老鷹' }, { emoji: '🐢', name: '烏龜' }, { emoji: '🏯', name: '日本古城' },
  { emoji: '🗽', name: '自由女神' }, { emoji: '🗼', name: '東京鐵塔' }, { emoji: '🏰', name: '城堡' },
  { emoji: '🎡', name: '摩天輪' }, { emoji: '🌋', name: '火山' }, { emoji: '🏕️', name: '露營帳篷' },
  { emoji: '🚑', name: '救護車' }, { emoji: '🚁', name: '直升機' }, { emoji: '🍎', name: '蘋果' },
  { emoji: '🍉', name: '西瓜' }, { emoji: '🌻', name: '向日葵' }, { emoji: '🎸', name: '吉他' },
  { emoji: '🐼', name: '熊貓' }, { emoji: '🐨', name: '無尾熊' }, { emoji: '🐧', name: '企鵝' },
  { emoji: '🐬', name: '海豚' }, { emoji: '🐙', name: '章魚' }, { emoji: '🦋', name: '蝴蝶' },
  { emoji: '🚀', name: '火箭' }, { emoji: '🚢', name: '船' }, { emoji: '🚂', name: '火車' },
  { emoji: '🚲', name: '腳踏車' }, { emoji: '🍕', name: '披薩' }, { emoji: '🍔', name: '漢堡' },
  { emoji: '🍩', name: '甜甜圈' }, { emoji: '🍦', name: '冰淇淋' }, { emoji: '⚽', name: '足球' },
  { emoji: '🏀', name: '籃球' }, { emoji: '🎾', name: '網球' }, { emoji: '🏆', name: '獎盃' },
  { emoji: '⌚', name: '手錶' }, { emoji: '📱', name: '手機' }, { emoji: '💻', name: '電腦' },
  { emoji: '📷', name: '相機' }, { emoji: '🏠', name: '房子' }, { emoji: '🏫', name: '學校' },
  { emoji: '🦁', name: '獅子' }, { emoji: '🐯', name: '老虎' }, { emoji: '🐒', name: '猴子' },
  { emoji: '🐺', name: '狼' }, { emoji: '🐻', name: '熊' }, { emoji: '🐸', name: '青蛙' },
  { emoji: '🐍', name: '蛇' }, { emoji: '🐎', name: '馬' }, { emoji: '🐄', name: '牛' },
  { emoji: '🐖', name: '豬' }, { emoji: '🐑', name: '羊' }, { emoji: '🐔', name: '雞' },
  { emoji: '🦆', name: '鴨子' }, { emoji: '🦉', name: '貓頭鷹' }, { emoji: '🦇', name: '蝙蝠' },
  { emoji: '🐝', name: '蜜蜂' }, { emoji: '🐛', name: '毛毛蟲' }, { emoji: '🐌', name: '蝸牛' },
  { emoji: '🐞', name: '瓢蟲' }, { emoji: '🐜', name: '螞蟻' }, { emoji: '🦟', name: '蚊子' },
  { emoji: '🚗', name: '汽車' }, { emoji: '🚕', name: '計程車' }, { emoji: '🚙', name: '休旅車' },
  { emoji: '🚌', name: '公車' }, { emoji: '🚎', name: '無軌電車' }, { emoji: '🏎️', name: '賽車' },
  { emoji: '🚓', name: '警車' }, { emoji: '🚒', name: '消防車' }, { emoji: '🚜', name: '拖拉機' },
  { emoji: '🛴', name: '滑板車' }, { emoji: '🛵', name: '機車' }, { emoji: '✈️', name: '飛機' },
  { emoji: '🛸', name: '幽浮' }, { emoji: '🛰️', name: '衛星' }, { emoji: '🚤', name: '快艇' },
  { emoji: '🍇', name: '葡萄' }, { emoji: '🍈', name: '哈密瓜' }, { emoji: '🍊', name: '橘子' },
  { emoji: '🍋', name: '檸檬' }, { emoji: '🍌', name: '香蕉' }, { emoji: '🍍', name: '鳳梨' },
  { emoji: '🥭', name: '芒果' }, { emoji: '🍓', name: '草莓' }, { emoji: '🍒', name: '櫻桃' },
  { emoji: '🍑', name: '桃子' }, { emoji: '🍐', name: '梨子' }, { emoji: '🍏', name: '青蘋果' },
  { emoji: '🍅', name: '番茄' }, { emoji: '🥥', name: '椰子' }, { emoji: '🥝', name: '奇異果' },
];

const RevealPictureGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const gridSize = isAdvanced ? 4 : 3;
  const numTiles = gridSize * gridSize;
  
  const [gameTargets, setGameTargets] = useState<typeof TARGETS>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const [target, setTarget] = useState(() => TARGETS[Math.floor(Math.random() * TARGETS.length)]);
  const [revealed, setRevealed] = useState<boolean[]>(Array(numTiles).fill(false));
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const [isPeek, setIsPeek] = useState(false);

  const revealedCount = revealed.filter(r => r).length;
  const isAllRevealed = revealedCount === numTiles || isDone || isPeek;

  React.useEffect(() => {
      startGame();
  }, [isAdvanced]);

  const startGame = () => {
      const shuffled = [...TARGETS].sort(() => Math.random() - 0.5).slice(0, 10);
      setGameTargets(shuffled);
      setRoundIndex(0);
      setTotalScore(0);
      setGameOver(false);
      setTarget(shuffled[0]);
      setRevealed(Array(numTiles).fill(false));
      setIsDone(false);
      setIsPeek(false);
      setScore(0);
  };

  const handleTileClick = (index: number) => {
    if (revealed[index] || isDone || isPeek) return;
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    soundService.playTone(300 + index * 50, 'sine', 0.1);
  };

  const handleGuess = (correct: boolean) => {
      setIsDone(true);
      if (correct) {
          // Calculate score based on tiles NOT revealed. Max points for fewer reveals.
          const unrevealedCount = numTiles - revealedCount;
          const points = Math.max(10, unrevealedCount * 10);
          setScore(points);
          setTotalScore(prev => prev + points);
          soundService.playWin();
      } else {
          setScore(0);
          soundService.playWrong();
      }
  };

  const handleNextRound = () => {
    if (roundIndex >= 9) {
        setGameOver(true);
        return;
    }
    
    setRevealed(Array(numTiles).fill(false));
    setIsDone(false);
    setIsPeek(false);
    setScore(0);
    // Wait for fade out transition before changing image
    setTimeout(() => {
        const nextIdx = roundIndex + 1;
        setRoundIndex(nextIdx);
        setTarget(gameTargets[nextIdx]);
    }, 500);
  };

  const handleRevealAll = () => {
      setIsPeek(true);
      soundService.playTone(300, 'sine', 0.1);
  };

  if (gameOver) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-emerald-50 p-4">
              <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center animate-fade-in-up border-4 border-emerald-100 max-w-sm w-full">
                  <div className="text-6xl mb-4 animate-bounce">🏆</div>
                  <h2 className="text-3xl font-bold text-emerald-900 mb-2">測驗完成！</h2>
                  <p className="text-xl text-emerald-700 mb-6 font-bold flex flex-col gap-2">
                      <span>10題 總得分:</span>
                      <span className="text-4xl text-emerald-600">{totalScore}</span>
                  </p>
                  <button 
                      onClick={startGame}
                      className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-md text-lg active:scale-95"
                  >
                      <RefreshCw size={20} className="inline mr-2" /> 重新挑戰
                  </button>
                  <button 
                      onClick={onBack}
                      className="w-full mt-3 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-sm text-lg active:scale-95"
                  >
                      返回選單
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-emerald-50 p-2 sm:p-4">
      <button 
        onClick={onBack}
        className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md text-emerald-600 hover:bg-emerald-100 z-50 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="absolute top-4 right-4 text-emerald-800 font-bold text-lg sm:text-xl bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100">
          題數: {roundIndex + 1} / 10
      </div>

      <div className="w-full h-full max-w-7xl flex flex-row items-center justify-center gap-2 sm:gap-6 py-2 px-1 sm:px-8 mt-12 sm:mt-0">
          
          {/* Grid / Image Container */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <div className="relative w-full max-w-[85vw] sm:max-w-[75vh] aspect-square bg-white rounded-xl shadow-xl border-4 sm:border-8 border-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
                  {/* The Hidden Image */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 overflow-hidden">
                      <span className="text-[50vw] sm:text-[45vh] leading-none drop-shadow-2xl">{target.emoji}</span>
                  </div>

                  {/* The Grid Overlay */}
                  <div 
                    className={`absolute inset-0 grid gap-0 transition-colors duration-1000 bg-transparent ${isAllRevealed ? 'pointer-events-none' : ''}`}
                    style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                  >
                      {revealed.map((isRevealed, idx) => (
                          <button
                              key={idx}
                              onClick={() => handleTileClick(idx)}
                              className={`flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 transition-all duration-500 shadow-[inset_0_0_0_1px_rgba(4,120,87,0.5)] ${isRevealed || isDone || isPeek ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
                          >
                              <span className={`${isAdvanced ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl'} font-bold text-white drop-shadow-md`}>{idx + 1}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
          
          {/* Right Sidebar for Answer and Score */}
          <div className="w-28 sm:w-64 flex flex-col justify-center shrink-0">
              {(!isDone) ? (
                  <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-md border border-emerald-100 flex flex-col gap-2">
                      {!isPeek ? (
                          <button 
                              onClick={handleRevealAll}
                              className="w-full py-4 sm:py-6 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors shadow-sm text-base sm:text-xl active:scale-95 flex items-center justify-center gap-2"
                          >
                              <ImageIcon size={24} /> 揭曉答案
                          </button>
                      ) : (
                          <div className="flex flex-col gap-2 sm:gap-3 animate-fade-in">
                              <div className="text-center mb-1 sm:mb-2 border-b border-emerald-50 pb-2">
                                  <span className="text-xl sm:text-3xl font-bold text-emerald-900 drop-shadow-sm">{target.name}</span>
                              </div>
                              <button 
                                  onClick={() => handleGuess(true)}
                                  className="w-full py-3 sm:py-5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-sm text-base sm:text-xl active:scale-95"
                              >
                                  答對
                              </button>
                              <button 
                                  onClick={() => handleGuess(false)}
                                  className="w-full py-3 sm:py-5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm text-base sm:text-xl active:scale-95"
                              >
                                  答錯
                              </button>
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-md border border-emerald-100 flex flex-col items-center text-center gap-2 sm:gap-4 animate-fade-in">
                      <span className="text-xl sm:text-3xl font-bold text-emerald-900 mb-1 drop-shadow-sm leading-tight">
                          {target.name}
                      </span>
                      <span className={`text-lg sm:text-2xl font-bold ${score > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          得分: {score}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 font-bold">
                          翻開: {revealedCount} 塊
                      </span>
                      <button 
                          onClick={handleNextRound}
                          className="mt-2 sm:mt-4 w-full py-3 sm:py-4 bg-emerald-500 text-white rounded-xl font-bold flex justify-center items-center gap-1 sm:gap-2 hover:bg-emerald-600 shadow-md active:scale-95 transition-transform text-base sm:text-xl"
                      >
                          <RefreshCw size={20} /> {roundIndex >= 9 ? '結算分數' : '下一題'}
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default RevealPictureGame;
