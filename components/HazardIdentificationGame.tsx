import React, { useState } from 'react';
import { TriangleAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { Difficulty } from '../types';
import { normalScenes, advancedScenes, HazardScene } from '../data/hazardData';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';

interface Props {
    onBack: () => void;
    difficulty: Difficulty;
}

interface HazardRoundViewProps {
    scene: HazardScene;
    difficulty: Difficulty;
    currentIndex: number;
    totalScenes: number;
    revealedItems: number[];
    isLast: boolean;
    onBack: () => void;
    onItemClick: (index: number) => void;
    onNext: () => void;
}

export const HazardRoundView: React.FC<HazardRoundViewProps> = ({
    scene,
    difficulty,
    currentIndex,
    totalScenes,
    revealedItems,
    isLast,
    onBack,
    onItemClick,
    onNext,
}) => {
    const allRevealed = revealedItems.length === scene.items.length;
    const latestIndex = revealedItems.length > 0 ? revealedItems[revealedItems.length - 1] : null;
    const latestItem = latestIndex === null ? null : scene.items[latestIndex];

    return (
        <GameShell
            title="安全辨識"
            subtitle="判斷情境中的安全與危險行為"
            onBack={onBack}
            className="bg-red-50"
            status={(
                <div className="flex items-center gap-2">
                    {difficulty === 'ADVANCED' && <span className="rounded-full bg-red-600 px-2 py-1 text-xs text-white">進階</span>}
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 sm:text-sm">情境 {currentIndex + 1}/{totalScenes}</span>
                </div>
            )}
        >
            <GridFocusLayout
                playfieldLabel="安全情境選項區"
                supportLabel="安全判斷說明區"
                playfieldClassName="overflow-hidden"
                supportClassName="flex items-center justify-center overflow-hidden"
                playfield={(
                    <div className="flex h-full min-h-0 flex-col gap-2">
                        <div className="shrink-0 rounded-2xl border border-red-100 bg-white px-3 py-2 text-center shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{scene.title}</h2>
                            <p className="text-sm text-slate-600 sm:text-base">{scene.context || scene.description}</p>
                        </div>
                        <div className="grid min-h-0 flex-1 grid-cols-2 content-center gap-2 overflow-y-auto">
                            {scene.items.map((item, index) => {
                                const isRevealed = revealedItems.includes(index);
                                const stateClass = isRevealed
                                    ? item.isHazard
                                        ? 'border-red-500 bg-red-50 text-red-900'
                                        : 'border-green-400 bg-green-50 text-green-900'
                                    : 'border-slate-200 bg-white text-slate-800 hover:border-red-300';

                                return (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => onItemClick(index)}
                                        aria-pressed={isRevealed}
                                        className={`flex min-h-14 items-center gap-2 rounded-xl border-2 p-2 text-left font-bold shadow-sm transition ${stateClass}`}
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">{index + 1}</span>
                                        <span className="min-w-0 flex-1 text-sm leading-snug sm:text-base">{item.text}</span>
                                        {isRevealed && (
                                            item.isHazard
                                                ? <TriangleAlert aria-label="危險行為" className="h-5 w-5 shrink-0 text-red-600" />
                                                : <CheckCircle2 aria-label="安全行為" className="h-5 w-5 shrink-0 text-green-600" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                support={(
                    <div className="flex w-full flex-col gap-3 rounded-2xl border border-red-100 bg-white p-3 text-center shadow-sm">
                        {latestItem ? (
                            <>
                                <div className={`flex items-center justify-center gap-2 font-bold ${latestItem.isHazard ? 'text-red-700' : 'text-green-700'}`}>
                                    {latestItem.isHazard ? <TriangleAlert className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                    {latestItem.isHazard ? '危險行為' : '安全行為'}
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-slate-700">{latestItem.explanation}</p>
                            </>
                        ) : (
                            <p className="text-sm font-bold leading-relaxed text-red-800">依序點選每個行為<br />查看安全判斷與原因</p>
                        )}
                        {allRevealed && (
                            <button type="button" onClick={onNext} className="flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-4 font-bold text-white shadow hover:bg-red-700">
                                {isLast ? '完成挑戰' : '下一個情境'}
                                {!isLast && <ChevronRight aria-hidden="true" className="ml-1 h-5 w-5" />}
                            </button>
                        )}
                    </div>
                )}
                feedback={<span className="text-red-700">已查看 {revealedItems.length}/{scene.items.length} 個行為</span>}
            />
        </GameShell>
    );
};

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
        <HazardRoundView
            scene={currentScene}
            difficulty={difficulty}
            currentIndex={currentIndex}
            totalScenes={scenes.length}
            revealedItems={revealedItems}
            isLast={isLast}
            onBack={onBack}
            onItemClick={handleItemClick}
            onNext={nextScene}
        />
    );
};

export default HazardIdentificationGame;
