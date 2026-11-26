import { Level, Team, other, shuffled } from "../types";
import { Engine } from "../session";

export type ExhibitKind = "ceramic" | "bronze" | "scroll";
export const KIND_NAMES: Record<ExhibitKind, string> = {
  ceramic: "陶瓷",
  bronze: "銅器",
  scroll: "書畫",
};

export interface Exhibit {
  id: number;
  name: string;
  kind: ExhibitKind;
  points: number;
}

export interface Purchase extends Exhibit {
  price: number;
}

export type AuctionAction =
  | { type: "bid"; amount?: 1 | 2 | 3 }
  | { type: "pass" }
  | { type: "next" };

export interface AuctionState {
  phase: "playing" | "round_summary" | "finished";
  turn: Team;
  first: Team;
  lot: number;
  price: number;
  leader: Team | null;
  withdrawn: Record<Team, boolean>;
  budgets: Record<Team, number>;
  collections: Record<Team, Purchase[]>;
  exhibits: Exhibit[];
  sales: { exhibit: Exhibit; owner: Team | null; price: number }[];
  message: string;
}

export function createAuction(
  seed: number,
  level: Level,
  starter: Team,
): AuctionState {
  const names = [
      "青瓷茶盞",
      "銅製香爐",
      "山水手卷",
      "彩繪陶瓶",
      "鎏金銅鏡",
      "行書冊頁",
      "窯變陶盤",
      "花鳥畫軸",
    ],
    kinds: ExhibitKind[] = [
      "ceramic",
      "bronze",
      "scroll",
      "ceramic",
      "bronze",
      "scroll",
      "ceramic",
      "scroll",
    ],
    points = [5, 6, 7, 9, 8, 10, 11, 6];
  const exhibits = shuffled(
    names
      .map((name, id) => ({ id, name, kind: kinds[id], points: points[id] }))
      .slice(0, level === "normal" ? 6 : 8),
    seed,
  );
  const budget = level === "normal" ? 18 : 22;
  return {
    phase: "playing",
    turn: starter,
    first: starter,
    lot: 0,
    price: 0,
    leader: null,
    withdrawn: { A: false, B: false },
    budgets: { A: budget, B: budget },
    collections: { A: [], B: [] },
    exhibits,
    sales: [],
    message: "全部展品與分數已公開。可加價 +1/+2/+3 枚籌碼或退出，得標才付款；每剩 3 枚籌碼＋1 分。",
  };
}

export function exhibitionScore(collection: Exhibit[], budget = 0) {
  const counts = { ceramic: 0, bronze: 0, scroll: 0 };
  let base = 0;
  for (const e of collection) {
    counts[e.kind]++;
    base += e.points;
  }
  const sets = Math.min(counts.ceramic, counts.bronze, counts.scroll);
  const bonus = sets * 5;
  const chipBonus = Math.floor(Math.max(0, budget) / 3);
  return { base, sets, bonus, chipBonus, total: base + bonus + chipBonus, counts };
}

export function validAuction(a: unknown): a is AuctionAction {
  if (!a || typeof a !== "object") return false;
  const v = a as any;
  if (v.type === "pass" || v.type === "next") return true;
  if (v.type === "bid") {
    return v.amount === undefined || v.amount === 1 || v.amount === 2 || v.amount === 3;
  }
  return false;
}

function settle(
  s: AuctionState,
  owner: Team | null,
  price: number,
): AuctionState {
  const exhibit = s.exhibits[s.lot],
    budgets = { ...s.budgets },
    collections = { A: [...s.collections.A], B: [...s.collections.B] };
  if (owner) {
    budgets[owner] -= price;
    collections[owner].push({ ...exhibit, price });
  }
  return {
    ...s,
    phase: "round_summary",
    budgets,
    collections,
    sales: [...s.sales, { exhibit, owner, price }],
    message: owner
      ? `${owner}隊以${price}枚遊戲籌碼取得${exhibit.name}（${exhibit.points}分）。`
      : `兩隊都退出，${exhibit.name}流標，無人付款。`,
  };
}

export function applyAuction(s: AuctionState, a: AuctionAction): AuctionState {
  if (!validAuction(a) || s.phase === "finished")
    throw Error("本局已結束或行動無效");
  if (a.type === "next") {
    if (s.phase !== "round_summary") throw Error("本件尚未結束");
    if (s.lot === s.exhibits.length - 1)
      return {
        ...s,
        phase: "finished",
        message: "全部展品拍賣完成，請看展覽總分、套組與餘幣折分。",
      };
    const lot = s.lot + 1;
    return {
      ...s,
      phase: "playing",
      lot,
      turn: lot % 2 ? other(s.first) : s.first,
      leader: null,
      price: 0,
      withdrawn: { A: false, B: false },
      message: "下一件展品，叫價歸零，先叫價隊伍交換。",
    };
  }
  if (s.phase !== "playing" || s.withdrawn[s.turn])
    throw Error("請先查看成交結果或等待下一件");
  if (a.type === "bid") {
    const step = a.amount ?? 1;
    const price = s.price + step;
    if (price > s.budgets[s.turn] || s.leader === s.turn)
      throw Error("遊戲籌碼不足或已是最高叫價方");
    const n = {
      ...s,
      price,
      leader: s.turn,
      message: `${s.turn}隊出價至${price}枚（+${step}），尚未扣除；輪到對方加價或退出。`,
    };
    if (s.withdrawn[other(s.turn)]) return settle(n, s.turn, price);
    return { ...n, turn: other(s.turn) };
  }
  const withdrawn = { ...s.withdrawn, [s.turn]: true },
    n = { ...s, withdrawn };
  if (s.leader) return settle(n, s.leader, s.price);
  if (withdrawn.A && withdrawn.B) return settle(n, null, 0);
  return {
    ...n,
    turn: other(s.turn),
    message: `${s.turn}隊退出本件，另一隊可直接加價取得，或退出讓展品流標。`,
  };
}

export function legalAuction(s: AuctionState): AuctionAction[] {
  if (s.phase === "finished") return [];
  if (s.phase === "round_summary") return [{ type: "next" }];
  const out: AuctionAction[] = [];
  if (!s.withdrawn[s.turn] && s.leader !== s.turn) {
    for (const amount of [1, 2, 3] as const) {
      if (s.price + amount <= s.budgets[s.turn]) {
        out.push(amount === 1 ? { type: "bid" } : { type: "bid", amount });
      }
    }
  }
  out.push({ type: "pass" });
  return out;
}

export const auctionEngine: Engine<AuctionState, AuctionAction> = {
  create: createAuction,
  apply: applyAuction,
  validAction: validAuction,
};
