
import { SortingLevel, SentenceLevel, FindLevel, MarketLevel, StepsLevel, ShadowLevel, StroopLevel, DotLevel, EmotionLevel, PatternLevel, TimeLevel, OddOneLevel, SoundLevel, PuzzleLevel, Difficulty } from "../types";
import { 
    STATIC_SENTENCES, 
    STATIC_SENTENCES_ADVANCED,
    STATIC_SORTING_LEVELS, 
    STATIC_SORTING_LEVELS_ADVANCED,
    STATIC_FIND_PAIRS, 
    STATIC_ENCOURAGEMENTS,
    STATIC_MARKET_LEVELS,
    STATIC_MARKET_LEVELS_ADVANCED_FIXED,
    STATIC_STEPS_LEVELS,
    STATIC_STEPS_LEVELS_ADVANCED,
    STATIC_SHADOW_LEVELS,
    STATIC_SHADOW_LEVELS_ADVANCED,
    STATIC_SHADOW_CATEGORIES,
    STATIC_SHADOW_CONFUSING_SETS,
    STATIC_EMOTION_LEVELS,
    STATIC_EMOTION_LEVELS_ADVANCED,
    STATIC_PATTERN_LEVELS,
    STATIC_PATTERN_LEVELS_ADVANCED,
    STATIC_TIME_LEVELS,
    STATIC_TIME_LEVELS_ADVANCED,
    STATIC_ODD_ONE_LEVELS,
    STATIC_ODD_ONE_LEVELS_ADVANCED,
    STATIC_SOUND_LEVELS,
    STATIC_PUZZLE_LEVELS,
    STATIC_PUZZLE_LEVELS_ADVANCED
} from "./staticData";

// --- SORTING GAME ---
export const generateSortingLevel = async (excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: SortingLevel, index: number}> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const dataSource = difficulty === 'ADVANCED' ? STATIC_SORTING_LEVELS_ADVANCED : STATIC_SORTING_LEVELS;
  
  const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIndices.includes(idx));
  const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);
  
  const randomIndex = pool[Math.floor(Math.random() * pool.length)];
  const levelData = dataSource[randomIndex];
  
  // Scramble items within the question for variety even if repeated (rarely)
  const items = [...levelData.items.map(item => ({...item}))];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return {
    level: { categoryA: levelData.categoryA, categoryB: levelData.categoryB, items: items },
    index: randomIndex
  };
};

// --- SENTENCE GAME ---
export const generateSentenceLevel = async (excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: SentenceLevel, index: number}> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const dataSource = difficulty === 'ADVANCED' ? STATIC_SENTENCES_ADVANCED : STATIC_SENTENCES;
  
  const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIndices.includes(idx));
  const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);
  
  const randomIndex = pool[Math.floor(Math.random() * pool.length)];
  const sentence = dataSource[randomIndex];
  const chars = sentence.split('').map((char: string, index: number) => ({ id: `${index}-${char}`, text: char }));
  const shuffled = [...chars];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { 
      level: { original: sentence, scrambled: shuffled },
      index: randomIndex
  };
};

// --- FIND GAME ---
export const generateFindLevel = async (round: number = 1, excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: FindLevel, index: number}> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let targetDifficulty = 1;
    if (difficulty === 'NORMAL') {
        if (round >= 4 && round <= 6) targetDifficulty = 2;
        if (round >= 7) targetDifficulty = 3;
    } else {
        if (round <= 4) targetDifficulty = 2;
        else targetDifficulty = 3;
    }
    // Filter pairs by difficulty AND unused
    const eligiblePairs = STATIC_FIND_PAIRS.filter((p, idx) => p.difficulty === targetDifficulty && !excludeIndices.includes(idx));
    // Fallback: if all used in this tier, use any from this tier, or if absolutely none, use tracking from tracking logic handled by caller usually
    const pool = eligiblePairs.length > 0 ? eligiblePairs : STATIC_FIND_PAIRS.filter(p => p.difficulty === targetDifficulty);
    
    // We need to map back to original index to exclude it next time. 
    // This is tricky because we filtered. So we should pick from global index.
    const globalEligibleIndices = STATIC_FIND_PAIRS
        .map((p, i) => ({...p, originalIndex: i}))
        .filter(p => p.difficulty === targetDifficulty && !excludeIndices.includes(p.originalIndex))
        .map(p => p.originalIndex);

    const globalPool = globalEligibleIndices.length > 0 ? globalEligibleIndices : STATIC_FIND_PAIRS.map((_, i) => i); // Fallback to all if exhausted

    const selectedGlobalIndex = globalPool[Math.floor(Math.random() * globalPool.length)];
    const pair = STATIC_FIND_PAIRS[selectedGlobalIndex];
    
    const gridSize = 16; 
    const targetPosition = Math.floor(Math.random() * gridSize);
    return { 
        level: { target: pair.target, distractor: pair.distractor, gridSize, targetPosition },
        index: selectedGlobalIndex
    };
}

