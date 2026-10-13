import React,{useEffect,useState}from'react';
import type{Difficulty}from'../types';
import{MAHJONG_PUZZLES}from'../data/mahjongPuzzles';
import{mahjongCompletions,meldTileKey,meldTileName,type MahjongPuzzle,type MahjongTier,type MeldTile}from'../utils/mahjongRules';
import{confirmMahjong,createMahjongSession,hintMahjong,reselectMahjongDiscard,restartMahjong,selectMahjongDiscard,selectMahjongTile,undoMahjong}from'../utils/mahjongSession';
import{readFacilitatorKnowledge,saveFacilitatorKnowledge}from'../utils/facilitatorKnowledge';
import FacilitatedGameFrame from'./game-ui/FacilitatedGameFrame';import{useConfirmAction}from'./game-ui/useConfirmAction';
const tiers:Record<MahjongTier,string>={BEGINNER:'入門：辨認組合',STANDARD:'標準：找全部進張',CHALLENGE:'挑戰：比較保留方案'};
const groups={RUN:'順子：同花色三連號',TRIPLET:'刻子：三張相同',PAIR:'雀頭：兩張相同'};
const control='min-h-11 rounded-lg border-2 px-2 text-base font-bold focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40';
const TileFace=({tile}:{tile:MeldTile})=><><span className="text-2xl font-black">{tile.suit==='zi'?meldTileName(tile):['一','二','三','四','五','六','七','八','九'][tile.value-1]}</span>{tile.suit!=='zi'&&<span className="text-base font-bold">{{wan:'萬',tong:'筒',tiao:'條'}[tile.suit]}</span>}</>;
const color=(tile:MeldTile)=>({wan:'text-rose-800',tong:'text-blue-800',tiao:'text-emerald-800',zi:'text-slate-900'}[tile.suit]);
interface Props{onBack:()=>void;difficulty?:Difficulty;isAdvanced?:boolean;puzzles?:MahjongPuzzle[]}
export default function MahjongFacilitatedGame({onBack,difficulty='NORMAL',isAdvanced=false,puzzles=MAHJONG_PUZZLES}:Props){
 const[puzzle,setPuzzle]=useState(()=>puzzles.find(p=>p.tier===(isAdvanced||difficulty==='ADVANCED'?'STANDARD':'BEGINNER'))??puzzles[0]);
 const[session,setSession]=useState(()=>({...createMahjongSession(puzzle),revealed:readFacilitatorKnowledge('mahjong-v1')}));
 useEffect(()=>saveFacilitatorKnowledge('mahjong-v1',session.revealed),[session.revealed]);
 const bank=puzzles.filter(p=>p.tier===puzzle.tier);const index=bank.findIndex(p=>p.id===puzzle.id);const practice=session.revealed.includes(puzzle.id);
 const hasProgress=session.discard!==null||session.selected.length>0||session.history.length>0||session.hintDepth>0||session.scores.A+session.scores.B>0;
 const{requestAction,confirmationDialog}=useConfirmAction(hasProgress);
 const change=(next:MahjongPuzzle)=>{if(next.id===puzzle.id)return;requestAction(()=>{setPuzzle(next);setSession(s=>restartMahjong(s,next));},'換題會清除目前捨牌與預選；累積分數和已看答案紀錄保留。是否繼續？');};
 const hand=session.discard===null?puzzle.hand:puzzle.hand.filter((_,i)=>i!==session.discard);
 const selectedNames=puzzle.options.filter(tile=>session.selected.includes(meldTileKey(tile))).map(meldTileName);
 return <>
 <FacilitatedGameFrame title="麻將湊牌大師" subtitle={`${tiers[puzzle.tier]} ${index+1}／${bank.length}`} onBack={onBack} mode={session.mode} onModeChange={mode=>setSession(s=>restartMahjong(s,puzzle,mode))} currentTeam={session.team} scores={session.scores} recentAction={session.recent}
 onUndo={()=>setSession(undoMahjong)} canUndo={session.history.length>0} hasProgress={hasProgress} onReset={()=>setSession(s=>restartMahjong(s,puzzle))} onHint={()=>setSession(s=>hintMahjong(s,puzzle))}
 feedback={session.finished?`本題完成！${practice?'提示練習，不計分。':'請輪流說出不同組合。'}`:undefined}
 rules={[
  '這是局部牌組練習，不是完整十六張麻將，也不把局部湊牌稱作整手胡牌。',
  '順子需要同花色的三個連號；刻子三張完全相同；雀頭兩張相同。字牌不能組順子，一與九不能跨界相連。',
  '先點候選牌預覽，可以多選、再次點選取消；說完整理由後按確認答案。不會一碰牌就判對錯或計時。',
  '標準要找出候選中全部合法進張，例如三萬四萬可補二萬，也可補五萬；不能只接受其中一端。',
  '挑戰先捨一張並確認，再找留下兩張的全部進張。目標是保留最多不同可補牌種；同樣多的方案全部接受，不代表實際摸牌機率。',
  '同組完成整題兩個階段；完整答對才換下一組。若方案少一種進張，可重選捨牌比較。',
  '分組首次完成得 1 分，同題不重複加分。復原會還原整個階段、預選、組別、分數與完成態；重玩和換題保留累積分數，換活動模式才清分。',
  '第三層提示提供具體答案，之後本題只作提示練習。提示紀錄以題目代號保留於本瀏覽分頁，復原、重玩、返回再進都保留；不保存病患資料，不用速度或分數推論能力。',
 ]}
 sidebar={<div className="space-y-2 text-base"><h2 className="font-bold">{puzzle.title}</h2><p>{puzzle.focus}</p><p className="font-bold">{groups[puzzle.group]}</p><p>{practice?'提示練習：本題不計分。':session.credited.includes(puzzle.id)?'本題已計分，重玩不加分。':'先說規則，再核對全部候選。'}</p></div>}
 settings={<div className="space-y-2"><label className="block text-base font-bold">推理階段<select aria-label="麻將推理階段" className={`${control} mt-1 w-full border-slate-300`} value={puzzle.tier} onChange={e=>change(puzzles.find(p=>p.tier===e.target.value)!)}>{Object.entries(tiers).filter(([tier])=>puzzles.some(p=>p.tier===tier)).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="block text-base font-bold">題目<select aria-label="麻將題目" className={`${control} mt-1 w-full border-slate-300`} value={puzzle.id} onChange={e=>change(bank.find(p=>p.id===e.target.value)!)}>{bank.map((p,i)=><option key={p.id} value={p.id}>{i+1}．{p.title}</option>)}</select></label></div>}
 controls={<div className="space-y-2"><div data-mahjong-preview="true" className="max-h-12 overflow-y-auto text-base font-bold" tabIndex={0}>{session.stage==='DISCARD'?(session.discard===null?'先選要捨的手牌。':`預選捨第 ${session.discard+1} 張 ${meldTileName(puzzle.hand[session.discard])}`):selectedNames.length?`預選：${selectedNames.join('、')}`:'請選全部合法候選。'}</div><div className="grid grid-cols-[1fr_1.3fr_1fr] gap-2"><button type="button" className={`${control} border-slate-300`} disabled={session.finished||(session.stage==='DISCARD'?session.discard===null:!session.selected.length&&session.discard===null)} onClick={()=>setSession(s=>s.discard!==null&&s.stage==='COMPLETIONS'?reselectMahjongDiscard(s):({...s,selected:[],discard:s.stage==='DISCARD'?null:s.discard,recent:'已取消本次預選，尚未計分或換組。'}))}>{session.discard!==null&&session.stage==='COMPLETIONS'?'重選捨牌':'取消'}</button><button type="button" className={`${control} border-indigo-700 bg-indigo-700 text-white`} disabled={session.finished||(session.stage==='DISCARD'?session.discard===null:!session.selected.length)} onClick={()=>setSession(s=>confirmMahjong(s,puzzle))}>{session.stage==='DISCARD'?'確認捨牌':'確認答案'}</button><button type="button" className={`${control} border-slate-300`} disabled={bank.length<2} onClick={()=>change(bank[(index+1)%bank.length])}>換題</button></div></div>}
 >
  <div className="w-full max-w-xl space-y-3 self-start"><section aria-label="麻將局部手牌"><h2 className="mb-2 text-base font-bold">{puzzle.tier==='CHALLENGE'?'手牌：先捨一張，再比較保留搭子':'手牌：請補成指定組合'}</h2><div className="flex justify-center gap-2">{puzzle.hand.map((tile,i)=>puzzle.tier==='CHALLENGE'?<button key={i} type="button" aria-label={`捨第 ${i+1} 張 ${meldTileName(tile)}`} aria-pressed={session.discard===i} disabled={session.finished||session.stage!=='DISCARD'} className={`flex min-h-[4.5rem] min-w-14 flex-col items-center justify-center rounded-lg border-2 px-2 focus-visible:ring-4 focus-visible:ring-sky-300 ${color(tile)} ${session.discard===i?'border-rose-700 bg-rose-50':'border-slate-400 bg-amber-50'}`} onClick={()=>setSession(s=>selectMahjongDiscard(s,i))}><TileFace tile={tile}/><span className="text-xs">{session.discard===i&&session.stage!=='DISCARD'?'已捨':`第${i+1}張`}</span></button>:<div key={i} aria-label={`手牌 ${meldTileName(tile)}`} className={`flex min-h-[4.5rem] min-w-14 flex-col items-center justify-center rounded-lg border-2 border-slate-400 bg-amber-50 px-2 ${color(tile)}`}><TileFace tile={tile}/></div>)}</div></section>
  <section aria-label="麻將候選牌"><h2 className="mb-2 text-base font-bold">候選：選出所有合法牌</h2><div className="grid gap-2" style={{gridTemplateColumns:`repeat(${puzzle.options.length},minmax(2.75rem,1fr))`}}>{puzzle.options.map(tile=><button key={meldTileKey(tile)} type="button" aria-label={`候選 ${meldTileName(tile)}`} aria-pressed={session.selected.includes(meldTileKey(tile))} disabled={session.finished||session.stage==='DISCARD'} onClick={()=>setSession(s=>selectMahjongTile(s,meldTileKey(tile)))} className={`flex min-h-[4.5rem] min-w-11 flex-col items-center justify-center rounded-lg border-2 focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-60 ${color(tile)} ${session.selected.includes(meldTileKey(tile))?'border-indigo-700 bg-indigo-50 ring-2 ring-inset ring-indigo-300':'border-slate-400 bg-white'}`}><TileFace tile={tile}/></button>)}</div></section>
  {session.finished&&<div className="rounded-lg bg-emerald-50 p-2 text-base">{mahjongCompletions(hand,puzzle.group).map(tile=><p key={meldTileKey(tile)}>{[...hand,tile].sort((a,b)=>a.value-b.value).map(meldTileName).join('・')}</p>)}</div>}
  </div>
 </FacilitatedGameFrame>{confirmationDialog}</>;
}
