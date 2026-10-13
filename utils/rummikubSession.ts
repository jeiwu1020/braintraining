import{rummiTileName,solveRummiTable,validateRummiPlan,type RummiPuzzle}from'./rummikubRules';
interface RummiSnapshot{hand:string[];plan:string|null;team:'A'|'B';scores:{A:number;B:number};credited:string[];finished:boolean;hintDepth:number;recent:string}
export interface RummiSession extends RummiSnapshot{puzzleId:string;mode:'COOP'|'TEAMS';history:RummiSnapshot[];revealed:string[]}
export const createRummiSession=(p:RummiPuzzle,mode:'COOP'|'TEAMS'='COOP'):RummiSession=>({puzzleId:p.id,mode,hand:[],plan:null,team:'A',scores:{A:0,B:0},credited:[],finished:false,hintDepth:0,recent:'先說牌組規則，預選手牌與整桌方案，再確認提交。',history:[],revealed:[]});
const snapshot=({puzzleId:_id,mode:_mode,history:_history,revealed:_knowledge,...s}:RummiSession):RummiSnapshot=>s;
export const selectRummiHand=(s:RummiSession,p:RummiPuzzle,id:string):RummiSession=>{
 if(s.finished||s.puzzleId!==p.id||p.tier==='STANDARD'||!p.hand.some(t=>t.id===id))return s;
 const hand=p.tier==='BEGINNER'?(s.hand.includes(id)?[]:[id]):s.hand.includes(id)?s.hand.filter(value=>value!==id):[...s.hand,id];
 const plan=p.tier==='BEGINNER'?(hand.length?p.plans.find(plan=>plan.groups.flat().includes(id))?.id??null:null):s.plan;
 return{...s,hand,plan,recent:'已預選手牌，桌面尚未改動；請核對整桌方案後確認。'};
};
export const selectRummiPlan=(s:RummiSession,p:RummiPuzzle,id:string):RummiSession=>s.finished||s.puzzleId!==p.id||!p.plans.some(plan=>plan.id===id)?s:{...s,plan:id,recent:'已預選整桌方案；請逐組說出是否合法，再確認。'};
export const confirmRummi=(s:RummiSession,p:RummiPuzzle):RummiSession=>{
 if(s.finished||s.puzzleId!==p.id||!s.plan)return s;
 const plan=p.plans.find(plan=>plan.id===s.plan);if(!plan)return s;
 const result=validateRummiPlan(p,plan.groups);
 if(!result.valid)return{...s,recent:result.reason+' 請再比較，不換組、不計分。'};
 if(p.tier!=='STANDARD'&&(result.placed.length!==s.hand.length||result.placed.some(id=>!s.hand.includes(id))))return{...s,recent:'預選手牌與方案中實際放出的手牌不一致，請逐張核對；尚未提交。'};
 const goal=p.tier==='BEGINNER'?1:solveRummiTable(p).maxPlaced;
 if(result.placed.length!==goal)return{...s,recent:'這個完整桌面合法，但還有方案能放出更多手牌；請繼續比較。'};
 const scores={...s.scores},credited=[...s.credited],assisted=s.revealed.includes(p.id),repeated=credited.includes(p.id);
 if(s.mode==='TEAMS'&&!assisted&&!repeated){scores[s.team]++;credited.push(p.id);}
 return{...s,history:[...s.history,snapshot(s)],finished:true,scores,credited,team:s.mode==='TEAMS'?(s.team==='A'?'B':'A'):s.team,recent:`整桌合法，放出 ${result.placed.length} 張手牌。${assisted?'提示練習，不計分。':repeated?'本題已計分，不重複加分。':s.mode==='TEAMS'?`${s.team} 組 +1 分，下一題換組。`:'請說明每組成立的規則。'}`};
};
export const hintRummi=(s:RummiSession,p:RummiPuzzle):RummiSession=>{
 if(s.finished||s.puzzleId!==p.id)return s;const hintDepth=Math.min(3,s.hintDepth+1);
 if(hintDepth===1)return{...s,hintDepth,recent:'提示 1／3：每組至少三張。同色連號，或同數不同色；十三不能接回一。'};
 if(hintDepth===2)return{...s,hintDepth,recent:'提示 2／3：先圈出原桌牌，檢查是否全都保留且只用一次。借牌後的殘組也要至少三張，再數能放出的手牌。'};
 const goal=p.tier==='BEGINNER'?1:solveRummiTable(p).maxPlaced;
 const plan=p.plans.find(plan=>{const result=validateRummiPlan(p,plan.groups);return result.valid&&result.placed.length===goal;});
 if(!plan)return s;const used=validateRummiPlan(p,plan.groups).placed;
 return{...s,hintDepth,revealed:[...new Set([...s.revealed,p.id])],recent:`提示 3／3：可用${plan.label}，放出${p.hand.filter(t=>used.includes(t.id)).map(rummiTileName).join('、')}，共 ${goal} 張。請自行選牌與確認，本題提示練習，不計分。`};
};
export const undoRummi=(s:RummiSession):RummiSession=>{const previous=s.history.at(-1);return previous?{...s,...previous,history:s.history.slice(0,-1),revealed:[...s.revealed],recent:'已復原整桌提交、預選、組別、分數及完成態；已看答案紀錄保留。'}:s;};
export const restartRummi=(s:RummiSession,p:RummiPuzzle,mode=s.mode):RummiSession=>({...createRummiSession(p,mode),team:mode===s.mode?s.team:'A',scores:mode===s.mode?{...s.scores}:{A:0,B:0},credited:mode===s.mode?[...s.credited]:[],revealed:[...s.revealed]});
