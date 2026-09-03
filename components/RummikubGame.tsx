import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, HelpCircle, CheckCircle2, XCircle, Award, Users, Sparkles } from 'lucide-react';
import { RulesModal } from './RulesModal';
import { soundService } from '../services/soundService';
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

const generateRummikubQuestions = (isAdv: boolean): RummikubQuestion[] => {
  const pool: RummikubQuestion[] = [
    // 1. 同色順組接牌 (紅4-紅5-紅6 接 紅7)
    {
      id: 1,
      type: 'run',
      title: '同色順組接牌',
      prompt: '桌上有【紅4-紅5-紅6】，手牌哪一張可以接在後面湊成連續順組？',
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
      prompt: '桌上有【藍8-黑8-黃8】，手牌出哪一張能加入湊成四色8？',
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
    // 3. 藍色連續順組起頭 (接 藍1)
    {
      id: 3,
      type: 'run',
      title: '順組起頭接牌',
      prompt: '桌上有【藍2-藍3-藍4】，手牌哪一張可以接在最前面？',
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
        { id: 'opt_16', number: 3, color: 'yellow' }
      ],
      correctOptionId: 'opt_13',
      explanation: '【藍1】接在【藍2-藍3-藍4】最前方，組成藍1-藍2-藍3-藍4！',
      badge: '順組起頭'
    },
    // 4. 黃色順組中間填空
    {
      id: 4,
      type: 'run',
      title: '順組中間補缺',
      prompt: '桌上有【黃9】與【黃11】(缺中間)，手牌哪一張能補上填滿順組？',
      tableSets: [
        [
          { id: 't13a', number: 9, color: 'yellow' },
          { id: 't13b', number: 11, color: 'yellow' }
        ]
      ],
      options: [
        { id: 'opt_13c', number: 10, color: 'yellow' },
        { id: 'opt_13d', number: 10, color: 'red' },
        { id: 'opt_13e', number: 12, color: 'yellow' },
        { id: 'opt_13f', number: 8, color: 'blue' }
      ],
      correctOptionId: 'opt_13c',
      explanation: '【黃10】填入中間缺口，湊成【黃9-黃10-黃11】順組！',
      badge: '中間補缺'
    },
    // 5. 高分大牌群組 (12)
    {
      id: 5,
      type: 'group',
      title: '高分大牌群組 (12)',
      prompt: '桌上有【黃12-紅12-黑12】。手牌哪一張可以加入湊成四色大滿貫？',
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
    },
    // 6. 黑色順組後續接牌
    {
      id: 6,
      type: 'run',
      title: '高數值順組接牌',
      prompt: '桌上有【黑10-黑11-黑12】，手牌打出哪一張可以完成大滿貫延伸？',
      tableSets: [
        [
          { id: 't14a', number: 10, color: 'black' },
          { id: 't14b', number: 11, color: 'black' },
          { id: 't14c', number: 12, color: 'black' }
        ]
      ],
      options: [
        { id: 'opt_14a', number: 13, color: 'black' },
        { id: 'opt_14b', number: 13, color: 'red' },
        { id: 'opt_14c', number: 9, color: 'blue' },
        { id: 'opt_14d', number: 1, color: 'black' }
      ],
      correctOptionId: 'opt_14a',
      explanation: '【黑13】接在最後，達成高分數數值的黑10-黑11-黑12-黑13！',
      badge: '大數順組'
    },
    // 7. 紅色順組開頭填缺
    {
      id: 7,
      type: 'run',
      title: '小數值順組開頭',
      prompt: '桌上有【紅1】與【紅2】。手牌打出哪一張可以接在【紅2】後面？',
      tableSets: [
        [
          { id: 't15a', number: 1, color: 'red' },
          { id: 't15b', number: 2, color: 'red' }
        ]
      ],
      options: [
        { id: 'opt_15a', number: 3, color: 'red' },
        { id: 'opt_15b', number: 3, color: 'blue' },
        { id: 'opt_15c', number: 4, color: 'red' },
        { id: 'opt_15d', number: 1, color: 'yellow' }
      ],
      correctOptionId: 'opt_15a',
      explanation: '打出【紅3】，接在後方達成合法的【紅1-紅2-紅3】順組！',
      badge: '開局順組'
    },
    // 8. 綠色三色群組
    {
      id: 8,
      type: 'group',
      title: '三色數字5群組',
      prompt: '桌上有【紅5-藍5-綠5】。手牌打出哪一張可以湊齊四色5？',
      tableSets: [
        [
          { id: 't16a', number: 5, color: 'red' },
          { id: 't16b', number: 5, color: 'blue' },
          { id: 't16c', number: 5, color: 'green' }
        ]
      ],
      options: [
        { id: 'opt_16a', number: 5, color: 'yellow' },
        { id: 'opt_16b', number: 5, color: 'red' },
        { id: 'opt_16c', number: 6, color: 'green' },
        { id: 'opt_16d', number: 4, color: 'blue' }
      ],
      correctOptionId: 'opt_16a',
      explanation: '【黃5】補齊最後無重複的第四色，形成四色5群組！',
      badge: '四色群組'
    },
    // 9. 藍色順組後延伸
    {
      id: 9,
      type: 'run',
      title: '中位順組延伸',
      prompt: '桌上有【藍7-藍8-藍9】，手牌哪一張可以接在後面？',
      tableSets: [
        [
          { id: 't17a', number: 7, color: 'blue' },
          { id: 't17b', number: 8, color: 'blue' },
          { id: 't17c', number: 9, color: 'blue' }
        ]
      ],
      options: [
        { id: 'opt_17a', number: 10, color: 'blue' },
        { id: 'opt_17b', number: 10, color: 'red' },
        { id: 'opt_17c', number: 6, color: 'yellow' },
        { id: 'opt_17d', number: 11, color: 'blue' }
      ],
      correctOptionId: 'opt_17a',
      explanation: '【藍10】接在後面，形成【藍7-藍8-藍9-藍10】順組！',
      badge: '順組延伸'
    },
    // 10. 黃色高數值起頭
    {
      id: 10,
      type: 'run',
      title: '順組前補高數',
      prompt: '桌上有【黃11-黃12-黃13】，手牌哪一張可以接在最前面？',
      tableSets: [
        [
          { id: 't18a', number: 11, color: 'yellow' },
          { id: 't18b', number: 12, color: 'yellow' },
          { id: 't18c', number: 13, color: 'yellow' }
        ]
      ],
      options: [
        { id: 'opt_18a', number: 10, color: 'yellow' },
        { id: 'opt_18b', number: 10, color: 'black' },
        { id: 'opt_18c', number: 14, color: 'yellow' },
        { id: 'opt_18d', number: 9, color: 'red' }
      ],
      correctOptionId: 'opt_18a',
      explanation: '【黃10】接在前方，形成【黃10-黃11-黃12-黃13】！',
      badge: '前補順組'
    }
  ];

  if (isAdv) {
    pool.push(
      // 進階 1: 拆分長順組
      {
        id: 11,
        type: 'split_combine',
        title: '進階 拆分長順組',
        prompt: '桌上有【紅3-紅4-紅5-紅6-紅7】(5張連順)。若想將其拆成兩組合法順組(每組至少3張)，手牌需要補上哪一張？',
        hidePlaceholder: true,
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
          { id: 'opt_21', number: 8, color: 'red' },
          { id: 'opt_22', number: 5, color: 'blue' },
          { id: 'opt_23', number: 9, color: 'red' },
          { id: 'opt_24', number: 2, color: 'black' }
        ],
        correctOptionId: 'opt_21',
        explanation: '打出【紅8】，即可將原連順拆成【紅3-紅4-紅5】與【紅6-紅7-紅8】兩組合法順組！',
        badge: '拆組重構'
      },
      // 進階 2: 桌面借牌組隊
      {
        id: 12,
        type: 'split_combine',
        title: '進階 桌面借牌組隊',
        prompt: '桌上有【藍5-藍6-藍7-藍8】(4張順組)，手中持有【紅7】與【黑7】。打出哪一張手牌，可借用桌上的【藍7】重組出合法的同數群組？',
        hidePlaceholder: true,
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
        explanation: '打出【黃7】，結合手中的紅7、黑7與借出的藍7，湊成合法的四色7群組！',
        badge: '調牌戰略'
      },
      // 進階 3: 跨組借牌重構
      {
        id: 13,
        type: 'split_combine',
        title: '進階 順組頭牌借用',
        prompt: '桌上有【黃10-黃11-黃12-黃13】(4張順組)，手中持有【綠10】與【黑10】。打出哪一張手牌，可以借用桌上順組的頭牌組成合法的同數群組？',
        hidePlaceholder: true,
        tableSets: [
          [
            { id: 't25', number: 10, color: 'yellow' },
            { id: 't26', number: 11, color: 'yellow' },
            { id: 't27', number: 12, color: 'yellow' },
            { id: 't28', number: 13, color: 'yellow' }
          ]
        ],
        options: [
          { id: 'opt_29', number: 10, color: 'red' },
          { id: 'opt_30', number: 12, color: 'blue' },
          { id: 'opt_31', number: 9, color: 'yellow' },
          { id: 'opt_32', number: 11, color: 'black' }
        ],
        correctOptionId: 'opt_29',
        explanation: '打出【紅10】，配合手中的【綠10】、【黑10】與借出的【黃10】，即可組成四色10群組！',
        badge: '借頭組隊'
      },
      // 進階 4: 雙順組抽尾牌
      {
        id: 14,
        type: 'split_combine',
        title: '進階 雙順組抽尾牌',
        prompt: '桌上有兩組4張順組【黃9-黃10-黃11-黃12】與【黑9-黑10-黑11-黑12】。打出哪一張手牌，可以借用這兩組尾端同數值的牌重組成新的同數群組？',
        hidePlaceholder: true,
        tableSets: [
          [
            { id: 't29', number: 9, color: 'yellow' },
            { id: 't30', number: 10, color: 'yellow' },
            { id: 't31', number: 11, color: 'yellow' },
            { id: 't32', number: 12, color: 'yellow' }
          ],
          [
            { id: 't33', number: 9, color: 'black' },
            { id: 't34', number: 10, color: 'black' },
            { id: 't35', number: 11, color: 'black' },
            { id: 't36', number: 12, color: 'black' }
          ]
        ],
        options: [
          { id: 'opt_33', number: 12, color: 'red' },
          { id: 'opt_34', number: 12, color: 'black' },
          { id: 'opt_35', number: 8, color: 'yellow' },
          { id: 'opt_36', number: 13, color: 'red' }
        ],
        correctOptionId: 'opt_33',
        explanation: '打出【紅12】，借用兩組尾端的【黃12】與【黑12】，順利重組成合法的「三色12」！',
        badge: '抽尾組隊'
      },
      // 進階 5: 拆群組建順組
      {
        id: 15,
        type: 'split_combine',
        title: '進階 拆群組建順組',
        prompt: '桌上有【紅6-綠6-藍6】與【紅7-綠7-藍7】兩組同數牌。若想重組成同顏色的順組，打出哪一張手牌，可以借用這兩組中的【紅6】與【紅7】？',
        hidePlaceholder: true,
        tableSets: [
          [
            { id: 't37', number: 6, color: 'red' },
            { id: 't38', number: 6, color: 'green' },
            { id: 't39', number: 6, color: 'blue' }
          ],
          [
            { id: 't40', number: 7, color: 'red' },
            { id: 't41', number: 7, color: 'green' },
            { id: 't42', number: 7, color: 'blue' }
          ]
        ],
        options: [
          { id: 'opt_37', number: 5, color: 'red' },
          { id: 'opt_38', number: 6, color: 'yellow' },
          { id: 'opt_39', number: 8, color: 'blue' },
          { id: 'opt_40', number: 5, color: 'black' }
        ],
        correctOptionId: 'opt_37',
        explanation: '打出【紅5】，配合借出的【紅6】與【紅7】，即可重組成合法的「紅5-紅6-紅7」紅色順組！',
        badge: '拆群建順'
      },
      // 進階 6: 拆借尾牌組新順
      {
        id: 16,
        type: 'split_combine',
        title: '進階 拆借順組尾牌',
        prompt: '桌上有【藍1-藍2-藍3-藍4】(4張順組)，手中持有【藍6】與【藍7】。打出哪一張手牌，可以借用【藍4】組成【藍4-藍5-藍6-藍7】的新順組？',
        hidePlaceholder: true,
        tableSets: [
          [
            { id: 't43', number: 1, color: 'blue' },
            { id: 't44', number: 2, color: 'blue' },
            { id: 't45', number: 3, color: 'blue' },
            { id: 't46', number: 4, color: 'blue' }
          ]
        ],
        options: [
          { id: 'opt_41', number: 5, color: 'blue' },
          { id: 'opt_42', number: 8, color: 'blue' },
          { id: 'opt_43', number: 4, color: 'red' },
          { id: 'opt_44', number: 6, color: 'black' }
        ],
        correctOptionId: 'opt_41',
        explanation: '打出【藍5】，連結借出的【藍4】與手中的【藍6】、【藍7】，完成新順組！原組留下【藍1-藍2-藍3】依然合法！',
        badge: '尾牌借用'
      },
      // 進階 7: 借用群組牌組同色順
      {
        id: 17,
        type: 'split_combine',
        title: '進階 借用群組拆牌',
        prompt: '桌上有【紅9-藍9-黃9-黑9】(4色群組)，手中持有【紅10】與【紅11】。打出哪一張手牌，可借用桌上的【紅9】重組出合法的同色順組？',
        hidePlaceholder: true,
        tableSets: [
          [
            { id: 't47', number: 9, color: 'red' },
            { id: 't48', number: 9, color: 'blue' },
            { id: 't49', number: 9, color: 'yellow' },
            { id: 't50', number: 9, color: 'black' }
          ]
        ],
        options: [
          { id: 'opt_45', number: 8, color: 'red' },
          { id: 'opt_46', number: 10, color: 'blue' },
          { id: 'opt_47', number: 9, color: 'yellow' },
          { id: 'opt_48', number: 12, color: 'black' }
        ],
        correctOptionId: 'opt_45',
        explanation: '打出【紅8】，配合借出的【紅9】與手中的【紅10】、【紅11】，組成【紅8-紅9-紅10-紅11】！原群組留【藍9-黃9-黑9】依然合法！',
        badge: '群組借牌'
      },
      // 進階 8: 拆5連順補牌重構
      {
        id: 18,
        type: 'split_combine',
        title: '進階 長順組雙拆重構',
        prompt: '桌上有【黑2-黑3-黑4-黑5-黑6】(5張長順)。若打出【黑8】，手牌還需要補上哪一張，才能將原長順拆成兩組各3張的合法順組？',
        hidePlaceholder: true,
        tableSets: [
          [
            { id: 't51', number: 2, color: 'black' },
            { id: 't52', number: 3, color: 'black' },
            { id: 't53', number: 4, color: 'black' },
            { id: 't54', number: 5, color: 'black' },
            { id: 't55', number: 6, color: 'black' }
          ]
        ],
        options: [
          { id: 'opt_49', number: 7, color: 'black' },
          { id: 'opt_50', number: 9, color: 'black' },
          { id: 'opt_51', number: 5, color: 'red' },
          { id: 'opt_52', number: 6, color: 'blue' }
        ],
        correctOptionId: 'opt_49',
        explanation: '同時打出【黑7】與【黑8】，即可拆成【黑2-黑3-黑4】與【黑5-黑6-黑7-黑8】兩組合法順組！',
        badge: '雙順重構'
      },
      // 進階 9: 拆群組頭牌組長順
      {
        id: 19,
        type: 'split_combine',
        title: '進階 抽群組組長順',
        prompt: '桌上有【紅3-藍3-黃3-黑3】(4色群組)，手中持有【紅4】與【紅5】。打出哪一張手牌，可借用群組中的【紅3】組成【紅2-紅3-紅4-紅5】？',
        hidePlaceholder: true,
        tableSets: [
          [
            { id: 't56', number: 3, color: 'red' },
            { id: 't57', number: 3, color: 'blue' },
            { id: 't58', number: 3, color: 'yellow' },
            { id: 't59', number: 3, color: 'black' }
          ]
        ],
        options: [
          { id: 'opt_53', number: 2, color: 'red' },
          { id: 'opt_54', number: 4, color: 'blue' },
          { id: 'opt_55', number: 3, color: 'yellow' },
          { id: 'opt_56', number: 1, color: 'black' }
        ],
        correctOptionId: 'opt_53',
        explanation: '打出【紅2】，配合借出的【紅3】與手中的【紅4】、【紅5】，達成【紅2-紅3-紅4-紅5】！',
        badge: '長順組建'
      },
      // 進階 10: 雙群組各抽一牌建順組
      {
        id: 20,
        type: 'split_combine',
        title: '進階 雙群組各抽一牌',
        prompt: '桌上有【綠8-藍8-黃8】與【綠9-藍9-黃9】兩組3色群組。手中持有【綠10】，打出哪一張手牌可以借用【綠8】與【綠9】組成4張綠色順組？',
        hidePlaceholder: true,
        tableSets: [
          [
            { id: 't60', number: 8, color: 'green' },
            { id: 't61', number: 8, color: 'blue' },
            { id: 't62', number: 8, color: 'yellow' }
          ],
          [
            { id: 't63', number: 9, color: 'green' },
            { id: 't64', number: 9, color: 'blue' },
            { id: 't65', number: 9, color: 'yellow' }
          ]
        ],
        options: [
          { id: 'opt_57', number: 7, color: 'green' },
          { id: 'opt_58', number: 10, color: 'blue' },
          { id: 'opt_59', number: 7, color: 'yellow' },
          { id: 'opt_60', number: 8, color: 'black' }
        ],
        correctOptionId: 'opt_57',
        explanation: '打出【綠7】，配合借出的【綠8】、【綠9】與手中的【綠10】，成功重組出【綠7-綠8-綠9-綠10】！',
        badge: '雙群抽牌'
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

export const RummikubGame: React.FC<RummikubGameProps> = ({
  onBack,
  difficulty = 'NORMAL',
  isAdvanced = false,
  initialQuestions,
}) => {
  const isAdv = isAdvanced || difficulty === 'ADVANCED';

  const [questions, setQuestions] = useState<RummikubQuestion[]>(() => initialQuestions ?? []);
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
    const list = initialQuestions ?? generateRummikubQuestions(isAdv);
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

    const answerResult = resolveRummikubAnswer({
      optionId: opt.id,
      correctOptionId: currentQ.correctOptionId,
      elapsedSeconds: finalSec,
    });
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
    <>
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="拉密魔術數字牌 規則說明" rules={rules} />

      {!gameComplete && currentQ ? (
        <RummikubRoundLayout
          difficulty={isAdv ? 'ADVANCED' : 'NORMAL'}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          score={score}
          elapsedTime={elapsedTime}
          teamMode={teamMode}
          teamAScore={teamAScore}
          teamBScore={teamBScore}
          currentTeam={currentTeam}
          onBack={onBack}
          onToggleTeam={() => setTeamMode(mode => mode === 'SOLO' ? 'TEAM' : 'SOLO')}
          onShowRules={() => setShowRules(true)}
          onRestart={restart}
          board={(
            <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-amber-800/70 bg-amber-950/50 px-2 py-1.5 shadow-inner">
                <span className="mb-1.5 flex shrink-0 items-center gap-1 text-[10px] font-bold text-amber-300 sm:text-xs"><Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-amber-400" /><span>當前桌面排組</span></span>
                <div className="my-auto flex max-w-full flex-wrap items-center justify-center gap-2 p-1 sm:gap-3">{currentQ.tableSets.map((set, setIdx) => <div key={setIdx} className="flex items-center gap-1 rounded-xl border border-amber-700/50 bg-black/50 p-1 shadow sm:gap-1.5 sm:p-1.5">{set.map((tile, idx) => tile.isSlot ? <div key={`slot_${setIdx}_${idx}`} className="flex h-9 w-6 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-400 bg-amber-500/20 p-0.5 text-amber-300 shadow-inner animate-pulse sm:h-11 sm:w-8 md:h-12 md:w-9 lg:h-16 lg:w-12"><span className="text-[10px] sm:text-xs md:text-sm">❓</span><span className="text-center text-[5px] font-black leading-none text-amber-200 sm:text-[6px] md:text-[7px]">目標位</span></div> : <RummikubTile key={tile.id || idx} tile={tile} size="sm" disabled />)}</div>)}</div>
              </div>
              <div className="shrink-0 rounded-xl border border-amber-800/70 bg-black/40 p-2"><div className="mb-1 text-center text-xs font-bold tracking-wide text-amber-300">🎯 請點擊選擇手牌選項</div><div className="grid grid-cols-4 justify-items-center gap-2 sm:gap-3">{currentQ.options.map(opt => <RummikubTile key={opt.id} tile={opt} size="md" selected={selectedOptionId === opt.id} highlight={isAnswered && opt.id === currentQ.correctOptionId} disabled={isAnswered} onClick={() => handleSelect(opt)} />)}</div></div>
            </div>
          )}
          support={(
            <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto">
              <div className="rounded-xl border border-amber-800/70 bg-amber-900/40 p-3 shadow-inner"><div className="flex flex-wrap items-center gap-1.5"><span className="rounded-lg border border-amber-600/50 bg-amber-800 px-2 py-1 text-xs font-black text-amber-300 sm:text-sm">{currentQ.badge}</span><span className="text-xs font-bold text-amber-300">第 {currentIndex + 1}/{questions.length} 題</span></div><h2 className="mt-2 text-sm font-bold leading-snug text-white sm:text-base lg:text-lg">{currentQ.prompt}</h2></div>
              <div className="rounded-xl border border-amber-800/70 bg-amber-900/40 p-3 text-sm leading-relaxed text-amber-100">觀察同色連號、同數不同色與百搭牌，找出能完成牌組的選項。</div>
            </div>
          )}
          feedback={(
            <div className="flex min-h-[40px] shrink-0 flex-col justify-end pt-1">
              <AnimatePresence mode="wait">
                {isAnswered ? (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex w-full shrink-0 flex-col gap-1 rounded-xl border p-1.5 text-xs shadow sm:p-2 ${isCorrect ? 'border-emerald-500 bg-emerald-950/95 text-emerald-100' : 'border-rose-500 bg-rose-950/95 text-rose-100'}`}>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {isCorrect ? <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-400" /> : <XCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-400" />}
                        {isCorrect && lastSpeedInfo && <span className="whitespace-nowrap rounded bg-emerald-800 px-1 py-0.5 text-[9px] font-black text-amber-300">+{lastEarnedScore}分 {lastSpeedInfo.icon}</span>}
                      </div>
                      <button type="button" onClick={handleNext} className="min-h-11 shrink-0 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black text-gray-950 shadow transition hover:bg-amber-300 active:scale-95">{currentIndex + 1 < questions.length ? '下一題 ➔' : '查看結算 🏆'}</button>
                    </div>
                    <div className="line-clamp-2 text-[10px] font-bold leading-tight opacity-90 sm:text-[11px]">{currentQ.explanation}</div>
                  </motion.div>
                ) : <div className="py-0.5 text-center text-[10px] font-bold text-amber-800 sm:text-xs">點擊作答選項完成題目</div>}
              </AnimatePresence>
            </div>
          )}
        />
      ) : (
        <GameShell title="拉密魔術數字磚" subtitle="本局挑戰完成" onBack={onBack} className="h-screen bg-gradient-to-br from-orange-950 via-amber-950 to-stone-950 text-white">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-2.5 p-3 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-2xl bg-amber-500 p-2.5 text-gray-950 shadow-xl"><Award className="h-10 w-10 sm:h-14 sm:w-14" /></motion.div>
            <h2 className="text-lg font-black text-amber-300 sm:text-2xl">🏆 拉密魔術大師通關！</h2>
            {teamMode === 'TEAM' ? (
              <div className="w-full max-w-sm rounded-2xl border border-amber-500/50 bg-amber-900/60 p-3"><div className="grid grid-cols-2 gap-2 text-center"><div className="rounded-xl border border-amber-400 bg-amber-500/20 p-2"><p className="text-xs font-bold text-amber-300">A 組得分</p><p className="text-xl font-black text-white sm:text-2xl">{teamAScore} 分</p></div><div className="rounded-xl border border-blue-400 bg-blue-500/20 p-2"><p className="text-xs font-bold text-blue-300">B 組得分</p><p className="text-xl font-black text-white sm:text-2xl">{teamBScore} 分</p></div></div></div>
            ) : <div className="w-full max-w-sm rounded-2xl border border-amber-700/50 bg-amber-900/60 p-3"><p className="text-xs font-bold text-amber-300">總積分</p><p className="text-2xl font-black text-amber-300 sm:text-4xl">{score} 分</p><p className="mt-1 text-[11px] text-amber-200 sm:text-xs">數字重構邏輯敏銳，拆牌排組靈活迅速！</p></div>}
            <div className="mt-1 flex justify-center gap-2.5"><button type="button" onClick={restart} className="flex min-h-11 items-center gap-1 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-gray-950 shadow transition hover:bg-amber-300 sm:px-4 sm:py-2 sm:text-sm"><RotateCcw aria-hidden="true" size={15} />再玩一局</button><button type="button" onClick={onBack} className="min-h-11 rounded-xl bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-amber-200 shadow transition hover:bg-amber-700 sm:px-4 sm:py-2 sm:text-sm">回遊戲選單</button></div>
          </div>
        </GameShell>
      )}
    </>
  );
};

export default RummikubGame;
