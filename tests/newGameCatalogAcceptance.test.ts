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

it('describes the actual redesigned board sizes and strategic entry tasks', () => {
  const game = (id: GameState) => GAME_CATALOG.find(item => item.id === id)!;
  expect(game(GameState.MINESWEEPER).normalDescription).toContain('6×6');
  expect(game(GameState.MINESWEEPER).advancedDescription).toContain('全盤剩雷');
  expect(game(GameState.NONOGRAM).advancedDescription).toContain('5×5');
  expect(game(GameState.WORD_PATH).advancedDescription).toContain('4×4');
  expect(game(GameState.TRAFFIC_JAM).normalDescription).toContain('8–14');
  expect(game(GameState.TRAFFIC_JAM).advancedDescription).toContain('15–25');
  expect(game(GameState.HANOI).advancedDescription).toContain('A 柱完整移到 C 柱');
  expect(game(GameState.NIM).advancedDescription).toContain('拿到最後一顆者輸');
});
it('describes Mahjong as a local multi-answer reasoning task with facilitator layout',()=>{
 const game=GAME_CATALOG.find(item=>item.id===GameState.MAHJONG_MELDS)!;
 expect(game.layoutPreset).toBe('BOARD_SIDEBAR');expect(game.advancedDescription).toContain('全部');expect(game.advancedDescription).toContain('捨牌');
});
it('describes Rummikub as whole-table rebuilding rather than unavailable joker play',()=>{
 const game=GAME_CATALOG.find(item=>item.id===GameState.RUMMIKUB)!;
 expect(game.layoutPreset).toBe('BOARD_SIDEBAR');expect(game.advancedDescription).toContain('整桌');expect(game.normalDescription+game.advancedDescription).not.toContain('百搭');
});
it('describes Sevens as visible short rounds rather than isolated answer cards',()=>{
 const game=GAME_CATALOG.find(item=>item.id===GameState.SEVENS)!;expect(game.layoutPreset).toBe('BOARD_SIDEBAR');expect(game.advancedDescription).toContain('短局');
});
it('describes Chinese Ten as explicit pairing and two public captures',()=>{const game=GAME_CATALOG.find(item=>item.id===GameState.CHINESE_TEN)!;expect(game.layoutPreset).toBe('BOARD_SIDEBAR');expect(game.advancedDescription).toContain('兩次');});
it('describes original Go modes and board sizes with verified puzzle variations',()=>{const game=GAME_CATALOG.find(item=>item.id===GameState.WEIQI)!;expect(game.normalDescription).toContain('人機對戰');expect(game.advancedDescription).toContain('9／13／19');expect(game.playerModes).toContain('FACILITATED');});
