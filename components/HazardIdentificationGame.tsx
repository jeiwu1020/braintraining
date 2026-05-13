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
            <header className="p-4 md:p-6 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="flex items-center text-red-600 hover:text-red-800 transition-colors font-bold text-lg md:text-xl"
                >
                    <ArrowLeft className="mr-2 w-6 h-6 md:w-8 md:h-8" />
                    返回目錄
                </button>
                <div className="flex items-center space-x-2 text-red-800">
                    <TriangleAlert className="w-6 h-6 md:w-8 md:h-8" />
                    <h1 className="text-xl md:text-2xl font-bold">安全辨識</h1>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto p-2 sm:p-4 md:p-8 flex flex-col pb-24 md:pb-28 overflow-y-auto">
                
                {/* Information bar */}
                <div className="mb-3 sm:mb-6 bg-white/80 backdrop-blur p-3 sm:p-4 rounded-2xl flex items-start gap-4 border-l-4 border-red-500 shadow-sm">
                    <Info className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-800">請找出哪些是安全行為？哪些是危險行為？</h3>
                        <p className="text-gray-600 text-sm sm:text-lg">討論四個動作並點開全部選項，完成後可進入下一題。</p>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border-2 border-red-100 shadow-xl flex-1 flex flex-col">
                    <div className="mb-4 sm:mb-8 border-b-2 border-red-50 pb-3 sm:pb-6 text-center">
                        <span className="inline-block px-3 sm:px-4 py-1 bg-red-100 text-red-700 font-bold rounded-full text-sm sm:text-lg mb-2 sm:mb-4">
                            情境 {currentIndex + 1} / {scenes.length}
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 sm:mb-4">{currentScene.title}</h2>
                        <p className="text-xl md:text-3xl text-gray-600 font-medium">{currentScene.context}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3 sm:gap-4 md:gap-6 flex-1 content-start relative pb-4">
                        {currentScene.items.map((item, index) => {
                            const isRevealed = revealedItems.includes(index);
                            const isHazard = item.isHazard;
                            
                            let cardClass = "bg-gray-50 border-gray-200 hover:border-red-300 text-gray-700 cursor-pointer hover:shadow-md";
                            
                            if (isRevealed) {
                                if (isHazard) {
                                    cardClass = "bg-red-50 border-red-500 text-red-900 shadow-lg scale-[1.02]";
                                } else {
                                    cardClass = "bg-green-50 border-green-300 text-green-800 opacity-80 cursor-default";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleItemClick(index)}
                                    disabled={isRevealed && !isHazard}
                                    className={`relative text-left p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col ${cardClass}`}
                                >
                                    <div className="flex items-start mb-1 sm:mb-2">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center mr-3 sm:mr-4 text-base sm:text-xl font-bold bg-white shadow-sm
                                            ${isRevealed ? (isHazard ? 'text-red-600' : 'text-green-600') : 'text-gray-500'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <p className="text-lg sm:text-xl md:text-2xl font-bold pt-1">{item.text}</p>
                                    </div>
                                    
                                    {/* Explanation shown after click */}
                                    <div className={`overflow-hidden transition-all duration-500 ${isRevealed ? 'max-h-40 mt-2 sm:mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className={`p-3 sm:p-4 rounded-xl text-base sm:text-lg font-medium ${isHazard ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {isHazard ? <TriangleAlert className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5" />}
                                                <span className="font-bold">{isHazard ? '危險提示' : '安全行為'}</span>
                                            </div>
                                            {item.explanation}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Bottom bar for Next button (visible only after finding the hazard) */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-red-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 flex justify-center ${allRevealed ? 'translate-y-0' : 'translate-y-full'}`}>
                <button
                    onClick={nextScene}
                    className="w-full max-w-md py-4 bg-red-600 text-white rounded-full font-bold text-xl md:text-2xl hover:bg-red-700 shadow-lg flex items-center justify-center transform hover:scale-105 transition-all"
                >
                    {isLast ? "完成挑戰" : "下一個情境"}
                    {!isLast && <ChevronRight className="ml-2 w-6 h-6 md:w-8 md:h-8" />}
                </button>
            </div>
        </div>
    );
};

export default HazardIdentificationGame;
