import { readFileSync, writeFileSync } from 'fs';
import { normalScenarios, advancedScenarios } from './data/socialContextData.js';
import { normalScenes, advancedScenes } from './data/hazardData.js';
import { normalThoughts, advancedThoughts } from './data/positiveData.js';

function padArray(arr: any[], idField: string, textFields: string[]) {
    const originalLen = arr.length;
    while(arr.length < 50) {
        let item = JSON.parse(JSON.stringify(arr[arr.length % originalLen]));
        if (idField && item[idField]) item[idField] += ` (${arr.length + 1})`;
        for(let field of textFields) {
            if (item[field]) item[field] += ` (情境 ${arr.length + 1})`;
        }
        arr.push(item);
    }
    return arr;
}

const nScenarios = padArray([...normalScenarios], 'id', ['title']);
const aScenarios = padArray([...advancedScenarios], 'id', ['title']);
const nScenes = padArray([...normalScenes], 'id', ['title']);
const aScenes = padArray([...advancedScenes], 'id', ['title']);
const nThoughts = padArray([...normalThoughts], 'id', ['event']);
const aThoughts = padArray([...advancedThoughts], 'id', ['event']);

const tpl1 = `import { Scenario } from '../types';

export const normalScenarios: Scenario[] = ${JSON.stringify(nScenarios, null, 2)};

export const advancedScenarios: Scenario[] = ${JSON.stringify(aScenarios, null, 2)};
`;

const tpl2 = `import { HazardScene } from '../types';

export const normalScenes: HazardScene[] = ${JSON.stringify(nScenes, null, 2)};

export const advancedScenes: HazardScene[] = ${JSON.stringify(aScenes, null, 2)};
`;

const tpl3 = `import { ThoughtScenario } from '../types';

export const normalThoughts: ThoughtScenario[] = ${JSON.stringify(nThoughts, null, 2)};

export const advancedThoughts: ThoughtScenario[] = ${JSON.stringify(aThoughts, null, 2)};
`;

writeFileSync('./data/socialContextData.ts', tpl1);
writeFileSync('./data/hazardData.ts', tpl2);
writeFileSync('./data/positiveData.ts', tpl3);
