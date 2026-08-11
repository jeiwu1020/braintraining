import React, { useState, useEffect, useRef } from 'react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, HelpCircle, CheckCircle2, XCircle, Award, Users, Sparkles, Clock, Zap } from 'lucide-react';
import { RulesModal } from './RulesModal';
import { soundService } from '../services/soundService';

interface QwirkleGameProps {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
}

export type QwirkleShape = 'circle' | 'square' | 'diamond' | 'star' | 'clover' | 'cross';
export type QwirkleColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface QwirkleTileData {
  id: string;
  shape: QwirkleShape;
  color: QwirkleColor;
  scoreText?: string;
  displayText?: string;
}

export interface CrossLineData {
  leftHLine?: QwirkleTileData[];
  rightHLine?: QwirkleTileData[];
  topVLine?: QwirkleTileData[];
  bottomVLine?: QwirkleTileData[];
}

const SHAPE_NAMES: Record<QwirkleShape, string> = {
  circle: '圓形',
  square: '正方形',
  diamond: '菱形',
  star: '星星',
  clover: '四葉草',
  cross: '十字'
};

const COLOR_NAMES: Record<QwirkleColor, string> = {
  red: '紅色',
  orange: '橘色',
  yellow: '黃色',
  green: '綠色',
  blue: '藍色',
  purple: '紫色'
};

const COLOR_CLASSES: Record<QwirkleColor, { fill: string; stroke: string; glow: string; text: string; bg: string }> = {
  red: { fill: 'fill-red-500', stroke: 'stroke-red-500', glow: 'drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]', text: 'text-red-500', bg: 'bg-red-500' },
  orange: { fill: 'fill-orange-500', stroke: 'stroke-orange-500', glow: 'drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]', text: 'text-orange-500', bg: 'bg-orange-500' },
  yellow: { fill: 'fill-yellow-400', stroke: 'stroke-yellow-400', glow: 'drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]', text: 'text-yellow-400', bg: 'bg-yellow-400' },
  green: { fill: 'fill-emerald-400', stroke: 'stroke-emerald-400', glow: 'drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]', text: 'text-emerald-400', bg: 'bg-emerald-400' },
  blue: { fill: 'fill-cyan-400', stroke: 'stroke-cyan-400', glow: 'drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]', text: 'text-cyan-400', bg: 'bg-cyan-400' },
  purple: { fill: 'fill-purple-400', stroke: 'stroke-purple-400', glow: 'drop-shadow-[0_0_6px_rgba(192,132,252,0.7)]', text: 'text-purple-400', bg: 'bg-purple-400' }
};

export const QwirkleShapeSVG: React.FC<{ shape: QwirkleShape; color: QwirkleColor; sizeClass?: string }> = ({ shape, color, sizeClass = 'w-6 h-6 sm:w-8 sm:h-8 lg:w-14 lg:h-14 xl:w-16 xl:h-16' }) => {
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.blue;

  switch (shape) {
    case 'circle':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClass} ${c.glow}`}>
          <circle cx="50" cy="50" r="38" className={c.fill} />
          <circle cx="50" cy="50" r="22" fill="#18181b" />
          <circle cx="50" cy="50" r="10" className={c.fill} />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClass} ${c.glow}`}>
          <rect x="15" y="15" width="70" height="70" rx="10" className={c.fill} />
          <rect x="30" y="30" width="40" height="40" rx="5" fill="#18181b" />
          <rect x="42" y="42" width="16" height="16" rx="2" className={c.fill} />
        </svg>
      );
    case 'diamond':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClass} ${c.glow}`}>
          <polygon points="50,10 90,50 50,90 10,50" className={c.fill} />
          <polygon points="50,28 72,50 50,72 28,50" fill="#18181b" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClass} ${c.glow}`}>
          <path
            d="M50 5 L61 38 L95 38 L68 58 L78 92 L50 71 L22 92 L32 58 L5 38 L39 38 Z"
            className={c.fill}
          />
        </svg>
      );
    case 'clover':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClass} ${c.glow}`}>
          <circle cx="34" cy="34" r="20" className={c.fill} />
          <circle cx="66" cy="34" r="20" className={c.fill} />
          <circle cx="34" cy="66" r="20" className={c.fill} />
          <circle cx="66" cy="66" r="20" className={c.fill} />
          <circle cx="50" cy="50" r="14" fill="#18181b" />
        </svg>
      );
    case 'cross':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClass} ${c.glow}`}>
          <path
            d="M35 10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 Z"
            className={c.fill}
          />
        </svg>
      );
    default:
      return null;
  }
};

