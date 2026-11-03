const app=document.getElementById('app'),L='ABCDEFGH',enc=encodeURIComponent;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}},del(k){try{localStorage.removeItem(k)}catch{}}};
const fmt=s=>{s=Math.round(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const PROMPT='Main ek TGT/competitive exam ka student hu. Neeche mere test ka result aur galat questions hain. Please: 1) meri weak topics batao, 2) har galti ka reason batao (concept, silly mistake ya time pressure), 3) 7 din ka improvement plan do, 4) topic-wise practice tips do. Hinglish me samjhao.\n\n';
let IDX,T,S,tick,ts=0,filt='m';
const j=async u=>{const r=await fetch(u,{cache:'no-cache'});if(!r.ok)throw Error(u);return r.json()};
document.documentElement.dataset.theme=ls.get('theme')||'dark';
const link=(s,n)=>location.href.split('#')[0]+'#/t/'+enc(s)+'/'+enc(n);
const wa=(t,l)=>'https://wa.me/?text='+enc(t+' - ye test do: '+l);
const save=()=>ls.set('st:'+S.id,S);
function toast(m){const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.append(d);setTimeout(()=>d.remove(),2200)}
async function copy(t){try{await navigator.clipboard.writeText(t)}catch{const a=document.createElement('textarea');a.value=t;document.body.append(a);a.select();document.execCommand('copy');a.remove()}toast('Copy ho gaya')}
function shell(h){app.innerHTML=`<header class="top noprint"><a class=brand href="#/">Pariksha Path</a><button class=ib id=th>Theme</button></header><main class=wrap>${h}</main>`;document.getElementById('th').onclick=()=>{const d=document.documentElement,v=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=v;ls.set('theme',v)};window.scrollTo(0,0)}
const msg=(a,b)=>shell(`<h2>${a}</h2><p class=mu>${b}</p><a class=btn href="#/">Home par jao</a>`);

async function route(){
  clearInterval(tick);
  const p=location.hash.slice(2).split('/');
  try{IDX=await j('tests-index.json')}catch{return msg('Tests ki list nahi mili','tests-index.json check karo. GitHub Action ek baar chalna chahiye.')}
  if(p[0]==='s')return list(p[1]);
  if(p[0]==='t')return open(p[1],p[2]);
  home();
}
function home(){
  shell(`<h1>Apni taiyari, apni raftaar</h1><p class=mu>Section chuno aur test shuru karo. Login ki zarurat nahi.</p><div class=grid>${IDX.sections.map(s=>`<a class=card href="#/s/${enc(s.name)}"><h3>${esc(s.name)}</h3><span class=mu>${s.tests.length} tests</span></a>`).join('')||'<p class=mu>Abhi koi test nahi hai. tests/ folder me JSON daalo.</p>'}</div>`);
}
function list(n){
  const s=IDX.sections.find(x=>x.name===decodeURIComponent(n||''));
  if(!s)return msg('Section nahi mila','Home se dobara chuno.');
  shell(`<a class=mu href="#/">Sab sections</a><h1>${esc(s.name)}</h1>${s.tests.map(t=>{const r=ls.get('res:'+s.name+'/'+t.name);return `<div class=row><a href="#/t/${enc(s.name)}/${enc(t.name)}"><b>${esc(t.title)}</b><span class=mu>${t.questions} questions, ${t.duration} min${r?`, pichla score ${r.score}/${r.max}`:''}</span></a><a class=ib target=_blank rel=noopener href="${wa(t.title,link(s.name,t.name))}">WhatsApp</a></div>`}).join('')}`);
}
async function open(sec,name){
  sec=decodeURIComponent(sec||'');name=decodeURIComponent(name||'');
  try{T=await j(`tests/${enc(sec)}/${enc(name)}.json`)}catch{return msg('Test nahi mila','Link galat hai ya test hata diya gaya.')}
  const id=sec+'/'+name,st=ls.get('st:'+id),r=ls.get('res:'+id),dur=T.duration||30,n=T.questions.length;
  shell(`<a class=mu href="#/s/${enc(sec)}">${esc(sec)}</a><h1>${esc(T.title)}</h1><ul class=info><li>${n} questions</li><li>${dur} minutes</li><li>Sahi jawab: +${T.marks??1}</li><li>Galat jawab: -${T.negative??0}</li></ul><p class=mu>Kisi bhi question par aage-peeche ja sakte ho. Progress apne aap save hota hai. Time khatam hote hi test khud submit ho jayega.</p><div class=acts><button class=btn id=go>${st?'Resume test':'Start test'}</button>${st?'<button class=ghost id=nw>Naya shuru karo</button>':''}${r?`<button class=ghost id=vr>Pichla report (${r.score}/${r.max})</button>`:''}<a class=ghost target=_blank rel=noopener href="${wa(T.title,link(sec,name))}">WhatsApp pe bhejo</a></div>`);
  const begin=()=>{S={id,a:[],m:[],t:[],cur:0,start:Date.now(),end:Date.now()+dur*60000};save();ts=Date.now();run()};
  document.getElementById('go').onclick=()=>{if(!st)return begin();S=st;if(Date.now()>=S.end)return finish();ts=Date.now();run()};
  if(st)document.getElementById('nw').onclick=begin;
  if(r)document.getElementById('vr').onclick=()=>result(r);
}
function go(i){
  if(i<0||i>=T.questions.length)return;
  S.t[S.cur]=(S.t[S.cur]||0)+(Date.now()-ts)/1000;ts=Date.now();S.cur=i;save();run();window.scrollTo(0,0);
}
function run(){
  clearInterval(tick);
  const n=T.questions.length,q=T.questions[S.cur],a=S.a[S.cur];
  app.innerHTML=`<div class=bar><div class=ring id=rg><span id=tm></span></div><div class=pg><b>Q ${S.cur+1} of ${n}</b><i><u id=pb></u></i></div><button class="btn sm" id=sub>Submit</button></div><main class="wrap q">${q.topic?`<span class=tag>${esc(q.topic)}</span>`:''}<h2>${esc(q.q)}</h2><div class=ops>${q.options.map((o,i)=>`<button class="op${a===i?' on':''}" data-i=${i}><b>${L[i]}</b><span>${esc(o)}</span></button>`).join('')}</div><button class=ghost id=clr>Answer clear karo</button></main><nav class=nav><button id=pv ${S.cur?'':'disabled'}>Previous</button><button id=mk class="${S.m[S.cur]?'on':''}">${S.m[S.cur]?'Marked':'Mark'}</button><button id=pl>Palette</button><button id=nx ${S.cur<n-1?'':'disabled'}>Next</button></nav><div class=sheet id=sh hidden></div>`;
  const ops=[...document.querySelectorAll('.op')],$=id=>document.getElementById(id);
  const mark=()=>ops.forEach(x=>x.classList.toggle('on',+x.dataset.i===S.a[S.cur]));
  ops.forEach(b=>b.onclick=()=>{const i=+b.dataset.i;S.a[S.cur]=S.a[S.cur]===i?null:i;save();mark();upd()});
  $('clr').onclick=()=>{S.a[S.cur]=null;save();mark();upd()};
  $('pv').onclick=()=>go(S.cur-1);$('nx').onclick=()=>go(S.cur+1);
  $('mk').onclick=e=>{S.m[S.cur]=!S.m[S.cur];save();e.target.classList.toggle('on',S.m[S.cur]);e.target.textContent=S.m[S.cur]?'Marked':'Mark'};
  $('pl').onclick=sheet;$('sub').onclick=sb;
  tick=setInterval(upd,1000);upd();
}
function upd(){
  const rg=document.getElementById('rg');if(!rg)return;
  const left=Math.max(0,(S.end-Date.now())/1000),tot=(S.end-S.start)/1000,done=S.a.filter(x=>x!=null).length;
  document.getElementById('tm').textContent=fmt(left);
  rg.style.setProperty('--p',(left/tot*100)+'%');rg.classList.toggle('low',left<300);
  document.getElementById('pb').style.width=(done/T.questions.length*100)+'%';
  if(left<=0)finish();
}
function sheet(){
  const sh=document.getElementById('sh'),st=i=>(i===S.cur?'c ':'')+(S.m[i]?'m':S.a[i]!=null?'a':'');
  sh.innerHTML=`<div class=sp><h3>Questions</h3><div class=pal>${T.questions.map((_,i)=>`<button class="${st(i)}" data-i=${i}>${i+1}</button>`).join('')}</div><p class=mu>Hara: answered. Peela: marked for review. Khali: baaki.</p><div class=acts><button class=btn id=sb2>Submit test</button><button class=ghost id=cl>Band karo</button></div></div>`;
  sh.hidden=false;
  sh.querySelectorAll('.pal button').forEach(b=>b.onclick=()=>go(+b.dataset.i));
  document.getElementById('cl').onclick=()=>sh.hidden=true;
  document.getElementById('sb2').onclick=sb;
}
function sb(){const u=T.questions.length-S.a.filter(x=>x!=null).length;if(confirm(`Submit karna hai? ${u} questions baaki hain.`))finish()}
document.addEventListener('keydown',e=>{
  if(!S||!document.getElementById('pv'))return;
  if(e.key==='ArrowRight')document.getElementById('nx').click();
  else if(e.key==='ArrowLeft')document.getElementById('pv').click();
  else if(/^[1-8]$/.test(e.key))document.querySelector(`.op[data-i="${e.key-1}"]`)?.click();
});
function finish(){
  clearInterval(tick);if(!S)return;
  if(ts)S.t[S.cur]=(S.t[S.cur]||0)+(Date.now()-ts)/1000;ts=0;
  const qs=T.questions,m=T.marks??1,ng=T.negative??0,tp={};let c=0,w=0,u=0;
  qs.forEach((q,i)=>{const t=q.topic||'General',a=S.a[i];tp[t]=tp[t]||{c:0,n:0};tp[t].n++;if(a==null)u++;else if(a===q.answer){c++;tp[t].c++}else w++});
  const R={id:S.id,title:T.title,n:qs.length,c,w,u,tp,a:Array.from(S.a,x=>x??null),score:+(c*m-w*ng).toFixed(2),max:qs.length*m,time:(Math.min(Date.now(),S.end)-S.start)/1000,at:Date.now()};
  ls.set('res:'+S.id,R);ls.del('st:'+S.id);S=null;result(R);
}
function txt(R){
  const bad=T.questions.map((q,i)=>i).filter(i=>R.a[i]!==T.questions[i].answer);
  return `Test: ${R.title}\nScore: ${R.score}/${R.max} | Sahi ${R.c}, Galat ${R.w}, Skip ${R.u} | Time ${fmt(R.time)}\n\nTopic-wise (sahi/total):\n${Object.entries(R.tp).map(([k,v])=>`${k}: ${v.c}/${v.n}`).join('\n')}\n\nGalat ya skip kiye gaye questions:\n\n`+bad.map(i=>{const q=T.questions[i];return `Q${i+1} [${q.topic||'General'}] ${q.q}\n`+q.options.map((o,k)=>`  ${L[k]}. ${o}`).join('\n')+`\n  Meri answer: ${R.a[i]==null?'skip kiya':L[R.a[i]]}\n  Sahi answer: ${L[q.answer]}${q.explanation?'\n  Explanation: '+q.explanation:''}`}).join('\n\n');
}
const rv=(q,i,a)=>`<article class="rv ${a==null?'sk':a===q.answer?'ok':'no'}"><p class=mu>Q${i+1}${q.topic?', '+esc(q.topic):''}</p><p class=qt>${esc(q.q)}</p>${q.options.map((o,k)=>`<p class="o${k===q.answer?' g':k===a?' r':''}">${L[k]}. ${esc(o)}${k===q.answer?' (sahi)':k===a?' (tumhara jawab)':''}</p>`).join('')}${a==null?'<p class=mu>Skip kiya</p>':''}${q.explanation?`<p class=ex>${esc(q.explanation)}</p>`:''}</article>`;
function result(R){
  const [sec,name]=R.id.split('/'),full=PROMPT+txt(R),pct=R.n?Math.round(R.c/R.n*100):0,Q=T.questions,$=id=>document.getElementById(id);
  const bad=Q.map((q,i)=>i).filter(i=>R.a[i]!==Q[i].answer);
  shell(`<h1>${esc(R.title)}</h1><div class=score><b>${R.score}</b><span class=mu>out of ${R.max}</span></div><div class=stats><p><b>${R.c}</b>sahi</p><p><b>${R.w}</b>galat</p><p><b>${R.u}</b>skip</p><p><b>${pct}%</b>accuracy</p><p><b>${fmt(R.time)}</b>time</p></div><h3>Topic-wise</h3>${Object.entries(R.tp).map(([k,v])=>`<div class=tb><span>${esc(k)}</span><i><u style="width:${v.c/v.n*100}%"></u></i><em>${v.c}/${v.n}</em></div>`).join('')}<div class="acts noprint"><button class=btn id=pdf>Report PDF</button><button class=ghost id=tx>AI file (.txt)</button><button class=ghost id=ai>AI se analysis</button><a class=ghost target=_blank rel=noopener href="${wa(R.title,link(sec,name))}">Test WhatsApp pe bhejo</a></div><div id=aip class="aip noprint" hidden><p>Prompt ke saath tumhare galat questions aur topic-wise score jaate hain.</p><div class=acts><button class=btn id=cp>Prompt copy karo</button><button class=ghost id=shr>Share karo</button><a class=ghost id=gp target=_blank rel=noopener href="https://chatgpt.com/">ChatGPT kholo</a><a class=ghost id=cl2 target=_blank rel=noopener href="https://claude.ai/new">Claude kholo</a></div><p class=mu>ChatGPT ya Claude kholte hi prompt copy ho jata hai, bas paste kar do.</p></div><div class="seg noprint"><button data-f=m>Galat aur skip (${bad.length})</button><button data-f=a>Saare questions</button></div><div id=rvs></div>`);
  const draw=()=>{document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.f===filt));$('rvs').innerHTML=(filt==='m'?bad:Q.map((_,i)=>i)).map(i=>rv(Q[i],i,R.a[i])).join('')||'<p class=mu>Koi galti nahi. Zabardast!</p>'};
  document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{filt=b.dataset.f;draw()});draw();
  $('pdf').onclick=()=>print();
  $('tx').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([full],{type:'text/plain'}));a.download=name+'-report.txt';a.click()};
  $('ai').onclick=()=>$('aip').hidden=!$('aip').hidden;
  $('cp').onclick=()=>copy(full);
  $('shr').onclick=()=>navigator.share?navigator.share({title:R.title,text:full}).catch(()=>{}):copy(full);
  $('gp').onclick=$('cl2').onclick=()=>copy(full);
}
addEventListener('hashchange',route);route();
