import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle, Check, X, Info } from 'lucide-react';
import { soundService } from '../services/soundService';
import { RulesModal } from './RulesModal';

interface Props {
  onBack: () => void;
  isAdvanced?: boolean;
}

const Avatar = ({ 
  gender, 
  hairStyle, 
  hairColor, 
  glasses, 
  hat, 
  beard 
}: { 
  gender: 'm'|'f', 
  hairStyle: 'short'|'long'|'curly'|'bald_top', 
  hairColor: string, 
  glasses: boolean, 
  hat: 'none'|'police'|'chef', 
  beard: boolean 
}) => {
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 mb-1 drop-shadow-sm">
      {/* Shoulders */}
      <path d="M 15 100 Q 50 70 85 100 Z" fill={gender === 'f' ? '#f472b6' : '#60a5fa'} />
      
      {/* Back Hair for Long Hair */}
      {hairStyle === 'long' && (
        <path d="M 25 40 L 15 85 L 85 85 L 75 40 Z" fill={hairColor} />
      )}

      {/* Face */}
      <circle cx="50" cy="45" r="25" fill="#fcd5ce" />

      {/* Front Hair */}
      {hairStyle === 'short' && hat === 'none' && (
        <path d="M 25 45 Q 25 15 50 15 Q 75 15 75 45 L 70 30 Q 50 20 30 30 Z" fill={hairColor} />
      )}
      {hairStyle === 'long' && hat === 'none' && (
        <path d="M 25 45 Q 25 15 50 15 Q 75 15 75 45 L 70 25 Q 50 15 30 25 Z" fill={hairColor} />
      )}
      {hairStyle === 'curly' && hat === 'none' && (
        <g fill={hairColor}>
          <circle cx="50" cy="18" r="14" />
          <circle cx="35" cy="22" r="12" />
          <circle cx="65" cy="22" r="12" />
          <circle cx="25" cy="32" r="12" />
          <circle cx="75" cy="32" r="12" />
          <circle cx="20" cy="45" r="10" />
          <circle cx="80" cy="45" r="10" />
        </g>
      )}
      {hairStyle === 'bald_top' && hat === 'none' && (
        <path d="M 25 45 Q 20 30 25 25 L 30 25 Q 28 40 30 45 Z M 75 45 Q 80 30 75 25 L 70 25 Q 72 40 70 45 Z" fill={hairColor} />
      )}

      {/* Hair peeking under hat */}
      {hat !== 'none' && (
        <path d="M 25 45 Q 25 35 30 35 L 30 40 Z M 75 45 Q 75 35 70 35 L 70 40 Z" fill={hairColor} />
      )}

      {/* Eyes */}
      <circle cx="40" cy="40" r="3" fill="#333" />
      <circle cx="60" cy="40" r="3" fill="#333" />

      {/* Glasses */}
      {glasses && (
        <g stroke="#333" strokeWidth="2.5" fill="none">
          <rect x="30" y="34" width="14" height="12" rx="3" />
          <rect x="56" y="34" width="14" height="12" rx="3" />
          <line x1="44" y1="40" x2="56" y2="40" />
          <line x1="22" y1="40" x2="30" y2="40" />
          <line x1="70" y1="40" x2="78" y2="40" />
        </g>
      )}

      {/* Mouth */}
      <path d="M 45 55 Q 50 60 55 55" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Beard */}
      {beard && (
        <path d="M 28 48 Q 35 75 50 75 Q 65 75 72 48 Q 60 60 50 60 Q 40 60 28 48 Z" fill={hairColor} />
      )}

      {/* Hats */}
      {hat === 'police' && (
        <g>
          <path d="M 18 25 Q 50 5 82 25 Z" fill="#1e3a8a" />
          <path d="M 12 25 Q 50 35 88 25 L 82 20 Q 50 30 18 20 Z" fill="#111" />
          <circle cx="50" cy="16" r="4" fill="#fbbf24" />
        </g>
      )}
      {hat === 'chef' && (
        <g fill="#fff" stroke="#d1d5db" strokeWidth="2">
          <path d="M 25 20 C 10 -10, 40 -15, 50 5 C 60 -15, 90 -10, 75 20 Z" />
          <rect x="25" y="15" width="50" height="12" rx="2" />
        </g>
      )}
    </svg>
  );
};

type CharacterDef = {
  id: number;
  name: string;
  features: string[];
  avatar: {
    gender: 'm'|'f';
    hairStyle: 'short'|'long'|'curly'|'bald_top';
    hairColor: string;
    glasses: boolean;
    hat: 'none'|'police'|'chef';
    beard: boolean;
  }
}

const CHARACTERS: CharacterDef[] = [
  { id: 1, name: '小明', features: ['男生', '短髮', '沒戴眼鏡'], avatar: { gender: 'm', hairStyle: 'short', hairColor: '#1f2937', glasses: false, hat: 'none', beard: false } },
  { id: 2, name: '小華', features: ['女生', '長髮', '沒戴眼鏡'], avatar: { gender: 'f', hairStyle: 'long', hairColor: '#1f2937', glasses: false, hat: 'none', beard: false } },
  { id: 3, name: '老王', features: ['男生', '白髮', '戴眼鏡'], avatar: { gender: 'm', hairStyle: 'bald_top', hairColor: '#9ca3af', glasses: true, hat: 'none', beard: false } },
  { id: 4, name: '阿嬤', features: ['女生', '白髮', '戴眼鏡'], avatar: { gender: 'f', hairStyle: 'curly', hairColor: '#9ca3af', glasses: true, hat: 'none', beard: false } },
  { id: 5, name: '大衛', features: ['男生', '金髮', '沒戴眼鏡'], avatar: { gender: 'm', hairStyle: 'short', hairColor: '#fcd34d', glasses: false, hat: 'none', beard: false } },
  { id: 6, name: '莉莉', features: ['女生', '金髮', '沒戴眼鏡'], avatar: { gender: 'f', hairStyle: 'long', hairColor: '#fcd34d', glasses: false, hat: 'none', beard: false } },
  { id: 7, name: '大叔', features: ['男生', '有鬍子', '沒戴眼鏡'], avatar: { gender: 'm', hairStyle: 'short', hairColor: '#1f2937', glasses: false, hat: 'none', beard: true } },
  { id: 8, name: '警長', features: ['男生', '戴帽子', '沒戴眼鏡'], avatar: { gender: 'm', hairStyle: 'short', hairColor: '#1f2937', glasses: false, hat: 'police', beard: false } },
  { id: 9, name: '紅紅', features: ['女生', '紅髮', '沒戴眼鏡'], avatar: { gender: 'f', hairStyle: 'long', hairColor: '#f87171', glasses: false, hat: 'none', beard: false } },
  { id: 10, name: '捲捲', features: ['男生', '捲髮', '沒戴眼鏡'], avatar: { gender: 'm', hairStyle: 'curly', hairColor: '#1f2937', glasses: false, hat: 'none', beard: false } },
  { id: 11, name: '老師', features: ['女生', '戴眼鏡', '長髮'], avatar: { gender: 'f', hairStyle: 'long', hairColor: '#1f2937', glasses: true, hat: 'none', beard: false } },
  { id: 12, name: '廚師', features: ['男生', '戴帽子', '有鬍子'], avatar: { gender: 'm', hairStyle: 'short', hairColor: '#1f2937', glasses: false, hat: 'chef', beard: true } }
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
                      <Avatar {...card.avatar} />
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
