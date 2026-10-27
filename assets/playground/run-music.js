/* Original bell-and-pluck game loop synthesized locally; no audio files or services. */
'use strict';
(()=>{
const P=NoriPlay,button=P.$('game-music');let enabled=P.read('nori-run-music',true)!==false,active=false,context,bus,timer=null,next=0,index=0,voices=new Set();
const step=60/92/2;
// An original 8-bar phrase, in MIDI pitches; -1 is a rest.
const melody=[72,76,79,-1,76,74,72,-1, 74,77,81,-1,79,77,74,-1, 76,79,83,81,79,-1,76,74, 72,-1,67,72,76,-1,74,-1, 69,72,76,-1,79,76,72,-1, 71,74,77,-1,76,74,71,-1, 72,76,79,84,83,79,76,74, 72,-1,76,74,72,-1,-1,-1];
const roots=[48,50,52,48,45,47,48,48];
function ui(){button.textContent=enabled?'음악 켜짐':'음악 꺼짐';button.setAttribute('aria-pressed',String(enabled))}
function tone(note,at,duration,volume,type='sine'){
 const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.value=440*Math.pow(2,(note-69)/12);
 gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 osc.connect(gain);gain.connect(bus);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};osc.start(at);osc.stop(at+duration+.02);
}
function schedule(){if(!active||!enabled||context.state!=='running')return;if(next<context.currentTime-.2)next=context.currentTime+.03;
 while(next<context.currentTime+.15){const n=melody[index%64];if(n>=0){tone(n,next,.32,.18);tone(n+12,next,.16,.025)}
 if(index%4===0)tone(roots[Math.floor(index/8)%8],next,.48,.12,'triangle');
 if(index%4===2)tone(roots[Math.floor(index/8)%8]+7,next,.22,.06,'triangle');
 next+=step;index++;
 }
}
async function play(){active=true;if(!enabled)return;try{
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('unsupported');
 if(!context){context=new Audio();bus=context.createGain();bus.gain.value=.23;bus.connect(context.destination)}
 await context.resume();if(!active||!enabled)return;if(timer!==null)return;next=context.currentTime+.035;schedule();timer=setInterval(schedule,100);
 }catch{enabled=false;ui();P.$('game-status').textContent='음악을 재생하지 못했어요. 음악 버튼을 다시 눌러주세요.'}}
function stop(){active=false;if(timer!==null){clearInterval(timer);timer=null}for(const o of voices){try{o.stop()}catch{}}voices.clear();if(context?.state==='running')context.suspend().catch(()=>{})}
button.onclick=()=>{enabled=!enabled;P.save('nori-run-music',enabled);ui();if(!enabled)stop();else if(button.dataset.playing==='true')play()};
window.addEventListener('pagehide',stop);
P.runMusic={start(){index=0;button.dataset.playing='true';play()},pause(){button.dataset.playing='false';stop()},resume(){button.dataset.playing='true';play()},stop(){button.dataset.playing='false';stop()}};ui();
})();
