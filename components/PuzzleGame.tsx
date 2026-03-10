
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { PuzzleLevel, Difficulty } from '../types';
import { generatePuzzleLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-teal-50 p-4 animate-fade-in">
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
    );
  }

  if (loading || !level) {
    return <div className="min-h-screen bg-teal-50 flex items-center justify-center"><Loader2 className="animate-spin text-teal-500 w-12 h-12" /></div>;
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
    <div className="flex flex-col h-screen bg-teal-50 overflow-hidden relative">
      {/* Header - Compact */}
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10 h-14">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-teal-800 shadow-sm hover:bg-teal-100"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-4">
          {difficulty === 'ADVANCED' && <span className="bg-teal-600 text-white px-2 py-1 rounded text-xs">進階</span>}
          <div className="text-teal-800 font-bold">第 {round} / {TOTAL_ROUNDS} 題</div>
          <div className="flex items-center bg-teal-100 px-3 py-1 rounded-full text-teal-800 font-bold"><Trophy size={16} className="mr-2"/> {score}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-1 w-full h-full overflow-hidden">
        
        {/* Title: Hidden on small height screens (landscape phones) to save vertical space */}
        <div className="text-center shrink-0 hidden sm:block h-8">
            <h2 className="text-lg font-bold text-teal-900">還原圖片</h2>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-12 w-full h-full max-h-[85vh]">
            
            {/* Target Preview (Left) - Increased Size */}
            <div className="bg-white p-2 rounded-xl shadow-md border-2 border-teal-100 shrink-0 flex flex-col items-center justify-center">
                <div className="text-xs text-center text-gray-400 mb-1 font-bold">目標</div>
                <div className="grid gap-1 w-[28vmin] h-[28vmin] max-w-[180px] max-h-[180px] min-w-[100px] min-h-[100px]" style={gridStyle}>
                    {level.targetImage.map((item, idx) => (
                        <div key={idx} className="bg-gray-100 flex items-center justify-center text-3xl sm:text-4xl rounded">
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Game Grid with Coordinates (Right) */}
            <div className="flex flex-col items-center shrink-0">
                {/* Column Labels (Top) */}
                <div className="flex pl-6 mb-1 w-full justify-around">
                    {labels.map((label) => (
                        <div key={label} className="flex-1 text-center font-bold text-teal-700 text-base sm:text-lg">
                            {label}
                        </div>
                    ))}
                </div>
                
                <div className="flex items-center">
                    {/* Row Labels (Left) - Use Grid to match alignment exactly */}
                    <div className="grid gap-1 w-6 pr-1 h-[55vmin] max-h-[350px] min-h-[200px]" style={rowStyle}>
                        {rows.map((r) => (
                            <div key={r} className="flex items-center justify-center font-bold text-teal-700 text-base sm:text-lg">
                                {r}
                            </div>
                        ))}
                    </div>

                    {/* The Interactive Grid */}
                    {/* Using vmin ensures it scales down on short landscape screens to avoid cropping */}
                    <div 
                        className={`grid gap-1 bg-white p-2 rounded-xl shadow-xl border-4 ${isRoundComplete ? 'border-green-400' : 'border-teal-200'} w-[55vmin] h-[55vmin] max-w-[350px] max-h-[350px] min-w-[200px] min-h-[200px] transition-all`} 
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
        </div>

        {/* Feedback / Controls Footer */}
        <div className="h-14 flex items-center justify-center relative w-full shrink-0 mt-1">
            {isRoundComplete ? (
                <div className="flex items-center gap-4 animate-fade-in-up z-20">
                    <div className="bg-green-100 border-green-500 text-green-700 px-4 py-1.5 rounded-full font-bold shadow-md flex items-center gap-2 border-2 whitespace-nowrap">
                        <CheckCircle size={20} />
                        <span className="text-base">答對了！</span>
                    </div>
                    <button 
                        onClick={handleNext}
                        className="px-6 py-1.5 bg-teal-600 text-white rounded-full font-bold shadow-lg hover:bg-teal-700 flex items-center text-base"
                    >
                        下一題 <ArrowRight className="ml-2 w-4 h-4"/>
                    </button>
                </div>
            ) : (
                <p className="text-teal-600 text-sm animate-pulse bg-white/50 px-4 py-1 rounded-full">點擊兩個方塊交換位置</p>
            )}
        </div>

      </div>
    </div>
  );
};

export default PuzzleGame;
