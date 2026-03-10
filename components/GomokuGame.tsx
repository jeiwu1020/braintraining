
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const GRID_SIZE = 10;
const CELL_EMPTY = 0;
const CELL_BLACK = 1; // Player 1 (Always starts)
const CELL_WHITE = 2; // Player 2 or AI

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const GomokuGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [isBlackTurn, setIsBlackTurn] = useState(true);
  const [winner, setWinner] = useState<number | null>(null); // 0: null, 1: Black, 2: White, 3: Draw
  const [winningLine, setWinningLine] = useState<{r:number, c:number}[]>([]);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');

  useEffect(() => {
    resetGame();
  }, []); 

  useEffect(() => {
      resetGame();
  }, [gameMode]);

  const resetGame = () => {
    const newBoard = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(CELL_EMPTY));
    setBoard(newBoard);
    setIsBlackTurn(true);
    setWinner(null);
    setWinningLine([]);
    setIsWinModalOpen(false);
  };

  const checkWin = (currentBoard: number[][], player: number) => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentBoard[r][c] !== player) continue;
        for (const [dr, dc] of directions) {
          let count = 1;
          const line = [{r, c}];
          for (let k = 1; k < 5; k++) {
            const nr = r + k * dr;
            const nc = c + k * dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && currentBoard[nr][nc] === player) {
              count++;
              line.push({r: nr, c: nc});
            } else { break; }
          }
          if (count === 5) return line;
        }
      }
    }
    return null;
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
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard);
    soundService.playGameSound('BOUNCE');

    const winLine = checkWin(newBoard, currentPlayer);
    if (winLine) {
      setWinningLine(winLine);
      setWinner(currentPlayer);
      setIsWinModalOpen(true);
      soundService.playWin();
    } else {
      setIsBlackTurn(!isBlackTurn);
    }
  };

  useEffect(() => {
    if (gameMode === 'PVE' && !isBlackTurn && !winner) {
      const timer = setTimeout(() => {
        const move = getAIMove(board);
        if (move) {
          const newBoard = board.map(row => [...row]);
          newBoard[move.r][move.c] = CELL_WHITE;
          setBoard(newBoard);
          soundService.playGameSound('LOW');
          const winLine = checkWin(newBoard, CELL_WHITE);
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

  return (
    <div className="flex flex-col h-[100dvh] bg-stone-100 overflow-hidden">
      {/* Compact Header */}
      <div className="flex-none p-2 flex justify-between items-center bg-white shadow-sm z-10 h-12 sm:h-14">
        <button onClick={onBack} className="p-1.5 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200">
          <ArrowLeft size={18} />
        </button>
        <button 
            onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')}
            className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-full text-xs sm:text-sm font-bold text-stone-700 border border-stone-300"
        >
            {gameMode === 'PVE' ? <User size={14} /> : <Users size={14} />}
            {gameMode === 'PVE' ? '單人' : '雙人'}
        </button>
        <button onClick={resetGame} className="p-1.5 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex-none text-center py-1 bg-stone-200 text-stone-800 font-bold text-sm">
          {winner ? (winner === 1 ? "黑棋獲勝！" : winner === 2 ? "白棋獲勝！" : "平手") : (isBlackTurn ? "黑棋回合" : "白棋回合")}
      </div>

      {/* Main Board Area - Flex to center, strict overflow hidden */}
      <div className="flex-1 flex items-center justify-center p-1 sm:p-2 bg-stone-200 overflow-hidden w-full">
        
        {/* Dynamic Sizing Container: Reduced height max to 70vh to avoid clipping */}
        <div className="flex flex-col items-center justify-center" style={{ width: 'min(85vw, 70vh)' }}>
            
            {/* Top Coordinates */}
            <div className="flex pl-6 mb-0.5 w-full">
                {COLS.map(c => (
                    <div key={c} className="flex-1 text-center text-[10px] sm:text-xs font-bold text-stone-600">{c}</div>
                ))}
            </div>

            <div className="flex w-full items-stretch">
                {/* Left Coordinates */}
                <div className="flex flex-col justify-between pr-1 py-2 w-6">
                    {ROWS.map(r => (
                        <div key={r} className="flex-1 flex items-center justify-center text-[10px] sm:text-xs font-bold text-stone-600">{r}</div>
                    ))}
                </div>

                {/* The Board Aspect Ratio Square */}
                <div className="bg-[#DEB887] shadow-xl relative border-2 border-stone-800 flex-1 aspect-square">
                    <div 
                        className="w-full h-full grid"
                        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}
                    >
                        {board.map((row, r) => row.map((cell, c) => {
                            const isWinningPiece = winningLine.some(pos => pos.r === r && pos.c === c);
                            const isTop = r === 0;
                            const isBottom = r === GRID_SIZE - 1;
                            const isLeft = c === 0;
                            const isRight = c === GRID_SIZE - 1;

                            return (
                                <div 
                                    key={`${r}-${c}`} 
                                    onClick={() => handleCellClick(r, c)}
                                    className="relative flex items-center justify-center cursor-pointer"
                                >
                                    {/* Lines */}
                                    <div className={`absolute h-px bg-black w-full top-1/2 ${isLeft ? 'left-1/2 w-1/2' : ''} ${isRight ? 'right-1/2 w-1/2' : ''}`}></div>
                                    <div className={`absolute w-px bg-black h-full left-1/2 ${isTop ? 'top-1/2 h-1/2' : ''} ${isBottom ? 'bottom-1/2 h-1/2' : ''}`}></div>
                                    
                                    {/* Star Points */}
                                    { ((r===3||r===6) && (c===3||c===6)) && <div className="absolute w-1.5 h-1.5 bg-black rounded-full z-0"></div> }

                                    {/* Piece */}
                                    {cell !== CELL_EMPTY && (
                                        <div className={`
                                            w-[85%] h-[85%] rounded-full shadow-md z-10 transition-transform duration-200
                                            ${cell === CELL_BLACK ? 'bg-black radial-gradient-black' : 'bg-white radial-gradient-white'}
                                            ${isWinningPiece ? 'ring-2 ring-green-500 scale-110' : ''}
                                        `}></div>
                                    )}
                                </div>
                            );
                        }))}
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Winner Overlay */}
      {winner && isWinModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none">
            <div className="bg-white p-6 rounded-2xl animate-bounce-short text-center shadow-2xl pointer-events-auto border-4 border-stone-200">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-2"/>
                <h2 className="text-2xl font-bold mb-4">{winner === 1 ? "黑棋獲勝" : winner === 2 ? "白棋獲勝" : "平手"}</h2>
                <button onClick={() => setIsWinModalOpen(false)} className="px-6 py-2 bg-stone-800 text-white rounded-lg font-bold">確認</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default GomokuGame;
