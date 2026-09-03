import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, HelpCircle, CheckCircle2, XCircle, Award, Users, Sparkles, Flame } from 'lucide-react';
import { RulesModal } from './RulesModal';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

interface ChineseTenGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
  initialQuestions?: ChineseTenQuestion[];
}

interface ChineseTenRoundLayoutProps {
  difficulty: Difficulty;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  elapsedTime: number;
  board: ReactNode;
  support: ReactNode;
  feedback?: ReactNode;
  teamMode?: 'SOLO' | 'TEAM';
  teamAScore?: number;
  teamBScore?: number;
  currentTeam?: 'A' | 'B';
  onBack: () => void;
  onToggleTeam: () => void;
  onShowRules: () => void;
  onRestart: () => void;
}

export const ChineseTenRoundLayout: React.FC<ChineseTenRoundLayoutProps> = ({ difficulty, currentIndex, totalQuestions, score, elapsedTime, board, support, feedback, teamMode = 'SOLO', teamAScore = 0, teamBScore = 0, currentTeam = 'A', onBack, onToggleTeam, onShowRules, onRestart }) => (
  <GameShell title="經典撿紅點" subtitle="找出湊十配對，搶下高分紅牌" onBack={onBack} className="bg-gradient-to-br from-rose-950 via-red-950 to-orange-950" status={(
    <div className="flex items-center gap-1.5"><span className="rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">{difficulty === 'ADVANCED' ? '進階撿牌' : '經典撿紅'}</span><span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-900 sm:px-3 sm:text-sm">第 {currentIndex + 1}/{totalQuestions} 題</span>{teamMode === 'TEAM' ? <span className="rounded-full bg-rose-900 px-2 py-1 text-xs font-bold text-white">{currentTeam} 組 · A {teamAScore} / B {teamBScore}</span> : <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-900 sm:px-3 sm:text-sm">{score} 分</span>}</div>
  )} actions={(
    <><span className="hidden rounded-xl bg-rose-900 px-2 py-1 text-xs font-bold text-rose-200 sm:inline">{elapsedTime.toFixed(1)}s</span><button type="button" onClick={onToggleTeam} aria-label="切換單人或分組模式" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-rose-900 text-rose-200"><Users aria-hidden="true" className="h-5 w-5" /></button><button type="button" onClick={onShowRules} aria-label="遊戲規則" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-rose-900 text-rose-200"><HelpCircle aria-hidden="true" className="h-5 w-5" /></button><button type="button" onClick={onRestart} aria-label="重新開始" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-rose-900 text-rose-200"><RotateCcw aria-hidden="true" className="h-5 w-5" /></button></>
  )}>
    <GridFocusLayout playfieldLabel="撿紅牌桌" supportLabel="撿紅題目與手牌" className="bg-gradient-to-br from-rose-950 via-red-950 to-orange-950" playfieldClassName="overflow-hidden rounded-xl border border-rose-700/60 bg-rose-950/70 p-2 text-white" supportClassName="overflow-hidden rounded-xl border border-rose-700/60 bg-rose-950/70 p-2 text-white" feedbackClassName="rounded-xl border-rose-700/60 bg-rose-950/95 px-2 text-white" playfield={board} support={support} feedback={feedback} />
  </GameShell>
);

export type CardSuit = 'spade' | 'heart' | 'diamond' | 'club';

export interface CardData {
  id: string;
  suit: CardSuit;
  rank: number; // 1 (A) to 13 (K)
  name: string;
  points: number; // Red points score
  isRed: boolean;
}

const SUIT_INFO: Record<CardSuit, { symbol: string; color: string; isRed: boolean; name: string }> = {
  spade: { symbol: '♠', color: 'text-slate-900', isRed: false, name: '黑桃' },
  heart: { symbol: '♥', color: 'text-red-600', isRed: true, name: '紅心' },
  diamond: { symbol: '♦', color: 'text-red-600', isRed: true, name: '方塊' },
  club: { symbol: '♣', color: 'text-slate-900', isRed: false, name: '梅花' }
};

