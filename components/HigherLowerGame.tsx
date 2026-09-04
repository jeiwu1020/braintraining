import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, RefreshCw, Play, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HigherLowerGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

export const SUITS = [
    { symbol: '♠️', name: '黑桃', value: 4, color: 'text-slate-800' },
    { symbol: '♥️', name: '紅心', value: 3, color: 'text-red-500' },
    { symbol: '♦️', name: '方塊', value: 2, color: 'text-red-500' },
    { symbol: '♣️', name: '梅花', value: 1, color: 'text-slate-800' }
];

export interface CardData {
    value: number; // 1-13 for standard, 99 for joker
    suitSymbol: string;
    suitValue: number;
    color: string;
    display: string;
    absoluteValue: number;
    isJoker: boolean;
}

export type Choice = 'HIGHER' | 'LOWER' | 'PASS' | null;

export const MAX_ROUNDS = 10;

type SelectedChoice = Exclude<Choice, null>;
type ComparableCard = Pick<CardData, 'absoluteValue' | 'isJoker'>;

export interface RoundResult {
  aMsg: string;
  bMsg: string;
  mainMsg: string;
  aDelta: number;
  bDelta: number;
}

export const buildHigherLowerDeck = (
  isAdvanced: boolean,
  random: () => number = Math.random,
): CardData[] => {
  const newDeck: CardData[] = [];
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
        isJoker: false,
      });
    }
  }

  if (isAdvanced) {
    newDeck.push({
      value: 99, suitSymbol: '🃏', suitValue: 5, color: 'text-purple-600', display: 'JOKER', absoluteValue: 999, isJoker: true,
    });
    newDeck.push({
      value: 99, suitSymbol: '🃏', suitValue: 5, color: 'text-orange-500', display: 'JOKER', absoluteValue: 999, isJoker: true,
    });
  }

  const shuffled = newDeck.sort(() => 0.5 - random());

  if (isAdvanced) {
    const last11 = shuffled.slice(-11);
    const hasJoker = last11.some(card => card.isJoker);
    if (!hasJoker) {
      const jokerIndex = shuffled.findIndex(card => card.isJoker);
      const swapIndex = shuffled.length - 11 + Math.floor(random() * 10);
      const temp = shuffled[jokerIndex];
      shuffled[jokerIndex] = shuffled[swapIndex];
      shuffled[swapIndex] = temp;
    }
    if (shuffled[shuffled.length - 1].isJoker) {
      const normalIndex = shuffled.findIndex(card => !card.isJoker);
      const temp = shuffled[normalIndex];
      shuffled[normalIndex] = shuffled[shuffled.length - 1];
      shuffled[shuffled.length - 1] = temp;
    }
  }

  return shuffled;
};

export const drawNextCard = (deck: CardData[], currentCard: CardData) => {
  const newDeck = [...deck];
  let nextCard = newDeck.pop()!;
  const skippedCards: CardData[] = [];

  while (nextCard && !nextCard.isJoker && !currentCard.isJoker && nextCard.value === currentCard.value) {
    skippedCards.push(nextCard);
    nextCard = newDeck.pop()!;
  }

  if (!nextCard) nextCard = skippedCards.pop()!;
  if (skippedCards.length > 0) newDeck.unshift(...skippedCards);

  return { deck: newDeck, nextCard };
};

export const resolveHigherLowerRound = (
  currentCard: ComparableCard,
  nextCard: ComparableCard,
  teamAChoice: SelectedChoice,
  teamBChoice: SelectedChoice,
): RoundResult => {
  if (nextCard.isJoker) {
    return {
      mainMsg: '幸運鬼牌！雙方直接加20分！🎉',
      aMsg: '+20',
      bMsg: '+20',
      aDelta: 20,
      bDelta: 20,
    };
  }

  const isHigher = nextCard.absoluteValue > currentCard.absoluteValue;
  const getTeamResult = (choice: SelectedChoice) => {
    if (choice === 'PASS') return { msg: '0 (Pass)', delta: 0 };
    const isCorrect = (choice === 'HIGHER' && isHigher) || (choice === 'LOWER' && !isHigher);
    return isCorrect ? { msg: '+10', delta: 10 } : { msg: '-10', delta: -10 };
  };
  const aResult = getTeamResult(teamAChoice);
  const bResult = getTeamResult(teamBChoice);

  return {
    aMsg: aResult.msg,
    bMsg: bResult.msg,
    mainMsg: isHigher ? '結果是... 更大！' : '結果是... 更小！',
    aDelta: aResult.delta,
    bDelta: bResult.delta,
  };
};

