import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  RotateCcw,
  Undo2,
  HelpCircle,
  Trophy,
  Users,
  Bot,
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Flag,
  HandMetal,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Clock,
  Shield,
  Volume2,
  VolumeX,
  Play,
  ListFilter
} from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';
import {
  GoBoard,
  GoColor,
  Point,
  createEmptyBoard,
  playGoMove,
  getGoAIMove,
  findGroupsInAtari,
  estimateTerritory,
  TerritoryScore
} from '../services/goEngine';
import { GO_PUZZLES, GoPuzzle, parsePuzzleBoard, PuzzleCategory } from '../data/goPuzzles';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
  isAdvanced?: boolean;
}

type GameMode = 'AI' | 'PVP' | 'PUZZLE';
type BoardSize = 9 | 13 | 19;

// Standard Go Column Coordinates (skipping 'I')
export const GO_COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

export const WeiqiGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false }) => {
  // Game Mode
  const [gameMode, setGameMode] = useState<GameMode>('AI');
  const [boardSize, setBoardSize] = useState<BoardSize>(9);

  // Match State (AI / PVP)
  const [board, setBoard] = useState<GoBoard>(() => createEmptyBoard(9));
  const [currentTurn, setCurrentTurn] = useState<'BLACK' | 'WHITE'>('BLACK');
  const [playerColor, setPlayerColor] = useState<'BLACK' | 'WHITE'>('BLACK');
  const [aiDifficulty, setAiDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');
  const [handicap, setHandicap] = useState<number>(0);

  // Captures & Moves
  const [blackCaptures, setBlackCaptures] = useState<number>(0);
  const [whiteCaptures, setWhiteCaptures] = useState<number>(0);
  const [koPoint, setKoPoint] = useState<Point | null>(null);
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [consecutivePasses, setConsecutivePasses] = useState<number>(0);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<{
    board: GoBoard;
    turn: 'BLACK' | 'WHITE';
    blackCaptures: number;
    whiteCaptures: number;
    koPoint: Point | null;
    lastMove: Point | null;
  }[]>([]);

  // Territory / Count overlay
  const [showTerritory, setShowTerritory] = useState<boolean>(false);
  const [territoryResult, setTerritoryResult] = useState<TerritoryScore | null>(null);
  const [gameOverResult, setGameOverResult] = useState<{
    winner: 'BLACK' | 'WHITE' | 'DRAW';
    reason: string;
    scoreDiff?: number;
  } | null>(null);

  // PVP / Team Mode
  const [teamAScore, setTeamAScore] = useState<number>(0);
  const [teamBScore, setTeamBScore] = useState<number>(0);
  const [teamMode, setTeamMode] = useState<'SOLO' | 'TEAM'>('TEAM');
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A');

  // AI Thinking state
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Puzzle Mode State
  const [puzzleFilter, setPuzzleFilter] = useState<PuzzleCategory | 'ALL'>('ALL');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [puzzleBoard, setPuzzleBoard] = useState<GoBoard>(() => parsePuzzleBoard(GO_PUZZLES[0].initialBoard));
  const [puzzleStatus, setPuzzleStatus] = useState<'UNSOLVED' | 'CORRECT' | 'WRONG'>('UNSOLVED');
  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState<Set<string>>(new Set());
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [puzzleLastMove, setPuzzleLastMove] = useState<Point | null>(null);
  const [puzzleScore, setPuzzleScore] = useState<number>(0);

  // Hover Ghost stone preview
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

  // Timer & Rules
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showRules, setShowRules] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Filtered puzzles
  const filteredPuzzles = GO_PUZZLES.filter(
    p => puzzleFilter === 'ALL' || p.category === puzzleFilter
  );
  const currentPuzzle: GoPuzzle = filteredPuzzles[currentPuzzleIndex] || GO_PUZZLES[0];

  // Timer loop
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Initialize Match when Mode, Size, or Handicap changes
  useEffect(() => {
    if (gameMode === 'PUZZLE') {
      loadPuzzle(currentPuzzleIndex);
    } else {
      resetMatch(boardSize, handicap);
    }
  }, [gameMode, boardSize, handicap]);

  // Handle AI turn
  useEffect(() => {
    if (
      gameMode === 'AI' &&
      currentTurn !== playerColor &&
      !gameOverResult &&
      !isAiThinking &&
      board.length > 0
    ) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getGoAIMove(board, currentTurn, aiDifficulty, koPoint);
        if (aiMove) {
          executeMove(aiMove.r, aiMove.c, currentTurn, true);
        } else {
          // AI passes if no beneficial move found
          handlePass(true);
        }
        setIsAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, playerColor, board, gameOverResult]);

  // Load a Puzzle
  const loadPuzzle = (index: number) => {
    const validIndex = Math.max(0, Math.min(filteredPuzzles.length - 1, index));
    const puzzle = filteredPuzzles[validIndex] || GO_PUZZLES[0];
    setCurrentPuzzleIndex(validIndex);
    setPuzzleBoard(parsePuzzleBoard(puzzle.initialBoard));
    setPuzzleStatus('UNSOLVED');
    setPuzzleLastMove(null);
    setShowHintModal(false);
    setShowSolutionModal(false);
  };

  // Change Puzzle Category Filter
  const handleCategoryChange = (cat: PuzzleCategory | 'ALL') => {
    setPuzzleFilter(cat);
    const newFiltered = GO_PUZZLES.filter(p => cat === 'ALL' || p.category === cat);
    if (newFiltered.length > 0) {
      setCurrentPuzzleIndex(0);
      setPuzzleBoard(parsePuzzleBoard(newFiltered[0].initialBoard));
      setPuzzleStatus('UNSOLVED');
      setPuzzleLastMove(null);
      setShowHintModal(false);
      setShowSolutionModal(false);
    }
  };

  // Reset Match
  const resetMatch = (size: BoardSize = boardSize, hcap: number = handicap) => {
    const newBoard = createEmptyBoard(size);

    // Apply Handicap stones if size is 9, 13, or 19
    if (hcap > 0 && size >= 9) {
      const starMap: Record<number, Point[]> = {
        9: [
          { r: 2, c: 6 },
          { r: 6, c: 2 },
          { r: 2, c: 2 },
          { r: 6, c: 6 }
        ],
        13: [
          { r: 3, c: 9 },
          { r: 9, c: 3 },
          { r: 3, c: 3 },
          { r: 9, c: 9 }
        ],
        19: [
          { r: 3, c: 15 },
          { r: 15, c: 3 },
          { r: 3, c: 3 },
          { r: 15, c: 15 }
        ]
      };
      const stars = starMap[size] || [];
      for (let i = 0; i < Math.min(hcap, stars.length); i++) {
        newBoard[stars[i].r][stars[i].c] = 'BLACK';
      }
    }

    setBoard(newBoard);
    setCurrentTurn(hcap > 0 ? 'WHITE' : 'BLACK'); // If handicap, white goes first
    setBlackCaptures(0);
    setWhiteCaptures(0);
    setKoPoint(null);
    setLastMove(null);
    setConsecutivePasses(0);
    setMoveCount(0);
    setMoveHistory([]);
    setShowTerritory(false);
    setTerritoryResult(null);
    setGameOverResult(null);
    setIsAiThinking(false);
    setElapsedTime(0);
    setActiveTeam('A');
  };

  // Execute a Move on Board
  const executeMove = (r: number, c: number, color: 'BLACK' | 'WHITE', isAi: boolean = false) => {
    if (gameOverResult) return;

    // Save history for undo
    setMoveHistory(prev => [
      ...prev,
      {
        board: board.map(row => [...row]),
        turn: currentTurn,
        blackCaptures,
        whiteCaptures,
        koPoint,
        lastMove
      }
    ]);

    const result = playGoMove(board, r, c, color, koPoint);

    if (!result.isLegal) {
      if (!isAi) {
        soundService.playWrong();
      }
      return;
    }

    // Play placement sound
    soundService.playTilePlace();

    // Update board and captures
    setBoard(result.nextBoard);
    setLastMove({ r, c });
    setKoPoint(result.koPoint);
    setConsecutivePasses(0);
    setMoveCount(m => m + 1);

    if (result.capturedStones > 0) {
      if (color === 'BLACK') {
        setBlackCaptures(prev => prev + result.capturedStones);
      } else {
        setWhiteCaptures(prev => prev + result.capturedStones);
      }
    }

    // Switch turn
    const nextTurn = color === 'BLACK' ? 'WHITE' : 'BLACK';
    setCurrentTurn(nextTurn);
    setActiveTeam(prev => (prev === 'A' ? 'B' : 'A'));

    // Automatically refresh territory estimation if open
    if (showTerritory) {
      const score = estimateTerritory(result.nextBoard, 6.5);
      setTerritoryResult(score);
    }
  };

  // Handle Board Cell Click in Match Mode
  const handleCellClick = (r: number, c: number) => {
    if (gameMode === 'AI' && currentTurn !== playerColor) return;
    if (isAiThinking || gameOverResult) return;
    executeMove(r, c, currentTurn, false);
  };

  // Handle Pass (虛手)
  const handlePass = (isAi: boolean = false) => {
    if (gameOverResult) return;

    const newPasses = consecutivePasses + 1;
    setConsecutivePasses(newPasses);

    if (newPasses >= 2) {
      // Game Over: Calculate Final Territory
      const finalScore = estimateTerritory(board, 6.5);
      setTerritoryResult(finalScore);
      setShowTerritory(true);

      const winner = finalScore.leadColor;
      setGameOverResult({
        winner,
        reason: '雙方連續虛手，對局結束進行地域結算！',
        scoreDiff: finalScore.leadMargin
      });
      soundService.playWin();

      if (winner === 'BLACK') {
        setTeamAScore(s => s + 1);
      } else if (winner === 'WHITE') {
        setTeamBScore(s => s + 1);
      }
    } else {
      const nextTurn = currentTurn === 'BLACK' ? 'WHITE' : 'BLACK';
      setCurrentTurn(nextTurn);
      setActiveTeam(prev => (prev === 'A' ? 'B' : 'A'));
    }
  };

  // Handle Undo (悔棋)
  const handleUndo = () => {
    if (moveHistory.length === 0 || isAiThinking) return;

    let targetHistoryIndex = moveHistory.length - 1;
    // In AI mode, undo 2 moves (AI move + player move)
    if (gameMode === 'AI' && moveHistory.length >= 2) {
      targetHistoryIndex = moveHistory.length - 2;
    }

    const prevState = moveHistory[targetHistoryIndex];
    setBoard(prevState.board);
    setCurrentTurn(prevState.turn);
    setBlackCaptures(prevState.blackCaptures);
    setWhiteCaptures(prevState.whiteCaptures);
    setKoPoint(prevState.koPoint);
    setLastMove(prevState.lastMove);
    setMoveHistory(moveHistory.slice(0, targetHistoryIndex));
    setGameOverResult(null);
    setShowTerritory(false);
  };

  // Handle Resign (認輸)
  const handleResign = () => {
    if (gameOverResult) return;
    const winner = currentTurn === 'BLACK' ? 'WHITE' : 'BLACK';
    soundService.playWin();
    setGameOverResult({
      winner,
      reason: `${currentTurn === 'BLACK' ? '黑方' : '白方'} 認輸，對手獲勝！`
    });

    if (winner === 'BLACK') {
      setTeamAScore(s => s + 1);
    } else {
      setTeamBScore(s => s + 1);
    }
  };

  // Handle Estimate Territory button
  const toggleTerritoryEstimation = () => {
    if (!showTerritory) {
      const score = estimateTerritory(board, 6.5);
      setTerritoryResult(score);
      setShowTerritory(true);
    } else {
      setShowTerritory(false);
    }
  };

  // --- PUZZLE INTERACTION LOGIC ---
  const handlePuzzleCellClick = (r: number, c: number) => {
    if (puzzleStatus === 'CORRECT' || !currentPuzzle) return;

    const solution = currentPuzzle.solutionMoves[0];
    if (!solution) return;

    const isCorrectMove = solution.playerMove.r === r && solution.playerMove.c === c;

    if (isCorrectMove) {
      // Execute Player Move on Puzzle Board
      const moveRes = playGoMove(puzzleBoard, r, c, currentPuzzle.playerColor);
      soundService.playTilePlace();
      soundService.playWin();
      setPuzzleBoard(moveRes.nextBoard);
      setPuzzleLastMove({ r, c });

      // Solved Puzzle!
      setPuzzleStatus('CORRECT');
      setSolvedPuzzleIds(ids => new Set(ids).add(currentPuzzle.id));
      setPuzzleScore(s => s + 100);

      if (teamMode === 'TEAM') {
        if (activeTeam === 'A') setTeamAScore(s => s + 1);
        else setTeamBScore(s => s + 1);
      }
    } else {
      // Wrong Move
      soundService.playWrong();
      setPuzzleStatus('WRONG');
    }
  };

  // Get Star Points based on board size
  const getStarPoints = (size: number): Point[] => {
    if (size === 9) {
      return [
        { r: 2, c: 2 },
        { r: 2, c: 6 },
        { r: 4, c: 4 },
        { r: 6, c: 2 },
        { r: 6, c: 6 }
      ];
    }
    if (size === 13) {
      return [
        { r: 3, c: 3 },
        { r: 3, c: 9 },
        { r: 6, c: 6 },
        { r: 9, c: 3 },
        { r: 9, c: 9 }
      ];
    }
    if (size === 19) {
      return [
        { r: 3, c: 3 },
        { r: 3, c: 9 },
        { r: 3, c: 15 },
        { r: 9, c: 3 },
        { r: 9, c: 9 },
        { r: 9, c: 15 },
        { r: 15, c: 3 },
        { r: 15, c: 9 },
        { r: 15, c: 15 }
      ];
    }
    return [];
  };

  // Atari warning
  const blackAtariGroups = findGroupsInAtari(board, 'BLACK');
  const whiteAtariGroups = findGroupsInAtari(board, 'WHITE');

  // Go Rules for RulesModal
  const goRules = [
    '【基本規則】：黑先白後，雙方輪流在棋盤交叉點落子，落子後不可移動。',
    '【氣與提子】：棋子相連的直線空格稱為「氣」。當一方棋子的氣全部被封死（0口氣）時，該棋子將被「提吃」移除。',
    '【禁止自殺手】：不能下在沒有氣且無法提吃對方棋子的點。',
    '【打劫規則】：雙方不能在下一手立即回提形成同形循環（打劫禁著點），必須先在其他地方尋劫。',
    '【做活與真眼】：棋子內部若擁有兩隻獨立的「真眼」，對手永遠無法將其完全填死，即為永久不敗的「活棋」。',
    '【終局與計分】：當雙方均無有利落子處連續「虛手」時終局，計算雙方圍得的地域（地盤）與活子數，多者獲勝！'
  ];

  return (
    <div
      id="weiqi-game-root"
      className="flex flex-col h-[100dvh] w-full bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 text-amber-50 select-none p-1.5 sm:p-3 overflow-hidden font-sans"
    >
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="圍棋 規則與死活要點說明" rules={goRules} />

      {/* TOP NAV BAR */}
      <header className="flex items-center justify-between gap-1.5 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full shrink-0 mb-1">
        <button
          id="weiqi-back-btn"
          onClick={onBack}
          className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-xl font-bold text-xs sm:text-sm shadow transition active:scale-95 shrink-0"
        >
          <ArrowLeft size={16} />
          <span>返回</span>
        </button>

        {/* Title & Mode Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="px-2.5 py-0.5 bg-amber-500 text-stone-950 rounded-full text-[10px] sm:text-xs font-black shadow">
            圍棋
          </span>
          <div className="flex items-center bg-stone-900/90 border border-amber-700/50 p-0.5 rounded-xl shadow-inner">
            <button
              id="mode-ai-btn"
              onClick={() => setGameMode('AI')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                gameMode === 'AI'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-amber-300 hover:text-amber-100'
              }`}
            >
              <Bot size={14} />
              <span className="hidden sm:inline">人機對決</span>
            </button>
            <button
              id="mode-pvp-btn"
              onClick={() => setGameMode('PVP')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                gameMode === 'PVP'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-amber-300 hover:text-amber-100'
              }`}
            >
              <Users size={14} />
              <span className="hidden sm:inline">AB組對決</span>
            </button>
            <button
              id="mode-puzzle-btn"
              onClick={() => setGameMode('PUZZLE')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                gameMode === 'PUZZLE'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-amber-300 hover:text-amber-100'
              }`}
            >
              <Brain size={14} />
              <span>死活出題</span>
            </button>
          </div>
        </div>

        {/* Right Tools: Timer, Rules, Restart */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-stone-900/80 border border-amber-700/50 rounded-xl text-amber-300 text-xs font-bold">
            <Clock size={13} className="text-amber-400" />
            <span>{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
          </div>

          <button
            id="weiqi-rules-btn"
            onClick={() => setShowRules(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-xl font-bold text-xs transition shadow"
            title="規則說明"
          >
            <HelpCircle size={16} />
          </button>

          <button
            id="weiqi-restart-btn"
            onClick={() => {
              if (gameMode === 'PUZZLE') loadPuzzle(currentPuzzleIndex);
              else resetMatch(boardSize, handicap);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-xl font-bold text-xs transition shadow"
            title="重新開始"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full flex-1 flex flex-col my-0.5 sm:my-1 bg-stone-950/85 border border-amber-800/40 rounded-2xl p-2 sm:p-3 shadow-2xl backdrop-blur-md overflow-hidden min-h-0">
        
        {/* ========================================================================= */}
        {/* MATCH MODE (AI / PVP) */}
        {/* ========================================================================= */}
        {gameMode !== 'PUZZLE' && (
          <div className="flex-1 flex flex-col justify-between h-full min-h-0">
            {/* Options Strip: Board Size, AI Diff, Handicap */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-amber-900/60 shrink-0 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-bold hidden sm:inline">棋盤規格:</span>
                <div className="flex items-center bg-stone-900 border border-amber-800/60 rounded-lg p-0.5">
                  {([9, 13, 19] as BoardSize[]).map(size => (
                    <button
                      key={size}
                      onClick={() => setBoardSize(size)}
                      className={`px-2 py-0.5 rounded text-xs font-black transition ${
                        boardSize === size
                          ? 'bg-amber-500 text-stone-950 shadow'
                          : 'text-amber-300 hover:bg-stone-800'
                      }`}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>

                {gameMode === 'AI' && (
                  <>
                    <span className="text-amber-300 font-bold ml-1 hidden sm:inline">難度:</span>
                    <div className="flex items-center bg-stone-900 border border-amber-800/60 rounded-lg p-0.5">
                      {(['EASY', 'NORMAL', 'HARD'] as const).map(diff => (
                        <button
                          key={diff}
                          onClick={() => setAiDifficulty(diff)}
                          className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                            aiDifficulty === diff
                              ? 'bg-amber-500 text-stone-950 shadow'
                              : 'text-amber-300 hover:bg-stone-800'
                          }`}
                        >
                          {diff === 'EASY' ? '入門' : diff === 'NORMAL' ? '普通' : '專家'}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Status / Turn info */}
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                {gameMode === 'PVP' ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-lg border font-black ${
                        currentTurn === 'BLACK'
                          ? 'bg-stone-900 border-amber-400 text-amber-300 ring-2 ring-amber-400/50'
                          : 'bg-stone-900/60 border-stone-700 text-stone-400'
                      }`}
                    >
                      A組(黑): {teamAScore}勝
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg border font-black ${
                        currentTurn === 'WHITE'
                          ? 'bg-amber-100 border-amber-500 text-stone-950 ring-2 ring-amber-400/50'
                          : 'bg-stone-900/60 border-stone-700 text-stone-400'
                      }`}
                    >
                      B組(白): {teamBScore}勝
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2.5 py-0.5 bg-stone-900 border border-amber-700/60 rounded-xl">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-white ring-1 ring-amber-400" />
                      <span className="text-amber-200">提白: {blackCaptures}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 bg-stone-900 border border-amber-700/60 rounded-xl">
                      <span className="w-2.5 h-2.5 rounded-full bg-white border border-stone-400" />
                      <span className="text-amber-200">提黑: {whiteCaptures}</span>
                    </div>
                    {isAiThinking && (
                      <span className="text-amber-400 text-xs flex items-center gap-1 animate-pulse">
                        <Bot size={14} /> AI思考中...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Active Turn Indicator & Atari warning */}
            <div className="flex items-center justify-between gap-2 py-1 px-2.5 bg-stone-900/70 rounded-xl border border-amber-900/40 text-xs shrink-0 my-0.5">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-bold">當前輪到:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black text-xs ${
                    currentTurn === 'BLACK'
                      ? 'bg-stone-900 text-amber-200 border border-amber-400'
                      : 'bg-amber-100 text-stone-950 border border-amber-600'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      currentTurn === 'BLACK' ? 'bg-stone-950 border border-white' : 'bg-white border border-stone-800'
                    }`}
                  />
                  {currentTurn === 'BLACK' ? '黑方 (先手)' : '白方 (後手)'}
                </span>
                <span className="text-stone-400 text-[11px]">第 {moveCount + 1} 手</span>
              </div>

              {/* Atari Warning */}
              <div className="flex items-center gap-1">
                {(blackAtariGroups.length > 0 || whiteAtariGroups.length > 0) && (
                  <span className="px-2 py-0.5 bg-rose-950 border border-rose-500 text-rose-300 font-bold rounded-lg text-[11px] animate-pulse flex items-center gap-1">
                    <Shield size={12} />
                    叫吃警告！
                  </span>
                )}
                {koPoint && (
                  <span className="px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 font-bold rounded-lg text-[11px]">
                    打劫中
                  </span>
                )}
              </div>
            </div>

            {/* TERRITORY & POSITION EVALUATION HUD */}
            <AnimatePresence>
              {showTerritory && territoryResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-stone-900/95 border border-amber-500/80 rounded-xl p-2 sm:p-2.5 shadow-xl shrink-0 overflow-hidden mb-1"
                >
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-amber-900/60 text-xs">
                    <div className="flex items-center gap-1.5 font-black text-amber-300">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>即時形勢判斷與地盤分析</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full font-black text-[11px] bg-amber-500 text-stone-950">
                        {territoryResult.leadColor === 'BLACK'
                          ? `🏆 黑方領先約 ${territoryResult.leadMargin} 目`
                          : territoryResult.leadColor === 'WHITE'
                          ? `🏆 白方領先約 ${territoryResult.leadMargin} 目`
                          : '⚖️ 雙方盤面勢均力敵'}
                      </span>
                      <button
                        onClick={() => setShowTerritory(false)}
                        className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] font-bold transition"
                      >
                        關閉
                      </button>
                    </div>
                  </div>

                  {/* Win Rate Ratio Bar */}
                  <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-stone-300">黑方勝率 {territoryResult.blackWinRate}%</span>
                      <span className="text-amber-200">白方勝率 {100 - territoryResult.blackWinRate}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-amber-100 flex overflow-hidden border border-stone-800">
                      <div
                        className="h-full bg-gradient-to-r from-stone-900 to-stone-700 transition-all duration-500"
                        style={{ width: `${territoryResult.blackWinRate}%` }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-amber-200 to-white transition-all duration-500"
                        style={{ width: `${100 - territoryResult.blackWinRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Territory Details Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-1.5 text-[11px]">
                    <div className="bg-stone-950/80 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-white" />
                        <span className="font-bold text-stone-200">黑棋總計:</span>
                      </div>
                      <span className="font-black text-amber-400 text-xs">
                        {territoryResult.blackTotal} 目
                        <span className="text-[10px] text-stone-400 font-normal ml-1">
                          (子 {territoryResult.blackStones} + 空 {territoryResult.blackTerritory})
                        </span>
                      </span>
                    </div>

                    <div className="bg-stone-950/80 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white border border-stone-600" />
                        <span className="font-bold text-stone-200">白棋總計:</span>
                      </div>
                      <span className="font-black text-amber-400 text-xs">
                        {territoryResult.whiteTotal.toFixed(1)} 目
                        <span className="text-[10px] text-stone-400 font-normal ml-1">
                          (子 {territoryResult.whiteStones} + 空 {territoryResult.whiteTerritory} + 貼 {territoryResult.komi})
                        </span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* THE GO BOARD (WITH 4-SIDED COORDINATES: A, B, C... / 9, 8, 7...) */}
            <div className="flex-1 flex flex-col items-center justify-center p-0.5 min-h-0 w-full overflow-hidden">
              <div
                className="relative flex flex-col items-center justify-center w-full"
                style={{
                  maxWidth: 'min(92vw, min(calc(100dvh - 240px), 580px))',
                  maxHeight: 'min(92vw, min(calc(100dvh - 240px), 580px))',
                  aspectRatio: '1 / 1',
                }}
              >
                {/* Coordinates Top: A, B, C, D, E, F, G, H, J... */}
                <div className="w-full flex pl-3 sm:pl-4 pr-3 sm:pr-4 h-3.5 sm:h-4 shrink-0 items-center">
                  {Array.from({ length: boardSize }).map((_, c) => (
                    <div key={c} className="flex-1 text-center text-[9px] sm:text-[11px] font-black text-amber-300/90 leading-none">
                      {GO_COLUMN_LABELS[c]}
                    </div>
                  ))}
                </div>

                {/* Left Coordinates + Board Square + Right Coordinates */}
                <div className="w-full flex-1 flex items-stretch min-h-0 min-w-0">
                  {/* Left Coordinates: 9, 8, 7... 1 */}
                  <div className="flex flex-col justify-between py-1 w-3 sm:w-4 shrink-0">
                    {Array.from({ length: boardSize }).map((_, r) => (
                      <div key={r} className="flex-1 flex items-center justify-center text-[9px] sm:text-[11px] font-black text-amber-300/90 leading-none">
                        {boardSize - r}
                      </div>
                    ))}
                  </div>

                  {/* Main Wood Board Square */}
                  <div
                    className="relative flex-1 aspect-square bg-gradient-to-br from-[#e8b571] via-[#dca358] to-[#c98e40] border-2 sm:border-4 border-[#522907] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.7)',
                    }}
                  >
                    {/* SVG Grid Lines with Resolution-Independent 0..1000 Coordinate System */}
                    <svg
                      viewBox="0 0 1000 1000"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ zIndex: 0 }}
                    >
                      {/* Border grid rectangle */}
                      <rect
                        x={1000 / (2 * boardSize)}
                        y={1000 / (2 * boardSize)}
                        width={1000 - 1000 / boardSize}
                        height={1000 - 1000 / boardSize}
                        fill="none"
                        stroke="#4a2505"
                        strokeWidth={boardSize === 19 ? 3 : 4.5}
                      />
                      {/* Interior Grid Lines */}
                      {Array.from({ length: boardSize }).map((_, idx) => {
                        const step = 1000 / boardSize;
                        const pos = step * 0.5 + idx * step;
                        const start = step * 0.5;
                        const end = 1000 - step * 0.5;
                        return (
                          <g key={idx}>
                            {/* Horizontal line */}
                            <line
                              x1={start}
                              y1={pos}
                              x2={end}
                              y2={pos}
                              stroke="#4a2505"
                              strokeWidth={boardSize === 19 ? 1.5 : 2.5}
                            />
                            {/* Vertical line */}
                            <line
                              x1={pos}
                              y1={start}
                              x2={pos}
                              y2={end}
                              stroke="#4a2505"
                              strokeWidth={boardSize === 19 ? 1.5 : 2.5}
                            />
                          </g>
                        );
                      })}

                      {/* Star Points (星位) */}
                      {getStarPoints(boardSize).map((star, sIdx) => {
                        const step = 1000 / boardSize;
                        const cx = step * 0.5 + star.c * step;
                        const cy = step * 0.5 + star.r * step;
                        return (
                          <circle
                            key={sIdx}
                            cx={cx}
                            cy={cy}
                            r={boardSize === 19 ? 5.5 : boardSize === 13 ? 7 : 8.5}
                            fill="#361701"
                          />
                        );
                      })}
                    </svg>

                    {/* Intersection Interactive Cell Buttons */}
                    <div
                      className="absolute inset-0 grid w-full h-full"
                      style={{
                        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                        gridTemplateRows: `repeat(${boardSize}, 1fr)`,
                        zIndex: 1,
                      }}
                    >
                      {board.map((row, r) =>
                        row.map((cell, c) => {
                          const isLast = lastMove && lastMove.r === r && lastMove.c === c;
                          const isHovered = hoveredPoint && hoveredPoint.r === r && hoveredPoint.c === c && cell === 'EMPTY';
                          const isKo = koPoint && koPoint.r === r && koPoint.c === c;
                          const isAtari =
                            (cell === 'BLACK' && blackAtariGroups.some(g => g.stones.some(st => st.r === r && st.c === c))) ||
                            (cell === 'WHITE' && whiteAtariGroups.some(g => g.stones.some(st => st.r === r && st.c === c)));

                          const territoryOwner =
                            showTerritory && territoryResult ? territoryResult.territoryMap[r]?.[c] : null;

                          return (
                            <button
                              key={`${r}-${c}`}
                              id={`go-cell-${r}-${c}`}
                              onClick={() => handleCellClick(r, c)}
                              onMouseEnter={() => setHoveredPoint({ r, c })}
                              onMouseLeave={() => setHoveredPoint(null)}
                              className="relative flex items-center justify-center w-full h-full focus:outline-none cursor-pointer select-none active:scale-95 transition-transform"
                              style={{ minWidth: 0, minHeight: 0 }}
                              title={`${GO_COLUMN_LABELS[c]}${boardSize - r}`}
                            >
                              {/* Stone Render */}
                              {cell === 'BLACK' && (
                                <motion.div
                                  initial={{ scale: 0.6, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="w-[88%] h-[88%] rounded-full bg-gradient-to-br from-stone-700 via-stone-900 to-black shadow-md border border-stone-800 flex items-center justify-center relative"
                                  style={{
                                    boxShadow: '2px 3px 6px rgba(0,0,0,0.7), inset -2px -2px 4px rgba(0,0,0,0.8)'
                                  }}
                                >
                                  {/* Top Shine */}
                                  <div className="absolute top-1 left-1.5 w-1/3 h-1/3 bg-white/20 rounded-full blur-[0.5px]" />
                                  {isLast && (
                                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                                  )}
                                  {isAtari && !isLast && (
                                    <span className="absolute -inset-0.5 rounded-full ring-2 ring-rose-500 animate-pulse" />
                                  )}
                                </motion.div>
                              )}

                              {cell === 'WHITE' && (
                                <motion.div
                                  initial={{ scale: 0.6, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="w-[88%] h-[88%] rounded-full bg-gradient-to-br from-white via-amber-50 to-stone-300 shadow-md border border-stone-300 flex items-center justify-center relative"
                                  style={{
                                    boxShadow: '2px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.3)'
                                  }}
                                >
                                  {/* Top Shine */}
                                  <div className="absolute top-1 left-1.5 w-1/3 h-1/3 bg-white rounded-full" />
                                  {isLast && (
                                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600 ring-2 ring-stone-900 animate-pulse" />
                                  )}
                                  {isAtari && !isLast && (
                                    <span className="absolute -inset-0.5 rounded-full ring-2 ring-rose-500 animate-pulse" />
                                  )}
                                </motion.div>
                              )}

                              {/* Hover Ghost Stone */}
                              {isHovered && !isAiThinking && !gameOverResult && (
                                <div
                                  className={`w-[80%] h-[80%] rounded-full opacity-45 border-2 border-dashed pointer-events-none ${
                                    currentTurn === 'BLACK' ? 'bg-black border-white' : 'bg-white border-black'
                                  }`}
                                />
                              )}

                              {/* Ko Forbidden Marker */}
                              {isKo && cell === 'EMPTY' && (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-dashed border-rose-500 rounded bg-rose-500/25 flex items-center justify-center pointer-events-none">
                                  <span className="text-[8px] font-black text-rose-300">劫</span>
                                </div>
                              )}

                              {/* Territory Overlay Marker */}
                              {showTerritory && territoryOwner && territoryOwner !== 'STONE' && (
                                <div
                                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm flex items-center justify-center pointer-events-none shadow ${
                                    territoryOwner === 'BLACK'
                                      ? 'bg-stone-950/90 border border-amber-400 text-[8px] font-black text-amber-300'
                                      : territoryOwner === 'WHITE'
                                      ? 'bg-white/95 border border-stone-800 text-[8px] font-black text-stone-950'
                                      : 'bg-amber-600/40 rounded-full w-2 h-2'
                                  }`}
                                >
                                  {territoryOwner === 'BLACK' ? '黑' : territoryOwner === 'WHITE' ? '白' : ''}
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Coordinates: 9, 8, 7... 1 */}
                  <div className="flex flex-col justify-between py-1 w-3 sm:w-4 shrink-0">
                    {Array.from({ length: boardSize }).map((_, r) => (
                      <div key={r} className="flex-1 flex items-center justify-center text-[9px] sm:text-[11px] font-black text-amber-300/70 leading-none">
                        {boardSize - r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coordinates Bottom: A, B, C, D, E, F, G, H, J... */}
                <div className="w-full flex pl-3 sm:pl-4 pr-3 sm:pr-4 h-3.5 sm:h-4 shrink-0 items-center mt-0.5">
                  {Array.from({ length: boardSize }).map((_, c) => (
                    <div key={c} className="flex-1 text-center text-[9px] sm:text-[11px] font-black text-amber-300/90 leading-none">
                      {GO_COLUMN_LABELS[c]}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-amber-900/60 shrink-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  id="weiqi-undo-btn"
                  onClick={handleUndo}
                  disabled={moveHistory.length === 0 || isAiThinking || !!gameOverResult}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-stone-900 text-amber-200 border border-amber-700/50 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1 transition shadow"
                >
                  <Undo2 size={14} />
                  <span>悔棋</span>
                </button>

                <button
                  id="weiqi-pass-btn"
                  onClick={() => handlePass(false)}
                  disabled={isAiThinking || !!gameOverResult}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-amber-900/80 hover:bg-amber-800 disabled:opacity-40 text-amber-200 border border-amber-700/60 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1 transition shadow"
                >
                  <HandMetal size={14} />
                  <span>虛手 (停一手)</span>
                </button>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  id="weiqi-territory-btn"
                  onClick={toggleTerritoryEstimation}
                  className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 border rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1 transition shadow ${
                    showTerritory
                      ? 'bg-amber-500 border-amber-400 text-stone-950'
                      : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-amber-700/50'
                  }`}
                >
                  <Eye size={14} />
                  <span>形勢判斷</span>
                </button>

                <button
                  id="weiqi-resign-btn"
                  onClick={handleResign}
                  disabled={!!gameOverResult || moveCount === 0}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-rose-950/80 hover:bg-rose-900 disabled:opacity-40 text-rose-200 border border-rose-700/60 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1 transition shadow"
                >
                  <Flag size={14} />
                  <span>認輸</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PUZZLE MODE (死活與手筋出題) */}
        {/* ========================================================================= */}
        {gameMode === 'PUZZLE' && currentPuzzle && (
          <div className="flex-1 flex flex-col justify-between h-full min-h-0">
            {/* Top Puzzle Controls Strip: Filter Tabs & Dropdown Selector */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-amber-900/60 shrink-0 text-xs">
              {/* Category Filter Tabs */}
              <div className="flex items-center bg-stone-900 border border-amber-800/60 rounded-xl p-0.5">
                {(
                  [
                    { id: 'ALL', label: '全部' },
                    { id: 'LIFE_DEATH', label: '死活' },
                    { id: 'CAPTURE', label: '吃子' },
                    { id: 'TACTICS', label: '戰術' }
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleCategoryChange(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                      puzzleFilter === tab.id
                        ? 'bg-amber-500 text-stone-950 shadow'
                        : 'text-amber-300 hover:bg-stone-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Direct Puzzle Selector Dropdown & Nav Buttons */}
              <div className="flex items-center gap-1.5">
                <select
                  id="puzzle-selector-dropdown"
                  value={currentPuzzle.id}
                  onChange={(e) => {
                    const idx = filteredPuzzles.findIndex(p => p.id === e.target.value);
                    if (idx !== -1) {
                      loadPuzzle(idx);
                    }
                  }}
                  className="bg-stone-900 border border-amber-700/70 text-amber-200 text-xs font-bold rounded-xl px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 max-w-[170px] sm:max-w-[220px] truncate"
                >
                  {filteredPuzzles.map((p, idx) => (
                    <option key={p.id} value={p.id} className="bg-stone-900 text-amber-100 py-1">
                      {idx + 1}. {p.title} {solvedPuzzleIds.has(p.id) ? '✓' : ''}
                    </option>
                  ))}
                </select>

                <div className="flex items-center bg-stone-900 border border-amber-800/60 rounded-lg p-0.5">
                  <button
                    onClick={() => loadPuzzle(Math.max(0, currentPuzzleIndex - 1))}
                    disabled={currentPuzzleIndex === 0}
                    className="p-1 hover:bg-stone-800 disabled:opacity-30 rounded text-amber-200"
                    title="上一題"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-1.5 text-[11px] font-black text-amber-400">
                    {currentPuzzleIndex + 1}/{filteredPuzzles.length}
                  </span>
                  <button
                    onClick={() => loadPuzzle(Math.min(filteredPuzzles.length - 1, currentPuzzleIndex + 1))}
                    disabled={currentPuzzleIndex === filteredPuzzles.length - 1}
                    className="p-1 hover:bg-stone-800 disabled:opacity-30 rounded text-amber-200"
                    title="下一題"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Responsive Container: On mobile landscape, splits board & side panel; on desktop/portrait, stacks cleanly */}
            <div className="flex-1 flex flex-col landscape:max-h-[560px]:flex-row max-h-[520px]:flex-row gap-2 min-h-0 w-full overflow-hidden items-center justify-center my-auto">
              
              {/* THE PUZZLE GO BOARD (WITH 4-SIDED COORDINATES: A, B, C... / 9, 8, 7...) */}
              <div className="flex-1 flex flex-col items-center justify-center p-0.5 min-h-0 min-w-0 w-full overflow-hidden">
                <div
                  className="relative flex flex-col items-center justify-center w-full"
                  style={{
                    maxWidth: 'min(92vw, min(calc(100dvh - 240px), 560px))',
                    maxHeight: 'min(92vw, min(calc(100dvh - 240px), 560px))',
                    aspectRatio: '1 / 1',
                  }}
                >
                  {/* Coordinates Top: A, B, C, D, E, F, G, H, J */}
                  <div className="w-full flex pl-3 sm:pl-4 pr-3 sm:pr-4 h-3.5 sm:h-4 shrink-0 items-center">
                    {Array.from({ length: currentPuzzle.boardSize }).map((_, c) => (
                      <div key={c} className="flex-1 text-center text-[9px] sm:text-[11px] font-black text-amber-300/90 leading-none">
                        {GO_COLUMN_LABELS[c]}
                      </div>
                    ))}
                  </div>

                  {/* Left Coordinates + Board Square + Right Coordinates */}
                  <div className="w-full flex-1 flex items-stretch min-h-0 min-w-0">
                    {/* Left Coordinates: 9, 8, 7... 1 */}
                    <div className="flex flex-col justify-between py-1 w-3 sm:w-4 shrink-0">
                      {Array.from({ length: currentPuzzle.boardSize }).map((_, r) => (
                        <div key={r} className="flex-1 flex items-center justify-center text-[9px] sm:text-[11px] font-black text-amber-300/90 leading-none">
                          {currentPuzzle.boardSize - r}
                        </div>
                      ))}
                    </div>

                    {/* Main Wood Board Square */}
                    <div
                      className="relative flex-1 aspect-square bg-gradient-to-br from-[#e8b571] via-[#dca358] to-[#c98e40] border-2 sm:border-4 border-[#522907] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
                      style={{
                        boxShadow: 'inset 0 0 15px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.7)',
                      }}
                    >
                      {/* SVG Grid Lines */}
                      <svg
                        viewBox="0 0 1000 1000"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ zIndex: 0 }}
                      >
                        {/* Border grid rectangle */}
                        <rect
                          x={1000 / (2 * currentPuzzle.boardSize)}
                          y={1000 / (2 * currentPuzzle.boardSize)}
                          width={1000 - 1000 / currentPuzzle.boardSize}
                          height={1000 - 1000 / currentPuzzle.boardSize}
                          fill="none"
                          stroke="#4a2505"
                          strokeWidth={currentPuzzle.boardSize >= 13 ? 3 : 4.5}
                        />
                        {/* Interior Grid Lines */}
                        {Array.from({ length: currentPuzzle.boardSize }).map((_, idx) => {
                          const step = 1000 / currentPuzzle.boardSize;
                          const pos = step * 0.5 + idx * step;
                          const start = step * 0.5;
                          const end = 1000 - step * 0.5;
                          return (
                            <g key={idx}>
                              <line
                                x1={start}
                                y1={pos}
                                x2={end}
                                y2={pos}
                                stroke="#4a2505"
                                strokeWidth={currentPuzzle.boardSize >= 13 ? 1.8 : 2.8}
                              />
                              <line
                                x1={pos}
                                y1={start}
                                x2={pos}
                                y2={end}
                                stroke="#4a2505"
                                strokeWidth={currentPuzzle.boardSize >= 13 ? 1.8 : 2.8}
                              />
                            </g>
                          );
                        })}

                        {/* Star Points */}
                        {getStarPoints(currentPuzzle.boardSize).map((star, sIdx) => {
                          const step = 1000 / currentPuzzle.boardSize;
                          const cx = step * 0.5 + star.c * step;
                          const cy = step * 0.5 + star.r * step;
                          return (
                            <circle
                              key={sIdx}
                              cx={cx}
                              cy={cy}
                              r={currentPuzzle.boardSize >= 13 ? 6 : 8.5}
                              fill="#361701"
                            />
                          );
                        })}
                      </svg>

                      {/* Cells */}
                      <div
                        className="absolute inset-0 grid w-full h-full"
                        style={{
                          gridTemplateColumns: `repeat(${currentPuzzle.boardSize}, 1fr)`,
                          gridTemplateRows: `repeat(${currentPuzzle.boardSize}, 1fr)`,
                          zIndex: 1,
                        }}
                      >
                        {puzzleBoard.map((row, r) =>
                          row.map((cell, c) => {
                            const isLast = puzzleLastMove && puzzleLastMove.r === r && puzzleLastMove.c === c;
                            const isHovered = hoveredPoint && hoveredPoint.r === r && hoveredPoint.c === c && cell === 'EMPTY';

                            return (
                              <button
                                key={`${r}-${c}`}
                                id={`puzzle-cell-${r}-${c}`}
                                onClick={() => handlePuzzleCellClick(r, c)}
                                onMouseEnter={() => setHoveredPoint({ r, c })}
                                onMouseLeave={() => setHoveredPoint(null)}
                                className="relative flex items-center justify-center w-full h-full focus:outline-none cursor-pointer select-none active:scale-95 transition-transform"
                                style={{ minWidth: 0, minHeight: 0 }}
                                title={`${GO_COLUMN_LABELS[c]}${currentPuzzle.boardSize - r}`}
                              >
                                {cell === 'BLACK' && (
                                  <motion.div
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-[88%] h-[88%] rounded-full bg-gradient-to-br from-stone-700 via-stone-900 to-black shadow-md border border-stone-800 flex items-center justify-center relative"
                                    style={{
                                      boxShadow: '2px 3px 6px rgba(0,0,0,0.7), inset -2px -2px 4px rgba(0,0,0,0.8)'
                                    }}
                                  >
                                    <div className="absolute top-1 left-1.5 w-1/3 h-1/3 bg-white/20 rounded-full blur-[0.5px]" />
                                    {isLast && (
                                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                                    )}
                                  </motion.div>
                                )}

                                {cell === 'WHITE' && (
                                  <motion.div
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-[88%] h-[88%] rounded-full bg-gradient-to-br from-white via-amber-50 to-stone-300 shadow-md border border-stone-300 flex items-center justify-center relative"
                                    style={{
                                      boxShadow: '2px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.3)'
                                    }}
                                  >
                                    <div className="absolute top-1 left-1.5 w-1/3 h-1/3 bg-white rounded-full" />
                                    {isLast && (
                                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600 ring-2 ring-stone-900 animate-pulse" />
                                    )}
                                  </motion.div>
                                )}

                                {isHovered && puzzleStatus === 'UNSOLVED' && (
                                  <div className="w-[80%] h-[80%] rounded-full opacity-45 border-2 border-dashed border-white bg-black/40 pointer-events-none" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Right Coordinates: 9, 8, 7... 1 */}
                    <div className="flex flex-col justify-between py-1 w-3 sm:w-4 shrink-0">
                      {Array.from({ length: currentPuzzle.boardSize }).map((_, r) => (
                        <div key={r} className="flex-1 flex items-center justify-center text-[9px] sm:text-[11px] font-black text-amber-300/70 leading-none">
                          {currentPuzzle.boardSize - r}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coordinates Bottom: A, B, C, D, E, F, G, H, J */}
                  <div className="w-full flex pl-3 sm:pl-4 pr-3 sm:pr-4 h-3.5 sm:h-4 shrink-0 items-center mt-0.5">
                    {Array.from({ length: currentPuzzle.boardSize }).map((_, c) => (
                      <div key={c} className="flex-1 text-center text-[9px] sm:text-[11px] font-black text-amber-300/90 leading-none">
                        {GO_COLUMN_LABELS[c]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Info in Mobile Landscape */}
              <div className="hidden landscape:max-h-[560px]:flex max-h-[520px]:flex flex-col justify-between w-72 h-full py-1 text-xs shrink-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-800 border border-amber-600 text-amber-300 rounded-lg text-xs font-black">
                      {currentPuzzle.badge}
                    </span>
                    <h3 className="font-bold text-amber-100">{currentPuzzle.title}</h3>
                  </div>
                  <p className="text-stone-300 text-xs bg-stone-900/80 p-2 rounded-xl border border-amber-900/60 leading-relaxed">
                    {currentPuzzle.prompt}
                  </p>
                </div>

                <div className="space-y-2">
                  {puzzleStatus === 'CORRECT' && (
                    <div className="p-2.5 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-200">
                      <div className="font-black flex items-center gap-1 text-emerald-400 mb-1">
                        <CheckCircle2 size={15} /> 答對了！
                      </div>
                      <p className="text-[11px] leading-tight mb-2">{currentPuzzle.successMessage}</p>
                      <button
                        onClick={() => loadPuzzle(Math.min(filteredPuzzles.length - 1, currentPuzzleIndex + 1))}
                        className="w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-lg text-xs flex items-center justify-center gap-1 shadow"
                      >
                        <span>下一題</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  {puzzleStatus === 'WRONG' && (
                    <div className="p-2 bg-rose-950 border border-rose-500 rounded-xl text-rose-200 flex items-center justify-between">
                      <span className="font-bold text-[11px]">落子不對，再試一次！</span>
                      <button
                        onClick={() => loadPuzzle(currentPuzzleIndex)}
                        className="px-2 py-1 bg-rose-600 text-white font-bold rounded text-xs"
                      >
                        重試
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowHintModal(true)}
                      className="flex-1 py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-xl font-bold flex items-center justify-center gap-1"
                    >
                      <Lightbulb size={13} />
                      <span>提示</span>
                    </button>
                    <button
                      onClick={() => setShowSolutionModal(true)}
                      className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-700/60 rounded-xl font-bold flex items-center justify-center gap-1"
                    >
                      <Eye size={13} />
                      <span>解說</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Feedback Banner & Puzzle Controls (Desktop & Portrait View) */}
            <div className="shrink-0 min-h-[46px] flex flex-col justify-center landscape:max-h-[560px]:hidden max-h-[520px]:hidden">
              <AnimatePresence mode="wait">
                {puzzleStatus === 'CORRECT' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full p-2 sm:p-2.5 bg-emerald-950/95 border-2 border-emerald-400 rounded-xl flex items-center justify-between gap-2 shadow-lg text-xs sm:text-sm text-emerald-100"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-black text-emerald-300 mr-1.5">🎉 答對了！</span>
                        <span className="font-bold">{currentPuzzle.successMessage}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => loadPuzzle(Math.min(filteredPuzzles.length - 1, currentPuzzleIndex + 1))}
                      className="shrink-0 px-3 sm:px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-lg text-xs sm:text-sm shadow transition active:scale-95 flex items-center gap-1"
                    >
                      <span>下一題</span>
                      <ChevronRight size={15} />
                    </button>
                  </motion.div>
                ) : puzzleStatus === 'WRONG' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full p-2 bg-rose-950/95 border border-rose-500 rounded-xl flex items-center justify-between gap-2 shadow text-xs sm:text-sm text-rose-100"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      <span className="font-bold">落子不對喔！白棋已做活或逃脫，請再試一次！</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowHintModal(true)}
                        className="px-2.5 py-1 bg-amber-900 hover:bg-amber-800 text-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Lightbulb size={13} />
                        <span>提示</span>
                      </button>
                      <button
                        onClick={() => loadPuzzle(currentPuzzleIndex)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition"
                      >
                        重試
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 truncate">
                      <span className="px-2 py-0.5 bg-amber-800 border border-amber-600 text-amber-300 rounded-lg text-xs font-black shrink-0">
                        {currentPuzzle.badge}
                      </span>
                      <span className="font-bold text-stone-200 truncate">{currentPuzzle.prompt}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setShowHintModal(true)}
                        className="px-3 py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow"
                      >
                        <Lightbulb size={14} className="text-amber-400" />
                        <span>提示</span>
                      </button>
                      <button
                        onClick={() => setShowSolutionModal(true)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-700/60 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow"
                      >
                        <Eye size={14} />
                        <span>解說</span>
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* GAME OVER RESULT MODAL */}
      {gameOverResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl text-amber-50 relative"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-4 text-amber-300">
              <Trophy size={36} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-2">
              {gameOverResult.winner === 'BLACK' ? '黑方 獲勝！' : gameOverResult.winner === 'WHITE' ? '白方 獲勝！' : '和棋！'}
            </h2>

            <p className="text-sm sm:text-base text-stone-300 mb-4">{gameOverResult.reason}</p>

            {territoryResult && (
              <div className="bg-stone-950/80 border border-amber-800/60 rounded-2xl p-4 mb-5 text-xs sm:text-sm text-left space-y-2">
                <div className="flex justify-between border-b border-stone-800 pb-1.5">
                  <span className="font-bold text-amber-200">黑方總分:</span>
                  <span className="font-black text-amber-400">
                    {territoryResult.blackTotal} (子數 {territoryResult.blackStones} + 圍地 {territoryResult.blackTerritory})
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-800 pb-1.5">
                  <span className="font-bold text-amber-200">白方總分 (含貼目):</span>
                  <span className="font-black text-amber-400">
                    {territoryResult.whiteTotal.toFixed(1)} (子數 {territoryResult.whiteStones} + 圍地 {territoryResult.whiteTerritory} + 貼目 {territoryResult.komi})
                  </span>
                </div>
                {gameOverResult.scoreDiff !== undefined && (
                  <div className="text-center font-black text-amber-300 pt-1">
                    勝負差距: {gameOverResult.scoreDiff} 目 / 子
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setGameOverResult(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-xl font-bold text-sm transition"
              >
                查看棋盤
              </button>
              <button
                onClick={() => resetMatch(boardSize, handicap)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-black text-sm shadow transition"
              >
                再對弈一局
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* HINT MODAL */}
      {showHintModal && currentPuzzle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border border-amber-600 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto mb-3 text-amber-300">
              <Lightbulb size={24} />
            </div>
            <h3 className="text-lg font-bold text-amber-300 mb-2">💡 題目提示</h3>
            <p className="text-sm text-stone-200 mb-5 leading-relaxed">{currentPuzzle.hint}</p>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-sm transition"
            >
              我知道了
            </button>
          </motion.div>
        </div>
      )}

      {/* SOLUTION / EXPLANATION MODAL */}
      {showSolutionModal && currentPuzzle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border border-amber-600 rounded-2xl p-6 max-w-md w-full text-left shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400" size={20} />
              <h3 className="text-lg font-bold text-amber-300">{currentPuzzle.title} - 棋理詳解</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 mb-5 leading-relaxed bg-stone-950/80 p-3.5 rounded-xl border border-amber-900/60">
              {currentPuzzle.explanation}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowSolutionModal(false);
                  // Execute solution on puzzle board
                  const firstMove = currentPuzzle.solutionMoves[0].playerMove;
                  handlePuzzleCellClick(firstMove.r, firstMove.c);
                }}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm transition"
              >
                自動演示正解
              </button>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold rounded-xl text-xs sm:text-sm transition"
              >
                關閉
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WeiqiGame;
