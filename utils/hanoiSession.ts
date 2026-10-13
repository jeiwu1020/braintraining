import { applyHanoiCommand, isHanoiGoal, solveHanoi, type HanoiPuzzle } from './hanoiRules';
interface HanoiSnapshot { rods:number[][]; from:number|null; to:number|null; team:'A'|'B'; scores:{A:number;B:number}; credited:string[]; steps:number; finished:boolean; hintDepth:number; recent:string }
export interface HanoiSession extends HanoiSnapshot { puzzleId:string; mode:'COOP'|'TEAMS'; revealed:string[]; history:HanoiSnapshot[]; revision:number }
const rodName=(rod:number)=>String.fromCharCode(65+rod);
export const createHanoiSession=(p:HanoiPuzzle,mode:'COOP'|'TEAMS'='COOP'):HanoiSession=>({
  puzzleId:p.id,mode,rods:p.rods.map(rod=>[...rod]),from:null,to:null,team:'A',scores:{A:0,B:0},credited:[],steps:0,finished:false,hintDepth:0,revealed:[],history:[],revision:0,
  recent:'先說盤號、來源柱與目的柱，選好兩柱後確認；同組完成整題計畫。',
});
export const selectHanoiRod=(s:HanoiSession,rod:number):HanoiSession=>{
  if(s.finished||!Number.isInteger(rod)||rod<0||rod>2)return s;
  if(s.from===null||s.to!==null){
    if(!s.rods[rod].length)return {...s,recent:`${rodName(rod)} 柱沒有圓盤，請選有盤的來源柱。`};
    return {...s,from:rod,to:null,recent:`已選 ${s.rods[rod].at(-1)} 號，從 ${rodName(rod)} 柱出發；請選目的柱。`};
  }
  if(s.from===rod)return {...s,from:null,to:null,recent:'已取消本次選取，尚未移動。'};
  return {...s,to:rod,recent:`預覽：${s.rods[s.from].at(-1)} 號從 ${rodName(s.from)} 到 ${rodName(rod)}；確認後才移動。`};
};
export const commitHanoiMove=(s:HanoiSession,p:HanoiPuzzle,revision:number):HanoiSession=>{
  if(s.finished||s.puzzleId!==p.id||s.revision!==revision||s.from===null||s.to===null)return s;
  const rods=applyHanoiCommand(s.rods,{from:s.from,to:s.to});
  if(rods===s.rods)return {...s,recent:'這步不合法：只能移最上方圓盤，大盤不能壓小盤；請重選來源與目的。'};
  const finished=isHanoiGoal(rods,p.target);const practice=s.revealed.includes(p.id);const repeated=s.credited.includes(p.id);
  const scores={...s.scores};const credited=[...s.credited];
  if(finished&&s.mode==='TEAMS'&&!practice&&!repeated){scores[s.team]++;credited.push(p.id);}
  const {history,revision:_revision,revealed:_revealed,puzzleId:_puzzleId,mode:_mode,...snapshot}=s;
  const before=solveHanoi(s.rods,p.target)!.length;const remaining=solveHanoi(rods,p.target)!.length;
  const change=p.tier==='CHALLENGE'?`與上一步相比，剩餘最少步數${remaining<before?'減少':'增加'} ${Math.abs(remaining-before)} 步；可討論這步是否有助計畫。`:'';
  return {...s,rods,from:null,to:null,scores,credited,steps:s.steps+1,finished,hintDepth:0,revision:s.revision+1,history:[...history,snapshot],
    team:finished&&s.mode==='TEAMS'?(s.team==='A'?'B':'A'):s.team,
    recent:`${s.rods[s.from].at(-1)} 號從 ${rodName(s.from)} 到 ${rodName(s.to)}。${finished?`完成！共 ${s.steps+1} 步。${practice?'提示練習，不計分。':repeated?'本題已計分，不重複加分。':s.mode==='TEAMS'?`${s.team} 組 +1 分；下一題換組。`:''}`:change}`};
};
export const undoHanoiMove=(s:HanoiSession):HanoiSession=>{
  const snapshot=s.history.at(-1);return snapshot?{...s,...snapshot,revealed:[...s.revealed],history:s.history.slice(0,-1),revision:s.revision+1,recent:'已復原整步：圓盤、預選、步數、組別及分數一起還原；已看答案紀錄保留。'}:s;
};
export const hintHanoi=(s:HanoiSession,p:HanoiPuzzle):HanoiSession=>{
  if(s.finished||s.puzzleId!==p.id)return s;const solution=solveHanoi(s.rods,p.target);if(!solution?.length)return s;
  const hintDepth=Math.min(3,s.hintDepth+1);const move=solution[0];
  if(hintDepth===1)return {...s,hintDepth,recent:'提示 1／3：先找還沒歸位的最大圓盤。要搬它，它上面與目的柱各要先清開哪些小盤？'};
  if(hintDepth===2)return {...s,hintDepth,recent:`提示 2／3：目標是 ${rodName(p.target)} 柱。先把阻擋的大盤上方小塔移到另一柱；若大盤已歸位，就把剩下的小塔視為新任務。每步只移最上方一片。`};
  return {...s,hintDepth,from:move.from,to:move.to,revealed:[...new Set([...s.revealed,p.id])],recent:`提示 3／3：可把 ${move.disk} 號從 ${rodName(move.from)} 到 ${rodName(move.to)}。已預選，仍須確認。本題為提示練習，復原或重玩後也不計分。`};
};
export const restartHanoi=(s:HanoiSession,p:HanoiPuzzle,mode=s.mode):HanoiSession=>{
  const changed=mode!==s.mode;
  return {...createHanoiSession(p,mode),team:changed?'A':s.team,scores:changed?{A:0,B:0}:{...s.scores},credited:changed?[]:[...s.credited],revealed:[...s.revealed],revision:s.revision+1};
};
