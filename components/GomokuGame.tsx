
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
}

const GRID_SIZE = 10;
const CELL_EMPTY = 0;
const CELL_BLACK = 1; // Player 1 (Always starts)
const CELL_WHITE = 2; // Player 2 or AI

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const createEmptyBoard = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(CELL_EMPTY));
const cloneBoard = (value: number[][]) => value.map(row => [...row]);

export const findGomokuWinningLine = (currentBoard: number[][], player: number) => {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < GRID_SIZE; r += 1) {
    for (let c = 0; c < GRID_SIZE; c += 1) {
      if (currentBoard[r]?.[c] !== player) continue;
      for (const [dr, dc] of directions) {
        let count = 1;
        const line = [{ r, c }];
        for (let k = 1; k < 5; k += 1) {
          const nr = r + k * dr;
          const nc = c + k * dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && currentBoard[nr]?.[nc] === player) {
            count += 1;
            line.push({ r: nr, c: nc });
          } else {
            break;
          }
        }
        if (count === 5) return line;
      }
    }
  }
  return null;
};

const GomokuGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL', initialBoard }) => {
  const [board, setBoard] = useState<number[][]>(() => initialBoard ? cloneBoard(initialBoard) : createEmptyBoard());
  const [isBlackTurn, setIsBlackTurn] = useState(true);
  const [winner, setWinner] = useState<number | null>(null); // 0: null, 1: Black, 2: White, 3: Draw
  const [winningLine, setWinningLine] = useState<{r:number, c:number}[]>([]);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');
  const [history, setHistory] = useState<number[][][]>([]);
  const [turnHistory, setTurnHistory] = useState<boolean[]>([]);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    resetGame();
  }, []); 

  useEffect(() => {
      resetGame();
  }, [gameMode]);

  const resetGame = () => {
    const newBoard = initialBoard ? cloneBoard(initialBoard) : createEmptyBoard();
    setBoard(newBoard);
    setIsBlackTurn(true);
    setWinner(null);
    setWinningLine([]);
    setIsWinModalOpen(false);
    setHistory([]);
    setTurnHistory([]);
  };

  // --- Advanced AI Logic ---
  const getPatternScore = (count: number, openEnds: number, isTurn: boolean) => {
      if (count >= 5) return 100000;
      if (count === 4) {
          if (openEnds === 2) return 10000; // Open 4 (Guaranteed win)
          if (openEnds === 1) return isTurn ? 10000 : 500; // Closed 4 (Threat)
      }
      if (count === 3) {
          if (openEnds === 2) return isTurn ? 1000 : 200; // Open 3 (Major Threat)
          if (openEnds === 1) return 50;
      }
      if (count === 2) {
          if (openEnds === 2) return 10;
          if (openEnds === 1) return 2;
      }
      return 1;
  };

  const evaluatePoint = (r: number, c: number, player: number, board: number[][]) => {
      let totalScore = 0;
      const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
      
      for (const [dr, dc] of directions) {
          let count = 1; // Start with the hypothetical piece
          let openEnds = 0;
          
          // Check Forward
          let i = 1;
          while (true) {
              const nr = r + i * dr;
              const nc = c + i * dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                  if (board[nr][nc] === player) count++;
                  else if (board[nr][nc] === CELL_EMPTY) { openEnds++; break; }
                  else break; // Blocked by opponent
              } else break; // Wall
              i++;
          }

          // Check Backward
          let j = 1;
          while (true) {
              const nr = r - j * dr;
              const nc = c - j * dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                  if (board[nr][nc] === player) count++;
                  else if (board[nr][nc] === CELL_EMPTY) { openEnds++; break; }
                  else break; // Blocked by opponent
              } else break; // Wall
              j++;
          }
          
          totalScore += getPatternScore(count, openEnds, true);
      }
      return totalScore;
  };

  const getAIMove = (currentBoard: number[][]) => {
    const emptyCells: {r: number, c: number, score: number}[] = [];
    
    // Scan central area primarily to optimize performance
    const minR = 0, maxR = GRID_SIZE - 1;
    const minC = 0, maxC = GRID_SIZE - 1;

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (currentBoard[r][c] === CELL_EMPTY) {
            // Check if it has any neighbors (optimization)
            let hasNeighbor = false;
            for(let nr = Math.max(0, r-2); nr <= Math.min(GRID_SIZE-1, r+2); nr++) {
                for(let nc = Math.max(0, c-2); nc <= Math.min(GRID_SIZE-1, c+2); nc++) {
                    if (currentBoard[nr][nc] !== CELL_EMPTY) { hasNeighbor = true; break; }
                }
                if(hasNeighbor) break;
            }
            if (!hasNeighbor && (r !== 4 || c !== 4)) continue; // Always allow center

            // Attack Score (AI's benefit)
            const attackScore = evaluatePoint(r, c, CELL_WHITE, currentBoard);
            
            // Defense Score (Player's threat)
            const defenseScore = evaluatePoint(r, c, CELL_BLACK, currentBoard);
            
            // AI Personality: Aggressive but blocks huge threats
            // If player has a winning move (Defense > 5000), we MUST block (Multiplier high)
            // Otherwise, focus on building our own
            let score = attackScore + defenseScore;
            
            // Critical block logic
            if (defenseScore >= 9000) score += 100000; // Must block immediate win
            else if (defenseScore >= 500) score += defenseScore * 1.5; // Prioritize blocking threats

            // Central bias for early game
            const dist = Math.abs(r - 4.5) + Math.abs(c - 4.5);
            score += (10 - dist);

            emptyCells.push({r, c, score});
        }
      }
    }

    if (emptyCells.length === 0) return null;
    
    // Sort descending
    emptyCells.sort((a, b) => b.score - a.score);
    
    // Take the best move, or random among top tier if scores are close
    const bestScore = emptyCells[0].score;
    const candidates = emptyCells.filter(m => m.score >= bestScore * 0.9);
    
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const handleCellClick = (r: number, c: number) => {
    if (board[r][c] !== CELL_EMPTY || winner) return;
    if (gameMode === 'PVE' && !isBlackTurn) return;

    const currentPlayer = isBlackTurn ? CELL_BLACK : CELL_WHITE;
    
    // Save history
    setHistory([...history, board.map(row => [...row])]);
    setTurnHistory([...turnHistory, isBlackTurn]);

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard);
    soundService.playGameSound('BOUNCE');

    const winLine = findGomokuWinningLine(newBoard, currentPlayer);
    if (winLine) {
      setWinningLine(winLine);
      setWinner(currentPlayer);
      setIsWinModalOpen(true);
      soundService.playWin();
    } else {
      setIsBlackTurn(!isBlackTurn);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    let stepsToUndo = 1;
    if (gameMode === 'PVE' && isBlackTurn && history.length >= 2) {
      stepsToUndo = 2; // Undo AI's move and player's move
    }
    
    const newHistory = [...history];
    const newTurnHistory = [...turnHistory];
    
    const prevBoard = newHistory[newHistory.length - stepsToUndo];
    const prevTurn = newTurnHistory[newTurnHistory.length - stepsToUndo];
    
    newHistory.splice(newHistory.length - stepsToUndo, stepsToUndo);
    newTurnHistory.splice(newTurnHistory.length - stepsToUndo, stepsToUndo);
    
    setBoard(prevBoard);
    setIsBlackTurn(prevTurn);
    setHistory(newHistory);
    setTurnHistory(newTurnHistory);
    setWinner(null);
    setIsWinModalOpen(false);
    setWinningLine([]);
  };

  useEffect(() => {
    if (gameMode === 'PVE' && !isBlackTurn && !winner) {
      const timer = setTimeout(() => {
        const move = getAIMove(board);
        if (move) {
          // Save history for AI move 
          setHistory(prev => [...prev, board.map(row => [...row])]);
          setTurnHistory(prev => [...prev, isBlackTurn]);

          const newBoard = board.map(row => [...row]);
          newBoard[move.r][move.c] = CELL_WHITE;
          setBoard(newBoard);
          soundService.playGameSound('LOW');
          const winLine = findGomokuWinningLine(newBoard, CELL_WHITE);
          if (winLine) {
            setWinningLine(winLine);
            setWinner(CELL_WHITE);
            setIsWinModalOpen(true);
            soundService.playWrong();
          } else {
            if (newBoard.every(row => row.every(cell => cell !== CELL_EMPTY))) {
                setWinner(3);
                setIsWinModalOpen(true);
            }
            else setIsBlackTurn(true);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isBlackTurn, winner, board, gameMode]);

  const difficultyLabel = difficulty === 'ADVANCED' ? '進階' : '一般';
  const statusText = winner === 1
    ? '黑棋獲勝！'
    : winner === 2
      ? '白棋獲勝！'
      : winner === 3
        ? '平手'
        : (isBlackTurn ? '黑棋回合' : '白棋回合');
  const turnLabel = isBlackTurn ? '黑棋' : '白棋';

  const boardView = (
    <div className="flex h-full min-h-0 w-full items-center justify-center p-1 sm:p-2">
      <div
        data-gomoku-board-frame="true"
        className="grid aspect-square h-auto max-h-full w-full max-w-full gap-0.5"
        style={{
          gridTemplateColumns: '1.25rem minmax(0, 1fr)',
          gridTemplateRows: '1.25rem minmax(0, 1fr)',
        }}
      >
        <span aria-hidden="true" />
        <div className="relative text-[10px] font-bold text-stone-700 sm:text-xs">
          {COLS.map((label, index) => (
            <span
              key={label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${8 + index * (84 / 9)}%`, top: '50%' }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="relative text-[10px] font-bold text-stone-700 sm:text-xs">
          {ROWS.map((label, index) => (
            <span
              key={label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: '50%', top: `${8 + index * (84 / 9)}%` }}
            >
              {label}
            </span>
          ))}
        </div>
        <div
          data-board-coordinate-model="intersection"
          className="relative overflow-hidden rounded-sm border-2 border-stone-800 bg-[#DEB887] shadow-xl"
        >
          <div className="pointer-events-none absolute inset-[8%]" aria-hidden="true">
            {Array.from({ length: GRID_SIZE }, (_, index) => (
              <span
                key={`horizontal-${index}`}
                className="absolute left-0 right-0 h-px -translate-y-1/2 bg-black/80"
                style={{ top: `${index * (100 / 9)}%` }}
              />
            ))}
            {Array.from({ length: GRID_SIZE }, (_, index) => (
              <span
                key={`vertical-${index}`}
                className="absolute bottom-0 top-0 w-px -translate-x-1/2 bg-black/80"
                style={{ left: `${index * (100 / 9)}%` }}
              />
            ))}
          </div>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const r = Math.floor(index / GRID_SIZE);
            const c = index % GRID_SIZE;
            const cell = board[r]?.[c] ?? CELL_EMPTY;
            const coordinate = `${COLS[c]}${ROWS[r]}`;
            const isWinningPiece = winningLine.some(pos => pos.r === r && pos.c === c);
            const isOccupied = cell !== CELL_EMPTY;
            const isDisabled = isOccupied || Boolean(winner) || (gameMode === 'PVE' && !isBlackTurn);
            const pieceLabel = cell === CELL_BLACK ? '黑棋' : '白棋';
            const isStarPoint = (r === 3 || r === 6) && (c === 3 || c === 6);

            return (
              <button
                key={coordinate}
                type="button"
                data-coordinate={coordinate}
                data-gomoku-intersection={coordinate}
                {...(isStarPoint ? { 'data-star-point': coordinate } : {})}
                aria-label={isOccupied ? `${coordinate}，${pieceLabel}` : `在 ${coordinate} 落${turnLabel}`}
                disabled={isDisabled}
                onClick={() => handleCellClick(r, c)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full p-0 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed"
                style={{
                  left: `${8 + c * (84 / 9)}%`,
                  top: `${8 + r * (84 / 9)}%`,
                  width: `${84 / 9}%`,
                  height: `${84 / 9}%`,
                }}
              >
                {isStarPoint && (
                  <span aria-hidden="true" className="absolute h-1.5 w-1.5 rounded-full bg-black" />
                )}
                {isOccupied && (
                  <span
                    aria-hidden="true"
                    className={`relative z-10 h-[78%] w-[78%] rounded-full shadow-md ${
                      cell === CELL_BLACK ? 'bg-black' : 'border border-stone-400 bg-white'
                    } ${isWinningPiece ? 'scale-110 ring-2 ring-green-500 ring-offset-1' : ''}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const sidebarView = (
    <div className="flex h-full min-h-0 flex-col gap-2 rounded-xl border border-stone-200 bg-white/90 p-2 text-stone-800 shadow-sm sm:gap-3 sm:p-3">
      <div id="gomoku-turn" className="rounded-lg bg-stone-100 p-2 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-stone-600">
          <Trophy aria-hidden="true" className="h-4 w-4" /> 目前狀態
        </div>
        <strong className="mt-1 block text-base">{statusText}</strong>
      </div>

      <GameModeSelector value={gameMode} onChange={setGameMode} />

      <button
        type="button"
        onClick={handleUndo}
        disabled={history.length === 0}
        aria-label="悔棋"
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm font-bold text-stone-800 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Undo2 aria-hidden="true" className="h-5 w-5" /> 悔棋
      </button>

      <p className="mt-auto rounded-lg bg-stone-50 p-2 text-xs leading-relaxed text-stone-600 sm:text-sm">
        點選空格落子，黑子先手；先連成五子或以上即可獲勝。
      </p>
    </div>
  );

  return (
    <GameShell
      title="五子棋"
      subtitle="先連成五子或以上"
      onBack={onBack}
      status={<span>{difficultyLabel}</span>}
      actions={(
        <>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            aria-label="查看遊戲規則"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            <HelpCircle aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={resetGame}
            aria-label="重設遊戲"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            <RefreshCw aria-hidden="true" className="h-5 w-5" />
          </button>
        </>
      )}
      contentClassName="bg-stone-100 text-stone-800"
    >
      <div className="relative h-full min-h-0">
        <BoardSidebarLayout
          board={boardView}
          sidebar={sidebarView}
          boardLabel="五子棋棋盤"
          sidebarLabel="五子棋狀態與操作"
          boardClassName="flex min-h-0 items-center justify-center bg-stone-200/70"
          sidebarClassName="flex min-h-0 flex-col"
          feedbackClassName="border-stone-300 text-stone-800"
        />

        {showRules && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="gomoku-rules-title" className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <h2 id="gomoku-rules-title" className="mb-4 flex items-center gap-2 text-xl font-bold text-stone-800"><HelpCircle aria-hidden="true" /> 遊戲規則</h2>
              <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-stone-700">
                <li>黑子先手，雙方輪流落子。</li>
                <li>任何一方在橫向、縱向或斜向連續排成5個或以上的同色棋子即獲勝。</li>
                <li>若棋盤下滿且無人連成5子，則為平局。</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="min-h-11 w-full rounded-lg bg-stone-800 px-3 py-2 font-bold text-white transition-colors hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                了解，開始遊戲！
              </button>
            </div>
          </div>
        )}

        {winner && isWinModalOpen && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-3">
            <div role="dialog" aria-modal="true" aria-labelledby="gomoku-result-title" className="max-h-full max-w-sm overflow-y-auto rounded-2xl border-4 border-stone-200 bg-white p-5 text-center shadow-2xl sm:p-6">
              <Trophy aria-hidden="true" className="mx-auto mb-2 h-14 w-14 text-yellow-500" />
              <h2 id="gomoku-result-title" className="mb-4 text-2xl font-bold">{winner === 1 ? '黑棋獲勝' : winner === 2 ? '白棋獲勝' : '平手'}</h2>
              <button
                type="button"
                onClick={() => setIsWinModalOpen(false)}
                className="min-h-11 rounded-lg bg-stone-800 px-6 py-2 font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                確認
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
};

export default GomokuGame;
