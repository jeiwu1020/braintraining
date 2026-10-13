import { beforeAll, describe, expect, it } from 'vitest';
let api: typeof import('../utils/qwirkleRules');
beforeAll(async () => { api = await import('../utils/qwirkleRules').catch(() => ({} as typeof api)); });
const tile = (color: string, shape: string, id = `${color}-${shape}`) => ({ id, color, shape });
const at = (x: number, y: number, color: string, shape: string) => ({ x, y, tile: tile(color, shape, `${x}:${y}`) });
const corner = [at(-1, -1, 'blue', 'circle'), at(-1, 0, 'red', 'circle'), at(0, -1, 'blue', 'square')];
describe('Qwirkle local puzzle rules', () => {
  it('accepts exactly one shared attribute and rejects duplicate identities', () => {
    expect(api.isQwirkleLine).toBeTypeOf('function');
    expect(api.isQwirkleLine([tile('red', 'circle'), tile('red', 'square')] as never)).toBe(true);
    expect(api.isQwirkleLine([tile('red', 'circle'), tile('blue', 'circle')] as never)).toBe(true);
    expect(api.isQwirkleLine([tile('red', 'circle'), tile('blue', 'square')] as never)).toBe(false);
    expect(api.isQwirkleLine([tile('red', 'circle'), tile('red', 'circle', 'copy')] as never)).toBe(false);
  });
  it('checks both crossing lines and counts their center in both scores', () => {
    expect(api.evaluateQwirkleMove).toBeTypeOf('function');
    const good = api.evaluateQwirkleMove(corner as never, tile('red', 'square') as never, { x: 0, y: 0 });
    expect(good).toMatchObject({ valid: true, score: 4, horizontal: 2, vertical: 2 });
    expect(api.evaluateQwirkleMove(corner as never, tile('red', 'star') as never, { x: 0, y: 0 })).toMatchObject({ valid: false, reason: 'VERTICAL' });
    expect(api.evaluateQwirkleMove(corner as never, tile('blue', 'square') as never, { x: 0, y: 0 }).valid).toBe(false);
  });
  it('rejects occupied, detached and non-integer cells without changing the board', () => {
    expect(api.evaluateQwirkleMove).toBeTypeOf('function');
    const original = JSON.stringify(corner);
    for (const position of [{ x: -1, y: 0 }, { x: 4, y: 4 }, { x: 0.5, y: 0 }]) {
      expect(api.evaluateQwirkleMove(corner as never, tile('red', 'square') as never, position).valid).toBe(false);
    }
    expect(JSON.stringify(corner)).toBe(original);
  });
  it('awards a six-tile line 12 chess points, independently of activity points', () => {
    expect(api.evaluateQwirkleMove).toBeTypeOf('function');
    const shapes = ['circle', 'square', 'diamond', 'star', 'clover'];
    const board = shapes.map((shape, x) => at(x, 0, 'red', shape));
    expect(api.evaluateQwirkleMove(board as never, tile('red', 'cross') as never, { x: 5, y: 0 })).toMatchObject({ valid: true, score: 12 });
    expect(api.evaluateQwirkleMove([...board, at(5, 0, 'red', 'cross')] as never, tile('red', 'square') as never, { x: 6, y: 0 }).valid).toBe(false);
  });
  it('validates every existing line and connectivity in a puzzle board', () => {
    expect(api.validateQwirkleBoard).toBeTypeOf('function');
    expect(api.validateQwirkleBoard(corner as never)).toEqual([]);
    expect(api.validateQwirkleBoard([...corner, at(8, 8, 'red', 'star')] as never).length).toBeGreaterThan(0);
    expect(api.validateQwirkleBoard([at(0, 0, 'red', 'star'), at(1, 0, 'blue', 'square')] as never).length).toBeGreaterThan(0);
  });
});
