import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle, Check, X, Info } from 'lucide-react';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

const CHARACTERS = [
  { id: 1, name: '小明', emoji: '👦', features: ['男生', '短髮', '沒戴眼鏡'] },
  { id: 2, name: '小華', emoji: '👩', features: ['女生', '長髮', '沒戴眼鏡'] },
  { id: 3, name: '老王', emoji: '👴', features: ['男生', '白髮', '戴眼鏡'] },
  { id: 4, name: '阿嬤', emoji: '👵', features: ['女生', '白髮', '戴眼鏡'] },
  { id: 5, name: '大衛', emoji: '👱‍♂️', features: ['男生', '金髮', '沒戴眼鏡'] },
  { id: 6, name: '莉莉', emoji: '👱‍♀️', features: ['女生', '金髮', '沒戴眼鏡'] },
  { id: 7, name: '大叔', emoji: '🧔', features: ['男生', '有鬍子', '沒戴眼鏡'] },
  { id: 8, name: '警長', emoji: '👮', features: ['男生', '戴帽子', '沒戴眼鏡'] },
  { id: 9, name: '紅紅', emoji: '👩‍🦰', features: ['女生', '紅髮', '沒戴眼鏡'] },
  { id: 10, name: '捲捲', emoji: '👨‍🦱', features: ['男生', '捲髮', '沒戴眼鏡'] },
  { id: 11, name: '老師', emoji: '👩‍🏫', features: ['女生', '戴眼鏡', '長髮'] },
  { id: 12, name: '廚師', emoji: '👨‍🍳', features: ['男生', '戴帽子', '有鬍子'] }
];

const QUESTIONS = [
  { id: 'q1', text: '是男生嗎？', check: (f: string[]) => f.includes('男生') },
  { id: 'q2', text: '是女生嗎？', check: (f: string[]) => f.includes('女生') },
  { id: 'q3', text: '有戴眼鏡嗎？', check: (f: string[]) => f.includes('戴眼鏡') },
  { id: 'q4', text: '沒戴眼鏡嗎？', check: (f: string[]) => f.includes('沒戴眼鏡') },
  { id: 'q5', text: '有戴帽子嗎？', check: (f: string[]) => f.includes('戴帽子') },
  { id: 'q6', text: '有鬍子嗎？', check: (f: string[]) => f.includes('有鬍子') },
  { id: 'q7', text: '是白髮嗎？', check: (f: string[]) => f.includes('白髮') },
  { id: 'q8', text: '是金髮嗎？', check: (f: string[]) => f.includes('金髮') },
  { id: 'q9', text: '是長髮嗎？', check: (f: string[]) => f.includes('長髮') },
  { id: 'q10', text: '是短髮嗎？', check: (f: string[]) => f.includes('短髮') },
];

