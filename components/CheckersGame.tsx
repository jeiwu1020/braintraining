
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users, User, Crown, Undo2, Redo2, BookOpen, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface Props { onBack: () => void; difficulty?: Difficulty; }

const SIZE = 8;
const COL_LABELS = ['A','B','C','D','E','F','G','H'];
const ROW_LABELS = ['1','2','3','4','5','6','7','8'];
const ANIM_DURATION = 420;

interface Piece { player: 1|2; isKing: boolean; }
interface AnimatingPiece { piece: Piece; fromR:number; fromC:number; toR:number; toC:number; startTime:number; }
interface TrailCell { r:number; c:number; opacity:number; }
interface GameSnapshot { board:(Piece|null)[][]; turn:1|2; lastLandPos:{r:number;c:number}|null; moveLabel:string; }

const cloneBoard = (b:(Piece|null)[][]): (Piece|null)[][] => b.map(row=>row.map(p=>p?{...p}:null));

const CheckersGame: React.FC<Props> = ({ onBack, difficulty='NORMAL' }) => {
    const [board, setBoard] = useState<(Piece|null)[][]>([]);
    const [turn, setTurn] = useState<1|2>(1);
    const [selectedPos, setSelectedPos] = useState<{r:number;c:number}|null>(null);
    const [validMoves, setValidMoves] = useState<{r:number;c:number;isJump:boolean}[]>([]);
    const [winner, setWinner] = useState<number|null>(null);
    const [gameMode, setGameMode] = useState<'PVE'|'PVP'>('PVE');
    const [animating, setAnimating] = useState(false);
    const [animPiece, setAnimPiece] = useState<AnimatingPiece|null>(null);
    const [animProgress, setAnimProgress] = useState(0);
    const [trail, setTrail] = useState<TrailCell[]>([]);
    const [lastLandPos, setLastLandPos] = useState<{r:number;c:number}|null>(null);
    const [history, setHistory] = useState<GameSnapshot[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [reviewing, setReviewing] = useState(false);
    const [reviewIndex, setReviewIndex] = useState(0);
    const [showRules, setShowRules] = useState(false);

    const animFrameRef = useRef<number|null>(null);
    const boardDivRef = useRef<HTMLDivElement|null>(null);
    const moveListRef = useRef<HTMLDivElement|null>(null);

    useEffect(() => { resetGame(); }, [gameMode]);

    // Auto-scroll move list to current step
    useEffect(() => {
        if (moveListRef.current) {
            const active = moveListRef.current.querySelector('[data-active="true"]');
            if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [historyIndex, reviewIndex, reviewing]);

    const makeInitialBoard = (): (Piece|null)[][] => {
        const b = Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null));
        for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if ((r+c)%2===1) {
            if (r<3) b[r][c]={player:1,isKing:false};
            if (r>4) b[r][c]={player:2,isKing:false};
        }
        return b;
    };

    const resetGame = () => {
        const nb = makeInitialBoard();
        const init:GameSnapshot = {board:cloneBoard(nb),turn:2,lastLandPos:null,moveLabel:'開始'};
        setBoard(nb); setTurn(2); setWinner(null); setSelectedPos(null); setValidMoves([]);
        setAnimating(false); setAnimPiece(null); setTrail([]); setLastLandPos(null);
        setHistory([init]); setHistoryIndex(0); setReviewing(false); setReviewIndex(0);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    const isValidPos = (r:number,c:number) => r>=0&&r<SIZE&&c>=0&&c<SIZE;

    const getMoves = (b:(Piece|null)[][],r:number,c:number,p:Piece) => {
        const moves:{r:number;c:number;isJump:boolean;jumpR?:number;jumpC?:number}[]=[];
        const dirs:number[][]=[];
        if (p.player===1||p.isKing) dirs.push([1,-1],[1,1]);
        if (p.player===2||p.isKing) dirs.push([-1,-1],[-1,1]);
        for (const [dr,dc] of dirs) {
            if (isValidPos(r+dr,c+dc)&&b[r+dr][c+dc]===null) moves.push({r:r+dr,c:c+dc,isJump:false});
            if (isValidPos(r+dr*2,c+dc*2)) {
                const mR=r+dr,mC=c+dc,mP=b[mR][mC],lP=b[r+dr*2][c+dc*2];
                if (mP&&mP.player!==p.player&&lP===null) moves.push({r:r+dr*2,c:c+dc*2,isJump:true,jumpR:mR,jumpC:mC});
            }
        }
        return moves;
    };

    const buildTrail = (fR:number,fC:number,tR:number,tC:number):TrailCell[] => {
        const s=Math.abs(tR-fR),dr=(tR-fR)/s,dc=(tC-fC)/s;
        return Array.from({length:s},(_,i)=>({r:fR+dr*(i+1),c:fC+dc*(i+1),opacity:(i+1)/s}));
    };

    const runAnimation = useCallback((fR:number,fC:number,tR:number,tC:number,piece:Piece,onComplete:()=>void) => {
        const st=performance.now();
        const tc=buildTrail(fR,fC,tR,tC);
        setAnimating(true);
        setAnimPiece({piece,fromR:fR,fromC:fC,toR:tR,toC:tC,startTime:st});
        setTrail([{r:fR,c:fC,opacity:0.6},...tc.slice(0,-1)]);
        const animate=(now:number)=>{
            const t=Math.min((now-st)/ANIM_DURATION,1);
            setAnimProgress(1-Math.pow(1-t,3));
            if (t<1) animFrameRef.current=requestAnimationFrame(animate);
            else { setAnimating(false); setAnimPiece(null); setTrail([]); onComplete(); }
        };
        animFrameRef.current=requestAnimationFrame(animate);
    },[]);

    const posLabel=(r:number,c:number)=>`${COL_LABELS[c]}${ROW_LABELS[r]}`;

    const applyMove = useCallback((b:(Piece|null)[][],fR:number,fC:number,move:any,cur:1|2,ph:GameSnapshot[],pi:number)=>{
        const nb=cloneBoard(b); const piece=nb[fR][fC]!;
        nb[move.r][move.c]=piece; nb[fR][fC]=null;
        if (move.isJump){nb[move.jumpR][move.jumpC]=null;soundService.playGameSound('FALL');}
        else soundService.playGameSound('BOUNCE');
        if ((piece.player===1&&move.r===SIZE-1)||(piece.player===2&&move.r===0)){piece.isKing=true;soundService.playGameSound('HIGH');}
        const nl={r:move.r,c:move.c};
        setBoard(nb); setLastLandPos(nl);
        const nt:1|2=cur===1?2:1;
        const label=`${cur===1?'紅':'白'} ${posLabel(fR,fC)}→${posLabel(move.r,move.c)}`;
        const p1=nb.flat().filter(p=>p?.player===1).length, p2=nb.flat().filter(p=>p?.player===2).length;
        let nw:number|null=null;
        if (p1===0){setWinner(2);nw=2;} else if (p2===0){setWinner(1);nw=1;} else setTurn(nt);
        const snap:GameSnapshot={board:cloneBoard(nb),turn:nw?cur:nt,lastLandPos:nl,moveLabel:label};
        const nh=[...ph.slice(0,pi+1),snap];
        setHistory(nh); setHistoryIndex(nh.length-1);
    },[]);

    const executeMove = useCallback((fR:number,fC:number,move:any,cur:1|2,hist:GameSnapshot[],hi:number)=>{
        const tmp=cloneBoard(board); tmp[fR][fC]=null;
        setBoard(tmp); setSelectedPos(null); setValidMoves([]);
        const piece=board[fR][fC]!;
        runAnimation(fR,fC,move.r,move.c,piece,()=>applyMove(board,fR,fC,move,cur,hist,hi));
    },[board,runAnimation,applyMove]);

    const handleSquareClick=(r:number,c:number)=>{
        if (winner||animating||reviewing) return;
        if (gameMode==='PVE'&&turn===1) return;
        const cl=board[r][c];
        if (cl&&cl.player===turn){setSelectedPos({r,c});setValidMoves(getMoves(board,r,c,cl));return;}
        if (!cl&&selectedPos){const mv=validMoves.find(m=>m.r===r&&m.c===c);if(mv) executeMove(selectedPos.r,selectedPos.c,mv,turn,history,historyIndex);}
    };

    const handleUndo=()=>{
        if (animating||historyIndex<=0) return;
        const steps=gameMode==='PVE'&&historyIndex>=2?2:1;
        const idx=Math.max(0,historyIndex-steps); const snap=history[idx];
        setBoard(cloneBoard(snap.board));setTurn(snap.turn);setLastLandPos(snap.lastLandPos);
        setHistoryIndex(idx);setWinner(null);setSelectedPos(null);setValidMoves([]);
    };

    const handleRedo=()=>{
        if (animating||historyIndex>=history.length-1) return;
        const steps=gameMode==='PVE'&&historyIndex+2<=history.length-1?2:1;
        const idx=Math.min(history.length-1,historyIndex+steps); const snap=history[idx];
        setBoard(cloneBoard(snap.board));setTurn(snap.turn);setLastLandPos(snap.lastLandPos);
        setHistoryIndex(idx);setSelectedPos(null);setValidMoves([]);
        if (idx===history.length-1){
            const p1=snap.board.flat().filter(p=>p?.player===1).length,p2=snap.board.flat().filter(p=>p?.player===2).length;
            setWinner(p1===0?2:p2===0?1:null);
        } else setWinner(null);
    };

    const startReview=()=>{
        setReviewing(true);setReviewIndex(0);setWinner(null);setSelectedPos(null);setValidMoves([]);
        const snap=history[0];setBoard(cloneBoard(snap.board));setTurn(snap.turn);setLastLandPos(snap.lastLandPos);
    };

    const goReview=(idx:number)=>{
        const i=Math.max(0,Math.min(history.length-1,idx));setReviewIndex(i);
        const snap=history[i];setBoard(cloneBoard(snap.board));setTurn(snap.turn);setLastLandPos(snap.lastLandPos);
    };

    const exitReview=()=>{
        setReviewing(false);
        const snap=history[historyIndex];setBoard(cloneBoard(snap.board));setTurn(snap.turn);setLastLandPos(snap.lastLandPos);
        const p1=snap.board.flat().filter(p=>p?.player===1).length,p2=snap.board.flat().filter(p=>p?.player===2).length;
        if (p1===0) setWinner(2); else if (p2===0) setWinner(1);
    };

    useEffect(()=>{
        if (gameMode==='PVE'&&turn===1&&!winner&&!animating&&!reviewing){
            const t=setTimeout(()=>{
                const all:any[]=[];
                for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
                    const p=board[r][c]; if(p&&p.player===1) getMoves(board,r,c,p).forEach(m=>all.push({fromR:r,fromC:c,...m}));
                }
                if(all.length===0){setWinner(2);return;}
                const jumps=all.filter(m=>m.isJump),prom=all.filter(m=>m.r===SIZE-1);
                const best=jumps.length>0?jumps[Math.floor(Math.random()*jumps.length)]:prom.length>0?prom[Math.floor(Math.random()*prom.length)]:all[Math.floor(Math.random()*all.length)];
                executeMove(best.fromR,best.fromC,best,1,history,historyIndex);
            },900);
            return ()=>clearTimeout(t);
        }
    },[turn,board,winner,gameMode,animating,reviewing]);

    const getCellPct=(ap:AnimatingPiece)=>({dr:(ap.toR-ap.fromR)*animProgress,dc:(ap.toC-ap.fromC)*animProgress});
    const canUndo=!animating&&!reviewing&&historyIndex>0;
    const canRedo=!animating&&!reviewing&&historyIndex<history.length-1;
    const curIdx=reviewing?reviewIndex:historyIndex;

    // Shared board renderer
    const renderBoard=()=>(
        <div ref={boardDivRef} className="bg-[#4a3b2a] p-1.5 rounded shadow-2xl border-4 border-[#3d2b1f] w-full aspect-square relative">
            <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                {board.map((row,r)=>row.map((p,c)=>{
                    const isDark=(r+c)%2===1;
                    const isSel=selectedPos?.r===r&&selectedPos?.c===c;
                    const isVM=validMoves.some(m=>m.r===r&&m.c===c);
                    const tc=trail.find(t=>t.r===r&&t.c===c);
                    const isLL=lastLandPos?.r===r&&lastLandPos?.c===c&&!animating&&!isSel;
                    return (
                        <div key={`${r}-${c}`} onClick={()=>handleSquareClick(r,c)}
                            className={`relative flex items-center justify-center ${isDark?'bg-[#8B4513]':'bg-[#DEB887]'} ${isVM&&!animating&&!reviewing?'cursor-pointer':''}`}>
                            {isLL&&<div className="absolute inset-0 rounded-sm pointer-events-none" style={{boxShadow:'inset 0 0 0 3px rgba(250,204,21,0.85)'}}/>}
                            {tc&&<div className="absolute inset-0 rounded-sm pointer-events-none" style={{background:`rgba(250,204,21,${tc.opacity*0.35})`}}/>}
                            {isVM&&!animating&&!reviewing&&<div className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500/60"/>}
                            {p&&(
                                <div className={`w-[80%] h-[80%] rounded-full shadow-md border-2 sm:border-4 flex items-center justify-center aspect-square ${p.player===1?'bg-red-700 border-red-900':'bg-slate-200 border-slate-400'} ${isSel?'scale-110 ring-2 ring-yellow-400':''}`}>
                                    {p.isKing&&<Crown size={12} className={p.player===1?'text-red-200':'text-slate-600'}/>}
                                </div>
                            )}
                        </div>
                    );
                }))}
            </div>
            {animPiece&&(()=>{
                const {dr,dc}=getCellPct(animPiece); const cp=100/SIZE;
                return (
                    <div className="absolute pointer-events-none z-20"
                        style={{left:`calc(${(animPiece.fromC+dc+0.5)*cp}% + 6px)`,top:`calc(${(animPiece.fromR+dr+0.5)*cp}% + 6px)`,transform:'translate(-50%,-50%)',width:`calc(${cp}% * 0.80)`,height:`calc(${cp}% * 0.80)`}}>
                        <div className={`w-full h-full rounded-full shadow-xl border-2 sm:border-4 flex items-center justify-center ${animPiece.piece.player===1?'bg-red-700 border-red-900':'bg-slate-200 border-slate-400'}`}
                            style={{filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'}}>
                            {animPiece.piece.isKing&&<Crown size={12} className={animPiece.piece.player===1?'text-red-200':'text-slate-600'}/>}
                        </div>
                    </div>
                );
            })()}
            {reviewing&&<div className="absolute inset-0 bg-black/10 pointer-events-none rounded z-10"/>}
        </div>
    );

    // Right-side panel (used in landscape)
    const renderSidePanel=()=>(
        <div className="flex flex-col gap-2 h-full">
            {/* Status */}
            <div className="bg-slate-200 rounded-lg px-3 py-2 text-center font-bold text-slate-700 text-xs leading-tight">
                {reviewing
                    ?<>📽 復盤<br/><span className="text-slate-500 font-normal">{history[reviewIndex]?.moveLabel}</span></>
                    :winner?(winner===1?'🔴 紅方獲勝':'⚪ 白方獲勝')
                    :(turn===1?(gameMode==='PVE'?'🤖 電腦(紅)':'🔴 紅方'):('⚪ 白方(你)'))}
            </div>

            {/* Review controls */}
            {reviewing&&(
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-center gap-1">
                        <button onClick={()=>goReview(0)} className="p-1.5 bg-slate-300 rounded-full text-slate-700 hover:bg-slate-400"><ChevronsLeft size={14}/></button>
                        <button onClick={()=>goReview(reviewIndex-1)} disabled={reviewIndex===0} className={`p-1.5 rounded-full ${reviewIndex>0?'bg-slate-300 text-slate-700 hover:bg-slate-400':'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><ChevronLeft size={14}/></button>
                        <span className="text-[10px] font-bold text-slate-500 min-w-[40px] text-center">{reviewIndex}/{history.length-1}</span>
                        <button onClick={()=>goReview(reviewIndex+1)} disabled={reviewIndex===history.length-1} className={`p-1.5 rounded-full ${reviewIndex<history.length-1?'bg-slate-300 text-slate-700 hover:bg-slate-400':'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><ChevronRight size={14}/></button>
                        <button onClick={()=>goReview(history.length-1)} className="p-1.5 bg-slate-300 rounded-full text-slate-700 hover:bg-slate-400"><ChevronsRight size={14}/></button>
                    </div>
                    <button onClick={exitReview} className="w-full py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold">結束復盤</button>
                </div>
            )}

            {/* Move list */}
            <div ref={moveListRef} className="flex-1 overflow-y-auto rounded-lg bg-white border border-slate-200 min-h-0">
                <div className="p-1 space-y-0.5">
                    {history.map((snap,i)=>(
                        <div key={i} data-active={i===curIdx}
                            onClick={()=>{ if(reviewing) goReview(i); }}
                            className={`text-[10px] px-2 py-1 rounded font-mono cursor-pointer transition-colors
                                ${i===curIdx?'bg-yellow-200 text-slate-900 font-bold':'text-slate-600 hover:bg-slate-50'}
                                ${i===0?'text-slate-400':''}`}>
                            {i===0?'— 開始 —':`${i}. ${snap.moveLabel}`}
                        </div>
                    ))}
                </div>
            </div>

            {/* Action buttons */}
            {!reviewing&&(
                <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1.5">
                        <button onClick={handleUndo} disabled={!canUndo} title="上一步"
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold ${canUndo?'bg-gray-200 text-slate-800 hover:bg-gray-300':'bg-gray-100 text-slate-300 cursor-not-allowed'}`}>
                            <Undo2 size={13}/> 悔棋</button>
                        <button onClick={handleRedo} disabled={!canRedo} title="下一步"
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold ${canRedo?'bg-gray-200 text-slate-800 hover:bg-gray-300':'bg-gray-100 text-slate-300 cursor-not-allowed'}`}>
                            <Redo2 size={13}/> 重做</button>
                    </div>
                    <button onClick={()=>setShowRules(true)} className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300">
                        <BookOpen size={13}/> 規則說明</button>
                </div>
            )}
        </div>
    );

    // Bottom panel for portrait reviewing
    const renderBottomReview=()=>(
        <div className="flex-none px-2 pb-1.5 pt-1 flex items-center gap-1.5 bg-slate-100">
            <button onClick={()=>goReview(0)} className="p-1.5 bg-slate-300 rounded-full text-slate-700"><ChevronsLeft size={14}/></button>
            <button onClick={()=>goReview(reviewIndex-1)} disabled={reviewIndex===0} className={`p-1.5 rounded-full ${reviewIndex>0?'bg-slate-300 text-slate-700':'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><ChevronLeft size={14}/></button>
            <span className="text-xs font-bold text-slate-600 flex-1 text-center truncate">{history[reviewIndex]?.moveLabel}</span>
            <button onClick={()=>goReview(reviewIndex+1)} disabled={reviewIndex===history.length-1} className={`p-1.5 rounded-full ${reviewIndex<history.length-1?'bg-slate-300 text-slate-700':'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><ChevronRight size={14}/></button>
            <button onClick={()=>goReview(history.length-1)} className="p-1.5 bg-slate-300 rounded-full text-slate-700"><ChevronsRight size={14}/></button>
            <button onClick={exitReview} className="px-2.5 py-1.5 bg-slate-700 text-white rounded-full text-xs font-bold">結束</button>
        </div>
    );

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex-none p-2 flex justify-between items-center bg-white shadow-sm z-10 h-11 sm:h-12">
                <button onClick={onBack} className="p-1.5 bg-gray-100 rounded-full text-slate-800"><ArrowLeft size={17}/></button>
                <div className="flex items-center gap-1.5">
                    <button onClick={()=>setGameMode(p=>p==='PVE'?'PVP':'PVE')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-full text-xs font-bold text-slate-900 border border-slate-200">
                        {gameMode==='PVE'?<User size={12}/>:<Users size={12}/>}{gameMode==='PVE'?'單人':'雙人'}
                    </button>
                    {/* Portrait: undo/redo in header; landscape: in side panel */}
                    <div className="flex landscape:hidden items-center gap-1">
                        <button onClick={handleUndo} disabled={!canUndo}
                            className={`p-1.5 rounded-full ${canUndo?'bg-gray-100 text-slate-800':'bg-gray-50 text-slate-300 cursor-not-allowed'}`}><Undo2 size={15}/></button>
                        <button onClick={handleRedo} disabled={!canRedo}
                            className={`p-1.5 rounded-full ${canRedo?'bg-gray-100 text-slate-800':'bg-gray-50 text-slate-300 cursor-not-allowed'}`}><Redo2 size={15}/></button>
                        <button onClick={()=>setShowRules(true)} className="p-1.5 bg-gray-100 rounded-full text-slate-700"><BookOpen size={15}/></button>
                    </div>
                </div>
                <button onClick={resetGame} className="p-1.5 bg-gray-100 rounded-full text-slate-800"><RefreshCw size={17}/></button>
            </div>

            {/* Portrait status bar */}
            <div className="landscape:hidden flex-none text-center py-1 bg-slate-200 font-bold text-slate-700 text-xs">
                {reviewing
                    ?`📽 復盤 ${reviewIndex}/${history.length-1}：${history[reviewIndex]?.moveLabel??''}`
                    :winner?(winner===1?'紅方獲勝':'白方獲勝')
                    :(turn===1?(gameMode==='PVE'?'電腦(紅)回合':'紅方回合'):'白方(你)回合')}
            </div>

            {/* ===== PORTRAIT layout ===== */}
            <div className="landscape:hidden flex-1 flex flex-col items-center justify-center p-2 overflow-hidden">
                <div className="flex flex-col items-center justify-center w-full" style={{width:'min(90vw,72vh)'}}>
                    {/* Col labels */}
                    <div className="flex w-full pl-5 mb-0.5">
                        {COL_LABELS.map(c=><div key={c} className="flex-1 text-center font-bold text-slate-500 text-[9px]">{c}</div>)}
                    </div>
                    <div className="flex w-full items-stretch">
                        {/* Row labels */}
                        <div className="flex flex-col justify-between pr-1 w-5">
                            {ROW_LABELS.map(r=><div key={r} className="flex-1 flex items-center justify-center font-bold text-slate-500 text-[9px]">{r}</div>)}
                        </div>
                        {renderBoard()}
                    </div>
                </div>
            </div>
            {/* Portrait review bar */}
            {reviewing&&<div className="landscape:hidden">{renderBottomReview()}</div>}

            {/* ===== LANDSCAPE layout ===== */}
            <div className="hidden landscape:flex flex-1 overflow-hidden">
                {/* Board column */}
                <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full" style={{height:'min(100%,calc(100vw - 180px))'}}>
                        {/* Col labels */}
                        <div className="flex w-full pl-5 mb-0.5 flex-none">
                            {COL_LABELS.map(c=><div key={c} className="flex-1 text-center font-bold text-slate-500 text-[9px]">{c}</div>)}
                        </div>
                        <div className="flex flex-1 min-h-0 w-full items-stretch">
                            {/* Row labels */}
                            <div className="flex flex-col justify-between pr-1 w-5 flex-none">
                                {ROW_LABELS.map(r=><div key={r} className="flex-1 flex items-center justify-center font-bold text-slate-500 text-[9px]">{r}</div>)}
                            </div>
                            {/* Board — square constrained by height */}
                            <div className="aspect-square" style={{height:'100%',maxHeight:'100%'}}>
                                {renderBoard()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side panel */}
                <div className="flex-none w-40 bg-slate-100 border-l border-slate-200 p-2 overflow-hidden">
                    {renderSidePanel()}
                </div>
            </div>

            {/* Winner overlay */}
            {winner&&!reviewing&&(
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-2xl text-center shadow-2xl">
                        <Trophy className="w-14 h-14 mx-auto mb-3 text-yellow-500"/>
                        <h2 className="text-xl font-bold mb-5">{winner===1?'紅方獲勝！':'白方獲勝！'}</h2>
                        <div className="flex gap-3 justify-center">
                            <button onClick={startReview} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 text-sm"><BookOpen size={15}/> 復盤</button>
                            <button onClick={resetGame} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm">再來一局</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules modal */}
            {showRules&&(
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-base font-bold text-slate-800">西洋跳棋規則</h2>
                            <button onClick={()=>setShowRules(false)} className="p-1 rounded-full bg-gray-100 text-slate-600"><X size={17}/></button>
                        </div>
                        <div className="p-4 text-sm text-slate-700 space-y-3 leading-relaxed">
                            <div><p className="font-bold text-slate-900 mb-1">🎯 目標</p><p>吃掉對方所有棋子即獲勝。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">♟ 棋盤與初始</p><p>8×8 棋盤，棋子只走深色格。紅方（電腦）在上方，白方（玩家）在下方，各 12 枚，白方先手。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">🚶 移動</p><p>普通棋子只能斜走一格朝前。<span className="text-green-600 font-bold">綠點</span>代表所有可移動位置（含吃子落點）。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">⚔️ 吃子</p><p>跳過緊鄰的對方棋子並落在其後即吃掉，本版本吃子非強制。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">👑 升王</p><p>棋子走到對方底線升格為王，王可往四個斜方向移動。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">↩ 悔棋</p><p>單人模式同步撤銷 AI 的回應；雙人模式每次退一步。</p></div>
                            <div><p className="font-bold text-slate-900 mb-1">📽 復盤</p><p>遊戲結束後可逐步檢視所有棋步。</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckersGame;
