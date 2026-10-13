import { readFacilitatorKnowledge, saveFacilitatorKnowledge } from '../utils/facilitatorKnowledge';
import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Difficulty } from '../types';
import FacilitatedGameFrame from './game-ui/FacilitatedGameFrame';
import { useConfirmAction } from './game-ui/useConfirmAction';
import GameShell from './game-ui/GameShell';
import GridFocusLayout from './game-ui/GridFocusLayout';
import { QWIRKLE_PUZZLES } from '../data/qwirklePuzzles';
import { QWIRKLE_COLOR_NAMES, qwirkleTileName, type QwirkleColor, type QwirkleShape, type QwirkleTileData, type QwirkleTier } from '../utils/qwirkleRules';
import { availableQwirkleTiles, clearQwirkleDraft, confirmQwirkleMove, createQwirkleSession, requestQwirkleHint, resetQwirkleRound, selectQwirkleTarget, selectQwirkleTile, startQwirklePuzzle, undoQwirkleDecision } from '../utils/qwirkleSession';
export type { QwirkleColor, QwirkleShape, QwirkleTileData } from '../utils/qwirkleRules';

// Kept as a lightweight layout export for existing consumers; the activity below
// uses the shared facilitator frame and no time-based score.
interface QwirkleRoundLayoutProps {
  difficulty: Difficulty; currentIndex: number; totalQuestions: number; score: number; elapsedTime: number;
  board: ReactNode; options: ReactNode; feedback?: ReactNode; onBack: () => void;
  onToggleTeam: () => void; onShowRules: () => void; onRestart: () => void;
  teamMode?: 'SOLO' | 'TEAM'; teamAScore?: number; teamBScore?: number; currentTeam?: 'A' | 'B';
}
export const QwirkleRoundLayout: React.FC<QwirkleRoundLayoutProps> = ({ currentIndex, totalQuestions, board, options, feedback, onBack }) => (
  <GameShell title="繽紛形色棋" onBack={onBack} status={<span>第 {currentIndex + 1}/{totalQuestions} 題</span>}>
    <GridFocusLayout playfieldLabel="形色棋盤面" supportLabel="形色棋作答區" playfield={board} support={options} feedback={feedback} />
  </GameShell>
);
const colors: Record<QwirkleColor, string> = { red: '#dc2626', orange: '#ea580c', yellow: '#eab308', green: '#059669', blue: '#2563eb', purple: '#9333ea' };
const shortShapes: Record<QwirkleShape, string> = { circle: '圓', square: '方', diamond: '菱', star: '星', clover: '葉', cross: '十字' };
export const QwirkleShapeSVG: React.FC<{ shape: QwirkleShape; color: QwirkleColor; sizeClass?: string }> = ({ shape, color, sizeClass = 'h-7 w-7' }) => (
  <svg aria-hidden="true" viewBox="0 0 100 100" className={sizeClass} fill={colors[color]} stroke="#172554" strokeWidth="2">
    {shape === 'circle' ? <circle cx="50" cy="50" r="36" /> : shape === 'square' ? <rect x="16" y="16" width="68" height="68" rx="3" /> : shape === 'diamond' ? <polygon points="50,7 93,50 50,93 7,50" /> : shape === 'star' ? <path d="M50 5 L62 36 L95 38 L69 59 L78 93 L50 73 L22 93 L31 59 L5 38 L38 36 Z" /> : shape === 'clover' ? <path d="M50 29 C25 -8 -8 25 29 50 C-8 75 25 108 50 71 C75 108 108 75 71 50 C108 25 75 -8 50 29 Z" /> : <path d="M36 8 H64 V36 H92 V64 H64 V92 H36 V64 H8 V36 H36 Z" />}
  </svg>
);
const actionClass = 'min-h-11 rounded-xl border-2 px-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 disabled:opacity-40';
export const QwirkleTile: React.FC<{ tile: QwirkleTileData; selected?: boolean; highlight?: boolean; onClick?: () => void; disabled?: boolean; size?: 'sm' | 'md' | 'lg' }> = ({ tile, selected, highlight, onClick, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} aria-label={`棋${tile.id === 'next' ? '下一顆' : tile.id} ${qwirkleTileName(tile)}`} aria-pressed={selected} data-qwirkle-option={tile.id}
    className={`${actionClass} flex w-full flex-col items-center justify-center gap-0.5 px-0.5 py-1 ${selected || highlight ? 'border-sky-700 bg-sky-100' : 'border-slate-300 bg-white'}`}>
    <span className="flex items-center gap-1 text-sm"><span className="font-black">{tile.id === 'next' ? '下一顆' : tile.id}</span><QwirkleShapeSVG shape={tile.shape} color={tile.color} sizeClass="h-6 w-6" /></span>
    <span className="whitespace-nowrap text-[13px] leading-tight">{qwirkleTileName(tile)}</span>
  </button>
);
const tiers: Array<{ id: QwirkleTier; label: string; detail: string }> = [
  { id: 'BEGINNER', label: '入門', detail: '四選一・辨認一條規則' },
  { id: 'STANDARD', label: '標準', detail: '棋子＋落點・橫直兩條件' },
  { id: 'CHALLENGE', label: '挑戰', detail: '公開下一顆・規劃兩步' },
];
interface QwirkleGameProps { onBack: () => void; difficulty?: Difficulty; isAdvanced?: boolean }
const QwirkleGame: React.FC<QwirkleGameProps> = ({ onBack, difficulty = 'NORMAL', isAdvanced = false }) => {
  const [tier, setTier] = useState<QwirkleTier>(isAdvanced || difficulty === 'ADVANCED' ? 'STANDARD' : 'BEGINNER');
  const [index, setIndex] = useState(0);
  const puzzles = useMemo(() => QWIRKLE_PUZZLES.filter(puzzle => puzzle.tier === tier), [tier]);
  const puzzle = puzzles[index];
  const [session, setSession] = useState(() => ({ ...createQwirkleSession(puzzle), revealed: readFacilitatorKnowledge('qwirkle-v1') }));
  useEffect(() => saveFacilitatorKnowledge('qwirkle-v1', session.revealed), [session.revealed]);
  const tierInfo = tiers.find(item => item.id === tier)!;
  const hasProgress = Boolean(session.selection.tileId || (tier !== 'BEGINNER' && session.selection.targetId) || session.moves.length || session.hintLevel || Object.keys(session.credits).length || session.revealed.length);
  const { requestAction, confirmationDialog } = useConfirmAction(hasProgress);
  const hand = session.finished && puzzle.tier !== 'CHALLENGE' ? puzzle.hand : availableQwirkleTiles(session, puzzle);
  const selectedTile = hand.find(tile => tile.id === session.selection.tileId);
  const selectedTarget = puzzle.targets.find(target => target.id === session.selection.targetId);
  const allPositions = [...puzzle.board, ...puzzle.targets];
  const minX = Math.min(...allPositions.map(p => p.x)); const maxX = Math.max(...allPositions.map(p => p.x));
  const minY = Math.min(...allPositions.map(p => p.y)); const maxY = Math.max(...allPositions.map(p => p.y));
  const columns = maxX - minX + 1;
  const chessScore = session.moves.reduce((sum, move) => sum + move.score, 0);
  const canConfirm = !session.finished && Boolean(selectedTile && selectedTarget);
  const changeTier = (nextTier: QwirkleTier) => {
    if (nextTier === tier) return;
    requestAction(() => {
      const nextPuzzle = QWIRKLE_PUZZLES.find(item => item.tier === nextTier)!;
      setTier(nextTier); setIndex(0); setSession(state => startQwirklePuzzle(state, nextPuzzle));
    }, '切換階段會放棄本題未完成的棋步；保留活動分與看過的提示。要切換嗎？');
  };
  const nextPuzzle = () => {
    const nextIndex = (index + 1) % puzzles.length;
    const apply = () => { setIndex(nextIndex); setSession(state => startQwirklePuzzle(state, puzzles[nextIndex])); };
    if (session.finished) apply(); else requestAction(apply, '下一題會放棄本題未完成的棋步，保留活動分與提示紀錄。要換題嗎？');
  };
  return (
    <div data-qwirkle-game="true">
      <FacilitatedGameFrame title="繽紛形色棋" subtitle={`${tierInfo.label} ${index + 1}／${puzzles.length}・${puzzle.title}`} onBack={onBack}
        mode={session.mode} onModeChange={mode => setSession(state => resetQwirkleRound(state, puzzle, mode))}
        currentTeam={session.team} scores={session.scores} recentAction={session.recent}
        onUndo={() => setSession(state => undoQwirkleDecision(state))} canUndo={session.history.length > 0} hasProgress={hasProgress}
        onReset={() => setSession(state => resetQwirkleRound(state, puzzle))} onHint={() => setSession(state => requestQwirkleHint(state, puzzle))}
        boardLabel="形色棋盤面與手牌"
        rules={[
          '一條相連直線可以同色不同形，或同形不同色；不能重複完全相同的棋子，最多六顆。新棋必須相鄰連接盤面，橫線與直線都要合法。',
          '這是公開資訊小題，只能使用標示 P、Q、R、S 的落點；沒有隱藏對手或自由發牌。棋子用 1–4，落點用字母，A／B 只作隊名。',
          '先選棋子與落點，重述後按「確認落棋」。選取、清除、提示不落盤、不換組；違規或未達標準題雙線目標的選取不落盤。',
          '入門四選一延長單線；標準必須同時形成橫線與直線；挑戰先選一顆，再放公開下一顆，比較兩步總棋分，接受所有最佳方案。',
          '棋分：每條受到影響且至少兩顆的橫／直線各算顆數；六顆另加六分。交叉點在兩條線各算一次。棋分用來比較策略。',
          '活動分：首次獨立完成本題目標得一分，沒有時間限制或扣分。合作顯示共同活動分；分組由同一組完成整題（挑戰兩步都同一組），完成整題才換組；第一步堵死時原組保留，復原再討論。',
          '提示依序提醒規則、比較方向、完整示範。完整示範仍要手動確認；該題之後只作練習，不再加活動分。看過的提示和答案紀錄不會被清除或復原。',
          '復原會還原盤面、分數、組別、完成狀態與預選。重開只取消本題活動分，保留其他題；換題或階段保留分數。同一題不重複加分；切換合作／分組重設活動分，仍保留揭示紀錄。',
        ]}
        settings={<div><label className="block text-sm font-bold" htmlFor="qwirkle-tier">推理階段</label><select id="qwirkle-tier" aria-label="形色棋推理階段" value={tier} onChange={event => changeTier(event.target.value as QwirkleTier)} className="mt-1 min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-2 text-sm font-bold">{tiers.map(item => <option key={item.id} value={item.id}>{item.label}・{item.detail}</option>)}</select><p className="mt-1 text-sm text-slate-600">每階3題，依序不重複；繞回已玩題保留紀錄。</p></div>}
        sidebar={<div className="space-y-2 text-sm">
          <div className="rounded-xl bg-slate-100 p-2"><div className="font-bold">{tierInfo.detail}</div><div>{session.mode === 'COOP' ? `共同活動分 ${session.scores.A + session.scores.B}` : '各組活動分顯示在固定操作區'}・本題棋分 {chessScore}</div><div>提示 {session.hintLevel}／3{session.revealed.includes(puzzle.id) ? '・已揭示，本題只練習' : ''}</div></div>
          <p className="leading-snug text-slate-700">{puzzle.prompt}</p>
          {session.finished && <div data-qwirkle-outcome={session.outcome} className={`rounded-xl border p-2 font-bold ${session.outcome === 'SUCCESS' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>{session.outcome === 'SUCCESS' ? '完成本題！' : session.outcome === 'DEAD_END' ? '第一步合法，但下一顆無處可放。' : '兩步都合法，還有更高棋分方案。'}<p className="mt-1 font-normal">可復原比較，或進入下一題。</p></div>}
          {session.moves.length > 0 && <ol className="space-y-1">{session.moves.map((move, i) => <li key={i} className="rounded-lg bg-sky-50 p-2">第{i + 1}步：{qwirkleTileName(move.tile)} → {move.target.id}，{move.score}棋分</li>)}</ol>}
        </div>}
        controls={<div className="space-y-2">
          <div data-qwirkle-draft="true" className="rounded-lg bg-sky-50 px-2 py-1 text-sm font-bold text-sky-950">{session.finished ? `${session.outcome === 'DEAD_END' ? '計畫卡住，本組保留' : '本題結束'}・${chessScore}棋分` : `${puzzle.tier === 'CHALLENGE' ? `第${session.moves.length + 1}步：` : ''}${selectedTile ? qwirkleTileName(selectedTile) : '選棋子'} → ${selectedTarget?.id ?? '選落點'}`}</div>
          <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setSession(state => clearQwirkleDraft(state, puzzle))} disabled={session.finished} className={`${actionClass} border-slate-300 bg-white`}>清除預選</button><button type="button" onClick={() => setSession(state => confirmQwirkleMove(state, puzzle))} disabled={!canConfirm} className={`${actionClass} border-emerald-700 bg-emerald-700 text-white`}>確認落棋</button></div>
          <button type="button" onClick={nextPuzzle} className={`${actionClass} w-full border-indigo-200 bg-indigo-50 text-indigo-900`}>下一題</button>
        </div>}
      >
        <div className="flex h-full min-h-0 w-full flex-col gap-1 p-0.5">
          <div className="shrink-0 text-center text-sm font-bold leading-tight text-slate-800">{puzzle.tier === 'BEGINNER' ? '同色不同形，或同形不同色；不能重複' : puzzle.tier === 'STANDARD' ? '目標：一顆棋同時形成橫線＋直線' : '目標：走完兩步，再比較總棋分'}
            {puzzle.nextTile && <div data-qwirkle-next="true" className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-violet-50 px-1 py-0.5 text-violet-950"><span>{session.moves.length ? '現在放' : '第2步公開棋'}：</span><QwirkleShapeSVG color={puzzle.nextTile.color} shape={puzzle.nextTile.shape} sizeClass="h-5 w-5" /><span>{qwirkleTileName(puzzle.nextTile)}</span></div>}
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto" aria-label="棋盤：棋子用數字，落點用字母">
            <div data-qwirkle-board="true" className="grid w-full shrink-0 gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(44px, 1fr))`, maxWidth: columns * 58 }}>
              {Array.from({ length: (maxY - minY + 1) * columns }, (_, i) => {
                const x = minX + i % columns; const y = minY + Math.floor(i / columns);
                const placed = session.board.find(item => item.x === x && item.y === y);
                const landing = puzzle.targets.find(item => item.x === x && item.y === y);
                const moveIndex = session.moves.findIndex(move => move.target.x === x && move.target.y === y);
                if (placed) return <div key={`${x}:${y}`} title={qwirkleTileName(placed.tile)} aria-label={`${landing ? `${landing.id}，` : ''}${qwirkleTileName(placed.tile)}${moveIndex >= 0 ? `，第${moveIndex + 1}步已放` : '，桌上棋子'}`} data-qwirkle-played={moveIndex >= 0 ? moveIndex + 1 : undefined} className={`flex h-11 min-w-11 flex-col items-center justify-center rounded-lg border-2 ${moveIndex >= 0 ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}><QwirkleShapeSVG color={placed.tile.color} shape={placed.tile.shape} sizeClass="h-6 w-6" /><span className="text-xs font-bold leading-none text-slate-700">{landing ? `${landing.id} ` : ''}{QWIRKLE_COLOR_NAMES[placed.tile.color][0]}{shortShapes[placed.tile.shape]}</span></div>;
                if (landing) return <button key={`${x}:${y}`} type="button" data-qwirkle-target={landing.id} aria-label={`落點 ${landing.id}`} aria-pressed={session.selection.targetId === landing.id} disabled={session.finished} onClick={() => setSession(state => selectQwirkleTarget(state, puzzle, landing.id))} className={`min-h-11 min-w-11 rounded-lg border-2 border-dashed text-lg font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 ${session.selection.targetId === landing.id ? 'border-sky-700 bg-sky-100 text-sky-950' : 'border-slate-400 bg-white text-slate-800'}`}>{landing.id}</button>;
                return <div key={`${x}:${y}`} aria-hidden="true" className="h-11 min-w-11 rounded-lg bg-slate-100/50" />;
              })}
            </div>
          </div>
          <div className="shrink-0"><div className="mb-0.5 text-center text-xs font-bold text-slate-600">{session.finished ? '本題手牌（可復原再討論）' : session.moves.length ? '公開下一顆已選取，請選落點' : '公開手牌・先說編號和名稱'}</div>
            <div className={`grid gap-2 ${hand.length === 1 ? 'grid-cols-1' : 'grid-cols-4'}`}>{hand.map(tile => <QwirkleTile key={tile.id} tile={tile} selected={session.selection.tileId === tile.id || (session.finished && session.moves[0]?.tile.id === tile.id)} disabled={session.finished} onClick={() => setSession(state => selectQwirkleTile(state, puzzle, tile.id))} />)}</div>
          </div>
        </div>
      </FacilitatedGameFrame>
      {confirmationDialog}
    </div>
  );
};
export default QwirkleGame;
