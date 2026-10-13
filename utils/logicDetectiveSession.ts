import type { LogicPuzzle } from '../data/logicDetectivePuzzles';
import { applyLogicDecision, describeLogicClue, logicCoordinate, satisfiesLogicClue, solveLogicPuzzle, type LogicDecision, type LogicDerivation, type LogicMarks } from './logicDetectiveRules';

export interface LogicSnapshot {
  mode: 'COOP' | 'TEAMS'; team: 'A' | 'B'; scores: { A: number; B: number };
  marks: LogicMarks; selection: LogicDecision | null;
  hypothesis: { candidate: number | null; clue: number | null };
  hintLevel: number; derived: LogicDerivation[]; finished: boolean; recent: string;
  /** Includes automatic deductions, so clearing and re-entering one cannot earn points. */
  credited: string[];
}
export interface LogicSession extends LogicSnapshot {
  history: LogicSnapshot[];
  /** Revealed reasoning is knowledge: it is never part of a reversible snapshot. */
  revealed: string[];
}
const keyOf = (puzzle: LogicPuzzle, action: LogicDecision) => `${puzzle.id}:${action.row},${action.col}:${action.mark}`;
const snapshotOf = ({ history: _history, revealed: _revealed, ...snapshot }: LogicSession): LogicSnapshot => snapshot;
const switchTeam = (state: LogicSession) => state.mode === 'TEAMS' ? state.team === 'A' ? 'B' : 'A' : state.team;
const prompt = (puzzle: LogicPuzzle) => puzzle.candidates
  ? '比較甲、乙兩案，選要排除的一案與有矛盾的線索，再確認推論。'
  : '先讀線索，選確認、排除或清除，再點一格準備推論；確認後才換組。';

export const createLogicSession = (puzzle: LogicPuzzle, mode: 'COOP' | 'TEAMS' = 'COOP', previous?: LogicSession): LogicSession => ({
  mode, team: previous?.mode === mode ? previous.team : 'A', scores: previous?.mode === mode ? { ...previous.scores } : { A: 0, B: 0 },
  marks: {}, selection: null, hypothesis: { candidate: null, clue: null },
  hintLevel: 0, derived: [], finished: false, recent: prompt(puzzle), history: [],
  credited: previous?.mode === mode ? [...previous.credited] : [], revealed: [...(previous?.revealed ?? [])],
});

export const prepareLogicDecision = (state: LogicSession, puzzle: LogicPuzzle, decision: LogicDecision): LogicSession => {
  if (state.finished || puzzle.candidates || !Number.isInteger(decision.row) || !Number.isInteger(decision.col) || decision.row < 0 || decision.col < 0 || decision.row >= puzzle.people.length || decision.col >= puzzle.choices.length) return state;
  const action = decision.mark === 'YES' ? '確認配對' : decision.mark === 'NO' ? '排除配對' : '清除標記';
  return { ...state, selection: decision, recent: `準備${action}：${logicCoordinate(decision.row,decision.col)} ${puzzle.people[decision.row]}／${puzzle.choices[decision.col]}。請先說明理由。` };
};

export const clearLogicDraft = (state: LogicSession): LogicSession => ({
  ...state, selection: null, hypothesis: { candidate: null, clue: null }, recent: '已取消本次選取，盤面和組別不變。',
});

