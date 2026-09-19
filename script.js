/* ===== إعدادات: عدّل هون ===== */
const CONFIG={
  name:'أحمد عمر',          // ← اكتب الاسم
  sub:'كل عام وإنت أحلى وأغلى إشي',
  audioSpeed:1.1,
  videoVolume:.12,             // صوت الفيديو الأصلي (0 - 1)              // سرعة الصوت (1 = عادي، 1.1 = أسرع شوي)
  endTitle:'كل عام وإنت بخير',
  endText:'الله يخليك إلنا، ويجعل سنتك الجاية كلها فرح وإنجازات. حبينا نفاجئك لأنك تستاهل كل خير.'
};
/* ================================ */
const $=s=>document.querySelector(s);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------- Audio (synth effects) ---------- */
let ac,master,muted=false;
function A(){if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.8;master.connect(ac.destination)}ac.state==='suspended'&&ac.resume();return ac}
function tone(f,d=.3,type='sine',v=.25,t=0,f2,out){const c=A(),o=c.createOscillator(),g=c.createGain(),s=c.currentTime+t;
  o.type=type;o.frequency.setValueAtTime(f,s);f2&&o.frequency.exponentialRampToValueAtTime(f2,s+d);
  g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+d);
  o.connect(g).connect(out||master);o.start(s);o.stop(s+d+.05)}
function noise(d=.4,v=.3,hp=800,t=0){const c=A(),n=c.sampleRate*d,b=c.createBuffer(1,n,c.sampleRate),x=b.getChannelData(0);
  for(let i=0;i<n;i++)x[i]=(Math.random()*2-1)*(1-i/n);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='highpass';f.frequency.value=hp;g.gain.value=v;
  s.connect(f).connect(g).connect(master);s.start(c.currentTime+t)}
const sfx={
  tick:()=>{tone(880,.12,'square',.12);},
  pop:()=>{noise(.25,.5,1200);tone(400,.15,'sine',.4,0,90)},
  whoosh:()=>{noise(.5,.25,300)},
  chime:()=>[784,988,1175,1568].forEach((f,i)=>tone(f,.9,'triangle',.18,i*.09)),
  boom:()=>{tone(120,.6,'sine',.5,0,35);noise(.5,.35,200)},
  crackle:()=>{for(let i=0;i<6;i++)noise(.06,.2,3000,i*.05+Math.random()*.05)},
  whistle:()=>tone(500,.7,'sine',.1,0,1800)
};
let music,loopT;
function melody(){ // Happy Birthday (music box)
  music=music||(()=>{const g=A().createGain();g.gain.value=.45;g.connect(master);return g})();
  const N={G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784};
  const s=[['G4',.5],['G4',.25],['A4',1],['G4',1],['C5',1],['B4',2],['G4',.5],['G4',.25],['A4',1],['G4',1],['D5',1],['C5',2],
   ['G4',.5],['G4',.25],['G5',1],['E5',1],['C5',1],['B4',1],['A4',1.5],['F5',.5],['F5',.25],['E5',1],['C5',1],['D5',1],['C5',2.5]];
  let t=0;s.forEach(([n,d])=>{tone(N[n],1.1,'triangle',.16,t,0,music);tone(N[n]*2,.6,'sine',.05,t,0,music);t+=d*.42});
}
$('#mute').onclick=e=>{muted=!muted;master&&(master.gain.value=muted?0:.8);$('#msg').muted=muted;$('#song').muted=muted;$('#vid').muted=muted;e.target.textContent=muted?'🔇':'🔊'};

/* ---------- Scenes ---------- */
function show(id){document.querySelectorAll('.scene').forEach(s=>s.classList.toggle('on',s.id===id))}

