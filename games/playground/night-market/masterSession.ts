import {
  validAiDifficulty,
  type AiDifficulty,
  type Mode,
  type Team,
} from "../types";
import {
  applyMaster,
  createMaster,
  validMasterAction,
  type MasterAction,
} from "./masterRules";
export const MASTER_KEY = "braintraining.playground.night-market.master.v1";
export interface MasterSettings {
  mode: Mode;
  aiDifficulty: AiDifficulty;
}
export interface MasterJournal {
  version: 1;
  ruleset: "night-market-master-v1";
  id: string;
  settings: MasterSettings;
  seed: number;
  aiSeed: number;
  starter: Team;
  actions: MasterAction[];
}
const uint = (x: unknown): x is number =>
  Number.isInteger(x) && Number(x) >= 0 && Number(x) <= 0xffffffff;
export function newMasterJournal(
  settings: MasterSettings,
  starter: Team = "A",
  seed?: number,
  aiSeed?: number,
): MasterJournal {
  const n = new Uint32Array(2);
  crypto.getRandomValues(n);
  return {
    version: 1,
    ruleset: "night-market-master-v1",
    id: `${Date.now()}-${n[0]}`,
    settings: { ...settings },
    seed: seed ?? n[0],
    aiSeed: aiSeed ?? n[1],
    starter,
    actions: [],
  };
}
export function replayMaster(j: MasterJournal) {
  const states = [createMaster(j.seed, j.starter)];
  for (const a of j.actions)
    states.push(applyMaster(states[states.length - 1], a));
  return states;
}
export function restoreMaster(raw: string): MasterJournal {
  const j = JSON.parse(raw);
  if (
    !j ||
    j.version !== 1 ||
    j.ruleset !== "night-market-master-v1" ||
    typeof j.id !== "string" ||
    j.id.length > 100 ||
    !["A", "B"].includes(j.starter) ||
    !["teams", "solo"].includes(j.settings?.mode) ||
    !validAiDifficulty(j.settings?.aiDifficulty) ||
    !uint(j.seed) ||
    !uint(j.aiSeed) ||
    !Array.isArray(j.actions) ||
    j.actions.length > 33 ||
    !j.actions.every(validMasterAction)
  )
    throw Error("大師版暫存格式無法識別");
  replayMaster(j);
  return j;
}
export function readMasterSaved(): string | null {
  try {
    return sessionStorage.getItem(MASTER_KEY);
  } catch {
    return null;
  }
}
export function readMasterSettings(): MasterSettings {
  try {
    const s = JSON.parse(
      sessionStorage.getItem(`${MASTER_KEY}.settings`) || "null",
    );
    if (
      ["teams", "solo"].includes(s?.mode) &&
      validAiDifficulty(s?.aiDifficulty)
    )
      return s;
  } catch {}
  return { mode: "teams", aiDifficulty: "standard" };
}
