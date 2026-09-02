import React, { useState, useEffect, type ReactNode } from 'react';
import { RotateCcw, HelpCircle, Lightbulb, Clock } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

interface SetGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

interface SetBoardViewProps {
  difficulty: Difficulty;
  score: number;
  timeText: string;
  deckCount: number;
  message: string;
  board: ReactNode;
  onBack: () => void;
  onShowRules: () => void;
  onReset: () => void;
  onHint: () => void;
}

export const SetBoardView: React.FC<SetBoardViewProps> = ({
  difficulty,
  score,
  timeText,
  deckCount,
  message,
  board,
  onBack,
  onShowRules,
  onReset,
  onHint,
}) => (
  <GameShell
    title="神奇形色牌"
    subtitle="找出三張屬性全相同或全不同的牌"
    onBack={onBack}
    className="bg-slate-50"
    status={(
      <div className="flex items-center gap-1.5">
        {difficulty === 'ADVANCED' && <span className="rounded-full bg-indigo-600 px-2 py-1 text-xs text-white">進階</span>}
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 sm:text-sm">{score} 分</span>
      </div>
    )}
    actions={(
      <>
        <button type="button" onClick={onShowRules} aria-label="遊戲規則" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100"><HelpCircle aria-hidden="true" className="h-5 w-5" /></button>
        <button type="button" onClick={onReset} aria-label="返回遊戲設定" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"><RotateCcw aria-hidden="true" className="h-5 w-5" /></button>
      </>
    )}
  >
    <GridFocusLayout
      playfieldLabel="形色牌桌面"
      supportLabel="形色牌資訊區"
      playfieldClassName="overflow-hidden"
      supportClassName="flex items-center justify-center overflow-hidden"
      playfield={board}
      support={(
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-700"><Clock aria-hidden="true" className="h-5 w-5" />{timeText}</div>
          <p className="text-sm font-bold text-slate-600">剩餘 {deckCount} 張</p>
          <button type="button" onClick={onHint} className="flex min-h-11 items-center justify-center rounded-xl bg-amber-100 px-4 font-bold text-amber-800 hover:bg-amber-200">
            <Lightbulb aria-hidden="true" className="mr-1 h-5 w-5" />提示
          </button>
        </div>
      )}
      feedback={message ? <span className={message.includes('找到') ? 'text-emerald-700' : 'text-slate-700'}>{message}</span> : undefined}
    />
  </GameShell>
);

type Shape = 'DIAMOND' | 'ROUND' | 'SQUARE';
type Color = 'RED' | 'GREEN' | 'PURPLE';
type Count = 1 | 2 | 3;
type Shading = 'SOLID' | 'OPEN' | 'SHADED';

interface CardDef {
  id: string;
  shape: Shape;
  color: Color;
  count: Count;
  shading: Shading;
}

const SHAPES: Shape[] = ['DIAMOND', 'ROUND', 'SQUARE'];
const COLORS: Color[] = ['RED', 'GREEN', 'PURPLE'];
const COUNTS: Count[] = [1, 2, 3];
const SHADINGS: Shading[] = ['SOLID', 'OPEN', 'SHADED'];

