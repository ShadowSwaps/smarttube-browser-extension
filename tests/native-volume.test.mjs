import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../extension/native-volume.js',import.meta.url),'utf8');
function fixture() {
  const listeners=new Map();let native=5,muted=true,platformMuted=true,sets=0,rate=1,rateSets=0;
  const receipts=[];
  const player={setVolume(n){sets++;native=n;media.volume=n/100;},getVolume:()=>native,isMuted:()=>muted,mute(){muted=true;media.muted=true;},unMute(){muted=false;media.muted=false;},getAvailablePlaybackRates:()=>[.25,.5,1,1.5,2],setPlaybackRate(n){rateSets++;rate=n;media.playbackRate=n;},getPlaybackRate:()=>rate};
  class Media {volume=.05;playbackRate=1;get muted(){return platformMuted;}set muted(value){platformMuted=Boolean(value);}currentSrc='blob:fixture';isConnected=true;closest(){return player;}dispatchEvent(e){receipts.push(JSON.parse(e.detail));}}
  const media=new Media();
  const context={location:{href:'https://www.youtube.com/watch?v=abcdefghijk'},URL,HTMLVideoElement:Media,HTMLMediaElement:Media,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},document:{addEventListener(type,fn){assert(['smarttube-volume-request-v1','smarttube-speed-request-v1'].includes(type));listeners.set(type,fn);}}};
  Object.defineProperty(context,'chrome',{get(){throw new Error('Adapter must never access extension APIs');}});
  vm.runInNewContext(source,context);
  const request=patch=>({version:1,id:'request-1',percent:4,unmute:false,videoId:'abcdefghijk',source:media.currentSrc,...patch});
  const listener=listeners.get('smarttube-volume-request-v1');
  const send=(patch={},target=media)=>listener({target,detail:JSON.stringify(request(patch))});
  const speed=(patch={},target=media)=>listeners.get('smarttube-speed-request-v1')({target,detail:JSON.stringify({version:1,id:'rate-1',rate:1.55,videoId:'abcdefghijk',source:media.currentSrc,...patch})});
  return {send,speed,request,raw:detail=>listener({target:media,detail}),rawSpeed:detail=>listeners.get('smarttube-speed-request-v1')({target:media,detail}),media,player,receipts,state:()=>({native,muted,platformMuted,sets,rate,rateSets}),context};
}
test('native adapter changes separate site/media state and preserves mute; explicit positive wheel action unmutes',()=>{
  const f=fixture();f.send();assert.equal(f.media.volume,.04);assert.equal(f.state().native,4);assert.equal(f.media.muted,true);assert.equal(f.state().muted,true);assert.equal(f.receipts.at(-1).ok,true);
  f.send({percent:0,unmute:true});assert.equal(f.media.muted,true);
  f.send({percent:5,unmute:true});assert.equal(f.media.volume,.05);assert.equal(f.media.muted,false);assert.equal(f.state().muted,false);
});
test('malformed, stale and out-of-range requests never call native setter',()=>{
  const f=fixture();for(const patch of [{version:2},{percent:-1},{percent:101},{percent:null},{percent:'4'},{unmute:'false'},{source:'blob:stale'},{videoId:'lmnopqrstuv'},{id:'x'.repeat(81)},{operation:'storage-write'}])f.send(patch);
  for(const raw of ['{','null','[]','x'.repeat(8193)])f.raw(raw);
  f.media.isConnected=false;f.send();f.media.isConnected=true;f.send({},{});
  assert.equal(f.state().sets,0);assert.equal(f.receipts.length,0);
});
test('unavailable or throwing native API reports failure without a media-only fallback',()=>{
  const f=fixture();delete f.player.setVolume;f.send();assert.equal(f.media.volume,.05);assert.equal(f.receipts.at(-1).ok,false);
  f.player.setVolume=()=>{throw new Error('not ready');};f.send();assert.equal(f.media.volume,.05);assert.equal(f.receipts.at(-1).ok,false);
});
test('an apparently successful DOM-only native stub is rejected when native state remains stale',()=>{
  const f=fixture();f.player.setVolume=n=>f.media.volume=n/100;f.send();assert.equal(f.media.volume,.04);assert.equal(f.state().native,5);assert.equal(f.receipts.at(-1).ok,false);
});
test('page-forged valid request can only adjust its own volume and returns no privileged data',()=>{
  const f=fixture();f.send({id:'page-forged',percent:3});assert.equal(f.state().native,3);assert.deepEqual(Object.keys(f.receipts.at(-1)).sort(),['id','ok','version']);
  f.context.location.href='https://www.youtube.com/';f.send();assert.equal(f.state().sets,1,'requests on an unrelated page/video are stale');
});
test('adapter is declarative, top-frame only and has no new permissions or web-accessible bridge resource',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../extension/manifest.json',import.meta.url),'utf8'));
  const adapter=manifest.content_scripts.find(x=>x.world==='MAIN');assert.deepEqual(adapter.matches,['https://www.youtube.com/*']);assert.deepEqual(adapter.js,['native-volume.js','native-quality.js']);assert.equal(adapter.all_frames,false);assert.equal(adapter.run_at,'document_start');
  assert.deepEqual(manifest.permissions,['storage','activeTab']);assert.deepEqual(manifest.host_permissions,['https://sponsor.ajay.app/*']);assert(!manifest.web_accessible_resources.some(x=>x.resources.includes('native-volume.js')));
});

