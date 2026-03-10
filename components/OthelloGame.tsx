
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const SIZE = 8;
const EMPTY = 0;
const BLACK = 1; // Player 1 (Starts)
const WHITE = 2; // Player 2 or AI

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8'];

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

const OthelloGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [turn, setTurn] = useState(BLACK);
  const [winner, setWinner] = useState<number | null>(null); 
  const [blackCount, setBlackCount] = useState(2);
  const [whiteCount, setWhiteCount] = useState(2);
  const [validMoves, setValidMoves] = useState<{r:number, c:number}[]>([]);
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
      resetGame();
  }, [gameMode]);

  const resetGame = () => {
    const b = Array(SIZE).fill(0).map(() => Array(SIZE).fill(EMPTY));
    b[3][3] = WHITE; b[3][4] = BLACK;
    b[4][3] = BLACK; b[4][4] = WHITE;
    setBoard(b);
    setTurn(BLACK);
    setWinner(null);
    updateCounts(b);
    setValidMoves(getValidMoves(b, BLACK));
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

  const isValidMove = (b: number[][], r: number, c: number, player: number) => {
    if (b[r][c] !== EMPTY) return false;
    const opponent = player === BLACK ? WHITE : BLACK;
    const directions = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
    for (const [dr, dc] of directions) {
      let nr = r + dr, nc = c + dc;
      let flipped = false;
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === opponent) {
        nr += dr; nc += dc;
        flipped = true;
      }
      if (flipped && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === player) return true;
    }
    return false;
  };

  const getValidMoves = (b: number[][], player: number) => {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (isValidMove(b, r, c, player)) moves.push({r, c});
      }
    }
    return moves;
  };

  const flipPieces = (b: number[][], r: number, c: number, player: number) => {
    const newBoard = b.map(row => [...row]);
    newBoard[r][c] = player;
    const opponent = player === BLACK ? WHITE : BLACK;
    const directions = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
    for (const [dr, dc] of directions) {
      let nr = r + dr, nc = c + dc;
      let toFlip = [];
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && newBoard[nr][nc] === opponent) {
        toFlip.push({r: nr, c: nc});
        nr += dr; nc += dc;
      }
      if (toFlip.length > 0 && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && newBoard[nr][nc] === player) {
        toFlip.forEach(p => newBoard[p.r][p.c] = player);
      }
    }
    return newBoard;
  };

  const handleMove = (r: number, c: number) => {
    if (winner) return;
    if (gameMode === 'PVE' && turn !== BLACK) return; 
    if (!validMoves.some(m => m.r === r && m.c === c)) return;

    const currentPlayer = turn;
    const nextPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    const nextBoard = flipPieces(board, r, c, currentPlayer);
    setBoard(nextBoard);
    updateCounts(nextBoard);
    soundService.playGameSound('BOUNCE');
    
    let nextMoves = getValidMoves(nextBoard, nextPlayer);
    if (nextMoves.length > 0) {
        setTurn(nextPlayer);
        setValidMoves(nextMoves);
    } else {
        const currentMoves = getValidMoves(nextBoard, currentPlayer);
        if (currentMoves.length > 0) {
            setValidMoves(currentMoves);
            alert(`${nextPlayer === BLACK ? "黑方" : "白方"} 無路可走，${currentPlayer === BLACK ? "黑方" : "白方"} 繼續！`);
        } else {
            endGame(nextBoard);
        }
    }
  };

  const endGame = (b: number[][]) => {
      let blk = 0, wht = 0;
      b.forEach(row => row.forEach(c => {
          if (c === BLACK) blk++; else if (c === WHITE) wht++;
      }));
      if (blk > wht) { setWinner(1); soundService.playWin(); }
      else if (wht > blk) { setWinner(2); soundService.playWin(); }
      else setWinner(3);
  };

  // Improved AI Logic
  useEffect(() => {
    if (gameMode === 'PVE' && turn === WHITE && !winner) {
        const timer = setTimeout(() => {
            const aiMoves = getValidMoves(board, WHITE);
            if (aiMoves.length === 0) {
                const pMoves = getValidMoves(board, BLACK);
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

            const nextBoard = flipPieces(board, bestMove.r, bestMove.c, WHITE);
            setBoard(nextBoard);
            updateCounts(nextBoard);
            soundService.playGameSound('LOW');
            const pMoves = getValidMoves(nextBoard, BLACK);
            if (pMoves.length > 0) { setTurn(BLACK); setValidMoves(pMoves); }
            else {
                const nextAiMoves = getValidMoves(nextBoard, WHITE);
                if (nextAiMoves.length > 0) { setValidMoves(nextAiMoves); } // Force re-render if state logic needed
                else endGame(nextBoard);
            }
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [turn, board, winner, gameMode]);

  return (
    <div className="flex flex-col h-[100dvh] bg-emerald-50 overflow-hidden">
        {/* Compact Header */}
        <div className="flex-none p-2 flex justify-between items-center bg-white shadow-sm z-10 h-12 sm:h-14">
            <button onClick={onBack} className="p-1.5 bg-gray-100 rounded-full text-emerald-800"><ArrowLeft size={18} /></button>
            <button 
                onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-xs sm:text-sm font-bold text-emerald-900 border border-emerald-200"
            >
                {gameMode === 'PVE' ? <User size={14} /> : <Users size={14} />}
                {gameMode === 'PVE' ? '單人' : '雙人'}
            </button>
            <button onClick={resetGame} className="p-1.5 bg-gray-100 rounded-full text-emerald-800"><RefreshCw size={18} /></button>
        </div>

        {/* Scores */}
        <div className="flex justify-center gap-6 py-1 font-bold text-base sm:text-lg bg-emerald-100 flex-none">
            <div className={`flex items-center gap-2 ${turn === BLACK ? 'scale-110 text-black' : 'text-gray-500'}`}>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black rounded-full shadow"></div> 
                {gameMode === 'PVP' ? '黑' : '你'}: {blackCount}
            </div>
            <div className={`flex items-center gap-2 ${turn === WHITE ? 'scale-110 text-black' : 'text-gray-500'}`}>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white border border-gray-400 rounded-full shadow"></div> 
                {gameMode === 'PVP' ? '白' : '腦'}: {whiteCount}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 bg-emerald-100 overflow-hidden w-full">
            {/* 
                CRITICAL FIX: 
                The board plus labels must fit within the viewport.
                Landscape height is small.
                We constrain the outer wrapper, not just the board inside.
                We use `w-full` max width but restrict by `max-height`.
            */}
            <div 
                className="flex flex-col items-center justify-center w-full"
                style={{
                    maxHeight: 'min(75vh, 100vw)', // Height constraint
                    maxWidth: 'min(75vh, 90vw)',   // Width matches height (square-ish target)
                    aspectRatio: '1/1'
                }}
            >
                {/* Top Labels */}
                <div className="flex pl-6 mb-0.5 w-full shrink-0">
                    {COLS.map(c => (
                        <div key={c} className="flex-1 text-center font-bold text-emerald-800 text-[10px] sm:text-xs">{c}</div>
                    ))}
                </div>

                <div className="flex w-full flex-1 min-h-0">
                    {/* Left Labels */}
                    <div className="flex flex-col justify-between pr-1 py-2 w-6 shrink-0">
                        {ROWS.map(r => (
                            <div key={r} className="flex-1 flex items-center justify-center font-bold text-emerald-800 text-[10px] sm:text-xs">{r}</div>
                        ))}
                    </div>

                    {/* Board */}
                    <div className="bg-emerald-700 p-1 sm:p-2 rounded-lg shadow-xl border-4 border-emerald-800 w-full h-full">
                        <div 
                            className="w-full h-full grid gap-0.5 bg-emerald-800 border-2 border-emerald-900"
                            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gridTemplateRows: `repeat(${SIZE}, 1fr)` }}
                        >
                            {board.map((row, r) => row.map((cell, c) => {
                                const isValid = validMoves.some(m => m.r === r && m.c === c);
                                const showHint = isValid && (gameMode === 'PVP' || turn === BLACK);
                                return (
                                    <div 
                                        key={`${r}-${c}`} 
                                        onClick={() => handleMove(r, c)}
                                        className={`bg-emerald-600 flex items-center justify-center relative w-full h-full ${showHint ? 'cursor-pointer hover:bg-emerald-500' : ''}`}
                                    >
                                        {/* Pieces forced to be circles with smaller dimensions to avoid edge touch */}
                                        {cell === BLACK && <div className="w-[85%] h-[85%] rounded-full bg-black shadow-lg animate-fade-in"></div>}
                                        {cell === WHITE && <div className="w-[85%] h-[85%] rounded-full bg-white shadow-lg animate-fade-in border-gray-200 border"></div>}
                                        {showHint && <div className="w-[20%] h-[20%] rounded-full bg-black/20"></div>}
                                    </div>
                                )
                            }))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {winner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white p-6 rounded-2xl text-center animate-bounce-short shadow-2xl border-4 border-emerald-200">
                    <Trophy className="w-16 h-16 mx-auto mb-2 text-yellow-500"/>
                    <h2 className="text-xl font-bold mb-2">
                        {winner === 1 ? "黑方獲勝！" : winner === 2 ? "白方獲勝！" : "平分秋色"}
                    </h2>
                    <p className="text-gray-500 mb-4 text-sm">黑 {blackCount} : 白 {whiteCount}</p>
                    <button onClick={resetGame} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow">再來一局</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default OthelloGame;