// --- MARKET GAME ---
export const generateMarketLevel = async (excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: MarketLevel, index: number}> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const dataSource = difficulty === 'ADVANCED' ? STATIC_MARKET_LEVELS_ADVANCED_FIXED : STATIC_MARKET_LEVELS;
    
    const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIndices.includes(idx));
    const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);
    
    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    return { 
        level: dataSource[randomIndex],
        index: randomIndex
    };
}

// --- STEPS GAME ---
export const generateStepsLevel = async (excludeTitles: string[] = [], difficulty: Difficulty = 'NORMAL'): Promise<StepsLevel> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const dataSource = difficulty === 'ADVANCED' ? STATIC_STEPS_LEVELS_ADVANCED : STATIC_STEPS_LEVELS;
    const availableLevels = dataSource.filter(l => !excludeTitles.includes(l.title));
    const pool = availableLevels.length > 0 ? availableLevels : dataSource;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const level = pool[randomIndex];
    const steps = [...level.steps];
    for (let i = steps.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [steps[i], steps[j]] = [steps[j], steps[i]];
    }
    return { title: level.title, steps: steps };
}

// --- SHADOW GAME ---
export const generateShadowLevel = async (excludeIds: string[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: ShadowLevel, id: string}> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    if (difficulty === 'ADVANCED') {
        // ADVANCED: Use Confusing Sets for similar outlines
        // Pick a random set from STATIC_SHADOW_CONFUSING_SETS
        const sets = STATIC_SHADOW_CONFUSING_SETS;
        const randomSetIndex = Math.floor(Math.random() * sets.length);
        const selectedSet = [...sets[randomSetIndex]]; // Copy to modify
        
        // Pick target
        const targetIndex = Math.floor(Math.random() * selectedSet.length);
        const target = selectedSet[targetIndex];
        
        // Filter out target to get distractors
        const distractorPool = selectedSet.filter(item => item !== target);
        
        const distractors = [...distractorPool];
        
        // Fill up to 5 distractors if needed
        while(distractors.length < 5) {
             // Pick another random set to steal from
             const backupSet = sets[Math.floor(Math.random() * sets.length)];
             const backupItem = backupSet[Math.floor(Math.random() * backupSet.length)];
             if (!distractors.includes(backupItem) && backupItem !== target) {
                 distractors.push(backupItem);
             }
        }
        
        // Trim to exactly 5 distractors
        const finalDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        const options = [target, ...finalDistractors];
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return { 
            level: { target, options, correctIndex: options.indexOf(target) },
            id: target 
        };

    } else {
        // NORMAL: Static list
        const dataSource = STATIC_SHADOW_LEVELS;
        
        const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIds.includes(String(idx)));
        const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);
        
        const targetIndex = pool[Math.floor(Math.random() * pool.length)];
        const targetLevel = dataSource[targetIndex];
        const target = targetLevel.target;

        // Distractor logic (same as before)
        const allEmojis = new Set<string>();
        dataSource.forEach(l => {
            allEmojis.add(l.target);
            l.options.forEach(o => allEmojis.add(o));
        });
        allEmojis.delete(target);
        const distractorPool = Array.from(allEmojis);
        
        const distractors = [];
        const poolCopy = [...distractorPool];
        for(let i=0; i<3; i++) {
            if(poolCopy.length === 0) break;
            const idx = Math.floor(Math.random() * poolCopy.length);
            distractors.push(poolCopy[idx]);
            poolCopy.splice(idx, 1);
        }
        
        const options = [target, ...distractors];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return { 
            level: { target: target, options: options, correctIndex: options.indexOf(target) },
            id: String(targetIndex)
        };
    }
}