/* ---------- Canvas: stars + particles ---------- */
const bg=$('#bg'),fx=$('#fx'),bx=bg.getContext('2d'),fc=fx.getContext('2d');
let W,H,stars=[],parts=[],rockets=[],fireworks=false;
function size(){const d=devicePixelRatio||1;W=innerWidth;H=innerHeight;[bg,fx].forEach(c=>{c.width=W*d;c.height=H*d});bx.setTransform(d,0,0,d,0,0);fc.setTransform(d,0,0,d,0,0);
  stars=Array.from({length:Math.min(140,W/8)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3,p:Math.random()*6}))}
addEventListener('resize',size);size();
const COL=['#ffb703','#ff5d8f','#7ae7c7','#fff6e5','#8ecae6','#c77dff'];
function confetti(n=160,x=W/2,y=H*.55){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=Math.random()*14+4;
  parts.push({k:'c',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-8,w:Math.random()*9+5,h:Math.random()*5+3,r:Math.random()*6,vr:Math.random()*.4-.2,c:COL[i%COL.length],l:1})}}
function burst(x,y){const c=COL[Math.random()*COL.length|0];sfx.boom();sfx.crackle();
  for(let i=0;i<90;i++){const a=Math.random()*Math.PI*2,v=Math.random()*6+1;parts.push({k:'f',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c,l:1})}}
function frame(t){
  bx.clearRect(0,0,W,H);stars.forEach(s=>{bx.globalAlpha=.4+.6*Math.abs(Math.sin(t/900+s.p));bx.fillStyle='#fff';bx.beginPath();bx.arc(s.x,s.y,s.r,0,7);bx.fill()});
  fc.clearRect(0,0,W,H);
  if(fireworks&&Math.random()<.035){sfx.whistle();rockets.push({x:Math.random()*W*.8+W*.1,y:H,ty:Math.random()*H*.4+H*.1})}
  rockets=rockets.filter(r=>{r.y-=9;fc.fillStyle='#fff';fc.fillRect(r.x,r.y,2,8);if(r.y<=r.ty){burst(r.x,r.y);return false}return true});
  parts=parts.filter(p=>{p.x+=p.vx;p.y+=p.vy;
    if(p.k==='c'){p.vy+=.35;p.vx*=.98;p.r+=p.vr;p.l-=.006;fc.save();fc.translate(p.x,p.y);fc.rotate(p.r);fc.globalAlpha=Math.max(p.l,0);fc.fillStyle=p.c;fc.fillRect(-p.w/2,-p.h/2,p.w,p.h);fc.restore()}
    else{p.vy+=.06;p.vx*=.985;p.l-=.013;fc.globalAlpha=Math.max(p.l,0);fc.fillStyle=p.c;fc.beginPath();fc.arc(p.x,p.y,2.2,0,7);fc.fill()}
    return p.l>0&&p.y<H+40});
  fc.globalAlpha=1;requestAnimationFrame(frame)}
requestAnimationFrame(frame);

