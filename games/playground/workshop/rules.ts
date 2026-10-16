import { Level, Team, other } from "../types";
import { Engine } from "../session";
export const STATIONS = ["wood", "metal", "craft", "upgrade", "ship"] as const;
export type Station = (typeof STATIONS)[number];
export const STATION_NAMES: Record<Station, string> = {
  wood: "木料站",
  metal: "金屬站",
  craft: "加工臺",
  upgrade: "升級坊",
  ship: "出貨埠",
};
export type WorkshopAction =
  | { type: "use"; station: Station; count: number }
  | { type: "rest" }
  | { type: "next" };
export interface Stock {
  wood: number;
  metal: number;
  goods: number;
  level: number;
  score: number;
}
export interface WorkshopState {
  phase: "playing" | "round_summary" | "finished";
  turn: Team;
  first: Team;
  round: number;
  limit: number;
  perTeam: number;
  workers: Record<Team, number>;
  stock: Record<Team, Stock>;
  occupied: Record<Station, Team | null>;
  message: string;
}
const emptyStations = (): Record<Station, Team | null> => ({
  wood: null,
  metal: null,
  craft: null,
  upgrade: null,
  ship: null,
});
export function createWorkshop(
  _seed: number,
  level: Level,
  starter: Team,
): WorkshopState {
  const stock = () => ({ wood: 1, metal: 1, goods: 0, level: 0, score: 0 }),
    perTeam = level === "normal" ? 2 : 3;
  return {
    phase: "playing",
    turn: starter,
    first: starter,
    round: 1,
    limit: level === "normal" ? 5 : 6,
    perTeam,
    workers: { A: perTeam, B: perTeam },
    stock: { A: stock(), B: stock() },
    occupied: emptyStations(),
    message: "五個共用工作站每天只接待一位工匠。先看資源與空站，再選工作。",
  };
}
export function validWorkshop(a: unknown): a is WorkshopAction {
  if (!a || typeof a !== "object") return false;
  const v = a as any;
  return (
    ["rest", "next"].includes(v.type) ||
    (v.type === "use" &&
      STATIONS.includes(v.station) &&
      [1, 2].includes(v.count) &&
      (["craft", "ship"].includes(v.station) || v.count === 1))
  );
}
export function workshopError(
  s: WorkshopState,
  a: WorkshopAction,
): string | null {
  if (!validWorkshop(a) || s.phase === "finished")
    return "本局已結束或行動無效";
  if (a.type === "next")
    return s.phase === "round_summary" ? null : "工匠尚未全部完成工作";
  if (s.phase !== "playing") return "請先結束工作日";
  if (s.workers[s.turn] <= 0) return "本隊工匠已用完";
  if (a.type === "rest") return null;
  if (s.occupied[a.station])
    return `${STATION_NAMES[a.station]}已被${s.occupied[a.station]}隊占用`;
  const v = s.stock[s.turn];
  if (a.station === "wood" && v.wood === 6) return "木料已達上限6";
  if (a.station === "metal" && v.metal === 6) return "金屬已達上限6";
  if (
    a.station === "craft" &&
    (v.wood < a.count || v.metal < a.count || v.goods + a.count > 3)
  )
    return "每件需木料1、金屬1，成品上限3";
  if (a.station === "upgrade" && (v.wood < 2 || v.metal < 1 || v.level >= 2))
    return "升級需木料2、金屬1，最高2級";
  if (a.station === "ship" && v.goods < a.count) return "成品不足";
  return null;
}
export function applyWorkshop(
  s: WorkshopState,
  a: WorkshopAction,
): WorkshopState {
  const error = workshopError(s, a);
  if (error) throw Error(error);
  if (a.type === "next") {
    if (s.round === s.limit)
      return {
        ...s,
        phase: "finished",
        message: "工坊營業結束，以累積出貨分數比較。",
      };
    return {
      ...s,
      phase: "playing",
      round: s.round + 1,
      turn: s.round % 2 ? other(s.first) : s.first,
      workers: { A: s.perTeam, B: s.perTeam },
      occupied: emptyStations(),
      message: "新工作日，全部工作站已清空；先手交換。",
    };
  }
  const n = {
    ...s,
    workers: { ...s.workers },
    stock: { A: { ...s.stock.A }, B: { ...s.stock.B } },
    occupied: { ...s.occupied },
  };
  const v = n.stock[s.turn];
  if (a.type === "use") {
    n.occupied[a.station] = s.turn;
    if (a.station === "wood") v.wood = Math.min(6, v.wood + 2 + v.level);
    if (a.station === "metal") v.metal = Math.min(6, v.metal + 2 + v.level);
    if (a.station === "craft") {
      v.wood -= a.count;
      v.metal -= a.count;
      v.goods += a.count;
    }
    if (a.station === "upgrade") {
      v.wood -= 2;
      v.metal--;
      v.level++;
    }
    if (a.station === "ship") {
      v.goods -= a.count;
      v.score += a.count * (4 + 2 * v.level);
    }
    n.message = `${s.turn}隊使用${STATION_NAMES[a.station]}${["craft", "ship"].includes(a.station) ? `，處理${a.count}件` : ""}。${a.station === "ship" ? `獲得${a.count * (4 + 2 * v.level)}分。` : a.station === "upgrade" ? `工坊升到${v.level}級。` : "庫存已更新。"}`;
  } else n.message = `${s.turn}隊安排一位工匠休息，不占工作站。`;
  n.workers[s.turn]--;
  if (n.workers.A + n.workers.B === 0) {
    n.phase = "round_summary";
    n.message += " 今日工匠已全數完成。";
  } else n.turn = n.workers[other(s.turn)] > 0 ? other(s.turn) : s.turn;
  return n;
}
export function legalWorkshop(s: WorkshopState): WorkshopAction[] {
  if (s.phase === "finished") return [];
  if (s.phase === "round_summary") return [{ type: "next" }];
  const out: WorkshopAction[] = [{ type: "rest" }];
  for (const station of STATIONS)
    for (const count of [1, 2]) {
      const a: WorkshopAction = { type: "use", station, count };
      if (!workshopError(s, a)) out.push(a);
    }
  return out;
}
export const workshopEngine: Engine<WorkshopState, WorkshopAction> = {
  create: createWorkshop,
  apply: applyWorkshop,
  validAction: validWorkshop,
};
