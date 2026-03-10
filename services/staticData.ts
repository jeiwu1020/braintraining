
import { SortingLevel, MarketLevel, StepsLevel, ShadowLevel, EmotionLevel, PatternLevel, TimeLevel, OddOneLevel, PuzzleLevel, SoundLevel } from "../types";

export const STATIC_ENCOURAGEMENTS = [
  "做得好！繼續保持！",
  "太棒了！你的大腦正在進步！",
  "非常優秀，反應很快喔！",
  "很專注，表現得很好！",
  "給自己一個掌聲！"
];

// --- 眼明手快 (FIND) - Expanded to ~100 pairs ---
export const STATIC_FIND_PAIRS = [
  // Difficulty 1 (Distinct)
  { target: "🐱", distractor: "🐯", difficulty: 1 }, { target: "🏀", distractor: "⚽", difficulty: 1 }, { target: "🍎", distractor: "🍅", difficulty: 1 },
  { target: "🚗", distractor: "🚕", difficulty: 1 }, { target: "🌙", distractor: "☀️", difficulty: 1 }, { target: "🌧️", distractor: "🌨️", difficulty: 1 },
  { target: "🐟", distractor: "🐬", difficulty: 1 }, { target: "🦊", distractor: "🐺", difficulty: 1 }, { target: "🌵", distractor: "🌲", difficulty: 1 },
  { target: "🎸", distractor: "🎻", difficulty: 1 }, { target: "🍩", distractor: "🥯", difficulty: 1 }, { target: "🍕", distractor: "🧀", difficulty: 1 },
  { target: "🚲", distractor: "🛵", difficulty: 1 }, { target: "🥤", distractor: "🧃", difficulty: 1 }, { target: "🦋", distractor: "🐝", difficulty: 1 },
  { target: "👻", distractor: "💀", difficulty: 1 }, { target: "🎁", distractor: "📦", difficulty: 1 }, { target: "👑", distractor: "👒", difficulty: 1 },
  { target: "💎", distractor: "💍", difficulty: 1 }, { target: "🚀", distractor: "✈️", difficulty: 1 }, { target: "🚆", distractor: "🚌", difficulty: 1 },
  { target: "🐘", distractor: "🦏", difficulty: 1 }, { target: "🐧", distractor: "🐦", difficulty: 1 }, { target: "🐢", distractor: "🐊", difficulty: 1 },
  { target: "🍨", distractor: "🧁", difficulty: 1 }, { target: "🍉", distractor: "🍈", difficulty: 1 }, { target: "🍓", distractor: "🍒", difficulty: 1 },
  { target: "🕰️", distractor: "⏰", difficulty: 1 }, { target: "🔨", distractor: "🪓", difficulty: 1 }, { target: "💡", distractor: "🕯️", difficulty: 1 },
  { target: "🔑", distractor: "🔒", difficulty: 1 }, { target: "👓", distractor: "🕶️", difficulty: 1 }, { target: "👞", distractor: "👟", difficulty: 1 },
  { target: "🌂", distractor: "☂️", difficulty: 1 }, { target: "🎨", distractor: "🎭", difficulty: 1 },
  
  // Difficulty 2 (Similar)
  { target: "🏠", distractor: "🏡", difficulty: 2 }, { target: "🔒", distractor: "🔓", difficulty: 2 }, { target: "🔎", distractor: "🔍", difficulty: 2 },
  { target: "🔈", distractor: "🔊", difficulty: 2 }, { target: "😄", distractor: "😃", difficulty: 2 }, { target: "😠", distractor: "😡", difficulty: 2 },
  { target: "📁", distractor: "📂", difficulty: 2 }, { target: "📅", distractor: "📆", difficulty: 2 }, { target: "📈", distractor: "📉", difficulty: 2 },
  { target: "📤", distractor: "📥", difficulty: 2 }, { target: "🔒", distractor: "🔐", difficulty: 2 }, { target: "🖊️", distractor: "🖋️", difficulty: 2 },
  { target: "📎", distractor: "🖇️", difficulty: 2 }, { target: "📏", distractor: "📐", difficulty: 2 }, { target: "🔨", distractor: "🛠️", difficulty: 2 },
  { target: "🔧", distractor: "🪛", difficulty: 2 }, { target: "🧱", distractor: "🪵", difficulty: 2 }, { target: "🩺", distractor: "🌡️", difficulty: 2 },
  { target: "🧪", distractor: "⚗️", difficulty: 2 }, { target: "🧬", distractor: "🔬", difficulty: 2 }, { target: "🔭", distractor: "🔬", difficulty: 2 },
  { target: "📡", distractor: "🛰️", difficulty: 2 }, { target: "🔌", distractor: "🔋", difficulty: 2 }, { target: "📀", distractor: "💿", difficulty: 2 },
  { target: "🎥", distractor: "📹", difficulty: 2 }, { target: "📺", distractor: "🖥️", difficulty: 2 }, { target: "🖱️", distractor: "🖲️", difficulty: 2 },
  { target: "📠", distractor: "🖨️", difficulty: 2 }, { target: "📱", distractor: "📲", difficulty: 2 }, { target: "💴", distractor: "💵", difficulty: 2 },
  { target: "💶", distractor: "💷", difficulty: 2 }, { target: "🏷️", distractor: "🔖", difficulty: 2 }, { target: "📫", distractor: "📪", difficulty: 2 },
  { target: "📬", distractor: "📭", difficulty: 2 }, { target: "📖", distractor: "📚", difficulty: 2 },

  // Difficulty 3 (Very Similar/Abstract)
  { target: "🍀", distractor: "☘️", difficulty: 3 }, { target: "😐", distractor: "😑", difficulty: 3 }, { target: "🔔", distractor: "🔕", difficulty: 3 },
  { target: "➡️", distractor: "⇨", difficulty: 3 }, { target: "✔️", distractor: "☑️", difficulty: 3 }, { target: "⌚", distractor: "⏰", difficulty: 3 },
  { target: "🔃", distractor: "🔄", difficulty: 3 }, { target: "➕", distractor: "✖️", difficulty: 3 }, { target: "⏮️", distractor: "⏭️", difficulty: 3 },
  { target: "✅", distractor: "❎", difficulty: 3 }, { target: "⚪", distractor: "⚫", difficulty: 3 }, { target: "🟦", distractor: "🟧", difficulty: 3 },
  { target: "📝", distractor: "📋", difficulty: 3 }, { target: "⏪", distractor: "⏩", difficulty: 3 }, { target: "🔼", distractor: "🔽", difficulty: 3 },
  { target: "🔈", distractor: "🔇", difficulty: 3 }, { target: "🌤️", distractor: "🌥️", difficulty: 3 }, { target: "🕐", distractor: "🕑", difficulty: 3 },
  { target: "❤️", distractor: "🧡", difficulty: 3 }, { target: "🟥", distractor: "🛑", difficulty: 3 }, { target: "☮️", distractor: "✝️", difficulty: 3 },
  { target: "⚧", distractor: "♂️", difficulty: 3 }, { target: "♻️", distractor: "🔰", difficulty: 3 }, { target: "👁️", distractor: "👀", difficulty: 3 },
  { target: "🗣️", distractor: "👤", difficulty: 3 }, { target: "🚲", distractor: "🚴", difficulty: 3 }, { target: "🦶", distractor: "🦵", difficulty: 3 },
  { target: "🧱", distractor: "🚪", difficulty: 3 }, { target: "🚫", distractor: "⛔", difficulty: 3 }, { target: "✳️", distractor: "❇️", difficulty: 3 },
  { target: "⬅️", distractor: "⬅", difficulty: 3 }, { target: "☁️", distractor: "🌨️", difficulty: 3 }, { target: "☀️", distractor: "🌞", difficulty: 3 },
  { target: "⭐", distractor: "🌟", difficulty: 3 }, { target: "❄️", distractor: "☃️", difficulty: 3 }
];

