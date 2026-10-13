import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { Difficulty } from '../types';
import type { TrafficCar } from '../utils/facilitatedPuzzleRules';
import { initialTrafficTier, TRAFFIC_JAM_PUZZLES, TRAFFIC_TIER_LABELS, type TrafficJamPuzzle } from '../data/trafficJamLevels';
import { commitTrafficCommand, createTrafficSession, describeTrafficMove, prepareTrafficMove, previewTrafficDrag, requestTrafficHint, tryTrafficMove, undoTrafficMove, type TrafficMove, type TrafficScores, type TrafficTier } from '../utils/trafficJamModel';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';
import { useConfirmAction } from './game-ui/useConfirmAction';

interface Props { onBack: () => void; difficulty?: Difficulty }
interface TrafficDragVisual { carId: string; axis: 'H' | 'V'; distance: number; offsetPx: number }
interface ActiveTrafficDrag {
  pointerId: number;
  carId: string;
  axis: 'H' | 'V';
  startX: number;
  startY: number;
  cellSizePx: number;
  revision: number;
  cars: readonly TrafficCar[];
  target: HTMLButtonElement;
}

// Preserve the existing public entry points; both now open a curated tier.
export const TRAFFIC_JAM_LEVELS: Record<Difficulty, TrafficCar[]> = {
  NORMAL: TRAFFIC_JAM_PUZZLES.find(level => level.tier === 'STANDARD')!.cars,
  ADVANCED: TRAFFIC_JAM_PUZZLES.find(level => level.tier === 'CHALLENGE')!.cars,
};

const carPosition = (car: TrafficCar): CSSProperties => ({
  gridColumn: `${car.col + 2} / span ${car.axis === 'H' ? car.length : 1}`,
  gridRow: `${car.row + 2} / span ${car.axis === 'V' ? car.length : 1}`,
});
const coordinate = (row: number, col: number) => `${String.fromCharCode(65 + col)}${row + 1}`;
const carRange = (car: TrafficCar) => `${coordinate(car.row, car.col)}～${coordinate(car.row + (car.axis === 'V' ? car.length - 1 : 0), car.col + (car.axis === 'H' ? car.length - 1 : 0))}`;
const controlClass = 'min-h-11 min-w-0 rounded-xl border-2 border-slate-300 bg-white px-1 text-base font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40';

