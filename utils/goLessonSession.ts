import{playGoMove,type GoBoard,type Point}from'../services/goEngine';import{goPointKey,goPointName,goLessonGoalMet,solveGoLesson,type GoLesson}from'./goLessonRules';
interface GoLessonSnapshot{board:GoBoard;ko:Point|null;lastMove:Point|null;selected:Point|null;first:Point|null;stage:'FIRST'|'REPLY'|'FINAL';captured:number;finished:boolean;success:boolean;team:'A'|'B';scores:{A:number;B:number};credited:string[];hintDepth:number;recent:string}
export interface GoLessonSession extends GoLessonSnapshot{puzzleId:string;mode:'COOP'|'TEAMS';history:GoLessonSnapshot[];revealed:string[]}
export const createGoLessonSession=(p:GoLesson,mode:'COOP'|'TEAMS'='COOP'):GoLessonSession=>({puzzleId:p.id,mode,board:p.board.map(row=>[...row]),ko:null,lastMove:null,selected:null,first:null,stage:'FIRST',captured:0,finished:false,success:false,team:'A',scores:{A:0,B:0},credited:[],hintDepth:0,recent:'先指出目標，選比較候選，再一起確認落子。',history:[],revealed:[]});
const snapshot=({puzzleId:_id,mode:_mode,history:_history,revealed:_knowledge,...s}:GoLessonSession):GoLessonSnapshot=>s;
export const selectGoLessonPoint=(s:GoLessonSession,p:GoLesson,point:Point):GoLessonSession=>s.finished||s.stage==='REPLY'||s.puzzleId!==p.id?s:{...s,selected:point,recent:`預選 ${goPointName(point,p.board.length)}，尚未落子；請先口述理由。`};
const complete=(s:GoLessonSession,p:GoLesson):GoLessonSession=>{
 const success=goLessonGoalMet(s.board,p.goal,s.captured),scores={...s.scores},credited=[...s.credited],assisted=s.revealed.includes(p.id),repeated=credited.includes(p.id);
 if(success&&s.mode==='TEAMS'&&!assisted&&!repeated){scores[s.team]++;credited.push(p.id);}
 return{...s,finished:true,success,scores,credited,team:success&&s.mode==='TEAMS'?(s.team==='A'?'B':'A'):s.team,recent:success?(assisted?'本分支達成目標，提示練習不計分。':repeated?'本分支達成目標，本題已計分不重複加分。':s.mode==='TEAMS'?`本分支達成目標，${s.team} 組 +1 分，下一題換組。`:'本分支達成目標，請一起說明棋形變化。'):'這手合法，但此分支尚未達成本題明示目標；可復原比較，不將其他合法策略一概判成錯棋。'};
};
export const confirmGoLesson=(s:GoLessonSession,p:GoLesson):GoLessonSession=>{
 if(s.finished||s.stage==='REPLY'||!s.selected||s.puzzleId!==p.id)return s;
 const branch=p.branches.find(b=>goPointKey(b.first)===goPointKey(s.selected!));
 if(s.stage==='FIRST'&&!branch)return{...s,recent:'本題先比較候選首手，其他合法點不在這次分支練習範圍；請選畫面列出的比較候選。'};
 const result=playGoMove(s.board,s.selected.r,s.selected.c,'BLACK',s.ko);
 if(!result.isLegal)return{...s,recent:`${result.error}；盤面、輪組與分數不變。`};
 const next={...s,board:result.nextBoard,ko:result.koPoint,lastMove:s.selected,first:s.first??s.selected,selected:null,captured:s.captured+result.capturedCount,hintDepth:0,history:[...s.history,snapshot(s)]};
 if(s.stage==='FIRST'&&branch!.replies.length)return{...next,stage:'REPLY',recent:'黑方首手已落。請先預測白方回應，再由治療者按「展示應手」；同組尚未完成。'};
 return complete(next,p);
};
export const showGoLessonReply=(s:GoLessonSession,p:GoLesson,index:number):GoLessonSession=>{
 if(s.finished||s.stage!=='REPLY'||!s.first||s.puzzleId!==p.id)return s;
 const reply=p.branches.find(b=>goPointKey(b.first)===goPointKey(s.first!))?.replies[index];if(!reply)return s;
 const result=playGoMove(s.board,reply.r,reply.c,'WHITE',s.ko);if(!result.isLegal)return s;
 return{...s,board:result.nextBoard,ko:result.koPoint,lastMove:reply,stage:'FINAL',selected:null,hintDepth:0,history:[...s.history,snapshot(s)],recent:`已展示白方 ${goPointName(reply,p.board.length)} 應手。這是指定示範分支，不宣稱白方唯一最佳；同組再選黑方下一手。`};
};
export const undoGoLesson=(s:GoLessonSession):GoLessonSession=>{const prev=s.history.at(-1);return prev?{...s,...prev,history:s.history.slice(0,-1),revealed:[...s.revealed],recent:'已復原整個落子或示範階段、預選、棋盤、完成態、分數與組別；已看答案紀錄保留。'}:s;};
export const hintGoLesson=(s:GoLessonSession,p:GoLesson):GoLessonSession=>{
 if(s.finished||s.puzzleId!==p.id)return s;const hintDepth=Math.min(3,s.hintDepth+1);
 if(hintDepth===1)return{...s,hintDepth,recent:'提示 1／3：先說本題目標，再數直線相鄰的氣；斜角不算連接，棋盤外沒有氣。'};
 if(hintDepth===2)return{...s,hintDepth,recent:p.goal.kind==='EYES'?'提示 2／3：大空間不等於兩個眼。找兩個分開空點，四周都屬於同一塊黑棋。':p.goal.kind==='CONNECT'?'提示 2／3：沿上下左右追蹤兩塊黑棋，中間還缺哪些連接點？':'提示 2／3：落子前後都重新數整塊的氣。應手會改變剩餘空點，不要只背第一手座標。'};
 let next:Point|undefined;
 if(s.stage==='FIRST')next=solveGoLesson(p)[0]?.first;
 else if(s.stage==='FINAL')for(let r=0;r<p.board.length&&!next;r++)for(let c=0;c<p.board.length&&!next;c++){const result=playGoMove(s.board,r,c,'BLACK',s.ko);if(result.isLegal&&goLessonGoalMet(result.nextBoard,p.goal,s.captured+result.capturedCount))next={r,c};}
 return{...s,hintDepth,revealed:[...new Set([...s.revealed,p.id])],recent:next?`提示 3／3：目前可先下 ${goPointName(next,p.board.length)}，再核對這段目標。本題提示練習，不計分，仍須自行確認。`:s.stage==='REPLY'?'提示 3／3：先由治療者展示列出的白方應手，再比較黑方下一手。本題提示練習。':'提示 3／3：此分支剩下一手無法達成本題目標，請復原比較另一候選。本題提示練習。'};
};
export const restartGoLesson=(s:GoLessonSession,p:GoLesson,mode=s.mode):GoLessonSession=>({...createGoLessonSession(p,mode),team:mode===s.mode?s.team:'A',scores:mode===s.mode?{...s.scores}:{A:0,B:0},credited:mode===s.mode?[...s.credited]:[],revealed:[...s.revealed]});
