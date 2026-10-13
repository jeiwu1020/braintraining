export type MatchstickTier = 'BEGINNER' | 'STANDARD' | 'CHALLENGE';
export interface MatchstickPuzzle {
  id: string; tier: MatchstickTier; equation: string; title: string;
  guidedSource?: string; goal: number; observation: string;
}

// Every item is exhaustively checked by tests/matchstickRules.test.ts.
// Solutions are derived from physical segments; this bank does not prescribe a single answer.
export const MATCHSTICK_PUZZLES: MatchstickPuzzle[] = [
  { id: 'beginner-operator', tier: 'BEGINNER', equation: '6+4=4', title: '符號和數字一起變', guidedSource: 'B2', goal: 1, observation: '加號拿走直棒會變成減號；哪個數字補一棒後，減法就成立？' },
  { id: 'beginner-within', tier: 'BEGINNER', equation: '1+1=3', title: '在一個數字裡搬家', guidedSource: 'E3', goal: 1, observation: '左邊一加一是多少？觀察右邊的數字，能把右下段搬去哪裡？' },
  { id: 'beginner-across', tier: 'BEGINNER', equation: '1+6=5', title: '兩個數字互相幫忙', guidedSource: 'C5', goal: 1, observation: '中間的 6 拿走左下段會變成 5；右邊補一棒後要是多少？' },
  { id: 'beginner-addition', tier: 'BEGINNER', equation: '1-7=2', title: '讓減號得到一棒', guidedSource: 'C1', goal: 1, observation: '7 拿走上段會變成 1；什麼運算能讓兩個 1 得到 2？' },
  { id: 'standard-within', tier: 'STANDARD', equation: '1+3=6', title: '換個位置看數字', goal: 1, observation: '先算右邊的 6 需要怎樣的加法。可以只改一個數字的形狀嗎？' },
  { id: 'standard-across', tier: 'STANDARD', equation: '1+2=8', title: '兩邊都要重新算', goal: 1, observation: '有些數字拿走一棒仍是數字；另一個數字補上後，也會改變兩邊的值。' },
  { id: 'standard-operator', tier: 'STANDARD', equation: '2-3=6', title: '運算也可以改變', goal: 1, observation: '不要只看數字；減號補一根直棒會怎樣？剩下的數字仍要合法。' },
  { id: 'standard-balance', tier: 'STANDARD', equation: '9+3=5', title: '先預測，再驗算', goal: 1, observation: '先說出一個拿走後仍合法的符號，再預測補一棒的數字。等號保持不動。' },
  { id: 'challenge-two-ways', tier: 'CHALLENGE', equation: '1+2=5', title: '同一道題，兩條路', goal: 2, observation: '一種方法可保留加號，另一種方法會改變它。每次都從原題重新移一棒。' },
  { id: 'challenge-transfer', tier: 'CHALLENGE', equation: '1-2=9', title: '同一數字，不同去處', goal: 2, observation: '留意右邊的 9：拿走不同位置，能把火柴送往不同符號。' },
  { id: 'challenge-transform', tier: 'CHALLENGE', equation: '3+2=7', title: '保留或改變運算', goal: 2, observation: '左邊的數字有不只一種變法。比較保持加法與改成減法兩條路。' },
  { id: 'challenge-zero', tier: 'CHALLENGE', equation: '1-8=7', title: '比較兩種移法', goal: 2, observation: '8 拿走一棒可變成不同數字，包含 0；比較火柴移往數字或運算符號。' },
];
