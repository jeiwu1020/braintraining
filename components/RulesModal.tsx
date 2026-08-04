import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  rules: string[];
}

export const RulesModal: React.FC<Props> = ({ isOpen, onClose, title = "遊戲規則與計分說明", rules }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md max-h-[90dvh] overflow-y-auto relative animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{title}</h2>
        <ul className="space-y-3 text-slate-600 text-sm sm:text-base text-left">
          {rules.map((rule, idx) => (
            <li key={idx} className="flex gap-2 items-start">
              <span className="font-bold text-indigo-500 shrink-0">{idx + 1}.</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
        <button 
          onClick={onClose}
          className="mt-6 w-full py-3 bg-indigo-500 text-white rounded-xl font-bold text-lg hover:bg-indigo-600 active:scale-95 transition-all shadow-md"
        >
          我知道了
        </button>
      </div>
    </div>
  );
};
