
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy, ArrowRight } from 'lucide-react';
import { PuzzleLevel, Difficulty } from '../types';
import { generatePuzzleLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import GridFocusScreen from './game-ui/GridFocusScreen';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

const PuzzleGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<PuzzleLevel | null>(null);
  const [currentGrid, setCurrentGrid] = useState<{id: number, content: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setIsRoundComplete(false);
    setSelectedIdx(null);
    
    const data = await generatePuzzleLevel(difficulty as Difficulty);
    setLevel(data);
    setCurrentGrid(data.scrambled);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const handleTileClick = (index: number) => {
    if (isRoundComplete || !level) return;

    if (selectedIdx === null) {
        // Select first tile
        setSelectedIdx(index);
    } else {
        if (selectedIdx === index) {
            // Deselect
            setSelectedIdx(null);
        } else {
            // Swap
            const newGrid = [...currentGrid];
            const temp = newGrid[selectedIdx];
            newGrid[selectedIdx] = newGrid[index];
            newGrid[index] = temp;
            setCurrentGrid(newGrid);
            setSelectedIdx(null);
            
            checkWin(newGrid);
        }
    }
  };

  const checkWin = (grid: {id: number, content: string}[]) => {
      if (!level) return;
      // Check if IDs match their index (0, 1, 2...)
      const isCorrect = grid.every((item, idx) => item.id === idx);
      
      if (isCorrect) {
          soundService.playCorrect();
          setIsRoundComplete(true);
          
          // Time-based scoring for puzzle
          const timeTaken = (Date.now() - startTimeRef.current) / 1000;
          let points = 20; // Base points
          
          // Difficulty adjustment
          const speedLimit1 = difficulty === 'NORMAL' ? 10 : 20;
          const speedLimit2 = difficulty === 'NORMAL' ? 20 : 40;
          
          if (timeTaken < speedLimit1) points += 20;      // Fast! +20
          else if (timeTaken < speedLimit2) points += 10; // Medium +10
          
          setScore(s => s + points);
      }
  };

  const handleNext = () => {
      if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
          startRound();
      } else {
          setIsFinished(true);
          soundService.playWin();
      }
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setIsFinished(false);
    startRound();
  };

  if (isFinished) {
    return (
      <GameShell title="拼圖達人" subtitle="本回合完成" onBack={onBack} className="bg-teal-50">
       <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-teal-200">
          <Trophy className="w-20 h-20 text-teal-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-teal-900 mb-2">拼圖大師！</h2>
          <div className="text-6xl font-black text-teal-600 mb-4">{score}</div>
          <p className="text-gray-600 mb-8">你的空間概念很棒！</p>
          <div className="flex gap-4">
            <button onClick={onBack} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">回主選單</button>
            <button onClick={handleRestart} className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 shadow-lg">再玩一次</button>
          </div>
        </div>
       </div>
      </GameShell>
    );
  }

  if (loading || !level) {
    return <GameShell title="拼圖達人" subtitle="交換方塊還原目標圖片" onBack={onBack} className="bg-teal-50"><div role="status" className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-teal-500 w-12 h-12" /></div></GameShell>;
  }

  const gridStyle = {
      gridTemplateColumns: `repeat(${level.gridSize}, 1fr)`,
  };

  const rowStyle = {
      gridTemplateRows: `repeat(${level.gridSize}, 1fr)`,
  };

  const labels = ['A', 'B', 'C'].slice(0, level.gridSize);
  const rows = [1, 2, 3].slice(0, level.gridSize);

  // Dynamic Font Size for tiles based on grid density
  const fontSize = level.gridSize > 2 ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl';

  return (
    <GridFocusScreen
      title="拼圖達人"
      subtitle="交換方塊還原目標圖片"
      difficulty={difficulty}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      onBack={onBack}
      className="bg-teal-50"
      statusClassName="bg-teal-100 text-teal-800"
      advancedClassName="bg-teal-600"
      playfieldLabel="拼圖交換矩陣"
      supportLabel="目標圖片"
      playfieldClassName="flex items-center justify-center overflow-hidden"
      supportClassName="flex items-center justify-center overflow-hidden"
      support={(
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-teal-100 bg-white p-2 shadow-md">
                <div className="text-xs text-center text-gray-400 mb-1 font-bold">目標</div>
                <div className="grid h-32 w-32 gap-1" style={gridStyle}>
                    {level.targetImage.map((item, idx) => (
                        <div key={idx} className="bg-gray-100 flex items-center justify-center text-3xl sm:text-4xl rounded">
                            {item}
                        </div>
                    ))}
                </div>
            </div>
      )}
      playfield={(
            <div className="flex h-full max-h-[30rem] aspect-square flex-col items-center">
                {/* Column Labels (Top) */}
                <div className="mb-0 flex w-full justify-around pl-6">
                    {labels.map((label) => (
                        <div key={label} className="flex-1 text-center text-sm font-bold leading-none text-teal-700 sm:text-base">
                            {label}
                        </div>
                    ))}
                </div>
                
                <div className="flex min-h-0 w-full flex-1 items-center">
                    {/* Row Labels (Left) - Use Grid to match alignment exactly */}
                    <div className="grid h-full w-6 gap-1 pr-0.5" style={rowStyle}>
                        {rows.map((r) => (
                            <div key={r} className="flex items-center justify-center text-sm font-bold text-teal-700 sm:text-base">
                                {r}
                            </div>
                        ))}
                    </div>

                    {/* The Interactive Grid */}
                    {/* Using vmin ensures it scales down on short landscape screens to avoid cropping */}
                    <div 
                        className={`grid h-full flex-1 gap-1 rounded-xl border-4 bg-white p-2 shadow-xl transition-all ${isRoundComplete ? 'border-green-400' : 'border-teal-200'}`}
                        style={gridStyle}
                    >
                        {currentGrid.map((tile, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleTileClick(idx)}
                                disabled={isRoundComplete}
                                className={`
                                    rounded-lg flex items-center justify-center ${fontSize} transition-all duration-300
                                    ${selectedIdx === idx ? 'bg-yellow-100 ring-4 ring-yellow-300 scale-95 z-10' : 'bg-gray-50 hover:bg-gray-100'}
                                    ${isRoundComplete ? 'bg-green-50' : ''}
                                `}
                            >
                                {tile.content}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
      )}
      feedback={isRoundComplete ? (
                <div className="flex items-center gap-4 text-green-700">
                    <span>答對了！</span>
                    <button
                        onClick={handleNext}
                        className="flex min-h-11 items-center rounded-full bg-teal-600 px-6 font-bold text-white shadow-lg hover:bg-teal-700"
                    >
                        下一題 <ArrowRight className="ml-2 w-4 h-4"/>
                    </button>
                </div>
      ) : <span className="text-teal-700">點擊兩個方塊交換位置</span>}
    />
  );
};

export default PuzzleGame;
