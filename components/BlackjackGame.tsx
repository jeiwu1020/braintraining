import React, { useState, useEffect } from 'react';
import { GameState, Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, Users, Shield, CheckCircle, Play, HelpCircle } from 'lucide-react';
import { RulesModal } from './RulesModal';

interface BlackjackGameProps {
    onBack: () => void;
    difficulty: Difficulty;
}

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
    suit: Suit;
    rank: Rank;
    value: number;
    color: string;
}

type Mode = 'DEALER' | 'PVP' | null;

const createDeck = (): Card[] => {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];
    for (const suit of suits) {
        const color = (suit === '♥' || suit === '♦') ? 'text-red-600' : 'text-gray-900';
        for (const rank of ranks) {
            let value = parseInt(rank);
            if (rank === 'A') value = 11;
            if (['J', 'Q', 'K'].includes(rank)) value = 10;
            deck.push({ suit, rank, value, color });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
};

const calculateScore = (cards: Card[]): number => {
    let score = 0;
    let aces = 0;
    for (const card of cards) {
        score += card.value;
        if (card.rank === 'A') aces += 1;
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    return score;
};

const CardDisplay: React.FC<{ card: Card, delay?: number }> = ({ card, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.3, delay }}
        className={`w-14 h-20 sm:w-24 sm:h-36 landscape:w-16 landscape:h-24 bg-white rounded-xl shadow-md border-2 border-gray-200 flex flex-col justify-between p-1 sm:p-2 shrink-0 ${card.color}`}
    >
        <div className="text-xs sm:text-lg landscape:text-xs font-bold leading-none">{card.rank}</div>
        <div className="text-xl sm:text-5xl landscape:text-2xl text-center self-center">{card.suit}</div>
        <div className="text-xs sm:text-lg landscape:text-xs font-bold leading-none self-end rotate-180">{card.rank}</div>
    </motion.div>
);

const BlackjackGame: React.FC<BlackjackGameProps> = ({ onBack }) => {
    const [mode, setMode] = useState<Mode>(null);
    const [deck, setDeck] = useState<Card[]>([]);
    
    const [p1Cards, setP1Cards] = useState<Card[]>([]);
    const [p2Cards, setP2Cards] = useState<Card[]>([]);
    
    const [turn, setTurn] = useState<'P1' | 'P2' | 'END'>('P1');
    const [message, setMessage] = useState<string>('');
    
    // PvP Simultaneous Actions
    const [p1Action, setP1Action] = useState<'HIT' | 'STAND' | null>(null);
    const [p2Action, setP2Action] = useState<'HIT' | 'STAND' | null>(null);
    const [p1Stood, setP1Stood] = useState(false);
    const [p2Stood, setP2Stood] = useState(false);

    const [targetRounds, setTargetRounds] = useState(5);
    const [roundIndex, setRoundIndex] = useState(0);
    const [p1RoundScore, setP1RoundScore] = useState(0);
    const [p2RoundScore, setP2RoundScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [showRules, setShowRules] = useState(false);

    const initRound = (newMode: Mode) => {
        const newDeck = createDeck();
        setP1Cards([newDeck[0], newDeck[2]]);
        setP2Cards([newDeck[1], newDeck[3]]);
        setDeck(newDeck.slice(4));
        setTurn('P1');
        setP1Stood(false);
        setP2Stood(false);
        setP1Action(null);
        setP2Action(null);
        if (newMode === 'DEALER') setMessage('A組回合 (合作決定)');
        if (newMode === 'PVP') setMessage('請雙方決定是否補牌');
    };

    const startDealerMode = () => {
        setMode('DEALER');
        setRoundIndex(0);
        setP1RoundScore(0);
        setP2RoundScore(0);
        setGameOver(false);
        initRound('DEALER');
    };

    const startPvPMode = () => {
        setMode('PVP');
        setRoundIndex(0);
        setP1RoundScore(0);
        setP2RoundScore(0);
        setGameOver(false);
        initRound('PVP');
    };

    const nextRound = () => {
        if (roundIndex >= targetRounds - 1) {
            setGameOver(true);
            return;
        }
        setRoundIndex(prev => prev + 1);
        initRound(mode);
    };

    const resolveGame = (cards1: Card[] = p1Cards, cards2: Card[] = p2Cards) => {
        setTurn('END');
        const score1 = calculateScore(cards1);
        const score2 = calculateScore(cards2);
        const p1Bust = score1 > 21;
        const p2Bust = score2 > 21;

        if (p1Bust && p2Bust) {
            setMessage('雙方皆爆牌，平局。');
        } else if (p1Bust) {
            setMessage(mode === 'DEALER' ? 'A組爆牌，B組(電腦)獲勝。' : 'A組爆牌，B組獲勝。');
            setP2RoundScore(prev => prev + 1);
        } else if (p2Bust) {
            setMessage(mode === 'DEALER' ? 'B組(電腦)爆牌，A組獲勝！' : 'B組爆牌，A組獲勝！');
            setP1RoundScore(prev => prev + 1);
        } else if (score1 > score2) {
            setMessage(mode === 'DEALER' ? 'A組點數較大，獲勝！' : 'A組獲勝！');
            setP1RoundScore(prev => prev + 1);
        } else if (score2 > score1) {
            setMessage(mode === 'DEALER' ? 'B組(電腦)點數較大，獲勝。' : 'B組獲勝！');
            setP2RoundScore(prev => prev + 1);
        } else {
            setMessage('點數相同，平局。');
        }
    };

    const executePvPTurn = () => {
        let currentDeck = [...deck];
        let newP1 = [...p1Cards];
        let newP2 = [...p2Cards];
        
        if (p1Action === 'HIT' && !p1Stood) {
            newP1.push(currentDeck[0]);
            currentDeck = currentDeck.slice(1);
        }
        if (p2Action === 'HIT' && !p2Stood) {
            newP2.push(currentDeck[0]);
            currentDeck = currentDeck.slice(1);
        }

        setP1Cards(newP1);
        setP2Cards(newP2);
        setDeck(currentDeck);

        const score1 = calculateScore(newP1);
        const score2 = calculateScore(newP2);

        if (p1Action === 'STAND') setP1Stood(true);
        if (p2Action === 'STAND') setP2Stood(true);

        setP1Action(null);
        setP2Action(null);

        const bust1 = score1 > 21;
        const bust2 = score2 > 21;
        const stand1 = p1Action === 'STAND' || p1Stood;
        const stand2 = p2Action === 'STAND' || p2Stood;

        if ((bust1 || stand1) && (bust2 || stand2)) {
            resolveGame(newP1, newP2);
        } else {
            setMessage('請雙方繼續選擇');
        }
    };

    // Dealer Mode Actions
    const drawCardDealerMode = () => {
        if (deck.length === 0) return;
        const newHand = [...p1Cards, deck[0]];
        setP1Cards(newHand);
        setDeck(deck.slice(1));
        if (calculateScore(newHand) > 21) {
            setTurn('END');
            setMessage('A組爆牌！B組(電腦)獲勝。');
        }
    };

    const handleStandDealerMode = () => {
        setTurn('P2');
        setMessage('B組(電腦)回合...');
    };

    // Dealer auto-play logic
    useEffect(() => {
        if (mode === 'DEALER' && turn === 'P2') {
            const timer = setTimeout(() => {
                if (calculateScore(p2Cards) < 17) {
                    const newHand = [...p2Cards, deck[0]];
                    setP2Cards(newHand);
                    setDeck(deck.slice(1));
                    if (calculateScore(newHand) > 21) {
                        setTurn('END');
                        setMessage('B組(電腦)爆牌！A組獲勝！');
                    }
                } else {
                    resolveGame(p1Cards, p2Cards);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [mode, turn, p2Cards, deck, p1Cards]);


    if (!mode) {
        return (
            <div className="h-full w-full flex flex-col pt-12 sm:pt-24 landscape:pt-8 p-4 sm:p-12 items-center bg-green-50 overflow-y-auto">
                <button onClick={onBack} className="absolute top-2 left-2 sm:top-4 sm:left-4 p-2 sm:p-3 bg-white rounded-full shadow-md text-green-600 hover:bg-green-100 z-10">
                    <ArrowLeft size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="text-center max-w-4xl mx-auto flex flex-col gap-2 sm:gap-6 animate-fade-in w-full">
                    <h1 className="text-2xl sm:text-5xl landscape:text-2xl font-bold text-green-800 flex items-center justify-center shrink-0">
                         公開 21 點
                    </h1>
                    <p className="text-sm sm:text-xl landscape:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto shrink-0">
                        所有牌面皆為翻開狀態的派對撲克。共 {targetRounds} 回合，雙人模式採用「同步決策」機制，雙方各自決定後同時發牌，確保公平！
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 sm:gap-4 bg-white p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-green-100 max-w-xs sm:max-w-md mx-auto shrink-0">
                        <span className="font-bold text-green-800 text-sm sm:text-lg">自訂回合數:</span>
                        <select 
                            value={targetRounds}
                            onChange={(e) => setTargetRounds(Number(e.target.value))}
                            className="bg-green-100 text-green-800 font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl outline-none hover:bg-green-200 transition-colors text-sm sm:text-lg"
                        >
                            {[3, 5, 7, 10].map(r => <option key={r} value={r}>{r} 回合</option>)}
                        </select>
                    </div>

                    <div className="flex flex-row gap-2 sm:gap-6 w-full justify-center shrink-0">
                        <button onClick={startDealerMode} className="flex-1 bg-white p-2 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md sm:shadow-xl border-2 border-blue-200 hover:border-blue-400 hover:-translate-y-1 transition-all flex flex-col items-center justify-center group max-w-[200px] sm:max-w-sm">
                            <div className="w-8 h-8 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-1 sm:mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-4 h-4 sm:w-8 sm:h-8 text-blue-600" />
                            </div>
                            <h2 className="text-sm sm:text-xl font-bold text-gray-800 mb-0.5 sm:mb-2 text-center">合作對抗莊家</h2>
                            <p className="text-[10px] sm:text-sm text-gray-500 text-center leading-tight">全體一起討論對抗電腦莊家</p>
                        </button>
                        
                        <button onClick={startPvPMode} className="flex-1 bg-white p-2 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md sm:shadow-xl border-2 border-orange-200 hover:border-orange-400 hover:-translate-y-1 transition-all flex flex-col items-center justify-center group max-w-[200px] sm:max-w-sm">
                            <div className="w-8 h-8 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-1 sm:mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-4 h-4 sm:w-8 sm:h-8 text-orange-600" />
                            </div>
                            <h2 className="text-sm sm:text-xl font-bold text-gray-800 mb-0.5 sm:mb-2 text-center">雙組同步對抗</h2>
                            <p className="text-[10px] sm:text-sm text-gray-500 text-center leading-tight">雙方決定補停牌系統同時發牌</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const p1Score = calculateScore(p1Cards);
    const p2Score = calculateScore(p2Cards);
    const canExecutePvP = (p1Action !== null || p1Stood || p1Score > 21) && (p2Action !== null || p2Stood || p2Score > 21);

    const renderPlayerAreaPvP = (isP1: boolean, title: string, cards: Card[], score: number, hasStood: boolean, action: 'HIT'|'STAND'|null, setAction: (a: 'HIT'|'STAND')=>void) => {
        const isBusted = score > 21;
        const isDone = isBusted || hasStood || turn === 'END';

        return (
            <div className={`flex-1 flex flex-col items-center p-2 sm:p-4 rounded-3xl transition-all duration-500 relative ${isDone ? 'opacity-80 bg-black/10' : 'bg-white/10'}`}>
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                    <h2 className="text-lg sm:text-2xl landscape:text-xl font-bold flex flex-col items-center">
                        {title}
                        <span className="text-sm font-normal text-green-200">得分: {isP1 ? p1RoundScore : p2RoundScore}</span>
                    </h2>
                    <div className={`px-2 py-1 sm:px-4 sm:py-1 rounded-full font-mono text-sm sm:text-xl landscape:text-lg shadow-md ${isBusted ? 'bg-red-500 text-white' : hasStood ? 'bg-green-500 text-white' : 'bg-black/40 text-white'}`}>
                        {isBusted ? '爆牌' : hasStood ? `${score} 停牌` : `${score} 點`}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-2 min-h-[5rem] sm:min-h-[8rem]">
                    <AnimatePresence>
                        {cards.map((card, idx) => <CardDisplay key={idx} card={card} delay={idx * 0.1} />)}
                    </AnimatePresence>
                </div>

                {!isDone && (
                    <div className="flex gap-2 sm:gap-3 mt-auto">
                        <button 
                            onClick={() => setAction('HIT')}
                            className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl font-bold text-sm sm:text-lg landscape:text-sm shadow-md transition-all ${action === 'HIT' ? 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-200' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                        >
                            <RefreshCw size={16} className="inline mr-1" /> 補牌
                        </button>
                        <button 
                            onClick={() => setAction('STAND')}
                            className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl font-bold text-sm sm:text-lg landscape:text-sm shadow-md transition-all ${action === 'STAND' ? 'bg-gray-400 text-gray-900 ring-4 ring-gray-200' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                        >
                            <CheckCircle size={16} className="inline mr-1" /> 停牌
                        </button>
                    </div>
                )}
                {isDone && turn !== 'END' && (
                    <div className="mt-auto text-yellow-300 font-bold landscape:text-sm">等待中...</div>
                )}
            </div>
        );
    };

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-green-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center animate-fade-in-up border-4 border-green-100 max-w-sm w-full">
                    <div className="text-6xl mb-4 animate-bounce">🏆</div>
                    <h2 className="text-3xl font-bold text-green-900 mb-6">遊戲結束！</h2>
                    
                    <div className="w-full flex justify-around mb-8 p-4 bg-green-50 rounded-2xl">
                        <div className="flex flex-col">
                            <span className="text-slate-600 font-bold mb-1">A組</span>
                            <span className="text-4xl text-green-600 font-black">{p1RoundScore}</span>
                        </div>
                        <div className="w-px bg-green-200"></div>
                        <div className="flex flex-col">
                            <span className="text-slate-600 font-bold mb-1">B組</span>
                            <span className="text-4xl text-green-600 font-black">{p2RoundScore}</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-green-700 mb-6">
                        {p1RoundScore > p2RoundScore ? 'A組獲勝！' : p2RoundScore > p1RoundScore ? 'B組獲勝！' : '雙方平局！'}
                    </h3>

                    <button 
                        onClick={() => setMode(null)}
                        className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-md text-lg active:scale-95"
                    >
                        返回選單
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col p-2 sm:p-6 bg-green-800 text-white relative overflow-hidden">
            <RulesModal 
                isOpen={showRules} 
                onClose={() => setShowRules(false)}
                rules={[
                    `共 ${targetRounds} 回合的 21 點對決。`,
                    "玩家需盡量讓手中的牌點數總和接近 21 點，但不能超過 21 點（爆牌）。",
                    "J、Q、K 算作 10 點，A 可算作 1 點或 11 點。",
                    "雙人對抗模式下，雙方同時決定是否「補牌」或「停牌」，避免後手優勢。",
                    "合作對抗莊家模式下，電腦莊家點數小於 17 點必定補牌。"
                ]}
            />
            
            <div className="flex items-center justify-between mb-2 sm:mb-4 z-10 shrink-0 px-2">
                <div className="flex items-center gap-2">
                    <button onClick={() => setMode(null)} className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <button onClick={() => setShowRules(true)} className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                        <HelpCircle size={20} />
                    </button>
                </div>
                
                <div className="bg-green-900/80 backdrop-blur-md px-4 py-1 sm:px-8 sm:py-3 rounded-full border-2 border-green-600 shadow-xl text-center min-w-[150px] flex flex-col items-center">
                    <div className="text-xs text-green-300 font-bold mb-1">回合 {roundIndex + 1} / {targetRounds}</div>
                    <span className="text-sm sm:text-2xl landscape:text-lg font-bold text-yellow-300 drop-shadow-md">
                        {message}
                    </span>
                </div>

                {turn === 'END' ? (
                    <button onClick={nextRound} className="p-2 sm:p-3 bg-blue-500 hover:bg-blue-400 rounded-full text-white shadow-lg flex items-center gap-2 pr-4 transition-colors text-sm sm:text-base">
                        <RefreshCw size={20} /> <span className="hidden sm:inline font-bold">{roundIndex >= targetRounds - 1 ? '結算' : '下一回合'}</span>
                    </button>
                ) : <div className="w-[88px] sm:w-[130px]"></div>}
            </div>

            <div className="flex-1 flex flex-col landscape:flex-row sm:flex-row gap-2 sm:gap-6 min-h-0 relative">
                
                {mode === 'PVP' ? (
                    <>
                        {renderPlayerAreaPvP(true, 'A組', p1Cards, p1Score, p1Stood, p1Action, setP1Action)}
                        <div className="w-full h-px sm:w-px sm:h-full bg-green-600/50 shrink-0 relative flex items-center justify-center">
                            {turn !== 'END' && canExecutePvP && (
                                <motion.button 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    onClick={executePvPTurn}
                                    className="absolute z-20 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black px-4 py-2 sm:px-6 sm:py-4 rounded-2xl shadow-2xl border-4 border-white flex flex-col items-center active:scale-95"
                                >
                                    <Play size={24} className="mb-1 hidden sm:block" />
                                    <span>執行</span>
                                    <span>回合</span>
                                </motion.button>
                            )}
                        </div>
                        {renderPlayerAreaPvP(false, 'B組', p2Cards, p2Score, p2Stood, p2Action, setP2Action)}
                    </>
                ) : (
                    // DEALER MODE (Legacy layout)
                    <>
                        <div className={`flex-1 flex flex-col items-center justify-center p-2 sm:p-4 rounded-3xl transition-all duration-500 bg-white/10`}>
                             <div className="flex items-center gap-2 mb-2 sm:mb-4">
                                <h2 className="text-lg sm:text-2xl landscape:text-xl font-bold flex flex-col items-center">
                                    A組
                                    <span className="text-sm font-normal text-green-200">得分: {p1RoundScore}</span>
                                </h2>
                                <div className={`px-2 py-1 rounded-full font-mono text-sm sm:text-xl landscape:text-lg shadow-md ${p1Score > 21 ? 'bg-red-500' : 'bg-black/40'}`}>
                                    {p1Score > 21 ? '爆牌' : `${p1Score} 點`}
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-2 min-h-[5rem] sm:min-h-[8rem]">
                                <AnimatePresence>
                                    {p1Cards.map((card, idx) => <CardDisplay key={idx} card={card} delay={idx * 0.1} />)}
                                </AnimatePresence>
                            </div>
                            {turn === 'P1' && (
                                <div className="flex gap-2 sm:gap-3 mt-auto">
                                    <button onClick={drawCardDealerMode} className="px-3 sm:px-6 py-1.5 sm:py-2 bg-yellow-500 text-yellow-900 rounded-xl font-bold landscape:text-sm shadow-md">補牌</button>
                                    <button onClick={handleStandDealerMode} className="px-3 sm:px-6 py-1.5 sm:py-2 bg-gray-600 text-white rounded-xl font-bold landscape:text-sm shadow-md">停牌</button>
                                </div>
                            )}
                        </div>
                        <div className="w-full h-px sm:w-px sm:h-full bg-green-600/50 shrink-0"></div>
                        <div className={`flex-1 flex flex-col items-center justify-center p-2 sm:p-4 rounded-3xl transition-all duration-500 ${turn === 'P2' ? 'bg-white/10' : 'opacity-70'}`}>
                             <div className="flex items-center gap-2 mb-2 sm:mb-4">
                                <h2 className="text-lg sm:text-2xl landscape:text-xl font-bold flex flex-col items-center">
                                    B組(電腦)
                                    <span className="text-sm font-normal text-green-200">得分: {p2RoundScore}</span>
                                </h2>
                                <div className="px-2 py-1 rounded-full font-mono text-sm sm:text-xl landscape:text-lg bg-black/40 shadow-md">
                                    {p2Score} 點
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-2 min-h-[5rem] sm:min-h-[8rem]">
                                <AnimatePresence>
                                    {p2Cards.map((card, idx) => <CardDisplay key={idx} card={card} delay={idx * 0.1} />)}
                                </AnimatePresence>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BlackjackGame;
