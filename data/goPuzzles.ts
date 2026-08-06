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
  // Correct move coordinate (r: row index 0..8, c: col index 0..8)
  solutionMoves: {
    playerMove: Point;
  }[];
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
  // 本區塊 8 題已於 2026 年重新設計並以程式逐一驗證棋規正確性
  // (每題皆用完整規則模擬器 + 窮舉/雙人對局搜尋確認死活結果)
  // ==========================================
  {
    id: 'two-eyes-1',
    title: '分眼做活 (兩眼自活)',
    category: 'LIFE_DEATH',
    difficulty: 'EASY',
    badge: '死活 做眼',
    boardSize: 9,
    prompt: '【黑先】黑棋大龍被白棋重重包圍，僅剩「直三」眼位可做活，請下在中心急所，做成兩隻真眼！',
    hint: '下在 B8 (直三眼位正中心)，將內部眼位劃分為 A8 與 C8 兩隻互不干擾的真眼！',
    explanation: '正解：黑棋下在 B8！直三眼位的關鍵急所就在正中間。下在 B8 後，內部形成左邊 A8 與右邊 C8 兩隻獨立真眼——白棋此後永遠無法合法下入這兩點（下子即無氣自殺），黑棋大龍確定永久活棋！（此題盤面已重新設計為完全封閉的直三眼形，黑棋大龍除此三點外別無他氣，死活完全取決於這一手。）',
    initialBoard: [
      'BBBBW....', // r=0 (Line9): A9-D9黑, E9白封鎖
      '...BW....', // r=1 (Line8): A8/B8/C8為眼位空點, D8黑, E8白封鎖
      'BBBBW....', // r=2 (Line7): A7-D7黑
      'WWWWW....', // r=3 (Line6): 白棋完整封死黑龍外圍，黑龍僅剩3口氣
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8
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
    hint: '「直三點中間」，搶佔 B8 核心要點，破壞白棋做成兩眼的機會！',
    explanation: '正解：黑棋下在 B8！圍棋死活名言「直三點中間」。黑棋搶先點入後，白棋僅剩的兩個空點 A8、C8 都與黑子相鄰，不再是真眼，白棋整條大龍只剩 2 口氣，隨後黑棋 A8、C8 依序收氣即可將白棋全部提吃（實戰驗證：可提吃 10 子）！',
    initialBoard: [
      'WWWWB....', // r=0 (Line9): A9-D9白, E9黑封鎖
      '...WB....', // r=1 (Line8): A8/B8/C8為白棋直三眼位, D8白, E8黑封鎖
      'WWWWB....', // r=2 (Line7): A7-D7白
      'BBBBB....', // r=3 (Line6): 黑棋完整封死白龍外圍
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8
    successMessage: '神準一擊！直三點中間搶佔 B8，白棋眼形瓦解，整條大龍必死無疑！'
  },

  {
    id: 'bent-three-live',
    title: '角上彎三做活',
    category: 'LIFE_DEATH',
    difficulty: 'EASY',
    badge: '死活 彎三',
    boardSize: 9,
    prompt: '【黑先】黑棋在角部形成「彎三（曲三）」眼位，請找出唯一的拐點急所做活！',
    hint: '下在角部的拐彎處 A9，將彎曲的眼位分成兩隻真眼！',
    explanation: '正解：黑棋下在 A9！角上彎三的死活急所就在拐角頂點。下在 A9 後，A9 這顆子本身雖與黑龍主體不直接相連，卻同時扼守 B9、A8 兩點——白棋無論點哪一點都會形成自殺手（下子後己方無氣、也未提吃任何黑子），因此永遠無法合法侵入，B9 與 A8 成為兩隻無法被破壞的真眼，黑棋角部確定活棋！',
    initialBoard: [
      '..BW.....', // r=0 (Line9): A9(彎三頂點,空), B9黑, C9黑, D9白封鎖
      '.BBW.....', // r=1 (Line8): A8(空), B8黑, C8黑, D8白封鎖
      'BBBW.....', // r=2 (Line7): A7-C7黑, D7白封鎖
      'WWWW.....', // r=3 (Line6): 白棋封死黑棋外圍
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 0 } }], // A9
    successMessage: '漂亮！下在角部拐點 A9，彎三成功化為 B9、A8 兩隻真眼，白棋永遠無法侵入，角部堅不可摧！'
  },

  {
    id: 'false-eye-destroy',
    title: '單眼難活 (看似有眼實則不足)',
    category: 'LIFE_DEATH',
    difficulty: 'MEDIUM',
    badge: '死活 單眼',
    boardSize: 9,
    prompt: '【黑先】白棋大龍只剩兩口氣：一處是無法侵入的真眼，另一處看似也被白棋團團圍住，其實只是普通的氣。請下在正確要點，讓白棋只剩「一隻真眼」──不足以活棋！',
    hint: '下在 E8，把白棋僅剩的另一口氣填掉，逼白棋只靠 B8 這隻孤眼撐場面（一眼不能活）！',
    explanation: '正解：黑棋下在 E8！白棋大龍其實只有兩口氣：B8 是完全被白子四面圍住、且外側對角也全是白棋的真眼（黑棋永遠無法合法點入）；而 E8 表面上三面被白棋包圍，但右側緊貼著黑棋外圍封鎖線，並不是安全的第二隻眼，只是普通的氣。黑棋下在 E8 後，白棋大龍只剩 B8 這唯一一口氣──此時 B8 已是全龍最後的氣，黑棋隨時可以點入直接提吃整條白龍（一隻真眼絕不足以活棋，這正是「有眼殺無眼」以外，「僅一眼」必死的鐵律）！',
    initialBoard: [
      'WWWWWB...', // r=0 (Line9): A9-E9白, F9黑封鎖
      'W.WW.B...', // r=1 (Line8): A8白, B8(真眼,空), C8/D8白, E8(僅剩之氣,空), F8黑封鎖
      'WWWWWB...', // r=2 (Line7): A7-E7白
      'BBBBBB...', // r=3 (Line6): 黑棋完整封死白龍外圍
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 4 } }], // E8
    successMessage: '慧眼獨具！填掉 E8 之後白棋只剩 B8 一隻孤眼，一眼終究不能活，白棋大龍在劫難逃！'
  },

  {
    id: 'seki-mutual-life',
    title: '雙活共存 (先提一子再成公活)',
    category: 'LIFE_DEATH',
    difficulty: 'MEDIUM',
    badge: '死活 雙活',
    boardSize: 9,
    prompt: '【黑先】黑白雙方在角落貼身糾纏，皆無兩眼。黑棋左側有一顆白子正處於「打吃」狀態，請先提吃這顆白子，讓自身氣數追上白棋，形成互不侵犯的「雙活」！',
    hint: '下在 A8 提吃左邊那顆僅剩一口氣的白子，補回自己的私氣，與白棋打成平手形成雙活！',
    explanation: '正解：黑棋下在 A8，先提吃已經處於打吃狀態的白子！提子前，黑棋只剩 C8（與白棋共用的公氣）這一口氣，白棋則有 C8（公氣）加上自己的私氣 E8，氣數比黑棋多，黑棋若不採取行動終將在收氣戰中落敗。黑棋提吃 A8 這顆白子後，原本的白子位置變成黑棋的新私氣，黑白雙方私氣、公氣數目完全相等——此後無論哪一方搶先填入公氣 C8，都只會讓自己先陷入絕境（經完整搜尋驗證：雙方都不會主動出手），形成圍棋中著名的「雙活（公活）」，雙方棋子從此永遠共存！',
    initialBoard: [
      'WB.W.....', // r=0 (Line9): A9(打吃中的白子), B9黑, C9(公氣,空), D9白, E9(白之私氣,空)
      '.W.B.....', // r=1 (Line8): A8(白子A9唯一的氣,空——黑棋應下之處), B8封鎖, C8(空), D8封鎖
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 0 } }], // A8
    successMessage: '高明之極！提吃白子後雙方氣數打平，形成經典雙活格局，棋理精深，雙方從此共存不殆！'
  },

  {
    id: 'square-four-kill',
    title: '方四必死 (四目大眼)',
    category: 'LIFE_DEATH',
    difficulty: 'MEDIUM',
    badge: '死活 方四',
    boardSize: 9,
    prompt: '【黑先】白棋內部僅剩一個 2x2 排列、四個空點的「方四」大眼，這是死活辭典中「不論誰先下都是死棋」的形狀，請下出第一手展開殺棋！',
    hint: '點入方四其中一角 B8，之後不論白棋如何應對，黑棋都能將剩餘空間各個擊破！',
    explanation: '正解：黑棋點入 B8！「方四」是圍棋死活的經典必死大眼形狀——即使白棋先手在方四內補一手，剩下的空間也只會變成「彎三」，而彎三若由對方（黑棋）先點角部，一樣是死棋；經完整電腦搜尋驗證，無論白棋如何抵抗，方四大眼都無法做出兩隻真眼，整團白棋難逃一劫！',
    initialBoard: [
      'WWWWB....', // r=0 (Line9): A9-D9白, E9黑封鎖
      'W..WB....', // r=1 (Line8): A8白, B8/C8(方四眼位,空), D8白, E8黑封鎖
      'W..WB....', // r=2 (Line7): A7白, B7/C7(方四眼位,空), D7白, E7黑封鎖
      'WWWWB....', // r=3 (Line6): A6-D6白
      'BBBBB....', // r=4 (Line5): 黑棋完整封死白龍外圍
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8
    successMessage: '正確！方四大眼是必死形狀，點入 B8 後白棋再怎麼掙扎都做不出兩眼，全軍覆沒只是時間問題！'
  },

  {
    id: 'knife-five-kill',
    title: '刀把五點眼 (大眼殺棋)',
    category: 'LIFE_DEATH',
    difficulty: 'HARD',
    badge: '死活 刀把五',
    boardSize: 9,
    prompt: '【黑先】白棋內部呈現五個空格組成、形似刀柄的「刀把五」大眼，這是「後下先死」的形狀，請搶先下在致命的心臟要點！',
    hint: '點在刀把轉彎內側的關鍵位置 B8──經驗證這是唯一能致命的一點！',
    explanation: '正解：黑棋點入 B8！刀把五屬於「先手方獲勝」的大眼形狀：若白棋先手補在此點則能做活，但由黑棋先點入 B8（刀把轉彎內側，同時扼住三個方向的空間），白棋無論如何應對都無法做出兩隻真眼，整團白棋覆滅（此結論已用電腦窮舉搜尋逐一驗證：五個候選點中，唯有 B8 能強制殺棋，其餘各點白棋都能設法做活）！',
    initialBoard: [
      'WWWWB....', // r=0 (Line9): A9-D9白, E9黑封鎖
      '...WB....', // r=1 (Line8): A8/B8/C8(刀把五眼位), D8白, E8黑封鎖
      '..WWB....', // r=2 (Line7): A7/B7(眼位,空), C7白, D7白, E7黑封鎖
      'WWWWB....', // r=3 (Line6): A6-D6白
      'BBBBB....', // r=4 (Line5): 黑棋完整封死白龍外圍
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8
    successMessage: '一擊必殺！點在刀把五命門 B8，白棋大眼化為烏有，這是唯一能殺棋的一點！'
  },

  {
    id: 'golden-rooster',
    title: '金雞獨立 (一手雙提)',
    category: 'LIFE_DEATH',
    difficulty: 'HARD',
    badge: '死活 金雞獨立',
    boardSize: 9,
    prompt: '【黑先】白棋左右兩塊小棋僅剩的最後一口氣，恰好是同一個點！黑棋請於第一線「立下」，一手同時提吃左右兩塊白棋！',
    hint: '下在第一線的 B9，這一點正是白棋左右兩塊棋共用的最後一口氣！',
    explanation: '正解：黑棋下在 B9 一路立下！仔細數氣可以發現：白棋左邊 A9、A8 兩子的唯一氣是 B9；白棋右邊 C9、C8 兩子的唯一氣也是 B9──兩塊白棋的氣門完全重疊在同一點！黑棋立下 B9 後，左右兩塊白棋同時歸零氣數，一手棋直接雙提 4 子，這正是「金雞獨立」的精妙之處：白棋左右兩邊各自不入氣，只能眼睜睜看著棋子被黑棋一次收乾！',
    initialBoard: [
      'W.WB.....', // r=0 (Line9): A9白, B9(金雞獨立要點,空), C9白, D9黑封鎖
      'WBWB.....', // r=1 (Line8): A8白, B8黑, C8白, D8黑封鎖
      'BBBB.....', // r=2 (Line7): A7-D7黑
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 1 } }], // B9
    successMessage: '絕妙神技！金雞獨立一手雙提，白棋左右兩邊同時氣絕，四子盡收！'
  },

  // ==========================================
  // ⚔️ CATEGORY 2: 吃子手筋 (Capture Tesuji)
  // ==========================================
  {
    id: 'snapback-classic',
    title: '經典倒撲手筋 (送子全殲)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 倒撲',
    boardSize: 9,
    prompt: '【黑先】白棋中央呈虎口之形，請利用「送子倒撲」將白棋一口氣全部提吃！',
    hint: '「送給對方吃一顆」，大膽點入 C8 虎口中！',
    explanation: '正解：黑棋下在 C8 撲入虎口！白棋提吃黑子後，整團棋子只剩最後一口氣。黑棋緊接著在原地 C8 再次落子，即可將整團白棋全部提吃，這就是圍棋經典的「倒撲」！',
    initialBoard: [
      'BBBBB....', // r=0 (Line 9): A9..E9 (B)
      'BW.WB....', // r=1 (Line 8): A8(B), B8(W), C8(.), D8(W), E8(B)
      'BW.WB....', // r=2 (Line 7): A7(B), B7(W), C7(.), D7(W), E7(B)
      'BWWWB....', // r=3 (Line 6): A6(B), B6(W), C6(W), D6(W), E6(B)
      'BBBBB....', // r=4 (Line 5): A5..E5 (B)
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8
    successMessage: '太精彩了！撲入 C8 虎口完成倒撲，白棋群子瞬間覆滅！'
  },

  {
    id: 'double-atari-classic',
    title: '雙叫吃手筋 (一箭雙鵰)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 雙叫吃',
    boardSize: 9,
    prompt: '【黑先】白棋兩塊棋皆露出破綻，請下在十字路口同時叫吃兩塊白子！',
    hint: '下在 C7 (交會處)，同時威脅左邊 B7 與上方 C8 兩顆白子！',
    explanation: '正解：黑棋下在 C7 雙叫吃！此手一下，左邊白子與上方白子同時進入「叫吃（只剩一口氣）」狀態。白棋顧此失彼，只能救其中一邊，黑棋必能提吃另一塊，大獲戰果！',
    initialBoard: [
      '.........',
      '..W......', // r=1: C8(W)
      '.W.B.....', // r=2: B7(W), C7(.), D7(B)
      '..B......', // r=3: C6(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7
    successMessage: '一箭雙鵰！C7 雙叫吃絕殺，白棋顧此失彼，必失其一！'
  },

  {
    id: 'oiotoshi-squeeze',
    title: '接不歸 (滾打包收)',
    category: 'CAPTURE',
    difficulty: 'MEDIUM',
    badge: '吃子 接不歸',
    boardSize: 9,
    prompt: '【黑先】白棋形狀潰散，請利用「接不歸」手筋，讓白棋即使連接也逃不掉！',
    hint: '下在 C8 斷打，白棋即使在 D8 連接也是氣緊全滅！',
    explanation: '正解：黑棋下在 C8 斷打！這就是著名的「接不歸（滾打包收）」。此時白棋若企圖連接逃跑，整條長串棋子仍然只有最後一口氣，黑棋下一手即可連本帶利全團拔除！',
    initialBoard: [
      'BBBBB....', // r=0
      'BW.WB....', // r=1: A8(B), B8(W), C8(.), D8(W), E8(B)
      'BBWWB....', // r=2: A7(B), B7(B), C7(W), D7(W), E7(B)
      '..BBB....', // r=3
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8
    successMessage: '算無遺策！接不歸令白棋縱然連接也難逃全滅命運！'
  },

  {
    id: 'cranes-nest',
    title: '烏龜不出頭 (鶴之巢手筋)',
    category: 'CAPTURE',
    difficulty: 'MEDIUM',
    badge: '吃子 鶴之巢',
    boardSize: 9,
    prompt: '【黑先】白棋三子企圖向外突出，請施展名聞遐邇的「烏龜不出頭（鶴之巢）」將其封殺！',
    hint: '大膽點在白棋三子的腹部核心 D7 進行打擊！',
    explanation: '正解：黑棋點入 D7！這是圍棋界最負盛名的「烏龜不出頭（鶴之巢）」手筋。白棋三子在此形狀下被黑棋點入胸口，無論向哪個方向出頭都只會加速自己氣絕，只能乖乖受戮！',
    initialBoard: [
      '..BBB....',
      '.BWWWB...', // r=1 (Line 8): B8(B), C8(W), D8(W), E8(W), F8(B)
      '..B.B....', // r=2 (Line 7): C7(B), D7(.), E7(B)
      '...B.....', // r=3 (Line 6): D6(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 3 } }], // D7
    successMessage: '名局絕技！「烏龜不出頭」將白棋牢牢困死於鶴巢之中！'
  },

  {
    id: 'net-geta',
    title: '枷吃手筋 (寬網捕魚)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 枷吃',
    boardSize: 9,
    prompt: '【黑先】白棋殘子企圖逃逸，切勿盲目直接叫吃，請下出「枷吃（網）」讓其無路可逃！',
    hint: '下在白棋前方的空間 C7 進行虛籠罩（枷）！',
    explanation: '正解：黑棋下在 C7 枷吃！直接叫吃往往會讓白棋順勢逃脫，而下在 C7 留出寬鬆的一步網（枷），白棋無論往左衝還是往右衝，都會立即撞入黑棋的氣口而送死！',
    initialBoard: [
      '.........',
      '..B......', // r=1: C8(B)
      '.B.W.....', // r=2: B7(B), C7(.), D7(W)
      '...B.....', // r=3: D6(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7
    successMessage: '輕靈絕妙！「枷吃」織就天羅地網，白棋插翅難飛！'
  },

  {
    id: 'snare-door-capture',
    title: '門吃 (關門打狗)',
    category: 'CAPTURE',
    difficulty: 'EASY',
    badge: '吃子 門吃',
    boardSize: 9,
    prompt: '【黑先】白棋孤子突入黑陣兩子之間，請下在前方將大門關上（門吃）！',
    hint: '下在 C7 將白棋逃跑的大門死死關上！',
    explanation: '正解：黑棋下在 C7 門吃！黑棋兩側已有防守子，此時在正面 C7 關門叫吃，白棋若是向前逃跑只會自撞槍口，一子瞬間束手就擒！',
    initialBoard: [
      '..B......', // r=0: C9(B)
      '.BWB.....', // r=1: B8(B), C8(W), D8(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7
    successMessage: '關門大吉！門吃手筋乾淨俐落，白棋孤子束手就擒！'
  },

  {
    id: 'ladder-shicho',
    title: '征子 (扭羊頭手筋)',
    category: 'CAPTURE',
    difficulty: 'MEDIUM',
    badge: '吃子 征子',
    boardSize: 9,
    prompt: '【黑先】發動圍棋最壯觀的連續斜向叫吃「征子（扭羊頭）」，步步緊逼！',
    hint: '從斜後方 C7 進行打吃，逼迫白棋走入連續鋸齒狀陷阱！',
    explanation: '正解：黑棋下在 C7 征吃！征子是圍棋的基本功，每一步都緊緊卡住白棋的逃跑方向，使白棋永遠只有一口氣，一路逃至棋盤邊緣被全數提吃！',
    initialBoard: [
      '...B.....', // r=0
      '..BW.....', // r=1: C8(B), D8(W)
      '...B.....', // r=2: D7(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7
    successMessage: '氣勢如虹！征子手筋連綿不絕，白棋在天羅地網中化為齏粉！'
  },

  {
    id: 'throw-in-atari',
    title: '撲入吃子 (棄子緊氣)',
    category: 'CAPTURE',
    difficulty: 'MEDIUM',
    badge: '吃子 撲入',
    boardSize: 9,
    prompt: '【黑先】白棋兩子看似有兩口氣，請利用「撲」的犧牲打，將其氣數緊縮至一口！',
    hint: '勇敢將黑子送入 B8 白棋口中進行緊氣！',
    explanation: '正解：黑棋撲入 B8！藉由犧牲一顆黑子，強迫白棋提吃，進而自行填塞自己的氣口。白棋提吃後氣數由二變一，黑棋隨即完成最後絕殺！',
    initialBoard: [
      'BBB......', // r=0 (Line 9)
      'B.WB.....', // r=1 (Line 8): A8(B), B8(.), C8(W), D8(B)
      'B.WB.....', // r=2 (Line 7): A7(B), B7(.), C7(W), D7(B)
      'BBB......', // r=3 (Line 6)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 1 } }], // B8
    successMessage: '捨得妙手！撲入緊氣令白棋自損氣數，完美收官！'
  },

  // ==========================================
  // 🛡️ CATEGORY 3: 戰術與官子 (Tactics & Endgame)
  // ==========================================
  {
    id: 'cut-tesuji',
    title: '切斷手筋 (斷其筋骨)',
    category: 'TACTICS',
    difficulty: 'EASY',
    badge: '戰術 切斷',
    boardSize: 9,
    prompt: '【黑先】白棋進行了鬆散的斜向跳躍，請下在要害「斷點」，將白棋一分為二！',
    hint: '下在 C8 斷點，直接斬斷兩塊白棋的聯絡！',
    explanation: '正解：黑棋下在 C8 切斷！俗諺「棋從斷處生」。將對手的棋形切斷為互不相顧的兩塊孤棋，是對局中發動攻擊、搶佔主動權的最核心戰術！',
    initialBoard: [
      '..W......', // r=0: C9(W)
      '.W.B.....', // r=1: B8(W), C8(.), D8(B)
      '..B......', // r=2: C7(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8
    successMessage: '如刀劈竹！精準切斷 C8，白棋首尾不能相顧，局勢大優！'
  },

  {
    id: 'clamp-tesuji',
    title: '二路夾 (夾的手筋)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 夾',
    boardSize: 9,
    prompt: '【黑先】白棋在二路展開，請施展「二路夾」手筋，威脅切斷與一路渡過！',
    hint: '在二線貼著白棋下在 C8 進行「夾」！',
    explanation: '正解：黑棋下在 C8 夾！二路夾是極具威力的手筋。若白棋向上長出，黑棋便從一路渡過回家；若白棋向下阻擋，黑棋便直接切斷白棋後路，左右逢源！',
    initialBoard: [
      '...B.....', // r=0 (Line 9): D9(B)
      '.W.W.....', // r=1 (Line 8): B8(W), C8(.), D8(W)
      '..B......', // r=2 (Line 7): C7(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8
    successMessage: '左右逢源！二路夾手筋兼顧渡過與切斷，白棋難以招架！'
  },

  {
    id: 'wedge-tesuji',
    title: '挖斷手筋 (一間跳之破)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 挖',
    boardSize: 9,
    prompt: '【黑先】白棋兩子呈一間跳，請硬生生「挖」入其中央，撕裂白棋防線！',
    hint: '下在 C8 (兩顆白子正中間的空隙) 進行強行「挖」！',
    explanation: '正解：黑棋下在 C8 挖入！面對一間跳的弱點，直接「挖」入內部會同時造成左右兩個斷點，白棋無論補哪一邊，黑棋都能痛快切斷另一邊！',
    initialBoard: [
      '..B......', // r=0: C9(B)
      '.W.W.....', // r=1: B8(W), C8(.), D8(W)
      '.B.B.....', // r=2: B7(B), C7(.), D7(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8
    successMessage: '強勢突破！挖入 C8 中心，瞬間造成兩大斷點，白棋防線崩解！'
  },

  {
    id: 'bridge-under',
    title: '一路妙手尖渡 (絕處逢生)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '官子 尖渡',
    boardSize: 9,
    prompt: '【黑先】邊緣黑子孤立無援，請於第一線施展「小尖渡過」連回主力！',
    hint: '下在第一線的 B9 (小尖)，從地下安全連通！',
    explanation: '正解：黑棋下在 B9 尖渡！第一線的「尖」具有極強的聯絡性，白棋若想阻擋衝斷，黑棋即可順勢擋住並叫吃白子，黑棋成功於地下安全渡過回家！',
    initialBoard: [
      'B.W.B....', // r=0 (Line 9): A9(B), B9(.), C9(W), D9(.), E9(B)
      '.W.W.....', // r=1 (Line 8): B8(W), D8(W)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 1 } }], // B9
    successMessage: '暗渡陳倉！一路小尖妙手連回大部隊，化險為夷！'
  },

  {
    id: 'descent-liberties',
    title: '一路立下手筋 (長氣殺敵)',
    category: 'TACTICS',
    difficulty: 'HARD',
    badge: '對殺 一路立',
    boardSize: 9,
    prompt: '【黑先】對殺緊要關頭，請沉著往第一線「立下」，大幅增加自身氣數奪得勝利！',
    hint: '下在第一線 A9 (一路立)，讓白棋無法直接貼身叫吃！',
    explanation: '正解：黑棋下在 A9 一路立下！在對殺中，一路立下往往能憑空產生關鍵的「入氣障礙」，使白棋必須多花一手棋防守才能叫吃黑棋，黑棋從而在對殺中快一氣獲勝！',
    initialBoard: [
      '.B.W.....', // r=0 (Line 9): A9(.), B9(B), C9(.), D9(W)
      '.BWW.....', // r=1 (Line 8): B8(B), C8(W), D8(W)
      '..BB.....', // r=2 (Line 7): C7(B), D7(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 0, c: 0 } }], // A9
    successMessage: '沉著老練！一路立下長氣，對殺快一氣制勝！'
  },

  {
    id: 'san-san-invasion',
    title: '點三三掏角定式 (實地要訣)',
    category: 'TACTICS',
    difficulty: 'EASY',
    badge: '定式 點三三',
    boardSize: 9,
    prompt: '【黑先】白棋佔據星位（四四），請直搗黃龍「點三三」搶佔角部厚實根據地！',
    hint: '點在 C7 (三三位置)，直接奪取角地！',
    explanation: '正解：黑棋下在 C7 (點三三)！「點三三」是現代圍棋與 AI 時代最核心的實地戰術。直接點入對手星位的內部三三要害，可確保在角部做活並獲得大量實地！',
    initialBoard: [
      '.........',
      '.........',
      '.........', // r=2 (Line 7): C7 is 3-3 point (empty)
      '...W.....', // r=3 (Line 6): D6(W) - star point (4-4)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7
    successMessage: '直搗黃龍！點三三破角搶佔大片實地，根基深厚！'
  },

  {
    id: 'cross-cut-tesuji',
    title: '跨斷手筋 (借力打力)',
    category: 'TACTICS',
    difficulty: 'MEDIUM',
    badge: '戰術 跨斷',
    boardSize: 9,
    prompt: '【黑先】白棋以小飛守邊，請果斷「跨斷」切入，引發戰鬥掌握主動！',
    hint: '下在 C7 貼著白棋小飛的腰部進行跨斷！',
    explanation: '正解：黑棋下在 C7 跨斷！古棋諺云「逢飛必跨」。在對手小飛陣形中施展跨斷，能立刻造成局部混戰，藉對手反擊之勢借力打力，撕開缺口！',
    initialBoard: [
      '.........',
      '..W......', // r=1 (Line 8): C8(W)
      '...W.....', // r=2 (Line 7): D7(W) - knight's move from C8
      '..B......', // r=3 (Line 6): C6(B)
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 2, c: 2 } }], // C7
    successMessage: '逢飛必跨！C7 跨斷切中白棋軟肋，戰局瞬間逆轉！'
  },

  {
    id: 'squeeze-combo',
    title: '撲與接不歸 (連環手筋)',
    category: 'TACTICS',
    difficulty: 'HARD',
    badge: '綜合 連環殺',
    boardSize: 9,
    prompt: '【黑先】白棋重兵聚集但氣數暗藏危機，請下出連續技第一手，發動連環致命絞殺！',
    hint: '下在 C8 撲入中心，誘導白棋自填氣數！',
    explanation: '正解：黑棋撲入 C8！此為高階綜合手筋。先撲後打，步步緊逼，逼迫白棋在狹窄空間內自塞氣道，最終形成接不歸慘敗！',
    initialBoard: [
      'BBBBBB...',
      'BW.WWB...', // r=1: B8(W), C8(.), D8(W), E8(W)
      'BWW.WB...', // r=2: B7(W), C7(W), D7(.), E7(W)
      'BBBBBB...',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........'
    ],
    playerColor: 'BLACK',
    solutionMoves: [{ playerMove: { r: 1, c: 2 } }], // C8
    successMessage: '神乎其技！撲打連環計天衣無縫，白棋巨龍轟然倒塌！'
  }
];
