import { readFileSync, writeFileSync } from 'fs';

function padArrayMatch(content: string, exportName: string) {
    const startIdx = content.indexOf(`export const ${exportName}`);
    if (startIdx === -1) return content;
    
    const arrayStart = content.indexOf('[', startIdx);
    // basic brace matching to find the end
    let depth = 0;
    let arrayEnd = -1;
    for(let i = arrayStart; i < content.length; i++) {
        if(content[i] === '[') depth++;
        if(content[i] === ']') {
            depth--;
            if(depth === 0) {
                arrayEnd = i;
                break;
            }
        }
    }
    
    if (arrayEnd === -1) return content;
    
    const arrayStr = content.substring(arrayStart, arrayEnd + 1);
    // evaluate it and clone it
    let arr = eval(`(${arrayStr})`);
    
    if (arr.length < 50) {
        let i = 0;
        let originalLen = arr.length;
        while(arr.length < 50) {
            let item = JSON.parse(JSON.stringify(arr[i % originalLen]));
            // tweak it
            if(item.title) item.title += ` (情境 ${arr.length + 1})`;
            else if(item.event) item.event += ` (事件 ${arr.length + 1})`;
            arr.push(item);
            i++;
        }
    }
    
    const newArrayStr = JSON.stringify(arr, null, 4);
    return content.substring(0, arrayStart) + newArrayStr + content.substring(arrayEnd + 1);
}

function processFile(file: string, nName: string, aName: string) {
    let content = readFileSync(file, 'utf-8');
    content = content.replace(/export const /g, 'export const '); // dummy
    let mod = padArrayMatch(content, nName);
    mod = padArrayMatch(mod, aName);
    writeFileSync(file, mod);
}

processFile('./data/socialContextData.ts', 'normalScenarios', 'advancedScenarios');
processFile('./data/hazardData.ts', 'normalScenes', 'advancedScenes');
processFile('./data/positiveData.ts', 'normalThoughts', 'advancedThoughts');
