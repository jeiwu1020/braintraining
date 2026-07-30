import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, HelpCircle, Clock } from 'lucide-react';
import { Difficulty } from '../types';

interface PyramidGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
interface Card {
  id: string;
  suit: Suit;
  value: number; // 1-13
  faceUp: boolean;
  row?: number;
  col?: number;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

const generateDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ id: `${suit}-${value}`, suit, value, faceUp: true });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const getCardDisplay = (value: number) => {
  if (value === 1) return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return value.toString();
};

const getSuitColor = (suit: Suit) => {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-800';
};

const getSuitSymbol = (suit: Suit) => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

const PyramidGame: React.FC<PyramidGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  
  const [pyramid, setPyramid] = useState<(Card | null)[][]>([]);
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<{ source: 'pyramid' | 'waste', row?: number, col?: number } | null>(null);
  const [score, setScore] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [message, setMessage] = useState('');
  const [time, setTime] = useState(0);
  const [customTime, setCustomTime] = useState('');
  const [finalScoreStats, setFinalScoreStats] = useState<{base: number, bonus: number, total: number} | null>(null);
  const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'GAMEOVER'>('SETUP');
  const [timerMode, setTimerMode] = useState<'UP' | 'DOWN'>('UP');
  const [timeLimit, setTimeLimit] = useState(300);

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
          handleGameOver(false, true);
      }
  }, [time, gameState, timerMode]);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleGameOver = (isWin: boolean, isTimeout: boolean = false) => {
      setGameState('GAMEOVER');
      setScore(s => {
          let timeBonus = 0;
          if (isTimeout) {
              timeBonus = 0;
          } else if (timerMode === 'DOWN') {
              timeBonus = time * 2;
          } else {
              timeBonus = Math.max(0, 300 - time) * 2;
          }
          setFinalScoreStats({ base: s, bonus: timeBonus, total: s + timeBonus });
          if (isWin) {
              setMessage(`恭喜過關！加成 +${timeBonus}`);
          } else if (isTimeout) {
              setMessage(`時間到！`);
          } else {
              setMessage(`沒有配對了，結算！`);
          }
          return s + timeBonus;
      });
  };

  const initGame = () => {
    setGameState('SETUP');
  };

  const startGame = () => {
    const deck = generateDeck();
    const newPyramid: (Card | null)[][] = [];
    let cardIdx = 0;
    
    for (let row = 0; row < 7; row++) {
      const rowCards: Card[] = [];
      for (let col = 0; col <= row; col++) {
        const card = { ...deck[cardIdx++], row, col };
        rowCards.push(card);
      }
      newPyramid.push(rowCards);
    }
    
    setPyramid(newPyramid);
    setStock(deck.slice(cardIdx));
    setWaste([]);
    setSelectedCard(null);
    setScore(0);
    setMessage('');
    setTime(timerMode === 'DOWN' ? timeLimit : 0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const drawCard = () => {
    if (stock.length > 0) {
      const newStock = [...stock];
      const card = newStock.pop()!;
      setStock(newStock);
      setWaste([...waste, card]);
    } else {
      // Recycle waste to stock
      const newStock = [...waste].reverse();
      setStock(newStock);
      setWaste([]);
    }
    setSelectedCard(null);
  };

  const isCardCovered = (row: number, col: number) => {
    if (row === 6) return false;
    return pyramid[row + 1]?.[col] !== null || pyramid[row + 1]?.[col + 1] !== null;
  };

  const removeCards = (c1Coords: { source: 'pyramid'|'waste', row?: number, col?: number }, c2Coords?: { source: 'pyramid'|'waste', row?: number, col?: number }) => {
      const newPyramid = [...pyramid.map(r => [...r])];
      const newWaste = [...waste];

      const remove = (coords: { source: 'pyramid'|'waste', row?: number, col?: number }) => {
          if (coords.source === 'pyramid') {
              newPyramid[coords.row!][coords.col!] = null;
          } else if (coords.source === 'waste') {
              newWaste.pop();
          }
      };

      remove(c1Coords);
      if (c2Coords) remove(c2Coords);

      setPyramid(newPyramid);
      setWaste(newWaste);
      setSelectedCard(null);
      
      let isWin = false;
      let isStuck = false;
      let timeBonus = 0;

      if (!newPyramid.some(row => row.some(c => c !== null))) {
          isWin = true;
      } else {
          const uncovered = [];
          for (let r = 0; r < newPyramid.length; r++) {
              for (let c = 0; c < newPyramid[r].length; c++) {
                  const card = newPyramid[r][c];
                  if (card) {
                      const isCov = (r < 6) && (newPyramid[r + 1]?.[c] !== null || newPyramid[r + 1]?.[c + 1] !== null);
                      if (!isCov) uncovered.push(card);
                  }
              }
          }
          const deckCards = [...stock, ...newWaste];
          let canMove = false;
          for (const card of uncovered) {
              if (card.value === 13) { canMove = true; break; }
              if (uncovered.some(other => other.id !== card.id && other.value + card.value === 13)) { canMove = true; break; }
              if (deckCards.some(deckCard => deckCard.value + card.value === 13)) { canMove = true; break; }
          }
          if (!canMove && uncovered.length > 0) {
              isStuck = true;
          }
      }

      if (isWin) {
          setScore(s => s + 13);
          handleGameOver(true);
      } else if (isStuck) {
          setScore(s => s + 13);
          handleGameOver(false);
      } else {
          setMessage('消除成功！');
          setScore(s => s + 13);
          setTimeout(() => {
              setMessage(m => m === '消除成功！' ? '' : m);
          }, 1500);
      }
  };

  const handleCardClick = (source: 'pyramid' | 'waste', row?: number, col?: number) => {
      let clickedCard: Card | null = null;
      if (source === 'pyramid') {
          if (isCardCovered(row!, col!)) return; // Covered, cannot click
          clickedCard = pyramid[row!][col!];
      } else {
          if (waste.length === 0) return;
          clickedCard = waste[waste.length - 1];
      }

      if (!clickedCard) return;

      // If clicked card is K (13), remove immediately
      if (clickedCard.value === 13) {
          removeCards({ source, row, col });
          return;
      }

      if (!selectedCard) {
          setSelectedCard({ source, row, col });
          return;
      }

      // If clicked same card, deselect
      if (selectedCard.source === source && selectedCard.row === row && selectedCard.col === col) {
          setSelectedCard(null);
          return;
      }

      // We have a previously selected card, check if they sum to 13
      let firstCard: Card | null = null;
      if (selectedCard.source === 'pyramid') {
          firstCard = pyramid[selectedCard.row!][selectedCard.col!];
      } else {
          firstCard = waste[waste.length - 1];
      }

      if (firstCard && (firstCard.value + clickedCard.value === 13)) {
          removeCards(selectedCard, { source, row, col });
      } else {
          // Doesn't sum to 13, switch selection
          setSelectedCard({ source, row, col });
      }
  };

  const isSelected = (source: 'pyramid' | 'waste', row?: number, col?: number) => {
      return selectedCard?.source === source && selectedCard?.row === row && selectedCard?.col === col;
  };

  const CardComponent = ({ card, selected, onClick, covered }: { card: Card, selected: boolean, onClick?: () => void, covered?: boolean }) => {
      return (
          <button
              onClick={onClick}
              disabled={covered}
              className={`w-12 h-16 sm:w-16 sm:h-24 landscape:w-11 landscape:h-16 bg-white rounded-lg sm:rounded-xl shadow-md border-2 flex flex-col items-center justify-center transition-all
                  ${selected ? 'border-yellow-400 scale-105 shadow-yellow-200 shadow-lg z-10 relative' : 'border-slate-200'}
                  ${covered ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'hover:-translate-y-1 hover:shadow-lg cursor-pointer'}
              `}
          >
              <div className={`text-lg sm:text-xl landscape:text-base font-bold ${getSuitColor(card.suit)}`}>
                  {getCardDisplay(card.value)}
              </div>
              <div className={`text-xl sm:text-3xl landscape:text-xl ${getSuitColor(card.suit)}`}>
                  {getSuitSymbol(card.suit)}
              </div>
          </button>
      );
  };

  return (
    <div className="flex flex-col h-full bg-emerald-800 text-slate-800">
      <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-md shadow-sm shrink-0 border-b border-white/20">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            金字塔接龍 {isAdvanced && <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">進階</span>}
        </h1>
        <div className="flex gap-2">
            <button onClick={() => setShowRules(true)} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
                <HelpCircle className="w-6 h-6" />
            </button>
            <button onClick={initGame} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
                <RotateCcw className="w-6 h-6" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center relative w-full">
          {gameState === 'SETUP' ? (
              <div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-emerald-800/90 animate-fade-in">
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
            <>
              <div className="absolute top-4 left-4 text-white font-bold text-lg flex flex-col gap-1 z-10">
                  <div>分數: <span className="text-yellow-400">{score}</span></div>
                  <div className="flex items-center gap-1 text-sm bg-black/20 px-2 py-1 rounded-full w-fit">
                      <Clock size={16} /> <span className={timerMode === 'DOWN' && time <= 60 ? 'text-red-400' : ''}>{formatTime(time)}</span>
                  </div>
              </div>
              <div className="absolute top-4 right-4 text-white font-bold h-8 text-right max-w-[50%] z-10">
                  {message}
              </div>

              <div className="flex flex-col items-center gap-1 sm:gap-2 landscape:gap-0 mt-16 sm:mt-20 landscape:mt-8 w-full max-w-3xl">
                  {pyramid.map((rowCards, rowIndex) => (
                      <div key={`row-${rowIndex}`} className={`flex justify-center ${rowIndex > 0 ? '-mt-6 sm:-mt-10 landscape:-mt-8' : ''}`} style={{ gap: '0.25rem' }}>
                          {rowCards.map((card, colIndex) => {
                              if (!card) {
                                  return <div key={`empty-${rowIndex}-${colIndex}`} className="w-12 h-16 sm:w-16 sm:h-24 landscape:w-11 landscape:h-16"></div>;
                              }
                              const covered = isCardCovered(rowIndex, colIndex);
                              return (
                                  <div key={card.id} className="relative" style={{ 
                                      marginRight: colIndex < rowCards.length - 1 ? '-1rem' : '0' 
                                   }}>
                                      <CardComponent
                                          card={card}
                                          covered={covered || gameState !== 'PLAYING'}
                                          selected={isSelected('pyramid', rowIndex, colIndex)}
                                          onClick={() => {
                                              if (gameState === 'PLAYING') handleCardClick('pyramid', rowIndex, colIndex);
                                          }}
                                      />
                                  </div>
                              );
                          })}
                      </div>
                  ))}
              </div>

              <div className="mt-8 landscape:mt-4 w-full max-w-md flex justify-between px-8 z-10">
                  {/* Stock */}
                  <button 
                      onClick={() => { if (gameState === 'PLAYING') drawCard(); }}
                      disabled={gameState !== 'PLAYING'}
                      className="w-16 h-24 sm:w-20 sm:h-28 landscape:w-11 landscape:h-16 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors relative disabled:opacity-50"
                  >
                      {stock.length > 0 ? (
                          <div className="absolute inset-0 bg-blue-800 rounded-xl border-2 border-white/50 pattern-diagonal-lines pattern-blue-900 pattern-bg-blue-800 pattern-size-4 opacity-90 flex items-center justify-center shadow-lg">
                              <RotateCcw className="w-8 h-8 text-white/50" />
                          </div>
                      ) : (
                          <RotateCcw className="w-8 h-8 text-white/50" />
                      )}
                  </button>

                  {/* Waste */}
                  <div className="w-16 h-24 sm:w-20 sm:h-28 landscape:w-11 landscape:h-16 relative">
                      {waste.length > 0 ? (
                          <CardComponent
                              card={waste[waste.length - 1]}
                              selected={isSelected('waste')}
                              onClick={() => { if (gameState === 'PLAYING') handleCardClick('waste'); }}
                              covered={gameState !== 'PLAYING'}
                          />
                      ) : (
                          <div className="w-full h-full rounded-xl border-2 border-white/20 border-dashed flex items-center justify-center">
                              <span className="text-white/30 text-sm">廢牌區</span>
                          </div>
                      )}
                  </div>
              </div>

              {gameState === 'GAMEOVER' && (
                  <div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-black/80 animate-fade-in absolute inset-0 z-20">
                      <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center w-full max-w-sm shrink-0">
                            <h3 className="text-2xl font-bold text-emerald-600 mb-6">挑戰結束！</h3>
                            
                            {finalScoreStats ? (
                                <div className="space-y-3 mb-8 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>原始分數</span>
                                        <span className="font-bold text-lg">{finalScoreStats.base}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>時間加成</span>
                                        <span className="font-bold text-lg text-amber-500">+{finalScoreStats.bonus}</span>
                                    </div>
                                    <div className="h-px bg-slate-200 w-full my-2"></div>
                                    <div className="flex justify-between items-center text-slate-800">
                                        <span className="font-bold">總分</span>
                                        <span className="font-black text-3xl text-emerald-600">{finalScoreStats.total}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-600 text-lg mb-4">你的總分是：{score}</p>
                            )}

                            <button onClick={initGame} className="px-8 py-3 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors w-full shadow-lg hover:shadow-xl">
                                返回設定
                            </button>
                      </div>
                  </div>
              )}
            </>
          )}
      </div>

      {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲規則</h2>
                  <div className="space-y-3 text-gray-600 mb-6 text-sm sm:text-base">
                      <p>目標是移除金字塔中所有的牌！</p>
                      <ul className="list-disc pl-5 space-y-2">
                          <li>只要兩張牌的數字相加等於 <strong>13</strong>，就可以配對消除。</li>
                          <li><span className="font-bold text-red-500">A</span> = 1, <span className="font-bold text-slate-800">J</span> = 11, <span className="font-bold text-red-500">Q</span> = 12, <span className="font-bold text-slate-800">K</span> = 13。</li>
                          <li><span className="font-bold">K</span> 本身就是 13，點擊即可直接消除。</li>
                          <li><strong>翻牌條件</strong>：金字塔中的牌，必須等它正下方的兩張牌都被消除後（不被壓住），才能被選取。</li>
                          <li>如果畫面上沒有組合，可以點擊左下角的牌堆翻牌到廢牌區。廢牌區頂端的牌也可以用來配對。</li>
                          <li>牌堆翻完後可以無限次重新循環。</li>
                          <li><strong>遊戲結束</strong>：當你成功清空金字塔時獲勝。如果你發現沒有牌可以配對卡關了，請點擊右上角的「重新開始」結束這局。</li>
                      </ul>
                  </div>
                  <button onClick={() => setShowRules(false)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700">
                      開始挑戰
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default PyramidGame;
