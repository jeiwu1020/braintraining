const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const cards = `
            <MenuCard
            title="公開 21 點"
            description="計算點數與風險評估，可選擇對抗莊家或分組對抗。"
            icon={<Shield className={\`w-8 h-8 \${isAdvanced ? 'text-indigo-500' : 'text-slate-600'}\`} />}
            color={isAdvanced ? "bg-white" : "bg-slate-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-slate-200"}
            onClick={() => handleSelectGame(GameState.BLACKJACK)}
            />

            <MenuCard
            title="邏輯猜牌"
            description="透過發問與排除法，找出目標卡牌。"
            icon={<Layers className={\`w-8 h-8 \${isAdvanced ? 'text-indigo-500' : 'text-blue-600'}\`} />}
            color={isAdvanced ? "bg-white" : "bg-blue-50"}
            borderColor={isAdvanced ? "border-indigo-200" : "border-blue-200"}
            onClick={() => handleSelectGame(GameState.GUESS_CARD)}
            />
`;

code = code.replace("onClick={() => handleSelectGame(GameState.HIGHER_LOWER)}\n            />", "onClick={() => handleSelectGame(GameState.HIGHER_LOWER)}\n            />\n" + cards);
fs.writeFileSync('App.tsx', code);
