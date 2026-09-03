
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Gem } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import GameModeSelector from './game-ui/GameModeSelector';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

// 0-5: Player 1 Pits
// 6: Player 1 Store
// 7-12: Player 2 Pits (Top, reversed visually)
// 13: Player 2 Store
const TOTAL_PITS = 14;
const P1_STORE = 6;
const P2_STORE = 13;

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const MancalaGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [board, setBoard] = useState<number[]>([]);
  const [turn, setTurn] = useState(1); // 1 = P1 (Bottom), 2 = P2 (Top)
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');
  const [winner, setWinner] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const topPlayerLabel = gameMode === 'PVE' ? '藍方（電腦）' : '藍方（玩家2）';
  const bottomPlayerLabel = gameMode === 'PVE' ? '紅方（你）' : '紅方（玩家1）';

  useEffect(() => {
    resetGame();
  }, [gameMode]);

  const resetGame = () => {
    // Initial seeds: 4 per pit, 0 in stores
    const newBoard = Array(TOTAL_PITS).fill(4);
    newBoard[P1_STORE] = 0;
    newBoard[P2_STORE] = 0;
    setBoard(newBoard);
    setTurn(1);
    setWinner(null);
    setIsAnimating(false);
    setMessage(gameMode === 'PVE' ? "請選擇下方你的空袋子" : "紅方回合 (下方)");
  };

  const checkEndGame = (currentBoard: number[]) => {
      const p1Empty = currentBoard.slice(0, 6).every(seeds => seeds === 0);
      const p2Empty = currentBoard.slice(7, 13).every(seeds => seeds === 0);

      if (p1Empty || p2Empty) {
          // Capture remainders
          const finalBoard = [...currentBoard];
          let p1Rem = 0;
          for(let i=0; i<6; i++) { p1Rem += finalBoard[i]; finalBoard[i] = 0; }
          let p2Rem = 0;
          for(let i=7; i<13; i++) { p2Rem += finalBoard[i]; finalBoard[i] = 0; }
          
          finalBoard[P1_STORE] += p1Rem;
          finalBoard[P2_STORE] += p2Rem;
          setBoard(finalBoard);

          if (finalBoard[P1_STORE] > finalBoard[P2_STORE]) setWinner(1);
          else if (finalBoard[P2_STORE] > finalBoard[P1_STORE]) setWinner(2);
          else setWinner(3); // Draw
          
          soundService.playWin();
          return true;
      }
      return false;
  };

  const handlePitClick = (index: number) => {
      if (winner || isAnimating) return;
      if (gameMode === 'PVE' && turn === 2) return;

      // Validate move
      if (turn === 1 && (index < 0 || index > 5)) return;
      if (turn === 2 && (index < 7 || index > 12)) return;
      if (board[index] === 0) return;

      move(index);
  };

  const move = async (startIndex: number) => {
      setIsAnimating(true);
      let newBoard = [...board];
      let seeds = newBoard[startIndex];
      newBoard[startIndex] = 0;
      setBoard([...newBoard]);
      soundService.playGameSound('RISE');
      
      // Pause slightly before moving
      await new Promise(r => setTimeout(r, 300));

      let currentIndex = startIndex;
      while (seeds > 0) {
          currentIndex = (currentIndex + 1) % TOTAL_PITS;
          // Skip opponent's store
          if (turn === 1 && currentIndex === P2_STORE) continue;
          if (turn === 2 && currentIndex === P1_STORE) continue;

          newBoard[currentIndex]++;
          seeds--;
          
          setBoard([...newBoard]);
          soundService.playGameSound('BOUNCE'); // Tap sound
          await new Promise(r => setTimeout(r, 200)); // Animation Delay
      }

      // Rules check
      const lastIndex = currentIndex;
      let nextTurn = turn === 1 ? 2 : 1;
      let extraTurn = false;

      // 1. Land in own store -> Free turn
      if ((turn === 1 && lastIndex === P1_STORE) || (turn === 2 && lastIndex === P2_STORE)) {
          nextTurn = turn;
          extraTurn = true;
          setMessage(turn === 1 ? "再一次！ (紅方)" : (gameMode === 'PVE' ? "電腦再一次" : "再一次！ (藍方)"));
          soundService.playGameSound('HIGH');
      } 
      // 2. Capture: Land in empty own pit across from non-empty opponent pit
      else if (
          newBoard[lastIndex] === 1 && 
          ((turn === 1 && lastIndex >= 0 && lastIndex <= 5) || (turn === 2 && lastIndex >= 7 && lastIndex <= 12))
      ) {
          const oppositeIndex = 12 - lastIndex;
          if (newBoard[oppositeIndex] > 0) {
              const captured = newBoard[oppositeIndex] + 1;
              newBoard[oppositeIndex] = 0;
              newBoard[lastIndex] = 0;
              newBoard[turn === 1 ? P1_STORE : P2_STORE] += captured;
              setBoard([...newBoard]);
              soundService.playGameSound('BOUNCE');
          }
      }
      
      if (!checkEndGame(newBoard)) {
          if (!extraTurn) {
              setTurn(nextTurn);
              setMessage(nextTurn === 1 ? (gameMode === 'PVE' ? "換你 (紅方)" : "紅方回合") : (gameMode === 'PVE' ? "電腦思考中..." : "藍方回合"));
          }
      }
      setIsAnimating(false);
  };

  // AI
  useEffect(() => {
      if (gameMode === 'PVE' && turn === 2 && !winner && !isAnimating) {
          const timer = setTimeout(async () => {
              const { getAdvancedMove, getNormalMove } = await import('../utils/mancalaAI');
              const bestMove = difficulty === 'ADVANCED' ? getAdvancedMove(board) : getNormalMove(board);
              if (bestMove !== -1) {
                  move(bestMove);
              }
          }, 800);
          return () => clearTimeout(timer);
      }
  }, [turn, board, winner, gameMode, isAnimating, difficulty]);

  const Pit: React.FC<{ idx: number; isStore?: boolean; owner?: number }> = ({ idx, isStore = false, owner = 0 }) => {
      const seeds = board[idx] || 0;
      
      let colorClass = 'bg-amber-100 border-amber-300';
      if (isStore) {
          if (owner === 1) colorClass = 'bg-red-200 border-red-400'; // P1 Store Red
          else if (owner === 2) colorClass = 'bg-blue-200 border-blue-400'; // P2 Store Blue
      } else {
          // Normal Pits - Color borders to indicate ownership
          if (owner === 1) colorClass = 'bg-amber-100 border-red-400'; 
          else if (owner === 2) colorClass = 'bg-amber-100 border-blue-400';
      }

      // Visual seeds: randomly jittered dots
      return (
          <button 
            disabled={isStore || winner !== null || (gameMode === 'PVE' && owner === 2) || isAnimating}
            onClick={() => !isStore && handlePitClick(idx)}
            {...(isStore
              ? { 'data-mancala-store': owner === 1 ? 'P1' : 'P2' }
              : { 'data-mancala-pit': idx })}
            aria-label={isStore
              ? `${owner === 1 ? '紅方' : '藍方'}計分槽，${seeds} 顆`
              : `${owner === 1 ? '下方紅方' : '上方藍方'}棋洞 ${LABELS[owner === 1 ? idx : 12 - idx]}，${seeds} 顆`}
                className={`
                relative flex items-center justify-center rounded-full border-4 shadow-inner transition-colors duration-300
                ${isStore 
                    ? `w-16 h-32 max-[767px]:landscape:w-[72px] max-[767px]:landscape:h-36 max-[767px]:portrait:w-12 max-[767px]:portrait:h-24 min-[768px]:w-24 min-[768px]:h-48 min-[1024px]:w-28 min-[1024px]:h-56 ${colorClass}`
                    : `w-12 h-12 max-[767px]:landscape:w-14 max-[767px]:landscape:h-14 max-[767px]:portrait:w-9 max-[767px]:portrait:h-9 min-[768px]:w-16 min-[768px]:h-16 min-[1024px]:w-20 min-[1024px]:h-20 ${colorClass}`
                }
                ${!isStore && ((owner === 1 && turn === 1) || (owner === 2 && turn === 2)) && !isAnimating ? 'ring-4 ring-yellow-400 cursor-pointer hover:bg-amber-50' : ''}
            `}
          >
              <div className="flex flex-wrap justify-center content-center gap-1 p-1 w-full h-full overflow-hidden">
                  {Array.from({length: Math.min(seeds, 15)}).map((_, i) => (
                      <div key={i} className={`rounded-full shadow-sm ${i % 3 === 0 ? 'bg-blue-500' : i % 3 === 1 ? 'bg-red-500' : 'bg-green-500'} ${isStore ? 'w-3 h-3 min-[768px]:w-4 min-[768px]:h-4' : 'w-2.5 h-2.5 min-[768px]:w-3 min-[768px]:h-3'} animate-fade-in`}></div>
                  ))}
                  {seeds > 15 && <span className="text-xs font-bold">+{seeds-15}</span>}
              </div>
              {/* Count Badge */}
              <div className="absolute -bottom-3 bg-white px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-gray-300 shadow pointer-events-none text-gray-800">
                  {seeds}
              </div>
          </button>
      )
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-cyan-50 overflow-hidden">
        {/* Header */}
        <div className="flex-none min-h-14 p-2 flex justify-between items-center gap-2 bg-white shadow-sm z-10">
            <button onClick={onBack} aria-label="返回" className="min-h-11 min-w-11 p-1.5 bg-gray-100 rounded-full text-cyan-800 flex items-center justify-center"><ArrowLeft size={20} /></button>
            <GameModeSelector value={gameMode} onChange={setGameMode} className="w-auto min-w-[10.5rem] max-w-[13rem]" />
            <button onClick={resetGame} aria-label="重新開始" className="min-h-11 min-w-11 p-1.5 bg-gray-100 rounded-full text-cyan-800 flex items-center justify-center"><RefreshCw size={20} /></button>
        </div>

        {/* Message */}
        <div className="flex-none text-center py-2 bg-cyan-100 text-cyan-900 font-bold">
            {winner ? (winner === 1 ? "紅方獲勝！" : winner === 2 ? "藍方獲勝！" : "平手") : message}
        </div>

        {/* Board - Fixed Layout Issue */}
        <div className="flex-1 flex items-center justify-center p-2 bg-cyan-50 overflow-hidden w-full">
            {/* Wide board container; responsive sizing keeps labels and pits in a reserved flow. */}
            <div 
                data-mancala-board="true"
                className="bg-[#DEB887] p-2 max-[767px]:landscape:p-3 min-[768px]:p-4 min-[1024px]:p-6 rounded-[2rem] min-[768px]:rounded-[3rem] shadow-2xl border-4 min-[768px]:border-8 border-[#8B4513] relative flex items-center gap-2 max-[767px]:landscape:gap-3 min-[768px]:gap-3 min-[1024px]:gap-4 max-w-full"
            >
                
                {/* P2 Store (Left) - Blue */}
                <Pit idx={13} isStore owner={2} />

                {/* Rows Container */}
                <div className="flex flex-col gap-1 max-[767px]:landscape:gap-2 min-[768px]:gap-2 justify-center">
                    
                    {/* Top Row (P2) - Indices 12 down to 7 */}
                    <div className="flex flex-col items-center">
                        <div className="text-[#8B4513] font-bold text-[10px] min-[768px]:text-sm leading-tight text-center whitespace-nowrap">{topPlayerLabel}</div>
                        {/* Top Coordinates Labels */}
                        <div className="flex gap-1.5 max-[767px]:landscape:gap-2 min-[768px]:gap-3 w-full justify-around mb-1" aria-label="上方藍方座標">
                            {LABELS.map(l => (
                                <span key={`top-${l}`} className="text-[#8B4513] font-bold text-xs min-[768px]:text-sm w-12 max-[767px]:landscape:w-14 max-[767px]:portrait:w-9 min-[768px]:w-16 min-[1024px]:w-20 text-center select-none opacity-80">{l}</span>
                            ))}
                        </div>
                        <div className="flex gap-1.5 max-[767px]:landscape:gap-2 min-[768px]:gap-3">
                            {[12, 11, 10, 9, 8, 7].map(i => <Pit key={i} idx={i} owner={2} />)}
                        </div>
                    </div>

                    {/* Bottom Row (P1) - Indices 0 to 5 */}
                    <div className="flex flex-col items-center">
                        <div className="flex gap-1.5 max-[767px]:landscape:gap-2 min-[768px]:gap-3">
                            {[0, 1, 2, 3, 4, 5].map(i => <Pit key={i} idx={i} owner={1} />)}
                        </div>
                        {/* Bottom Coordinates Labels */}
                        <div className="flex gap-1.5 max-[767px]:landscape:gap-2 min-[768px]:gap-3 w-full justify-around mt-1" aria-label="下方紅方座標">
                            {LABELS.map(l => (
                                <span key={`bot-${l}`} className="text-[#8B4513] font-bold text-xs min-[768px]:text-sm w-12 max-[767px]:landscape:w-14 max-[767px]:portrait:w-9 min-[768px]:w-16 min-[1024px]:w-20 text-center select-none opacity-80">{l}</span>
                            ))}
                        </div>
                        <div className="text-[#8B4513] font-bold text-[10px] min-[768px]:text-sm leading-tight text-center whitespace-nowrap">{bottomPlayerLabel}</div>
                    </div>
                </div>

                {/* P1 Store (Right) - Red */}
                <Pit idx={6} isStore owner={1} />

            </div>
        </div>

        {winner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white p-8 rounded-2xl text-center animate-bounce-short shadow-2xl border-4 border-cyan-200">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500"/>
                    <h2 className="text-2xl font-bold mb-2">
                        {winner === 1 ? "紅方獲勝！" : winner === 2 ? "藍方獲勝！" : "平手"}
                    </h2>
                    <p className="text-gray-500 mb-6">比分 {board[6]} : {board[13]}</p>
                    <button onClick={resetGame} aria-label="再來一局" className="min-h-11 px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold">再來一局</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default MancalaGame;
