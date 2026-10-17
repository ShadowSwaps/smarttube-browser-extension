import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import * as core from '../extension/core.js';
async function harness(fetcher = async () => new Response('[]')) {
  const data = {};
  let listener;
  const chrome = {
    runtime:{id:'test',getURL:file => `chrome-extension://test/${file}`,onMessage:{addListener:fn => {listener=fn;}},onInstalled:{addListener:() => {}}},
    storage:{local:{get:async keys => Object.fromEntries(keys.filter(key => key in data).map(key => [key,structuredClone(data[key])])),set:async items => Object.assign(data,structuredClone(items))}}
  };
  const source = (await readFile(new URL('../extension/background.js',import.meta.url),'utf8')).replace(/^import[^\n]+\n/,'');
  vm.runInNewContext(source,{...core,chrome,fetch:fetcher,crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,AbortSignal,URL,console});
  const request = (message,sender={id:'test',url:'chrome-extension://test/options.html'}) => new Promise(resolve => listener(message,sender,resolve));
  return {request,data};
}
const videoId='abcdefghijk';
const sender={id:'test',frameId:0,url:`https://www.youtube.com/watch?v=${videoId}`,tab:{url:`https://www.youtube.com/watch?v=${videoId}`}};
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
  const response = await request({type:'NEXT_QUEUE',currentVideoId:videoId});
  assert.equal(response.item.videoId,'lmnopqrstuv');
  assert.deepEqual(data.queue.map(item => item.videoId),['12345678901']);
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
