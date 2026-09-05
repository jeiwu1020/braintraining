import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appSource = () => readFileSync('App.tsx', 'utf8');

const expectedMappings: Array<[string, string]> = [
  ['SORTING', 'SortingGame'],
  ['MEMORY', 'MemoryGame'],
  ['BREATHING', 'BreathingExercise'],
  ['AMBIENT_SOUND', 'AmbientSoundGame'],
  ['MANDALA', 'MandalaGame'],
  ['AFFIRMATION', 'AffirmationCardGame'],
  ['STARRY_RIPPLE', 'StarryRippleGame'],
  ['MUSCLE_RELAXATION', 'MuscleRelaxationGame'],
  ['GUESS_WHO', 'GuessWhoGame'],
  ['STORY_CARDS', 'StoryCardsGame'],
  ['CONDITIONAL_SNAP', 'ConditionalSnapGame'],
  ['REVEAL_PICTURE', 'RevealPictureGame'],
  ['MAZE_NAVIGATOR', 'MazeNavigatorGame'],
  ['WORD_TILE', 'WordTileGame'],
  ['SENTENCE', 'SentenceGame'],
  ['FIND', 'FindGame'],
  ['MARKET', 'MarketGame'],
  ['STEPS', 'StepsGame'],
  ['SHADOW', 'ShadowGame'],
  ['STROOP', 'StroopGame'],
  ['DOTS', 'DotGame'],
  ['EMOTION', 'EmotionGame'],
  ['PATTERN', 'PatternGame'],
  ['TIME', 'TimeGame'],
  ['ODD_ONE', 'OddOneGame'],
  ['SOUND', 'SoundGame'],
  ['PUZZLE', 'PuzzleGame'],
  ['SUDOKU', 'SudokuGame'],
  ['SPOT_DIFF', 'SpotDiffGame'],
  ['ZOOM', 'ZoomGame'],
  ['VERBAL_MEMORY', 'VerbalMemoryGame'],
  ['WORD_CHAIN', 'WordChainGame'],
  ['SIMON_SAYS', 'SimonSaysGame'],
  ['PRICE_ESTIMATION', 'PriceEstimationGame'],
  ['SOCIAL_CONTEXT', 'SocialContextGame'],
  ['HAZARD_ID', 'HazardIdentificationGame'],
  ['POSITIVE_THINKING', 'PositiveReappraisalGame'],
  ['WEIQI', 'WeiqiGame'],
  ['GOMOKU', 'GomokuGame'],
  ['DARK_CHESS', 'DarkChessGame'],
  ['CONNECT_FOUR', 'ConnectFourGame'],
  ['OTHELLO', 'OthelloGame'],
  ['DOTS_BOXES', 'DotsAndBoxesGame'],
  ['MANCALA', 'MancalaGame'],
  ['CHECKERS', 'CheckersGame'],
  ['GOBBLET', 'GobbletGame'],
  ['TREASURE', 'TreasureGame'],
  ['ROULETTE', 'RouletteGame'],
  ['BLACKJACK', 'BlackjackGame'],
  ['GUESS_CARD', 'GuessCardGame'],
  ['HIGHER_LOWER', 'HigherLowerGame'],
  ['MASTERMIND', 'MastermindGame'],
  ['SET', 'SetGame'],
  ['PYRAMID', 'PyramidGame'],
  ['MAHJONG_MELDS', 'MahjongMeldsGame'],
  ['RUMMIKUB', 'RummikubGame'],
  ['QWIRKLE', 'QwirkleGame'],
  ['SEVENS', 'SevensGame'],
  ['CHINESE_TEN', 'ChineseTenGame'],
];

describe('App game-level lazy loading acceptance', () => {
  it('removes eager game imports and preserves all 59 GameState mappings', () => {
    const source = appSource();
    const staticGameImports = source.match(/^import .* from ['"]\.\/components\/.*['"];$/gm) ?? [];
    const lazyDeclarations = [...source.matchAll(
      /const (\w+) = React\.lazy\(\(\) => import\('\.\/components\/(\w+)'\)\);/g,
    )];
    const cases = [...source.matchAll(/case GameState\.(\w+):\s*\n\s*return <(\w+)/g)];

    expect(staticGameImports).toHaveLength(0);
    expect(lazyDeclarations).toHaveLength(expectedMappings.length);
    expect(new Set(lazyDeclarations.map(match => match[1])).size).toBe(expectedMappings.length);
    expect(new Set(cases.map(match => match[1])).size).toBe(expectedMappings.length);

    for (const [state, component] of expectedMappings) {
      expect(source).toMatch(new RegExp(`case GameState\\.${state}:\\s*\\n\\s*return <${component}\\b`));
      expect(lazyDeclarations.some(match => match[1] === component && match[2] === component)).toBe(true);
    }
  });

  it('keeps MainMenu outside the lazy-game fallback and provides accessible loading copy', () => {
    const source = appSource();

    expect(source).toContain('<React.Suspense fallback={<LazyGameFallback bgClass={bgClass} />}>');
    expect(source).toContain('role="status"');
    expect(source).toContain('載入遊戲中…');
    expect(source).toMatch(/default:\s*\n\s*return <MainMenu/);
    expect(source).not.toMatch(/Suspense[\s\S]*default:\s*\n\s*return <MainMenu/);
  });
});
