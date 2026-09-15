
import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Undo2, HelpCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import BoardSidebarLayout from './game-ui/BoardSidebarLayout';
import GameModeSelector from './game-ui/GameModeSelector';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
  initialBoard?: number[][];
  initialTurn?: number;
}

const SIZE = 8;
const EMPTY = 0;
const BLACK = 1; // Player 1 (Starts)
const WHITE = 2; // Player 2 or AI

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const DIRECTIONS = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];

const createInitialBoard = () => {
  const board = Array(SIZE).fill(0).map(() => Array(SIZE).fill(EMPTY));
  board[3][3] = WHITE; board[3][4] = BLACK;
  board[4][3] = BLACK; board[4][4] = WHITE;
  return board;
};

const cloneBoard = (board: number[][]) => board.map(row => [...row]);

export interface OthelloMoveRecord {
  board: number[][];
  player: number;
  r: number;
  c: number;
}

export interface OthelloLastMove {
  player: number;
  r: number;
  c: number;
}

export const buildOthelloReplayFrames = (openingBoard: number[][], moves: OthelloMoveRecord[]) => [
  { board: cloneBoard(openingBoard), lastMove: null as OthelloLastMove | null },
  ...moves.map(({ board, player, r, c }) => ({
    board: cloneBoard(board),
    lastMove: { player, r, c },
  })),
];

const countOthelloPieces = (board: number[][]) => {
  let black = 0;
  let white = 0;
  board.forEach(row => row.forEach(cell => {
    if (cell === BLACK) black += 1;
    else if (cell === WHITE) white += 1;
  }));
  return { black, white };
};

export const isOthelloValidMove = (board: number[][], r: number, c: number, player: number) => {
  if (board[r]?.[c] !== EMPTY) return false;
  const opponent = player === BLACK ? WHITE : BLACK;
  for (const [dr, dc] of DIRECTIONS) {
    let nr = r + dr, nc = c + dc;
    let flipped = false;
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr]?.[nc] === opponent) {
      nr += dr; nc += dc;
      flipped = true;
    }
    if (flipped && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr]?.[nc] === player) return true;
  }
  return false;
};

export const getOthelloValidMoves = (board: number[][], player: number) => {
  const moves: { r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (isOthelloValidMove(board, r, c, player)) moves.push({ r, c });
    }
  }
  return moves;
};

export const applyOthelloMove = (board: number[][], r: number, c: number, player: number) => {
  const newBoard = cloneBoard(board);
  newBoard[r][c] = player;
  const opponent = player === BLACK ? WHITE : BLACK;
  for (const [dr, dc] of DIRECTIONS) {
    let nr = r + dr, nc = c + dc;
    const toFlip: { r: number; c: number }[] = [];
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && newBoard[nr]?.[nc] === opponent) {
      toFlip.push({ r: nr, c: nc });
      nr += dr; nc += dc;
    }
    if (toFlip.length > 0 && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && newBoard[nr]?.[nc] === player) {
      toFlip.forEach(p => newBoard[p.r][p.c] = player);
    }
  }
  return newBoard;
};

export const getOthelloWinner = (board: number[][]) => {
  let blackCount = 0;
  let whiteCount = 0;
  board.forEach(row => row.forEach(cell => {
    if (cell === BLACK) blackCount += 1;
    else if (cell === WHITE) whiteCount += 1;
  }));
  return blackCount > whiteCount ? BLACK : whiteCount > blackCount ? WHITE : 3;
};

// Positional Weights
// Corners = 100, Adjacent to Corners (X, C squares) = -20 (Danger), Edges = 10
const POSITION_WEIGHTS = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [10, -2, 2, 1, 1, 2, -2, 10],
    [5, -2, 1, 1, 1, 1, -2, 5],
    [5, -2, 1, 1, 1, 1, -2, 5],
    [10, -2, 2, 1, 1, 2, -2, 10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10, 5, 5, 10, -20, 100]
];

interface OthelloBoardViewProps {
  board: number[][];
  validMoves: { r: number; c: number }[];
  turn: number;
  gameMode: 'PVE' | 'PVP';
  interactionLocked: boolean;
  lastMove: OthelloLastMove | null;
  onMove: (r: number, c: number) => void;
}

