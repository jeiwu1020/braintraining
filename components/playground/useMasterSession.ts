import { useEffect, useMemo, useRef, useState } from "react";
import { other, type Team } from "../../games/playground/types";
import {
  applyMaster,
  type MasterAction,
} from "../../games/playground/night-market/masterRules";
import {
  MASTER_KEY,
  newMasterJournal,
  readMasterSaved,
  replayMaster,
  restoreMaster,
  type MasterJournal,
  type MasterSettings,
} from "../../games/playground/night-market/masterSession";

export function useMasterSession() {
  const [initial] = useState(() => {
    const raw = readMasterSaved();
    try {
      return { journal: raw ? restoreMaster(raw) : null, corrupt: false };
    } catch {
      return { journal: null, corrupt: true };
    }
  });
  const [journal, setJournal] = useState<MasterJournal | null>(initial.journal),
    [corrupt, setCorrupt] = useState(initial.corrupt),
    [storageError, setStorageError] = useState(false),
    [revision, setRevision] = useState(0);
  const current = useRef(journal),
    rev = useRef(revision);
  current.current = journal;
  rev.current = revision;
  const states = useMemo(
      () => (journal ? replayMaster(journal) : []),
      [journal],
    ),
    state = states.at(-1) ?? null;
  const token = journal
    ? `${journal.id}:${journal.actions.length}:${revision}`
    : "none";
  useEffect(() => {
    if (!journal) return;
    try {
      sessionStorage.setItem(MASTER_KEY, JSON.stringify(journal));
      sessionStorage.setItem(
        `${MASTER_KEY}.settings`,
        JSON.stringify(journal.settings),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [journal]);
  function update(next: MasterJournal | null) {
    current.current = next;
    rev.current++;
    setJournal(next);
    setRevision(rev.current);
  }
  function start(settings: MasterSettings, starter: Team = "A") {
    update(newMasterJournal(settings, starter));
    setCorrupt(false);
  }
  function commit(action: MasterAction, expected: string) {
    const j = current.current;
    if (!j || `${j.id}:${j.actions.length}:${rev.current}` !== expected)
      return false;
    try {
      applyMaster(replayMaster(j).at(-1)!, action);
    } catch {
      return false;
    }
    update({ ...j, actions: [...j.actions, action] });
    return true;
  }
  function undoLength() {
    if (!journal || !state || state.phase !== "playing")
      return journal?.actions.length ?? 0;
    const floor =
      state.round === 2
        ? journal.actions.findIndex((a) => a.type === "next-round") + 1
        : 0;
    if (journal.settings.mode === "teams")
      return Math.max(floor, journal.actions.length - 1);
    for (let i = journal.actions.length - 1; i >= floor; i--)
      if (states[i].turn === "A") return i;
    return journal.actions.length;
  }
  const canUndo = !!journal && undoLength() < journal.actions.length;
  function undo() {
    const j = current.current;
    if (j && canUndo)
      update({ ...j, actions: j.actions.slice(0, undoLength()) });
  }
  function clear() {
    try {
      sessionStorage.removeItem(MASTER_KEY);
    } catch {
      setStorageError(true);
    }
    update(null);
    setCorrupt(false);
  }
  return {
    journal,
    state,
    token,
    corrupt,
    storageError,
    start,
    commit,
    undo,
    canUndo,
    clear,
    rematch: () => journal && start(journal.settings, other(journal.starter)),
  };
}
