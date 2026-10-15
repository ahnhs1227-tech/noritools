/* NORI background removal. U2NETP inference runs only in this browser worker. */
'use strict';
const ENGINE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
const MODEL_HASH = '309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8';
let session, sessionMode;
const report = (text, value) => postMessage({type:'progress', text, value});
async function modelBytes(mode) {
  const url = mode==='quality' ? 'https://huggingface.co/Heliosoph/u2net-onnx/resolve/7fc34deee10329bc039c10a73b98090d0c6f5c59/u2net.onnx' : new URL('u2netp.onnx', self.location.href).href;
  const expectedHash = mode==='quality' ? '8d10d2f3bb75ae3b6d527c77944fc5e7dcd94b29809d47a739a7a728a912b491' : MODEL_HASH;
  let cache;
  try { cache = await caches.open('nori-u2netp-v1'); const cached = await cache.match(url); if(cached) return await cached.arrayBuffer(); } catch {}
  const response = await fetch(url, {signal:AbortSignal.timeout(90000)});
  if(!response.ok) throw new Error('모델을 내려받지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.');
  const reader = response.body.getReader(), chunks = [];
  const total = Number(response.headers.get('content-length')) || (mode==='quality'?175997641:4574861);
  let received = 0;
  while(true) { const {done,value} = await reader.read(); if(done) break; chunks.push(value); received+=value.length; report(`처리 모델을 받는 중이에요 · ${(received/1e6).toFixed(1)} MB`, Math.min(100,received/total*100)); }
  const bytes = new Uint8Array(received); let offset=0;
  for(const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.length; }
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  if(Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('') !== expectedHash) throw new Error('모델 파일이 온전하지 않아요. 다시 시도해 주세요.');
  try { if(cache) await cache.put(url,new Response(bytes)); } catch {}
  return bytes.buffer;
}
self.onmessage = async ({data}) => {
  if(data.type !== 'remove') return;
  try {
    if(session && sessionMode!==data.mode){await session.release();session=null;}
    if(!session) {
      report('처리 엔진을 준비하고 있어요. 첫 사용에는 조금 더 걸릴 수 있어요.');
      if(!self.ort) importScripts(ENGINE+'ort.min.js');
      ort.env.wasm.wasmPaths = ENGINE;
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.proxy = false;
      const bytes = await modelBytes(data.mode);
      report('모델을 준비하고 있어요.');
      session = await ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
      sessionMode=data.mode;
    }
    report('주요 피사체를 찾고 배경을 지우고 있어요.');
    const tensor = new ort.Tensor('float32',data.input,[1,3,320,320]);
    let outputs;
    try {
      outputs = await session.run({[session.inputNames[0]]:tensor});
      const values=outputs[session.outputNames[0]].data;
      let min=Infinity,max=-Infinity;
      for(let i=0;i<320*320;i++){min=Math.min(min,values[i]);max=Math.max(max,values[i]);}
      if(!Number.isFinite(min)||max-min<1e-6) throw new Error('피사체를 구분하기 어려워요. 배경과 피사체가 더 뚜렷한 이미지를 골라주세요.');
      const mask=new Uint8ClampedArray(320*320);
      for(let i=0;i<mask.length;i++)mask[i]=Math.round(Math.max(0,Math.min(1,(values[i]-min)/(max-min)))*255);
      postMessage({type:'done',mask},[mask.buffer]);
    } finally { tensor.dispose(); if(outputs) Object.values(outputs).forEach(t=>t.dispose()); }
  } catch(e) { postMessage({type:'error',message:typeof e.message==='string' && /[가-힣]/.test(e.message)?e.message:'처리를 마치지 못했어요. 인터넷 연결과 기기의 여유 메모리를 확인하고 다시 시도해 주세요.'}); }
};
