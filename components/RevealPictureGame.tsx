import React, { useState } from 'react';
import { Image as ImageIcon, RefreshCw, HelpCircle } from 'lucide-react';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';
import GameShell from './game-ui/GameShell';
import GridFocusScreen from './game-ui/GridFocusScreen';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

interface RevealPictureRoundViewProps {
  target: { emoji: string; name: string };
  isAdvanced?: boolean;
  roundIndex: number;
  totalScore: number;
  gridSize: number;
  revealed: boolean[];
  isPeek: boolean;
  isDone: boolean;
  score: number;
  onBack: () => void;
  onShowRules: () => void;
  onTileClick: (index: number) => void;
  onRevealAll: () => void;
  onGuess: (correct: boolean) => void;
  onNextRound: () => void;
}

export const RevealPictureRoundView: React.FC<RevealPictureRoundViewProps> = ({
  target,
  isAdvanced,
  roundIndex,
  totalScore,
  gridSize,
  revealed,
  isPeek,
  isDone,
  score,
  onBack,
  onShowRules,
  onTileClick,
  onRevealAll,
  onGuess,
  onNextRound,
}) => {
  const revealedCount = revealed.filter(Boolean).length;
  const isAllRevealed = revealedCount === revealed.length || isDone || isPeek;

  return (
    <GridFocusScreen
      title="翻牌解謎"
      subtitle="少翻幾格，猜出隱藏圖案"
      difficulty={isAdvanced ? 'ADVANCED' : 'NORMAL'}
      round={roundIndex + 1}
      totalRounds={10}
      score={totalScore}
      onBack={onBack}
      className="bg-emerald-50"
      statusClassName="bg-emerald-100 text-emerald-800"
      advancedClassName="bg-emerald-600"
      playfieldLabel="隱藏圖片格線"
      supportLabel="答案判斷區"
      playfieldClassName="flex items-center justify-center overflow-hidden"
      supportClassName="flex items-center justify-center overflow-hidden"
      actions={(
        <button type="button" onClick={onShowRules} aria-label="遊戲規則" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
          <HelpCircle aria-hidden="true" size={22} />
        </button>
      )}
      playfield={(
        <div className="relative h-full max-h-[30rem] aspect-square overflow-hidden rounded-2xl border-4 border-emerald-100 bg-white shadow-xl">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
            <span className="select-none leading-none drop-shadow-xl" style={{ fontSize: 'clamp(5rem, 28vh, 13rem)' }}>{target.emoji}</span>
          </div>
          <div className={`absolute inset-0 grid ${isAllRevealed ? 'pointer-events-none' : ''}`} style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
            {revealed.map((isRevealed, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => onTileClick(idx)}
                disabled={isRevealed || isAllRevealed}
                aria-label={`翻開第 ${idx + 1} 格`}
                className={`flex items-center justify-center bg-emerald-500 text-2xl font-bold text-white shadow-[inset_0_0_0_1px_rgba(4,120,87,0.5)] transition-all hover:bg-emerald-400 ${isRevealed || isAllRevealed ? 'pointer-events-none scale-95 opacity-0' : 'opacity-100'}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      support={!isDone ? (
        !isPeek ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-bold leading-relaxed text-emerald-800">看見線索後<br />就可以揭曉答案</p>
            <button type="button" onClick={onRevealAll} className="flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 font-bold text-white shadow hover:bg-emerald-700">
              <ImageIcon aria-hidden="true" className="mr-2 h-5 w-5" />揭曉答案
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-2xl font-bold text-emerald-900">{target.name}</p>
            <p className="text-sm text-slate-600">你原本猜對了嗎？</p>
            <button type="button" onClick={() => onGuess(true)} className="min-h-11 w-full rounded-xl bg-green-500 px-4 font-bold text-white shadow hover:bg-green-600">答對</button>
            <button type="button" onClick={() => onGuess(false)} className="min-h-11 w-full rounded-xl bg-red-500 px-4 font-bold text-white shadow hover:bg-red-600">答錯</button>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-2xl font-bold text-emerald-900">{target.name}</p>
          <p className={`text-xl font-bold ${score > 0 ? 'text-green-600' : 'text-red-600'}`}>得分 {score}</p>
          <button type="button" onClick={onNextRound} className="mt-1 flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 font-bold text-white shadow hover:bg-emerald-700">
            <RefreshCw aria-hidden="true" className="mr-2 h-5 w-5" />{roundIndex >= 9 ? '結算分數' : '下一題'}
          </button>
        </div>
      )}
      feedback={<span className="text-emerald-700">已翻開 {revealedCount}/{revealed.length} 塊</span>}
    />
  );
};

const TARGETS = [
  { emoji: '🐘', name: '大象' }, { emoji: '🦒', name: '長頸鹿' }, { emoji: '🦓', name: '斑馬' },
  { emoji: '🦅', name: '老鷹' }, { emoji: '🐢', name: '烏龜' }, { emoji: '🏯', name: '日本古城' },
  { emoji: '🗽', name: '自由女神' }, { emoji: '🗼', name: '東京鐵塔' }, { emoji: '🏰', name: '城堡' },
  { emoji: '🎡', name: '摩天輪' }, { emoji: '🌋', name: '火山' }, { emoji: '🏕️', name: '露營帳篷' },
  { emoji: '🚑', name: '救護車' }, { emoji: '🚁', name: '直升機' }, { emoji: '🍎', name: '蘋果' },
  { emoji: '🍉', name: '西瓜' }, { emoji: '🌻', name: '向日葵' }, { emoji: '🎸', name: '吉他' },
  { emoji: '🐼', name: '熊貓' }, { emoji: '🐨', name: '無尾熊' }, { emoji: '🐧', name: '企鵝' },
  { emoji: '🐬', name: '海豚' }, { emoji: '🐙', name: '章魚' }, { emoji: '🦋', name: '蝴蝶' },
  { emoji: '🚀', name: '火箭' }, { emoji: '🚢', name: '船' }, { emoji: '🚂', name: '火車' },
  { emoji: '🚲', name: '腳踏車' }, { emoji: '🍕', name: '披薩' }, { emoji: '🍔', name: '漢堡' },
  { emoji: '🍩', name: '甜甜圈' }, { emoji: '🍦', name: '冰淇淋' }, { emoji: '⚽', name: '足球' },
  { emoji: '🏀', name: '籃球' }, { emoji: '🎾', name: '網球' }, { emoji: '🏆', name: '獎盃' },
  { emoji: '⌚', name: '手錶' }, { emoji: '📱', name: '手機' }, { emoji: '💻', name: '電腦' },
  { emoji: '📷', name: '相機' }, { emoji: '🏠', name: '房子' }, { emoji: '🏫', name: '學校' },
  { emoji: '🦁', name: '獅子' }, { emoji: '🐯', name: '老虎' }, { emoji: '🐒', name: '猴子' },
  { emoji: '🐺', name: '狼' }, { emoji: '🐻', name: '熊' }, { emoji: '🐸', name: '青蛙' },
  { emoji: '🐍', name: '蛇' }, { emoji: '🐎', name: '馬' }, { emoji: '🐄', name: '牛' },
  { emoji: '🐖', name: '豬' }, { emoji: '🐑', name: '羊' }, { emoji: '🐔', name: '雞' },
  { emoji: '🦆', name: '鴨子' }, { emoji: '🦉', name: '貓頭鷹' }, { emoji: '🦇', name: '蝙蝠' },
  { emoji: '🐝', name: '蜜蜂' }, { emoji: '🐛', name: '毛毛蟲' }, { emoji: '🐌', name: '蝸牛' },
  { emoji: '🐞', name: '瓢蟲' }, { emoji: '🐜', name: '螞蟻' }, { emoji: '🦟', name: '蚊子' },
  { emoji: '🚗', name: '汽車' }, { emoji: '🚕', name: '計程車' }, { emoji: '🚙', name: '休旅車' },
  { emoji: '🚌', name: '公車' }, { emoji: '🚎', name: '無軌電車' }, { emoji: '🏎️', name: '賽車' },
  { emoji: '🚓', name: '警車' }, { emoji: '🚒', name: '消防車' }, { emoji: '🚜', name: '拖拉機' },
  { emoji: '🛴', name: '滑板車' }, { emoji: '🛵', name: '機車' }, { emoji: '✈️', name: '飛機' },
  { emoji: '🛸', name: '幽浮' }, { emoji: '🛰️', name: '衛星' }, { emoji: '🚤', name: '快艇' },
  { emoji: '🍇', name: '葡萄' }, { emoji: '🍈', name: '哈密瓜' }, { emoji: '🍊', name: '橘子' },
  { emoji: '🍋', name: '檸檬' }, { emoji: '🍌', name: '香蕉' }, { emoji: '🍍', name: '鳳梨' },
  { emoji: '🥭', name: '芒果' }, { emoji: '🍓', name: '草莓' }, { emoji: '🍒', name: '櫻桃' },
  { emoji: '🍑', name: '桃子' }, { emoji: '🍐', name: '梨子' }, { emoji: '🍏', name: '青蘋果' },
  { emoji: '🍅', name: '番茄' }, { emoji: '🥥', name: '椰子' }, { emoji: '🥝', name: '奇異果' },
];

const RevealPictureGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const gridSize = isAdvanced ? 4 : 3;
  const numTiles = gridSize * gridSize;
  
  const [gameTargets, setGameTargets] = useState<typeof TARGETS>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  const [target, setTarget] = useState(() => TARGETS[Math.floor(Math.random() * TARGETS.length)]);
  const [revealed, setRevealed] = useState<boolean[]>(Array(numTiles).fill(false));
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const [isPeek, setIsPeek] = useState(false);

  const revealedCount = revealed.filter(r => r).length;

  React.useEffect(() => {
      startGame();
  }, [isAdvanced]);

  const startGame = () => {
      const shuffled = [...TARGETS].sort(() => Math.random() - 0.5).slice(0, 10);
      setGameTargets(shuffled);
      setRoundIndex(0);
      setTotalScore(0);
      setGameOver(false);
      setTarget(shuffled[0]);
      setRevealed(Array(numTiles).fill(false));
      setIsDone(false);
      setIsPeek(false);
      setScore(0);
  };

  const handleTileClick = (index: number) => {
    if (revealed[index] || isDone || isPeek) return;
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    soundService.playTone(300 + index * 50, 'sine', 0.1);
  };

  const handleGuess = (correct: boolean) => {
      setIsDone(true);
      if (correct) {
          // Calculate score based on tiles NOT revealed. Max points for fewer reveals.
          const unrevealedCount = numTiles - revealedCount;
          const points = 10 + (unrevealedCount * 10);
          setScore(points);
          setTotalScore(prev => prev + points);
          soundService.playWin();
      } else {
          setScore(0);
          soundService.playWrong();
      }
  };

  const handleNextRound = () => {
    if (roundIndex >= 9) {
        setGameOver(true);
        return;
    }
    
    setRevealed(Array(numTiles).fill(false));
    setIsDone(false);
    setIsPeek(false);
    setScore(0);
    // Wait for fade out transition before changing image
    setTimeout(() => {
        const nextIdx = roundIndex + 1;
        setRoundIndex(nextIdx);
        setTarget(gameTargets[nextIdx]);
    }, 500);
  };

  const handleRevealAll = () => {
      setIsPeek(true);
      soundService.playTone(300, 'sine', 0.1);
  };

  if (gameOver) {
      return (
        <GameShell title="翻牌解謎" subtitle="測驗完成" onBack={onBack} className="bg-emerald-50">
          <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4">
              <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center animate-fade-in-up border-4 border-emerald-100 max-w-sm w-full">
                  <div className="text-6xl mb-4 animate-bounce">🏆</div>
                  <h2 className="text-3xl font-bold text-emerald-900 mb-2">測驗完成！</h2>
                  <p className="text-xl text-emerald-700 mb-6 font-bold flex flex-col gap-2">
                      <span>10題 總得分:</span>
                      <span className="text-4xl text-emerald-600">{totalScore}</span>
                  </p>
                  <button 
                      onClick={startGame}
                      className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-md text-lg active:scale-95"
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
      <RevealPictureRoundView
        target={target}
        isAdvanced={isAdvanced}
        roundIndex={roundIndex}
        totalScore={totalScore}
        gridSize={gridSize}
        revealed={revealed}
        isPeek={isPeek}
        isDone={isDone}
        score={score}
        onBack={onBack}
        onShowRules={() => setShowRules(true)}
        onTileClick={handleTileClick}
        onRevealAll={handleRevealAll}
        onGuess={handleGuess}
        onNextRound={handleNextRound}
      />
      <RulesModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)}
          rules={[
              "點擊畫面上的方塊來翻開圖片的一小部分。",
              "翻開的方塊越少，如果猜中答案，獲得的分數越高。",
              "當你認為知道圖片是什麼時，點擊「揭曉答案」。",
              "揭曉後選擇「答對」來得分，或「答錯」得 0 分。",
              "每次得分為: 10分 + (未翻開方塊數 * 10分)。",
              "共 10 題，看你能得幾分！"
          ]}
      />
    </>
  );
};

export default RevealPictureGame;
