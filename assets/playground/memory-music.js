/* Original quiet album lullaby synthesized locally; no audio files or services. */
'use strict';
(()=>{
const P=NoriPlay,button=P.$('game-music');let enabled=P.read('nori-memory-music',true)!==false,active=false,context,bus,timer=null,next=0,index=0,voices=new Set();
const step=60/72/2;
// Eight original 4/4 bars in D major: soft, spaced notes over slow sustained harmony.
// Unlike the runner's pluck loop and the orchard's brisk waltz, this leaves room to think.
const melody=[78,-1,81,83,-1,81,76,-1, 74,-1,78,-1,76,74,-1,-1, 79,-1,83,86,-1,83,81,-1, 76,-1,81,-1,78,76,-1,-1, 78,81,-1,85,83,-1,81,-1, 79,-1,78,76,74,-1,76,-1, 78,-1,81,83,81,-1,76,-1, 74,-1,-1,78,76,-1,74,-1];
const roots=[50,47,43,45,50,43,45,50];
function ui(){button.textContent=enabled?'음악 켜짐':'음악 꺼짐';button.setAttribute('aria-pressed',String(enabled))}
function tone(note,at,duration,volume,type='sine',attack=.012){
 const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.value=440*Math.pow(2,(note-69)/12);
 gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+attack);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 osc.connect(gain);gain.connect(bus);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};osc.start(at);osc.stop(at+duration+.02);
}
function schedule(){if(!active||!enabled||context.state!=='running')return;if(next<context.currentTime-.2)next=context.currentTime+.03;
 while(next<context.currentTime+.15){
 const n=melody[index%64],root=roots[Math.floor(index/8)%8];
 if(n>=0){tone(n,next,.65,.10,'triangle',.025);tone(n+12,next,.45,.012,'sine',.02)}
 if(index%8===0){tone(root,next,1.7,.045,'sine',.12);tone(root+7,next,1.6,.022,'sine',.16)}
 if(index%8===4)tone(root+12,next,1.05,.035,'sine',.08);
 next+=step;index++;
 }
}
async function play(){active=true;if(!enabled)return;try{
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('unsupported');
 if(!context){context=new Audio();bus=context.createGain();bus.gain.value=.23;bus.connect(context.destination)}
 await context.resume();if(!active||!enabled)return;if(timer!==null)return;next=context.currentTime+.035;schedule();timer=setInterval(schedule,100);
 }catch{enabled=false;ui();P.$('game-status').textContent='음악을 재생하지 못했어요. 음악 버튼을 다시 눌러주세요.'}}
function stop(){active=false;if(timer!==null){clearInterval(timer);timer=null}for(const o of voices){try{o.stop()}catch{}}voices.clear();if(context?.state==='running')context.suspend().catch(()=>{})}
button.onclick=()=>{enabled=!enabled;P.save('nori-memory-music',enabled);ui();if(!enabled)stop();else if(button.dataset.playing==='true')play()};
window.addEventListener('pagehide',stop);
P.memoryMusic={start(){index=0;button.dataset.playing='true';play()},pause(){button.dataset.playing='false';stop()},resume(){button.dataset.playing='true';play()},stop(){button.dataset.playing='false';stop()}};ui();
})();
