import {chooseNimOpponent,legalNimMoves,type NimCommand,type NimOpponent,type NimPuzzle,type NimRule} from './nimRules';
interface NimSnapshot {piles:number[];selection:NimCommand|null;team:'A'|'B';scores:{A:number;B:number};credited:string[];opponentPending:boolean;result:'A'|'B'|'GROUP'|'OPPONENT'|null;steps:number;hintDepth:number;recent:string}
export interface NimSession extends NimSnapshot {puzzleId:string;mode:'COOP'|'TEAMS';rule:NimRule;opponent:NimOpponent;history:NimSnapshot[];revealed:string[];revision:number}
export const nimQuestionKey=(p:NimPuzzle,rule:NimRule)=>`${p.id}:${rule}`;
export const createNimSession=(p:NimPuzzle,mode:'COOP'|'TEAMS'='COOP'):NimSession=>({puzzleId:p.id,mode,rule:p.rule,opponent:p.tier==='BEGINNER'?'SIMPLE':'STRATEGIC',piles:[...p.piles],selection:null,team:'A',scores:{A:0,B:0},credited:[],opponentPending:false,result:null,steps:0,hintDepth:0,recent:'先說石堆、拿取數量與拿完後的剩數，再確認。',history:[],revealed:[],revision:0});
export const prepareNim=(s:NimSession,pileIndex:number,amount:number):NimSession=>{
 if(s.result||s.opponentPending||!Number.isInteger(pileIndex)||pileIndex<0||pileIndex>=s.piles.length||!Number.isInteger(amount)||amount<1)return s;
 return {...s,selection:{pileIndex,amount},recent:`預選 ${String.fromCharCode(65+pileIndex)} 堆拿 ${amount} 顆，剩 ${s.piles[pileIndex]-amount} 顆；確認後才移除。`};
};
const execute=(s:NimSession,p:NimPuzzle,command:NimCommand,opponent:boolean):NimSession=>{
 if(!legalNimMoves(s.piles).some(move=>move.pileIndex===command.pileIndex&&move.amount===command.amount))return {...s,recent:'這堆沒有這麼多石子，請重新選擇；尚未換組。'};
 const piles=[...s.piles];piles[command.pileIndex]-=command.amount;const finished=piles.every(n=>n===0);const moverWon=s.rule==='NORMAL';
 const other=s.team==='A'?'B':'A';const winner=finished?(s.mode==='TEAMS'?(moverWon?s.team:other):(opponent?(moverWon?'OPPONENT':'GROUP'):(moverWon?'GROUP':'OPPONENT'))):null;
 const key=nimQuestionKey(p,s.rule);const assisted=s.revealed.includes(key);const repeated=s.credited.includes(key);const scores={...s.scores};const credited=[...s.credited];
 if(winner&&s.mode==='TEAMS'&&!assisted&&!repeated){scores[winner as 'A'|'B']++;credited.push(key);}
 const {history,revision:_revision,revealed:_revealed,puzzleId:_id,mode:_mode,rule:_rule,opponent:_opponent,...snapshot}=s;
 const mover=opponent?'教學對手':s.mode==='TEAMS'?`${s.team} 組`:'合作組';const resultName=winner==='GROUP'?'合作組':winner==='OPPONENT'?'教學對手':`${winner} 組`;
 return {...s,piles,selection:null,team:s.mode==='TEAMS'?other:s.team,scores,credited,result:winner,opponentPending:!finished&&s.mode==='COOP'&&!opponent,steps:s.steps+1,hintDepth:0,history:[...history,snapshot],revision:s.revision+1,
 recent:`${mover}從 ${String.fromCharCode(65+command.pileIndex)} 堆拿 ${command.amount} 顆，剩 ${piles[command.pileIndex]} 顆。${finished?`${resultName}獲勝。${s.rule==='MISERE'?'拿最後一顆的那方落敗。':''}${assisted?'提示練習，不計分。':repeated?'本題同規則已計分，不重複加分。':''}`:s.mode==='COOP'&&!opponent?'先口述預測對手，再按「執行教學對手」。':''}`};
};
export const commitNim=(s:NimSession,p:NimPuzzle,revision:number):NimSession=>s.result||s.opponentPending||!s.selection||s.puzzleId!==p.id||s.revision!==revision?s:execute(s,p,s.selection,false);
export const playNimOpponent=(s:NimSession,p:NimPuzzle,revision:number):NimSession=>{
 if(s.result||!s.opponentPending||s.puzzleId!==p.id||s.revision!==revision)return s;
 const move=chooseNimOpponent(s.piles,s.rule,s.opponent);return move?execute(s,p,move,true):s;
};
export const undoNim=(s:NimSession):NimSession=>{const snapshot=s.history.at(-1);return snapshot?{...s,...snapshot,revealed:[...s.revealed],history:s.history.slice(0,-1),revision:s.revision+1,recent:'已復原整次拿取；石堆、預選、對手待行、輪組與分數一起還原，已看答案紀錄保留。'}:s;};
export const hintNim=(s:NimSession,p:NimPuzzle):NimSession=>{
 if(s.result||s.opponentPending||s.puzzleId!==p.id)return s;const hintDepth=Math.min(3,s.hintDepth+1);
 if(hintDepth===1)return {...s,hintDepth,recent:`提示 1／3：先說拿最後一顆的人${s.rule==='MISERE'?'輸':'贏'}。比較拿完之後各堆剩多少，不只看這次拿得多。`};
 if(hintDepth===2)return {...s,hintDepth,recent:s.rule==='MISERE'?'提示 2／3：若只剩一個大於 1 的堆，先數其他單顆堆；試想拿光和留一顆，哪種會讓對手最後拿到？':'提示 2／3：先看能否留下相同的兩堆，再想對手動一堆後如何回應；三堆不一定直接套用兩堆規則。'};
 const move=chooseNimOpponent(s.piles,s.rule,'STRATEGIC');if(!move)return s;
 return {...s,hintDepth,selection:move,revealed:[...new Set([...s.revealed,nimQuestionKey(p,s.rule)])],recent:`提示 3／3：可從 ${String.fromCharCode(65+move.pileIndex)} 堆拿 ${move.amount} 顆。已預選仍須確認；本題此規則改為提示練習，不計分。若起點為必敗態，提示也不保證勝利。`};
};
export const restartNim=(s:NimSession,p:NimPuzzle,rule=p.rule,mode=s.mode):NimSession=>({...createNimSession(p,mode),rule,opponent:s.opponent,team:mode===s.mode?s.team:'A',scores:mode===s.mode?{...s.scores}:{A:0,B:0},credited:mode===s.mode?[...s.credited]:[],revealed:[...s.revealed],revision:s.revision+1});
