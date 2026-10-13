import type{SevensPuzzle,SevensBoard,SevensCardData,SevensSuit}from'../utils/sevensRules';
const card=(text:string):SevensCardData=>({id:text,suit:({s:'spade',h:'heart',d:'diamond',c:'club'} as Record<string,SevensSuit>)[text[0]],rank:Number(text.slice(1))});
const task=(id:string,tier:SevensPuzzle['tier'],title:string,board:SevensBoard,hand:string,opponent?:string):SevensPuzzle=>({id,tier,title,focus:tier==='CHALLENGE'?'清完自己的公開手牌，並讓對方指定牌直到自己最後一手才有機會接上。':tier==='STANDARD'?'安排完整合法順序，前一張真的會改變下一張能否接上。':'選一張能接上桌面端點，或以七開出新花色的牌。',board,hand:hand.split(' ').map(card),targetMoves:tier==='BEGINNER'?1:hand.split(' ').length,opponent:opponent?card(opponent):undefined});
export const SEVENS_PUZZLES:SevensPuzzle[]=[
 task('seven-ends','BEGINNER','七的兩端',{spade:{min:7,max:7}},'s6 s8 s9 h8'),
 task('seven-open','BEGINNER','新花色先找七',{spade:{min:6,max:8}},'h7 h8 d6 s10'),
 task('seven-low','BEGINNER','小牌要依序接',{club:{min:2,max:7}},'c1 c10 c9 d8'),
 task('seven-high','BEGINNER','K 不能繞回 A',{diamond:{min:7,max:12}},'d13 d1 h12 c6'),
 task('seven-chain-three','STANDARD','先鋪路，再接五',{spade:{min:7,max:7},heart:{min:7,max:7}},'s6 s5 h8'),
 task('seven-two-chains','STANDARD','兩條路交錯完成',{spade:{min:7,max:7},heart:{min:7,max:7}},'s8 s9 h6 h5'),
 task('seven-new-suit','STANDARD','先開新花色',{spade:{min:7,max:7}},'d7 d6 d8 s6'),
 task('seven-five-moves','STANDARD','五手清完公開牌',{spade:{min:6,max:8},club:{min:7,max:7}},'s5 s4 s9 c8 c9'),
 task('seven-delay-low','CHALLENGE','五留到最後',{spade:{min:7,max:7},heart:{min:7,max:7}},'s6 s5 h8 h9','s4'),
 task('seven-delay-open','CHALLENGE','暫緩開新花色',{spade:{min:7,max:7},heart:{min:7,max:7}},'d7 s6 s5 h8','d8'),
 task('seven-delay-high','CHALLENGE','先處理別的路',{heart:{min:7,max:7},club:{min:7,max:7}},'h8 h9 c6 c5 s7','h10'),
 task('seven-delay-edge','CHALLENGE','接到二之前先想一想',{club:{min:4,max:7},diamond:{min:7,max:7}},'c3 c2 d8 d9 d6','c1'),
];