export const OthelloBoardView: React.FC<OthelloBoardViewProps> = ({
  board,
  validMoves,
  turn,
  gameMode,
  interactionLocked,
  lastMove,
  onMove,
}) => {
  const turnLabel = turn === BLACK ? '黑棋' : '白棋';

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center p-1 sm:p-2">
      <div
        className="grid aspect-square h-auto max-w-full gap-0.5"
        style={{
          width: 'min(100%, calc(100dvh - 6rem))',
          gridTemplateColumns: '1.25rem minmax(0, 1fr)',
          gridTemplateRows: '1.25rem minmax(0, 1fr)',
        }}
      >
        <span aria-hidden="true" />
        <div className="grid grid-cols-8 items-center text-center text-[10px] font-bold text-emerald-800 sm:text-xs">
          {COLS.map(label => <span key={label}>{label}</span>)}
        </div>
        <div className="grid grid-rows-8 items-center text-center text-[10px] font-bold text-emerald-800 sm:text-xs">
          {ROWS.map(label => <span key={label}>{label}</span>)}
        </div>
        <div
          data-board-coordinate-model="cell"
          className="grid grid-cols-8 grid-rows-8 gap-0.5 rounded-lg border-4 border-emerald-800 bg-emerald-800 p-1 shadow-xl sm:gap-1 sm:p-2"
        >
          {board.map((row, r) => row.map((cell, c) => {
            const coordinate = `${COLS[c]}${ROWS[r]}`;
            const isValid = validMoves.some(move => move.r === r && move.c === c);
            const showHint = !interactionLocked && isValid && (gameMode === 'PVP' || turn === BLACK);
            const isOccupied = cell !== EMPTY;
            const isLastMove = Boolean(lastMove && lastMove.r === r && lastMove.c === c);
            const isDisabled = interactionLocked || isOccupied || !showHint;
            const cellLabel = cell === BLACK ? '黑棋' : cell === WHITE ? '白棋' : showHint ? `可落${turnLabel}` : '空格，無法落子';
            const accessibleLabel = `${coordinate}，${cellLabel}${isLastMove ? '，上一手落子' : ''}`;
            return (
              <button
                key={coordinate}
                type="button"
                data-othello-cell={coordinate}
                data-last-move={isLastMove ? 'true' : undefined}
                aria-label={accessibleLabel}
                disabled={isDisabled}
                onClick={() => onMove(r, c)}
                className={`relative flex min-h-0 min-w-0 items-center justify-center bg-emerald-600 p-0 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${showHint ? 'cursor-pointer hover:bg-emerald-500' : 'cursor-default'} ${isLastMove ? 'z-10 ring-4 ring-inset ring-amber-300' : ''}`}
              >
                {cell === BLACK && <span aria-hidden="true" className="h-[82%] w-[82%] rounded-full bg-black shadow-lg" />}
                {cell === WHITE && <span aria-hidden="true" className="h-[82%] w-[82%] rounded-full border border-gray-300 bg-white shadow-lg" />}
                {showHint && <span aria-hidden="true" className="absolute h-[22%] w-[22%] rounded-full border-2 border-amber-200 bg-emerald-900/60" />}
                {isLastMove && (
                  <span
                    aria-hidden="true"
                    data-last-move-marker="true"
                    className="pointer-events-none absolute inset-[5%] rounded-full border-[3px] border-amber-300 shadow-[0_0_0_2px_rgba(6,78,59,0.75)]"
                  />
                )}
              </button>
            );
          }))}
        </div>
      </div>
    </div>
  );
};

interface OthelloReviewControlsProps {
  winner: number;
  blackCount: number;
  whiteCount: number;
  moveCount: number;
  reviewStep: number | null;
  onStartReview: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShowFinal: () => void;
  onRestart: () => void;
}

