import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, RefreshCw, Trophy, Clock } from 'lucide-react';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

interface Position {
  r: number;
  c: number;
}

interface Treasure extends Position {
  isReal: boolean;
  isOpen: boolean;
}

const MazeNavigatorGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const [ROWS, setRows] = useState(isAdvanced ? 9 : 7);
  const [COLS, setCols] = useState(isAdvanced ? 13 : 9);
  
  const [playerPos, setPlayerPos] = useState<Position>({ r: 0, c: 0 });
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [walls, setWalls] = useState<Position[]>([]);
  const [isWin, setIsWin] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);

  const generateMaze = () => {
      const rCount = isAdvanced ? 9 : 7;
      const cCount = isAdvanced ? 13 : 9;
      setRows(rCount);
      setCols(cCount);

      setPlayerPos({ r: 0, c: 0 });
      setIsWin(false);
      setEndTime(null);
      
      const grid = Array(rCount).fill(0).map(() => Array(cCount).fill(true));
      
      // DFS Maze Generation
      const dfs = (r: number, c: number) => {
          grid[r][c] = false;
          const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]].sort(() => Math.random() - 0.5);
          for (let [dr, dc] of dirs) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < rCount && nc >= 0 && nc < cCount && grid[nr][nc]) {
                  grid[r + dr / 2][c + dc / 2] = false;
                  dfs(nr, nc);
              }
          }
      };
      
      dfs(0, 0);
      grid[rCount - 1][cCount - 1] = false; // safeguard

      const newWalls: Position[] = [];
      const emptySpots: Position[] = [];
      const deadEnds: Position[] = [];
      
      for (let i = 0; i < rCount; i++) {
          for (let j = 0; j < cCount; j++) {
              if (grid[i][j]) {
                  newWalls.push({r: i, c: j});
              } else if (i !== 0 || j !== 0) {
                  emptySpots.push({r: i, c: j});
                  
                  let pathCount = 0;
                  if (i > 0 && !grid[i-1][j]) pathCount++;
                  if (i < rCount - 1 && !grid[i+1][j]) pathCount++;
                  if (j > 0 && !grid[i][j-1]) pathCount++;
                  if (j < cCount - 1 && !grid[i][j+1]) pathCount++;
                  
                  // In a DFS maze, dead ends are leaf nodes with degree 1
                  if (pathCount === 1) {
                      deadEnds.push({r: i, c: j});
                  }
              }
          }
      }
      setWalls(newWalls);

      // Force candidate spots to be strictly dead ends so they are independently reachable
      let candidateSpots = deadEnds.length >= 3 ? deadEnds : [...deadEnds, ...emptySpots.filter(s => !deadEnds.includes(s))];
      
      // Randomize candidates so we don't always pick clustered areas
      candidateSpots.sort(() => Math.random() - 0.5);
      
      const chosenSpots: Position[] = [];
      for (const spot of candidateSpots) {
          if (chosenSpots.length === 3) break;
          // Ensure they are spread out
          const isFar = chosenSpots.every(s => Math.abs(s.r - spot.r) + Math.abs(s.c - spot.c) >= 4);
          if (isFar || chosenSpots.length === 0) {
              chosenSpots.push(spot);
          }
      }
      
      // Fallback if distance constraint was too strict
      while (chosenSpots.length < 3) {
           const spot = candidateSpots.find(s => !chosenSpots.includes(s));
           if(spot) chosenSpots.push(spot);
      }

      const newTreasures = chosenSpots.map((spot, idx) => ({
          ...spot,
          isReal: idx === 0, // 1 real, 2 fake
          isOpen: false
      })).sort(() => Math.random() - 0.5);

      setTreasures(newTreasures);
      setStartTime(Date.now());
  };

  useEffect(() => {
      generateMaze();
  }, [isAdvanced]);

  const move = (dr: number, dc: number) => {
      if (isWin) return;
      
      const nextR = playerPos.r + dr;
      const nextC = playerPos.c + dc;
      
      // Check bounds
      if (nextR < 0 || nextR >= ROWS || nextC < 0 || nextC >= COLS) {
          soundService.playWrong();
          return;
      }
      
      // Check walls
      if (walls.some(w => w.r === nextR && w.c === nextC)) {
          soundService.playWrong();
          return;
      }
      
      setPlayerPos({ r: nextR, c: nextC });
      
      const hitTreasure = treasures.find(t => t.r === nextR && t.c === nextC);
      
      if (hitTreasure) {
          if (!hitTreasure.isOpen) {
              const updated = treasures.map(t => 
                  (t.r === hitTreasure.r && t.c === hitTreasure.c) ? { ...t, isOpen: true } : t
              );
              setTreasures(updated);
              
              if (hitTreasure.isReal) {
                  soundService.playWin();
                  setIsWin(true);
                  setEndTime(Date.now());
              } else {
                  soundService.playWrong(); // It's a stone
              }
          } else {
              soundService.playTone(400, 'sine', 0.1);
          }
      } else {
          soundService.playTone(400, 'sine', 0.1);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-indigo-50 p-2 sm:p-4">
      <button 
        onClick={onBack}
        className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md text-indigo-600 hover:bg-indigo-100 z-50 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full h-full max-w-6xl flex flex-row items-center justify-center gap-4 sm:gap-10 p-4">
          
          {/* Controls Left */}
          <div className="flex flex-col gap-4 shrink-0 justify-center min-w-[140px] sm:min-w-[180px]">
              {/* Always render controls, but disable when win */}
              <div className={`flex flex-col gap-2 transition-opacity duration-500 ${isWin ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="flex justify-center">
                      <button onClick={() => move(-1, 0)} className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-indigo-600 rounded-2xl shadow-md border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 active:scale-95 transition-all"><ArrowUp size={32} /></button>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => move(0, -1)} className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-indigo-600 rounded-2xl shadow-md border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 active:scale-95 transition-all"><ArrowLeft size={32} /></button>
                      <button onClick={() => move(1, 0)} className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-indigo-600 rounded-2xl shadow-md border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 active:scale-95 transition-all"><ArrowDown size={32} /></button>
                      <button onClick={() => move(0, 1)} className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-indigo-600 rounded-2xl shadow-md border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 active:scale-95 transition-all"><ArrowRight size={32} /></button>
                  </div>
              </div>
          </div>

          {/* Maze Grid */}
          <div className="flex flex-col items-center relative flex-1">
            <div 
                className="bg-white p-2 rounded-2xl shadow-xl border-4 border-indigo-100 grid gap-1 relative"
                style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
                {Array.from({ length: ROWS * COLS }).map((_, idx) => {
                    const r = Math.floor(idx / COLS);
                    const c = idx % COLS;
                    const isWall = walls.some(w => w.r === r && w.c === c);
                    const isPlayer = playerPos.r === r && playerPos.c === c;
                    const treasure = treasures.find(t => t.r === r && t.c === c);
                    
                    return (
                        <div 
                            key={idx} 
                            className={`w-[6vw] h-[6vw] max-w-[3rem] max-h-[3rem] min-w-[1.5rem] min-h-[1.5rem] sm:w-[5vh] sm:h-[5vh] rounded-lg flex items-center justify-center text-lg sm:text-2xl transition-all duration-300 ${
                                isWall ? 'bg-slate-700 shadow-inner' : 'bg-indigo-50 border border-indigo-100/50'
                            }`}
                        >
                            {isPlayer ? (
                                <span className="animate-bounce z-10 relative drop-shadow-md">🚶</span>
                            ) : treasure ? (
                                treasure.isOpen ? (
                                    treasure.isReal ? <span className="animate-pulse drop-shadow-lg scale-125">💎</span> : <span>🕸️</span>
                                ) : (
                                    <span>🧰</span>
                                )
                            ) : isWall ? (
                                <span className="opacity-50">🧱</span>
                            ) : null}
                        </div>
                    );
                })}
            </div>
            
            {/* Victory Overlay */}
            {isWin && endTime && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center">
                     <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-3xl" />
                     <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-4 border-yellow-400 flex flex-col items-center animate-fade-in-up z-10 text-center">
                         <div className="text-6xl mb-2 drop-shadow-md animate-bounce">💎</div>
                         <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-2">尋寶成功！</h2>
                         <p className="text-lg font-bold text-indigo-700 mb-6 flex justify-center items-center gap-2">
                             <Clock size={20} /> {((endTime - startTime) / 1000).toFixed(1)} 秒
                         </p>
                         <button 
                             onClick={generateMaze}
                             className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 shadow-md flex justify-center items-center gap-2 active:scale-95 text-lg"
                         >
                             <RefreshCw size={20} /> 再玩一次
                         </button>
                     </div>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};

export default MazeNavigatorGame;
