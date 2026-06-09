const fs = require('fs');

let content = fs.readFileSync('./services/staticData.ts', 'utf8');

let newTimeLevels = `const generateTimeLevels = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): TimeLevel[] => {
    const levels: TimeLevel[] = [];
    const used = new Set<string>();
    let attempts = 0;
    while(levels.length < count && attempts < 10000) {
        attempts++;
        if (difficulty === 'NORMAL') {
             const h = Math.floor(Math.random() * 12) + 1;
             const m = Math.floor(Math.random() * 6) * 10;
             const timeStr = \`\${h}:\${m === 0 ? '00' : m}\`;
             if (used.has(timeStr)) continue;
             used.add(timeStr);

             const d1 = \`\${(h%12)+1}:\${m === 0 ? '00' : m}\`;
             const d2 = \`\${h}:\${m === 30 ? '00' : '30'}\`;
             const options = [timeStr, d1, d2].sort(() => 0.5 - Math.random());
             levels.push({
                 type: 'CLOCK',
                 question: "請問時鐘是幾點幾分？",
                 clockTime: {hour: h, minute: m},
                 options,
                 correctAnswer: timeStr
             });
        } else {
             if (Math.random() > 0.5) {
                 const h = Math.floor(Math.random() * 12) + 1;
                 const m = Math.floor(Math.random() * 60);
                 const timeStr = \`\${h}:\${m.toString().padStart(2, '0')}\`;
                 if (used.has(timeStr)) continue;
                 used.add(timeStr);

                 const mOffset = (m + (Math.floor(Math.random() * 20)+10)) % 60;
                 const d1 = \`\${(h%12)+1}:\${m.toString().padStart(2, '0')}\`;
                 const d2 = \`\${h}:\${mOffset.toString().padStart(2, '0')}\`;
                 const options = [timeStr, d1, d2].sort(() => 0.5 - Math.random());
                 levels.push({
                     type: 'CLOCK',
                     question: "現在幾點幾分？",
                     clockTime: {hour: h, minute: m},
                     options,
                     correctAnswer: timeStr
                 });
             } else {
                 const h = Math.floor(Math.random() * 10) + 1;
                 const add = Math.floor(Math.random() * 5) + 1;
                 const q = \`現在是 \${h}點，\${add}小時後是幾點？\`;
                 if (used.has(q)) continue;
                 used.add(q);

                 const ans = \`\${h+add}點\`;
                 const d1 = \`\${h+add+1}點\`;
                 const d2 = \`\${h+add-1}點\`;
                 const options = [ans, d1, d2].sort(() => 0.5 - Math.random());
                 levels.push({type: 'MATH', question: q, options, correctAnswer: ans});
             }
        }
    }
    return levels;
};
export const STATIC_TIME_LEVELS = generateTimeLevels(50, 'NORMAL');
export const STATIC_TIME_LEVELS_ADVANCED = generateTimeLevels(50, 'ADVANCED');
`;
content = content.replace(/const generateTimeLevels = [\s\S]*?export const STATIC_TIME_LEVELS_ADVANCED = generateTimeLevels\(100, 'ADVANCED'\);/, newTimeLevels);
content = content.replace(/const generateTimeLevels = [\s\S]*?export const STATIC_TIME_LEVELS_ADVANCED = generateTimeLevels\(50, 'ADVANCED'\);/, newTimeLevels); // In case it was already replaced

let newShadowAdv = `export const STATIC_SHADOW_LEVELS_ADVANCED = (() => {
    const levels: ShadowLevel[] = [];
    const source = STATIC_SHADOW_CONFUSING_SETS; // array of arrays
    for(let i=0; i<50; i++) {
        const setIdx = i % source.length;
        const group = source[setIdx];
        const target = group[0];
        const options = [...group];
        options.sort(() => 0.5 - Math.random());
        const selectedOptions = options.slice(0, 4);
        if (!selectedOptions.includes(target)) {
            selectedOptions[Math.floor(Math.random() * 4)] = target;
        }
        levels.push({ target, options: selectedOptions, correctIndex: selectedOptions.indexOf(target) });
    }
    return levels;
})();`;
content = content.replace(/export const STATIC_SHADOW_LEVELS_ADVANCED = \[\];/, newShadowAdv);


