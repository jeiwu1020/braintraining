import React, { useState, useEffect } from 'react';
import { GameState, Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, HelpCircle, Trophy } from 'lucide-react';

interface GuessCardGameProps {
    onBack: () => void;
    difficulty: Difficulty;
}

interface CardType {
    id: number;
    color: 'RED' | 'BLACK';
    suit: '♥' | '♦' | '♠' | '♣';
    value: string;
    isEliminated: boolean;
}

const SUITS = ['♥', '♦', '♠', '♣'] as const;
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const getNumValue = (val: string): number => {
    if (val === 'A') return 1;
    if (val === 'J') return 11;
    if (val === 'Q') return 12;
    if (val === 'K') return 13;
    return parseInt(val);
};

const generateCards = (difficulty: Difficulty): CardType[] => {
    const isNormal = difficulty === 'NORMAL';
    // 簡單模式 24 張 (A~6)，進階模式 52 張 (全牌)
    const pool = isNormal ? ['A', '2', '3', '4', '5', '6'] : VALUES;
    const cards: CardType[] = [];

    for (const suit of SUITS) {
        for (const value of pool) {
            cards.push({
                id: cards.length,
                color: (suit === '♥' || suit === '♦') ? 'RED' : 'BLACK',
                suit,
                value,
                isEliminated: false
            });
        }
    }
    return cards.sort(() => Math.random() - 0.5);
};

