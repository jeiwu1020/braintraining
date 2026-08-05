import React, { useState, useEffect, useRef } from 'react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, HelpCircle, CheckCircle2, XCircle, Award, Users, Sparkles, Clock, Zap } from 'lucide-react';
import { RulesModal } from './RulesModal';
import { soundService } from '../services/soundService';

interface RummikubGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
}

export type RummikubColor = 'blue' | 'red' | 'yellow' | 'black';

export interface RummikubTileData {
  id: string;
  number: number; // 1-13, or 0 for Joker
  color: RummikubColor;
  isJoker?: boolean;
}

export const RummikubTile: React.FC<{
  tile: RummikubTileData;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ tile, size = 'md', selected = false, highlight = false, onClick, disabled = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-11 text-sm',
    md: 'w-10 h-13 sm:w-12 sm:h-16 text-lg sm:text-2xl',
    lg: 'w-12 h-15 sm:w-14 sm:h-19 text-xl sm:text-2xl'
  };

  const colorStyles: Record<RummikubColor, { text: string; dot: string; border: string; name: string }> = {
    blue: { text: 'text-blue-600', dot: 'bg-blue-600', border: 'border-blue-300', name: '藍' },
    red: { text: 'text-red-600', dot: 'bg-red-600', border: 'border-red-300', name: '紅' },
    yellow: { text: 'text-amber-500', dot: 'bg-amber-500', border: 'border-amber-300', name: '黃' },
    black: { text: 'text-slate-900', dot: 'bg-slate-900', border: 'border-slate-400', name: '黑' }
  };

  const currentStyle = colorStyles[tile.color];

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`relative ${sizeClasses[size]} rounded-xl bg-gradient-to-b from-amber-50 to-orange-100/90 border-2 shadow-md flex flex-col items-center justify-between p-0.5 transition-all select-none
        ${selected ? 'ring-3 ring-orange-500 border-orange-500 -translate-y-1 shadow-lg bg-orange-100' : `${currentStyle.border} hover:border-orange-400`}
        ${highlight ? 'ring-3 ring-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/30' : ''}
        ${disabled ? 'opacity-90 cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="w-full flex items-center justify-between px-0.5 leading-none">
        <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`} />
        <span className="text-[8px] sm:text-[9px] font-black text-gray-500">{currentStyle.name}</span>
      </div>

      <div className={`font-black font-sans leading-none flex items-center justify-center my-auto ${currentStyle.text}`}>
        {tile.isJoker ? (
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-xl">😊</span>
            <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-orange-600">百搭</span>
          </div>
        ) : (
          <span>{tile.number}</span>
        )}
      </div>

      <div className="w-full flex items-center justify-center pb-0.5">
        <div className={`w-4 h-0.5 rounded-full ${currentStyle.dot} opacity-60`} />
      </div>
    </motion.button>
  );
};

interface RummikubQuestion {
  id: number;
  type: 'run' | 'group' | 'joker' | 'split_combine';
  title: string;
  prompt: string;
  tableSets: RummikubTileData[][];
  options: RummikubTileData[];
  correctOptionId: string;
  explanation: string;
  badge: string;
}