export const TrafficBoard: React.FC<{
  cars: readonly TrafficCar[];
  selectedCarId: string;
  previewCar?: TrafficCar;
  finished: boolean;
  onSelect: (id: string) => void;
  dragVisual?: TrafficDragVisual | null;
  onPointerDown?: (event: ReactPointerEvent<HTMLButtonElement>, car: TrafficCar) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}> = ({ cars, selectedCarId, previewCar, finished, onSelect, dragVisual, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }) => (
  <div
    data-coordinate-grid="true"
    data-traffic-board="true"
    role="group"
    aria-label="6 乘 6 停車場，欄 A 到 F，列 1 到 6"
    className="relative grid max-w-full gap-0.5 self-center"
    style={{ width: 'min(100%, calc((100dvh - 108px) * 1.12))', aspectRatio: '1.12', gridTemplateColumns: '1.25rem repeat(6, minmax(0, 1fr)) 2.25rem', gridTemplateRows: '1.25rem repeat(6, minmax(0, 1fr))' }}
  >
    {Array.from({ length: 6 }, (_, index) => (
      <React.Fragment key={`label-${index}`}>
        <span style={{ gridColumn: index + 2, gridRow: 1 }} className="text-center text-sm font-black text-slate-700">{String.fromCharCode(65 + index)}</span>
        <span style={{ gridColumn: 1, gridRow: index + 2 }} className="flex items-center justify-center text-sm font-black text-slate-700">{index + 1}</span>
      </React.Fragment>
    ))}
    {Array.from({ length: 36 }, (_, index) => {
      const row = Math.floor(index / 6);
      const col = index % 6;
      return <div key={`cell-${index}`} data-traffic-cell={`${row},${col}`} aria-label={coordinate(row, col)} style={{ gridRow: row + 2, gridColumn: col + 2 }} className={`rounded border ${row === 2 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-100'}`} />;
    })}
    <div aria-label="第 3 列右側出口" style={{ gridRow: 4, gridColumn: 8 }} className="flex flex-col items-center justify-center rounded-r-lg bg-rose-100 text-base font-black leading-tight text-rose-800"><span>出口</span><span aria-hidden="true">→</span></div>
    {cars.map(car => (
      <button
        key={car.id}
        type="button"
        data-traffic-car={car.id}
        aria-label={`${car.id} 車，${car.axis === 'H' ? '橫向' : '直向'} ${car.length} 格，${carRange(car)}`}
        aria-pressed={selectedCarId === car.id}
        disabled={finished}
        onClick={() => onSelect(car.id)}
        draggable={false}
        onDragStart={event => event.preventDefault()}
        onPointerDown={event => onPointerDown?.(event, car)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onPointerCancel}
        style={{ ...carPosition(car), touchAction: 'none', userSelect: 'none', transform: dragVisual?.carId === car.id ? `translate${car.axis === 'H' ? 'X' : 'Y'}(${dragVisual.offsetPx}px)` : undefined }}
        className={`relative z-10 flex cursor-grab items-center active:cursor-grabbing justify-center gap-1 rounded-xl border-2 text-xl font-black text-white shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${car.axis === 'V' ? 'flex-col' : ''} ${car.color} ${selectedCarId === car.id ? 'border-slate-950 ring-2 ring-amber-300' : 'border-white/90'}`}
      >
        <span aria-hidden="true" data-traffic-window="front" className={`pointer-events-none absolute rounded-sm border border-white/70 bg-sky-100/80 ${car.axis === 'H' ? 'left-[8%] top-[18%] h-[64%] w-[13%]' : 'left-[18%] top-[8%] h-[13%] w-[64%]'}`} />
        <span aria-hidden="true" data-traffic-window="rear" className={`pointer-events-none absolute rounded-sm border border-white/70 bg-sky-100/80 ${car.axis === 'H' ? 'right-[8%] top-[18%] h-[64%] w-[13%]' : 'left-[18%] bottom-[8%] h-[13%] w-[64%]'}`} />
        <span data-traffic-label="true" className={`pointer-events-none relative z-10 rounded bg-white px-1 text-xl font-black leading-tight text-slate-950 ${car.target ? '-translate-y-1.5' : ''}`}>{car.id}</span>
        {car.target && <span data-traffic-target="true" className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t bg-rose-950 px-1 text-xs font-bold leading-tight text-white">目標</span>}
        {[0,1,2,3].map(wheel => <span key={wheel} aria-hidden="true" className="pointer-events-none absolute rounded bg-slate-800" style={car.axis === 'H' ? { width: '16%', height: 3, left: wheel % 2 ? '66%' : '18%', ...(wheel < 2 ? { top: -3 } : { bottom: -3 }) } : { height: '16%', width: 3, top: wheel % 2 ? '66%' : '18%', ...(wheel < 2 ? { left: -3 } : { right: -3 }) }} />) }
      </button>
    ))}
    {previewCar && (
      <div data-traffic-preview="true" aria-label={`預覽目的地：${carRange(previewCar)}`} style={carPosition(previewCar)} className="pointer-events-none z-20 rounded-xl border-4 border-dashed border-amber-400 bg-amber-200/20" />
    )}
  </div>
);

const TrafficJamGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }: Props) => {
  const [levelId, setLevelId] = useState(() => TRAFFIC_JAM_PUZZLES.find(level => level.tier === initialTrafficTier(difficulty))!.id);
  const level = TRAFFIC_JAM_PUZZLES.find(candidate => candidate.id === levelId)!;
  const [session, setSession] = useState(() => createTrafficSession(level.cars, 'COOP'));
  const [roundStartingScores, setRoundStartingScores] = useState<TrafficScores>({ A: 0, B: 0 });
  const dragRef = useRef<ActiveTrafficDrag | null>(null);
  const pointersDown = useRef(new Set<number>());
  const [dragVisual, setDragVisual] = useState<TrafficDragVisual | null>(null);
  const releaseDrag = useCallback(() => {
    const active = dragRef.current;
    // Clear first: releasePointerCapture may synchronously emit lostpointercapture.
    dragRef.current = null;
    if (active) {
      try { if (active.target.hasPointerCapture?.(active.pointerId)) active.target.releasePointerCapture(active.pointerId); } catch { /* Capture may already have been revoked by the browser. */ }
    }
    return active;
  }, []);
  const settle = useRef<{ target: HTMLButtonElement; axis: 'H' | 'V'; residualPx: number; expectedRevision: number } | null>(null);
  const settlingAnimation = useRef<Animation | null>(null);
  const stopSettling = useCallback(() => { settle.current = null; settlingAnimation.current?.cancel(); settlingAnimation.current = null; }, []);
  const cancelDrag = useCallback(() => { stopSettling(); releaseDrag(); setDragVisual(null); }, [releaseDrag, stopSettling]);
  useLayoutEffect(() => {
    const pending = settle.current;
    if (!pending) return;
    settle.current = null;
    if (session.revision !== pending.expectedRevision || Math.abs(pending.residualPx) < 0.01) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || typeof pending.target.animate !== 'function') return;
    // Grid has now committed. The residual transform starts at the exact last
    // pointer position, avoiding a frame at the old origin or a double offset.
    settlingAnimation.current = pending.target.animate([
      { transform: `translate${pending.axis === 'H' ? 'X' : 'Y'}(${pending.residualPx}px)` },
      { transform: `translate${pending.axis === 'H' ? 'X' : 'Y'}(0px)` },
    ], { duration: 140, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
  }, [dragVisual, session.revision]);
  useEffect(() => {
    // Different device types can each have isPrimary=true. Track physical presses
    // until release so the canceling event (or a later pen tap) cannot replace a drag.
    const pointerDown = (event: PointerEvent) => {
      pointersDown.current.add(event.pointerId);
      if (pointersDown.current.size > 1) cancelDrag();
    };
    const pointerEnd = (event: PointerEvent) => {
      pointersDown.current.delete(event.pointerId);
      if (event.type === 'pointercancel' && dragRef.current?.pointerId === event.pointerId) cancelDrag();
    };
    const abandonPointers = () => { pointersDown.current.clear(); cancelDrag(); };
    const keyboardAction = (event: KeyboardEvent) => { if (dragRef.current && ['Escape', 'Tab', 'Enter', ' '].includes(event.key)) cancelDrag(); };
    const visibilityChange = () => { if (document.hidden) abandonPointers(); };
    document.addEventListener('pointerdown', pointerDown, true);
    document.addEventListener('pointerup', pointerEnd, true);
    document.addEventListener('pointercancel', pointerEnd, true);
    document.addEventListener('keydown', keyboardAction, true);
    document.addEventListener('visibilitychange', visibilityChange);
    window.addEventListener('blur', abandonPointers);
    window.addEventListener('resize', cancelDrag);
    return () => {
      document.removeEventListener('pointerdown', pointerDown, true);
      document.removeEventListener('pointerup', pointerEnd, true);
      document.removeEventListener('pointercancel', pointerEnd, true);
      document.removeEventListener('keydown', keyboardAction, true);
      document.removeEventListener('visibilitychange', visibilityChange);
      window.removeEventListener('blur', abandonPointers);
      window.removeEventListener('resize', cancelDrag);
      stopSettling();
      releaseDrag();
      pointersDown.current.clear();
    };
  }, [cancelDrag, releaseDrag, stopSettling]);
  const hasProgress = session.steps > 0 || session.pendingMove !== null || session.selectedCarId !== 'X' || session.hintDepth > 0 || session.solutionRevealed || session.scores.A > 0 || session.scores.B > 0;
  const { requestAction, confirmationDialog } = useConfirmAction(hasProgress);
  const selectedCar = session.cars.find(car => car.id === session.selectedCarId)!;
  const preview = useMemo(() => {
    const move = dragVisual ? (dragVisual.distance ? { carId: dragVisual.carId, distance: dragVisual.distance } : null) : session.pendingMove;
    return move ? tryTrafficMove(session.cars, move) : null;
  }, [session.cars, session.pendingMove, dragVisual]);
  const previewCar = preview?.find(car => car.id === session.selectedCarId);
  const tierLevels = TRAFFIC_JAM_PUZZLES.filter(candidate => candidate.tier === level.tier);
  const levelIndex = tierLevels.findIndex(candidate => candidate.id === level.id);

  const startLevel = (nextLevel: TrafficJamPuzzle, mode: FacilitatedMode = session.mode, scores = session.scores) => {
    cancelDrag();
    setLevelId(nextLevel.id);
    setRoundStartingScores({ ...scores });
    setSession({ ...createTrafficSession(nextLevel.cars, mode, scores), solutionRevealed: nextLevel.id === level.id && session.solutionRevealed });
  };
  const changeTier = (tier: TrafficTier) => {
    if (tier === level.tier) return;
    requestAction(() => startLevel(TRAFFIC_JAM_PUZZLES.find(candidate => candidate.tier === tier)!), '切換難度將結束目前這題，是否繼續？');
  };
  const nextLevel = () => requestAction(() => startLevel(tierLevels[(levelIndex + 1) % tierLevels.length]), '換題將結束目前這題，是否繼續？');
  const selectCar = (id: string) => setSession(previous => previous.finished ? previous : { ...previous, selectedCarId: id, pendingMove: null });
  const prepare = (move: TrafficMove) => setSession(previous => prepareTrafficMove(previous, move));
  const confirm = () => {
    if (dragRef.current) return;
    const expectedRevision = session.revision;
    setSession(previous => commitTrafficCommand(previous, previous.pendingMove, expectedRevision));
  };
  const hint = () => { cancelDrag(); setSession(previous => requestTrafficHint(previous, level.hints)); };
  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>, car: TrafficCar) => {
    if (session.finished || event.isPrimary === false || event.button !== 0 || dragRef.current
      || pointersDown.current.size !== 1 || !pointersDown.current.has(event.pointerId)) return;
    const board = event.currentTarget.closest('[data-traffic-board]');
    const origin = board?.querySelector('[data-traffic-cell="0,0"]')?.getBoundingClientRect();
    const adjacent = board?.querySelector(car.axis === 'H' ? '[data-traffic-cell="0,1"]' : '[data-traffic-cell="1,0"]')?.getBoundingClientRect();
    const cellSizePx = origin && adjacent ? (car.axis === 'H' ? adjacent.left - origin.left : adjacent.top - origin.top) : 0;
    if (!Number.isFinite(cellSizePx) || cellSizePx <= 0) return;
    event.preventDefault();
    stopSettling();
    event.currentTarget.focus({ preventScroll: true });
    selectCar(car.id);
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { return; }
    dragRef.current = { pointerId: event.pointerId, carId: car.id, axis: car.axis, startX: event.clientX, startY: event.clientY, cellSizePx, revision: session.revision, cars: session.cars, target: event.currentTarget };
    setDragVisual({ carId: car.id, axis: car.axis, distance: 0, offsetPx: 0 });
  };
  const projectDrag = (active: ActiveTrafficDrag, event: ReactPointerEvent<HTMLButtonElement>) => previewTrafficDrag(active.cars, active.carId, active.axis === 'H' ? event.clientX - active.startX : event.clientY - active.startY, active.cellSizePx);
  const updateDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.preventDefault();
    setDragVisual({ carId: active.carId, axis: active.axis, ...projectDrag(active, event) });
  };
  const finishDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.preventDefault();
    const { distance, offsetPx } = projectDrag(active, event);
    settle.current = { target: active.target, axis: active.axis, residualPx: offsetPx - distance * active.cellSizePx, expectedRevision: active.revision + (distance === 0 ? 0 : 1) };
    releaseDrag();
    setDragVisual(null);
    if (distance !== 0) setSession(previous => commitTrafficCommand(previous, { carId: active.carId, distance }, active.revision));
  };
  const abortPointerDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) cancelDrag();
  };

  return (
    <>
      <FacilitatedGameFrame
        title="塞車解謎"
        subtitle={`6×6 · ${TRAFFIC_TIER_LABELS[level.tier]} ${levelIndex + 1}/${tierLevels.length} · ${level.title}`}
        onBack={() => { cancelDrag(); onBack(); }}
        mode={session.mode}
        onModeChange={mode => { if (mode !== session.mode) startLevel(level, mode, { A: 0, B: 0 }); }}
        currentTeam={session.activeTeam}
        scores={session.scores}
        recentAction={session.recentAction}
        onUndo={() => { cancelDrag(); setSession(undoTrafficMove); }}
        onReset={() => startLevel(level, session.mode, roundStartingScores)}
        onHint={hint}
        canUndo={session.history.length > 0}
        hasProgress={hasProgress}
        feedback={session.finished ? `完成！X 車抵達出口，共 ${session.steps} 個策略步。${session.solutionRevealed ? ' 提示練習，本題不計分。' : session.mode === 'TEAMS' ? ` ${session.activeTeam} 組 +1 分。` : ''}` : undefined}
        rules={[
          '目標：讓 X 車沿第 3 列抵達右側出口。車輛只能沿車身方向移動，不能轉彎、重疊或穿越。',
          '整句口述：「B 車向下 2 格」。先選車、方向、格數，核對預覽後按「確認整步」。',
          '也可沿車身方向拖曳：遇到車或邊界即停，放手吸附最近格線並完成整步；取消拖曳或未跨半格不計步。',
          '每次確認或拖曳放手算 1 個策略步，即使移動數格也只換組一次；預覽、提示與非法指令不換組。',
          '入門練直接讓路與短依存；標準規劃多車前置關係；挑戰需多次借位、回移與交接。棋盤都維持 6×6。',
          '合作共同完成；分組輪流提出完整一步，完成出口的組得 1 分。分數是遊戲紀錄，不代表認知能力。',
          '復原會一起還原車位、步數、輪組、提示階段和完成分數。已看過完整示範的本題是提示練習，不計分；復原、重試或切模式不會清掉已揭示紀錄。',
          '重試本題會撤回這題的完成分；換下一題會保留已完成分數。一般觀察提示不影響計分。',
        ]}
        sidebar={(
          <div className="rounded-xl bg-slate-50 p-2 text-base text-slate-800">
            <div className="font-bold">{level.title}</div>
            <p className="mt-1 leading-snug">{level.focus}</p>
            <p className="mt-1 font-bold" data-traffic-steps="true">策略步數：{session.steps} <span className="font-normal">（移車格數 {session.squaresMoved}）</span></p>
          </div>
        )}
        settings={(
          <div className="space-y-2">
            <label className="block text-sm font-bold" htmlFor="traffic-tier">關卡難度</label>
            <select id="traffic-tier" aria-label="塞車關卡難度" value={level.tier} onChange={event => changeTier(event.target.value as TrafficTier)} className={`${controlClass} w-full`}>
              {(Object.keys(TRAFFIC_TIER_LABELS) as TrafficTier[]).map(tier => <option key={tier} value={tier}>{TRAFFIC_TIER_LABELS[tier]}</option>)}
            </select>
            <label className="block text-sm font-bold" htmlFor="traffic-level">選題（本階 {tierLevels.length} 題）</label>
            <select id="traffic-level" aria-label="塞車題目" value={level.id} onChange={event => {
              const next = TRAFFIC_JAM_PUZZLES.find(candidate => candidate.id === event.target.value)!;
              if (next.id !== level.id) requestAction(() => startLevel(next), '選擇其他題目將結束目前這題，是否繼續？');
            }} className={`${controlClass} w-full`}>
              {tierLevels.map((candidate, index) => <option key={candidate.id} value={candidate.id}>{index + 1}．{candidate.title}</option>)}
            </select>
            <p className="text-sm text-slate-600">最短解用於題庫驗證，活動可採任何合法解。每題車道配置不同，入門可在此選擇。</p>
          </div>
        )}
        controls={(
          <div className="space-y-1.5" data-traffic-command="true">
            <div className="grid grid-cols-3 gap-1">
              <select aria-label="選擇車輛" value={session.selectedCarId} disabled={session.finished || !!dragVisual} onChange={event => selectCar(event.target.value)} className={controlClass}>
                {session.cars.map(car => <option key={car.id} value={car.id}>{car.id} 車</option>)}
              </select>
              <select aria-label="移動方向" value={session.pendingMove ? Math.sign(session.pendingMove.distance) : ''} disabled={session.finished || !!dragVisual} onChange={event => {
                if (event.target.value) prepare({ carId: session.selectedCarId, distance: Number(event.target.value) * Math.abs(session.pendingMove?.distance ?? 1) });
              }} className={controlClass}>
                <option value="" disabled>方向</option>
                <option value={-1}>{selectedCar.axis === 'H' ? '← 左' : '↑ 上'}</option>
                <option value={1}>{selectedCar.axis === 'H' ? '右 →' : '下 ↓'}</option>
              </select>
              <select aria-label="移動格數" value={Math.abs(session.pendingMove?.distance ?? 1)} disabled={session.finished || !!dragVisual || !session.pendingMove} onChange={event => prepare({ carId: session.selectedCarId, distance: Math.sign(session.pendingMove!.distance) * Number(event.target.value) })} className={controlClass}>
                {Array.from({ length: 6 - selectedCar.length }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} 格</option>)}
              </select>
            </div>
            <div aria-live="polite" data-traffic-command-preview="true" className={`flex min-h-9 items-center rounded-lg px-2 text-base font-bold leading-tight ${session.pendingMove && !preview ? 'bg-rose-100 text-rose-800' : 'bg-indigo-50 text-indigo-950'}`}>
              {session.finished ? '已完成，可復原或換題。' : dragVisual ? (dragVisual.distance ? `${describeTrafficMove(session.cars, { carId: dragVisual.carId, distance: dragVisual.distance })}，放手完成` : '沿車身拖曳，放開吸附格線') : session.pendingMove ? `${describeTrafficMove(session.cars, session.pendingMove)}${preview ? '，確認？' : '，會撞車或越界'}` : '整句口述：車號、方向、格數'}
            </div>
            <div className="grid grid-cols-[1.6fr_1fr] gap-1">
              <button type="button" onClick={confirm} disabled={!preview || session.finished || !!dragVisual} className="min-h-11 rounded-xl bg-indigo-700 px-2 text-base font-bold text-white focus-visible:ring-4 focus-visible:ring-sky-300 disabled:bg-slate-200 disabled:text-slate-500">確認整步</button>
              <button type="button" onClick={nextLevel} disabled={!!dragVisual} className={`${controlClass} border-slate-300`}>下一題</button>
            </div>
          </div>
        )}
      >
        <TrafficBoard cars={session.cars} selectedCarId={session.selectedCarId} previewCar={previewCar} finished={session.finished} onSelect={selectCar} dragVisual={dragVisual} onPointerDown={beginDrag} onPointerMove={updateDrag} onPointerUp={finishDrag} onPointerCancel={abortPointerDrag} />
      </FacilitatedGameFrame>
      {confirmationDialog}
    </>
  );
};

export default TrafficJamGame;
