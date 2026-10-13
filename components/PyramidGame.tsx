import React, { useEffect, useRef, useState } from 'react';
import { Clock, HelpCircle, RotateCcw } from 'lucide-react';
import { Difficulty } from '../types';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

type GameState = 'SETUP' | 'PLAYING' | 'GAMEOVER';
type TimerMode = 'UP' | 'DOWN';
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string;
  suit: Suit;
  value: number; // 1-13
  faceUp: boolean;
  row?: number;
  col?: number;
}

export interface PyramidSelection {
  source: 'pyramid' | 'waste';
  row?: number;
  col?: number;
}

export interface PyramidInitialSession {
  gameState: GameState;
  pyramid: (Card | null)[][];
  stock?: Card[];
  waste?: Card[];
  selectedCard?: PyramidSelection | null;
  score?: number;
  message?: string;
  time?: number;
  customTime?: string;
  finalScoreStats?: { base: number; bonus: number; total: number } | null;
  timerMode?: TimerMode;
  timeLimit?: number;
}

export interface PyramidGameProps {
  onBack: () => void;
  difficulty: Difficulty;
  /** Test-only deterministic session; omitted in production so the normal random flow is unchanged. */
  initialSession?: PyramidInitialSession;
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

const clonePyramid = (value: (Card | null)[][] | undefined): (Card | null)[][] => (
  value?.map(row => row.map(card => (card ? { ...card } : null))) ?? []
);

export const isPyramidCardCovered = (pyramid: (Card | null)[][], row: number, col: number) => {
  const nextRow = pyramid[row + 1];
  if (!nextRow) return false;
  return nextRow[col] !== null || nextRow[col + 1] !== null;
};

export const canPairPyramidValues = (firstValue: number, secondValue: number) => (
  firstValue + secondValue === 13
);

export const isSingleKingRemovable = (value: number) => value === 13;

const getCardDisplay = (value: number) => {
  if (value === 1) return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return value.toString();
};

const getSuitColor = (suit: Suit) => (
  suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-800'
);

const getSuitSymbol = (suit: Suit) => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

const getSuitName = (suit: Suit) => {
  switch (suit) {
    case 'hearts': return '紅心';
    case 'diamonds': return '方塊';
    case 'clubs': return '梅花';
    case 'spades': return '黑桃';
  }
};

const PyramidGame: React.FC<PyramidGameProps> = ({ onBack, difficulty, initialSession }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const initialSessionDifficulty = useRef(difficulty);

  const [pyramid, setPyramid] = useState<(Card | null)[][]>(() => clonePyramid(initialSession?.pyramid));
  const [stock, setStock] = useState<Card[]>(() => initialSession?.stock?.map(card => ({ ...card })) ?? []);
  const [waste, setWaste] = useState<Card[]>(() => initialSession?.waste?.map(card => ({ ...card })) ?? []);
  const [selectedCard, setSelectedCard] = useState<PyramidSelection | null>(() => initialSession?.selectedCard ?? null);
  const [score, setScore] = useState(() => initialSession?.score ?? 0);
  const [showRules, setShowRules] = useState(false);
  const [message, setMessage] = useState(() => initialSession?.message ?? '');
  const [time, setTime] = useState(() => initialSession?.time ?? 0);
  const [customTime, setCustomTime] = useState(() => initialSession?.customTime ?? '');
  const [finalScoreStats, setFinalScoreStats] = useState<{ base: number; bonus: number; total: number } | null>(
    () => initialSession?.finalScoreStats ?? null,
  );
  const [gameState, setGameState] = useState<GameState>(() => initialSession?.gameState ?? 'SETUP');
  const [timerMode, setTimerMode] = useState<TimerMode>(() => initialSession?.timerMode ?? 'UP');
  const [timeLimit, setTimeLimit] = useState(() => initialSession?.timeLimit ?? 300);

  useEffect(() => {
    let interval: any = null;
    if (gameState === 'PLAYING') {
      interval = setInterval(() => {
        setTime(t => {
          if (timerMode === 'DOWN') {
            return Math.max(0, t - 1);
          }
          return t + 1;
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
        setMessage('時間到！');
      } else {
        setMessage('沒有配對了，結算！');
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
    if (initialSession && difficulty === initialSessionDifficulty.current) {
      return;
    }
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

  const isCardCovered = (row: number, col: number) => (
    isPyramidCardCovered(pyramid, row, col)
  );

  const removeCards = (
    c1Coords: PyramidSelection,
    c2Coords?: PyramidSelection,
  ) => {
    const newPyramid = [...pyramid.map(r => [...r])];
    const newWaste = [...waste];

    const remove = (coords: PyramidSelection) => {
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
      const uncovered: Card[] = [];
      for (let r = 0; r < newPyramid.length; r++) {
        for (let c = 0; c < newPyramid[r].length; c++) {
          const card = newPyramid[r][c];
          if (card && !isPyramidCardCovered(newPyramid, r, c)) {
            uncovered.push(card);
          }
        }
      }
      const deckCards = [...stock, ...newWaste];
      let canMove = false;
      for (const card of uncovered) {
        if (isSingleKingRemovable(card.value)) {
          canMove = true;
          break;
        }
        if (uncovered.some(other => other.id !== card.id && canPairPyramidValues(other.value, card.value))) {
          canMove = true;
          break;
        }
        if (deckCards.some(deckCard => canPairPyramidValues(deckCard.value, card.value))) {
          canMove = true;
          break;
        }
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
        setMessage(m => (m === '消除成功！' ? '' : m));
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
    if (isSingleKingRemovable(clickedCard.value)) {
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

    if (firstCard && canPairPyramidValues(firstCard.value, clickedCard.value)) {
      removeCards(selectedCard, { source, row, col });
    } else {
      // Doesn't sum to 13, switch selection
      setSelectedCard({ source, row, col });
    }
  };

  const isSelected = (source: 'pyramid' | 'waste', row?: number, col?: number) => (
    selectedCard?.source === source && selectedCard?.row === row && selectedCard?.col === col
  );

  const CardComponent = ({
    card,
    selected,
    onClick,
    covered = false,
  }: {
    card: Card;
    selected: boolean;
    onClick?: () => void;
    covered?: boolean;
  }) => {
    const display = getCardDisplay(card.value);
    const suitName = getSuitName(card.suit);
    const stateLabel = covered ? '被覆蓋' : selected ? '已選取' : '可選';

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={covered}
        aria-label={`${suitName} ${display}，${stateLabel}`}
        aria-pressed={selected}
        className={`pyramid-card relative flex h-16 w-11 shrink-0 flex-col items-center justify-center rounded-lg border-2 bg-white shadow-md transition-all sm:h-24 sm:w-16 sm:rounded-xl landscape:h-16 landscape:w-11
          ${selected ? 'z-10 scale-105 border-yellow-400 shadow-lg shadow-yellow-200' : 'border-slate-200'}
          ${covered ? 'cursor-not-allowed border-dashed border-slate-400 bg-slate-200 opacity-75' : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'}
        `}
      >
        <span className={`pyramid-card-value text-base font-bold sm:text-xl landscape:text-base ${getSuitColor(card.suit)}`}>
          {display}
        </span>
        <span className={`pyramid-card-suit text-xl sm:text-3xl landscape:text-xl ${getSuitColor(card.suit)}`}>
          {getSuitSymbol(card.suit)}
        </span>
        {covered && (
          <span aria-hidden="true" className="absolute right-0.5 top-0.5 text-xs font-black text-slate-500">×</span>
        )}
      </button>
    );
  };

  const status = (
    <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
      <span className={`rounded-full px-2 py-1 font-bold text-white ${isAdvanced ? 'bg-amber-500' : 'bg-emerald-600'}`}>
        {isAdvanced ? '進階' : '一般'}
      </span>
      {gameState !== 'SETUP' && (
        <span className="rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-800">
          分數 <strong className="text-emerald-700">{score}</strong>
        </span>
      )}
      {gameState !== 'SETUP' && (
        <span className={`flex items-center rounded-full bg-slate-100 px-2 py-1 font-bold ${timerMode === 'DOWN' && time <= 60 ? 'text-red-600' : 'text-slate-800'}`}>
          <Clock aria-hidden="true" className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {formatTime(time)}
        </span>
      )}
    </div>
  );

  const actions = (
    <>
      <button
        type="button"
        onClick={() => setShowRules(true)}
        aria-label="查看遊戲規則"
        title="查看遊戲規則"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
      >
        <HelpCircle aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        type="button"
        onClick={initGame}
        aria-label="返回設定並重新開始"
        title="返回設定並重新開始"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
      >
        <RotateCcw aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </>
  );

  const setupView = (
    <div className="h-full min-h-0 overflow-hidden bg-emerald-900/95 p-2 lg:p-4">
      <div className="mx-auto flex h-full min-h-0 max-w-lg flex-col overflow-hidden rounded-3xl border border-white/30 bg-white p-4 shadow-xl lg:p-6">
        <h2 className="mb-4 text-center text-2xl font-bold text-slate-800 sm:mb-6">遊戲設定</h2>

        <div className={`min-h-0 flex-1 overflow-y-auto pr-1 ${timerMode === 'DOWN' ? 'grid grid-cols-2 content-start gap-3' : ''}`}>
          <div className={timerMode === 'DOWN' ? 'mb-0' : 'mb-4 lg:mb-6'}>
          <label className="mb-2 block text-sm font-bold text-slate-700 sm:mb-3">計時模式</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTimerMode('UP')}
              className={`min-h-11 rounded-xl px-3 py-2 font-bold transition-colors ${timerMode === 'UP' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              正數計時
            </button>
            <button
              type="button"
              onClick={() => setTimerMode('DOWN')}
              className={`min-h-11 rounded-xl px-3 py-2 font-bold transition-colors ${timerMode === 'DOWN' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              倒數計時
            </button>
          </div>
          </div>

          {timerMode === 'DOWN' && (
            <div className="animate-fade-in">
              <label className="mb-2 block text-sm font-bold text-slate-700">倒數時間</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 5].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setTimeLimit(m * 60); setCustomTime(''); }}
                    className={`min-h-11 rounded-xl px-2 py-2 font-bold transition-colors ${timeLimit === m * 60 && !customTime ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {m} 分
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="999"
                value={customTime}
                onChange={(e) => {
                  setCustomTime(e.target.value);
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) setTimeLimit(val * 60);
                }}
                placeholder="自訂時間 (分鐘)"
                aria-label="自訂倒數時間（分鐘）"
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={startGame}
          className="mt-3 min-h-12 w-full shrink-0 rounded-2xl bg-emerald-500 py-3 text-lg font-bold text-white shadow-lg transition-colors hover:-translate-y-1 hover:bg-emerald-600 hover:shadow-xl"
        >
          開始挑戰
        </button>
      </div>
    </div>
  );

  const playingView = (
    <GridFocusLayout
      className="gap-1 bg-emerald-900/95 p-1 lg:gap-3 lg:p-3"
      playfieldLabel="金字塔主要牌面"
      supportLabel="金字塔遊戲提示"
      playfieldClassName="overflow-hidden"
      supportClassName="overflow-hidden"
      playfield={(
        <div className="pyramid-table flex h-full min-h-0 min-w-0 flex-row gap-1 rounded-2xl bg-emerald-700/80 p-0 text-white shadow-inner lg:gap-3 lg:p-3">
          <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-xl bg-emerald-800/40 p-0" aria-label="金字塔牌面">
            <div className="mx-auto flex min-h-full w-max min-w-full flex-col items-center justify-center py-0.5">
              {pyramid.map((rowCards, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className={`pyramid-row flex justify-center gap-1 ${rowIndex > 0 ? '-mt-[38px]' : ''}`}
                  style={{ zIndex: rowIndex }}
                  aria-label={`金字塔第 ${rowIndex + 1} 層`}
                >
                  {rowCards.map((card, colIndex) => {
                    if (!card) {
                      return (
                        <div
                          key={`empty-${rowIndex}-${colIndex}`}
                          aria-hidden="true"
                          className="pyramid-empty h-16 w-11 shrink-0 sm:h-24 sm:w-16 landscape:h-16 landscape:w-11"
                        />
                      );
                    }
                    const covered = isCardCovered(rowIndex, colIndex);
                    return (
                      <div
                        key={card.id}
                        className="pyramid-card-slot relative shrink-0"
                        style={{ marginRight: colIndex < rowCards.length - 1 ? '-1rem' : '0' }}
                      >
                        <CardComponent
                          card={card}
                          covered={covered}
                          selected={isSelected('pyramid', rowIndex, colIndex)}
                          onClick={() => handleCardClick('pyramid', rowIndex, colIndex)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="pyramid-stock-rail flex w-16 shrink-0 flex-col items-center justify-center gap-1 sm:w-20 sm:gap-2" aria-label="牌堆與廢牌區">
            <span className="text-center text-xs font-bold text-emerald-50">牌堆</span>
            <button
              type="button"
              onClick={drawCard}
              aria-label={stock.length > 0 ? `翻下一張牌，牌堆剩餘 ${stock.length} 張` : waste.length > 0 ? `重新循環廢牌，廢牌 ${waste.length} 張` : '牌堆與廢牌皆空'}
              title={stock.length > 0 ? '翻下一張牌' : '重新循環廢牌'}
              className="pyramid-stock relative flex h-16 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 disabled:opacity-50 sm:h-24 sm:w-16 sm:rounded-xl landscape:h-16 landscape:w-11"
              disabled={gameState !== 'PLAYING'}
            >
              {stock.length > 0 ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-white/50 bg-blue-800 opacity-90 shadow-lg pattern-diagonal-lines pattern-blue-900 pattern-bg-blue-800 pattern-size-4">
                  <RotateCcw aria-hidden="true" className="h-7 w-7 text-white/70" />
                </div>
              ) : (
                <RotateCcw aria-hidden="true" className="h-7 w-7 text-white/70" />
              )}
            </button>
            <span className="text-center text-xs text-emerald-50">{stock.length}</span>

            <span className="mt-1 text-center text-xs font-bold text-emerald-50">廢牌</span>
            <div className="pyramid-waste relative h-16 w-11 shrink-0 sm:h-24 sm:w-16 landscape:h-16 landscape:w-11" aria-label="廢牌區">
              {waste.length > 0 ? (
                <CardComponent
                  card={waste[waste.length - 1]}
                  selected={isSelected('waste')}
                  onClick={() => handleCardClick('waste')}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-white/30">
                  <span className="text-center text-xs text-white/70">空</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      support={(
        <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto rounded-2xl bg-white/95 p-2 text-sm text-slate-700 shadow-lg lg:gap-3 lg:p-4">
          <div>
            <p className="mb-1 font-bold text-emerald-800">操作提示</p>
            <p>選取未被覆蓋的牌，或選取廢牌頂端，再找出合計 13 的組合。</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-2.5">
            <p className="mb-1 font-bold text-emerald-800">可執行動作</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>K（13）可以單獨消除。</li>
              <li>其他兩張牌合計 13 即可配對。</li>
              <li>下方兩張牌都移除後，上層牌才會解鎖。</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="font-bold text-slate-800">計時模式</p>
            <p className="mt-1 text-xs text-slate-600">{timerMode === 'UP' ? '正數計時：完成越快，時間加成越高。' : `倒數計時：剩餘 ${formatTime(time)}。`}</p>
          </div>
          {selectedCard && (
            <p className="rounded-xl bg-amber-50 p-2.5 text-xs font-semibold text-amber-900" role="status">
              已選取一張牌，請選擇可以合計 13 的另一張牌。
            </p>
          )}
        </div>
      )}
      feedback={message || (selectedCard ? '已選取一張牌，請選擇可以合計 13 的另一張牌。' : '選取一張可用的牌開始配對。')}
      feedbackClassName={message ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'text-slate-700'}
    />
  );

  const gameOverView = (
    <div className="h-full min-h-0 overflow-hidden bg-emerald-900/95 p-2 lg:p-6">
      <div className="mx-auto flex h-full min-h-0 max-w-lg items-center justify-center">
        <section className="flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 text-center shadow-xl lg:p-8" aria-label="遊戲結算">
          <h2 className="mb-2 shrink-0 text-2xl font-bold text-emerald-700 lg:mb-6">挑戰結束！</h2>
          <p className="mb-2 shrink-0 text-base font-semibold text-slate-700" role="status">{message}</p>
          {finalScoreStats ? (
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-2 text-left">
              <div className="flex items-center justify-between text-slate-600">
                <span>原始分數</span>
                <span className="text-lg font-bold">{finalScoreStats.base}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>時間加成</span>
                <span className="text-lg font-bold text-amber-500">+{finalScoreStats.bonus}</span>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div className="flex items-center justify-between text-slate-800">
                <span className="font-bold">總分</span>
                <span className="text-3xl font-black text-emerald-600">{finalScoreStats.total}</span>
              </div>
            </div>
          ) : (
            <p className="mb-4 min-h-0 flex-1 text-lg text-slate-600">你的總分是：{score}</p>
          )}
          <button
            type="button"
            onClick={initGame}
            className="mt-2 min-h-12 w-full shrink-0 rounded-full bg-emerald-500 px-8 py-3 font-bold text-white shadow-lg transition-colors hover:bg-emerald-600 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            返回設定
          </button>
        </section>
      </div>
    </div>
  );

  return (
    <GameShell
      title="金字塔接龍"
      subtitle="合計 13，移除金字塔中的所有牌"
      onBack={onBack}
      backLabel="返回遊戲目錄"
      className="desktop-game desktop-game--pyramid bg-emerald-900"
      status={status}
      actions={actions}
    >
      {gameState === 'SETUP' && setupView}
      {gameState === 'PLAYING' && playingView}
      {gameState === 'GAMEOVER' && gameOverView}

      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-2xl sm:max-h-[90dvh] sm:p-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">遊戲規則</h2>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="mb-2 space-y-3 text-sm text-gray-600 sm:mb-6 sm:text-base">
                <p>目標是移除金字塔中所有的牌！</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>只要兩張牌的數字相加等於 <strong>13</strong>，就可以配對消除。</li>
                  <li><span className="font-bold text-red-500">A</span> = 1, <span className="font-bold text-slate-800">J</span> = 11, <span className="font-bold text-red-500">Q</span> = 12, <span className="font-bold text-slate-800">K</span> = 13。</li>
                  <li><span className="font-bold">K</span> 本身就是 13，點擊即可直接消除。</li>
                  <li><strong>翻牌條件</strong>：金字塔中的牌，必須等它正下方的兩張牌都被消除後（不被壓住），才能被選取。</li>
                  <li>如果畫面上沒有組合，可以點擊牌堆翻牌到廢牌區。廢牌區頂端的牌也可以用來配對。</li>
                  <li>牌堆翻完後可以無限次重新循環。</li>
                  <li><strong>遊戲結束</strong>：當你成功清空金字塔時獲勝。如果你發現沒有牌可以配對卡關了，請點擊「返回設定並重新開始」結束這局。</li>
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="min-h-11 w-full rounded-xl bg-emerald-600 py-3 text-lg font-bold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            >
              關閉規則
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
};

export default PyramidGame;