const RANK_LABELS: Record<number, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K'
};

export const calculateCardPoints = (suit: CardSuit, rank: number): number => {
  if (suit === 'spade' && rank === 1) return 30; // ♠A = 30 pts
  const isRed = suit === 'heart' || suit === 'diamond';
  if (!isRed) return 0; // Black cards except spade A are 0

  if (rank === 1) return 20; // ♥A, ♦A = 20 pts
  if (rank >= 9 && rank <= 13) return 10; // Red 9, 10, J, Q, K = 10 pts
  if (rank >= 2 && rank <= 8) return rank; // Red 2-8 = face value (e.g. Red 8 = 8 pts)
  return 0;
};

export const createCard = (id: string, suit: CardSuit, rank: number): CardData => {
  const isRed = suit === 'heart' || suit === 'diamond';
  const points = calculateCardPoints(suit, rank);
  const name = `${SUIT_INFO[suit].name}${RANK_LABELS[rank]}`;
  return { id, suit, rank, name, points, isRed };
};

// Responsive Compact Playing Card
export const PlayingCard: React.FC<{
  card: CardData;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  highlight?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showPointsBadge?: boolean;
}> = ({ card, size = 'md', selected = false, highlight = false, disabled = false, onClick, showPointsBadge = true }) => {
  const suitInfo = SUIT_INFO[card.suit];
  const rankLabel = RANK_LABELS[card.rank];

  // Fixed, non-deforming playing card aspect ratio (~2:3)
  const sizeClasses = {
    sm: 'w-12 h-18 sm:w-14 sm:h-21 lg:w-22 lg:h-33 xl:w-26 xl:h-39 text-xs lg:text-sm xl:text-base',
    md: 'w-14 h-21 sm:w-17 sm:h-25 lg:w-26 lg:h-38 xl:w-30 xl:h-44 text-sm lg:text-base xl:text-lg',
    lg: 'w-16 h-24 sm:w-20 sm:h-29 lg:w-30 lg:h-44 xl:w-36 xl:h-52 text-base lg:text-lg xl:text-xl'
  };

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={`${onClick && !disabled ? '選擇' : '撿紅牌'}${card.name}`}
      aria-pressed={onClick ? selected : undefined}
      className={`relative ${sizeClasses[size]} rounded-xl bg-white border-2 lg:border-[3px] shadow-md flex flex-col justify-between p-1 sm:p-1.5 lg:p-2.5 transition-all select-none overflow-hidden shrink-0
        ${suitInfo.color}
        ${selected ? 'ring-3 lg:ring-4 ring-amber-500 border-amber-600 -translate-y-1 shadow-lg bg-amber-50' : 'border-gray-300 hover:border-amber-400'}
        ${highlight ? 'ring-3 lg:ring-4 ring-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/30' : ''}
        ${disabled ? 'opacity-90 cursor-default' : 'cursor-pointer'}
      `}
    >
      {/* Top Value & Suit */}
      <div className="flex items-center justify-between leading-none w-full px-0.5 pt-0.5">
        <span className="font-black text-[11px] sm:text-xs lg:text-base xl:text-lg leading-none">{rankLabel}</span>
        <span className="text-[10px] sm:text-xs lg:text-base xl:text-lg leading-none">{suitInfo.symbol}</span>
      </div>

      {/* Center Big Symbol */}
      <div className="text-lg sm:text-2xl lg:text-4xl xl:text-5xl font-black text-center my-auto leading-none select-none">
        {suitInfo.symbol}
      </div>

      {/* Bottom Points Badge (Clean & Non-Overflowing) */}
      <div className="flex items-center justify-center leading-none w-full pb-0.5">
        {showPointsBadge && card.points > 0 ? (
          <span className="text-[8px] sm:text-[9px] lg:text-xs xl:text-sm font-black bg-red-50 text-red-600 px-1 py-0.5 lg:px-2 lg:py-1 rounded border border-red-200 whitespace-nowrap leading-none">
            +{card.points}分
          </span>
        ) : showPointsBadge ? (
          <span className="text-[8px] sm:text-[9px] lg:text-xs xl:text-sm text-gray-400 font-bold leading-none">0分</span>
        ) : (
          <span className="text-[8px] sm:text-[9px] lg:text-xs xl:text-sm font-bold text-gray-400 leading-none">{suitInfo.name}</span>
        )}
      </div>
    </motion.button>
  );
};

