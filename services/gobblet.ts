export type GobbletPlayer = 1 | 2;
export type GobbletSize = 0 | 1 | 2;

export interface GobbletPiece {
  player: GobbletPlayer;
  size: GobbletSize;
  id: string;
}

export type GobbletBoard = GobbletPiece[][];

export type GobbletMoveSource =
  | { kind: 'board'; index: number }
  | { kind: 'supply'; piece: GobbletPiece };

export interface GobbletMoveResult {
  board: GobbletBoard;
  winner: GobbletPlayer | null;
}

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export const hasGobbletLine = (
  board: GobbletBoard,
  player: GobbletPlayer,
): boolean => {
  const topPieces = board.map(stack => stack.at(-1) ?? null);

  for (const [first, second, third] of WINNING_LINES) {
    const pieces = [topPieces[first], topPieces[second], topPieces[third]];
    if (pieces.every(piece => piece?.player === player)) return true;
  }

  return false;
};

export const applyGobbletMove = (
  board: GobbletBoard,
  source: GobbletMoveSource,
  targetIndex: number,
  movingPlayer: GobbletPlayer,
): GobbletMoveResult => {
  const nextBoard = board.map(stack => [...stack]);
  const opponent = movingPlayer === 1 ? 2 : 1;
  let exposedOpponentLine = false;
  let movingPiece: GobbletPiece;

  if (source.kind === 'board') {
    movingPiece = nextBoard[source.index].pop()!;
    exposedOpponentLine = hasGobbletLine(nextBoard, opponent);
  } else {
    movingPiece = source.piece;
  }

  nextBoard[targetIndex].push(movingPiece);

  let winner: GobbletPlayer | null = null;
  if (exposedOpponentLine && hasGobbletLine(nextBoard, opponent)) {
    winner = opponent;
  } else if (hasGobbletLine(nextBoard, movingPlayer)) {
    winner = movingPlayer;
  } else if (hasGobbletLine(nextBoard, opponent)) {
    winner = opponent;
  }

  return {
    board: nextBoard,
    winner,
  };
};
