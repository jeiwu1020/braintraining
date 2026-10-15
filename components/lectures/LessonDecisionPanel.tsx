import React,{useEffect,useRef,useState} from 'react';
import type {StoryDecision} from '../../data/lectures/story01';
import type {LessonPanel} from './session';
interface Props { decision:StoryDecision; context:string[]; panel:LessonPanel; selected?:number; reasons:string[]; count:number; onChoose:(index:number)=>void; onRetry:()=>void; onContext:()=>void; onChoices:()=>void; onReason:()=>void; onCloseChallenge?:()=>void; }
export default function LessonDecisionPanel({decision,context,panel,selected,reasons,count,onChoose,onRetry,onContext,onChoices,onReason,onCloseChallenge}:Props){
 const [hint,setHint]=useState(false),[confirmed,setConfirmed]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{setHint(false);setConfirmed(false);heading.current?.focus({preventScroll:true});},[panel,selected,decision]);
 const choice=selected===undefined?undefined:decision.choices[selected];
 const isContext=panel==='challenge-context',isFeedback=panel.endsWith('feedback')&&choice,isReason=panel.endsWith('reason');
 return <section className="ll-decision-panel" aria-label={onCloseChallenge?'選做延伸':'故事決策'}>
  <h2 ref={heading} tabIndex={-1}>{decision.question}</h2>
  {isContext?<><div className="ll-context-facts">{context.map(f=><p key={f}>{f}</p>)}</div><button className="ll-primary" onClick={onChoices}>比較下一步</button></>:
   isFeedback?<div className={`ll-choice-feedback ll-feedback-${choice.feedback.kind}`} aria-live="polite" aria-atomic="true">
    <div className="ll-feedback-heading"><b>{choice.feedback.label}</b><span>剛才選擇：{choice.text}</span></div>
    <div className={`ll-feedback-fields ${confirmed?'show-confirmed':''}`}>
     <div className="ll-feedback-confirmed"><small>已確認</small><p>{choice.feedback.confirmed}</p></div>
     <div className="ll-feedback-missing"><small>還缺少</small><p>{choice.feedback.missing}</p></div>
     <div className="ll-feedback-next"><small>下一步</small><p>{choice.feedback.next}</p></div>
    </div>
    <div className="ll-decision-actions"><button onClick={onRetry}>再試一個</button><button className="ll-confirmed-switch" aria-pressed={confirmed} onClick={()=>setConfirmed(!confirmed)}>{confirmed?'缺口與下一步':'已確認的事'}</button><button onClick={()=>setHint(!hint)}>看提示</button><button onClick={onReason}>看完整理由</button></div>
   </div>:
   isReason?<div className="ll-reveal" aria-live="polite"><span className="ll-reveal-count">{count} / {reasons.length}</span><p>{reasons[Math.max(0,count-1)]}</p><button onClick={onRetry}>回到討論選項</button></div>:
   <><div className="ll-decision-choices" role="group" aria-label="討論選項">{decision.choices.map((c,i)=><button key={c.id} aria-label={c.text} aria-pressed={selected===i} onClick={()=>onChoose(i)}><span>{c.id.toUpperCase()}</span><p>{c.text}</p></button>)}</div><div className="ll-decision-actions"><button onClick={onContext}>再看情境</button><button onClick={()=>setHint(!hint)}>看提示</button></div></>}
  {hint&&<p className="ll-decision-hint" role="status">{decision.hint}</p>}
  {onCloseChallenge&&<button className="ll-challenge-back" onClick={onCloseChallenge}>回到主故事</button>}
 </section>;
}
