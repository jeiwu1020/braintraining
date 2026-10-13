export type TenSuit='spade'|'heart'|'diamond'|'club';
export interface TenCard{id:string;suit:TenSuit;rank:number}
export interface TenMove{handId:string;tableId:string}
export interface TenPuzzle{id:string;tier:'BEGINNER'|'STANDARD'|'CHALLENGE';title:string;focus:string;hand:TenCard[];table:TenCard[];captures:1|2;incoming?:TenCard}
export const tenSuitName={spade:'黑桃',heart:'紅心',diamond:'方塊',club:'梅花'};
export const tenCardName=(c:TenCard)=>`${tenSuitName[c.suit]}${({1:'A',11:'J',12:'Q',13:'K'} as Record<number,string>)[c.rank]??c.rank}`;
const valid=(c:TenCard)=>Number.isInteger(c.rank)&&c.rank>=1&&c.rank<=13&&Object.hasOwn(tenSuitName,c.suit);
export const canCaptureTen=(a:TenCard,b:TenCard):boolean=>valid(a)&&valid(b)&&(a.rank<10&&b.rank<10?a.rank+b.rank===10:a.rank===b.rank&&a.rank>=10);
export const tenPoints=(c:TenCard):number=>{
 if(!valid(c))return 0;if(c.suit==='spade'&&c.rank===1)return 30;
 if(c.suit!=='heart'&&c.suit!=='diamond')return 0;
 return c.rank===1?20:c.rank>=9?10:c.rank;
};
export const solveTenCaptures=(p:TenPuzzle):{maxPoints:number;plans:TenMove[][]}=>{
 let maxPoints=-1;const plans:TenMove[][]=[];
 const visit=(hand:TenCard[],table:TenCard[],path:TenMove[],points:number)=>{
  if(path.length===p.captures){if(points>maxPoints){maxPoints=points;plans.length=0;}if(points===maxPoints)plans.push(path);return;}
  for(const h of hand)for(const t of table)if(canCaptureTen(h,t)){
   const nextTable=table.filter(c=>c.id!==t.id);if(path.length===0&&p.incoming)nextTable.push(p.incoming);
   visit(hand.filter(c=>c.id!==h.id),nextTable,[...path,{handId:h.id,tableId:t.id}],points+tenPoints(h)+tenPoints(t));
  }
 };
 visit(p.hand,p.table,[],0);return{maxPoints:Math.max(0,maxPoints),plans};
};
