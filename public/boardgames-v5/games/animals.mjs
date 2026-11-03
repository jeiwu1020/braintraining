export const animals = [
 {id:'rabbit',name:'兔子',color:'#e6d3ab',ears:'long'},
 {id:'fox',name:'狐狸',color:'#cf9565',ears:'point'},
 {id:'cat',name:'小貓',color:'#d1b57c',ears:'point'},
 {id:'bear',name:'小熊',color:'#ad8159',ears:'round'},
 {id:'panda',name:'熊貓',color:'#e9e1cb',ears:'round'},
 {id:'dog',name:'小狗',color:'#c7ab82',ears:'flop'},
 {id:'deer',name:'小鹿',color:'#ba8c54',ears:'point'},
 {id:'owl',name:'貓頭鷹',color:'#b3a08b',ears:'point'}
];
const names=Object.fromEntries(animals.map(a=>[a.id,a.name]));
export const meta={title:'動物排排坐',tagline:'同時照顧大家的小要求',rules:[
 '一般六隻、進階八隻，座位從左到右編號。只有最左與最右的座位靠窗。',
 '點一隻再點另一隻即可交換，也可直接拖曳。每一步會重新檢查所有要求。',
 '旁邊＝緊鄰一格；不相鄰＝至少隔一格；左邊／右邊只看方向，不必相鄰。',
 '進階有十二條交錯要求。全部同時滿足就完成；任何合乎條件的排列都接受。',
 '提示先指出一條未滿足要求，再協助觀察牽連的朋友，不直接公布整排答案。沒有倒數或步數處罰。'
]};
function shuffle(xs,rng){const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function satisfied(c,order){const a=order.indexOf(c.a),b=order.indexOf(c.b);if(a<0)return false;switch(c.type){case'edge':return a===0||a===order.length-1;case'next':return b>=0&&Math.abs(a-b)===1;case'notnext':return b>=0&&Math.abs(a-b)>1;case'left':return b>=0&&a<b;case'right':return b>=0&&a>b;case'inner':return a>0&&a<order.length-1;default:return false;}}
export function solveAnimals(ids,constraints,limit=1){const found=[];function visit(order,left){if(found.length>=limit)return;for(const c of constraints){if(!order.includes(c.a)||c.b&&!order.includes(c.b))continue;if(c.type==='edge'){const p=order.indexOf(c.a);if(p!==0&&p!==ids.length-1)return;}else if(c.type==='inner'){const p=order.indexOf(c.a);if(p===0||p===ids.length-1)return;}else if(!satisfied(c,order))return;}if(!left.length){if(constraints.every(c=>satisfied(c,order)))found.push(order);return;}for(const id of left)visit([...order,id],left.filter(x=>x!==id));}visit([],ids);return found;}
export function makePuzzle(rng=Math.random,difficulty='normal'){
 const count=difficulty==='advanced'?8:6,solution=shuffle(animals.slice(0,count).map(a=>a.id),rng),[a,b,c,d,e,f,g,h]=solution;
 const constraints=count===6?[{a,type:'edge'},{a:b,b:a,type:'next'},{a:c,b:e,type:'left'},{a:d,b:c,type:'next'},{a:e,b:f,type:'next'},{a:f,b:d,type:'right'},{a:a,b:d,type:'notnext'},{a:b,b:e,type:'notnext'}]:[{a,type:'edge'},{a:b,b:a,type:'next'},{a:c,b:e,type:'left'},{a:d,b:c,type:'next'},{a:e,b:g,type:'notnext'},{a:f,b:h,type:'left'},{a:g,b:h,type:'next'},{a:h,b:d,type:'right'},{a:a,b:d,type:'notnext'},{a:b,b:f,type:'left'},{a:c,b:g,type:'notnext'},{a:f,b:e,type:'next'}];
 if(!solveAnimals(solution,constraints).length)throw Error('無可解座位');
 let order=shuffle(solution,rng);if(constraints.every(c=>satisfied(c,order))){[order[0],order[2]]=[order[2],order[0]];}
 return {difficulty,solution,order,constraints:shuffle(constraints,rng),moves:0,done:false};
}
export function swapAnimals(state,i,j){
 if(!Number.isInteger(i)||!Number.isInteger(j)||i<0||j<0||i>=state.order.length||j>=state.order.length)throw new RangeError('座位超出範圍');
 if(i===j||state.done)return state;
 const order=[...state.order];[order[i],order[j]]=[order[j],order[i]];
 return {...state,order,moves:state.moves+1,done:state.constraints.every(c=>satisfied(c,order))};
}
export function constraintText(c){const a=names[c.a],b=names[c.b];return c.type==='edge'?`${a}想靠窗（兩端）`:c.type==='inner'?`${a}不想靠窗`:c.type==='notnext'?`${a}不要與${b}相鄰`:`${a}想坐在${b}${c.type==='next'?'旁邊':c.type==='left'?'左邊':'右邊'}`;}
export function getHint(state,index=0){const unmet=state.constraints.filter(c=>!satisfied(c,state.order));if(!unmet.length)return '所有要求都滿足了！大家都很開心。';const stage=index%3,c=unmet[Math.floor(index/3)%unmet.length],pos=state.order.indexOf(c.a)+1;if(stage===0)return `先專心看這一條：${constraintText(c)}。`;if(stage===1)return c.type==='edge'?`${names[c.a]}在 ${pos} 號。兩端是哪兩位？試想交換後會影響誰。`:`${names[c.a]}在 ${pos} 號，${names[c.b]}在 ${state.order.indexOf(c.b)+1} 號。先想要接近、分開，還是換左右。`;const related=state.constraints.filter(x=>x!==c&&(x.a===c.a||x.b===c.a||x.a===c.b||x.b===c.b));return `交換前一起檢查：${related.slice(0,2).map(constraintText).join('；')||'留意被換走朋友的要求'}。`;}
export function animalSvg(id){const a=animals.find(a=>a.id===id);let ears=a.ears==='long'?'<ellipse cx="24" cy="16" rx="7" ry="15"/><ellipse cx="48" cy="16" rx="7" ry="15"/>':a.ears==='point'?'<path d="M13 33 L14 9 L31 24 M41 24 L58 9 L59 33"/>':a.ears==='flop'?'<ellipse cx="13" cy="35" rx="8" ry="18"/><ellipse cx="59" cy="35" rx="8" ry="18"/>':'<circle cx="17" cy="23" r="11"/><circle cx="55" cy="23" r="11"/>';return `<svg aria-hidden="true" viewBox="0 0 72 76"><g fill="${a.color}" stroke="#704429" stroke-width="2.5">${ears}<ellipse cx="36" cy="43" rx="25" ry="26"/></g>${id==='panda'?'<g fill="#554d3e"><ellipse cx="25" cy="39" rx="8" ry="10"/><ellipse cx="47" cy="39" rx="8" ry="10"/></g>':''}<g fill="${id==='panda'?'#fff8e7':'#382c23'}"><circle cx="26" cy="39" r="2.8"/><circle cx="46" cy="39" r="2.8"/></g><ellipse fill="#704429" cx="36" cy="49" rx="4" ry="3"/><path d="M28 55 Q36 62 44 55" fill="none" stroke="#704429" stroke-width="2.5" stroke-linecap="round"/></svg>`;}
export function mount(root,{onFinish=()=>{},isPaused=()=>false,difficulty='normal'}={}){
 let state=makePuzzle(Math.random,difficulty),selected=null,hint='',hints=0,dead=false,pointer=null,skipClick=false,completed=false;
 const allowed=()=>!dead&&!state.done&&!isPaused();
 function finish(){if(state.done&&!completed){completed=true;onFinish({title:'大家都找到喜歡的座位！',summary:`所有要求全部滿足，共交換 ${state.moves} 次${hints?`、看了 ${hints} 次提示`:''}。沒有標準步數，下一局再試試不同安排。`});}}
 function move(i,j){if(!allowed())return;state=swapAnimals(state,i,j);selected=null;hint='';render();finish();}
 function pick(i){if(!allowed())return;if(selected===null){selected=i;render();}else if(selected===i){selected=null;render();}else move(selected,i);}
 function render(){if(dead)return;const count=state.constraints.filter(c=>satisfied(c,state.order)).length;root.innerHTML=`<section class="animals-game ${difficulty}"><div class="animals-status"><strong>${count} / ${state.constraints.length} 個要求滿足</strong><span>交換 ${state.moves} 次 · 不限時間</span></div><div class="animals-table"><div class="animals-window-row"><span>▥ 窗邊</span><span>窗邊 ▥</span></div><div class="animals-seats">${state.order.map((id,i)=>`<button type="button" class="animals-seat${selected===i?' selected':''}" data-seat="${i}" aria-pressed="${selected===i}" aria-label="${i+1} 號座位 ${names[id]}${i===0||i===state.order.length-1?' 靠窗':''}${selected===i?' 已選取':''}" ${state.done?'disabled':''}><span class="animals-seat-number">${i+1}</span><span class="animals-token" data-animal="${id}">${animalSvg(id)}</span><strong>${names[id]}</strong></button>`).join('')}</div><p class="animals-instruction" aria-live="polite">${state.done?'大家都坐好了！':selected===null?'點兩隻動物交換，或拖曳到另一隻身上':`已選${names[state.order[selected]]}，再點另一隻交換（再點自己取消）`}</p><p class="animals-hint" aria-live="polite">${hint}</p></div><div class="animals-preferences"><div class="animals-sheet-heading"><h3>朋友們的小要求</h3><button type="button" data-hint ${state.done?'disabled':''}>提示 ${hints%3+1}/3</button></div><p class="animals-legend">旁邊＝緊鄰；左右＝方向；兩端靠窗。</p><ul>${state.constraints.map(c=>{const ok=satisfied(c,state.order);return `<li class="${ok?'met':''}"><span class="animals-check" aria-label="${ok?'已滿足':'待調整'}">${ok?'✓':'○'}</span><span>${constraintText(c).replace('想坐在','在').replace('不要與','與').replace('相鄰','不相鄰')}</span></li>`;}).join('')}</ul></div></section>`;
 }
 const click=e=>{if(skipClick){skipClick=false;return;}const seat=e.target.closest('[data-seat]');if(seat&&root.contains(seat))pick(Number(seat.dataset.seat));else if(e.target.closest('[data-hint]')&&allowed()){hint=getHint(state,hints);hints++;render();}};
 const down=e=>{const seat=e.target.closest('[data-seat]');if(!seat||!allowed()||e.button>0)return;pointer={id:e.pointerId,index:Number(seat.dataset.seat),x:e.clientX,y:e.clientY,moved:false};seat.setPointerCapture?.(e.pointerId);};
 const motion=e=>{if(!pointer||pointer.id!==e.pointerId)return;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>8){pointer.moved=true;root.querySelector(`[data-seat="${pointer.index}"]`)?.classList.add('dragging');const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-seat]');root.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));if(target&&root.contains(target))target.classList.add('drop-target');}};
 const up=e=>{if(!pointer||pointer.id!==e.pointerId)return;const p=pointer;pointer=null;if(p.moved){skipClick=true;setTimeout(()=>{skipClick=false;},0);const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-seat]');if(target&&root.contains(target))move(p.index,Number(target.dataset.seat));else render();}root.querySelectorAll('.dragging,.drop-target').forEach(x=>x.classList.remove('dragging','drop-target'));};
 const cancel=()=>{pointer=null;root.querySelectorAll('.dragging,.drop-target').forEach(x=>x.classList.remove('dragging','drop-target'));};
 root.addEventListener('click',click);root.addEventListener('pointerdown',down);root.addEventListener('pointermove',motion);root.addEventListener('pointerup',up);root.addEventListener('pointercancel',cancel);render();
 return {restart(){state=makePuzzle(Math.random,difficulty);selected=null;hint='';hints=0;completed=false;pointer=null;skipClick=false;render();},destroy(){dead=true;root.removeEventListener('click',click);root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',motion);root.removeEventListener('pointerup',up);root.removeEventListener('pointercancel',cancel);root.innerHTML='';}};
}
