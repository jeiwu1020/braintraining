import type { GoPuzzle, GoPuzzleTraining } from '../data/goPuzzles';
import { getAdjacentPoints, getGroupAndLiberties, playGoMove, type GoBoard, type Point } from '../services/goEngine';

const equalPoint = (a: Point, b: Point) => a.r === b.r && a.c === b.c;
const inBounds = (board: GoBoard, p: Point) => Number.isInteger(p.r) && Number.isInteger(p.c) && p.r >= 0 && p.c >= 0 && p.r < board.length && p.c < board.length;

/** A concrete terminal board check; this is not a search of all legal continuations. */
export function hasPuzzleGoal(board: GoBoard, goal: GoPuzzleTraining['goal']): boolean {
  if (goal.kind === 'CAPTURE') return goal.stones.length > 0 && goal.stones.every(p => inBounds(board, p) && board[p.r][p.c] !== 'WHITE');
  if (!inBounds(board, goal.anchor) || board[goal.anchor.r][goal.anchor.c] !== 'BLACK' || goal.eyes.length !== 2 || equalPoint(goal.eyes[0], goal.eyes[1])) return false;
  if (!goal.eyes.every(p => inBounds(board, p) && board[p.r][p.c] === 'EMPTY')) return false;
  const anchorGroup = getGroupAndLiberties(board, goal.anchor.r, goal.anchor.c);
  if (!goal.eyes.every(eye => anchorGroup.liberties.some(p => equalPoint(p, eye)))) return false;
  return goal.eyes.every(eye => {
    const boundaries = getAdjacentPoints(eye.r, eye.c, board.length);
    return boundaries.every(p => {
      if (board[p.r][p.c] !== 'BLACK') return false;
      const group = getGroupAndLiberties(board, p.r, p.c);
      // Includes corner shapes whose two separate chains share both eyes.
      return goal.eyes.every(e => group.liberties.some(liberty => equalPoint(liberty, e)));
    }) && !playGoMove(board, eye.r, eye.c, 'WHITE').isLegal;
  });
}

export function validatePuzzleTraining(puzzle: GoPuzzle, initial: GoBoard): string[] {
  if (!puzzle.training) return [];
  const { lines, goal } = puzzle.training;
  const issues: string[] = [];
  if (!lines.length) issues.push(`${puzzle.id}: 缺少驗證變化`);
  if (goal.kind === 'CAPTURE' && (!goal.stones.length || goal.stones.some(p => !inBounds(initial, p) || initial[p.r][p.c] !== 'WHITE'))) issues.push(`${puzzle.id}: 提子目標不是初始白棋`);
  const ids = new Set<string>();
  for (const line of lines) {
    if (!line.id || ids.has(line.id)) issues.push(`${puzzle.id}: 變化 ID 重複或空白`);
    ids.add(line.id);
    if (!line.moves.length || line.moves.length % 2 === 0) { issues.push(`${puzzle.id}/${line.id}: 變化須以黑方開始及結束`); continue; }
    const answers = puzzle.acceptedMoves?.length ? puzzle.acceptedMoves : puzzle.solutionMoves.map(item => item.playerMove);
    if (!answers.some(p => equalPoint(p, line.moves[0]))) issues.push(`${puzzle.id}/${line.id}: 變化首手不在參考清單`);
    let board = initial, ko: Point | null = null, legal = true;
    for (const [index, move] of line.moves.entries()) {
      if (!inBounds(board, move)) { legal = false; break; }
      const next = playGoMove(board, move.r, move.c, index % 2 ? 'WHITE' : 'BLACK', ko);
      if (!next.isLegal) { legal = false; break; }
      board = next.nextBoard; ko = next.koPoint;
    }
    if (!legal) issues.push(`${puzzle.id}/${line.id}: 變化含非法著`);
    else if (!hasPuzzleGoal(board, goal)) issues.push(`${puzzle.id}/${line.id}: 終局未達成所列目標`);
  }
  return issues;
}

export interface GoPuzzlePosition {
  board: GoBoard;
  moves: Point[];
  koPoint: Point | null;
  status: 'UNSOLVED' | 'CORRECT';
  feedback: string;
}

export function nextPuzzleMoves(puzzle: GoPuzzle, moves: Point[]): Point[] {
  const next = (puzzle.training?.lines ?? []).filter(line => moves.every((p, i) => line.moves[i] && equalPoint(p, line.moves[i]))).map(line => line.moves[moves.length]).filter((p): p is Point => !!p);
  return next.filter((p, index) => next.findIndex(other => equalPoint(p, other)) === index);
}

/** Unlisted legal choices remain unassessed, with the exercise board unchanged. */
export function advancePuzzle(puzzle: GoPuzzle, position: GoPuzzlePosition, point: Point): GoPuzzlePosition {
  if (position.status === 'CORRECT') return position;
  if (!inBounds(position.board, point)) return { ...position, feedback: '座標超出棋盤；盤面未改動。' };
  const color = position.moves.length % 2 ? 'WHITE' : 'BLACK';
  const result = playGoMove(position.board, point.r, point.c, color, position.koPoint);
  if (!result.isLegal) return { ...position, feedback: `${result.error ?? '不合法的落子'}；盤面未改動。` };
  const answers = puzzle.training ? nextPuzzleMoves(puzzle, position.moves) : (puzzle.acceptedMoves?.length ? puzzle.acceptedMoves : puzzle.solutionMoves.map(item => item.playerMove));
  if (!answers.some(p => equalPoint(p, point))) return { ...position, feedback: '這手合法，但未收錄於已驗證變化／參考首手；不判為錯棋，盤面保留以便比較。' };
  const moves = [...position.moves, point];
  const completedLine = puzzle.training?.lines.some(line => line.moves.length === moves.length && line.moves.every((p, i) => equalPoint(p, moves[i])));
  const complete = !puzzle.training || (completedLine && hasPuzzleGoal(result.nextBoard, puzzle.training.goal));
  return {
    board: result.nextBoard, moves, koPoint: result.koPoint, status: complete ? 'CORRECT' : 'UNSOLVED',
    feedback: complete ? puzzle.successMessage : moves.length % 2 ? '首手已下；選擇白方應手，再完成黑方後續。' : '白方已應手；請直接落下黑方下一手。'
  };
}
