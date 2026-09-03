import React, { useEffect, useState } from 'react';
import { Difficulty } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { HelpCircle, RefreshCw, Trophy } from 'lucide-react';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

export interface CardType {
    id: number;
    color: 'RED' | 'BLACK';
    suit: '♥' | '♦' | '♠' | '♣';
    value: string;
    isEliminated: boolean;
}

interface GuessCardGameProps {
    onBack: () => void;
    difficulty: Difficulty;
    initialCards?: CardType[];
    initialTargetCard?: CardType;
}

const SUITS = ['♥', '♦', '♠', '♣'] as const;
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_LABELS: Record<CardType['suit'], string> = { '♥': '紅心', '♦': '方塊', '♠': '黑桃', '♣': '梅花' };

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

export const applyQuestionResult = (
    cards: CardType[],
    answer: boolean,
    condition: (card: CardType) => boolean,
): CardType[] => cards.map(card => {
    if (card.isEliminated) return card;
    return answer === condition(card) ? card : { ...card, isEliminated: true };
});

const cloneCards = (cards: CardType[]) => cards.map(card => ({ ...card }));

export const getGuessCardGridColumns = (difficulty: Difficulty): 8 | 13 => (
    difficulty === 'ADVANCED' ? 13 : 8
);

const GuessCardGame: React.FC<GuessCardGameProps> = ({
    onBack,
    difficulty,
    initialCards,
    initialTargetCard,
}) => {
    const [cards, setCards] = useState<CardType[]>(() => initialCards ? cloneCards(initialCards) : []);
    const [targetCard, setTargetCard] = useState<CardType | null>(() => initialTargetCard ? { ...initialTargetCard } : null);
    const [score, setScore] = useState(100);
    const [lastAnswer, setLastAnswer] = useState<{q: string, ans: boolean, isGuess?: boolean} | null>(null);
    const [showDialog, setShowDialog] = useState<{q: string, ans: boolean, isGuess?: boolean} | null>(null);
    const [isWon, setIsWon] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    const [compareOp, setCompareOp] = useState<'>'|'<'|'=='>('>');
    const [compareVal, setCompareVal] = useState<string>('7');

    const initGame = () => {
        const newCards = initialCards ? cloneCards(initialCards) : generateCards(difficulty);
        setCards(newCards);
        setTargetCard(initialTargetCard ? { ...initialTargetCard } : newCards[Math.floor(Math.random() * newCards.length)]);
        setScore(100);
        setLastAnswer(null);
        setShowDialog(null);
        setIsWon(false);
        setIsGameOver(false);
    };

    useEffect(() => {
        initGame();
    }, [difficulty]);

    const handleDirectGuess = (card: CardType) => {
        if (!targetCard || isWon || showDialog || card.isEliminated || isGameOver) return;

        const isCorrect = card.id === targetCard.id;
        setShowDialog({ q: `直接猜測：${card.suit}${card.value}`, ans: isCorrect, isGuess: true });

        setTimeout(() => {
            setShowDialog(null);
            if (isCorrect) {
                setCards(prev => prev.map(c => c.id === card.id ? c : { ...c, isEliminated: true }));
                setIsWon(true);
            } else {
                setCards(prev => prev.map(c => c.id === card.id ? { ...c, isEliminated: true } : c));
                setScore(prev => {
                    const newScore = prev - 30;
                    if (newScore <= 0) setIsGameOver(true);
                    return newScore;
                });
                setLastAnswer({ q: `猜測 ${card.suit}${card.value}`, ans: false, isGuess: true });
            }
        }, 2500);
    };

    const processQuestion = (label: string, condition: (card: CardType) => boolean) => {
        if (!targetCard || isWon || showDialog || isGameOver) return;

        const answer = condition(targetCard);
        setShowDialog({ q: label, ans: answer });

        setTimeout(() => {
            setShowDialog(null);

            setCards(prevCards => {
                const newCards = applyQuestionResult(prevCards, answer, condition);
                const remaining = newCards.filter(card => !card.isEliminated);
                if (remaining.length === 1 && remaining[0].id === targetCard.id) {
                    setIsWon(true);
                }
                return newCards;
            });

            setScore(prev => {
                const newScore = prev - 10;
                if (newScore <= 0) setIsGameOver(true);
                return newScore;
            });
            setLastAnswer({ q: label, ans: answer });
        }, 2500);
    };

    const handleQuickAsk = (type: string) => {
        if (showDialog || isGameOver) return;
        switch (type) {
            case 'RED': processQuestion('是紅色的嗎？(♥/♦)', card => card.color === 'RED'); break;
            case 'BLACK': processQuestion('是黑色的嗎？(♠/♣)', card => card.color === 'BLACK'); break;
            case 'HEART': processQuestion('是愛心嗎？(♥)', card => card.suit === '♥'); break;
            case 'SPADE': processQuestion('是黑桃嗎？(♠)', card => card.suit === '♠'); break;
            case 'DIAMOND': processQuestion('是方塊嗎？(♦)', card => card.suit === '♦'); break;
            case 'CLUB': processQuestion('是梅花嗎？(♣)', card => card.suit === '♣'); break;
            case 'EVEN': processQuestion('數字是雙數嗎？(2,4,6,8,10,Q)', card => getNumValue(card.value) % 2 === 0); break;
            case 'ODD': processQuestion('數字是單數嗎？(A,3,5,7,9,J,K)', card => getNumValue(card.value) % 2 !== 0); break;
            case 'FACE': processQuestion('是字母牌嗎？(J,Q,K,A)', card => ['J','Q','K','A'].includes(card.value)); break;
            case 'NUM': processQuestion('是純數字嗎？(2~10)', card => !['J','Q','K','A'].includes(card.value)); break;
        }
    };

    const handleNumberAsk = () => {
        if (showDialog || isGameOver) return;
        const valNum = getNumValue(compareVal);
        let label = '';
        let condition: (card: CardType) => boolean;

        if (compareOp === '>') {
            label = `數字大於 ${compareVal} 嗎？`;
            condition = card => getNumValue(card.value) > valNum;
        } else if (compareOp === '<') {
            label = `數字小於 ${compareVal} 嗎？`;
            condition = card => getNumValue(card.value) < valNum;
        } else {
            label = `數字等於 ${compareVal} 嗎？`;
            condition = card => getNumValue(card.value) === valNum;
        }
        processQuestion(label, condition);
    };

    const disabled = isWon || isGameOver || !!showDialog;
    const candidateColumns = getGuessCardGridColumns(difficulty);
    const controlClass = 'flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-2 py-1 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm';

    const feedback = (
        <div className="flex min-h-8 w-full items-center justify-center px-1 text-center">
            <AnimatePresence mode="wait">
                {showDialog ? (
                    <motion.div key="dialog" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-2 py-1.5 text-sm text-blue-900">
                        <HelpCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-600" />
                        <span className="font-bold">{showDialog.q}　{showDialog.isGuess ? (showDialog.ans ? '答對了！' : '猜錯了！扣 30 分') : (showDialog.ans ? '系統回答：是的' : '系統回答：不是')}</span>
                    </motion.div>
                ) : isWon ? (
                    <motion.div key="won" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400 bg-emerald-100 px-2 py-1.5 text-sm font-bold text-emerald-900">
                        <Trophy aria-hidden="true" className="h-5 w-5 text-emerald-700" />成功找出目標牌！目前得分：{score}
                    </motion.div>
                ) : isGameOver ? (
                    <motion.div key="game-over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full flex-col items-center justify-center rounded-xl border border-red-300 bg-red-100 px-2 py-1.5 text-sm font-bold text-red-900">
                        <span>分數歸零，遊戲結束！</span>
                        <span>正確解答為：{targetCard?.suit}{targetCard?.value}</span>
                    </motion.div>
                ) : lastAnswer ? (
                    <motion.div key="last-answer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-800">
                        {lastAnswer.isGuess ? `猜測 ${lastAnswer.q.replace('猜測 ', '')}：猜錯了，扣 30 分` : `${lastAnswer.q} 系統回答：${lastAnswer.ans ? '是的' : '不是'}`}
                    </motion.div>
                ) : (
                    <span key="idle" className="text-sm text-slate-600">先用問題排除候選牌，再直接猜測目標。</span>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <GameShell
            title="邏輯猜牌"
            subtitle="用發問與排除法找出目標卡牌"
            onBack={onBack}
            className="bg-blue-50"
            status={(
                <div className="flex items-center gap-1.5 text-xs font-bold sm:gap-2 sm:text-sm">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">{difficulty === 'ADVANCED' ? '進階' : '一般'}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">分數：{score}</span>
                </div>
            )}
            actions={(
                <button type="button" onClick={initGame} aria-label="重新開始邏輯猜牌" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                    <RefreshCw aria-hidden="true" className="h-5 w-5" />
                </button>
            )}
        >
            <div className="h-full min-h-0 overflow-hidden">
            <GridFocusLayout
                playfieldLabel="候選牌集合"
                supportLabel="推理發問控制"
                className="!grid-cols-1 !grid-rows-[minmax(0,1fr)_auto_auto] !content-start !gap-1 !p-1 bg-blue-50"
                playfieldClassName="!overflow-hidden"
                supportClassName="!overflow-hidden"
                playfield={(
                    <section aria-label="候選牌集合" data-candidate-count={cards.length} data-candidate-columns={candidateColumns} data-candidate-scroll="none" className="flex h-full min-h-0 flex-col rounded-xl border-2 border-blue-100 bg-white/80 p-1 shadow-inner sm:p-1.5">
                        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-blue-100 pb-1">
                            <h2 className="text-xs font-bold text-blue-900 sm:text-sm">候選牌</h2>
                            <span className="text-[11px] font-semibold text-slate-600 sm:text-xs">點牌可直接猜測</span>
                        </div>
                        <div className="min-h-0 flex-1 overflow-hidden py-1">
                            <div
                                className="grid h-full min-h-0 w-full content-center gap-1"
                                data-candidate-grid="true"
                                style={{ gridTemplateColumns: `repeat(${candidateColumns}, minmax(0, 1fr))`, gridAutoRows: 'minmax(0, 1fr)' }}
                            >
                                {cards.map((card, index) => {
                                    const isTarget = isWon && targetCard?.id === card.id;
                                    const label = `${card.isEliminated ? '已排除，' : ''}猜測${SUIT_LABELS[card.suit]}${card.value}${isTarget ? '，目標牌' : ''}`;
                                    return (
                                        <motion.button
                                            key={card.id}
                                            type="button"
                                            onClick={() => handleDirectGuess(card)}
                                            disabled={card.isEliminated || disabled}
                                            aria-label={label}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.01 }}
                                            className={`relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-md border bg-white shadow-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-300 ${card.isEliminated ? 'border-slate-400 bg-slate-200 opacity-70 grayscale' : isTarget ? 'border-emerald-500 bg-emerald-100 shadow-lg' : 'border-slate-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md active:scale-95'}`}
                                        >
                                            <span className={`flex items-center justify-center gap-0.5 font-black leading-none ${card.color === 'RED' ? 'text-red-600' : 'text-slate-900'}`}>
                                                <span className="text-xs sm:text-sm">{card.value}</span>
                                                <span className="text-sm sm:text-base">{card.suit}</span>
                                            </span>
                                            {card.isEliminated && <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-black text-red-600/85">×</span>}
                                            {isTarget && <span aria-hidden="true" className="absolute inset-0 rounded-md border-2 border-emerald-500" />}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}
                support={(
                    <div className="flex h-full min-h-0 items-center overflow-x-auto" data-support-layout="question-strip" style={{ contain: 'layout paint' }}>
                        <section aria-label="發問區" className="flex min-w-max items-center gap-1 rounded-xl border border-blue-100 bg-white px-1.5 py-1 shadow-sm sm:gap-1.5 sm:px-2">
                            <h2 className="flex shrink-0 items-center gap-1 text-xs font-bold text-blue-900 sm:text-sm"><HelpCircle aria-hidden="true" className="h-4 w-4" />發問</h2>
                            <div className="flex shrink-0 items-center gap-1" role="group" aria-label="顏色與奇偶">
                                <button type="button" onClick={() => handleQuickAsk('RED')} disabled={disabled} className={`${controlClass} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}>紅色</button>
                                <button type="button" onClick={() => handleQuickAsk('BLACK')} disabled={disabled} className={`${controlClass} border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200`}>黑色</button>
                                <button type="button" onClick={() => handleQuickAsk('EVEN')} disabled={disabled} className={`${controlClass} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}>雙數</button>
                                <button type="button" onClick={() => handleQuickAsk('ODD')} disabled={disabled} className={`${controlClass} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}>單數</button>
                            </div>
                            <div className="flex shrink-0 items-center gap-1" role="group" aria-label="字母與數字">
                                <button type="button" onClick={() => handleQuickAsk('FACE')} disabled={disabled} className={`${controlClass} border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100`}>字母</button>
                                <button type="button" onClick={() => handleQuickAsk('NUM')} disabled={disabled} className={`${controlClass} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100`}>數字</button>
                            </div>
                            <div className="flex shrink-0 items-center gap-1" role="group" aria-label="單一花色">
                                {(['SPADE', 'HEART', 'DIAMOND', 'CLUB'] as const).map(type => {
                                    const suit = type === 'SPADE' ? '♠' : type === 'HEART' ? '♥' : type === 'DIAMOND' ? '♦' : '♣';
                                    const name = type === 'SPADE' ? '黑桃' : type === 'HEART' ? '愛心' : type === 'DIAMOND' ? '方塊' : '梅花';
                                    return <button key={type} type="button" onClick={() => handleQuickAsk(type)} disabled={disabled} aria-label={`詢問${name}`} className={`${controlClass} text-lg ${suit === '♥' || suit === '♦' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}>{suit}</button>;
                                })}
                            </div>
                            <div className="flex shrink-0 items-center gap-1" role="group" aria-label="精確數字">
                                <label className="sr-only" htmlFor="guess-card-compare-op">比較方式</label>
                                <select id="guess-card-compare-op" aria-label="比較方式" value={compareOp} onChange={event => setCompareOp(event.target.value as '>'|'<'|'==')} disabled={disabled} className="min-h-11 w-16 rounded-lg border-2 border-blue-200 bg-white px-1 text-xs font-bold">
                                    <option value=">">大於</option><option value="<">小於</option><option value="==">等於</option>
                                </select>
                                <label className="sr-only" htmlFor="guess-card-compare-value">比較數值</label>
                                <select id="guess-card-compare-value" aria-label="比較數值" value={compareVal} onChange={event => setCompareVal(event.target.value)} disabled={disabled} className="min-h-11 w-14 rounded-lg border-2 border-blue-200 bg-white px-1 text-xs font-bold">
                                    {VALUES.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                                <button type="button" onClick={handleNumberAsk} disabled={disabled} className="min-h-11 rounded-lg bg-blue-700 px-2 text-xs font-bold text-white hover:bg-blue-600">發問</button>
                            </div>
                        </section>
                    </div>
                )}
                feedback={feedback}
                feedbackClassName="!h-10 !min-h-10 !rounded-xl !px-2 !py-0"
            />
            </div>
        </GameShell>
    );
};

export default GuessCardGame;
