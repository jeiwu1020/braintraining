import { describe, expect, it } from 'vitest';
import { GAME_CATALOG } from '../data/gameCatalog';
import { GameState } from '../types';

describe('new game catalogue entries', () => {
  it('registers all eight facilitated puzzle games with group and facilitator play', () => {
    const expected = [
      GameState.TRAFFIC_JAM,
      GameState.MINESWEEPER,
      GameState.NONOGRAM,
      GameState.HANOI,
      GameState.LOGIC_DETECTIVE,
      GameState.MATCHSTICK,
      GameState.WORD_PATH,
      GameState.NIM,
    ];

    for (const id of expected) {
      const game = GAME_CATALOG.find(candidate => candidate.id === id);
      expect(game?.playerModes).toContain('GROUP');
      expect(game?.playerModes).toContain('FACILITATED');
      expect(game?.normalDescription.length).toBeGreaterThan(0);
      expect(game?.advancedDescription?.length).toBeGreaterThan(0);
    }
  });
});
