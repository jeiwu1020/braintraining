import React from 'react';
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
  ListFilter
} from 'lucide-react';
import { GoBoard, Point, TerritoryScore } from '../services/goEngine';
import { GoPuzzle, PuzzleCategory } from '../data/goPuzzles';
import { WeiqiBoard } from './WeiqiBoard';

interface WeiqiLandscapeLayoutProps {
  puzzleControls?: React.ReactNode;
  puzzleTurn?: 'BLACK' | 'WHITE';
  onBack: () => void;
  gameMode: 'AI' | 'PVP' | 'PUZZLE';
  setGameMode: (mode: 'AI' | 'PVP' | 'PUZZLE') => void;
  boardSize: 9 | 13 | 19;
  setBoardSize: (size: 9 | 13 | 19) => void;
  handicap: number;
  setHandicap: (hcap: number) => void;
  aiDifficulty: 'EASY' | 'NORMAL' | 'HARD';
  setAiDifficulty: (diff: 'EASY' | 'NORMAL' | 'HARD') => void;
  board: GoBoard;
  currentTurn: 'BLACK' | 'WHITE';
  playerColor: 'BLACK' | 'WHITE';
  blackCaptures: number;
  whiteCaptures: number;
  koPoint: Point | null;
  lastMove: Point | null;
  moveCount: number;
  moveHistoryLength: number;
  blackAtariGroups: { stones: Point[] }[];
  whiteAtariGroups: { stones: Point[] }[];
  showTerritory: boolean;
  territoryResult: TerritoryScore | null;
  toggleTerritoryEstimation: () => void;
  gameOverResult: any;
  isScoringReview: boolean;
  finishScoringReview: () => void;
  teamAScore: number;
  teamBScore: number;
  activeTeam: 'A' | 'B';
  isAiThinking: boolean;
  handleCellClick: (r: number, c: number) => void;
  handlePass: (isAi?: boolean) => void;
  handleUndo: () => void;
  handleResign: () => void;
  resetMatch: (size?: 9 | 13 | 19, hcap?: number) => void;
  elapsedTime: number;
  setShowRules: (show: boolean) => void;
  hoveredPoint: Point | null;
  setHoveredPoint: (pt: Point | null) => void;
  // Puzzle props
  puzzleFilter: PuzzleCategory | 'ALL';
  handleCategoryChange: (cat: PuzzleCategory | 'ALL') => void;
  filteredPuzzles: GoPuzzle[];
  currentPuzzleIndex: number;
  currentPuzzle: GoPuzzle;
  puzzleBoard: GoBoard;
  puzzleStatus: 'UNSOLVED' | 'CORRECT' | 'WRONG';
  puzzleLastMove: Point | null;
  puzzleScore: number;
  solvedPuzzleIds: Set<string>;
  loadPuzzle: (index: number) => void;
  handlePuzzleCellClick: (r: number, c: number) => void;
  setShowHintModal: (show: boolean) => void;
  setShowSolutionModal: (show: boolean) => void;
}

