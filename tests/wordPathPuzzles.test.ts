import { describe, expect, it } from 'vitest';
import * as WordPath from '../components/WordPathGame';
import { isValidWordPath } from '../utils/facilitatedPuzzleRules';

type Puzzle = { id: string; tier: string; columns: number; grid: readonly string[]; targets: Array<{ word: string; clue: string; rationale: string; paths: number[][] }>; required: number; goal: string };
const bank = () => (WordPath as unknown as { WORD_PATH_BANK?: Puzzle[] }).WORD_PATH_BANK ?? [];

describe('curated word-path content', () => {
  it('ships three genuinely distinct four-row puzzles in each local tier', () => {
    expect(bank()).toHaveLength(9);
    for (const tier of ['BEGINNER', 'STANDARD', 'CHALLENGE']) {
      const puzzles = bank().filter(item => item.tier === tier);
      expect(puzzles).toHaveLength(3);
      expect(new Set(puzzles.map(puzzle => puzzle.grid.join(''))).size).toBe(3);
    }
    expect(new Set(bank().map(puzzle => puzzle.id)).size).toBe(9);
    for (const puzzle of bank()) { expect(puzzle.columns).toBe(4); expect(puzzle.grid).toHaveLength(16); }
  });
  it('verifies every curated answer by spelling, bounds, orthogonal adjacency, and no reused cell', () => {
    expect(bank()).not.toHaveLength(0);
    for (const puzzle of bank()) for (const target of puzzle.targets) for (const path of target.paths) {
      expect(path.every(index => Number.isInteger(index) && index >= 0 && index < 16)).toBe(true);
      expect(new Set(path).size).toBe(path.length);
      expect(isValidWordPath(path, puzzle.columns)).toBe(true);
      expect(path.map(index => puzzle.grid[index]).join('')).toBe(target.word);
    }
  });
  it('uses familiar visible beginner words and semantic standard clues with real turning and backwards routes', () => {
    expect(bank().filter(p => p.tier === 'BEGINNER')).toHaveLength(3);
    for (const puzzle of bank().filter(p => p.tier === 'BEGINNER')) {
      expect(puzzle.targets.length).toBeGreaterThanOrEqual(3);
      expect(puzzle.targets.length).toBeLessThanOrEqual(4);
      expect(puzzle.targets.every(target => target.word.length === 2)).toBe(true);
    }
    const meanings: Record<string, string> = {
      春暖花開: '春天', 專心學習: '集中注意', 互相幫助: '彼此', 健康生活: '身體', 歡天喜地: '高興', 開心學習: '愉快', 同心協力: '共同', 知足常樂: '滿足', 早睡早起: '作息',
    };
    for (const puzzle of bank().filter(p => p.tier === 'STANDARD')) {
      expect(puzzle.targets).toHaveLength(3);
      for (const target of puzzle.targets) {
        expect(target.word.length).toBe(4); expect(target.clue).not.toContain(target.word);
        expect(target.clue + target.rationale).toContain(meanings[target.word]);
      }
      expect(puzzle.targets.some(t => t.paths.some(path => new Set(path.slice(1).map((cell, i) => cell - path[i])).size > 1))).toBe(true);
      expect(puzzle.targets.some(t => t.paths.some(path => path.some((cell, i) => i > 0 && cell < path[i - 1])))).toBe(true);
    }
  });
  it('sets a concrete two-path endpoint with two different physical solutions to the same word', () => {
    expect(bank().filter(p => p.tier === 'CHALLENGE')).toHaveLength(3);
    for (const puzzle of bank().filter(p => p.tier === 'CHALLENGE')) {
      expect(puzzle.goal).toBe('TWO_PATHS'); expect(puzzle.required).toBe(2);
      expect(puzzle.targets).toHaveLength(1);
      expect(new Set(puzzle.targets[0].paths.map(path => path.join(','))).size).toBeGreaterThanOrEqual(2);
    }
  });
  it('preserves the public legacy puzzle and common-word exports', () => {
    expect(WordPath.COMMON_WORDS.has('春天')).toBe(true);
    for (const puzzle of Object.values(WordPath.WORD_PATH_PUZZLES)) puzzle.paths.forEach((path, index) => {
      expect(isValidWordPath([...path], puzzle.columns)).toBe(true);
      expect(path.map(cell => puzzle.grid[cell]).join('')).toBe(puzzle.words[index]);
    });
  });
});
