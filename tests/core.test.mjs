import {test} from 'node:test';
import assert from 'node:assert/strict';
import {videoIdFromUrl,sanitizeSettings,sanitizeQueue,normalizeSegments,segmentAt} from '../extension/core.js';
test('video identities reject external hosts and malformed IDs',() => {
  assert.equal(videoIdFromUrl('https://www.youtube.com/watch?v=abcdefghijk'),'abcdefghijk');
  assert.equal(videoIdFromUrl('https://www.youtube.com/shorts/abcdefghijk'),'abcdefghijk');
  for (const url of ['https://evil.com/watch?v=abcdefghijk','https://www.youtube.com.evil.com/watch?v=abcdefghijk','http://www.youtube.com/watch?v=abcdefghijk','https://www.youtube.com/watch?v=short','nonsense']) assert.equal(videoIdFromUrl(url),null);
});
test('settings are opt-in and recover from corrupt storage',() => {
  assert.equal(sanitizeSettings().sponsorEnabled,false);
  assert.deepEqual(sanitizeSettings({speed:NaN,categories:['sponsor','unknown','sponsor'],enabled:'false'}),{enabled:true,sponsorEnabled:false,categories:['sponsor'],speed:1,applySpeed:true,wheelControls:false,toolbar:true,autoQueue:false});
  assert.equal(sanitizeSettings({speed:500}).speed,3);
  assert.equal(sanitizeSettings(null).speed,1);
});
test('queue is bounded, deduplicated, and stores plain text',() => {
  const queue = sanitizeQueue([{videoId:'abcdefghijk',title:'<img onerror=alert(1)>'},{videoId:'abcdefghijk',title:'duplicate'},{videoId:'bad'}]);
  assert.equal(queue.length,1); assert.equal(queue[0].title,'<img onerror=alert(1)>');
  assert.equal(sanitizeQueue(Array.from({length:120},(_,i) => ({videoId:String(i).padStart(11,'0')}))).length,100);
});
test('independent interval oracle covers boundaries, overlaps, disabled categories and malformed inputs',() => {
  const fixtures = [
    {segment:[10,20],category:'sponsor',actionType:'skip'},
    {segment:[18,25],category:'sponsor',actionType:'skip'},
    {segment:[25,30],category:'sponsor',actionType:'skip'},
    {segment:[35,40],category:'intro',actionType:'skip'},
    {segment:[50,60],category:'sponsor',actionType:'mute'},
    {segment:[-1,10],category:'sponsor',actionType:'skip'},
    {segment:[70,65],category:'sponsor',actionType:'skip'},
    {segment:[80,Infinity],category:'sponsor',actionType:'skip'}
  ];
  const segments = normalizeSegments(fixtures,['sponsor'],100);
  assert.equal(segments.length,3);
  for (const [position,end] of [[0,null],[9.99,null],[10,30],[19,30],[24,30],[25,30],[29.9,30],[30,null],[36,null],[55,null]]) assert.equal(segmentAt(segments,position)?.end ?? null,end,`position ${position}`);
  assert.equal(normalizeSegments(fixtures,['intro'],100).length,1);
  assert.equal(normalizeSegments([{segment:[10,120],category:'sponsor',actionType:'skip'}],['sponsor'],100).length,0);
});