// --- SORTING GAME ---
const SORTING_NORMAL_BASE: SortingLevel[] = [
  { categoryA: "水果", categoryB: "交通工具", items: [{ id: "s1", name: "蘋果", category: "A" }, { id: "s2", name: "香蕉", category: "A" }, { id: "s3", name: "葡萄", category: "A" }, { id: "s4", name: "公車", category: "B" }, { id: "s5", name: "飛機", category: "B" }, { id: "s6", name: "腳踏車", category: "B" }] },
  { categoryA: "陸地動物", categoryB: "海洋生物", items: [{ id: "s1", name: "獅子", category: "A" }, { id: "s2", name: "大象", category: "A" }, { id: "s3", name: "長頸鹿", category: "A" }, { id: "s4", name: "海豚", category: "B" }, { id: "s5", name: "章魚", category: "B" }, { id: "s6", name: "鯊魚", category: "B" }] },
  { categoryA: "廚房用品", categoryB: "浴室用品", items: [{ id: "s1", name: "鍋子", category: "A" }, { id: "s2", name: "菜刀", category: "A" }, { id: "s3", name: "砧板", category: "A" }, { id: "s4", name: "洗髮精", category: "B" }, { id: "s5", name: "毛巾", category: "B" }, { id: "s6", name: "牙刷", category: "B" }] },
  { categoryA: "夏天", categoryB: "冬天", items: [{ id: "s1", name: "電風扇", category: "A" }, { id: "s2", name: "冰淇淋", category: "A" }, { id: "s3", name: "短袖", category: "A" }, { id: "s4", name: "圍巾", category: "B" }, { id: "s5", name: "暖爐", category: "B" }, { id: "s6", name: "羽絨衣", category: "B" }] },
  { categoryA: "電器", categoryB: "家具", items: [{ id: "s1", name: "電視", category: "A" }, { id: "s2", name: "冰箱", category: "A" }, { id: "s3", name: "洗衣機", category: "A" }, { id: "s4", name: "沙發", category: "B" }, { id: "s5", name: "床墊", category: "B" }, { id: "s6", name: "衣櫥", category: "B" }] },
  { categoryA: "吃的", categoryB: "穿的", items: [{ id: "s1", name: "麵包", category: "A" }, { id: "s2", name: "雞腿", category: "A" }, { id: "s3", name: "青菜", category: "A" }, { id: "s4", name: "襪子", category: "B" }, { id: "s5", name: "襯衫", category: "B" }, { id: "s6", name: "褲子", category: "B" }] },
  { categoryA: "紅色", categoryB: "綠色", items: [{ id: "s1", name: "消防車", category: "A" }, { id: "s2", name: "草莓", category: "A" }, { id: "s3", name: "紅包", category: "A" }, { id: "s4", name: "樹葉", category: "B" }, { id: "s5", name: "青蛙", category: "B" }, { id: "s6", name: "郵筒(綠)", category: "B" }] },
  { categoryA: "天空飛的", categoryB: "地上跑的", items: [{ id: "s1", name: "老鷹", category: "A" }, { id: "s2", name: "直升機", category: "A" }, { id: "s3", name: "雲朵", category: "A" }, { id: "s4", name: "老虎", category: "B" }, { id: "s5", name: "汽車", category: "B" }, { id: "s6", name: "火車", category: "B" }] },
  { categoryA: "蔬菜", categoryB: "水果", items: [{ id: "s1", name: "高麗菜", category: "A" }, { id: "s2", name: "紅蘿蔔", category: "A" }, { id: "s3", name: "青江菜", category: "A" }, { id: "s4", name: "蘋果", category: "B" }, { id: "s5", name: "西瓜", category: "B" }, { id: "s6", name: "橘子", category: "B" }] },
  { categoryA: "樂器", categoryB: "運動用品", items: [{ id: "s1", name: "鋼琴", category: "A" }, { id: "s2", name: "吉他", category: "A" }, { id: "s3", name: "小提琴", category: "A" }, { id: "s4", name: "籃球", category: "B" }, { id: "s5", name: "羽毛球拍", category: "B" }, { id: "s6", name: "棒球手套", category: "B" }] },
  { categoryA: "甜點", categoryB: "飲料", items: [{id: "s1", name: "蛋糕", category: "A"}, {id: "s2", name: "布丁", category: "A"}, {id: "s3", name: "甜甜圈", category: "A"}, {id: "s4", name: "牛奶", category: "B"}, {id: "s5", name: "果汁", category: "B"}, {id: "s6", name: "熱茶", category: "B"}] },
  { categoryA: "圓形的", categoryB: "方形的", items: [{id: "s1", name: "球", category: "A"}, {id: "s2", name: "輪胎", category: "A"}, {id: "s3", name: "硬幣", category: "A"}, {id: "s4", name: "書本", category: "B"}, {id: "s5", name: "箱子", category: "B"}, {id: "s6", name: "電視", category: "B"}] },
  { categoryA: "學校", categoryB: "公園", items: [{id: "s1", name: "黑板", category: "A"}, {id: "s2", name: "課本", category: "A"}, {id: "s3", name: "老師", category: "A"}, {id: "s4", name: "溜滑梯", category: "B"}, {id: "s5", name: "盪鞦韆", category: "B"}, {id: "s6", name: "草地", category: "B"}] },
  { categoryA: "很重", categoryB: "很輕", items: [{id: "s1", name: "大象", category: "A"}, {id: "s2", name: "汽車", category: "A"}, {id: "s3", name: "石頭", category: "A"}, {id: "s4", name: "羽毛", category: "B"}, {id: "s5", name: "氣球", category: "B"}, {id: "s6", name: "衛生紙", category: "B"}] },
  { categoryA: "熱的", categoryB: "冷的", items: [{id: "s1", name: "火鍋", category: "A"}, {id: "s2", name: "太陽", category: "A"}, {id: "s3", name: "熱湯", category: "A"}, {id: "s4", name: "冰塊", category: "B"}, {id: "s5", name: "雪人", category: "B"}, {id: "s6", name: "冷氣", category: "B"}] },
  { categoryA: "文具", categoryB: "餐具", items: [{id: "s1", name: "鉛筆", category: "A"}, {id: "s2", name: "尺", category: "A"}, {id: "s3", name: "橡皮擦", category: "A"}, {id: "s4", name: "筷子", category: "B"}, {id: "s5", name: "湯匙", category: "B"}, {id: "s6", name: "碗", category: "B"}] },
  { categoryA: "早上", categoryB: "晚上", items: [{id: "s1", name: "吃早餐", category: "A"}, {id: "s2", name: "太陽升起", category: "A"}, {id: "s3", name: "公雞叫", category: "A"}, {id: "s4", name: "看星星", category: "B"}, {id: "s5", name: "睡覺", category: "B"}, {id: "s6", name: "貓頭鷹", category: "B"}] },
  { categoryA: "有腳", categoryB: "沒腳", items: [{id: "s1", name: "狗", category: "A"}, {id: "s2", name: "雞", category: "A"}, {id: "s3", name: "螞蟻", category: "A"}, {id: "s4", name: "蛇", category: "B"}, {id: "s5", name: "魚", category: "B"}, {id: "s6", name: "蚯蚓", category: "B"}] },
  { categoryA: "會飛", categoryB: "不會飛", items: [{id: "s1", name: "老鷹", category: "A"}, {id: "s2", name: "蝴蝶", category: "A"}, {id: "s3", name: "蚊子", category: "A"}, {id: "s4", name: "大象", category: "B"}, {id: "s5", name: "豬", category: "B"}, {id: "s6", name: "烏龜", category: "B"}] },
  { categoryA: "喝的", categoryB: "吃的", items: [{id: "s1", name: "水", category: "A"}, {id: "s2", name: "果汁", category: "A"}, {id: "s3", name: "湯", category: "A"}, {id: "s4", name: "飯", category: "B"}, {id: "s5", name: "肉", category: "B"}, {id: "s6", name: "菜", category: "B"}] },
];