test('deliberate unmute is ordered after verified native/media volume and rejects non-finite readback',()=>{
  const f=fixture();let unmutes=0;f.player.unMute=()=>{unmutes++;f.media.muted=false;};
  f.player.setVolume=n=>{f.media.volume=n/100;};f.send({percent:4,unmute:true});assert.equal(unmutes,0);assert.equal(f.receipts.at(-1).ok,false);
  f.player.getVolume=()=>NaN;f.send({percent:5,unmute:true});assert.equal(unmutes,0);assert.equal(f.receipts.at(-1).ok,false);
});

test('unmute that restores an old volume stays media-muted until target is reapplied; partial throw fails closed',()=>{
  const f=fixture();const unmute=f.player.unMute,set=f.player.setVolume,trace=[];f.player.setVolume=n=>{set(n);trace.push({native:n,platformMuted:f.state().platformMuted});};f.player.unMute=()=>{unmute();f.player.setVolume(100);};
  f.send({percent:5,unmute:true});assert.equal(f.receipts.at(-1).ok,true);assert.equal(f.media.volume,.05);assert.equal(f.state().platformMuted,false);assert.equal(f.state().muted,false);assert(trace.some(x=>x.native===100));assert(trace.filter(x=>x.native>5).every(x=>x.platformMuted));assert.equal(Object.getOwnPropertyDescriptor(f.media,'muted'),undefined);
  const g=fixture();const partial=g.player.unMute;g.player.unMute=()=>{partial();g.player.setVolume(100);throw new Error('partial native unmute');};g.send({percent:5,unmute:true});assert.equal(g.receipts.at(-1).ok,false);assert.equal(g.state().platformMuted,true);assert.equal(Object.getOwnPropertyDescriptor(g.media,'muted'),undefined);
});