interface ChineseTenQuestion {
  id: number;
  type: 'match' | 'max_score' | 'calc_total' | 'safe_discard';
  title: string;
  prompt: string;
  tableCards: CardData[];
  options: CardData[];
  correctOptionId: string;
  explanation: string;
  badge: string;
}

const generateChineseTenPool = (isAdv: boolean): ChineseTenQuestion[] => {
  const pool: ChineseTenQuestion[] = [
    // 1. 基本湊10吃牌 (紅心3配方塊7)
    {
      id: 1,
      type: 'match',
      title: '湊十吃牌 (3 配 7)',
      prompt: '桌面有【方塊7】(+7分) 與其他牌，手牌出哪一張能吃下這張方塊7？',
      tableCards: [
        createCard('t1', 'diamond', 7),
        createCard('t2', 'spade', 4),
        createCard('t3', 'club', 8)
      ],
      options: [
        createCard('opt_1', 'heart', 3),
        createCard('opt_2', 'heart', 7),
        createCard('opt_3', 'club', 2),
        createCard('opt_4', 'spade', 6)
      ],
      correctOptionId: 'opt_1',
      explanation: '【紅心3】與【方塊7】加起來等於 10，成功吃下方塊7得 7 分！',
      badge: '湊十配對'
    },
    // 2. 搶大分 ♠A 30分 (A 配 9)
    {
      id: 2,
      type: 'max_score',
      title: '搶最高分 (黑桃A 30分)',
      prompt: '桌面有【黑桃A】(值30分！) 與【梅花8】，打哪一張牌能吃到這張30分黑桃A？',
      tableCards: [
        createCard('t4', 'spade', 1), // ♠A = 30 pts!
        createCard('t5', 'club', 8),
        createCard('t6', 'heart', 4)
      ],
      options: [
        createCard('opt_5', 'diamond', 9),
        createCard('opt_6', 'heart', 1),
        createCard('opt_7', 'club', 2),
        createCard('opt_8', 'spade', 7)
      ],
      correctOptionId: 'opt_5',
      explanation: '【方塊9】與【黑桃A(1)】湊十吃牌！一口氣搶下 30 分黑桃A！',
      badge: '搶大分牌'
    },
    // 3. 同字牌吃牌 (J 吃 J)
    {
      id: 3,
      type: 'match',
      title: '同字吃牌 (J 吃 J)',
      prompt: '桌面有【紅心J】(+10分) 與其他牌，手上出哪一張可以吃下紅心J？',
      tableCards: [
        createCard('t7', 'heart', 11),
        createCard('t8', 'club', 5),
        createCard('t9', 'spade', 9)
      ],
      options: [
        createCard('opt_9', 'spade', 11),
        createCard('opt_10', 'diamond', 10),
        createCard('opt_11', 'heart', 9),
        createCard('opt_12', 'club', 12)
      ],
      correctOptionId: 'opt_9',
      explanation: '10、J、Q、K 是「同字互吃」，【黑桃J】可以吃下【紅心J】得 10 分！',
      badge: '同字吃牌'
    },
    // 4. 五五湊十 (5 配 5)
    {
      id: 4,
      type: 'match',
      title: '五五湊十吃牌',
      prompt: '桌面有【方塊5】(+5分)，打出手上哪一張可以成功湊十吃牌？',
      tableCards: [
        createCard('t10', 'diamond', 5),
        createCard('t11', 'spade', 8),
        createCard('t12', 'club', 3)
      ],
      options: [
        createCard('opt_13', 'heart', 5),
        createCard('opt_14', 'diamond', 10),
        createCard('opt_15', 'club', 6),
        createCard('opt_16', 'spade', 2)
      ],
      correctOptionId: 'opt_13',
      explanation: '5 配 5 湊十，【紅心5】吃下【方塊5】，自己與桌面紅牌共得 10 分！',
      badge: '五五配對'
    },
    // 5. 9 配 1 搶紅心A (20分)
    {
      id: 5,
      type: 'max_score',
      title: '搶紅心A (+20分)',
      prompt: '桌面有【紅心A】(20分) 與【梅花6】，手牌出哪一張能把紅心A吃進來？',
      tableCards: [
        createCard('t13', 'heart', 1), // ♥A = 20 pts
        createCard('t14', 'club', 6),
        createCard('t15', 'spade', 3)
      ],
      options: [
        createCard('opt_17', 'club', 9),
        createCard('opt_18', 'heart', 1),
        createCard('opt_19', 'diamond', 4),
        createCard('opt_20', 'spade', 7)
      ],
      correctOptionId: 'opt_17',
      explanation: '【梅花9】配【紅心A(1)】湊十吃牌，奪得 20 分紅心A！',
      badge: '紅點大牌'
    }
  ];

  if (isAdv) {
    pool.push(
      // 進階 1: 吃牌二擇一 (取最高分)
      {
        id: 6,
        type: 'max_score',
        title: '進階 高分二擇一抉擇',
        prompt: '桌面有【方塊8】(+8分) 與【黑桃6】(0分)。手上有【方塊2】與【紅心4】，打哪一張能獲得最高紅點分數？',
        tableCards: [
          createCard('t16', 'diamond', 8), // 8 pts
          createCard('t17', 'spade', 6), // 0 pts
          createCard('t18', 'club', 13)
        ],
        options: [
          createCard('opt_21', 'diamond', 2), // plays 2 to eat 8: gets 2+8 = 10 pts!
          createCard('opt_22', 'heart', 4), // plays 4 to eat 6: gets 4+0 = 4 pts
          createCard('opt_23', 'club', 7),
          createCard('opt_24', 'spade', 2)
        ],
        correctOptionId: 'opt_21',
        explanation: '打出【方塊2】吃【方塊8】可得 2 + 8 = 10 分！比打紅心4吃黑桃6(僅4分)多出 6 分！',
        badge: '最大效益'
      },
      // 進階 2: 雙J雙Q多牌同字
      {
        id: 7,
        type: 'match',
        title: '進階 人頭大牌吃分',
        prompt: '桌面有【紅心K】(+10分)、【方塊Q】(+10分)。手上出哪一張能穩穩吃下一張10分大牌？',
        tableCards: [
          createCard('t19', 'heart', 13),
          createCard('t20', 'diamond', 12),
          createCard('t21', 'club', 7)
        ],
        options: [
          createCard('opt_25', 'club', 13), // ♣K eats ♥K = 10 pts!
          createCard('opt_26', 'heart', 10),
          createCard('opt_27', 'diamond', 8),
          createCard('opt_28', 'spade', 5)
        ],
        correctOptionId: 'opt_25',
        explanation: '【梅花K】吃【紅心K】，同字相吃順利入袋 10 分紅點！',
        badge: '同字奪分'
      },
      // 進階 3: 防守策略 (捨牌不奉送紅點)
      {
        id: 8,
        type: 'safe_discard',
        title: '進階 聰明防守捨牌',
        prompt: '桌面無牌可吃時需要打一張到桌面。手牌有以下四張，打哪一張對對手最安全（不送紅點）？',
        tableCards: [
          createCard('t22', 'club', 2),
          createCard('t23', 'spade', 7),
          createCard('t24', 'diamond', 3)
        ],
        options: [
          createCard('opt_29', 'club', 6), // Black 6: 0 pts
          createCard('opt_30', 'heart', 9), // Red 9: 10 pts (gives red)
          createCard('opt_31', 'diamond', 8), // Red 8: 8 pts (gives red)
          createCard('opt_32', 'spade', 1) // ♠A: 30 pts (very dangerous)
        ],
        correctOptionId: 'opt_29',
        explanation: '打出【梅花6】(黑牌0分)，即使下家吃到也不會白白奉送紅點大分！',
        badge: '防守策略'
      },
      // 進階 4: 終局紅點精算
      {
        id: 9,
        type: 'calc_total',
        title: '進階 終局紅點精算',
        prompt: '結算時吃進【黑桃A(30)】+【紅心A(20)】+【方塊8(8)】+【紅心10(10)】+【梅花5(0)】，手牌哪一張代表正確總分？(目標：68分)',
        tableCards: [
          createCard('t25', 'spade', 1),
          createCard('t26', 'heart', 1),
          createCard('t27', 'diamond', 8),
          createCard('t28', 'heart', 10),
          createCard('t29', 'club', 5)
        ],
        options: [
          createCard('opt_33', 'heart', 8), // labeled as 68 pts
          createCard('opt_34', 'diamond', 6),
          createCard('opt_35', 'club', 10),
          createCard('opt_36', 'spade', 9)
        ],
        correctOptionId: 'opt_33',
        explanation: '30 (黑桃A) + 20 (紅心A) + 8 (方塊8) + 10 (紅心10) + 0 (梅花5) = 68 分！',
        badge: '精準算分'
      }
    );
  }

  return pool
    .map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
    }))
    .sort(() => Math.random() - 0.5);
};

