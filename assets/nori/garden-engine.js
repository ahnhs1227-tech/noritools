'use strict';
(function(root){
 const presets={phone:{name:'휴대폰 내려놓기',minutes:20,kind:'focus',pauseOnHide:true},study:{name:'공부·독서',minutes:25,kind:'focus'},work:{name:'업무·작업',minutes:50,kind:'focus'},quick:{name:'짧게 시작하기',minutes:5,kind:'focus'},timer:{name:'일반 타이머',minutes:5,kind:'timer'},stopwatch:{name:'스톱워치',kind:'stopwatch'},break:{name:'휴식',minutes:5,kind:'break'}};
 const keyOf=time=>{const d=new Date(time);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const elapsed=(r,now=Date.now())=>Math.max(0,r.elapsed+(r.status==='running'?Math.max(0,now-r.anchor):0));
 const remaining=(r,now=Date.now())=>Math.max(0,r.status==='running'?r.end-now:r.left);
 function create(preset,duration,now=Date.now(),id=String(now),goal=''){
  const p=presets[preset];if(!p)throw Error('모드를 다시 선택해 주세요.');
  if(p.kind!=='stopwatch'&&(!Number.isInteger(duration)||duration<1000||duration>86399000))throw Error('시간은 1초부터 23시간 59분 59초까지 설정해 주세요.');
  return {id,preset,kind:p.kind,duration:p.kind==='stopwatch'?0:duration,left:duration||0,end:now+(duration||0),elapsed:0,anchor:now,lastSeen:now,status:'running',goal:String(goal).slice(0,80),laps:[],confirmed:false};
 }
 function pause(r,now=Date.now(),reason='manual'){if(r.status!=='running')return r;return {...r,elapsed:elapsed(r,now),left:remaining(r,now),status:'paused',reason,lastSeen:now}}
 function resume(r,now=Date.now()){if(r.status!=='paused')return r;return {...r,status:'running',anchor:now,end:now+r.left,lastSeen:now,reason:''}}
 function finish(r,now=Date.now()){return r&&r.kind!=='stopwatch'&&r.status==='running'&&remaining(r,now)===0?{...r,status:'done',left:0,finishedAt:r.end}:r}
 function lap(r,now=Date.now()){if(r.kind!=='stopwatch'||r.status!=='running'||r.laps.length>=50)return r;return {...r,laps:[...r.laps,elapsed(r,now)]}}
 function award(s,now=Date.now()){const r=s.run;if(!r||r.kind!=='focus'||r.status!=='done'||r.confirmed)return s;const next={...s,run:{...r,confirmed:true,result:'earned'}};if(s.completed.includes(r.id))return next;const day=keyOf(r.finishedAt||now),old=s.daily[day]||{count:0,minutes:0};next.daily={...s.daily,[day]:{count:old.count+1,minutes:old.minutes+Math.round(r.duration/60000)}};next.total=s.total+1;next.completed=[...s.completed,r.id].slice(-100);return next}
 function fresh(){return {version:2,selected:'study',settings:{focus:25,break:5,timer:300,sound:true,volume:60,tone:'bell',voice:false,voiceURI:'',text:'시간이 다 됐어요. 하던 일을 마무리하고 잠시 쉬어가세요.',goal:'',keepAwake:false},run:null,daily:{},total:0,completed:[]}}
 function normalize(raw,now=Date.now()){
  if(!raw||typeof raw!=='object')return fresh();const s=fresh();s.settings={...s.settings,...(raw.settings||{})};s.selected=presets[raw.selected]&&raw.selected!=='break'?raw.selected:'study';s.total=Number.isSafeInteger(raw.total)&&raw.total>=0?raw.total:0;s.completed=Array.isArray(raw.completed)?raw.completed.filter(x=>typeof x==='string').slice(-100):[];
  const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-364);const min=keyOf(cutoff.getTime());s.daily=Object.fromEntries(Object.entries(raw.daily||{}).filter(([d,v])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=min&&v&&Number.isFinite(v.count)&&v.count>=0&&Number.isFinite(v.minutes)&&v.minutes>=0));
  for(const [k,def,max] of [['focus',25,120],['break',5,120],['timer',300,86399]])if(!Number.isInteger(s.settings[k])||s.settings[k]<1||s.settings[k]>max)s.settings[k]=def;
  s.settings.volume=Number.isFinite(s.settings.volume)?Math.min(100,Math.max(0,s.settings.volume)):60;s.settings.text=String(s.settings.text||'').slice(0,180);s.settings.goal=String(s.settings.goal||'').slice(0,80);s.settings.tone=['bell','beep'].includes(s.settings.tone)?s.settings.tone:'bell';s.settings.voiceURI=String(s.settings.voiceURI||'');
  let r=raw.run;
  if(r&&!r.kind&&['focus','break'].includes(r.mode)&&Number.isFinite(r.minutes))r={...r,preset:r.mode==='focus'?'study':'break',kind:r.mode,duration:r.minutes*60000,elapsed:0,anchor:now,lastSeen:now,goal:'',laps:[],confirmed:r.status==='done',finishedAt:r.end};
  if(r&&presets[r.preset]&&presets[r.preset].kind===r.kind&&['running','paused','done'].includes(r.status)&&typeof r.id==='string'&&['end','left','elapsed','anchor','duration'].every(k=>Number.isFinite(r[k]))&&r.left>=0&&r.duration>=0&&r.duration<=86399000){s.run={...r,laps:Array.isArray(r.laps)?r.laps.filter(n=>Number.isFinite(n)&&n>=0).slice(0,50):[],goal:String(r.goal||'').slice(0,80)};if(r.preset!=='break')s.selected=r.preset}
  return s;
 }
 function clock(ms,stopwatch=false){const seconds=stopwatch?Math.floor(ms/1000):Math.ceil(ms/1000),h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return (h||stopwatch?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+(stopwatch?'.'+Math.floor(ms%1000/100):'')}
 const api={presets,keyOf,elapsed,remaining,create,pause,resume,finish,lap,award,fresh,normalize,clock};if(typeof module!=='undefined')module.exports=api;else root.NoriGarden=api;
})(typeof window!=='undefined'?window:globalThis);