const generateExtendedSorting = (base: SortingLevel[], count: number): SortingLevel[] => {
    const extended = [...base];
    const templates = [
        { A: "甜的", B: "鹹的", itemsA: ["糖果", "蛋糕", "巧克力", "冰淇淋"], itemsB: ["鹽巴", "醬油", "薯條(鹽)", "鹹魚"] },
        { A: "有輪子", B: "沒輪子", itemsA: ["汽車", "腳踏車", "溜冰鞋"], itemsB: ["船", "熱氣球", "竹筏"] },
        { A: "軟的", B: "硬的", itemsA: ["棉花", "枕頭", "毛巾"], itemsB: ["石頭", "鐵鎚", "鑽石"] },
        { A: "紅色", B: "黃色", itemsA: ["蘋果", "消防車", "草莓"], itemsB: ["香蕉", "計程車", "檸檬"] },
        { A: "男生", B: "女生", itemsA: ["爸爸", "爺爺", "哥哥"], itemsB: ["媽媽", "奶奶", "姊姊"] },
    ];
    let i = 0;
    while (extended.length < count) {
        const t = templates[i % templates.length];
        const items = [
            { id: `gen-a1-${i}`, name: t.itemsA[0], category: 'A' as const },
            { id: `gen-a2-${i}`, name: t.itemsA[1], category: 'A' as const },
            { id: `gen-a3-${i}`, name: t.itemsA[2], category: 'A' as const },
            { id: `gen-b1-${i}`, name: t.itemsB[0], category: 'B' as const },
            { id: `gen-b2-${i}`, name: t.itemsB[1], category: 'B' as const },
            { id: `gen-b3-${i}`, name: t.itemsB[2], category: 'B' as const },
        ];
        extended.push({ categoryA: t.A, categoryB: t.B, items });
        i++;
    }
    return extended;
};
export const STATIC_SORTING_LEVELS = generateExtendedSorting(SORTING_NORMAL_BASE, 50);

const SORTING_ADVANCED_BASE: SortingLevel[] = [
    { categoryA: "可回收", categoryB: "一般垃圾", items: [{id: "as1", name: "寶特瓶", category: "A"}, {id: "as2", name: "舊報紙", category: "A"}, {id: "as3", name: "玻璃瓶", category: "A"}, {id: "as4", name: "衛生紙", category: "B"}, {id: "as5", name: "雞骨頭", category: "B"}, {id: "as6", name: "塑膠袋", category: "B"}] },
    { categoryA: "公共場所", categoryB: "私人場所", items: [{id: "as1", name: "公園", category: "A"}, {id: "as2", name: "圖書館", category: "A"}, {id: "as3", name: "火車站", category: "A"}, {id: "as4", name: "臥室", category: "B"}, {id: "as5", name: "浴室", category: "B"}, {id: "as6", name: "客廳", category: "B"}] },
    { categoryA: "液體", categoryB: "固體", items: [{id: "as1", name: "牛奶", category: "A"}, {id: "as2", name: "醬油", category: "A"}, {id: "as3", name: "洗髮精", category: "A"}, {id: "as4", name: "冰塊", category: "B"}, {id: "as5", name: "木頭", category: "B"}, {id: "as6", name: "石頭", category: "B"}] },
    { categoryA: "需要電", categoryB: "不需要電", items: [{id: "as1", name: "手機", category: "A"}, {id: "as2", name: "吹風機", category: "A"}, {id: "as3", name: "微波爐", category: "A"}, {id: "as4", name: "掃把", category: "B"}, {id: "as5", name: "書籍", category: "B"}, {id: "as6", name: "單車", category: "B"}] },
    { categoryA: "有生命", categoryB: "無生命", items: [{id: "as1", name: "榕樹", category: "A"}, {id: "as2", name: "螞蟻", category: "A"}, {id: "as3", name: "細菌", category: "A"}, {id: "as4", name: "岩石", category: "B"}, {id: "as5", name: "機器人", category: "B"}, {id: "as6", name: "雲", category: "B"}] },
    { categoryA: "很危險", categoryB: "很安全", items: [{id: "as1", name: "火", category: "A"}, {id: "as2", name: "刀片", category: "A"}, {id: "as3", name: "深水區", category: "A"}, {id: "as4", name: "棉花", category: "B"}, {id: "as5", name: "草地", category: "B"}, {id: "as6", name: "枕頭", category: "B"}] },
    { categoryA: "正向情緒", categoryB: "負向情緒", items: [{id: "as1", name: "興奮", category: "A"}, {id: "as2", name: "感激", category: "A"}, {id: "as3", name: "平靜", category: "A"}, {id: "as4", name: "嫉妒", category: "B"}, {id: "as5", name: "焦慮", category: "B"}, {id: "as6", name: "憤怒", category: "B"}] },
    { categoryA: "健康的", categoryB: "不健康的", items: [{id: "as1", name: "運動", category: "A"}, {id: "as2", name: "早睡", category: "A"}, {id: "as3", name: "喝水", category: "A"}, {id: "as4", name: "熬夜", category: "B"}, {id: "as5", name: "抽菸", category: "B"}, {id: "as6", name: "久坐", category: "B"}] },
    { categoryA: "辦公用品", categoryB: "清潔工具", items: [{id: "as1", name: "釘書機", category: "A"}, {id: "as2", name: "迴紋針", category: "A"}, {id: "as3", name: "印表機", category: "A"}, {id: "as4", name: "拖把", category: "B"}, {id: "as5", name: "水桶", category: "B"}, {id: "as6", name: "刷子", category: "B"}] },
    { categoryA: "夏季", categoryB: "冬季", items: [{id: "as1", name: "蟬叫", category: "A"}, {id: "as2", name: "颱風", category: "A"}, {id: "as3", name: "泳池", category: "A"}, {id: "as4", name: "寒流", category: "B"}, {id: "as5", name: "暖暖包", category: "B"}, {id: "as6", name: "火鍋", category: "B"}] },
];
const generateExtendedSortingAdvanced = (base: SortingLevel[], count: number): SortingLevel[] => {
    const extended = [...base];
    const templates = [
        { A: "天然的", B: "人造的", itemsA: ["太陽", "花朵", "河流"], itemsB: ["汽車", "電腦", "塑膠袋"] },
        { A: "發酵食品", B: "非發酵", itemsA: ["優格", "起司", "泡菜"], itemsB: ["鮮奶", "新鮮蔬菜", "白米飯"] },
        { A: "哺乳類", B: "爬蟲類", itemsA: ["海豚", "蝙蝠", "袋鼠"], itemsB: ["烏龜", "蛇", "變色龍"] },
        { A: "主觀意見", B: "客觀事實", itemsA: ["這花很美", "我不喜歡雨", "菜太鹹"], itemsB: ["現在下雨", "地球是圓的", "一天24小時"] },
        { A: "省錢", B: "浪費", itemsA: ["隨手關燈", "記帳", "比價"], itemsB: ["開冷氣開窗", "亂買東西", "不關水龍頭"] },
        { A: "禮貌", B: "不禮貌", itemsA: ["請", "謝謝", "對不起"], itemsB: ["插隊", "罵人", "不理人"] },
        { A: "抽象", B: "具體", itemsA: ["愛", "和平", "夢想"], itemsB: ["蘋果", "石頭", "書本"] },
    ];
    let i = 0;
    while (extended.length < count) {
        const t = templates[i % templates.length];
        const items = [
            { id: `adv-a1-${i}`, name: t.itemsA[0], category: 'A' as const },
            { id: `adv-a2-${i}`, name: t.itemsA[1], category: 'A' as const },
            { id: `adv-a3-${i}`, name: t.itemsA[2], category: 'A' as const },
            { id: `adv-b1-${i}`, name: t.itemsB[0], category: 'B' as const },
            { id: `adv-b2-${i}`, name: t.itemsB[1], category: 'B' as const },
            { id: `adv-b3-${i}`, name: t.itemsB[2], category: 'B' as const },
        ];
        extended.push({ categoryA: t.A, categoryB: t.B, items });
        i++;
    }
    return extended;
};
export const STATIC_SORTING_LEVELS_ADVANCED = generateExtendedSortingAdvanced(SORTING_ADVANCED_BASE, 50);

