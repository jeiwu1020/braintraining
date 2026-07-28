import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Target, Trophy, Play, Square, Coins, Settings } from 'lucide-react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface RouletteGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

// Normal: colors. Advanced: animals/items.
const STANDARD_ITEMS_NORMAL = [
    { id: 'red', label: "紅色", icon: "🍎", color: "bg-red-500" },
    { id: 'yellow', label: "黃色", icon: "🍌", color: "bg-yellow-400" },
    { id: 'blue', label: "藍色", icon: "🐳", color: "bg-blue-500" },
    { id: 'green', label: "綠色", icon: "🥦", color: "bg-green-500" },
];

const STANDARD_ITEMS_ADVANCED = [
    { id: 'dog', label: "狗狗", icon: "🐶", color: "bg-amber-700" },
    { id: 'cat', label: "貓咪", icon: "🐱", color: "bg-gray-400" },
    { id: 'pig', label: "豬豬", icon: "🐷", color: "bg-pink-400" },
    { id: 'frog', label: "青蛙", icon: "🐸", color: "bg-emerald-600" },
    { id: 'fox', label: "狐狸", icon: "🦊", color: "bg-orange-500" },
    { id: 'bear', label: "熊熊", icon: "🐻", color: "bg-amber-900" },
];

const EVENT_ITEMS_NORMAL = [
    { id: 'plus_10', label: "雙方 +10 分", icon: "🌟", color: "bg-teal-500", type: 'EVENT' },
    { id: 'minus_10', label: "雙方 -10 分", icon: "🌧️", color: "bg-slate-600", type: 'EVENT' },
];

const EVENT_ITEMS_ADVANCED = [
    { id: 'plus_20', label: "雙方 +20 分", icon: "🌟", color: "bg-teal-500", type: 'EVENT' },
    { id: 'bomb', label: "炸彈！雙方 -20", icon: "💣", color: "bg-slate-800", type: 'EVENT' },
    { id: 'swap', label: "雙方分數互換", icon: "🔄", color: "bg-purple-600", type: 'EVENT' },
    { id: 'nothing', label: "銘謝惠顧", icon: "💨", color: "bg-gray-400", type: 'EVENT' },
];

type TeamChoice = { itemId: string, amount: number } | null;

