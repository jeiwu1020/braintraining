import { SCENES, LESSON_NOTES } from '../../data/lectures/lesson01';
export const LESSON_SESSION_KEY = 'braintraining.lectures.lesson01.v1';
export interface LessonSession { version: 1; page: number; revealed: Record<number, number>; selected: Record<number, number>; started: boolean; }
export const newLessonSession = (): LessonSession => ({ version: 1, page: 0, revealed: {}, selected: {}, started: false });
export function readLessonSession(): LessonSession {
  try {
    const raw = sessionStorage.getItem(LESSON_SESSION_KEY);
    if (!raw) return newLessonSession();
    const s = JSON.parse(raw);
    if (s.version !== 1 || !Number.isInteger(s.page) || s.page < 0 || s.page >= SCENES.length) return newLessonSession();
    const clean = newLessonSession(); clean.page = s.page; clean.started = s.started === true;
    for (let p = 0; p < SCENES.length; p++) {
      const r = s.revealed?.[p], c = s.selected?.[p];
      if (Number.isInteger(r) && r >= 0 && r <= SCENES[p].reveal.length) clean.revealed[p] = r;
      if (Number.isInteger(c) && c >= 0 && c < LESSON_NOTES[p].choices.length) clean.selected[p] = c;
    }
    return clean;
  } catch { return newLessonSession(); }
}
export function saveLessonSession(s: LessonSession): boolean {
  try { sessionStorage.setItem(LESSON_SESSION_KEY, JSON.stringify(s)); return true; } catch { return false; }
}
