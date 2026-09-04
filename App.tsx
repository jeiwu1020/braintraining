
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Difficulty } from './types';
import {
  GAME_CATEGORIES,
  getGameDescription,
  getGamesByCategory,
  parseGameCategoryId,
} from './data/gameCatalog';
import type { GameCategoryId, GameDefinition } from './data/gameCatalog';
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
import WeiqiGame from './components/WeiqiGame';
import GomokuGame from './components/GomokuGame';
import DarkChessGame from './components/DarkChessGame';
import ConnectFourGame from './components/ConnectFourGame';
import OthelloGame from './components/OthelloGame';
import DotsAndBoxesGame from './components/DotsAndBoxesGame';
import MancalaGame from './components/MancalaGame';
import CheckersGame from './components/CheckersGame';
import GobbletGame from './components/GobbletGame';

import TreasureGame from './components/TreasureGame';
import RouletteGame from './components/RouletteGame';
import HigherLowerGame from './components/HigherLowerGame';
import BlackjackGame from './components/BlackjackGame';
import GuessCardGame from './components/GuessCardGame';
import MastermindGame from './components/MastermindGame';
import SetGame from './components/SetGame';
import PyramidGame from './components/PyramidGame';

// Relaxing Games
import AmbientSoundGame from './components/AmbientSoundGame';
import MandalaGame from './components/MandalaGame';
import AffirmationCardGame from './components/AffirmationCardGame';
import StarryRippleGame from './components/StarryRippleGame';
import MuscleRelaxationGame from './components/MuscleRelaxationGame';
import GuessWhoGame from "./components/GuessWhoGame";
import StoryCardsGame from "./components/StoryCardsGame";
import ConditionalSnapGame from "./components/ConditionalSnapGame";
import RevealPictureGame from "./components/RevealPictureGame";
import MazeNavigatorGame from "./components/MazeNavigatorGame";
import WordTileGame from "./components/WordTileGame";
import MahjongMeldsGame from "./components/MahjongMeldsGame";
import RummikubGame from "./components/RummikubGame";
import QwirkleGame from "./components/QwirkleGame";
import SevensGame from "./components/SevensGame";
import ChineseTenGame from "./components/ChineseTenGame";


import {
  Brain,
  ChevronRight,
  Clock,
  Grid3x3,
  Heart,
  Layers,
  MessageCircle,
  Shapes,
  Smile,
  Sparkles,
  TriangleAlert,
  Volume2,
  Wind,
  Zap,
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
      case GameState.AMBIENT_SOUND:
        return <AmbientSoundGame onBack={() => setGameState(GameState.MENU)} />;
      case GameState.MANDALA:
        return <MandalaGame onBack={() => setGameState(GameState.MENU)} />;
      case GameState.AFFIRMATION:
        return <AffirmationCardGame onBack={() => setGameState(GameState.MENU)} />;
      case GameState.STARRY_RIPPLE:
        return <StarryRippleGame onBack={() => setGameState(GameState.MENU)} />;
      case GameState.MUSCLE_RELAXATION:
        return <MuscleRelaxationGame onBack={() => setGameState(GameState.MENU)} />;
      case GameState.GUESS_WHO:
        return <GuessWhoGame onBack={() => setGameState(GameState.MENU)} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.STORY_CARDS:
        return <StoryCardsGame onBack={() => setGameState(GameState.MENU)} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.CONDITIONAL_SNAP:
        return <ConditionalSnapGame onBack={() => setGameState(GameState.MENU)} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.REVEAL_PICTURE:
        return <RevealPictureGame onBack={() => setGameState(GameState.MENU)} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.MAZE_NAVIGATOR:
        return <MazeNavigatorGame onBack={() => setGameState(GameState.MENU)} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.WORD_TILE:
        return <WordTileGame onBack={() => setGameState(GameState.MENU)} isAdvanced={difficulty === "ADVANCED"} />;
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
      case GameState.WEIQI:
        return <WeiqiGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} isAdvanced={difficulty === "ADVANCED"} />;
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
      case GameState.TREASURE:
        return <TreasureGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.ROULETTE:
        return <RouletteGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.BLACKJACK:
        return <BlackjackGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.GUESS_CARD:
        return <GuessCardGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.HIGHER_LOWER:
        return <HigherLowerGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.MASTERMIND:
        return <MastermindGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.SET:
        return <SetGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.PYRAMID:
        return <PyramidGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} />;
      case GameState.MAHJONG_MELDS:
        return <MahjongMeldsGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.RUMMIKUB:
        return <RummikubGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.QWIRKLE:
        return <QwirkleGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.SEVENS:
        return <SevensGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} isAdvanced={difficulty === "ADVANCED"} />;
      case GameState.CHINESE_TEN:
        return <ChineseTenGame onBack={() => setGameState(GameState.MENU)} difficulty={difficulty} isAdvanced={difficulty === "ADVANCED"} />;
      default:
        return <MainMenu onSelectGame={setGameState} difficulty={difficulty} setDifficulty={setDifficulty} />;
    }
  };

  const bgClass = difficulty === 'NORMAL' ? 'bg-[#f0fdf4]' : 'bg-slate-100';

  return (
    <div className={`min-h-[100dvh] ${bgClass} transition-colors duration-500`}>
      {renderContent()}
    </div>
  );
};

