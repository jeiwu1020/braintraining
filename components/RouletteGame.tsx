import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Square, Coins, Settings } from 'lucide-react';
import { Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface RouletteGameProps {
  onBack: () => void;
  difficulty: Difficulty;
}

// Normal: colors. Advanced: animals/items.
const STANDARD_ITEMS_NORMAL = [
    { id: 'red', label: "紅色", icon: "🍎", color: "bg-red-500" },
    { id: 'yellow', label: "黃色", icon: "🍌", color: "bg-yellow-400" },
    { id: 'blue', label: "藍色", icon: "🐳", color: "bg-blue-500" },
    { id: 'green', label: "綠色", icon: "🥦", color: "bg-green-500" },
];

const STANDARD_ITEMS_ADVANCED = [
    { id: 'dog', label: "狗狗", icon: "🐶", color: "bg-amber-700" },
    { id: 'cat', label: "貓咪", icon: "🐱", color: "bg-gray-400" },
    { id: 'pig', label: "豬豬", icon: "🐷", color: "bg-pink-400" },
    { id: 'frog', label: "青蛙", icon: "🐸", color: "bg-emerald-600" },
    { id: 'fox', label: "狐狸", icon: "🦊", color: "bg-orange-500" },
    { id: 'bear', label: "熊熊", icon: "🐻", color: "bg-amber-900" },
];

const EVENT_ITEMS_NORMAL = [
    { id: 'plus_10', label: "雙方 +10 分", icon: "🌟", color: "bg-teal-500", type: 'EVENT' },
    { id: 'minus_10', label: "雙方 -10 分", icon: "🌧️", color: "bg-slate-600", type: 'EVENT' },
];

const EVENT_ITEMS_ADVANCED = [
    { id: 'plus_20', label: "雙方 +20 分", icon: "🌟", color: "bg-teal-500", type: 'EVENT' },
    { id: 'bomb', label: "炸彈！雙方 -20", icon: "💣", color: "bg-slate-800", type: 'EVENT' },
    { id: 'swap', label: "雙方分數互換", icon: "🔄", color: "bg-purple-600", type: 'EVENT' },
    { id: 'nothing', label: "銘謝惠顧", icon: "💨", color: "bg-gray-400", type: 'EVENT' },
];

type TeamChoice = { itemId: string, amount: number } | null;
type StandardItem = { id: string; label: string; icon: string; color: string };

interface TeamBetPanelProps {
  team: 'A' | 'B';
  score: number;
  choice: TeamChoice;
  result: string | null;
  isSpinning: boolean;
  standardItems: StandardItem[];
  onConfirm: (choice: { itemId: string; amount: number }) => void;
}

const TeamBetPanel: React.FC<TeamBetPanelProps> = ({
  team,
  score,
  choice,
  result,
  isSpinning,
  standardItems,
  onConfirm,
}) => {
  const amounts = [10, 20, 50];
  const [isEditing, setIsEditing] = useState(!choice);
  const [draftAmount, setDraftAmount] = useState(choice?.amount ?? 10);
  const [draftItem, setDraftItem] = useState(choice?.itemId ?? standardItems[0].id);

  useEffect(() => {
    setDraftAmount(choice?.amount ?? 10);
    setDraftItem(choice?.itemId ?? standardItems[0].id);
    if (!choice) setIsEditing(true);
  }, [choice, standardItems]);

  const handleConfirm = () => {
    onConfirm({ itemId: draftItem, amount: draftAmount });
    setIsEditing(false);
  };

  const selectedItem = choice ? standardItems.find(item => item.id === choice.itemId) : null;
  const isAdvanced = standardItems.length === 6;

  return (
    <section className={`roulette-team-panel ${team === 'A' ? 'roulette-team-panel-a' : 'roulette-team-panel-b'}`}>
      <div className="roulette-team-heading">
        <span className="roulette-team-name">{team} 組</span>
        <span className="roulette-team-score">
          <Coins className="h-4 w-4" aria-hidden="true" />
          {score}
        </span>
      </div>

      {(!choice || isEditing) ? (
        <div data-roulette-bet-controls="true" className="roulette-team-controls">
          <div className="roulette-team-control-group">
            <span className="roulette-team-control-label">押注項目</span>
            <div className={`roulette-team-item-grid ${isAdvanced ? 'roulette-team-item-grid-advanced' : ''}`}>
              {standardItems.map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setDraftItem(item.id)}
                  aria-label={`${team} 組選擇${item.label}`}
                  aria-pressed={draftItem === item.id}
                  className={`roulette-team-item ${draftItem === item.id
                    ? `${item.color} text-white border-transparent shadow-md is-selected`
                    : 'bg-white border-gray-200 text-gray-700'}`}
                >
                  <span className="roulette-team-item-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="roulette-team-control-group roulette-team-amount-group">
            <span className="roulette-team-control-label">押注金額</span>
            <div className="roulette-team-amount-grid">
              {amounts.map(amount => (
                <button
                  type="button"
                  key={amount}
                  onClick={() => setDraftAmount(amount)}
                  aria-label={`${team} 組押注 ${amount} 分`}
                  aria-pressed={draftAmount === amount}
                  className={`roulette-team-amount ${draftAmount === amount ? 'is-selected' : ''}`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            aria-label={`確認${team}組押注`}
            className="roulette-team-confirm min-h-11"
          >
            確認押注
          </button>
        </div>
      ) : (
        <div className="roulette-team-confirmed">
          <div className="roulette-team-bet-label">
            <span>已押注</span>
            <strong><span aria-hidden="true">{selectedItem?.icon}</span> {selectedItem?.label}</strong>
            <span>{choice.amount} 分</span>
          </div>
          {result && <div className="roulette-team-result" aria-live="polite">{result}</div>}
          {!isSpinning && !result && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={`修改${team}組押注`}
              className="roulette-team-edit min-h-11"
            >
              修改押注
            </button>
          )}
        </div>
      )}
    </section>
  );
};

const RouletteGame: React.FC<RouletteGameProps> = ({ onBack, difficulty }) => {
  const isAdvanced = difficulty === 'ADVANCED';

  const standardItems = isAdvanced ? STANDARD_ITEMS_ADVANCED : STANDARD_ITEMS_NORMAL;
  const eventItems = isAdvanced ? EVENT_ITEMS_ADVANCED : EVENT_ITEMS_NORMAL;

  const [wheelOptions, setWheelOptions] = useState([...standardItems, ...eventItems]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasSpinStarted, setHasSpinStarted] = useState(false);

  const [teamAScore, setTeamAScore] = useState(100);
  const [teamBScore, setTeamBScore] = useState(100);

  const [teamAChoice, setTeamAChoice] = useState<TeamChoice>(null);
  const [teamBChoice, setTeamBChoice] = useState<TeamChoice>(null);

  const [resultMsg, setResultMsg] = useState<{main: string, a: string, b: string} | null>(null);

  const spinInterval = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'GAMEOVER'>('SETUP');
  const [gameMode, setGameMode] = useState<'ROUNDS' | 'SCORE'>('ROUNDS');
  const [targetValue, setTargetValue] = useState(10);
  const [currentRound, setCurrentRound] = useState(1);
  const [isGameOverRound, setIsGameOverRound] = useState(false);

  useEffect(() => {
      setWheelOptions([...standardItems, ...eventItems].sort(() => 0.5 - Math.random()));
      resetGame();
  }, [difficulty]);

  const resetGame = () => {
      setGameState('SETUP');
      setTeamAChoice(null);
      setTeamBChoice(null);
      setResultMsg(null);
      setHasSpinStarted(false);
  };

  const startGame = () => {
      setTeamAScore(100);
      setTeamBScore(100);
      setCurrentRound(1);
      setIsGameOverRound(false);
      setTeamAChoice(null);
      setTeamBChoice(null);
      setResultMsg(null);
      setHasSpinStarted(false);
      setGameState('PLAYING');
  };

  const startSpin = () => {
    if (isSpinning) return;
    if (!teamAChoice || !teamBChoice) return;

    setHasSpinStarted(true);
    setIsSpinning(true);
    setResultMsg(null);

    let speed = 50;
    let ticks = 0;
    const maxTicks = Math.floor(Math.random() * 20) + 40; // Random duration

    const tick = () => {
        setCurrentIndex(prev => (prev + 1) % wheelOptions.length);
        ticks++;

        if (ticks >= maxTicks) {
            setIsSpinning(false);
            // Result is current index visually when stopped.
            // Actually it will be the state at this point.
        } else {
            if (ticks > maxTicks - 15) speed += 20;
            spinInterval.current = setTimeout(tick, speed);
        }
    };

    spinInterval.current = setTimeout(tick, speed);
  };

  // Evaluate result when spinning stops
  useEffect(() => {
      if (!isSpinning && resultMsg === null && teamAChoice && teamBChoice) {
          // Just stopped spinning
          const landedOption = wheelOptions[currentIndex];
          let msgA = '';
          let msgB = '';
          let mainMsg = `轉到了：${landedOption.icon} ${landedOption.label}！`;
          let deltaA = 0;
          let deltaB = 0;

          let newA = teamAScore;
          let newB = teamBScore;

          if ('type' in landedOption && landedOption.type === 'EVENT') {
              // Handle event
              if (landedOption.id === 'plus_10') { deltaA = 10; deltaB = 10; msgA = '+10'; msgB = '+10'; }
              if (landedOption.id === 'minus_10') { deltaA = -10; deltaB = -10; msgA = '-10'; msgB = '-10'; }
              if (landedOption.id === 'plus_20') { deltaA = 20; deltaB = 20; msgA = '+20'; msgB = '+20'; }
              if (landedOption.id === 'bomb') { deltaA = -20; deltaB = -20; msgA = '-20'; msgB = '-20'; }
              if (landedOption.id === 'swap') {
                  newA = teamBScore;
                  newB = teamAScore;
                  msgA = '分數互換！';
                  msgB = '分數互換！';
              }
              if (landedOption.id === 'nothing') { msgA = '沒事發生'; msgB = '沒事發生'; }
          } else {
              // Standard item resolution
              if (teamAChoice.itemId === landedOption.id) {
                  deltaA = teamAChoice.amount;
                  msgA = `+${deltaA} (猜中)`;
              } else {
                  deltaA = -teamAChoice.amount;
                  msgA = `${deltaA} (沒猜中)`;
              }

              if (teamBChoice.itemId === landedOption.id) {
                  deltaB = teamBChoice.amount;
                  msgB = `+${deltaB} (猜中)`;
              } else {
                  deltaB = -teamBChoice.amount;
                  msgB = `${deltaB} (沒猜中)`;
              }
          }

          if (landedOption.id !== 'swap') {
              newA += deltaA;
              newB += deltaB;
          }

          setTeamAScore(newA);
          setTeamBScore(newB);

          setResultMsg({ main: mainMsg, a: msgA, b: msgB });

          let gameOver = false;
          if (gameMode === 'ROUNDS' && currentRound >= targetValue) {
              gameOver = true;
          } else if (gameMode === 'SCORE' && (newA >= targetValue || newB >= targetValue)) {
              gameOver = true;
          }
          setIsGameOverRound(gameOver);
      }
  }, [isSpinning]);

  const resetRound = () => {
      if (isGameOverRound) {
          setGameState('GAMEOVER');
      } else {
          setCurrentRound(r => r + 1);
          setTeamAChoice(null);
          setTeamBChoice(null);
          setResultMsg(null);
          setHasSpinStarted(false);
      }
  };

  useEffect(() => {
    return () => {
        if (spinInterval.current) clearTimeout(spinInterval.current);
    };
  }, []);

  return (
    <div data-roulette-root="true" className="roulette-root h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-rose-50">
      <div data-roulette-safe-stage="true" className="app-safe-screen h-full w-full">
        <div data-roulette-layout="true" className="roulette-layout relative flex h-full min-h-0 w-full flex-col overflow-hidden px-2 py-2">
          <header data-roulette-header="true" className="roulette-header flex w-full shrink-0 items-center justify-between rounded-2xl bg-white px-2 py-2 shadow-sm md:px-6 md:py-4">
            <button
              type="button"
              onClick={onBack}
              aria-label="返回遊戲選單"
              className="roulette-back inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-0 text-gray-600 shadow-md transition-colors hover:bg-gray-50"
            >
              <ArrowLeft size={24} aria-hidden="true" />
            </button>
            <div className="roulette-title min-w-0 px-2 text-center">
              <h1 className="font-bold text-rose-800">命運轉盤 (押注版)</h1>
              <p className="roulette-helper font-medium text-rose-600">請雙方先下注，再點擊旋轉！</p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              aria-label="重新設定遊戲"
              title="重新開始遊戲"
              className="roulette-settings inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-0 text-rose-600 shadow-md transition-colors hover:bg-rose-50"
            >
              <Settings size={24} aria-hidden="true" />
            </button>
          </header>

          <main data-roulette-main="true" className="roulette-main flex min-h-0 flex-1 w-full flex-col overflow-hidden">
            {gameState === 'SETUP' && (
              <div data-roulette-setup="true" className="roulette-setup flex min-h-0 flex-1 w-full flex-col items-center justify-center">
                <h2 className="roulette-setup-title font-bold text-rose-800">遊戲設定</h2>
                <div className="roulette-setup-card w-full rounded-2xl border-2 border-rose-200 bg-rose-50">
                  <div className="roulette-mode-block">
                    <span className="roulette-setup-label">結束條件</span>
                    <div className="roulette-mode-options">
                      <button
                        type="button"
                        onClick={() => { setGameMode('ROUNDS'); setTargetValue(10); }}
                        aria-pressed={gameMode === 'ROUNDS'}
                        className={`roulette-mode-button min-h-11 ${gameMode === 'ROUNDS' ? 'is-selected bg-rose-500 text-white border-rose-600 shadow-md' : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-100'}`}
                      >
                        回合制
                      </button>
                      <button
                        type="button"
                        onClick={() => { setGameMode('SCORE'); setTargetValue(300); }}
                        aria-pressed={gameMode === 'SCORE'}
                        className={`roulette-mode-button min-h-11 ${gameMode === 'SCORE' ? 'is-selected bg-rose-500 text-white border-rose-600 shadow-md' : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-100'}`}
                      >
                        分數制
                      </button>
                    </div>
                  </div>

                  <div className="roulette-target-block">
                    <span className="roulette-setup-label">{gameMode === 'ROUNDS' ? '目標回合數' : '目標分數'}</span>
                    <div className="roulette-target-controls">
                      <button
                        type="button"
                        onClick={() => setTargetValue(v => Math.max(gameMode === 'ROUNDS' ? 1 : 100, v - (gameMode === 'ROUNDS' ? 1 : 50)))}
                        aria-label={`減少${gameMode === 'ROUNDS' ? '目標回合數' : '目標分數'}`}
                        className="roulette-target-step min-h-11 min-w-11"
                      >
                        −
                      </button>
                      <span className="roulette-target-value" aria-live="polite">{targetValue}</span>
                      <button
                        type="button"
                        onClick={() => setTargetValue(v => Math.min(gameMode === 'ROUNDS' ? 50 : 2000, v + (gameMode === 'ROUNDS' ? 1 : 50)))}
                        aria-label={`增加${gameMode === 'ROUNDS' ? '目標回合數' : '目標分數'}`}
                        className="roulette-target-step min-h-11 min-w-11"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startGame}
                  className="roulette-start-button min-h-12 w-full rounded-2xl bg-rose-500 font-black text-white shadow-lg transition-all hover:bg-rose-600 hover:scale-[1.02] active:scale-[0.98]"
                >
                  開始遊戲
                </button>
              </div>
            )}

            {gameState === 'GAMEOVER' && (
              <div data-roulette-gameover="true" className="roulette-gameover flex min-h-0 flex-1 w-full items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="roulette-gameover-card w-full max-w-md rounded-3xl border-4 border-rose-300 bg-rose-100 text-center">
                  <h2 className="roulette-gameover-title font-black text-rose-800">遊戲結束！</h2>
                  <div className="roulette-gameover-scores flex justify-around">
                    <div className="flex flex-col items-center">
                      <span className="roulette-gameover-team font-bold text-blue-800">A 組</span>
                      <span className="roulette-gameover-score font-black text-blue-600">{teamAScore}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="roulette-gameover-team font-bold text-red-800">B 組</span>
                      <span className="roulette-gameover-score font-black text-red-600">{teamBScore}</span>
                    </div>
                  </div>
                  {teamAScore > teamBScore && <p className="roulette-winner font-black text-blue-600">A 組獲勝！🎉</p>}
                  {teamBScore > teamAScore && <p className="roulette-winner font-black text-red-600">B 組獲勝！🎉</p>}
                  {teamAScore === teamBScore && <p className="roulette-winner font-black text-yellow-600">平手！🤝</p>}
                  <button
                    type="button"
                    onClick={resetGame}
                    className="roulette-gameover-reset min-h-11 rounded-xl bg-rose-500 px-8 font-bold text-white transition-all hover:bg-rose-600 hover:scale-[1.02]"
                  >
                    重新設定
                  </button>
                </motion.div>
              </div>
            )}

            {gameState === 'PLAYING' && (
              <div className="roulette-playing flex min-h-0 flex-1 flex-col">
                <div data-roulette-status="true" className="roulette-landscape-columns flex min-h-0 flex-1 w-full">
                  <div data-roulette-team-a="true" className="roulette-team-column roulette-team-a">
                    <TeamBetPanel
                      team="A"
                      score={teamAScore}
                      choice={teamAChoice}
                      result={resultMsg?.a ?? null}
                      isSpinning={isSpinning}
                      standardItems={standardItems}
                      onConfirm={choice => setTeamAChoice(choice)}
                    />
                  </div>

                  <div data-roulette-center="true" className="roulette-center-column">
                    <div className="roulette-round-status">
                      <span className="roulette-round-label">
                        {gameMode === 'ROUNDS' ? `回合: ${currentRound} / ${targetValue}` : `目標分數: ${targetValue} 分`}
                      </span>
                      {gameMode === 'SCORE' && <span className="roulette-round-subtitle">目前第 {currentRound} 回合</span>}
                    </div>

                    <div data-roulette-wheel="true" className="roulette-wheel-slot flex min-h-0 items-center justify-center">
                      <div
                        className={`roulette-wheel-visual relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border-8 border-rose-200 shadow-inner ${hasSpinStarted ? 'bg-gray-100' : 'bg-slate-100'}`}
                        aria-label={hasSpinStarted ? `目前輪盤：${wheelOptions[currentIndex].label}` : '輪盤尚未旋轉'}
                      >
                        {hasSpinStarted ? (
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentIndex}
                              initial={isSpinning ? { y: -50, opacity: 0 } : false}
                              animate={{ y: 0, opacity: 1 }}
                              exit={isSpinning ? { y: 50, opacity: 0 } : undefined}
                              transition={{ duration: 0.1 }}
                              className={`absolute inset-0 flex flex-col items-center justify-center ${wheelOptions[currentIndex].color} text-white`}
                            >
                              <span className="roulette-wheel-icon drop-shadow-lg" aria-hidden="true">{wheelOptions[currentIndex].icon}</span>
                              <span className="roulette-wheel-label px-2 text-center font-black tracking-wider drop-shadow-md">{wheelOptions[currentIndex].label}</span>
                            </motion.div>
                          </AnimatePresence>
                        ) : (
                          <div className="roulette-wheel-neutral flex flex-col items-center justify-center text-center" aria-hidden="true">
                            <span className="roulette-wheel-neutral-icon">🎡</span>
                            <span className="roulette-wheel-neutral-label">等待旋轉</span>
                            <span className="roulette-wheel-neutral-hint">準備旋轉</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div data-roulette-action="true" className="roulette-action flex w-full min-h-0 items-center justify-center">
                      {!isSpinning && resultMsg ? (
                        <div data-roulette-result="true" className="roulette-result-row flex w-full min-w-0 items-center">
                          <span className="roulette-result-message min-w-0 flex-1 font-bold text-rose-700">{resultMsg.main}</span>
                          <button
                            type="button"
                            onClick={resetRound}
                            className="roulette-next-button min-h-12 shrink-0 whitespace-nowrap rounded-full font-bold text-white shadow-md transition-all hover:scale-[1.02]"
                          >
                            {isGameOverRound ? '查看結果' : '下一回合'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-roulette-spin="true"
                          onClick={startSpin}
                          aria-label={isSpinning ? '旋轉中' : '開始旋轉！'}
                          disabled={isSpinning || !teamAChoice || !teamBChoice}
                          className={`roulette-spin-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full font-black text-white shadow-xl transition-all ${isSpinning || !teamAChoice || !teamBChoice
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-rose-500 hover:bg-rose-600 hover:scale-[1.02] active:scale-[0.98]'}`}
                        >
                          {isSpinning ? <Square className="roulette-spin-icon animate-spin" aria-hidden="true" /> : <Play className="roulette-spin-icon" size={28} aria-hidden="true" />}
                          {isSpinning ? '旋轉中...' : '開始旋轉！'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div data-roulette-team-b="true" className="roulette-team-column roulette-team-b">
                    <TeamBetPanel
                      team="B"
                      score={teamBScore}
                      choice={teamBChoice}
                      result={resultMsg?.b ?? null}
                      isSpinning={isSpinning}
                      standardItems={standardItems}
                      onConfirm={choice => setTeamBChoice(choice)}
                    />
                  </div>
                </div>

                <div data-roulette-event-guide="true" className="roulette-event-guide w-full border-t border-gray-200">
                  <p className="roulette-event-title text-center font-bold text-gray-500">轉盤也可能轉到以下事件：</p>
                  <div className="roulette-event-list flex items-center">
                    {eventItems.map((opt, i) => (
                      <div key={i} className={`roulette-event-item flex shrink-0 items-center font-bold text-white ${opt.color} opacity-80`}>
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RouletteGame;
