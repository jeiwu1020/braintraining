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
            <header className="p-4 md:p-6 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="flex items-center text-amber-600 hover:text-amber-800 transition-colors font-bold text-lg md:text-xl"
                >
                    <ArrowLeft className="mr-2 w-6 h-6 md:w-8 md:h-8" />
                    返回目錄
                </button>
                <div className="flex items-center space-x-2 text-amber-800">
                    <Lightbulb className="w-6 h-6 md:w-8 md:h-8" />
                    <h1 className="text-xl md:text-2xl font-bold">轉念練習</h1>
                </div>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-4 md:p-8 flex flex-col pb-24 overflow-y-auto">
                
                <div className="mb-4 md:mb-6 flex items-center justify-between bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm">
                    <span className="text-amber-600 font-bold">第 {currentIndex + 1} 題</span>
                    <div className="flex-1 mx-4 bg-amber-100 rounded-full h-2">
                        <div 
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-amber-600 font-bold">共 {scenarios.length} 題</span>
                </div>

                <div className="flex flex-col md:flex-row landscape:flex-row gap-4 md:gap-8 flex-1 min-h-0">
                    
                    {/* Left: Event and Negative Thought */}
                    <div className="w-full md:w-1/2 landscape:w-1/2 flex flex-col gap-3 md:gap-6">
                        <div className="bg-white p-4 md:p-8 rounded-3xl border-2 border-slate-200 shadow-md">
                            <h2 className="text-base md:text-xl font-bold text-slate-500 mb-1 md:mb-2">發生的事件：</h2>
                            <p className="text-xl md:text-3xl text-slate-800 font-medium leading-normal md:leading-relaxed">
                                {currentScenario.event}
                            </p>
                        </div>
                        
                        <div className="bg-slate-800 p-4 md:p-8 rounded-3xl shadow-lg relative overflow-hidden flex-1">
                            <CloudRain className="absolute right-[-20px] top-[-20px] w-24 h-24 md:w-32 md:h-32 text-slate-700 opacity-50" />
                            <h2 className="text-base md:text-xl font-bold text-slate-400 mb-2 md:mb-4 flex items-center">
                                <MessageSquareQuote className="w-5 h-5 md:w-6 md:h-6 mr-2 outline-none" />
                                容易產生的自動化負面想法（認知扭曲）：
                            </h2>
                            <p className="text-lg md:text-3xl text-white font-medium italic relative z-10 leading-normal md:leading-relaxed">
                                {currentScenario.negativeThought}
                            </p>
                            
                            {!showReframes && (
                                <button
                                    onClick={() => setShowReframes(true)}
                                    className="mt-4 md:mt-8 w-full py-3 md:py-4 bg-amber-500 text-white rounded-xl font-bold text-lg md:text-xl hover:bg-amber-600 transition-colors shadow-md relative z-10 flex justify-center items-center"
                                >
                                    <Lightbulb className="w-6 h-6 mr-2" />
                                    顯示轉念思考 (解套方法)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Positive Reframes */}
                    <div className="w-full md:w-1/2 landscape:w-1/2 h-full flex flex-col min-h-0">
                        {showReframes ? (
                            <div className="bg-amber-100 p-4 md:p-8 rounded-3xl border-4 border-amber-300 shadow-xl h-full flex flex-col overflow-y-auto animate-fade-in flex-1">
                                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 shrink-0">
                                    <Sun className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
                                    <h2 className="text-xl md:text-3xl font-extrabold text-amber-800">
                                        可以試著這樣想：
                                    </h2>
                                </div>
                                <div className="flex flex-col gap-3 md:gap-4 flex-1">
                                    {currentScenario.reframes.map((reframe, idx) => (
                                        <div key={idx} className="bg-white p-3 md:p-5 rounded-2xl shadow-sm border-l-4 border-amber-400 transform transition-transform hover:translate-x-2">
                                            <p className="text-lg md:text-2xl text-amber-900 font-medium">✨ {reframe}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-4 border-dashed border-amber-200 rounded-3xl flex items-center justify-center p-8 bg-white/50">
                                <div className="text-center">
                                    <MessageSquareQuote className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                                    <p className="text-xl md:text-2xl text-amber-600 font-bold">
                                        如果換個角度想，<br/>我們可以怎麼看待這件事？
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom bar for Next button */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-amber-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 flex justify-center ${showReframes ? 'translate-y-0' : 'translate-y-full'}`}>
                <button
                    onClick={nextScenario}
                    className="w-full max-w-md py-4 bg-amber-600 text-white rounded-full font-bold text-xl md:text-2xl hover:bg-amber-700 shadow-lg flex items-center justify-center transform hover:scale-105 transition-all"
                >
                    {isLast ? "完成挑戰" : "下一個情境"}
                    {!isLast && <ChevronRight className="ml-2 w-6 h-6 md:w-8 md:h-8" />}
                </button>
            </div>
        </div>
    );
};

export default PositiveReappraisalGame;