// --- STROOP GAME ---
export const generateStroopLevel = async (difficulty: Difficulty = 'NORMAL', previousText: string = ""): Promise<StroopLevel> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const baseColors = [{ name: "紅", code: "text-red-500" }, { name: "藍", code: "text-blue-500" }, { name: "綠", code: "text-green-500" }, { name: "黑", code: "text-black" }];
    const advancedColors = [...baseColors, { name: "紫", code: "text-purple-500" }, { name: "橘", code: "text-orange-500" }, { name: "灰", code: "text-gray-500" }];
    const colors = difficulty === 'ADVANCED' ? advancedColors : baseColors;
    
    // Pick text that is NOT the same as previous round to avoid immediate repetition
    let textIndex;
    let attempts = 0;
    do {
        textIndex = Math.floor(Math.random() * colors.length);
        attempts++;
    } while (colors[textIndex].name === previousText && attempts < 10);

    const textObj = colors[textIndex];
    let colorIndex = Math.floor(Math.random() * colors.length);
    const mismatchChance = difficulty === 'ADVANCED' ? 0.9 : 0.7;
    if (colorIndex === textIndex && Math.random() < mismatchChance) {
         colorIndex = (colorIndex + 1) % colors.length;
    }
    const colorObj = colors[colorIndex];
    const correctAnswer = colorObj.name;
    const distractors = colors.filter(c => c.name !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 2).map(c => c.name);
    const options = [...distractors, correctAnswer].sort(() => 0.5 - Math.random());
    return { text: textObj.name, colorCode: colorObj.code, colorName: correctAnswer, options };
}

// --- DOTS GAME ---
export const generateDotLevel = async (round: number, difficulty: Difficulty = 'NORMAL'): Promise<DotLevel> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let gridSize = 3;
    let numDots = 3;
    let duration = 10000; 
    
    if (difficulty === 'NORMAL') {
        // Adjusted logic: Cap at 6 dots max for easier difficulty
        if (round === 1) { numDots = 3; gridSize = 3; }
        else if (round === 2) { numDots = 4; gridSize = 3; }
        else if (round === 3) { numDots = 5; gridSize = 4; }
        else { numDots = 6; gridSize = 4; } // Round 4+ stays at 6 dots
    } else {
        // Advanced logic (Unchanged)
        if (round === 1) { numDots = 4; gridSize = 3; duration = 8000; }
        else if (round === 2) { numDots = 5; gridSize = 4; duration = 8000; }
        else if (round === 3) { numDots = 6; gridSize = 4; duration = 7000; }
        else if (round === 4) { numDots = 7; gridSize = 4; duration = 6000; } 
        else if (round === 5) { numDots = 8; gridSize = 4; duration = 5000; }
        else if (round >= 6) { numDots = 9; gridSize = 4; duration = 4000; }
    }
    
    const totalCells = gridSize * gridSize;
    const activeIndices: number[] = [];
    while (activeIndices.length < numDots) {
        const idx = Math.floor(Math.random() * totalCells);
        if (!activeIndices.includes(idx)) {
            activeIndices.push(idx);
        }
    }
    return { gridSize, activeIndices, duration };
}

// --- EMOTION GAME ---
export const generateEmotionLevel = async (excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: EmotionLevel, index: number}> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const dataSource = difficulty === 'ADVANCED' ? STATIC_EMOTION_LEVELS_ADVANCED : STATIC_EMOTION_LEVELS;
    
    // Filter out used indices
    const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIndices.includes(idx));
    const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);
    
    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    const level = dataSource[randomIndex];
    const shuffledOptions = [...level.options].sort(() => 0.5 - Math.random());
    
    return { 
        level: { ...level, options: shuffledOptions },
        index: randomIndex
    };
}

