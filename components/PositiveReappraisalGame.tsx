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
        <div data-positive-root="true" className="positive-root h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-amber-50 font-sans">
            <div data-positive-safe-stage="true" className="app-safe-screen h-full w-full">
                <div data-positive-layout="true" className="positive-layout flex h-full min-h-0 flex-col overflow-hidden px-2 py-2">
            <header data-positive-header="true" className="positive-header flex w-full shrink-0 items-center justify-between bg-white px-2 py-2 shadow-sm md:p-6">
                <button
                    onClick={onBack}
                    aria-label="返回遊戲選單"
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-amber-600 transition-colors hover:text-amber-800 md:text-xl"
                >
                    <ArrowLeft className="mr-1 md:mr-2 w-5 h-5 md:w-8 md:h-8" />
                    <span className="hidden sm:inline landscape:hidden">返回目錄</span>
                </button>
                <div className="flex-1 flex justify-center items-center px-2 md:px-4">
                    <div className="positive-progress flex w-full max-w-[300px] items-center rounded-full border border-amber-100 bg-amber-50 px-3 py-1 md:px-4">
                        <span className="text-xs font-bold text-amber-600 sm:text-sm">第 {currentIndex + 1} 題</span>
                        <div className="mx-2 h-1.5 flex-1 rounded-full bg-amber-200 md:h-2">
                            <div 
                                className="h-1.5 rounded-full bg-amber-500 transition-all duration-300 md:h-2"
                                style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-bold text-amber-600 sm:text-sm">共 {scenarios.length} 題</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 text-amber-800 shrink-0">
                    <Lightbulb className="hidden sm:block landscape:hidden w-5 h-5 md:w-8 md:h-8" />
                    <h1 className="text-sm sm:text-xl md:text-2xl font-bold">轉念練習</h1>
                </div>
            </header>

             <main data-positive-main="true" className="positive-main mx-auto flex flex-1 min-h-0 w-full max-w-5xl flex-col overflow-hidden p-2 sm:p-4 md:p-8">
                
                 <div className="positive-columns flex flex-1 min-h-0 flex-col gap-2 md:flex-row md:gap-8 landscape:flex-row">
                    
                    {/* Left: Event and Negative Thought */}
                    <div className="positive-left flex min-h-0 w-full flex-col gap-2 md:w-1/2 md:gap-6 landscape:w-1/2">
                        <div data-positive-event="true" className="positive-event shrink-0 rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-md md:rounded-3xl md:p-8">
                            <h2 className="text-xs sm:text-sm md:text-xl font-bold text-slate-500 mb-0.5 sm:mb-1 md:mb-2 landscape:mb-0">發生的事件：</h2>
                            <p className="positive-event-text text-sm font-medium leading-tight text-slate-800 sm:text-xl md:text-3xl md:leading-relaxed">
                                {currentScenario.event}
                            </p>
                        </div>
                        
                         <div data-positive-negative="true" className="positive-negative relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl bg-slate-800 p-3 shadow-lg md:rounded-3xl md:p-8">
                            <CloudRain className="absolute right-[-10px] top-[-10px] sm:right-[-20px] sm:top-[-20px] w-16 h-16 md:w-32 md:h-32 text-slate-700 opacity-50" />
                            <h2 className="positive-negative-heading mb-1 flex shrink-0 items-center text-xs font-bold text-slate-400 sm:text-sm md:mb-4 md:text-xl">
                                <MessageSquareQuote className="w-4 h-4 md:w-6 md:h-6 landscape:w-5 landscape:h-5 mr-1 sm:mr-2 outline-none" />
                                <span className="positive-negative-heading-full hidden sm:inline">容易產生的自動化負面想法（認知扭曲）：</span>
                                <span className="positive-negative-heading-short sm:hidden">自動化負面想法：</span>
                            </h2>
                            <div className="positive-negative-content min-h-0 flex-1 overflow-y-auto">
                                <p className="positive-negative-text relative z-10 text-sm font-medium italic leading-tight text-white sm:text-lg md:text-3xl md:leading-relaxed">
                                    {currentScenario.negativeThought}
                                </p>
                            </div>
                            
                            {!showReframes && (
                                <div data-positive-reveal="true" className="positive-reveal mt-2 shrink-0 text-center sm:mt-4">
                                    <button
                                        onClick={() => setShowReframes(true)}
                                        className="positive-reveal-button mx-auto flex min-h-11 w-full max-w-[280px] items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-amber-600 md:py-4 md:text-xl"
                                    >
                                        <Lightbulb className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                        顯示轉念思考 (解套方法)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Positive Reframes */}
                    <div data-positive-reframes="true" className="positive-reframes flex min-h-0 h-full w-full flex-col md:w-1/2 landscape:w-1/2">
                        {showReframes ? (
                            <div className="positive-reframes-panel flex min-h-0 flex-1 flex-col overflow-y-auto rounded-3xl border-4 border-amber-300 bg-amber-100 p-4 shadow-xl animate-fade-in md:p-8">
                                <div className="positive-reframes-heading mb-4 flex shrink-0 items-center gap-2 md:mb-6 md:gap-3">
                                    <Sun className="h-8 w-8 text-amber-500 md:h-10 md:w-10" />
                                    <h2 className="text-xl font-extrabold text-amber-800 md:text-3xl">
                                        可以試著這樣想：
                                    </h2>
                                </div>
                                <div className="positive-reframe-list flex min-h-0 flex-1 flex-col gap-3 md:gap-4">
                                    {currentScenario.reframes.map((reframe, idx) => (
                                        <div key={idx} className="positive-reframe-card rounded-2xl rounded-l-md border-l-4 border-amber-400 bg-white p-3 shadow-sm transition-transform hover:translate-x-2 md:p-5">
                                            <p className="positive-reframe-text text-sm font-medium leading-tight text-amber-900 md:text-2xl">✨ {reframe}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="positive-prompt flex h-full items-center justify-center rounded-3xl border-4 border-dashed border-amber-200 bg-white/50 p-8">
                                <div className="text-center">
                                    <MessageSquareQuote className="positive-prompt-icon mx-auto mb-4 h-16 w-16 text-amber-300" />
                                    <p className="positive-prompt-text text-xl font-bold text-amber-600 md:text-2xl">
                                        如果換個角度想，<br/>我們可以怎麼看待這件事？
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showReframes && (
                <footer data-positive-footer="true" className="positive-footer flex shrink-0 justify-center border-t border-amber-100 bg-white px-4 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={nextScenario}
                        className="positive-next-button inline-flex min-h-11 w-full max-w-md items-center justify-center whitespace-nowrap rounded-full bg-amber-600 px-6 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-amber-700 md:text-2xl"
                    >
                        {isLast ? "完成挑戰" : "下一個情境"}
                        {!isLast && <ChevronRight className="ml-2 h-6 w-6 md:h-8 md:w-8" />}
                    </button>
                </footer>
            )}
                </div>
            </div>
        </div>
    );
};

export default PositiveReappraisalGame;
