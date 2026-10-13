import type {RummiPuzzle,RummiTile} from '../utils/rummikubRules';
const tile=(id:string):RummiTile=>({id,color:({r:'red',b:'blue',y:'yellow',k:'black'} as const)[id[0] as 'r'|'b'|'y'|'k'],number:Number(id.slice(1))});
const groups=(text:string)=>text.split('/').map(group=>group.trim().split(' '));
const task=(id:string,tier:RummiPuzzle['tier'],title:string,focus:string,table:string,hand:string,plans:string[]):RummiPuzzle=>({id,tier,title,focus,table:groups(table).map(group=>group.map(tile)),hand:hand.split(' ').map(tile),plans:plans.map((text,i)=>({id:`plan-${i+1}`,label:`方案 ${i+1}`,groups:groups(text)}))});
const warmup=(id:string,title:string,table:string,hand:string):RummiPuzzle=>task(id,'BEGINNER',title,'選一張手牌接上桌組。先說同色連號或同數異色，再看完整預覽。',table,hand,hand.split(' ').map(id=>[...table.split(' '),id].sort((a,b)=>tile(a).number-tile(b).number).join(' ')));
export const RUMMI_PUZZLES:RummiPuzzle[]=[
 warmup('rummi-ends','順組兩端都能接','r4 r5 r6','r3 r7 b7 r8'),
 warmup('rummi-fourth','同數不重色','r8 b8 k8','y8 y7 r9 b9'),
 warmup('rummi-thirteen','十三不能接回一','b10 b11 b12','b9 b13 b1 r13'),
 warmup('rummi-one','起點是一，不是零','y1 y2 y3','y4 y5 k4 r1'),
 task('rummi-borrow-end','STANDARD','拆一張，剩下仍要成組','比較全部桌組，不只看新湊出的組。','r3 r4 r5 r6','b6 k6 y8',[
  'r3 r4 r5/r6 b6 k6','r3 r4/r5 r6 b6 k6','r3 r4 r5 r6 b6 k6']),
 task('rummi-borrow-set','STANDARD','四色群組借出一張','群組借出後，留下的三張也必須合法。','r8 b8 k8 y8','r6 r7 b3',[
  'b8 k8 y8/r6 r7 r8','r8 b8/k8 y8 r6 r7','r6 r7 r8/b8 k8']),
 task('rummi-repair-residual','STANDARD','先補短邊，再拆中段','先核對被拆開的兩側是否都有至少三張。','b4 b5 b6 b7 b8 b9','b3 r6 k6',[
  'b3 b4 b5/b6 r6 k6/b7 b8 b9','b4 b5/b6 r6 k6/b7 b8 b9','b3 b4 b5 b6/b7 b8 b9 r6 k6']),
 task('rummi-extend-borrow','STANDARD','接一端，借另一端','三張手牌都可以用，但每張原桌牌只能出現一次。','r9 r10 r11 r12 r13','r8 b13 k13',[
  'r8 r9 r10 r11 r12/r13 b13 k13','r8 r9 r10 r11/r12 r13 b13 k13','r8 r9 r10 r11 r12 r13/r13 b13 k13']),
 task('rummi-two-routes','CHALLENGE','兩條路徑同樣好','最多放幾張手牌？比較接長順組與借牌成群組，所有同樣好的完整方案都接受。','r3 r4 r5 r6','r7 r8 b6 k6 y9 b11',[
  'r3 r4 r5/r6 r7 r8','r3 r4 r5/r6 b6 k6','r3 r4 r5/r6 b6 k6/r7 r8']),
 task('rummi-competing-borrow','CHALLENGE','不能把同一群組借空','紅色和藍色都能借八，請檢查兩個一起借會留下什麼。','r8 b8 k8 y8','r6 r7 b6 b7 k10 y12',[
  'r6 r7 r8/b8 k8 y8','b6 b7 b8/r8 k8 y8','r6 r7 r8/b6 b7 b8/k8 y8']),
 task('rummi-long-split','CHALLENGE','多借一張真的更好嗎','先選要出的手牌，再比較拆分後每一小組。','b4 b5 b6 b7 b8 b9','b3 r6 k6 r7 k7 y11',[
  'b3 b4 b5/b6 r6 k6/b7 b8 b9','b3 b4 b5/b6 r6 k6/b7 r7 k7/b8 b9','b3 b4 b5 b6 b7 b8 b9']),
 task('rummi-transpose','CHALLENGE','兩條順組變成三個群組','公開全部六張手牌；不只延長順組，試著按數字重新分組。','r4 r5 r6/b4 b5 b6','k4 y4 k5 y5 k6 y9',[
  'r4 b4 k4 y4/r5 b5 k5 y5/r6 b6 k6','r4 r5 r6/b4 b5 b6/k4 k5 k6','r4 b4 k4 y4/r5 b5 k5 y5/r6 b6 k6 y9']),
];
