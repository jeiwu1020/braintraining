import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, RefreshCw, Play, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HigherLowerGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

const SUITS = [
    { symbol: '♠️', name: '黑桃', value: 4, color: 'text-slate-800' },
    { symbol: '♥️', name: '紅心', value: 3, color: 'text-red-500' },
    { symbol: '♦️', name: '方塊', value: 2, color: 'text-red-500' },
    { symbol: '♣️', name: '梅花', value: 1, color: 'text-slate-800' }
];

interface CardData {
    value: number; // 1-13 for standard, 99 for joker
    suitSymbol: string;
    suitValue: number;
    color: string;
    display: string;
    absoluteValue: number;
    isJoker: boolean;
}

type Choice = 'HIGHER' | 'LOWER' | 'PASS' | null;

const HigherLowerGame: React.FC<HigherLowerGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const maxRounds = 10;

  const [deck, setDeck] = useState<CardData[]>([]);
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);
  const [previousCard, setPreviousCard] = useState<CardData | null>(null);
  const [round, setRound] = useState(1);
  const [gameState, setGameState] = useState<'BETTING' | 'REVEAL' | 'GAMEOVER'>('BETTING');
  
  const [teamAChoice, setTeamAChoice] = useState<Choice>(null);
  const [teamBChoice, setTeamBChoice] = useState<Choice>(null);

  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [roundResult, setRoundResult] = useState<{aMsg: string, bMsg: string, mainMsg: string}>({ aMsg: '', bMsg: '', mainMsg: '' });
  const [showRules, setShowRules] = useState(false);

  const generateDeck = (): CardData[] => {
      let newDeck: CardData[] = [];
      const maxVal = isAdvanced ? 13 : 10;
      
      for (let v = 1; v <= maxVal; v++) {
          for (const suit of SUITS) {
              let display = v.toString();
              if (isAdvanced) {
                  if (v === 1) display = 'A';
                  if (v === 11) display = 'J';
                  if (v === 12) display = 'Q';
                  if (v === 13) display = 'K';
              }
              newDeck.push({
                  value: v,
                  suitSymbol: suit.symbol,
                  suitValue: suit.value,
                  color: suit.color,
                  display,
                  absoluteValue: v * 10 + suit.value,
                  isJoker: false
              });
          }
      }

      if (isAdvanced) {
          // Add 2 Jokers
          newDeck.push({
              value: 99, suitSymbol: '🃏', suitValue: 5, color: 'text-purple-600', display: 'JOKER', absoluteValue: 999, isJoker: true
          });
          newDeck.push({
              value: 99, suitSymbol: '🃏', suitValue: 5, color: 'text-orange-500', display: 'JOKER', absoluteValue: 999, isJoker: true
          });
      }

      // Shuffle
      let shuffled = newDeck.sort(() => 0.5 - Math.random());
      
      if (isAdvanced) {
          // Guarantee at least one Joker in the first 11 drawn cards (last 11 elements)
          const last11 = shuffled.slice(-11);
          const hasJoker = last11.some(c => c.isJoker);
          if (!hasJoker) {
              const jokerIndex = shuffled.findIndex(c => c.isJoker);
              // Avoid index at length - 1 (the very first card)
              const swapIndex = shuffled.length - 11 + Math.floor(Math.random() * 10);
              const temp = shuffled[jokerIndex];
              shuffled[jokerIndex] = shuffled[swapIndex];
              shuffled[swapIndex] = temp;
          }
          // Make absolutely sure the very first card (last element) is NOT a Joker
          if (shuffled[shuffled.length - 1].isJoker) {
              const normalIndex = shuffled.findIndex(c => !c.isJoker);
              const temp = shuffled[normalIndex];
              shuffled[normalIndex] = shuffled[shuffled.length - 1];
              shuffled[shuffled.length - 1] = temp;
          }
      }
      return shuffled;
  };

  const initGame = () => {
      const newDeck = generateDeck();
      const firstCard = newDeck.pop()!;
      setDeck(newDeck);
      setCurrentCard(firstCard);
      setPreviousCard(null);
      setRound(1);
      setTeamAScore(0);
      setTeamBScore(0);
      setTeamAChoice(null);
      setTeamBChoice(null);
      setGameState('BETTING');
      setRoundResult({ aMsg: '', bMsg: '', mainMsg: '' });
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const handleReveal = () => {
      if (!currentCard || deck.length === 0) return;
      if (!teamAChoice || !teamBChoice) return;

      const newDeck = [...deck];
      let nextCard = newDeck.pop()!;
      let skippedCards: CardData[] = [];

      // Avoid drawing a card with the exact same number (unless it's a Joker)
      while (nextCard && !nextCard.isJoker && !currentCard.isJoker && nextCard.value === currentCard.value) {
          skippedCards.push(nextCard);
          nextCard = newDeck.pop()!;
      }

      if (!nextCard) {
          // Fallback if deck only had cards of the same number
          nextCard = skippedCards.pop()!;
      }

      // Put skipped cards back at the bottom of the deck
      if (skippedCards.length > 0) {
          newDeck.unshift(...skippedCards);
      }

      setDeck(newDeck);
      setPreviousCard(currentCard);
      setCurrentCard(nextCard);
      
      let aMsg = '';
      let bMsg = '';
      let mainMsg = '';
      let aDelta = 0;
      let bDelta = 0;

      if (nextCard.isJoker) {
          mainMsg = '幸運鬼牌！雙方直接加20分！🎉';
          aMsg = '+20';
          bMsg = '+20';
          aDelta = 20;
          bDelta = 20;
      } else {
          const isHigher = nextCard.absoluteValue > currentCard.absoluteValue;
          
          if (teamAChoice === 'PASS') {
              aMsg = '0 (Pass)';
              aDelta = 0;
          } else {
              const aCorrect = (teamAChoice === 'HIGHER' && isHigher) || (teamAChoice === 'LOWER' && !isHigher);
              if (aCorrect) { aMsg = '+10'; aDelta = 10; } else { aMsg = '-10'; aDelta = -10; }
          }

          if (teamBChoice === 'PASS') {
              bMsg = '0 (Pass)';
              bDelta = 0;
          } else {
              const bCorrect = (teamBChoice === 'HIGHER' && isHigher) || (teamBChoice === 'LOWER' && !isHigher);
              if (bCorrect) { bMsg = '+10'; bDelta = 10; } else { bMsg = '-10'; bDelta = -10; }
          }

          mainMsg = isHigher ? '結果是... 更大！' : '結果是... 更小！';
      }

      setTeamAScore(s => s + aDelta);
      setTeamBScore(s => s + bDelta);
      setRoundResult({ aMsg, bMsg, mainMsg });
      setGameState('REVEAL');
  };

  const handleNextRound = () => {
      if (round >= maxRounds) {
          setGameState('GAMEOVER');
      } else {
          setRound(r => r + 1);
          setTeamAChoice(null);
          setTeamBChoice(null);

          if (currentCard?.isJoker) {
              const newDeck = [...deck];
              let nextCard = newDeck.pop();
              while (nextCard && nextCard.isJoker) {
                  nextCard = newDeck.pop();
              }
              if (nextCard) {
                  setDeck(newDeck);
                  setPreviousCard(currentCard);
                  setCurrentCard(nextCard);
              }
          }

          setGameState('BETTING');
      }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-6 px-4 landscape:py-2 relative">
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 landscape:mb-1">
        <button
          onClick={onBack}
          className="p-3 bg-white rounded-full shadow-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-green-800">步步高升 (猜大小)</h2>
          <button onClick={() => setShowRules(true)} className="text-green-600 hover:text-green-800">
             <HelpCircle size={24} />
          </button>
        </div>
        <button
          onClick={initGame}
          className="p-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-colors"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 landscape:p-2 w-full max-w-4xl flex flex-col items-center flex-1">
        
        {/* Header / Score Board */}
        <div className="flex w-full justify-between items-center mb-2 sm:mb-4 landscape:mb-1 px-2 sm:px-4 gap-4 sm:gap-8">
            <div className={`flex-1 rounded-2xl p-2 sm:p-4 landscape:p-1 flex flex-col items-center border-4 transition-colors
                ${teamAChoice ? 'bg-blue-100 border-blue-400' : 'bg-blue-50 border-blue-200'}`}>
                <span className="text-lg sm:text-xl font-bold text-blue-800 mb-1">A 組</span>
                <span className="text-3xl sm:text-4xl font-black text-blue-600 mb-2">{teamAScore}</span>
                {gameState === 'BETTING' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setTeamAChoice('HIGHER')}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 ${teamAChoice === 'HIGHER' ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-300'}`}
                        >
                            <ArrowUpCircle size={20} /> 大
                        </button>
                        <button 
                            onClick={() => setTeamAChoice('PASS')}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 ${teamAChoice === 'PASS' ? 'bg-slate-500 text-white' : 'bg-white text-gray-500 border border-gray-300'}`}
                        >
                            PASS
                        </button>
                        <button 
                            onClick={() => setTeamAChoice('LOWER')}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 ${teamAChoice === 'LOWER' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 border border-gray-300'}`}
                        >
                            <ArrowDownCircle size={20} /> 小
                        </button>
                    </div>
                )}
                {gameState === 'REVEAL' && (
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-500">選擇: {teamAChoice === 'HIGHER' ? '大' : (teamAChoice === 'LOWER' ? '小' : (teamAChoice === 'PASS' ? 'PASS' : '無'))}</span>
                        <motion.span 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`text-2xl font-black ${roundResult.aMsg.includes('+') ? 'text-green-600' : roundResult.aMsg.includes('-') ? 'text-red-500' : 'text-gray-500'}`}
                        >
                            {roundResult.aMsg}
                        </motion.span>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col items-center shrink-0">
                <span className="text-sm font-bold text-gray-400">回合</span>
                <span className="text-2xl sm:text-3xl font-black text-green-700 bg-green-100 px-4 py-2 rounded-xl">{round} / {maxRounds}</span>
            </div>

            <div className={`flex-1 rounded-2xl p-2 sm:p-4 landscape:p-1 flex flex-col items-center border-4 transition-colors
                ${teamBChoice ? 'bg-red-100 border-red-400' : 'bg-red-50 border-red-200'}`}>
                <span className="text-lg sm:text-xl font-bold text-red-800 mb-1">B 組</span>
                <span className="text-3xl sm:text-4xl font-black text-red-600 mb-2">{teamBScore}</span>
                {gameState === 'BETTING' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setTeamBChoice('HIGHER')}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 ${teamBChoice === 'HIGHER' ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-300'}`}
                        >
                            <ArrowUpCircle size={20} /> 大
                        </button>
                        <button 
                            onClick={() => setTeamBChoice('PASS')}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 ${teamBChoice === 'PASS' ? 'bg-slate-500 text-white' : 'bg-white text-gray-500 border border-gray-300'}`}
                        >
                            PASS
                        </button>
                        <button 
                            onClick={() => setTeamBChoice('LOWER')}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 ${teamBChoice === 'LOWER' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 border border-gray-300'}`}
                        >
                            <ArrowDownCircle size={20} /> 小
                        </button>
                    </div>
                )}
                {gameState === 'REVEAL' && (
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-500">選擇: {teamBChoice === 'HIGHER' ? '大' : (teamBChoice === 'LOWER' ? '小' : (teamBChoice === 'PASS' ? 'PASS' : '無'))}</span>
                        <motion.span 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`text-2xl font-black ${roundResult.bMsg.includes('+') ? 'text-green-600' : roundResult.bMsg.includes('-') ? 'text-red-500' : 'text-gray-500'}`}
                        >
                            {roundResult.bMsg}
                        </motion.span>
                    </div>
                )}
            </div>
        </div>

        {gameState === 'GAMEOVER' ? (
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-100 p-8 rounded-3xl text-center w-full max-w-md border-4 border-green-300">
                    <h3 className="text-4xl font-black text-green-800 mb-6">遊戲結束！</h3>
                    <div className="flex justify-around mb-8">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-blue-800">A 組</span>
                            <span className="text-6xl font-black text-blue-600">{teamAScore}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-red-800">B 組</span>
                            <span className="text-6xl font-black text-red-600">{teamBScore}</span>
                        </div>
                    </div>
                    {teamAScore > teamBScore && <p className="text-3xl font-black text-blue-600">A 組獲勝！🎉</p>}
                    {teamBScore > teamAScore && <p className="text-3xl font-black text-red-600">B 組獲勝！🎉</p>}
                    {teamAScore === teamBScore && <p className="text-3xl font-black text-yellow-600">平手！🤝</p>}
                    <button onClick={initGame} className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all hover:scale-105">再玩一次</button>
                </motion.div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center gap-4 landscape:gap-1 w-full flex-1">
                {/* Cards Area */}
                <div className="flex flex-row items-center justify-center gap-4 sm:gap-12 landscape:gap-4 py-4 sm:py-8 landscape:py-2 px-4 w-full bg-slate-50 rounded-3xl shadow-inner border border-slate-200">
                    {/* Previous Card (Small) */}
                    <div className="flex flex-col items-center opacity-60 scale-75 sm:scale-100 origin-right">
                        <span className="mb-2 landscape:mb-0 font-bold text-gray-500">上一張</span>
                        <div className="w-24 h-36 sm:w-32 sm:h-48 landscape:w-16 landscape:h-24 landscape:sm:w-24 landscape:sm:h-36 bg-white rounded-xl shadow-md border-2 border-gray-200 flex flex-col items-center justify-center relative">
                            {previousCard ? (
                                previousCard.isJoker ? (
                                    <span className="text-5xl">{previousCard.suitSymbol}</span>
                                ) : (
                                    <>
                                        <span className={`text-3xl sm:text-4xl font-black ${previousCard.color}`}>{previousCard.display}</span>
                                        <span className="text-4xl sm:text-5xl mt-2">{previousCard.suitSymbol}</span>
                                    </>
                                )
                            ) : (
                                <span className="text-gray-300 font-bold">無</span>
                            )}
                        </div>
                    </div>

                    {/* Current Card (Large) */}
                    <div className="flex flex-col items-center">
                        <span className="mb-2 landscape:mb-0 font-bold text-green-700 text-lg sm:text-xl">現在的牌</span>
                        <AnimatePresence mode="popLayout">
                            <motion.div 
                                key={currentCard?.display + (currentCard?.suitSymbol || '')}
                                initial={{ x: 100, opacity: 0, rotateY: 90 }}
                                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="w-40 h-60 sm:w-48 sm:h-72 landscape:w-28 landscape:h-40 landscape:sm:w-36 landscape:sm:h-52 bg-white rounded-2xl shadow-xl border-4 border-gray-200 flex flex-col items-center justify-center relative overflow-hidden shrink-0"
                            >
                                {currentCard && (
                                    currentCard.isJoker ? (
                                        <div className="flex flex-col items-center justify-center h-full w-full bg-purple-50">
                                            <span className="text-8xl">{currentCard.suitSymbol}</span>
                                            <span className={`text-3xl font-black mt-4 ${currentCard.color}`}>{currentCard.display}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col items-center ${currentCard.color}`}>
                                                <span className="text-xl sm:text-2xl font-black">{currentCard.display}</span>
                                                <span className="text-lg sm:text-xl">{currentCard.suitSymbol}</span>
                                            </div>
                                            <span className={`text-6xl sm:text-8xl font-black ${currentCard.color}`}>{currentCard.display}</span>
                                            <span className="text-5xl sm:text-7xl mt-2 sm:mt-4">{currentCard.suitSymbol}</span>
                                            <div className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex flex-col items-center rotate-180 ${currentCard.color}`}>
                                                <span className="text-xl sm:text-2xl font-black">{currentCard.display}</span>
                                                <span className="text-lg sm:text-xl">{currentCard.suitSymbol}</span>
                                            </div>
                                        </>
                                    )
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
                
                {/* Center Control / Result Area */}
                <div className="h-24 landscape:h-16 flex items-center justify-center w-full mt-4 landscape:mt-1">
                    {gameState === 'BETTING' ? (
                        <button
                            onClick={handleReveal}
                            disabled={!teamAChoice || !teamBChoice}
                            className={`px-8 py-4 rounded-full font-black text-2xl flex items-center gap-3 transition-all
                                ${teamAChoice && teamBChoice 
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl hover:scale-105' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Play size={28} />
                            開牌！
                        </button>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-green-700 mb-4">{roundResult.mainMsg}</span>
                            <button
                                onClick={handleNextRound}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                            >
                                {round >= maxRounds ? '查看結果' : '下一回合'} <ArrowLeft className="rotate-180" size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {showRules && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
                  <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                      <X size={28} />
                  </button>
                  <h3 className="text-2xl font-black text-green-800 mb-4 flex items-center gap-2">
                      <HelpCircle size={28} /> 遊戲規則
                  </h3>
                  <div className="space-y-4 text-gray-700">
                      <p><strong>基本玩法：</strong> 猜測下一張牌比目前的牌「更大」或「更小」。</p>
                      <ul className="list-disc pl-5 space-y-1">
                          <li>猜中：<span className="text-green-600 font-bold">+10 分</span></li>
                          <li>猜錯：<span className="text-red-500 font-bold">-10 分</span></li>
                          <li>PASS：<span className="text-slate-500 font-bold">不扣分也不加分</span></li>
                      </ul>
                      <p><strong>難度差異：</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                          <li><strong>一般難度：</strong> 只有數字 1~10 的撲克牌。</li>
                          <li><strong>進階難度：</strong> 包含完整的 1~13 (A, J, Q, K) 以及 2 張幸運鬼牌。</li>
                      </ul>
                      {isAdvanced && (
                          <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl mt-4">
                              <p className="text-purple-800 font-bold flex items-center gap-2">
                                  <span>🃏</span> 幸運鬼牌規則
                              </p>
                              <p className="text-sm text-purple-700 mt-1">
                                  翻出鬼牌時，雙方直接獲得 <span className="font-bold">+20 分</span>！(下一回合會自動翻一張普通牌作為基準)。前 10 回合保證至少出現一次。
                              </p>
                          </div>
                      )}
                  </div>
                  <button onClick={() => setShowRules(false)} className="mt-6 w-full py-3 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors">
                      我明白了
                  </button>
              </motion.div>
          </div>
      )}
    </div>
  );
};

export default HigherLowerGame;
