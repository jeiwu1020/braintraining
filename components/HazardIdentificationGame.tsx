import React, { useState } from 'react';
import { ArrowLeft, TriangleAlert, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { Difficulty } from '../types';
import { normalScenes, advancedScenes, HazardScene } from '../data/hazardData';

interface Props {
    onBack: () => void;
    difficulty: Difficulty;
}

const HazardIdentificationGame: React.FC<Props> = ({ onBack, difficulty }) => {
    const isAdvanced = difficulty === 'ADVANCED';
    const allScenes = isAdvanced ? advancedScenes : normalScenes;
    
    const [scenes, setScenes] = useState<HazardScene[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealedItems, setRevealedItems] = useState<number[]>([]);
    
    React.useEffect(() => {
        // Shuffle and pick 10 questions per game
        const shuffled = [...allScenes].sort(() => Math.random() - 0.5).slice(0, 10);
        setScenes(shuffled);
    }, [allScenes]);

    if (scenes.length === 0) return null;

    const currentScene = scenes[currentIndex];
    
    // Check if ALL options have been revealed
    const allRevealed = revealedItems.length === currentScene.items.length;

    const handleItemClick = (index: number) => {
        if (!revealedItems.includes(index)) {
            setRevealedItems([...revealedItems, index]);
        }
    };

    const nextScene = () => {
        if (currentIndex < scenes.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setRevealedItems([]);
        } else {
            // End of game
            setCurrentIndex(0);
            setRevealedItems([]);
            onBack();
        }
    };

    const isLast = currentIndex === scenes.length - 1;

    return (
        <div className="h-[100dvh] bg-red-50 flex flex-col font-sans overflow-hidden">
            <header className="px-2 py-2 md:p-6 landscape:py-1 landscape:md:py-2 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10 w-full">
                <button
                    onClick={onBack}
                    className="flex items-center text-red-600 hover:text-red-800 transition-colors font-bold text-sm md:text-xl shrink-0"
                >
                    <ArrowLeft className="mr-1 md:mr-2 w-5 h-5 md:w-8 md:h-8" />
                    <span className="hidden sm:inline landscape:hidden">返回目錄</span>
                </button>
                <div className="flex-1 flex justify-center items-center px-1">
                    <div className="flex items-center justify-center bg-red-50 px-2 sm:px-4 py-1 sm:py-2 landscape:py-0.5 rounded-full border border-red-100">
                        <Info className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-1 sm:mr-2 hidden sm:block landscape:hidden" />
                        <span className="font-bold text-xs sm:text-sm md:text-base text-red-800 text-center">
                            <span className="hidden sm:inline landscape:hidden">請找出哪些是安全行為？哪些是危險行為？</span>
                            <span className="sm:hidden landscape:inline">找出安全/危險行為</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 text-red-800 shrink-0">
                    <TriangleAlert className="hidden sm:block landscape:hidden w-5 h-5 md:w-8 md:h-8" />
                    <h1 className="text-sm sm:text-xl md:text-2xl font-bold">安全辨識</h1>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto p-2 sm:p-4 md:p-8 landscape:p-1 landscape:sm:p-2 flex flex-col pb-20 md:pb-28 overflow-y-auto landscape:pb-16 text-center">
                
                <div className="bg-white p-3 sm:p-6 md:p-8 landscape:p-2 rounded-2xl md:rounded-3xl border-2 border-red-100 shadow-xl flex-1 flex flex-col min-h-0">
                    <div className="mb-2 sm:mb-6 landscape:mb-1 border-b-2 border-red-50 pb-2 sm:pb-4 landscape:pb-1 text-center shrink-0">
                        <span className="inline-block px-2 sm:px-4 py-0.5 sm:py-1 landscape:py-0 bg-red-100 text-red-700 font-bold rounded-full text-xs sm:text-sm md:text-lg mb-1 sm:mb-2 landscape:mb-0.5">
                            情境 {currentIndex + 1} / {scenes.length}
                        </span>
                        <h2 className="text-lg sm:text-2xl md:text-4xl landscape:text-lg font-extrabold text-gray-800 mb-1 sm:mb-2 landscape:mb-0.5">{currentScene.title}</h2>
                        <p className="text-sm sm:text-xl md:text-3xl landscape:text-base text-gray-600 font-medium">{currentScene.context}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-2 sm:gap-4 md:gap-6 landscape:gap-1.5 flex-1 content-start relative pb-2 overflow-y-auto pr-1">
                        {currentScene.items.map((item, index) => {
                            const isRevealed = revealedItems.includes(index);
                            const isHazard = item.isHazard;
                            
                            let cardClass = "bg-gray-50 border-gray-200 hover:border-red-300 text-gray-700 cursor-pointer hover:shadow-md";
                            
                            if (isRevealed) {
                                if (isHazard) {
                                    cardClass = "bg-red-50 border-red-500 text-red-900 shadow-lg scale-[1.02] landscape:scale-[1.01]";
                                } else {
                                    cardClass = "bg-green-50 border-green-300 text-green-800 opacity-80 cursor-default";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleItemClick(index)}
                                    disabled={isRevealed && !isHazard}
                                    className={`relative text-left p-2 sm:p-4 md:p-6 landscape:p-1.5 rounded-xl md:rounded-2xl landscape:rounded-lg border-2 transition-all duration-300 flex flex-col ${cardClass}`}
                                >
                                    <div className="flex items-center sm:items-start mb-0 sm:mb-2 landscape:mb-0">
                                        <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 landscape:w-5 landscape:h-5 shrink-0 rounded-full flex items-center justify-center mr-2 sm:mr-3 md:mr-4 landscape:mr-1.5 text-sm sm:text-base md:text-xl landscape:text-xs font-bold bg-white shadow-sm
                                            ${isRevealed ? (isHazard ? 'text-red-600' : 'text-green-600') : 'text-gray-500'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <p className="text-sm sm:text-lg md:text-2xl landscape:text-sm font-bold sm:pt-1 landscape:pt-0 leading-tight">{item.text}</p>
                                    </div>
                                    
                                    {/* Explanation shown after click */}
                                    <div className={`overflow-hidden transition-all duration-500 ${isRevealed ? 'max-h-40 mt-1 sm:mt-2 md:mt-4 landscape:mt-0.5 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className={`p-2 sm:p-3 md:p-4 landscape:p-2 rounded-lg md:rounded-xl text-xs sm:text-base md:text-lg landscape:text-xs font-medium ${isHazard ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            <div className="flex items-center gap-1 sm:gap-2 landscape:gap-1 mb-0.5 sm:mb-1 landscape:mb-0">
                                                {isHazard ? <TriangleAlert className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 landscape:w-3 landscape:h-3"/> : <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 landscape:w-3 landscape:h-3" />}
                                                <span className="font-bold text-xs sm:text-sm md:text-base landscape:text-xs">{isHazard ? '危險提示' : '安全行為'}</span>
                                            </div>
                                            <span className="leading-snug">{item.explanation}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Bottom bar for Next button (visible only after finding the hazard) */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 landscape:p-2 bg-white border-t border-red-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 flex justify-center ${allRevealed ? 'translate-y-0' : 'translate-y-full'}`}>
                <button
                    onClick={nextScene}
                    className="w-full max-w-md py-4 landscape:py-2 bg-red-600 text-white rounded-full font-bold text-xl md:text-2xl landscape:text-base hover:bg-red-700 shadow-lg flex items-center justify-center transform hover:scale-105 transition-all"
                >
                    {isLast ? "完成挑戰" : "下一個情境"}
                    {!isLast && <ChevronRight className="ml-2 w-6 h-6 md:w-8 md:h-8 landscape:w-4 landscape:h-4" />}
                </button>
            </div>
        </div>
    );
};

export default HazardIdentificationGame;
