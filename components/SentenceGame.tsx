
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RotateCcw, Check, Trophy, Send, Eye, ArrowRight } from 'lucide-react';
import { SentenceLevel, Difficulty } from '../types';
import { generateSentenceLevel } from '../services/geminiService';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import GridFocusScreen from './game-ui/GridFocusScreen';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

type SentenceWord = { id: string; text: string };

interface SentenceRoundViewProps {
  difficulty: Difficulty;
  round: number;
  totalScore: number;
  userAnswer: SentenceWord[];
  availableWords: SentenceWord[];
  isCorrect: boolean;
  showError: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSelectWord: (word: SentenceWord) => void;
  onDeselectWord: (word: SentenceWord) => void;
  onShowAnswer: () => void;
  onReset: () => void;
  onCheckAnswer: () => void;
}

export const SentenceRoundView: React.FC<SentenceRoundViewProps> = ({
  difficulty,
  round,
  totalScore,
  userAnswer,
  availableWords,
  isCorrect,
  showError,
  onBack,
  onSkip,
  onSelectWord,
  onDeselectWord,
  onShowAnswer,
  onReset,
  onCheckAnswer,
}) => (
  <GridFocusScreen
    title="造句拼拼樂"
    subtitle="依序選詞，組成通順的句子"
    difficulty={difficulty}
    round={round}
    totalRounds={10}
    score={totalScore}
    onBack={onBack}
    className="bg-pink-50"
    statusClassName="bg-pink-100 text-pink-800"
    advancedClassName="bg-pink-600"
    playfieldLabel="句子排列區"
    supportLabel="待選詞語區"
    playfieldClassName="flex items-center justify-center overflow-hidden"
    supportClassName="overflow-hidden"
    actions={(
      <button type="button" onClick={onSkip} className="min-h-11 rounded-xl bg-pink-100 px-3 text-sm font-bold text-pink-700 hover:bg-pink-200">
        跳過
      </button>
    )}
    playfield={(
      <div className={`flex min-h-24 w-full max-w-3xl flex-wrap content-center items-center justify-center gap-2 rounded-2xl border-4 bg-white p-3 shadow-inner transition-colors ${isCorrect ? 'border-green-400 bg-green-50' : showError ? 'border-red-300 bg-red-50' : 'border-pink-200'}`}>
        {userAnswer.length === 0 && !isCorrect && <span className="text-gray-400">答案區：依序點選右側詞語</span>}
        {userAnswer.map(word => (
          <button
            type="button"
            key={word.id}
            onClick={() => onDeselectWord(word)}
            disabled={isCorrect}
            className="min-h-11 rounded-xl bg-pink-500 px-4 text-lg font-bold text-white shadow hover:bg-pink-600 sm:text-xl"
          >
            {word.text}
          </button>
        ))}
        {isCorrect && <Check aria-label="句子正確" className="h-9 w-9 shrink-0 text-green-500" />}
      </div>
    )}
    support={(
      <div className="flex h-full min-h-0 flex-col gap-2 p-1">
        <div className="flex min-h-0 flex-1 flex-wrap content-center justify-center gap-2 overflow-y-auto">
          {availableWords.map(word => (
            <button
              type="button"
              key={word.id}
              onClick={() => onSelectWord(word)}
              disabled={isCorrect}
              className="min-h-11 rounded-xl border-2 border-pink-100 bg-white px-3 text-lg font-bold text-pink-700 shadow hover:border-pink-300 sm:text-xl"
            >
              {word.text}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-2">
          <button type="button" onClick={onShowAnswer} disabled={isCorrect} aria-label="看答案，不計分" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-yellow-100 px-3 font-bold text-yellow-700 disabled:opacity-50">
            <Eye aria-hidden="true" className="mr-1 h-5 w-5" />答案
          </button>
          <button type="button" onClick={onReset} disabled={isCorrect} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-100 px-3 font-bold text-gray-600 disabled:opacity-50">
            <RotateCcw aria-hidden="true" className="mr-1 h-5 w-5" />重置
          </button>
          <button type="button" onClick={onCheckAnswer} disabled={userAnswer.length === 0 && !isCorrect} className={`flex min-h-11 items-center justify-center rounded-xl px-4 font-bold text-white shadow disabled:opacity-50 ${isCorrect ? 'bg-green-500' : 'bg-pink-500'}`}>
            {isCorrect ? '下一題' : '確認'}
            {isCorrect ? <ArrowRight aria-hidden="true" className="ml-1 h-5 w-5" /> : <Send aria-hidden="true" className="ml-1 h-5 w-5" />}
          </button>
        </div>
      </div>
    )}
    feedback={showError
      ? <span className="text-red-700">順序不對喔，再試試看！</span>
      : isCorrect
        ? <span className="text-green-700">句子正確，做得很好！</span>
        : undefined}
  />
);

const TOTAL_ROUNDS = 10;

const SentenceGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [level, setLevel] = useState<SentenceLevel | null>(null);
  const [userAnswer, setUserAnswer] = useState<{id: string, text: string}[]>([]);
  const [availableWords, setAvailableWords] = useState<{id: string, text: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showError, setShowError] = useState(false);

  // Session & Scoring
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Used Indices Tracking
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = async () => {
    setLoading(true);
    setIsCorrect(false);
    setShowError(false);
    setUserAnswer([]);
    
    // Pass usedIndices
    const { level: data, index } = await generateSentenceLevel(usedIndices, difficulty as Difficulty);
    
    // Track usage
    setUsedIndices(prev => [...prev, index]);

    setLevel(data);
    setAvailableWords(data.scrambled);
    
    setLoading(false);
    startTimeRef.current = Date.now();
  };

  const calculateScore = () => {
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    // Base 20 pts. Speed bonus: if < 5s, +10. if < 10s, +5.
    let bonus = 0;
    if (timeTaken < 5) bonus = 10;
    else if (timeTaken < 10) bonus = 5;
    return 20 + bonus;
  };

  const handleSelectWord = (word: {id: string, text: string}) => {
    if (isCorrect) return;
    setShowError(false);
    setUserAnswer([...userAnswer, word]);
    setAvailableWords(availableWords.filter(w => w.id !== word.id));
  };

  const handleDeselectWord = (word: {id: string, text: string}) => {
    if (isCorrect) return;
    setShowError(false);
    setAvailableWords([...availableWords, word]);
    setUserAnswer(userAnswer.filter(w => w.id !== word.id));
  };

  const handleNextLevel = () => {
    if (round < TOTAL_ROUNDS) {
        setRound(r => r + 1);
        startNewRound();
     } else {
        setIsSessionFinished(true);
        soundService.playWin(); // Win sound for session completion
     }
  };

  const checkAnswer = () => {
    if (!level) return;

    // If already correct, the button acts as "Next Level"
    if (isCorrect) {
        handleNextLevel();
        return;
    }

    const currentString = userAnswer.map(w => w.text).join('');
    if (currentString === level.original) {
        // Correct
        const roundScore = calculateScore();
        setTotalScore(s => s + roundScore);
        setIsCorrect(true);
        soundService.playCorrect();
    } else {
        // Wrong (No penalty)
        setShowError(true);
        soundService.playWrong();
        setTimeout(() => setShowError(false), 2000);
    }
  };

  const handleShowAnswer = () => {
    if (!level || isCorrect) return;

    // Combine all words
    const allWords = [...userAnswer, ...availableWords];
    // Sort based on ID (which is index-char, e.g., "0-早")
    allWords.sort((a, b) => {
        const indexA = parseInt(a.id.split('-')[0]);
        const indexB = parseInt(b.id.split('-')[0]);
        return indexA - indexB;
    });

    setUserAnswer(allWords);
    setAvailableWords([]);
    setIsCorrect(true);
    // Do NOT add score
    soundService.playCorrect(); // Still play correct sound
  };

  const resetCurrent = () => {
    if (!level) return;
    setIsCorrect(false);
    setShowError(false);
    setUserAnswer([]);
    setAvailableWords(level.scrambled);
  }

  const handleRestart = () => {
      setRound(1);
      setTotalScore(0);
      setUsedIndices([]); // Reset history
      setIsSessionFinished(false);
      startNewRound();
  };

  if (isSessionFinished) {
    return (
      <GameShell title="造句拼拼樂" subtitle="練習完成" onBack={onBack} className="bg-pink-50">
        <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border-4 border-pink-200 my-4">
              <Trophy className="w-20 h-20 text-pink-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-pink-900 mb-2">練習完成！</h2>
              <div className="text-6xl font-black text-pink-600 mb-4">{totalScore}</div>
              <p className="text-gray-600 mb-8">
                  你的造句能力很棒！<br/>邏輯非常清晰。
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
                      className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 shadow-lg"
                  >
                      再玩一次
                  </button>
              </div>
          </div>
        </div>
      </GameShell>
    );
}

  if (loading) {
    return (
      <GameShell title="造句拼拼樂" subtitle="依序選詞，組成通順的句子" onBack={onBack} className="bg-pink-50">
        <div role="status" className="flex h-full flex-col items-center justify-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-pink-500" />
          <p className="text-pink-700">準備句子中...</p>
        </div>
      </GameShell>
    );
  }

  return (
    <SentenceRoundView
      difficulty={difficulty}
      round={round}
      totalScore={totalScore}
      userAnswer={userAnswer}
      availableWords={availableWords}
      isCorrect={isCorrect}
      showError={showError}
      onBack={onBack}
      onSkip={startNewRound}
      onSelectWord={handleSelectWord}
      onDeselectWord={handleDeselectWord}
      onShowAnswer={handleShowAnswer}
      onReset={resetCurrent}
      onCheckAnswer={checkAnswer}
    />
  );
};

export default SentenceGame;