const moreOddNormal = [
    { items: ["🚗","🚕","🏎️","🚲"], correctIndex: 3, reason: "只有單車沒有引擎" },
    { items: ["🐶","🐱","🐭","🐦"], correctIndex: 3, reason: "只有小鳥有羽毛/會飛" },
    { items: ["🍎","🍌","🍊","🥦"], correctIndex: 3, reason: "花椰菜是蔬菜" },
    { items: ["👕","👖","👗","🎒"], correctIndex: 3, reason: "背包不是穿在身上的衣服" },
    { items: ["🏀","⚽","🏐","🏸"], correctIndex: 3, reason: "只有羽毛球不是圓的" },
    { items: ["🥛","☕","🍵","🍔"], correctIndex: 3, reason: "漢堡是吃的" },
    { items: ["🎸","🎻","🎹","🥁"], correctIndex: 3, reason: "只有鼓不是用弦發聲的" },
    { items: ["✈️","🚁","🚀","🚲"], correctIndex: 3, reason: "只有單車不能飛" },
    { items: ["🌞","⭐","🌙","☁️"], correctIndex: 3, reason: "只有雲沒有發亮" },
    { items: ["🚪","🪟","🪑","📺"], correctIndex: 3, reason: "只有電視需要插電" },
    { items: ["🍓","🍒","🍉","🍋"], correctIndex: 3, reason: "只有檸檬很酸" },
    { items: ["🚌","🚑","🚓","🚕"], correctIndex: 0, reason: "只有公車是大眾運輸" },
    { items: ["🐟","🦀","🦐","🐶"], correctIndex: 3, reason: "只有狗生活在陸地上" },
    { items: ["👓","🕶️","🥽","🧣"], correctIndex: 3, reason: "圍巾不是戴在眼睛上" },
    { items: ["🌧️","🌩️","🌨️","☀️"], correctIndex: 3, reason: "只有太陽是好天氣" },
    { items: ["✂️","🔪","🗡️","🥄"], correctIndex: 3, reason: "只有湯匙沒辦法切東西" },
    { items: ["🖊️","✏️","🖍️","📖"], correctIndex: 3, reason: "書本不是用來寫字的筆" },
    { items: ["🦋","🐝","🐞","🐛"], correctIndex: 3, reason: "毛毛蟲還不會飛" },
    { items: ["🪑","🛋️","🛏️","🚪"], correctIndex: 3, reason: "門不是用來坐躺的" },
    { items: ["🎸","🎺","🎷","🥁"], correctIndex: 0, reason: "吉他不是用吹的或敲的(弦樂器)" },
    { items: ["🍎","🍅","🌶️","🥒"], correctIndex: 3, reason: "小黃瓜不是紅色的" },
    { items: ["🐯","🦁","🐆","🐰"], correctIndex: 3, reason: "只有兔子是草食溫馴的" },
    { items: ["🛫","🚢","🛥️","🛶"], correctIndex: 0, reason: "只有飛機在天上" },
    { items: ["👦","👧","👶","👴"], correctIndex: 2, reason: "只有嬰兒還不會走" },
    { items: ["📱","💻","🖥️","🗞️"], correctIndex: 3, reason: "報紙不是電子產品" },
    { items: ["🌺","🌻","🌹","🌲"], correctIndex: 3, reason: "松樹不開鮮豔的花" } // 26 items
];
const moreOddAdv = [
    { items: ["0", "8", "6", "3"], correctIndex: 3, reason: "只有3沒有封閉的圈圈" },
    { items: ["T", "H", "E", "O"], correctIndex: 3, reason: "只有O是完全彎曲的線條" },
    { items: ["A", "E", "I", "Z"], correctIndex: 3, reason: "只有Z不是母音字母" },
    { items: ["12", "18", "24", "25"], correctIndex: 3, reason: "只有25不是偶數" },
    { items: ["9", "16", "25", "30"], correctIndex: 3, reason: "只有30不是完全平方數" },
    { items: ["🚗", "🚲", "🛴", "🛹"], correctIndex: 0, reason: "只有汽車有四輪且封閉" },
    { items: ["🌲", "🌵", "🌴", "🌸"], correctIndex: 3, reason: "只有花是有花瓣的植物" },
    { items: ["🔴", "🛑", "🔺", "🟥"], correctIndex: 0, reason: "只有它沒有任何角" },
    { items: ["A", "H", "M", "S"], correctIndex: 3, reason: "只有S是不對稱或曲線" },
    { items: ["11", "13", "17", "21"], correctIndex: 3, reason: "21不是質數" },
    { items: ["🐧", "🦅", "🦉", "🦇"], correctIndex: 0, reason: "企鵝不會飛" },
    { items: ["冰", "雪", "霜", "水"], correctIndex: 3, reason: "只有水是液態" },
    { items: ["銅", "鐵", "鋁", "木"], correctIndex: 3, reason: "木頭不是金屬" },
    { items: ["公里", "公尺", "公分", "公斤"], correctIndex: 3, reason: "公斤是重量單位" },
    { items: ["太陽", "月亮", "星星", "雲朵"], correctIndex: 3, reason: "雲朵在大氣層內" },
    { items: ["聽", "看", "聞", "想"], correctIndex: 3, reason: "想不是五官感覺" },
    { items: ["紅", "藍", "黃", "綠"], correctIndex: 3, reason: "綠色不是三原色" },
    { items: ["鋼琴", "吉他", "小提琴", "鼓"], correctIndex: 3, reason: "鼓沒有弦" },
    { items: ["春", "夏", "秋", "晨"], correctIndex: 3, reason: "晨不是季節" },
    { items: ["蘋果", "水蜜桃", "櫻桃", "西瓜"], correctIndex: 3, reason: "西瓜沒有明顯單一硬核" },
    { items: ["黑", "白", "灰", "彩"], correctIndex: 3, reason: "彩代表多重顏色" },
    { items: ["高", "長", "寬", "大"], correctIndex: 3, reason: "大是體積或整體的形容" },
    { items: ["3", "5", "7", "9"], correctIndex: 3, reason: "9是合成數" },
    { items: ["圓形", "橢圓", "心形", "正方形"], correctIndex: 3, reason: "只有正方形有角" },
    { items: ["東", "南", "西", "中"], correctIndex: 3, reason: "中不屬於四方方向" },
    { items: ["走", "跑", "跳", "站"], correctIndex: 3, reason: "站是靜止動作" } // 26 items
];

