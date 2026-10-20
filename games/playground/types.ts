export type Team = "A" | "B";
export type Mode = "teams" | "solo";
export type Level = "normal" | "advanced";
export type AiDifficulty = "easy" | "standard" | "challenge";
export const AI_DIFFICULTY_LABELS: Record<AiDifficulty, string> = {
  easy: "輕鬆",
  standard: "標準",
  challenge: "挑戰",
};
export function validAiDifficulty(value: unknown): value is AiDifficulty {
  return value === "easy" || value === "standard" || value === "challenge";
}
export interface Settings {
  mode: Mode;
  level: Level;
  /** Absent in v1 journals: preserve the original level-dependent AI policy. */
  aiDifficulty?: AiDifficulty;
}
export const other = (team: Team): Team => (team === "A" ? "B" : "A");
export const TEAMS: Team[] = ["A", "B"];
export function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffled<T>(items: T[], seed: number): T[] {
  const out = [...items],
    rng = random(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
