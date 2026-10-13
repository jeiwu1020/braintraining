import type { TrafficCar } from './facilitatedPuzzleRules';

export const TRAFFIC_BOARD_SIZE = 6;
export const TRAFFIC_EXIT_ROW = 2;
export type TrafficTier = 'BEGINNER' | 'STANDARD' | 'CHALLENGE';
export interface TrafficMove { carId: string; distance: number }
export type TrafficMode = 'COOP' | 'TEAMS';
export type TrafficScores = { A: number; B: number };
const cloneCars = (cars: readonly TrafficCar[]): TrafficCar[] => cars.map(car => ({ ...car }));
const cellsFor = (car: TrafficCar): number[] => Array.from({ length: car.length }, (_, offset) =>
  (car.row + (car.axis === 'V' ? offset : 0)) * TRAFFIC_BOARD_SIZE + car.col + (car.axis === 'H' ? offset : 0));

export function validateTrafficBoard(cars: readonly TrafficCar[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const occupied = new Set<number>();
  const targets = cars.filter(car => car.target);
  if (targets.length !== 1 || targets[0]?.id !== 'X' || targets[0]?.axis !== 'H' || targets[0]?.row !== TRAFFIC_EXIT_ROW || targets[0]?.length !== 2) {
    errors.push('目標必須是第 3 列、橫向兩格的 X 車。');
  }
  for (const car of cars) {
    if (!car.id || ids.has(car.id)) errors.push('車輛代號不可空白或重複。');
    ids.add(car.id);
    const validShape = Number.isInteger(car.row) && Number.isInteger(car.col) && (car.length === 2 || car.length === 3)
      && (car.axis === 'H' || car.axis === 'V');
    if (!validShape) { errors.push(`${car.id} 車形不合法。`); continue; }
    if (car.row < 0 || car.col < 0 || car.row + (car.axis === 'V' ? car.length : 1) > TRAFFIC_BOARD_SIZE
      || car.col + (car.axis === 'H' ? car.length : 1) > TRAFFIC_BOARD_SIZE) errors.push(`${car.id} 車超出棋盤。`);
    for (const cell of cellsFor(car)) {
      if (occupied.has(cell)) errors.push(`${car.id} 車與其他車重疊。`);
      occupied.add(cell);
    }
  }
  return errors;
}

export const isTrafficSolved = (cars: readonly TrafficCar[]): boolean => cars.some(car =>
  car.target && car.axis === 'H' && car.row === TRAFFIC_EXIT_ROW && car.col + car.length === TRAFFIC_BOARD_SIZE);

/** Every yielded move is a complete legal slide. Intermediate squares are checked. */
export function legalTrafficMoves(cars: readonly TrafficCar[]): TrafficMove[] {
  const occupied = new Set(cars.flatMap(cellsFor));
  const moves: TrafficMove[] = [];
  for (const car of cars) {
    const own = new Set(cellsFor(car));
    const position = car.axis === 'H' ? car.col : car.row;
    for (const sign of [-1, 1]) {
      for (let distance = sign; ; distance += sign) {
        const nextPosition = position + distance;
        if (nextPosition < 0 || nextPosition + car.length > TRAFFIC_BOARD_SIZE) break;
        const edge = nextPosition + (sign > 0 ? car.length - 1 : 0);
        const cell = car.axis === 'H' ? car.row * TRAFFIC_BOARD_SIZE + edge : edge * TRAFFIC_BOARD_SIZE + car.col;
        if (occupied.has(cell) && !own.has(cell)) break;
        moves.push({ carId: car.id, distance });
      }
    }
  }
  return moves;
}

const applyLegalMove = (cars: readonly TrafficCar[], move: TrafficMove): TrafficCar[] => cars.map(car => car.id === move.carId
  ? { ...car, row: car.row + (car.axis === 'V' ? move.distance : 0), col: car.col + (car.axis === 'H' ? move.distance : 0) }
  : { ...car });

export function tryTrafficMove(cars: readonly TrafficCar[], move: TrafficMove): TrafficCar[] | null {
  if (!Number.isInteger(move.distance) || move.distance === 0 || Math.abs(move.distance) >= TRAFFIC_BOARD_SIZE || validateTrafficBoard(cars).length > 0) return null;
  if (!legalTrafficMoves(cars).some(candidate => candidate.carId === move.carId && candidate.distance === move.distance)) return null;
  return applyLegalMove(cars, move);
}

export interface TrafficSolution {
  status: 'SOLVED' | 'UNSOLVABLE' | 'LIMIT' | 'INVALID';
  moves: TrafficMove[];
  visited: number;
}
export interface TrafficSolveOptions { maxStates?: number; forbidDirectionChanges?: boolean }

/** Breadth-first search counts one car slide as one move, regardless of its distance. */
export function solveTrafficJam(cars: readonly TrafficCar[], options: TrafficSolveOptions = {}): TrafficSolution {
  if (validateTrafficBoard(cars).length) return { status: 'INVALID', moves: [], visited: 0 };
  const maxStates = options.maxStates ?? 100_000;
  type Node = { cars: TrafficCar[]; parent: number; move: TrafficMove | null; directions: number[] };
  const nodes: Node[] = [{ cars: cloneCars(cars), parent: -1, move: null, directions: cars.map(() => 0) }];
  const keyFor = (nextCars: readonly TrafficCar[], directions: readonly number[]) => nextCars.map(car => car.axis === 'H' ? car.col : car.row).join(',')
    + (options.forbidDirectionChanges ? `|${directions.join(',')}` : '');
  const seen = new Set([keyFor(nodes[0].cars, nodes[0].directions)]);
  for (let head = 0; head < nodes.length; head += 1) {
    const node = nodes[head];
    if (isTrafficSolved(node.cars)) {
      const moves: TrafficMove[] = [];
      for (let current = head; nodes[current].parent >= 0; current = nodes[current].parent) moves.push(nodes[current].move!);
      return { status: 'SOLVED', moves: moves.reverse(), visited: seen.size };
    }
    for (const move of legalTrafficMoves(node.cars)) {
      const carIndex = node.cars.findIndex(car => car.id === move.carId);
      const sign = Math.sign(move.distance);
      if (options.forbidDirectionChanges && node.directions[carIndex] !== 0 && node.directions[carIndex] !== sign) continue;
      const directions = [...node.directions];
      directions[carIndex] = sign;
      const nextCars = applyLegalMove(node.cars, move);
      const key = keyFor(nextCars, directions);
      if (seen.has(key)) continue;
      if (seen.size >= maxStates) return { status: 'LIMIT', moves: [], visited: seen.size };
      seen.add(key);
      nodes.push({ cars: nextCars, parent: head, move, directions });
    }
  }
  return { status: 'UNSOLVABLE', moves: [], visited: seen.size };
}

export function describeTrafficMove(cars: readonly TrafficCar[], move: TrafficMove): string {
  const car = cars.find(candidate => candidate.id === move.carId);
  const direction = car?.axis === 'H' ? (move.distance > 0 ? '右' : '左') : (move.distance > 0 ? '下' : '上');
  return `${move.carId} 車向${direction} ${Math.abs(move.distance)} 格`;
}

export interface TrafficSnapshot {
  cars: TrafficCar[];
  activeTeam: 'A' | 'B';
  scores: TrafficScores;
  finished: boolean;
  steps: number;
  squaresMoved: number;
  selectedCarId: string;
  pendingMove: TrafficMove | null;
  recentAction: string;
  hintDepth: number;
}
export interface TrafficSession extends TrafficSnapshot {
  mode: TrafficMode;
  /** Knowledge persists through undo and replay of this question. */
  solutionRevealed: boolean;
  revision: number;
  history: TrafficSnapshot[];
}

export function createTrafficSession(cars: readonly TrafficCar[], mode: TrafficMode, scores: TrafficScores = { A: 0, B: 0 }): TrafficSession {
  if (validateTrafficBoard(cars).length) throw new Error('無法開始：塞車盤面不合法。');
  return {
    cars: cloneCars(cars), mode, activeTeam: 'A', scores: { ...scores }, finished: isTrafficSolved(cars), steps: 0,
    squaresMoved: 0, selectedCarId: 'X', pendingMove: null, revision: 0, history: [], hintDepth: 0, solutionRevealed: false,
    recentAction: '先報車號、方向與格數，預覽後再確認。',
  };
}

export function prepareTrafficMove(state: TrafficSession, move: TrafficMove): TrafficSession {
  if (state.finished || !state.cars.some(car => car.id === move.carId)) return state;
  return { ...state, selectedCarId: move.carId, pendingMove: { ...move } };
}

export function commitTrafficMove(state: TrafficSession, expectedRevision = state.revision): TrafficSession {
  if (state.finished || !state.pendingMove || expectedRevision !== state.revision) return state;
  const nextCars = tryTrafficMove(state.cars, state.pendingMove);
  if (!nextCars) return state;
  const { mode, revision, history, solutionRevealed, ...snapshot } = state;
  const finished = isTrafficSolved(nextCars);
  const scores = { ...state.scores };
  if (finished && mode === 'TEAMS' && !solutionRevealed) scores[state.activeTeam] += 1;
  return {
    ...state, cars: nextCars, scores, finished, steps: state.steps + 1,
    squaresMoved: state.squaresMoved + Math.abs(state.pendingMove.distance),
    activeTeam: mode === 'TEAMS' && !finished ? (state.activeTeam === 'A' ? 'B' : 'A') : state.activeTeam,
    pendingMove: null, hintDepth: 0, revision: revision + 1,
    history: [...history, { ...snapshot, cars: cloneCars(snapshot.cars), scores: { ...snapshot.scores }, pendingMove: { ...state.pendingMove } }],
    recentAction: `${mode === 'TEAMS' ? `${state.activeTeam} 組：` : ''}${describeTrafficMove(state.cars, state.pendingMove)}。${finished ? `X 車抵達出口！${solutionRevealed ? '提示練習，本題不計分。' : ''}` : ''}`,
  };
}

export function undoTrafficMove(state: TrafficSession): TrafficSession {
  const snapshot = state.history[state.history.length - 1];
  if (!snapshot) return state;
  return {
    ...state, ...snapshot, cars: cloneCars(snapshot.cars), scores: { ...snapshot.scores },
    pendingMove: snapshot.pendingMove ? { ...snapshot.pendingMove } : null,
    history: state.history.slice(0, -1), revision: state.revision + 1,
    recentAction: '已復原整步；步數、輪組與完成分數一起還原。',
  };
}


/** Observation hints are reversible; displaying an exact move creates lasting question knowledge. */
export function requestTrafficHint(state: TrafficSession, initialHints: readonly string[] = []): TrafficSession {
  if (state.finished) return state;
  const depth = Math.min(state.hintDepth + 1, 3);
  const solution = solveTrafficJam(state.cars);
  const nextMove = solution.status === 'SOLVED' ? solution.moves[0] : undefined;
  let message: string;
  let revealed = false;
  if (depth === 3 && nextMove) {
    message = `示範下一步：${describeTrafficMove(state.cars, nextMove)}。請先預覽再確認；本題改為提示練習，不計分。`;
    revealed = true;
  } else if (!nextMove) {
    message = solution.status === 'LIMIT' ? '這個局面的提示搜尋尚未完成；可先復原最近一步再討論。' : '目前沒有找到出口路線，可復原或重試本題。';
  } else if (state.steps === 0 && initialHints[depth - 1]) {
    message = initialHints[depth - 1];
  } else if (depth === 1) {
    const target = state.cars.find(car => car.target)!;
    const blockers = state.cars.filter(car => car.id !== target.id && cellsFor(car).some(cell => Math.floor(cell / TRAFFIC_BOARD_SIZE) === TRAFFIC_EXIT_ROW && cell % TRAFFIC_BOARD_SIZE >= target.col + target.length));
    message = blockers.length ? `沿 X 車右方看出口通道，現在還有 ${blockers.map(car => car.id).join('、')} 車。請討論它們需要哪一段空位。` : 'X 車右方已沒有阻擋，請比較它與出口的距離。';
  } else {
    message = `請觀察 ${nextMove.carId} 車沿車身方向可以到哪裡，再說明移動後哪些路會變空。`;
  }
  return { ...state, hintDepth: depth, solutionRevealed: state.solutionRevealed || revealed, recentAction: `提示 ${depth}：${message}` };
}

export interface TrafficDragProjection { distance: number; offsetPx: number }

/** Clamp continuous dragging to the unobstructed lane, then round to the nearest grid stop. */
export function previewTrafficDrag(cars: readonly TrafficCar[], carId: string, axisDeltaPx: number, cellSizePx: number): TrafficDragProjection {
  if (!Number.isFinite(axisDeltaPx) || !Number.isFinite(cellSizePx) || cellSizePx <= 0 || validateTrafficBoard(cars).length > 0) return { distance: 0, offsetPx: 0 };
  const distances = legalTrafficMoves(cars).filter(move => move.carId === carId).map(move => move.distance);
  const minimum = Math.min(0, ...distances);
  const maximum = Math.max(0, ...distances);
  const offsetPx = Math.min(maximum * cellSizePx, Math.max(minimum * cellSizePx, axisDeltaPx));
  const rounded = Math.round(Math.abs(offsetPx) / cellSizePx);
  return { distance: rounded === 0 ? 0 : Math.sign(offsetPx) * rounded, offsetPx };
}

/** Buttons and pointer release share one atomic, revision-checked transaction. */
export function commitTrafficCommand(state: TrafficSession, move: TrafficMove | null, expectedRevision: number): TrafficSession {
  if (!move || state.finished || state.revision !== expectedRevision || !tryTrafficMove(state.cars, move)) return state;
  return commitTrafficMove(prepareTrafficMove(state, move), expectedRevision);
}