const generateRummikubQuestions = (isAdv: boolean): RummikubQuestion[] => {
  const pool: RummikubQuestion[] = [
    // 1. 同色順組接牌 (紅4-紅5-紅6 接 紅7)
    {
      id: 1,
      type: 'run',
      title: '同色順組接牌',
      prompt: '桌上有【紅4】【紅5】【紅6】，手牌哪一張可以接在後面湊成連續順組？',
      tableSets: [
        [
          { id: 't1', number: 4, color: 'red' },
          { id: 't2', number: 5, color: 'red' },
          { id: 't3', number: 6, color: 'red' }
        ]
      ],
      options: [
        { id: 'opt_1', number: 7, color: 'red' },
        { id: 'opt_2', number: 7, color: 'blue' },
        { id: 'opt_3', number: 8, color: 'red' },
        { id: 'opt_4', number: 5, color: 'black' }
      ],
      correctOptionId: 'opt_1',
      explanation: '【紅7】接在【紅4-紅5-紅6】後面，形成同色連續順組！',
      badge: '同色順組'
    },
    // 2. 同數不同色群組 (藍8-黑8-黃8 接 紅8)
    {
      id: 2,
      type: 'group',
      title: '同數異色群組',
      prompt: '桌上有【藍8】【黑8】【黃8】，手牌出哪一張能加入湊成四色8？',
      tableSets: [
        [
          { id: 't4', number: 8, color: 'blue' },
          { id: 't5', number: 8, color: 'black' },
          { id: 't6', number: 8, color: 'yellow' }
        ]
      ],
      options: [
        { id: 'opt_5', number: 8, color: 'red' },
        { id: 'opt_6', number: 8, color: 'blue' },
        { id: 'opt_7', number: 9, color: 'red' },
        { id: 'opt_8', number: 7, color: 'black' }
      ],
      correctOptionId: 'opt_5',
      explanation: '【紅8】補齊第四種顏色，形成無重複顏色的「四色8群組」！',
      badge: '同數異色'
    },
    // 3. 百搭牌替代 (黑9-百搭-黑11 接 黑10)
    {
      id: 3,
      type: 'joker',
      title: '替換百搭牌笑臉',
      prompt: '桌上有【黑9】【百搭笑臉】【黑11】。手牌哪一張可以拿去把百搭牌換出來？',
      tableSets: [
        [
          { id: 't7', number: 9, color: 'black' },
          { id: 't8', number: 0, color: 'yellow', isJoker: true },
          { id: 't9', number: 11, color: 'black' }
        ]
      ],
      options: [
        { id: 'opt_9', number: 10, color: 'black' },
        { id: 'opt_10', number: 10, color: 'red' },
        { id: 'opt_11', number: 12, color: 'black' },
        { id: 'opt_12', number: 8, color: 'black' }
      ],
      correctOptionId: 'opt_9',
      explanation: '打出【黑10】放入黑9與黑11中間，成功救出萬能百搭笑臉！',
      badge: '百搭替換'
    },
    // 4. 藍色連續順組起頭 (接 藍1)
    {
      id: 4,
      type: 'run',
      title: '順組起頭接牌',
      prompt: '桌上有【藍2】【藍3】【藍4】，手牌哪一張可以接在最前面？',
      tableSets: [
        [
          { id: 't10', number: 2, color: 'blue' },
          { id: 't11', number: 3, color: 'blue' },
          { id: 't12', number: 4, color: 'blue' }
        ]
      ],
      options: [
        { id: 'opt_13', number: 1, color: 'blue' },
        { id: 'opt_14', number: 1, color: 'red' },
        { id: 'opt_15', number: 5, color: 'black' },
        { id: 'opt_16', number: 0, color: 'yellow', isJoker: false }
      ],
      correctOptionId: 'opt_13',
      explanation: '【藍1】接在【藍2-藍3-藍4】最前方，組成藍1-藍2-藍3-藍4！',
      badge: '順組起頭'
    },
    // 5. 黃色同數群組 (黃12-紅12-黑12 接 藍12)
    {
      id: 5,
      type: 'group',
      title: '高分大牌群組 (12)',
      prompt: '桌上有【黃12】【紅12】【黑12】。手牌哪一張可以加入湊成四色大滿貫？',
      tableSets: [
        [
          { id: 't13', number: 12, color: 'yellow' },
          { id: 't14', number: 12, color: 'red' },
          { id: 't15', number: 12, color: 'black' }
        ]
      ],
      options: [
        { id: 'opt_17', number: 12, color: 'blue' },
        { id: 'opt_18', number: 12, color: 'yellow' },
        { id: 'opt_19', number: 13, color: 'blue' },
        { id: 'opt_20', number: 11, color: 'red' }
      ],
      correctOptionId: 'opt_17',
      explanation: '【藍12】補齊最後一色，四色 12 大牌群組完全成型！',
      badge: '同數異色'
    }
  ];

  if (isAdv) {
    pool.push(
      // 進階 1: 拆分順組重組 (把 5 連順拆開)
      {
        id: 6,
        type: 'split_combine',
        title: '進階 拆分長順組接牌',
        prompt: '桌上有【紅3-紅4-紅5-紅6-紅7】(5張連順)。若想拆成兩組合法順組(每組至少3張)，手牌需要補上哪一張？',
        tableSets: [
          [
            { id: 't16', number: 3, color: 'red' },
            { id: 't17', number: 4, color: 'red' },
            { id: 't18', number: 5, color: 'red' },
            { id: 't19', number: 6, color: 'red' },
            { id: 't20', number: 7, color: 'red' }
          ]
        ],
        options: [
          { id: 'opt_21', number: 8, color: 'red' }, // gives 3-4-5 and 6-7-8
          { id: 'opt_22', number: 5, color: 'blue' },
          { id: 'opt_23', number: 9, color: 'red' },
          { id: 'opt_24', number: 2, color: 'black' }
        ],
        correctOptionId: 'opt_21',
        explanation: '補上【紅8】後，可拆成【紅3-紅4-紅5】與【紅6-紅7-紅8】兩組合法順組！',
        badge: '拆組重構'
      },
      // 進階 2: 多桌牌借牌組新隊 (借出藍7組成 7 群組)
      {
        id: 7,
        type: 'split_combine',
        title: '進階 桌面借牌重組',
        prompt: '桌上有【藍5-藍6-藍7-藍8】(4張順組)，手中已有【紅7】與【黑7】。打出哪張手牌即可借出桌上的藍7湊成「三色7」？',
        tableSets: [
          [
            { id: 't21', number: 5, color: 'blue' },
            { id: 't22', number: 6, color: 'blue' },
            { id: 't23', number: 7, color: 'blue' },
            { id: 't24', number: 8, color: 'blue' }
          ]
        ],
        options: [
          { id: 'opt_25', number: 7, color: 'yellow' },
          { id: 'opt_26', number: 9, color: 'blue' },
          { id: 'opt_27', number: 6, color: 'red' },
          { id: 'opt_28', number: 4, color: 'blue' }
        ],
        correctOptionId: 'opt_25',
        explanation: '出【黃7】，結合手中的紅7、黑7與借出的藍7，湊成四色7！原順組留【藍5-藍6-藍8】若補齊仍合法！',
        badge: '調牌戰略'
      },
      // 進階 3: 雙笑臉萬能牌分配
      {
        id: 8,
        type: 'joker',
        title: '進階 雙百搭笑臉定位',
        prompt: '桌上有【黑1】【百搭】【百搭】【黑4】。要將其中一個百搭釋放，手牌出哪一張最精準？',
        tableSets: [
          [
            { id: 't25', number: 1, color: 'black' },
            { id: 't26', number: 0, color: 'yellow', isJoker: true },
            { id: 't27', number: 0, color: 'red', isJoker: true },
            { id: 't28', number: 4, color: 'black' }
          ]
        ],
        options: [
          { id: 'opt_29', number: 2, color: 'black' },
          { id: 'opt_30', number: 2, color: 'red' },
          { id: 'opt_31', number: 5, color: 'black' },
          { id: 'opt_32', number: 3, color: 'blue' }
        ],
        correctOptionId: 'opt_29',
        explanation: '打入【黑2】取代第一個百搭，把萬能百搭笑臉拿回手牌中隨心所欲使用！',
        badge: '百搭破局'
      }
    );
  }

  return pool.sort(() => Math.random() - 0.5);
};

