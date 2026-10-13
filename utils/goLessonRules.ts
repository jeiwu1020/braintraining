import{getAdjacentPoints,getGroupAndLiberties,playGoMove,type GoBoard,type Point}from'../services/goEngine';
export type GoLessonGoal={kind:'CAPTURE';min:number}|{kind:'CONNECT';anchors:Point[]}|{kind:'LIBERTIES'|'EYES';anchor:Point;min:number};
export interface GoLesson{id:string;tier:'BEGINNER'|'STANDARD'|'CHALLENGE';title:string;prompt:string;board:GoBoard;goal:GoLessonGoal;branches:{first:Point;replies:Point[]}[]}
export const goPointKey=(point:Point)=>`${point.r},${point.c}`;
export const goPointName=(point:Point,size:number)=>`${'ABCDEFGHJKLMNOPQRST'[point.c]}${size-point.r}`;
export const goLessonGoalMet=(board:GoBoard,goal:GoLessonGoal,captures:number):boolean=>{
 if(goal.kind==='CAPTURE')return captures>=goal.min;
 if(goal.kind==='CONNECT'){
  if(goal.anchors.some(p=>board[p.r]?.[p.c]!=='BLACK'))return false;
  const group=getGroupAndLiberties(board,goal.anchors[0].r,goal.anchors[0].c).stones.map(goPointKey);
  return goal.anchors.every(p=>group.includes(goPointKey(p)));
 }
 if(board[goal.anchor.r]?.[goal.anchor.c]!=='BLACK')return false;
 const group=getGroupAndLiberties(board,goal.anchor.r,goal.anchor.c);
 if(goal.kind==='LIBERTIES')return group.liberties.length>=goal.min;
 const keys=new Set(group.stones.map(goPointKey));
 const eyes=group.liberties.filter(p=>getAdjacentPoints(p.r,p.c,board.length).every(n=>keys.has(goPointKey(n))));
 return eyes.length>=goal.min;
};
export const solveGoLesson=(p:GoLesson):{first:Point;reply:Point|null;finals:Point[]}[]=>{
 const results:{first:Point;reply:Point|null;finals:Point[]}[]=[];
 for(const branch of p.branches){
  const first=playGoMove(p.board,branch.first.r,branch.first.c,'BLACK');if(!first.isLegal)continue;
  if(!branch.replies.length){if(goLessonGoalMet(first.nextBoard,p.goal,first.capturedCount))results.push({first:branch.first,reply:null,finals:[]});continue;}
  for(const reply of branch.replies){const response=playGoMove(first.nextBoard,reply.r,reply.c,'WHITE',first.koPoint);if(!response.isLegal)continue;
   const finals:Point[]=[];for(let r=0;r<p.board.length;r++)for(let c=0;c<p.board.length;c++){
    const last=playGoMove(response.nextBoard,r,c,'BLACK',response.koPoint);
    if(last.isLegal&&goLessonGoalMet(last.nextBoard,p.goal,first.capturedCount+last.capturedCount))finals.push({r,c});
   }
   if(finals.length)results.push({first:branch.first,reply,finals});
  }
 }
 return results;
};
