import { describe, expect, it } from 'vitest';
import { GameState } from '../types';
import {
  GAME_CATALOG,
  GAME_CATEGORIES,
  GAME_LAYOUT_PRESETS,
  getGameDescription,
  getGamesByCategory,
  parseGameCategoryId,
} from '../data/gameCatalog';

describe('game catalogue', () => {
  it('registers every playable game state exactly once', () => {
    const playableStates = Object.values(GameState).filter(state => state !== GameState.MENU);
    const registeredStates = GAME_CATALOG.map(game => game.id);

    expect(new Set(registeredStates).size).toBe(registeredStates.length);
    expect([...registeredStates].sort()).toEqual([...playableStates].sort());
  });

  it('keeps every game discoverable through one of the five menu categories', () => {
    expect(GAME_CATEGORIES.map(category => category.id)).toEqual([
      'COGNITIVE',
      'STRATEGY',
      'TABLETOP',
      'LIFE_SOCIAL',
      'RELAX',
    ]);

    const listedGames = GAME_CATEGORIES.flatMap(category =>
      getGamesByCategory(category.id).map(game => game.id),
    );

    expect(listedGames).toHaveLength(GAME_CATALOG.length);
    expect(new Set(listedGames).size).toBe(GAME_CATALOG.length);
  });

  it('rejects obsolete or corrupted saved menu categories', () => {
    expect(parseGameCategoryId('COGNITIVE')).toBe('COGNITIVE');
    expect(parseGameCategoryId('BOARD')).toBeNull();
    expect(parseGameCategoryId('unexpected')).toBeNull();
    expect(parseGameCategoryId(null)).toBeNull();
  });

  it('uses content categories while keeping group play as a tag', () => {
    const mastermind = GAME_CATALOG.find(game => game.id === GameState.MASTERMIND);
    const guessWho = GAME_CATALOG.find(game => game.id === GameState.GUESS_WHO);
    const emotion = GAME_CATALOG.find(game => game.id === GameState.EMOTION);

    expect(mastermind?.category).toBe('COGNITIVE');
    expect(guessWho?.category).toBe('COGNITIVE');
    expect(guessWho?.playerModes).toContain('GROUP');
    expect(emotion?.category).toBe('LIFE_SOCIAL');
  });

  it('provides difficulty-aware menu copy from the same catalogue entry', () => {
    expect(getGameDescription(GameState.MASTERMIND, 'NORMAL')).toBe(
      '3 個格子、3 種顏色，輕鬆體驗經典邏輯解謎。',
    );
    expect(getGameDescription(GameState.MASTERMIND, 'ADVANCED')).toBe(
      '4 個格子、4 種顏色，考驗進階邏輯推理。',
    );
  });

  it('gives every entry the metadata needed by future layout and filtering work', () => {
    for (const game of GAME_CATALOG) {
      expect(game.title.length).toBeGreaterThan(0);
      expect(game.normalDescription.length).toBeGreaterThan(0);
      expect(game.tags.length).toBeGreaterThan(0);
      expect(game.playerModes.length).toBeGreaterThan(0);
      expect(game.layoutPreset.length).toBeGreaterThan(0);
    }
  });

  it('classifies card-table and card-matrix games by their actual play surface', () => {
    const blackjack = GAME_CATALOG.find(game => game.id === GameState.BLACKJACK);
    const guessCard = GAME_CATALOG.find(game => game.id === GameState.GUESS_CARD);

    expect(blackjack?.layoutPreset).toBe('BOARD_TABLE');
    expect(guessCard?.layoutPreset).toBe('GRID_FOCUS');
  });

  it('keeps every layout preset in the canonical six-value contract', () => {
    expect(GAME_LAYOUT_PRESETS).toEqual([
      'SPLIT_CHOICE',
      'BOARD_SIDEBAR',
      'BOARD_TABLE',
      'GRID_FOCUS',
      'FACILITATOR',
      'IMMERSIVE',
    ]);
    expect(new Set(GAME_LAYOUT_PRESETS).size).toBe(GAME_LAYOUT_PRESETS.length);

    for (const game of GAME_CATALOG) {
      expect(GAME_LAYOUT_PRESETS).toContain(game.layoutPreset);
    }
  });
});

it('describes the facilitated Qwirkle piece-and-position planning activity', () => {
  const game = GAME_CATALOG.find(item => item.id === GameState.QWIRKLE);
  expect(game?.layoutPreset).toBe('BOARD_SIDEBAR');
  expect(game?.normalDescription).toContain('落點');
  expect(game?.advancedDescription).toContain('下一步');
});
