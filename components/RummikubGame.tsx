import React, { type ReactNode } from 'react';
import RummikubFacilitatedGame from './RummikubFacilitatedGame';
import type { RummiPuzzle, RummiTile } from '../utils/rummikubRules';
import { Difficulty } from '../types';
import { motion } from 'motion/react';
import { RotateCcw, HelpCircle, Users } from 'lucide-react';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

interface RummikubGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
  initialQuestions?: RummikubQuestion[];
}

interface RummikubRoundLayoutProps {
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

export const RummikubRoundLayout: React.FC<RummikubRoundLayoutProps> = ({
  difficulty,
  currentIndex,
  totalQuestions,
  score,
  elapsedTime,
  board,
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
    title="拉密魔術數字磚"
    subtitle="找出能合法接牌或組成牌組的選項"
    onBack={onBack}
    className="bg-gradient-to-br from-orange-950 via-amber-950 to-stone-950"
    status={(
      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-gray-950">{difficulty === 'ADVANCED' ? '進階拆牌' : '經典拉密'}</span>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900 sm:px-3 sm:text-sm">第 {currentIndex + 1}/{totalQuestions} 題</span>
        {teamMode === 'TEAM' ? (
          <span className="rounded-full bg-amber-900 px-2 py-1 text-xs font-bold text-white">{currentTeam} 組 · A {teamAScore} / B {teamBScore}</span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900 sm:px-3 sm:text-sm">{score} 分</span>
        )}
      </div>
    )}
    actions={(
      <>
        <span className="hidden rounded-xl bg-amber-900 px-2 py-1 text-xs font-bold text-amber-200 sm:inline">{elapsedTime.toFixed(1)}s</span>
        <button type="button" onClick={onToggleTeam} aria-label="切換單人或分組模式" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-amber-900 text-amber-200"><Users aria-hidden="true" className="h-5 w-5" /></button>
        <button type="button" onClick={onShowRules} aria-label="遊戲規則" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-amber-900 text-amber-200"><HelpCircle aria-hidden="true" className="h-5 w-5" /></button>
        <button type="button" onClick={onRestart} aria-label="重新開始" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-amber-900 text-amber-200"><RotateCcw aria-hidden="true" className="h-5 w-5" /></button>
      </>
    )}
  >
    <GridFocusLayout
      playfieldLabel="拉密牌桌面"
      supportLabel="拉密題目與手牌"
      className="bg-gradient-to-br from-orange-950 via-amber-950 to-stone-950"
      playfieldClassName="overflow-hidden rounded-xl border border-amber-700/60 bg-amber-950/70 p-2 text-white"
      supportClassName="overflow-hidden rounded-xl border border-amber-700/60 bg-amber-950/70 p-2 text-white"
      feedbackClassName="rounded-xl border-amber-700/60 bg-amber-950/95 px-2 text-white"
      playfield={board}
      support={support}
      feedback={feedback}
    />
  </GameShell>
);

export type RummikubColor = 'blue' | 'red' | 'yellow' | 'black' | 'green';

export interface RummikubTileData {
  id?: string;
  number?: number; // 1-13, or 0 for Joker
  color?: RummikubColor;
  isJoker?: boolean;
  isSlot?: boolean;
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
    sm: 'w-7 h-10 sm:w-9 sm:h-12 lg:w-13 lg:h-18 xl:w-15 xl:h-21 text-xs sm:text-base lg:text-lg xl:text-xl',
    md: 'w-9 h-12 sm:w-11 sm:h-15 lg:w-16 lg:h-22 xl:w-19 xl:h-26 text-base sm:text-xl lg:text-2xl xl:text-3xl',
    lg: 'w-11 h-14 sm:w-13 sm:h-18 lg:w-20 lg:h-28 xl:w-23 xl:h-32 text-lg sm:text-2xl lg:text-3xl xl:text-4xl'
  };

  const colorStyles: Record<string, { text: string; dot: string; border: string; name: string }> = {
    blue: { text: 'text-blue-600', dot: 'bg-blue-600', border: 'border-blue-300', name: '藍' },
    red: { text: 'text-red-600', dot: 'bg-red-600', border: 'border-red-300', name: '紅' },
    yellow: { text: 'text-amber-500', dot: 'bg-amber-500', border: 'border-amber-300', name: '黃' },
    black: { text: 'text-slate-900', dot: 'bg-slate-900', border: 'border-slate-400', name: '黑' },
    green: { text: 'text-emerald-600', dot: 'bg-emerald-600', border: 'border-emerald-300', name: '綠' }
  };

  const currentStyle = colorStyles[tile.color || 'black'] || colorStyles.black;

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={`${onClick && !disabled ? '選擇' : '拉密牌'}${tile.isJoker ? '百搭笑臉' : `${currentStyle.name}色${tile.number}`}`}
      aria-pressed={onClick ? selected : undefined}
      className={`relative ${sizeClasses[size]} rounded-xl lg:rounded-2xl bg-gradient-to-b from-amber-50 to-orange-100/90 border-2 lg:border-[3px] shadow-md flex flex-col items-center justify-between p-0.5 lg:p-1 transition-all select-none shrink-0
        ${selected ? 'ring-3 lg:ring-4 ring-orange-500 border-orange-500 -translate-y-1 shadow-lg bg-orange-100' : `${currentStyle.border} hover:border-orange-400`}
        ${highlight ? 'ring-3 lg:ring-4 ring-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/30' : ''}
        ${disabled ? 'opacity-90 cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="w-full flex items-center justify-between px-0.5 lg:px-1 leading-none">
        <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${currentStyle.dot}`} />
        <span className="text-[8px] sm:text-[9px] lg:text-[11px] font-black text-gray-500">{currentStyle.name}</span>
      </div>

      <div className={`font-black font-sans leading-none flex items-center justify-center my-auto ${currentStyle.text}`}>
        {tile.isJoker ? (
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg lg:text-2xl">😊</span>
            <span className="text-[6px] sm:text-[7px] lg:text-[9px] font-black tracking-widest text-orange-600">百搭</span>
          </div>
        ) : (
          <span>{tile.number}</span>
        )}
      </div>

      <div className="w-full flex items-center justify-center pb-0.5">
        <div className={`w-3.5 lg:w-6 h-0.5 lg:h-1 rounded-full ${currentStyle.dot} opacity-60`} />
      </div>
    </motion.button>
  );
};

