import { findNonogramDeductions, type NonogramDeduction, type NonogramMark, type NonogramPuzzle } from './nonogramRules';
export interface NonogramSnapshot { marks: Record<number, NonogramMark>; draft: Record<number, NonogramMark>; tool: NonogramMark; team: 'A' | 'B'; scores: { A: number; B: number }; credited: Record<string, 'A' | 'B'>; finished: boolean; hintDepth: number; hintLine: string | null; recent: string }
export interface NonogramSession extends NonogramSnapshot { puzzleId: string; mode: 'COOP' | 'TEAMS'; history: NonogramSnapshot[]; revealedIds: string[]; revision: number }
const coordinate = (index: number, size: number) => `${String.fromCharCode(65 + index % size)}${Math.floor(index / size) + 1}`;
const lineName = (deduction: NonogramDeduction) => deduction.axis === 'ROW' ? `第 ${deduction.line + 1} 列` : `${String.fromCharCode(65 + deduction.line)} 欄`;
export const NONOGRAM_MARK_LABELS: Record<NonogramMark, string> = { UNKNOWN: '清除', FILLED: '填滿', CROSSED: '打叉' };
export const createNonogramSession = (p: NonogramPuzzle, mode: 'COOP' | 'TEAMS' = 'COOP'): NonogramSession => ({
  puzzleId: p.id, mode, marks: {}, draft: {}, tool: 'FILLED', team: 'A', scores: { A: 0, B: 0 }, credited: {}, finished: false,
  hintDepth: 0, hintLine: null, recent: '先選填滿、打叉或清除，再選座標；說完一段推理後確認整批。', history: [], revealedIds: [], revision: 0,
});
export const setNonogramTool = (s: NonogramSession, tool: NonogramMark): NonogramSession => ({ ...s, tool });
export const toggleNonogramDraft = (s: NonogramSession, p: NonogramPuzzle, index: number): NonogramSession => {
  if (s.finished || p.id !== s.puzzleId || !Number.isInteger(index) || index < 0 || index >= p.pattern.length ** 2) return s;
  const draft = { ...s.draft };
  if (draft[index] === s.tool) delete draft[index]; else draft[index] = s.tool;
  return { ...s, draft, recent: Object.keys(draft).length ? `已預選 ${Object.keys(draft).length} 格；請核對座標與標記後確認整批。` : '已取消本次預選，尚未換組。' };
};
export const commitNonogramBatch = (s: NonogramSession, p: NonogramPuzzle, revision: number): NonogramSession => {
  if (s.finished || s.puzzleId !== p.id || s.revision !== revision) return s;
  const changes = Object.entries(s.draft).filter(([key, mark]) => Number.isInteger(Number(key)) && Number(key) >= 0 && Number(key) < p.pattern.length ** 2 && mark !== (s.marks[Number(key)] ?? 'UNKNOWN'));
  if (!changes.length) return { ...s, draft: {}, recent: '沒有新的標記變更，不計步、不換組。' };
  const marks = { ...s.marks, ...Object.fromEntries(changes) };
  const finished = [...p.pattern.join('')].every((value, index) => marks[index] === (value === '1' ? 'FILLED' : 'CROSSED'));
  const assisted = s.revealedIds.includes(p.id); const alreadyScored = Boolean(s.credited[p.id]);
  const scores = { ...s.scores }; const credited = { ...s.credited };
  if (finished && s.mode === 'TEAMS' && !assisted && !alreadyScored) { scores[s.team]++; credited[p.id] = s.team; }
  const { history, revealedIds: _knowledge, revision: _revision, puzzleId: _puzzleId, mode: _mode, ...snapshot } = s;
  const conflict = findNonogramDeductions(p.pattern, marks).find(item => item.candidates === 0);
  const result = finished ? `全部填滿與叉號都完成！${assisted ? '本題為提示練習，不計分。' : alreadyScored ? '本題已計分，不重複加分。' : s.mode === 'TEAMS' ? `${s.team} 組 +1 分。` : ''}`
    : conflict ? `${lineName(conflict)}的標記與線索衝突，可先復原再討論。` : '請把這次結論帶到相交的列或欄。';
  return { ...s, marks, draft: {}, scores, credited, finished, hintDepth: 0, hintLine: null, team: s.mode === 'TEAMS' ? (s.team === 'A' ? 'B' : 'A') : s.team,
    history: [...history, { ...snapshot, marks: { ...s.marks }, draft: { ...s.draft }, scores: { ...s.scores }, credited: { ...s.credited } }], revision: s.revision + 1,
    recent: `${s.mode === 'TEAMS' ? `${s.team} 組：` : ''}確認 ${changes.length} 格。${result}` };
};
export const undoNonogramBatch = (s: NonogramSession): NonogramSession => {
  const previous = s.history[s.history.length - 1];
  return previous ? { ...s, ...previous, marks: { ...previous.marks }, draft: { ...previous.draft }, scores: { ...previous.scores }, credited: { ...previous.credited }, revealedIds: [...s.revealedIds], history: s.history.slice(0, -1), revision: s.revision + 1, recent: '已復原整批；盤面、預選、輪組與分數一起還原，已看答案的紀錄保留。' } : s;
};
export const hintNonogram = (s: NonogramSession, p: NonogramPuzzle): NonogramSession => {
  if (s.finished || s.puzzleId !== p.id) return s;
  const deductions = findNonogramDeductions(p.pattern, s.marks);
  const deduction = deductions.find(item => item.candidates === 0) ?? deductions.find(item => item.technique === 'EXACT') ?? deductions[0];
  if (!deduction) return { ...s, recent: '目前沒有可直接推出的格子；先核對已填的列與欄，不猜圖案。' };
  const depth = Math.min(3, s.hintDepth + 1); const name = lineName(deduction);
  const hintLine = `${deduction.axis}:${deduction.line}`;
  if (!deduction.candidates) return { ...s, hintDepth: depth, hintLine, recent: `${name}沒有符合目前標記的排法；先復原或清除有疑慮的標記，再重新讀線索。` };
  const technique = deduction.technique === 'EXACT' ? '連續段加上必要空格，剛好只有一種擺法' : deduction.technique === 'OVERLAP' ? '比較每種擺法都有的位置' : '把已知格和邊界放進線索，排除不符合的擺法';
  const message = depth === 1 ? `先看${name}：${technique}。` : depth === 2 ? `${name}目前有 ${deduction.candidates} 種合法擺法。找出共同填滿或共同留空的位置，先說理由。`
    : `${name}可確定：${deduction.cells.map(cell => `${coordinate(cell.index, p.pattern.length)}${NONOGRAM_MARK_LABELS[cell.mark]}`).join('、')}。本題改為提示練習，不計分。`;
  return { ...s, hintDepth: depth, hintLine, revealedIds: depth === 3 ? [...new Set([...s.revealedIds, p.id])] : s.revealedIds, recent: `提示 ${depth}／3：${message}` };
};
export const restartNonogram = (s: NonogramSession, p: NonogramPuzzle, mode = s.mode): NonogramSession => {
  const changeMode = mode !== s.mode;
  return { ...createNonogramSession(p, mode), team: changeMode ? 'A' : s.team, scores: changeMode ? { A: 0, B: 0 } : { ...s.scores }, credited: changeMode ? {} : { ...s.credited }, revealedIds: [...s.revealedIds], revision: s.revision + 1 };
};
