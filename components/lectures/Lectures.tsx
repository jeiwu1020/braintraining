import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Coffee, MessageCircle, Pause, Play, ShieldCheck, Smartphone, X } from 'lucide-react';
import { CHAPTERS, LAST_CHECKED, LESSON_NOTES, LESSON_TITLE, SCENES, SOURCES, TOPICS } from '../../data/lectures/lesson01';
import { STORY_SCREENS } from '../../data/lectures/story01';
import LessonDecisionPanel from './LessonDecisionPanel';
import { LessonPanel, LessonSession, newLessonSession, readLessonSession, saveLessonSession } from './session';
import './lectures.css';
import './mobile-viewport.css';
import './story-feedback.css';
import { useExperienceViewport } from '../experience-ui/useExperienceViewport';
const ART = '/lectures/parcel-adult-editorial-v2.png';
const route = () => location.hash === '#lectures/lesson-01' ? 'class' : location.hash === '#lectures/prepare' ? 'prepare' : 'home';
function Dialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
 const ref = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const before = document.activeElement as HTMLElement | null;
  const box=ref.current!; const first=box.querySelector<HTMLElement>('button'); first?.focus();
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();onClose();}
   if(e.key==='Tab'){
    const focus=[...box.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]')];
    if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1)?.focus();}
    else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0]?.focus();}
   }
  }; box.addEventListener('keydown',key);return()=>{box.removeEventListener('keydown',key);before?.focus();};
 },[onClose]);
 return <div className="ll-shade"><div ref={ref} className="ll-dialog" role="dialog" aria-modal="true" aria-label={title}><div className="ll-dialog-title"><h2>{title}</h2><button aria-label="關閉視窗" onClick={onClose}><X size={22}/></button></div>{children}</div></div>;
}
export default function Lectures({ onBack }: { onBack: () => void }) {
 const viewportStyle=useExperienceViewport();
 const [view,setView]=useState(route);
 const [session,setSession]=useState<LessonSession>(()=>{
  const restored=readLessonSession();
  return route()==='class'?{...restored,started:true}:restored;
 });
 const [saved,setSaved]=useState(true);
 const [restart,setRestart]=useState(false);
 const [topic,setTopic]=useState(0);
 useEffect(()=>{const f=()=>{
  const next=route();setView(next);
  if(next==='class')setSession(s=>s.started?s:{...s,started:true});
 };window.addEventListener('hashchange',f);return()=>window.removeEventListener('hashchange',f);},[]);
 useEffect(()=>{setSaved(saveLessonSession(session));},[session]);
 const go=(v:'home'|'prepare'|'class')=>{setView(v);location.hash=v==='class'?'lectures/lesson-01':v==='prepare'?'lectures/prepare':'lectures';window.scrollTo?.(0,0);};
 const start=()=>{setSession({...newLessonSession(),started:true});go('class');};
 if(view==='class') return <div className="ll-viewport" style={viewportStyle}><Classroom session={session} setSession={setSession} saved={saved} onBack={()=>go('home')}/></div>;
 if(view==='prepare') return <div className="ll-viewport" style={viewportStyle}><Preparation onBack={()=>go('home')} onStart={()=>session.started?go('class'):start()}/></div>;
 return <main className="ll-hub" style={viewportStyle}>
  <div className="ll-hub-nav"><button onClick={onBack}><ArrowLeft size={20}/> 返回遊戲首頁</button><span>Braintraining · 職能講座</span></div>
  <header className="ll-hub-hero"><div><span className="ll-eyebrow">從日常出發，一起練習</span><h1>職能講座</h1><p>把生活裡的小困惑，<br/>變成可以一起想的下一步。</p><span className="ll-soft-label">生活故事 · 示範 · 討論與練習</span></div><img src={ART} alt="一位成年人坐在桌旁，思考手機裡的通知"/></header>
  <section aria-labelledby="ll-topics"><div className="ll-section-heading"><h2 id="ll-topics">六個生活主題</h2><span>16 堂課逐步規劃中</span></div><div className="ll-topics">{TOPICS.map((name,i)=><button key={name} aria-pressed={topic===i} onClick={()=>setTopic(i)}><span>{name}</span><small>{i===0?'第一堂已可上課':'規劃中'}</small></button>)}</div></section>
  <section className="ll-course-section" aria-live="polite">{topic===0?<article className="ll-course"><div className="ll-course-icon"><Smartphone size={42}/></div><div className="ll-course-copy"><span className="ll-eyebrow">第一堂 · 手機與資訊</span><h2>{LESSON_TITLE}</h2><p>跟著一則包裹通知，練習暫停、獨立查證與求助。</p><div className="ll-course-meta"><span>約 60 分鐘</span><span>24 個教學畫面</span><span>可口述參與</span></div><div className="ll-course-actions">{session.started?<><button className="ll-primary" onClick={()=>go('class')}><Play size={19}/> 續課 · 第 {session.page+1} 頁</button><button onClick={()=>setRestart(true)}>從頭開始</button></>:<button className="ll-primary" onClick={start}><Play size={19}/> 開始上課</button>}<button onClick={()=>go('prepare')}><BookOpen size={19}/> 帶領者備課</button></div></div></article>:<div className="ll-planned"><BookOpen size={35}/><h2>{TOPICS[topic]}</h2><p>這個主題仍在規劃中。<br/>目前可從「手機與資訊」的第一堂開始。</p><button onClick={()=>setTopic(0)}>看第一堂課 <ChevronRight size={18}/></button></div>}</section>
  <p className="ll-hub-foot">可用手機橫向、電腦或投影帶領。沒有搶答、排名或能力診斷。<br/>本次進度只存在這個瀏覽器分頁；關閉分頁後可能清除。{!saved&&'目前無法儲存，離開前請記下頁碼。'}</p>
  {restart&&<Dialog title="從第一頁重新開始？" onClose={()=>setRestart(false)}><p>會清除這一堂目前的頁碼、選擇與揭示進度。</p><div className="ll-course-actions"><button onClick={()=>setRestart(false)}>保留進度</button><button className="ll-primary" onClick={()=>{setRestart(false);start();}}>重新開始</button></div></Dialog>}
 </main>;
}
function Preparation({onBack,onStart}:{onBack:()=>void;onStart:()=>void}){
 return <main className="ll-prep"><div className="ll-hub-nav"><button onClick={onBack}><ArrowLeft size={20}/> 返回課程首頁</button><span>帶領者備課資料</span></div><header><span className="ll-eyebrow">上課前閱讀 · 本頁包含解析</span><h1>{LESSON_TITLE}</h1><p>約 60 分鐘、24 個畫面。時間是帶領建議，不會強制倒數或自動換頁。</p><button className="ll-primary" onClick={onStart}><Play size={19}/> 進入上課畫面</button></header>
  <section className="ll-prep-safety"><h2>帶領前先確認</h2><ul><li>全課使用虛構通知。可口述、指選項、由帶領者操作，也可以旁聽。</li><li>不要求真實帳號、卡號、密碼、驗證碼、病史或財務資料；不把答案當能力診斷。</li><li>上課畫面不顯示講師備註。點選後的回饋與按「揭示」後的內容，全場都看得到；投影鏡像沒有私密講師面板。</li><li>若有真實事件正發生，停止公開討論，私下協助立即向合適官方管道求助。</li><li>疑似詐騙查證找 165；銀行／卡片風險立即通知往來銀行；人身危險或需警察立即協助找 110。可並行處理。</li></ul></section>
  <section><h2>帶領節奏</h2><div className="ll-prep-chapters">{CHAPTERS.map(c=><div key={c.first}><b>{c.title}</b><span>{c.time}</span></div>)}</div></section>
  <section><h2>逐頁教案與解析</h2><p>先展開備課。選項點選後立即回饋；完整理由仍可逐步揭示。四個選做延伸取代原延伸討論，每個約一分鐘，不另加課程時間。</p>{LESSON_NOTES.map((n,i)=><details className="ll-note" key={n.n}><summary><span>{String(n.n).padStart(2,'0')} · {SCENES[i].title}</span><small>{n.time}</small></summary><div><p><b>參與任務：</b>{n.task}</p><p><b>帶領語：</b>{n.script}</p><p><b>理由與解析：</b>{n.answer.replace('本頁先不揭示。','').replace('收集想法後，下一頁看理由。','')}</p><p><b>延伸：</b>{n.extend}</p><p><b>留意：</b>{n.hint}</p><small>依據：{n.source}</small></div></details>)}</section>
  <section className="ll-sources"><h2>官方參考資料</h2><p>最後查證：{LAST_CHECKED}（臺灣）。授課前請再確認官方資訊，尤其客服與求助程序。</p>{SOURCES.map(s=><article key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.id} · {s.title}</a><p>{s.note}</p></article>)}</section>
  <button className="ll-primary" onClick={onStart}>進入上課畫面 <ArrowRight size={19}/></button>
 </main>;
}
function Classroom({session,setSession,saved,onBack}:{session:LessonSession;setSession:React.Dispatch<React.SetStateAction<LessonSession>>;saved:boolean;onBack:()=>void}){
 const [overlay,setOverlay]=useState<'chapters'|'pause'|null>(null);
 const head=useRef<HTMLHeadingElement>(null);
 const body=useRef<HTMLDivElement>(null);
 const scene=SCENES[session.page], note=LESSON_NOTES[session.page], count=session.revealed[session.page]||0;
 const selected=session.selected[session.page], story=STORY_SCREENS[session.page];
 const panel=session.panels[session.page]||'context';
 const chapter=CHAPTERS.find(c=>session.page>=c.first&&session.page<=c.last)!;
 const inChallenge=panel.startsWith('challenge');
 const decision=inChallenge?story.challenge!:story.interaction;
 const hasChoices=story.interaction.choices.length>0;
 const setPanel=(next:LessonPanel)=>setSession(s=>({...s,panels:{...s.panels,[s.page]:next}}));
 const showChoices=()=>setSession(s=>({...s,contextSeen:{...s.contextSeen,[s.page]:true},panels:{...s.panels,[s.page]:inChallenge?'challenge-choices':'choices'}}));
 const openChallenge=()=>setSession(s=>({...s,challengeVisited:{...s.challengeVisited,[s.page]:true},panels:{...s.panels,[s.page]:'challenge-context'}}));
 const select=(c:number)=>setSession(s=>({...s,...(inChallenge?{challengeSelected:{...s.challengeSelected,[s.page]:c}}:{selected:{...s.selected,[s.page]:c}}),panels:{...s.panels,[s.page]:inChallenge?'challenge-feedback':'feedback'}}));
 const changePage=(p:number)=>{setSession(s=>({...s,page:Math.max(0,Math.min(SCENES.length-1,p)),discussed:p>s.page?{...s.discussed,[s.page]:true}:s.discussed}));setOverlay(null);};
 useEffect(()=>{head.current?.focus();if(body.current)body.current.scrollTop=0;},[session.page,panel]);
 const reveal=()=>setSession(s=>({...s,panels:hasChoices?{...s.panels,[s.page]:'reason'}:s.panels,revealed:{...s.revealed,[s.page]:Math.min((s.revealed[s.page]||0)+1,SCENES[s.page].reveal.length)}}));
 const startReasons=()=>setSession(s=>({...s,panels:{...s.panels,[s.page]:'reason'},revealed:{...s.revealed,[s.page]:Math.min(1,SCENES[s.page].reveal.length)}}));
 const hide=()=>setSession(s=>({...s,revealed:{...s.revealed,[s.page]:0},panels:{...s.panels,[s.page]:'context'}}));
 const closeOverlay=React.useCallback(()=>setOverlay(null),[]);
 return <main className={`ll-class ll-kind-${scene.kind}`} data-page={session.page+1}>
  <header className="ll-class-top"><button onClick={onBack} aria-label="返回職能講座首頁"><ArrowLeft size={19}/><span>職能講座</span></button><span className="ll-phase">{CHAPTERS.indexOf(chapter)+1}/4 · {chapter.title}</span><span className="ll-scroll-hint">內容可上下滑動</span><span className="ll-page" aria-label={`第 ${session.page+1} 頁，共 24 頁`}>{String(session.page+1).padStart(2,'0')} / 24</span></header>
  <div className={`ll-stage ${panel!=='context'?'ll-stage-decision':''}`} ref={body} tabIndex={0} aria-label="課程內容，可上下捲動">
  {panel!=='context'?<LessonDecisionPanel decision={decision} context={inChallenge?story.challenge!.contextFacts:story.contextFacts} panel={panel} selected={inChallenge?session.challengeSelected[session.page]:selected} reasons={inChallenge?[(()=>{const f=story.challenge!.choices[session.challengeSelected[session.page]]?.feedback;return f?`已確認：${f.confirmed}\n還缺少：${f.missing}\n下一步：${f.next}`:story.challenge!.hint||'';})()]:scene.reveal} count={inChallenge?1:count} onChoose={select} onRetry={()=>setPanel(inChallenge?'challenge-choices':'choices')} onContext={()=>setPanel(inChallenge?'challenge-context':'context')} onChoices={showChoices} onReason={()=>{if(inChallenge)setPanel('challenge-reason');else startReasons();}} onCloseChallenge={inChallenge?()=>setPanel('context'):undefined}/>:<>
  <div className="ll-title-row"><h1 ref={head} tabIndex={-1}>{scene.title}</h1><p>{scene.lead}</p></div>
  <div className="ll-class-body">
   <div className="ll-visual">
    {(scene.kind==='story')?<div className="ll-story"><div className="ll-person"><p>{scene.thought}</p><img src={ART} alt="故事角色看著手機，停下來思考"/></div><div className={`ll-phone ${count>0?'ll-marked':''}`}><div className="ll-phone-speaker"/><span className="ll-fiction">教學用虛構通知</span><div className="ll-notification"><span className="ll-notification-title"><MessageCircle size={17}/>{scene.messageLabel}</span>{scene.message?.map((line,i)=><p className={count>0&&i===1?'ll-highlight':''} key={line}>{line}</p>)}</div><small>連結省略，不可操作</small></div></div>:
     (scene.kind==='welcome'||scene.kind==='closing')?<div className="ll-welcome"><img src={ART} alt="成年人坐在桌旁，準備從生活故事開始"/><div className="ll-method-stack">{scene.lines?.map((l,i)=><div key={l}><span>0{i+1}</span><b>{l}</b></div>)}</div></div>:
     scene.kind==='break'?<div className="ll-break"><Coffee size={68}/><p>把手機放一旁，<br/>留一點空白給自己。</p><small>休息長短可調整，不會自動換頁</small></div>:
     scene.kind==='dialogue'?<div className="ll-dialogue-art"><img src={ART} alt="故事角色停下來，想好怎麼開口求助"/><div className="ll-speech"><span>{session.page===19?'求助句型 · 一次練一句':'可以這樣說'}</span><p>{session.page===19&&count>0&&count<=2?scene.reveal[count-1]:scene.thought}</p></div></div>:
     scene.kind==='route'&&session.page===7?<div className="ll-demo"><div className="ll-demo-stepbar">{scene.lines?.map((t,i)=><span className={i< count?'is-done':''} key={t}>{i+1}</span>)}</div><div className="ll-order-app"><span className="ll-fiction">教學用模擬 App</span><h2>{count<2?'先離開訊息':'原本的購物 App'}</h2>{count<2?<><Smartphone size={48}/><p>不從通知內的連結進入</p></>:<><div className="ll-order-row"><span>我的訂單</span><b>查看訂單紀錄</b></div>{count>=3&&<div className="ll-order-row"><span>這筆包裹 · 配送中</span><b>此處沒有顯示追加費用</b></div>}<div className={`ll-order-row ${count>=4?'ll-ring':''}`}><span>需要協助？</span><b>App 內官方客服 <ArrowRight size={20}/></b></div></>}<small>此畫面沒有真實訂單或連結</small></div></div>:
     <div className={`ll-teaching ll-teaching-${scene.kind}`}><span className="ll-visual-symbol">{scene.kind==='help'?<ShieldCheck size={42}/>:scene.kind==='method'?<Smartphone size={42}/>:<BookOpen size={42}/>}</span>{scene.lines?.map((l,i)=><div className="ll-teach-line" key={l}><span>{String(i+1).padStart(2,'0')}</span><p>{l}</p></div>)}{scene.thought&&<p className="ll-method-quote">{scene.thought}</p>}</div>}
   </div>
   <aside className={`ll-conversation ${count?'is-revealed':''}`} aria-label="一起討論">
    <span className="ll-eyebrow">{count?'一起看理由':'先想一想'}</span><h2>{scene.cue}</h2>
    {story.contextFacts.length>0&&<div className="ll-context-facts">{story.contextFacts.map(f=><p key={f}>{f}</p>)}</div>}
    {hasChoices?<button className="ll-primary" onClick={showChoices}>比較下一步</button>:count>0?<div className="ll-reveal" aria-live="polite"><span className="ll-reveal-count">{count} / {scene.reveal.length}</span><p>{scene.reveal[count-1]}</p><button className="ll-text-button" onClick={hide}>收起提示，重新討論</button></div>:<p className="ll-invitation">可以口述，也可以先聽大家說。<br/>{scene.kind==='break'?'不需要完成任何題目。':'需要時，由帶領者揭示提示。'}</p>}
    {story.challenge&&<button className="ll-challenge-start" onClick={openChallenge}>選做延伸</button>}
    {!saved&&<small role="status">無法儲存進度，離開前請記下頁碼。</small>}
   </aside>
  </div>
  </>}
  </div>
  <footer className="ll-controls"><div className="ll-nav-controls"><button onClick={()=>changePage(session.page-1)} disabled={session.page===0} aria-label="上一頁"><ArrowLeft size={20}/><span>上一頁</span></button><button onClick={()=>setOverlay('chapters')} aria-label="章節"><BookOpen size={19}/><span>任務地圖</span></button><button onClick={()=>setOverlay('pause')} aria-label="暫停"><Pause size={19}/><span>暫停</span></button></div><div className="ll-forward-controls">{!inChallenge&&scene.reveal.length>0&&<button className="ll-reveal-button" disabled={count>=scene.reveal.length} onClick={reveal}>{count>=scene.reveal.length?'已揭示完畢':session.page===7?'示範下一步':count===0?'揭示提示與理由':'繼續看理由'}</button>}<button className="ll-primary" onClick={()=>session.page===23?(setSession(s=>({...s,discussed:{...s.discussed,23:true}})),onBack()):changePage(session.page+1)} aria-label={session.page===23?'完成課程':'下一頁'}>{session.page===23?'完成課程':'下一頁'} <ArrowRight size={20}/></button></div></footer>
  {overlay==='chapters'&&<Dialog title="選擇章節" onClose={closeOverlay}><p>四個任務串成同一天的故事。進度只表示已討論，可自由進出，不必答對才前進。</p><div className="ll-chapter-list">{CHAPTERS.map((c,i)=><button key={c.first} onClick={()=>changePage(c.first)}><span>0{i+1} · {c.title}</span><small>{Array.from({length:c.last-c.first+1},(_,n)=>n+c.first).every(p=>session.discussed[p])?'已討論':(session.page>=c.first&&session.page<=c.last)||Object.keys(session.discussed).some(p=>+p>=c.first&&+p<=c.last)?'進行中':'未開始'} · 第 {c.first+1} 頁 <ChevronRight size={17}/></small></button>)}</div></Dialog>}
  {overlay==='pause'&&<Dialog title="暫停一下" onClose={closeOverlay}><div className="ll-pause"><Coffee size={58}/><p>可以喝水、休息，或整理剛才的想法。</p><p>進度保留在第 {session.page+1} 頁。不計時，也不會自動前進。</p><button className="ll-primary" onClick={closeOverlay}><Play size={20}/> 繼續上課</button></div></Dialog>}
 </main>;
}