const generateSentences = (base: string[], count: number) => {
    const list = [...base];
    const subjects = ["哥哥", "妹妹", "小狗", "小貓", "爸爸", "媽媽", "老師", "同學"];
    const verbs = ["喜歡", "討厭", "想要", "正在", "去", "看見"];
    const objects = ["吃蘋果", "玩球", "看書", "睡覺", "畫畫", "唱歌", "跳舞"];
    while(list.length < count) {
        const s = subjects[Math.floor(Math.random() * subjects.length)];
        const v = verbs[Math.floor(Math.random() * verbs.length)];
        const o = objects[Math.floor(Math.random() * objects.length)];
        const sentence = `${s}${v}${o}`;
        if(!list.includes(sentence)) list.push(sentence);
    }
    return list;
};
export const STATIC_SENTENCES = generateSentences([
  "今天天氣真好", "我喜歡吃蘋果", "媽媽去買菜", "小狗在跑步", "花園裡有花", "爸爸看報紙", "弟弟玩積木", "太陽公公出來了",
  "我們要洗手", "大家一起唱歌", "樹上有小鳥", "我會自己穿鞋", "要多喝水", "垃圾不亂丟", "早睡早起身體好"
], 100);
export const STATIC_SENTENCES_ADVANCED = generateSentences([
    "雖然今天下雨，但我們還是很開心", "運動過後要記得補充水分才健康", "過馬路的時候，一定要看紅綠燈", "保持規律的作息，精神才會飽滿",
    "這本書的故事非常精彩有趣", "我們要愛護地球，做好資源回收", "這家餐廳的料理既便宜又美味", "朋友之間要互相幫助，感情才會好",
    "如果不刷牙，牙齒就會蛀掉", "只要努力練習，一定會進步的", "夏天的夜晚，常常可以聽見蟲鳴聲", "我把房間整理得乾乾淨淨",
    "這是一次非常難忘的旅行經驗", "每天運動三十分鐘有益身心健康", "看電影的時候請保持安靜"
], 100);

const generateMarketData = (difficulty: 'NORMAL' | 'ADVANCED', count: number): MarketLevel[] => {
    const levels: MarketLevel[] = [];
    const itemsList = [
        {name: "蘋果", icon: "🍎"}, {name: "香蕉", icon: "🍌"}, {name: "麵包", icon: "🍞"}, {name: "牛奶", icon: "🥛"},
        {name: "蛋糕", icon: "🍰"}, {name: "布丁", icon: "🍮"}, {name: "漢堡", icon: "🍔"}, {name: "薯條", icon: "🍟"},
        {name: "可樂", icon: "🥤"}, {name: "三明治", icon: "🥪"}, {name: "便當", icon: "🍱"}, {name: "飯糰", icon: "🍙"}
    ];
    for(let i=0; i<count; i++) {
        const item1 = itemsList[Math.floor(Math.random() * itemsList.length)];
        let item2 = itemsList[Math.floor(Math.random() * itemsList.length)];
        while(item2.name === item1.name) item2 = itemsList[Math.floor(Math.random() * itemsList.length)];
        let price1, price2, question, answer, options;
        if (difficulty === 'NORMAL') {
            price1 = (Math.floor(Math.random() * 5) + 1) * 10;
            price2 = (Math.floor(Math.random() * 5) + 1) * 5;
            answer = price1 + price2;
            question = `買一個${item1.name}和一個${item2.name}，共多少錢？`;
            options = [answer, answer + 5, answer - 5].sort(() => 0.5 - Math.random());
        } else {
            price1 = (Math.floor(Math.random() * 10) + 1) * 10 + 5;
            price2 = (Math.floor(Math.random() * 10) + 1) * 10; 
            const total = 200;
            answer = total - (price1 + price2);
            question = `帶200元買${item1.name}和${item2.name}，會找多少錢？`;
            options = [answer, answer + 10, answer - 10].sort(() => 0.5 - Math.random());
        }
        levels.push({
            items: [
                {name: item1.name, icon: item1.icon, price: price1},
                {name: item2.name, icon: item2.icon, price: price2}
            ],
            question,
            options,
            correctAnswer: answer
        });
    }
    return levels;
};
export const STATIC_MARKET_LEVELS = generateMarketData('NORMAL', 100);
export const STATIC_MARKET_LEVELS_ADVANCED_FIXED = generateMarketData('ADVANCED', 100);

const generateStepsData = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): StepsLevel[] => {
    const levels: StepsLevel[] = [];
    const tasks = [
        { t: "刷牙", s: ["擠牙膏", "刷牙齒", "漱口", "擦嘴巴"] },
        { t: "洗手", s: ["沖濕手", "抹肥皂", "搓揉", "沖水"] },
        { t: "穿襪子", s: ["拿襪子", "套腳尖", "拉腳跟", "拉平"] },
        { t: "泡麵", s: ["開蓋", "放調料", "沖熱水", "等三分鐘"] },
        { t: "澆花", s: ["裝水", "走到花盆", "澆水", "放回水壺"] },
        { t: "洗臉", s: ["弄濕臉", "抹洗面乳", "搓揉", "沖乾淨"] },
        { t: "吃香蕉", s: ["拿香蕉", "剝皮", "吃香蕉", "丟皮"] },
        { t: "喝水", s: ["拿杯子", "倒水", "喝水", "放杯子"] },
        { t: "戴口罩", s: ["分正反", "掛耳朵", "拉開", "壓鼻樑"] },
        { t: "擦桌子", s: ["拿抹布", "沾水", "擰乾", "擦桌子"] }
    ];
    const advTasks = [
        { t: "煮水餃", s: ["燒水", "下水餃", "加冷水", "撈起", "沾醬"] },
        { t: "寄信", s: ["寫信", "裝信封", "貼郵票", "投郵筒", "回家"] },
        { t: "看病", s: ["掛號", "候診", "看診", "批價", "領藥"] },
        { t: "搭公車", s: ["等車", "招手", "上車", "刷卡", "下車"] },
        { t: "ATM", s: ["插卡", "密碼", "金額", "取卡", "取錢"] },
        { t: "洗衣服", s: ["分類", "放衣", "加粉", "啟動", "晾乾"] },
        { t: "買菜", s: ["清單", "拿籃", "選菜", "結帳", "裝袋"] },
    ];
    const source = difficulty === 'NORMAL' ? tasks : advTasks;
    for(let i=0; i<count; i++) {
        const template = source[i % source.length];
        const level: StepsLevel = {
            title: `${template.t} (${i+1})`, 
            steps: template.s.map((text, idx) => ({
                id: `step-${i}-${idx}`,
                text: text,
                order: idx + 1
            }))
        };
        levels.push(level);
    }
    return levels;
};
export const STATIC_STEPS_LEVELS = generateStepsData(100, 'NORMAL');
export const STATIC_STEPS_LEVELS_ADVANCED = generateStepsData(100, 'ADVANCED');

const STATIC_SHADOW_SOURCE = [
  "🐰", "🚗", "🍌", "✈️", "🏀", "🏠", "🌷", "🚲", "🕶️", "☂️", 
  "🕰️", "🐘", "🎸", "🍦", "🦋", "🌵", "🔑", "🐢", "🎩", "🧢",
  "🎓", "👑", "🎒", "👜", "💼", "👓", "🧣", "🧤",
  "🧥", "🧦", "👗", "👘", "👙", "👚",
  "👛", "👞", "👟", "👠", "👢", 
  "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧",
  "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗",
  "🐴", "🦄", "🐝", "🐛", "🐌", "🐞", "🐜", 
  "🕷️", "🕸️", "🦂", "🐍", "🦎",
  "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳"
];
export const STATIC_SHADOW_CONFUSING_SETS = [
    ["🐶", "🐺", "🦊", "🐕"],
    ["🐱", "🐯", "🐆", "🦁"],
    ["🐔", "🦆", "🦅", "🦜", "🐦"],
    ["🚗", "🚕", "🚙", "🚓"],
    ["🍎", "🍅", "🍑", "🍊"],
    ["🐴", "🦄", "🦓", "🐎"],
    ["👕", "👚", "🧥", "👔"],
    ["👟", "👞", "🥾", "👢"],
    ["👓", "🕶️", "🥽"],
    ["🔨", "🪓", "🔧", "🪛"],
    ["📏", "📐", "🖇️", "📎"]
];
export const STATIC_SHADOW_CATEGORIES: Record<string, string[]> = {
    "動物": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐸", "🦁", "🐧", "🦉"],
    "水果與食物": ["🍌", "🍇", "🍓", "🍍", "🍉", "🍒", "🍐", "🍦", "🍩", "🍕", "🌭"],
    "交通": ["🚗", "🚌", "🏎️", "🚑", "🚚", "🚲", "✈️", "🚁", "🚢", "🛵", "🚜", "🚂"],
    "工具": ["🔨", "🔧", "✂️", "🔑", "🔭", "🔬", "⚖️", "🔒", "📎", "📌"], 
    "自然": ["🌵", "🌲", "🌴", "🍁", "🍄", "🌻", "🔥", "⚡", "🌈", "☀️"], 
    "衣物配件": ["👗", "👙", "🧥", "👖", "🧢", "🧣", "🧤", "🧦", "👞", "👠"]
};
const generateShadowData = (): ShadowLevel[] => {
    const levels: ShadowLevel[] = [];
    for(let i=0; i<STATIC_SHADOW_SOURCE.length; i++) {
        const target = STATIC_SHADOW_SOURCE[i];
        const options = [target];
        while(options.length < 4) {
            const rand = STATIC_SHADOW_SOURCE[Math.floor(Math.random() * STATIC_SHADOW_SOURCE.length)];
            if(!options.includes(rand)) options.push(rand);
        }
        options.sort(() => 0.5 - Math.random());
        levels.push({ target, options, correctIndex: options.indexOf(target) });
    }
    return levels;
};
export const STATIC_SHADOW_LEVELS = generateShadowData();
export const STATIC_SHADOW_LEVELS_ADVANCED = []; 

