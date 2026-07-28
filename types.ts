
export enum GameState {
  MENU = 'MENU',
  SORTING = 'SORTING',
  MEMORY = 'MEMORY',
  BREATHING = 'BREATHING',
  SENTENCE = 'SENTENCE',
  FIND = 'FIND',
  MARKET = 'MARKET',
  STEPS = 'STEPS',
  SHADOW = 'SHADOW',
  STROOP = 'STROOP',
  DOTS = 'DOTS',
  EMOTION = 'EMOTION',
  PATTERN = 'PATTERN',
  TIME = 'TIME',
  ODD_ONE = 'ODD_ONE',
  SOUND = 'SOUND',
  PUZZLE = 'PUZZLE',
  SUDOKU = 'SUDOKU',
  SPOT_DIFF = 'SPOT_DIFF',
  ZOOM = 'ZOOM',
  VERBAL_MEMORY = 'VERBAL_MEMORY',
  WORD_CHAIN = 'WORD_CHAIN',
  SIMON_SAYS = 'SIMON_SAYS',
  PRICE_ESTIMATION = 'PRICE_ESTIMATION',
  SOCIAL_CONTEXT = 'SOCIAL_CONTEXT',
  HAZARD_ID = 'HAZARD_ID',
  POSITIVE_THINKING = 'POSITIVE_THINKING',
  // Board Games
  GOMOKU = 'GOMOKU',
  DARK_CHESS = 'DARK_CHESS',
  CONNECT_FOUR = 'CONNECT_FOUR',
  OTHELLO = 'OTHELLO',
  DOTS_BOXES = 'DOTS_BOXES',
  MANCALA = 'MANCALA',
  CHECKERS = 'CHECKERS',
  GOBBLET = 'GOBBLET',
  // New Luck/Group Games
  TREASURE = 'TREASURE',
  ROULETTE = 'ROULETTE',
  HIGHER_LOWER = 'HIGHER_LOWER'
}

export type Difficulty = 'NORMAL' | 'ADVANCED';

export interface SortingItem {
  id: string;
  name: string;
  category: 'A' | 'B';
}

export interface SortingLevel {
  categoryA: string;
  categoryB: string;
  items: SortingItem[];
}

export interface MemoryCard {
  id: number;
  content: string; // Emoji or Icon name
  isFlipped: boolean;
  isMatched: boolean;
}

export interface SentenceLevel {
  original: string;
  scrambled: { id: string, text: string }[];
}

export interface FindLevel {
  target: string;
  distractor: string;
  gridSize: number; // e.g. 5 for 5x5
  targetPosition: number; // index
}

// --- NEW GAMES TYPES ---

export interface MarketItem {
  name: string;
  icon: string;
  price: number;
}

export interface MarketLevel {
  items: MarketItem[];
  question: string;
  options: number[]; // 3 numeric options
  correctAnswer: number;
}

export interface StepItem {
  id: string;
  text: string;
  order: number; // Correct order (1, 2, 3...)
}

export interface StepsLevel {
  title: string;
  steps: StepItem[]; // Scrambled when delivered
}

export interface ShadowLevel {
  target: string; // The correct emoji
  options: string[]; // List of emojis (one is target, others are distractors)
  correctIndex: number;
}

// 1. Stroop (Color Trap)
export interface StroopLevel {
  text: string;        // The word displayed (e.g., "紅")
  colorCode: string;   // The css color of the word (e.g., "text-green-500")
  colorName: string;   // The semantic name of the colorCode (e.g., "綠") -> Correct Answer
  options: string[];   // Options displayed to user (e.g., ["紅", "綠", "藍"])
}

// 2. Dots (Spatial Working Memory)
export interface DotLevel {
  gridSize: number;    // 3 for 3x3, 4 for 4x4
  activeIndices: number[]; // Indices of dots to memorize
  duration: number;    // How long to show the dots (ms)
}

// 3. Emotion (Social Cognition)
export interface EmotionLevel {
  question: string;     // Scenario text or "How does he feel?"
  emoji?: string;       // Optional central image/emoji
  options: string[];    // Text options (e.g., "開心", "生氣")
  correctAnswer: string; 
}

// 4. Pattern (Logic)
export interface PatternLevel {
  sequence: string[]; // e.g. ["A", "B", "A", "?"]
  options: string[];  // e.g. ["A", "B", "C"]
  answer: string;
}

// 5. Time (Reality Orientation)
export interface TimeLevel {
  type: 'CLOCK' | 'MATH';
  question: string;
  clockTime?: { hour: number, minute: number }; // For visual clock
  options: string[];
  correctAnswer: string;
}

// 6. Odd One Out (Semantic)
export interface OddOneLevel {
  items: { text: string, icon: string }[];
  correctIndex: number; // The index of the odd one
  reason?: string; // Optional explanation
}

// 7. Sound Match (Auditory Attention)
export interface SoundLevel {
  soundType: 'HIGH' | 'LOW' | 'RISE' | 'FALL' | 'ALARM' | 'GAME' | 'BOUNCE' | 'MAGIC' | 'TELEPHONE';
  targetIcon: string;
  options: { icon: string, label: string, isCorrect: boolean }[];
}

// 8. Puzzle (Visual Spatial)
export interface PuzzleLevel {
  gridSize: number; // 2 or 3
  targetImage: string[]; // Array of icons/colors in correct order
  scrambled: { id: number, content: string }[];
}
