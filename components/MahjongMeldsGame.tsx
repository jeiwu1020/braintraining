import React, { useState, useEffect, useRef } from 'react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, HelpCircle, Sparkles, CheckCircle2, XCircle, Award, Users, Clock, Zap } from 'lucide-react';
import { RulesModal } from './RulesModal';
import { soundService } from '../services/soundService';

interface MahjongMeldsGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
}

export type MahjongSuit = 'wan' | 'tong' | 'tiao' | 'zi';

export interface MahjongTileData {
  id: string;
  suit: MahjongSuit;
  value: number; // 1-9 for wan/tong/tiao; 1-7 for zi (1:東, 2:南, 3:西, 4:北, 5:中, 6:發, 7:白)
  name: string;
}

export const MahjongTile: React.FC<{
  tile: MahjongTileData;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  highlight?: boolean;
  status?: 'correct' | 'wrong' | null;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ tile, size = 'md', selected = false, highlight = false, status = null, onClick, disabled = false }) => {
  // Rigid rectangular dimensions adhering strictly to classic Mahjong tile proportions (ratio ~ 7:10)
  const sizeClasses = {
    sm: 'w-11 h-16 sm:w-13 sm:h-19 lg:w-20 lg:h-28 xl:w-24 xl:h-34 text-xs lg:text-base xl:text-lg',
    md: 'w-14 h-20 sm:w-16 sm:h-24 lg:w-24 lg:h-34 xl:w-28 xl:h-40 text-sm lg:text-lg xl:text-xl',
    lg: 'w-16 h-24 sm:w-20 sm:h-29 lg:w-28 lg:h-40 xl:w-32 xl:h-46 text-base lg:text-xl xl:text-2xl'
  };

  const renderContent = () => {
    const numNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    if (tile.suit === 'wan') {
      return (
        <div className="flex flex-col items-center justify-center leading-none select-none my-auto">
          <span className="text-red-700 font-serif font-black text-sm sm:text-base lg:text-2xl xl:text-3xl tracking-tight leading-none">
            {numNames[tile.value]}
          </span>
          <span className="text-red-700 font-serif font-bold text-xs sm:text-sm lg:text-lg xl:text-xl tracking-tight leading-none mt-1 lg:mt-2">
            萬
          </span>
        </div>
      );
    }
    if (tile.suit === 'tong') {
      return (
        <div className="flex flex-col items-center justify-center leading-none select-none my-auto">
          <span className="text-blue-700 font-black text-sm sm:text-base lg:text-2xl xl:text-3xl leading-none">
            {tile.value}
          </span>
          <span className="text-blue-900 font-extrabold text-xs sm:text-sm lg:text-lg xl:text-xl leading-none mt-1 lg:mt-2">
            筒
          </span>
        </div>
      );
    }
    if (tile.suit === 'tiao') {
      return (
        <div className="flex flex-col items-center justify-center leading-none select-none my-auto">
          <span className="text-emerald-700 font-black text-sm sm:text-base lg:text-2xl xl:text-3xl leading-none">
            {tile.value}
          </span>
          <span className="text-emerald-900 font-extrabold text-xs sm:text-sm lg:text-lg xl:text-xl leading-none mt-1 lg:mt-2">
            條
          </span>
        </div>
      );
    }
    if (tile.suit === 'zi') {
      const ziData = [
        { top: '東', bottom: '風', color: 'text-blue-950', subColor: 'text-blue-900' },
        { top: '南', bottom: '風', color: 'text-blue-950', subColor: 'text-blue-900' },
        { top: '西', bottom: '風', color: 'text-blue-950', subColor: 'text-blue-900' },
        { top: '北', bottom: '風', color: 'text-blue-950', subColor: 'text-blue-900' },
        { top: '紅', bottom: '中', color: 'text-red-600', subColor: 'text-red-600' },
        { top: '發', bottom: '財', color: 'text-emerald-700', subColor: 'text-emerald-700' },
        { top: '白', bottom: '板', color: 'text-blue-900', subColor: 'text-blue-800' },
      ];
      const zi = ziData[tile.value - 1] || { top: '字', bottom: '牌', color: 'text-slate-800', subColor: 'text-slate-700' };

      return (
        <div className="flex flex-col items-center justify-center leading-none select-none my-auto">
          <span className={`font-black text-sm sm:text-base lg:text-2xl xl:text-3xl tracking-tight leading-none ${zi.color}`}>
            {zi.top}
          </span>
          <span className={`font-bold text-xs sm:text-sm lg:text-lg xl:text-xl tracking-tight leading-none mt-1 lg:mt-2 ${zi.subColor}`}>
            {zi.bottom}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`relative ${sizeClasses[size]} rounded-md border-x border-t bg-gradient-to-b from-[#fffff9] via-[#fcfbf4] to-[#f4f1e4] border-b-[4px] lg:border-b-[6px] shadow-md flex flex-col items-center justify-center p-1 lg:p-2 transition-all select-none overflow-hidden shrink-0
        ${status === 'correct' ? 'border-emerald-500 border-b-emerald-700 ring-3 lg:ring-4 ring-emerald-400 bg-emerald-50/90 shadow-emerald-500/40' :
          status === 'wrong' ? 'border-rose-500 border-b-rose-700 ring-3 lg:ring-4 ring-rose-500 bg-rose-50/90 shadow-rose-500/40' :
          selected ? 'border-amber-600 border-b-amber-700 ring-3 lg:ring-4 ring-amber-500 -translate-y-1 shadow-lg bg-amber-100' :
          highlight ? 'border-emerald-500 border-b-emerald-700 ring-3 lg:ring-4 ring-emerald-400 shadow-md shadow-emerald-500/30' :
          'border-[#d6cfb8] border-b-emerald-800 hover:border-amber-400'
        }
        ${disabled ? 'opacity-95 cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="w-full h-full flex items-center justify-center">
        {renderContent()}
      </div>

      {/* Prominent Correct ⭕ / Wrong ❌ Visual Stamp */}
      {status === 'correct' && (
        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[0.5px] flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-black text-emerald-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] leading-none animate-bounce">
            ⭕
          </span>
        </div>
      )}

      {status === 'wrong' && (
        <div className="absolute inset-0 bg-rose-500/25 backdrop-blur-[0.5px] flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-black text-rose-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] leading-none animate-pulse">
            ❌
          </span>
        </div>
      )}
    </motion.button>
  );
};

interface MahjongQuestion {
  id: number;
  type: 'meld_run' | 'meld_triplet' | 'tenpai' | 'pair' | 'complex_wait';
  title: string;
  prompt: string;
  hand: MahjongTileData[];
  options: MahjongTileData[];
  correctAnswerId: string;
  explanation: string;
  meldTypeLabel: string;
}

const generateMahjongPool = (isAdv: boolean): MahjongQuestion[] => {
  const pool: MahjongQuestion[] = [
    // 1. 萬子順子 (雙頭聽)
    {
      id: 1,
      type: 'meld_run',
      title: '湊成順子 (萬子雙頭)',
      prompt: '手上有【三萬】與【四萬】，要湊成「順子」(三張連號)，差哪一張牌？',
      hand: [
        { id: 'h1', suit: 'wan', value: 3, name: '三萬' },
        { id: 'h2', suit: 'wan', value: 4, name: '四萬' }
      ],
      options: [
        { id: 'opt_1', suit: 'wan', value: 5, name: '五萬' },
        { id: 'opt_2', suit: 'tong', value: 5, name: '五筒' },
        { id: 'opt_3', suit: 'wan', value: 7, name: '七萬' },
        { id: 'opt_4', suit: 'tiao', value: 3, name: '三條' }
      ],
      correctAnswerId: 'opt_1',
      explanation: '【五萬】與三萬、四萬結合成「三四五萬」順子！(二萬也可成順)',
      meldTypeLabel: '順子搭子'
    },
    // 2. 條子刻子 (碰牌)
    {
      id: 2,
      type: 'meld_triplet',
      title: '湊成刻子 (碰牌)',
      prompt: '手上有兩張【八條】對子，要湊成「刻子」(三張相同)，差哪一張牌？',
      hand: [
        { id: 'h3', suit: 'tiao', value: 8, name: '八條' },
        { id: 'h4', suit: 'tiao', value: 8, name: '八條' }
      ],
      options: [
        { id: 'opt_5', suit: 'tiao', value: 8, name: '八條' },
        { id: 'opt_6', suit: 'tong', value: 8, name: '八筒' },
        { id: 'opt_7', suit: 'tiao', value: 7, name: '七條' },
        { id: 'opt_8', suit: 'wan', value: 8, name: '八萬' }
      ],
      correctAnswerId: 'opt_5',
      explanation: '再一張【八條】就能湊成三張一樣的「八條刻子」！',
      meldTypeLabel: '刻子 (碰)'
    },
    // 3. 筒子嵌張 (中洞聽)
    {
      id: 3,
      type: 'meld_run',
      title: '中洞嵌張順子',
      prompt: '手上有【六筒】與【八筒】，要湊成順子，卡在中間缺哪一張？',
      hand: [
        { id: 'h5', suit: 'tong', value: 6, name: '六筒' },
        { id: 'h6', suit: 'tong', value: 8, name: '八筒' }
      ],
      options: [
        { id: 'opt_9', suit: 'tong', value: 7, name: '七筒' },
        { id: 'opt_10', suit: 'tong', value: 9, name: '九筒' },
        { id: 'opt_11', suit: 'tiao', value: 7, name: '七條' },
        { id: 'opt_12', suit: 'wan', value: 7, name: '七萬' }
      ],
      correctAnswerId: 'opt_9',
      explanation: '【七筒】補齊中洞，形成「六七八筒」完整順子！',
      meldTypeLabel: '嵌張順子'
    },
    // 4. 字牌大三元刻子
    {
      id: 4,
      type: 'meld_triplet',
      title: '字牌刻子 (紅中)',
      prompt: '手上有兩張【紅中】，差哪一張能組成紅中刻子？',
      hand: [
        { id: 'h7', suit: 'zi', value: 5, name: '紅中' },
        { id: 'h8', suit: 'zi', value: 5, name: '紅中' }
      ],
      options: [
        { id: 'opt_13', suit: 'zi', value: 5, name: '紅中' },
        { id: 'opt_14', suit: 'zi', value: 6, name: '發財' },
        { id: 'opt_15', suit: 'zi', value: 7, name: '白板' },
        { id: 'opt_16', suit: 'wan', value: 1, name: '一萬' }
      ],
      correctAnswerId: 'opt_13',
      explanation: '【紅中】湊齊三張，是大三元不可或缺的字牌刻子！',
      meldTypeLabel: '字牌刻子'
    },
    // 5. 邊張順子 (1-2邊張聽3)
    {
      id: 5,
      type: 'meld_run',
      title: '邊張順子 (一二聽三)',
      prompt: '手上有【一條】與【二條】，要完成順子，只能等哪一張牌？',
      hand: [
        { id: 'h9', suit: 'tiao', value: 1, name: '一條' },
        { id: 'h10', suit: 'tiao', value: 2, name: '二條' }
      ],
      options: [
        { id: 'opt_17', suit: 'tiao', value: 3, name: '三條' },
        { id: 'opt_18', suit: 'tiao', value: 4, name: '四條' },
        { id: 'opt_19', suit: 'tong', value: 3, name: '三筒' },
        { id: 'opt_20', suit: 'zi', value: 1, name: '東風' }
      ],
      correctAnswerId: 'opt_17',
      explanation: '【三條】為一二條的唯一邊張進牌，湊成「一二三條」！',
      meldTypeLabel: '邊張順子'
    }
  ];

  if (isAdv) {
    pool.push(
      // 進階 1: 聽牌判斷 (兩面聽)
      {
        id: 6,
        type: 'tenpai',
        title: '進階 聽牌胡牌 (萬子雙面)',
        prompt: '已有雀頭與其他面子，手上剩【七萬】與【八萬】，自摸哪一張能直接胡牌？',
        hand: [
          { id: 'h11', suit: 'wan', value: 7, name: '七萬' },
          { id: 'h12', suit: 'wan', value: 8, name: '八萬' }
        ],
        options: [
          { id: 'opt_21', suit: 'wan', value: 9, name: '九萬' },
          { id: 'opt_22', suit: 'wan', value: 5, name: '五萬' },
          { id: 'opt_23', suit: 'tong', value: 9, name: '九筒' },
          { id: 'opt_24', suit: 'tiao', value: 6, name: '六條' }
        ],
        correctAnswerId: 'opt_21',
        explanation: '聽【六萬】與【九萬】！抽中九萬順利胡牌成七八九萬！',
        meldTypeLabel: '雙面聽牌'
      },
      // 進階 2: 複合形狀 (連續五張 3-4-5-6-7 聽兩頭)
      {
        id: 7,
        type: 'complex_wait',
        title: '進階 複合長連順 (五連順)',
        prompt: '手上有【三條】【四條】【五條】【六條】，差哪一張能完成兩組順子？',
        hand: [
          { id: 'h13', suit: 'tiao', value: 3, name: '三條' },
          { id: 'h14', suit: 'tiao', value: 4, name: '四條' },
          { id: 'h15', suit: 'tiao', value: 5, name: '五條' },
          { id: 'h16', suit: 'tiao', value: 6, name: '六條' }
        ],
        options: [
          { id: 'opt_25', suit: 'tiao', value: 2, name: '二條' },
          { id: 'opt_26', suit: 'tiao', value: 8, name: '八條' },
          { id: 'opt_27', suit: 'wan', value: 2, name: '二萬' },
          { id: 'opt_28', suit: 'tong', value: 7, name: '七筒' }
        ],
        correctAnswerId: 'opt_25',
        explanation: '進【二條】成(234)配(56待7)；或進【七條】成(345)配(67待8)！',
        meldTypeLabel: '多面聽牌'
      },
      // 進階 3: 雀頭單騎聽
      {
        id: 8,
        type: 'pair',
        title: '進階 單騎定雀頭',
        prompt: '所有面子(順子/刻子)皆已完成，手中只剩一張【白板】，等哪張牌當雀頭眼睛胡牌？',
        hand: [
          { id: 'h17', suit: 'zi', value: 7, name: '白板' }
        ],
        options: [
          { id: 'opt_29', suit: 'zi', value: 7, name: '白板' },
          { id: 'opt_30', suit: 'zi', value: 6, name: '發財' },
          { id: 'opt_31', suit: 'wan', value: 1, name: '一萬' },
          { id: 'opt_32', suit: 'tong', value: 1, name: '一筒' }
        ],
        correctAnswerId: 'opt_29',
        explanation: '單騎聽【白板】，摸到白板即組成兩張白板雀頭，完美自摸胡牌！',
        meldTypeLabel: '單騎雀頭'
      }
    );
  }

  return pool.sort(() => Math.random() - 0.5);
};

const calculateTimeScore = (seconds: number): { score: number; label: string; icon: string } => {
  if (seconds <= 2.5) return { score: 100, label: '雀聖神速', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '眼明手快', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉穩聽牌', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '深思熟慮', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

const MahjongMeldsGame: React.FC<MahjongMeldsGameProps> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false }) => {
  const isAdv = isAdvanced || difficulty === 'ADVANCED';

  const [questions, setQuestions] = useState<MahjongQuestion[]>([]);
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
    restartGame();
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

  const restartGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const list = generateMahjongPool(isAdv);
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
  const selectedOption = currentQ?.options.find(opt => opt.id === selectedOptionId) || null;

  const handleSelectOption = (option: MahjongTileData) => {
    if (isAnswered || !currentQ) return;

    if (timerRef.current) clearInterval(timerRef.current);
    const finalSec = Number(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
    setElapsedTime(finalSec);

    soundService.playTilePlace();
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    const correct = option.id === currentQ.correctAnswerId;
    setIsCorrect(correct);

    if (correct) {
      soundService.playCorrect();
      const speedCalc = calculateTimeScore(finalSec);
      const earned = speedCalc.score;
      setLastEarnedScore(earned);
      setLastSpeedInfo({ label: speedCalc.label, icon: speedCalc.icon, time: finalSec });

      setScore(prev => prev + earned);
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
    soundService.playTilePlace();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
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

  const rulesList = [
    '【麻將湊牌大師】益智組合配對：',
    '順子：同花色連續三張（例如：三萬、四萬、五萬）。',
    '刻子 (碰)：三張一模一樣的牌（例如：三張五條、三張紅中）。',
    '將牌 (眼睛)：兩張一模一樣的牌當雀頭。',
    '雙頭聽 / 三面聽：判斷缺哪張牌能自摸胡牌！',
    '⚡ 速度評分機制：作答越快得分越高（最高100分）！'
  ];

  return (
    <div className="h-screen max-h-screen w-full bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white flex flex-col p-1.5 sm:p-3 select-none overflow-hidden justify-between">
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="麻將湊牌大師 規則說明" rules={rulesList} />

      {/* Top Compact Navigation Bar */}
      <div className="flex items-center justify-between gap-1.5 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-emerald-100 rounded-xl font-bold text-xs sm:text-sm lg:text-base transition shadow"
        >
          <ArrowLeft size={16} />
          <span>返回</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-amber-500 text-gray-950 rounded-full text-[10px] sm:text-xs lg:text-sm font-black">
            {isAdv ? '進階聽牌' : '經典麻將'}
          </span>
          <h1 className="text-xs sm:text-base lg:text-xl font-black text-amber-300 tracking-wide truncate max-w-[130px] sm:max-w-none">
            麻將湊牌大師
          </h1>
          {currentQ && (
            <span className="text-[11px] sm:text-xs lg:text-sm text-emerald-300 font-bold hidden sm:inline">
              ({currentIndex + 1}/{questions.length})
            </span>
          )}
        </div>

        {/* Live Timer & Score */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isAnswered && !gameComplete && (
            <div className="flex items-center gap-1 px-2 py-0.5 lg:px-3 lg:py-1 bg-emerald-900/90 border border-emerald-600/70 rounded-xl text-amber-300 text-xs lg:text-sm font-bold shadow-inner">
              <Clock size={14} className="text-amber-400 animate-spin" />
              <span>{elapsedTime.toFixed(1)}s</span>
            </div>
          )}

          {teamMode === 'TEAM' ? (
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg font-bold text-xs lg:text-sm ${currentTeam === 'A' ? 'bg-amber-400 text-gray-950' : 'bg-emerald-900 text-emerald-300'}`}>
                A:{teamAScore}
              </span>
              <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg font-bold text-xs lg:text-sm ${currentTeam === 'B' ? 'bg-blue-400 text-gray-950' : 'bg-emerald-900 text-emerald-300'}`}>
                B:{teamBScore}
              </span>
            </div>
          ) : (
            <div className="px-2 py-0.5 lg:px-3 lg:py-1 bg-emerald-900/90 border border-emerald-700 rounded-xl text-amber-300 font-black text-xs sm:text-sm lg:text-base">
              {score}分
            </div>
          )}

          <button
            onClick={() => setTeamMode(m => (m === 'SOLO' ? 'TEAM' : 'SOLO'))}
            className={`p-1 sm:px-2 sm:py-1 lg:px-3 lg:py-1.5 rounded-xl font-bold text-xs lg:text-sm transition shadow ${
              teamMode === 'TEAM' ? 'bg-amber-500 text-gray-950' : 'bg-emerald-800 text-emerald-200'
            }`}
            title="模式切換"
          >
            <Users size={16} />
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="p-1 sm:p-1.5 lg:px-2.5 lg:py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-200 rounded-xl transition shadow"
            title="規則說明"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={restartGame}
            className="p-1 sm:p-1.5 lg:px-2.5 lg:py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-200 rounded-xl transition shadow"
            title="重新開始"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Single Page Layout with Min-h-0 & Compact Height */}
      {!gameComplete && currentQ ? (
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between my-1 lg:my-2.5 bg-emerald-950/80 border border-emerald-700/50 rounded-2xl p-2 sm:p-3 lg:p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
          
          {/* Question Banner */}
          <div className="flex items-center justify-between gap-2 border-b border-emerald-800/80 pb-1 lg:pb-2.5 shrink-0">
            <div className="flex items-center gap-1.5 lg:gap-3">
              <span className="bg-emerald-800 text-amber-300 border border-emerald-600/50 text-[10px] sm:text-xs lg:text-sm xl:text-base font-black px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg whitespace-nowrap">
                {currentQ.meldTypeLabel}
              </span>
              <h2 className="text-xs sm:text-sm lg:text-lg xl:text-xl font-bold text-white leading-tight">
                {currentQ.prompt}
              </h2>
            </div>
          </div>

          {/* Hand Tiles Display */}
          <div className="my-auto py-1 lg:py-4 xl:py-6 flex flex-col items-center justify-center bg-emerald-900/40 rounded-xl lg:rounded-2xl border border-emerald-800/70 shadow-inner shrink-0">
            <span className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-emerald-300 font-bold mb-0.5 lg:mb-2 flex items-center gap-1">
              <span>🀄 當前牌面</span>
            </span>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 lg:gap-5 xl:gap-6">
              {currentQ.hand.map((tile, idx) => (
                <MahjongTile key={tile.id || idx} tile={tile} size="sm" disabled />
              ))}

              {/* Missing Slot: Displays Question Placeholder or Placed Answer Tile with Stamp */}
              {!isAnswered || !selectedOption ? (
                <div className="w-11 h-16 sm:w-13 sm:h-19 lg:w-20 lg:h-28 xl:w-24 xl:h-34 shrink-0 rounded-md border-x border-t border-dashed border-amber-400 bg-amber-500/15 border-b-[4px] lg:border-b-[6px] border-b-amber-600 flex flex-col items-center justify-center text-amber-300 font-bold p-1 lg:p-2 shadow-inner animate-pulse select-none">
                  <span className="text-sm sm:text-base lg:text-2xl xl:text-3xl leading-none">❓</span>
                  <span className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm text-center font-black text-amber-200 leading-none mt-1 lg:mt-2">缺此張</span>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.35, y: 25, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="relative shrink-0 flex flex-col items-center"
                >
                  <MahjongTile
                    tile={selectedOption}
                    size="sm"
                    disabled
                    status={isCorrect ? 'correct' : 'wrong'}
                  />
                  <span className={`text-[8px] sm:text-[9px] lg:text-xs xl:text-sm font-black px-1.5 py-0.2 lg:px-2.5 lg:py-0.5 rounded-full mt-0.5 lg:mt-1 leading-none shadow-sm ${
                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {isCorrect ? '⭕ 正確' : '❌ 錯誤'}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Option Tiles (Hand Selection) */}
          <div className="shrink-0 flex flex-col items-center my-0.5 lg:my-2">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3 lg:gap-6 xl:gap-8 w-full max-w-lg lg:max-w-3xl xl:max-w-4xl justify-items-center">
              {currentQ.options.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                const isOptCorrect = opt.id === currentQ.correctAnswerId;
                
                let optStatus: 'correct' | 'wrong' | null = null;
                if (isAnswered) {
                  if (isSelected) {
                    optStatus = isOptCorrect ? 'correct' : 'wrong';
                  } else if (isOptCorrect) {
                    optStatus = 'correct';
                  }
                }

                return (
                  <div key={opt.id} className="flex flex-col items-center">
                    <MahjongTile
                      tile={opt}
                      size="md"
                      selected={isSelected}
                      highlight={isAnswered && isOptCorrect}
                      status={optStatus}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                    />
                    {isAnswered && (
                      <span className={`text-[8px] sm:text-[10px] lg:text-xs xl:text-sm font-black mt-1 lg:mt-2 leading-none text-center ${
                        isSelected && isOptCorrect ? 'text-emerald-400' :
                        isSelected && !isOptCorrect ? 'text-rose-400' :
                        isOptCorrect ? 'text-emerald-300' : 'text-transparent'
                      }`}>
                        {isSelected && isOptCorrect ? '⭕ 選擇正確' :
                         isSelected && !isOptCorrect ? '❌ 選擇錯誤' :
                         isOptCorrect ? '⭕ 正確解答' : '•'}
                      </span>
                    )}
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
            className="p-2.5 bg-amber-500 text-gray-950 rounded-2xl shadow-xl"
          >
            <Award className="w-10 h-10 sm:w-14 sm:h-14" />
          </motion.div>

          <h2 className="text-lg sm:text-2xl font-black text-amber-300">
            🀄 麻將湊牌大師通關！
          </h2>

          {teamMode === 'TEAM' ? (
            <div className="bg-emerald-900/60 border border-amber-500/50 rounded-2xl p-3 max-w-sm w-full">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-500/20 border border-amber-400 p-2 rounded-xl">
                  <p className="text-xs text-amber-300 font-bold">A 組得分</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{teamAScore} 分</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-400 p-2 rounded-xl">
                  <p className="text-xs text-blue-300 font-bold">B 組得分</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{teamBScore} 分</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-900/60 border border-emerald-700/50 rounded-2xl p-3 max-w-sm w-full">
              <p className="text-emerald-300 text-xs font-bold">總積分</p>
              <p className="text-2xl sm:text-4xl font-black text-amber-300">{score} 分</p>
              <p className="text-[11px] sm:text-xs text-emerald-200 mt-1">牌感敏銳，胡牌聽牌推演迅速！</p>
            </div>
          )}

          <div className="flex gap-2.5 justify-center mt-1">
            <button
              onClick={restartGame}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-1"
            >
              <RotateCcw size={15} />
              再玩一局
            </button>
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-bold rounded-xl text-xs sm:text-sm shadow transition"
            >
              回遊戲選單
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MahjongMeldsGame;
