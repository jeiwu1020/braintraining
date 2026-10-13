import React, { type ReactNode } from 'react';
import SevensFacilitatedGame from './SevensFacilitatedGame';
import type { SevensPuzzle } from '../utils/sevensRules';
import { Difficulty } from '../types';
import { motion } from 'motion/react';
import { RotateCcw, HelpCircle, Users } from 'lucide-react';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

interface SevensGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
  initialQuestions?: SevensQuestion[];
}

interface SevensRoundLayoutProps {
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

export const SevensRoundLayout: React.FC<SevensRoundLayoutProps> = ({ difficulty, currentIndex, totalQuestions, score, elapsedTime, board, support, feedback, teamMode = 'SOLO', teamAScore = 0, teamBScore = 0, currentTeam = 'A', onBack, onToggleTeam, onShowRules, onRestart }) => (
  <GameShell title="歡樂排七接龍" subtitle="沿著七的上下順序延伸牌桌" onBack={onBack} className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950" status={(
    <div className="flex items-center gap-1.5"><span className="rounded-full bg-indigo-500 px-2 py-1 text-xs font-bold text-white">{difficulty === 'ADVANCED' ? '進階卡牌' : '經典排七'}</span><span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-900 sm:px-3 sm:text-sm">第 {currentIndex + 1}/{totalQuestions} 題</span>{teamMode === 'TEAM' ? <span className="rounded-full bg-indigo-900 px-2 py-1 text-xs font-bold text-white">{currentTeam} 組 · A {teamAScore} / B {teamBScore}</span> : <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-900 sm:px-3 sm:text-sm">{score} 分</span>}</div>
  )} actions={(
    <><span className="hidden rounded-xl bg-indigo-900 px-2 py-1 text-xs font-bold text-indigo-200 sm:inline">{elapsedTime.toFixed(1)}s</span><button type="button" onClick={onToggleTeam} aria-label="切換單人或分組模式" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-indigo-900 text-indigo-200"><Users aria-hidden="true" className="h-5 w-5" /></button><button type="button" onClick={onShowRules} aria-label="遊戲規則" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-indigo-900 text-indigo-200"><HelpCircle aria-hidden="true" className="h-5 w-5" /></button><button type="button" onClick={onRestart} aria-label="重新開始" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-indigo-900 text-indigo-200"><RotateCcw aria-hidden="true" className="h-5 w-5" /></button></>
  )}>
    <GridFocusLayout playfieldLabel="排七牌桌" supportLabel="排七回合與手牌" className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950" playfieldClassName="overflow-hidden rounded-xl border border-indigo-700/60 bg-indigo-950/70 p-2 text-white" supportClassName="overflow-hidden rounded-xl border border-indigo-700/60 bg-indigo-950/70 p-2 text-white" feedbackClassName="rounded-xl border-indigo-700/60 bg-indigo-950/95 px-2 text-white" playfield={board} support={support} feedback={feedback} />
  </GameShell>
);

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
      aria-label={`${onClick && !disabled ? '選擇' : '排七牌'}${card.name}`}
      aria-pressed={onClick ? selected : undefined}
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

const calculateTimeScore = (seconds: number): { score: number; label: string; icon: string } => {
  if (seconds <= 2.5) return { score: 100, label: '極速接龍', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '眼疾手快', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉穩審牌', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '佈局深遠', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

export const resolveSevensAnswer = ({ optionId, correctOptionId, elapsedSeconds }: { optionId?: string; correctOptionId: string; elapsedSeconds: number }) => {
  const isCorrect = optionId === correctOptionId;
  return { isAnswered: true, isCorrect, earnedScore: isCorrect ? calculateTimeScore(elapsedSeconds).score : 0 };
};

export const SevensGame:React.FC<SevensGameProps>=({onBack,difficulty='NORMAL',isAdvanced=false,initialQuestions}:SevensGameProps)=>{
 const puzzles:SevensPuzzle[]|undefined=initialQuestions?.length?initialQuestions.map(q=>({id:`legacy-sevens-${q.id}`,tier:'BEGINNER',title:q.title,focus:q.prompt,board:Object.fromEntries(q.boardCards.map(row=>[row.suit,{min:row.min,max:row.max}])),hand:q.options,targetMoves:1})):undefined;
 return <SevensFacilitatedGame onBack={onBack} difficulty={difficulty} isAdvanced={isAdvanced} puzzles={puzzles}/>;
};
export default SevensGame;
