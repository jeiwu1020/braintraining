import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import OthelloGame, {
  buildOthelloReplayFrames,
  applyOthelloMove,
  getOthelloValidMoves,
  getOthelloWinner,
  isOthelloValidMove,
  OthelloBoardView,
  OthelloReviewControls,
} from '../components/OthelloGame';

const emptyBoard = () => Array.from({ length: 8 }, () => Array(8).fill(0));

const initialBoard = () => {
  const board = emptyBoard();
  board[3][3] = 2;
  board[3][4] = 1;
  board[4][3] = 1;
  board[4][4] = 2;
  return board;
};

describe('OthelloGame board-sidebar migration', () => {
  it('wires the real game through the cell-based board-sidebar contract', () => {
    const markup = renderToStaticMarkup(
      <OthelloGame difficulty="NORMAL" initialBoard={initialBoard()} onBack={() => undefined} />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="board-sidebar"');
    expect(markup).toContain('data-layout-region="board"');
    expect(markup).toContain('data-layout-region="sidebar"');
    expect(markup).not.toContain('data-layout-region="feedback"');
    expect(markup).toContain('data-board-coordinate-model="cell"');
    expect((markup.match(/data-othello-cell=/g) ?? [])).toHaveLength(64);
    expect(markup).toContain('data-othello-cell="A1"');
    expect(markup).toContain('data-othello-cell="H8"');
    expect(markup).toContain('黑白棋');
    expect(markup).toContain('黑棋');
    expect(markup).toContain('白棋');
    expect((markup.match(/<strong class="text-lg">2<\/strong>/g) ?? [])).toHaveLength(2);
    expect(markup).toContain('黑方回合');
    expect(markup).toContain('data-game-mode-selector="true"');
    expect(markup).toContain('data-game-mode-option="PVE"');
    expect(markup).toContain('data-game-mode-option="PVP"');
    expect(markup).toMatch(/data-game-mode-option="PVE"[^>]*aria-pressed="true"/);
    expect(markup).not.toContain('切換遊戲模式');
  });

  it('preserves initial legal moves, flipping, and invalid move semantics', () => {
    const board = initialBoard();
    const moves = getOthelloValidMoves(board, 1);
    expect(moves).toEqual([
      { r: 2, c: 3 },
      { r: 3, c: 2 },
      { r: 4, c: 5 },
      { r: 5, c: 4 },
    ]);
    expect(isOthelloValidMove(board, 0, 0, 1)).toBe(false);

    const nextBoard = applyOthelloMove(board, 2, 3, 1);
    expect(nextBoard[2][3]).toBe(1);
    expect(nextBoard[3][3]).toBe(1);
    expect(nextBoard[3][4]).toBe(1);
    expect(nextBoard[4][4]).toBe(2);
  });

  it('preserves terminal winner semantics from final board counts', () => {
    const board = emptyBoard();
    board[0][0] = 1;
    board[0][1] = 2;
    board[0][2] = 1;
    expect(getOthelloWinner(board)).toBe(1);

    board[0][3] = 2;
    expect(getOthelloWinner(board)).toBe(3);
  });

  it('builds review frames from the opening through every recorded move', () => {
    const opening = initialBoard();
    const afterBlack = applyOthelloMove(opening, 2, 3, 1);
    const afterWhite = applyOthelloMove(afterBlack, 2, 2, 2);

    const frames = buildOthelloReplayFrames(opening, [
      { board: afterBlack, player: 1, r: 2, c: 3 },
      { board: afterWhite, player: 2, r: 2, c: 2 },
    ]);

    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ board: opening, lastMove: null });
    expect(frames[1]).toEqual({ board: afterBlack, lastMove: { player: 1, r: 2, c: 3 } });
    expect(frames[2]).toEqual({ board: afterWhite, lastMove: { player: 2, r: 2, c: 2 } });
  });

  it('marks exactly one occupied cell as the previous move for visual and spoken reference', () => {
    const board = applyOthelloMove(initialBoard(), 2, 3, 1);
    const markup = renderToStaticMarkup(
      <OthelloBoardView
        board={board}
        validMoves={[]}
        turn={2}
        gameMode="PVP"
        interactionLocked
        lastMove={{ player: 1, r: 2, c: 3 }}
        onMove={() => undefined}
      />,
    );

    expect((markup.match(/data-last-move="true"/g) ?? [])).toHaveLength(1);
    expect(markup).toMatch(/data-othello-cell="D3"[^>]*aria-label="D3，黑棋，上一手落子"/);
    expect(markup).toContain('data-last-move-marker="true"');
  });

  it('keeps the result beside the board and exposes step-by-step review controls', () => {
    const finishedMarkup = renderToStaticMarkup(
      <OthelloReviewControls
        winner={1}
        blackCount={36}
        whiteCount={28}
        moveCount={60}
        reviewStep={null}
        onStartReview={() => undefined}
        onPrevious={() => undefined}
        onNext={() => undefined}
        onShowFinal={() => undefined}
        onRestart={() => undefined}
      />,
    );
    expect(finishedMarkup).toContain('終局盤面會保留');
    expect(finishedMarkup).toContain('開始復盤');
    expect(finishedMarkup).toContain('再來一局');
    expect(finishedMarkup).not.toContain('aria-modal="true"');

    const reviewMarkup = renderToStaticMarkup(
      <OthelloReviewControls
        winner={1}
        blackCount={2}
        whiteCount={2}
        moveCount={60}
        reviewStep={0}
        onStartReview={() => undefined}
        onPrevious={() => undefined}
        onNext={() => undefined}
        onShowFinal={() => undefined}
        onRestart={() => undefined}
      />,
    );
    expect(reviewMarkup).toContain('第 0 / 60 手');
    expect(reviewMarkup).toMatch(/aria-label="上一手"[^>]*disabled=""/);
    expect(reviewMarkup).toMatch(/aria-label="下一手"/);
    expect(reviewMarkup).toContain('回到終局');
  });
});
