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
      normal: "9回合交付8箱補給，較平穩海況",
      advanced: "9回合交付10箱補給，風浪更多",
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
      normal: "每隊8盞，三次固定公開價值",
      advanced: "每隊6盞，三次變化公開價值",
    },
  },
  {
    id: "workshop",
    title: "小鎮工坊",
    description: "派工取材，投資升級或立即出貨",
    action: "開啟工坊",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "5工作日，每隊每日2位工匠",
      advanced: "6工作日，每隊每日3位工匠，站位更緊",
    },
  },
  {
    id: "auction",
    title: "古物拍賣會",
    description: "公開競價，收藏一場精彩展覽",
    action: "進入拍賣廳",
    layoutPreset: "BOARD_TABLE",
    difficultyDescriptions: {
      normal: "6件展品，每隊18枚遊戲籌碼",
      advanced: "8件展品，每隊22枚，規劃更多套組",
    },
  },
] as const;
export type PlaygroundId = (typeof PLAYGROUND_CATALOG)[number]["id"];