const RouletteGame: React.FC<RouletteGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  
  const standardItems = isAdvanced ? STANDARD_ITEMS_ADVANCED : STANDARD_ITEMS_NORMAL;
  const eventItems = isAdvanced ? EVENT_ITEMS_ADVANCED : EVENT_ITEMS_NORMAL;
  
  const [wheelOptions, setWheelOptions] = useState([...standardItems, ...eventItems]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [teamAScore, setTeamAScore] = useState(100);
  const [teamBScore, setTeamBScore] = useState(100);
  
  const [teamAChoice, setTeamAChoice] = useState<TeamChoice>(null);
  const [teamBChoice, setTeamBChoice] = useState<TeamChoice>(null);

  const [resultMsg, setResultMsg] = useState<{main: string, a: string, b: string} | null>(null);

  const spinInterval = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'GAMEOVER'>('SETUP');
  const [gameMode, setGameMode] = useState<'ROUNDS' | 'SCORE'>('ROUNDS');
  const [targetValue, setTargetValue] = useState(10);
  const [currentRound, setCurrentRound] = useState(1);
  const [isGameOverRound, setIsGameOverRound] = useState(false);

  useEffect(() => {
      setWheelOptions([...standardItems, ...eventItems].sort(() => 0.5 - Math.random()));
      resetGame();
  }, [difficulty]);

  const resetGame = () => {
      setGameState('SETUP');
      setTeamAChoice(null);
      setTeamBChoice(null);
      setResultMsg(null);
  };

  const startGame = () => {
      setTeamAScore(100);
      setTeamBScore(100);
      setCurrentRound(1);
      setIsGameOverRound(false);
      setTeamAChoice(null);
      setTeamBChoice(null);
      setResultMsg(null);
      setGameState('PLAYING');
  };

  const startSpin = () => {
    if (isSpinning) return;
    if (!teamAChoice || !teamBChoice) return;

    setIsSpinning(true);
    setResultMsg(null);

    let speed = 50;
    let ticks = 0;
    const maxTicks = Math.floor(Math.random() * 20) + 40; // Random duration

    const tick = () => {
        setCurrentIndex(prev => (prev + 1) % wheelOptions.length);
        ticks++;

        if (ticks >= maxTicks) {
            setIsSpinning(false);
            // Result is current index visually when stopped. 
            // Actually it will be the state at this point.
        } else {
            if (ticks > maxTicks - 15) speed += 20;
            spinInterval.current = setTimeout(tick, speed);
        }
    };

    spinInterval.current = setTimeout(tick, speed);
  };

  // Evaluate result when spinning stops
  useEffect(() => {
      if (!isSpinning && resultMsg === null && teamAChoice && teamBChoice) {
          // Just stopped spinning
          const landedOption = wheelOptions[currentIndex];
          let msgA = '';
          let msgB = '';
          let mainMsg = `轉到了：${landedOption.icon} ${landedOption.label}！`;
          let deltaA = 0;
          let deltaB = 0;
          
          let newA = teamAScore;
          let newB = teamBScore;

          if ('type' in landedOption && landedOption.type === 'EVENT') {
              // Handle event
              if (landedOption.id === 'plus_10') { deltaA = 10; deltaB = 10; msgA = '+10'; msgB = '+10'; }
              if (landedOption.id === 'minus_10') { deltaA = -10; deltaB = -10; msgA = '-10'; msgB = '-10'; }
              if (landedOption.id === 'plus_20') { deltaA = 20; deltaB = 20; msgA = '+20'; msgB = '+20'; }
              if (landedOption.id === 'bomb') { deltaA = -20; deltaB = -20; msgA = '-20'; msgB = '-20'; }
              if (landedOption.id === 'swap') { 
                  newA = teamBScore;
                  newB = teamAScore;
                  msgA = '分數互換！';
                  msgB = '分數互換！';
              }
              if (landedOption.id === 'nothing') { msgA = '沒事發生'; msgB = '沒事發生'; }
          } else {
              // Standard item resolution
              if (teamAChoice.itemId === landedOption.id) {
                  deltaA = teamAChoice.amount;
                  msgA = `+${deltaA} (猜中)`;
              } else {
                  deltaA = -teamAChoice.amount;
                  msgA = `${deltaA} (沒猜中)`;
              }

              if (teamBChoice.itemId === landedOption.id) {
                  deltaB = teamBChoice.amount;
                  msgB = `+${deltaB} (猜中)`;
              } else {
                  deltaB = -teamBChoice.amount;
                  msgB = `${deltaB} (沒猜中)`;
              }
          }

          if (landedOption.id !== 'swap') {
              newA += deltaA;
              newB += deltaB;
          }
          
          setTeamAScore(newA);
          setTeamBScore(newB);

          setResultMsg({ main: mainMsg, a: msgA, b: msgB });

          let gameOver = false;
          if (gameMode === 'ROUNDS' && currentRound >= targetValue) {
              gameOver = true;
          } else if (gameMode === 'SCORE' && (newA >= targetValue || newB >= targetValue)) {
              gameOver = true;
          }
          setIsGameOverRound(gameOver);
      }
  }, [isSpinning]);

  const resetRound = () => {
      if (isGameOverRound) {
          setGameState('GAMEOVER');
      } else {
          setCurrentRound(r => r + 1);
          setTeamAChoice(null);
          setTeamBChoice(null);
          setResultMsg(null);
      }
  };

  useEffect(() => {
    return () => {
        if (spinInterval.current) clearTimeout(spinInterval.current);
    };
  }, []);

  const BettingPanel = ({ team, choice, setChoice }: { team: 'A'|'B', choice: TeamChoice, setChoice: (c: TeamChoice) => void }) => {
      const amounts = [10, 20, 50];
      const [tempAmount, setTempAmount] = useState(10);
      const [tempItem, setTempItem] = useState(standardItems[0].id);

      const handleConfirm = () => {
          setChoice({ itemId: tempItem, amount: tempAmount });
      };

      if (choice) {
          const selectedItem = standardItems.find(i => i.id === choice.itemId)!;
          return (
              <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-gray-500 font-bold mb-2">已押注：</span>
                  <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{selectedItem.icon}</span>
                      <span className="text-xl font-bold">{selectedItem.label}</span>
                  </div>
                  <span className="text-lg font-bold bg-white/50 px-4 py-1 rounded-full border border-gray-300">
                      押注 {choice.amount} 分
                  </span>
                  {!isSpinning && resultMsg && (
                      <button onClick={() => setChoice(null)} className="mt-4 text-sm text-blue-600 underline">修改押注</button>
                  )}
              </div>
          );
      }

      return (
          <div className="flex flex-col items-center gap-3 w-full">
              <span className="font-bold text-gray-600">選擇押注項目：</span>
              <div className="flex flex-wrap justify-center gap-2">
                  {standardItems.map(item => (
                      <button 
                          key={item.id}
                          onClick={() => setTempItem(item.id)}
                          className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center
                              ${tempItem === item.id ? `${item.color} text-white border-transparent scale-110 shadow-md` : 'bg-white border-gray-200 text-gray-500 opacity-70'}`}
                      >
                          <span className="text-2xl">{item.icon}</span>
                      </button>
                  ))}
              </div>
              
              <span className="font-bold text-gray-600 mt-2">選擇押注金額：</span>
              <div className="flex gap-2">
                  {amounts.map(amt => (
                      <button 
                          key={amt}
                          onClick={() => setTempAmount(amt)}
                          className={`px-4 py-2 rounded-full font-bold border-2 transition-all
                              ${tempAmount === amt ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white border-gray-300 text-gray-600'}`}
                      >
                          {amt} 分
                      </button>
                  ))}
              </div>

              <button 
                  onClick={handleConfirm}
                  className="mt-2 w-full py-2 bg-slate-800 text-white rounded-xl font-bold shadow-md hover:bg-slate-700"
              >
                  確認押注
              </button>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center py-6 px-4 landscape:py-2">
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 landscape:mb-2">
        <button
          onClick={onBack}
          className="p-3 bg-white rounded-full shadow-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-rose-800">命運轉盤 (押注版)</h2>
          <p className="text-rose-600 font-medium">
            請雙方先下注，再點擊旋轉！
          </p>
        </div>
        <button
          onClick={resetGame}
          className="p-3 bg-white rounded-full shadow-md text-rose-600 hover:bg-rose-50 transition-colors"
          title="重新開始遊戲"
        >
          <Settings size={24} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 landscape:p-2 w-full max-w-5xl flex flex-col items-center flex-1">
        
        {gameState === 'SETUP' && (
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md">
                <h3 className="text-2xl font-bold text-rose-800 mb-8">遊戲設定</h3>
                
                <div className="w-full bg-rose-50 p-6 rounded-2xl mb-8 border-2 border-rose-200">
                    <div className="flex flex-col gap-6">
                        <div>
                            <span className="font-bold text-lg text-rose-900 mb-3 block">結束條件</span>
                            <div className="flex gap-4">
                                <button onClick={() => { setGameMode('ROUNDS'); setTargetValue(10); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-colors ${gameMode === 'ROUNDS' ? 'bg-rose-500 text-white border-rose-600 shadow-md' : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-100'}`}>回合制</button>
                                <button onClick={() => { setGameMode('SCORE'); setTargetValue(300); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-colors ${gameMode === 'SCORE' ? 'bg-rose-500 text-white border-rose-600 shadow-md' : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-100'}`}>分數制</button>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-rose-700 font-bold text-lg">{gameMode === 'ROUNDS' ? '目標回合數' : '目標分數'}</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setTargetValue(v => Math.max(gameMode === 'ROUNDS' ? 1 : 100, v - (gameMode === 'ROUNDS' ? 1 : 50)))} className="w-10 h-10 rounded-full bg-rose-200 text-rose-800 font-black text-xl hover:bg-rose-300 active:bg-rose-400 transition-colors">-</button>
                                <span className="font-black w-16 text-center text-3xl text-rose-700">{targetValue}</span>
                                <button onClick={() => setTargetValue(v => Math.min(gameMode === 'ROUNDS' ? 50 : 2000, v + (gameMode === 'ROUNDS' ? 1 : 50)))} className="w-10 h-10 rounded-full bg-rose-200 text-rose-800 font-black text-xl hover:bg-rose-300 active:bg-rose-400 transition-colors">+</button>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={startGame}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    開始遊戲
                </button>
            </div>
        )}

        {gameState === 'GAMEOVER' && (
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-rose-100 p-8 rounded-3xl text-center w-full max-w-md border-4 border-rose-300">
                    <h3 className="text-4xl font-black text-rose-800 mb-6">遊戲結束！</h3>
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
                    <button onClick={resetGame} className="mt-8 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all hover:scale-105">重新設定</button>
                </motion.div>
            </div>
        )}

        {gameState === 'PLAYING' && (
            <>
                <div className="w-full text-center mb-4 landscape:mb-2 border-b border-gray-100 pb-2">
                    <span className="bg-rose-100 px-6 py-2 landscape:py-1 rounded-full text-rose-800 font-bold shadow-sm inline-block">
                        {gameMode === 'ROUNDS' ? `回合: ${currentRound} / ${targetValue}` : `目標分數: ${targetValue} 分 (目前第 ${currentRound} 回合)`}
                    </span>
                </div>
                
                {/* Main Grid: Team A | Roulette | Team B */}
                <div className="w-full flex flex-col landscape:flex-row lg:flex-row items-stretch justify-center gap-4 lg:gap-8 mb-6 landscape:mb-2">
                    
                    {/* Team A Panel */}
                    <div className={`flex-1 rounded-3xl p-4 landscape:p-2 flex flex-col items-center border-4 transition-colors
                        ${teamAChoice ? 'bg-blue-100 border-blue-300' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="w-full flex justify-between items-center mb-4 landscape:mb-2 border-b-2 border-blue-200 pb-2">
                            <span className="text-xl font-black text-blue-800">A 組</span>
                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                                <Coins className="text-yellow-500 w-5 h-5" />
                                <span className="text-2xl font-black text-blue-700">{teamAScore}</span>
                            </div>
                        </div>
                        
                        {resultMsg && !isSpinning ? (
                            <div className="flex flex-col items-center justify-center flex-1">
                                <motion.span 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className={`text-3xl font-black ${resultMsg.a.includes('+') ? 'text-green-600' : (resultMsg.a.includes('-') ? 'text-red-500' : 'text-blue-600')}`}
                                >
                                    {resultMsg.a}
                                </motion.span>
                            </div>
                        ) : (
                            <BettingPanel team="A" choice={teamAChoice} setChoice={setTeamAChoice} />
                        )}
                    </div>

                    {/* Roulette Center */}
                    <div className="flex flex-col items-center justify-center shrink-0 min-w-[280px] landscape:min-w-[200px]">
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64 landscape:w-32 landscape:h-32 rounded-3xl shadow-inner bg-gray-100 border-8 border-rose-200 overflow-hidden flex items-center justify-center mb-6 landscape:mb-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={isSpinning ? { y: -50, opacity: 0 } : false}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={isSpinning ? { y: 50, opacity: 0 } : undefined}
                                    transition={{ duration: 0.1 }}
                                    className={`absolute inset-0 flex flex-col items-center justify-center ${wheelOptions[currentIndex].color} text-white`}
                                >
                                    <span className="text-6xl sm:text-7xl landscape:text-5xl drop-shadow-lg mb-2 sm:mb-4 landscape:mb-1">
                                        {wheelOptions[currentIndex].icon}
                                    </span>
                                    <span className="text-xl sm:text-2xl landscape:text-lg font-black tracking-wider drop-shadow-md text-center px-2">
                                        {wheelOptions[currentIndex].label}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        {!isSpinning && resultMsg ? (
                            <div className="flex flex-col items-center gap-4 landscape:gap-2 w-full">
                                <span className="text-xl landscape:text-lg font-bold text-center text-rose-700">{resultMsg.main}</span>
                                <button
                                    onClick={resetRound}
                                    className={`px-8 py-3 landscape:py-2 text-white rounded-full font-bold text-lg landscape:text-base shadow-md hover:scale-105 transition-all w-full ${isGameOverRound ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                                >
                                    {isGameOverRound ? '查看結果' : '下一回合'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={startSpin}
                                disabled={isSpinning || !teamAChoice || !teamBChoice}
                                className={`px-8 py-4 sm:px-12 sm:py-6 landscape:px-6 landscape:py-2 rounded-full font-black text-xl sm:text-2xl landscape:text-lg shadow-xl transition-all flex items-center justify-center gap-3 w-full
                                    ${isSpinning || !teamAChoice || !teamBChoice
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isSpinning ? <Square className="animate-spin landscape:w-5 landscape:h-5" /> : <Play className="landscape:w-5 landscape:h-5" size={28} />}
                                {isSpinning ? '旋轉中...' : '開始旋轉！'}
                            </button>
                        )}
                    </div>

                    {/* Team B Panel */}
                    <div className={`flex-1 rounded-3xl p-4 landscape:p-2 flex flex-col items-center border-4 transition-colors
                        ${teamBChoice ? 'bg-red-100 border-red-300' : 'bg-red-50 border-red-200'}`}>
                        <div className="w-full flex justify-between items-center mb-4 landscape:mb-2 border-b-2 border-red-200 pb-2">
                            <span className="text-xl font-black text-red-800">B 組</span>
                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                                <Coins className="text-yellow-500 w-5 h-5" />
                                <span className="text-2xl font-black text-red-700">{teamBScore}</span>
                            </div>
                        </div>
                        
                        {resultMsg && !isSpinning ? (
                            <div className="flex flex-col items-center justify-center flex-1">
                                <motion.span 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className={`text-3xl font-black ${resultMsg.b.includes('+') ? 'text-green-600' : (resultMsg.b.includes('-') ? 'text-red-500' : 'text-blue-600')}`}
                                >
                                    {resultMsg.b}
                                </motion.span>
                            </div>
                        ) : (
                            <BettingPanel team="B" choice={teamBChoice} setChoice={setTeamBChoice} />
                        )}
                    </div>

                </div>
                
                {/* Available Options Guide (Events) */}
                <div className="mt-auto pt-4 landscape:pt-1 w-full border-t border-gray-200 flex flex-col items-center">
                    <p className="text-center text-gray-500 mb-2 landscape:mb-1 font-bold text-sm">轉盤也可能轉到以下事件：</p>
                    <div className="flex flex-wrap justify-center gap-2 landscape:gap-1">
                        {eventItems.map((opt, i) => (
                            <div key={i} className={`flex items-center gap-1 px-3 py-1 landscape:px-2 landscape:py-0 rounded-full text-white text-sm landscape:text-xs font-bold ${opt.color} opacity-80`}>
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}

      </div>
    </div>
  );
};

export default RouletteGame;
