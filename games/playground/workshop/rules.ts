import { Level, Team, other } from "../types";
import { Engine } from "../session";

export const STATIONS = ["wood", "metal", "craft", "upgrade", "ship"] as const;
export type Station = (typeof STATIONS)[number];

export const STATION_NAMES: Record<Station, string> = {
  wood: "林場",
  metal: "大料倉",
  craft: "加工臺",
  upgrade: "急單櫃",
  ship: "出貨埠",
};

export type WorkshopAction =
  | { type: "use"; station: Station }
  | { type: "rest" }
  | { type: "next" };

export interface Stock {
  materials: number;
  goods: number;
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

export function craftableCount(v: Stock): number {
  return Math.min(Math.floor(v.materials / 2), 4 - v.goods);
}

export function createWorkshop(
  seed: number,
  level: Level,
  starter: Team,
): WorkshopState {
  const materials = level === "normal" ? 1 : 1 + ((seed >>> 0) % 2);
  const stock = (): Stock => ({ materials, goods: 0, score: 0 });
  const perTeam = level === "normal" ? 2 : 3;
  return {
    phase: "playing",
    turn: starter,
    first: starter,
    round: 1,
    limit: level === "normal" ? 4 : 5,
    perTeam,
    workers: { A: perTeam, B: perTeam },
    stock: { A: stock(), B: stock() },
    occupied: emptyStations(),
    message:
      level === "normal"
        ? "五個共用工作站每天兩隊合計只用一次。收集原料、加工成品再出貨得分！"
        : `進階開局：兩隊皆從 ${materials} 份原料出發、每日 3 位工匠（必有 1 位須休息取 +1 原料）。`,
  };
}

export function validWorkshop(a: unknown): a is WorkshopAction {
  if (!a || typeof a !== "object") return false;
  const v = a as any;
  return (
    v.type === "next" ||
    v.type === "rest" ||
    (v.type === "use" && STATIONS.includes(v.station))
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
  if ((a.station === "wood" || a.station === "metal") && v.materials >= 6)
    return "原料已達上限 6";
  if (a.station === "craft" && craftableCount(v) === 0)
    return v.goods >= 4 ? "成品已達上限 4" : "至少需 2 份原料才能加工";
  if (a.station === "upgrade" && v.materials < 2)
    return "急單需要 2 份原料";
  if (a.station === "ship" && v.goods === 0)
    return "目前沒有成品可出貨";
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
        message: "工坊營業結束，以累積分數比較勝負。",
      };
    return {
      ...s,
      phase: "playing",
      round: s.round + 1,
      turn: s.round % 2 ? other(s.first) : s.first,
      workers: { A: s.perTeam, B: s.perTeam },
      occupied: emptyStations(),
      message: "新工作日開始，全部工作站已清空並交換先手。",
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
    if (a.station === "wood") {
      const gained = Math.min(6 - v.materials, 2);
      v.materials += gained;
      n.message = `${s.turn}隊到林場取得 ${gained} 份原料。`;
    } else if (a.station === "metal") {
      const gained = Math.min(6 - v.materials, 3);
      v.materials += gained;
      n.message = `${s.turn}隊搶占大料倉，取得 ${gained} 份原料！`;
    } else if (a.station === "craft") {
      const made = craftableCount(v);
      v.materials -= made * 2;
      v.goods += made;
      n.message = `${s.turn}隊在加工臺一口氣做成 ${made} 件成品。`;
    } else if (a.station === "upgrade") {
      v.materials -= 2;
      v.score += 4;
      n.message = `${s.turn}隊接下急單櫃，耗 2 原料立刻＋4 分！`;
    } else if (a.station === "ship") {
      const shipped = v.goods;
      const pts = shipped * 6;
      v.goods = 0;
      v.score += pts;
      n.message = `${s.turn}隊在出貨埠售出 ${shipped} 件成品，獲得 ${pts} 分！`;
    }
  } else {
    const gained = Math.min(6 - v.materials, 1);
    v.materials += gained;
    n.message =
      gained > 0
        ? `${s.turn}隊安排工匠休息（不占站），領取 1 份原料。`
        : `${s.turn}隊安排工匠休息（不占站，原料已滿）。`;
  }
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
  for (const station of STATIONS) {
    const a: WorkshopAction = { type: "use", station };
    if (!workshopError(s, a)) out.push(a);
  }
  return out;
}

export const workshopEngine: Engine<WorkshopState, WorkshopAction> = {
  create: createWorkshop,
  apply: applyWorkshop,
  validAction: validWorkshop,
};
