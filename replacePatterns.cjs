const fs = require('fs');

let content = fs.readFileSync('./services/staticData.ts', 'utf8');

const regex = /const generatePatterns = [\s\S]*?return levels;\n};/;

const newGeneratePatterns = `const generatePatterns = (count: number, difficulty: 'NORMAL' | 'ADVANCED'): PatternLevel[] => {
    const levels: PatternLevel[] = [];
    const maxTries = count * 10;
    let tries = 0;
    
    while(levels.length < count && tries < maxTries) {
        tries++;
        let sequence: string[];
        let options: string[];
        let answer: string;
        
        if (difficulty === 'NORMAL') {
            const symbols = ["🍎", "🍌", "🍇", "🍊", "🐶", "🐱", "🐰", "🦊", "🔴", "🔵", "🟢", "🟡", "🚗", "🚀", "✈️", "⚽", "🏀", "🎾", "🌭", "🍔"];
            const [s1, s2, s3, s4] = symbols.sort(() => 0.5 - Math.random()).slice(0, 4);
            const type = Math.random();
            if (type < 0.25) {
                sequence = [s1, s2, s1, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            } else if (type < 0.5) {
                sequence = [s1, s1, s2, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            } else if (type < 0.75) {
                sequence = [s1, s2, s3, s1, "?"];
                answer = s2;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            } else {
                sequence = [s1, s2, s1, s2, s3, "?"];
                answer = s3;
                options = [s1, s2, s3].sort(() => 0.5 - Math.random());
            }
        } else {
             if (Math.random() > 0.5) {
                const start = Math.floor(Math.random() * 20);
                const step = (Math.floor(Math.random() * 5) + 1);
                sequence = [start.toString(), (start+step).toString(), (start+step*2).toString(), "?"];
                answer = (start+step*3).toString();
                options = [answer, (start+step*3+1).toString(), (start+step*3-1).toString(), (start+step*3+2).toString()].sort(() => 0.5 - Math.random()).slice(0,3);
             } else {
                const dirs = ["⬆️", "➡️", "⬇️", "⬅️"];
                const startIdx = Math.floor(Math.random() * 4);
                const shift = Math.random() > 0.5 ? 1 : 3; // +1 or -1
                sequence = [dirs[startIdx], dirs[(startIdx+shift)%4], dirs[(startIdx+shift*2)%4], "?"];
                answer = dirs[(startIdx+shift*3)%4];
                options = [answer, dirs[(startIdx+shift)%4], dirs[startIdx], dirs[(startIdx+shift*2)%4]].sort(() => 0.5 - Math.random()).slice(0, 3);
                if (!options.includes(answer)) {
                    options[0] = answer;
                    options = options.sort(() => 0.5 - Math.random());
                }
             }
        }
        
        const isDup = levels.some(l => l.sequence.join(',') === sequence.join(',') || l.sequence.join(',') === sequence.join(','));
        if (!isDup && options.includes(answer)) {
            levels.push({ sequence, options, answer });
        }
    }
    return levels;
};`;

fs.writeFileSync('./services/staticData.ts', content.replace(regex, newGeneratePatterns));
