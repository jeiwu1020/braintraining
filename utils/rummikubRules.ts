export type RummiColor='red'|'blue'|'yellow'|'black';
export interface RummiTile{id:string;color:RummiColor;number:number}
export interface RummiPlan{id:string;label:string;groups:string[][]}
export interface RummiPuzzle{id:string;tier:'BEGINNER'|'STANDARD'|'CHALLENGE';title:string;focus:string;table:RummiTile[][];hand:RummiTile[];plans:RummiPlan[]}
export const rummiTileName=(tile:RummiTile)=>`${{red:'紅',blue:'藍',yellow:'黃',black:'黑'}[tile.color]}${tile.number}`;
export const isRummiGroup=(tiles:RummiTile[]):boolean=>{
 if(tiles.length<3||tiles.some(t=>!Number.isInteger(t.number)||t.number<1||t.number>13||!['red','blue','yellow','black'].includes(t.color)))return false;
 if(tiles.length<=4&&tiles.every(t=>t.number===tiles[0].number)&&new Set(tiles.map(t=>t.color)).size===tiles.length)return true;
 const sorted=[...tiles].sort((a,b)=>a.number-b.number);
 return sorted.every((t,i)=>t.color===sorted[0].color&&(i===0||t.number===sorted[i-1].number+1));
};
export const validateRummiPlan=(p:RummiPuzzle,groups:string[][]):{valid:boolean;placed:string[];reason:string}=>{
 const tiles=[...p.table.flat(),...p.hand],lookup=new Map(tiles.map(t=>[t.id,t]));
 const ids=groups.flat();
 if(lookup.size!==tiles.length||new Set(ids).size!==ids.length||ids.some(id=>!lookup.has(id)))return{valid:false,placed:[],reason:'每張實體牌只能用一次，不能複製或加入未公開的牌。'};
 if(p.table.flat().some(t=>!ids.includes(t.id)))return{valid:false,placed:[],reason:'原桌牌必須全部保留，不能把不方便的牌拿回手上。'};
 const invalid=groups.findIndex(group=>!isRummiGroup(group.map(id=>lookup.get(id)!)));
 if(invalid>=0)return{valid:false,placed:[],reason:`第 ${invalid+1} 組不合法：每組至少三張，必須同色連號或同數異色。`};
 return{valid:true,placed:p.hand.filter(t=>ids.includes(t.id)).map(t=>t.id),reason:'所有桌組合法，原桌牌都保留且沒有重複。'};
};
// Bounded exhaustive exact-cover solver. Curated tasks contain at most 13 public tiles.
export const solveRummiTable=(p:RummiPuzzle):{maxPlaced:number;plans:string[][][]}=>{
 const tiles=[...p.table.flat(),...p.hand],n=tiles.length;
 if(n>15||new Set(tiles.map(t=>t.id)).size!==n)return{maxPlaced:0,plans:[]};
 const valid:number[]=[];
 for(let mask=1;mask<(1<<n);mask++){
  const group=tiles.filter((_,i)=>mask&(1<<i));
  if(isRummiGroup(group))valid.push(mask);
 }
 const byFirst=tiles.map((_,i)=>valid.filter(mask=>mask&(1<<i)));
 const memo=new Map<number,number[][]>();
 const partitions=(mask:number):number[][]=>{
  if(!mask)return[[]];if(memo.has(mask))return memo.get(mask)!;
  const first=Math.log2(mask&-mask);const results:number[][]=[];
  for(const group of byFirst[first])if((group&mask)===group){
   for(const rest of partitions(mask^group)){results.push([group,...rest]);if(results.length>=32)break;}
   if(results.length>=32)break;
  }
  memo.set(mask,results);return results;
 };
 const tableCount=p.table.flat().length,tableMask=(1<<tableCount)-1;
 let maxPlaced=-1;const plans:string[][][]=[];
 for(let handMask=0;handMask<(1<<p.hand.length);handMask++){
  const count=handMask.toString(2).replace(/0/g,'').length;if(count<maxPlaced)continue;
  const matches=partitions(tableMask|(handMask<<tableCount));if(!matches.length)continue;
  if(count>maxPlaced){maxPlaced=count;plans.length=0;}
  plans.push(...matches.map(plan=>plan.map(group=>tiles.filter((_,i)=>group&(1<<i)).map(t=>t.id))));
 }
 return{maxPlaced:Math.max(0,maxPlaced),plans};
};
