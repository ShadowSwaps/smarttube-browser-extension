import {test} from 'node:test';
import assert from 'node:assert/strict';
import {videoIdFromUrl,sanitizeSettings,sanitizeQueue,normalizeSegments,segmentAt,videoFilterCss,createQueueMediaTracker} from '../extension/core.js';

test('URL-first SPA cannot associate old media or stray metadata with queued target; real reload or fresh document can',() => {
  const tracker=createQueueMediaTracker('A'),media={currentSrc:'blob:old-A'};
  tracker.observe('A',media);assert(tracker.matches('A',media));
  tracker.observe('B',media);tracker.metadata('B',media);
  for(let i=0;i<5;i++){tracker.observe('B',media);assert.equal(tracker.matches('B',media),false,'target never loads; old A remains unconfirmed');}
  const clone={currentSrc:'blob:old-A'};tracker.observe('B',clone);assert.equal(tracker.matches('B',clone),false,'copying old media is not a target transition');
  for(let i=0;i<3;i++) {
    tracker.loading('B',clone);tracker.metadata('B',clone);
    assert.equal(tracker.matches('B',clone),false,'unchanged old source cannot become B through a load cycle');
    clone.currentSrc='';tracker.loading('B',clone);tracker.observe('B',clone);
    clone.currentSrc='blob:old-A';tracker.metadata('B',clone);
    assert.equal(tracker.matches('B',clone),false,'emptied media must not erase the original source boundary');
  }
  tracker.loading('B',clone);clone.currentSrc='blob:target-B';tracker.metadata('B',clone);assert(tracker.matches('B',clone));
  clone.currentSrc='blob:old-A';tracker.loading('B',clone);tracker.metadata('B',clone);assert.equal(tracker.matches('B',clone),false,'returning to original A remains blocked');
  clone.currentSrc='blob:target-B';tracker.metadata('B',clone);assert(tracker.matches('B',clone));
  tracker.observe(null,clone);tracker.observe('B',clone);assert.equal(tracker.matches('B',clone),false,'an ad/unrelated URL transition invalidates prior association');
  const fresh=createQueueMediaTracker('B');fresh.observe('B',clone);assert(fresh.matches('B',clone),'fresh watch document can confirm its own media');
  const loading={currentSrc:''},freshLoading=createQueueMediaTracker('B');freshLoading.observe('B',loading);freshLoading.loading('B',loading);loading.currentSrc='blob:first-B';freshLoading.metadata('B',loading);assert(freshLoading.matches('B',loading),'fresh document can finish its initial media load');
  const late=createQueueMediaTracker('A'),lateMedia={currentSrc:'blob:old-A'};late.observe('B',lateMedia);assert.equal(late.matches('B',lateMedia),false,'initial document URL captured before imports cannot be replaced by later SPA URL');
  const ad={currentSrc:'blob:ad'},afterAd=createQueueMediaTracker('B');afterAd.observe(null,ad);afterAd.observe('B',ad);assert.equal(afterAd.matches('B',ad),false,'ending ad state alone cannot confirm ad media as target');ad.currentSrc='blob:content-B';afterAd.metadata('B',ad);assert(afterAd.matches('B',ad),'a distinct content source after the initial ad is real transition evidence');
});
test('all recognized ad sources remain excluded after marker removal alongside prior content boundary',() => {
  const tracker=createQueueMediaTracker('A');let media={currentSrc:'blob:old-A'};
  tracker.observe('A',media);tracker.observe('B',media);
  for(const adSource of ['blob:ad-one','blob:ad-two','blob:ad-three']) {
    media.currentSrc=adSource;tracker.observe(null,media);assert.equal(tracker.matches('B',media),false);
    tracker.observe('B',media);assert.equal(tracker.matches('B',media),false,'clearing the ad marker cannot relabel recognized ad media');
    tracker.loading('B',media);tracker.metadata('B',media);assert.equal(tracker.matches('B',media),false,'load/metadata do not authorize recognized ad source');
    media.currentSrc='';tracker.loading(null,media);tracker.metadata('B',media);
    media={currentSrc:adSource};tracker.observe('B',media);tracker.metadata('B',media);assert.equal(tracker.matches('B',media),false,'empty intervals and new nodes do not forget recognized ads');
  }
  for(const blocked of ['blob:old-A','blob:ad-one','blob:ad-two','blob:ad-three']) {
    media={currentSrc:blocked};tracker.loading('B',media);tracker.metadata('B',media);assert.equal(tracker.matches('B',media),false,'both old content and every earlier ad remain excluded');
  }
  media={currentSrc:'blob:actual-B'};tracker.loading('B',media);tracker.metadata('B',media);assert(tracker.matches('B',media),'a distinct genuine target still confirms');
});

