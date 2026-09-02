
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trophy, ArrowRight, RotateCcw, Check, Eye } from 'lucide-react';
import { StepsLevel, StepItem, Difficulty } from '../types';
import { generateStepsLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import SplitChoiceLayout from './game-ui/SplitChoiceLayout';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const TOTAL_ROUNDS = 10;

interface StepsRoundViewProps {
  level: StepsLevel;
  difficulty: Difficulty;
  round: number;
  score: number;
  availableSteps: StepItem[];
  userOrder: StepItem[];
  isCorrect: boolean;
  showError: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSelectStep: (step: StepItem) => void;
  onDeselectStep: (step: StepItem) => void;
  onReset: () => void;
  onShowAnswer: () => void;
  onCheck: () => void;
}

export const StepsRoundView = ({
  level,
  difficulty,
  round,
  score,
  availableSteps,
  userOrder,
  isCorrect,
  showError,
  onBack,
  onSkip,
  onSelectStep,
  onDeselectStep,
  onReset,
  onShowAnswer,
  onCheck,
}: StepsRoundViewProps) => (
  <GameShell
    title="生活步驟"
    subtitle={difficulty === 'ADVANCED' ? '排列較複雜的生活任務' : '依照正確順序完成生活任務'}
    onBack={onBack}
    className="bg-purple-50"
    contentClassName="relative"
    status={(
      <div className="flex items-center gap-1.5 sm:gap-2">
        {difficulty === 'ADVANCED' && (
          <span className="rounded-full bg-purple-600 px-2 py-1 text-xs text-white">進階</span>
        )}
        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-800 sm:px-3 sm:text-sm">
          第 {round}/{TOTAL_ROUNDS} 題
        </span>
        <span className="flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-800 sm:px-3 sm:text-sm">
          <Trophy aria-hidden="true" className="mr-1 h-4 w-4" /> {score}
        </span>
      </div>
    )}
    actions={(
      <button
        type="button"
        onClick={onSkip}
        className="min-h-11 rounded-xl px-3 text-sm font-bold text-purple-700 hover:bg-purple-100"
      >
        跳過
      </button>
    )}
  >
    <SplitChoiceLayout
      className="mx-auto max-w-6xl"
      questionLabel="步驟排列區"
      choicesLabel="待選步驟區"
      questionClassName="flex flex-col overflow-hidden rounded-2xl border-2 border-purple-200 bg-white/70 shadow-inner"
      choicesClassName="flex flex-col overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-lg"
      question={(
        <>
          <div className="shrink-0 border-b border-purple-200 bg-purple-100/70 p-2 text-center">
            <h2 className="truncate text-base font-bold leading-tight text-purple-900 sm:text-lg">
              題目：<span className="text-purple-700">{level.title}</span>
            </h2>
            <p className="text-xs text-purple-500">從右側依序選出正確步驟</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <div className="flex flex-wrap content-start items-center gap-2">
              {userOrder.length === 0 && (
                <div className="flex min-h-20 w-full items-center justify-center font-bold text-purple-300">
                  尚未選擇步驟
                </div>
              )}
              {userOrder.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => onDeselectStep(step)}
                    disabled={isCorrect}
                    className="group flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-purple-300 bg-white px-3 py-1.5 text-sm font-bold text-purple-900 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-70 sm:text-base"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-700">
                      {index + 1}
                    </span>
                    {step.text}
                  </button>
                  {index < userOrder.length - 1 && <ArrowRight aria-hidden="true" className="h-4 w-4 text-purple-300" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 gap-2 border-t border-purple-100 bg-white/70 p-2">
            <button
              type="button"
              onClick={onShowAnswer}
              disabled={isCorrect}
              className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-yellow-100 px-3 font-bold text-yellow-800 disabled:opacity-50"
            >
              <Eye aria-hidden="true" className="h-5 w-5" />
              <span className="hidden sm:inline">答案</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={userOrder.length === 0 || isCorrect}
              className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-gray-200 px-3 font-bold text-gray-700 disabled:opacity-50"
            >
              <RotateCcw aria-hidden="true" className="h-5 w-5" />
              <span className="hidden sm:inline">重置</span>
            </button>
            <button
              type="button"
              onClick={onCheck}
              disabled={availableSteps.length > 0 && !isCorrect}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${isCorrect ? 'bg-green-600' : 'bg-purple-600'}`}
            >
              {isCorrect ? '下一題' : '確認'}
              {isCorrect ? <ArrowRight aria-hidden="true" className="h-5 w-5" /> : <Check aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </>
      )}
      choices={(
        <>
          <div className="shrink-0 border-b border-gray-100 bg-gray-50 p-2 text-center text-xs font-bold text-gray-500">
            待選步驟
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <div className="flex flex-wrap content-start justify-center gap-2 sm:justify-start">
              {availableSteps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectStep(step)}
                  disabled={isCorrect}
                  className="min-h-11 whitespace-nowrap rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-900 shadow-sm transition-colors hover:border-purple-300 hover:bg-purple-100 disabled:opacity-50 sm:text-base"
                >
                  {step.text}
                </button>
              ))}
              {availableSteps.length === 0 && (
                <p className="py-6 text-center font-bold text-purple-400">所有步驟都已排入左側</p>
              )}
            </div>
          </div>
        </>
      )}
      feedback={showError ? <span className="text-red-700">順序不對喔，請再調整！</span> : undefined}
    />
  </GameShell>
);

const StepsGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<StepsLevel | null>(null);
  const [availableSteps, setAvailableSteps] = useState<StepItem[]>([]);
  const [userOrder, setUserOrder] = useState<StepItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // Track used titles to prevent repetition in a session
  const [usedTitles, setUsedTitles] = useState<string[]>([]);
  
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = async () => {
    setLoading(true);
    setIsCorrect(false);
    setShowError(false);
    setUserOrder([]);
    
    // Pass current history and difficulty
    const data = await generateStepsLevel(usedTitles, difficulty as Difficulty);
    setLevel(data);
    setAvailableSteps(data.steps); 
    
    // Add new title to history
    setUsedTitles(prev => [...prev, data.title]);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const calculateScore = () => {
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let bonus = 0;
      if (timeTaken < 10) bonus = 10;
      else if (timeTaken < 20) bonus = 5;
      return 20 + bonus;
  }

  const handleSelectStep = (step: StepItem) => {
    if (isCorrect) return;
    setUserOrder([...userOrder, step]);
    setAvailableSteps(availableSteps.filter(s => s.id !== step.id));
    setShowError(false);
  };

  const handleDeselectStep = (step: StepItem) => {
    if (isCorrect) return;
    setAvailableSteps([...availableSteps, step]);
    setUserOrder(userOrder.filter(s => s.id !== step.id));
    setShowError(false);
  };

  const handleReset = () => {
     if (!level || isCorrect) return;
     setAvailableSteps([...availableSteps, ...userOrder]);
     setUserOrder([]);
  };

  const handleNextLevel = () => {
    if (round < TOTAL_ROUNDS) {
        setRound(r => r + 1);
        startRound();
    } else {
        setIsFinished(true);
        soundService.playWin();
    }
  };

  const checkAnswer = () => {
    if (!level) return;
    
    // If already correct, button acts as Next
    if (isCorrect) {
        handleNextLevel();
        return;
    }

    let correct = true;
    for (let i = 0; i < userOrder.length; i++) {
        if (userOrder[i].order !== i + 1) {
            correct = false;
            break;
        }
    }

    if (correct && userOrder.length === level.steps.length) {
        setIsCorrect(true);
        const roundScore = calculateScore();
        setScore(s => s + roundScore);
        soundService.playCorrect();
    } else {
        setShowError(true);
        soundService.playWrong();
        setTimeout(() => setShowError(false), 2000);
    }
  };
  
  const handleShowAnswer = () => {
      if (!level || isCorrect) return;

      const allSteps = [...userOrder, ...availableSteps];
      allSteps.sort((a, b) => a.order - b.order);

      setUserOrder(allSteps);
      setAvailableSteps([]);
      setIsCorrect(true);
      
      // Do NOT add score
      soundService.playCorrect();
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setIsFinished(false);
    setUsedTitles([]); // Reset history on restart
    startRound();
  };

  if (isFinished) {
    return (
      <GameShell
        title="生活步驟"
        subtitle="本回合完成"
        onBack={onBack}
        className="bg-purple-50"
        contentClassName="flex items-center justify-center overflow-y-auto p-4"
      >
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-purple-200">
              <Check className="w-20 h-20 text-purple-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-purple-900 mb-2">步驟大師！</h2>
              <div className="text-6xl font-black text-purple-600 mb-4">{score}</div>
              <p className="text-gray-600 mb-8">
                  你的邏輯非常清晰！<br/>做事井然有序。
              </p>
              <div className="flex gap-4">
                   <button 
                      onClick={onBack}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                  >
                      回主選單
                  </button>
                  <button 
                      onClick={handleRestart}
                      className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 shadow-lg"
                  >
                      再玩一次
                  </button>
              </div>
          </div>
      </GameShell>
    );
  }

  if (loading || !level) {
    return (
      <GameShell
        title="生活步驟"
        subtitle={difficulty === 'ADVANCED' ? '排列較複雜的生活任務' : '依照正確順序完成生活任務'}
        onBack={onBack}
        className="bg-purple-50"
        contentClassName="flex items-center justify-center"
      >
        <div role="status" aria-live="polite" className="flex flex-col items-center text-purple-800">
          <Loader2 aria-hidden="true" className="mb-4 h-12 w-12 animate-spin text-purple-600" />
          <p>準備步驟中...</p>
        </div>
      </GameShell>
    );
  }

  return (
    <StepsRoundView
      level={level}
      difficulty={difficulty}
      round={round}
      score={score}
      availableSteps={availableSteps}
      userOrder={userOrder}
      isCorrect={isCorrect}
      showError={showError}
      onBack={onBack}
      onSkip={startRound}
      onSelectStep={handleSelectStep}
      onDeselectStep={handleDeselectStep}
      onReset={handleReset}
      onShowAnswer={handleShowAnswer}
      onCheck={checkAnswer}
    />
  );
};

export default StepsGame;
