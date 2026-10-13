import{mahjongCompletions,mahjongDiscardOptions,meldTileKey,meldTileName,type MahjongPuzzle}from'./mahjongRules';
interface MahjongSnapshot{stage:'DISCARD'|'COMPLETIONS';discard:number|null;selected:string[];team:'A'|'B';scores:{A:number;B:number};credited:string[];finished:boolean;hintDepth:number;recent:string}
export interface MahjongSession extends MahjongSnapshot{puzzleId:string;mode:'COOP'|'TEAMS';history:MahjongSnapshot[];revealed:string[]}
export const createMahjongSession=(p:MahjongPuzzle,mode:'COOP'|'TEAMS'='COOP'):MahjongSession=>({puzzleId:p.id,mode,stage:p.tier==='CHALLENGE'?'DISCARD':'COMPLETIONS',discard:null,selected:[],team:'A',scores:{A:0,B:0},credited:[],finished:false,hintDepth:0,recent:p.tier==='CHALLENGE'?'先選要捨哪張，確認後再找剩餘搭子的全部進張。':'先說組牌規則，選出所有合法候選，再一起確認。',history:[],revealed:[]});
const snapshot=({history:_history,revealed:_revealed,puzzleId:_id,mode:_mode,...s}:MahjongSession):MahjongSnapshot=>s;
export const selectMahjongTile=(s:MahjongSession,key:string):MahjongSession=>s.finished||s.stage!=='COMPLETIONS'?s:{...s,selected:s.selected.includes(key)?s.selected.filter(value=>value!==key):[...s.selected,key],recent:'已預選候選牌；尚未提交或換組。'};
export const selectMahjongDiscard=(s:MahjongSession,index:number):MahjongSession=>s.finished||s.stage!=='DISCARD'||!Number.isInteger(index)||index<0||index>2?s:{...s,discard:s.discard===index?null:index,recent:`預選捨第 ${index+1} 張，請先說明要保留的兩張。`};
export const confirmMahjong=(s:MahjongSession,p:MahjongPuzzle):MahjongSession=>{
 if(s.finished||s.puzzleId!==p.id)return s;
 if(s.stage==='DISCARD'){
  if(s.discard===null)return s;const option=mahjongDiscardOptions(p.hand)[s.discard];
  if(!option?.completions.length)return{...s,recent:'剩下的兩張補一張也無法組成順子；請重新比較捨牌。'};
  return{...s,stage:'COMPLETIONS',selected:[],hintDepth:0,history:[...s.history,snapshot(s)],recent:`已捨第 ${s.discard+1} 張${meldTileName(p.hand[s.discard])}。同組繼續，請找全部可補成順子的候選。`};
 }
 if(!s.selected.length)return s;
 const hand=s.discard===null?p.hand:p.hand.filter((_,index)=>index!==s.discard);
 const expected=mahjongCompletions(hand,p.group).map(meldTileKey);
 const offered=p.options.map(meldTileKey);
 if(s.selected.length!==expected.length||s.selected.some(key=>!expected.includes(key)||!offered.includes(key)))return{...s,recent:'選牌仍不完整，或包含不能組成目標的牌。請逐張核對花色與數字，不換組、不計分。'};
 if(p.tier==='CHALLENGE'&&!mahjongDiscardOptions(p.hand)[s.discard!]?.best)return{...s,recent:'這個搭子合法，但還有可保留更多不同進張的捨法；請按「重選捨牌」再比較。'};
 const assisted=s.revealed.includes(p.id);const repeated=s.credited.includes(p.id);const scores={...s.scores};const credited=[...s.credited];
 if(s.mode==='TEAMS'&&!assisted&&!repeated){scores[s.team]++;credited.push(p.id);}
 return{...s,history:[...s.history,snapshot(s)],scores,credited,finished:true,team:s.mode==='TEAMS'?(s.team==='A'?'B':'A'):s.team,recent:`全部合法進張已找齊：${mahjongCompletions(hand,p.group).map(meldTileName).join('、')}。${assisted?'提示練習，不計分。':repeated?'本題已計分，不重複加分。':s.mode==='TEAMS'?`${s.team} 組 +1 分，下一題換組。`:'請一起說出每種組合。'}`};
};
export const reselectMahjongDiscard=(s:MahjongSession):MahjongSession=>s.finished||s.discard===null?s:{...s,stage:'DISCARD',selected:[],history:[...s.history,snapshot(s)],recent:'重新比較要捨的牌，分數與組別不變。'};
export const undoMahjong=(s:MahjongSession):MahjongSession=>{const previous=s.history.at(-1);return previous?{...s,...previous,history:s.history.slice(0,-1),revealed:[...s.revealed],recent:'已復原整個確認階段、預選、完成態、輪組與分數；已看答案紀錄保留。'}:s;};
export const hintMahjong=(s:MahjongSession,p:MahjongPuzzle):MahjongSession=>{
 if(s.finished||s.puzzleId!==p.id)return s;const hintDepth=Math.min(3,s.hintDepth+1);
 if(hintDepth===1)return{...s,hintDepth,recent:'提示 1／3：先核對目標是順子、刻子還是雀頭。順子同花色且連號，刻子三張相同，雀頭兩張相同。'};
 if(hintDepth===2)return{...s,hintDepth,recent:p.tier==='CHALLENGE'?'提示 2／3：把每一張輪流當作捨牌，分別比較留下兩張的兩端與中間，數不同可補牌種。':'提示 2／3：相鄰兩張先查兩端，隔一張查中間；一與九不能越界，字牌不能組順子。'};
 const best=p.tier==='CHALLENGE'?mahjongDiscardOptions(p.hand).find(item=>item.best)!:null;
 if(best&&s.stage==='COMPLETIONS'&&!mahjongDiscardOptions(p.hand)[s.discard!]?.best)return{...s,hintDepth,revealed:[...new Set([...s.revealed,p.id])],recent:`提示 3／3：另一方案可捨第 ${best.index+1} 張，留下 ${best.completions.length} 種進張。請按「重選捨牌」自行確認，不會直接改寫已捨的牌；本題提示練習。`};
 const discard=best?(s.stage==='COMPLETIONS'?s.discard:best.index):null;
 const hand=discard===null?p.hand:p.hand.filter((_,index)=>index!==discard);const completions=mahjongCompletions(hand,p.group);
 return{...s,hintDepth,discard,selected:s.stage==='COMPLETIONS'?completions.map(meldTileKey):[],revealed:[...new Set([...s.revealed,p.id])],recent:`提示 3／3：${discard===null?'':`可捨第 ${discard+1} 張${meldTileName(p.hand[discard])}，`}進張是${completions.map(meldTileName).join('、')}。仍須確認，本題為提示練習，不計分。`};
};
export const restartMahjong=(s:MahjongSession,p:MahjongPuzzle,mode=s.mode):MahjongSession=>({...createMahjongSession(p,mode),team:mode===s.mode?s.team:'A',scores:mode===s.mode?{...s.scores}:{A:0,B:0},credited:mode===s.mode?[...s.credited]:[],revealed:[...s.revealed]});
