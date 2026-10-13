import type { HanoiPuzzle } from '../utils/hanoiRules';
export const HANOI_PUZZLES: HanoiPuzzle[] = [
  { id:'one-last-disk',tier:'BEGINNER',title:'最後一片歸位',focus:'讀懂已接近完成的盤面，說出盤號、來源與目的。',rods:[[1],[],[3,2]],target:2 },
  { id:'two-separated',tier:'BEGINNER',title:'兩片分在兩柱',focus:'先看哪片可以直接去目標柱，再接上另一片。',rods:[[2],[1],[]],target:2 },
  { id:'two-tower',tier:'BEGINNER',title:'兩片小塔',focus:'小片要先暫放一旁，才能搬動下面的大片。',rods:[[2,1],[],[]],target:2 },
  { id:'finish-small-stack',tier:'BEGINNER',title:'大盤已到家',focus:'3 號已在 C 柱，只要把小塔疊回它的上面。',rods:[[],[2,1],[3]],target:2 },
  { id:'three-full',tier:'STANDARD',title:'為最大盤清路',focus:'要讓 3 號移到 C，先把 1、2 號完整放在 B。',rods:[[3,2,1],[],[]],target:2 },
  { id:'large-ready',tier:'STANDARD',title:'子目標已完成',focus:'小塔已在 B。先移最大盤，再把小塔接回目標。',rods:[[3],[2,1],[]],target:2 },
  { id:'small-on-large',tier:'STANDARD',title:'還差一步清路',focus:'先判斷 1 號該去哪裡，才能把 3 號移到 C。',rods:[[3,1],[2],[]],target:2 },
  { id:'wrong-side-small',tier:'STANDARD',title:'重新安排暫存柱',focus:'小盤已先走一步，但放的位置是否方便組成 B 柱的小塔？',rods:[[3,2],[1],[]],target:2 },
  { id:'midgame-separated',tier:'CHALLENGE',title:'接手三柱分散局',focus:'比較兩個合法第一步：哪一步有助把 1、2、3 號集中到暫存柱？',rods:[[4,1],[3],[2]],target:2 },
  { id:'midgame-target-blocked',tier:'CHALLENGE',title:'目標柱也要清空',focus:'4 號去 C 之前，既要搬開它上面的盤，也要騰空 C。',rods:[[4,2],[1],[3]],target:2 },
  { id:'midgame-middle-large',tier:'CHALLENGE',title:'從中柱的大盤接續',focus:'最大盤在 B，但規則相同。先比較合法走法，再說兩步計畫。',rods:[[3,1],[4,2],[]],target:2 },
  { id:'midgame-nested',tier:'CHALLENGE',title:'分解剩餘的小塔',focus:'不要只把能去 C 的盤立刻送去；先想最大盤的路線。',rods:[[4],[3,1],[2]],target:2 },
];