const GuessWhoGame: React.FC<Props> = ({ onBack, isAdvanced }) => {
  const numCards = isAdvanced ? 12 : 8;
  const [cards, setCards] = useState(() => CHARACTERS.slice(0, numCards).map(c => ({ ...c, isEliminated: false })));
  
  const [targetId, setTargetId] = useState(() => CHARACTERS[Math.floor(Math.random() * numCards)].id);
  const [history, setHistory] = useState<{question: string, answer: boolean}[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [score, setScore] = useState(100);
  const [showRules, setShowRules] = useState(false);

  const targetCard = cards.find(c => c.id === targetId)!;

  const askQuestion = (qId: string) => {
      if (isWin) return;
      const q = QUESTIONS.find(x => x.id === qId)!;
      // check if already asked
      if (history.some(h => h.question === q.text)) return;
      
      const answer = q.check(targetCard.features);
      setHistory(prev => [{ question: q.text, answer }, ...prev]);
      soundService.playTone(answer ? 600 : 400, 'sine', 0.1);
  };

  const guessCharacter = (id: number) => {
      if (isWin) return;
      const card = cards.find(c => c.id === id)!;
      if (card.isEliminated) return;

      if (id === targetId) {
          soundService.playWin();
          setIsWin(true);
          // Calculate score: 100 - (questions asked * 5) - (wrong guesses * 10)
          const finalScore = Math.max(10, 100 - (history.length * 5) - (wrongGuesses * 10));
          setScore(finalScore);
      } else {
          soundService.playWrong();
          setWrongGuesses(prev => prev + 1);
          setCards(prev => prev.map(c => c.id === id ? { ...c, isEliminated: true } : c));
      }
  };

  const reset = () => {
    setCards(CHARACTERS.slice(0, numCards).map(c => ({ ...c, isEliminated: false })));
    setTargetId(CHARACTERS[Math.floor(Math.random() * numCards)].id);
    setHistory([]);
    setWrongGuesses(0);
    setIsWin(false);
    setScore(100);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch justify-center min-h-[100dvh] bg-blue-50 p-2 gap-2">
      <button 
        onClick={onBack}
        className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md text-blue-600 hover:bg-blue-100 z-50 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Left side: Character Grid */}
      <div className="flex-1 bg-white p-4 rounded-2xl shadow-md border border-blue-100 overflow-y-auto relative">
          <RulesModal 
              isOpen={showRules} 
              onClose={() => setShowRules(false)}
              rules={[
                  "系統會隨機選擇一個目標人物。",
                  "點擊右側發問區的問題，系統會回答「是」或「否」。",
                  "根據回答，找出不符合條件的人物，最後點擊正確的目標人物！",
                  "問越少問題、猜錯越少次，分數越高！"
              ]}
          />
          
          <div className="flex justify-between items-center mb-4 ml-10 sm:ml-0">
              <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-blue-900">猜猜我是誰</h2>
                  <button 
                      onClick={() => setShowRules(true)}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  >
                      <Info size={20} />
                  </button>
              </div>
              {isWin && (
                  <span className="text-xl font-bold text-green-600 animate-bounce">
                      答對了！得分：{score}
                  </span>
              )}
          </div>
          
          <div className={`grid gap-2 ${isAdvanced ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-4'}`}>
              {cards.map(card => (
                  <button
                      key={card.id}
                      onClick={() => guessCharacter(card.id)}
                      disabled={isWin || card.isEliminated}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 border-2 ${
                          card.isEliminated 
                              ? 'bg-slate-100 opacity-30 border-slate-200 scale-95 grayscale' 
                              : isWin && card.id === targetId
                                  ? 'bg-green-100 border-green-500 scale-105 shadow-lg shadow-green-200'
                                  : 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                  >
                      <span className="text-4xl sm:text-5xl mb-1">{card.emoji}</span>
                      <span className="text-sm font-bold text-slate-700">{card.name}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* Right side: Questions and Log */}
      <div className="w-full sm:w-80 flex flex-col gap-2 shrink-0 h-[40vh] sm:h-auto">
          <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-md border border-blue-100 flex-1 flex flex-col min-h-0">
              <h3 className="text-base sm:text-lg font-bold text-blue-800 mb-1 sm:mb-2 flex items-center gap-2 shrink-0">
                  <HelpCircle size={18} /> 發問區
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-4 shrink-0 overflow-y-auto max-h-[25vh] sm:max-h-[35vh]">
                  {QUESTIONS.map(q => (
                      <button
                          key={q.id}
                          onClick={() => askQuestion(q.id)}
                          disabled={isWin || history.some(h => h.question === q.text)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      >
                          {q.text}
                      </button>
                  ))}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-1 sm:mb-2 border-t pt-1 sm:pt-2 shrink-0">對話紀錄</h3>
              <div className="flex-1 overflow-y-auto bg-slate-50 rounded-xl p-2 flex flex-col gap-1 sm:gap-2 min-h-0">
                  {history.map((h, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-1.5 sm:p-2 rounded-lg shadow-sm text-xs sm:text-sm shrink-0">
                          <span className="text-slate-700 truncate mr-2">{h.question}</span>
                          {h.answer ? (
                              <span className="text-green-600 font-bold flex items-center gap-1 shrink-0"><Check size={14}/> 是</span>
                          ) : (
                              <span className="text-red-500 font-bold flex items-center gap-1 shrink-0"><X size={14}/> 否</span>
                          )}
                      </div>
                  ))}
                  {history.length === 0 && (
                      <div className="text-slate-400 text-xs sm:text-sm text-center mt-2">請點擊上方問題發問</div>
                  )}
              </div>
          </div>
          
          <button 
              onClick={reset}
              className="w-full py-2 sm:py-3 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-md flex justify-center items-center gap-2 shrink-0 text-sm sm:text-base"
          >
              <RefreshCw size={18} /> {isWin ? '下一局' : '重新開始'}
          </button>
      </div>
    </div>
  );
};

export default GuessWhoGame;
