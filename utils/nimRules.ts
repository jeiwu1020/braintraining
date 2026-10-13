export type NimRule='NORMAL'|'MISERE';
export type NimOpponent='SIMPLE'|'STRATEGIC';
export type NimTier='BEGINNER'|'STANDARD'|'CHALLENGE';
export interface NimCommand{pileIndex:number;amount:number}
export interface NimPuzzle{id:string;tier:NimTier;title:string;focus:string;piles:number[];rule:NimRule}
export const legalNimMoves=(piles:readonly number[]):NimCommand[]=>piles.flatMap((count,pileIndex)=>Number.isInteger(count)&&count>0?Array.from({length:count},(_,i)=>({pileIndex,amount:i+1})):[]);
const memo=new Map<string,boolean>();
/** Exhaustive normal-play/misere minimax on a finite decreasing number of stones. */
export const nimWinning=(piles:readonly number[],rule:NimRule):boolean=>{
 const key=`${rule}:${[...piles].sort((a,b)=>a-b).join(',')}`;const cached=memo.get(key);if(cached!==undefined)return cached;
 if(piles.every(count=>count===0))return rule==='MISERE';
 const winning=legalNimMoves(piles).some(move=>{const next=[...piles];next[move.pileIndex]-=move.amount;return !nimWinning(next,rule);});memo.set(key,winning);return winning;
};
export const chooseNimOpponent=(piles:readonly number[],rule:NimRule,policy:NimOpponent):NimCommand|null=>{
 const moves=legalNimMoves(piles);if(!moves.length)return null;
 if(policy==='SIMPLE')return {pileIndex:piles.indexOf(Math.max(...piles)),amount:1};
 return moves.find(move=>{const next=[...piles];next[move.pileIndex]-=move.amount;return !nimWinning(next,rule);})??moves[0];
};
