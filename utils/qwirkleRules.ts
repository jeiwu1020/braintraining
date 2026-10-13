export const QWIRKLE_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const;
export const QWIRKLE_SHAPES = ['circle', 'square', 'diamond', 'star', 'clover', 'cross'] as const;
export type QwirkleColor = typeof QWIRKLE_COLORS[number];
export type QwirkleShape = typeof QWIRKLE_SHAPES[number];
export interface QwirkleTileData { id: string; color: QwirkleColor; shape: QwirkleShape }
export interface QwirklePosition { x: number; y: number }
export interface QwirklePlacedTile extends QwirklePosition { tile: QwirkleTileData }
export interface QwirkleTarget extends QwirklePosition { id: string }
export const QWIRKLE_COLOR_NAMES: Record<QwirkleColor, string> = { red: '紅色', orange: '橘色', yellow: '黃色', green: '綠色', blue: '藍色', purple: '紫色' };
export const QWIRKLE_SHAPE_NAMES: Record<QwirkleShape, string> = { circle: '圓形', square: '正方形', diamond: '菱形', star: '星星', clover: '四葉草', cross: '十字' };
export const qwirkleTileName = (tile: QwirkleTileData): string => `${QWIRKLE_COLOR_NAMES[tile.color]}${QWIRKLE_SHAPE_NAMES[tile.shape]}`;
const key = (p: QwirklePosition): string => `${p.x},${p.y}`;
const same = (a: QwirklePosition, b: QwirklePosition): boolean => a.x === b.x && a.y === b.y;
const validTile = (tile: QwirkleTileData): boolean => QWIRKLE_COLORS.includes(tile.color) && QWIRKLE_SHAPES.includes(tile.shape);

export function isQwirkleLine(tiles: readonly QwirkleTileData[]): boolean {
  if (!tiles.length || tiles.length > 6 || tiles.some(tile => !validTile(tile))) return false;
  const colors = new Set(tiles.map(tile => tile.color));
  const shapes = new Set(tiles.map(tile => tile.shape));
  return (colors.size === 1 && shapes.size === tiles.length) || (shapes.size === 1 && colors.size === tiles.length);
}

function lineAt(board: readonly QwirklePlacedTile[], position: QwirklePosition, dx: number, dy: number): QwirkleTileData[] {
  const center = board.find(item => same(item, position));
  if (!center) return [];
  const before: QwirkleTileData[] = []; const after: QwirkleTileData[] = [];
  for (const sign of [-1, 1]) {
    for (let distance = 1; ; distance++) {
      const tile = board.find(item => item.x === position.x + sign * dx * distance && item.y === position.y + sign * dy * distance);
      if (!tile) break;
      (sign < 0 ? before : after).push(tile.tile);
    }
  }
  return [...before.reverse(), center.tile, ...after];
}

export function validateQwirkleBoard(board: readonly QwirklePlacedTile[]): string[] {
  const errors: string[] = [];
  const occupied = new Set<string>();
  for (const item of board) {
    if (!Number.isInteger(item.x) || !Number.isInteger(item.y) || !validTile(item.tile)) errors.push('棋子或座標不合法。');
    if (occupied.has(key(item))) errors.push('棋子位置重疊。');
    occupied.add(key(item));
    if (!isQwirkleLine(lineAt(board, item, 1, 0)) || !isQwirkleLine(lineAt(board, item, 0, 1))) errors.push('現有橫線或直線不符合規則。');
  }
  if (board.length) {
    const connected = new Set([key(board[0])]); const queue = [board[0]];
    for (let head = 0; head < queue.length; head++) {
      for (const next of board) {
        if (!connected.has(key(next)) && Math.abs(next.x - queue[head].x) + Math.abs(next.y - queue[head].y) === 1) {
          connected.add(key(next)); queue.push(next);
        }
      }
    }
    if (connected.size !== board.length) errors.push('棋盤必須以相鄰的棋子連接。');
  }
  return [...new Set(errors)];
}

export interface QwirkleMoveResult {
  valid: boolean; score: number; horizontal: number; vertical: number;
  reason?: 'INVALID' | 'OCCUPIED' | 'DETACHED' | 'HORIZONTAL' | 'VERTICAL';
}
export function evaluateQwirkleMove(board: readonly QwirklePlacedTile[], tile: QwirkleTileData, position: QwirklePosition): QwirkleMoveResult {
  const invalid = (reason: QwirkleMoveResult['reason']): QwirkleMoveResult => ({ valid: false, score: 0, horizontal: 0, vertical: 0, reason });
  if (!validTile(tile) || !Number.isInteger(position.x) || !Number.isInteger(position.y) || validateQwirkleBoard(board).length) return invalid('INVALID');
  if (board.some(item => same(item, position))) return invalid('OCCUPIED');
  if (board.length && !board.some(item => Math.abs(item.x - position.x) + Math.abs(item.y - position.y) === 1)) return invalid('DETACHED');
  const next = [...board, { ...position, tile }];
  const horizontal = lineAt(next, position, 1, 0); const vertical = lineAt(next, position, 0, 1);
  if (!isQwirkleLine(horizontal)) return invalid('HORIZONTAL');
  if (!isQwirkleLine(vertical)) return invalid('VERTICAL');
  const scoredLines = [horizontal, vertical].filter(line => line.length > 1);
  const score = scoredLines.length ? scoredLines.reduce((sum, line) => sum + line.length + (line.length === 6 ? 6 : 0), 0) : 1;
  return { valid: true, score, horizontal: horizontal.length, vertical: vertical.length };
}

export type QwirkleTier = 'BEGINNER' | 'STANDARD' | 'CHALLENGE';
export interface QwirklePuzzle {
  id: string; tier: QwirkleTier; title: string; prompt: string;
  board: QwirklePlacedTile[]; hand: QwirkleTileData[]; targets: QwirkleTarget[];
  nextTile?: QwirkleTileData; hints: [string, string];
}
export interface QwirkleMove { tile: QwirkleTileData; target: QwirkleTarget }
export interface QwirkleSolution { moves: QwirkleMove[]; score: number }
/** Enumerates all permitted, rule-valid solutions. Targets bound a teaching puzzle, not a full board game. */
export function solveQwirklePuzzle(puzzle: QwirklePuzzle): QwirkleSolution[] {
  const solutions: QwirkleSolution[] = [];
  for (const tile of puzzle.hand) for (const target of puzzle.targets) {
    const first = evaluateQwirkleMove(puzzle.board, tile, target);
    if (!first.valid || (puzzle.tier === 'STANDARD' && (first.horizontal < 2 || first.vertical < 2))) continue;
    if (puzzle.tier !== 'CHALLENGE') { solutions.push({ moves: [{ tile, target }], score: first.score }); continue; }
    if (!puzzle.nextTile) continue;
    const board = [...puzzle.board, { ...target, tile }];
    for (const secondTarget of puzzle.targets) {
      const second = evaluateQwirkleMove(board, puzzle.nextTile, secondTarget);
      if (second.valid) solutions.push({ moves: [{ tile, target }, { tile: puzzle.nextTile, target: secondTarget }], score: first.score + second.score });
    }
  }
  return solutions.sort((a, b) => b.score - a.score);
}