let itemsN = "";
for (let b of moreOddNormal) {
    let arr = [];
    for (let s of b.items) arr.push('{text: "", icon: "' + s + '"}');
    itemsN += "  createOddOne([" + arr.join(",") + "], " + b.correctIndex + ", \"" + b.reason + "\"),\\n";
}
let itemsA = "";
for (let b of moreOddAdv) {
    let arr = [];
    for (let s of b.items) arr.push('{text: "' + s + '", icon: ""}');
    itemsA += "  createOddOne([" + arr.join(",") + "], " + b.correctIndex + ", \"" + b.reason + "\"),\\n";
}

content = content.replace(
    /\n];\n\nexport const STATIC_ODD_ONE_LEVELS = ODD_ONE_NORMAL_POOL;/, 
    ',\\n' + itemsN + '];\\n\\nexport const STATIC_ODD_ONE_LEVELS = ODD_ONE_NORMAL_POOL;'
);

content = content.replace(
    /\n];\n\nexport const STATIC_ODD_ONE_LEVELS_ADVANCED = ODD_ONE_ADVANCED_POOL;/, 
    ',\\n' + itemsA + '];\\n\\nexport const STATIC_ODD_ONE_LEVELS_ADVANCED = ODD_ONE_ADVANCED_POOL;'
);

fs.writeFileSync('./services/staticData.ts', content);
console.log('Fixed time, shadow advanced, and odd one out!');