const EMOTION_BASE_NORMAL = [
  { question: "收到生日禮物時，你會覺得？", emoji: "🎁", options: ["開心", "生氣", "害怕"], correctAnswer: "開心" },
  { question: "不小心跌倒受傷了，可能會覺得？", emoji: "🤕", options: ["興奮", "難過/痛", "驚喜"], correctAnswer: "難過/痛" },
  { question: "看恐怖電影的時候，通常會感到？", emoji: "👻", options: ["無聊", "害怕", "快樂"], correctAnswer: "害怕" },
  { question: "心愛的玩具被弄壞了，你會？", emoji: "💔", options: ["生氣", "開心", "想睡覺"], correctAnswer: "生氣" },
  { question: "明天要去校外教學，心情是？", emoji: "🚌", options: ["期待", "後悔", "悲傷"], correctAnswer: "期待" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😡", options: ["快樂", "生氣", "驚訝"], correctAnswer: "生氣" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😢", options: ["難過", "平靜", "開心"], correctAnswer: "難過" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😱", options: ["想睡", "驚恐", "高興"], correctAnswer: "驚恐" },
  { question: "朋友生病了，你會對他說？", emoji: "🤒", options: ["祝你早日康復", "你好棒", "我也要生病"], correctAnswer: "祝你早日康復" },
  { question: "看到有人跌倒需要幫忙，你應該？", emoji: "🤝", options: ["嘲笑他", "扶他起來", "假裝沒看到"], correctAnswer: "扶他起來" },
  { question: "吃到最喜歡的冰淇淋時，表情是？", emoji: "🍦", options: ["滿足/開心", "痛苦", "生氣"], correctAnswer: "滿足/開心" },
  { question: "外面打雷閃電很大聲，可能會？", emoji: "⛈️", options: ["害怕/驚嚇", "開心", "想睡覺"], correctAnswer: "害怕/驚嚇" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😂", options: ["大笑", "哭泣", "生氣"], correctAnswer: "大笑" },
  { question: "這張臉看起來是什麼情緒？", emoji: "😴", options: ["想睡覺", "興奮", "驚訝"], correctAnswer: "想睡覺" },
  { question: "不想吃青椒，但是媽媽說一定要吃，你會？", emoji: "🫑", options: ["無奈/不情願", "超開心", "害怕"], correctAnswer: "無奈/不情願" },
  { question: "拚好的拼圖被弟弟弄亂了，你會？", emoji: "🧩", options: ["生氣/挫折", "高興", "驚喜"], correctAnswer: "生氣/挫折" },
  { question: "在公園玩盪鞦韆，飛得很高，心情是？", emoji: "🏞️", options: ["興奮/快樂", "難過", "生氣"], correctAnswer: "興奮/快樂" },
  { question: "這張臉看起來是什麼情緒？", emoji: "🤔", options: ["思考/疑惑", "睡覺", "大笑"], correctAnswer: "思考/疑惑" },
  { question: "弄丟了心愛的娃娃，心情是？", emoji: "🧸", options: ["難過/著急", "開心", "興奮"], correctAnswer: "難過/著急" },
  { question: "考了一百分，媽媽稱讚你，你會？", emoji: "💯", options: ["驕傲/開心", "生氣", "害怕"], correctAnswer: "驕傲/開心" }
];
const EMOTION_BASE_ADVANCED = [
    { question: "雖然比賽輸了，但覺得對手很強，這種感覺是？", options: ["佩服/不甘心", "恐懼", "狂喜"], correctAnswer: "佩服/不甘心" },
    { question: "原本不想去參加聚會，結果去了發現很好玩，這是？", options: ["驚喜/改觀", "憤怒", "後悔"], correctAnswer: "驚喜/改觀" },
    { question: "說了謊話怕被發現，心裡七上八下的感覺是？", options: ["焦慮/心虛", "自信", "興奮"], correctAnswer: "焦慮/心虛" },
    { question: "看到朋友受傷，你心裡也覺得痛痛的，這是？", options: ["同理/心疼", "幸災樂禍", "嫉妒"], correctAnswer: "同理/心疼" },
    { question: "好朋友要搬家去很遠的地方，你會感到？", options: ["不捨/失落", "憤怒", "恐懼"], correctAnswer: "不捨/失落" },
    { question: "努力很久的計畫失敗了，但你知道自己盡力了，這是？", options: ["釋懷/遺憾", "狂喜", "羞愧"], correctAnswer: "釋懷/遺憾" },
    { question: "被老師誤會作弊，但是沒人相信你，你會覺得？", options: ["委屈/無助", "驕傲", "期待"], correctAnswer: "委屈/無助" },
    { question: "看到別人遭遇不幸，卻暗自覺得開心，這種不好的心態是？", options: ["幸災樂禍", "同理心", "悲傷"], correctAnswer: "幸災樂禍" },
    { question: "在大家面前講錯話，大家都看著你，你會覺得？", options: ["尷尬/羞愧", "興奮", "憤怒"], correctAnswer: "尷尬/羞愧" },
    { question: "原本以為會被罵，結果爸媽反而安慰你，你會感到？", options: ["如釋重負/感動", "生氣", "失望"], correctAnswer: "如釋重負/感動" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🙄", options: ["無奈/不以為然", "驚喜", "崇拜"], correctAnswer: "無奈/不以為然" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🤔", options: ["思考/質疑", "生氣", "睡著"], correctAnswer: "思考/質疑" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🤥", options: ["心虛/說謊", "自信", "大笑"], correctAnswer: "心虛/說謊" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😒", options: ["鄙視/不高興", "驚喜", "崇拜"], correctAnswer: "鄙視/不高興" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😬", options: ["尷尬/不知所措", "大笑", "睡著"], correctAnswer: "尷尬/不知所措" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😰", options: ["焦慮/緊張冒汗", "開心", "自信"], correctAnswer: "焦慮/緊張冒汗" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😤", options: ["傲慢/固執", "難過", "害怕"], correctAnswer: "傲慢/固執" },
    { question: "這張臉看起來是什麼情緒？", emoji: "😶", options: ["無言/沉默", "興奮", "憤怒"], correctAnswer: "無言/沉默" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🥺", options: ["委屈/請求", "生氣", "自信"], correctAnswer: "委屈/請求" },
    { question: "這張臉看起來是什麼情緒？", emoji: "🤯", options: ["震驚/腦袋爆炸", "平靜", "想睡"], correctAnswer: "震驚/腦袋爆炸" }
];
const generateEmotionData = (difficulty: 'NORMAL' | 'ADVANCED', count: number): EmotionLevel[] => {
    const base = difficulty === 'NORMAL' ? EMOTION_BASE_NORMAL : EMOTION_BASE_ADVANCED;
    const levels: EmotionLevel[] = [];
    for(let i=0; i<count; i++) {
        const t = base[i % base.length];
        levels.push({ ...t }); 
    }
    return levels;
};
export const STATIC_EMOTION_LEVELS = generateEmotionData('NORMAL', 100);
export const STATIC_EMOTION_LEVELS_ADVANCED = generateEmotionData('ADVANCED', 100);

const generatePatterns = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): PatternLevel[] => {
    const levels: PatternLevel[] = [];
    for (let i = 0; i < count; i++) {
        let sequence: string[];
        let options: string[];
        let answer: string;
        
        if (difficulty === 'NORMAL') {
            // Logic for normal: ABAB, AABB, ABC
            const symbols = ["🍎", "🍌", "🍇", "🍊", "🐶", "🐱", "🐰", "🦊", "🔴", "🔵", "🟢", "🟡"];
            const [s1, s2, s3] = symbols.sort(() => 0.5 - Math.random()).slice(0, 3);
            const type = Math.random();
            if (type < 0.33) {
                sequence = [s1, s2, s1, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            } else if (type < 0.66) {
                sequence = [s1, s1, s2, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            } else {
                sequence = [s1, s2, s3, s1, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            }
        } else {
             // Advanced: Rotations, Numbers
             if (Math.random() > 0.5) {
                // Numbers
                const start = Math.floor(Math.random() * 10);
                const step = Math.floor(Math.random() * 5) + 2;
                sequence = [start.toString(), (start+step).toString(), (start+step*2).toString(), "?"];
                answer = (start+step*3).toString();
                options = [answer, (start+step*3+1).toString(), (start+step*3-1).toString()].sort(() => 0.5 - Math.random());
             } else {
                // Direction/Rotation
                const dirs = ["⬆️", "➡️", "⬇️", "⬅️"];
                const startIdx = Math.floor(Math.random() * 4);
                sequence = [dirs[startIdx], dirs[(startIdx+1)%4], dirs[(startIdx+2)%4], "?"];
                answer = dirs[(startIdx+3)%4];
                options = [dirs[0], dirs[1], dirs[2]].sort(() => 0.5 - Math.random());
             }
        }
        levels.push({ sequence, options, answer });
    }
    return levels;
};

export const STATIC_PATTERN_LEVELS = generatePatterns(100, 'NORMAL');
export const STATIC_PATTERN_LEVELS_ADVANCED = generatePatterns(100, 'ADVANCED');

const generateTimeLevels = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): TimeLevel[] => {
    const levels: TimeLevel[] = [];
    for (let i = 0; i < count; i++) {
        if (difficulty === 'NORMAL') {
             const h = Math.floor(Math.random() * 12) + 1;
             const m = Math.random() > 0.5 ? 0 : 30;
             const timeStr = `${h}:${m === 0 ? '00' : '30'}`;
             const d1 = `${(h%12)+1}:${m === 0 ? '00' : '30'}`;
             const d2 = `${h}:${m === 0 ? '30' : '00'}`;
             const options = [timeStr, d1, d2].sort(() => 0.5 - Math.random());
             levels.push({
                 type: 'CLOCK',
                 question: "請問時鐘是幾點？",
                 clockTime: {hour: h, minute: m},
                 options,
                 correctAnswer: timeStr
             });
        } else {
             // Advanced
             if (Math.random() > 0.5) {
                 // Complex Clock
                 const h = Math.floor(Math.random() * 12) + 1;
                 const m = Math.floor(Math.random() * 12) * 5;
                 const timeStr = `${h}:${m.toString().padStart(2, '0')}`;
                 const d1 = `${(h%12)+1}:${m.toString().padStart(2, '0')}`;
                 const d2 = `${h}:${((m+15)%60).toString().padStart(2, '0')}`;
                 const options = [timeStr, d1, d2].sort(() => 0.5 - Math.random());
                 levels.push({
                     type: 'CLOCK',
                     question: "現在幾點幾分？",
                     clockTime: {hour: h, minute: m},
                     options,
                     correctAnswer: timeStr
                 });
             } else {
                 // Math
                 const h = Math.floor(Math.random() * 10) + 1;
                 const add = Math.floor(Math.random() * 3) + 1;
                 const q = `現在是 ${h}點，${add}小時後是幾點？`;
                 const ans = `${h+add}點`;
                 const d1 = `${h+add+1}點`;
                 const d2 = `${h+add-1}點`;
                 const options = [ans, d1, d2].sort(() => 0.5 - Math.random());
                 levels.push({type: 'MATH', question: q, options, correctAnswer: ans});
             }
        }
    }
    return levels;
};

export const STATIC_TIME_LEVELS = generateTimeLevels(100, 'NORMAL');
export const STATIC_TIME_LEVELS_ADVANCED = generateTimeLevels(100, 'ADVANCED');

// --- ODD ONE OUT - Massive Expansion ---
// Helpers for ODD ONE
const createOddOne = (items: {text:string, icon:string}[], correctIdx: number, reason: string): OddOneLevel => ({
    items, correctIndex: correctIdx, reason
});

const ODD_ONE_NORMAL_POOL: OddOneLevel[] = [
    // Animals vs Others
    createOddOne([{text:"貓", icon:"🐱"}, {text:"狗", icon:"🐶"}, {text:"兔子", icon:"🐰"}, {text:"杯子", icon:"☕"}], 3, "杯子不是動物"),
    createOddOne([{text:"蘋果", icon:"🍎"}, {text:"香蕉", icon:"🍌"}, {text:"車子", icon:"🚗"}, {text:"葡萄", icon:"🍇"}], 2, "車子不是水果"),
    createOddOne([{text:"飛機", icon:"✈️"}, {text:"小鳥", icon:"🐦"}, {text:"蝴蝶", icon:"🦋"}, {text:"大象", icon:"🐘"}], 3, "大象不會飛"),
    createOddOne([{text:"魚", icon:"🐟"}, {text:"蝦子", icon:"🦐"}, {text:"螃蟹", icon:"🦀"}, {text:"公雞", icon:"🐓"}], 3, "公雞不在水裡游"),
    // Colors/Shapes
    createOddOne([{text:"紅色", icon:"🟥"}, {text:"藍色", icon:"🟦"}, {text:"綠色", icon:"🟩"}, {text:"太陽", icon:"☀️"}], 3, "太陽不是顏色"),
    createOddOne([{text:"圓形", icon:"🔵"}, {text:"三角形", icon:"🔺"}, {text:"正方形", icon:"🔲"}, {text:"香蕉", icon:"🍌"}], 3, "香蕉是食物"),
    // Body Parts
    createOddOne([{text:"眼睛", icon:"👁️"}, {text:"鼻子", icon:"👃"}, {text:"耳朵", icon:"👂"}, {text:"足球", icon:"⚽"}], 3, "足球不是五官"),
    createOddOne([{text:"手", icon:"✋"}, {text:"腳", icon:"🦶"}, {text:"嘴巴", icon:"👄"}, {text:"襪子", icon:"🧦"}], 3, "襪子是穿的"),
    // Vehicles
    createOddOne([{text:"汽車", icon:"🚗"}, {text:"公車", icon:"🚌"}, {text:"計程車", icon:"🚕"}, {text:"房子", icon:"🏠"}], 3, "房子不能開"),
    createOddOne([{text:"船", icon:"🚢"}, {text:"獨木舟", icon:"🛶"}, {text:"遊艇", icon:"🛥️"}, {text:"火車", icon:"🚂"}], 3, "火車不在水上"),
    // Furniture/House
    createOddOne([{text:"沙發", icon:"🛋️"}, {text:"床", icon:"🛏️"}, {text:"椅子", icon:"🪑"}, {text:"樹", icon:"🌳"}], 3, "樹是植物"),
    createOddOne([{text:"電視", icon:"📺"}, {text:"冰箱", icon:"🧊"}, {text:"洗衣機", icon:"🧺"}, {text:"蘋果", icon:"🍎"}], 3, "蘋果不是電器"),
    // Clothing
    createOddOne([{text:"上衣", icon:"👕"}, {text:"褲子", icon:"👖"}, {text:"裙子", icon:"👗"}, {text:"牙刷", icon:"🪥"}], 3, "牙刷是刷牙用的"),
    createOddOne([{text:"鞋子", icon:"👟"}, {text:"襪子", icon:"🧦"}, {text:"拖鞋", icon:"🩴"}, {text:"手套", icon:"🧤"}], 3, "手套戴在手上，其他穿在腳上"),
    // Food
    createOddOne([{text:"漢堡", icon:"🍔"}, {text:"薯條", icon:"🍟"}, {text:"披薩", icon:"🍕"}, {text:"盤子", icon:"🍽️"}], 3, "盤子不能吃"),
    createOddOne([{text:"牛奶", icon:"🥛"}, {text:"果汁", icon:"🧃"}, {text:"水", icon:"💧"}, {text:"麵包", icon:"🍞"}], 3, "麵包是吃的，其他是喝的"),
    // Weather/Nature
    createOddOne([{text:"下雨", icon:"🌧️"}, {text:"下雪", icon:"🌨️"}, {text:"陰天", icon:"☁️"}, {text:"雨傘", icon:"☂️"}], 3, "雨傘是用具，其他是天氣"),
    createOddOne([{text:"花", icon:"🌸"}, {text:"草", icon:"🌿"}, {text:"樹", icon:"🌲"}, {text:"石頭", icon:"🪨"}], 3, "石頭不是植物"),
    // School
    createOddOne([{text:"鉛筆", icon:"✏️"}, {text:"橡皮擦", icon:"🧹"}, {text:"尺", icon:"📏"}, {text:"糖果", icon:"🍬"}], 3, "糖果是食物"),
    createOddOne([{text:"書包", icon:"🎒"}, {text:"課本", icon:"📖"}, {text:"筆記本", icon:"📒"}, {text:"枕頭", icon:"🛌"}], 3, "枕頭是用來睡覺的"),
    // Sports
    createOddOne([{text:"籃球", icon:"🏀"}, {text:"足球", icon:"⚽"}, {text:"棒球", icon:"⚾"}, {text:"西瓜", icon:"🍉"}], 3, "西瓜是水果"),
    // Jobs
    createOddOne([{text:"醫生", icon:"👨‍⚕️"}, {text:"護理師", icon:"👩‍⚕️"}, {text:"警察", icon:"👮"}, {text:"病人", icon:"🤒"}], 3, "病人是生病的人"),
    // Tools
    createOddOne([{text:"鐵鎚", icon:"🔨"}, {text:"螺絲起子", icon:"🪛"}, {text:"扳手", icon:"🔧"}, {text:"湯匙", icon:"🥄"}], 3, "湯匙是餐具"),
    // Electronics
    createOddOne([{text:"手機", icon:"📱"}, {text:"電腦", icon:"💻"}, {text:"平板", icon:"📟"}, {text:"報紙", icon:"📰"}], 3, "報紙不是電子產品"),
    // Kitchen
    createOddOne([{text:"鍋子", icon:"🍳"}, {text:"碗", icon:"🥣"}, {text:"盤子", icon:"🍽️"}, {text:"籃球", icon:"🏀"}], 3, "籃球是運動用品"),
];

const ODD_ONE_ADVANCED_POOL: OddOneLevel[] = [
    // Abstract/Function
    createOddOne([{text:"籃球", icon:"🏀"}, {text:"足球", icon:"⚽"}, {text:"排球", icon:"🏐"}, {text:"橄欖球", icon:"🏉"}], 3, "橄欖球不是圓的"),
    createOddOne([{text:"夏天", icon:"🏖️"}, {text:"冬天", icon:"⛄"}, {text:"雨天", icon:"🌧️"}, {text:"秋天", icon:"🍂"}], 2, "雨天是天氣狀況，其他是季節"),
    createOddOne([{text:"鉛筆", icon:"✏️"}, {text:"原子筆", icon:"🖊️"}, {text:"彩色筆", icon:"🖍️"}, {text:"尺", icon:"📏"}], 3, "尺是用來測量的，其他是寫字的"),
    createOddOne([{text:"醫生", icon:"👨‍⚕️"}, {text:"護理師", icon:"👩‍⚕️"}, {text:"病人", icon:"🤒"}, {text:"藥師", icon:"💊"}], 2, "病人是被照顧者，其他是醫療人員"),
    createOddOne([{text:"手機", icon:"📱"}, {text:"電腦", icon:"💻"}, {text:"電視", icon:"📺"}, {text:"信紙", icon:"📄"}], 3, "信紙不需要電"),
    createOddOne([{text:"吉他", icon:"🎸"}, {text:"小提琴", icon:"🎻"}, {text:"烏克麗麗", icon:"🪕"}, {text:"長笛", icon:"🪈"}], 3, "長笛是管樂器(用吹的)，其他是弦樂器"),
    createOddOne([{text:"草莓", icon:"🍓"}, {text:"蘋果", icon:"🍎"}, {text:"櫻桃", icon:"🍒"}, {text:"檸檬", icon:"🍋"}], 3, "檸檬是黃色的，其他是紅色的"),
    createOddOne([{text:"鯨魚", icon:"🐋"}, {text:"海豚", icon:"🐬"}, {text:"海豹", icon:"🦭"}, {text:"鯊魚", icon:"🦈"}], 3, "鯊魚是魚類，其他是哺乳類"),
    createOddOne([{text:"直升機", icon:"🚁"}, {text:"飛機", icon:"✈️"}, {text:"熱氣球", icon:"🎈"}, {text:"風箏", icon:"🪁"}], 3, "風箏不能載人"),
    createOddOne([{text:"太陽", icon:"☀️"}, {text:"燈泡", icon:"💡"}, {text:"蠟燭", icon:"🕯️"}, {text:"鏡子", icon:"🪞"}], 3, "鏡子不會發光"),
    createOddOne([{text:"冰塊", icon:"🧊"}, {text:"冰淇淋", icon:"🍦"}, {text:"雪", icon:"❄️"}, {text:"熱湯", icon:"🍲"}], 3, "熱湯是熱的"),
    createOddOne([{text:"跑步", icon:"🏃"}, {text:"游泳", icon:"🏊"}, {text:"騎車", icon:"🚴"}, {text:"睡覺", icon:"🛌"}], 3, "睡覺是休息，其他是運動"),
    createOddOne([{text:"米飯", icon:"🍚"}, {text:"麵條", icon:"🍜"}, {text:"麵包", icon:"🍞"}, {text:"雞腿", icon:"🍗"}], 3, "雞腿是肉類，其他是澱粉主食"),
    createOddOne([{text:"紅色", icon:"🟥"}, {text:"黃色", icon:"🟨"}, {text:"藍色", icon:"🟦"}, {text:"透明", icon:"🫗"}], 3, "透明不是顏色"),
    createOddOne([{text:"剪刀", icon:"✂️"}, {text:"菜刀", icon:"🔪"}, {text:"美工刀", icon:"🗡️"}, {text:"湯匙", icon:"🥄"}], 3, "湯匙沒有刀刃"),
    createOddOne([{text:"眼睛", icon:"👁️"}, {text:"眼鏡", icon:"👓"}, {text:"隱形眼鏡", icon:"🧿"}, {text:"墨鏡", icon:"🕶️"}], 0, "眼睛是器官，其他是用品"),
    createOddOne([{text:"車子", icon:"🚗"}, {text:"汽油", icon:"⛽"}, {text:"輪胎", icon:"🛞"}, {text:"方向盤", icon:"⭕"}], 0, "車子是整體，其他是零件/燃料"),
    createOddOne([{text:"蝴蝶", icon:"🦋"}, {text:"蜜蜂", icon:"🐝"}, {text:"蜻蜓", icon:"蜻"}, {text:"蜘蛛", icon:"🕷️"}], 3, "蜘蛛有8隻腳(蛛形綱)，其他是昆蟲(6隻腳)"),
    createOddOne([{text:"正方形", icon:"🟥"}, {text:"長方形", icon:"▭"}, {text:"三角形", icon:"🔺"}, {text:"圓形", icon:"🔵"}], 3, "圓形沒有角"),
    createOddOne([{text:"今天", icon:"📅"}, {text:"明天", icon:"🗓️"}, {text:"昨天", icon:"📆"}, {text:"晴天", icon:"☀️"}], 3, "晴天是天氣，其他是時間"),
    createOddOne([{text:"加法", icon:"➕"}, {text:"減法", icon:"➖"}, {text:"乘法", icon:"✖️"}, {text:"書法", icon:"🖌️"}], 3, "書法是藝術，其他是數學運算"),
    createOddOne([{text:"中文", icon:"🇹🇼"}, {text:"英文", icon:"🇺🇸"}, {text:"日文", icon:"🇯🇵"}, {text:"天文", icon:"🔭"}], 3, "天文是科學，其他是語言"),
    createOddOne([{text:"開心", icon:"😄"}, {text:"快樂", icon:"🥳"}, {text:"興奮", icon:"🤩"}, {text:"生氣", icon:"😡"}], 3, "生氣是負面情緒，其他是正面的"),
    createOddOne([{text:"種子", icon:"🌰"}, {text:"發芽", icon:"🌱"}, {text:"開花", icon:"🌸"}, {text:"澆水", icon:"🚿"}], 3, "澆水是動作，其他是植物生長過程"),
    createOddOne([{text:"電風扇", icon:"🌬️"}, {text:"冷氣", icon:"❄️"}, {text:"扇子", icon:"🪭"}, {text:"吹風機", icon:"💨"}], 3, "吹風機吹出的是熱風(通常)，其他是用來降溫"),
];

export const STATIC_ODD_ONE_LEVELS = ODD_ONE_NORMAL_POOL;
export const STATIC_ODD_ONE_LEVELS_ADVANCED = ODD_ONE_ADVANCED_POOL;

// --- SOUND GAME - Massive Expansion ---
const SOUND_TYPES = ['HIGH', 'LOW', 'RISE', 'FALL', 'ALARM', 'GAME', 'BOUNCE', 'MAGIC', 'TELEPHONE'] as const;

// Define ALL possible targets. The generator will create a level for EACH target to ensure uniqueness.
const EXPANDED_SOUND_TARGETS: Record<string, {icon: string, label: string}[]> = {
    'HIGH': [
        {icon: "🐦", label: "小鳥"}, {icon: "🐭", label: "老鼠"}, {icon: "🔔", label: "鈴鐺"},
        {icon: "👶", label: "嬰兒哭"}, {icon: "🎻", label: "小提琴"}, {icon: " whistle", label: "哨子"},
        {icon: "🐣", label: "小雞"}, {icon: "🐬", label: "海豚"}, {icon: "🔑", label: "鑰匙聲"}
    ],
    'LOW': [
        {icon: "🦁", label: "獅子"}, {icon: "🥁", label: "大鼓"}, {icon: "🚢", label: "大船"},
        {icon: "🐻", label: "熊吼"}, {icon: "🚜", label: "拖拉機"}, {icon: "🎻", label: "大提琴"},
        {icon: "🐂", label: "牛叫"}, {icon: "🦍", label: "大猩猩"}, {icon: "🚛", label: "卡車"}
    ],
    'RISE': [
        {icon: "🚀", label: "升空"}, {icon: "🎈", label: "氣球飛起"}, {icon: "📈", label: "上升"},
        {icon: "🛫", label: "飛機起飛"}, {icon: "🎢", label: "爬坡"}, {icon: "🌬️", label: "風吹起"},
        {icon: "🪜", label: "爬樓梯"}, {icon: "🪁", label: "風箏"}, {icon: "🌡️", label: "升溫"}
    ],
    'FALL': [
        {icon: "📉", label: "下降"}, {icon: "🛝", label: "溜滑梯"}, {icon: "🍂", label: "落葉"},
        {icon: "🛬", label: "飛機降落"}, {icon: "💧", label: "水滴"}, {icon: "💣", label: "炸彈落下"},
        {icon: "⛷️", label: "滑雪"}, {icon: "📉", label: "跌倒"}, {icon: "🧱", label: "積木倒塌"}
    ],
    'ALARM': [
        {icon: "⏰", label: "鬧鐘"}, {icon: "🚒", label: "消防車"}, {icon: "🚑", label: "救護車"},
        {icon: "🚓", label: "警車"}, {icon: "🚨", label: "警報器"}, {icon: "⏲️", label: "計時器"},
        {icon: "🕰️", label: "大鐘"}, {icon: "📟", label: "呼叫器"}, {icon: "📢", label: "廣播"}
    ],
    'GAME': [
        {icon: "🎮", label: "電動玩具"}, {icon: "👾", label: "外星人"}, {icon: "🤖", label: "機器人"},
        {icon: "🪙", label: "吃金幣"}, {icon: "🍄", label: "吃蘑菇"}, {icon: "🕹️", label: "搖桿"},
        {icon: "🔫", label: "雷射槍"}, {icon: "🆙", label: "升級"}, {icon: "💥", label: "爆炸"}
    ],
    'BOUNCE': [
        {icon: "🏀", label: "拍球"}, {icon: "🦘", label: "袋鼠"}, {icon: "🐇", label: "兔子"},
        {icon: "🎾", label: "網球"}, {icon: "🏓", label: "乒乓球"}, {icon: "🐸", label: "青蛙"},
        {icon: "🛌", label: "跳床"}, {icon: "🤸", label: "跳躍"}, {icon: "🍮", label: "布丁Q彈"}
    ],
    'MAGIC': [
        {icon: "🪄", label: "魔法棒"}, {icon: "✨", label: "亮晶晶"}, {icon: "🧚", label: "仙子"},
        {icon: "🦄", label: "獨角獸"}, {icon: "🔮", label: "水晶球"}, {icon: "🌟", label: "流星"},
        {icon: "🎩", label: "變魔術"}, {icon: "🎆", label: "煙火"}, {icon: "👼", label: "天使"}
    ],
    'TELEPHONE': [
        {icon: "☎️", label: "電話"}, {icon: "📱", label: "手機"}, {icon: "📠", label: "傳真機"},
        {icon: "📞", label: "通話中"}, {icon: "📲", label: "來電"}, {icon: "🛎️", label: "服務鈴"},
        {icon: "🚲", label: "腳踏車鈴"}, {icon: "🏪", label: "超商門鈴"}, {icon: "🚪", label: "門鈴"}
    ]
};

// Flatten to create a unique level for EACH target item
const generateAllSoundLevels = (): SoundLevel[] => {
    const levels: SoundLevel[] = [];
    
    SOUND_TYPES.forEach(type => {
        const targets = EXPANDED_SOUND_TARGETS[type];
        targets.forEach(targetItem => {
            // Generate distinct distractors
            const distractors: {icon: string, label: string, isCorrect: boolean}[] = [];
            while(distractors.length < 3) {
                // Pick a random OTHER type
                const otherType = SOUND_TYPES[Math.floor(Math.random() * SOUND_TYPES.length)];
                if (otherType !== type) {
                    const otherPool = EXPANDED_SOUND_TARGETS[otherType];
                    const dist = otherPool[Math.floor(Math.random() * otherPool.length)];
                    // Prevent duplicate distractors
                    if (!distractors.some(d => d.label === dist.label)) {
                        distractors.push({ ...dist, isCorrect: false });
                    }
                }
            }
            
            // Options array
            const options = [
                { ...targetItem, isCorrect: true },
                ...distractors
            ].sort(() => 0.5 - Math.random());

            levels.push({
                soundType: type,
                targetIcon: targetItem.icon,
                options: options
            });
        });
    });
    
    // Shuffle the entire level deck so we don't get all HIGHs then all LOWs
    return levels.sort(() => 0.5 - Math.random());
};

export const STATIC_SOUND_LEVELS = generateAllSoundLevels();

const generatePuzzleLevels = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): PuzzleLevel[] => {
     const levels: PuzzleLevel[] = [];
     const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"];
     const gridSize = difficulty === 'NORMAL' ? 2 : 3;
     for(let i=0; i<count; i++) {
         const targetImage: string[] = [];
         for(let j=0; j<gridSize*gridSize; j++) targetImage.push(emojis[Math.floor(Math.random()*emojis.length)]);
         levels.push({
             gridSize,
             targetImage,
             scrambled: targetImage.map((c, id) => ({id, content: c})) // Placeholder
         });
     }
     return levels;
};

export const STATIC_PUZZLE_LEVELS = generatePuzzleLevels(100, 'NORMAL');
export const STATIC_PUZZLE_LEVELS_ADVANCED = generatePuzzleLevels(100, 'ADVANCED');
