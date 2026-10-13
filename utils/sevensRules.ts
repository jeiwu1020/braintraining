export type SevensSuit='spade'|'heart'|'diamond'|'club';
export interface SevensCardData{id:string;suit:SevensSuit;rank:number}
export type SevensBoard=Partial<Record<SevensSuit,{min:number;max:number}>>;
export interface SevensPuzzle{id:string;tier:'BEGINNER'|'STANDARD'|'CHALLENGE';title:string;focus:string;board:SevensBoard;hand:SevensCardData[];targetMoves:number;opponent?:SevensCardData}
export const sevensSuitName={spade:'黑桃',heart:'紅心',diamond:'方塊',club:'梅花'};
export const sevensCardName=(c:SevensCardData)=>`${sevensSuitName[c.suit]}${({1:'A',11:'J',12:'Q',13:'K'} as Record<number,string>)[c.rank]??c.rank}`;
export const isSevensPlayable=(board:SevensBoard,card:SevensCardData):boolean=>{
 if(!Number.isInteger(card.rank)||card.rank<1||card.rank>13||!Object.hasOwn(sevensSuitName,card.suit))return false;
 const row=board[card.suit];return row?card.rank===row.min-1||card.rank===row.max+1:card.rank===7;
};
export const applySevensCard=(board:SevensBoard,card:SevensCardData):SevensBoard|null=>{
 if(!isSevensPlayable(board,card))return null;const row=board[card.suit];
 return{...board,[card.suit]:row?{min:Math.min(row.min,card.rank),max:Math.max(row.max,card.rank)}:{min:7,max:7}};
};
export const solveSevensOrders=(p:SevensPuzzle):string[][]=>{
 const paths:string[][]=[];
 const visit=(board:SevensBoard,remaining:SevensCardData[],path:string[])=>{
  if(path.length===p.targetMoves){paths.push(path);return;}
  for(const card of remaining){const next=applySevensCard(board,card);if(!next)continue;
   if(p.opponent&&path.length+1<p.targetMoves&&isSevensPlayable(next,p.opponent))continue;
   visit(next,remaining.filter(c=>c.id!==card.id),[...path,card.id]);
  }
 };
 if(p.targetMoves>0&&p.targetMoves<=p.hand.length&&p.hand.length<=7)visit(p.board,p.hand,[]);
 return paths;
};
