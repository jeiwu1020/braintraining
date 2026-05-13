
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User, Undo2, HelpCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1; // Red
const AI = 2;     // Yellow

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const ConnectFourGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<number | null>(null);
  const [winningCells, setWinningCells] = useState<{r:number, c:number}[]>([]);
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
    const newBoard = Array(ROWS).fill(0).map(() => Array(COLS).fill(EMPTY));
    setBoard(newBoard);
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningCells([]);
    setHistory([]);
    setTurnHistory([]);
  };

  const checkWin = (b: number[][], player: number) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) return [{r,c}, {r,c:c+1}, {r,c:c+2}, {r,c:c+3}];
      }
    }
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        if (b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) return [{r,c}, {r:r+1,c}, {r:r+2,c}, {r:r+3,c}];
      }
    }
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) return [{r,c}, {r:r+1,c:c+1}, {r:r+2,c:c+2}, {r:r+3,c:c+3}];
      }
    }
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (b[r][c] === player && b[r-1][c+1] === player && b[r-2][c+2] === player && b[r-3][c+3] === player) return [{r,c}, {r:r-1,c:c+1}, {r:r-2,c:c+2}, {r:r-3,c:c+3}];
      }
    }
    return null;
  };

  const getValidRow = (b: number[][], col: number) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][col] === EMPTY) return r;
    }
    return -1;
  };

  const handleColumnClick = (col: number) => {
    if (winner) return;
    if (gameMode === 'PVE' && !isPlayerTurn) return;

    const currentPlayer = isPlayerTurn ? PLAYER : AI;
    const r = getValidRow(board, col);
    if (r === -1) return;

    setHistory([...history, board.map(row => [...row])]);
    setTurnHistory([...turnHistory, isPlayerTurn]);

    const newBoard = board.map(row => [...row]);
    newBoard[r][col] = currentPlayer;
    setBoard(newBoard);
    soundService.playGameSound('FALL');

    const win = checkWin(newBoard, currentPlayer);
    if (win) {
      setWinner(currentPlayer);
      setWinningCells(win);
      soundService.playWin();
    } else {
      setIsPlayerTurn(!isPlayerTurn);
    }
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
            const r = getValidRow(board, c);
            if (r !== -1) {
                const tempBoard = board.map(row => [...row]);
                tempBoard[r][c] = AI;
                if (checkWin(tempBoard, AI)) { bestCol = c; break; }
            }
        }

        // 2. Check for Immediate Block (Player Win)
        if (bestCol === -1) {
            for (let c = 0; c < COLS; c++) {
                const r = getValidRow(board, c);
                if (r !== -1) {
                    const tempBoard = board.map(row => [...row]);
                    tempBoard[r][c] = PLAYER;
                    if (checkWin(tempBoard, PLAYER)) { bestCol = c; break; }
                }
            }
        }

        // 3. Strategic Move (Score based)
        if (bestCol === -1) {
            const scores: {col: number, score: number}[] = [];
            const centerCol = Math.floor(COLS / 2);

            for (let c = 0; c < COLS; c++) {
                const r = getValidRow(board, c);
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
                    if (checkWin(tempBoard, PLAYER)) {
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
            const r = getValidRow(board, bestCol);
            const newBoard = board.map(row => [...row]);
            newBoard[r][bestCol] = AI;
            setBoard(newBoard);
            soundService.playGameSound('LOW');
            const win = checkWin(newBoard, AI);
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

  return (
    <div className="flex flex-col landscape:flex-row h-[100dvh] bg-blue-50 overflow-hidden text-blue-900">
        {/* Header / Sidebar */}
        <div className="flex-none p-2 flex landscape:flex-col justify-between items-center bg-white shadow-sm z-10 portrait:h-14 landscape:w-16 landscape:h-full">
            <button onClick={onBack} className="p-1.5 md:p-2 bg-blue-50 rounded-full text-blue-800 hover:bg-blue-100">
                <ArrowLeft size={18} />
            </button>
            <div className="flex portrait:flex-row landscape:flex-col gap-2">
                <button 
                    onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 landscape:p-2 bg-blue-50 rounded-full text-xs sm:text-sm font-bold text-blue-900 border border-blue-200"
                >
                    {gameMode === 'PVE' ? <User size={14} /> : <Users size={14} />}
                    <span className="landscape:hidden">{gameMode === 'PVE' ? '單人' : '雙人'}</span>
                </button>
                <button 
                    onClick={handleUndo} 
                    disabled={history.length === 0}
                    className="p-1.5 md:p-2 bg-blue-50 rounded-full text-blue-900 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center"
                >
                    <Undo2 size={16} />
                </button>
                <button 
                    onClick={() => setShowRules(true)} 
                    className="p-1.5 md:p-2 bg-blue-50 rounded-full text-blue-900 border border-blue-200 hover:bg-blue-100 flex items-center justify-center"
                >
                    <HelpCircle size={16} />
                </button>
            </div>
            <button onClick={resetGame} className="p-1.5 md:p-2 bg-blue-50 rounded-full text-blue-800 hover:bg-blue-100">
                <RefreshCw size={18} />
            </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Status */}
            <div className="flex-none text-center py-1 sm:py-2 font-bold text-blue-900 text-sm sm:text-lg bg-blue-100/50">
                {winner ? (winner === 1 ? "紅方獲勝！" : "黃方獲勝！") : (isPlayerTurn ? "紅方回合" : "黃方回合")}
            </div>

            {/* Main Board */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden w-full h-full">
                {/* Scaled Wrapper: Constrain by width or height */}
                <div className="relative bg-blue-600 rounded-b-xl rounded-t-lg shadow-2xl p-2 sm:p-3 pt-8" style={{ height: 'min(75vh, 600px, 90vw * 6 / 7)', aspectRatio: '7/6' }}>
                
                {/* Labels Top - moved inside container relative to top */}
                <div className="absolute top-1 left-0 w-full flex justify-around px-2">
                    {COL_LABELS.map((label, c) => (
                        <div key={c} className="w-full text-center font-bold text-blue-100 text-xs sm:text-sm">{label}</div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 bg-blue-700 p-2 rounded-lg border-4 border-blue-800 h-full w-full">
                    {board.map((row, r) => (
                        row.map((cell, c) => {
                            const isWin = winningCells.some(w => w.r === r && w.c === c);
                            // Determine if column is interactive
                            const isColumnFull = board[0][c] !== EMPTY;
                            const isInteractable = !winner && (gameMode === 'PVP' || isPlayerTurn) && !isColumnFull;

                            return (
                                <div 
                                    key={`${r}-${c}`} 
                                    onClick={() => handleColumnClick(c)}
                                    className={`
                                        w-full h-full rounded-full shadow-inner border border-black/10 transition-colors duration-300
                                        ${cell === EMPTY ? 'bg-blue-900/30' : cell === PLAYER ? 'bg-red-500' : 'bg-yellow-400'}
                                        ${isWin ? 'ring-4 ring-white animate-pulse' : ''}
                                        ${isInteractable ? 'cursor-pointer' : ''}
                                        ${isInteractable && cell === EMPTY ? 'hover:bg-blue-800/40' : ''}
                                    `}
                                />
                            );
                        })
                    ))}
                </div>
                
                {/* Legs */}
                <div className="absolute -bottom-4 left-4 w-3 h-4 bg-blue-800 rounded-b"></div>
                <div className="absolute -bottom-4 right-4 w-3 h-4 bg-blue-800 rounded-b"></div>
            </div>
            </div>
        </div>

        {/* Rules Modal */}
        {showRules && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900"><HelpCircle /> 遊戲規則</h2>
                    <ul className="list-disc pl-5 space-y-2 text-stone-700 mb-6 text-sm">
                        <li>雙方輪流將棋子從頂部對應行數放下。</li>
                        <li>棋子會垂直落下直到抵達最底部或其他的棋子上。</li>
                        <li>先將4顆自己的棋子連成一線（橫、豎、斜）的玩家獲勝。</li>
                        <li>若棋盤被填滿且無人連成4子，則為平局。</li>
                    </ul>
                    <button 
                        onClick={() => setShowRules(false)} 
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                        了解，開始遊戲！
                    </button>
                </div>
            </div>
        )}

    </div>
  );
};

export default ConnectFourGame;
