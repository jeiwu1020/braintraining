import { PlaygroundId } from "../../data/playgroundCatalog";
import { Settings, Team, validAiDifficulty } from "./types";
export const PREFIX = "braintraining.playground.v1";
export interface SavedSession<A> {
  version: 1;
  game: PlaygroundId;
  id: string;
  settings: Settings;
  seed: number;
  aiSeed: number;
  starter: Team;
  actions: A[];
}
export interface Engine<S, A> {
  create: (seed: number, level: Settings["level"], starter: Team) => S;
  apply: (state: S, action: A) => S;
  validAction: (a: unknown) => a is A;
}
export function newSession<A>(
  game: PlaygroundId,
  settings: Settings,
  starter: Team = "A",
): SavedSession<A> {
  const n = new Uint32Array(2);
  crypto.getRandomValues(n);
  return {
    version: 1,
    game,
    id: `${Date.now()}-${n[0]}`,
    settings,
    seed: n[0],
    aiSeed: n[1],
    starter,
    actions: [],
  };
}
/** Validate the envelope, then replay every action through the real rules. Never trust stored boards. */
export function restore<S, A>(
  raw: string,
  game: PlaygroundId,
  e: Engine<S, A>,
): SavedSession<A> {
  const v = JSON.parse(raw);
  if (
    !v ||
    v.version !== 1 ||
    v.game !== game ||
    typeof v.id !== "string" ||
    v.id.length > 100 ||
    !["A", "B"].includes(v.starter) ||
    !["solo", "teams"].includes(v.settings?.mode) ||
    !["normal", "advanced"].includes(v.settings?.level) ||
    ("aiDifficulty" in v.settings && !validAiDifficulty(v.settings.aiDifficulty)) ||
    ![v.seed, v.aiSeed].every(
      (x) => Number.isInteger(x) && x >= 0 && x <= 0xffffffff,
    ) ||
    !Array.isArray(v.actions) ||
    v.actions.length > (game === "night-market" ? 25 : 80)
  )
    throw new Error("暫存格式無法識別");
  let s = e.create(v.seed, v.settings.level, v.starter);
  for (const a of v.actions) {
    if (!e.validAction(a)) throw new Error("暫存動作無法識別");
    s = e.apply(s, a);
  }
  return v;
}
export function replay<S, A>(v: SavedSession<A>, e: Engine<S, A>): S[] {
  const states = [e.create(v.seed, v.settings.level, v.starter)];
  for (const a of v.actions) states.push(e.apply(states[states.length - 1], a));
  return states;
}
export function readSaved(game: PlaygroundId): string | null {
  try {
    return sessionStorage.getItem(`${PREFIX}.${game}`);
  } catch {
    return null;
  }
}
export function clearSaved(game: PlaygroundId): void {
  try {
    sessionStorage.removeItem(`${PREFIX}.${game}`);
  } catch {
    /* private browser may deny storage */
  }
}
export function savedSettings(game: PlaygroundId): Settings {
  try {
    const s = JSON.parse(
      sessionStorage.getItem(`${PREFIX}.${game}.settings`) || "null",
    );
    if (
      ["teams", "solo"].includes(s?.mode) &&
      ["normal", "advanced"].includes(s?.level) &&
      (!("aiDifficulty" in s) || validAiDifficulty(s.aiDifficulty))
    )
      return s;
  } catch {}
  return ["night-market", "wall-race", "frog-pond", "cloud-towers", "chef-split", "sumo-push"].includes(game)
    ? { mode: "teams", level: "normal", aiDifficulty: "standard" }
    : { mode: "teams", level: "normal" };
}