/* ---------- Flow ---------- */
$('#start').onclick=async()=>{A();try{navigator.audioSession.type='playback'}catch(e){}routeVideo();
  [msg,song,vid].forEach(m=>{const was=m.muted;m.muted=true;m.play().then(()=>{m.pause();m.currentTime=0;m.muted=was}).catch(()=>{m.muted=was})});$('#mute').hidden=false;sfx.chime();show('count');
  for(const n of [3,2,1]){const el=$('#num');el.textContent=n;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');sfx.tick();await wait(600)}
  hero()};

function hero(){
  show('hero');sfx.pop();sfx.chime();confetti(220);setTimeout(()=>confetti(120,W*.2,H*.6),350);setTimeout(()=>confetti(120,W*.8,H*.6),500);
  const n=$('#name');n.innerHTML='';n.setAttribute('aria-label',CONFIG.name);
  CONFIG.name.split(' ').forEach((w,i)=>{const s=document.createElement('span');s.textContent=w;s.style.animationDelay=(.4+i*.35)+'s';n.appendChild(s);setTimeout(()=>{sfx.pop();confetti(90,W/2,H*.5)},400+i*350)});
  $('#sub').textContent=CONFIG.sub;$('#hero').classList.add('go');
  const bl=$('#balloons');bl.innerHTML='';
  for(let i=0;i<14;i++){const b=document.createElement('i');b.className='b';b.style.cssText=`left:${Math.random()*95}%;background:${COL[i%COL.length]};--dx:${Math.random()*120-60}px;--rot:${Math.random()*30-15}deg;animation-duration:${7+Math.random()*7}s;animation-delay:${Math.random()*5}s;opacity:.85`;bl.appendChild(b)}
  startMusic();
  setTimeout(()=>$('#sub').classList.add('on'),1000);
  setTimeout(gallery,4500);
}

/* background music: optional assets/song.mp3, otherwise synth Happy Birthday loop */
const song=$('#song'),msg=$('#msg');let songFailed=false;
song.addEventListener('error',()=>songFailed=true);song.volume=.5;
function startMusic(){
  if(!songFailed){song.play().catch(()=>{songFailed=true;synthLoop()})}else synthLoop()}
function synthLoop(){clearInterval(loopT);melody();loopT=setInterval(melody,11600)}
function duck(on){song.volume=on?.18:.5;if(music)music.gain.linearRampToValueAtTime(on?.15:.45,ac.currentTime+.8)}

/* video scene: video loops (muted) until the voice message ends */
const wave=$('#wave'),vid=$('#vid');let waveT;
for(let i=0;i<32;i++)wave.appendChild(document.createElement('i'));
function animateWave(on){clearInterval(waveT);const b=[...wave.children];
  if(!on){b.forEach(x=>x.style.height='8px');return}
  waveT=setInterval(()=>b.forEach((x,i)=>x.style.height=(8+Math.abs(Math.sin(Date.now()/180+i*.5))*Math.random()*46)+'px'),120)}
let started=false,vidGain;
function routeVideo(){ // volume control that also works on iPhone (only on http/https)
  if(vidGain||!/^https?:/.test(location.protocol))return;
  try{const c=A(),s=c.createMediaElementSource(vid);vidGain=c.createGain();vidGain.gain.value=CONFIG.videoVolume;s.connect(vidGain).connect(master)}catch(e){vidGain=null}}
function gallery(){
  show('gallery');$('#prog').style.width='0';started=false;
  msg.playbackRate=CONFIG.audioSpeed;msg.preservesPitch=true;
  vid.muted=false;if(!vidGain)vid.volume=CONFIG.videoVolume;vid.loop=true;vid.currentTime=0;
  const tp=$('#tapPlay');
  const go=()=>{tp.hidden=true;A();
    msg.currentTime=0;msg.play().then(()=>{duck(true);animateWave(true)}).catch(()=>{tp.hidden=false});
    vid.play().catch(()=>{vid.muted=true;vid.play().catch(()=>{})})};
  tp.onclick=go;
  setTimeout(()=>{go();setTimeout(()=>{if(!started)tp.hidden=false},1500)},900);
}
msg.addEventListener('playing',()=>{started=true;$('#tapPlay').hidden=true});
[[msg,'assets/voice.mp3'],[vid,'assets/video.mp4']].forEach(([el,p])=>el.addEventListener('error',()=>{$('#dbg').textContent='مشكلة بالملف: '+p}));
msg.addEventListener('timeupdate',()=>{if(msg.duration)$('#prog').style.width=(msg.currentTime/msg.duration*100)+'%'});
msg.onended=()=>{vid.pause();animateWave(false);duck(false);setTimeout(finale,1200)};

function finale(){
  show('end');$('#endTitle').textContent=CONFIG.endTitle;$('#endText').textContent=CONFIG.endText;
  sfx.chime();confetti(200);fireworks=true}
$('#replay').onclick=()=>{fireworks=false;rockets=[];clearInterval(loopT);song.pause();song.currentTime=0;msg.pause();vid.pause();$('#hero').classList.remove('go');$('#sub').classList.remove('on');$('#start').click()};
