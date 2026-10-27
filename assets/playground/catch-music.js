/* Original orchard waltz synthesized locally; no audio files or services. */
'use strict';
(()=>{
const P=NoriPlay,button=P.$('game-music');let enabled=P.read('nori-catch-music',true)!==false,active=false,context,bus,timer=null,next=0,index=0,voices=new Set();
const step=60/112/2;
// A distinct eight-bar, 3/4 F-major music-box waltz; six eighth notes per bar.
const melody=[77,81,84,81,79,-1, 79,82,86,84,82,79, 81,84,89,88,84,-1, 79,76,72,76,79,-1, 77,81,84,86,84,81, 82,86,89,86,84,-1, 79,84,88,86,84,79, 81,79,77,-1,72,-1];
const roots=[53,55,57,48,53,58,48,53];
function ui(){button.textContent=enabled?'음악 켜짐':'음악 꺼짐';button.setAttribute('aria-pressed',String(enabled))}
function tone(note,at,duration,volume,type='sine'){
 const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.value=440*Math.pow(2,(note-69)/12);
 gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 osc.connect(gain);gain.connect(bus);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};osc.start(at);osc.stop(at+duration+.02);
}
function schedule(){if(!active||!enabled||context.state!=='running')return;if(next<context.currentTime-.2)next=context.currentTime+.03;
 while(next<context.currentTime+.15){const n=melody[index%48];if(n>=0){tone(n,next,.24,.16);tone(n+12,next,.1,.02)}
 if(index%6===0)tone(roots[Math.floor(index/6)%8],next,.35,.11,'triangle');
 if(index%6===2||index%6===4){tone(roots[Math.floor(index/6)%8]+12,next,.13,.045,'triangle');tone(roots[Math.floor(index/6)%8]+19,next,.12,.025)}
 next+=step;index++;
 }
}
async function play(){active=true;if(!enabled)return;try{
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('unsupported');
 if(!context){context=new Audio();bus=context.createGain();bus.gain.value=.23;bus.connect(context.destination)}
 await context.resume();if(!active||!enabled)return;if(timer!==null)return;next=context.currentTime+.035;schedule();timer=setInterval(schedule,100);
 }catch{enabled=false;ui();P.$('game-status').textContent='음악을 재생하지 못했어요. 음악 버튼을 다시 눌러주세요.'}}
function stop(){active=false;if(timer!==null){clearInterval(timer);timer=null}for(const o of voices){try{o.stop()}catch{}}voices.clear();if(context?.state==='running')context.suspend().catch(()=>{})}
button.onclick=()=>{enabled=!enabled;P.save('nori-catch-music',enabled);ui();if(!enabled)stop();else if(button.dataset.playing==='true')play()};
window.addEventListener('pagehide',stop);
P.catchMusic={start(){index=0;button.dataset.playing='true';play()},pause(){button.dataset.playing='false';stop()},resume(){button.dataset.playing='true';play()},stop(){button.dataset.playing='false';stop()}};ui();
})();
