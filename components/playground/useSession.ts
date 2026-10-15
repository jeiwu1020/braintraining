import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlaygroundId } from "../../data/playgroundCatalog";
import {
  Engine,
  newSession,
  PREFIX,
  readSaved,
  replay,
  restore,
  SavedSession,
} from "../../games/playground/session";
import { Settings, Team } from "../../games/playground/types";
export function useSession<S extends { phase: string; turn: Team }, A>(
  game: PlaygroundId,
  engine: Engine<S, A>,
) {
  const [initial] = useState(() => {
    const raw = readSaved(game);
    if (!raw) return { value: null as SavedSession<A> | null, error: false };
    try {
      return { value: restore(raw, game, engine), error: false };
    } catch {
      return { value: null, error: true };
    }
  });
  const [session, setSession] = useState<SavedSession<A> | null>(initial.value),
    [corrupt, setCorrupt] = useState(initial.error),
    [storageError, setStorageError] = useState(false);
  const current = useRef(session);
  current.current = session;
  const states = useMemo(
    () => (session ? replay(session, engine) : []),
    [session, engine],
  );
  const state = states.at(-1) ?? null;
  const token = session ? `${session.id}:${session.actions.length}` : "none";
  useEffect(() => {
    if (!session) return;
    try {
      sessionStorage.setItem(`${PREFIX}.${game}`, JSON.stringify(session));
      sessionStorage.setItem(
        `${PREFIX}.${game}.settings`,
        JSON.stringify(session.settings),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [session, game]);
  function start(settings: Settings, starter: Team = "A") {
    const n = newSession<A>(game, settings, starter);
    current.current = n;
    setSession(n);
    setCorrupt(false);
  }
  function commit(action: A, expected: string): boolean {
    const old = current.current;
    if (!old || `${old.id}:${old.actions.length}` !== expected) return false;
    const latest = replay(old, engine).at(-1)!;
    try {
      engine.apply(latest, action);
    } catch {
      return false;
    }
    const next = { ...old, actions: [...old.actions, action] };
    current.current = next;
    setSession(next);
    return true;
  }
  function undoLength(floor = 0) {
    const old = current.current;
    if (
      !old ||
      !state ||
      state.phase === "finished" ||
      state.phase === "round_summary"
    )
      return old?.actions.length ?? 0;
    if (old.settings.mode === "solo") {
      // A computer-only opening has no human decision to undo.
      for (let i = old.actions.length - 1; i >= floor; i--)
        if (states[i].turn === "A") return i;
      return old.actions.length;
    }
    return Math.max(floor, old.actions.length - 1);
  }
  function canUndo(floor = 0) {
    return !!session && undoLength(floor) < session.actions.length;
  }
  function undo(floor = 0) {
    const old = current.current;
    if (!old) return;
    const length = undoLength(floor);
    if (length === old.actions.length) return;
    const next = { ...old, actions: old.actions.slice(0, length) };
    current.current = next;
    setSession(next);
  }
  function clear() {
    try {
      sessionStorage.removeItem(`${PREFIX}.${game}`);
    } catch {}
    current.current = null;
    setSession(null);
    setCorrupt(false);
  }
  return {
    session,
    state,
    states,
    token,
    corrupt,
    storageError,
    start,
    commit,
    undo,
    canUndo,
    clear,
  };
}
export function useAi<A>(
  active: boolean,
  token: string,
  makeWorker: () => Worker,
  payload: unknown,
  fallback: () => A,
) {
  const [result, setResult] = useState<{
    token: string;
    action: A;
    fallback: boolean;
    detail?: string;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  const payloadRef = useRef(payload),
    fallbackRef = useRef(fallback);
  payloadRef.current = payload;
  fallbackRef.current = fallback;
  useEffect(() => {
    setResult(null);
    setFailed(false);
    if (!active) return;
    let worker: Worker | undefined,
      cancelled = false;
    const backup = () => {
      if (cancelled) return;
      try {
        setResult({ token, action: fallbackRef.current(), fallback: true });
      } catch {
        setFailed(true);
      }
      worker?.terminate();
    };
    const timeout = setTimeout(backup, 2000);
    try {
      worker = makeWorker();
      worker.onmessage = (e) => {
        if (cancelled || e.data.id !== token) return;
        clearTimeout(timeout);
        if (e.data.error) {
          backup();
          return;
        }
        setResult({
          token,
          action: e.data.action,
          fallback: false,
          detail: e.data.depth ? `搜尋 ${e.data.depth} 層` : undefined,
        });
        worker?.terminate();
      };
      worker.onerror = () => {
        clearTimeout(timeout);
        backup();
      };
      worker.postMessage({ ...(payloadRef.current as object), id: token });
    } catch {
      clearTimeout(timeout);
      backup();
    }
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      worker?.terminate();
    };
  }, [active, token, makeWorker]);
  return { ready: result?.token === token ? result : null, failed };
}