const HigherLowerGame: React.FC<HigherLowerGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const maxRounds = MAX_ROUNDS;

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

  const generateDeck = (): CardData[] => buildHigherLowerDeck(isAdvanced);

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

       const { deck: newDeck, nextCard } = drawNextCard(deck, currentCard);

      setDeck(newDeck);
      setPreviousCard(currentCard);
      setCurrentCard(nextCard);
      
       const { aMsg, bMsg, mainMsg, aDelta, bDelta } = resolveHigherLowerRound(
           currentCard,
           nextCard,
           teamAChoice,
           teamBChoice,
       );

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
    <div
      data-higher-lower-root="true"
      className="higher-lower-root relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-green-50"
    >
      <div data-higher-lower-safe-stage="true" className="app-safe-screen h-full w-full">
        <div
          data-higher-lower-layout="true"
          className="higher-lower-layout flex h-full min-h-0 flex-col items-center gap-3 overflow-hidden px-4 py-3"
        >
      <header data-higher-lower-header="true" className="higher-lower-header flex w-full max-w-4xl shrink-0 items-center justify-between gap-3">
        <button
          onClick={onBack}
          aria-label="返回遊戲選單"
          className="min-h-11 min-w-11 rounded-full bg-white p-2.5 text-gray-600 shadow-md transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="higher-lower-title-group flex items-center justify-center gap-2 text-center">
          <h2 className="higher-lower-title text-2xl font-bold text-green-800">步步高升 (猜大小)</h2>
          <button
            onClick={() => setShowRules(true)}
            aria-label="查看遊戲規則"
            className="min-h-11 min-w-11 rounded-full text-green-600 transition-colors hover:text-green-800"
          >
             <HelpCircle size={24} />
          </button>
        </div>
        <button
          onClick={initGame}
          aria-label="重新開始"
          className="min-h-11 min-w-11 rounded-full bg-green-500 p-2.5 text-white shadow-md transition-colors hover:bg-green-600"
        >
          <RefreshCw size={24} />
        </button>
      </header>

      <main className="higher-lower-card flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center overflow-hidden rounded-3xl bg-white p-4 shadow-lg">
        
        {/* Header / Score Board */}
        <div data-higher-lower-scoreboard="true" className="higher-lower-scoreboard flex w-full shrink-0 items-center justify-between gap-4 px-2 pb-3">
            <div className={`higher-lower-team higher-lower-team-a flex flex-1 flex-col rounded-2xl border-4 p-2 transition-colors sm:p-4
                ${teamAChoice ? 'bg-blue-100 border-blue-400' : 'bg-blue-50 border-blue-200'}`}>
                <div className="higher-lower-team-header flex items-center justify-between gap-2">
                    <span className="higher-lower-team-name text-lg font-bold text-blue-800 sm:text-xl">A 組</span>
                    <span className="higher-lower-team-score text-3xl font-black text-blue-600">{teamAScore}</span>
                </div>
                {gameState === 'BETTING' && (
                    <div className="higher-lower-choice-row flex w-full gap-2">
                        <button 
                            onClick={() => setTeamAChoice('HIGHER')}
                            aria-label="A 組選擇大"
                            aria-pressed={teamAChoice === 'HIGHER'}
                            className={`higher-lower-choice min-h-11 min-w-0 flex-1 rounded-lg px-2 py-2 font-bold ${teamAChoice === 'HIGHER' ? 'bg-rose-500 text-white ring-2 ring-rose-700 ring-offset-1' : 'border border-gray-300 bg-white text-gray-500'}`}
                        >
                            <ArrowUpCircle className="higher-lower-choice-icon" size={20} /> 大
                        </button>
                        <button 
                            onClick={() => setTeamAChoice('PASS')}
                            aria-label="A 組選擇 PASS"
                            aria-pressed={teamAChoice === 'PASS'}
                            className={`higher-lower-choice min-h-11 min-w-0 flex-1 rounded-lg px-2 py-2 font-bold ${teamAChoice === 'PASS' ? 'bg-slate-500 text-white ring-2 ring-slate-700 ring-offset-1' : 'border border-gray-300 bg-white text-gray-500'}`}
                        >
                            PASS
                        </button>
                        <button 
                            onClick={() => setTeamAChoice('LOWER')}
                            aria-label="A 組選擇小"
                            aria-pressed={teamAChoice === 'LOWER'}
                            className={`higher-lower-choice min-h-11 min-w-0 flex-1 rounded-lg px-2 py-2 font-bold ${teamAChoice === 'LOWER' ? 'bg-indigo-500 text-white ring-2 ring-indigo-700 ring-offset-1' : 'border border-gray-300 bg-white text-gray-500'}`}
                        >
                            <ArrowDownCircle className="higher-lower-choice-icon" size={20} /> 小
                        </button>
                    </div>
                )}
                {gameState === 'REVEAL' && (
                    <div className="higher-lower-reveal-content flex min-h-10 items-center justify-between gap-2">
                        <span className="higher-lower-reveal-choice min-w-0 text-sm font-bold text-gray-500">選擇: {teamAChoice === 'HIGHER' ? '大' : (teamAChoice === 'LOWER' ? '小' : (teamAChoice === 'PASS' ? 'PASS' : '無'))}</span>
                        <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`higher-lower-reveal-delta shrink-0 text-2xl font-black ${roundResult.aMsg.includes('+') ? 'text-green-600' : roundResult.aMsg.includes('-') ? 'text-red-500' : 'text-gray-500'}`}
                        >
                            {roundResult.aMsg}
                        </motion.span>
                    </div>
                )}
            </div>
            
            <div className="higher-lower-round flex shrink-0 flex-col items-center">
                <span className="text-sm font-bold text-gray-400">回合</span>
                <span className="higher-lower-round-value rounded-xl bg-green-100 px-3 py-2 text-2xl font-black text-green-700 sm:text-3xl">{round} / {maxRounds}</span>
            </div>

            <div className={`higher-lower-team higher-lower-team-b flex flex-1 flex-col rounded-2xl border-4 p-2 transition-colors sm:p-4
                ${teamBChoice ? 'bg-red-100 border-red-400' : 'bg-red-50 border-red-200'}`}>
                <div className="higher-lower-team-header flex items-center justify-between gap-2">
                    <span className="higher-lower-team-name text-lg font-bold text-red-800 sm:text-xl">B 組</span>
                    <span className="higher-lower-team-score text-3xl font-black text-red-600">{teamBScore}</span>
                </div>
                {gameState === 'BETTING' && (
                    <div className="higher-lower-choice-row flex w-full gap-2">
                        <button 
                            onClick={() => setTeamBChoice('HIGHER')}
                            aria-label="B 組選擇大"
                            aria-pressed={teamBChoice === 'HIGHER'}
                            className={`higher-lower-choice min-h-11 min-w-0 flex-1 rounded-lg px-2 py-2 font-bold ${teamBChoice === 'HIGHER' ? 'bg-rose-500 text-white ring-2 ring-rose-700 ring-offset-1' : 'border border-gray-300 bg-white text-gray-500'}`}
                        >
                            <ArrowUpCircle className="higher-lower-choice-icon" size={20} /> 大
                        </button>
                        <button 
                            onClick={() => setTeamBChoice('PASS')}
                            aria-label="B 組選擇 PASS"
                            aria-pressed={teamBChoice === 'PASS'}
                            className={`higher-lower-choice min-h-11 min-w-0 flex-1 rounded-lg px-2 py-2 font-bold ${teamBChoice === 'PASS' ? 'bg-slate-500 text-white ring-2 ring-slate-700 ring-offset-1' : 'border border-gray-300 bg-white text-gray-500'}`}
                        >
                            PASS
                        </button>
                        <button 
                            onClick={() => setTeamBChoice('LOWER')}
                            aria-label="B 組選擇小"
                            aria-pressed={teamBChoice === 'LOWER'}
                            className={`higher-lower-choice min-h-11 min-w-0 flex-1 rounded-lg px-2 py-2 font-bold ${teamBChoice === 'LOWER' ? 'bg-indigo-500 text-white ring-2 ring-indigo-700 ring-offset-1' : 'border border-gray-300 bg-white text-gray-500'}`}
                        >
                            <ArrowDownCircle className="higher-lower-choice-icon" size={20} /> 小
                        </button>
                    </div>
                )}
                {gameState === 'REVEAL' && (
                    <div className="higher-lower-reveal-content flex min-h-10 items-center justify-between gap-2">
                        <span className="higher-lower-reveal-choice min-w-0 text-sm font-bold text-gray-500">選擇: {teamBChoice === 'HIGHER' ? '大' : (teamBChoice === 'LOWER' ? '小' : (teamBChoice === 'PASS' ? 'PASS' : '無'))}</span>
                        <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`higher-lower-reveal-delta shrink-0 text-2xl font-black ${roundResult.bMsg.includes('+') ? 'text-green-600' : roundResult.bMsg.includes('-') ? 'text-red-500' : 'text-gray-500'}`}
                        >
                            {roundResult.bMsg}
                        </motion.span>
                    </div>
                )}
            </div>
        </div>

        {gameState === 'GAMEOVER' ? (
            <section data-higher-lower-gameover="true" className="higher-lower-gameover flex min-h-0 w-full flex-1 flex-col items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="higher-lower-gameover-card w-full max-w-md rounded-3xl border-4 border-green-300 bg-green-100 p-8 text-center">
                    <h3 className="higher-lower-gameover-title mb-6 text-4xl font-black text-green-800">遊戲結束！</h3>
                    <div className="higher-lower-final-scores mb-8 flex justify-around">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-blue-800">A 組</span>
                            <span className="higher-lower-final-score text-6xl font-black text-blue-600">{teamAScore}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-red-800">B 組</span>
                            <span className="higher-lower-final-score text-6xl font-black text-red-600">{teamBScore}</span>
                        </div>
                    </div>
                    {teamAScore > teamBScore && <p className="higher-lower-winner text-3xl font-black text-blue-600">A 組獲勝！🎉</p>}
                    {teamBScore > teamAScore && <p className="higher-lower-winner text-3xl font-black text-red-600">B 組獲勝！🎉</p>}
                    {teamAScore === teamBScore && <p className="higher-lower-winner text-3xl font-black text-yellow-600">平手！🤝</p>}
                    <button onClick={initGame} className="higher-lower-replay mt-8 min-h-11 rounded-xl bg-green-500 px-8 py-4 text-xl font-bold text-white transition-all hover:scale-105 hover:bg-green-600">再玩一次</button>
                </motion.div>
            </section>
        ) : (
            <section className="higher-lower-play flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3">
                {/* Cards Area */}
                 <div data-higher-lower-card-stage="true" className="higher-lower-card-stage flex min-h-0 w-full flex-1 flex-row items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-inner sm:gap-12 sm:py-8">
                     <div className="higher-lower-card-group flex items-center justify-center gap-4 sm:gap-12">
                     {/* Previous Card (Small) */}
                    <div className="higher-lower-previous flex origin-right scale-75 flex-col items-center opacity-60 sm:scale-100">
                        <span className="higher-lower-card-label mb-2 font-bold text-gray-500">上一張</span>
                        <div className="higher-lower-previous-card relative flex h-36 w-24 flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white shadow-md sm:h-48 sm:w-32">
                            {previousCard ? (
                                previousCard.isJoker ? (
                                    <span className="higher-lower-previous-joker text-5xl">{previousCard.suitSymbol}</span>
                                ) : (
                                    <>
                                        <span className={`higher-lower-previous-rank text-3xl font-black sm:text-4xl ${previousCard.color}`}>{previousCard.display}</span>
                                        <span className="higher-lower-previous-suit mt-2 text-4xl sm:text-5xl">{previousCard.suitSymbol}</span>
                                    </>
                                )
                            ) : (
                                <span className="text-gray-300 font-bold">無</span>
                            )}
                        </div>
                    </div>

                    {/* Current Card (Large) */}
                    <div className="flex flex-col items-center">
                        <span className="higher-lower-card-label mb-2 text-lg font-bold text-green-700 sm:text-xl">現在的牌</span>
                        <AnimatePresence mode="popLayout">
                            <motion.div 
                                key={currentCard?.display + (currentCard?.suitSymbol || '')}
                                initial={{ x: 100, opacity: 0, rotateY: 90 }}
                                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="higher-lower-current-card relative flex h-60 w-40 shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border-4 border-gray-200 bg-white shadow-xl sm:h-72 sm:w-48"
                            >
                                {currentCard && (
                                    currentCard.isJoker ? (
                                        <div className="flex flex-col items-center justify-center h-full w-full bg-purple-50">
                                            <span className="higher-lower-current-joker text-8xl">{currentCard.suitSymbol}</span>
                                            <span className={`higher-lower-current-joker-label mt-4 text-3xl font-black ${currentCard.color}`}>{currentCard.display}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`higher-lower-current-corner absolute left-2 top-2 flex flex-col items-center sm:left-3 sm:top-3 ${currentCard.color}`}>
                                                <span className="font-black">{currentCard.display}</span>
                                                <span>{currentCard.suitSymbol}</span>
                                            </div>
                                            <span className={`higher-lower-current-rank font-black ${currentCard.color}`}>{currentCard.display}</span>
                                            <span className="higher-lower-current-suit mt-2 sm:mt-4">{currentCard.suitSymbol}</span>
                                            <div className={`higher-lower-current-corner absolute bottom-2 right-2 flex flex-col items-center rotate-180 sm:bottom-3 sm:right-3 ${currentCard.color}`}>
                                                <span className="font-black">{currentCard.display}</span>
                                                <span>{currentCard.suitSymbol}</span>
                                            </div>
                                        </>
                                    )
                                )}
                            </motion.div>
                         </AnimatePresence>
                     </div>
                     </div>
                 </div>
                
                {/* Center Control / Result Area */}
                <div data-higher-lower-action="true" className="higher-lower-action flex h-24 w-full shrink-0 items-center justify-center">
                    {gameState === 'BETTING' ? (
                        <button
                            onClick={handleReveal}
                            disabled={!teamAChoice || !teamBChoice}
                            aria-label="開牌！"
                             className={`higher-lower-action-button higher-lower-action-button--reveal inline-flex min-h-12 min-w-[10rem] items-center justify-center whitespace-nowrap rounded-2xl px-6 py-3 text-xl font-black transition-all
                                ${teamAChoice && teamBChoice 
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl hover:scale-105' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Play className="higher-lower-action-icon" size={28} />
                            開牌！
                        </button>
                    ) : (
                         <div className="higher-lower-action-bar flex w-full min-w-0 items-center justify-center gap-3">
                             <span className={`higher-lower-result min-w-0 flex-1 text-center text-3xl font-black text-green-700 ${roundResult.mainMsg.includes('幸運鬼牌') ? 'higher-lower-result--joker' : ''}`}>{roundResult.mainMsg}</span>
                             <button
                                onClick={handleNextRound}
                                aria-label={round >= maxRounds ? '查看結果' : '下一回合'}
                                 className="higher-lower-action-button higher-lower-action-button--next inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl bg-emerald-500 px-5 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-emerald-600"
                            >
                                {round >= maxRounds ? '查看結果' : '下一回合'} <ArrowLeft className="rotate-180" size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        )}
      </main>
        </div>
      </div>

      {showRules && (
          <div data-higher-lower-rules="true" className="higher-lower-rules fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="app-safe-screen higher-lower-rules-safe-stage h-full w-full">
                  <div className="higher-lower-rules-positioner flex h-full w-full items-center justify-center p-4">
                      <motion.div
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="higher-lower-rules-title"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="higher-lower-rules-dialog relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                      >
                  <div className="flex items-start justify-between gap-3">
                  <h3 id="higher-lower-rules-title" className="mb-4 flex items-center gap-2 text-2xl font-black text-green-800">
                      <HelpCircle size={28} /> 遊戲規則
                  </h3>
                  <button onClick={() => setShowRules(false)} aria-label="關閉遊戲規則" className="min-h-11 min-w-11 shrink-0 rounded-full text-gray-400 transition-colors hover:text-gray-600">
                      <X size={28} />
                  </button>
                  </div>
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
                  <button onClick={() => setShowRules(false)} className="higher-lower-rules-ack mt-6 min-h-11 w-full rounded-xl bg-green-500 py-3 text-lg font-bold text-white transition-colors hover:bg-green-600">
                      我明白了
                  </button>
                      </motion.div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HigherLowerGame;
