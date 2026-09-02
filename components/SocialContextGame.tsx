import React, { useState } from 'react';
import { CheckCircle, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { Difficulty } from '../types';
import { normalScenarios, advancedScenarios, Scenario } from '../data/socialContextData';
import GameShell from './game-ui/GameShell';
import SplitChoiceLayout from './game-ui/SplitChoiceLayout';

interface Props {
    onBack: () => void;
    difficulty: Difficulty;
}

interface SocialContextRoundViewProps {
    scenario: Scenario;
    difficulty: Difficulty;
    currentIndex: number;
    total: number;
    selectedOption: number | null;
    showFeedback: boolean;
    showOptions: boolean;
    isLast: boolean;
    onBack: () => void;
    onShowOptions: () => void;
    onOptionSelect: (index: number) => void;
    onNext: () => void;
}

export const SocialContextRoundView = ({
    scenario,
    difficulty,
    currentIndex,
    total,
    selectedOption,
    showFeedback,
    showOptions,
    isLast,
    onBack,
    onShowOptions,
    onOptionSelect,
    onNext,
}: SocialContextRoundViewProps) => {
    const selectedIsCorrect = selectedOption !== null && scenario.options[selectedOption]?.isCorrect;

    return (
        <GameShell
            title="情境應對"
            subtitle={difficulty === 'ADVANCED' ? '練習職場與複雜衝突回應' : '練習日常互動與合宜回應'}
            onBack={onBack}
            className="bg-purple-50"
            contentClassName="relative"
            status={(
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {difficulty === 'ADVANCED' && (
                        <span className="rounded-full bg-purple-600 px-2 py-1 text-xs text-white">進階</span>
                    )}
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-800 sm:px-3 sm:text-sm">
                        第 {currentIndex + 1}/{total} 題
                    </span>
                </div>
            )}
        >
            <SplitChoiceLayout
                className="mx-auto max-w-5xl"
                questionLabel="社交情境題目區"
                choicesLabel="社交情境作答區"
                questionClassName="flex flex-col items-center justify-center rounded-3xl border-2 border-purple-200 bg-white p-4 shadow-lg sm:p-6"
                choicesClassName="flex flex-col gap-2"
                question={(
                    <div className="w-full">
                        <h2 className="mb-2 text-xl font-bold text-purple-800 sm:text-2xl">{scenario.title}</h2>
                        <p className="text-base leading-relaxed text-gray-700 sm:text-lg">{scenario.description}</p>
                        {!showOptions && (
                            <div className="mt-4 flex justify-center border-t border-purple-100 pt-4">
                                <button
                                    type="button"
                                    onClick={onShowOptions}
                                    className="min-h-11 rounded-full bg-purple-600 px-6 py-2 font-bold text-white shadow hover:bg-purple-700"
                                >
                                    查看選項
                                </button>
                            </div>
                        )}
                    </div>
                )}
                choices={showOptions ? (
                    <>
                        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                            {scenario.options.map((option, index) => {
                                const isSelected = selectedOption === index;
                                const showCorrectness = showFeedback && (isSelected || option.isCorrect);
                                const optionClass = showCorrectness
                                    ? option.isCorrect
                                        ? 'border-green-500 bg-green-50 text-green-900'
                                        : 'border-red-400 bg-red-50 text-red-900'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300';

                                return (
                                    <button
                                        key={option.text}
                                        type="button"
                                        disabled={showFeedback}
                                        onClick={() => onOptionSelect(index)}
                                        className={`flex min-h-12 w-full items-start rounded-2xl border-2 p-2.5 text-left shadow-sm transition-colors disabled:cursor-default sm:p-3 ${optionClass}`}
                                    >
                                        <span className="mr-2 shrink-0 text-base font-bold opacity-60">{String.fromCharCode(65 + index)}.</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-start gap-2 font-medium leading-snug">
                                                {showCorrectness && option.isCorrect && <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />}
                                                {showCorrectness && !option.isCorrect && <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
                                                <span>{option.text}</span>
                                            </span>
                                            {showCorrectness && (
                                                <span className={`mt-1 block rounded-lg p-1.5 text-xs leading-snug sm:text-sm ${option.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    {option.feedback}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {showFeedback && (
                            <button
                                type="button"
                                onClick={onNext}
                                className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 px-4 font-bold text-white shadow hover:bg-purple-700"
                            >
                                {isLast ? '完成挑戰' : '下一題'}
                                {!isLast && <ChevronRight aria-hidden="true" className="ml-1 h-5 w-5" />}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex h-full min-h-32 items-center justify-center rounded-3xl border-2 border-dashed border-purple-200 bg-white/60 p-4 text-center font-bold text-purple-400">
                        閱讀情境後，按下「查看選項」
                    </div>
                )}
                feedback={showFeedback ? (
                    <span className={selectedIsCorrect ? 'text-green-700' : 'text-purple-800'}>
                        {selectedIsCorrect ? '這個回應很合適！' : '請參考綠色標示的建議回應' }
                    </span>
                ) : undefined}
            />
        </GameShell>
    );
};

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

    if (scenarios.length === 0) {
        return (
            <GameShell
                title="情境應對"
                subtitle={isAdvanced ? '練習職場與複雜衝突回應' : '練習日常互動與合宜回應'}
                onBack={onBack}
                className="bg-purple-50"
                contentClassName="flex items-center justify-center"
            >
                <div role="status" aria-live="polite" className="flex flex-col items-center text-purple-800">
                    <Loader2 aria-hidden="true" className="mb-4 h-12 w-12 animate-spin text-purple-600" />
                    <p>準備情境題目中...</p>
                </div>
            </GameShell>
        );
    }

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
        <SocialContextRoundView
            scenario={currentScenario}
            difficulty={difficulty}
            currentIndex={currentIndex}
            total={scenarios.length}
            selectedOption={selectedOption}
            showFeedback={showFeedback}
            showOptions={showOptions}
            isLast={isLast}
            onBack={onBack}
            onShowOptions={() => setShowOptions(true)}
            onOptionSelect={handleOptionSelect}
            onNext={nextScenario}
        />
    );
};

export default SocialContextGame;