test('initial-document ads and later ads cannot confirm until distinct content, regardless of node/load sequence',() => {
  const tracker=createQueueMediaTracker('B');let media={currentSrc:'blob:initial-ad'};
  tracker.observe(null,media);tracker.observe('B',media);assert.equal(tracker.matches('B',media),false);
  media.currentSrc='blob:second-ad';tracker.loading(null,media);tracker.metadata(null,media);tracker.observe('B',media);assert.equal(tracker.matches('B',media),false);
  media={currentSrc:'blob:initial-ad'};tracker.metadata('B',media);assert.equal(tracker.matches('B',media),false,'earlier recognized ads remain blocked');
  media.currentSrc='blob:content-B';tracker.metadata('B',media);assert(tracker.matches('B',media));
  media.currentSrc='blob:midroll';tracker.observe(null,media);tracker.observe('B',media);assert.equal(tracker.matches('B',media),false);
  media={currentSrc:'blob:second-ad'};tracker.loading('B',media);tracker.metadata('B',media);assert.equal(tracker.matches('B',media),false);
  media.currentSrc='blob:content-B-resumed';tracker.metadata('B',media);assert(tracker.matches('B',media));
});

test('video identities reject external hosts and malformed IDs',() => {
  assert.equal(videoIdFromUrl('https://www.youtube.com/watch?v=abcdefghijk'),'abcdefghijk');
  assert.equal(videoIdFromUrl('https://www.youtube.com/shorts/abcdefghijk'),'abcdefghijk');
  for (const url of ['https://evil.com/watch?v=abcdefghijk','https://www.youtube.com.evil.com/watch?v=abcdefghijk','http://www.youtube.com/watch?v=abcdefghijk','https://www.youtube.com/watch?v=short','nonsense']) assert.equal(videoIdFromUrl(url),null);
});
test('settings are opt-in and recover from corrupt storage',() => {
  assert.equal(sanitizeSettings().sponsorEnabled,false);
  const recovered = sanitizeSettings({speed:NaN,categories:['sponsor','unknown','sponsor'],enabled:'false'});
  assert.equal(recovered.enabled,true);assert.equal(recovered.speed,1);assert.deepEqual(recovered.categories,['sponsor']);
  assert.equal(sanitizeSettings({speed:500}).speed,3);
  assert.equal(sanitizeSettings(null).speed,1);
});
test('startup volume defaults safely for old settings and rejects corrupt values',()=>{
  const old = sanitizeSettings({speed:1.5,wheelControls:true});
  assert.equal(old.startupVolume,5);assert.equal(old.applyVolume,true);
  assert.equal(sanitizeSettings().wheelControls,true);
  assert.equal(sanitizeSettings({wheelControls:false}).wheelControls,false);
  assert.equal(old.speed,1.5);assert.equal(old.wheelControls,true);
  for (const value of [null,NaN,Infinity,'80',{}]) assert.equal(sanitizeSettings({startupVolume:value}).startupVolume,5);
  assert.equal(sanitizeSettings({startupVolume:-5}).startupVolume,0);
  assert.equal(sanitizeSettings({startupVolume:150}).startupVolume,100);
  assert.equal(sanitizeSettings({startupVolume:4.6,applyVolume:false}).startupVolume,5);
  assert.equal(sanitizeSettings({applyVolume:false}).applyVolume,false);
  assert.equal(sanitizeSettings({applyVolume:'false'}).applyVolume,true);
});

test('appearance defaults are neutral and invalid filter values cannot become CSS',()=>{
  const old = sanitizeSettings({speed:1.5});
  assert.equal(old.speed,1.5);assert.equal(old.cinema,false);assert.equal(old.hideComments,false);assert.equal(old.filtersEnabled,false);
  assert.equal(videoFilterCss(old),'');
  const clean = sanitizeSettings({filtersEnabled:true,filterBrightness:0,filterContrast:999,filterSaturation:NaN,filterGrayscale:'0);url(https://invalid/)'});
  assert.equal(videoFilterCss(clean),'brightness(50%) contrast(150%) saturate(100%) grayscale(0%)');
  assert.equal(sanitizeSettings({filterBrightness:123.7,hideChat:'yes'}).filterBrightness,124);
  assert.equal(sanitizeSettings({hideChat:'yes'}).hideChat,false);
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
