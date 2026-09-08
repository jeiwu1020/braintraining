
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

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1; // Red
const AI = 2;     // Yellow

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const MOBILE_CONFIRM_QUERY = '(pointer: coarse) and (max-width: 767px), (pointer: coarse) and (max-height: 600px)';

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));

export const getConnectFourValidRow = (b: number[][], col: number) => {
  for (let r = ROWS - 1; r >= 0; r -= 1) {
    if (b[r]?.[col] === EMPTY) return r;
  }
  return -1;
};

export const findConnectFourWinningCells = (b: number[][], player: number) => {
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS - 3; c += 1) {
      if (b[r]?.[c] === player && b[r]?.[c + 1] === player && b[r]?.[c + 2] === player && b[r]?.[c + 3] === player) {
        return [{ r, c }, { r, c: c + 1 }, { r, c: c + 2 }, { r, c: c + 3 }];
      }
    }
  }
  for (let r = 0; r < ROWS - 3; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (b[r]?.[c] === player && b[r + 1]?.[c] === player && b[r + 2]?.[c] === player && b[r + 3]?.[c] === player) {
        return [{ r, c }, { r: r + 1, c }, { r: r + 2, c }, { r: r + 3, c }];
      }
    }
  }
  for (let r = 0; r < ROWS - 3; r += 1) {
    for (let c = 0; c < COLS - 3; c += 1) {
      if (b[r]?.[c] === player && b[r + 1]?.[c + 1] === player && b[r + 2]?.[c + 2] === player && b[r + 3]?.[c + 3] === player) {
        return [{ r, c }, { r: r + 1, c: c + 1 }, { r: r + 2, c: c + 2 }, { r: r + 3, c: c + 3 }];
      }
    }
  }
  for (let r = 3; r < ROWS; r += 1) {
    for (let c = 0; c < COLS - 3; c += 1) {
      if (b[r]?.[c] === player && b[r - 1]?.[c + 1] === player && b[r - 2]?.[c + 2] === player && b[r - 3]?.[c + 3] === player) {
        return [{ r, c }, { r: r - 1, c: c + 1 }, { r: r - 2, c: c + 2 }, { r: r - 3, c: c + 3 }];
      }
    }
  }
  return null;
};

const cloneBoard = (value: number[][]) => value.map(row => [...row]);

const ConnectFourGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL', initialBoard }) => {
  const [board, setBoard] = useState<number[][]>(() => initialBoard ? cloneBoard(initialBoard) : createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<number | null>(null);
  const [winningCells, setWinningCells] = useState<{r:number, c:number}[]>([]);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');
  const [history, setHistory] = useState<number[][][]>([]);
  const [turnHistory, setTurnHistory] = useState<boolean[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [pendingColumn, setPendingColumn] = useState<number | null>(null);
  const [isMobileConfirmMode, setIsMobileConfirmMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_CONFIRM_QUERY);
    const updateConfirmMode = () => setIsMobileConfirmMode(mediaQuery.matches);
    updateConfirmMode();
    mediaQuery.addEventListener('change', updateConfirmMode);
    return () => mediaQuery.removeEventListener('change', updateConfirmMode);
  }, []);

  useEffect(() => {
    if (!isMobileConfirmMode) setPendingColumn(null);
  }, [isMobileConfirmMode]);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
      resetGame();
  }, [gameMode]);

  const resetGame = () => {
    const newBoard = initialBoard ? cloneBoard(initialBoard) : createEmptyBoard();
    setBoard(newBoard);
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningCells([]);
    setHistory([]);
    setTurnHistory([]);
    setPendingColumn(null);
  };

  const isColumnPlayable = (col: number) => (
    !winner && (gameMode === 'PVP' || isPlayerTurn) && board[0]?.[col] === EMPTY
  );

  const handleColumnClick = (col: number) => {
    if (!isColumnPlayable(col)) return false;

    const currentPlayer = isPlayerTurn ? PLAYER : AI;
    const r = getConnectFourValidRow(board, col);
    if (r === -1) return false;

    setHistory([...history, board.map(row => [...row])]);
    setTurnHistory([...turnHistory, isPlayerTurn]);

    const newBoard = board.map(row => [...row]);
    newBoard[r][col] = currentPlayer;
    setBoard(newBoard);
    soundService.playGameSound('FALL');

    const win = findConnectFourWinningCells(newBoard, currentPlayer);
    if (win) {
      setWinner(currentPlayer);
      setWinningCells(win);
      soundService.playWin();
    } else {
      setIsPlayerTurn(!isPlayerTurn);
    }
    return true;
  };

  const handleConfirmMove = () => {
    if (pendingColumn === null) return;
    if (handleColumnClick(pendingColumn)) setPendingColumn(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    let stepsToUndo = 1;
    if (gameMode === 'PVE' && isPlayerTurn && history.length >= 2) {
      stepsToUndo = 2; // Undo AI's move and player's move
    }
    
    const newHistory = [...history];
    const newTurnHistory = [...turnHistory];
    
    const prevBoard = newHistory[newHistory.length - stepsToUndo];
    const prevTurn = newTurnHistory[newTurnHistory.length - stepsToUndo];
    
    newHistory.splice(newHistory.length - stepsToUndo, stepsToUndo);
    newTurnHistory.splice(newTurnHistory.length - stepsToUndo, stepsToUndo);
    
    setBoard(prevBoard);
    setIsPlayerTurn(prevTurn);
    setHistory(newHistory);
    setTurnHistory(newTurnHistory);
    setWinner(null);
    setWinningCells([]);
    setPendingColumn(null);
  };

  // Improved AI
  useEffect(() => {
    if (gameMode === 'PVE' && !isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        setHistory(prev => [...prev, board.map(row => [...row])]);
        setTurnHistory(prev => [...prev, isPlayerTurn]);
        let bestCol = -1;
        
        // 1. Check for Immediate Win (AI)
        for (let c = 0; c < COLS; c++) {
            const r = getConnectFourValidRow(board, c);
            if (r !== -1) {
                const tempBoard = board.map(row => [...row]);
                tempBoard[r][c] = AI;
                if (findConnectFourWinningCells(tempBoard, AI)) { bestCol = c; break; }
            }
        }

        // 2. Check for Immediate Block (Player Win)
        if (bestCol === -1) {
            for (let c = 0; c < COLS; c++) {
                const r = getConnectFourValidRow(board, c);
                if (r !== -1) {
                    const tempBoard = board.map(row => [...row]);
                    tempBoard[r][c] = PLAYER;
                    if (findConnectFourWinningCells(tempBoard, PLAYER)) { bestCol = c; break; }
                }
            }
        }

        // 3. Strategic Move (Score based)
        if (bestCol === -1) {
            const scores: {col: number, score: number}[] = [];
            const centerCol = Math.floor(COLS / 2);

            for (let c = 0; c < COLS; c++) {
                const r = getConnectFourValidRow(board, c);
                if (r === -1) continue;

                let score = 0;
                
                // Bias towards center
                score += (COLS - Math.abs(c - centerCol));

                // LOOKAHEAD: Bad Move Check
                // If we play here, does the square ABOVE allow the player to win?
                if (r > 0) { // If not top row
                    const tempBoard = board.map(row => [...row]);
                    tempBoard[r][c] = AI; // Assume we play here
                    // Check if player wins by playing at r-1
                    tempBoard[r-1][c] = PLAYER;
                    if (findConnectFourWinningCells(tempBoard, PLAYER)) {
                        score -= 1000; // Terrible move
                    }
                }

                scores.push({col: c, score});
            }

            if (scores.length > 0) {
                scores.sort((a, b) => b.score - a.score);
                // Pick random from top options to vary gameplay slightly
                const bestScore = scores[0].score;
                const candidates = scores.filter(s => s.score >= bestScore - 2);
                bestCol = candidates[Math.floor(Math.random() * candidates.length)].col;
            }
        }

        if (bestCol !== -1) {
            const r = getConnectFourValidRow(board, bestCol);
            const newBoard = board.map(row => [...row]);
            newBoard[r][bestCol] = AI;
            setBoard(newBoard);
            soundService.playGameSound('LOW');
            const win = findConnectFourWinningCells(newBoard, AI);
            if (win) {
                setWinner(AI);
                setWinningCells(win);
                soundService.playWrong();
            } else if (newBoard.every(row => row.every(c => c !== EMPTY))) {
                setWinner(3);
            } else {
                setIsPlayerTurn(true);
            }
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board, gameMode]);

  const difficultyLabel = difficulty === 'ADVANCED' ? '進階' : '一般';
  const statusText = winner === 1
    ? '紅方獲勝！'
    : winner === 2
      ? '黃方獲勝！'
      : winner === 3
        ? '平局'
        : (isPlayerTurn ? '紅方回合' : '黃方回合');

  const boardView = (
    <div className="flex h-full min-h-0 w-full items-center justify-center p-1 sm:p-2">
      <div className="relative flex h-full max-h-full w-full max-w-full items-center justify-center">
        <div
          className="connect-four-board relative flex max-w-full flex-col rounded-b-2xl rounded-t-xl bg-blue-600 p-2 shadow-2xl sm:p-3"
          style={{ width: 'min(100%, calc((100dvh - 9rem) * 7 / 6))' }}
        >
          <div aria-label="欄位座標" className="grid shrink-0 grid-cols-7 gap-1 px-2 pb-1 text-xs font-extrabold text-white sm:gap-1.5 sm:px-3 sm:pb-1.5 sm:text-sm">
            {COL_LABELS.map(label => <span key={label} className="w-full text-center">{label}</span>)}
          </div>

          <div className="grid aspect-[7/6] w-full grid-cols-7 gap-1 rounded-lg border-4 border-blue-800 bg-blue-700 p-1.5 sm:gap-1.5 sm:p-2">
            {COL_LABELS.map((label, c) => {
              const isColumnFull = board[0]?.[c] !== EMPTY;
              const isColumnPlayable = !winner && (gameMode === 'PVP' || isPlayerTurn) && !isColumnFull;

              return (
                <button
                  key={label}
                  type="button"
                  data-column={label}
                  aria-label={isMobileConfirmMode ? `請使用欄位選擇器預覽 ${label} 欄` : `在 ${label} 欄落子`}
                  aria-describedby="connect-four-turn"
                  disabled={!isColumnPlayable || isMobileConfirmMode}
                  onClick={() => handleColumnClick(c)}
                  className={`group relative grid min-h-0 min-w-0 flex-1 grid-rows-6 gap-1 rounded-md p-0 transition-colors after:absolute after:-inset-x-2 after:inset-y-0 after:content-[''] hover:bg-blue-800/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-80 ${pendingColumn === c ? 'ring-4 ring-yellow-300 ring-offset-2 ring-offset-blue-700' : ''}`}
                >
                  {Array.from({ length: ROWS }, (_, r) => {
                    const cell = board[r]?.[c] ?? EMPTY;
                    const isWin = winningCells.some(w => w.r === r && w.c === c);
                    const isPreview = pendingColumn === c && r === getConnectFourValidRow(board, c);

                    return (
                      <span
                        key={`${r}-${c}`}
                        aria-hidden="true"
                        data-connect-four-hole="true"
                        className={`aspect-square w-full min-h-0 min-w-0 self-center rounded-full border border-black/10 shadow-inner transition-colors duration-300 ${
                          cell === EMPTY ? 'bg-blue-900/30' : cell === PLAYER ? 'bg-red-500' : 'bg-yellow-400'
                        } ${isWin ? 'ring-4 ring-white ring-offset-1 ring-offset-blue-700 animate-pulse' : ''} ${isPreview ? 'ring-4 ring-white/90 ring-offset-1 ring-offset-yellow-300' : ''}`}
                      />
                    );
                  })}
                </button>
              );
            })}
          </div>

          <div className="absolute -bottom-4 left-4 h-4 w-3 rounded-b bg-blue-800" />
          <div className="absolute -bottom-4 right-4 h-4 w-3 rounded-b bg-blue-800" />
        </div>
      </div>
    </div>
  );

  const sidebarView = (
    <div className="flex h-full min-h-0 flex-col gap-2 rounded-xl border border-blue-100 bg-white/90 p-2 text-blue-900 shadow-sm sm:gap-3 sm:p-3">
      <div className="connect-four-mobile-column-picker" data-connect-four-mobile-picker="true" aria-label="手機欄位選擇">
        <div className="mb-1 text-center text-xs font-bold text-blue-800">手機請先選欄位</div>
        <div className="grid grid-cols-3 gap-1.5">
          {COL_LABELS.map((label, c) => {
            const isColumnPlayable = !winner && (gameMode === 'PVP' || isPlayerTurn) && board[0]?.[c] === EMPTY;
            return (
              <button
                key={label}
                type="button"
                data-column-picker={label}
                aria-label={`預覽在 ${label} 欄落子`}
                aria-pressed={pendingColumn === c}
                disabled={!isColumnPlayable}
                onClick={() => setPendingColumn(c)}
                className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-2 py-1 text-base font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-40 ${pendingColumn === c ? 'border-yellow-500 bg-yellow-100 text-yellow-900 shadow-inner' : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div aria-live="polite" className="mt-1 rounded-lg bg-blue-50 px-2 py-1 text-center text-xs font-semibold text-blue-800">
          {pendingColumn === null ? '先選欄位，再確認落子' : `已選 ${COL_LABELS[pendingColumn]} 欄，請確認落子`}
        </div>
        {pendingColumn !== null && (
          <button
            type="button"
            data-connect-four-confirm="true"
            onClick={handleConfirmMove}
            className="mt-1 flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            確認落子 {COL_LABELS[pendingColumn]} 欄
          </button>
        )}
      </div>

      <div id="connect-four-turn" className="rounded-lg bg-blue-50 p-2 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-700">
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
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-2 py-1 text-sm font-bold text-blue-900 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Undo2 aria-hidden="true" className="h-5 w-5" /> 悔棋
      </button>

      <p className="mt-auto rounded-lg bg-slate-50 p-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
        點選欄位落子，率先連成四子即可獲勝。
      </p>
    </div>
  );

  return (
    <GameShell
      title="四子棋"
      subtitle="率先連成四子"
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
      contentClassName="bg-blue-50 text-blue-900"
    >
      <div className="relative h-full min-h-0">
        <BoardSidebarLayout
          board={boardView}
          sidebar={sidebarView}
          boardLabel="四子棋棋盤"
          sidebarLabel="四子棋狀態與操作"
          boardClassName="flex min-h-0 items-center justify-center"
          sidebarClassName="flex min-h-0 flex-col"
        />

        {showRules && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="connect-four-rules-title" className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <h2 id="connect-four-rules-title" className="mb-4 flex items-center gap-2 text-xl font-bold text-blue-900"><HelpCircle aria-hidden="true" /> 遊戲規則</h2>
              <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-stone-700">
                <li>雙方輪流將棋子從頂部對應行數放下。</li>
                <li>棋子會垂直落下直到抵達最底部或其他的棋子上。</li>
                <li>先將4顆自己的棋子連成一線（橫、豎、斜）的玩家獲勝。</li>
                <li>若棋盤被填滿且無人連成4子，則為平局。</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="min-h-11 w-full rounded-lg bg-blue-600 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
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

export default ConnectFourGame;
