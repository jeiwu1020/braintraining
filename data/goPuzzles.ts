import { Point, GoBoard, createEmptyBoard } from '../services/goEngine';

export type PuzzleCategory = 'LIFE_DEATH' | 'CAPTURE' | 'TACTICS';
export type PuzzleDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GoPuzzle {
  id: string;
  title: string;
  category: PuzzleCategory;
  difficulty: PuzzleDifficulty;
  badge: string;
  boardSize: number;
  prompt: string;
  hint: string;
  explanation: string;
  // Board setup: 'B' for Black, 'W' for White, '.' for Empty (Standard 9x9)
  initialBoard: string[];
  playerColor: 'BLACK';
  // Primary solution move
  solutionMoves: {
    playerMove: Point;
  }[];
  // All acceptable winning first moves (e.g. for symmetrical puzzles or multi-solution shapes like Square Four)
  acceptedMoves?: Point[];
  successMessage: string;
}

// Helper to convert string array into GoBoard
export function parsePuzzleBoard(strBoard: string[]): GoBoard {
  const size = strBoard.length;
  const board = createEmptyBoard(size);
  for (let r = 0; r < size; r++) {
    const row = strBoard[r];
    for (let c = 0; c < size; c++) {
      if (row[c] === 'B') board[r][c] = 'BLACK';
      else if (row[c] === 'W') board[r][c] = 'WHITE';
      else board[r][c] = 'EMPTY';
    }
  }
  return board;
}

