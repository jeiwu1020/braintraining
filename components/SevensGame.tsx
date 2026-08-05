import React, { useState, useEffect, useRef } from 'react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, HelpCircle, CheckCircle2, XCircle, Award, Users, Sparkles, Clock, Zap } from 'lucide-react';
import { RulesModal } from './RulesModal';
import { soundService } from '../services/soundService';

interface SevensGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
}

export type SevensSuit = 'spade' | 'heart' | 'diamond' | 'club';

export interface SevensCardData {
  id: string;
  suit: SevensSuit;
  rank: number; // 1 (A) to 13 (K)
  name: string;
}

const SUIT_DISPLAY: Record<SevensSuit, { symbol: string; color: string; name: string }> = {
  spade: { symbol: '♠', color: 'text-slate-900', name: '黑桃' },
  heart: { symbol: '♥', color: 'text-red-600', name: '紅心' },
  diamond: { symbol: '♦', color: 'text-red-600', name: '方塊' },
  club: { symbol: '♣', color: 'text-slate-900', name: '梅花' }
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

export const SevensCard: React.FC<{
  card: SevensCardData;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  highlight?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  isSeven?: boolean;
}> = ({ card, size = 'md', selected = false, highlight = false, disabled = false, onClick, isSeven = false }) => {
  const suitInfo = SUIT_DISPLAY[card.suit];
  const rankLabel = RANK_LABELS[card.rank];

  // Fixed non-deforming playing card aspect ratio (~2:3)
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
        ${isSeven ? 'ring-2 lg:ring-3 ring-amber-400 border-amber-400 bg-amber-50/90' : ''}
        ${selected ? 'ring-3 lg:ring-4 ring-indigo-500 border-indigo-500 -translate-y-1 shadow-lg bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
        ${highlight ? 'ring-3 lg:ring-4 ring-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/30' : ''}
        ${disabled ? 'opacity-90 cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center justify-between leading-none w-full px-0.5 pt-0.5">
        <span className="font-black text-[11px] sm:text-xs lg:text-base xl:text-lg leading-none">{rankLabel}</span>
        <span className="text-[10px] sm:text-xs lg:text-base xl:text-lg leading-none">{suitInfo.symbol}</span>
      </div>

      <div className="text-lg sm:text-2xl lg:text-4xl xl:text-5xl font-black text-center my-auto leading-none select-none">
        {suitInfo.symbol}
      </div>

      <div className="flex items-center justify-center leading-none w-full pb-0.5">
        <span className={`text-[8px] sm:text-[9px] lg:text-xs xl:text-sm font-bold leading-none ${isSeven ? 'text-amber-700 font-black' : 'text-gray-400'}`}>
          {isSeven ? '★ 關鍵7' : suitInfo.name}
        </span>
      </div>
    </motion.button>
  );
};

interface SevensQuestion {
  id: number;
  type: 'extend_up' | 'extend_down' | 'start_seven' | 'hold_trap';
  title: string;
  prompt: string;
  boardCards: { suit: SevensSuit; min: number; max: number }[];
  options: SevensCardData[];
  correctOptionId: string;
  explanation: string;
  badge: string;
}

const generateSevensPool = (isAdv: boolean): SevensQuestion[] => {
  const pool: SevensQuestion[] = [
    // 1. 向上接牌 (黑桃8)
    {
      id: 1,
      type: 'extend_up',
      title: '向上接牌 (黑桃7 ➜ 8)',
      prompt: '桌面【黑桃】目前只有【黑桃7】。手牌哪一張可以合法接上去？',
      boardCards: [{ suit: 'spade', min: 7, max: 7 }],
      options: [
        { id: 'opt_1', suit: 'spade', rank: 8, name: '黑桃8' },
        { id: 'opt_2', suit: 'spade', rank: 9, name: '黑桃9' },
        { id: 'opt_3', suit: 'heart', rank: 8, name: '紅心8' },
        { id: 'opt_4', suit: 'diamond', rank: 6, name: '方塊6' }
      ],
      correctOptionId: 'opt_1',
      explanation: '黑桃7 向上相鄰為【黑桃8】，可以順利出牌接續！',
      badge: '向上接牌'
    },
    // 2. 向下接牌 (紅心6)
    {
      id: 2,
      type: 'extend_down',
      title: '向下接牌 (紅心7 ➜ 6)',
      prompt: '桌面【紅心】已有【紅心7】。手牌哪一張可以合法接在下方？',
      boardCards: [{ suit: 'heart', min: 7, max: 7 }],
      options: [
        { id: 'opt_5', suit: 'heart', rank: 6, name: '紅心6' },
        { id: 'opt_6', suit: 'heart', rank: 5, name: '紅心5' },
        { id: 'opt_7', suit: 'club', rank: 6, name: '梅花6' },
        { id: 'opt_8', suit: 'spade', rank: 7, name: '黑桃7' }
      ],
      correctOptionId: 'opt_5',
      explanation: '紅心7 向下相鄰為【紅心6】，成功出牌！',
      badge: '向下接牌'
    },
    // 3. 全新起手 (方塊7開局)
    {
      id: 3,
      type: 'start_seven',
      title: '開闢新花色 (出7開路)',
      prompt: '目前桌上只有黑桃與紅心有牌，方塊完全沒有牌。手上出哪一張能為方塊開局？',
      boardCards: [
        { suit: 'spade', min: 6, max: 8 },
        { suit: 'heart', min: 7, max: 7 }
      ],
      options: [
        { id: 'opt_9', suit: 'diamond', rank: 7, name: '方塊7' },
        { id: 'opt_10', suit: 'diamond', rank: 6, name: '方塊6' },
        { id: 'opt_11', suit: 'diamond', rank: 8, name: '方塊8' },
        { id: 'opt_12', suit: 'club', rank: 7, name: '梅花7' }
      ],
      correctOptionId: 'opt_9',
      explanation: '任何花色要開局必須先出【7】！【方塊7】成功啟動方塊線！',
      badge: '出7開局'
    },
    // 4. 梅花連續長龍 (梅花 5~9)
    {
      id: 4,
      type: 'extend_down',
      title: '長龍接牌 (梅花4 或 梅花10)',
      prompt: '桌面【梅花】目前已經接到【5、6、7、8、9】。手上哪一張可以合法接牌？',
      boardCards: [{ suit: 'club', min: 5, max: 9 }],
      options: [
        { id: 'opt_13', suit: 'club', rank: 4, name: '梅花4' },
        { id: 'opt_14', suit: 'club', rank: 3, name: '梅花3' },
        { id: 'opt_15', suit: 'heart', rank: 4, name: '紅心4' },
        { id: 'opt_16', suit: 'spade', rank: 10, name: '黑桃10' }
      ],
      correctOptionId: 'opt_13',
      explanation: '梅花已有 5~9，【梅花4】(向下) 或【梅花10】(向上) 皆可合法接牌！',
      badge: '順龍接牌'
    },
    // 5. 終局頂點 (出 A 封底 或 出 K 登頂)
    {
      id: 5,
      type: 'extend_down',
      title: '終局底牌 (接A封頂)',
      prompt: '桌面【紅心】已經接到【2、3、4、5、6、7、8】。手牌哪一張可以到底？',
      boardCards: [{ suit: 'heart', min: 2, max: 8 }],
      options: [
        { id: 'opt_17', suit: 'heart', rank: 1, name: '紅心A' },
        { id: 'opt_18', suit: 'heart', rank: 10, name: '紅心10' },
        { id: 'opt_19', suit: 'diamond', rank: 1, name: '方塊A' },
        { id: 'opt_20', suit: 'spade', rank: 2, name: '黑桃2' }
      ],
      correctOptionId: 'opt_17',
      explanation: '紅心已接到 2，【紅心A(1)】順利封底，紅心下半部全數通關！',
      badge: '封底A牌'
    }
  ];

  if (isAdv) {
    pool.push(
      // 進階 1: 蓋牌陷阱 / 忍住不扣牌 (打對手需要的牌 vs 自己安全牌)
      {
        id: 6,
        type: 'hold_trap',
        title: '進階 戰略出牌 (避免放水)',
        prompt: '手牌有【黑桃6】與【紅心8】皆可出。已知下家手上扣著多張黑桃小牌，出哪一張對自己最有利？',
        boardCards: [
          { suit: 'spade', min: 7, max: 7 },
          { suit: 'heart', min: 7, max: 7 }
        ],
        options: [
          { id: 'opt_21', suit: 'heart', rank: 8, name: '紅心8' },
          { id: 'opt_22', suit: 'spade', rank: 6, name: '黑桃6' },
          { id: 'opt_23', suit: 'club', rank: 2, name: '梅花2' },
          { id: 'opt_24', suit: 'diamond', rank: 13, name: '方塊K' }
        ],
        correctOptionId: 'opt_21',
        explanation: '出【紅心8】可以扣住黑桃6，卡死下家的黑桃5、4、3，迫使對手蓋牌扣分！',
        badge: '卡牌戰略'
      },
      // 進階 2: 雙端突破
      {
        id: 7,
        type: 'extend_up',
        title: '進階 高端登頂K (出K登頂)',
        prompt: '桌面【方塊】已經延伸至【4、5、6、7、8、9、10、J、Q】。手牌哪一張能完成方塊登頂？',
        boardCards: [{ suit: 'diamond', min: 4, max: 12 }],
        options: [
          { id: 'opt_25', suit: 'diamond', rank: 13, name: '方塊K' },
          { id: 'opt_26', suit: 'diamond', rank: 2, name: '方塊2' },
          { id: 'opt_27', suit: 'heart', rank: 13, name: '紅心K' },
          { id: 'opt_28', suit: 'spade', rank: 12, name: '黑桃Q' }
        ],
        correctOptionId: 'opt_25',
        explanation: '方塊已到 Q(12)，接上【方塊K(13)】完成登頂大滿貫！',
        badge: '登頂K牌'
      },
      // 進階 3: 四條花色綜合判斷
      {
        id: 8,
        type: 'extend_down',
        title: '進階 四花色全場精準出牌',
        prompt: '桌況：黑桃(6-8)、紅心(7-7)、方塊(3-9)、梅花(未開)。手牌唯一合法的一張是？',
        boardCards: [
          { suit: 'spade', min: 6, max: 8 },
          { suit: 'heart', min: 7, max: 7 },
          { suit: 'diamond', min: 3, max: 9 }
        ],
        options: [
          { id: 'opt_29', suit: 'diamond', rank: 2, name: '方塊2' },
          { id: 'opt_30', suit: 'spade', rank: 4, name: '黑桃4' },
          { id: 'opt_31', suit: 'heart', rank: 9, name: '紅心9' },
          { id: 'opt_32', suit: 'club', rank: 6, name: '梅花6' }
        ],
        correctOptionId: 'opt_29',
        explanation: '方塊已有 3，【方塊2】可合法向下銜接！其他牌皆未相鄰或梅花未開7！',
        badge: '全場審牌'
      }
    );
  }

  return pool.sort(() => Math.random() - 0.5);
};

const calculateTimeScore = (seconds: number): { score: number; label: string; icon: string } => {
  if (seconds <= 2.5) return { score: 100, label: '極速接龍', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '眼疾手快', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉穩審牌', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '佈局深遠', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

const SevensGame: React.FC<SevensGameProps> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false }) => {
  const isAdv = isAdvanced || difficulty === 'ADVANCED';

  const [questions, setQuestions] = useState<SevensQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [lastEarnedScore, setLastEarnedScore] = useState(0);
  const [lastSpeedInfo, setLastSpeedInfo] = useState<{ label: string; icon: string; time: number } | null>(null);

  // Live Timer
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
    const list = generateSevensPool(isAdv);
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

  const handleSelect = (opt: SevensCardData) => {
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
    '【排七接龍 (接龍/排龍)】經典撲克策略遊戲：',
    '7 是關鍵起點：所有花色必須從【7】開始放置於桌面。',
    '相鄰接牌：向上接 8、9、10、J、Q、K；向下接 6、5、4、3、2、A。',
    '無牌可出時需「蓋牌扣分」，出牌策略考驗卡牌技巧！',
    '⚡ 速度評分機制：作答越快得分越高（最高100分）！'
  ];

  return (
    <div className="h-screen max-h-screen w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white flex flex-col p-1.5 sm:p-3 select-none overflow-hidden justify-between">
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="排七接龍 規則說明" rules={rules} />

      {/* Top Compact Bar */}
      <div className="flex items-center justify-between gap-1.5 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-indigo-800 hover:bg-indigo-700 active:scale-95 text-indigo-100 rounded-xl font-bold text-xs sm:text-sm lg:text-base transition shadow"
        >
          <ArrowLeft size={16} />
          <span>返回</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-indigo-500 text-white rounded-full text-[10px] sm:text-xs lg:text-sm font-black">
            {isAdv ? '進階卡牌' : '經典排七'}
          </span>
          <h1 className="text-xs sm:text-base lg:text-xl font-black text-indigo-300 tracking-wide truncate max-w-[130px] sm:max-w-none">
            排七接龍
          </h1>
          {currentQ && (
            <span className="text-[11px] sm:text-xs lg:text-sm text-indigo-200 font-bold hidden sm:inline">
              ({currentIndex + 1}/{questions.length})
            </span>
          )}
        </div>

        {/* Live Timer & Score */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isAnswered && !gameComplete && (
            <div className="flex items-center gap-1 px-2 py-0.5 lg:px-3 lg:py-1 bg-indigo-900/90 border border-indigo-600/70 rounded-xl text-indigo-300 text-xs lg:text-sm font-bold shadow-inner">
              <Clock size={14} className="text-indigo-400 animate-spin" />
              <span>{elapsedTime.toFixed(1)}s</span>
            </div>
          )}

          {teamMode === 'TEAM' ? (
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg font-bold text-xs lg:text-sm ${currentTeam === 'A' ? 'bg-amber-400 text-gray-950' : 'bg-indigo-900 text-indigo-300'}`}>
                A:{teamAScore}
              </span>
              <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg font-bold text-xs lg:text-sm ${currentTeam === 'B' ? 'bg-sky-400 text-gray-950' : 'bg-indigo-900 text-indigo-300'}`}>
                B:{teamBScore}
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-0.5 lg:px-3 lg:py-1 bg-indigo-900/90 border border-indigo-700 rounded-xl text-indigo-300 font-black text-xs sm:text-sm lg:text-base">
              {score}分
            </div>
          )}

          <button
            onClick={() => setTeamMode(m => (m === 'SOLO' ? 'TEAM' : 'SOLO'))}
            className={`p-1 sm:px-2 sm:py-1 lg:px-3 lg:py-1.5 rounded-xl font-bold text-xs lg:text-sm transition shadow ${
              teamMode === 'TEAM' ? 'bg-amber-500 text-gray-950' : 'bg-indigo-800 text-indigo-200'
            }`}
            title="模式切換"
          >
            <Users size={16} />
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="p-1 sm:p-1.5 lg:px-2.5 lg:py-2 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 rounded-xl transition shadow"
            title="規則說明"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={restart}
            className="p-1 sm:p-1.5 lg:px-2.5 lg:py-2 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 rounded-xl transition shadow"
            title="重新開始"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Single Page Layout with Min-h-0 & Compact Height */}
      {!gameComplete && currentQ ? (
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between my-1 lg:my-2.5 bg-indigo-950/80 border border-indigo-700/50 rounded-2xl p-2 sm:p-3 lg:p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
          
          {/* Question Banner */}
          <div className="flex items-center justify-between gap-2 border-b border-indigo-800/80 pb-1 lg:pb-2.5 shrink-0">
            <div className="flex items-center gap-1.5 lg:gap-3">
              <span className="bg-indigo-800 text-indigo-300 border border-indigo-600/50 text-[10px] sm:text-xs lg:text-sm xl:text-base font-black px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg whitespace-nowrap">
                {currentQ.badge}
              </span>
              <h2 className="text-xs sm:text-sm lg:text-lg xl:text-xl font-bold text-white leading-tight">
                {currentQ.prompt}
              </h2>
            </div>
          </div>

          {/* Board Display */}
          <div className="my-auto py-1 lg:py-4 xl:py-6 flex flex-col items-center justify-center bg-black/40 rounded-xl lg:rounded-2xl border border-indigo-800/70 shadow-inner shrink-0">
            <span className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-indigo-300 font-bold mb-0.5 lg:mb-2 flex items-center gap-1">
              <Sparkles size={14} className="text-indigo-400" />
              <span>當前牌桌接龍狀況</span>
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-6">
              {currentQ.boardCards.map((b, idx) => (
                <div key={idx} className="flex items-center gap-1 sm:gap-1.5 lg:gap-3 bg-indigo-900/60 p-1 sm:p-1.5 lg:p-3 rounded-xl lg:rounded-2xl border border-indigo-700/50">
                  <span className="text-xs sm:text-sm lg:text-xl xl:text-2xl font-black text-amber-300 px-1">
                    {SUIT_DISPLAY[b.suit].symbol}
                  </span>
                  <div className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold text-indigo-100 flex items-center gap-1 lg:gap-2">
                    {b.min === b.max ? (
                      <span className="bg-amber-400 text-gray-950 px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded lg:rounded-lg font-black text-xs sm:text-sm lg:text-base">
                        {RANK_LABELS[b.min]}
                      </span>
                    ) : (
                      <span>
                        <span className="font-black text-indigo-200">{RANK_LABELS[b.min]}</span>
                        <span className="text-gray-400 mx-0.5 lg:mx-1">~</span>
                        <span className="bg-amber-400 text-gray-950 px-1 py-0.2 lg:px-2 lg:py-0.5 rounded lg:rounded-md font-black text-xs sm:text-sm lg:text-base">7</span>
                        <span className="text-gray-400 mx-0.5 lg:mx-1">~</span>
                        <span className="font-black text-indigo-200">{RANK_LABELS[b.max]}</span>
                      </span>
                    )}
                  </div>
                </div>
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
                    <SevensCard
                      card={opt}
                      size="md"
                      selected={isSelected}
                      highlight={highlight}
                      disabled={isAnswered}
                      onClick={() => handleSelect(opt)}
                      isSeven={opt.rank === 7}
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
                        <span className="bg-emerald-800 text-indigo-200 px-1 py-0.2 lg:px-2 lg:py-0.5 rounded font-black text-[10px] lg:text-xs whitespace-nowrap">
                          +{lastEarnedScore}分 {lastSpeedInfo.icon} {lastSpeedInfo.time}s
                        </span>
                      )}
                      <span className="font-bold truncate text-xs lg:text-base">{currentQ.explanation}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="shrink-0 px-3 py-1 sm:px-4 sm:py-1.5 lg:px-6 lg:py-2.5 bg-indigo-400 hover:bg-indigo-300 text-gray-950 font-black rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base shadow active:scale-95 transition"
                  >
                    {currentIndex + 1 < questions.length ? '下一題 ➔' : '查看結算 🏆'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* End Screen */
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-3 gap-2.5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2.5 bg-indigo-500 text-white rounded-2xl shadow-xl"
          >
            <Award className="w-10 h-10 sm:w-14 sm:h-14" />
          </motion.div>

          <h2 className="text-lg sm:text-2xl font-black text-indigo-300">
            🎴 排七接龍大師通關！
          </h2>

          {teamMode === 'TEAM' ? (
            <div className="bg-indigo-900/60 border border-indigo-500/50 rounded-2xl p-3 max-w-sm w-full">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-500/20 border border-amber-400 p-2 rounded-xl">
                  <p className="text-xs text-amber-300 font-bold">A 組得分</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{teamAScore} 分</p>
                </div>
                <div className="bg-sky-500/20 border border-sky-400 p-2 rounded-xl">
                  <p className="text-xs text-sky-300 font-bold">B 組得分</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{teamBScore} 分</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-900/60 border border-indigo-700/50 rounded-2xl p-3 max-w-sm w-full">
              <p className="text-indigo-300 text-xs font-bold">總積分</p>
              <p className="text-2xl sm:text-4xl font-black text-indigo-300">{score} 分</p>
              <p className="text-[11px] sm:text-xs text-indigo-200 mt-1">接龍節奏明快，卡牌防守與搶出兼備！</p>
            </div>
          )}

          <div className="flex gap-2.5 justify-center mt-1">
            <button
              onClick={restart}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-indigo-400 hover:bg-indigo-300 text-gray-950 font-black rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-1"
            >
              <RotateCcw size={15} />
              再玩一局
            </button>
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 font-bold rounded-xl text-xs sm:text-sm shadow transition"
            >
              回遊戲選單
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SevensGame;
