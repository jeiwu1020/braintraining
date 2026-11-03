import React, {useId} from 'react';
const cells:Record<string,[number,number]>={beans:[0,0],lost:[887,0],animals:[0,443.5],borrow:[887,443.5]};
/** One complete 2:1 atlas panel, uniformly fitted without stretching or cropping. */
export default function NewBoardgameArt({game}:{game:string}){
 const clip=useId();
 const cell=cells[game];
 if(!cell)return null;
 return <svg className="nb-panel-art" viewBox="0 0 887 443.5" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><defs><clipPath id={clip}><rect width="887" height="443.5"/></clipPath></defs><g clipPath={`url(#${clip})`}><image href="/boardgames-v5/assets/tabletop-atlas-v2.png" x={-cell[0]} y={-cell[1]} width="1774" height="887" preserveAspectRatio="xMidYMid meet"/></g></svg>;
}
