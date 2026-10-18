import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {sanitizeSettings} from '../extension/core.js';
const source=await readFile(new URL('../extension/native-quality.js',import.meta.url),'utf8');
function fixture(){
 let now=10000,quality='large',offered=['hd2160','hd1080','hd720','large','auto'];const listeners={},calls=[],receipts=[];
 const player={classList:{contains:()=>false},getAvailableQualityLevels:()=>offered,getPlaybackQuality:()=>quality,getVideoData:()=>({video_id:new URL(context.location.href).searchParams.get('v')}),setPlaybackQualityRange:(...args)=>calls.push(args)};
 class Video {isConnected=true;readyState=4;videoHeight=480;closest(){return player;}dispatchEvent(e){receipts.push(JSON.parse(e.detail));}}
 const media=new Video();const context={URL,location:{href:'https://www.youtube.com/watch?v=abcdefghijk'},HTMLVideoElement:Video,Date:{now:()=>now},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o.detail;}},document:{addEventListener:(t,f)=>listeners[t]=f}};
 Object.defineProperty(context,'chrome',{get(){throw Error('No extension APIs');}});vm.runInNewContext(source,context);
 const send=(preference='highest',patch={})=>listeners['smarttube-quality-request-v1']({target:media,detail:JSON.stringify({version:1,id:'q1',videoId:new URL(context.location.href).searchParams.get('v'),preference,...patch})});
 return {send,player,media,context,calls,receipts,listeners,advance:ms=>now+=ms,offer:v=>offered=v,effective:(q,h)=>{quality=q;media.videoHeight=h;},manual:(trusted=true,type='pointerdown')=>listeners[type]({isTrusted:trusted,key:'Enter',target:{closest:()=>true}})};
}
test('quality defaults off and preserves only explicit supported preferences',()=>{
 assert.equal(sanitizeSettings().preferredQuality,'auto');for(const p of ['highest','1080','2160'])assert.equal(sanitizeSettings({preferredQuality:p}).preferredQuality,p);
 for(const p of [null,1080,'hd1080','99999',{},'__proto__'])assert.equal(sanitizeSettings({preferredQuality:p}).preferredQuality,'auto');
});
test('highest selects only offered level and confirms decoded dimensions plus effective API',()=>{
 const f=fixture();f.send();assert.deepEqual(f.calls,[['hd2160','hd2160']]);assert.equal(f.receipts.at(-1).result,'applying');
 f.effective('hd2160',1080);f.send();assert.notEqual(f.receipts.at(-1).result,'confirmed');
 f.effective('hd2160',2160);f.send();assert.equal(f.receipts.at(-1).result,'confirmed');f.advance(1000);f.effective('hd720',720);f.send();assert.equal(f.calls.length,1,'No continued enforcement after success');
});
test('fixed fallback chooses highest below target; unavailable never forces higher',()=>{
 const f=fixture();f.send('1440');assert.deepEqual(f.calls,[['hd1080','hd1080']]);const g=fixture();g.offer(['hd2160','hd1080','auto']);g.send('720');assert.equal(g.calls.length,0);assert.equal(g.receipts.at(-1).result,'unavailable');
});
test('Auto does nothing by default; releases owned selection once without overriding manual',()=>{
 const f=fixture();f.send('auto');assert.equal(f.calls.length,0);f.send();f.send('auto');f.send('auto');assert.deepEqual(f.calls,[['hd2160','hd2160'],['auto','auto']]);
 const g=fixture();g.send();g.manual();g.send('auto');assert.equal(g.calls.length,1);
});
test('trusted early native settings gestures win across initialization and preference edits',()=>{
 for(const type of ['pointerdown','keydown']){const f=fixture();f.manual(true,type);f.send();f.send('1080');assert.equal(f.calls.length,0);assert.equal(f.receipts.at(-1).result,'manual');}
 const f=fixture();f.manual(false);f.send();assert.equal(f.calls.length,1);
});
test('manual override cancels pending corrections; navigation restores bounded eligibility',()=>{
 const f=fixture();f.send();f.manual();f.advance(1100);f.send();assert.equal(f.calls.length,1);f.context.location.href='https://www.youtube.com/watch?v=lmnopqrstuv';f.send();assert.equal(f.calls.length,2);
});
test('attempts bounded even for throwing setters; startup deadline ends retries',()=>{
 const f=fixture();for(let i=0;i<20;i++){f.send();f.advance(500);}assert.equal(f.calls.length,4);assert.equal(f.receipts.at(-1).result,'unconfirmed');
 const g=fixture();let count=0;g.player.setPlaybackQualityRange=()=>{count++;throw Error('not ready');};for(let i=0;i<20;i++){g.send();g.advance(500);}assert.equal(count,4);
});
test('missing capability, ads, loading video, stale video and invalid messages cannot set quality',()=>{
 const f=fixture();delete f.player.setPlaybackQualityRange;f.send();assert.equal(f.receipts.at(-1).result,'unsupported');assert.equal(f.calls.length,0);
 for(const mode of ['ad','loading','stale']){const g=fixture();if(mode==='ad')g.player.classList.contains=k=>k==='ad-showing';if(mode==='loading')g.media.readyState=0;if(mode==='stale')g.player.getVideoData=()=>({video_id:'lmnopqrstuv'});g.send();assert.equal(g.calls.length,0);}
 const g=fixture();for(const patch of [{version:2},{id:'x'.repeat(81)},{videoId:'lmnopqrstuv'},{preference:'__proto__'},{operation:'reload'}])g.send('highest',patch);assert.equal(g.calls.length,0);g.media.isConnected=false;g.send();assert.equal(g.calls.length,0);
});

