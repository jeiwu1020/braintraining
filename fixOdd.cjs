const fs = require('fs');
let content = fs.readFileSync('services/staticData.ts', 'utf8');

// The exports are at the end:
// export const STATIC_ODD_ONE_LEVELS = ODD_ONE_NORMAL_POOL;
// export const STATIC_ODD_ONE_LEVELS_ADVANCED = ODD_ONE_ADVANCED_POOL;

// Let's replace those two lines with a new concatenated array definition so we are 100% sure.

let newExports = `
const additionalNormal = [
    createOddOne([{text: "", icon: "🚗"},{text: "", icon: "🚕"},{text: "", icon: "🏎️"},{text: "", icon: "🚲"}], 3, "只有單車沒有引擎"),
    createOddOne([{text: "", icon: "🐶"},{text: "", icon: "🐱"},{text: "", icon: "🐭"},{text: "", icon: "🐦"}], 3, "只有小鳥有羽毛/會飛"),
    createOddOne([{text: "", icon: "🍎"},{text: "", icon: "🍌"},{text: "", icon: "🍊"},{text: "", icon: "🥦"}], 3, "花椰菜是蔬菜"),
    createOddOne([{text: "", icon: "👕"},{text: "", icon: "👖"},{text: "", icon: "👗"},{text: "", icon: "🎒"}], 3, "背包不是穿在身上的衣服"),
    createOddOne([{text: "", icon: "🏀"},{text: "", icon: "⚽"},{text: "", icon: "🏐"},{text: "", icon: "🏸"}], 3, "只有羽毛球不是圓的"),
    createOddOne([{text: "", icon: "🥛"},{text: "", icon: "☕"},{text: "", icon: "🍵"},{text: "", icon: "🍔"}], 3, "漢堡是吃的"),
    createOddOne([{text: "", icon: "🎸"},{text: "", icon: "🎻"},{text: "", icon: "🎹"},{text: "", icon: "🥁"}], 3, "只有鼓不是用弦發聲的"),
    createOddOne([{text: "", icon: "✈️"},{text: "", icon: "🚁"},{text: "", icon: "🚀"},{text: "", icon: "🚲"}], 3, "只有單車不能飛"),
    createOddOne([{text: "", icon: "🌞"},{text: "", icon: "⭐"},{text: "", icon: "🌙"},{text: "", icon: "☁️"}], 3, "只有雲沒有發亮"),
    createOddOne([{text: "", icon: "🚪"},{text: "", icon: "🪟"},{text: "", icon: "🪑"},{text: "", icon: "📺"}], 3, "只有電視需要插電"),
    createOddOne([{text: "", icon: "🍓"},{text: "", icon: "🍒"},{text: "", icon: "🍉"},{text: "", icon: "🍋"}], 3, "只有檸檬很酸"),
    createOddOne([{text: "", icon: "🚌"},{text: "", icon: "🚑"},{text: "", icon: "🚓"},{text: "", icon: "🚕"}], 0, "只有公車是大眾運輸"),
    createOddOne([{text: "", icon: "🐟"},{text: "", icon: "🦀"},{text: "", icon: "🦐"},{text: "", icon: "🐶"}], 3, "只有狗生活在陸地上"),
    createOddOne([{text: "", icon: "👓"},{text: "", icon: "🕶️"},{text: "", icon: "🥽"},{text: "", icon: "🧣"}], 3, "圍巾不是戴在眼睛上"),
    createOddOne([{text: "", icon: "🌧️"},{text: "", icon: "🌩️"},{text: "", icon: "🌨️"},{text: "", icon: "☀️"}], 3, "只有太陽是好天氣"),
    createOddOne([{text: "", icon: "✂️"},{text: "", icon: "🔪"},{text: "", icon: "🗡️"},{text: "", icon: "🥄"}], 3, "只有湯匙沒辦法切東西"),
    createOddOne([{text: "", icon: "🖊️"},{text: "", icon: "✏️"},{text: "", icon: "🖍️"},{text: "", icon: "📖"}], 3, "書本不是用來寫字的筆"),
    createOddOne([{text: "", icon: "🦋"},{text: "", icon: "🐝"},{text: "", icon: "🐞"},{text: "", icon: "🐛"}], 3, "毛毛蟲還不會飛"),
    createOddOne([{text: "", icon: "🪑"},{text: "", icon: "🛋️"},{text: "", icon: "🛏️"},{text: "", icon: "🚪"}], 3, "門不是用來坐躺的"),
    createOddOne([{text: "", icon: "🎸"},{text: "", icon: "🎺"},{text: "", icon: "🎷"},{text: "", icon: "🥁"}], 0, "吉他不是用吹的或敲的(弦樂器)"),
    createOddOne([{text: "", icon: "🍎"},{text: "", icon: "🍅"},{text: "", icon: "🌶️"},{text: "", icon: "🥒"}], 3, "小黃瓜不是紅色的"),
    createOddOne([{text: "", icon: "🐯"},{text: "", icon: "🦁"},{text: "", icon: "🐆"},{text: "", icon: "🐰"}], 3, "只有兔子是草食溫馴的"),
    createOddOne([{text: "", icon: "🛫"},{text: "", icon: "🚢"},{text: "", icon: "🛥️"},{text: "", icon: "🛶"}], 0, "只有飛機在天上"),
    createOddOne([{text: "", icon: "👦"},{text: "", icon: "👧"},{text: "", icon: "👶"},{text: "", icon: "👴"}], 2, "只有嬰兒還不會走"),
    createOddOne([{text: "", icon: "📱"},{text: "", icon: "💻"},{text: "", icon: "🖥️"},{text: "", icon: "🗞️"}], 3, "報紙不是電子產品"),
    createOddOne([{text: "", icon: "🌺"},{text: "", icon: "🌻"},{text: "", icon: "🌹"},{text: "", icon: "🌲"}], 3, "松樹不開鮮豔的花")
];

const additionalAdv = [
    createOddOne([{text: "0", icon: ""},{text: "8", icon: ""},{text: "6", icon: ""},{text: "3", icon: ""}], 3, "只有3沒有封閉的圈圈"),
    createOddOne([{text: "T", icon: ""},{text: "H", icon: ""},{text: "E", icon: ""},{text: "O", icon: ""}], 3, "只有O是完全彎曲的線條"),
    createOddOne([{text: "A", icon: ""},{text: "E", icon: ""},{text: "I", icon: ""},{text: "Z", icon: ""}], 3, "只有Z不是母音字母"),
    createOddOne([{text: "12", icon: ""},{text: "18", icon: ""},{text: "24", icon: ""},{text: "25", icon: ""}], 3, "只有25不是偶數"),
    createOddOne([{text: "9", icon: ""},{text: "16", icon: ""},{text: "25", icon: ""},{text: "30", icon: ""}], 3, "只有30不是完全平方數"),
    createOddOne([{text: "🚗", icon: ""},{text: "🚲", icon: ""},{text: "🛴", icon: ""},{text: "🛹", icon: ""}], 0, "只有汽車有四輪且封閉"),
    createOddOne([{text: "🌲", icon: ""},{text: "🌵", icon: ""},{text: "🌴", icon: ""},{text: "🌸", icon: ""}], 3, "只有花是有花瓣的植物"),
    createOddOne([{text: "🔴", icon: ""},{text: "🛑", icon: ""},{text: "🔺", icon: ""},{text: "🟥", icon: ""}], 0, "只有它沒有任何角"),
    createOddOne([{text: "A", icon: ""},{text: "H", icon: ""},{text: "M", icon: ""},{text: "S", icon: ""}], 3, "只有S是不對稱或曲線"),
    createOddOne([{text: "11", icon: ""},{text: "13", icon: ""},{text: "17", icon: ""},{text: "21", icon: ""}], 3, "21不是質數"),
    createOddOne([{text: "🐧", icon: ""},{text: "🦅", icon: ""},{text: "🦉", icon: ""},{text: "🦇", icon: ""}], 0, "企鵝不會飛"),
    createOddOne([{text: "冰", icon: ""},{text: "雪", icon: ""},{text: "霜", icon: ""},{text: "水", icon: ""}], 3, "只有水是液態"),
    createOddOne([{text: "銅", icon: ""},{text: "鐵", icon: ""},{text: "鋁", icon: ""},{text: "木", icon: ""}], 3, "木頭不是金屬"),
    createOddOne([{text: "公里", icon: ""},{text: "公尺", icon: ""},{text: "公分", icon: ""},{text: "公斤", icon: ""}], 3, "公斤是重量單位"),
    createOddOne([{text: "太陽", icon: ""},{text: "月亮", icon: ""},{text: "星星", icon: ""},{text: "雲朵", icon: ""}], 3, "雲朵在大氣層內"),
    createOddOne([{text: "聽", icon: ""},{text: "看", icon: ""},{text: "聞", icon: ""},{text: "想", icon: ""}], 3, "想不是五官感覺"),
    createOddOne([{text: "紅", icon: ""},{text: "藍", icon: ""},{text: "黃", icon: ""},{text: "綠", icon: ""}], 3, "綠色不是三原色"),
    createOddOne([{text: "鋼琴", icon: ""},{text: "吉他", icon: ""},{text: "小提琴", icon: ""},{text: "鼓", icon: ""}], 3, "鼓沒有弦"),
    createOddOne([{text: "春", icon: ""},{text: "夏", icon: ""},{text: "秋", icon: ""},{text: "晨", icon: ""}], 3, "晨不是季節"),
    createOddOne([{text: "蘋果", icon: ""},{text: "水蜜桃", icon: ""},{text: "櫻桃", icon: ""},{text: "西瓜", icon: ""}], 3, "西瓜沒有明顯單一硬核"),
    createOddOne([{text: "黑", icon: ""},{text: "白", icon: ""},{text: "灰", icon: ""},{text: "彩", icon: ""}], 3, "彩代表多重顏色"),
    createOddOne([{text: "高", icon: ""},{text: "長", icon: ""},{text: "寬", icon: ""},{text: "大", icon: ""}], 3, "大是體積或整體的形容"),
    createOddOne([{text: "3", icon: ""},{text: "5", icon: ""},{text: "7", icon: ""},{text: "9", icon: ""}], 3, "9是合成數"),
    createOddOne([{text: "圓形", icon: ""},{text: "橢圓", icon: ""},{text: "心形", icon: ""},{text: "正方形", icon: ""}], 3, "只有正方形有角"),
    createOddOne([{text: "東", icon: ""},{text: "南", icon: ""},{text: "西", icon: ""},{text: "中", icon: ""}], 3, "中不屬於四方方向"),
    createOddOne([{text: "走", icon: ""},{text: "跑", icon: ""},{text: "跳", icon: ""},{text: "站", icon: ""}], 3, "站是靜止動作")
];

export const STATIC_ODD_ONE_LEVELS = [...ODD_ONE_NORMAL_POOL.slice(0,25), ...additionalNormal];
export const STATIC_ODD_ONE_LEVELS_ADVANCED = [...ODD_ONE_ADVANCED_POOL.slice(0,25), ...additionalAdv];
`;

content = content.replace(/export const STATIC_ODD_ONE_LEVELS = ODD_ONE_NORMAL_POOL;\nexport const STATIC_ODD_ONE_LEVELS_ADVANCED = ODD_ONE_ADVANCED_POOL;/, newExports);

fs.writeFileSync('services/staticData.ts', content);