export const confirmLogicDecision = (state: LogicSession, puzzle: LogicPuzzle, autoOrganize: boolean): LogicSession => {
  if (state.finished || !state.selection || puzzle.candidates) return state;
  const decision = state.selection;
  const batch = applyLogicDecision(state.marks, decision, puzzle.people.length, autoOrganize);
  if (!batch.changed) return { ...state, selection: null, recent: batch.error ?? '這格已是同一標記，沒有加分或換組。' };
  if (!solveLogicPuzzle(puzzle,batch.marks).length) return { ...state, recent: '這個判斷與線索無法同時成立。請重新核對理由，尚未落筆或換組。' };
  const isNew = decision.mark !== 'UNKNOWN' && !state.credited.includes(keyOf(puzzle,decision));
  const assisted = state.revealed.includes(puzzle.id);
  const scores = state.mode === 'TEAMS' && isNew && !assisted ? { ...state.scores, [state.team]: state.scores[state.team] + 1 } : state.scores;
  const finished = puzzle.solution.every((col,row) => batch.marks[`${row},${col}`] === 'YES');
  const credited = decision.mark === 'UNKNOWN' ? state.credited : [...new Set([...state.credited, keyOf(puzzle,decision), ...batch.derived.map(action => keyOf(puzzle,action))])];
  return {
    ...state, history: [...state.history,snapshotOf(state)], marks: batch.marks, derived: batch.derived,
    selection: null, scores, credited, finished, hintLevel: 0,
    team: isNew ? switchTeam(state) : state.team,
    recent: `${state.mode === 'TEAMS' ? `${state.team} 組：` : ''}${logicCoordinate(decision.row,decision.col)} ${decision.mark === 'YES' ? '確認' : decision.mark === 'NO' ? '排除' : '清除'}。${batch.derived.length ? `自動整理 ${batch.derived.length} 格，理由列在下方。` : ''}${!isNew ? '這是標記修正，不加分、不換組。' : assisted ? '提示練習，不計分。' : state.mode === 'TEAMS' ? '本次新推論得 1 分。' : ''}${finished ? '全部配對完成！' : ''}`,
  };
};

export const prepareLogicHypothesis = (state: LogicSession, puzzle: LogicPuzzle, candidate: number | null, clue: number | null): LogicSession => {
  if (state.finished || !puzzle.candidates || (candidate !== null && !puzzle.candidates[candidate]) || (clue !== null && !puzzle.clues[clue])) return state;
  return { ...state, hypothesis: { candidate, clue }, recent: `準備排除${candidate === null ? '哪一案' : candidate === 0 ? '甲案' : '乙案'}；${clue === null ? '請選有矛盾的線索。' : `請說明與第 ${clue + 1} 條的矛盾，再確認推論。`}` };
};

export const confirmLogicHypothesis = (state: LogicSession, puzzle: LogicPuzzle): LogicSession => {
  const { candidate, clue } = state.hypothesis;
  if (state.finished || !puzzle.candidates || candidate === null || clue === null) return state;
  const rejected = puzzle.candidates[candidate]; const evidence = puzzle.clues[clue];
  if (!rejected || !evidence || satisfiesLogicClue(rejected,evidence)) return { ...state, recent: '所選線索沒有與這一案矛盾。請比較人物的實際配對，尚未換組或計分。' };
  const remaining = puzzle.candidates[1-candidate];
  if (!remaining || !puzzle.clues.every(item => satisfiesLogicClue(remaining,item))) return { ...state, recent: '另一案仍需核對全部線索，尚未完成。' };
  const marks: LogicMarks = {};
  remaining.forEach((choice,row) => puzzle.choices.forEach((_,col) => { marks[`${row},${col}`] = choice === col ? 'YES' : 'NO'; }));
  const creditKey = `${puzzle.id}:hypothesis`;
  const assisted = state.revealed.includes(puzzle.id); const isNew = !state.credited.includes(creditKey);
  return {
    ...state, history: [...state.history,snapshotOf(state)], marks, finished: true,
    scores: state.mode === 'TEAMS' && !assisted && isNew ? { ...state.scores, [state.team]: state.scores[state.team] + 1 } : state.scores,
    credited: [...new Set([...state.credited,creditKey])], team: isNew ? switchTeam(state) : state.team,
    hypothesis: { candidate: null, clue: null }, hintLevel: 0,
    recent: `排除${candidate === 0 ? '甲' : '乙'}案：第 ${clue+1} 條「${describeLogicClue(puzzle,evidence)}」與這一案矛盾；另一案符合全部線索，配對完成。${assisted ? '提示練習，不計分。' : !isNew ? '已完成過的推論，不重複計分。' : state.mode === 'TEAMS' ? '本次新推論得 1 分。' : ''}`,
  };
};

/** Prefer authored explanations, then an unmarked direct clue. Later hints cite a
 * smallest sufficient set of clues, verified against all remaining permutations. */
