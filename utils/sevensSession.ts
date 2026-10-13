import{applySevensCard,isSevensPlayable,sevensCardName,solveSevensOrders,type SevensPuzzle,type SevensBoard}from'./sevensRules';
interface SevensSnapshot{board:SevensBoard;remaining:string[];played:string[];selected:string|null;earlyOpen:boolean;finished:boolean;success:boolean;team:'A'|'B';scores:{A:number;B:number};credited:string[];hintDepth:number;recent:string}
export interface SevensSession extends SevensSnapshot{puzzleId:string;mode:'COOP'|'TEAMS';history:SevensSnapshot[];revealed:string[]}
export const createSevensSession=(p:SevensPuzzle,mode:'COOP'|'TEAMS'='COOP'):SevensSession=>({puzzleId:p.id,mode,board:p.board,remaining:p.hand.map(c=>c.id),played:[],selected:null,earlyOpen:false,finished:false,success:false,team:'A',scores:{A:0,B:0},credited:[],hintDepth:0,recent:'預選一張牌，先口述要接的端點，再確認出牌。',history:[],revealed:[]});
const snapshot=({puzzleId:_id,mode:_mode,history:_history,revealed:_knowledge,...s}:SevensSession):SevensSnapshot=>s;
export const selectSevensCard=(s:SevensSession,p:SevensPuzzle,id:string):SevensSession=>s.finished||s.puzzleId!==p.id||!s.remaining.includes(id)?s:{...s,selected:s.selected===id?null:id,recent:'只是預選；請說接在哪個花色的哪個端點，再確認。'};
export const confirmSevensCard=(s:SevensSession,p:SevensPuzzle):SevensSession=>{
 if(s.finished||s.puzzleId!==p.id||!s.selected||!s.remaining.includes(s.selected))return s;
 const card=p.hand.find(c=>c.id===s.selected);if(!card)return s;const board=applySevensCard(s.board,card);
 if(!board)return{...s,recent:'這張目前不能接：未開花色先出七，已開花色只能緊接兩端。尚未出牌、不換組。'};
 const played=[...s.played,card.id],remaining=s.remaining.filter(id=>id!==card.id),finished=played.length===p.targetMoves;
 const opens=Boolean(p.opponent&&isSevensPlayable(board,p.opponent));const earlyOpen=s.earlyOpen||(!finished&&opens);const success=finished&&!earlyOpen;
 const scores={...s.scores},credited=[...s.credited],assisted=s.revealed.includes(p.id),repeated=credited.includes(p.id);
 if(success&&s.mode==='TEAMS'&&!assisted&&!repeated){scores[s.team]++;credited.push(p.id);}
 return{...s,board,remaining,played,selected:null,finished,earlyOpen,success,scores,credited,hintDepth:0,history:[...s.history,snapshot(s)],team:success&&s.mode==='TEAMS'?(s.team==='A'?'B':'A'):s.team,recent:`已合法接上${sevensCardName(card)}。${!finished&&opens?`但對方的${sevensCardName(p.opponent!)}已提前能出；可復原比較另一順序。`:finished&&!success?'牌已清完，但未達成暫緩開路目標。這不是非法出牌，可復原比較，不加分。':success?(assisted?'本題完成，提示練習不計分。':repeated?'本題完成，已計分不重複加分。':s.mode==='TEAMS'?`本題完成，${s.team} 組 +1 分，下一題換組。`:'本題完成，請說明前後依賴。'):'同組繼續，觀察有哪些牌現在能接。'}`};
};
export const undoSevens=(s:SevensSession):SevensSession=>{const prev=s.history.at(-1);return prev?{...s,...prev,history:s.history.slice(0,-1),revealed:[...s.revealed],recent:'已復原整次出牌、端點、手牌、開路結果、完成態、組別與分數；已看答案紀錄保留。'}:s;};
export const hintSevens=(s:SevensSession,p:SevensPuzzle):SevensSession=>{
 if(s.finished||s.puzzleId!==p.id)return s;const hintDepth=Math.min(3,s.hintDepth+1);
 if(hintDepth===1)return{...s,hintDepth,recent:'提示 1／3：先找各花色目前兩個端點；沒有開過的花色，要先出七。'};
 if(hintDepth===2)return{...s,hintDepth,recent:p.opponent?'提示 2／3：看看哪張自己的牌會讓對方指定牌接上。先處理其他路徑，最後才開這個端點。':'提示 2／3：較遠的數字需要先鋪路。同花色先接近端點的一張，再接下一張。'};
 const paths=solveSevensOrders({...p,board:s.board,hand:p.hand.filter(c=>s.remaining.includes(c.id)),targetMoves:p.targetMoves-s.played.length});
 const next=!s.earlyOpen?paths[0]?.[0]:undefined;
 return{...s,hintDepth,revealed:[...new Set([...s.revealed,p.id])],recent:next?`提示 3／3：目前可先出${sevensCardName(p.hand.find(c=>c.id===next)!)}，再觀察新端點。本題提示練習，不計分；仍須自行確認。`:'提示 3／3：目前已提前開路，請復原到對方指定牌尚未能出的時點，再先處理其他路徑。本題提示練習。'};
};
export const restartSevens=(s:SevensSession,p:SevensPuzzle,mode=s.mode):SevensSession=>({...createSevensSession(p,mode),team:mode===s.mode?s.team:'A',scores:mode===s.mode?{...s.scores}:{A:0,B:0},credited:mode===s.mode?[...s.credited]:[],revealed:[...s.revealed]});