test('pending Auto release recovers from missing API, stale identity and throwing setter',()=>{
 for(const fault of ['missing','stale','throw']){
  const f=fixture();f.send('1080');f.effective('hd1080',1080);f.send('1080');
  const setter=f.player.setPlaybackQualityRange,identity=f.player.getVideoData;
  if(fault==='missing')delete f.player.setPlaybackQualityRange;
  if(fault==='stale')f.player.getVideoData=()=>({video_id:'lmnopqrstuv'});
  if(fault==='throw')f.player.setPlaybackQualityRange=(...args)=>{f.calls.push(args);throw Error('temporary release error');};
  f.send('auto');assert.equal(f.receipts.at(-1).result,'releasing');
  f.player.setPlaybackQualityRange=setter;f.player.getVideoData=identity;f.advance(1100);f.send('auto');
  assert.equal(f.receipts.at(-1).result,'off');assert.deepEqual(f.calls.at(-1),['auto','auto']);assert.equal(f.receipts.at(-1).selected,null);
  const count=f.calls.length;for(let i=0;i<10;i++){f.advance(500);f.send('auto');}assert.equal(f.calls.length,count,'Successful release occurs once');
 }
});

test('Auto release has independent four-call and eight-second bounds; same Auto cannot renew them',()=>{
 const f=fixture();f.send();let attempts=0;f.player.setPlaybackQualityRange=()=>{attempts++;throw Error('release failure');};
 for(let i=0;i<24;i++){f.send('auto');f.advance(500);}assert.equal(attempts,4);assert.equal(f.receipts.at(-1).result,'release-failed');
 f.player.setPlaybackQualityRange=()=>attempts++;f.send('auto');assert.equal(attempts,4);assert.equal(f.receipts.at(-1).result,'release-failed');
 const g=fixture();g.send();const setter=g.player.setPlaybackQualityRange;delete g.player.setPlaybackQualityRange;g.send('auto');g.advance(8100);g.player.setPlaybackQualityRange=setter;g.send('auto');assert.equal(g.calls.length,1);assert.equal(g.receipts.at(-1).result,'release-failed');
});

test('native manual intervention cancels pending release, including after a throwing call',()=>{
 for(const fault of ['missing','throw'])for(const type of ['pointerdown','keydown']){
  const f=fixture();f.send();const setter=f.player.setPlaybackQualityRange;
  f.player.setPlaybackQualityRange=fault==='missing'?undefined:()=>{throw Error('temporary');};f.send('auto');assert.equal(f.receipts.at(-1).result,'releasing');
  f.manual(true,type);f.player.setPlaybackQualityRange=setter;f.advance(1100);f.send('auto');f.send('highest');assert.equal(f.calls.length,1);assert.equal(f.receipts.at(-1).result,'manual');
 }
});
