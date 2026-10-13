import type{TenPuzzle,TenCard,TenSuit}from'../utils/chineseTenRules';
const card=(text:string):TenCard=>({id:text,suit:({s:'spade',h:'heart',d:'diamond',c:'club'}as Record<string,TenSuit>)[text[0]],rank:Number(text.slice(1))});
const task=(id:string,tier:TenPuzzle['tier'],title:string,table:string,hand:string,incoming?:string):TenPuzzle=>({id,tier,title,focus:tier==='CHALLENGE'?'下一張桌牌已公開：先比較兩次捕獲的總紅點，再選第一對。':tier==='STANDARD'?'可能有多對都合法，目標是這一次捕獲最多紅點。':'先找一張手牌與一張桌牌，說明湊十或同字，再確認收牌。',table:table.split(' ').map(card),hand:hand.split(' ').map(card),captures:tier==='CHALLENGE'?2:1,incoming:incoming?card(incoming):undefined});
export const TEN_PUZZLES:TenPuzzle[]=[
 task('ten-complement','BEGINNER','三配七，兩張都收','d7 s4 c8','h3 h7 c2 s6'),
 task('ten-fives','BEGINNER','五和五也是湊十','h5 c3 s9','d5 h4 c6'),
 task('ten-tens','BEGINNER','十要配十','d10 s6 c8','c10 h5 d3'),
 task('ten-faces','BEGINNER','J 配 J，不是配 K','h11 c12 s4','s11 d13 h3'),
 task('ten-max-red','STANDARD','合法不等於最多點','d8 s6 c13','d2 h4 s2 c7'),
 task('ten-ace-value','STANDARD','把黑桃 A 也算進去','s1 d7 c12','h9 h3 s12'),
 task('ten-face-choice','STANDARD','同字之後再算兩張','h13 d12 c10','s13 h12 s10'),
 task('ten-tied-best','STANDARD','兩種最高方案都接受','h8 d8 c6','h2 d2 s4'),
 task('ten-save-nine','CHALLENGE','先等公開的黑桃 A','h1 h6 c12','d9 c4 s3','s1'),
 task('ten-save-two','CHALLENGE','零點捕獲也可能值得','c8 c6 s12','h2 s4 d3','d8'),
 task('ten-save-king','CHALLENGE','K 先不要急著用','c13 c11 s5','h13 s11 d3','d13'),
 task('ten-save-five','CHALLENGE','先三點，再留十點','c5 d3 s12','h5 s7 d4','d5'),
];