// --- NEW GENERATORS ---

// 4. Pattern
export const generatePatternLevel = async (excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: PatternLevel, index: number}> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const dataSource = difficulty === 'ADVANCED' ? STATIC_PATTERN_LEVELS_ADVANCED : STATIC_PATTERN_LEVELS;
    
    const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIndices.includes(idx));
    const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);
    
    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    return { level: dataSource[randomIndex], index: randomIndex };
};

// 5. Time
export const generateTimeLevel = async (excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: TimeLevel, index: number}> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const dataSource = difficulty === 'ADVANCED' ? STATIC_TIME_LEVELS_ADVANCED : STATIC_TIME_LEVELS;
    
    // Filter used questions
    const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIndices.includes(idx));
    const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);

    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    const level = dataSource[randomIndex];
    
    return {
        level: {
            ...level,
            options: [...level.options].sort(() => 0.5 - Math.random()) // Shuffle options
        },
        index: randomIndex
    };
};

// 6. Odd One Out
export const generateOddOneLevel = async (excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: OddOneLevel, index: number}> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const dataSource = difficulty === 'ADVANCED' ? STATIC_ODD_ONE_LEVELS_ADVANCED : STATIC_ODD_ONE_LEVELS;
    
    // Filter used questions
    const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIndices.includes(idx));
    const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);

    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    const level = dataSource[randomIndex];
    
    // We need to shuffle items but keep track of the correct answer
    const originalItems = level.items;
    const correctItem = originalItems[level.correctIndex];
    
    const shuffledItems = [...originalItems].sort(() => 0.5 - Math.random());
    const newCorrectIndex = shuffledItems.indexOf(correctItem);
    
    return {
        level: {
            items: shuffledItems,
            correctIndex: newCorrectIndex,
            reason: level.reason
        },
        index: randomIndex
    };
};

// 7. Sound
export const generateSoundLevel = async (excludeIndices: number[] = [], difficulty: Difficulty = 'NORMAL'): Promise<{level: SoundLevel, index: number}> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Sound game now uses a large static pool for consistency and uniqueness tracking
    const dataSource = STATIC_SOUND_LEVELS;
    
    // Filter used questions
    const availableIndices = dataSource.map((_, idx) => idx).filter(idx => !excludeIndices.includes(idx));
    const pool = availableIndices.length > 0 ? availableIndices : dataSource.map((_, idx) => idx);

    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    const level = dataSource[randomIndex];
    
    return {
        level: {
            ...level,
            options: [...level.options].sort(() => 0.5 - Math.random())
        },
        index: randomIndex
    };
};

// 8. Puzzle
export const generatePuzzleLevel = async (difficulty: Difficulty = 'NORMAL'): Promise<PuzzleLevel> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const dataSource = difficulty === 'ADVANCED' ? STATIC_PUZZLE_LEVELS_ADVANCED : STATIC_PUZZLE_LEVELS;
    const randomIndex = Math.floor(Math.random() * dataSource.length);
    const level = dataSource[randomIndex];
    
    // Create scrambled pieces
    const pieces = level.targetImage.map((content, idx) => ({ id: idx, content }));
    let scrambled = [...pieces].sort(() => 0.5 - Math.random());
    
    // Ensure not solved initially
    const isSolved = (arr: any[]) => arr.every((p, i) => p.id === i);
    while (isSolved(scrambled)) {
        scrambled = [...pieces].sort(() => 0.5 - Math.random());
    }
    
    return {
        gridSize: level.gridSize,
        targetImage: level.targetImage,
        scrambled: scrambled
    };
};

// --- ENCOURAGEMENT ---
export const generateEncouragement = async (score: number): Promise<string> => {
    const randomIndex = Math.floor(Math.random() * STATIC_ENCOURAGEMENTS.length);
    return STATIC_ENCOURAGEMENTS[randomIndex];
};
