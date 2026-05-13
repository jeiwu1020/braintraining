
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User, Undo2, HelpCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const ROWS = 4;
const COLS = 4;

const DotsAndBoxesGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  // Horizontal lines: (ROWS + 1) * COLS. Store Player ID (0=none, 1=P1, 2=P2)
  const [hLines, setHLines] = useState<number[][]>([]);
  // Vertical lines: ROWS * (COLS + 1). Store Player ID
  const [vLines, setVLines] = useState<number[][]>([]);
  
  // Squares owned by player: 0 = none, 1 = P1, 2 = P2
  const [squares, setSquares] = useState<number[][]>([]);
  const [turn, setTurn] = useState(1); // 1 = P1 (Red), 2 = P2 (Blue)
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');
  const [winner, setWinner] = useState<number | null>(null);

  interface GameState {
    hLines: number[][];
    vLines: number[][];
    squares: number[][];
    turn: number;
    scores: { p1: number, p2: number };
  }
  const [history, setHistory] = useState<GameState[]>([]);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    resetGame();
  }, [gameMode]);

  const resetGame = () => {
    setHLines(Array(ROWS + 1).fill(0).map(() => Array(COLS).fill(0)));
    setVLines(Array(ROWS).fill(0).map(() => Array(COLS + 1).fill(0)));
    setSquares(Array(ROWS).fill(0).map(() => Array(COLS).fill(0)));
    setTurn(1);
    setScores({ p1: 0, p2: 0 });
    setWinner(null);
    setHistory([]);
  };

  const checkBoxCompletion = (r: number, c: number, currentHLines: number[][], currentVLines: number[][]) => {
    const top = currentHLines[r][c] !== 0;
    const bottom = currentHLines[r + 1][c] !== 0;
    const left = currentVLines[r][c] !== 0;
    const right = currentVLines[r][c + 1] !== 0;
    return top && bottom && left && right;
  };

  const handleLineClick = (type: 'h' | 'v', r: number, c: number) => {
    if (winner) return;
    if (gameMode === 'PVE' && turn === 2) return; // AI turn block

    const isH = type === 'h';
    if (isH && hLines[r][c] !== 0) return;
    if (!isH && vLines[r][c] !== 0) return;

    // Save history before move
    setHistory(prev => [...prev, {
        hLines: hLines.map(row => [...row]),
        vLines: vLines.map(row => [...row]),
        squares: squares.map(row => [...row]),
        turn,
        scores: { ...scores }
    }]);

    makeMove(type, r, c);
  };

  const makeMove = (type: 'h' | 'v', r: number, c: number) => {
    let pointScored = false;
    const nextHLines = hLines.map(row => [...row]);
    const nextVLines = vLines.map(row => [...row]);
    const nextSquares = squares.map(row => [...row]);

    if (type === 'h') nextHLines[r][c] = turn;
    else nextVLines[r][c] = turn;

    // Check affected squares
    if (type === 'h') {
        if (r > 0 && checkBoxCompletion(r - 1, c, nextHLines, nextVLines)) {
            nextSquares[r - 1][c] = turn;
            pointScored = true;
        }
        if (r < ROWS && checkBoxCompletion(r, c, nextHLines, nextVLines)) {
            nextSquares[r][c] = turn;
            pointScored = true;
        }
    } else {
        if (c > 0 && checkBoxCompletion(r, c - 1, nextHLines, nextVLines)) {
            nextSquares[r][c - 1] = turn;
            pointScored = true;
        }
        if (c < COLS && checkBoxCompletion(r, c, nextHLines, nextVLines)) {
            nextSquares[r][c] = turn;
            pointScored = true;
        }
    }

    setHLines(nextHLines);
    setVLines(nextVLines);
    setSquares(nextSquares);
    soundService.playGameSound('BOUNCE');

    if (pointScored) {
        let p1s = 0, p2s = 0;
        nextSquares.forEach(row => row.forEach(s => {
            if (s === 1) p1s++;
            else if (s === 2) p2s++;
        }));
        setScores({ p1: p1s, p2: p2s });
        soundService.playCorrect();

        if (p1s + p2s === ROWS * COLS) {
            setWinner(p1s > p2s ? 1 : p2s > p1s ? 2 : 3); // 3 draw
            soundService.playWin();
        }
    } else {
        setTurn(prev => prev === 1 ? 2 : 1);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    // In PVT if you undo, revert to last player's state
    let targetIndex = history.length - 1;
    if (gameMode === 'PVE') {
        while (targetIndex >= 0 && history[targetIndex].turn === 2) {
            targetIndex--;
        }
        if (targetIndex < 0) targetIndex = 0;
    }

    const prevState = history[targetIndex];
    setHistory(history.slice(0, targetIndex));
    setHLines(prevState.hLines);
    setVLines(prevState.vLines);
    setSquares(prevState.squares);
    setTurn(prevState.turn);
    setScores(prevState.scores);
    setWinner(null);
  };

  // AI Logic
  useEffect(() => {
    if (gameMode === 'PVE' && turn === 2 && !winner) {
      const timer = setTimeout(() => {
        const possibleMoves: {type: 'h'|'v', r: number, c: number, completes: number, risky: boolean}[] = [];

        const checkCompletes = (type: 'h'|'v', r: number, c: number) => {
            let count = 0;
            const tempH = hLines.map(row => [...row]);
            const tempV = vLines.map(row => [...row]);
            if(type==='h') tempH[r][c] = 2; else tempV[r][c] = 2;
            
            if (type === 'h') {
                if (r > 0 && checkBoxCompletion(r-1, c, tempH, tempV)) count++;
                if (r < ROWS && checkBoxCompletion(r, c, tempH, tempV)) count++;
            } else {
                if (c > 0 && checkBoxCompletion(r, c-1, tempH, tempV)) count++;
                if (c < COLS && checkBoxCompletion(r, c, tempH, tempV)) count++;
            }
            return count;
        };

        const checkRisky = (type: 'h'|'v', r: number, c: number) => {
             const tempH = hLines.map(row => [...row]);
             const tempV = vLines.map(row => [...row]);
             if(type==='h') tempH[r][c] = 2; else tempV[r][c] = 2;
             
             const checkSquare = (sr: number, sc: number) => {
                 if (sr<0 || sr>=ROWS || sc<0 || sc>=COLS) return false;
                 if (squares[sr][sc] !== 0) return false;
                 let sides = 0;
                 if (tempH[sr][sc] !== 0) sides++;
                 if (tempH[sr+1][sc] !== 0) sides++;
                 if (tempV[sr][sc] !== 0) sides++;
                 if (tempV[sr][sc+1] !== 0) sides++;
                 return sides === 3;
             }

             if (type === 'h') {
                 if (checkSquare(r-1, c)) return true;
                 if (checkSquare(r, c)) return true;
             } else {
                 if (checkSquare(r, c-1)) return true;
                 if (checkSquare(r, c)) return true;
             }
             return false;
        };

        for(let r=0; r<=ROWS; r++) {
            for(let c=0; c<COLS; c++) {
                if(hLines[r][c] === 0) possibleMoves.push({type: 'h', r, c, completes: checkCompletes('h', r, c), risky: false});
            }
        }
        for(let r=0; r<ROWS; r++) {
            for(let c=0; c<=COLS; c++) {
                if(vLines[r][c] === 0) possibleMoves.push({type: 'v', r, c, completes: checkCompletes('v', r, c), risky: false});
            }
        }

        possibleMoves.forEach(m => {
            if (m.completes === 0) {
                m.risky = checkRisky(m.type, m.r, m.c);
            }
        });

        let bestMove = null;
        const scorers = possibleMoves.filter(m => m.completes > 0);
        if (scorers.length > 0) {
            bestMove = scorers[Math.floor(Math.random() * scorers.length)];
        } else {
            const safeMoves = possibleMoves.filter(m => !m.risky);
            if (safeMoves.length > 0) {
                bestMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
            } else {
                bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        }

        if (bestMove) {
            setHistory(prev => [...prev, {
                hLines: hLines.map(row => [...row]),
                vLines: vLines.map(row => [...row]),
                squares: squares.map(row => [...row]),
                turn,
                scores: { ...scores }
            }]);
            makeMove(bestMove.type, bestMove.r, bestMove.c);
        }

      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, hLines, vLines, squares, gameMode]);

  const getLineColor = (owner: number, isHover: boolean = false) => {
      if (owner === 1) return 'bg-red-500';
      if (owner === 2) return 'bg-blue-500';
      return isHover ? 'bg-gray-300' : 'bg-gray-100';
  };

  return (
    <div className="flex flex-col landscape:flex-row h-[100dvh] bg-rose-50 overflow-hidden">
        {/* Header / Sidebar */}
        <div className="flex-none p-2 flex landscape:flex-col justify-between items-center bg-white shadow-sm z-10 portrait:h-14 landscape:w-16 landscape:h-full text-rose-800">
            <button onClick={onBack} className="p-1.5 md:p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <ArrowLeft size={18} />
            </button>
            <div className="flex portrait:flex-row landscape:flex-col gap-2">
                <button 
                    onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 landscape:p-2 bg-rose-50 rounded-full text-xs sm:text-sm font-bold text-rose-900 border border-rose-200"
                >
                    {gameMode === 'PVE' ? <User size={14} /> : <Users size={14} />}
                    <span className="landscape:hidden">{gameMode === 'PVE' ? '單人' : '雙人'}</span>
                </button>
                <button 
                    onClick={handleUndo} 
                    disabled={history.length === 0}
                    className="p-1.5 md:p-2 bg-rose-50 rounded-full text-rose-900 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 flex items-center justify-center"
                >
                    <Undo2 size={16} />
                </button>
                <button 
                    onClick={() => setShowRules(true)} 
                    className="p-1.5 md:p-2 bg-rose-50 rounded-full text-rose-900 border border-rose-200 hover:bg-rose-100 flex items-center justify-center"
                >
                    <HelpCircle size={16} />
                </button>
            </div>
            <button onClick={resetGame} className="p-1.5 md:p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <RefreshCw size={18} />
            </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Score Board - Compact Version */}
            <div className="flex justify-center gap-8 py-1 bg-rose-100 border-b border-rose-200 z-10">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${turn === 1 ? 'bg-white shadow-md border-2 border-red-400' : 'opacity-70'}`}>
                <div className="text-xs text-gray-500 font-bold whitespace-nowrap">{gameMode === 'PVP' ? '紅方' : '你'}</div>
                <div className="text-xl font-black text-red-500">{scores.p1}</div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${turn === 2 ? 'bg-white shadow-md border-2 border-blue-400' : 'opacity-70'}`}>
                <div className="text-xs text-gray-500 font-bold whitespace-nowrap">{gameMode === 'PVP' ? '藍方' : '電腦'}</div>
                <div className="text-xl font-black text-blue-500">{scores.p2}</div>
            </div>
        </div>

            {/* Game Board */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-rose-50 overflow-hidden">
                <div className="bg-white p-4 rounded-xl shadow-2xl border-4 border-rose-200" style={{ width: 'min(90vw, min(65vh, 600px))', height: 'min(90vw, min(65vh, 600px))' }}>
                    <div className="relative w-full h-full">
                    
                    {/* Render Squares (Backgrounds) */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                        {squares.map((row, r) => row.map((owner, c) => (
                            <div key={`sq-${r}-${c}`} className={`flex items-center justify-center m-1 rounded-lg transition-colors duration-500 ${owner === 1 ? 'bg-red-100' : owner === 2 ? 'bg-blue-100' : 'bg-transparent'}`}>
                                {owner !== 0 && (owner === 1 ? <div className="text-red-500 font-bold text-xl">紅</div> : <div className="text-blue-500 font-bold text-xl">藍</div>)}
                            </div>
                        )))}
                    </div>

                    {/* Render Dots */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-20">
                        {Array.from({length: ROWS + 1}).map((_, r) => (
                            <div key={`dr-${r}`} className="flex justify-between">
                                {Array.from({length: COLS + 1}).map((_, c) => (
                                    <div key={`d-${r}-${c}`} className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full -m-1.5 sm:-m-2 border border-gray-600"></div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Hit Areas - Horizontal */}
                    <div className="absolute inset-0 flex flex-col justify-between z-10">
                        {hLines.map((row, r) => (
                            <div key={`hr-${r}`} className="flex h-0 relative">
                                {row.map((owner, c) => (
                                    <div 
                                        key={`h-${r}-${c}`} 
                                        onClick={() => handleLineClick('h', r, c)}
                                        className="flex-1 h-6 sm:h-8 -mt-3 sm:-mt-4 cursor-pointer group flex items-center justify-center relative"
                                    >
                                        <div className={`h-1.5 sm:h-2 w-full rounded-full transition-colors duration-200 ${getLineColor(owner, false)} group-hover:${owner === 0 ? 'bg-gray-300' : ''}`}></div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Hit Areas - Vertical */}
                    <div className="absolute inset-0 flex flex-row justify-between z-10 pointer-events-none">
                        {Array.from({length: COLS + 1}).map((_, c) => (
                            <div key={`vc-${c}`} className="flex flex-col w-0 relative pointer-events-auto">
                                {vLines.map((row, r) => (
                                    <div 
                                        key={`v-${r}-${c}`} 
                                        onClick={() => handleLineClick('v', r, c)}
                                        className="flex-1 w-6 sm:w-8 -ml-3 sm:-ml-4 cursor-pointer group flex flex-col items-center justify-center"
                                    >
                                        <div className={`w-1.5 sm:w-2 h-full rounded-full transition-colors duration-200 ${getLineColor(row[c], false)} group-hover:${row[c] === 0 ? 'bg-gray-300' : ''}`}></div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <div className="mt-4 text-rose-800 font-bold text-sm mb-4">
                點擊點與點之間的線條來連線
            </div>
        </div>
        </div>

        {/* Rules Modal */}
        {showRules && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><HelpCircle /> 遊戲規則</h2>
                    <ul className="list-disc pl-5 space-y-2 text-stone-700 mb-6 text-sm">
                        <li>雙方輪流在相鄰的兩個點之間畫一條橫線或直線。</li>
                        <li>誰畫下第四條線完成一個「正方形（格子）」，該格即歸他所有，他可以加1分並且<b>「獲得額外一次畫線機會」</b>。</li>
                        <li>所有格子被佔滿後結束，分數多者獲勝。</li>
                    </ul>
                    <button 
                        onClick={() => setShowRules(false)} 
                        className="w-full py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700"
                    >
                        了解，開始遊戲！
                    </button>
                </div>
            </div>
        )}

        {winner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white p-8 rounded-2xl text-center animate-bounce-short shadow-2xl border-4 border-rose-200">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500"/>
                    <h2 className="text-2xl font-bold mb-2">
                        {winner === 1 ? "紅方獲勝！" : winner === 2 ? "藍方獲勝！" : "平手"}
                    </h2>
                    <p className="text-gray-500 mb-6">{scores.p1} : {scores.p2}</p>
                    <button onClick={resetGame} className="px-6 py-2 bg-rose-600 text-white rounded-lg font-bold">再來一局</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default DotsAndBoxesGame;
