import React, { type ReactNode } from 'react';
import ChineseTenFacilitatedGame from './ChineseTenFacilitatedGame';
import type { TenPuzzle } from '../utils/chineseTenRules';
import { Difficulty } from '../types';
import { motion } from 'motion/react';
import { RotateCcw, HelpCircle, Users } from 'lucide-react';
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

export const ChineseTenGame:React.FC<ChineseTenGameProps>=({onBack,difficulty='NORMAL',isAdvanced=false,initialQuestions}:ChineseTenGameProps)=>{
 const puzzles:TenPuzzle[]|undefined=initialQuestions?.length?initialQuestions.map(q=>({id:`legacy-ten-${q.id}`,tier:'BEGINNER',title:q.title,focus:q.prompt,table:q.tableCards,hand:q.options,captures:1})):undefined;
 return <ChineseTenFacilitatedGame onBack={onBack} difficulty={difficulty} isAdvanced={isAdvanced} puzzles={puzzles}/>;
};
export default ChineseTenGame;
