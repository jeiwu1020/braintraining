import React, { useState } from 'react';
import { ArrowLeft, Users, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { normalScenarios, advancedScenarios, Scenario } from '../data/socialContextData';

interface Props {
    onBack: () => void;
    difficulty: Difficulty;
}

const SocialContextGame: React.FC<Props> = ({ onBack, difficulty }) => {
    const isAdvanced = difficulty === 'ADVANCED';
    const allScenarios = isAdvanced ? advancedScenarios : normalScenarios;
    
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    React.useEffect(() => {
        // Shuffle and pick 10 questions per game
        const shuffled = [...allScenarios].sort(() => Math.random() - 0.5).slice(0, 10);
        setScenarios(shuffled);
    }, [allScenarios]);

    if (scenarios.length === 0) return null;

    const currentScenario = scenarios[currentIndex];

    const handleOptionSelect = (index: number) => {
        if (showFeedback) return;
        setSelectedOption(index);
        setShowFeedback(true);
    };

    const nextScenario = () => {
        if (currentIndex < scenarios.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setShowFeedback(false);
            setShowOptions(false);
        } else {
            // End of game
            setCurrentIndex(0);
            setSelectedOption(null);
            setShowFeedback(false);
            setShowOptions(false);
            onBack();
        }
    };

    const isLast = currentIndex === scenarios.length - 1;

    return (
        <div className="min-h-screen bg-purple-50 flex flex-col font-sans">
            <header className="p-4 md:p-6 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="flex items-center text-purple-600 hover:text-purple-800 transition-colors font-bold text-lg md:text-xl"
                >
                    <ArrowLeft className="mr-2 w-6 h-6 md:w-8 md:h-8" />
                    返回目錄
                </button>
                <div className="flex items-center space-x-2 text-purple-800">
                    <Users className="w-6 h-6 md:w-8 md:h-8" />
                    <h1 className="text-xl md:text-2xl font-bold">情境應對</h1>
                </div>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col pb-24">
                
                {/* Progress bar */}
                <div className="mb-6 flex items-center justify-between bg-white px-4 py-2 rounded-full shadow-sm">
                    <span className="text-purple-600 font-bold">第 {currentIndex + 1} 題</span>
                    <div className="flex-1 mx-4 bg-purple-100 rounded-full h-2">
                        <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-purple-600 font-bold">共 {scenarios.length} 題</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1">
                    {/* Left: Scenario Description */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <div className="bg-white p-6 md:p-10 rounded-3xl border-4 border-purple-200 shadow-lg">
                            <h2 className="text-2xl md:text-3xl font-bold text-purple-800 mb-4">{currentScenario.title}</h2>
                            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                                {currentScenario.description}
                            </p>
                            {!showOptions && (
                                <div className="mt-8 pt-6 border-t border-purple-100 flex justify-center">
                                    <button
                                        onClick={() => setShowOptions(true)}
                                        className="py-3 px-8 bg-purple-500 text-white rounded-full font-bold text-lg hover:bg-purple-600 shadow transition-all transform hover:scale-105"
                                    >
                                        查看選項
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Options & Feedback */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
                        {showOptions && currentScenario.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const showCorrectness = showFeedback && (isSelected || option.isCorrect);
                            let optionClass = "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md text-gray-700";
                            
                            if (showCorrectness) {
                                if (option.isCorrect) {
                                    optionClass = "bg-green-50 border-green-500 text-green-800 shadow-md";
                                } else if (isSelected) {
                                    optionClass = "bg-red-50 border-red-400 text-red-800 shadow-inner";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    disabled={showFeedback}
                                    onClick={() => handleOptionSelect(index)}
                                    className={`w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 ${optionClass}`}
                                >
                                    <div className="flex items-start">
                                        <span className="text-xl md:text-2xl font-bold mr-4 mt-1 opacity-50">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-lg md:text-xl font-medium">{option.text}</p>
                                            
                                            {/* Feedback text */}
                                            {showFeedback && isSelected && (
                                                <div className={`mt-3 p-3 rounded-xl text-base md:text-lg animate-fade-in ${option.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    {option.feedback}
                                                </div>
                                            )}
                                            {/* Show feedback for correct answer even if not selected */}
                                            {showFeedback && !isSelected && option.isCorrect && (
                                                <div className="mt-3 p-3 rounded-xl text-base md:text-lg bg-green-100 animate-fade-in">
                                                    {option.feedback}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Bottom bar for Next button (visible only after answering) */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-purple-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 flex justify-center ${showFeedback ? 'translate-y-0' : 'translate-y-full'}`}>
                <button
                    onClick={nextScenario}
                    className="w-full max-w-md py-4 bg-purple-600 text-white rounded-full font-bold text-xl md:text-2xl hover:bg-purple-700 shadow-lg flex items-center justify-center transform hover:scale-105 transition-all"
                >
                    {isLast ? "完成挑戰" : "下一題"}
                    {!isLast && <ChevronRight className="ml-2 w-6 h-6 md:w-8 md:h-8" />}
                </button>
            </div>
        </div>
    );
};

export default SocialContextGame;
