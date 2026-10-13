import MahjongFacilitatedGame from './MahjongFacilitatedGame';
import { mahjongCompletions, meldTileKey, type MahjongPuzzle, type MahjongGroup } from '../utils/mahjongRules';
import React, { type ReactNode } from 'react';
import { Difficulty } from '../types';
import { motion } from 'motion/react';
import { RotateCcw, HelpCircle, Users } from 'lucide-react';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

interface MahjongMeldsGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
  initialQuestions?: MahjongQuestion[];
}

interface MahjongRoundLayoutProps {
  difficulty: Difficulty;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  elapsedTime: number;
  playfield: ReactNode;
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

export const MahjongRoundLayout: React.FC<MahjongRoundLayoutProps> = ({
  difficulty,
  currentIndex,
  totalQuestions,
  score,
  elapsedTime,
  playfield,
  support,
  feedback,
  teamMode = 'SOLO',
  teamAScore = 0,
  teamBScore = 0,
  currentTeam = 'A',
  onBack,
  onToggleTeam,
  onShowRules,
  onRestart,
}) => (
  <GameShell
    title="麻將湊牌大師"
    subtitle="找出能完成牌組的正確牌"
    onBack={onBack}
    className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950"
    status={(
      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-gray-950">{difficulty === 'ADVANCED' ? '進階聽牌' : '經典麻將'}</span>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-900 sm:px-3 sm:text-sm">第 {currentIndex + 1}/{totalQuestions} 題</span>
        {teamMode === 'TEAM' ? (
          <span className="rounded-full bg-emerald-900 px-2 py-1 text-xs font-bold text-white">{currentTeam} 組 · A {teamAScore} / B {teamBScore}</span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-900 sm:px-3 sm:text-sm">{score} 分</span>
        )}
      </div>
    )}
    actions={(
      <>
        <span className="hidden rounded-xl bg-emerald-900 px-2 py-1 text-xs font-bold text-amber-200 sm:inline">{elapsedTime.toFixed(1)}s</span>
        <button type="button" onClick={onToggleTeam} aria-label="切換單人或分組模式" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-900 text-emerald-200"><Users aria-hidden="true" className="h-5 w-5" /></button>
        <button type="button" onClick={onShowRules} aria-label="遊戲規則" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-900 text-emerald-200"><HelpCircle aria-hidden="true" className="h-5 w-5" /></button>
        <button type="button" onClick={onRestart} aria-label="重新開始" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-900 text-emerald-200"><RotateCcw aria-hidden="true" className="h-5 w-5" /></button>
      </>
    )}
  >
    <GridFocusLayout
      playfieldLabel="麻將牌桌面"
      supportLabel="麻將題目資訊"
      className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950"
      playfieldClassName="overflow-hidden rounded-xl border border-emerald-700/60 bg-emerald-950/70 p-2 text-white"
      supportClassName="overflow-hidden rounded-xl border border-emerald-700/60 bg-emerald-950/70 p-2 text-white"
      feedbackClassName="rounded-xl border-emerald-700/60 bg-emerald-950/95 px-2 text-white"
      playfield={playfield}
      support={support}
      feedback={feedback}
    />
  </GameShell>
);

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
      aria-label={disabled && !onClick ? `麻將牌${tile.name}` : `選擇${tile.name}`}
      aria-pressed={onClick ? selected : undefined}
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

export const calculateTimeScore = (seconds: number): { score: number; label: string; icon: string } => {
  if (seconds <= 2.5) return { score: 100, label: '雀聖神速', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '眼明手快', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉穩聽牌', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '深思熟慮', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

export const resolveMahjongAnswer = ({
  optionId,
  correctAnswerId,
  elapsedSeconds,
}: {
  optionId: string;
  correctAnswerId: string;
  elapsedSeconds: number;
}) => {
  const isCorrect = optionId === correctAnswerId;
  return {
    isAnswered: true,
    isCorrect,
    earnedScore: isCorrect ? calculateTimeScore(elapsedSeconds).score : 0,
  };
};

// Legacy tile/layout and score helpers remain exported for existing consumers.
// The active activity uses explicit, untimed facilitator rounds and rule-derived answers.
export const MahjongMeldsGame: React.FC<MahjongMeldsGameProps> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false, initialQuestions }: MahjongMeldsGameProps) => {
  const puzzles: MahjongPuzzle[] | undefined = initialQuestions?.length ? initialQuestions.map(q => {
    const group: MahjongGroup = q.type === 'pair' ? 'PAIR' : q.type === 'meld_triplet' ? 'TRIPLET' : 'RUN';
    const hand = q.hand.map(({suit,value}) => ({suit,value}));
    const offered = [...q.options.map(({suit,value}) => ({suit,value})), ...mahjongCompletions(hand,group)];
    const options = [...new Map(offered.map(tile => [meldTileKey(tile),tile])).values()];
    return { id: `custom-${q.id}`, tier: isAdvanced || difficulty === 'ADVANCED' ? 'STANDARD' : 'BEGINNER', title:q.title, focus:q.prompt, group, hand, options };
  }) : undefined;
  return <MahjongFacilitatedGame onBack={onBack} difficulty={difficulty} isAdvanced={isAdvanced} puzzles={puzzles} />;
};
export default MahjongMeldsGame;
