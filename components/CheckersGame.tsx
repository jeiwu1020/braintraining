
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User, Crown, Undo2, Redo2, BookOpen, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  onBack: () => void;
  difficulty?: Difficulty;
}

const SIZE = 8;
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const ANIM_DURATION = 420;

interface Piece { player: 1 | 2; isKing: boolean; }
interface AnimatingPiece { piece: Piece; fromR: number; fromC: number; toR: number; toC: number; startTime: number; }
interface TrailCell { r: number; c: number; opacity: number; }
interface GameSnapshot { board: (Piece | null)[][]; turn: 1 | 2; lastLandPos: { r: number; c: number } | null; moveLabel: string; }

const cloneBoard = (b: (Piece | null)[][]): (Piece | null)[][] => b.map(row => row.map(p => p ? { ...p } : null));

const CheckersGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
    const [board, setBoard] = useState<(Piece | null)[][]>([]);
    const [turn, setTurn] = useState<1 | 2>(1);
    const [selectedPos, setSelectedPos] = useState<{ r: number; c: number } | null>(null);
    const [validMoves, setValidMoves] = useState<{ r: number; c: number; isJump: boolean }[]>([]);
    const [winner, setWinner] = useState<number | null>(null);
    const [gameMode, setGameMode] = useState<'PVE' | 'PVP'>('PVE');
    const [animating, setAnimating] = useState(false);
    const [animPiece, setAnimPiece] = useState<AnimatingPiece | null>(null);
    const [animProgress, setAnimProgress] = useState(0);
    const [trail, setTrail] = useState<TrailCell[]>([]);
    const [lastLandPos, setLastLandPos] = useState<{ r: number; c: number } | null>(null);
    const [history, setHistory] = useState<GameSnapshot[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [reviewing, setReviewing] = useState(false);
    const [reviewIndex, setReviewIndex] = useState(0);
    const [showRules, setShowRules] = useState(false);

    const animFrameRef = useRef<number | null>(null);
    const boardDivRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => { resetGame(); }, [gameMode]);

    const makeInitialBoard = (): (Piece | null)[][] => {
        const b = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if ((r + c) % 2 === 1) {
                    if (r < 3) b[r][c] = { player: 1, isKing: false };
                    if (r > 4) b[r][c] = { player: 2, isKing: false };
                }
        return b;
    };

    const resetGame = () => {
        const newBoard = makeInitialBoard();
        const init: GameSnapshot = { board: cloneBoard(newBoard), turn: 2, lastLandPos: null, moveLabel: '開始' };
        setBoard(newBoard); setTurn(2); setWinner(null); setSelectedPos(null); setValidMoves([]);
        setAnimating(false); setAnimPiece(null); setTrail([]); setLastLandPos(null);
        setHistory([init]); setHistoryIndex(0); setReviewing(false); setReviewIndex(0);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    const isValidPos = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

    const getMoves = (b: (Piece | null)[][], r: number, c: number, p: Piece) => {
        const moves: { r: number; c: number; isJump: boolean; jumpR?: number; jumpC?: number }[] = [];
        const dirs: number[][] = [];
        if (p.player === 1 || p.isKing) dirs.push([1, -1], [1, 1]);
        if (p.player === 2 || p.isKing) dirs.push([-1, -1], [-1, 1]);
        for (const [dr, dc] of dirs) {
            if (isValidPos(r + dr, c + dc) && b[r + dr][c + dc] === null)
                moves.push({ r: r + dr, c: c + dc, isJump: false });
            if (isValidPos(r + dr * 2, c + dc * 2)) {
                const midR = r + dr, midC = c + dc;
                const midP = b[midR][midC], landP = b[r + dr * 2][c + dc * 2];
                if (midP && midP.player !== p.player && landP === null)
                    moves.push({ r: r + dr * 2, c: c + dc * 2, isJump: true, jumpR: midR, jumpC: midC });
            }
        }
        return moves;
    };

    const buildTrail = (fromR: number, fromC: number, toR: number, toC: number): TrailCell[] => {
        const steps = Math.abs(toR - fromR);
        const dr = (toR - fromR) / steps, dc = (toC - fromC) / steps;
        return Array.from({ length: steps }, (_, i) => ({ r: fromR + dr * (i + 1), c: fromC + dc * (i + 1), opacity: (i + 1) / steps }));
    };

    const runAnimation = useCallback((fromR: number, fromC: number, toR: number, toC: number, piece: Piece, onComplete: () => void) => {
        const startTime = performance.now();
        const trailCells = buildTrail(fromR, fromC, toR, toC);
        const originTrail: TrailCell[] = [{ r: fromR, c: fromC, opacity: 0.6 }, ...trailCells.slice(0, -1)];
        setAnimating(true); setAnimPiece({ piece, fromR, fromC, toR, toC, startTime }); setTrail(originTrail);
        const animate = (now: number) => {
            const t = Math.min((now - startTime) / ANIM_DURATION, 1);
            setAnimProgress(1 - Math.pow(1 - t, 3));
            if (t < 1) { animFrameRef.current = requestAnimationFrame(animate); }
            else { setAnimating(false); setAnimPiece(null); setTrail([]); onComplete(); }
        };
        animFrameRef.current = requestAnimationFrame(animate);
    }, []);

    const posLabel = (r: number, c: number) => `${COL_LABELS[c]}${ROW_LABELS[r]}`;

    const applyMove = useCallback((b: (Piece | null)[][], fromR: number, fromC: number, move: any, currentTurn: 1 | 2, prevHist: GameSnapshot[], prevIdx: number) => {
        const newBoard = cloneBoard(b);
        const piece = newBoard[fromR][fromC]!;
        newBoard[move.r][move.c] = piece; newBoard[fromR][fromC] = null;
        if (move.isJump) { newBoard[move.jumpR][move.jumpC] = null; soundService.playGameSound('FALL'); }
        else soundService.playGameSound('BOUNCE');
        if ((piece.player === 1 && move.r === SIZE - 1) || (piece.player === 2 && move.r === 0)) { piece.isKing = true; soundService.playGameSound('HIGH'); }

        const newLand = { r: move.r, c: move.c };
        setBoard(newBoard); setLastLandPos(newLand);

        const nextTurn: 1 | 2 = currentTurn === 1 ? 2 : 1;
        const label = `${currentTurn === 1 ? '紅' : '白'} ${posLabel(fromR, fromC)}→${posLabel(move.r, move.c)}`;
        const p1 = newBoard.flat().filter(p => p?.player === 1).length;
        const p2 = newBoard.flat().filter(p => p?.player === 2).length;
        let newWinner: number | null = null;
        if (p1 === 0) { setWinner(2); newWinner = 2; }
        else if (p2 === 0) { setWinner(1); newWinner = 1; }
        else setTurn(nextTurn);

        const snap: GameSnapshot = { board: cloneBoard(newBoard), turn: newWinner ? currentTurn : nextTurn, lastLandPos: newLand, moveLabel: label };
        const newHist = [...prevHist.slice(0, prevIdx + 1), snap];
        setHistory(newHist); setHistoryIndex(newHist.length - 1);
    }, []);

    const executeMove = useCallback((fromR: number, fromC: number, move: any, currentTurn: 1 | 2, hist: GameSnapshot[], histIdx: number) => {
        const tmp = cloneBoard(board); tmp[fromR][fromC] = null;
        setBoard(tmp); setSelectedPos(null); setValidMoves([]);
        const piece = board[fromR][fromC]!;
        runAnimation(fromR, fromC, move.r, move.c, piece, () => applyMove(board, fromR, fromC, move, currentTurn, hist, histIdx));
    }, [board, runAnimation, applyMove]);

    const handleSquareClick = (r: number, c: number) => {
        if (winner || animating || reviewing) return;
        if (gameMode === 'PVE' && turn === 1) return;
        const clicked = board[r][c];
        if (clicked && clicked.player === turn) { setSelectedPos({ r, c }); setValidMoves(getMoves(board, r, c, clicked)); return; }
        if (!clicked && selectedPos) {
            const move = validMoves.find(m => m.r === r && m.c === c);
            if (move) executeMove(selectedPos.r, selectedPos.c, move, turn, history, historyIndex);
        }
    };

    const handleUndo = () => {
        if (animating || historyIndex <= 0) return;
        const steps = gameMode === 'PVE' && historyIndex >= 2 ? 2 : 1;
        const idx = Math.max(0, historyIndex - steps);
        const snap = history[idx];
        setBoard(cloneBoard(snap.board)); setTurn(snap.turn); setLastLandPos(snap.lastLandPos);
        setHistoryIndex(idx); setWinner(null); setSelectedPos(null); setValidMoves([]);
    };

    const handleRedo = () => {
        if (animating || historyIndex >= history.length - 1) return;
        const steps = gameMode === 'PVE' && historyIndex + 2 <= history.length - 1 ? 2 : 1;
        const idx = Math.min(history.length - 1, historyIndex + steps);
        const snap = history[idx];
        setBoard(cloneBoard(snap.board)); setTurn(snap.turn); setLastLandPos(snap.lastLandPos);
        setHistoryIndex(idx); setSelectedPos(null); setValidMoves([]);
        if (idx === history.length - 1) {
            const p1 = snap.board.flat().filter(p => p?.player === 1).length;
            const p2 = snap.board.flat().filter(p => p?.player === 2).length;
            setWinner(p1 === 0 ? 2 : p2 === 0 ? 1 : null);
        } else setWinner(null);
    };

    const startReview = () => {
        setReviewing(true); setReviewIndex(0); setWinner(null); setSelectedPos(null); setValidMoves([]);
        const snap = history[0]; setBoard(cloneBoard(snap.board)); setTurn(snap.turn); setLastLandPos(snap.lastLandPos);
    };

    const goReview = (idx: number) => {
        const i = Math.max(0, Math.min(history.length - 1, idx)); setReviewIndex(i);
        const snap = history[i]; setBoard(cloneBoard(snap.board)); setTurn(snap.turn); setLastLandPos(snap.lastLandPos);
    };

    const exitReview = () => {
        setReviewing(false);
        const snap = history[historyIndex]; setBoard(cloneBoard(snap.board)); setTurn(snap.turn); setLastLandPos(snap.lastLandPos);
        const p1 = snap.board.flat().filter(p => p?.player === 1).length;
        const p2 = snap.board.flat().filter(p => p?.player === 2).length;
        if (p1 === 0) setWinner(2); else if (p2 === 0) setWinner(1);
    };

    useEffect(() => {
        if (gameMode === 'PVE' && turn === 1 && !winner && !animating && !reviewing) {
            const timer = setTimeout(() => {
                const all: any[] = [];
                for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
                    const p = board[r][c];
                    if (p && p.player === 1) getMoves(board, r, c, p).forEach(m => all.push({ fromR: r, fromC: c, ...m }));
                }
                if (all.length === 0) { setWinner(2); return; }
                const jumps = all.filter(m => m.isJump), promotes = all.filter(m => m.r === SIZE - 1);
                let best = jumps.length > 0 ? jumps[Math.floor(Math.random() * jumps.length)]
                    : promotes.length > 0 ? promotes[Math.floor(Math.random() * promotes.length)]
                    : all[Math.floor(Math.random() * all.length)];
                executeMove(best.fromR, best.fromC, best, 1, history, historyIndex);
            }, 900);
            return () => clearTimeout(timer);
        }
    }, [turn, board, winner, gameMode, animating, reviewing]);

    const getCellPct = (ap: AnimatingPiece) => ({ dr: (ap.toR - ap.fromR) * animProgress, dc: (ap.toC - ap.fromC) * animProgress });
    const canUndo = !animating && !reviewing && historyIndex > 0;
    const canRedo = !animating && !reviewing && historyIndex < history.length - 1;

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-100 overflow-hidden">
            <div className="flex-none p-2 flex justify-between items-center bg-white shadow-sm z-10 h-12 sm:h-14">
                <button onClick={onBack} className="p-1.5 bg-gray-100 rounded-full text-slate-800"><ArrowLeft size={18} /></button>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setGameMode(prev => prev === 'PVE' ? 'PVP' : 'PVE')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-full text-xs font-bold text-slate-900 border border-slate-200">
                        {gameMode === 'PVE' ? <User size={13} /> : <Users size={13} />}{gameMode === 'PVE' ? '單人' : '雙人'}
                    </button>
                    <button onClick={handleUndo} disabled={!canUndo} title="上一步"
                        className={`p-1.5 rounded-full ${canUndo ? 'bg-gray-100 text-slate-800 hover:bg-gray-200' : 'bg-gray-50 text-slate-300 cursor-not-allowed'}`}>
                        <Undo2 size={16} /></button>
                    <button onClick={handleRedo} disabled={!canRedo} title="下一步"
                        className={`p-1.5 rounded-full ${canRedo ? 'bg-gray-100 text-slate-800 hover:bg-gray-200' : 'bg-gray-50 text-slate-300 cursor-not-allowed'}`}>
                        <Redo2 size={16} /></button>
                </div>
                <button onClick={resetGame} className="p-1.5 bg-gray-100 rounded-full text-slate-800"><RefreshCw size={18} /></button>
            </div>

            <div className="flex-none text-center py-1 bg-slate-200 font-bold text-slate-700 text-sm">
                {reviewing
                    ? `📽 復盤 ${reviewIndex}/${history.length - 1}：${history[reviewIndex]?.moveLabel ?? ''}`
                    : winner ? (winner === 1 ? '紅方獲勝' : '白方獲勝')
                    : (turn === 1 ? (gameMode === 'PVE' ? '電腦(紅)回合' : '紅方回合') : '白方(你)回合')}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-2 bg-slate-100 overflow-hidden">
                <div className="flex flex-col items-center justify-center" style={{ width: 'min(85vw, 70vh)' }}>
                    <div className="flex w-full items-center mb-0.5">
                        <div className="w-6" />
                        <div className="flex flex-1">
                            {COL_LABELS.map(c => <div key={c} className="flex-1 text-center font-bold text-slate-500 text-[10px] sm:text-xs">{c}</div>)}
                        </div>
                        <button onClick={() => setShowRules(true)} className="ml-1 p-1 rounded-full bg-slate-300 text-slate-700 hover:bg-slate-400 flex-none" title="規則說明">
                            <BookOpen size={14} /></button>
                    </div>

                    <div className="flex w-full items-stretch">
                        <div className="flex flex-col justify-between pr-1 py-4 w-6">
                            {ROW_LABELS.map(r => <div key={r} className="flex-1 flex items-center justify-center font-bold text-slate-500 text-[10px] sm:text-xs">{r}</div>)}
                        </div>

                        <div ref={boardDivRef} className="bg-[#4a3b2a] p-1.5 rounded shadow-2xl border-4 border-[#3d2b1f] flex-1 aspect-square relative">
                            <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                                {board.map((row, r) => row.map((p, c) => {
                                    const isDark = (r + c) % 2 === 1;
                                    const isSelected = selectedPos?.r === r && selectedPos?.c === c;
                                    const isValidMove = validMoves.some(m => m.r === r && m.c === c);
                                    const trailCell = trail.find(t => t.r === r && t.c === c);
                                    const isLastLand = lastLandPos?.r === r && lastLandPos?.c === c && !animating && !isSelected;
                                    return (
                                        <div key={`${r}-${c}`} onClick={() => handleSquareClick(r, c)}
                                            className={`relative flex items-center justify-center ${isDark ? 'bg-[#8B4513]' : 'bg-[#DEB887]'} ${isValidMove && !animating && !reviewing ? 'cursor-pointer' : ''}`}>
                                            {isLastLand && <div className="absolute inset-0 rounded-sm pointer-events-none" style={{ boxShadow: 'inset 0 0 0 3px rgba(250, 204, 21, 0.85)' }} />}
                                            {trailCell && <div className="absolute inset-0 rounded-sm pointer-events-none" style={{ background: `rgba(250, 204, 21, ${trailCell.opacity * 0.35})` }} />}
                                            {isValidMove && !animating && !reviewing && <div className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500/60" />}
                                            {p && (
                                                <div className={`w-[80%] h-[80%] rounded-full shadow-md border-2 sm:border-4 flex items-center justify-center aspect-square ${p.player === 1 ? 'bg-red-700 border-red-900' : 'bg-slate-200 border-slate-400'} ${isSelected ? 'scale-110 ring-2 ring-yellow-400' : ''}`}>
                                                    {p.isKing && <Crown size={14} className={p.player === 1 ? 'text-red-200' : 'text-slate-600'} />}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }))}
                            </div>

                            {animPiece && (() => {
                                const { dr, dc } = getCellPct(animPiece);
                                const cellPct = 100 / SIZE;
                                return (
                                    <div className="absolute pointer-events-none z-20"
                                        style={{ left: `calc(${(animPiece.fromC + dc + 0.5) * cellPct}% + 6px)`, top: `calc(${(animPiece.fromR + dr + 0.5) * cellPct}% + 6px)`, transform: 'translate(-50%, -50%)', width: `calc(${cellPct}% * 0.80)`, height: `calc(${cellPct}% * 0.80)` }}>
                                        <div className={`w-full h-full rounded-full shadow-xl border-2 sm:border-4 flex items-center justify-center ${animPiece.piece.player === 1 ? 'bg-red-700 border-red-900' : 'bg-slate-200 border-slate-400'}`}
                                            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
                                            {animPiece.piece.isKing && <Crown size={14} className={animPiece.piece.player === 1 ? 'text-red-200' : 'text-slate-600'} />}
                                        </div>
                                    </div>
                                );
                            })()}
                            {reviewing && <div className="absolute inset-0 bg-black/10 pointer-events-none rounded z-10" />}
                        </div>
                        <div className="w-6 ml-1" />
                    </div>

                    {reviewing && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <button onClick={() => goReview(0)} className="p-1.5 bg-slate-300 rounded-full text-slate-700 hover:bg-slate-400"><ChevronsLeft size={15} /></button>
                            <button onClick={() => goReview(reviewIndex - 1)} disabled={reviewIndex === 0} className={`p-1.5 rounded-full ${reviewIndex > 0 ? 'bg-slate-300 text-slate-700 hover:bg-slate-400' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><ChevronLeft size={15} /></button>
                            <span className="text-xs font-bold text-slate-600 min-w-[90px] text-center">{history[reviewIndex]?.moveLabel}</span>
                            <button onClick={() => goReview(reviewIndex + 1)} disabled={reviewIndex === history.length - 1} className={`p-1.5 rounded-full ${reviewIndex < history.length - 1 ? 'bg-slate-300 text-slate-700 hover:bg-slate-400' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><ChevronRight size={15} /></button>
                            <button onClick={() => goReview(history.length - 1)} className="p-1.5 bg-slate-300 rounded-full text-slate-700 hover:bg-slate-400"><ChevronsRight size={15} /></button>
                            <button onClick={exitReview} className="px-3 py-1.5 bg-slate-700 text-white rounded-full text-xs font-bold ml-0.5">結束復盤</button>
                        </div>
                    )}
                </div>
            </div>

            {winner && !reviewing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-8 rounded-2xl text-center shadow-2xl">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                        <h2 className="text-2xl font-bold mb-6">{winner === 1 ? '紅方獲勝！' : '白方獲勝！'}</h2>
                        <div className="flex gap-3 justify-center">
                            <button onClick={startReview} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2"><BookOpen size={16} /> 復盤</button>
                            <button onClick={resetGame} className="px-5 py-2 bg-slate-800 text-white rounded-lg font-bold">再來一局</button>
                        </div>
                    </div>
                </div>
            )}

            {showRules && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-bold text-slate-800">西洋跳棋規則</h2>
                            <button onClick={() => setShowRules(false)} className="p-1 rounded-full bg-gray-100 text-slate-600 hover:bg-gray-200"><X size={18} /></button>
                        </div>
                        <div className="p-4 text-sm text-slate-700 space-y-3 leading-relaxed">
                            <div><p className="font-bold text-slate-900 mb-1">🎯 目標</p><p>吃掉對方所有棋子即獲勝。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">♟ 棋盤與初始</p><p>8×8 棋盤，棋子只走深色格。紅方（電腦）在上方，白方（玩家）在下方，各 12 枚，白方先手。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">🚶 移動</p><p>普通棋子只能斜走一格朝前。選中棋子後，<span className="text-green-600 font-bold">綠點</span>代表所有可移動位置（包含吃子落點）。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">⚔️ 吃子（跳躍）</p><p>跳過緊鄰的對方棋子並落在其後，即可吃掉對方棋子。本版本吃子非強制，可選擇普通移動。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">👑 升王</p><p>棋子走到對方底線後升格為王（顯示皇冠），王可往四個斜方向自由移動。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">↩ 悔棋 / ↪ 重做</p><p>單人模式下悔棋會同步撤銷 AI 的回應；雙人模式每次退一步。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">📽 復盤</p><p>遊戲結束後按「復盤」，可用方向按鈕逐步檢視每一手棋的移動過程。</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckersGame;