const calculateTimeScore = (seconds: number): { score: number; label: string; icon: string } => {
  if (seconds <= 2.5) return { score: 100, label: '極速磚聖', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '眼明心快', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉穩邏輯', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '深思熟慮', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

const RummikubGame: React.FC<RummikubGameProps> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false }) => {
  const isAdv = isAdvanced || difficulty === 'ADVANCED';

  const [questions, setQuestions] = useState<RummikubQuestion[]>([]);
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
    const list = generateRummikubQuestions(isAdv);
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

  const handleSelect = (opt: RummikubTileData) => {
    if (isAnswered || !currentQ) return;

    if (timerRef.current) clearInterval(timerRef.current);
    const finalSec = Number(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
    setElapsedTime(finalSec);

    soundService.playTilePlace();
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
    soundService.playTilePlace();
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
    '【拉密魔術數字磚 Rummikub】被譽為以色列麻將：',
    '同色順組 (Run)：相同顏色、數字連續至少 3 張 (例如：紅4-紅5-紅6)。',
    '同數群組 (Group)：相同數字、不同顏色 3 或 4 張 (例如：藍8-黑8-黃8)。',
    '百搭笑臉 (Joker)：可替代任何顏色與數字的牌，能自由組合！',
    '⚡ 速度評分機制：作答越快得分越高（最高100分）！'
  ];

  return (
    <div className="h-screen max-h-screen w-full bg-gradient-to-br from-orange-950 via-amber-950 to-stone-950 text-white flex flex-col p-1.5 sm:p-3 select-none overflow-hidden justify-between">
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="拉密魔術數字牌 規則說明" rules={rules} />

      {/* Top Compact Bar */}
      <div className="flex items-center justify-between gap-1.5 max-w-5xl mx-auto w-full shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-amber-800 hover:bg-amber-700 active:scale-95 text-amber-100 rounded-xl font-bold text-xs sm:text-sm transition shadow"
        >
          <ArrowLeft size={15} />
          <span>返回</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 bg-orange-500 text-gray-950 rounded-full text-[10px] sm:text-xs font-black">
            {isAdv ? '進階拆牌' : '經典拉密'}
          </span>
          <h1 className="text-xs sm:text-base font-black text-amber-300 tracking-wide truncate max-w-[130px] sm:max-w-none">
            拉密魔術數字磚
          </h1>
          {currentQ && (
            <span className="text-[11px] sm:text-xs text-amber-200 font-bold hidden sm:inline">
              ({currentIndex + 1}/{questions.length})
            </span>
          )}
        </div>

        {/* Live Timer & Score */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isAnswered && !gameComplete && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-900/90 border border-amber-600/70 rounded-xl text-amber-300 text-xs font-bold shadow-inner">
              <Clock size={13} className="text-amber-400 animate-spin" />
              <span>{elapsedTime.toFixed(1)}s</span>
            </div>
          )}

          {teamMode === 'TEAM' ? (
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 rounded-lg font-bold text-xs ${currentTeam === 'A' ? 'bg-amber-400 text-gray-950' : 'bg-amber-900 text-amber-300'}`}>
                A:{teamAScore}
              </span>
              <span className={`px-2 py-0.5 rounded-lg font-bold text-xs ${currentTeam === 'B' ? 'bg-blue-400 text-gray-950' : 'bg-amber-900 text-amber-300'}`}>
                B:{teamBScore}
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-0.5 bg-amber-900/90 border border-amber-700 rounded-xl text-amber-300 font-black text-xs sm:text-sm">
              {score}分
            </div>
          )}

          <button
            onClick={() => setTeamMode(m => (m === 'SOLO' ? 'TEAM' : 'SOLO'))}
            className={`p-1 sm:px-2 sm:py-1 rounded-xl font-bold text-xs transition shadow ${
              teamMode === 'TEAM' ? 'bg-amber-500 text-gray-950' : 'bg-amber-800 text-amber-200'
            }`}
            title="模式切換"
          >
            <Users size={15} />
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="p-1 sm:p-1.5 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-xl transition shadow"
            title="規則說明"
          >
            <HelpCircle size={15} />
          </button>

          <button
            onClick={restart}
            className="p-1 sm:p-1.5 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-xl transition shadow"
            title="重新開始"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Single Page Layout with Min-h-0 & Compact Height */}
      {!gameComplete && currentQ ? (
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-between my-1 bg-amber-950/80 border border-amber-700/50 rounded-2xl p-2 sm:p-3 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
          
          {/* Question Banner */}
          <div className="flex items-center justify-between gap-2 border-b border-amber-800/80 pb-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-800 text-amber-300 border border-amber-600/50 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg whitespace-nowrap">
                {currentQ.badge}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
                {currentQ.prompt}
              </h2>
            </div>
          </div>

          {/* Table Display */}
          <div className="my-auto py-1 flex flex-col items-center justify-center bg-amber-900/40 rounded-xl border border-amber-800/70 shadow-inner shrink-0">
            <span className="text-[10px] sm:text-xs text-amber-300 font-bold mb-0.5 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-400" />
              <span>當前桌面排組</span>
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              {currentQ.tableSets.map((set, setIdx) => (
                <div key={setIdx} className="flex items-center gap-1 sm:gap-1.5 bg-black/30 p-1 sm:p-1.5 rounded-xl border border-amber-700/50">
                  {set.map((tile, idx) => (
                    <RummikubTile key={tile.id || idx} tile={tile} size="sm" disabled />
                  ))}
                  {/* Slot placeholder */}
                  <div className="w-8 h-11 sm:w-10 sm:h-13 rounded-xl border-2 border-dashed border-amber-400 bg-amber-500/10 flex flex-col items-center justify-center text-amber-300 font-bold p-0.5 shadow-inner animate-pulse">
                    <span className="text-sm sm:text-base">❓</span>
                    <span className="text-[7px] sm:text-[8px] text-center font-bold text-amber-200">接哪張</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hand Cards Options */}
          <div className="shrink-0 flex flex-col items-center my-0.5">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full max-w-lg justify-items-center">
              {currentQ.options.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                const isOptCorrect = opt.id === currentQ.correctOptionId;
                let highlight = false;
                if (isAnswered && isOptCorrect) highlight = true;

                return (
                  <div key={opt.id} className="flex flex-col items-center">
                    <RummikubTile
                      tile={opt}
                      size="md"
                      selected={isSelected}
                      highlight={highlight}
                      disabled={isAnswered}
                      onClick={() => handleSelect(opt)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Feedback Banner & Next Button - Compact & NEVER Clipped */}
          <div className="shrink-0 min-h-[38px] flex items-center">
            <AnimatePresence mode="wait">
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`w-full p-1.5 sm:p-2 rounded-xl flex items-center justify-between gap-2 shadow border text-xs shrink-0 ${
                    isCorrect
                      ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100'
                      : 'bg-rose-950/95 border-rose-500 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div className="truncate flex items-center gap-1">
                      {isCorrect && lastSpeedInfo && (
                        <span className="bg-emerald-800 text-amber-300 px-1 py-0.2 rounded font-black text-[10px] whitespace-nowrap">
                          +{lastEarnedScore}分 {lastSpeedInfo.icon} {lastSpeedInfo.time}s
                        </span>
                      )}
                      <span className="font-bold truncate">{currentQ.explanation}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="shrink-0 px-3 py-1 sm:px-4 sm:py-1.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-lg text-xs sm:text-sm shadow active:scale-95 transition"
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
            className="p-2.5 bg-amber-500 text-gray-950 rounded-2xl shadow-xl"
          >
            <Award className="w-10 h-10 sm:w-14 sm:h-14" />
          </motion.div>

          <h2 className="text-lg sm:text-2xl font-black text-amber-300">
            🏆 拉密魔術大師通關！
          </h2>

          {teamMode === 'TEAM' ? (
            <div className="bg-amber-900/60 border border-amber-500/50 rounded-2xl p-3 max-w-sm w-full">
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
            <div className="bg-amber-900/60 border border-amber-700/50 rounded-2xl p-3 max-w-sm w-full">
              <p className="text-amber-300 text-xs font-bold">總積分</p>
              <p className="text-2xl sm:text-4xl font-black text-amber-300">{score} 分</p>
              <p className="text-[11px] sm:text-xs text-amber-200 mt-1">數字重構邏輯敏銳，拆牌排組靈活迅速！</p>
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
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-800 hover:bg-amber-700 text-amber-200 font-bold rounded-xl text-xs sm:text-sm shadow transition"
            >
              回遊戲選單
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RummikubGame;