export const GO_PUZZLES: GoPuzzle[] = [
  // ==========================================
  // 🌟 CATEGORY 1: 死活經典 (Life & Death Classics)
  // ==========================================
  {
    id: 'two-eyes-1',
    title: '分眼做活 (兩眼自活)',
    category: 'LIFE_DEATH',
    difficulty: 'EASY',
    badge: '死活 做眼',
    boardSize: 9,
    prompt: '【黑先】黑棋大龍被白棋重重包圍，僅剩「直三」眼位可做活，請下在中心急所，做成兩隻真眼！',
    hint: '下在 B8 (1,1) (直三眼位正中心)，將內部眼位劃分為 A8 與 C8 兩隻互不干擾的真眼！',
    explanation: '正解：黑棋下在 B8 (1,1)！直三眼位的關鍵急所就在正中間。下在 B8 後，內部形成左邊 A8 與右邊 C8 兩隻獨立真眼——白棋此後永遠無法合法下入這兩點（下子即無氣自殺），黑棋大龍確定永久活棋！',
    initialBoard: [
      'BBBBW....', // r=0 (Line9): A9-D9黑, E9白封鎖
      '...BW....', // r=1 (Line8): A8/B8/C8為眼位空點, D8黑, E8白
      'BBBBW....', // r=2 (Line7): A7-D7黑, E7白
      'WWWWW....', // r=3 (Line6): A6-E6白封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8
    acceptedMoves: [{ r: 1, c: 1 }],
    successMessage: '太棒了！精準下在 B8 直三急所，分出 A8 與 C8 兩隻真眼，白棋再也無法侵入，黑棋大龍完美活棋！'
  },

  {
    id: 'straight-three-kill',
    title: '直三點殺 (殺棋急所)',
    category: 'LIFE_DEATH',
    difficulty: 'EASY',
    badge: '死活 點殺',
    boardSize: 9,
    prompt: '【黑先】白棋僅剩「直三」眼位，尚未做活，請搶先點在中間要害，讓白棋永遠做不成兩眼！',
    hint: '「直三點中間」，搶佔 B8 (1,1) 核心要點，破壞白棋做成兩眼的機會！',
    explanation: '正解：黑棋下在 B8 (1,1)！圍棋死活名言「直三點中間」。黑棋搶先點入後，白棋僅剩的兩個空點 A8、C8 都與黑子相鄰，不再是真眼，白棋整條大龍只剩 2 口氣，隨後黑棋 A8、C8 依序收氣即可將白棋全部提吃！',
    initialBoard: [
      'WWWWB....', // r=0 (Line9): A9-D9白, E9黑封鎖(防止白棋外洩)
      '...WB....', // r=1 (Line8): A8/B8/C8白眼位, D8白, E8黑
      'WWWWB....', // r=2 (Line7): A7-D7白, E7黑封鎖
      'BBBBB....', // r=3 (Line6): A6-E6黑封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8
    acceptedMoves: [{ r: 1, c: 1 }],
    successMessage: '神準一擊！直三點中間搶佔 B8，白棋眼形瓦解，整條大龍必死無疑！'
  },

  {
    id: 'bent-three-live',
    title: '角上曲三做活 (拐點急所)',
    category: 'LIFE_DEATH',
    difficulty: 'EASY',
    badge: '死活 角部',
    boardSize: 9,
    prompt: '【黑先】黑棋在角部被圍成「曲三」眼位，請下在轉角拐點（曲三中心），一子做活！',
    hint: '曲三的要害在拐彎頂點！請下在角部 A9 (0,0)！',
    explanation: '正解：黑棋下在角部拐點 A9 (0,0)！曲三眼形若黑棋搶佔角端拐點 A9，眼位即刻分割成 B9 與 A8 兩隻獨立真眼。白棋若下入 B9 或 A8 均為自提無氣的自殺禁著點，黑棋永久做活！',
    initialBoard: [
      '..BBW....', // r=0: A9/B9為眼位, C9黑, D9黑, E9白
      '.BBBW....', // r=1: A8為眼位, B8黑, C8黑, D8黑, E8白
      'BBBBW....', // r=2: A7-D7黑, E7白
      'WWWWW....', // r=3: A6-E6白封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 0 } }], // A9
    acceptedMoves: [{ r: 0, c: 0 }],
    successMessage: '眼光銳利！曲三搶佔角端 A9 拐點，成功做出兩隻真眼，黑棋大龍安定做活！'
  },

  {
    id: 'bent-three-kill',
    title: '曲三點殺 (角部要點)',
    category: 'LIFE_DEATH',
    difficulty: 'EASY',
    badge: '死活 點殺',
    boardSize: 9,
    prompt: '【黑先】白棋在角部僅剩「曲三」眼位，尚未做活，請搶先點在角端拐點，讓白棋永遠做不成兩眼！',
    hint: '曲三的要害在轉角拐點！搶先下在角端 A9 (0,0)，白棋剩下的 B9、A8 兩點都會緊貼黑子，無法成為真眼！',
    explanation: '正解：黑棋下在角端拐點 A9 (0,0)！曲三眼形的急所永遠在轉角處。黑棋搶先點入 A9 後，白棋僅剩的 B9、A8 兩個空點都與剛下的黑子相鄰，不再具備做成真眼的條件，白棋整條大龍的氣被壓縮到只剩這兩口；隨後黑棋依序在 B9、A8 收氣，即可將白棋大龍全部提吃！',
    initialBoard: [
      '..WWB....', // r=0: A9/B9為曲三眼位空點, C9/D9白, E9黑封鎖
      '.WWWB....', // r=1: A8為曲三眼位空點, B8/C8/D8白, E8黑封鎖
      'WWWWB....', // r=2: A7-D7白, E7黑封鎖
      'BBBBB....', // r=3: A6-E6黑封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 0 } }], // A9 (0,0)
    acceptedMoves: [{ r: 0, c: 0 }],
    successMessage: '妙手點殺！搶佔曲三角端拐點 A9，白棋眼形瓦解，整條大龍必死無疑！'
  },

  {
    id: 'square-four-kill',
    title: '方四必死 (四目大眼)',
    category: 'LIFE_DEATH',
    difficulty: 'EASY',
    badge: '死活 大眼',
    boardSize: 9,
    prompt: '【黑先】白棋內部被圍成 2x2「方四」（四目大眼）空間，內部 4 個點任意點入皆為死棋！請點入方四內部任何一格！',
    hint: '「方四」內部四格（B8、C8、B7、C7）點哪一個都能殺棋！下入方四的任一空格即可！',
    explanation: '正解：黑棋下在方四內部四格（B8、C8、B7、C7）中任意一格均為正解！圍棋大眼死活定論：「方四必死，無急所」。因為方四內部 4 個交叉點具有完全幾何對稱性，黑棋只要佔據內部任一格，剩下的三格空間就自動退化為「曲三」死形，白棋永遠不可能做出兩隻真眼！',
    initialBoard: [
      'WWWWB....', // r=0: A9-D9白, E9黑封鎖
      'W..WB....', // r=1: A8(W), B8(空), C8(空), D8(W), E8黑封鎖
      'W..WB....', // r=2: A7(W), B7(空), C7(空), D7(W), E7黑封鎖
      'WWWWB....', // r=3: A6-D6白, E6黑封鎖
      'BBBBB....', // r=4: A5-E5黑包圍
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8
    acceptedMoves: [
      { r: 1, c: 1 }, // B8
      { r: 1, c: 2 }, // C8
      { r: 2, c: 1 }, // B7
      { r: 2, c: 2 }  // C7
    ],
    successMessage: '正解！方四四格任下一格皆成死棋，空間被壓制為曲三，白棋大龍必死！'
  },

  // ==========================================
  // ⚔️ CATEGORY 2: 吃子手筋 (Capture Tesuji)
  // ==========================================
  {
    id: 'snapback-classic',
    title: '倒撲手筋 (撲入倒撲)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 倒撲',
    boardSize: 9,
    prompt: '【黑先】白棋三子僅剩 A9、B9 兩口氣，請黑棋主動「撲入」A9 (0,0) 虎口，誘敵提吃後立即回提，完成精采的「倒撲」吃子！',
    hint: '請下在 A9 (0,0) 撲入虎口！黑棋這顆子自身只有 1 口氣（B9），白棋會順手提吃；提吃後白棋全體反而只剩 1 口氣，黑棋隨即在 A9 回提，全殲白棋！',
    explanation: '正解：黑棋撲入 A9 (0,0)！「倒撲」是圍棋中最具魅力的吃子手筋之一。白棋三子原本有 A9、B9 兩口氣；黑棋主動送一子入 A9，這顆黑子自身僅有 1 口氣（B9），白棋自然會下在 B9 提吃這顆送死的黑子。但白棋提吃後，整塊白棋（含新落的 B9 子）氣數反而被壓縮到只剩剛剛騰出的 A9 一口氣！黑棋下一手立刻在同一個 A9 點「回提」，將整群白子一次性全部拔起！',
    initialBoard: [
      '..B......', // r=0: A9/B9(虎口空點/回提點), C9黑封鎖
      'WWB......', // r=1: A8/B8(白), C8黑封鎖
      'BWB......', // r=2: A7黑封鎖, B7(白), C7黑封鎖
      '.B.......', // r=3: B6黑封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 0 } }], // A9 (0,0)
    acceptedMoves: [{ r: 0, c: 0 }],
    successMessage: '神乎其技！送子撲入引發倒撲連鎖，成功提吃白棋整條切斷要子！'
  },

  {
    id: 'double-atari',
    title: '雙叫吃 (雙打吃手筋)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 雙打',
    boardSize: 9,
    prompt: '【黑先】左右兩顆白子各剩 2 口氣，請黑棋下在中間交叉分叉點 C8 (1,2)，同時叫吃兩顆白子（雙叫吃），必得其一！',
    hint: '下在 C8 (1,2) 分叉點！此手一下，左邊 B8 白子與右邊 D8 白子同時只剩 1 口氣進入叫吃狀態！',
    explanation: '正解：黑棋下在 C8 (1,2)！「雙叫吃」（雙打吃）是指一子落下，同時對敵方兩處互不相連的棋子進行叫吃。由於對手每回合只能救援其中一處，黑棋在下一回合必定能提吃另一處棋子，是圍棋最實用的戰術基本功！',
    initialBoard: [
      '.B.B.....', // r=0: B9(B), D9(B)
      '.W.W.....', // r=1: B8(W,2氣), C8(分叉空點), D8(W,2氣)
      '.B.B.....', // r=2: B7(B), D7(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8 (1,2)
    acceptedMoves: [{ r: 1, c: 2 }],
    successMessage: '精準一擊！C8 落下達成雙叫吃，白棋顧此失彼，黑棋必定生擒一子！'
  },

  {
    id: 'oi-otoshi',
    title: '接不歸 (滾打包收/接不歸)',
    category: 'CAPTURE',
    difficulty: 'MEDIUM',
    badge: '吃子 接不歸',
    boardSize: 9,
    prompt: '【黑先】白棋兩顆斷尾殘子氣數極緊，請黑棋於 D8 (1,3) 叫吃！白棋即使連回也只有 1 氣，難逃被全殲的命運！',
    hint: '下在 D8 (1,3) 進行叫吃！白棋若敢接上連回，整串棋子依然只有 1 口氣，黑棋下一手即可全盤提吃！',
    explanation: '正解：黑棋下在 D8 (1,3) 叫吃！「接不歸」（Oi-otoshi）是指敵方棋子被叫吃時，若試圖連回大部隊，連回後的整體仍然只有 1 口氣（氣緊逃不掉）。對手接上只是白白增加死子數量，故稱「接了也回不來（接不歸）」！',
    initialBoard: [
      'BBBBB....', // r=0: A9-E9黑完整厚勢
      '.WW.W....', // r=1: A8(.), B8(W), C8(W), D8(叫吃要點), E8(W), F8(B)
      'BBBBB....', // r=2: A7-E7黑完整封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 3 } }], // D8 (1,3)
    acceptedMoves: [{ r: 1, c: 3 }],
    successMessage: '算無遺策！D8 叫吃引發接不歸，白棋連與不連皆難逃被提吃的厄運！'
  },

  {
    id: 'cranes-nest',
    title: '烏龜不出頭 (鶴之巢手筋)',
    category: 'CAPTURE',
    difficulty: 'MEDIUM',
    badge: '吃子 鶴之巢',
    boardSize: 9,
    prompt: '【黑先】二路白棋三子還有 B7、C7、D7 三個出頭方向，請黑棋施展「鼻頂」手筋頂在正中央 C7 (2,2)，讓烏龜永遠出不了頭！',
    hint: '下在 C7 (2,2)「鼻頂」！白棋這下被逼得只能往單邊硬撞，之後不管撞向哪一邊，都會一路被追殺撞進黑棋包圍網中！',
    explanation: '正解：黑棋下在 C7 (2,2) 鼻頂！「鶴之巢」（俗稱烏龜不出頭）是圍棋古典吃子名譜。白棋在二線排成三子，原本 B7、C7、D7 三個方向都能向外衝，黑棋搶先在正中央 C7 鼻頂後，白棋三子的氣從 3 口降到 2 口，且被攔腰截成只能選左（B7）或右（D7）單邊硬撞；不論撞向哪一邊，都會一路撞入黑棋的天羅地網，最終被徹底封死提吃！',
    initialBoard: [
      'BBBBB....', // r=0: A9-E9黑
      'BWWWB....', // r=1: A8(B), B8-D8(W), E8(B)
      '.........', // r=2: B7/C7(鼻頂空點)/D7 皆為白棋的出頭空點
      '..B......', // r=3: C6(B)守住中央，防止白棋直接由中路突圍
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7 (2,2)
    acceptedMoves: [{ r: 2, c: 2 }],
    successMessage: '神來之筆！C7 鼻頂如天羅地網，白棋烏龜縮頭難逃天元大網！'
  },

  {
    id: 'geta-net',
    title: '枷吃手筋 (虛網枷吃)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 枷吃',
    boardSize: 9,
    prompt: '【黑先】白子企圖向中腹逃竄，若直接叫吃白棋會順勢長出，請施展「虛網枷吃」，飛罩住白子逃跑路線！',
    hint: '下在 D7 (2,3) 進行小飛枷吃！留有餘地卻封死所有衝出方向！',
    explanation: '正解：黑棋下在 D7 (2,3) 枷吃！「枷吃」（Geta / 虛網）是比征子更高效的吃子技術。黑棋不直接緊貼叫吃，而是下在 D7 形成無形的虛網。白棋無論往哪個方向衝出，都會立刻被黑棋在兩步內直接封死並提吃！',
    initialBoard: [
      '..B......', // r=0: C9黑
      '.B.W.....', // r=1: B8黑, D8白企圖逃跑
      '....B....', // r=2: E7黑
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 3 } }], // D7 (2,3)
    acceptedMoves: [{ r: 2, c: 3 }],
    successMessage: '天羅地網！D7 虛網枷吃，白棋看似有路實則插翅難飛！'
  },

  {
    id: 'door-capture',
    title: '門吃 (關門打狗)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 門吃',
    boardSize: 9,
    prompt: '【黑先】白棋孤子卡在兩顆黑棋中間，請黑棋關上大門，將白子牢牢關在門內叫吃！',
    hint: '下在 C7 (2,2) 關上大門！',
    explanation: '正解：黑棋下在 C7 (2,2) 關門！「門吃」（關門打狗）是指當敵方孤子進入兩顆防守黑子之間時，黑棋下在出口處堵住最後通道，敵子動彈不得，隨後即可手到擒來！',
    initialBoard: [
      '..B......', // r=0: C9黑
      '.BWB.....', // r=1: B8黑, C8白, D8黑
      '.........', // r=2: C7大門空點
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7 (2,2)
    acceptedMoves: [{ r: 2, c: 2 }],
    successMessage: '大門緊閉！關門打狗一氣呵成，白子甕中捉鱉！'
  },

  {
    id: 'ladder-shicho',
    title: '征子手筋 (扭羊頭征吃)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 征子',
    boardSize: 9,
    prompt: '【黑先】白棋孤子被三面圍住，請黑棋從正確方向（下方）叫吃，將其逼入預先埋伏的征子絕路！',
    hint: '下在 D7 (2,3) 從下方叫吃！千萬不要從右側 E8 叫吃，方向一錯，白棋反而能逃出生天！',
    explanation: '正解：黑棋下在 D7 (2,3) 叫吃！「征子」（Shicho）的關鍵在於「方向」，方向一旦選錯，白棋就能逃脫。黑棋若從下方 D7 叫吃，白棋只能往右逃，會一路撞進黑棋預先埋伏在 F8 的伏兵，最終被逼到邊線全殲；但若從右側 E8 叫吃，白棋往下逃反而能一路衝進開放空間安全脫身！這正是實戰中「查看征子方向」的核心判斷力。',
    initialBoard: [
      '...B.....', // r=0: D9黑
      '..BW.B...', // r=1: C8黑, D8白(孤子), F8黑(伏兵)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 3 } }], // D7 (2,3)
    acceptedMoves: [{ r: 2, c: 3 }],
    successMessage: '方向精準！從下方叫吃直搗黃龍，白棋一路撞進伏兵天羅地網，插翅難逃！'
  },

  {
    id: 'throw-in-squeeze',
    title: '緊氣手筋 (借力叫吃)',
    category: 'CAPTURE',
    difficulty: 'MEDIUM',
    badge: '吃子 緊氣',
    boardSize: 9,
    prompt: '【黑先】對殺中白棋有 2 口氣，請黑棋果斷下在 C8 (1,2)，借助上方黑棋接應直接叫吃，搶先一步贏下對殺！',
    hint: '下在 C8 (1,2)！這手棋能與上方 C9 的黑子連成一氣，同時把白棋的氣從 2 口壓縮到只剩 1 口！',
    explanation: '正解：黑棋下在 C8 (1,2)！在對殺（Capturing Race）中，能借力使力、順手叫吃的點最值得優先考慮。C8 這一點恰好與黑棋上方的 C9 子相連，落子後不但自身安全（連回大部隊、毫無風險），還同時把白棋唯一的兩口氣壓縮成 1 口，白棋已無法解圍，黑棋下一手即可提吃收官！',
    initialBoard: [
      'BBBB.....',
      'BW.W.....', // r=1: B8(W), C8(緊氣要點), D8(W)
      'BWWWB....',
      'BBBBB....',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8 (1,2)
    acceptedMoves: [{ r: 1, c: 2 }],
    successMessage: '一氣呵成！借力連回同時緊氣，黑棋乾淨俐落地贏下這場對殺！'
  },

  // ==========================================
  // ⚡ CATEGORY 3: 戰術與手筋 (Tactics & Tesuji)
  // ==========================================
  {
    id: 'cut-tesuji',
    title: '切斷手筋 (斷的手筋)',
    category: 'TACTICS',
    difficulty: 'EASY',
    badge: '戰術 切斷',
    boardSize: 9,
    prompt: '【黑先】白棋兩子中間隔一路，形成「一間跳」，聯絡尚未完成，請下在正中央將其攔腰切斷！',
    hint: '下在 C8 (1,2) 正中央切斷！白棋兩子从此無法連成一片！',
    explanation: '正解：黑棋下在 C8 (1,2) 切斷！圍棋棋諺「棋從斷處生」。白棋兩子中間留有一路空隙（一間跳），看似遙相呼應，其實尚未真正連接。黑棋搶先點入正中央切斷，白棋當場分裂為左右兩塊孤立弱棋，黑棋更可借助左側 A7 的接應子率先攻擊，取得絕對主動！',
    initialBoard: [
      '.........',
      '.W.W.....', // r=1: B8白, C8(切斷要點), D8白 — 一間跳留有斷點
      'B........', // r=2: A7黑，接應攻擊左側白子
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8 (1,2)
    acceptedMoves: [{ r: 1, c: 2 }],
    successMessage: '俐落一刀！切斷手筋一出，白棋首尾分離陷入兩難！'
  },

  {
    id: 'clamp-tesuji',
    title: '二路夾手筋 (夾的妙手)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 夾',
    boardSize: 9,
    prompt: '【黑先】白棋一子深入黑棋領地，右側已有黑棋接應，請黑棋在左側「夾」住，兩面包抄！',
    hint: '下在 B8 (1,1) 左側加緊！配合右側 D8 黑子，白棋瞬間被兩面夾攻！',
    explanation: '正解：黑棋下在 B8 (1,1) 二路夾！「夾」是兩面包抄的攻擊性手筋。右側 D8 黑子早已接應在旁，黑棋此時在左側 B8 補上一夾，白棋 C8 瞬間被夾在兩顆黑子中間，進退失據：向上頂則氣緊，橫向逃竄也難以兩全，黑棋掌握全局主動！',
    initialBoard: [
      '.........',
      '..WB.....', // r=1: B8(夾點空位), C8白, D8黑(接應)
      '.B.......', // r=2: B7黑，加強下方封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8 (1,1)
    acceptedMoves: [{ r: 1, c: 1 }],
    successMessage: '兩全其美！二路夾手筋精妙絕倫，無論白棋如何應對皆受制於黑！'
  },

  {
    id: 'wedge-tesuji',
    title: '挖斷手筋 (挖的妙手)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 挖',
    boardSize: 9,
    prompt: '【黑先】白棋一間跳形狀中門大開，請黑棋大膽「挖」入中間，製造雙重切斷弱點！',
    hint: '下在 C8 (1,2)「挖」！強行切入白棋一間跳空隙！',
    explanation: '正解：黑棋下在 C8 (1,2) 挖！「挖」是鑽入對方兩子相隔一格的跳形之間。黑棋挖入後，白棋左右兩側出現兩個斷點，白棋顧得了左邊就顧不了右邊，必定被黑棋斷開吃子！',
    initialBoard: [
      '..B......', // r=0: C9黑
      '.W.W.....', // r=1: B8白, C8空點, D8白
      '..B......', // r=2: C7黑
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8 (1,2)
    acceptedMoves: [{ r: 1, c: 2 }],
    successMessage: '中流砥柱！挖斷手筋直插要害，白棋一間跳形狀支離破碎！'
  },

  {
    id: 'bridge-under',
    title: '一路妙手尖渡 (一路連通)',
    category: 'TACTICS',
    difficulty: 'HARD',
    badge: '戰術 官子',
    boardSize: 9,
    prompt: '【黑先】黑棋角上一子被阻隔，請在一路施展「尖渡」妙手，奇蹟般連回大部隊！',
    hint: '下在一路 B9 (0,1)「尖」！白棋若試圖在 C9 攔截阻渡，反而會因為氣緊被黑棋當場提吃！',
    explanation: '正解：黑棋下在 B9 (0,1) 一路尖！圍棋名言「二子頭必扳，一路有妙手」。在棋盤最外圍的一路上，「尖」是極為隱蔽且強大的連通手筋。此時白棋兩子已被黑棋團團圍住、氣數所剩無幾，若還想在 C9 強行攔截，自身反而會氣緊被黑棋一手提吃三子，黑棋順利金蟬脫殼連回大部隊！',
    initialBoard: [
      'B..B.....', // r=0: A9黑孤子, B9尖渡空點, C9空點, D9黑本隊
      'BWW......', // r=1: A8黑封鎖, B8白, C8白
      '.BB......', // r=2: B7黑封鎖, C7黑封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 1 } }], // B9 (0,1)
    acceptedMoves: [{ r: 0, c: 1 }],
    successMessage: '神乎其技！一路尖渡神妙無比，白棋不敢攔截，殘子瞬間化為生力軍與大部隊會合！'
  },

  {
    id: 'first-line-descent',
    title: '一路立下手筋 (對殺緊氣立)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 對殺',
    boardSize: 9,
    prompt: '【黑先】緊要關頭對殺，白棋只剩 A9、C7 兩口氣，請黑棋率先點入要害搶下對殺！',
    hint: '下在角上一路 A9 (0,0)「立下」！白棋立刻只剩 1 口氣，且無法用同一點反撲，黑棋穩操勝券！',
    explanation: '正解：黑棋下在 A9 (0,0) 一路立！白棋此時只有 A9、C7 兩口氣，黑棋搶先點入 A9，白棋立刻被壓縮到只剩 1 口氣（C7）；若白棋想用 A9 反擊，這點對白棋而言其實是「自緊氣」的陷阱——因為 A9 對白棋自身不能增加任何新氣，貿然搶下反而讓自己也陷入絕境。黑棋穩穩掌握對殺主動權！',
    initialBoard: [
      '.B.......', // r=0: B9黑
      'WB.......', // r=1: A8白, B8黑
      'WW.......', // r=2: A7白, B7白
      'BB.......', // r=3: A6/B6黑封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 0 } }], // A9 (0,0)
    acceptedMoves: [{ r: 0, c: 0 }, { r: 2, c: 2 }],
    successMessage: '定海神針！一路立下手筋長氣制敵，黑棋搶先一步在對殺中拔得頭籌！'
  },

  {
    id: 'san-san-invasion',
    title: '點三三掏角定式 (三三侵入)',
    category: 'TACTICS',
    difficulty: 'EASY',
    badge: '定式 佈局',
    boardSize: 9,
    prompt: '【黑先】白棋佔據星位（D6），請黑棋點入現代圍棋中最常見、效率最高的角部侵入點「三三」（C7）！',
    hint: '下在 3-3 位 C7 (2,2)！這是當代職業棋手面對星位時使用頻率最高的角部侵入點之一！',
    explanation: '正解：黑棋下在 C7 (2,2) (3-3)！「點三三」是現代圍棋中對付星位（4-4）最常見、效率最高的角部搶地下法之一。當然實戰中對星位還有小飛掛角、大飛掛角等多種下法可選，各有不同的後續變化與棋風取捨，三三入侵僅是其中最直接、最重視實地的一種選擇。',
    initialBoard: [
      '.........',
      '.........',
      '.........', // r=2: C7(3-3位空點)
      '...W.....', // r=3: D6(4-4星位白子)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7 (2,2)
    acceptedMoves: [{ r: 2, c: 2 }],
    successMessage: '實地至上！點三三直掏角心，迅速建立角部根據地！'
  },

  {
    id: 'cross-cut-tesuji',
    title: '跨斷手筋 (逢飛必跨)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 跨斷',
    boardSize: 9,
    prompt: '【黑先】白棋走出小飛形狀，圍棋棋諺「逢飛必跨」，請下在白棋小飛的腰部發動強襲！',
    hint: '下在 C7 (2,2)「跨」！直擊白棋小飛腰眼，令其陣型扭曲！',
    explanation: '正解：黑棋下在 C7 (2,2) 跨！圍棋千古格言「逢飛必跨」。對手下出小飛陣形時，黑棋「跨」入小飛腰部是破壞敵方形狀、發動反擊的最有力武器。白棋若擋，黑棋隨即扭斷，將局勢帶入黑棋擅長戰鬥！',
    initialBoard: [
      '.........',
      '.W.B.....', // r=1: B8白, D8黑
      '...W.....', // r=2: D7白（與B8構成小飛）, C7為跨點
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7 (2,2)
    acceptedMoves: [{ r: 2, c: 2 }],
    successMessage: '剛猛銳利！逢飛必跨直插腰眼，白棋陣腳大亂，黑棋主動權在握！'
  },

  {
    id: 'squeeze-combination',
    title: '滾打包收 (撲與接不歸綜合手筋)',
    category: 'TACTICS',
    difficulty: 'HARD',
    badge: '戰術 滾打包收',
    boardSize: 9,
    prompt: '【黑先】白棋五子大龍僅剩 3 口氣，請黑棋施展「撲」為先導的「滾打包收」綜合手筋，將白棋壓縮成凝重愚形並全殲！',
    hint: '下在 E5 (4,4) 進行第一步「撲入」！犧牲一子送入白棋腹地，白棋氣數立刻由 3 口壓縮為 2 口，隨後連環追擊，白棋無論怎麼接都是死形！',
    explanation: '正解：黑棋下在 E5 (4,4) 撲入！「滾打包收」是圍棋手筋中的極致藝術。黑棋先撲後打，主動送一子入白棋大龍腹地，將對手的氣數由 3 口一舉壓縮到只剩 2 口，打成毫無眼位的凝重死形；再配合連續叫吃追擊，最終將對手整條大龍一網打盡！',
    initialBoard: [
      '.........',
      '.........',
      '.........',
      '...BBBB..', // r=3 (Line6): D6-G6黑封鎖
      '...W.W...', // r=4 (Line5): D5(W), E5(撲入空點), F5(W)
      '..BWWWB..', // r=5 (Line4): C4黑, D4-F4白, G4黑
      '..BBBBB..', // r=6 (Line3): C3-G3黑封鎖
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 4, c: 4 } }], // E5 (4,4)
    acceptedMoves: [{ r: 4, c: 4 }],
    successMessage: '登峰造極！滾打包收連環妙手，將白棋壓縮成愚形死塊全盤生擒！'
  }
];