const remainingHint = (state: LogicSession, puzzle: LogicPuzzle): Pick<LogicPuzzle, 'observation' | 'inference' | 'demonstration'> => {
  const first = puzzle.demonstration;
  if (puzzle.candidates || state.marks[`${first.row},${first.col}`] !== first.mark) return puzzle;
  for (let index = 0; index < puzzle.clues.length; index += 1) {
    const clue = puzzle.clues[index];
    if (clue.kind !== 'MATCH') continue;
    const mark = clue.relation === 'IS' ? 'YES' : 'NO';
    if (state.marks[`${clue.person},${clue.choice}`] === mark) continue;
    const reason = `第 ${index + 1} 條說「${describeLogicClue(puzzle,clue)}」所以 ${logicCoordinate(clue.person,clue.choice)} 可以${mark === 'YES' ? '確認' : '排除'}。`;
    return {
      observation: `看看第 ${index + 1} 條，這句話對應的格子還沒標記。它是肯定還是否定？`,
      inference: `把第 ${index + 1} 條的人物與選項對到配對表，再比較已畫好的圈與叉。${describeLogicClue(puzzle,clue)}`,
      demonstration: { row: clue.person, col: clue.choice, mark, reason },
    };
  }
  const solution = solveLogicPuzzle(puzzle,state.marks)[0];
  const row = solution?.findIndex((col,index) => state.marks[`${index},${col}`] !== 'YES') ?? -1;
  if (row < 0) return puzzle;
  const col = solution[row];
  const subsets = Array.from({ length: 2 ** puzzle.clues.length }, (_,mask) => puzzle.clues.map((_,index) => index).filter(index => mask & (1 << index))).sort((a,b) => a.length-b.length);
  const sufficient = subsets.find(indexes => {
    const candidates = solveLogicPuzzle({ people: puzzle.people, clues: indexes.map(index => puzzle.clues[index]) },state.marks);
    return candidates.length > 0 && candidates.every(candidate => candidate[row] === col);
  }) ?? puzzle.clues.map((_,index) => index);
  const sources = sufficient.length ? `第 ${sufficient.map(index => index+1).join('、')} 條與目前標記` : '目前標記';
  const reason = `合看${sources}和一對一限制，${puzzle.people[row]}的其餘選項都無法成立；因此 ${logicCoordinate(row,col)} ${puzzle.choices[col]}可確認。`;
  return {
    observation: `先觀察${sources}，比較${puzzle.people[row]}還有哪些可能選項。`,
    inference: `保留${sources}，把${puzzle.people[row]}剩餘的選項逐一代入；有沒有選項會讓某個人物無處配對，或違反線索？`,
    demonstration: { row,col,mark: 'YES',reason },
  };
};

export const requestLogicHint = (state: LogicSession, puzzle: LogicPuzzle): LogicSession => {
  if (state.finished) return state;
  const hintLevel = Math.min(3,state.hintLevel + 1);
  const hint = remainingHint(state,puzzle);
  if (hintLevel === 1) return { ...state, hintLevel, recent: `提示 1／3・觀察：${hint.observation}` };
  // The second hint already explains specific reasoning; conservatively treat the
  // whole puzzle as assisted from this point, including after reset or revisits.
  const revealed = [...new Set([...state.revealed,puzzle.id])];
  if (hintLevel === 2) return { ...state, hintLevel, revealed, recent: `提示 2／3・推論：${hint.inference} 本題之後為提示練習，不計分。` };
  if (puzzle.candidates) {
    const candidate = puzzle.candidates.findIndex(assignment => !puzzle.clues.every(clue => satisfiesLogicClue(assignment,clue)));
    const clue = puzzle.clues.findIndex(item => !satisfiesLogicClue(puzzle.candidates![candidate],item));
    return { ...state, hintLevel, revealed, hypothesis: { candidate, clue }, recent: `提示 3／3・示範：${puzzle.demonstration.reason} 已選好假設與線索，請再口述並確認；本題練習不計分。` };
  }
  return { ...state, hintLevel, revealed, selection: { ...hint.demonstration }, recent: `提示 3／3・示範：${hint.demonstration.reason} 已準備標記，確認後才落筆；本題練習不計分。` };
};

export const undoLogicDecision = (state: LogicSession): LogicSession => {
  const previous = state.history[state.history.length - 1];
  return previous ? { ...previous, revealed: state.revealed, history: state.history.slice(0,-1) } : state;
};