export const OthelloReviewControls: React.FC<OthelloReviewControlsProps> = ({
  winner,
  blackCount,
  whiteCount,
  moveCount,
  reviewStep,
  onStartReview,
  onPrevious,
  onNext,
  onShowFinal,
  onRestart,
}) => (
  <section aria-label="對局結果與復盤" className="rounded-xl border-2 border-amber-300 bg-amber-50 p-2 text-center shadow-sm sm:p-3">
    <div className="flex items-center justify-center gap-2 font-bold text-emerald-950">
      <Trophy aria-hidden="true" className="h-5 w-5 text-amber-500" />
      {winner === BLACK ? '黑方獲勝！' : winner === WHITE ? '白方獲勝！' : '平手'}
    </div>
    <p className="mt-1 text-xs text-stone-600">
      {reviewStep === null ? '終局盤面會保留，可直接開始復盤。' : `第 ${reviewStep} / ${moveCount} 手`}
    </p>
    {reviewStep === null ? (
      <div className="mt-2 grid grid-cols-1 gap-1">
        <button type="button" onClick={onStartReview} disabled={moveCount === 0} className="min-h-11 whitespace-nowrap rounded-lg border border-emerald-300 bg-white px-1 py-1 text-xs font-bold text-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50">
          開始復盤
        </button>
        <button type="button" onClick={onRestart} className="min-h-11 whitespace-nowrap rounded-lg bg-emerald-600 px-1 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
          再來一局
        </button>
      </div>
    ) : (
      <>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" aria-label="上一手" onClick={onPrevious} disabled={reviewStep === 0} className="min-h-11 whitespace-nowrap rounded-lg border border-emerald-300 bg-white px-1 py-1 text-xs font-bold text-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50">
            上一手
          </button>
          <button type="button" aria-label="下一手" onClick={onNext} disabled={reviewStep === moveCount} className="min-h-11 whitespace-nowrap rounded-lg border border-emerald-300 bg-white px-1 py-1 text-xs font-bold text-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50">
            下一手
          </button>
        </div>
        <button type="button" onClick={onShowFinal} className="mt-2 min-h-11 w-full rounded-lg bg-emerald-600 px-2 py-1 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
          回到終局
        </button>
      </>
    )}
    <p className="mt-2 text-xs font-semibold text-stone-600">目前盤面　黑 {blackCount}：白 {whiteCount}</p>
  </section>
);

const OthelloGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL', initialBoard, initialTurn = BLACK }) => {
  const [board, setBoard] = useState<number[][]>(() => initialBoard ? cloneBoard(initialBoard) : createInitialBoard());
  const [turn, setTurn] = useState(initialTurn);
  const [winner, setWinner] = useState<number | null>(null); 
  const [blackCount, setBlackCount] = useState(2);
  const [whiteCount, setWhiteCount] = useState(2);
  const [validMoves, setValidMoves] = useState<{r:number, c:number}[]>([]);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');
  
  const [history, setHistory] = useState<number[][][]>([]);
  const [turnHistory, setTurnHistory] = useState<number[]>([]);
  const [moveHistory, setMoveHistory] = useState<OthelloMoveRecord[]>([]);
  const [reviewStep, setReviewStep] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
      resetGame();
  }, [gameMode]);

  const resetGame = () => {
    const b = initialBoard ? cloneBoard(initialBoard) : createInitialBoard();
    setBoard(b);
    setTurn(initialTurn);
    setWinner(null);
    updateCounts(b);
    setValidMoves(getOthelloValidMoves(b, initialTurn));
    setHistory([]);
    setTurnHistory([]);
    setMoveHistory([]);
    setReviewStep(null);
  };

  const updateCounts = (b: number[][]) => {
    let blk = 0, wht = 0;
    b.forEach(row => row.forEach(c => {
        if (c === BLACK) blk++;
        else if (c === WHITE) wht++;
    }));
    setBlackCount(blk);
    setWhiteCount(wht);
  };

  const handleMove = (r: number, c: number) => {
    if (winner) return;
    if (gameMode === 'PVE' && turn !== BLACK) return; 
    if (!validMoves.some(m => m.r === r && m.c === c)) return;

    setHistory(prev => [...prev, board.map(row => [...row])]);
    setTurnHistory(prev => [...prev, turn]);

    const currentPlayer = turn;
    const nextPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    const nextBoard = applyOthelloMove(board, r, c, currentPlayer);
    setMoveHistory(prev => [...prev, { board: cloneBoard(nextBoard), player: currentPlayer, r, c }]);
    setBoard(nextBoard);
    updateCounts(nextBoard);
    soundService.playGameSound('BOUNCE');
    
    let nextMoves = getOthelloValidMoves(nextBoard, nextPlayer);
    if (nextMoves.length > 0) {
        setTurn(nextPlayer);
        setValidMoves(nextMoves);
    } else {
        const currentMoves = getOthelloValidMoves(nextBoard, currentPlayer);
        if (currentMoves.length > 0) {
            setValidMoves(currentMoves);
            alert(`${nextPlayer === BLACK ? "黑方" : "白方"} 無路可走，${currentPlayer === BLACK ? "黑方" : "白方"} 繼續！`);
        } else {
            endGame(nextBoard);
        }
    }
  };

  const endGame = (b: number[][]) => {
      const result = getOthelloWinner(b);
      setWinner(result);
      setValidMoves([]);
      if (result !== 3) soundService.playWin();
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    let stepsToUndo = 1;
    if (gameMode === 'PVE' && turn === BLACK && history.length >= 2) {
      stepsToUndo = 2;
    }
    
    const newHistory = [...history];
    const newTurnHistory = [...turnHistory];
    
    const prevBoard = newHistory[newHistory.length - stepsToUndo];
    const prevTurn = newTurnHistory[newTurnHistory.length - stepsToUndo];
    
    newHistory.splice(newHistory.length - stepsToUndo, stepsToUndo);
    newTurnHistory.splice(newTurnHistory.length - stepsToUndo, stepsToUndo);
    
    setBoard(prevBoard);
    setTurn(prevTurn);
    setHistory(newHistory);
    setTurnHistory(newTurnHistory);
    setMoveHistory(prev => prev.slice(0, Math.max(0, prev.length - stepsToUndo)));
    setReviewStep(null);
    setWinner(null);
    updateCounts(prevBoard);
    setValidMoves(getOthelloValidMoves(prevBoard, prevTurn));
  };

  // Improved AI Logic
  useEffect(() => {
    if (gameMode === 'PVE' && turn === WHITE && !winner) {
        const timer = setTimeout(() => {
            const aiMoves = getOthelloValidMoves(board, WHITE);
            if (aiMoves.length === 0) {
                const pMoves = getOthelloValidMoves(board, BLACK);
                if (pMoves.length > 0) { setTurn(BLACK); setValidMoves(pMoves); }
                else endGame(board);
                return;
            }

            // Select best move based on static weights
            let bestMove = aiMoves[0];
            let maxScore = -9999;

            for (const move of aiMoves) {
                let score = POSITION_WEIGHTS[move.r][move.c];
                
                // Adjust score: capturing a corner updates neighboring weights
                // (Simplified: Just use the static map for now, but ensure corner adjacency logic holds)
                
                // Randomness for variety
                score += Math.random() * 5;

                if (score > maxScore) {
                    maxScore = score;
                    bestMove = move;
                }
            }

            setHistory(prev => [...prev, board.map(row => [...row])]);
            setTurnHistory(prev => [...prev, WHITE]);

            const nextBoard = applyOthelloMove(board, bestMove.r, bestMove.c, WHITE);
            setMoveHistory(prev => [...prev, { board: cloneBoard(nextBoard), player: WHITE, r: bestMove.r, c: bestMove.c }]);
            setBoard(nextBoard);
            updateCounts(nextBoard);
            soundService.playGameSound('LOW');
            const pMoves = getOthelloValidMoves(nextBoard, BLACK);
            if (pMoves.length > 0) { setTurn(BLACK); setValidMoves(pMoves); }
            else {
                const nextAiMoves = getOthelloValidMoves(nextBoard, WHITE);
                if (nextAiMoves.length > 0) { setValidMoves(nextAiMoves); } // Force re-render if state logic needed
                else endGame(nextBoard);
            }
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [turn, board, winner, gameMode]);

  const difficultyLabel = difficulty === 'ADVANCED' ? '進階' : '一般';
  const openingBoard = initialBoard ? cloneBoard(initialBoard) : createInitialBoard();
  const replayFrames = buildOthelloReplayFrames(openingBoard, moveHistory);
  const reviewFrame = reviewStep === null ? null : replayFrames[reviewStep];
  const displayedBoard = reviewFrame?.board ?? board;
  const displayedLastMove = reviewFrame
    ? reviewFrame.lastMove
    : moveHistory.length > 0
      ? { player: moveHistory[moveHistory.length - 1].player, r: moveHistory[moveHistory.length - 1].r, c: moveHistory[moveHistory.length - 1].c }
      : null;
  const displayedCounts = reviewStep === null
    ? { black: blackCount, white: whiteCount }
    : countOthelloPieces(displayedBoard);
  const statusText = reviewStep !== null
    ? `復盤：第 ${reviewStep} / ${moveHistory.length} 手`
    : winner === 1
    ? '黑方獲勝！'
    : winner === 2
      ? '白方獲勝！'
      : winner === 3
        ? '平手'
        : (turn === BLACK ? '黑方回合' : '白方回合');
  const boardView = (
    <OthelloBoardView
      board={displayedBoard}
      validMoves={reviewStep === null ? validMoves : []}
      turn={turn}
      gameMode={gameMode}
      interactionLocked={Boolean(winner) || reviewStep !== null}
      lastMove={displayedLastMove}
      onMove={handleMove}
    />
  );

  const sidebarView = (
    <div className="flex h-full min-h-0 flex-col gap-2 rounded-xl border border-emerald-200 bg-white/90 p-2 text-emerald-950 shadow-sm sm:gap-3 sm:p-3">
      {!winner && (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-emerald-100 p-2 text-center">
            <div><span className="block text-xs font-semibold text-emerald-800">黑棋</span><strong className="text-lg">{displayedCounts.black}</strong></div>
            <div><span className="block text-xs font-semibold text-emerald-800">白棋</span><strong className="text-lg">{displayedCounts.white}</strong></div>
          </div>
          <div className="rounded-lg bg-stone-100 p-2 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800"><Trophy aria-hidden="true" className="h-4 w-4" /> 目前狀態</div>
            <strong className="mt-1 block text-base">{statusText}</strong>
          </div>
        </>
      )}
      {winner ? (
        <OthelloReviewControls
          winner={winner}
          blackCount={displayedCounts.black}
          whiteCount={displayedCounts.white}
          moveCount={moveHistory.length}
          reviewStep={reviewStep}
          onStartReview={() => setReviewStep(0)}
          onPrevious={() => setReviewStep(step => Math.max(0, (step ?? 0) - 1))}
          onNext={() => setReviewStep(step => Math.min(moveHistory.length, (step ?? 0) + 1))}
          onShowFinal={() => setReviewStep(null)}
          onRestart={resetGame}
        />
      ) : (
        <>
          <GameModeSelector value={gameMode} onChange={setGameMode} />
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            aria-label="悔棋"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-sm font-bold text-emerald-950 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Undo2 aria-hidden="true" className="h-5 w-5" /> 悔棋
          </button>
        </>
      )}
      <p className="mt-auto rounded-lg bg-emerald-50 p-2 text-xs leading-relaxed text-emerald-800 sm:text-sm">
        黑棋先手；落子需夾住對手棋子才能翻轉。沒有合法位置時會跳過回合。
      </p>
    </div>
  );

  return (
    <GameShell
      title="黑白棋"
      subtitle="夾住對手棋子並翻轉"
      onBack={onBack}
      status={<span>{difficultyLabel}</span>}
      actions={(
        <>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            aria-label="查看遊戲規則"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-emerald-900 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            <HelpCircle aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={resetGame}
            aria-label="重設遊戲"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-emerald-900 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            <RefreshCw aria-hidden="true" className="h-5 w-5" />
          </button>
        </>
      )}
      contentClassName="bg-emerald-50 text-emerald-950"
    >
      <div className="relative h-full min-h-0">
        <BoardSidebarLayout
          board={boardView}
          sidebar={sidebarView}
          boardLabel="黑白棋棋盤"
          sidebarLabel="黑白棋狀態與操作"
          boardClassName="flex min-h-0 items-center justify-center bg-emerald-50"
          sidebarClassName="flex min-h-0 flex-col"
          feedbackClassName="border-emerald-300 text-emerald-950"
        />

        {showRules && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="othello-rules-title" className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <h2 id="othello-rules-title" className="mb-4 flex items-center gap-2 text-xl font-bold text-emerald-900"><HelpCircle aria-hidden="true" /> 遊戲規則</h2>
              <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-stone-700">
                <li>黑子先手。</li>
                <li>下子時，必須將對方的棋子夾在自己剛下的棋子和原有的棋子之間（橫、豎、斜皆可）。</li>
                <li>被夾住的對方棋子會翻轉為自己的顏色。</li>
                <li>如果沒有任何合法的位置可以翻轉對方的棋子，則必須「跳過（Pass）」此回合。</li>
                <li>當棋盤下滿，或雙方皆無法再下子時結束，棋子多者獲勝。</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="min-h-11 w-full rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                了解，開始遊戲！
              </button>
            </div>
          </div>
        )}

      </div>
    </GameShell>
  );
};

export default OthelloGame;
