/** Question IDs only: no participant names, answers, scores or clinical data. */
const memory = new Map<string,string[]>();
const writeFailures = new Set<string>();
const storageKey = (game:string) => `braintraining-knowledge:${game}`;
const clean = (value:unknown):string[] => Array.isArray(value)
  ? [...new Set(value.filter((id):id is string => typeof id === 'string' && id.length > 0 && id.length <= 150))].slice(-1000)
  : [];
export const readFacilitatorKnowledge = (game:string):string[] => {
  try {
    const saved = clean(JSON.parse(sessionStorage.getItem(storageKey(game)) ?? '[]'));
    return writeFailures.has(game) ? clean([...saved,...(memory.get(game) ?? [])]) : saved;
  }
  catch { return [...(memory.get(game) ?? [])]; }
};
export const saveFacilitatorKnowledge = (game:string,ids:readonly string[]):void => {
  const merged = clean([...readFacilitatorKnowledge(game),...ids]);
  memory.set(game,merged);
  try { sessionStorage.setItem(storageKey(game),JSON.stringify(merged)); writeFailures.delete(game); }
  catch { writeFailures.add(game); /* Reads can still succeed after a quota/write failure. */ }
};
