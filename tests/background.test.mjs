import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import * as core from '../extension/core.js';
async function harness(fetcher = async () => new Response('[]'),saved = {}) {
  const data = saved.data || {};
  const session = saved.session || {};
  let listener;
  const chrome = {
    tabs:saved.tabs,
    runtime:{id:'test',getURL:file => `chrome-extension://test/${file}`,onMessage:{addListener:fn => {listener=fn;}},onInstalled:{addListener:() => {}}},
    storage:{local:{get:async keys => Object.fromEntries(keys.filter(key => key in data).map(key => [key,structuredClone(data[key])])),set:async items => Object.assign(data,structuredClone(items))},session:{get:async keys => Object.fromEntries((keys || Object.keys(session)).filter(key => key in session).map(key => [key,structuredClone(session[key])])),set:async items => Object.assign(session,structuredClone(items)),remove:async keys => {for(const key of Array.isArray(keys)?keys:[keys])delete session[key];}}}
  };
  const source = (await readFile(new URL('../extension/background.js',import.meta.url),'utf8')).replace(/^import[^\n]+\n/,'');
  vm.runInNewContext(source,{...core,chrome,fetch:fetcher,crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,AbortSignal,URL,console});
  const request = (message,sender={id:'test',url:'chrome-extension://test/options.html'}) => new Promise(resolve => listener(message,sender,resolve));
  return {request,data,session,dispatch:(message,sender,respond=()=>{})=>listener(message,sender,respond),restart:()=>harness(fetcher,{data,session,tabs:saved.tabs})};
}
const videoId='abcdefghijk';
const sender={id:'test',frameId:0,url:`https://www.youtube.com/watch?v=${videoId}`,tab:{id:7,url:`https://www.youtube.com/watch?v=${videoId}`}};
test('sender boundaries reject arbitrary fetches, other extensions and content-script settings writes',async () => {
  let requests = 0;
  const {request} = await harness(async () => {requests++;return new Response('[]');});
  assert.equal((await request({type:'SET_SETTINGS',settings:{enabled:false}},sender)).ok,false);
  assert.equal((await request({type:'GET_STATE'},{id:'other',url:sender.url})).ok,false);
  assert.equal((await request({type:'SEGMENTS',videoId:'lmnopqrstuv'},sender)).ok,false);
  assert.equal((await request({type:'SEGMENTS',videoId,url:'https://evil.com'},sender)).segments.length,0);
  assert.equal(requests,0,'SponsorBlock must remain opt-in');
});
test('concurrent queue mutations serialize and preserve independent entries',async () => {
  const {request,data} = await harness();
  await Promise.all(['abcdefghijk','lmnopqrstuv','12345678901'].map(id => request({type:'ADD_QUEUE',item:{videoId:id,title:id}})));
  assert.equal(data.queue.length,3);
  await request({type:'ADD_QUEUE',item:{videoId,title:'duplicate'}});
  assert.equal(data.queue.length,3);
  assert.equal((await request({type:'NEXT_QUEUE',currentVideoId:videoId,automatic:true},sender)).ok,false,'automatic playback is opt-in');
  const response = await request({type:'NEXT_QUEUE',currentVideoId:videoId},sender);
  assert.equal(response.item.videoId,'lmnopqrstuv');
  assert.equal(data.queue.length,3,'selection cannot lose queued items before navigation');
  await request({type:'QUEUE_PLAYING',videoId:'lmnopqrstuv'},{...sender,tab:{id:7,url:'https://www.youtube.com/watch?v=lmnopqrstuv'}});
  assert.deepEqual(data.queue.map(item => item.videoId),['12345678901']);
});
test('queue recovery keeps data on failed navigation and scopes idempotent confirmation to destination and tab',async () => {
  const {request,data,session}=await harness();
  for(const id of [videoId,'lmnopqrstuv','12345678901']) await request({type:'ADD_QUEUE',item:{videoId:id,title:id}});
  const selections=await Promise.all(Array.from({length:4},()=>request({type:'NEXT_QUEUE',currentVideoId:videoId},sender)));
  assert(selections.every(result=>result.item.videoId==='lmnopqrstuv'));
  assert.equal(data.queue.length,3,'delays and duplicate requests preserve queue');
  await request({type:'QUEUE_PLAYING',videoId},sender);
  await request({type:'QUEUE_PLAYING',videoId:'lmnopqrstuv'},{...sender,tab:{id:8,url:'https://www.youtube.com/watch?v=lmnopqrstuv'}});
  assert.equal(data.queue.length,3,'wrong destination/tab cannot consume items');
  const playing={...sender,tab:{id:7,url:'https://www.youtube.com/watch?v=lmnopqrstuv'}};
  await Promise.all([1,2,3].map(()=>request({type:'QUEUE_PLAYING',videoId:'lmnopqrstuv'},playing)));
  assert.deepEqual(data.queue.map(item=>item.videoId),['12345678901']);
  assert.equal(Object.keys(session).length,0);
  await request({type:'NEXT_QUEUE',currentVideoId:'12345678901'});
  assert.equal(data.queue.length,1,'current-only queue is not silently discarded');
});
test('lookups omit cookies, send only hash prefixes, filter video identity and coalesce requests',async () => {
  const calls = [];
  const {request} = await harness(async (url,options) => {
    calls.push({url:String(url),options});
    return new Response(JSON.stringify([{videoID:'lmnopqrstuv',segments:[{wrong:true}]},{videoID:videoId,segments:[{segment:[10,20],category:'sponsor',actionType:'skip'}]}]));
  });
  await request({type:'SET_SETTINGS',settings:{sponsorEnabled:true}});
  const replies = await Promise.all(Array.from({length:5},() => request({type:'SEGMENTS',videoId},sender)));
  assert.equal(calls.length,1);
  const expected = Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(videoId))).toString('hex').slice(0,4);
  assert.equal(new URL(calls[0].url).pathname,`/api/skipSegments/${expected}`);
  assert.equal(calls[0].options.credentials,'omit');
  assert(!calls[0].url.includes(videoId));
  assert.equal(replies[0].segments[0].category,'sponsor');
  await request({type:'SEGMENTS',videoId},sender);
  assert.equal(calls.length,1,'success cache should avoid another request');
});
test('network failure degrades without breaking queue and settings',async () => {
  const {request} = await harness(async () => {throw new Error('offline');});
  await request({type:'SET_SETTINGS',settings:{sponsorEnabled:true}});
  const result = await request({type:'SEGMENTS',videoId},sender);
  assert.equal(result.ok,false);assert.equal(result.segments.length,0);
  assert.equal((await request({type:'GET_STATE'})).ok,true);
  assert.equal((await request({type:'ADD_QUEUE',item:{videoId,title:'Still usable'}})).ok,true);
});
test('SPA sender document URL can be stale but current tab identity must match',async () => {
  let calls=0;
  const {request}=await harness(async () => {calls++;return new Response('[]');});
  await request({type:'SET_SETTINGS',settings:{sponsorEnabled:true}});
  const navigated={...sender,tab:{url:'https://www.youtube.com/watch?v=lmnopqrstuv'}};
  assert.equal((await request({type:'SEGMENTS',videoId:'lmnopqrstuv'},navigated)).ok,true);
  assert.equal((await request({type:'SEGMENTS',videoId},navigated)).ok,false);
  assert.equal((await request({type:'SEGMENTS',videoId:'lmnopqrstuv'},{...navigated,frameId:2})).ok,false);
  assert.equal(calls,1);
});

