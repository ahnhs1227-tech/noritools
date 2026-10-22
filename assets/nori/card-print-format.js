'use strict';
window.NoriCardPrint=(()=>{
 const dpi=300,bleed=1;
 function size(value){const [width,height]=value==='86x52'?[86,52]:[90,50],outputWidth=width+2*bleed,outputHeight=height+2*bleed;return {width,height,bleed,outputWidth,outputHeight,pixelWidth:Math.round(outputWidth/25.4*dpi),pixelHeight:Math.round(outputHeight/25.4*dpi),dpi}}
 function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
 async function density(blob){const input=new Uint8Array(await blob.arrayBuffer());if(input.length<33||input[0]!==137||input[1]!==80||input[2]!==78||input[3]!==71)throw Error('PNG 파일을 확인할 수 없어요.');const chunk=new Uint8Array(21),view=new DataView(chunk.buffer);view.setUint32(0,9);chunk.set([112,72,89,115],4);view.setUint32(8,Math.round(dpi/0.0254));view.setUint32(12,Math.round(dpi/0.0254));chunk[16]=1;view.setUint32(17,crc32(chunk.subarray(4,17)));const parts=[input.subarray(0,8)];let offset=8,inserted=false;while(offset<input.length){if(offset+12>input.length)throw Error('PNG 파일이 완전하지 않아요.');const length=new DataView(input.buffer,input.byteOffset+offset,4).getUint32(0),end=offset+length+12;if(end>input.length)throw Error('PNG 파일이 완전하지 않아요.');const type=String.fromCharCode(...input.subarray(offset+4,offset+8));if(type!=='pHYs')parts.push(input.subarray(offset,end));if(type==='IHDR'){parts.push(chunk);inserted=true}offset=end;}if(!inserted)throw Error('PNG 크기 정보를 찾지 못했어요.');return new Blob(parts,{type:'image/png'})}
 return {size,density};
})();
