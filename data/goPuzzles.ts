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
    hint: '直三眼位要做活，關鍵在正中間那一點。仔細觀察眼位中的三個空點，哪一格同時緊鄰左右兩側的空點，下在那裡就能把眼位一分為二。',
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
    hint: '圍棋諺語「直三點中間」。仔細找出白棋眼位正中央的那一點，搶先點入就能讓對方兩側都無法各自成眼。',
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
    hint: '曲三的要害在轉角處。眼位中有一個點同時和另外兩個空點相鄰，那一點就是關鍵拐點。',
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
    hint: '曲三的要害同樣在轉角拐點。找出眼位中同時連著另外兩個空點的那一格，搶先點入即可。',
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
    hint: '方四內部四個交叉點彼此完全對稱，任意點入其中一格，剩下的空間就會退化成必死的曲三形狀。',
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
    id: 'double-atari',
    title: '雙叫吃 (雙打吃手筋)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 雙打',
    boardSize: 9,
    prompt: '【黑先】左右兩顆白子各剩 2 口氣，請黑棋下在中間交叉分叉點，同時叫吃兩顆白子（雙叫吃），必得其一！',
    hint: '仔細找出那個能同時碰觸左右兩顆白子的交叉點，一手落下就能讓兩邊同時只剩 1 口氣。',
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

  // ==========================================
  // ⚡ CATEGORY 3: 戰術與手筋 (Tactics & Tesuji)
  // ==========================================
  {
    id: 'wedge-tesuji',
    title: '挖斷手筋 (挖的妙手)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 挖',
    boardSize: 9,
    prompt: '【黑先】白棋一間跳形狀中門大開，請黑棋大膽「挖」入中間，製造雙重切斷弱點！',
    hint: '白棋兩子中間留有一路空隙，且黑棋上下都已有接應。試著大膽鑽入正中央，讓白棋兩側同時出現斷點。',
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
    id: 'first-line-descent',
    title: '一路立下手筋 (對殺緊氣立)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 對殺',
    boardSize: 9,
    prompt: '【黑先】緊要關頭對殺，白棋只剩 A9、C7 兩口氣，請黑棋選對收氣順序，率先搶下對殺！',
    hint: '白棋的兩口氣並不對等：其中一口一旦被黑棋填掉，白棋另一口氣就會變成連自己都下不進去的自緊氣陷阱；但順序顛倒的話，白棋反而能借另一口氣延伸逃到開闊處。仔細比較兩個點各自連出去後的空間大小。',
    explanation: '正解：黑棋下在 C7 (2,2)！白棋此時只有 A9、C7 兩口氣，但這兩口氣並不等值：C7 這口氣一旦被黑棋填掉，白棋僅剩的 A9 就是一個「假逃生口」——白棋若下入 A9，只能與己方大塊相連，卻沒有任何新氣可增加（唯一相鄰的空點正是被黑棋佔住的位置），形同自殺，根本無法合法下入！反過來說，如果黑棋先點 A9，白棋就能搶到 C7 向外長氣，一路延伸到 C8、C6、D7 等開闊空間成功脫身。所以正確的收氣順序是先點 C7，封死白棋唯一能延伸出去的方向，白棋兩口氣都被鎖死，黑棋穩穩掌握對殺，下一手即可直接提吃收官！',
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
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7 (2,2)
    acceptedMoves: [{ r: 2, c: 2 }],
    successMessage: '算無遺策！先封住能向外延伸的那口氣，白棋兩側都被鎖死，黑棋在對殺中拔得頭籌！'
  },

  {
    id: 'san-san-invasion',
    title: '點三三掏角定式 (三三侵入)',
    category: 'TACTICS',
    difficulty: 'EASY',
    badge: '定式 佈局',
    boardSize: 9,
    prompt: '【黑先】白棋佔據星位（D6），請黑棋點入現代圍棋中最常見、效率最高的角部侵入點「三三」！',
    hint: '面對星位（4-4）時，現代圍棋最常見的角部侵入點就是「三三」——從角端沿兩條邊各數三路交叉而成的那一點。',
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
    hint: '圍棋格言「逢飛必跨」。試著找出白棋兩子小飛形狀中間、與兩子都相鄰的那個腰部點，直接跨入。',
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
  }
];
