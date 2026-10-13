import React,{useEffect,useMemo,useState}from'react';
import type{Difficulty}from'../types';
import{RUMMI_PUZZLES}from'../data/rummikubPuzzles';
import{rummiTileName,type RummiPuzzle,type RummiTile}from'../utils/rummikubRules';
import{confirmRummi,createRummiSession,hintRummi,restartRummi,selectRummiHand,selectRummiPlan,undoRummi}from'../utils/rummikubSession';
import{readFacilitatorKnowledge,saveFacilitatorKnowledge}from'../utils/facilitatorKnowledge';
import FacilitatedGameFrame from'./game-ui/FacilitatedGameFrame';import{useConfirmAction}from'./game-ui/useConfirmAction';
const tiers={BEGINNER:'入門：找合法牌',STANDARD:'標準：檢查整桌',CHALLENGE:'挑戰：最多出牌'};
const control='min-h-11 rounded-lg border-2 px-2 text-base font-bold focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40';
const color={red:'text-red-800',blue:'text-blue-800',yellow:'text-amber-800',black:'text-slate-950'};
const face=(t:RummiTile)=><><span className="rummi-value text-2xl font-black leading-none">{t.number}</span><span className="text-xs font-bold">{{red:'紅',blue:'藍',yellow:'黃',black:'黑'}[t.color]}</span></>;
interface Props{onBack:()=>void;difficulty?:Difficulty;isAdvanced?:boolean;puzzles?:RummiPuzzle[]}
export default function RummikubFacilitatedGame({onBack,difficulty='NORMAL',isAdvanced=false,puzzles=RUMMI_PUZZLES}:Props){
 const[puzzle,setPuzzle]=useState(()=>puzzles.find(p=>p.tier===(isAdvanced||difficulty==='ADVANCED'?'STANDARD':'BEGINNER'))??puzzles[0]);
 const[session,setSession]=useState(()=>({...createRummiSession(puzzle),revealed:readFacilitatorKnowledge('rummikub-v1')}));
 const[showOriginal,setShowOriginal]=useState(false);
 useEffect(()=>saveFacilitatorKnowledge('rummikub-v1',session.revealed),[session.revealed]);
 const bank=puzzles.filter(p=>p.tier===puzzle.tier),index=bank.findIndex(p=>p.id===puzzle.id),practice=session.revealed.includes(puzzle.id);
 const lookup=useMemo(()=>new Map([...puzzle.table.flat(),...puzzle.hand].map(t=>[t.id,t])),[puzzle]);
 const plan=puzzle.plans.find(p=>p.id===session.plan);const preview=Boolean(plan&&!showOriginal);
 const groups=preview?plan!.groups:puzzle.table.map(group=>group.map(t=>t.id));
 const hasProgress=session.hand.length>0||session.plan!==null||session.history.length>0||session.hintDepth>0||session.scores.A+session.scores.B>0;
 const{requestAction,confirmationDialog}=useConfirmAction(hasProgress);
 const change=(next:RummiPuzzle)=>{if(next.id===puzzle.id)return;requestAction(()=>{setPuzzle(next);setSession(s=>restartRummi(s,next));setShowOriginal(false);},'換題會清除目前預選與方案；累積分數和已看答案紀錄保留。是否繼續？');};
 return <><FacilitatedGameFrame desktopLayout="rummikub" title="拉密魔術牌" subtitle={`${tiers[puzzle.tier]} ${index+1}／${bank.length}`} onBack={onBack} mode={session.mode} onModeChange={mode=>{setSession(s=>restartRummi(s,puzzle,mode));setShowOriginal(false);}} currentTeam={session.team} scores={session.scores} recentAction={session.recent}
 hasProgress={hasProgress} onUndo={()=>{setSession(undoRummi);setShowOriginal(false);}} canUndo={session.history.length>0} onReset={()=>{setSession(s=>restartRummi(s,puzzle));setShowOriginal(false);}} onHint={()=>setSession(s=>hintRummi(s,puzzle))} feedback={session.finished?`本題完成！${practice?'提示練習，不計分。':'一起核對每一組。'}`:undefined}
 rules={[
  '這是公開牌桌的小型拉密重組題，不是完整對局；本批沒有百搭牌或首次出牌三十分限制。',
  '每組至少三張：同色連號，或同數不同色且最多四張。數字一到十三，不循環相接。',
  '重組後原桌牌全部要留在桌上，每張實體牌只能用一次。新組合法但留下兩張殘組，也不能提交。',
  '入門選一張手牌，看完整接牌預覽；兩端都合法時任選一張即可。標準比較整桌方案，找能合法放出最多手牌的方案。',
  '挑戰先選要出的手牌，再選完整分組方案。目標是本回合放出最多張手牌，並讓所有桌組合法；同樣好的方案全部接受。',
  '點牌和點方案都只是預選，按「確認整桌」才提交。按原桌可以對照，提示不會偷偷換掉已選方案。',
  '同組完成整題，完整合法且達成目標才換組。分組首次自主完成得一分，重玩不重複加分；沒有速度計分。',
  '復原還原整桌提交、預選、分數、組別及完成態；重玩與換題保留累積分數，切換模式清分。第三層揭示答案後，本題只作提示練習。題號紀錄保留於本分頁，返回再進也保留，不存病患資料。',
 ]}
 sidebar={<div className="space-y-2 text-base"><h2 className="font-bold">{puzzle.title}</h2><p>{puzzle.focus}</p><p>{puzzle.tier==='BEGINNER'?'目標：合法放出一張手牌。':'目標：所有原桌牌保留，每組合法，本回合放出最多手牌。'}</p><p>{practice?'提示練習：本題不計分。':session.credited.includes(puzzle.id)?'本題已計分，重玩不加分。':'請說出「方案幾、出哪些手牌、各組為何合法」。'}</p></div>}
 settings={<div className="space-y-2"><label className="block text-base font-bold">推理階段<select aria-label="拉密推理階段" className={`${control} mt-1 w-full border-slate-300`} value={puzzle.tier} onChange={e=>change(puzzles.find(p=>p.tier===e.target.value)!)}>{Object.entries(tiers).filter(([tier])=>puzzles.some(p=>p.tier===tier)).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="block text-base font-bold">題目<select aria-label="拉密題目" className={`${control} mt-1 w-full border-slate-300`} value={puzzle.id} onChange={e=>change(bank.find(p=>p.id===e.target.value)!)}>{bank.map((p,i)=><option key={p.id} value={p.id}>{i+1}．{p.title}</option>)}</select></label></div>}
 controls={<div className="space-y-2"><p className="max-h-12 overflow-y-auto text-base font-bold" tabIndex={0}>{session.hand.length?`預選 ${session.hand.map(id=>rummiTileName(lookup.get(id)!)).join('、')}`:puzzle.tier==='STANDARD'?'請選整桌方案。':'請先選手牌。'}{plan?`；${plan.label}`:''}</p><div className="grid grid-cols-[1fr_1.3fr_1fr] gap-2"><button type="button" className={`${control} border-slate-300`} disabled={session.finished||(!session.hand.length&&!session.plan)} onClick={()=>{setSession(s=>({...s,hand:[],plan:null,recent:'已取消預選，原桌未改動。'}));setShowOriginal(false);}}>取消</button><button type="button" className={`${control} border-orange-800 bg-orange-800 text-white`} disabled={session.finished||!session.plan||(puzzle.tier!=='STANDARD'&&!session.hand.length)} onClick={()=>{setSession(s=>confirmRummi(s,puzzle));setShowOriginal(false);}}>確認整桌</button><button type="button" className={`${control} border-slate-300`} disabled={bank.length<2} onClick={()=>change(bank[(index+1)%bank.length])}>換題</button></div></div>}
 >
 <div className="tabletop-presentation w-full max-w-2xl self-start space-y-2">
  <section aria-label="公開拉密手牌"><h2 className="mb-1 text-base font-bold">手牌 {puzzle.tier==='STANDARD'?'（比較方案中用了哪些牌）':'（可預選，尚未提交）'}</h2><div className="flex gap-2 overflow-x-auto pb-1">{puzzle.hand.map((tile,i)=><button type="button" key={tile.id} aria-label={`手牌 ${i+1} ${rummiTileName(tile)}`} aria-pressed={session.hand.includes(tile.id)} disabled={session.finished||puzzle.tier==='STANDARD'} onClick={()=>{setSession(s=>selectRummiHand(s,puzzle,tile.id));setShowOriginal(false);}} className={`rummi-tile flex min-h-16 min-w-11 shrink-0 flex-col items-center justify-center rounded-lg border-2 px-1 focus-visible:ring-4 focus-visible:ring-sky-300 ${color[tile.color]} ${session.hand.includes(tile.id)?'border-orange-700 bg-orange-50 ring-2 ring-inset ring-orange-300':'border-slate-400 bg-amber-50'}`}><span className="text-xs text-slate-600">手{i+1}</span>{face(tile)}</button>)}</div></section>
  {puzzle.tier!=='BEGINNER'&&<div className="grid grid-cols-3 gap-2" aria-label="完整重組方案">{puzzle.plans.map(p=><button key={p.id} type="button" aria-label={`選擇${p.label}`} aria-pressed={session.plan===p.id} disabled={session.finished} className={`${control} ${session.plan===p.id?'border-orange-700 bg-orange-100':'border-slate-300 bg-white'}`} onClick={()=>{setSession(s=>selectRummiPlan(s,puzzle,p.id));setShowOriginal(false);}}>{p.label}</button>)}</div>}
  <div className="flex items-center gap-2"><button type="button" className={`${control} border-slate-300`} aria-pressed={!preview} onClick={()=>setShowOriginal(true)}>原桌</button><button type="button" className={`${control} border-slate-300`} disabled={!plan} aria-pressed={preview} onClick={()=>setShowOriginal(false)}>預覽整桌</button><span className="text-sm font-bold">{session.finished?'已提交':preview?'只是預覽':'對照原桌'}</span></div>
  <section aria-label={preview?'拉密整桌預覽':'拉密原桌'} data-rummi-table={preview?'preview':'original'} className="space-y-2">{groups.map((group,i)=><div key={i} className="rounded-lg border-2 border-amber-700 bg-amber-50 p-1"><div className="flex items-center gap-2 overflow-x-auto"><span className="shrink-0 text-sm font-bold">組{i+1}</span>{group.map((id,j)=>{const tile=lookup.get(id)!;const added=puzzle.hand.some(t=>t.id===id);return <div key={`${id}-${j}`} aria-label={`${added?'新手牌':'原桌牌'} ${rummiTileName(tile)}`} className={`rummi-tile flex min-h-14 min-w-11 shrink-0 flex-col items-center justify-center rounded border-2 px-1 ${color[tile.color]} ${added?'border-orange-700 bg-orange-100':'border-slate-400 bg-white'}`}>{face(tile)}<span className="text-xs text-slate-600">{added?'新':'原'}</span></div>;})}</div></div>)}</section>
 </div>
 </FacilitatedGameFrame>{confirmationDialog}</>;
}
