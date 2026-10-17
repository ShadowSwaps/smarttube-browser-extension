// Original geometric icon, generated locally with Node standard-library code.
import {deflateSync} from 'node:zlib';
import {mkdir,writeFile} from 'node:fs/promises';
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
function chunk(name,data){const type=Buffer.from(name);const length=Buffer.alloc(4);length.writeUInt32BE(data.length);const checksum=Buffer.alloc(4);checksum.writeUInt32BE(crc32(Buffer.concat([type,data])));return Buffer.concat([length,type,data,checksum]);}
await mkdir('extension/icons',{recursive:true});
for(const size of [16,32,48,128]){
  const rows=Buffer.alloc((size*4+1)*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const nx=(x+.5)/size,ny=(y+.5)/size;
    const radius=.18,cx=Math.max(radius,Math.min(1-radius,nx)),cy=Math.max(radius,Math.min(1-radius,ny));
    const inside=(nx-cx)**2+(ny-cy)**2 <= radius**2;
    const triangle=nx>=.35&&nx<=.73&&Math.abs(ny-.5)<(.73-nx)*.66;
    const offset=y*(size*4+1)+1+x*4;
    rows.set(triangle?[20,43,38,255]:[134,226,198,inside?255:0],offset);
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  await writeFile(`extension/icons/icon-${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]));
}
