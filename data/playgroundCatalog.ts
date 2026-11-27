export const PLAYGROUND_CATALOG = [
  {
    id: "night-market",
    title: "夜市選菜會",
    description: "選一張，湊出好組合",
    action: "開始選菜",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "三種菜色，湊出高分餐盤",
      advanced: "兩張公開訂單，挑戰組合取捨",
    },
  },
  {
    id: "wall-race",
    title: "築牆競走",
    description: "走一步，或築一道牆",
    action: "開始對決",
    layoutPreset: "BOARD_SIDEBAR",
    difficultyDescriptions: {
      normal: "每隊三面牆，先到對岸",
      advanced: "每隊五面牆，電腦多看一步",
    },
  },
  {
    id: "lighthouse",
    title: "燈塔補給隊",
    description: "一起調度，讓海岸亮起來",
    action: "準備出航",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "7回合交付8箱，抵達燈塔自動交貨",
      advanced: "8回合交付12箱，3種需求配置、部分燈塔需分批",
    },
  },
  {
    id: "garden",
    title: "四季造園師",
    description: "選地形、轉方向，種下自己的花園",
    action: "打開花園",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "5×5花園，每隊選6塊地形",
      advanced: "6×6花園，每隊選8塊地形",
    },
  },
  {
    id: "lantern",
    title: "花燈街區爭鋒",
    description: "有限花燈，三次布局爭取街區",
    action: "點亮街區",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "每隊8盞，三輪固定偶數公開價值",
      advanced: "每隊6盞，三輪變化偶數公開價值",
    },
  },
  {
    id: "workshop",
    title: "小鎮工坊",
    description: "搶共用站取原料、急單或出貨得分",
    action: "開啟工坊",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "4工作日，單一原料加工出貨或接急單",
      advanced: "5工作日、每日3位工匠，休息可領1原料",
    },
  },
  {
    id: "auction",
    title: "古物拍賣會",
    description: "公開競價，收藏一場精彩展覽",
    action: "進入拍賣廳",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "6件展品，每隊18枚籌碼（餘幣每3枚+1分）",
      advanced: "8件展品，每隊22枚，多檔加價更緊湊",
    },
  },
  { id: "beans", title: "豆豆分碗", description: "算準落點，空碗搶對面拼高分", action: "開始分豆", layoutPreset: "BOARD_TABLE", difficultyDescriptions: { normal: "每碗4顆，含空碗搶對面規則", advanced: "對稱多樣開局，含空碗搶對面與後續推演" } },
  { id: "lost", title: "失物招領所", description: "問對問題，找出真正失物", action: "開始認領", layoutPreset: "BOARD_TABLE", difficultyDescriptions: { normal: "8件器物，最多3問", advanced: "12件器物，最多4問" } },
  { id: "animals", title: "動物排排坐", description: "交換座位，滿足朋友的小要求", action: "開始排座位", layoutPreset: "BOARD_TABLE", difficultyDescriptions: { normal: "6隻動物，觀察相鄰與左右關係", advanced: "8隻動物，加入不相鄰條件" } },
  { id: "borrow", title: "借一步棋", description: "這一步用過的招式，對手也能借走", action: "開始下棋", layoutPreset: "BOARD_TABLE", difficultyDescriptions: { normal: "可看雙方移動圖示，親手練習換牌", advanced: "看雙方圖示，電腦預想對手回應" } },
  {
    id: "frog-pond",
    title: "池塘跳荷葉",
    description: "直跳採蓮花，順手切斷對手去路",
    action: "跳進池塘",
    layoutPreset: "BOARD_SIDEBAR",
    difficultyDescriptions: {
      normal: "5×5池塘、每隊2隻青蛙，先採多蓮花",
      advanced: "6×6池塘、每隊3隻青蛙，含天然水洞切島",
    },
  },
  {
    id: "cloud-towers",
    title: "雲頂雙塔",
    description: "走一步再蓋一層，搶先登上 3 樓塔頂",
    action: "登上高塔",
    layoutPreset: "BOARD_SIDEBAR",
    difficultyDescriptions: {
      normal: "5×5海島標準局，每隊2位建築師",
      advanced: "5×5含海礁障礙與雙座預設 1 樓露台",
    },
  },
  {
    id: "chef-split",
    title: "主廚分雙盤",
    description: "我來分盤、你先選，換位算計湊甜點",
    action: "開張甜點台",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "6輪每輪4份甜點，湊成套組拼高分",
      advanced: "6輪每輪5份甜點，加入扣分焦黑點心",
    },
  },
  {
    id: "sumo-push",
    title: "擂台推推樂",
    description: "人多推得動人少，把對手推下擂台",
    action: "站上擂台",
    layoutPreset: "BOARD_SIDEBAR",
    difficultyDescriptions: {
      normal: "5×5木製擂台、各6枚棋子，先推落3枚勝",
      advanced: "6×6擂台、各8枚棋子，含中立木箱推擠",
    },
  },
] as const;
export type PlaygroundId = (typeof PLAYGROUND_CATALOG)[number]["id"];


