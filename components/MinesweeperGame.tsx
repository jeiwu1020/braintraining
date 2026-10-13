import React, { useRef, useState } from 'react';
import { readFacilitatorKnowledge, saveFacilitatorKnowledge } from '../utils/facilitatorKnowledge';
import type { Difficulty } from '../types';
import { countAdjacentMines } from '../utils/facilitatedPuzzleRules';
import { generateGradedMinesweeper, MINESWEEPER_MINE_COUNTS, type GradedMinesweeperPuzzle } from '../data/minesweeperPuzzles';
import { mineCoordinate, mineNeighbors, type MinesweeperTier } from '../utils/minesweeperInference';
import { confirmMineRound, continueMineSession, createMineSession, requestMineHint, resetMineSession, selectMineCell, undoMineRound, type MineResult, type MineSession, type MineTool } from '../utils/minesweeperSession';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';
import { useConfirmAction } from './game-ui/useConfirmAction';

interface Props { onBack: () => void; difficulty?: Difficulty }
const TIERS: Array<{ id: MinesweeperTier; label: string; skill: string }> = [
  { id: 'BEGINNER', label: '入門', skill: '只用一個數字逐步推理' },
  { id: 'STANDARD', label: '標準', skill: '至少一次比較兩圈未知格' },
  { id: 'CHALLENGE', label: '挑戰', skill: '結合局部線索與全盤剩雷' },
];
const tools: Array<[MineTool, string]> = [['REVEAL', '揭開'], ['FLAG', '標雷／撤旗'], ['CHORD', '連開']];
const readKnowledge = () => readFacilitatorKnowledge('minesweeper-v1');
const saveKnowledge = (ids: string[]) => saveFacilitatorKnowledge('minesweeper-v1', ids);

export const MinesweeperStatusCard: React.FC<{ result: MineResult; mode: FacilitatedMode; scores: Record<'A' | 'B', number>; onContinue: () => void; onReset: () => void }> = ({ result, mode, scores, onContinue, onReset }) => {
  if (result === 'MINE') return <div role="status" className="rounded-xl border border-rose-300 bg-rose-50 p-2 text-base text-rose-900">
    <div className="font-black">踩到地雷</div><div>只公開這一顆；繼續後自動插旗。</div>
    <button type="button" onClick={onContinue} className="mt-2 min-h-11 w-full rounded-lg bg-rose-700 px-3 font-bold text-white">繼續遊戲</button>
  </div>;
  if (result === 'WON') return <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-2 text-base text-emerald-900">
    <div className="font-black">完成！所有安全格都已找出</div>
    {mode === 'TEAMS' && <div>{scores.A === scores.B ? '平手' : `${scores.A > scores.B ? 'A' : 'B'} 組獲勝`}｜參與分 A {scores.A}：B {scores.B}</div>}
    <button type="button" onClick={onReset} className="mt-2 min-h-11 w-full rounded-lg bg-emerald-700 px-3 font-bold text-white">再來一局</button>
  </div>;
  return null;
};

const MinesweeperGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [tier, setTier] = useState<MinesweeperTier>(difficulty === 'ADVANCED' ? 'CHALLENGE' : 'BEGINNER');
  const [game, setGame] = useState<MineSession>(() => createMineSession('COOP', readKnowledge()));
  const seen = useRef<string[]>([]);
  const opening = useRef<GradedMinesweeperPuzzle | null>(null);
  const hasProgress = Boolean(game.puzzle || game.selection.length || game.hintLevel);
  const { requestAction, confirmationDialog } = useConfirmAction(hasProgress);
  const currentTier = TIERS.find(item => item.id === tier)!;
  const mineTotal = game.puzzle?.mines.length ?? MINESWEEPER_MINE_COUNTS[tier];
  const mines = new Set<string>(game.puzzle?.mines ?? []);
  const exposed = Boolean(game.puzzle && game.exposedPuzzleIds.includes(game.puzzle.id));
  const replace = (next: MineSession) => { saveKnowledge(next.exposedPuzzleIds); setGame(next); };
  const reset = (mode = game.mode) => { opening.current = null; replace(resetMineSession(game, mode)); };
  const changeTier = (nextTier: MinesweeperTier) => {
    if (nextTier === tier) return;
    requestAction(() => { setTier(nextTier); reset(); }, '切換推理層級會換新盤面並重新計分。是否繼續？');
  };
  const confirm = () => {
    let puzzle = game.puzzle;
    if (!puzzle && game.selection.length) {
      puzzle = opening.current?.tier === tier && opening.current.start === game.selection[0] ? opening.current : generateGradedMinesweeper(tier, game.selection[0], seen.current);
      opening.current = puzzle;
      if (!seen.current.includes(puzzle.id)) seen.current.push(puzzle.id);
    }
    replace(confirmMineRound(game, puzzle ?? undefined));
  };
  const chooseTool = (tool: MineTool) => {
    if (game.result !== 'PLAYING' || game.tool === tool || (!game.puzzle && tool !== 'REVEAL')) return;
    replace({ ...game, tool, selection: [], recent: `已選${tools.find(item => item[0] === tool)![1]}。請口述座標與理由，再確認。` });
  };
  const selectedLabel = game.selection.map(mineCoordinate).join('、');
  const chordNeighbors = game.tool === 'CHORD' && game.selection[0] ? mineNeighbors(game.selection[0], 6, 6).filter(key => !game.revealed.includes(key) && !game.flags.includes(key)) : [];
  const preview = !game.selection.length ? '請先選工具，再點座標預覽。'
    : game.tool === 'FLAG' ? game.selection.map(key => `${game.flags.includes(key) ? '撤旗' : '標雷'} ${mineCoordinate(key)}`).join('、')
    : game.tool === 'CHORD' ? `連開 ${selectedLabel} 周圍：${chordNeighbors.map(mineCoordinate).join('、') || '沒有未開格'}` : `揭開 ${selectedLabel}`;
  const highlighted = new Set([...(game.hintStep?.clues ?? []), ...(game.hintStep?.related ?? [])]);

  return <>
    <FacilitatedGameFrame desktopLayout="mines" title="合作踩地雷" subtitle={`6×6｜${mineTotal} 顆地雷｜${currentTier.label}：${currentTier.skill}`} onBack={onBack}
      mode={game.mode} onModeChange={mode => reset(mode)} currentTeam={game.team} scores={game.scores} recentAction={game.recent}
      onUndo={() => replace(undoMineRound(game))} undoLabel="誤觸復原" canUndo={game.history.length > 0} hasProgress={hasProgress}
      onReset={() => reset()} resetLabel="換新盤面" onHint={() => replace(requestMineHint(game))}
      settings={<div className="space-y-2">
        <div className="text-base font-bold">推理層級</div><div className="grid grid-cols-3 gap-1">{TIERS.map(item => <button key={item.id} type="button" aria-pressed={tier === item.id} onClick={() => changeTier(item.id)} className={`min-h-11 rounded-lg border px-1 text-base font-bold focus-visible:ring-4 focus-visible:ring-sky-300 ${tier === item.id ? 'bg-indigo-700 text-white' : 'bg-white text-slate-800'}`}>{item.label}</button>)}</div>
        <p className="text-base text-slate-700">每階 18 個經推理驗證的原盤，再旋轉／鏡像配合首格；變式不是新策略。題庫有限，用完會重複。</p>
      </div>}
      sidebar={<>
        <div className="rounded-xl bg-slate-50 p-2 text-base text-slate-800"><strong>{currentTier.label}・{currentTier.skill}</strong><div>{game.puzzle ? `已標記 ${game.flags.length}／${mineTotal} 顆；${game.flags.length > mineTotal ? '旗幟超過總雷數，請先核對' : `旗數推估剩 ${mineTotal - game.flags.length} 顆`}` : '任選首格，確認後才配置盤面。'}</div><p className="mt-1">請先說明「哪個數字、哪些未知格、為何安全或是雷」。不計時。</p></div>
        {game.puzzle?.repeated && <p role="status" className="rounded-lg bg-amber-50 p-2 text-base">這個首格的同級盤已輪過，現在是重複練習。</p>}
        {exposed && <p className="rounded-lg bg-amber-50 p-2 text-base font-bold">本盤已揭示：提示練習，不再加分。復原或重訪仍保留此記錄。</p>}
        <MinesweeperStatusCard result={game.result} mode={game.mode} scores={game.scores} onContinue={() => replace(continueMineSession(game))} onReset={() => requestAction(() => reset(), '換新盤面並重新計分。是否繼續？')} />
      </>}
      controls={<div className="space-y-1">
        <div className="grid grid-cols-3 gap-1">{tools.map(([tool, label]) => <button key={tool} type="button" aria-pressed={game.tool === tool} disabled={game.result !== 'PLAYING' || (!game.puzzle && tool !== 'REVEAL')} onClick={() => chooseTool(tool)} className={`min-h-11 rounded-lg border px-1 text-base font-bold focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40 ${game.tool === tool ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>{label}</button>)}</div>
        <div role="status" tabIndex={0} aria-label="本次座標預覽" className="max-h-16 overflow-y-auto rounded-lg bg-sky-50 px-2 py-1 text-base font-semibold text-sky-950">{preview}</div>
        <div className="grid grid-cols-2 gap-1"><button type="button" disabled={!game.selection.length || game.result !== 'PLAYING'} onClick={() => replace({ ...game, selection: [], recent: '已清除預覽，尚未換組。' })} className="min-h-11 rounded-lg border border-slate-300 bg-white px-1 text-base font-bold disabled:opacity-40">清除選取</button>
          <button type="button" disabled={!game.selection.length || game.result !== 'PLAYING'} onClick={confirm} className="min-h-11 rounded-lg bg-indigo-700 px-1 text-base font-bold text-white focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40">確認整批</button></div>
      </div>}
      rules={[
        '根據數字找出所有安全格。入門只需單數字；標準至少要比較未知格的包含關係；挑戰還需要結合全盤剩雷。三階均為 6×6；入門 6 雷、標準 7 雷、挑戰 8 雷。盤型另限制大面積空白展開，保留多次推理。',
        '先選任意首格，再確認；第一格及周圍八格保證安全。經驗證有限題庫會隨機選盤和旋轉／鏡像，不需猜測，但錯誤旗幟會影響推理。',
        '先選揭開、標雷／撤旗或連開工具，再點一個或多個座標。預覽只選取，不改盤面；口述一段理由後，確認整批才算一次回合。',
        '標雷模式選未插旗的格會插旗，選已插旗的格會撤旗。連開須選已開數字，周圍旗數相符才揭開其餘鄰格；旗幟如果猜錯仍可能踩雷。',
        '分組採參與分：一次新增揭開或首次提出旗幟整批得 1 分並換組；旗幟分不表示判斷正確。撤旗、再次提出同一面旗、無新增進展、提示都不加分、不換組。沒有最後一格額外加分，也不計時。',
        '踩雷只公開一顆，分組扣 1 分並換組。繼續後系統把該雷插上不能移除的旗；本盤轉成提示練習。',
        '提示依序提供思考方向、相關區域、具體推理與座標。精確揭示後本盤不再加分；復原、換模式、換題後重訪都不能清除已知答案。此記錄保留在本瀏覽分頁。',
        '誤觸復原會恢復整個確認前的盤面、座標預覽、工具、隊伍、分數、提示階段與完成狀態；已經知道的答案不會被遺忘。',
        '口述：「C2 的未知格都在 D2 那圈內，多出來的 E1 只可能是雷。」黃色框是提示相關區域，深藍框是待確認座標；欄用英文字母，列用數字。',
      ]}
    >
      <CoordinateGrid rows={6} columns={6} className="w-full max-w-[30rem]" renderCell={(row, col, coordinate) => {
        const key = `${row},${col}`; const revealed = game.revealed.includes(key); const mine = mines.has(key); const flagged = game.flags.includes(key); const neutral = game.neutralFlags.includes(key); const selected = game.selection.includes(key);
        const adjacent = countAdjacentMines(row, col, mines, 6, 6);
        return <button type="button" disabled={game.result !== 'PLAYING'} aria-pressed={selected} aria-label={`${coordinate}${flagged ? neutral ? '，系統標記地雷' : '，已插旗' : revealed ? mine ? '，踩到地雷' : `，數字 ${adjacent}` : '，未翻開'}`} onClick={() => replace(selectMineCell(game, key))}
          className={`min-h-11 min-w-11 h-full w-full rounded-md border-2 text-xl font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 ${selected ? '!border-indigo-900 ring-2 ring-indigo-700' : highlighted.has(key) ? '!border-amber-600 ring-2 ring-amber-500' : ''} ${revealed ? mine ? 'border-rose-700 bg-rose-200 text-rose-900' : 'border-slate-300 bg-white text-indigo-800' : neutral ? 'border-slate-500 bg-slate-200 text-slate-800' : 'border-sky-700 bg-sky-500 text-white'}`}>
          {flagged && !revealed ? neutral ? '⚑' : '🚩' : revealed ? mine ? '✹' : adjacent || '·' : '·'}
        </button>;
      }} />
    </FacilitatedGameFrame>
    {confirmationDialog}
  </>;
};
export default MinesweeperGame;
