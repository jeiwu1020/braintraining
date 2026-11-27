import { Level, other, Team } from "../types";

export interface TowerState {
  level: Level;
  size: number;
  heights: number[]; // 0..3 walkable, 4 = dome sealed
  reefs: number[];
  builders: Record<Team, number[]>;
  turn: Team;
  ply: number;
  phase: "playing" | "finished";
  result: Team | "tie" | null;
  last: string;
}

export type TowerAction = {
  type: "turn";
  from: number;
  to: number;
  build?: number;
};

export function createTowers(
  _seed: number,
  level: Level = "normal",
  starter: Team = "A",
): TowerState {
  const heights = Array<number>(25).fill(0);
  const reefs = level === "advanced" ? [7, 17] : [];
  if (level === "advanced") {
    heights[11] = 1;
    heights[13] = 1;
  }
  return {
    level,
    size: 5,
    heights,
    reefs,
    builders: { A: [6, 18], B: [8, 16] },
    turn: starter,
    ply: 0,
    phase: "playing",
    result: null,
    last: "建築師就位！先移動一格（最多爬高 1 層），再於相鄰格加蓋 1 層。",
  };
}

export function adjacentCells(idx: number): number[] {
  const x0 = idx % 5;
  const y0 = Math.floor(idx / 5);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const x = x0 + dx;
      const y = y0 + dy;
      if (x >= 0 && x < 5 && y >= 0 && y < 5) out.push(y * 5 + x);
    }
  }
  return out;
}

export function towerOccupant(state: TowerState, idx: number): Team | null {
  if (state.builders.A.includes(idx)) return "A";
  if (state.builders.B.includes(idx)) return "B";
  return null;
}

export function moveTargets(state: TowerState, from: number): number[] {
  const hFrom = state.heights[from];
  return adjacentCells(from).filter(
    (c) =>
      !state.reefs.includes(c) &&
      towerOccupant(state, c) === null &&
      state.heights[c] < 4 &&
      state.heights[c] <= hFrom + 1,
  );
}

export function buildTargets(state: TowerState, from: number, to: number): number[] {
  if (state.heights[to] === 3) return [];
  return adjacentCells(to).filter(
    (c) =>
      !state.reefs.includes(c) &&
      state.heights[c] < 4 &&
      (c === from || towerOccupant(state, c) === null),
  );
}

export function legalTowerActions(state: TowerState, team: Team = state.turn): TowerAction[] {
  if (state.phase !== "playing") return [];
  const actions: TowerAction[] = [];
  for (const from of state.builders[team]) {
    for (const to of moveTargets(state, from)) {
      if (state.heights[to] === 3) {
        actions.push({ type: "turn", from, to });
      } else {
        for (const build of buildTargets(state, from, to)) {
          actions.push({ type: "turn", from, to, build });
        }
      }
    }
  }
  return actions;
}

export function towerCoord(idx: number): string {
  return `${String.fromCharCode(65 + (idx % 5))}${Math.floor(idx / 5) + 1}`;
}

export function validTowerAction(a: unknown): a is TowerAction {
  if (!a || typeof a !== "object") return false;
  const x = a as TowerAction;
  if (x.type !== "turn") return false;
  if (!Number.isInteger(x.from) || x.from < 0 || x.from >= 25) return false;
  if (!Number.isInteger(x.to) || x.to < 0 || x.to >= 25) return false;
  if (x.build !== undefined && (!Number.isInteger(x.build) || x.build < 0 || x.build >= 25))
    return false;
  return true;
}

export function applyTowers(state: TowerState, action: TowerAction): TowerState {
  if (state.phase !== "playing") throw new Error("對局已結束");
  if (!validTowerAction(action)) throw new Error("無效操作");
  const { turn } = state;
  if (!state.builders[turn].includes(action.from)) throw new Error("非己方建築師");
  if (!moveTargets(state, action.from).includes(action.to)) throw new Error("無法移動到該格");

  const builders: Record<Team, number[]> = {
    A: state.builders.A.map((p) => (p === action.from && turn === "A" ? action.to : p)),
    B: state.builders.B.map((p) => (p === action.from && turn === "B" ? action.to : p)),
  };

  if (state.heights[action.to] === 3) {
    return {
      ...state,
      builders,
      ply: state.ply + 1,
      phase: "finished",
      result: turn,
      last: `${turn}隊建築師從 ${towerCoord(action.from)} 登上 3F 高塔 ${towerCoord(action.to)}，搶先登頂獲勝！`,
    };
  }

  if (action.build === undefined || !buildTargets(state, action.from, action.to).includes(action.build)) {
    throw new Error("無效加蓋位置");
  }
  const heights = [...state.heights];
  heights[action.build] += 1;
  const newLevel = heights[action.build];
  const buildLabel = newLevel === 4 ? "封上穹頂" : `蓋至 ${newLevel}F`;

  const next: TowerState = {
    ...state,
    heights,
    builders,
    turn: other(turn),
    ply: state.ply + 1,
    last: `${turn}隊移至 ${towerCoord(action.to)}，並將 ${towerCoord(action.build)} ${buildLabel}。`,
  };

  if (legalTowerActions(next, next.turn).length === 0) {
    return {
      ...next,
      phase: "finished",
      result: turn,
      last: `${next.last} ${next.turn}隊已無路可走，${turn}隊獲勝！`,
    };
  }
  if (next.ply >= 60) {
    return {
      ...next,
      phase: "finished",
      result: "tie",
      last: `${next.last} 雙方纏鬥 60 手未登頂，平手！`,
    };
  }
  return next;
}