const at=(id,tab=7)=>({...sender,tab:{id:tab,url:`https://www.youtube.com/watch?v=${id}`}});
const add=async(request,ids,title='saved')=>{for(const videoId of ids)await request({type:'ADD_QUEUE',item:{videoId,title}});};
test('origin absent at selection and deliberately added before confirmation survives, including worker restart',async()=>{
  for(const restart of [false,true]) {
    let h=await harness();await add(h.request,['lmnopqrstuv','12345678901']);
    await h.request({type:'NEXT_QUEUE',currentVideoId:videoId},sender);
    await add(h.request,[videoId],'new intentional origin entry');
    if(restart)h=await h.restart();
    await h.request({type:'QUEUE_PLAYING',videoId:'lmnopqrstuv'},at('lmnopqrstuv'));
    assert.deepEqual(h.data.queue.map(x=>x.videoId),['12345678901',videoId]);
    assert.equal(h.data.queue[1].title,'new intentional origin entry');
  }
});
test('explicit removal and identical re-add of either origin or target cancels the old receipt',async()=>{
  for(const removed of [videoId,'lmnopqrstuv']) {
    let h=await harness();await add(h.request,[videoId,'lmnopqrstuv','12345678901']);
    await h.request({type:'NEXT_QUEUE',currentVideoId:videoId},sender);
    await h.request({type:'REMOVE_QUEUE',videoId:removed});await add(h.request,[removed]);
    h=await h.restart();await h.request({type:'QUEUE_PLAYING',videoId:'lmnopqrstuv'},at('lmnopqrstuv'));
    assert.equal(h.data.queue.length,3,`new ${removed} membership must survive stale confirmation`);
  }
});
test('consumption invalidates second-tab receipts before intentional identical-ID re-adds, including worker restart',async()=>{
  let h=await harness();const {data}=h;const ids=[videoId,'lmnopqrstuv','12345678901'];
  await add(h.request,ids);
  await h.request({type:'NEXT_QUEUE',currentVideoId:videoId},at(videoId,7));
  await h.request({type:'NEXT_QUEUE',currentVideoId:videoId},at(videoId,8));
  await h.request({type:'QUEUE_PLAYING',videoId:ids[1]},at(ids[1],7));
  await add(h.request,ids.slice(0,2),'saved');
  h=await h.restart();
  await h.request({type:'QUEUE_CONTEXT',videoId:ids[2]},at(ids[2],8));
  await h.request({type:'QUEUE_PLAYING',videoId:ids[1]},at(ids[1],8));
  assert.deepEqual(data.queue.map(x=>x.videoId),[ids[2],ids[0],ids[1]],'stale tab must not consume deliberately re-added rows');
});
test('remove/re-add and diversion invalidate receipts durably; unchanged delayed selection still confirms',async()=>{
  let h=await harness();const ids=[videoId,'lmnopqrstuv','12345678901'];await add(h.request,ids);
  await h.request({type:'NEXT_QUEUE',currentVideoId:videoId},sender);
  await h.request({type:'REMOVE_QUEUE',videoId:ids[1]});await add(h.request,[ids[1]]);
  h=await h.restart();await h.request({type:'QUEUE_PLAYING',videoId:ids[1]},at(ids[1]));
  assert.equal(h.data.queue.length,3);
  await h.request({type:'NEXT_QUEUE',currentVideoId:videoId},sender);
  await h.request({type:'QUEUE_CONTEXT',videoId:ids[1]},at(ids[1]));
  h=await h.restart();await h.request({type:'QUEUE_PLAYING',videoId:ids[2]},at(ids[2]));
  assert.equal(h.data.queue.length,3,'diversion cancels the pending target');
  const selected=await h.request({type:'NEXT_QUEUE',currentVideoId:videoId},sender);
  h=await h.restart();await h.request({type:'QUEUE_PLAYING',videoId:selected.item.videoId},at(selected.item.videoId));
  assert.deepEqual(h.data.queue.map(x=>x.videoId),[ids[1]],'unchanged selection survives worker suspension and consumes its original memberships');
});
test('worker owns inactive tab setup and final navigation despite lost initiating response and duplicate requests',async()=>{
  let release;const wait=new Promise(resolve=>{release=resolve;});const calls=[];
  const tabs={create:async options=>{calls.push(['create',options]);await wait;return {id:42};},update:async(id,options)=>{calls.push(['update',id,options]);return {id};},remove:async id=>calls.push(['remove',id])};
  const h=await harness(undefined,{tabs});await add(h.request,[videoId,'lmnopqrstuv']);
  const extensionPage={id:'test',url:'chrome-extension://test/popup.html'};
  h.dispatch({type:'OPEN_QUEUE'},extensionPage); // No live receiver: popup has gone away.
  const duplicate=h.request({type:'OPEN_QUEUE'},extensionPage);
  await new Promise(resolve=>setTimeout(resolve,0));assert.equal(calls.length,1);release();
  assert.equal((await duplicate).ok,true);assert.equal(calls.filter(x=>x[0]==='create').length,1);
  assert.equal(calls[0][1].url,'about:blank');assert.equal(calls[0][1].active,false);
  assert.equal(calls[1][2].url,`https://www.youtube.com/watch?v=${videoId}`);assert.equal(calls[1][2].active,true);
  assert.equal(h.data.queue.length,2,'opening cannot consume before playback');
  await h.request({type:'QUEUE_PLAYING',videoId},at(videoId,42));assert.deepEqual(h.data.queue.map(x=>x.videoId),['lmnopqrstuv']);
});
test('worker-owned popup navigation failure cleans up its blank tab and receipt without losing queue',async()=>{
  const removed=[];const tabs={create:async()=>({id:42}),update:async()=>{throw Error('navigation failed');},remove:async id=>removed.push(id)};
  const h=await harness(undefined,{tabs});await add(h.request,[videoId]);
  assert.equal((await h.request({type:'OPEN_QUEUE'})).ok,false);assert.deepEqual(removed,[42]);assert.equal(h.data.queue.length,1);assert.deepEqual(h.session,{});
});
