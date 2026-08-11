import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';
import { NORMAL_IDIOMS, ADVANCED_IDIOMS, IdiomItem } from '../data/idiomsData';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

const WordTileGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const idiomPool = isAdvanced ? ADVANCED_IDIOMS : NORMAL_IDIOMS;

  const [currentIdiom, setCurrentIdiom] = useState<IdiomItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [placed, setPlaced] = useState<(string | null)[]>([null, null, null, null]);
  const [isWin, setIsWin] = useState(false);
  const [hasGuessed, setHasGuessed] = useState(false);

  const [roundIndex, setRoundIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [gameIdioms, setGameIdioms] = useState<IdiomItem[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  const startGame = useCallback(() => {
    let available = idiomPool.filter(item => !usedWords.includes(item.word));
    if (available.length < 10) {
      available = [...idiomPool];
      setUsedWords([]);
    }

    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 10);
    setGameIdioms(shuffled);
    setUsedWords(prev => [...prev, ...shuffled.map(s => s.word)]);

    setRoundIndex(0);
    setTotalScore(0);
    setGameOver(false);
    startRound(shuffled[0]);
  }, [idiomPool, usedWords]);

  const startRound = (idiomObj: IdiomItem) => {
      setCurrentIdiom(idiomObj);
      const chars = idiomObj.word.split('').sort(() => 0.5 - Math.random());
      setOptions(chars);
      setPlaced([null, null, null, null]);
      setIsWin(false);
      setHasGuessed(false);
      setTime(0);
      setIsActive(true);
  };

  useEffect(() => {
      startGame();
  }, [isAdvanced]);

  useEffect(() => {
      let interval: any = null;
      if (isActive && !isWin) {
          interval = setInterval(() => {
              setTime(t => t + 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isActive, isWin]);

  const handleNextRound = () => {
      if (roundIndex >= 9) {
          setGameOver(true);
          return;
      }
      const nextIdx = roundIndex + 1;
      setRoundIndex(nextIdx);
      startRound(gameIdioms[nextIdx]);
  };

  const handleSelectOption = (char: string, index: number) => {
      if (isWin) return;
      
      const emptyIndex = placed.indexOf(null);
      if (emptyIndex === -1) return; // Full

      const newPlaced = [...placed];
      newPlaced[emptyIndex] = char;
      setPlaced(newPlaced);

      const newOptions = [...options];
      newOptions[index] = ''; // Mark as used
      setOptions(newOptions);
      soundService.playTone(400 + emptyIndex * 100, 'sine', 0.1);

      // Check win condition
      if (newPlaced.join('') === currentIdiom?.word) {
          setIsWin(true);
          setHasGuessed(true);
          setIsActive(false);
          const points = Math.max(10, 100 - time * 2);
          setTotalScore(prev => prev + points);
          soundService.playWin();
      } else if (newPlaced.every(c => c !== null)) {
          // Full but wrong
          setHasGuessed(true);
          soundService.playWrong();
      }
  };

  const handleRemovePlaced = (index: number) => {
      if (isWin || placed[index] === null) return;
      const char = placed[index]!;
      
      const newPlaced = [...placed];
      newPlaced[index] = null;
      setPlaced(newPlaced);

      const newOptions = [...options];
      const emptyOptIndex = newOptions.indexOf('');
      if (emptyOptIndex !== -1) {
          newOptions[emptyOptIndex] = char;
      }
      setOptions(newOptions);
      soundService.playTone(300, 'triangle', 0.1);
  };

  if (gameOver) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-orange-50 p-4">
              <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center animate-fade-in-up border-4 border-orange-100 max-w-sm w-full">
                  <div className="text-6xl mb-4 animate-bounce">🏆</div>
                  <h2 className="text-3xl font-bold text-orange-900 mb-2">測驗完成！</h2>
                  <p className="text-xl text-orange-700 mb-6 font-bold flex flex-col gap-2">
                      <span>10題 總得分:</span>
                      <span className="text-4xl text-orange-600">{totalScore}</span>
                  </p>
                  <button 
                      onClick={startGame}
                      className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md text-lg active:scale-95"
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
    <div className="flex flex-col items-center justify-between h-[100dvh] max-h-[100dvh] bg-orange-50 p-1 sm:p-4 overflow-hidden relative">
      <button 
        onClick={onBack}
        className="absolute top-1.5 left-1.5 p-1.5 sm:p-2 bg-white rounded-full shadow-md text-orange-600 hover:bg-orange-100 z-50 transition-colors"
      >
        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
      </button>

      <div className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2 z-10">
          <div className="text-orange-800 font-bold text-xs sm:text-lg bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-xl shadow-sm border border-orange-100 flex items-center">
              {isAdvanced ? '進階模式' : '一般模式'} | {roundIndex + 1} / 10 題
          </div>
          <button 
              onClick={() => setShowRules(true)}
              className="p-1 sm:p-2 bg-white text-orange-600 rounded-xl shadow-sm border border-orange-100 hover:bg-orange-50 transition-colors active:scale-95 flex items-center justify-center"
              title="遊戲規則"
          >
              <HelpCircle size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
      </div>

      <RulesModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)}
          rules={[
              "選出下方打亂的字，將它們填入正確的空格中，拼湊成一個完整的成語。",
              "點擊已填入的字可以取消選擇。",
              "越快完成拼圖，獲得的分數越高！",
              "每次測驗共有 10 題，題庫擴充至 300 題且不重複！"
          ]}
      />

      <div className="w-full max-w-5xl flex flex-col items-center justify-center my-auto py-0">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-900 mb-1 sm:mb-4 hidden sm:block">成語接龍拼圖</h2>
          
          {/* Target Slots */}
          <div className="flex gap-2 sm:gap-4 mb-1 sm:mb-4 mt-0.5 shrink-0">
              {placed.map((char, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleRemovePlaced(idx)}
                    disabled={char === null || isWin}
                    className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-bold shadow-md border-2 sm:border-4 transition-all duration-300 ${
                        char === null 
                            ? 'bg-white border-dashed border-orange-300 text-orange-800'
                            : isWin 
                                ? 'bg-green-100 border-green-500 text-green-700 scale-105 shadow-green-200 cursor-default'
                                : hasGuessed && currentIdiom
                                    ? char === currentIdiom.word[idx]
                                        ? 'bg-green-100 border-green-400 text-green-700'
                                        : 'bg-red-100 border-red-400 text-red-700 hover:bg-red-50 animate-shake'
                                    : 'bg-gradient-to-b from-orange-100 to-orange-200 border-orange-400 text-orange-900 hover:bg-orange-50'
                    }`}
                  >
                      {char}
                  </button>
              ))}
          </div>

          {/* Bottom Area */}
          <div className="min-h-[100px] sm:min-h-[200px] w-full flex items-center justify-center shrink-0">
              {!isWin ? (
                  <div className="flex gap-2.5 sm:gap-6 animate-fade-in-up">
                      {options.map((opt, idx) => (
                          <button
                              key={idx}
                              onClick={() => handleSelectOption(opt, idx)}
                              disabled={!opt}
                              className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-white rounded-2xl shadow-md border-2 border-orange-200 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-orange-700 hover:bg-orange-50 hover:scale-105 hover:border-orange-400 transition-all active:scale-95 ${!opt ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}`}
                          >
                              {opt}
                          </button>
                      ))}
                  </div>
              ) : (
                  <div className="relative flex flex-col items-center animate-fade-in-up w-full px-2 sm:px-4 justify-center">
                      {/* Score display overlaying top edge of container without taking up vertical flow space */}
                      <div className="absolute -top-3.5 sm:-top-5 left-1/2 -translate-x-1/2 z-20 bg-white px-3 sm:px-6 py-0.5 sm:py-1.5 rounded-full shadow-lg border-2 border-orange-300 text-orange-600 font-extrabold text-xs sm:text-base md:text-lg flex items-center gap-1 sm:gap-1.5 animate-bounce pointer-events-none whitespace-nowrap">
                          <span>🎉 解答正確！獲得：</span>
                          <span className="text-orange-700 text-xs sm:text-xl font-black">{Math.max(10, 100 - time * 2)}</span>
                          <span>分</span>
                      </div>

                      <div className="flex flex-row items-stretch justify-center gap-2 sm:gap-4 w-full max-w-4xl pt-1.5 sm:pt-3">
                          {/* Text Box */}
                          <div className="bg-white rounded-2xl shadow-md border border-orange-200 p-2 sm:p-4 flex-1 overflow-y-auto max-h-[80px] sm:max-h-[160px] md:max-h-[200px]">
                              <h3 className="text-xs sm:text-xl font-bold text-orange-900 mb-0.5 sm:mb-1 border-b border-orange-100 pb-0.5 sm:pb-1">
                                  出處與釋義
                              </h3>
                              <p className="text-slate-700 font-bold mb-0.5 sm:mb-1 text-[11px] sm:text-base">
                                  <span className="text-orange-600 mr-1 sm:mr-1.5">【出處】</span>{currentIdiom?.origin}
                              </p>
                              <p className="text-slate-600 text-[11px] sm:text-sm leading-tight sm:leading-relaxed">
                                  <span className="text-orange-600 font-bold mr-1 sm:mr-1.5">【釋義】</span>{currentIdiom?.meaning}
                              </p>
                          </div>
                          
                          {/* Next Button */}
                          <button 
                              onClick={handleNextRound}
                              className="px-3 sm:px-8 bg-orange-500 text-white rounded-2xl font-bold text-sm sm:text-2xl hover:bg-orange-600 shadow-md flex flex-col items-center justify-center gap-1 sm:gap-2 transition-transform active:scale-95 shrink-0"
                          >
                              <RefreshCw size={18} className="sm:w-8 sm:h-8" />
                              <span className="whitespace-nowrap">{roundIndex >= 9 ? '結算分數' : '下一題'}</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default WordTileGame;
