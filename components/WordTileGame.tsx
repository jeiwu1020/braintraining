import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, HelpCircle } from 'lucide-react';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';
import { NORMAL_IDIOMS, ADVANCED_IDIOMS, IdiomItem } from '../data/idiomsData';
import GameShell from './game-ui/GameShell';
import GridFocusScreen from './game-ui/GridFocusScreen';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

interface WordTileRoundViewProps {
  currentIdiom: IdiomItem | null;
  isAdvanced?: boolean;
  roundIndex: number;
  totalScore: number;
  placed: (string | null)[];
  options: string[];
  isWin: boolean;
  hasGuessed: boolean;
  time: number;
  onBack: () => void;
  onShowRules: () => void;
  onRemovePlaced: (index: number) => void;
  onSelectOption: (char: string, index: number) => void;
  onNextRound: () => void;
}

export const WordTileRoundView: React.FC<WordTileRoundViewProps> = ({
  currentIdiom,
  isAdvanced,
  roundIndex,
  totalScore,
  placed,
  options,
  isWin,
  hasGuessed,
  time,
  onBack,
  onShowRules,
  onRemovePlaced,
  onSelectOption,
  onNextRound,
}) => (
  <GridFocusScreen
    title="成語接龍拼圖"
    subtitle="依序選字，拼成正確的四字成語"
    difficulty={isAdvanced ? 'ADVANCED' : 'NORMAL'}
    round={roundIndex + 1}
    totalRounds={10}
    score={totalScore}
    onBack={onBack}
    className="bg-orange-50"
    statusClassName="bg-orange-100 text-orange-800"
    advancedClassName="bg-orange-600"
    playfieldLabel="成語排列區"
    supportLabel="待選文字區"
    playfieldClassName="flex items-center justify-center overflow-hidden"
    supportClassName="flex items-center justify-center overflow-hidden"
    actions={(
      <button
        type="button"
        onClick={onShowRules}
        aria-label="遊戲規則"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200"
      >
        <HelpCircle aria-hidden="true" size={22} />
      </button>
    )}
    playfield={(
      <div className="flex flex-col items-center gap-3 p-2">
        <p className="text-sm font-bold text-orange-700 sm:text-base">依序排列成語</p>
        <div className="flex gap-2 sm:gap-3">
          {placed.map((char, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => onRemovePlaced(idx)}
              disabled={char === null || isWin}
              aria-label={`第 ${idx + 1} 格${char ? `：${char}` : '，尚未填入'}`}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-3xl font-bold shadow-md transition sm:h-20 sm:w-20 sm:text-4xl ${
                char === null
                  ? 'border-dashed border-orange-300 bg-white text-orange-800'
                  : isWin
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : hasGuessed && currentIdiom && char !== currentIdiom.word[idx]
                      ? 'border-red-400 bg-red-100 text-red-700'
                      : 'border-orange-400 bg-orange-100 text-orange-900'
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    )}
    support={isWin ? (
      <div className="flex h-full flex-col justify-center gap-2 rounded-2xl border border-orange-200 bg-white p-3 text-sm text-slate-700 shadow-sm">
        <p className="font-bold text-orange-800">出處與釋義</p>
        <p><span className="font-bold text-orange-600">出處：</span>{currentIdiom?.origin}</p>
        <p className="leading-snug"><span className="font-bold text-orange-600">釋義：</span>{currentIdiom?.meaning}</p>
        <button type="button" onClick={onNextRound} className="mt-1 min-h-11 rounded-xl bg-orange-500 px-4 font-bold text-white shadow hover:bg-orange-600">
          <RefreshCw aria-hidden="true" className="mr-1 inline h-4 w-4" />
          {roundIndex >= 9 ? '結算分數' : '下一題'}
        </button>
      </div>
    ) : (
      <div className="flex flex-wrap justify-center gap-2 p-2 sm:gap-3">
        {options.some(Boolean) ? options.map((opt, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => onSelectOption(opt, idx)}
              disabled={!opt}
              aria-label={opt ? `選擇文字 ${opt}` : `文字 ${idx + 1} 已使用`}
              className={`flex min-h-14 min-w-14 items-center justify-center rounded-xl border-2 border-orange-200 bg-white px-3 text-2xl font-bold text-orange-700 shadow transition hover:border-orange-400 hover:bg-orange-50 sm:min-h-16 sm:min-w-16 sm:text-3xl ${!opt ? 'invisible' : ''}`}
            >
              {opt}
            </button>
          )) : (
            <p className="rounded-xl bg-orange-100 p-3 text-center text-sm font-bold leading-relaxed text-orange-800">
              文字已全部放入<br />點擊左側文字可取回調整
            </p>
          )}
      </div>
    )}
    feedback={isWin
      ? <span className="text-green-700">解答正確！獲得 {Math.max(10, 100 - time * 2)} 分</span>
      : hasGuessed
        ? <span className="text-red-700">順序還不對，點擊已填文字取回後再試試看</span>
        : <span className="text-orange-700">從右側選字；點擊已填文字可取回</span>}
  />
);

const WordTileGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const idiomPool = isAdvanced ? ADVANCED_IDIOMS : NORMAL_IDIOMS;

  const [currentIdiom, setCurrentIdiom] = useState<IdiomItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [placed, setPlaced] = useState<(string | null)[]>([null, null, null, null]);
  const [isWin, setIsWin] = useState(false);
  const [hasGuessed, setHasGuessed] = useState(false);

  const [roundIndex, setRoundIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [gameIdioms, setGameIdioms] = useState<IdiomItem[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  const startGame = useCallback(() => {
    let available = idiomPool.filter(item => !usedWords.includes(item.word));
    if (available.length < 10) {
      available = [...idiomPool];
      setUsedWords([]);
    }

    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 10);
    setGameIdioms(shuffled);
    setUsedWords(prev => [...prev, ...shuffled.map(s => s.word)]);

    setRoundIndex(0);
    setTotalScore(0);
    setGameOver(false);
    startRound(shuffled[0]);
  }, [idiomPool, usedWords]);

  const startRound = (idiomObj: IdiomItem) => {
      setCurrentIdiom(idiomObj);
      const chars = idiomObj.word.split('').sort(() => 0.5 - Math.random());
      setOptions(chars);
      setPlaced([null, null, null, null]);
      setIsWin(false);
      setHasGuessed(false);
      setTime(0);
      setIsActive(true);
  };

  useEffect(() => {
      startGame();
  }, [isAdvanced]);

  useEffect(() => {
      let interval: any = null;
      if (isActive && !isWin) {
          interval = setInterval(() => {
              setTime(t => t + 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isActive, isWin]);

  const handleNextRound = () => {
      if (roundIndex >= 9) {
          setGameOver(true);
          return;
      }
      const nextIdx = roundIndex + 1;
      setRoundIndex(nextIdx);
      startRound(gameIdioms[nextIdx]);
  };

  const handleSelectOption = (char: string, index: number) => {
      if (isWin) return;
      
      const emptyIndex = placed.indexOf(null);
      if (emptyIndex === -1) return; // Full

      const newPlaced = [...placed];
      newPlaced[emptyIndex] = char;
      setPlaced(newPlaced);

      const newOptions = [...options];
      newOptions[index] = ''; // Mark as used
      setOptions(newOptions);
      soundService.playTone(400 + emptyIndex * 100, 'sine', 0.1);

      // Check win condition
      if (newPlaced.join('') === currentIdiom?.word) {
          setIsWin(true);
          setHasGuessed(true);
          setIsActive(false);
          const points = Math.max(10, 100 - time * 2);
          setTotalScore(prev => prev + points);
          soundService.playWin();
      } else if (newPlaced.every(c => c !== null)) {
          // Full but wrong
          setHasGuessed(true);
          soundService.playWrong();
      }
  };

  const handleRemovePlaced = (index: number) => {
      if (isWin || placed[index] === null) return;
      const char = placed[index]!;
      
      const newPlaced = [...placed];
      newPlaced[index] = null;
      setPlaced(newPlaced);

      const newOptions = [...options];
      const emptyOptIndex = newOptions.indexOf('');
      if (emptyOptIndex !== -1) {
          newOptions[emptyOptIndex] = char;
      }
      setOptions(newOptions);
      soundService.playTone(300, 'triangle', 0.1);
  };

  if (gameOver) {
      return (
        <GameShell title="成語接龍拼圖" subtitle="測驗完成" onBack={onBack} className="bg-orange-50">
          <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4">
              <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center animate-fade-in-up border-4 border-orange-100 max-w-sm w-full">
                  <div className="text-6xl mb-4 animate-bounce">🏆</div>
                  <h2 className="text-3xl font-bold text-orange-900 mb-2">測驗完成！</h2>
                  <p className="text-xl text-orange-700 mb-6 font-bold flex flex-col gap-2">
                      <span>10題 總得分:</span>
                      <span className="text-4xl text-orange-600">{totalScore}</span>
                  </p>
                  <button 
                      onClick={startGame}
                      className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md text-lg active:scale-95"
                  >
                      <RefreshCw size={20} className="inline mr-2" /> 重新挑戰
                  </button>
                  <button 
                      onClick={onBack}
                      className="w-full mt-3 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-sm text-lg active:scale-95"
                  >
                      返回選單
                  </button>
              </div>
          </div>
        </GameShell>
      );
  }

  return (
    <>
      <WordTileRoundView
        currentIdiom={currentIdiom}
        isAdvanced={isAdvanced}
        roundIndex={roundIndex}
        totalScore={totalScore}
        placed={placed}
        options={options}
        isWin={isWin}
        hasGuessed={hasGuessed}
        time={time}
        onBack={onBack}
        onShowRules={() => setShowRules(true)}
        onRemovePlaced={handleRemovePlaced}
        onSelectOption={handleSelectOption}
        onNextRound={handleNextRound}
      />
      <RulesModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)}
          rules={[
              "選出下方打亂的字，將它們填入正確的空格中，拼湊成一個完整的成語。",
              "點擊已填入的字可以取消選擇。",
              "越快完成拼圖，獲得的分數越高！",
              "每次測驗共有 10 題，題庫擴充至 300 題且不重複！"
          ]}
      />
    </>
  );
};

export default WordTileGame;
