import type { NonogramPuzzle } from '../utils/nonogramRules';
/** Hand-drawn silhouettes. Every picture has one solution and a verified line-only deduction trace. */
export const NONOGRAM_PUZZLES: NonogramPuzzle[] = [
  { id:'picture-heart',tier:'BEGINNER',title:'圖像 1',pictureName:'愛心',pictureColor:'#e11d48',focus:'先找整列排滿的線索，再完成兩側輪廓。',pattern:['11011','11111','11111','01110','00100'] },
  { id:'picture-house',tier:'BEGINNER',title:'圖像 2',pictureName:'小房屋',pictureColor:'#d97706',focus:'從全滿的一列開始，分辨長段中留下的空格。',pattern:['00100','01110','11111','11011','11011'] },
  { id:'picture-tree',tier:'BEGINNER',title:'圖像 3',pictureName:'小樹',pictureColor:'#15803d',focus:'找出排滿的列與欄，再檢查相交的短段。',pattern:['00100','01110','11111','00100','01110'] },
  { id:'picture-cup',tier:'STANDARD',title:'圖像 1',pictureName:'杯子',pictureColor:'#0369a1',focus:'利用空白列、長段重疊與相交線索，找出輪廓和空心。',pattern:['00000','11110','10011','10011','11110'] },
  { id:'picture-umbrella',tier:'STANDARD',title:'圖像 2',pictureName:'雨傘',pictureColor:'#7e22ce',focus:'長段先確定中間，再讓列欄互相補上轉折。',pattern:['01110','11111','00100','10100','01100'] },
  { id:'picture-cat',tier:'STANDARD',title:'圖像 3',pictureName:'貓咪的臉',pictureColor:'#b45309',focus:'保留分段之間的空格，檢查左右兩側的線索。',pattern:['10001','11011','11111','10101','01110'] },
  { id:'picture-note',tier:'CHALLENGE',title:'圖像 1',pictureName:'音符',pictureColor:'#4338ca',focus:'沒有整條排滿的線，從重疊格開始反覆交叉推理。',pattern:['00111','00101','00101','11100','11000'] },
  { id:'picture-bird',tier:'CHALLENGE',title:'圖像 2',pictureName:'站立的小鳥',pictureColor:'#a16207',focus:'多次把列的結論帶到欄，再回頭確定細小分段。',pattern:['000110','001111','111110','011100','001010','011011'] },
  { id:'picture-duck',tier:'CHALLENGE',title:'圖像 3',pictureName:'小鴨',pictureColor:'#0f766e',focus:'長段的位置要靠幾輪相交線索才能逐步確定。',pattern:['000110','000111','110110','111110','011100','001100'] },
];