const generateDeck = (isAdvanced: boolean): CardDef[] => {
  const deck: CardDef[] = [];
  let id = 0;
  const shadingsToUse = isAdvanced ? SHADINGS : (['SOLID'] as Shading[]);
  for (const shape of SHAPES) {
    for (const color of COLORS) {
      for (const count of COUNTS) {
        for (const shading of shadingsToUse) {
          deck.push({ id: `card-${id++}`, shape, color, count, shading });
        }
      }
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const isSet = (c1: CardDef, c2: CardDef, c3: CardDef): boolean => {
  const checkProp = (p1: any, p2: any, p3: any) => {
    return (p1 === p2 && p2 === p3) || (p1 !== p2 && p1 !== p3 && p2 !== p3);
  };
  return (
    checkProp(c1.shape, c2.shape, c3.shape) &&
    checkProp(c1.color, c2.color, c3.color) &&
    checkProp(c1.count, c2.count, c3.count) &&
    checkProp(c1.shading, c2.shading, c3.shading)
  );
};

const findSets = (cards: CardDef[]): CardDef[][] => {
    const sets = [];
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            for (let k = j + 1; k < cards.length; k++) {
                if (isSet(cards[i], cards[j], cards[k])) {
                    sets.push([cards[i], cards[j], cards[k]]);
                }
            }
        }
    }
    return sets;
};

const SetGame: React.FC<SetGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  
  const [deck, setDeck] = useState<CardDef[]>([]);
  const [board, setBoard] = useState<CardDef[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'GAMEOVER'>('SETUP');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [timerMode, setTimerMode] = useState<'UP' | 'DOWN'>('UP');
  const [timeLimit, setTimeLimit] = useState(300);
  const [time, setTime] = useState(0);
  const [customTime, setCustomTime] = useState('');
  const [finalScoreStats, setFinalScoreStats] = useState<{base: number, bonus: number, total: number} | null>(null);

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
          handleGameOver(true);
      }
  }, [time, gameState, timerMode]);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleGameOver = (isTimeout: boolean = false) => {
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
          setMessage(isTimeout ? `時間到！` : `遊戲結束！加成 +${timeBonus}`);
          return s + timeBonus;
      });
  };

  useEffect(() => {
    setGameState('SETUP');
  }, [difficulty]);

  const initGame = () => {
    setGameState('SETUP');
  };

  const startGame = () => {
    const newDeck = generateDeck(isAdvanced);
    let initialBoard = newDeck.splice(0, 12);
    
    // Ensure there is at least one set initially
    while (findSets(initialBoard).length === 0 && newDeck.length > 0) {
        initialBoard.push(...newDeck.splice(0, 3));
    }

    setDeck(newDeck);
    setBoard(initialBoard);
    setSelectedIds([]);
    setScore(0);
    setMessage('');
    setTime(timerMode === 'DOWN' ? timeLimit : 0);
    setGameState('PLAYING');
  };

  const addThreeCards = () => {
      if (deck.length >= 3) {
          const newDeck = [...deck];
          const newCards = newDeck.splice(0, 3);
          setDeck(newDeck);
          setBoard([...board, ...newCards]);
      }
  };

  const showHint = () => {
      const sets = findSets(board);
      if (sets.length > 0) {
          const hintCardId = sets[0][Math.floor(Math.random() * 3)].id;
          setMessage(`提示：我們幫你標示出其中一組的其中一張牌！`);
          // Highlight one card
          if (!selectedIds.includes(hintCardId)) {
             setSelectedIds([hintCardId]);
          }
      } else {
          setMessage('畫面上沒有解了，自動補牌...');
          setTimeout(addThreeCards, 1500);
      }
  };

  const handleCardClick = (cardId: string) => {
      if (selectedIds.includes(cardId)) {
          setSelectedIds(selectedIds.filter(id => id !== cardId));
          return;
      }

      const newSelected = [...selectedIds, cardId];
      setSelectedIds(newSelected);

      if (newSelected.length === 3) {
          const c1 = board.find(c => c.id === newSelected[0])!;
          const c2 = board.find(c => c.id === newSelected[1])!;
          const c3 = board.find(c => c.id === newSelected[2])!;

          if (isSet(c1, c2, c3)) {
              setMessage('找到了！得分！');
              setScore(s => s + 10);
              soundService.playWin();
              
              // Remove matched cards
              let newBoard = board.filter(c => !newSelected.includes(c.id));
              let newDeck = [...deck];
              
              // Only draw 3 more if we are at 12 or less
              if (newBoard.length < 12 && newDeck.length >= 3) {
                  newBoard.push(...newDeck.splice(0, 3));
              }

              // Guarantee next board has a set if possible
              while (findSets(newBoard).length === 0 && newDeck.length >= 3) {
                  newBoard.push(...newDeck.splice(0, 3));
              }

              if (newBoard.length === 0 || (findSets(newBoard).length === 0 && newDeck.length === 0)) {
                  handleGameOver();
              }

              setBoard(newBoard);
              setDeck(newDeck);
          } else {
              setMessage('這三張不是組合喔！');
              setScore(s => Math.max(0, s - 2));
              soundService.playWrong();
          }
          setTimeout(() => setSelectedIds([]), 500);
      } else {
          setMessage('');
      }
  };

  const renderShape = (card: CardDef) => {
      const colorMap = {
          RED: '#ef4444',
          GREEN: '#22c55e',
          PURPLE: '#a855f7'
      };
      const color = colorMap[card.color];
      const fillOpacity = card.shading === 'SOLID' ? 1 : card.shading === 'SHADED' ? 0.3 : 0;
      const strokeWidth = 3;

      let svgPath = '';
      if (card.shape === 'DIAMOND') {
          svgPath = 'M 20 0 L 40 20 L 20 40 L 0 20 Z';
      } else if (card.shape === 'ROUND') {
          svgPath = 'M 20,0 A 20,20 0 1,1 20,40 A 20,20 0 1,1 20,0 Z'; // perfect circle
      } else if (card.shape === 'SQUARE') {
          svgPath = 'M 0 0 H 40 V 40 H 0 Z'; // slightly rect
      }

      const elements = [];
      for (let i = 0; i < card.count; i++) {
          elements.push(
              <svg key={i} viewBox="-2 -2 44 44" className="w-5 h-5 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 m-0.5">
                  <path 
                      d={svgPath} 
                      fill={color} 
                      fillOpacity={fillOpacity} 
                      stroke={color} 
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                  />
              </svg>
          );
      }
      return <div className="flex flex-col sm:flex-col justify-center items-center h-full w-full py-1">{elements}</div>;
  };

  return (
    <>
      {gameState === 'SETUP' ? (
        <GameShell title="神奇形色牌" subtitle="設定計時方式後開始挑戰" onBack={onBack} className="bg-slate-50">
              <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-slate-50/90 p-4 animate-fade-in">
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
        </GameShell>
      ) : (
        <SetBoardView
          difficulty={difficulty}
          score={score}
          timeText={formatTime(time)}
          deckCount={deck.length}
          message={message}
          onBack={onBack}
          onShowRules={() => setShowRules(true)}
          onReset={initGame}
          onHint={showHint}
          board={(
              <div className="grid h-full min-h-0 grid-cols-4 content-center gap-2 overflow-y-auto p-1">
                  {board.map((card) => {
                      const isSelected = selectedIds.includes(card.id);
                      return (
                          <button
                              key={card.id}
                              onClick={() => {
                                  if (gameState === 'PLAYING') handleCardClick(card.id);
                              }}
                              aria-pressed={isSelected}
                              className={`min-h-16 bg-white rounded-lg sm:rounded-xl transition-all shadow-sm flex items-center justify-center
                                  ${isSelected ? 'border-4 border-emerald-500 scale-95 shadow-inner bg-emerald-100 ring-2 ring-emerald-500 ring-offset-1' : 'border-2 border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'}`}
                          >
                              {renderShape(card)}
                          </button>
                      );
                  })}
              </div>
          )}
        />
      )}

      {gameState === 'GAMEOVER' && (
                  <div className="fixed inset-0 flex items-center justify-center p-4 bg-white/90 animate-fade-in z-50">
                      <div className="p-4 sm:p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center w-full max-w-sm shrink-0 max-h-[100dvh] overflow-y-auto">
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

      {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲規則</h2>
                  <div className="space-y-3 text-gray-600 mb-6">
                      <p>目標是找出畫面上由 <strong>3 張牌</strong> 組成的「Set（組合）」。</p>
                      <p>每張牌有 {isAdvanced ? '4' : '3'} 種屬性：</p>
                      <ul className="list-disc pl-5">
                          <li><strong>形狀</strong>：菱形、圓形、方形</li>
                          <li><strong>顏色</strong>：紅、綠、紫</li>
                          <li><strong>數量</strong>：1、2、3</li>
                          {isAdvanced && <li><strong>填色</strong>：實心、半透明、空心</li>}
                      </ul>
                      <div className="p-4 bg-indigo-50 rounded-xl mt-4">
                          <p className="font-bold text-indigo-800 mb-2">💡 什麼是合法的組合？</p>
                          <p className="text-indigo-900 text-sm">對於這 {isAdvanced ? '4' : '3'} 個屬性中的每一個，這 3 張牌必須：</p>
                          <p className="text-indigo-900 text-sm font-bold text-center mt-2">完全相同 或是 完全不同</p>
                          <p className="text-sm mt-2 text-indigo-700">例如：顏色都是紅色（相同），且數量分別是 1,2,3（不同），形狀都是菱形（相同）{isAdvanced ? '，填色分別是實心、空心、半透明（不同）' : ''}。這樣就是一組！</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl mt-4 border border-amber-100">
                          <p className="font-bold text-amber-800 mb-2">🎯 解題技巧</p>
                          <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1">
                              <li><strong>隨便選兩張牌</strong>：腦海中想像如果這兩張牌要湊成 Set，第三張牌「必須」長什麼樣子。然後去畫面上找那張牌！</li>
                              <li><strong>從特殊特徵找</strong>：畫面上如果只有一張紫色的牌，那它如果要配成組合，另外兩張一定是綠色和紅色。</li>
                              <li>遇到瓶頸時，可以點擊上方的「提示」按鈕。</li>
                          </ul>
                      </div>
                  </div>
                  <button onClick={() => setShowRules(false)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700">
                      開始挑戰
                  </button>
              </div>
          </div>
      )}
    </>
  );
};

export default SetGame;
