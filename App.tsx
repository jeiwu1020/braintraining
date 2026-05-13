
import React, { useState } from 'react';
import { GameState, Difficulty } from './types';
import SortingGame from './components/SortingGame';
import MemoryGame from './components/MemoryGame';
import BreathingExercise from './components/BreathingExercise';
import SentenceGame from './components/SentenceGame';
import FindGame from './components/FindGame';
import MarketGame from './components/MarketGame';
import StepsGame from './components/StepsGame';
import ShadowGame from './components/ShadowGame';
import StroopGame from './components/StroopGame';
import DotGame from './components/DotGame';
import EmotionGame from './components/EmotionGame';
// New Games
import PatternGame from './components/PatternGame';
import TimeGame from './components/TimeGame';
import OddOneGame from './components/OddOneGame';
import SoundGame from './components/SoundGame';
import PuzzleGame from './components/PuzzleGame';
import SudokuGame from './components/SudokuGame';
import SpotDiffGame from './components/SpotDiffGame';
import ZoomGame from './components/ZoomGame';
import VerbalMemoryGame from './components/VerbalMemoryGame';
import WordChainGame from './components/WordChainGame';
import SimonSaysGame from './components/SimonSaysGame';
import PriceEstimationGame from './components/PriceEstimationGame';
// Mental Health Games
import SocialContextGame from './components/SocialContextGame';
import HazardIdentificationGame from './components/HazardIdentificationGame';
import PositiveReappraisalGame from './components/PositiveReappraisalGame';
// Board Games
import GomokuGame from './components/GomokuGame';
import DarkChessGame from './components/DarkChessGame';
import ConnectFourGame from './components/ConnectFourGame';
import OthelloGame from './components/OthelloGame';
import DotsAndBoxesGame from './components/DotsAndBoxesGame';
import MancalaGame from './components/MancalaGame';
import CheckersGame from './components/CheckersGame';
import GobbletGame from './components/GobbletGame';

import { 
  Brain, Smile, Wind, Sparkles, Type, Eye, ShoppingCart, ListChecks, 
  Sun, Palette, MousePointer2, Heart, Zap, Shapes, Clock, HelpCircle, 
  Volume2, Grid, Grid3x3, Scroll, ArrowDownToLine, Circle, Square, Gem, Swords, Crown, Search,
  ZoomIn, MessageCircle, Link, ListOrdered, DollarSign, Users, TriangleAlert, Lightbulb
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');

  const renderContent = () => {
    switch (gameState) {
      case GameState.SORTING:
        return <SortingGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.MEMORY:
        return <MemoryGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.BREATHING:
        return <BreathingExercise onBack={() => setGameState(GameState.MENU)} />;
      case GameState.SENTENCE:
        return <SentenceGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.FIND:
        return <FindGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.MARKET:
        return <MarketGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.STEPS:
        return <StepsGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.SHADOW:
        return <ShadowGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.STROOP:
        return <StroopGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.DOTS:
        return <DotGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.EMOTION:
        return <EmotionGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      // Cognitive Games
      case GameState.PATTERN:
        return <PatternGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.TIME:
        return <TimeGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.ODD_ONE:
        return <OddOneGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.SOUND:
        return <SoundGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.PUZZLE:
        return <PuzzleGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.SUDOKU:
        return <SudokuGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.SPOT_DIFF:
        return <SpotDiffGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.ZOOM:
        return <ZoomGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.VERBAL_MEMORY:
        return <VerbalMemoryGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.WORD_CHAIN:
        return <WordChainGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.SIMON_SAYS:
        return <SimonSaysGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.PRICE_ESTIMATION:
        return <PriceEstimationGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      // Mental Health
      case GameState.SOCIAL_CONTEXT:
        return <SocialContextGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.HAZARD_ID:
        return <HazardIdentificationGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.POSITIVE_THINKING:
        return <PositiveReappraisalGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      // Board Games
      case GameState.GOMOKU:
        return <GomokuGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.DARK_CHESS:
        return <DarkChessGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.CONNECT_FOUR:
        return <ConnectFourGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.OTHELLO:
        return <OthelloGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.DOTS_BOXES:
        return <DotsAndBoxesGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.MANCALA:
        return <MancalaGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.CHECKERS:
        return <CheckersGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.GOBBLET:
        return <GobbletGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      default:
        return <MainMenu onSelectGame={setGameState} difficulty={difficulty} setDifficulty={setDifficulty} />;
    }
  };

  const bgClass = difficulty === 'NORMAL' ? 'bg-[#f0fdf4]' : 'bg-slate-100';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
      {renderContent()}
    </div>
  );
};

