import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, RotateCcw, HelpCircle, Clock } from 'lucide-react';
import { Difficulty } from '../types';
import { getMastermindConfig } from '../services/mastermind';

interface MastermindGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

type Feedback = 'CORRECT_POS' | 'WRONG_POS' | 'NONE';

interface Guess {
  code: string[];
  feedback: Feedback[];
}

const MastermindGame: React.FC<MastermindGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const { codeLength, colors: availableColors } = getMastermindConfig(difficulty);
  
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(codeLength).fill(''));
  const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'GAMEOVER'>('SETUP');
  const [gameWon, setGameWon] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [message, setMessage] = useState('');
  const [timerMode, setTimerMode] = useState<'UP' | 'DOWN'>('UP');
  const [timeLimit, setTimeLimit] = useState(300);
  const [time, setTime] = useState(0);
  const [customTime, setCustomTime] = useState('');
  const [finalScoreStats, setFinalScoreStats] = useState<{base: number, bonus: number, total: number} | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (gameState === 'PLAYING') {
        interval = setInterval(() => {
            setTime(t => {
                if (timerMode === 'DOWN') {
                    return Math.max(0, t - 1);
                } else {
                    return t + 1;
                }
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timerMode]);

  useEffect(() => {
      if (gameState === 'PLAYING' && timerMode === 'DOWN' && time <= 0) {
          handleGameOver(false, true, guesses.length);
      }
  }, [time, gameState, timerMode, guesses.length]);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const initGame = () => {
    setGameState('SETUP');
  };

  const startGame = () => {
    const newCode = Array.from({ length: codeLength }, () =>
      availableColors[Math.floor(Math.random() * availableColors.length)]
    );
    setSecretCode(newCode);
    setGuesses([]);
    setCurrentGuess(Array(codeLength).fill(''));
    setGameWon(false);
    setMessage('');
    setScore(0);
    setTime(timerMode === 'DOWN' ? timeLimit : 0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const handleColorClick = (color: string) => {
    if (gameState !== 'PLAYING') return;
    const emptyIndex = currentGuess.indexOf('');
    if (emptyIndex !== -1) {
      const newGuess = [...currentGuess];
      newGuess[emptyIndex] = color;
      setCurrentGuess(newGuess);
    }
  };

  const handleClearPeg = (index: number) => {
    if (gameState !== 'PLAYING') return;
    const newGuess = [...currentGuess];
    newGuess[index] = '';
    setCurrentGuess(newGuess);
  };

  const submitGuess = () => {
    if (currentGuess.includes('')) return;
    
    // Calculate feedback
    const feedback: Feedback[] = [];
    const secretCopy = [...secretCode];
    const guessCopy = [...currentGuess];
    
    // First pass: correct position and color
    for (let i = 0; i < codeLength; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        feedback.push('CORRECT_POS');
        secretCopy[i] = 'X';
        guessCopy[i] = 'Y';
      }
    }
    
    // Second pass: correct color, wrong position
    for (let i = 0; i < codeLength; i++) {
      if (guessCopy[i] !== 'Y') {
        const secretIndex = secretCopy.indexOf(guessCopy[i]);
        if (secretIndex !== -1) {
          feedback.push('WRONG_POS');
          secretCopy[secretIndex] = 'X';
        }
      }
    }
    
    // Sort feedback so CORRECT_POS comes first
    feedback.sort((a, b) => {
        if (a === 'CORRECT_POS') return -1;
        if (b === 'CORRECT_POS') return 1;
        return 0;
    });

    const isWin = feedback.length === codeLength && feedback.every(f => f === 'CORRECT_POS');
    const newGuesses = [...guesses, { code: currentGuess, feedback }];
    setGuesses(newGuesses);
    setCurrentGuess(Array(codeLength).fill(''));

    if (isWin) {
      handleGameOver(true, false, newGuesses.length);
    }
  };

  const handleGameOver = (win: boolean, timeout: boolean = false, attempts: number) => {
      setGameState('GAMEOVER');
      setGameWon(win);
      
      let finalScore = 0;
      if (win) {
          finalScore += 1000;
          finalScore -= (attempts - 1) * 20;
      }
      
      let timeBonus = 0;
      if (timerMode === 'DOWN') {
          timeBonus = time * 2;
      } else {
          timeBonus = Math.max(0, 300 - time) * 2;
      }
      if (timeout) timeBonus = 0;
      
      setFinalScoreStats({ base: finalScore, bonus: timeBonus, total: Math.max(0, finalScore + timeBonus) });
      finalScore += timeBonus;
      setScore(Math.max(0, finalScore));
      
      if (timeout) {
          setMessage(`時間到！`);
      } else {
          setMessage(`過關！時間加成 +${timeBonus}`);
      }
  };

  const renderFeedback = (feedback: Feedback[]) => {
    const dots = [];
    for (let i = 0; i < codeLength; i++) {
        if (i < feedback.length) {
            const f = feedback[i];
            dots.push(
                <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm ${f === 'CORRECT_POS' ? 'bg-black' : 'bg-white'}`}></div>
            );
        } else {
            dots.push(<div key={i} className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-300 shadow-inner opacity-50"></div>);
        }
    }
    return <div className="grid grid-cols-2 gap-1 bg-slate-200 p-1.5 rounded-lg border border-slate-300">{dots}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm shrink-0">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            珠璣妙算 {isAdvanced && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">進階</span>}
        </h1>
        <div className="flex gap-2">
            <button onClick={() => setShowRules(true)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                <HelpCircle className="w-6 h-6" />
            </button>
            <button onClick={initGame} className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors">
            <RotateCcw className="w-6 h-6" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col w-full relative">
        {gameState === 'SETUP' ? (
            <div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-slate-50/90 animate-fade-in">
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full max-h-full overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">遊戲設定</h2>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">計時模式</label>
                        <div className="flex gap-2">
                            <button onClick={() => setTimerMode('UP')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${timerMode === 'UP' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                正數計時
                            </button>
                            <button onClick={() => setTimerMode('DOWN')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${timerMode === 'DOWN' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                倒數計時
                            </button>
                        </div>
                    </div>

                    {timerMode === 'DOWN' && (
                        <div className="mb-8 animate-fade-in">
                            <label className="block text-sm font-bold text-slate-700 mb-3">倒數時間</label>
                            <div className="flex gap-2 mb-3">
                                {[1, 3, 5].map(m => (
                                    <button key={m} onClick={() => { setTimeLimit(m * 60); setCustomTime(''); }} className={`flex-1 py-2 rounded-xl font-bold transition-colors ${timeLimit === m * 60 && !customTime ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                        {m} 分
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" min="1" max="999" 
                                    value={customTime} 
                                    onChange={(e) => {
                                        setCustomTime(e.target.value);
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val) && val > 0) setTimeLimit(val * 60);
                                    }} 
                                    placeholder="自訂時間 (分鐘)" 
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium" 
                                />
                            </div>
                        </div>
                    )}

                    <button onClick={startGame} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1">
                        開始挑戰
                    </button>
                </div>
            </div>
        ) : (
          <div className="flex flex-col landscape:flex-row h-full max-w-2xl landscape:max-w-4xl mx-auto w-full p-2 sm:p-4 gap-2 landscape:gap-4">
            
            <div className="flex flex-col shrink-0 landscape:w-1/2 landscape:max-w-sm">
                <div className="flex justify-between items-center mb-2 px-1">
                    <div className="flex gap-4 items-center">
                        <div className="text-slate-600 font-bold text-sm sm:text-base">猜測次數: <span className="text-indigo-600">{guesses.length}</span></div>
                        <div className="text-slate-600 font-bold text-sm sm:text-base flex items-center gap-1">
                            <Clock size={16}/> <span className={timerMode === 'DOWN' && time <= 60 ? 'text-red-500' : ''}>{formatTime(time)}</span>
                        </div>
                    </div>
                    {message && <div className="text-emerald-600 font-bold text-sm">{message}</div>}
                </div>

                {gameState === 'GAMEOVER' && (
                    <div className={`p-4 mb-4 rounded-xl shadow-sm border ${gameWon ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} text-center animate-fade-in shrink-0`}>
                        <h3 className={`text-xl font-bold mb-4 ${gameWon ? 'text-emerald-700' : 'text-red-700'}`}>
                            {gameWon ? '恭喜過關！' : '挑戰失敗'}
                        </h3>
                        
                        {finalScoreStats ? (
                            <div className="space-y-2 mb-4 text-left bg-white/50 p-4 rounded-xl border border-slate-100 max-w-sm mx-auto">
                                <div className="flex justify-between items-center text-slate-600 text-sm">
                                    <span>原始分數</span>
                                    <span className="font-bold">{finalScoreStats.base}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600 text-sm">
                                    <span>時間加成</span>
                                    <span className="font-bold text-amber-500">+{finalScoreStats.bonus}</span>
                                </div>
                                <div className="h-px bg-slate-200 w-full my-1"></div>
                                <div className="flex justify-between items-center text-slate-800">
                                    <span className="font-bold">總分</span>
                                    <span className="font-black text-xl text-indigo-600">{finalScoreStats.total}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="mb-3 text-slate-700 font-bold">獲得分數: {score}</p>
                        )}

                        <p className="mb-2 text-slate-600 text-sm">正確解答是：</p>
                        <div className="flex justify-center gap-2 mb-4">
                            {secretCode.map((c, i) => (
                                <div key={i} className={`w-8 h-8 rounded-full shadow-md ${c}`}></div>
                            ))}
                        </div>
                        <button onClick={initGame} className="px-6 py-2 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-colors">
                            返回設定
                        </button>
                    </div>
                )}

                {gameState === 'PLAYING' && (
                    <div className="mb-4 p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0">
                        <div className="flex items-center gap-2 sm:gap-4 justify-between mb-4">
                            <span className="text-slate-500 font-bold text-sm hidden sm:block">輸入猜測</span>
                            <div className="flex gap-2 flex-1 justify-center">
                                {currentGuess.map((c, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleClearPeg(i)}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all ${c ? `${c} border-transparent shadow-inner` : 'border-slate-300 bg-slate-50 border-dashed hover:border-slate-400'}`}
                                    >
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={submitGuess}
                                disabled={currentGuess.includes('')}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 text-white disabled:bg-slate-300 disabled:text-slate-500 transition-colors"
                            >
                                <Check className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                            {availableColors.map((c, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleColorClick(c)}
                                    className={`w-12 h-12 landscape:w-10 landscape:h-10 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform ${c}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-2">
                {guesses.slice().reverse().map((guess, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                        <span className="w-6 text-slate-400 font-bold text-sm">{guesses.length - idx}</span>
                        <div className="flex gap-2 flex-1 justify-center">
                            {guess.code.map((c, i) => (
                                <div key={i} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-inner ${c}`}></div>
                            ))}
                        </div>
                        <div className="shrink-0 flex items-center justify-center">
                            {renderFeedback(guess.feedback)}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲規則</h2>
                  <div className="space-y-3 text-gray-600 mb-6">
                      <p>嘗試猜出隱藏的顏色密碼排列！本局共有 <strong>{codeLength} 個格子、{availableColors.length} 種顏色</strong>。</p>
                      <ul className="list-disc pl-5 space-y-2">
                          <li>每次猜測後，系統會給予提示：</li>
                          <li><span className="inline-block w-3 h-3 bg-black rounded-full mr-1"></span> <strong>黑色提示</strong>：顏色與位置都正確。</li>
                          <li><span className="inline-block w-3 h-3 bg-white border border-gray-400 rounded-full mr-1"></span> <strong>白色提示</strong>：顏色正確但位置不對。</li>
                          <li>注意：提示的順序不代表密碼的順序！</li>
                          <li>密碼中允許出現重複的顏色。</li>
                      </ul>
                      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-indigo-950">
                          <h3 className="font-bold mb-2">解題技巧</h3>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                              <li>先用同一種顏色填滿所有格子；提示點的總數能告訴你這個顏色在密碼中出現幾次。依序測試各色，可先找出有哪些顏色。</li>
                              <li>已確定顏色後，再調整排列。黑色提示代表該格可以先固定；白色提示則表示顏色要保留，但需要換到其他位置。</li>
                              <li>每次只交換或更動一、兩個格子，並和前一次的提示比較；一次改太多會很難看出是哪個變動帶來線索。</li>
                              <li>提示點不對應特定格子，所以先看黑、白提示的「數量」，再用排除法決定下一步。</li>
                          </ul>
                      </div>
                  </div>
                  <button onClick={() => setShowRules(false)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700">
                      我瞭解了
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default MastermindGame;
