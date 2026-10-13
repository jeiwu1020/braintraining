import{canCaptureTen,tenPoints,tenCardName,solveTenCaptures,type TenPuzzle,type TenMove}from'./chineseTenRules';
interface TenSnapshot{hand:string[];table:string[];captured:TenMove[];selectedHand:string|null;selectedTable:string|null;points:number;finished:boolean;success:boolean;team:'A'|'B';scores:{A:number;B:number};credited:string[];hintDepth:number;recent:string}
export interface TenSession extends TenSnapshot{puzzleId:string;mode:'COOP'|'TEAMS';history:TenSnapshot[];revealed:string[]}
export const createTenSession=(p:TenPuzzle,mode:'COOP'|'TEAMS'='COOP'):TenSession=>({puzzleId:p.id,mode,hand:p.hand.map(c=>c.id),table:p.table.map(c=>c.id),captured:[],selectedHand:null,selectedTable:null,points:0,finished:false,success:false,team:'A',scores:{A:0,B:0},credited:[],hintDepth:0,recent:'先選一張手牌與一張桌牌，再一起確認捕獲。',history:[],revealed:[]});
const snapshot=({puzzleId:_id,mode:_mode,history:_history,revealed:_knowledge,...s}:TenSession):TenSnapshot=>s;
export const selectTenCard=(s:TenSession,p:TenPuzzle,zone:'hand'|'table',id:string):TenSession=>{
 if(s.finished||s.puzzleId!==p.id||!s[zone].includes(id))return s;const key=zone==='hand'?'selectedHand':'selectedTable';
 return{...s,[key]:s[key]===id?null:id,recent:'只是預選；請說手牌與桌牌名稱，核對配對後確認。'};
};
export const confirmTenCapture=(s:TenSession,p:TenPuzzle):TenSession=>{
 if(s.finished||s.puzzleId!==p.id||!s.selectedHand||!s.selectedTable||!s.hand.includes(s.selectedHand)||!s.table.includes(s.selectedTable))return s;
 const all=[...p.hand,...p.table,...(p.incoming?[p.incoming]:[])],h=all.find(c=>c.id===s.selectedHand)!,t=all.find(c=>c.id===s.selectedTable)!;
 if(!canCaptureTen(h,t))return{...s,recent:'這兩張目前不成對：A 到九合計十；十、J、Q、K 只能各找同字。尚未收牌、不換組。'};
 const hand=s.hand.filter(id=>id!==h.id),table=s.table.filter(id=>id!==t.id),captured=[...s.captured,{handId:h.id,tableId:t.id}],points=s.points+tenPoints(h)+tenPoints(t);
 const incoming=s.captured.length===0?p.incoming:undefined;if(incoming)table.push(incoming.id);
 const finished=captured.length===p.captures;const goal=solveTenCaptures(p).maxPoints;const success=finished&&(p.tier==='BEGINNER'||points===goal);
 const scores={...s.scores},credited=[...s.credited],assisted=s.revealed.includes(p.id),repeated=credited.includes(p.id);
 if(success&&s.mode==='TEAMS'&&!assisted&&!repeated){scores[s.team]++;credited.push(p.id);}
 return{...s,hand,table,captured,points,selectedHand:null,selectedTable:null,finished,success,scores,credited,hintDepth:0,history:[...s.history,snapshot(s)],team:success&&s.mode==='TEAMS'?(s.team==='A'?'B':'A'):s.team,recent:`合法收下${tenCardName(h)}與${tenCardName(t)}，本次 ${tenPoints(h)+tenPoints(t)} 紅點，累積 ${points} 紅點。${incoming?`公開的下一張${tenCardName(incoming)}已加入桌面。`:''}${finished&&!success?`本題可得到 ${goal} 紅點；這次合法但不是最高總和，可復原比較。`:success?(assisted?'本題完成，提示練習不計組分。':repeated?'本題完成，已計組分不重複加分。':s.mode==='TEAMS'?`本題完成，${s.team} 組 +1 分，下一題換組。`:'本題完成，請說明配對與選擇理由。'):'同組繼續第二次捕獲。'}`};
};
export const undoTen=(s:TenSession):TenSession=>{const prev=s.history.at(-1);return prev?{...s,...prev,history:s.history.slice(0,-1),revealed:[...s.revealed],recent:'已復原整次捕獲、公開翻牌、預選、紅點、完成態、組別與分數；已看答案紀錄保留。'}:s;};
export const hintTen=(s:TenSession,p:TenPuzzle):TenSession=>{
 if(s.finished||s.puzzleId!==p.id)return s;const hintDepth=Math.min(3,s.hintDepth+1);
 if(hintDepth===1)return{...s,hintDepth,recent:'提示 1／3：先把手牌與桌牌一對一配起來。A 到九湊十，十與人頭牌找同字。'};
 if(hintDepth===2)return{...s,hintDepth,recent:p.incoming?'提示 2／3：下一張已公開，先想它需要哪張手牌。現在先吃最高，可能用掉第二步更重要的牌。':'提示 2／3：合法配對之後，要把兩張牌的紅點相加；留意紅 A 二十分、黑桃 A 三十分。'};
 const all=[...p.hand,...p.table,...(p.incoming?[p.incoming]:[])];const current={...p,hand:all.filter(c=>s.hand.includes(c.id)),table:all.filter(c=>s.table.includes(c.id)),captures:(p.captures-s.captured.length)as 1|2,incoming:s.captured.length===0?p.incoming:undefined};const result=solveTenCaptures(current),next=result.plans[0]?.[0];
 const reach=p.tier==='BEGINNER'||s.points+result.maxPoints===solveTenCaptures(p).maxPoints;
 return{...s,hintDepth,revealed:[...new Set([...s.revealed,p.id])],recent:next?`提示 3／3：${reach?'目前可先選':'這條路已無法達到原題最高總和，可先復原；若繼續，剩餘最佳是'}${tenCardName(all.find(c=>c.id===next.handId)!)}配${tenCardName(all.find(c=>c.id===next.tableId)!)}。本題提示練習，不計組分，仍須自行確認。`:'提示 3／3：剩餘牌無法完成指定次數，請復原比較另一對。本題提示練習。'};
};
export const restartTen=(s:TenSession,p:TenPuzzle,mode=s.mode):TenSession=>({...createTenSession(p,mode),team:mode===s.mode?s.team:'A',scores:mode===s.mode?{...s.scores}:{A:0,B:0},credited:mode===s.mode?[...s.credited]:[],revealed:[...s.revealed]});
