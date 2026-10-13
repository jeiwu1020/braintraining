export type LogicTier = 'BEGINNER' | 'STANDARD' | 'CHALLENGE';
export type LogicClue =
  | { kind: 'MATCH'; person: number; choice: number; relation: 'IS' | 'NOT' }
  | { kind: 'OPTIONS'; person: number; choices: readonly number[] }
  | { kind: 'ORDER'; earlier: number; later: number; gap?: number }
  | { kind: 'EXACTLY_ONE'; options: readonly { person: number; choice: number }[] };

export interface LogicPuzzle {
  id: string; tier: LogicTier; title: string; strategy: string;
  people: readonly string[]; choices: readonly string[]; solution: readonly number[];
  clues: readonly LogicClue[];
  observation: string; inference: string;
  demonstration: { row: number; col: number; mark: 'YES' | 'NO'; reason: string };
  /** Choices are in chronological order for ORDER clues. */
  ordered?: boolean;
  /** Compare complete, one-to-one assignments; reject one using an existing clue. */
  candidates?: readonly (readonly number[])[];
}

// Small, authored structures, exhaustively verified by the permutation solver.
// Difficulty is the kind of inference, never extra grid rows or smaller text.
export const LOGIC_PUZZLES: readonly LogicPuzzle[] = [
  {
    id: 'beginner-drinks', tier: 'BEGINNER', title: '飲品時間', strategy: '肯定後排除',
    people: ['小安', '小美', '阿康'], choices: ['茶', '牛奶', '果汁'], solution: [1,2,0],
    clues: [{ kind: 'MATCH', person: 0, choice: 1, relation: 'IS' }, { kind: 'MATCH', person: 1, choice: 0, relation: 'NOT' }],
    observation: '找一句直接說出人物選擇的線索。圈代表確認，叉代表排除。',
    inference: '第 1 條先確定一杯飲品的主人。每杯只給一人，再看第 2 條能排除什麼。',
    demonstration: { row: 0, col: 1, mark: 'YES', reason: '第 1 條直接說小安選牛奶，所以 B1 可確認。' },
  },
  {
    id: 'beginner-fruit', tier: 'BEGINNER', title: '水果分享', strategy: '兩個肯定留一個',
    people: ['阿芳', '小傑', '美玲'], choices: ['蘋果', '香蕉', '葡萄'], solution: [2,0,1],
    clues: [{ kind: 'MATCH', person: 1, choice: 0, relation: 'IS' }, { kind: 'MATCH', person: 2, choice: 1, relation: 'IS' }],
    observation: '兩條線索各說出一個配對。先讀其中一條，再找同名的人和水果。',
    inference: '小傑和美玲各占了一種水果；阿芳只能用尚未分配的那一種。',
    demonstration: { row: 1, col: 0, mark: 'YES', reason: '第 1 條直接說小傑選蘋果，所以 A2 可確認。' },
  },
  {
    id: 'beginner-activities', tier: 'BEGINNER', title: '休閒活動', strategy: '兩次否定縮小範圍',
    people: ['志明', '春嬌', '麗華'], choices: ['散步', '唱歌', '拼圖'], solution: [2,1,0],
    clues: [{ kind: 'MATCH', person: 0, choice: 0, relation: 'NOT' }, { kind: 'MATCH', person: 0, choice: 1, relation: 'NOT' }, { kind: 'MATCH', person: 1, choice: 0, relation: 'NOT' }],
    observation: '「沒有選」只要畫叉。先找指向同一個人的兩條線索。',
    inference: '第 1、2 條排除了志明的兩種活動；每人只選一種，第三種還能排除嗎？',
    demonstration: { row: 0, col: 0, mark: 'NO', reason: '第 1 條說志明沒有選散步，所以 A1 應排除。' },
  },
  {
    id: 'standard-work', tier: 'STANDARD', title: '社區分工', strategy: '兩人占兩項',
    people: ['小安', '小美', '阿康', '阿珠'], choices: ['洗菜', '切菜', '煮湯', '擺盤'], solution: [0,1,2,3],
    clues: [{ kind: 'OPTIONS', person: 0, choices: [0,1] }, { kind: 'OPTIONS', person: 1, choices: [0,1] }, { kind: 'OPTIONS', person: 2, choices: [1,2] }, { kind: 'MATCH', person: 0, choice: 1, relation: 'NOT' }],
    observation: '第 1、2 條提到相同的兩項工作。這兩人合起來會占掉哪些選項？',
    inference: '小安、小美合起來必須占洗菜和切菜。因此阿康不能再切菜；配合第 3 條，還剩哪項工作？',
    demonstration: { row: 2, col: 2, mark: 'YES', reason: '第 1、2 條把洗菜和切菜留給小安、小美；第 3 條讓阿康只能煮湯，所以 C3 可確認。' },
  },
  {
    id: 'standard-time', tier: 'STANDARD', title: '活動時段', strategy: '相鄰順序與排除',
    people: ['阿芳', '志明', '麗華', '大同'], choices: ['9時', '10時', '11時', '12時'], solution: [1,2,3,0], ordered: true,
    clues: [{ kind: 'ORDER', earlier: 0, later: 1, gap: 1 }, { kind: 'OPTIONS', person: 0, choices: [1,2] }, { kind: 'MATCH', person: 2, choice: 0, relation: 'NOT' }, { kind: 'MATCH', person: 1, choice: 3, relation: 'NOT' }],
    observation: '時間由左到右排列。先比較阿芳的兩個可能時段，各會把志明放在哪裡？',
    inference: '若阿芳在 11 時，第 1 條會把志明放在 12 時，卻違反第 4 條；所以阿芳只剩另一個時段。',
    demonstration: { row: 0, col: 1, mark: 'YES', reason: '第 2 條只允許 10 或 11 時；11 時會讓下一時段的志明違反第 4 條，因此 B1 是 10 時。' },
  },
  {
    id: 'standard-books', tier: 'STANDARD', title: '閱讀分享', strategy: '二擇一與剩餘位置',
    people: ['美惠', '國強', '怡君', '家豪'], choices: ['小說', '傳記', '旅遊', '食譜'], solution: [0,1,3,2],
    clues: [{ kind: 'EXACTLY_ONE', options: [{ person: 0, choice: 0 }, { person: 1, choice: 2 }] }, { kind: 'OPTIONS', person: 0, choices: [0,1] }, { kind: 'MATCH', person: 2, choice: 3, relation: 'IS' }, { kind: 'MATCH', person: 3, choice: 0, relation: 'NOT' }],
    observation: '「恰好一件成立」表示不能兩件都對，也不能兩件都錯。先確認直接給出的配對。',
    inference: '假設美惠選傳記，國強就必須選旅遊；怡君已選食譜，家豪會被迫選小說，卻與第 4 條衝突。',
    demonstration: { row: 0, col: 0, mark: 'YES', reason: '美惠若選傳記會讓其餘三人與第 4 條矛盾；由第 2 條只剩小說，所以 A1 可確認。' },
  },
  {
    id: 'challenge-order', tier: 'CHALLENGE', title: '誰先分享', strategy: '反轉先後假設',
    people: ['小玉', '阿德', '佩佩', '文雄'], choices: ['第1位', '第2位', '第3位', '第4位'], solution: [1,2,3,0], ordered: true,
    clues: [{ kind: 'ORDER', earlier: 0, later: 1 }, { kind: 'ORDER', earlier: 1, later: 2 }, { kind: 'MATCH', person: 2, choice: 3, relation: 'IS' }, { kind: 'OPTIONS', person: 0, choices: [1,2] }],
    candidates: [[2,1,3,0], [1,2,3,0]],
    observation: '比較甲、乙中小玉和阿德的先後；找一條能直接反駁其中一案的線索。',
    inference: '第 1 條要求小玉在阿德之前。逐案比較兩人的位置；排除把順序倒過來的一案。',
    demonstration: { row: 0, col: 1, mark: 'YES', reason: '甲把小玉放第 3、阿德放第 2，違反第 1 條；排除甲，乙符合所有線索。' },
  },
  {
    id: 'challenge-either', tier: 'CHALLENGE', title: '展覽選區', strategy: '真假數量矛盾',
    people: ['秀芬', '阿海', '嘉嘉', '阿正'], choices: ['花草', '陶藝', '攝影', '書畫'], solution: [0,2,3,1],
    clues: [{ kind: 'EXACTLY_ONE', options: [{ person: 0, choice: 0 }, { person: 2, choice: 1 }] }, { kind: 'OPTIONS', person: 0, choices: [0,2] }, { kind: 'MATCH', person: 1, choice: 3, relation: 'NOT' }, { kind: 'MATCH', person: 3, choice: 1, relation: 'IS' }],
    candidates: [[0,2,3,1], [2,0,3,1]],
    observation: '比較兩案中第 1 條的兩件事，分別數一數有幾件成立。',
    inference: '第 1 條要求恰好一件成立；零件或兩件成立都能推翻假設。不要只查「沒有選」的線索。',
    demonstration: { row: 0, col: 0, mark: 'YES', reason: '乙中秀芬沒選花草、嘉嘉也沒選陶藝，兩件都不成立，違反第 1 條；所以排除乙。' },
  },
  {
    id: 'challenge-pair', tier: 'CHALLENGE', title: '預約順序', strategy: '分組保留後比較順序',
    people: ['淑華', '阿福', '小玲', '佳佳'], choices: ['9時', '10時', '11時', '12時'], solution: [1,0,2,3], ordered: true,
    clues: [{ kind: 'OPTIONS', person: 0, choices: [0,1] }, { kind: 'OPTIONS', person: 1, choices: [0,1] }, { kind: 'ORDER', earlier: 2, later: 3 }, { kind: 'MATCH', person: 0, choice: 0, relation: 'NOT' }],
    candidates: [[1,0,3,2], [1,0,2,3]],
    observation: '兩案對前兩人相同，差別在哪兩人？先找與這兩人有關的線索。',
    inference: '第 1、2 條把早上兩個時段留給淑華、阿福。再用第 3 條，檢查剩下兩人的先後。',
    demonstration: { row: 2, col: 2, mark: 'YES', reason: '甲把小玲排在佳佳之後，違反第 3 條；乙讓小玲 11 時、佳佳 12 時，順序正確。' },
  },
];

export const LOGIC_TIER_LABELS: Record<LogicTier, string> = { BEGINNER: '入門', STANDARD: '標準', CHALLENGE: '挑戰' };
