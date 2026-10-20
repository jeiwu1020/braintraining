// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSession } from "../components/playground/useSession";
import { PREFIX, replay, type Engine, type SavedSession } from "../games/playground/session";
import { lighthouseEngine } from "../games/playground/lighthouse/rules";
import { workshopEngine } from "../games/playground/workshop/rules";
import type { PlaygroundId } from "../data/playgroundCatalog";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const cases = [
  { game: "lighthouse" as const, engine: lighthouseEngine, first: { type: "load", fuel: 1, food: 1 }, second: { type: "wait" } },
  { game: "workshop" as const, engine: workshopEngine, first: { type: "use", station: "wood", count: 1 }, second: { type: "rest" } },
];

let host: HTMLDivElement, root: Root;
let current: ReturnType<typeof useSession<any, any>>;

beforeEach(() => {
  sessionStorage.clear();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function mount(game: PlaygroundId, engine: Engine<any, any>) {
  function Harness() {
    current = useSession(game, engine, "rules-v2");
    return <div data-corrupt={String(current.corrupt)}>{current.session?.id ?? "setup"}</div>;
  }
  act(() => root.render(<Harness />));
}

function remount(game: PlaygroundId, engine: Engine<any, any>) {
  act(() => root.unmount());
  root = createRoot(host);
  mount(game, engine);
}

function journal(game: PlaygroundId, actions: unknown[], level: "normal" | "advanced" = "normal"): SavedSession<unknown> {
  return {
    version: 1, game, id: `legacy-${game}-${level}`,
    settings: { mode: "teams", level }, seed: 19, aiSeed: 29,
    starter: "A", actions,
  };
}

describe.each(cases)("$game rules-v2 storage migration", ({ game, engine, first, second }) => {
  const legacyKey = `${PREFIX}.${game}`, scopedKey = `${legacyKey}.rules-v2`;

  it("copies a compatible normal legacy journal, continues it, and preserves the original bytes", () => {
    const legacy = journal(game, [first]);
    const raw = JSON.stringify(legacy);
    sessionStorage.setItem(legacyKey, raw);
    mount(game, engine);
    expect(current.corrupt).toBe(false);
    expect(current.session).toEqual(legacy);
    expect(current.state).toEqual(replay(legacy, engine as Engine<any, any>).at(-1));
    expect(JSON.parse(sessionStorage.getItem(scopedKey)!)).toEqual(legacy);
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);

    act(() => { expect(current.commit(second, current.token)).toBe(true); });
    const continued = current.session;
    expect(continued!.actions).toEqual([first, second]);
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);
    remount(game, engine);
    expect(current.session).toEqual(continued);
    expect(current.state).toEqual(replay(continued!, engine as Engine<any, any>).at(-1));
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);
  });

  it("prefers an existing scoped journal over a different compatible old normal journal", () => {
    const legacy = journal(game, [first]);
    const scoped = { ...journal(game, []), id: `new-${game}`, seed: 23, starter: "B" as const };
    const raw = JSON.stringify(legacy);
    sessionStorage.setItem(legacyKey, raw);
    sessionStorage.setItem(scopedKey, JSON.stringify(scoped));
    mount(game, engine);
    expect(current.corrupt).toBe(false);
    expect(current.session).toEqual(scoped);
    expect(current.state!.turn).toBe("B");
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);
  });

  it("does not resurrect an invalid old normal journal after explicit recovery and remount", () => {
    // Structurally valid, but "next" is illegal before the first round summary.
    const raw = JSON.stringify(journal(game, [{ type: "next" }]));
    sessionStorage.setItem(legacyKey, raw);
    sessionStorage.setItem(`${PREFIX}.unrelated-review-sentinel`, "keep");
    mount(game, engine);
    expect(current.corrupt).toBe(true);
    expect(current.session).toBeNull();
    act(() => current.clear());
    expect(current.corrupt).toBe(false);
    expect(current.session).toBeNull();
    expect(sessionStorage.getItem(scopedKey)).toBeNull();
    expect(sessionStorage.getItem(`${scopedKey}.legacyDismissed`)).toBe("1");
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);

    remount(game, engine);
    expect(current.corrupt).toBe(false);
    expect(current.session).toBeNull();
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);
    expect(sessionStorage.getItem(`${PREFIX}.unrelated-review-sentinel`)).toBe("keep");

    act(() => current.start({ mode: "teams", level: "normal" }));
    const restarted = current.session;
    expect(restarted!.actions).toEqual([]);
    remount(game, engine);
    expect(current.corrupt).toBe(false);
    expect(current.session).toEqual(restarted);
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);
  });

  it("keeps an old advanced journal untouched instead of replaying it with changed rules", () => {
    const raw = JSON.stringify(journal(game, [first], "advanced"));
    sessionStorage.setItem(legacyKey, raw);
    mount(game, engine);
    expect(current.corrupt).toBe(false);
    expect(current.session).toBeNull();
    expect(current.states).toEqual([]);
    expect(sessionStorage.getItem(scopedKey)).toBeNull();
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);
    act(() => current.start({ mode: "teams", level: "advanced" }));
    expect(current.session!.settings.level).toBe("advanced");
    expect(current.session!.actions).toEqual([]);
    expect(current.session!.id).not.toBe(`legacy-${game}-advanced`);
    expect(sessionStorage.getItem(legacyKey)).toBe(raw);
    expect(sessionStorage.getItem(scopedKey)).not.toBeNull();
  });

  it("surfaces a corrupt scoped journal instead of silently falling back to an older valid game", () => {
    const legacy = JSON.stringify(journal(game, [first]));
    sessionStorage.setItem(legacyKey, legacy);
    sessionStorage.setItem(scopedKey, "{broken");
    mount(game, engine);
    expect(current.corrupt).toBe(true);
    expect(current.session).toBeNull();
    expect(sessionStorage.getItem(scopedKey)).toBe("{broken");
    expect(sessionStorage.getItem(legacyKey)).toBe(legacy);
  });
});
