const fs = require('fs');
let content = fs.readFileSync('services/staticData.ts', 'utf8');

content = content.replace(/,,\\n  create/g, ',\n  create');
content = content.replace(/\\n  create/g, '\n  create');
content = content.replace(/\\n\];\\n\\nexport/g, '\n];\n\nexport');

fs.writeFileSync('services/staticData.ts', content);
