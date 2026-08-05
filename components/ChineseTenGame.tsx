import React, { useState, useEffect, useRef } from 'react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, HelpCircle, CheckCircle2, XCircle, Award, Users, Sparkles, Flame, Clock, Zap } from 'lucide-react';
import { RulesModal } from './RulesModal';
import { soundService } from '../services/soundService';

interface ChineseTenGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
}

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

  return pool.sort(() => Math.random() - 0.5);
};

const calculateTimeScore = (seconds: number): { score: number; label: string; icon: string } => {
  if (seconds <= 2.5) return { score: 100, label: '極速神準', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '迅捷敏銳', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉著應對', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '謹慎推敲', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

const ChineseTenGame: React.FC<ChineseTenGameProps> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false }) => {
  const isAdv = isAdvanced || difficulty === 'ADVANCED';

  const [questions, setQuestions] = useState<ChineseTenQuestion[]>([]);
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
    const list = generateChineseTenPool(isAdv);
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

    const correct = opt.id === currentQ.correctOptionId;
    setIsCorrect(correct);

    if (correct) {
      soundService.playCorrect();
      const speedCalc = calculateTimeScore(finalSec);
      const earned = speedCalc.score;
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
    <div className="h-screen max-h-screen w-full bg-gradient-to-br from-red-950 via-stone-900 to-amber-950 text-white flex flex-col p-1.5 sm:p-3 select-none overflow-hidden justify-between">
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="經典撿紅點 規則與計分" rules={rules} />

      {/* Top Compact Bar */}
      <div className="flex items-center justify-between gap-1.5 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-100 rounded-xl font-bold text-xs sm:text-sm lg:text-base transition shadow"
        >
          <ArrowLeft size={16} />
          <span>返回</span>
        </button>

        {/* Title & Status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-red-600 text-white rounded-full text-[10px] sm:text-xs lg:text-sm font-black">
            {isAdv ? '進階精算' : '經典配對'}
          </span>
          <h1 className="text-xs sm:text-base lg:text-xl font-black text-amber-300 tracking-wide truncate max-w-[130px] sm:max-w-none">
            經典撿紅點
          </h1>
          {currentQ && (
            <span className="text-[11px] sm:text-xs lg:text-sm text-stone-400 font-bold hidden sm:inline">
              ({currentIndex + 1}/{questions.length})
            </span>
          )}
        </div>

        {/* Live Timer & Score */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isAnswered && !gameComplete && (
            <div className="flex items-center gap-1 px-2 py-0.5 lg:px-3 lg:py-1 bg-red-950/80 border border-red-700/60 rounded-xl text-amber-300 text-xs lg:text-sm font-bold shadow-inner">
              <Clock size={14} className="text-red-400 animate-spin" />
              <span>{elapsedTime.toFixed(1)}s</span>
            </div>
          )}

          {teamMode === 'TEAM' ? (
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg font-bold text-xs lg:text-sm ${currentTeam === 'A' ? 'bg-amber-400 text-gray-950' : 'bg-stone-800 text-stone-300'}`}>
                A:{teamAScore}
              </span>
              <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg font-bold text-xs lg:text-sm ${currentTeam === 'B' ? 'bg-red-500 text-white' : 'bg-stone-800 text-stone-300'}`}>
                B:{teamBScore}
              </span>
            </div>
          ) : (
            <div className="px-2 py-0.5 lg:px-3 lg:py-1 bg-stone-800 border border-stone-700 rounded-xl text-amber-300 font-black text-xs sm:text-sm lg:text-base">
              {score}分
            </div>
          )}

          <button
            onClick={() => setTeamMode(m => (m === 'SOLO' ? 'TEAM' : 'SOLO'))}
            className={`p-1 sm:px-2 sm:py-1 lg:px-3 lg:py-1.5 rounded-xl font-bold text-xs lg:text-sm transition shadow ${
              teamMode === 'TEAM' ? 'bg-amber-500 text-gray-950' : 'bg-stone-800 text-amber-200'
            }`}
            title="模式切換"
          >
            <Users size={16} />
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="p-1 sm:p-1.5 lg:px-2.5 lg:py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-xl transition shadow"
            title="規則說明"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={restart}
            className="p-1 sm:p-1.5 lg:px-2.5 lg:py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-xl transition shadow"
            title="重新開始"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Single Page Layout with Min-h-0 & Compact Height */}
      {!gameComplete && currentQ ? (
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between my-1 lg:my-2.5 bg-stone-900/90 border border-red-800/40 rounded-2xl p-2 sm:p-3 lg:p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
          
          {/* Prompt Question */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1 lg:pb-2.5 shrink-0">
            <div className="flex items-center gap-1.5 lg:gap-3">
              <span className="bg-red-900/80 text-amber-300 border border-red-500/50 text-[10px] sm:text-xs lg:text-sm xl:text-base font-black px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg whitespace-nowrap">
                {currentQ.badge}
              </span>
              <h2 className="text-xs sm:text-sm lg:text-lg xl:text-xl font-bold text-white leading-tight">
                {currentQ.prompt}
              </h2>
            </div>
          </div>

          {/* Table Cards Display */}
          <div className="my-auto py-1 lg:py-4 xl:py-6 flex flex-col items-center justify-center bg-stone-950/60 rounded-xl lg:rounded-2xl border border-stone-800/80 shadow-inner shrink-0">
            <span className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-amber-400 font-bold mb-0.5 lg:mb-2 flex items-center gap-1">
              <Flame size={14} className="text-red-500" />
              <span>桌面牌況</span>
            </span>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 lg:gap-5 xl:gap-6">
              {currentQ.tableCards.map((card, idx) => (
                <PlayingCard key={card.id || idx} card={card} size="sm" disabled showPointsBadge />
              ))}
            </div>
          </div>

          {/* Hand Cards Options */}
          <div className="shrink-0 flex flex-col items-center my-0.5 lg:my-2">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3 lg:gap-6 xl:gap-8 w-full max-w-lg lg:max-w-3xl xl:max-w-4xl justify-items-center">
              {currentQ.options.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                const isOptCorrect = opt.id === currentQ.correctOptionId;
                let highlight = false;
                if (isAnswered && isOptCorrect) highlight = true;

                return (
                  <div key={opt.id} className="flex flex-col items-center">
                    <PlayingCard
                      card={opt}
                      size="md"
                      selected={isSelected}
                      highlight={highlight}
                      disabled={isAnswered}
                      onClick={() => handleSelect(opt)}
                      showPointsBadge
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Feedback Banner & Next Button - Compact & NEVER Clipped */}
          <div className="shrink-0 min-h-[38px] lg:min-h-[56px] flex items-center">
            <AnimatePresence mode="wait">
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`w-full p-1.5 sm:p-2 lg:p-3.5 rounded-xl lg:rounded-2xl flex items-center justify-between gap-2 shadow border text-xs lg:text-base shrink-0 ${
                    isCorrect
                      ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100'
                      : 'bg-rose-950/95 border-rose-500 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 lg:gap-3 overflow-hidden">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 lg:w-6 lg:h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 lg:w-6 lg:h-6 text-rose-400 shrink-0" />
                    )}
                    <div className="truncate flex items-center gap-1 lg:gap-2">
                      {isCorrect && lastSpeedInfo && (
                        <span className="bg-emerald-800 text-amber-300 px-1 py-0.2 lg:px-2 lg:py-0.5 rounded font-black text-[10px] lg:text-xs whitespace-nowrap">
                          +{lastEarnedScore}分 {lastSpeedInfo.icon} {lastSpeedInfo.time}s
                        </span>
                      )}
                      <span className="font-bold truncate text-xs lg:text-base">{currentQ.explanation}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="shrink-0 px-3 py-1 sm:px-4 sm:py-1.5 lg:px-6 lg:py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base shadow active:scale-95 transition"
                  >
                    {currentIndex + 1 < questions.length ? '下一題 ➔' : '查看結算 🏆'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Final Score Screen */
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-3 gap-2.5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2.5 bg-red-600 text-amber-200 rounded-2xl shadow-xl"
          >
            <Award className="w-10 h-10 sm:w-14 sm:h-14" />
          </motion.div>

          <h2 className="text-lg sm:text-2xl font-black text-amber-300">
            🎴 撿紅點挑戰圓滿完成！
          </h2>

          {teamMode === 'TEAM' ? (
            <div className="bg-stone-800/90 border border-red-500/50 rounded-2xl p-3 max-w-sm w-full">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-500/20 border border-amber-400 p-2 rounded-xl">
                  <p className="text-xs text-amber-300 font-bold">A 組得分</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{teamAScore} 分</p>
                </div>
                <div className="bg-red-500/20 border border-red-400 p-2 rounded-xl">
                  <p className="text-xs text-red-300 font-bold">B 組得分</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{teamBScore} 分</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-3 max-w-sm w-full">
              <p className="text-stone-300 text-xs font-bold">總積分</p>
              <p className="text-2xl sm:text-4xl font-black text-amber-300">{score} 分</p>
              <p className="text-[11px] sm:text-xs text-stone-300 mt-1">湊十反應靈敏，紅點精算神速！</p>
            </div>
          )}

          <div className="flex gap-2.5 justify-center mt-1">
            <button
              onClick={restart}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-1"
            >
              <RotateCcw size={15} />
              再玩一局
            </button>
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs sm:text-sm shadow transition"
            >
              回遊戲選單
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChineseTenGame;