interface MenuProps {
  onSelectGame: (state: GameState) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
}

const MainMenu: React.FC<MenuProps> = ({ onSelectGame, difficulty, setDifficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';

  // Theme configuration based on difficulty
  const theme = isAdvanced ? {
      bg: "bg-gradient-to-br from-slate-100 to-indigo-100",
      titleColor: "text-indigo-900",
      subtitleColor: "text-indigo-800",
      iconColor: "text-indigo-500",
      card: {
          bg: "bg-indigo-50",
          border: "border-indigo-200",
          hover: "hover:bg-indigo-100"
      }
  } : {
      bg: "bg-gradient-to-br from-teal-50 to-emerald-100",
      titleColor: "text-gray-800",
      subtitleColor: "text-emerald-800",
      iconColor: "text-emerald-500",
      card: {
          bg: "", // Handled by individual card props in normal mode usually, but we can override
          border: "",
          hover: ""
      }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col sm:flex-row overflow-hidden transition-colors duration-500`}>
      
      {/* Sidebar / Header Area */}
      <div className="w-full sm:w-1/3 p-6 sm:p-8 md:p-12 flex flex-col justify-center items-center sm:items-start text-center sm:text-left z-10 relative shadow-md sm:shadow-none bg-white/40 sm:bg-transparent">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-lg mb-6 animate-fade-in">
          {isAdvanced ? <Zap className="text-purple-600 w-10 h-10 mr-3" /> : <Sparkles className="text-emerald-500 w-10 h-10 mr-3" />}
          <h1 className={`text-3xl md:text-4xl font-bold ${theme.titleColor} tracking-wide`}>綜合腦訓練</h1>
        </div>
        
        <h2 className={`text-xl md:text-2xl ${theme.subtitleColor} font-medium mb-4`}>
            {isAdvanced ? "進階認知挑戰" : "認知復健與放鬆"}
        </h2>
        
        <p className="text-gray-600 text-base md:text-lg max-w-md leading-relaxed hidden sm:block mb-6">
          {isAdvanced 
            ? "進階模式提供更具挑戰性的題目，適合想要進一步提升腦力的您。" 
            : "專為職能治療設計的互動遊戲，幫助您放鬆心情，活化大腦的每一天。"}
        </p>

        {/* Difficulty Toggle */}
        <div className="flex items-center bg-white rounded-full p-1 shadow-md border border-gray-200 mb-6 sm:mb-0">
            <button 
                onClick={() => setDifficulty('NORMAL')}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${!isAdvanced ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <Smile size={16} /> 一般
            </button>
            <button 
                onClick={() => setDifficulty('ADVANCED')}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${isAdvanced ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <Zap size={16} /> 進階
            </button>
        </div>

        <div className="mt-auto pt-8 text-gray-400 text-sm hidden sm:block">
            Designed for Occupational Therapy
        </div>
      </div>

      {/* Cards Scroll Area */}
      <div className="w-full sm:w-2/3 p-4 sm:p-6 md:p-12 overflow-y-auto h-full flex-1 bg-white/30 backdrop-blur-sm sm:rounded-l-[3rem] shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto pb-20 sm:pb-8">
            
            {/* --- Board Games Section Header --- */}
            <div className="col-span-full mt-4 mb-2 flex items-center">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="px-4 text-gray-500 font-bold text-sm">益智棋藝</span>
                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <MenuCard
            title="五子棋"
            description="經典連線遊戲，率先連成五子者勝。"
            icon={<Grid3x3 className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-gray-700'}`} />}
            color="bg-white"
            borderColor="border-gray-300"
            onClick={() => onSelectGame(GameState.GOMOKU)}
            />

            <MenuCard
            title="點格棋"
            description="連線圍地，考驗佈局與前瞻思考。"
            icon={<Square className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-rose-600'}`} />}
            color="bg-rose-50"
            borderColor="border-rose-300"
            onClick={() => onSelectGame(GameState.DOTS_BOXES)}
            />

            <MenuCard
            title="播棋 (寶石棋)"
            description="非洲古老智慧，運算與分配的藝術。"
            icon={<Gem className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-cyan-600'}`} />}
            color="bg-cyan-50"
            borderColor="border-cyan-300"
            onClick={() => onSelectGame(GameState.MANCALA)}
            />

            <MenuCard
            title="象棋暗棋"
            description="運氣與策略並重，翻棋吃子對決。"
            icon={<Scroll className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-amber-700'}`} />}
            color="bg-amber-50"
            borderColor="border-amber-300"
            onClick={() => onSelectGame(GameState.DARK_CHESS)}
            />

            <MenuCard
            title="四子棋"
            description="重力連線，垂直水平斜向皆可。"
            icon={<ArrowDownToLine className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-blue-600'}`} />}
            color="bg-blue-50"
            borderColor="border-blue-300"
            onClick={() => onSelectGame(GameState.CONNECT_FOUR)}
            />

            <MenuCard
            title="黑白棋"
            description="翻轉對手棋子，佔領盤面最多者勝。"
            icon={<Circle className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-emerald-700'}`} />}
            color="bg-emerald-50"
            borderColor="border-emerald-300"
            onClick={() => onSelectGame(GameState.OTHELLO)}
            />

            <MenuCard
            title="西洋跳棋"
            description="斜向跳吃，策略走位，衝向底線。"
            icon={<Swords className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-slate-700'}`} />}
            color="bg-slate-100"
            borderColor="border-slate-300"
            onClick={() => onSelectGame(GameState.CHECKERS)}
            />

            <MenuCard
            title="奇雞連連"
            description="大吃小，套娃版的進階井字遊戲。"
            icon={<Crown className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-orange-500'}`} />}
            color="bg-orange-50"
            borderColor="border-orange-300"
            onClick={() => onSelectGame(GameState.GOBBLET)}
            />

            {/* --- Cognitive Games Section Header --- */}
            <div className="col-span-full mt-8 mb-2 flex items-center">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="px-4 text-gray-500 font-bold text-sm">認知訓練</span>
                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <MenuCard
            title="分類大師"
            description={isAdvanced ? "抽象概念與多層次分類。" : "訓練邏輯與執行力，將物品正確歸類。"}
            icon={<Brain className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-orange-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-orange-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-orange-200"}
            onClick={() => onSelectGame(GameState.SORTING)}
            />
            
            <MenuCard
            title="圖像記憶配對"
            description={isAdvanced ? "相似圖案辨識，挑戰記憶極限。" : "翻牌配對 (附座標)，增強記憶與口語。"}
            icon={<Smile className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-indigo-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-indigo-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-indigo-200"}
            onClick={() => onSelectGame(GameState.MEMORY)}
            />

            <MenuCard
            title="造句拼拼樂"
            description={isAdvanced ? "長句重組，強化語法結構。" : "重組句子，訓練語言組織與邏輯。"}
            icon={<Type className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-pink-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-pink-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-pink-200"}
            onClick={() => onSelectGame(GameState.SENTENCE)}
            />

            <MenuCard
            title="眼明手快"
            description={isAdvanced ? "高度相似物品的視覺搜尋。" : "視覺掃描訓練，找出獨特的圖案。"}
            icon={<Eye className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-yellow-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-yellow-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-yellow-200"}
            onClick={() => onSelectGame(GameState.FIND)}
            />

            <MenuCard
            title="快樂市集"
            description={isAdvanced ? "複雜計算與預算控制。" : "生活算術與金錢管理訓練。"}
            icon={<ShoppingCart className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-green-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-green-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-green-200"}
            onClick={() => onSelectGame(GameState.MARKET)}
            />

            <MenuCard
            title="生活步驟"
            description={isAdvanced ? "繁複生活任務的順序執行。" : "將生活任務依照正確順序排列。"}
            icon={<ListChecks className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-purple-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-purple-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-purple-200"}
            onClick={() => onSelectGame(GameState.STEPS)}
            />

            <MenuCard
            title="影子猜猜看"
            description={isAdvanced ? "辨識細微差異的剪影。" : "觀察剪影，找出原本的物品。"}
            icon={<Sun className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-slate-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-slate-100"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-slate-300"}
            onClick={() => onSelectGame(GameState.SHADOW)}
            />

            <MenuCard
            title="顏色陷阱"
            description={isAdvanced ? "更快的速度與更強的干擾抑制。" : "抑制衝動訓練：字意與顏色不符時的判斷。"}
            icon={<Palette className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-rose-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-rose-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-rose-200"}
            onClick={() => onSelectGame(GameState.STROOP)}
            />

            <MenuCard
            title="方塊在哪裡"
            description={isAdvanced ? "更多的方塊與更短的記憶時間。" : "視覺空間記憶：記住並回想方塊位置。"}
            icon={<MousePointer2 className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-cyan-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-cyan-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-cyan-200"}
            onClick={() => onSelectGame(GameState.DOTS)}
            />

            <MenuCard
            title="情緒氣象台"
            description={isAdvanced ? "解讀複雜與混合的社交情緒。" : "社交認知：辨識表情與情緒情境。"}
            icon={<Heart className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-pink-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-pink-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-pink-200"}
            onClick={() => onSelectGame(GameState.EMOTION)}
            />

            {/* --- NEW GAMES --- */}

            <MenuCard
            title="圖形推理王"
            description={isAdvanced ? "多重規則與抽象符號推理。" : "觀察規律，找出下一個圖案。"}
            icon={<Shapes className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-blue-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-blue-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-blue-200"}
            onClick={() => onSelectGame(GameState.PATTERN)}
            />

            <MenuCard
            title="時間管家"
            description={isAdvanced ? "時間計算與行程規劃。" : "認識時鐘，建立時間觀念。"}
            icon={<Clock className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-slate-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-slate-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-slate-200"}
            onClick={() => onSelectGame(GameState.TIME)}
            />

            <MenuCard
            title="誰是異類"
            description={isAdvanced ? "抽象功能與屬性的差異判斷。" : "找出類別不同的物品。"}
            icon={<HelpCircle className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-orange-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-orange-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-orange-200"}
            onClick={() => onSelectGame(GameState.ODD_ONE)}
            />

            <MenuCard
            title="聽音辨位"
            description={isAdvanced ? "相似聲音辨識與背景音干擾。" : "專心聆聽，找出對應的聲音圖片。"}
            icon={<Volume2 className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-indigo-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-indigo-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-indigo-200"}
            onClick={() => onSelectGame(GameState.SOUND)}
            />

            <MenuCard
            title="拼圖達人"
            description={isAdvanced ? "九宮格圖像還原與空間對應。" : "簡單的圖片位置還原。"}
            icon={<Grid className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-teal-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-teal-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-teal-200"}
            onClick={() => onSelectGame(GameState.PUZZLE)}
            />

            <MenuCard
            title="數獨挑戰"
            description={isAdvanced ? "9x9 經典數獨，考驗邏輯與推理。" : "4x4 迷你數獨，輕鬆入門邏輯思考。"}
            icon={<Grid3x3 className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-fuchsia-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-fuchsia-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-fuchsia-200"}
            onClick={() => onSelectGame(GameState.SUDOKU)}
            />

            <MenuCard
            title="大家來找碴"
            description={isAdvanced ? "4x4 圖案陣列，找出 3 個不同之處。" : "3x3 圖案陣列，找出 1 個不同之處。"}
            icon={<Search className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-amber-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-amber-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-amber-200"}
            onClick={() => onSelectGame(GameState.SPOT_DIFF)}
            />

            {/* --- Group Activity Games Section Header --- */}
            <div className="col-span-full mt-8 mb-2 flex items-center">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="px-4 text-gray-500 font-bold text-sm">團體口語活動</span>
                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <MenuCard
            title="局部猜全貌"
            description={isAdvanced ? "超高倍率放大，考驗想像力與視覺完形。" : "放大物品局部，大家一起猜猜看。"}
            icon={<ZoomIn className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-blue-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-blue-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-blue-200"}
            onClick={() => onSelectGame(GameState.ZOOM)}
            />

            <MenuCard
            title="記憶翻牌 (口語版)"
            description={isAdvanced ? "20張牌挑戰，需要更強的短期記憶。" : "大數字編號，適合團體一起喊號碼翻牌。"}
            icon={<MessageCircle className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-pink-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-pink-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-pink-200"}
            onClick={() => onSelectGame(GameState.VERBAL_MEMORY)}
            />

            <MenuCard
            title="語意聯想"
            description={isAdvanced ? "特定情境的聯想，如「去海邊會帶的東西」、「放在冰箱裡的東西」。" : "明確的條件限制，如「紅色的食物」、「四隻腳的動物」。"}
            icon={<Link className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-green-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-green-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-green-200"}
            onClick={() => onSelectGame(GameState.WORD_CHAIN)}
            />

            <MenuCard
            title="順序記憶"
            description={isAdvanced ? "更長的順序與更快的速度。" : "記住顏色亮起的順序，並大聲說出來。"}
            icon={<ListOrdered className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-orange-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-orange-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-orange-200"}
            onClick={() => onSelectGame(GameState.SIMON_SAYS)}
            />

            <MenuCard
            title="價格估算"
            description={isAdvanced ? "高單價物品與生活規費估算。" : "日常用品與小吃，猜猜看多少錢。"}
            icon={<DollarSign className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-yellow-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-yellow-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-yellow-200"}
            onClick={() => onSelectGame(GameState.PRICE_ESTIMATION)}
            />

            {/* --- Mental Health Section Header --- */}
            <div className="col-span-full mt-8 mb-2 flex items-center">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="px-4 text-gray-500 font-bold text-sm">心理與社交情境</span>
                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <MenuCard
            title="情境應對"
            description={isAdvanced ? "職場與複雜衝突情境處理。" : "日常人際互動與社交禮儀問答。"}
            icon={<Users className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-purple-600'}`} />}
            color={isAdvanced ? "bg-white" : "bg-purple-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-purple-200"}
            onClick={() => onSelectGame(GameState.SOCIAL_CONTEXT)}
            />

            <MenuCard
            title="安全辨識"
            description={isAdvanced ? "戶外與長照情境的安全隱患。" : "居家與日常生活危險情境尋找。"}
            icon={<TriangleAlert className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-red-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-red-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-red-200"}
            onClick={() => onSelectGame(GameState.HAZARD_ID)}
            />

            <MenuCard
            title="轉念練習"
            description={isAdvanced ? "深度認知重塑與自我對話。" : "將負面想法轉化為正向或客觀思考。"}
            icon={<Lightbulb className={`w-8 h-8 ${isAdvanced ? 'text-indigo-500' : 'text-amber-500'}`} />}
            color={isAdvanced ? "bg-white" : "bg-amber-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-amber-200"}
            onClick={() => onSelectGame(GameState.POSITIVE_THINKING)}
            />

            {/* --- Relaxation Section Header --- */}
            <div className="col-span-full mt-8 mb-2 flex items-center">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="px-4 text-gray-500 font-bold text-sm">放鬆與舒緩</span>
                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <MenuCard
            title="呼吸律動"
            description="跟隨 3-2-1 倒數與引導，緩解焦慮。"
            icon={<Wind className="w-8 h-8 text-sky-500" />}
            color="bg-sky-50"
            borderColor="border-sky-200"
            onClick={() => onSelectGame(GameState.BREATHING)}
            />
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  onClick: () => void;
}

const MenuCard: React.FC<CardProps> = ({ title, description, icon, color, borderColor, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`${color} border-2 ${borderColor} rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex items-start gap-3 sm:gap-4 group h-full`}
    >
      <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm leading-snug">{description}</p>
      </div>
    </button>
  );
};

export default App;
