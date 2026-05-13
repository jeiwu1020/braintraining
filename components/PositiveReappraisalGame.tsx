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
        <div className="min-h-screen bg-amber-50 flex flex-col font-sans">
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

            <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col pb-28">
                
                <div className="mb-6 flex items-center justify-between bg-white px-4 py-2 rounded-full shadow-sm">
                    <span className="text-amber-600 font-bold">第 {currentIndex + 1} 題</span>
                    <div className="flex-1 mx-4 bg-amber-100 rounded-full h-2">
                        <div 
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-amber-600 font-bold">共 {scenarios.length} 題</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1">
                    
                    {/* Left: Event and Negative Thought */}
                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-200 shadow-md">
                            <h2 className="text-lg md:text-xl font-bold text-slate-500 mb-2">發生的事件：</h2>
                            <p className="text-2xl md:text-3xl text-slate-800 font-medium leading-relaxed">
                                {currentScenario.event}
                            </p>
                        </div>
                        
                        <div className="bg-slate-800 p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
                            <CloudRain className="absolute right-[-20px] top-[-20px] w-32 h-32 text-slate-700 opacity-50" />
                            <h2 className="text-lg md:text-xl font-bold text-slate-400 mb-4 flex items-center">
                                <MessageSquareQuote className="w-6 h-6 mr-2 outline-none" />
                                容易產生的自動化負面想法（認知扭曲）：
                            </h2>
                            <p className="text-2xl md:text-3xl text-white font-medium italic relative z-10 leading-relaxed">
                                {currentScenario.negativeThought}
                            </p>
                            
                            {!showReframes && (
                                <button
                                    onClick={() => setShowReframes(true)}
                                    className="mt-8 w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-xl hover:bg-amber-600 transition-colors shadow-md relative z-10 flex justify-center items-center"
                                >
                                    <Lightbulb className="w-6 h-6 mr-2" />
                                    顯示轉念思考 (解套方法)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Positive Reframes */}
                    <div className="w-full md:w-1/2 h-full">
                        {showReframes ? (
                            <div className="bg-amber-100 p-6 md:p-8 rounded-3xl border-4 border-amber-300 shadow-xl h-full flex flex-col animate-fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <Sun className="w-10 h-10 text-amber-500" />
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-amber-800">
                                        可以試著這樣想：
                                    </h2>
                                </div>
                                <div className="flex flex-col gap-4 flex-1">
                                    {currentScenario.reframes.map((reframe, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-400 transform transition-transform hover:translate-x-2">
                                            <p className="text-xl md:text-2xl text-amber-900 font-medium">✨ {reframe}</p>
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
