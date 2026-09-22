import React, { useState } from 'react';
import type { Difficulty } from '../types';
import {
  coordinateLabel,
  continueAfterMinesweeperHit,
  countAdjacentMines,
  generateMinesweeperPuzzle,
  revealMinesweeperRegion,
  revealTriggeredMine,
  resolveMinesweeperTeamTurn,
} from '../utils/facilitatedPuzzleRules';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
type Team = 'A' | 'B';
type Result = 'PLAYING' | 'MINE' | 'WON';

interface BoardState {
  revealed: Set<string>;
  flags: Set<string>;
  neutralFlags: Set<string>;
  mines: Set<string>;
  initialized: boolean;
  explodedMine: string | null;
}

interface GameState {
  board: BoardState;
  team: Team;
  scores: Record<Team, number>;
  result: Result;
}

const SETTINGS: Record<Difficulty, { rows: number; columns: number; mineCount: number }> = {
  NORMAL: { rows: 5, columns: 7, mineCount: 5 },
  ADVANCED: { rows: 6, columns: 8, mineCount: 8 },
};

const recentLayouts: Record<Difficulty, string[]> = { NORMAL: [], ADVANCED: [] };

const emptyGame = (): GameState => ({
  board: {
    revealed: new Set(),
    flags: new Set(),
    neutralFlags: new Set(),
    mines: new Set(),
    initialized: false,
    explodedMine: null,
  },
  team: 'A',
  scores: { A: 0, B: 0 },
  result: 'PLAYING',
});

const cloneGame = (game: GameState): GameState => ({
  board: {
    revealed: new Set(game.board.revealed),
    flags: new Set(game.board.flags),
    neutralFlags: new Set(game.board.neutralFlags),
    mines: new Set(game.board.mines),
    initialized: game.board.initialized,
    explodedMine: game.board.explodedMine,
  },
  team: game.team,
  scores: { ...game.scores },
  result: game.result,
});

const surroundingCells = (row: number, col: number, rows: number, columns: number): string[] => {
  const cells: string[] = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;
      if (nextRow >= 0 && nextCol >= 0 && nextRow < rows && nextCol < columns) cells.push(`${nextRow},${nextCol}`);
    }
  }
  return cells;
};

const MinesweeperGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const config = SETTINGS[difficulty];
  const [game, setGame] = useState<GameState>(emptyGame);
  const [history, setHistory] = useState<GameState[]>([]);
  const [flagMode, setFlagMode] = useState(false);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [recent, setRecent] = useState('第一次請直接選擇座標；第一格及周圍八格都不會有地雷。');

  const reset = (nextMode = mode) => {
    setGame(emptyGame());
    setHistory([]);
    setFlagMode(false);
    setRecent(nextMode === 'TEAMS'
      ? '新盤面尚未配置地雷，A 組請選擇第一個座標。'
      : '第一次請直接選擇座標；第一格及周圍八格都不會有地雷。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    reset(nextMode);
  };

  const commitTeamAction = (
    state: GameState,
    action: Parameters<typeof resolveMinesweeperTeamTurn>[2],
    completed = false,
  ): Pick<GameState, 'scores' | 'team'> => {
    if (mode !== 'TEAMS') return { scores: state.scores, team: state.team };
    const outcome = resolveMinesweeperTeamTurn(state.scores, state.team, action, completed);
    return { scores: outcome.scores, team: outcome.nextTeam };
  };

  const rememberHistory = () => setHistory(items => [...items, cloneGame(game)]);

  const finishSafeAction = (board: BoardState, coordinate: string) => {
    const completed = board.revealed.size === config.rows * config.columns - board.mines.size;
    const turn = commitTeamAction(game, 'SAFE', completed);
    setGame({ board, scores: turn.scores, team: turn.team, result: completed ? 'WON' : 'PLAYING' });
    setRecent(completed
      ? `${mode === 'TEAMS' ? `${game.team} 組：` : ''}安全翻開 ${coordinate}，並完成整個盤面！`
      : `${mode === 'TEAMS' ? `${game.team} 組：` : ''}安全翻開 ${coordinate}。`);
  };

  const hitMine = (key: string, coordinate: string) => {
    rememberHistory();
    const turn = commitTeamAction(game, 'MINE');
    setGame({
      board: {
        ...game.board,
        revealed: revealTriggeredMine(game.board.revealed, key),
        explodedMine: key,
      },
      scores: turn.scores,
      team: turn.team,
      result: 'MINE',
    });
    setRecent(`${mode === 'TEAMS' ? `${game.team} 組：` : ''}${coordinate} 是地雷${mode === 'TEAMS' ? '，扣 1 分並換隊' : ''}。`);
  };

  const initializeBoard = (key: string, coordinate: string) => {
    rememberHistory();
    let puzzle;
    try {
      puzzle = generateMinesweeperPuzzle({
        ...config,
        start: key,
        excludedLayouts: recentLayouts[difficulty],
      });
    } catch {
      puzzle = generateMinesweeperPuzzle({ ...config, start: key });
    }
    const layout = puzzle.mines.join('|');
    recentLayouts[difficulty] = [...recentLayouts[difficulty].filter(item => item !== layout), layout].slice(-12);
    const mines = new Set<string>(puzzle.mines);
    const revealed = revealMinesweeperRegion(key, mines, new Set<string>(), new Set<string>(), config.rows, config.columns);
    finishSafeAction({
      revealed,
      flags: new Set<string>(),
      neutralFlags: new Set<string>(),
      mines,
      initialized: true,
      explodedMine: null,
    }, coordinate);
  };

  const act = (row: number, col: number) => {
    if (game.result !== 'PLAYING') return;
    const key = `${row},${col}`;
    const coordinate = coordinateLabel(row, col);

    if (!game.board.initialized) {
      if (flagMode) {
        setRecent('第一步必須先安全翻開一格，之後才能插旗。');
        return;
      }
      initializeBoard(key, coordinate);
      return;
    }

    if (game.board.neutralFlags.has(key)) {
      setRecent(`${coordinate} 是先前踩到並由系統標記的地雷，不能移除。`);
      return;
    }

    if (flagMode && !game.board.revealed.has(key)) {
      rememberHistory();
      const flags = new Set(game.board.flags);
      const removing = flags.has(key);
      if (removing) flags.delete(key);
      else flags.add(key);
      const turn = commitTeamAction(game, removing ? 'FLAG_REMOVED' : 'FLAG_ADDED');
      setGame({ ...game, board: { ...game.board, flags }, scores: turn.scores, team: turn.team });
      setRecent(`${mode === 'TEAMS' ? `${game.team} 組：` : ''}${coordinate} ${removing ? '移除旗幟，隊伍不變' : '插上旗幟'}。`);
      return;
    }

    if (game.board.flags.has(key)) {
      setRecent(`${coordinate} 已插旗，請先切換到插旗模式移除。`);
      return;
    }

    if (game.board.revealed.has(key)) {
      const adjacent = countAdjacentMines(row, col, game.board.mines, config.rows, config.columns);
      if (adjacent === 0) return;
      const neighbors = surroundingCells(row, col, config.rows, config.columns);
      if (neighbors.filter(neighbor => game.board.flags.has(neighbor)).length !== adjacent) {
        setRecent(`${coordinate} 周圍旗幟數量還不等於 ${adjacent}。`);
        return;
      }
      const missedMine = neighbors.find(neighbor => game.board.mines.has(neighbor) && !game.board.flags.has(neighbor));
      if (missedMine) {
        const [mineRow, mineCol] = missedMine.split(',').map(Number);
        hitMine(missedMine, coordinateLabel(mineRow, mineCol));
        return;
      }
      rememberHistory();
      let revealed = new Set<string>(game.board.revealed);
      for (const neighbor of neighbors) {
        revealed = revealMinesweeperRegion(neighbor, game.board.mines, revealed, game.board.flags, config.rows, config.columns);
      }
      finishSafeAction({ ...game.board, revealed }, `${coordinate} 周圍`);
      return;
    }

    if (game.board.mines.has(key)) {
      hitMine(key, coordinate);
      return;
    }

    rememberHistory();
    const revealed = revealMinesweeperRegion(key, game.board.mines, game.board.revealed, game.board.flags, config.rows, config.columns);
    finishSafeAction({ ...game.board, revealed }, coordinate);
  };

  const continueAfterMine = () => {
    const mine = game.board.explodedMine;
    if (!mine) return;
    const continued = continueAfterMinesweeperHit(
      game.board.revealed,
      game.board.flags,
      game.board.neutralFlags,
      mine,
    );
    setGame({
      ...game,
      board: {
        ...game.board,
        ...continued,
        explodedMine: null,
      },
      result: 'PLAYING',
    });
    setRecent(`地雷已由系統插旗，${mode === 'TEAMS' ? `輪到 ${game.team} 組。` : '請根據新線索繼續。'}`);
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setGame(cloneGame(previous));
    setHistory(items => items.slice(0, -1));
    setRecent(`已復原治療者的誤觸，${mode === 'TEAMS' ? `仍由 ${previous.team} 組進行。` : '請繼續討論。'}`);
  };

  const hint = () => {
    if (!game.board.initialized) {
      setRecent('提示：第一格及周圍八格保證安全，可以任選一個座標開始。');
      return;
    }
    const safe = Array.from({ length: config.rows * config.columns }, (_, index) => `${Math.floor(index / config.columns)},${index % config.columns}`)
      .find(key => !game.board.mines.has(key) && !game.board.revealed.has(key) && !game.board.flags.has(key));
    if (!safe) return;
    const [row, col] = safe.split(',').map(Number);
    setRecent(`提示：${coordinateLabel(row, col)} 可以安全翻開。`);
  };

  const winner = game.scores.A === game.scores.B ? '平手' : `${game.scores.A > game.scores.B ? 'A' : 'B'} 組獲勝`;
  const statusCard = game.result === 'MINE' ? (
    <div className="rounded-xl border border-rose-300 bg-rose-50 p-2 text-center">
      <div className="text-sm font-black text-rose-800">踩到地雷</div>
      <div className="mt-1 text-xs font-semibold text-rose-700">只公開這一顆；繼續後會自動插旗。</div>
      <button type="button" onClick={continueAfterMine} className="mt-2 min-h-11 w-full rounded-lg bg-rose-700 px-3 text-sm font-black text-white">繼續遊戲</button>
    </div>
  ) : game.result === 'WON' ? (
    <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-2 text-center text-emerald-900">
      <div className="text-sm font-black">完成！所有安全格都已找出</div>
      {mode === 'TEAMS' && <div className="mt-1 text-sm font-bold">{winner}｜A {game.scores.A}：B {game.scores.B}</div>}
    </div>
  ) : null;

  return (
    <FacilitatedGameFrame
      title="合作踩地雷"
      subtitle={`${config.columns}×${config.rows}｜${config.mineCount} 顆地雷｜每局隨機且不需猜測`}
      onBack={onBack}
      mode={mode}
      onModeChange={changeMode}
      currentTeam={game.team}
      scores={game.scores}
      recentAction={recent}
      onUndo={undo}
      undoLabel="誤觸復原"
      onReset={() => reset()}
      onHint={hint}
      canUndo={history.length > 0}
      rules={[
        '目標：根據數字線索翻開所有安全格。盤面會隨機產生，並經過驗證，過程不需要猜測。',
        '第一步由玩家自行選擇座標；第一格及周圍八格保證沒有地雷，零區域會自動展開。',
        '數字代表相鄰八格共有幾顆地雷；旗幟用來標記推測的地雷位置。',
        '若已翻開數字周圍的旗幟數量相符，再點該數字可一次展開其餘相鄰格。',
        '踩雷時只公開該地雷。分組模式下踩雷扣 1 分並換隊，繼續後系統會替該格插上不能移除的中立旗。',
        '分組計分：安全翻開一次得 1 分，連鎖展開仍算一次；完成最後安全區域再加 1 分。',
        '分組換隊：安全翻開或新增旗幟後換隊；移除旗幟、提示及無效操作不換隊。',
        '「誤觸復原」只供治療者修正操作錯誤，會完整恢復先前盤面、分數與隊伍。',
        '口述範例：「C3 周圍已有兩面旗，所以翻開 D4。」欄為英文字母、列為數字。',
      ]}
      sidebar={(
        <>
          {statusCard}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-700">
            {game.board.initialized ? `已標記 ${game.board.flags.size}/${config.mineCount} 顆地雷` : '尚未配置地雷，請先翻開第一格'}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button type="button" aria-pressed={!flagMode} onClick={() => setFlagMode(false)} className={`min-h-11 rounded-xl border px-2 text-sm font-bold ${!flagMode ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white'}`}>安全翻開</button>
            <button type="button" aria-pressed={flagMode} disabled={!game.board.initialized || game.result !== 'PLAYING'} onClick={() => setFlagMode(true)} className={`min-h-11 rounded-xl border px-2 text-sm font-bold disabled:opacity-40 ${flagMode ? 'border-amber-600 bg-amber-500 text-white' : 'border-slate-300 bg-white'}`}>🚩 插旗</button>
            <button type="button" onClick={() => reset()} className="col-span-2 min-h-11 rounded-xl border border-sky-700 bg-white px-2 text-sm font-black text-sky-800">換新盤面</button>
          </div>
        </>
      )}
    >
      <CoordinateGrid
        rows={config.rows}
        columns={config.columns}
        className="w-full max-w-[32rem]"
        renderCell={(row, col, coordinate) => {
          const key = `${row},${col}`;
          const revealed = game.board.revealed.has(key);
          const mine = game.board.mines.has(key);
          const flagged = game.board.flags.has(key);
          const neutral = game.board.neutralFlags.has(key);
          const adjacent = countAdjacentMines(row, col, game.board.mines, config.rows, config.columns);
          return (
            <button
              type="button"
              aria-label={`${coordinate}${flagged ? (neutral ? '，系統標記地雷' : '，已插旗') : revealed ? (mine ? '，踩到地雷' : `，數字 ${adjacent}`) : '，未翻開'}`}
              onClick={() => act(row, col)}
              className={`h-full w-full rounded-md border-2 text-base font-black shadow-sm ${revealed ? (mine ? 'border-rose-700 bg-rose-200 text-rose-900 ring-4 ring-rose-300' : 'border-slate-300 bg-white text-indigo-800') : neutral ? 'border-slate-500 bg-slate-200 text-slate-800' : 'border-sky-700 bg-sky-500 text-white'}`}
            >
              {flagged && !revealed ? (neutral ? '⚑' : '🚩') : revealed ? (mine ? '✹' : adjacent || '') : '·'}
            </button>
          );
        }}
      />
    </FacilitatedGameFrame>
  );
};

export default MinesweeperGame;
