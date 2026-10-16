import { Level, Team, other, random } from "../types";
import { Engine } from "../session";
export const DISTRICTS = ["茶巷", "河畔", "戲臺", "牌樓"];
export type LanternAction =
  | { type: "place"; to: number; count: number }
  | { type: "move"; from: number; to: number; count: number }
  | { type: "pass" | "next" };
export interface LanternState {
  phase: "playing" | "round_summary" | "finished";
  turn: Team;
  round: number;
  acted: number;
  reserve: Record<Team, number>;
  districts: number[][];
  values: number[][];
  totals: Record<Team, number>;
  history: {
    round: number;
    points: Record<Team, number>;
    districts: number[][];
  }[];
  message: string;
}
export function createLantern(
  seed: number,
  level: Level,
  starter: Team,
): LanternState {
  const rng = random(seed);
  return {
    phase: "playing",
    turn: starter,
    round: 1,
    acted: 0,
    reserve: { A: level === "normal" ? 8 : 6, B: level === "normal" ? 8 : 6 },
    districts: Array.from({ length: 4 }, () => [0, 0]),
    values:
      level === "normal"
        ? [
            [3, 4, 3, 4],
            [5, 2, 5, 2],
            [2, 6, 2, 6],
          ]
        : Array.from({ length: 3 }, () =>
            Array.from({ length: 4 }, () => 2 + Math.floor(rng() * 6)),
          ),
    totals: { A: 0, B: 0 },
    history: [],
    message: "四街區的三次價值都已公開。先看這次與下次，再決定放置或移動。",
  };
}
export function scoreDistricts(d: number[][], values: number[]) {
  const points = { A: 0, B: 0 };
  d.forEach(([a, b], i) => {
    if (a > b) points.A += values[i];
    else if (b > a) points.B += values[i];
    else if (a > 0) {
      points.A += Math.floor(values[i] / 2);
      points.B += Math.floor(values[i] / 2);
    }
  });
  return points;
}
export function validLantern(a: unknown): a is LanternAction {
  if (!a || typeof a !== "object") return false;
  const v = a as any;
  return (
    ["pass", "next"].includes(v.type) ||
    (["place", "move"].includes(v.type) &&
      Number.isInteger(v.to) &&
      v.to >= 0 &&
      v.to < 4 &&
      [1, 2].includes(v.count) &&
      (v.type !== "move" ||
        (Number.isInteger(v.from) && v.from >= 0 && v.from < 4)))
  );
}
export function applyLantern(s: LanternState, a: LanternAction): LanternState {
  if (!validLantern(a) || s.phase === "finished")
    throw Error("行動無效或已結束");
  if (a.type === "next") {
    if (s.phase !== "round_summary") throw Error("尚未計分");
    return {
      ...s,
      phase: s.round === 9 ? "finished" : "playing",
      round: s.round === 9 ? 9 : s.round + 1,
      acted: 0,
      message:
        s.round === 9
          ? "三次街區評比完成，請看兩隊總分。"
          : "下一次評比價值已標示，從上一回合後手開始布局。",
    };
  }
  if (s.phase !== "playing") throw Error("請先查看本次計分");
  const n = {
    ...s,
    districts: s.districts.map((d) => [...d]),
    reserve: { ...s.reserve },
    totals: { ...s.totals },
    history: [...s.history],
  };
  const i = s.turn === "A" ? 0 : 1;
  if (a.type === "place") {
    if (s.reserve[s.turn] < a.count) throw Error("預備花燈不足");
    n.reserve[s.turn] -= a.count;
    n.districts[a.to][i] += a.count;
    n.message = `${s.turn}隊在${DISTRICTS[a.to]}放入${a.count}盞花燈。`;
  } else if (a.type === "move") {
    if (a.from === a.to || s.districts[a.from][i] < a.count)
      throw Error("出發街區花燈不足或目的地相同");
    n.districts[a.from][i] -= a.count;
    n.districts[a.to][i] += a.count;
    n.message = `${s.turn}隊從${DISTRICTS[a.from]}移${a.count}盞到${DISTRICTS[a.to]}。`;
  } else n.message = `${s.turn}隊保留布局，等待一手。`;
  if (s.acted === 0) {
    n.acted = 1;
    n.turn = other(s.turn);
  } else {
    n.acted = 0;
    if (s.round % 3 === 0) {
      const points = scoreDistricts(n.districts, s.values[s.round / 3 - 1]);
      n.totals.A += points.A;
      n.totals.B += points.B;
      n.history.push({
        round: s.round,
        points,
        districts: n.districts.map((d) => [...d]),
      });
      n.phase = "round_summary";
      n.message = `第${s.round / 3}次評比：A隊 +${points.A}分，B隊 +${points.B}分。`;
    } else n.round++;
  }
  return n;
}
export function legalLantern(s: LanternState): LanternAction[] {
  if (s.phase === "finished") return [];
  if (s.phase === "round_summary") return [{ type: "next" }];
  const out: LanternAction[] = [{ type: "pass" }];
  for (let to = 0; to < 4; to++)
    for (const count of [1, 2]) {
      out.push({ type: "place", to, count });
      for (let from = 0; from < 4; from++)
        out.push({ type: "move", from, to, count });
    }
  return out.filter((a) => {
    try {
      applyLantern(s, a);
      return true;
    } catch {
      return false;
    }
  });
}
export const lanternEngine: Engine<LanternState, LanternAction> = {
  create: createLantern,
  apply: applyLantern,
  validAction: validLantern,
};