test('every own mute descriptor rejects deliberate unmute before mutation or apparent-success shortcuts',()=>{
  for(const value of [true,false])for(const configurable of [true,false])for(const writable of [true,false])for(const enumerable of [true,false])for(const nativeMuted of [true,false]) {
    const f=fixture();if(!nativeMuted)f.player.unMute();
    // Apparent native/shadow false must not conceal a physically muted video.
    Object.getOwnPropertyDescriptor(f.context.HTMLMediaElement.prototype,'muted').set.call(f.media,true);
    Object.defineProperty(f.media,'muted',{value,configurable,writable,enumerable});
    const before=Object.getOwnPropertyDescriptor(f.media,'muted'),state=f.state();let unmutes=0;f.player.unMute=()=>{unmutes++;};
    f.send({percent:5,unmute:true});assert.equal(f.receipts.at(-1).ok,false);assert.equal(unmutes,0);assert.deepEqual(f.state(),state);assert.deepEqual(Object.getOwnPropertyDescriptor(f.media,'muted'),before);
  }
  for(const configurable of [true,false]) {
    const f=fixture();let writes=0;Object.defineProperty(f.media,'muted',{configurable,get:()=>false,set:()=>{writes++;}});
    const before=Object.getOwnPropertyDescriptor(f.media,'muted');let unmutes=0;f.player.unMute=()=>{unmutes++;};f.send({percent:5,unmute:true});assert.equal(f.receipts.at(-1).ok,false);assert.equal(unmutes,0);assert.equal(writes,0);assert.equal(f.state().sets,0);assert.equal(f.state().platformMuted,true);assert.deepEqual(Object.getOwnPropertyDescriptor(f.media,'muted'),before);
  }
});

test('volume setter throwing after native unmute restores platform guard absence and fails muted',()=>{
  const f=fixture(),set=f.player.setVolume;let calls=0;f.player.setVolume=n=>{set(n);if(++calls===2)throw new Error('partial target reapply');};f.send({percent:5,unmute:true});assert.equal(f.receipts.at(-1).ok,false);assert.equal(f.state().platformMuted,true);assert.equal(f.state().muted,true);assert.equal(Object.getOwnPropertyDescriptor(f.media,'muted'),undefined);
});

test('fixed native speed channel synchronizes separate state and reports real supported limits',()=>{
  const f=fixture();f.media.playbackRate=1.5;assert.equal(f.state().rate,1);
  f.speed();assert.equal(f.media.playbackRate,1.55);assert.equal(f.state().rate,1.55);assert.equal(f.receipts.at(-1).rate,1.55);assert.equal(f.receipts.at(-1).limited,false);
  f.speed({rate:3});assert.equal(f.state().rate,2);assert.equal(f.media.playbackRate,2);assert.equal(f.receipts.at(-1).limited,true);
  assert.deepEqual(Object.keys(f.receipts.at(-1)).sort(),['id','limited','ok','rate','version']);
});

test('malformed/stale speed requests cannot select arbitrary operations or native methods',()=>{
  const f=fixture();for(const patch of [{version:2},{rate:null},{rate:'1.5'},{rate:.1},{rate:3.01},{videoId:'lmnopqrstuv'},{source:'old'},{id:'x'.repeat(81)},{method:'setVolume'},{unmute:true}])f.speed(patch);
  for(const raw of ['{','null','[]','x'.repeat(8193)])f.rawSpeed(raw);
  f.media.isConnected=false;f.speed();f.media.isConnected=true;f.speed({},{});assert.equal(f.state().rateSets,0);assert.equal(f.receipts.length,0);
});

test('missing/throwing speed API and DOM-only native stubs never claim synchronization',()=>{
  const f=fixture();delete f.player.setPlaybackRate;f.speed();assert.equal(f.receipts.at(-1).ok,false);assert.equal(f.media.playbackRate,1);
  f.player.setPlaybackRate=()=>{throw new Error('unavailable');};f.speed();assert.equal(f.receipts.at(-1).ok,false);
  f.player.setPlaybackRate=n=>{f.media.playbackRate=n;};f.speed();assert.equal(f.receipts.at(-1).ok,false);assert.equal(f.state().rate,1);
});

test('invalid native speed ranges fail without mutation; page requests grant no extension privilege',()=>{
  const f=fixture();for(const values of [[],null,[NaN],[1,'2'],[0,2],new Array(33).fill(1)]){f.player.getAvailablePlaybackRates=()=>values;f.speed();assert.equal(f.receipts.at(-1).ok,false);}
  assert.equal(f.state().rateSets,0);f.player.getAvailablePlaybackRates=()=>[.25,1,2];f.speed({id:'page-forged',rate:1.45});assert.equal(f.state().rate,1.45);assert.equal(f.receipts.at(-1).ok,true);
});