export const QwirkleTile: React.FC<{
  tile: QwirkleTileData;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ tile, size = 'md', selected = false, highlight = false, onClick, disabled = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 p-1 lg:p-1.5',
    md: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-15 lg:h-15 xl:w-18 xl:h-18 p-1 sm:p-1.5 lg:p-2',
    lg: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-18 lg:h-18 xl:w-22 xl:h-22 p-1.5 lg:p-2.5'
  };

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`relative ${sizeClasses[size]} rounded-xl lg:rounded-2xl bg-zinc-900 border-2 lg:border-[3px] shadow-md flex items-center justify-center transition-all select-none overflow-hidden
        ${selected ? 'ring-3 lg:ring-4 ring-cyan-400 border-cyan-400 -translate-y-1 shadow-cyan-500/50 bg-zinc-800' : 'border-zinc-700 hover:border-zinc-500'}
        ${highlight ? 'ring-3 lg:ring-4 ring-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/30' : ''}
        ${disabled ? 'opacity-90 cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="w-full h-full flex items-center justify-center">
        <QwirkleShapeSVG shape={tile.shape} color={tile.color} />
      </div>
    </motion.button>
  );
};

interface QwirkleQuestion {
  id: number;
  type: 'same_color' | 'same_shape' | 'qwirkle_finish' | 'cross_intersection' | 'score_calc';
  title: string;
  prompt: string;
  line: QwirkleTileData[];
  crossLine?: CrossLineData;
  options: QwirkleTileData[];
  correctOptionId: string;
  explanation: string;
  ruleTag: string; // 2-char wrapped tag
}

const generateQwirkleQuestions = (isAdv: boolean): QwirkleQuestion[] => {
  const pool: QwirkleQuestion[] = [
    // 1. 同色異形 (紅色系列)
    {
      id: 1,
      type: 'same_color',
      title: '同色異形連線 (紅色)',
      prompt: '桌面是【紅色】系列：【紅-圓形】【紅-正方形】【紅-四葉草】。手牌哪一顆能合法接上？',
      line: [
        { id: 'l1', color: 'red', shape: 'circle' },
        { id: 'l2', color: 'red', shape: 'square' },
        { id: 'l3', color: 'red', shape: 'clover' }
      ],
      options: [
        { id: 'opt_1', color: 'red', shape: 'star' },
        { id: 'opt_2', color: 'blue', shape: 'star' },
        { id: 'opt_3', color: 'red', shape: 'circle' },
        { id: 'opt_4', color: 'green', shape: 'diamond' }
      ],
      correctOptionId: 'opt_1',
      explanation: '【紅色星星】為全新型態的紅色棋子，同色異形合法連線！',
      ruleTag: '同色\n異形'
    },
    // 2. 同形異色 (星星系列)
    {
      id: 2,
      type: 'same_shape',
      title: '同形異色連線 (星星)',
      prompt: '桌面全是【星星】：【藍-星星】【黃-星星】【綠-星星】。手牌哪一顆可以合法連上？',
      line: [
        { id: 'l4', color: 'blue', shape: 'star' },
        { id: 'l5', color: 'yellow', shape: 'star' },
        { id: 'l6', color: 'green', shape: 'star' }
      ],
      options: [
        { id: 'opt_5', color: 'red', shape: 'star' },
        { id: 'opt_6', color: 'blue', shape: 'star' },
        { id: 'opt_7', color: 'red', shape: 'circle' },
        { id: 'opt_8', color: 'yellow', shape: 'cross' }
      ],
      correctOptionId: 'opt_5',
      explanation: '【紅色星星】同為星星形狀且顏色未重複，順利擴充星星連線！',
      ruleTag: '同形\n異色'
    },
    // 3. 藍色形狀連線
    {
      id: 3,
      type: 'same_color',
      title: '藍色形狀連線',
      prompt: '桌面是【藍色】系列：【藍-四葉草】【藍-十字】【藍-正方形】。哪一顆可以接上？',
      line: [
        { id: 'l7', color: 'blue', shape: 'clover' },
        { id: 'l8', color: 'blue', shape: 'cross' },
        { id: 'l9', color: 'blue', shape: 'square' }
      ],
      options: [
        { id: 'opt_9', color: 'blue', shape: 'diamond' },
        { id: 'opt_10', color: 'blue', shape: 'cross' },
        { id: 'opt_11', color: 'purple', shape: 'diamond' },
        { id: 'opt_12', color: 'orange', shape: 'clover' }
      ],
      correctOptionId: 'opt_9',
      explanation: '【藍色菱形】是全新的藍色形狀，成功連線！',
      ruleTag: '同色\n異形'
    },
    // 4. 圓形色彩家族
    {
      id: 4,
      type: 'same_shape',
      title: '圓形色彩家族',
      prompt: '桌面已有【橘-圓形】【紫-圓形】【紅-圓形】。手牌哪一顆可以接進圓形家族？',
      line: [
        { id: 'l10', color: 'orange', shape: 'circle' },
        { id: 'l11', color: 'purple', shape: 'circle' },
        { id: 'l12', color: 'red', shape: 'circle' }
      ],
      options: [
        { id: 'opt_13', color: 'green', shape: 'circle' },
        { id: 'opt_14', color: 'orange', shape: 'circle' },
        { id: 'opt_15', color: 'green', shape: 'square' },
        { id: 'opt_16', color: 'blue', shape: 'cross' }
      ],
      correctOptionId: 'opt_13',
      explanation: '【綠色圓形】完美融入圓形家族！',
      ruleTag: '同形\n異色'
    },
    // 5. Qwirkle 滿貫大連線 (黃色 5 顆)
    {
      id: 5,
      type: 'qwirkle_finish',
      title: '🌟 Qwirkle 滿貫大連線！',
      prompt: '黃色系列已連了 5 顆【圓形】【正方形】【菱形】【星星】【十字】！差最後哪一顆達成 6 顆滿貫 Qwirkle？',
      line: [
        { id: 'l13', color: 'yellow', shape: 'circle' },
        { id: 'l14', color: 'yellow', shape: 'square' },
        { id: 'l15', color: 'yellow', shape: 'diamond' },
        { id: 'l16', color: 'yellow', shape: 'star' },
        { id: 'l17', color: 'yellow', shape: 'cross' }
      ],
      options: [
        { id: 'opt_17', color: 'yellow', shape: 'clover' },
        { id: 'opt_18', color: 'yellow', shape: 'star' },
        { id: 'opt_19', color: 'purple', shape: 'clover' },
        { id: 'opt_20', color: 'yellow', shape: 'circle' }
      ],
      correctOptionId: 'opt_17',
      explanation: '【黃色四葉草】補齊最後一塊拼圖，達成 6 顆滿貫 QWIRKLE 大獲全勝！🎉',
      ruleTag: '滿貫\n連線'
    },
    // 6. 綠色形狀連線
    {
      id: 6,
      type: 'same_color',
      title: '綠色形狀連線',
      prompt: '桌面是【綠色】系列：【綠-圓形】【綠-菱形】【綠-星星】。手牌哪一顆可以合法連上？',
      line: [
        { id: 'l18', color: 'green', shape: 'circle' },
        { id: 'l19', color: 'green', shape: 'diamond' },
        { id: 'l20', color: 'green', shape: 'star' }
      ],
      options: [
        { id: 'opt_21a', color: 'green', shape: 'cross' },
        { id: 'opt_22a', color: 'green', shape: 'circle' },
        { id: 'opt_23a', color: 'red', shape: 'cross' },
        { id: 'opt_24a', color: 'blue', shape: 'star' }
      ],
      correctOptionId: 'opt_21a',
      explanation: '【綠色十字】是全新的綠色型態，合法接上！',
      ruleTag: '同色\n異形'
    },
    // 7. 正方形色彩家族
    {
      id: 7,
      type: 'same_shape',
      title: '正方形色彩家族',
      prompt: '桌面已有【紅-正方形】【橘-正方形】【黃-正方形】【藍-正方形】。哪一顆可擴充該系列？',
      line: [
        { id: 'l21', color: 'red', shape: 'square' },
        { id: 'l22', color: 'orange', shape: 'square' },
        { id: 'l23', color: 'yellow', shape: 'square' },
        { id: 'l24', color: 'blue', shape: 'square' }
      ],
      options: [
        { id: 'opt_25a', color: 'purple', shape: 'square' },
        { id: 'opt_26a', color: 'red', shape: 'square' },
        { id: 'opt_27a', color: 'purple', shape: 'circle' },
        { id: 'opt_28a', color: 'green', shape: 'star' }
      ],
      correctOptionId: 'opt_25a',
      explanation: '【紫色正方形】顏色不重複，順利放入正方形家族！',
      ruleTag: '同形\n異色'
    },
    // 8. 紫色形狀連線
    {
      id: 8,
      type: 'same_color',
      title: '紫色形狀連線',
      prompt: '桌面是【紫色】系列：【紫-星星】【紫-四葉草】【紫-十字】。哪一顆可以接上？',
      line: [
        { id: 'l25', color: 'purple', shape: 'star' },
        { id: 'l26', color: 'purple', shape: 'clover' },
        { id: 'l27', color: 'purple', shape: 'cross' }
      ],
      options: [
        { id: 'opt_29a', color: 'purple', shape: 'square' },
        { id: 'opt_30a', color: 'purple', shape: 'star' },
        { id: 'opt_31a', color: 'yellow', shape: 'square' },
        { id: 'opt_32a', color: 'blue', shape: 'clover' }
      ],
      correctOptionId: 'opt_29a',
      explanation: '【紫色正方形】補上未重複的形狀，完美接上！',
      ruleTag: '同色\n異形'
    },
    // 9. 四葉草色彩家族
    {
      id: 9,
      type: 'same_shape',
      title: '四葉草色彩家族',
      prompt: '桌面已有【藍-四葉草】【黃-四葉草】【紫-四葉草】【綠-四葉草】。手牌哪一顆可加入？',
      line: [
        { id: 'l28', color: 'blue', shape: 'clover' },
        { id: 'l29', color: 'yellow', shape: 'clover' },
        { id: 'l30', color: 'purple', shape: 'clover' },
        { id: 'l31', color: 'green', shape: 'clover' }
      ],
      options: [
        { id: 'opt_33a', color: 'red', shape: 'clover' },
        { id: 'opt_34a', color: 'blue', shape: 'clover' },
        { id: 'opt_35a', color: 'red', shape: 'circle' },
        { id: 'opt_36a', color: 'orange', shape: 'star' }
      ],
      correctOptionId: 'opt_33a',
      explanation: '【紅色四葉草】未重複且同形，順利加入！',
      ruleTag: '同形\n異色'
    },
    // 10. 六色十字 Qwirkle 大滿貫
    {
      id: 10,
      type: 'qwirkle_finish',
      title: '🌟 十字家族 6 色大滿貫！',
      prompt: '【十字】家族已有：紅、橘、黃、綠、藍 5 色！差最後哪一色完成 6 色大滿貫？',
      line: [
        { id: 'l32', color: 'red', shape: 'cross' },
        { id: 'l33', color: 'orange', shape: 'cross' },
        { id: 'l34', color: 'yellow', shape: 'cross' },
        { id: 'l35', color: 'green', shape: 'cross' },
        { id: 'l36', color: 'blue', shape: 'cross' }
      ],
      options: [
        { id: 'opt_37a', color: 'purple', shape: 'cross' },
        { id: 'opt_38a', color: 'purple', shape: 'circle' },
        { id: 'opt_39a', color: 'red', shape: 'cross' },
        { id: 'opt_40a', color: 'yellow', shape: 'star' }
      ],
      correctOptionId: 'opt_37a',
      explanation: '【紫色十字】完成 6 色十字 Qwirkle 滿貫大勝！',
      ruleTag: '滿貫\n連線'
    }
  ];

  if (isAdv) {
    pool.push(
      // 進階 1: 六色菱形滿貫
      {
        id: 11,
        type: 'qwirkle_finish',
        title: '進階 菱形六色大滿貫',
        prompt: '【菱形】家族已有：紅、橘、黃、藍、紫 5 色！差最後哪一色菱形完成六色 Qwirkle？',
        line: [
          { id: 'l18', color: 'red', shape: 'diamond' },
          { id: 'l19', color: 'orange', shape: 'diamond' },
          { id: 'l20', color: 'yellow', shape: 'diamond' },
          { id: 'l21', color: 'blue', shape: 'diamond' },
          { id: 'l22', color: 'purple', shape: 'diamond' }
        ],
        options: [
          { id: 'opt_21', color: 'green', shape: 'diamond' },
          { id: 'opt_22', color: 'green', shape: 'star' },
          { id: 'opt_23', color: 'red', shape: 'diamond' },
          { id: 'opt_24', color: 'blue', shape: 'cross' }
        ],
        correctOptionId: 'opt_21',
        explanation: '【綠色菱形】完成 6 色菱形 Qwirkle 大滿貫！',
        ruleTag: '六色\n滿貫'
      },
      // 進階 2: 十字路口雙向交會 (直排正方形 x 橫排綠色)
      {
        id: 12,
        type: 'cross_intersection',
        title: '進階 雙向十字路口交叉放置',
        prompt: '橫向連線是【綠色系列】，縱向連線是【正方形系列】。交叉點❓唯有哪一顆能同時滿足縱橫兩條線？',
        line: [],
        crossLine: {
          leftHLine: [
            { id: 'hl1', color: 'green', shape: 'circle' },
            { id: 'hl2', color: 'green', shape: 'clover' },
            { id: 'hl3', color: 'green', shape: 'cross' }
          ],
          topVLine: [
            { id: 'vl1', color: 'blue', shape: 'square' },
            { id: 'vl2', color: 'yellow', shape: 'square' },
            { id: 'vl3', color: 'purple', shape: 'square' }
          ]
        },
        options: [
          { id: 'opt_25', color: 'green', shape: 'square' },
          { id: 'opt_26', color: 'blue', shape: 'square' },
          { id: 'opt_27', color: 'green', shape: 'diamond' },
          { id: 'opt_28', color: 'purple', shape: 'circle' }
        ],
        correctOptionId: 'opt_25',
        explanation: '【綠色正方形】既是綠色(滿足橫線)，又是正方形(滿足直線)，雙向完美交會！',
        ruleTag: '雙向\n交叉'
      },
      // 進階 3: 雙向連線計分計算 (橫4顆 + 縱3顆 = 7分)
      {
        id: 13,
        type: 'score_calc',
        title: '進階 縱橫雙向得分計算',
        prompt: '放上【紅色星星】至交叉點❓，同時完成【橫向4顆紅色線】與【縱向3顆星星線】。這一步總共可獲得幾分？',
        line: [],
        crossLine: {
          leftHLine: [
            { id: 'hl4', color: 'red', shape: 'circle' },
            { id: 'hl5', color: 'red', shape: 'square' },
            { id: 'hl6', color: 'red', shape: 'clover' }
          ],
          topVLine: [
            { id: 'vl4', color: 'blue', shape: 'star' },
            { id: 'vl5', color: 'yellow', shape: 'star' }
          ]
        },
        options: [
          { id: 'opt_29', color: 'red', shape: 'star', scoreText: '7 分' },
          { id: 'opt_30', color: 'red', shape: 'circle', scoreText: '4 分' },
          { id: 'opt_31', color: 'blue', shape: 'star', scoreText: '3 分' },
          { id: 'opt_32', color: 'orange', shape: 'clover', scoreText: '10 分' }
        ],
        correctOptionId: 'opt_29',
        explanation: '出【紅色星星】單步奪 7 分！(橫向4顆得4分 + 縱向3顆得3分 = 4+3=7分！)',
        ruleTag: '雙向\n計分'
      },
      // 進階 4: 滿貫加成爆分 (橫向6顆Qwirkle得12分 + 縱向3顆得3分 = 15分)
      {
        id: 14,
        type: 'score_calc',
        title: '進階 滿貫加成爆高分',
        prompt: '橫向已有5顆黃色棋(差1顆滿貫)，縱向有2顆四葉草。將【黃色四葉草】放到交叉點❓可狂拿幾分？',
        line: [],
        crossLine: {
          leftHLine: [
            { id: 'hl7', color: 'yellow', shape: 'circle' },
            { id: 'hl8', color: 'yellow', shape: 'square' },
            { id: 'hl9', color: 'yellow', shape: 'diamond' },
            { id: 'hl10', color: 'yellow', shape: 'star' },
            { id: 'hl11', color: 'yellow', shape: 'cross' }
          ],
          topVLine: [
            { id: 'vl6', color: 'blue', shape: 'clover' },
            { id: 'vl7', color: 'purple', shape: 'clover' }
          ]
        },
        options: [
          { id: 'opt_33', color: 'yellow', shape: 'clover', scoreText: '15 分' },
          { id: 'opt_34', color: 'yellow', shape: 'circle', scoreText: '12 分' },
          { id: 'opt_35', color: 'red', shape: 'clover', scoreText: '9 分' },
          { id: 'opt_36', color: 'purple', shape: 'star', scoreText: '6 分' }
        ],
        correctOptionId: 'opt_33',
        explanation: '一舉勇奪 15 分！(橫向完成6顆Qwirkle得6分+6分獎勵=12分，縱向3顆得3分，合計12+3=15分！)',
        ruleTag: '滿貫\n爆分'
      },
      // 進階 5: 防守卡位戰術 (不餵球給對手Qwirkle)
      {
        id: 15,
        type: 'same_color',
        title: '進階 觀念題：防守開闢新線',
        prompt: '防守戰術：桌上已有 4 顆藍色棋。若你手中沒有第 6 顆藍棋，為避免下家直接拿 Qwirkle 大滿貫，首選戰術為何？',
        line: [
          { id: 'l30', color: 'blue', shape: 'circle' },
          { id: 'l31', color: 'blue', shape: 'square' },
          { id: 'l32', color: 'blue', shape: 'diamond' },
          { id: 'l33', color: 'blue', shape: 'star' }
        ],
        options: [
          { id: 'opt_37', color: 'orange', shape: 'cross', displayText: '另闢新線' },
          { id: 'opt_38', color: 'blue', shape: 'cross', displayText: '硬接第5顆' },
          { id: 'opt_39', color: 'blue', shape: 'circle', displayText: '出重複藍棋' },
          { id: 'opt_40', color: 'red', shape: 'diamond', displayText: '跳過不出' }
        ],
        correctOptionId: 'opt_37',
        explanation: '選擇【另闢新線】！若貿然接第5顆藍棋，下家有第6顆藍棋就能直接端走12分滿貫！',
        ruleTag: '防守\n戰術'
      },
      // 進階 6: 雙向十字路口 (藍色系列 ╳ 星星系列)
      {
        id: 16,
        type: 'cross_intersection',
        title: '進階 藍色 ╳ 星星十字交會',
        prompt: '橫向連線是【藍色系列】，縱向連線是【星星系列】。哪一顆棋子放入交叉點❓可同時符合雙向規則？',
        line: [],
        crossLine: {
          leftHLine: [
            { id: 'hl12', color: 'blue', shape: 'circle' },
            { id: 'hl13', color: 'blue', shape: 'square' },
            { id: 'hl14', color: 'blue', shape: 'clover' }
          ],
          topVLine: [
            { id: 'vl8', color: 'red', shape: 'star' },
            { id: 'vl9', color: 'yellow', shape: 'star' }
          ]
        },
        options: [
          { id: 'opt_41b', color: 'blue', shape: 'star' },
          { id: 'opt_42b', color: 'blue', shape: 'circle' },
          { id: 'opt_43b', color: 'green', shape: 'star' },
          { id: 'opt_44b', color: 'purple', shape: 'square' }
        ],
        correctOptionId: 'opt_41b',
        explanation: '【藍色星星】既是藍色又是星星，雙向完美吻合！',
        ruleTag: '雙向\n交叉'
      },
      // 進階 7: 雙向得分計算 (橫3顆黃色 + 縱4顆十字 = 7分)
      {
        id: 17,
        type: 'score_calc',
        title: '進階 縱橫連線雙重算分',
        prompt: '放上【黃色十字】至交叉點❓，同時完成【橫向3顆黃色線】與【縱向4顆十字線】。這一步總共獲得幾分？',
        line: [],
        crossLine: {
          leftHLine: [
            { id: 'hl15', color: 'yellow', shape: 'circle' },
            { id: 'hl16', color: 'yellow', shape: 'square' }
          ],
          topVLine: [
            { id: 'vl10', color: 'red', shape: 'cross' },
            { id: 'vl11', color: 'blue', shape: 'cross' },
            { id: 'vl12', color: 'purple', shape: 'cross' }
          ]
        },
        options: [
          { id: 'opt_45b', color: 'yellow', shape: 'cross', scoreText: '7 分' },
          { id: 'opt_46b', color: 'yellow', shape: 'cross', scoreText: '5 分' },
          { id: 'opt_47b', color: 'yellow', shape: 'cross', scoreText: '3 分' },
          { id: 'opt_48b', color: 'yellow', shape: 'cross', scoreText: '12 分' }
        ],
        correctOptionId: 'opt_45b',
        explanation: '獲得 7 分！(橫向3顆得3分 + 縱向4顆得4分 = 3+4=7分！)',
        ruleTag: '雙向\n計分'
      },
      // 進階 8: 雙向四向交叉點
      {
        id: 18,
        type: 'score_calc',
        title: '進階 四向十字中心點算分',
        prompt: '橫向為【紅色系列】(左2右1)，縱向為【星星系列】(上2下1)。放上【紅色星星】於正中央交叉點❓，總共可拿幾分？',
        line: [],
        crossLine: {
          leftHLine: [
            { id: 'hl17', color: 'red', shape: 'circle' },
            { id: 'hl18', color: 'red', shape: 'square' }
          ],
          rightHLine: [
            { id: 'hl19', color: 'red', shape: 'clover' }
          ],
          topVLine: [
            { id: 'vl13', color: 'blue', shape: 'star' },
            { id: 'vl14', color: 'yellow', shape: 'star' }
          ],
          bottomVLine: [
            { id: 'vl15', color: 'purple', shape: 'star' }
          ]
        },
        options: [
          { id: 'opt_49b', color: 'red', shape: 'star', scoreText: '8 分' },
          { id: 'opt_50b', color: 'red', shape: 'star', scoreText: '6 分' },
          { id: 'opt_51b', color: 'red', shape: 'star', scoreText: '4 分' },
          { id: 'opt_52b', color: 'red', shape: 'star', scoreText: '12 分' }
        ],
        correctOptionId: 'opt_49b',
        explanation: '獲得 8 分！(橫向共4顆得4分 + 縱向共4顆得4分 = 4+4=8分！)',
        ruleTag: '四向\n爆分'
      },
      // 進階 9: 觀念題：開局首碰選擇
      {
        id: 19,
        type: 'score_calc',
        title: '進階 觀念題：開局首碰得分',
        prompt: '遊戲剛開始桌上只有【黃色圓形】1顆。你手牌有【黃色正方形】與【藍色圓形】，打出其中1顆第一步最多可得幾分？',
        line: [
          { id: 'l34', color: 'yellow', shape: 'circle' }
        ],
        options: [
          { id: 'opt_53b', color: 'yellow', shape: 'square', scoreText: '2 分' },
          { id: 'opt_54b', color: 'blue', shape: 'circle', scoreText: '1 分' },
          { id: 'opt_55b', color: 'red', shape: 'star', scoreText: '3 分' },
          { id: 'opt_56b', color: 'green', shape: 'clover', scoreText: '0 分' }
        ],
        correctOptionId: 'opt_53b',
        explanation: '打出【黃色正方形】接在【黃色圓形】旁，形成 2 顆連線，獲得 2 分！',
        ruleTag: '開局\n首碰'
      },
      // 進階 10: 雙滿貫神乎其技爆分 (橫6顆 + 縱6顆)
      {
        id: 20,
        type: 'score_calc',
        title: '進階 雙 Qwirkle 滿貫雙爆分',
        prompt: '橫向已連5顆黃色棋，縱向已連5顆菱形棋！將【黃色菱形】放入中央交叉點❓同時解鎖雙 Qwirkle 滿貫，總共狂拿幾分？',
        line: [],
        crossLine: {
          leftHLine: [
            { id: 'hl20', color: 'yellow', shape: 'circle' },
            { id: 'hl21', color: 'yellow', shape: 'square' },
            { id: 'hl22', color: 'yellow', shape: 'clover' },
            { id: 'hl23', color: 'yellow', shape: 'star' },
            { id: 'hl24', color: 'yellow', shape: 'cross' }
          ],
          topVLine: [
            { id: 'vl16', color: 'red', shape: 'diamond' },
            { id: 'vl17', color: 'blue', shape: 'diamond' },
            { id: 'vl18', color: 'purple', shape: 'diamond' },
            { id: 'vl19', color: 'orange', shape: 'diamond' },
            { id: 'vl20', color: 'green', shape: 'diamond' }
          ]
        },
        options: [
          { id: 'opt_57b', color: 'yellow', shape: 'diamond', scoreText: '24 分' },
          { id: 'opt_58b', color: 'yellow', shape: 'diamond', scoreText: '18 分' },
          { id: 'opt_59b', color: 'yellow', shape: 'diamond', scoreText: '12 分' },
          { id: 'opt_60b', color: 'yellow', shape: 'diamond', scoreText: '30 分' }
        ],
        correctOptionId: 'opt_57b',
        explanation: '狂拿 24 分！(橫向6顆得6分+6分獎勵=12分；縱向6顆得6分+6分獎勵=12分，12+12=24分！超強爆分！)',
        ruleTag: '雙滿貫\n神技'
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
  if (seconds <= 2.5) return { score: 100, label: '極速棋聖', icon: '⚡⚡⚡' };
  if (seconds <= 5.0) return { score: 85, label: '敏銳觀察', icon: '⚡⚡' };
  if (seconds <= 8.5) return { score: 70, label: '沉穩連線', icon: '⚡' };
  if (seconds <= 12.0) return { score: 55, label: '縝密佈局', icon: '⏱️' };
  return { score: 40, label: '穩紮穩打', icon: '🛡️' };
};

const QwirkleGame: React.FC<QwirkleGameProps> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false }) => {
  const isAdv = isAdvanced || difficulty === 'ADVANCED';

  const [questions, setQuestions] = useState<QwirkleQuestion[]>([]);
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
    const list = generateQwirkleQuestions(isAdv);
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

  const handleSelect = (opt: QwirkleTileData) => {
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
    '【繽紛形色棋 Qwirkle】國際獲獎桌遊：',
    '同色不同形：同顏色的一條線中，每顆形狀必須不同。',
    '同形不同色：同形狀的一條線中，每顆顏色必須不同。',
    'Qwirkle 大滿貫：湊齊 6 顆不同顏色或 6 種不同形狀的完整連線！',
    '⚡ 速度評分機制：作答越快得分越高（最高100分）！'
  ];

  return (
    <div className="h-screen max-h-screen w-full bg-gradient-to-br from-zinc-950 via-slate-900 to-cyan-950 text-white flex flex-col p-1.5 sm:p-3 select-none overflow-hidden justify-between">
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="繽紛形色棋 規則說明" rules={rules} />

      {/* Top Compact Bar */}
      <div className="flex items-center justify-between gap-1.5 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-cyan-100 rounded-xl font-bold text-xs sm:text-sm lg:text-base transition shadow"
        >
          <ArrowLeft size={16} />
          <span>返回</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-cyan-500 text-gray-950 rounded-full text-[10px] sm:text-xs lg:text-sm font-black">
            {isAdv ? '進階交叉' : '經典形色'}
          </span>
          <h1 className="text-xs sm:text-base lg:text-xl font-black text-cyan-300 tracking-wide truncate max-w-[130px] sm:max-w-none">
            繽紛形色棋
          </h1>
          {currentQ && (
            <span className="text-[11px] sm:text-xs lg:text-sm text-cyan-200 font-bold hidden sm:inline">
              ({currentIndex + 1}/{questions.length})
            </span>
          )}
        </div>

        {/* Live Timer & Score */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isAnswered && !gameComplete && (
            <div className="flex items-center gap-1 px-2 py-0.5 lg:px-3 lg:py-1 bg-zinc-900 border border-cyan-700/60 rounded-xl text-cyan-300 text-xs lg:text-sm font-bold shadow-inner">
              <Clock size={14} className="text-cyan-400 animate-spin" />
              <span>{elapsedTime.toFixed(1)}s</span>
            </div>
          )}

          {teamMode === 'TEAM' ? (
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg font-bold text-xs lg:text-sm ${currentTeam === 'A' ? 'bg-amber-400 text-gray-950' : 'bg-zinc-800 text-zinc-300'}`}>
                A:{teamAScore}
              </span>
              <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg font-bold text-xs lg:text-sm ${currentTeam === 'B' ? 'bg-cyan-400 text-gray-950' : 'bg-zinc-800 text-zinc-300'}`}>
                B:{teamBScore}
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-0.5 lg:px-3 lg:py-1 bg-zinc-800 border border-zinc-700 rounded-xl text-cyan-300 font-black text-xs sm:text-sm lg:text-base">
              {score}分
            </div>
          )}

          <button
            onClick={() => setTeamMode(m => (m === 'SOLO' ? 'TEAM' : 'SOLO'))}
            className={`p-1 sm:px-2 sm:py-1 lg:px-3 lg:py-1.5 rounded-xl font-bold text-xs lg:text-sm transition shadow ${
              teamMode === 'TEAM' ? 'bg-cyan-500 text-gray-950' : 'bg-zinc-800 text-cyan-200'
            }`}
            title="模式切換"
          >
            <Users size={16} />
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="p-1 sm:p-1.5 lg:px-2.5 lg:py-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-200 rounded-xl transition shadow"
            title="規則說明"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={restart}
            className="p-1 sm:p-1.5 lg:px-2.5 lg:py-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-200 rounded-xl transition shadow"
            title="重新開始"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Single Page Split Layout with No Scrollbars */}
      {!gameComplete && currentQ ? (
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col sm:flex-row landscape:flex-row gap-2 sm:gap-3 lg:gap-4 my-1 bg-zinc-900/90 border border-cyan-800/40 rounded-2xl p-2 sm:p-3 lg:p-4 shadow-xl backdrop-blur-md overflow-hidden min-h-0 h-full">
          
          {/* LEFT COLUMN: Question Banner + Board Area */}
          <div className="flex-1 sm:w-7/12 landscape:w-7/12 lg:w-8/12 flex flex-col min-h-0 overflow-hidden bg-zinc-950/60 p-2 sm:p-3 rounded-xl border border-zinc-800/80">
            
            {/* Question Prompt */}
            <div className="flex items-center gap-2 lg:gap-3 border-b border-zinc-800 pb-1.5 shrink-0">
              <span className="bg-cyan-900/90 text-cyan-300 border border-cyan-500/50 text-[10px] sm:text-xs lg:text-sm font-black px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-lg whitespace-pre-line text-center leading-tight shrink-0">
                {currentQ.ruleTag}
              </span>
              <h2 className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold text-white leading-tight">
                {currentQ.prompt}
              </h2>
            </div>

            {/* Board Display Area */}
            <div className="flex-1 my-1 py-1 px-1 flex flex-col items-center justify-center bg-black/70 rounded-xl border border-zinc-800/80 shadow-inner overflow-hidden min-h-0">
              {currentQ.crossLine ? (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-0">
                  <span className="text-[10px] sm:text-xs text-cyan-300 font-bold mb-1 flex items-center gap-1 shrink-0">
                    <Sparkles size={13} className="text-cyan-400" />
                    <span>雙向交叉棋盤 (直排 ╳ 橫排)</span>
                  </span>

                  {(() => {
                    const topV = currentQ.crossLine.topVLine || [];
                    const bottomV = currentQ.crossLine.bottomVLine || [];
                    const leftH = currentQ.crossLine.leftHLine || [];
                    const rightH = currentQ.crossLine.rightHLine || [];
                    const L = leftH.length;
                    const R = rightH.length;

                    return (
                      <div className="flex-1 flex items-center justify-center w-full min-h-0 overflow-auto py-1">
                        <div
                          className="grid gap-1 sm:gap-1.5 items-center justify-center my-auto p-1 max-w-full"
                          style={{
                            gridTemplateColumns: `repeat(${L + 1 + R}, minmax(0, auto))`
                          }}
                        >
                          {/* Top Vertical Column */}
                          {topV.map((tile, vIdx) => (
                            <React.Fragment key={`topV_${vIdx}`}>
                              {Array.from({ length: L }).map((_, i) => (
                                <div key={`topV_${vIdx}_L_${i}`} className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 pointer-events-none" />
                              ))}
                              <QwirkleTile tile={tile} size="sm" disabled />
                              {Array.from({ length: R }).map((_, i) => (
                                <div key={`topV_${vIdx}_R_${i}`} className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 pointer-events-none" />
                              ))}
                            </React.Fragment>
                          ))}

                          {/* Middle Horizontal Row */}
                          {leftH.map((tile, idx) => (
                            <QwirkleTile key={tile.id || `leftH_${idx}`} tile={tile} size="sm" disabled />
                          ))}

                          {/* Intersection Question Mark Slot */}
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-xl border-2 border-dashed border-amber-400 bg-amber-500/20 flex flex-col items-center justify-center text-amber-300 font-bold p-0.5 shadow-lg shadow-amber-500/20 animate-pulse shrink-0">
                            <span className="text-[10px] sm:text-xs md:text-sm font-black text-amber-300">❓</span>
                            <span className="text-[5px] sm:text-[6px] md:text-[7px] text-center font-bold text-amber-200 leading-none">交叉位</span>
                          </div>

                          {rightH.map((tile, idx) => (
                            <QwirkleTile key={tile.id || `rightH_${idx}`} tile={tile} size="sm" disabled />
                          ))}

                          {/* Bottom Vertical Column */}
                          {bottomV.map((tile, vIdx) => (
                            <React.Fragment key={`bottomV_${vIdx}`}>
                              {Array.from({ length: L }).map((_, i) => (
                                <div key={`bottomV_${vIdx}_L_${i}`} className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 pointer-events-none" />
                              ))}
                              <QwirkleTile tile={tile} size="sm" disabled />
                              {Array.from({ length: R }).map((_, i) => (
                                <div key={`bottomV_${vIdx}_R_${i}`} className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 pointer-events-none" />
                              ))}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-0">
                  <span className="text-[10px] sm:text-xs text-cyan-300 font-bold mb-2 flex items-center gap-1 shrink-0">
                    <Sparkles size={13} className="text-cyan-400" />
                    <span>當前棋盤連線</span>
                  </span>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 my-auto overflow-auto p-1 max-w-full">
                    {currentQ.line.map((tile, idx) => (
                      <QwirkleTile key={tile.id || idx} tile={tile} size="sm" disabled />
                    ))}

                    {/* Slot Placeholder */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-xl border-2 border-dashed border-cyan-400 bg-cyan-500/10 flex flex-col items-center justify-center text-cyan-300 font-bold p-0.5 shadow-inner animate-pulse shrink-0">
                      <span className="text-[10px] sm:text-xs md:text-sm">❓</span>
                      <span className="text-[5px] sm:text-[6px] md:text-[7px] text-center font-bold text-cyan-200 leading-none">接哪顆</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Hand Cards / Answer Options + Feedback/Next Button */}
          <div className="shrink-0 sm:w-5/12 landscape:w-5/12 lg:w-4/12 flex flex-col justify-between min-h-0 overflow-hidden bg-zinc-950/60 p-2 sm:p-3 rounded-xl border border-zinc-800/80">
            
            {/* Header */}
            <div className="border-b border-zinc-800 pb-1 text-center shrink-0">
              <span className="text-xs font-bold text-cyan-300 tracking-wide">
                🎯 請選擇答案 / 出牌選項
              </span>
            </div>

            {/* Options Stack / Grid */}
            <div className="flex-1 flex flex-col items-center justify-center my-1 overflow-y-auto p-1 min-h-0">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 w-full justify-items-center items-center my-auto">
                {currentQ.options.map(opt => {
                  const isSelected = selectedOptionId === opt.id;
                  const isOptCorrect = opt.id === currentQ.correctOptionId;
                  let highlight = false;
                  if (isAnswered && isOptCorrect) highlight = true;

                  return (
                    <div key={opt.id} className="w-full flex justify-center">
                      {opt.scoreText || opt.displayText ? (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={isAnswered}
                          onClick={() => handleSelect(opt)}
                          className={`w-full py-1.5 px-1 rounded-xl border-2 flex flex-col items-center justify-center font-black text-center shadow transition ${
                            highlight
                              ? 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-500/50 ring-2 ring-emerald-400'
                              : isSelected
                              ? 'bg-cyan-500 border-cyan-200 text-gray-950 shadow-cyan-500/50 ring-2 ring-cyan-300'
                              : 'bg-zinc-800/90 border-zinc-600 text-cyan-300 hover:border-cyan-400 hover:bg-zinc-700'
                          }`}
                        >
                          <span className="text-xs sm:text-sm lg:text-base font-black tracking-wide">
                            {opt.scoreText || opt.displayText}
                          </span>
                          {opt.scoreText && (
                            <span className="text-[8px] sm:text-[9px] text-cyan-200 font-bold">點擊選擇</span>
                          )}
                        </motion.button>
                      ) : (
                        <QwirkleTile
                          tile={opt}
                          size="md"
                          selected={isSelected}
                          highlight={highlight}
                          disabled={isAnswered}
                          onClick={() => handleSelect(opt)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Feedback Banner / Action Area */}
            <div className="shrink-0 min-h-[40px] flex flex-col justify-end pt-1 border-t border-zinc-800/80">
              <AnimatePresence mode="wait">
                {isAnswered ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`w-full p-1.5 sm:p-2 rounded-xl flex flex-col gap-1 shadow border text-xs shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100'
                        : 'bg-rose-950/95 border-rose-500 text-rose-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        {isCorrect && lastSpeedInfo && (
                          <span className="bg-emerald-800 text-cyan-300 px-1 py-0.5 rounded font-black text-[9px] whitespace-nowrap">
                            +{lastEarnedScore}分 {lastSpeedInfo.icon}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleNext}
                        className="shrink-0 px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-gray-950 font-black rounded-lg text-xs shadow active:scale-95 transition"
                      >
                        {currentIndex + 1 < questions.length ? '下一題 ➔' : '查看結算 🏆'}
                      </button>
                    </div>

                    <div className="text-[10px] sm:text-[11px] leading-tight font-bold opacity-90 line-clamp-2">
                      {currentQ.explanation}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-[10px] sm:text-xs text-zinc-400 font-bold py-0.5">
                    點擊作答選項完成題目
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        /* End Screen */
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-3 gap-2.5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2.5 bg-cyan-500 text-gray-950 rounded-2xl shadow-xl"
          >
            <Award className="w-10 h-10 sm:w-14 sm:h-14" />
          </motion.div>

          <h2 className="text-lg sm:text-2xl font-black text-cyan-300">
            ✨ 形色棋滿貫大師通關！
          </h2>

          {teamMode === 'TEAM' ? (
            <div className="bg-zinc-800/80 border border-cyan-500/50 rounded-2xl p-3 max-w-sm w-full">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-500/20 border border-amber-400 p-2 rounded-xl">
                  <p className="text-xs text-amber-300 font-bold">A 組得分</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{teamAScore} 分</p>
                </div>
                <div className="bg-cyan-500/20 border border-cyan-400 p-2 rounded-xl">
                  <p className="text-xs text-cyan-300 font-bold">B 組得分</p>
                  <p className="text-xl sm:text-2xl font-black text-white">{teamBScore} 分</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800/80 border border-cyan-700/50 rounded-2xl p-3 max-w-sm w-full">
              <p className="text-zinc-300 text-xs font-bold">總積分</p>
              <p className="text-2xl sm:text-4xl font-black text-cyan-300">{score} 分</p>
              <p className="text-[11px] sm:text-xs text-cyan-200 mt-1">形狀色彩洞察敏銳，滿貫連線思維神速！</p>
            </div>
          )}

          <div className="flex gap-2.5 justify-center mt-1">
            <button
              onClick={restart}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-cyan-400 hover:bg-cyan-300 text-gray-950 font-black rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-1"
            >
              <RotateCcw size={15} />
              再玩一局
            </button>
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs sm:text-sm shadow transition"
            >
              回遊戲選單
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QwirkleGame;
