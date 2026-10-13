import type{MahjongPuzzle,MeldTile}from '../utils/mahjongRules';
const t=(value:number,suit:MeldTile['suit']='wan'):MeldTile=>({value,suit});
const options=(values:number[],suit:MeldTile['suit']='wan')=>values.map(value=>t(value,suit));
export const MAHJONG_PUZZLES:MahjongPuzzle[]=[
 {id:'learn-gap',tier:'BEGINNER',title:'中間缺一張',focus:'同花色的三個連號才能組成順子，先找缺的中間數字。',group:'RUN',hand:[t(2),t(4)],options:[...options([1,3,5]),t(3,'tong')]},
 {id:'learn-triplet',tier:'BEGINNER',title:'三張要一樣',focus:'刻子要三張花色與數字都相同，不是數字相近。',group:'TRIPLET',hand:[t(5,'tiao'),t(5,'tiao')],options:[...options([4,5,6],'tiao'),t(5,'wan')]},
 {id:'learn-pair',tier:'BEGINNER',title:'找一對紅中',focus:'本題只湊兩張相同的雀頭，不需要第三張。',group:'PAIR',hand:[t(5,'zi')],options:options([1,5,6,7],'zi')},
 {id:'learn-edge',tier:'BEGINNER',title:'八九前面接什麼',focus:'數字不會從九接回一；請在同花色裡找連號。',group:'RUN',hand:[t(8,'tong'),t(9,'tong')],options:[...options([1,6,7],'tong'),t(7,'wan')]},
 {id:'all-open-wan',tier:'STANDARD',title:'兩端都能接',focus:'找出所有可讓三萬、四萬組成順子的候選，不只選第一個找到的。',group:'RUN',hand:[t(3),t(4)],options:[...options([1,2,3,5,6]),t(2,'tong')]},
 {id:'all-open-tong',tier:'STANDARD',title:'另一種雙面等待',focus:'六筒、七筒的兩端各能補哪張？兩種都要選。',group:'RUN',hand:[t(6,'tong'),t(7,'tong')],options:[...options([4,5,6,8,9],'tong'),t(8,'tiao')]},
 {id:'all-edge',tier:'STANDARD',title:'邊界沒有零',focus:'一條、二條看起來也相鄰，但左邊是否真的有可補的牌？',group:'RUN',hand:[t(1,'tiao'),t(2,'tiao')],options:[...options([1,3,4,5],'tiao'),t(3,'tong')]},
 {id:'all-closed',tier:'STANDARD',title:'隔一格的等待',focus:'三萬、五萬缺中間；不要把能接在外側的數字也算進來。',group:'RUN',hand:[t(3),t(5)],options:[...options([2,4,6,7]),t(4,'tong')]},
 {id:'keep-open',tier:'CHALLENGE',title:'捨牌後保留兩條路',focus:'局部搭子小題：捨一張，讓剩下兩張可由最多不同牌種補成順子。',group:'RUN',hand:[t(3),t(4),t(6)],options:options([1,2,4,5,6,7])},
 {id:'tied-open',tier:'CHALLENGE',title:'兩種同樣好的保留',focus:'不一定只有一張可捨。先比較所有保留方案，再找完整進張。',group:'RUN',hand:[t(2,'tong'),t(3,'tong'),t(4,'tong')],options:options([1,2,3,4,5,6],'tong')},
 {id:'tied-one',tier:'CHALLENGE',title:'邊界與中間同分',focus:'有些方案都只剩一種進張；若同樣最多，都可以成立。',group:'RUN',hand:[t(1,'tiao'),t(2,'tiao'),t(4,'tiao')],options:options([1,2,3,4,5,6],'tiao')},
 {id:'keep-high-open',tier:'CHALLENGE',title:'高數字也要看兩端',focus:'先捨一張，再逐一說出剩下搭子的全部進張。比較的是牌種數，不是實際摸到機率。',group:'RUN',hand:[t(5),t(7),t(8)],options:options([1,4,5,6,7,9])},
];