const calculateTimeScore = (seconds: number): { score: number; label: string; icon: string } => {
  if (seconds <= 2.5) return { score: 100, label: '極速神準', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '迅捷敏銳', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉著應對', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '謹慎推敲', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

export const resolveChineseTenAnswer = ({ optionId, correctOptionId, elapsedSeconds }: { optionId?: string; correctOptionId: string; elapsedSeconds: number }) => {
  const isCorrect = optionId === correctOptionId;
  return { isAnswered: true, isCorrect, earnedScore: isCorrect ? calculateTimeScore(elapsedSeconds).score : 0 };
};

export const ChineseTenGame: React.FC<ChineseTenGameProps> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false, initialQuestions }) => {
  const isAdv = isAdvanced || difficulty === 'ADVANCED';

  const [questions, setQuestions] = useState<ChineseTenQuestion[]>(() => initialQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [lastEarnedScore, setLastEarnedScore] = useState(0);
  const [lastSpeedInfo, setLastSpeedInfo] = useState<{ label: string; icon: string; time: number } | null>(null);

  // Dynamic Live Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [teamMode, setTeamMode] = useState<'SOLO' | 'TEAM'>('SOLO');
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [showRules, setShowRules] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    restart();
  }, [isAdv]);

  // Handle live stopwatch for current question
  useEffect(() => {
    if (!isAnswered && !gameComplete && questions.length > 0) {
      startTimeRef.current = Date.now();
      setElapsedTime(0);

      timerRef.current = setInterval(() => {
        const sec = (Date.now() - startTimeRef.current) / 1000;
        setElapsedTime(Number(sec.toFixed(1)));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswered, gameComplete, questions.length]);

  const restart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const list = initialQuestions ?? generateChineseTenPool(isAdv);
    setQuestions(list);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setLastEarnedScore(0);
    setLastSpeedInfo(null);
    setTeamAScore(0);
    setTeamBScore(0);
    setCurrentTeam('A');
    setGameComplete(false);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
  };

  const currentQ = questions[currentIndex];

  const handleSelect = (opt: CardData) => {
    if (isAnswered || !currentQ) return;

    if (timerRef.current) clearInterval(timerRef.current);
    const finalSec = Number(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
    setElapsedTime(finalSec);

    soundService.playCardFlip();
    setSelectedOptionId(opt.id);
    setIsAnswered(true);

    const answerResult = resolveChineseTenAnswer({ optionId: opt.id, correctOptionId: currentQ.correctOptionId, elapsedSeconds: finalSec });
    const correct = answerResult.isCorrect;
    setIsCorrect(correct);

    if (correct) {
      soundService.playCorrect();
      const speedCalc = calculateTimeScore(finalSec);
      const earned = answerResult.earnedScore;
      setLastEarnedScore(earned);
      setLastSpeedInfo({ label: speedCalc.label, icon: speedCalc.icon, time: finalSec });

      setScore(s => s + earned);
      if (teamMode === 'TEAM') {
        if (currentTeam === 'A') setTeamAScore(s => s + earned);
        else setTeamBScore(s => s + earned);
      }
    } else {
      soundService.playWrong();
      setLastEarnedScore(0);
      setLastSpeedInfo({ label: '需再加油', icon: '❌', time: finalSec });
    }
  };

  const handleNext = () => {
    soundService.playCardFlip();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setLastEarnedScore(0);
      setLastSpeedInfo(null);
      if (teamMode === 'TEAM') {
        setCurrentTeam(t => (t === 'A' ? 'B' : 'A'));
      }
    } else {
      setGameComplete(true);
      soundService.playWin();
    }
  };

  const rules = [
    '【經典撿紅點】為華人過年必玩的算數益智撲克牌遊戲。',
    '湊十吃牌：1 配 9、2 配 8、3 配 7、4 配 6、5 配 5。',
    '同字吃牌：10 吃 10、J 吃 J、Q 吃 Q、K 吃 K。',
    '紅點計分：紅心♥與方塊♦才能計分！',
    '• 紅心/方塊 A：20 分',
    '• 黑桃 ♠A：30 分 (撿紅點大牌！)',
    '• 紅心/方塊 9, 10, J, Q, K：10 分',
    '• 紅心/方塊 2~8：依牌面點數計分 (例如紅8=8分)',
    '• 其他黑色牌：0 分。',
    '⚡ 速度評分機制：答題越快獲得分數越高（最高100分）！'
  ];

  return (
    <>
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="經典撿紅點 規則與計分" rules={rules} />
      {!gameComplete && currentQ ? (
        <ChineseTenRoundLayout difficulty={isAdv ? 'ADVANCED' : 'NORMAL'} currentIndex={currentIndex} totalQuestions={questions.length} score={score} elapsedTime={elapsedTime} teamMode={teamMode} teamAScore={teamAScore} teamBScore={teamBScore} currentTeam={currentTeam} onBack={onBack} onToggleTeam={() => setTeamMode(mode => mode === 'SOLO' ? 'TEAM' : 'SOLO')} onShowRules={() => setShowRules(true)} onRestart={restart}
          board={<div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden"><div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-stone-800/80 bg-stone-950/60 p-2 shadow-inner"><span className="mb-2 flex shrink-0 items-center gap-1 text-[10px] font-bold text-amber-400 sm:text-xs"><Flame aria-hidden="true" className="h-3.5 w-3.5 text-red-500" />桌面牌況</span><div className="flex max-w-full flex-wrap items-center justify-center gap-2 sm:gap-3">{currentQ.tableCards.map((card, idx) => <PlayingCard key={card.id || idx} card={card} size="sm" disabled showPointsBadge />)}</div></div><div className="shrink-0 rounded-xl border border-stone-800/70 bg-black/40 p-2"><div className="mb-1 text-center text-xs font-bold tracking-wide text-amber-300">🔥 請選擇湊十牌</div><div className="grid grid-cols-4 justify-items-center gap-2 sm:gap-3">{currentQ.options.map(opt => <PlayingCard key={opt.id} card={opt} size="md" selected={selectedOptionId === opt.id} highlight={isAnswered && opt.id === currentQ.correctOptionId} disabled={isAnswered} onClick={() => handleSelect(opt)} showPointsBadge />)}</div></div></div>}
            support={<div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto"><div className="rounded-xl border border-stone-800/70 bg-stone-900/70 p-3 shadow-inner"><div className="flex flex-wrap items-center gap-1.5"><span className="rounded-lg border border-red-500/50 bg-red-900/80 px-2 py-1 text-xs font-black text-amber-300 sm:text-sm">{currentQ.badge}</span><span className="text-xs font-bold text-stone-300">第 {currentIndex + 1}/{questions.length} 題</span></div><h2 className="mt-2 text-sm font-bold leading-snug text-white sm:text-base lg:text-lg">{currentQ.prompt}</h2></div><div className="rounded-xl border border-stone-800/70 bg-stone-900/70 p-3 text-sm leading-relaxed text-amber-100">先找出與桌牌湊成 10 的牌，再留意紅心、方塊與黑桃 A 的分數。</div></div>}
          feedback={<div className="flex min-h-[40px] shrink-0 items-center"><AnimatePresence mode="wait">{isAnswered ? <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex w-full items-center justify-between gap-2 rounded-xl border p-1.5 text-xs shadow sm:p-2 ${isCorrect ? 'border-emerald-500 bg-emerald-950/95 text-emerald-100' : 'border-rose-500 bg-rose-950/95 text-rose-100'}`}><div className="flex min-w-0 items-center gap-1.5 overflow-hidden">{isCorrect ? <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-400" /> : <XCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-400" />}<span className="truncate font-bold">{currentQ.explanation}</span></div><button type="button" onClick={handleNext} className="min-h-11 shrink-0 rounded-lg bg-amber-400 px-3 py-1 text-xs font-black text-gray-950 shadow transition hover:bg-amber-300">{currentIndex + 1 < questions.length ? '下一題 ➔' : '查看結算 🏆'}</button></motion.div> : <span className="px-1 text-sm text-rose-900">點選一張牌完成湊十</span>}</AnimatePresence></div>}
        />
      ) : (
        <GameShell title="經典撿紅點" subtitle="本局挑戰完成" onBack={onBack} className="h-screen bg-gradient-to-br from-rose-950 via-red-950 to-orange-950 text-white"><div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-2.5 p-3 text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-2xl bg-red-600 p-2.5 text-amber-200 shadow-xl"><Award className="h-10 w-10 sm:h-14 sm:w-14" /></motion.div><h2 className="text-lg font-black text-amber-300 sm:text-2xl">🎴 撿紅點挑戰圓滿完成！</h2>{teamMode === 'TEAM' ? <div className="w-full max-w-sm rounded-2xl border border-red-500/50 bg-stone-800/90 p-3"><div className="grid grid-cols-2 gap-2 text-center"><div className="rounded-xl border border-amber-400 bg-amber-500/20 p-2"><p className="text-xs font-bold text-amber-300">A 組得分</p><p className="text-xl font-black text-white sm:text-2xl">{teamAScore} 分</p></div><div className="rounded-xl border border-red-400 bg-red-500/20 p-2"><p className="text-xs font-bold text-red-300">B 組得分</p><p className="text-xl font-black text-white sm:text-2xl">{teamBScore} 分</p></div></div></div> : <div className="w-full max-w-sm rounded-2xl border border-stone-700 bg-stone-800/80 p-3"><p className="text-xs font-bold text-stone-300">總積分</p><p className="text-2xl font-black text-amber-300 sm:text-4xl">{score} 分</p><p className="mt-1 text-[11px] text-stone-300 sm:text-xs">湊十反應靈敏，紅點精算神速！</p></div>}<div className="mt-1 flex justify-center gap-2.5"><button type="button" onClick={restart} className="flex min-h-11 items-center gap-1 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-gray-950 shadow transition hover:bg-amber-300 sm:px-4 sm:py-2 sm:text-sm"><RotateCcw aria-hidden="true" size={15} />再玩一局</button><button type="button" onClick={onBack} className="min-h-11 rounded-xl bg-stone-800 px-3.5 py-1.5 text-xs font-bold text-amber-200 shadow transition hover:bg-stone-700 sm:px-4 sm:py-2 sm:text-sm">回遊戲選單</button></div></div></GameShell>
      )}
    </>
  );
};

export default ChineseTenGame;
