import { SCENES } from '../../data/lectures/lesson01';
import { STORY_SCREENS } from '../../data/lectures/story01';
export const LESSON_SESSION_KEY = 'braintraining.lectures.lesson01.v1';
export type LessonPanel = 'context' | 'choices' | 'feedback' | 'reason' | 'challenge-context' | 'challenge-choices' | 'challenge-feedback' | 'challenge-reason';
export interface LessonSession {
 version: 2; page: number; revealed: Record<number, number>; selected: Record<number, number>; started: boolean;
 panels: Record<number, LessonPanel>; contextSeen: Record<number, boolean>; challengeSelected: Record<number, number>; challengeVisited: Record<number, boolean>; discussed: Record<number, boolean>;
}
export const newLessonSession = (): LessonSession => ({version:2,page:0,revealed:{},selected:{},started:false,panels:{},contextSeen:{},challengeSelected:{},challengeVisited:{},discussed:{}});
const panels: LessonPanel[]=['context','choices','feedback','reason','challenge-context','challenge-choices','challenge-feedback','challenge-reason'];
export function readLessonSession(): LessonSession {
 try {
  const raw=sessionStorage.getItem(LESSON_SESSION_KEY); if(!raw)return newLessonSession();
  const s=JSON.parse(raw);
  if(![1,2].includes(s.version)||!Number.isInteger(s.page)||s.page<0||s.page>=SCENES.length)return newLessonSession();
  const clean=newLessonSession();clean.page=s.page;clean.started=s.started===true;
  for(let p=0;p<SCENES.length;p++){
   const r=s.revealed?.[p];
   if(Number.isInteger(r)&&r>=0&&r<=SCENES[p].reveal.length)clean.revealed[p]=r;
   // The story revision changes choice meanings: keep page/reveal, not old answers.
   if(s.version!==2)continue;
   const c=s.selected?.[p], ch=s.challengeSelected?.[p], story=STORY_SCREENS[p];
   if(Number.isInteger(c)&&c>=0&&c<story.interaction.choices.length)clean.selected[p]=c;
   if(Number.isInteger(ch)&&ch>=0&&ch<(story.challenge?.choices.length??0))clean.challengeSelected[p]=ch;
   for(const k of ['contextSeen','challengeVisited','discussed'] as const)if(s[k]?.[p]===true)clean[k][p]=true;
   const panel=s.panels?.[p];
   if(panels.includes(panel)&&(!panel.startsWith('challenge')||story.challenge)&& (panel!=='feedback'||clean.selected[p]!==undefined) && (panel!=='challenge-feedback'||clean.challengeSelected[p]!==undefined))clean.panels[p]=panel;
  }
  return clean;
 }catch{return newLessonSession();}
}
export function saveLessonSession(s:LessonSession):boolean{try{sessionStorage.setItem(LESSON_SESSION_KEY,JSON.stringify(s));return true;}catch{return false;}}
