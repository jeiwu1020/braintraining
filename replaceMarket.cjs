const fs = require('fs');

let content = fs.readFileSync('./services/staticData.ts', 'utf8');

let newMarket = `const generateMarketData = (difficulty: 'NORMAL' | 'ADVANCED', count: number) => {
    const levels: any[] = [];
    const itemsList = [
        {name: "蘋果", icon: "🍎"}, {name: "香蕉", icon: "🍌"}, {name: "麵包", icon: "🍞"}, {name: "牛奶", icon: "🥛"},
        {name: "蛋糕", icon: "🍰"}, {name: "布丁", icon: "🍮"}, {name: "漢堡", icon: "🍔"}, {name: "薯條", icon: "🍟"},
        {name: "可樂", icon: "🥤"}, {name: "三明治", icon: "🥪"}, {name: "便當", icon: "🍱"}, {name: "飯糰", icon: "🍙"},
        {name: "披薩", icon: "🍕"}, {name: "熱狗", icon: "🌭"}, {name: "餅乾", icon: "🍪"}, {name: "甜甜圈", icon: "🍩"},
        {name: "冰淇淋", icon: "🍦"}, {name: "葡萄", icon: "🍇"}, {name: "西瓜", icon: "🍉"}, {name: "橘子", icon: "🍊"},
        {name: "草莓", icon: "🍓"}, {name: "茶", icon: "🍵"}, {name: "咖啡", icon: "☕"}, {name: "果汁", icon: "🍹"}
    ];
    let tries = 0;
    while(levels.length < count && tries < 10000) {
        tries++;
        const item1 = itemsList[Math.floor(Math.random() * itemsList.length)];
        let item2 = itemsList[Math.floor(Math.random() * itemsList.length)];
        while(item2.name === item1.name) item2 = itemsList[Math.floor(Math.random() * itemsList.length)];
        let price1, price2, question, answer, options;
        if (difficulty === 'NORMAL') {
            price1 = (Math.floor(Math.random() * 5) + 1) * 10;
            price2 = (Math.floor(Math.random() * 5) + 1) * 5;
            answer = price1 + price2;
            question = \`買一個\${item1.name}和一個\${item2.name}，共多少錢？\`;
            options = [answer, answer + 5, answer - 5].sort(() => 0.5 - Math.random());
        } else {
            price1 = (Math.floor(Math.random() * 10) + 2) * 10;
            price2 = (Math.floor(Math.random() * 10) + 2) * 5;
            answer = 200 - (price1 + price2);
            question = \`帶200元買\${item1.name}和\${item2.name}，會找多少錢？\`;
            options = [answer, answer + 10, answer - 10].sort(() => 0.5 - Math.random());
        }
        
        // Ensure strictly no exact same items pair in level history
        const isDuplicate = levels.some(l => 
            (l.items[0].name === item1.name && l.items[1].name === item2.name) ||
            (l.items[0].name === item2.name && l.items[1].name === item1.name)
        );
        if(!isDuplicate) {
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
    }
    return levels;
};`;
content = content.replace(/const generateMarketData = [\s\S]*?return levels;\n};/, newMarket);
fs.writeFileSync('./services/staticData.ts', content);
