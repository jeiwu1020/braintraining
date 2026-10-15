// @vitest-environment jsdom
import { beforeEach, expect, it } from 'vitest';
import { SCENES, LESSON_NOTES, CHAPTERS } from '../data/lectures/lesson01';
import { LESSON_SESSION_KEY, newLessonSession, readLessonSession, saveLessonSession } from '../components/lectures/session';
beforeEach(() => sessionStorage.clear());
it('covers all 24 screens with complete facilitator material and 60-minute guide', () => {
 expect(SCENES).toHaveLength(24); expect(LESSON_NOTES).toHaveLength(24);
 expect(CHAPTERS.map(c=>c.first)).toEqual([0,2,6,9,15,16,21]);
 LESSON_NOTES.forEach(n=>{expect(n.script).toBeTruthy();expect(n.hint).toBeTruthy();expect(n.answer).toBeTruthy();});
 expect(LESSON_NOTES[23].time).toBe('59:00–60:00');
 expect(new Set(SCENES.map(s=>s.kind)).size).toBeGreaterThan(6);
});
it('stores only page, reveals and choice indexes, independently from game difficulty', () => {
 sessionStorage.setItem('difficulty','ADVANCED');
 const s = {...newLessonSession(),page:7,started:true,revealed:{7:2},selected:{1:1}};
 expect(saveLessonSession(s)).toBe(true); expect(readLessonSession()).toEqual(s);
 expect(JSON.parse(sessionStorage.getItem(LESSON_SESSION_KEY)!)).not.toHaveProperty('difficulty');
});
it('ignores malformed and out-of-range saved state', () => {
 for (const invalid of ['{',JSON.stringify({version:2,page:0}),JSON.stringify({version:1,page:24})]) {
 sessionStorage.setItem(LESSON_SESSION_KEY,invalid);expect(readLessonSession()).toEqual(newLessonSession());
 }
 sessionStorage.setItem(LESSON_SESSION_KEY,JSON.stringify({version:1,page:1,started:true,revealed:{1:99,7:1},selected:{1:99,2:0},name:'discard'}));
 expect(readLessonSession()).toEqual({...newLessonSession(),page:1,started:true,revealed:{7:1},selected:{2:0}});
});
it('contains no URLs, phone dial links, QR payloads or personal-data inputs in projected scenes', () => {
 expect(JSON.stringify(SCENES)).not.toMatch(/https?:\/\/|tel:|javascript:|data:/i);
 expect(SCENES[8].reveal.join('')).toContain('資訊不足');
 expect(SCENES[20].reveal.join('')).toContain('110');
 expect(SCENES[18].reveal.join('')).toContain('立即通知銀行');
});
it('frames the opening as an adult next-action discussion and compares independent checking',()=>{
 expect(SCENES[1].cue).toBe('如果是你，會先怎麼做？');
 expect(LESSON_NOTES[1].choices[2]).toBe('C 先回覆通知，詢問是否真的會退回');
 expect(LESSON_NOTES[1].answer).toContain('同一個未確認的來源');
 expect(SCENES[1].reveal.join('')).toContain('仍需另從官方確認');
});
