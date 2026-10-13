import{createEmptyBoard,type GoBoard,type Point}from'../services/goEngine';import type{GoLesson,GoLessonGoal}from'../utils/goLessonRules';
const pt=(r:number,c:number):Point=>({r,c});
const board=(size:number,black:number[][],white:number[][]):GoBoard=>{const b=createEmptyBoard(size);for(const[r,c]of black)b[r][c]='BLACK';for(const[r,c]of white)b[r][c]='WHITE';return b;};
const branch=(first:number[],...replies:number[][])=>({first:pt(first[0],first[1]),replies:replies.map(([r,c])=>pt(r,c))});
const task=(id:string,tier:GoLesson['tier'],title:string,prompt:string,b:GoBoard,goal:GoLessonGoal,branches:GoLesson['branches']):GoLesson=>({id,tier,title,prompt,board:b,goal,branches});
const eyeBoard=()=>{const black:number[][]=[];for(let c=1;c<=5;c++){if(c!==3)black.push([1,c]);black.push([3,c]);}black.push([2,1],[2,5]);return board(7,black,[[0,3]]);};
export const GO_LESSONS:GoLesson[]=[
 task('go-one-liberty','BEGINNER','封住最後一口氣','黑先：一步至少吃掉一顆白子。請先指出白子的最後一口氣。',board(5,[[1,2],[2,1],[3,2]],[[2,2]]),{kind:'CAPTURE',min:1},[branch([2,3]),branch([1,3])]),
 task('go-corner-liberty','BEGINNER','棋盤邊也算邊界','黑先：一步吃掉左上角白子。盤外沒有氣。',board(5,[[0,1]],[[0,0]]),{kind:'CAPTURE',min:1},[branch([1,0]),branch([1,1])]),
 task('go-connect-gap','BEGINNER','把兩塊接成一塊','黑先：一步連接 B3 與 D3 的黑子。斜角相鄰不算連接。',board(5,[[2,1],[2,3]],[]),{kind:'CONNECT',anchors:[pt(2,1),pt(2,3)]},[branch([2,2]),branch([1,2])]),
 task('go-rescue-corner','BEGINNER','延伸後再數氣','黑先：讓 A5 黑子所在的整塊至少有兩口氣。',board(5,[[0,0]],[[0,1]]),{kind:'LIBERTIES',anchor:pt(0,0),min:2},[branch([1,0]),branch([2,0])]),
 task('go-follow-capture','STANDARD','叫吃後追下一口氣','黑先，治療者展示指定白方逃法後，黑再下一手，合計吃掉至少兩顆白子。',board(5,[[1,2],[2,1],[1,3],[3,3],[3,1]],[[2,2]]),{kind:'CAPTURE',min:2},[branch([3,2],[2,3]),branch([2,3],[3,2])]),
 task('go-rescue-connect','STANDARD','先救子，再找新氣','黑先：讓 C5 黑子保留下來，白方應手後再下一手，使整塊至少五口氣。',board(7,[[2,2],[4,2]],[[1,2],[2,1],[2,3]]),{kind:'LIBERTIES',anchor:pt(2,2),min:5},[branch([3,2],[3,1]),branch([4,3],[3,2])]),
 task('go-two-link','STANDARD','連接需要兩步','黑先：觀察白方指定應手，再連接 B5 與 E5 兩塊黑棋。',board(7,[[2,1],[2,4]],[]),{kind:'CONNECT',anchors:[pt(2,1),pt(2,4)]},[branch([2,2],[1,2]),branch([2,3],[1,3])]),
 task('go-eye-center','STANDARD','大空間不等於兩眼','黑先：在展示的白方應手後，讓 B6 黑棋所在整塊形成至少兩個獨立單點眼。',eyeBoard(),{kind:'EYES',anchor:pt(1,1),min:2},[branch([2,3],[1,3]),branch([1,3],[0,2])]),
 task('go-capture-branches','CHALLENGE','比較先封哪條退路','比較候選首手；展示白方一種回應後，再用一手達成至少吃兩顆白子的目標。可復原換另一種回應。',board(7,[[2,3],[2,4],[3,2],[4,4],[2,5],[4,5],[4,2]],[[3,3],[3,4]]),{kind:'CAPTURE',min:2},[branch([4,3],[3,5],[0,0]),branch([0,0],[3,5])]),
 task('go-rescue-branches','CHALLENGE','先延伸還是先走別處','保住 D5 黑棋；在白方兩種指定壓迫之一後，下一手使整塊至少六口氣。',board(9,[[4,3],[4,5]],[[3,3],[5,3],[4,2]]),{kind:'LIBERTIES',anchor:pt(4,3),min:6},[branch([4,4],[3,4],[5,4]),branch([6,5],[4,4])]),
 task('go-connect-counterexample','CHALLENGE','斜著靠近，還是直接鋪路','黑先，白方應手後再下一手，連接 C5 與 F5。比較看似靠近與真的連通。',board(9,[[4,2],[4,5]],[[2,3]]),{kind:'CONNECT',anchors:[pt(4,2),pt(4,5)]},[branch([4,3],[3,3],[3,4]),branch([5,2],[3,3])]),
 task('go-two-eyes-counterexample','CHALLENGE','填中央與填一邊的差別','比較 D5 與 C5 兩個候選；白方在缺口應手後，再讓 B6 黑棋形成兩個獨立單點眼。',eyeBoard(),{kind:'EYES',anchor:pt(1,1),min:2},[branch([2,3],[1,3]),branch([2,2],[1,3])]),
];