export const WeiqiLandscapeLayout: React.FC<WeiqiLandscapeLayoutProps> = ({
  puzzleControls,
  puzzleTurn = 'BLACK',
  onBack,
  gameMode,
  setGameMode,
  boardSize,
  setBoardSize,
  handicap,
  setHandicap,
  aiDifficulty,
  setAiDifficulty,
  board,
  currentTurn,
  playerColor,
  blackCaptures,
  whiteCaptures,
  koPoint,
  lastMove,
  moveCount,
  moveHistoryLength,
  blackAtariGroups,
  whiteAtariGroups,
  showTerritory,
  territoryResult,
  toggleTerritoryEstimation,
  gameOverResult,
  isScoringReview,
  finishScoringReview,
  teamAScore,
  teamBScore,
  activeTeam,
  isAiThinking,
  handleCellClick,
  handlePass,
  handleUndo,
  handleResign,
  resetMatch,
  elapsedTime,
  setShowRules,
  hoveredPoint,
  setHoveredPoint,
  // Puzzle props
  puzzleFilter,
  handleCategoryChange,
  filteredPuzzles,
  currentPuzzleIndex,
  currentPuzzle,
  puzzleBoard,
  puzzleStatus,
  puzzleLastMove,
  puzzleScore,
  solvedPuzzleIds,
  loadPuzzle,
  handlePuzzleCellClick,
  setShowHintModal,
  setShowSolutionModal,
}) => {
  return (
    <div
      id="weiqi-landscape-root"
      data-weiqi-layout="landscape"
      className="flex flex-row h-[100dvh] w-full bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 text-amber-50 select-none p-1 sm:p-1.5 gap-1.5 sm:gap-2 overflow-hidden font-sans"
    >
      {/* ========================================================================= */}
      {/* LEFT: FULL-HEIGHT HUGE GO BOARD */}
      {/* ========================================================================= */}
      <div className="flex-1 h-full min-w-0 min-h-0 flex items-center justify-center p-0.5">
        <WeiqiBoard
          board={gameMode === 'PUZZLE' ? puzzleBoard : board}
          boardSize={gameMode === 'PUZZLE' ? currentPuzzle.boardSize : boardSize}
          currentTurn={gameMode === 'PUZZLE' ? puzzleTurn : currentTurn}
          lastMove={gameMode === 'PUZZLE' ? puzzleLastMove : lastMove}
          koPoint={gameMode === 'PUZZLE' ? null : koPoint}
          blackAtariGroups={gameMode === 'PUZZLE' ? [] : blackAtariGroups}
          whiteAtariGroups={gameMode === 'PUZZLE' ? [] : whiteAtariGroups}
          showTerritory={gameMode === 'PUZZLE' ? false : showTerritory}
          territoryResult={gameMode === 'PUZZLE' ? null : territoryResult}
          hoveredPoint={hoveredPoint}
          setHoveredPoint={setHoveredPoint}
          onCellClick={gameMode === 'PUZZLE' ? handlePuzzleCellClick : handleCellClick}
          isAiThinking={isAiThinking}
          gameOverResult={gameOverResult}
          isLandscapeCompact={true}
        />
      </div>

      {/* ========================================================================= */}
      {/* RIGHT: CONTROL PANEL & STATUS SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        aria-label="圍棋控制面板"
        className="w-64 sm:w-72 md:w-80 shrink-0 h-full flex flex-col justify-between bg-stone-950/90 border border-amber-800/50 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md overflow-y-auto min-h-0 gap-1.5"
      >
        
        {/* Top Header Strip: Back, Mode Switcher, Rules, Restart */}
        <div className="shrink-0 pb-1.5 border-b border-amber-900/60">
          <div className="flex items-center justify-between gap-1">
          <button
            id="weiqi-landscape-back-btn"
            onClick={onBack}
            aria-label="返回"
            className="min-h-11 min-w-[44px] flex items-center justify-center gap-0.5 px-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-lg font-bold text-xs shadow transition active:scale-95 shrink-0"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>返回</span>
          </button>

          {/* Quick Actions: Rules, Restart */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowRules(true)}
              aria-label="遊戲規則"
              className="min-h-11 min-w-[44px] flex items-center justify-center bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-lg text-xs transition"
            >
              <HelpCircle size={16} aria-hidden="true" />
            </button>
            <button
              onClick={() => {
                if (gameMode === 'PUZZLE') loadPuzzle(currentPuzzleIndex);
                else resetMatch(boardSize, handicap);
              }}
              aria-label="重新開始"
              className="min-h-11 min-w-[44px] flex items-center justify-center bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-lg text-xs transition"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          </div>
          </div>

          {/* Three-way mode switcher: these modes have distinct semantics from PVE/PVP. */}
          <div
            className="mt-1.5 grid grid-cols-3 gap-1 bg-stone-900/90 border border-amber-700/50 p-1 rounded-lg shadow-inner"
            aria-label="圍棋模式"
          >
            <button
              type="button"
              onClick={() => setGameMode('AI')}
              data-weiqi-mode="AI"
              aria-label="人機模式"
              aria-pressed={gameMode === 'AI'}
              className={`min-h-11 rounded-md text-xs font-bold transition flex items-center justify-center gap-1 ${
                gameMode === 'AI' ? 'bg-amber-500 text-stone-950 shadow ring-2 ring-amber-200 ring-offset-1 ring-offset-stone-900' : 'text-amber-300 hover:text-amber-100'
              }`}
            >
              <Bot size={16} aria-hidden="true" />
              <span>人機</span>
              {gameMode === 'AI' && <span aria-hidden="true">✓</span>}
            </button>
            <button
              type="button"
              onClick={() => setGameMode('PVP')}
              data-weiqi-mode="PVP"
              aria-label="AB組模式"
              aria-pressed={gameMode === 'PVP'}
              className={`min-h-11 rounded-md text-xs font-bold transition flex items-center justify-center gap-1 ${
                gameMode === 'PVP' ? 'bg-amber-500 text-stone-950 shadow ring-2 ring-amber-200 ring-offset-1 ring-offset-stone-900' : 'text-amber-300 hover:text-amber-100'
              }`}
            >
              <Users size={16} aria-hidden="true" />
              <span>AB組</span>
              {gameMode === 'PVP' && <span aria-hidden="true">✓</span>}
            </button>
            <button
              type="button"
              onClick={() => setGameMode('PUZZLE')}
              data-weiqi-mode="PUZZLE"
              aria-label="死活題模式"
              aria-pressed={gameMode === 'PUZZLE'}
              className={`min-h-11 rounded-md text-xs font-bold transition flex items-center justify-center gap-1 ${
                gameMode === 'PUZZLE' ? 'bg-amber-500 text-stone-950 shadow ring-2 ring-amber-200 ring-offset-1 ring-offset-stone-900' : 'text-amber-300 hover:text-amber-100'
              }`}
            >
              <Brain size={16} aria-hidden="true" />
              <span>死活</span>
              {gameMode === 'PUZZLE' && <span aria-hidden="true">✓</span>}
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MATCH MODE SIDEBAR CONTENT */}
        {/* ===================================================================== */}
        {gameMode !== 'PUZZLE' && (
          <div className="flex-1 flex flex-col justify-between gap-1.5 min-h-0">
            
            {/* Options Strip: Board Size & AI Diff / Handicap */}
            <div className="bg-stone-900/80 border border-amber-800/40 rounded-xl p-1.5 flex flex-wrap items-center justify-between gap-1.5 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-stone-300 font-bold">路數:</span>
                {([9, 13, 19] as const).map(sz => (
                  <button
                    key={sz}
                    onClick={() => {
                      setBoardSize(sz);
                    }}
                    data-weiqi-board-size={sz}
                    aria-label={`${sz}路棋盤`}
                    aria-pressed={boardSize === sz}
                    className={`min-h-8 px-2 rounded font-black text-xs transition ${
                      boardSize === sz
                        ? 'bg-amber-500 text-stone-950 shadow ring-1 ring-amber-200'
                        : 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                    }`}
                  >
                    {sz}路
                  </button>
                ))}
              </div>

              {gameMode === 'AI' ? (
                <div className="flex items-center gap-1">
                  <span className="text-stone-300 font-bold">難度:</span>
                  {(
                    [
                      { id: 'EASY', label: '入門' },
                      { id: 'NORMAL', label: '普通' },
                      { id: 'HARD', label: '高手' }
                    ] as const
                  ).map(d => (
                    <button
                      key={d.id}
                      onClick={() => setAiDifficulty(d.id)}
                      data-weiqi-difficulty={d.id}
                      aria-label={`AI難度：${d.label}`}
                      aria-pressed={aiDifficulty === d.id}
                      className={`min-h-8 px-2 rounded font-black text-xs transition ${
                        aiDifficulty === d.id
                          ? 'bg-amber-500 text-stone-950 shadow ring-1 ring-amber-200'
                          : 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-stone-300 font-bold">讓子:</span>
                  <select
                    aria-label="讓子設定"
                    value={handicap}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setHandicap(val);
                    }}
                    className="min-h-8 bg-stone-800 border border-amber-700/60 text-amber-200 text-xs font-bold rounded px-1.5 py-1"
                  >
                    {[0, 2, 3, 4].map(h => (
                      <option key={h} value={h}>
                        {h === 0 ? '分先 (無讓子)' : `讓 ${h} 子`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Current Turn & Live Status Card */}
            <div className="bg-stone-900/90 border border-amber-800/50 rounded-xl p-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border shadow ${
                      currentTurn === 'BLACK'
                        ? 'bg-stone-900 border-white'
                        : 'bg-white border-stone-800'
                    } ${isAiThinking ? 'animate-pulse' : ''}`}
                  />
                  <span className="font-black text-amber-200 text-sm">
                    {currentTurn === 'BLACK' ? '黑方回合' : '白方回合'}
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-300 bg-stone-950 px-1.5 py-1 rounded-md border border-stone-800">
                  第 {moveCount} 手
                </span>
              </div>

              {/* Captures / Team Score */}
              <div className="grid grid-cols-2 gap-1 text-xs font-bold">
                <div className="bg-stone-950/80 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between">
                  <span className="text-stone-400">提白:</span>
                  <span className="text-amber-400 font-black">{blackCaptures} 子</span>
                </div>
                <div className="bg-stone-950/80 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between">
                  <span className="text-stone-400">提黑:</span>
                  <span className="text-amber-400 font-black">{whiteCaptures} 子</span>
                </div>
              </div>

              {/* Live Alerts: Atari / Ko / AI Thinking */}
              {isAiThinking && (
                <div className="bg-blue-950/80 border border-blue-600/60 rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-blue-200 animate-pulse">
                  <Bot size={13} className="text-blue-400" />
                  <span>AI 思考中...</span>
                </div>
              )}
              {blackAtariGroups.length > 0 && currentTurn === 'BLACK' && (
                <div className="bg-rose-950/80 border border-rose-600/60 rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-rose-200">
                  <Shield size={13} className="text-rose-400 animate-pulse" />
                  <span>黑棋被叫吃！</span>
                </div>
              )}
              {whiteAtariGroups.length > 0 && currentTurn === 'WHITE' && (
                <div className="bg-rose-950/80 border border-rose-600/60 rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-rose-200">
                  <Shield size={13} className="text-rose-400 animate-pulse" />
                  <span>白棋被叫吃！</span>
                </div>
              )}
            </div>

            {/* Territory Info if Active */}
            {showTerritory && territoryResult && (
              <div className="bg-stone-950/90 border border-amber-700/60 rounded-xl p-1.5 text-xs space-y-1">
                <div className="flex items-center justify-between font-black text-amber-300">
                  <span>形勢判斷 (目數估算):</span>
                  <span>
                    {territoryResult.leadColor === 'BLACK'
                      ? `黑領先 ${territoryResult.leadMargin ?? 0} 目`
                      : territoryResult.leadColor === 'WHITE'
                      ? `白領先 ${territoryResult.leadMargin ?? 0} 目`
                      : '雙方勢均力敵'}
                  </span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>黑: {territoryResult.blackTotal ?? 0} 目</span>
                  <span>白(含貼目): {(territoryResult.whiteTotal ?? 0).toFixed(1)} 目</span>
                </div>
              </div>
            )}

            {/* Action Buttons Grid (2x2) */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-amber-900/60">
              <button
                onClick={handleUndo}
                disabled={moveHistoryLength === 0 || isAiThinking || !!gameOverResult}
                aria-label="悔棋"
                data-weiqi-action="undo"
                className="min-h-11 px-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-amber-200 border border-amber-700/50 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition shadow"
              >
                <Undo2 size={16} aria-hidden="true" />
                <span>悔棋</span>
              </button>

              <button
                onClick={() => handlePass(false)}
                disabled={isAiThinking || !!gameOverResult}
                aria-label="虛手"
                data-weiqi-action="pass"
                className="min-h-11 px-1.5 bg-amber-900/80 hover:bg-amber-800 disabled:opacity-40 text-amber-200 border border-amber-700/60 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition shadow"
              >
                <HandMetal size={16} aria-hidden="true" />
                <span>虛手</span>
              </button>

              <button
                onClick={isScoringReview ? finishScoringReview : toggleTerritoryEstimation}
                aria-label={isScoringReview ? '確認數目' : '形勢估算'}
                data-weiqi-action="territory"
                className={`min-h-11 px-1.5 border rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition shadow ${
                  showTerritory
                    ? 'bg-amber-500 border-amber-400 text-stone-950'
                    : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-amber-700/50'
                }`}
              >
                <Eye size={16} aria-hidden="true" />
                <span>{isScoringReview ? '確認數目' : '形勢'}</span>
              </button>

              <button
                onClick={handleResign}
                disabled={!!gameOverResult || moveCount === 0}
                aria-label="認輸"
                data-weiqi-action="resign"
                className="min-h-11 px-1.5 bg-rose-950/80 hover:bg-rose-900 disabled:opacity-40 text-rose-200 border border-rose-700/60 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition shadow"
              >
                <Flag size={16} aria-hidden="true" />
                <span>認輸</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* PUZZLE MODE SIDEBAR CONTENT */}
        {/* ===================================================================== */}
        {gameMode === 'PUZZLE' && currentPuzzle && (
          <div className="flex-1 flex flex-col justify-between gap-1.5 min-h-0">
            
            {/* Category Filter Tabs & Selector */}
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-1 bg-stone-900 border border-amber-800/60 rounded-lg p-1 justify-between">
                {(
                  [
                    { id: 'ALL', label: '全部' },
                    { id: 'LIFE_DEATH', label: '死活' },
                    { id: 'CAPTURE', label: '吃子' },
                    { id: 'TACTICS', label: '戰術' }
                  ] as const
                ).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    aria-label={`題目分類：${cat.label}`}
                    aria-pressed={puzzleFilter === cat.id}
                    className={`min-h-9 px-1 text-xs font-bold rounded-md transition ${
                      puzzleFilter === cat.id
                        ? 'bg-amber-500 text-stone-950 shadow ring-1 ring-amber-200'
                        : 'text-amber-300 hover:text-amber-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Puzzle Selector Dropdown + Nav */}
              <div className="flex items-center gap-1">
                <select
                  value={currentPuzzle.id}
                  onChange={e => {
                    const idx = filteredPuzzles.findIndex(p => p.id === e.target.value);
                    if (idx !== -1) loadPuzzle(idx);
                  }}
                  aria-label="選擇死活題"
                  className="flex-1 min-h-10 bg-stone-900 border border-amber-700/60 text-amber-200 text-xs font-bold rounded-lg px-1.5 py-1 truncate focus:outline-none"
                >
                  {filteredPuzzles.map((p, idx) => (
                    <option key={p.id} value={p.id} className="bg-stone-900 text-amber-100 py-1">
                      {idx + 1}. {p.title} {solvedPuzzleIds.has(p.id) ? '✓' : ''}
                    </option>
                  ))}
                </select>

                <div className="flex items-center bg-stone-900 border border-amber-800/60 rounded-lg p-0.5 shrink-0">
                  <button
                    onClick={() => loadPuzzle(Math.max(0, currentPuzzleIndex - 1))}
                    disabled={currentPuzzleIndex === 0}
                    aria-label="上一題"
                    className="min-h-10 min-w-10 flex items-center justify-center hover:bg-stone-800 disabled:opacity-30 rounded text-amber-200"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <span className="px-1 text-xs font-black text-amber-400">
                    {currentPuzzleIndex + 1}/{filteredPuzzles.length}
                  </span>
                  <button
                    onClick={() => loadPuzzle(Math.min(filteredPuzzles.length - 1, currentPuzzleIndex + 1))}
                    disabled={currentPuzzleIndex === filteredPuzzles.length - 1}
                    aria-label="下一題"
                    className="min-h-10 min-w-10 flex items-center justify-center hover:bg-stone-800 disabled:opacity-30 rounded text-amber-200"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Puzzle Prompt Card */}
            <div className="bg-stone-900/90 border border-amber-800/50 rounded-xl p-2 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-amber-800 border border-amber-600 text-amber-300 rounded text-[9px] font-black">
                  {currentPuzzle.badge}
                </span>
                <h3 className="font-bold text-amber-100 text-xs truncate">{currentPuzzle.title}</h3>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed bg-stone-950/70 p-1.5 rounded-lg border border-amber-900/40">
                {currentPuzzle.prompt}
              </p>
            </div>

            {puzzleControls}
            {/* Interactive Feedback & Action Buttons */}
            <div className="space-y-1">
              {puzzleStatus === 'UNSOLVED' && (
              <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowHintModal(true)}
                    aria-label="查看題目提示"
                    className="flex-1 min-h-11 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-700/60 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition shadow"
                  >
                    <Lightbulb size={16} className="text-amber-400" aria-hidden="true" />
                    <span>提示</span>
                  </button>
                  <button
                    onClick={() => setShowSolutionModal(true)}
                    aria-label="查看題目解說"
                    className="flex-1 min-h-11 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-700/60 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition shadow"
                  >
                    <Eye size={16} aria-hidden="true" />
                    <span>解說</span>
                  </button>
                </div>
              )}

              {puzzleStatus === 'CORRECT' && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-950/90 border border-emerald-500/80 rounded-xl p-1.5 space-y-1 shadow-lg"
                >
                  <div className="flex items-center gap-1 text-emerald-300 font-black text-xs">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>{currentPuzzle.training ? '已完成驗證變化' : '符合參考首手'}</span>
                  </div>
                  <p className="text-xs text-emerald-100/90">{currentPuzzle.successMessage}</p>
                  <button
                    onClick={() => {
                      if (currentPuzzleIndex < filteredPuzzles.length - 1) {
                        loadPuzzle(currentPuzzleIndex + 1);
                      } else {
                        loadPuzzle(0);
                      }
                    }}
                    className="w-full min-h-10 py-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-lg text-xs shadow transition"
                  >
                    下一題 ➔
                  </button>
                </motion.div>
              )}

              {puzzleStatus === 'WRONG' && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-rose-950/90 border border-rose-500/80 rounded-xl p-1.5 space-y-1 shadow-lg"
                >
                  <div className="flex items-center gap-1 text-rose-300 font-black text-xs">
                    <XCircle size={13} className="text-rose-400" />
                    <span>❌ 落子不對！</span>
                  </div>
                  <p className="text-xs text-rose-200/90">此處被白棋識破，請重新思考！</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => loadPuzzle(currentPuzzleIndex)}
                      className="flex-1 min-h-10 py-1 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition"
                    >
                      重試
                    </button>
                    <button
                      onClick={() => setShowHintModal(true)}
                      className="flex-1 min-h-10 py-1 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-700/60 font-bold rounded-lg text-xs transition"
                    >
                      提示
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
