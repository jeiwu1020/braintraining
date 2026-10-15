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
] as const;
export type PlaygroundId = (typeof PLAYGROUND_CATALOG)[number]["id"];
