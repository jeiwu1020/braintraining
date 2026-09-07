import React, { useEffect, useState } from 'react';
import { RefreshCw, Trophy, Undo2, HelpCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import GameShell from './game-ui/GameShell';
import BoardSidebarLayout from './game-ui/BoardSidebarLayout';
import GameModeSelector from './game-ui/GameModeSelector';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
  initialHLines?: number[][];
  initialVLines?: number[][];
  initialSquares?: number[][];
  initialTurn?: number;
}
interface GameState { hLines: number[][]; vLines: number[][]; squares: number[][]; turn: number; scores: { p1: number; p2: number } }
const ROWS = 4; const COLS = 4;
const clone = (lines: number[][]) => lines.map(row => [...row]);
const emptyHLines = () => Array.from({ length: ROWS + 1 }, () => Array(COLS).fill(0));
const emptyVLines = () => Array.from({ length: ROWS }, () => Array(COLS + 1).fill(0));
const emptySquares = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export const isDotsBoxComplete = (r: number, c: number, hLines: number[][], vLines: number[][]) => (
  hLines[r]?.[c] !== 0 && hLines[r + 1]?.[c] !== 0 && vLines[r]?.[c] !== 0 && vLines[r]?.[c + 1] !== 0
);

export const getCompletedBoxesForEdge = (type: 'h' | 'v', r: number, c: number, hLines: number[][], vLines: number[][]) => {
  const boxes: { r: number; c: number }[] = [];
  if (type === 'h') {
    if (r > 0 && isDotsBoxComplete(r - 1, c, hLines, vLines)) boxes.push({ r: r - 1, c });
    if (r < ROWS && isDotsBoxComplete(r, c, hLines, vLines)) boxes.push({ r, c });
  } else {
    if (c > 0 && isDotsBoxComplete(r, c - 1, hLines, vLines)) boxes.push({ r, c: c - 1 });
    if (c < COLS && isDotsBoxComplete(r, c, hLines, vLines)) boxes.push({ r, c });
  }
  return boxes;
};

const DotsAndBoxesGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL', initialHLines, initialVLines, initialSquares, initialTurn = 1 }) => {
  const [hLines, setHLines] = useState<number[][]>(() => initialHLines ? clone(initialHLines) : emptyHLines());
  const [vLines, setVLines] = useState<number[][]>(() => initialVLines ? clone(initialVLines) : emptyVLines());
  const [squares, setSquares] = useState<number[][]>(() => initialSquares ? clone(initialSquares) : emptySquares());
  const [turn, setTurn] = useState(initialTurn); const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE'); const [winner, setWinner] = useState<number | null>(null);
  const [history, setHistory] = useState<GameState[]>([]); const [showRules, setShowRules] = useState(false);

  useEffect(() => { resetGame(); }, [gameMode]);
  const resetGame = () => { setHLines(initialHLines ? clone(initialHLines) : emptyHLines()); setVLines(initialVLines ? clone(initialVLines) : emptyVLines()); setSquares(initialSquares ? clone(initialSquares) : emptySquares()); setTurn(initialTurn); setScores({ p1: 0, p2: 0 }); setWinner(null); setHistory([]); };
  const endGame = (nextSquares: number[][]) => { let p1s = 0; let p2s = 0; nextSquares.forEach(row => row.forEach(owner => { if (owner === 1) p1s += 1; else if (owner === 2) p2s += 1; })); setScores({ p1: p1s, p2: p2s }); if (p1s + p2s === ROWS * COLS) { setWinner(p1s > p2s ? 1 : p2s > p1s ? 2 : 3); soundService.playWin(); } };
  const makeMove = (type: 'h' | 'v', r: number, c: number) => { const nextHLines = clone(hLines); const nextVLines = clone(vLines); const nextSquares = clone(squares); if (type === 'h') nextHLines[r][c] = turn; else nextVLines[r][c] = turn; const completed = getCompletedBoxesForEdge(type, r, c, nextHLines, nextVLines); completed.forEach(box => { nextSquares[box.r][box.c] = turn; }); setHLines(nextHLines); setVLines(nextVLines); setSquares(nextSquares); soundService.playGameSound('BOUNCE'); if (completed.length > 0) { endGame(nextSquares); soundService.playCorrect(); } else setTurn(prev => prev === 1 ? 2 : 1); };
  const handleLineClick = (type: 'h' | 'v', r: number, c: number) => { if (winner || (gameMode === 'PVE' && turn === 2)) return; if (type === 'h' ? hLines[r][c] !== 0 : vLines[r][c] !== 0) return; setHistory(prev => [...prev, { hLines: clone(hLines), vLines: clone(vLines), squares: clone(squares), turn, scores: { ...scores } }]); makeMove(type, r, c); };
  const handleUndo = () => { if (history.length === 0) return; let targetIndex = history.length - 1; if (gameMode === 'PVE') { while (targetIndex >= 0 && history[targetIndex].turn === 2) targetIndex -= 1; if (targetIndex < 0) targetIndex = 0; } const previous = history[targetIndex]; setHistory(history.slice(0, targetIndex)); setHLines(previous.hLines); setVLines(previous.vLines); setSquares(previous.squares); setTurn(previous.turn); setScores(previous.scores); setWinner(null); };

  useEffect(() => {
    if (gameMode !== 'PVE' || turn !== 2 || winner) return;
    const timer = setTimeout(() => {
      const possibleMoves: { type: 'h' | 'v'; r: number; c: number; completes: number; risky: boolean }[] = [];
      const checkCompletes = (type: 'h' | 'v', r: number, c: number) => { const h = clone(hLines); const v = clone(vLines); if (type === 'h') h[r][c] = 2; else v[r][c] = 2; return getCompletedBoxesForEdge(type, r, c, h, v).length; };
      const checkRisky = (type: 'h' | 'v', r: number, c: number) => { const h = clone(hLines); const v = clone(vLines); if (type === 'h') h[r][c] = 2; else v[r][c] = 2; const risky = (sr: number, sc: number) => { if (sr < 0 || sr >= ROWS || sc < 0 || sc >= COLS || squares[sr][sc] !== 0) return false; let sides = 0; if (h[sr][sc] !== 0) sides += 1; if (h[sr + 1][sc] !== 0) sides += 1; if (v[sr][sc] !== 0) sides += 1; if (v[sr][sc + 1] !== 0) sides += 1; return sides === 3; }; return type === 'h' ? risky(r - 1, c) || risky(r, c) : risky(r, c - 1) || risky(r, c); };
      for (let r = 0; r <= ROWS; r += 1) for (let c = 0; c < COLS; c += 1) if (hLines[r][c] === 0) possibleMoves.push({ type: 'h', r, c, completes: checkCompletes('h', r, c), risky: false });
      for (let r = 0; r < ROWS; r += 1) for (let c = 0; c <= COLS; c += 1) if (vLines[r][c] === 0) possibleMoves.push({ type: 'v', r, c, completes: checkCompletes('v', r, c), risky: false });
      possibleMoves.forEach(move => { if (move.completes === 0) move.risky = checkRisky(move.type, move.r, move.c); });
      const scorers = possibleMoves.filter(move => move.completes > 0); const safe = possibleMoves.filter(move => !move.risky); const pool = scorers.length > 0 ? scorers : safe.length > 0 ? safe : possibleMoves; const best = pool[Math.floor(Math.random() * pool.length)];
      if (best) { setHistory(prev => [...prev, { hLines: clone(hLines), vLines: clone(vLines), squares: clone(squares), turn, scores: { ...scores } }]); makeMove(best.type, best.r, best.c); }
    }, 600);
    return () => clearTimeout(timer);
  }, [turn, hLines, vLines, squares, gameMode, winner]);

  const lineColor = (owner: number) => owner === 1 ? 'bg-red-500' : owner === 2 ? 'bg-blue-500' : 'bg-slate-200';
  const statusText = winner === 1 ? '紅方獲勝！' : winner === 2 ? '藍方獲勝！' : winner === 3 ? '平手' : turn === 1 ? '紅方回合' : '藍方回合';
  const boardView = <div className="flex h-full min-h-0 w-full items-center justify-center p-1 sm:p-2"><div className="relative aspect-square w-full max-w-full" style={{ width: 'min(100%, calc(100dvh - 6rem))' }} data-board-coordinate-model="edge" data-dots-rows="4" data-dots-cols="4"><div className="absolute inset-[10%] grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>{squares.map((row, r) => row.map((owner, c) => <div key={`box-${r}-${c}`} data-dots-box={`${r}-${c}`} className={`m-1 flex items-center justify-center rounded-lg ${owner === 1 ? 'bg-red-100' : owner === 2 ? 'bg-blue-100' : 'bg-transparent'}`}>{owner === 1 ? <span className="font-bold text-red-600">紅</span> : owner === 2 ? <span className="font-bold text-blue-600">藍</span> : null}</div>))}</div><div className="absolute inset-[10%] z-20 flex flex-col justify-between pointer-events-none">{Array.from({ length: ROWS + 1 }, (_, r) => <div key={`dots-row-${r}`} className="flex justify-between">{Array.from({ length: COLS + 1 }, (_, c) => <span key={`dot-${r}-${c}`} data-dots-dot={`${r}-${c}`} aria-hidden="true" className="h-3 w-3 -m-1.5 rounded-full border border-gray-600 bg-gray-800 sm:h-4 sm:w-4 sm:-m-2" />)}</div>)}</div><div className="absolute inset-[10%] z-10 flex flex-col justify-between pointer-events-none">{hLines.map((row, r) => <div key={`h-row-${r}`} className="flex h-0 pointer-events-none">{row.map((owner, c) => <button key={`h-${r}-${c}`} type="button" data-dots-edge={`h-${r}-${c}`} aria-label={owner === 0 ? `畫上方第${r + 1}列第${c + 1}條水平線` : `第${r + 1}列第${c + 1}條水平線，${owner === 1 ? '紅方' : '藍方'}已佔有`} disabled={owner !== 0 || Boolean(winner) || (gameMode === 'PVE' && turn === 2)} onClick={() => handleLineClick('h', r, c)} className="pointer-events-auto relative -mt-3 flex h-6 min-w-0 flex-1 items-center justify-center cursor-pointer disabled:cursor-not-allowed sm:-mt-4 sm:h-8"><span aria-hidden="true" className={`h-1.5 w-full rounded-full ${lineColor(owner)}`} /></button>)}</div>)}</div><div className="absolute inset-[10%] z-10 flex justify-between pointer-events-none">{Array.from({ length: COLS + 1 }, (_, c) => <div key={`v-col-${c}`} className="flex w-0 flex-col justify-between pointer-events-none">{vLines.map((row, r) => <button key={`v-${r}-${c}`} type="button" data-dots-edge={`v-${r}-${c}`} aria-label={row[c] === 0 ? `畫第${r + 1}列第${c + 1}條垂直線` : `第${r + 1}列第${c + 1}條垂直線，${row[c] === 1 ? '紅方' : '藍方'}已佔有`} disabled={row[c] !== 0 || Boolean(winner) || (gameMode === 'PVE' && turn === 2)} onClick={() => handleLineClick('v', r, c)} className="pointer-events-auto relative -ml-3 flex h-auto min-h-0 w-6 flex-1 items-center justify-center cursor-pointer disabled:cursor-not-allowed sm:-ml-4 sm:w-8"><span aria-hidden="true" className={`h-full w-1.5 rounded-full ${lineColor(row[c])}`} /></button>)}</div>)}</div><div className="absolute inset-[10%] rounded border-4 border-slate-200 bg-white/20 shadow-xl pointer-events-none" /></div></div>;
  const sidebarView = (
    <div className="flex h-full min-h-0 flex-col gap-2 rounded-xl border border-rose-200 bg-white/90 p-2 text-rose-950 shadow-sm sm:gap-3 sm:p-3">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-rose-100 p-2 text-center">
        <div><span className="block text-xs font-semibold">{gameMode === 'PVP' ? '紅方' : '你'}</span><strong className="text-lg text-red-600">{scores.p1}</strong></div>
        <div><span className="block text-xs font-semibold">{gameMode === 'PVP' ? '藍方' : '電腦'}</span><strong className="text-lg text-blue-600">{scores.p2}</strong></div>
      </div>
      <div className="rounded-lg bg-stone-100 p-2 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold"><Trophy aria-hidden="true" className="h-4 w-4" />目前狀態</div>
        <strong className="mt-1 block text-base">{statusText}</strong>
      </div>
      <GameModeSelector value={gameMode} onChange={setGameMode} />
      <button type="button" onClick={handleUndo} disabled={history.length === 0} aria-label="悔棋" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-2 py-1 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50">
        <Undo2 aria-hidden="true" className="h-5 w-5" />悔棋
      </button>
      <p className="mt-auto rounded-lg bg-rose-50 p-2 text-xs leading-relaxed">輪流在相鄰的點之間畫線；完成方格可得 1 分並繼續畫線。</p>
    </div>
  );

  return (
    <GameShell
      title="點格棋"
      subtitle="連線完成方格，取得最高分"
      onBack={onBack}
      status={<span>{difficulty === 'ADVANCED' ? '進階' : '一般'}</span>}
      actions={(
        <>
          <button type="button" onClick={() => setShowRules(true)} aria-label="查看遊戲規則" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl"><HelpCircle aria-hidden="true" className="h-5 w-5" /></button>
          <button type="button" onClick={resetGame} aria-label="重設遊戲" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl"><RefreshCw aria-hidden="true" className="h-5 w-5" /></button>
        </>
      )}
      contentClassName="bg-rose-50 text-rose-950"
    >
      <div className="relative h-full min-h-0">
        <BoardSidebarLayout board={boardView} sidebar={sidebarView} boardLabel="點格棋棋盤" sidebarLabel="點格棋狀態與操作" boardClassName="flex min-h-0 items-center justify-center" sidebarClassName="flex min-h-0 flex-col" />
        {showRules && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-3"><div role="dialog" aria-modal="true" aria-labelledby="dots-rules-title" className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"><h2 id="dots-rules-title" className="mb-4 flex items-center gap-2 text-xl font-bold"><HelpCircle aria-hidden="true" />遊戲規則</h2><ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-stone-700"><li>雙方輪流在相鄰的兩個點之間畫一條橫線或直線。</li><li>完成正方形的玩家得 1 分，並獲得額外一次畫線機會。</li><li>所有格子被佔滿後，分數多者獲勝。</li></ul><button type="button" onClick={() => setShowRules(false)} className="min-h-11 w-full rounded-lg bg-rose-600 px-3 py-2 font-bold text-white">了解，開始遊戲！</button></div></div>}
        {winner && <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-3"><div role="dialog" aria-modal="true" aria-labelledby="dots-result-title" className="max-h-full max-w-sm overflow-y-auto rounded-2xl border-4 border-rose-200 bg-white p-5 text-center shadow-2xl"><Trophy aria-hidden="true" className="mx-auto mb-2 h-14 w-14 text-yellow-500" /><h2 id="dots-result-title" className="mb-2 text-xl font-bold">{winner === 1 ? '紅方獲勝！' : winner === 2 ? '藍方獲勝！' : '平手'}</h2><p className="mb-4 text-sm text-gray-500">{scores.p1} : {scores.p2}</p><button type="button" onClick={resetGame} className="min-h-11 rounded-lg bg-rose-600 px-6 py-2 font-bold text-white">再來一局</button></div></div>}
      </div>
    </GameShell>
  );
};

export default DotsAndBoxesGame;