const GuessCardGame: React.FC<GuessCardGameProps> = ({ onBack, difficulty }) => {
    const [cards, setCards] = useState<CardType[]>([]);
    const [targetCard, setTargetCard] = useState<CardType | null>(null);
    const [score, setScore] = useState(100);
    const [lastAnswer, setLastAnswer] = useState<{q: string, ans: boolean, isGuess?: boolean} | null>(null);
    const [showDialog, setShowDialog] = useState<{q: string, ans: boolean, isGuess?: boolean} | null>(null);
    const [isWon, setIsWon] = useState(false);

    // Dynamic question states
    const [compareOp, setCompareOp] = useState<'>'|'<'|'=='>('>');
    const [compareVal, setCompareVal] = useState<string>('7');

    useEffect(() => {
        initGame();
    }, [difficulty]);

    const initGame = () => {
        const newCards = generateCards(difficulty);
        setCards(newCards);
        setTargetCard(newCards[Math.floor(Math.random() * newCards.length)]);
        setScore(100);
        setLastAnswer(null);
        setShowDialog(null);
        setIsWon(false);
    };

    const handleDirectGuess = (card: CardType) => {
        if (!targetCard || isWon || showDialog || card.isEliminated) return;
        
        const isCorrect = card.id === targetCard.id;
        setShowDialog({ q: `直接猜測：${card.suit}${card.value}`, ans: isCorrect, isGuess: true });
        
        setTimeout(() => {
            setShowDialog(null);
            if (isCorrect) {
                setCards(prev => prev.map(c => c.id === card.id ? c : { ...c, isEliminated: true }));
                setIsWon(true);
            } else {
                setCards(prev => prev.map(c => c.id === card.id ? { ...c, isEliminated: true } : c));
                setScore(prev => prev - 30);
                setLastAnswer({ q: `猜測 ${card.suit}${card.value}`, ans: false, isGuess: true });
            }
        }, 2500);
    };

    const processQuestion = (label: string, condition: (c: CardType) => boolean) => {
        if (!targetCard || isWon || showDialog) return;
        
        const answer = condition(targetCard);
        
        // 1. Show the dialog with the question and computer's answer
        setShowDialog({ q: label, ans: answer });
        
        // 2. Wait 2.5 seconds, then hide dialog and eliminate cards
        setTimeout(() => {
            setShowDialog(null);
            
            setCards(prevCards => {
                const newCards = prevCards.map(c => {
                    if (c.isEliminated) return c;
                    const match = condition(c);
                    // If the card doesn't match the truth of the answer, eliminate it
                    if (answer !== match) {
                        return { ...c, isEliminated: true };
                    }
                    return c;
                });

                const remaining = newCards.filter(c => !c.isEliminated);
                if (remaining.length === 1 && remaining[0].id === targetCard.id) {
                    setIsWon(true);
                }

                return newCards;
            });

            setScore(prev => prev - 10); // Deduct points for asking
            setLastAnswer({ q: label, ans: answer });
            
        }, 2500);
    };

    const handleQuickAsk = (type: string) => {
        if (showDialog) return;
        switch (type) {
            case 'RED': processQuestion('是紅色的嗎？(♥/♦)', c => c.color === 'RED'); break;
            case 'BLACK': processQuestion('是黑色的嗎？(♠/♣)', c => c.color === 'BLACK'); break;
            case 'HEART': processQuestion('是愛心嗎？(♥)', c => c.suit === '♥'); break;
            case 'SPADE': processQuestion('是黑桃嗎？(♠)', c => c.suit === '♠'); break;
            case 'DIAMOND': processQuestion('是方塊嗎？(♦)', c => c.suit === '♦'); break;
            case 'CLUB': processQuestion('是梅花嗎？(♣)', c => c.suit === '♣'); break;
            case 'EVEN': processQuestion('數字是雙數嗎？(2,4,6,8,10,Q)', c => getNumValue(c.value) % 2 === 0); break;
            case 'ODD': processQuestion('數字是單數嗎？(A,3,5,7,9,J,K)', c => getNumValue(c.value) % 2 !== 0); break;
            case 'FACE': processQuestion('是字母牌嗎？(J,Q,K,A)', c => ['J','Q','K','A'].includes(c.value)); break;
            case 'NUM': processQuestion('是純數字嗎？(2~10)', c => !['J','Q','K','A'].includes(c.value)); break;
        }
    };

    const handleNumberAsk = () => {
        if (showDialog) return;
        const valNum = getNumValue(compareVal);
        let label = '';
        let cond: (c: CardType) => boolean;

        if (compareOp === '>') {
            label = `數字大於 ${compareVal} 嗎？`;
            cond = c => getNumValue(c.value) > valNum;
        } else if (compareOp === '<') {
            label = `數字小於 ${compareVal} 嗎？`;
            cond = c => getNumValue(c.value) < valNum;
        } else {
            label = `數字等於 ${compareVal} 嗎？`;
            cond = c => getNumValue(c.value) === valNum;
        }
        processQuestion(label, cond);
    };

    const gridClass = difficulty === 'NORMAL' 
        ? "grid-cols-6 sm:grid-cols-8 landscape:grid-cols-8 max-w-4xl" 
        : "grid-cols-7 sm:grid-cols-10 lg:grid-cols-[13] max-w-6xl";

    return (
        <div className="h-full w-full flex flex-col p-2 sm:p-6 bg-blue-50 relative overflow-hidden">
            
            {/* Dialog Overlay for Answers */}
            <AnimatePresence>
                {showDialog && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md mx-4 text-center border-4 border-blue-200"
                        >
                            <HelpCircle size={48} className="text-blue-500 mb-4 animate-bounce" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">{showDialog.q}</h2>
                            
                            <div className="flex flex-col items-center gap-3 bg-slate-100 px-8 py-4 rounded-2xl w-full">
                                <span className="text-gray-500 font-bold text-sm">
                                    {showDialog.isGuess ? '猜測結果' : '系統回答'}
                                </span>
                                <span className={`text-3xl sm:text-5xl font-black ${showDialog.ans ? 'text-green-500' : 'text-red-500'}`}>
                                    {showDialog.isGuess 
                                        ? (showDialog.ans ? '🎉 答對了！' : '❌ 猜錯了！ (-30分)')
                                        : (showDialog.ans ? '⭕ 是的' : '❌ 不是')}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-2 sm:mb-4 shrink-0 px-2">
                <button onClick={onBack} className="p-2 sm:p-3 bg-white rounded-full shadow-md text-blue-600 hover:bg-blue-100 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-xl sm:text-3xl font-bold text-blue-900">邏輯猜牌</h1>
                    <span className="text-xs sm:text-sm text-blue-600 font-bold hidden sm:block mt-1">發問扣10分 / 點擊卡牌盲猜錯扣30分</span>
                </div>
                <button onClick={initGame} className="p-2 sm:p-3 bg-white rounded-full shadow-md text-blue-600 hover:bg-blue-100 transition-colors">
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex flex-col landscape:flex-row gap-2 sm:gap-4 min-h-0">
                
                {/* Left Panel: Questions (33% on landscape) */}
                <div className="w-full landscape:w-1/3 flex flex-col gap-2 shrink-0 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-blue-100 min-h-0">
                    <div className="flex justify-between items-center mb-1 sm:mb-2 px-1">
                        <span className="font-bold text-blue-800 flex items-center gap-1 text-sm sm:text-base"><HelpCircle size={16}/> 發問區</span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs sm:text-sm">分數: {score}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 sm:gap-4">
                        
                        {/* 快速分類 */}
                        <div>
                            <div className="text-xs font-bold text-gray-400 mb-2">顏色與奇偶</div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={()=>handleQuickAsk('RED')} disabled={isWon || !!showDialog} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 disabled:opacity-50 active:scale-95">紅色</button>
                                <button onClick={()=>handleQuickAsk('BLACK')} disabled={isWon || !!showDialog} className="px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50 active:scale-95">黑色</button>
                                <button onClick={()=>handleQuickAsk('EVEN')} disabled={isWon || !!showDialog} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-100 disabled:opacity-50 active:scale-95">雙數</button>
                                <button onClick={()=>handleQuickAsk('ODD')} disabled={isWon || !!showDialog} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-100 disabled:opacity-50 active:scale-95">單數</button>
                            </div>
                        </div>
                        
                        <div>
                            <div className="text-xs font-bold text-gray-400 mb-2">字母與數字</div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={()=>handleQuickAsk('FACE')} disabled={isWon || !!showDialog} className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-100 disabled:opacity-50 active:scale-95">字母(J,Q,K,A)</button>
                                <button onClick={()=>handleQuickAsk('NUM')} disabled={isWon || !!showDialog} className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold hover:bg-teal-100 disabled:opacity-50 active:scale-95">數字(2~10)</button>
                            </div>
                        </div>

                        {/* 花色 */}
                        <div>
                            <div className="text-xs font-bold text-gray-400 mb-2">單一花色</div>
                            <div className="flex gap-2">
                                <button onClick={()=>handleQuickAsk('SPADE')} disabled={isWon || !!showDialog} className="flex-1 py-1.5 border border-gray-200 rounded-lg text-lg hover:bg-gray-50 disabled:opacity-50">♠</button>
                                <button onClick={()=>handleQuickAsk('HEART')} disabled={isWon || !!showDialog} className="flex-1 py-1.5 border border-red-200 text-red-600 rounded-lg text-lg hover:bg-red-50 disabled:opacity-50">♥</button>
                                <button onClick={()=>handleQuickAsk('DIAMOND')} disabled={isWon || !!showDialog} className="flex-1 py-1.5 border border-red-200 text-red-600 rounded-lg text-lg hover:bg-red-50 disabled:opacity-50">♦</button>
                                <button onClick={()=>handleQuickAsk('CLUB')} disabled={isWon || !!showDialog} className="flex-1 py-1.5 border border-gray-200 rounded-lg text-lg hover:bg-gray-50 disabled:opacity-50">♣</button>
                            </div>
                        </div>

                        {/* 自訂數字 */}
                        <div>
                            <div className="text-xs font-bold text-gray-400 mb-2">精確數字範圍</div>
                            <div className="flex gap-2 items-center">
                                <select 
                                    value={compareOp} onChange={(e) => setCompareOp(e.target.value as any)}
                                    className="border-2 border-blue-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value=">">大於</option>
                                    <option value="<">小於</option>
                                    <option value="==">等於</option>
                                </select>
                                <select 
                                    value={compareVal} onChange={(e) => setCompareVal(e.target.value)}
                                    className="border-2 border-blue-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
                                >
                                    {VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <button 
                                    onClick={handleNumberAsk} disabled={isWon || !!showDialog}
                                    className="ml-auto bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50"
                                >
                                    發問
                                </button>
                            </div>
                        </div>

                    </div>
                    
                    {/* Feedback Area / Win State */}
                    {isWon && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 p-2 sm:p-3 bg-green-500 rounded-xl text-center shadow-lg text-white shrink-0 flex items-center justify-center gap-3"
                        >
                            <Trophy size={24} className="text-yellow-300" />
                            <div className="text-sm sm:text-base font-bold">成功找出目標！得分: {score}</div>
                        </motion.div>
                    )}
                </div>

                {/* Right Panel: Cards Grid (66% on landscape) */}
                <div className="flex-1 bg-white/50 rounded-2xl sm:rounded-3xl p-2 sm:p-4 overflow-y-auto min-h-0 border-2 border-white shadow-inner flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                        <div className={`grid ${gridClass} gap-1 sm:gap-2 w-full mx-auto`}>
                            {cards.map((card, index) => (
                                <motion.button
                                    key={card.id}
                                    onClick={() => handleDirectGuess(card)}
                                    disabled={card.isEliminated || isWon || !!showDialog}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.01 }}
                                    className={`
                                        relative aspect-[2/3] rounded border flex flex-col items-center justify-center
                                        transition-all duration-500 overflow-hidden shadow-sm outline-none
                                        ${card.isEliminated 
                                            ? 'bg-gray-200 border-gray-300 opacity-30 scale-90 grayscale cursor-not-allowed' 
                                            : isWon && targetCard?.id === card.id
                                                ? 'bg-green-100 border-green-500 scale-110 shadow-xl z-10'
                                                : 'bg-white border-gray-200 hover:ring-4 hover:ring-blue-300 hover:-translate-y-1 active:scale-95 cursor-pointer'
                                        }
                                    `}
                                >
                                    <div className={`flex flex-col items-center ${card.color === 'RED' ? 'text-red-600' : 'text-gray-900'}`}>
                                        <span className={`text-xs sm:text-lg landscape:text-sm font-bold leading-none`}>{card.value}</span>
                                        <span className={`text-xl sm:text-3xl landscape:text-2xl mt-0.5 leading-none`}>{card.suit}</span>
                                    </div>
                                    
                                    {card.isEliminated && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-1 bg-red-500/80 rotate-45 absolute rounded-full"></div>
                                            <div className="w-full h-1 bg-red-500/80 -rotate-45 absolute rounded-full"></div>
                                        </div>
                                    )}
                                    {isWon && targetCard?.id === card.id && (
                                        <div className="absolute inset-0 border-2 border-green-500 rounded animate-pulse"></div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GuessCardGame;
