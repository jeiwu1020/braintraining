import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, RefreshCw, Trophy, Clock, Mic, MicOff, HelpCircle } from 'lucide-react';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';

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
  const [showRules, setShowRules] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceHint, setVoiceHint] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const moveRef = useRef<(dr: number, dc: number) => void>(() => {});
  const isListeningRef = useRef(isListening);
  const isWinRef = useRef(isWin);
  const lastHandledIndexRef = useRef(-1);
  const clearTextTimerRef = useRef<any>(null);

  const generateMaze = useCallback(() => {
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
  }, [isAdvanced]);

  useEffect(() => {
      generateMaze();
  }, [generateMaze]);

  const move = useCallback((dr: number, dc: number) => {
      if (isWin) return;
      
      setPlayerPos(prev => {
          const nextR = prev.r + dr;
          const nextC = prev.c + dc;
          
          // Check bounds
          if (nextR < 0 || nextR >= ROWS || nextC < 0 || nextC >= COLS) {
              soundService.playWrong();
              return prev;
          }
          
          // Check walls
          if (walls.some(w => w.r === nextR && w.c === nextC)) {
              soundService.playWrong();
              return prev;
          }

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
          return { r: nextR, c: nextC };
      });
  }, [isWin, ROWS, COLS, walls, treasures]);

  // Keep a ref to the latest move() so the (long-lived) speech recognition
  // instance always calls the current logic without needing to be recreated.
  useEffect(() => {
      moveRef.current = move;
  }, [move]);

  useEffect(() => {
      isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
      isWinRef.current = isWin;
  }, [isWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move(-1, 0);
      if (e.key === 'ArrowDown') move(1, 0);
      if (e.key === 'ArrowLeft') move(0, -1);
      if (e.key === 'ArrowRight') move(0, 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Direction keywords, incl. common variants and same-sound homophones, so
  // words like "上/下/左/右" have a better chance of matching even with
  // imperfect ASR (e.g. "右" is very often misheard as "又"/"幼"/"佑" since
  // they share the exact same pronunciation yòu).
  //
  // Matching is deliberately two-tiered:
  //  - exactWords: the ENTIRE utterance must equal the word. This is what
  //    lets us safely accept homophones like "又" — since it only counts
  //    when that's the whole thing the user said, it won't accidentally
  //    fire from an unrelated sentence that happens to contain "又"/"有".
  //  - phraseWords: matched anywhere inside a longer sentence, only used for
  //    multi-character phrases ("往右"/"右邊") which already carry enough
  //    context to be unambiguous.
  const DIRECTIONS = [
      {
          dr: -1, dc: 0,
          label: '上',
          words: ['上', 'up', '往上', '上面', '上走'],
      },
      {
          dr: 1, dc: 0,
          label: '下',
          words: ['下', 'down', '往下', '下面', '下走'],
      },
      {
          dr: 0, dc: -1,
          label: '左',
          words: ['左', '佐', 'left', '往左', '左邊', '左走'],
      },
      {
          dr: 0, dc: 1,
          label: '右',
          words: ['右', '又', '幼', '佑', 'right', '往右', '右邊', '右走'],
      },
  ];

  const matchDirection = (text: string) => {
      const t = text.trim().toLowerCase();
      if (!t) return null;

      let bestDir: typeof DIRECTIONS[0] | null = null;
      let maxIdx = -1;

      for (const d of DIRECTIONS) {
          for (const w of d.words) {
              const idx = t.lastIndexOf(w);
              if (idx > maxIdx) {
                  maxIdx = idx;
                  bestDir = d;
              }
          }
      }

      if (bestDir && maxIdx >= 0) {
          return { dir: bestDir, idx: maxIdx };
      }
      return null;
  };

  const lastHandledTextRef = useRef('');

  // Clears the on-screen caption a little while after the last update, so a
  // previous command's text doesn't linger and get confused with the next
  // one if there's a gap in recognition results.
  const scheduleClearRecognizedText = () => {
      if (clearTextTimerRef.current) clearTimeout(clearTextTimerRef.current);
      clearTextTimerRef.current = setTimeout(() => {
          setRecognizedText('');
          setVoiceHint('');
      }, 1800);
  };

  useEffect(() => {
      // Voice Control Setup — created ONCE and kept alive for the whole
      // component lifetime.
      if (typeof window === 'undefined' || !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
          setVoiceSupported(false);
          return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-TW';
      recognition.maxAlternatives = 3;

      recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              const primaryText = result[0].transcript.trim();

              let match = matchDirection(primaryText);
              if (!match) {
                  for (let a = 1; a < result.length; a++) {
                      const altText = result[a].transcript.trim();
                      const altMatch = matchDirection(altText);
                      if (altMatch) {
                          match = altMatch;
                          break;
                      }
                  }
              }

              if (match) {
                  const key = `${i}_${match.dir.label}_${match.idx}`;
                  if (lastHandledTextRef.current !== key) {
                      lastHandledTextRef.current = key;
                      lastHandledIndexRef.current = i;
                      
                      moveRef.current(match.dir.dr, match.dir.dc);
                      setRecognizedText(match.dir.label);
                      setVoiceHint(`✅ 辨識到「${match.dir.label}」`);
                      scheduleClearRecognizedText();
                  }
              } else {
                  setRecognizedText(primaryText);
                  scheduleClearRecognizedText();
                  if (result.isFinal) {
                      setVoiceHint(`❓ 沒聽清楚「${primaryText}」，請說「上／下／左／右」`);
                  }
              }
          }
      };

      // Fires as soon as the browser detects the user has started speaking
      // again — wipe the previous line immediately so it can't be mistaken
      // for the new command that's about to come in.
      recognition.onspeechstart = () => {
          if (clearTextTimerRef.current) clearTimeout(clearTextTimerRef.current);
          setRecognizedText('');
          setVoiceHint('👂 聆聽中...');
      };

      recognition.onerror = (event: any) => {
          if (event.error === 'no-speech' || event.error === 'aborted') {
              // Not a real problem — just keep listening.
              return;
          }
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              setVoiceHint('⚠️ 麥克風權限被拒絕，請至瀏覽器設定允許使用麥克風');
              setIsListening(false);
          } else {
              setVoiceHint('⚠️ 語音辨識發生錯誤，正在重新啟動...');
          }
      };

      recognition.onend = () => {
          lastHandledIndexRef.current = -1;
          lastHandledTextRef.current = '';
          if (isListeningRef.current && !isWinRef.current) {
              try {
                  recognition.start();
              } catch (e) {
                  // ignore — likely already starting
              }
          }
      };

      recognitionRef.current = recognition;

      return () => {
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
          recognition.onspeechstart = null;
          if (clearTextTimerRef.current) clearTimeout(clearTextTimerRef.current);
          try { recognition.stop(); } catch (e) { /* ignore */ }
      };
  }, []);

  useEffect(() => {
      if (isListening && recognitionRef.current) {
          setRecognizedText('');
          setVoiceHint('🎤 請說「上」、「下」、「左」或「右」...');
          lastHandledIndexRef.current = -1;
          try {
              recognitionRef.current.start();
          } catch (e) {
              // ignore — likely already started
          }
      } else if (!isListening && recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
          if (clearTextTimerRef.current) clearTimeout(clearTextTimerRef.current);
          setRecognizedText('');
          setVoiceHint('');
      }
  }, [isListening]);

  // Voice control stops automatically once the maze is won.
  useEffect(() => {
      if (isWin) {
          setIsListening(false);
      }
  }, [isWin]);

  const toggleListening = () => {
      setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-indigo-50 p-2 sm:p-4">
      <button 
        onClick={onBack}
        className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md text-indigo-600 hover:bg-indigo-100 z-50 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button 
              onClick={() => setShowRules(true)}
              className="p-2 sm:p-2 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100 hover:bg-blue-100 transition-colors active:scale-95 flex items-center justify-center"
              title="遊戲規則"
          >
              <HelpCircle size={24} />
          </button>
      </div>

      <RulesModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)}
          rules={[
              "控制主角在迷宮中移動。",
              "你可以點擊方向鍵，或者點擊麥克風後大喊「上」、「下」、「左」、「右」來移動，畫面上會即時顯示辨識到的文字。",
              "迷宮中有 3 個寶箱，其中只有 1 個是真的鑽石，其他 2 個是石頭。",
              "避開障礙物，盡快找出真正的鑽石！",
              "計分方式：顯示你找到鑽石所花費的總秒數。"
          ]}
      />

      <div className="w-full h-full max-w-6xl flex flex-row items-center justify-center gap-4 sm:gap-10 p-4 pt-12 sm:pt-4">
          
          {/* Controls Left */}
          <div className="flex flex-col gap-4 shrink-0 justify-center min-w-[140px] sm:min-w-[180px]">
              {/* Voice Control Toggle */}
              <button 
                  onClick={toggleListening}
                  className={`py-3 px-4 rounded-2xl shadow-md border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${isListening ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'}`}
              >
                  {isListening ? <Mic size={28} /> : <MicOff size={28} />}
                  <span className="text-xs sm:text-sm font-bold">{isListening ? '收音中...' : '開啟聲控'}</span>
              </button>

              {!voiceSupported && (
                  <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center">
                      此瀏覽器不支援語音辨識，請改用 Chrome 開啟
                  </div>
              )}

              {isListening && (
                  <div className="bg-white rounded-2xl shadow-md border border-indigo-100 px-3 py-2 flex flex-col items-center gap-1 min-h-[3.5rem] justify-center">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-bold">辨識到的文字</span>
                      <span className="text-sm sm:text-lg font-bold text-indigo-700 break-all text-center">
                          {recognizedText || '...'}
                      </span>
                      {voiceHint && (
                          <span className="text-[10px] sm:text-xs text-slate-500 text-center">{voiceHint}</span>
                      )}
                  </div>
              )}

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
