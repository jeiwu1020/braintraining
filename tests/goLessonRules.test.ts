import{expect,it}from'vitest';import{createEmptyBoard,playGoMove}from'../services/goEngine';import{goLessonGoalMet,solveGoLesson,type GoLesson}from'../utils/goLessonRules';
it('evaluates connected anchors, remaining liberties, captures and genuine independent single-point eyes',()=>{
 const b=createEmptyBoard(5);b[2][1]='BLACK';b[2][3]='BLACK';expect(goLessonGoalMet(b,{kind:'CONNECT',anchors:[{r:2,c:1},{r:2,c:3}]},0)).toBe(false);const joined=playGoMove(b,2,2,'BLACK').nextBoard;expect(goLessonGoalMet(joined,{kind:'CONNECT',anchors:[{r:2,c:1},{r:2,c:3}]},0)).toBe(true);expect(goLessonGoalMet(joined,{kind:'LIBERTIES',anchor:{r:2,c:1},min:8},0)).toBe(true);expect(goLessonGoalMet(b,{kind:'CAPTURE',min:1},0)).toBe(false);expect(goLessonGoalMet(b,{kind:'CAPTURE',min:1},1)).toBe(true);
 const eyes=createEmptyBoard(7);for(let c=1;c<=5;c++){eyes[1][c]='BLACK';eyes[3][c]='BLACK';}eyes[2][1]=eyes[2][3]=eyes[2][5]='BLACK';expect(goLessonGoalMet(eyes,{kind:'EYES',anchor:{r:1,c:1},min:2},0)).toBe(true);eyes[2][3]='EMPTY';expect(goLessonGoalMet(eyes,{kind:'EYES',anchor:{r:1,c:1},min:2},0)).toBe(false);
});
it('validates the displayed opponent branch and enumerates every legal final answer to the stated goal',()=>{
 const b=createEmptyBoard(5);b[2][2]='WHITE';for(const[r,c]of[[1,2],[2,1],[1,3],[3,3],[3,1]])b[r][c]='BLACK';const p:GoLesson={id:'capture',tier:'STANDARD',title:'',prompt:'',board:b,goal:{kind:'CAPTURE',min:2},branches:[{first:{r:3,c:2},replies:[{r:2,c:3}]}]};const solved=solveGoLesson(p);expect(solved).toHaveLength(1);expect(solved[0].finals).toEqual([{r:2,c:4}]);
});
