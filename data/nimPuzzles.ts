import type {NimPuzzle} from '../utils/nimRules';
export const NIM_PUZZLES:NimPuzzle[]=[
 {id:'one-last',tier:'BEGINNER',title:'只剩最後一顆',focus:'先確認目前規則：拿最後一顆是勝還是負？選有石子的堆，再確認。',piles:[0,1],rule:'NORMAL'},
 {id:'unequal-pair',tier:'BEGINNER',title:'兩堆不一樣多',focus:'拿完後兩堆各剩多少？先算剩數，再做決定。',piles:[1,2],rule:'NORMAL'},
 {id:'equal-pair',tier:'BEGINNER',title:'兩堆一樣多',focus:'兩堆相同時，先手能保證獲勝嗎？觀察對手如何回應。',piles:[2,2],rule:'NORMAL'},
 {id:'long-short',tier:'BEGINNER',title:'比較拿一顆與拿兩顆',focus:'兩種拿法會留下不同盤面；把剩數說給另一位核對。',piles:[1,3],rule:'NORMAL'},
 {id:'three-balanced',tier:'STANDARD',title:'對手也會思考',focus:'先預測對手可從哪一堆拿；起點不保證先手能贏，重點是比較回應。',piles:[1,2,3],rule:'NORMAL'},
 {id:'three-choice',tier:'STANDARD',title:'留給對手的三堆',focus:'比較從最大堆拿一顆和拿數顆，別只追求拿得多。',piles:[1,2,4],rule:'NORMAL'},
 {id:'paired-large',tier:'STANDARD',title:'保留相同兩堆',focus:'哪些走法能留下一對相同的堆？請預測對手下一手。',piles:[1,3,3],rule:'NORMAL'},
 {id:'three-mixed',tier:'STANDARD',title:'每堆都不相同',focus:'先提出一種拿法及對手回應，再考慮另一種合法拿法。',piles:[2,3,4],rule:'NORMAL'},
 {id:'rule-two-ones',tier:'CHALLENGE',title:'最後一大堆與兩個一',focus:'保持同樣石堆，只換最後一顆勝負規則；原本的策略還成立嗎？',piles:[1,1,2],rule:'MISERE'},
 {id:'rule-bigger-tail',tier:'CHALLENGE',title:'大堆應留下多少',focus:'若拿最後一顆會輸，最後的大堆該拿光還是留一顆？先數其他單顆堆。',piles:[1,1,3],rule:'MISERE'},
 {id:'rule-one-singleton',tier:'CHALLENGE',title:'少一個單顆堆',focus:'與兩個單顆堆比較，現在只有一個；同樣留下策略是否適用？',piles:[0,1,3],rule:'MISERE'},
 {id:'rule-four-piles',tier:'CHALLENGE',title:'三個單顆堆的反例',focus:'最後的大堆若只留一顆，輪流拿完後誰會拿到最後？',piles:[1,1,1,2],rule:'MISERE'},
];
