import React, { useState } from 'react';
import { ArrowLeft, Lightbulb, CloudRain, Sun, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { Difficulty } from '../types';
import { normalThoughts, advancedThoughts, ThoughtScenario } from '../data/positiveData';

interface Props {
    onBack: () => void;
    difficulty: Difficulty;
}

const PositiveReappraisalGame: React.FC<Props> = ({ onBack, difficulty }) => {
    const isAdvanced = difficulty === 'ADVANCED';
    const allScenarios = isAdvanced ? advancedThoughts : normalThoughts;
    
    const [scenarios, setScenarios] = useState<ThoughtScenario[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showReframes, setShowReframes] = useState(false);
    
    React.useEffect(() => {
        // Shuffle and pick 10 questions per game
        const shuffled = [...allScenarios].sort(() => Math.random() - 0.5).slice(0, 10);
        setScenarios(shuffled);
    }, [allScenarios]);

    if (scenarios.length === 0) return null;

    const currentScenario = scenarios[currentIndex];

    const nextScenario = () => {
        if (currentIndex < scenarios.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowReframes(false);
        } else {
            setCurrentIndex(0);
            setShowReframes(false);
            onBack();
        }
    };

    const isLast = currentIndex === scenarios.length - 1;

    return (
        <div className="h-[100dvh] bg-amber-50 flex flex-col font-sans overflow-hidden">
            <header className="px-2 py-2 md:p-6 landscape:py-1 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10 w-full">
                <button
                    onClick={onBack}
                    className="flex items-center text-amber-600 hover:text-amber-800 transition-colors font-bold text-sm md:text-xl shrink-0"
                >
                    <ArrowLeft className="mr-1 md:mr-2 w-5 h-5 md:w-8 md:h-8" />
                    <span className="hidden sm:inline landscape:hidden">返回目錄</span>
                </button>
                <div className="flex-1 flex justify-center items-center px-2 md:px-4">
                    <div className="flex items-center bg-amber-50 px-3 md:px-4 py-1 landscape:py-0.5 rounded-full border border-amber-100 max-w-[200px] sm:max-w-[300px] w-full">
                        <span className="text-amber-600 font-bold text-xs sm:text-sm landscape:text-[10px] shrink-0">第 {currentIndex + 1} 題</span>
                        <div className="flex-1 mx-2 bg-amber-200 rounded-full h-1.5 md:h-2 landscape:h-1">
                            <div 
                                className="bg-amber-500 h-1.5 md:h-2 landscape:h-1 rounded-full transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-amber-600 font-bold text-xs sm:text-sm landscape:text-[10px] shrink-0">共 {scenarios.length} 題</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 text-amber-800 shrink-0">
                    <Lightbulb className="hidden sm:block landscape:hidden w-5 h-5 md:w-8 md:h-8" />
                    <h1 className="text-sm sm:text-xl md:text-2xl font-bold">轉念練習</h1>
                </div>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-4 md:p-8 landscape:p-1.5 flex flex-col pb-20 md:pb-24 overflow-y-auto landscape:pb-16">
                
                <div className="flex flex-col md:flex-row landscape:flex-row gap-2 sm:gap-4 md:gap-8 landscape:gap-2 flex-1 min-h-0">
                    
                    {/* Left: Event and Negative Thought */}
                    <div className="w-full md:w-1/2 landscape:w-1/2 flex flex-col gap-2 sm:gap-4 md:gap-6 landscape:gap-1.5">
                        <div className="bg-white p-3 md:p-8 landscape:p-2 rounded-2xl md:rounded-3xl border-2 border-slate-200 shadow-md shrink-0">
                            <h2 className="text-xs sm:text-sm md:text-xl font-bold text-slate-500 mb-0.5 sm:mb-1 md:mb-2 landscape:mb-0">發生的事件：</h2>
                            <p className="text-sm sm:text-xl md:text-3xl landscape:text-sm text-slate-800 font-medium leading-tight md:leading-relaxed">
                                {currentScenario.event}
                            </p>
                        </div>
                        
                        <div className="bg-slate-800 p-3 md:p-8 landscape:p-2 rounded-2xl md:rounded-3xl shadow-lg relative overflow-hidden flex-1 flex flex-col min-h-[0]">
                            <CloudRain className="absolute right-[-10px] top-[-10px] sm:right-[-20px] sm:top-[-20px] w-16 h-16 md:w-32 md:h-32 text-slate-700 opacity-50" />
                            <h2 className="text-xs sm:text-sm md:text-xl landscape:text-sm font-bold text-slate-400 mb-1 md:mb-4 landscape:mb-0.5 flex items-center shrink-0">
                                <MessageSquareQuote className="w-4 h-4 md:w-6 md:h-6 landscape:w-4 landscape:h-4 mr-1 sm:mr-2 outline-none" />
                                <span className="hidden sm:inline landscape:hidden">容易產生的自動化負面想法（認知扭曲）：</span>
                                <span className="sm:hidden landscape:inline">自動化負面想法：</span>
                            </h2>
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <p className="text-sm sm:text-lg md:text-3xl landscape:text-sm text-white font-medium italic relative z-10 leading-tight md:leading-relaxed">
                                    {currentScenario.negativeThought}
                                </p>
                            </div>
                            
                            {!showReframes && (
                                <div className="mt-2 sm:mt-4 landscape:mt-1 text-center shrink-0">
                                    <button
                                        onClick={() => setShowReframes(true)}
                                        className="w-full max-w-[280px] mx-auto py-2 sm:py-3 md:py-4 landscape:py-1.5 bg-amber-500 text-white rounded-xl font-bold text-sm sm:text-lg md:text-xl landscape:text-sm hover:bg-amber-600 transition-colors shadow-md relative z-10 flex justify-center items-center"
                                    >
                                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 landscape:w-3 landscape:h-3 mr-1 sm:mr-2" />
                                        顯示轉念思考 (解套方法)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Positive Reframes */}
                    <div className="w-full md:w-1/2 landscape:w-1/2 h-full flex flex-col min-h-0">
                        {showReframes ? (
                            <div className="bg-amber-100 p-4 md:p-8 landscape:p-2 rounded-3xl border-4 border-amber-300 shadow-xl h-full flex flex-col overflow-y-auto animate-fade-in flex-1">
                                <div className="flex items-center gap-2 md:gap-3 landscape:gap-1 mb-4 md:mb-6 landscape:mb-2 shrink-0">
                                    <Sun className="w-8 h-8 md:w-10 md:h-10 landscape:w-5 landscape:h-5 text-amber-500" />
                                    <h2 className="text-xl md:text-3xl landscape:text-lg font-extrabold text-amber-800">
                                        可以試著這樣想：
                                    </h2>
                                </div>
                                <div className="flex flex-col gap-3 md:gap-4 landscape:gap-1.5 flex-1">
                                    {currentScenario.reframes.map((reframe, idx) => (
                                        <div key={idx} className="bg-white p-3 md:p-5 landscape:p-1.5 rounded-2xl landscape:rounded-lg shadow-sm border-l-4 rounded-l-md border-amber-400 transform transition-transform hover:translate-x-2">
                                            <p className="text-lg md:text-2xl landscape:text-[12px] sm:landscape:text-xs text-amber-900 font-medium leading-tight">✨ {reframe}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-4 border-dashed border-amber-200 rounded-3xl flex items-center justify-center p-8 landscape:p-2 bg-white/50">
                                <div className="text-center">
                                    <MessageSquareQuote className="w-16 h-16 landscape:w-8 landscape:h-8 text-amber-300 mx-auto mb-4 landscape:mb-1" />
                                    <p className="text-xl md:text-2xl landscape:text-base text-amber-600 font-bold">
                                        如果換個角度想，<br/>我們可以怎麼看待這件事？
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom bar for Next button */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 landscape:p-2 bg-white border-t border-amber-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 flex justify-center ${showReframes ? 'translate-y-0' : 'translate-y-full'}`}>
                <button
                    onClick={nextScenario}
                    className="w-full max-w-md py-4 landscape:py-2 bg-amber-600 text-white rounded-full font-bold text-xl md:text-2xl landscape:text-base hover:bg-amber-700 shadow-lg flex items-center justify-center transform hover:scale-105 transition-all"
                >
                    {isLast ? "完成挑戰" : "下一個情境"}
                    {!isLast && <ChevronRight className="ml-2 w-6 h-6 md:w-8 md:h-8 landscape:w-4 landscape:h-4" />}
                </button>
            </div>
        </div>
    );
};

export default PositiveReappraisalGame;
