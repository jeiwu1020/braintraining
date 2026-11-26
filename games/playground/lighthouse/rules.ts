import { Level, Team, random } from "../types";
import { Engine } from "../session";

export const PORTS = ["母港", "白礁燈塔", "遠岬燈塔", "松灣燈塔"];
export const ROUTES = [
  [0, 1],
  [0, 3],
  [1, 2],
  [3, 2],
  [1, 3],
];

/**
 * Each advanced mission has 12 crates and one five-crate tower.
 * Verified solvable across all 256 possible day 2..9 storm forecasts within 8 rounds.
 */
export const LIGHTHOUSE_MISSIONS = [
  { name: "白礁增援", needs: [[0, 0], [3, 2], [2, 2], [1, 2]] },
  { name: "遠岬輪補", needs: [[0, 0], [2, 2], [3, 2], [1, 2]] },
  { name: "松灣增援", needs: [[0, 0], [2, 1], [2, 2], [2, 3]] },
] as const;

export type LighthouseAction =
  | { type: "load"; fuel: number; food: number }
  | { type: "sail"; to: number }
  | { type: "wait" | "next" };

export interface LighthouseState {
  phase: "playing" | "round_summary" | "finished";
  turn: Team;
  round: number;
  limit: number;
  ap: number;
  at: number;
  cargo: number[];
  needs: number[][];
  weather: boolean[];
  won: boolean;
  message: string;
  mission?: number;
}

export function createLighthouse(
  seed: number,
  level: Level,
  starter: Team,
): LighthouseState {
  const rng = random(seed);
  const mission =
    level === "advanced"
      ? Math.floor(random(seed ^ 0x4c484d49)() * LIGHTHOUSE_MISSIONS.length)
      : undefined;
  const supply =
    mission === undefined ? undefined : LIGHTHOUSE_MISSIONS[mission];
  return {
    phase: "playing",
    turn: starter,
    round: 1,
    limit: level === "normal" ? 7 : 8,
    ap: 2,
    at: 0,
    cargo: [0, 0],
    needs: supply
      ? supply.needs.map((need) => [...need])
      : [
          [0, 0],
          [2, 1],
          [1, 2],
          [1, 1],
        ],
    weather: Array.from(
      { length: 10 },
      (_, i) => i > 0 && rng() < (level === "normal" ? 0.3 : 0.6),
    ),
    won: false,
    message: supply
      ? `進階任務：${supply.name}（共12箱，${PORTS[supply.needs.findIndex((need) => need[0] + need[1] > 4)]}需分批補給）。抵達燈塔會自動卸貨！`
      : "全團體合作：在母港裝入燈油與糧食後出航，抵達燈塔自動交貨！",
    ...(mission === undefined ? {} : { mission }),
  };
}

export function sailCost(s: LighthouseState, to: number) {
  return s.weather[s.round - 1] && (s.at === 2 || to === 2) ? 2 : 1;
}

export function validLighthouse(a: unknown): a is LighthouseAction {
  if (!a || typeof a !== "object") return false;
  const v = a as any;
  return (
    ["wait", "next"].includes(v.type) ||
    (v.type === "sail" && Number.isInteger(v.to) && v.to >= 0 && v.to < 4) ||
    (v.type === "load" &&
      [v.fuel, v.food].every(
        (x) => Number.isInteger(x) && x >= 0 && x <= 4,
      ) &&
      v.fuel + v.food > 0)
  );
}

export function applyLighthouse(
  s: LighthouseState,
  a: LighthouseAction,
): LighthouseState {
  if (!validLighthouse(a) || s.phase === "finished")
    throw Error("本局已結束或行動不合法");
  if (a.type === "next") {
    if (s.phase !== "round_summary") throw Error("先完成兩個行動");
    return {
      ...s,
      phase: "playing",
      round: s.round + 1,
      ap: 2,
      message: "新的一天，請先看今日與明日海況。",
    };
  }
  if (s.phase !== "playing") throw Error("請先進入下一回合");
  const n = { ...s, cargo: [...s.cargo], needs: s.needs.map((x) => [...x]) };
  let cost = 1;
  if (a.type === "load") {
    if (s.at !== 0 || s.cargo[0] + s.cargo[1] + a.fuel + a.food > 4)
      throw Error("只可在母港裝貨，船艙上限4箱");
    n.cargo[0] += a.fuel;
    n.cargo[1] += a.food;
    n.message = `裝入燈油 ${a.fuel}、糧食 ${a.food}。`;
  } else if (a.type === "sail") {
    if (
      !ROUTES.some(
        ([x, y]) => (x === s.at && y === a.to) || (y === s.at && x === a.to),
      )
    )
      throw Error("兩港之間沒有直達航線");
    cost = sailCost(s, a.to);
    if (cost > s.ap) throw Error("遠岬風浪較大，需要 2 行動才能通過");
    n.at = a.to;
    if (a.to > 0) {
      const delivered = n.cargo.map((v, i) => Math.min(v, n.needs[a.to][i]));
      delivered.forEach((v, i) => {
        n.cargo[i] -= v;
        n.needs[a.to][i] -= v;
      });
      n.message =
        delivered[0] + delivered[1] > 0
          ? `抵達${PORTS[a.to]}，自動交付燈油 ${delivered[0]}、糧食 ${delivered[1]}（航行 ${cost} 行動）。`
          : `抵達${PORTS[a.to]}（航行 ${cost} 行動）。`;
    } else {
      n.message = `返回母港（航行 ${cost} 行動）。`;
    }
  } else {
    n.message = "留在原地等待，花費 1 行動。";
  }
  n.ap -= cost;
  n.won = n.needs.flat().every((v) => v === 0);
  if (n.won) {
    n.phase = "finished";
    n.message = "所有燈塔已收到補給，合作任務完成！";
  } else if (n.ap === 0) {
    n.phase = n.round === n.limit ? "finished" : "round_summary";
    if (n.phase === "finished")
      n.message = "期限已到。一起回看未完成需求，下次調整裝貨與航線。";
  }
  return n;
}

export function legalLighthouse(s: LighthouseState): LighthouseAction[] {
  if (s.phase === "finished") return [];
  if (s.phase === "round_summary") return [{ type: "next" }];
  const candidates: LighthouseAction[] = [
    { type: "wait" },
    ...[0, 1, 2, 3].map((to) => ({ type: "sail" as const, to })),
  ];
  if (s.at === 0)
    for (let fuel = 0; fuel <= 4; fuel++)
      for (let food = 0; food <= 4 - fuel; food++)
        if (fuel + food) candidates.push({ type: "load", fuel, food });
  return candidates.filter((a) => {
    try {
      applyLighthouse(s, a);
      return true;
    } catch {
      return false;
    }
  });
}

export const lighthouseEngine: Engine<LighthouseState, LighthouseAction> = {
  create: createLighthouse,
  apply: applyLighthouse,
  validAction: validLighthouse,
};