type MenuCategory = GameCategoryId;

interface CategoryPresentation {
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  iconColor: string;
}

const CATEGORY_PRESENTATION: Record<GameCategoryId, CategoryPresentation> = {
  COGNITIVE: {
    icon: <Brain className="w-10 h-10 text-indigo-500" />,
    color: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    iconColor: 'text-indigo-600',
  },
  STRATEGY: {
    icon: <Grid3x3 className="w-10 h-10 text-emerald-600" />,
    color: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-700',
  },
  TABLETOP: {
    icon: <Layers className="w-10 h-10 text-amber-500" />,
    color: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
  },
  LIFE_SOCIAL: {
    icon: <Heart className="w-10 h-10 text-rose-500" />,
    color: 'bg-rose-50',
    borderColor: 'border-rose-200',
    iconColor: 'text-rose-600',
  },
  RELAX: {
    icon: <Wind className="w-10 h-10 text-sky-500" />,
    color: 'bg-sky-50',
    borderColor: 'border-sky-200',
    iconColor: 'text-sky-600',
  },
};

const getGameIcon = (game: GameDefinition): React.ReactNode => {
  const iconClass = `w-8 h-8 ${CATEGORY_PRESENTATION[game.category].iconColor}`;

  if (game.tags.includes('AUDITORY')) return <Volume2 className={iconClass} />;
  if (game.tags.includes('LANGUAGE')) return <MessageCircle className={iconClass} />;
  if (game.tags.includes('MEMORY')) return <Smile className={iconClass} />;
  if (game.tags.includes('VISUOSPATIAL')) return <Shapes className={iconClass} />;
  if (game.tags.includes('DAILY_LIVING')) return <Clock className={iconClass} />;
  if (game.tags.includes('SAFETY')) return <TriangleAlert className={iconClass} />;
  if (game.tags.includes('RELAXATION')) return <Sparkles className={iconClass} />;
  if (game.tags.includes('CARD') || game.tags.includes('TABLETOP')) return <Layers className={iconClass} />;
  if (game.tags.includes('STRATEGY')) return <Grid3x3 className={iconClass} />;
  return <Brain className={iconClass} />;
};

interface MenuProps {
  onSelectGame: (game: GameState) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
}

