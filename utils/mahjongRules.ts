export interface MeldTile{suit:'wan'|'tong'|'tiao'|'zi';value:number}
export type MahjongGroup='RUN'|'TRIPLET'|'PAIR';
export type MahjongTier='BEGINNER'|'STANDARD'|'CHALLENGE';
export interface MahjongPuzzle{id:string;tier:MahjongTier;title:string;focus:string;group:MahjongGroup;hand:MeldTile[];options:MeldTile[]}
export const meldTileKey=(tile:MeldTile)=>`${tile.suit}:${tile.value}`;
export const meldTileName=(tile:MeldTile)=>tile.suit==='zi'?['東','南','西','北','中','發','白'][tile.value-1]:`${['一','二','三','四','五','六','七','八','九'][tile.value-1]}${{wan:'萬',tong:'筒',tiao:'條'}[tile.suit]}`;
const valid=(tile:MeldTile)=>['wan','tong','tiao','zi'].includes(tile.suit)&&Number.isInteger(tile.value)&&tile.value>=1&&tile.value<=(tile.suit==='zi'?7:9);
export const isMahjongGroup=(tiles:readonly MeldTile[],group:MahjongGroup):boolean=>{
 if(tiles.length!==(group==='PAIR'?2:3)||!tiles.every(valid))return false;
 if(group!=='RUN')return tiles.every(tile=>meldTileKey(tile)===meldTileKey(tiles[0]));
 if(tiles[0].suit==='zi'||!tiles.every(tile=>tile.suit===tiles[0].suit))return false;
 const values=tiles.map(tile=>tile.value).sort((a,b)=>a-b);return values[1]===values[0]+1&&values[2]===values[1]+1;
};
export const mahjongCompletions=(hand:readonly MeldTile[],group:MahjongGroup):MeldTile[]=>{
 const all:MeldTile[]=(['wan','tong','tiao','zi'] as const).flatMap(suit=>Array.from({length:suit==='zi'?7:9},(_,i)=>({suit,value:i+1})));
 return all.filter(tile=>isMahjongGroup([...hand,tile],group));
};
export const mahjongDiscardOptions=(hand:readonly MeldTile[])=>{
 if(hand.length!==3)return [];
 const choices=hand.map((_,index)=>({index,hand:hand.filter((_,i)=>i!==index),completions:mahjongCompletions(hand.filter((_,i)=>i!==index),'RUN')}));
 const maximum=Math.max(...choices.map(item=>item.completions.length));return choices.map(item=>({...item,best:maximum>0&&item.completions.length===maximum}));
};