interface RummikubQuestion {
  id: number;
  type: 'run' | 'group' | 'split_combine';
  title: string;
  prompt: string;
  tableSets: RummikubTileData[][];
  options: RummikubTileData[];
  correctOptionId: string;
  explanation: string;
  badge: string;
  hidePlaceholder?: boolean;
}

const calculateTimeScore = (seconds: number): { score: number; label: string; icon: string } => {
  if (seconds <= 2.5) return { score: 100, label: '極速磚聖', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '眼明心快', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉穩邏輯', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '深思熟慮', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

export const resolveRummikubAnswer = ({
  optionId,
  correctOptionId,
  elapsedSeconds,
}: {
  optionId?: string;
  correctOptionId: string;
  elapsedSeconds: number;
}) => {
  const isCorrect = optionId === correctOptionId;
  return {
    isAnswered: true,
    isCorrect,
    earnedScore: isCorrect ? calculateTimeScore(elapsedSeconds).score : 0,
  };
};

// Legacy fixture adapter only; the active curated bank lives in rummikubPuzzles.ts.
export const RummikubGame: React.FC<RummikubGameProps> = ({onBack,difficulty='NORMAL',isAdvanced=false,initialQuestions}:RummikubGameProps) => {
 const puzzles:RummiPuzzle[]|undefined=initialQuestions?.length?initialQuestions.map(q=>{
  const convert=(t:RummikubTileData,i:number):RummiTile=>({id:t.id??`tile-${i}`,color:(t.color==='green'?'black':t.color??'black'),number:t.number??0});
  const table=q.tableSets.map((group,g)=>group.filter(t=>!t.isSlot).map((t,i)=>convert(t,g*100+i)));
  const hand=q.options.map((t,i)=>convert(t,1000+i));
  return{id:`legacy-rummi-${q.id}`,tier:'BEGINNER' as const,title:q.title,focus:q.prompt,table,hand,plans:hand.map((t,i)=>({id:`plan-${i+1}`,label:`方案 ${i+1}`,groups:table.map((group,g)=>[...group.map(t=>t.id),...(g===0?[t.id]:[])])}))};
 }):undefined;
 return <RummikubFacilitatedGame onBack={onBack} difficulty={difficulty} isAdvanced={isAdvanced} puzzles={puzzles}/>;
};
export default RummikubGame;