const MainMenu: React.FC<MenuProps> = ({ onSelectGame, difficulty, setDifficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);

  useEffect(() => {
    const savedCategory = sessionStorage.getItem('menuSelectedCategory');
    const restoredCategory = parseGameCategoryId(savedCategory);
    if (restoredCategory) {
      setSelectedCategory(restoredCategory);
    } else if (savedCategory) {
      sessionStorage.removeItem('menuSelectedCategory');
    }
    const savedScroll = sessionStorage.getItem('menuScrollPos');
    if (savedScroll) {
      const scrollPos = parseInt(savedScroll, 10);
      if (scrollContainerRef.current) {
        setTimeout(() => { if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = scrollPos; }, 50);
      }
      window.scrollTo(0, scrollPos);
    }
  }, []);

  const handleSelectGame = (game: GameState) => {
    let scrollPos = window.scrollY;
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop > 0) {
        scrollPos = scrollContainerRef.current.scrollTop;
    }
    sessionStorage.setItem('menuScrollPos', scrollPos.toString());
    onSelectGame(game);
  };

  const handleSelectCategory = (category: MenuCategory | null) => {
    setSelectedCategory(category);
    if (category) {
        sessionStorage.setItem('menuSelectedCategory', category);
    } else {
        sessionStorage.removeItem('menuSelectedCategory');
    }
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  };

  // Theme configuration based on difficulty
  const theme = isAdvanced ? {
      bg: "bg-gradient-to-br from-slate-100 to-indigo-100",
      titleColor: "text-indigo-900",
      subtitleColor: "text-indigo-800",
      iconColor: "text-indigo-500",
  } : {
      bg: "bg-gradient-to-br from-teal-50 to-emerald-100",
      titleColor: "text-gray-800",
      subtitleColor: "text-emerald-800",
      iconColor: "text-emerald-500",
  };

  const categories = GAME_CATEGORIES.map(category => ({
    ...category,
    ...CATEGORY_PRESENTATION[category.id],
  }));
  const activeCategory = categories.find(category => category.id === selectedCategory);
  const categoryGames = selectedCategory ? getGamesByCategory(selectedCategory) : [];

  return (
    <div className={`fixed inset-0 ${theme.bg} flex flex-col sm:flex-row overflow-hidden transition-colors duration-500`}>
      
      {/* Sidebar / Header Area */}
      <div className="w-full sm:w-1/3 shrink-0 p-4 sm:p-6 md:p-12 landscape:p-3 landscape:py-2 flex flex-col justify-start sm:justify-center items-center sm:items-start text-center sm:text-left z-10 relative shadow-md sm:shadow-none bg-white/40 sm:bg-transparent overflow-y-auto max-h-full">
        <div className="inline-flex items-center justify-center p-2.5 sm:p-4 landscape:p-2 bg-white rounded-2xl sm:rounded-3xl shadow-lg mb-3 sm:mb-6 landscape:mb-2 animate-fade-in shrink-0">
          {isAdvanced ? <Zap className="text-purple-600 w-6 h-6 sm:w-10 sm:h-10 landscape:w-6 landscape:h-6 mr-2 sm:mr-3" /> : <Sparkles className="text-emerald-500 w-6 h-6 sm:w-10 sm:h-10 landscape:w-6 landscape:h-6 mr-2 sm:mr-3" />}
          <h1 className={`text-xl sm:text-2xl md:text-4xl landscape:text-xl font-bold ${theme.titleColor} tracking-wide whitespace-nowrap`}>綜合腦訓練</h1>
        </div>
        
        <h2 className={`text-sm sm:text-lg md:text-2xl landscape:text-sm ${theme.subtitleColor} font-medium mb-2 sm:mb-4 landscape:mb-2 shrink-0`}>
            {isAdvanced ? "進階認知挑戰" : "認知復健與放鬆"}
        </h2>
        
        <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-md leading-snug sm:leading-relaxed mb-2 sm:mb-4 shrink-0">
          {isAdvanced 
            ? "進階模式提供更具挑戰性的題目，適合想要進一步提升腦力的您。" 
            : "專為職能治療設計的互動遊戲，幫助您放鬆心情，活化大腦的每一天。"}
        </p>

        {/* Difficulty Toggle */}
        <div className="flex items-center bg-white rounded-full p-1 shadow-md border border-gray-200 mb-2 sm:mb-4 shrink-0">
            <button 
                onClick={() => setDifficulty('NORMAL')}
                aria-pressed={!isAdvanced}
                className={`min-h-11 px-3 py-1.5 sm:px-4 landscape:px-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 ${!isAdvanced ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <Smile size={14} className="sm:w-4 sm:h-4" /> 一般
            </button>
            <button 
                onClick={() => setDifficulty('ADVANCED')}
                aria-pressed={isAdvanced}
                className={`min-h-11 px-3 py-1.5 sm:px-4 landscape:px-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 ${isAdvanced ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <Zap size={14} className="sm:w-4 sm:h-4" /> 進階
            </button>
        </div>

        <div className="mt-auto pt-2 sm:pt-4 text-gray-400 text-xs sm:text-sm shrink-0">
            Designed for Occupational Therapy
        </div>
      </div>

      {/* Cards Scroll Area */}
      <div ref={scrollContainerRef} className="w-full sm:w-2/3 p-3 sm:p-6 md:p-12 landscape:p-3 overflow-y-auto h-full flex-1 bg-white/30 backdrop-blur-sm sm:rounded-l-[3rem] shadow-inner">
        
        {!selectedCategory ? (
            // CATEGORY LISTING
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 max-w-4xl mx-auto pb-16 sm:pb-8 landscape:grid-cols-1 md:landscape:grid-cols-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`${cat.color} border-2 ${cat.borderColor} rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-row items-center gap-3 sm:gap-4 group h-full w-full`}
                    >
                        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0 [&>svg]:w-7 [&>svg]:h-7 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
                            {cat.icon}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                            <h3 className="text-base sm:text-2xl font-bold text-gray-800 mb-1">{cat.title}</h3>
                            <p className="text-gray-600 text-xs sm:text-base leading-snug">{cat.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        ) : (
            // GAMES WITHIN SELECTED CATEGORY
            <div className="max-w-4xl mx-auto pb-16 sm:pb-8">
                
                {/* Back Button and Header */}
                <div className="flex items-center gap-2.5 sm:gap-4 mb-3 sm:mb-6 sticky top-0 bg-white/80 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl shadow-sm z-10 border border-gray-100 landscape:p-2.5 landscape:mb-3">
                    <button 
                        onClick={() => handleSelectCategory(null)}
                        aria-label="返回分類列表"
                        className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shrink-0"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-white rounded-xl shadow-sm [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
                            {activeCategory?.icon}
                        </div>
                        <h2 className="text-base sm:text-2xl font-bold text-gray-800">
                            {activeCategory?.title}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 landscape:grid-cols-1 md:landscape:grid-cols-2">
                    {categoryGames.map(game => {
                        const presentation = CATEGORY_PRESENTATION[game.category];
                        return (
                            <MenuCard
                                key={game.id}
                                title={game.title}
                                description={getGameDescription(game.id, difficulty)}
                                icon={getGameIcon(game)}
                                color={isAdvanced ? 'bg-white' : presentation.color}
                                borderColor={isAdvanced ? 'border-indigo-200' : presentation.borderColor}
                                onClick={() => handleSelectGame(game.id)}
                            />
                        );
                    })}
                </div>
            </div>
        )}
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
      className={`${color} border-2 ${borderColor} rounded-2xl p-3 sm:p-5 landscape:p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex items-start gap-3 sm:gap-4 group h-full min-h-[84px]`}
    >
      <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform shrink-0 [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm sm:text-xl font-bold text-gray-800 mb-0.5 sm:mb-1">{title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm leading-snug">{description}</p>
      </div>
    </button>
  );
};

export default App;
