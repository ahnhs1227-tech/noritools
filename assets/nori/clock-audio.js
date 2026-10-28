'use strict';
(()=>{let context=null,queue=[],playing=false,generation=0,handles=[],nodes=[];const status=document.getElementById('audio-status'),stop=document.getElementById('audio-stop');
 let statusParts=[];const T=t=>window.NoriI18n?window.NoriI18n.t(t):t;function say(title,message){statusParts=[title,message];status.setAttribute?.('translate','no');status.textContent=(title?title+' · ':'')+T(message)};document.addEventListener?.('nori:languagechange',()=>{if(statusParts.length)say(...statusParts)});
 const language=()=>window.NoriI18n?.locale||'ko';
 const localVoices=()=>('speechSynthesis'in window?speechSynthesis.getVoices():[]).filter(v=>v.localService).sort((a,b)=>Number(b.lang.toLowerCase().startsWith(language().slice(0,2)))-Number(a.lang.toLowerCase().startsWith(language().slice(0,2))));
 async function ready(){try{context=context||new(window.AudioContext||window.webkitAudioContext)();await context.resume();return context.state==='running'}catch{return false}}
 function cleanup(){handles.forEach(clearTimeout);handles=[];nodes.forEach(n=>{try{n.stop()}catch{}});nodes=[]}
 function cancel(){generation++;queue=[];playing=false;cleanup();if('speechSynthesis'in window)speechSynthesis.cancel();stop.hidden=true;say('','알림 재생을 멈췄어요. 완료된 알림은 각 카드에서 다시 들을 수 있어요.')}
 function play(){if(playing||!queue.length){if(!playing)stop.hidden=true;return}playing=true;const job=queue.shift(),g=++generation;stop.hidden=false;say(job.title,'완료 알림'+(queue.length?' (다음 '+queue.length+'개 대기)':''));let done=false;
 const finish=()=>{if(done||g!==generation)return;done=true;cleanup();playing=false;say(job.title,'알림을 마쳤어요.');play()};
 if(job.sound&&context?.state==='running'){const notes=job.tone==='beep'?[880,880,880]:[659,784,988];notes.forEach((f,i)=>{const o=context.createOscillator(),gain=context.createGain(),t=context.currentTime+i*.2;o.type=job.tone==='beep'?'sine':'triangle';o.frequency.value=f;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.18*(job.volume/100),t+.02);gain.gain.exponentialRampToValueAtTime(.0001,t+.35);o.connect(gain).connect(context.destination);o.onended=()=>{o.disconnect();gain.disconnect()};o.start(t);o.stop(t+.37);nodes.push(o)})}else if(job.sound){say(job.title,'소리 재생이 제한됐어요. 미리 듣기를 눌러 소리를 활성화해 주세요.')}
 const voices=localVoices(),voice=voices.find(v=>v.voiceURI===job.voiceURI)||voices[0];
 if(job.voice&&voice&&job.text.trim()){handles.push(setTimeout(()=>{if(g!==generation)return;try{const u=new SpeechSynthesisUtterance(job.text.slice(0,180));u.voice=voice;u.lang=voice.lang;u.volume=job.volume/100;u.onend=finish;u.onerror=()=>{say(job.title,'음성을 재생하지 못했어요.');finish()};speechSynthesis.speak(u);handles.push(setTimeout(()=>{if(g===generation){speechSynthesis.cancel();finish()}},120000))}catch{finish()}},job.sound?850:0))}else handles.push(setTimeout(finish,job.sound?1700:300));
 }
 function add(job){queue.push({title:'알림',text:'시간이 다 됐어요.',sound:true,voice:false,tone:'bell',volume:60,voiceURI:'',...job});play()}
 stop.onclick=cancel;window.NoriAudio={ready,add,cancel,localVoices};
})();
