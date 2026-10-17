// Real extension/media in isolated silent Brave. Default mode intercepts YouTube
// with deterministic fixtures; --live uses the signed-out public service.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const modulePath=process.env.BROWSER_TEST_PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=await import(path.isAbsolute(modulePath)?pathToFileURL(modulePath).href:modulePath);
const live=process.argv.includes('--live'), stamp=Date.now();
const output=path.resolve(`test-results/queue-controls-${live?'live':'fixture'}-${stamp}`);
await mkdir(output,{recursive:true});
const extension=path.resolve('dist/extension'),profile=path.resolve(`.local/queue-controls-${stamp}`);
const launch={executablePath:process.env.BRAVE_PATH || 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,viewport:{width:1100,height:850},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--mute-audio','--autoplay-policy=no-user-gesture-required','--disable-brave-update','--disable-component-update']};
const report={kind:live?'live signed-out YouTube':'deterministic HTML/native media fixtures',headless:true,audio:'--mute-audio',candidate:{},checks:[],events:[],output};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const file of await readdir(extension)) if(file.endsWith('.js') || file==='manifest.json') report.candidate[file]=hash(await readFile(path.join(extension,file)));
report.harness=hash(await readFile(new URL(import.meta.url)));
const A=live?'jNQXAC9IVRw':'abcdefghijk',B=live?'aqz-KE-bpKQ':'lmnopqrstuv',C='12345678901';
let context,worker,page,unavailable=false,abort=false,stage='launch';
const media=Buffer.alloc(44+4*8000*2);
media.write('RIFF');media.writeUInt32LE(media.length-8,4);media.write('WAVEfmt ',8);media.writeUInt32LE(16,16);media.writeUInt16LE(1,20);media.writeUInt16LE(1,22);media.writeUInt32LE(8000,24);media.writeUInt32LE(16000,28);media.writeUInt16LE(2,32);media.writeUInt16LE(16,34);media.write('data',36);media.writeUInt32LE(media.length-44,40);
async function launchBrowser() {
 context=await chromium.launchPersistentContext(profile,launch);
 report.browserVersion=context.browser().version();
 if(!live) await context.route('https://www.youtube.com/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname==='/fixture.wav') {
   const range=/^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range||'');
   const start=range?Number(range[1]):0,end=range?.[2]?Math.min(Number(range[2]),media.length-1):media.length-1;
   return route.fulfill({status:range?206:200,contentType:'audio/wav',headers:{'accept-ranges':'bytes',...(range?{'content-range':`bytes ${start}-${end}/${media.length}`}:{})},body:media.subarray(start,end+1)});
  }
  if(url.searchParams.get('v')===B && abort) return route.abort('failed');
  if(url.searchParams.get('v')===B && unavailable) {await new Promise(r=>setTimeout(r,1500));return route.fulfill({contentType:'text/html',body:'<title>Unavailable fixture</title><h1>Video unavailable</h1>'});}
  return route.fulfill({contentType:'text/html',body:`<!doctype html><title>Queue fixture - YouTube</title><style>body{background:#14181e;color:white;margin:30px;height:2000px;font:16px system-ui}#movie_player{position:relative;width:min(800px,100%);aspect-ratio:16/9;background:#25282e}video{width:100%;height:100%}</style><h1 class="ytd-watch-metadata">Queue fixture ${url.searchParams.get('v')}</h1><div id="movie_player" class="html5-video-player"><video src="/fixture.wav" autoplay muted controls></video></div><button onclick="document.querySelector('#movie_player').requestFullscreen()">Fixture fullscreen</button>`});
 });
 worker=context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
 await worker.evaluate(()=>{globalThis.__queueEvents=[];chrome.runtime.onMessage.addListener((m,s)=>{if(['NEXT_QUEUE','QUEUE_PLAYING','OPEN_QUEUE','QUEUE_CONTEXT'].includes(m.type))globalThis.__queueEvents.push({type:m.type,current:m.currentVideoId,video:m.videoId,tab:s.tab?.id});});});
 page=await context.newPage();
 page.on('pageerror',error=>report.events.push({type:'pageerror',message:error.message}));
}
async function state(settings,ids) {await worker.evaluate(({settings,ids})=>chrome.storage.local.set({settings,queue:ids.map(videoId=>({videoId,title:videoId}))}),{settings,ids});}
const queue=()=>worker.evaluate(async()=>(await chrome.storage.local.get('queue')).queue.map(x=>x.videoId));
async function ready() {
 await page.waitForFunction(()=>{const v=document.querySelector('#movie_player video');return v?.readyState>=2 && Number.isFinite(v.duration)&&v.duration>0&&!v.closest('.ad-showing,.ad-interrupting');},{},{timeout:35000});
 await page.waitForSelector('#smarttube-browser-toolbar');
 if(live && new URL(page.url()).searchParams.get('v')===A) {
  await page.locator('#movie_player video').evaluate(v=>v.pause());
  await page.locator('#movie_player').hover();
  const autoplay=page.locator('.ytp-autonav-toggle-button');
  await autoplay.waitFor({state:'attached',timeout:10000});
  if(await autoplay.getAttribute('aria-checked')==='true') await autoplay.click({timeout:5000});
  await page.waitForFunction(()=>document.querySelector('.ytp-autonav-toggle-button')?.getAttribute('aria-checked')==='false',{},{timeout:5000});
  assert.equal(await autoplay.getAttribute('aria-checked'),'false','Disable native site autoplay in this test-owned profile to isolate extension queue behavior');
 }
}
async function shot(name){await page.screenshot({path:path.join(output,`${name}.png`)});}
async function ended() {
 // Live: let a short public source play through naturally. Fixtures seek near
 // the end of their local media, then wait for a trusted native ended event.
 if(live) {
  assert.equal(await page.locator('.ytp-autonav-toggle-button').getAttribute('aria-checked'),'false','Native autoplay must be off on the source before its natural-end experiment');
  const source=await page.locator('#movie_player video').evaluate(v=>({duration:v.duration,position:v.currentTime,seeking:v.seeking,src:v.currentSrc}));
  assert(source.duration>0 && source.duration<=45 && source.position<source.duration*.25 && !source.seeking,'Live completion must start early in demonstrably short content without seeking');
  report.events.push({naturalPlayback:source});
  const control=page.locator('.ytp-play-button');
  if(await page.locator('#movie_player video').evaluate(v=>v.paused)) await control.click();
  await page.waitForFunction(()=>{const v=document.querySelector('#movie_player video');return !v.paused && v.currentTime>0 && !v.closest('.ad-showing,.ad-interrupting');});
  return;
 }
 await page.locator('#movie_player video').evaluate(v=>{v.currentTime=v.duration-(v.duration>10?2:.35);});
 await page.waitForFunction(()=>{const v=document.querySelector('#movie_player video');return !v.seeking&&v.readyState>=2&&!v.closest('.ad-showing,.ad-interrupting');});
 await page.locator('#movie_player video').evaluate(v=>v.play());
}
async function check(name,fn){stage=name;await fn();report.checks.push(name);}
try {
 await launchBrowser();
 await state({enabled:true,toolbar:true,autoQueue:false,sponsorEnabled:false},[A,B,C]);
 await page.goto(`https://www.youtube.com/watch?v=${A}`,{waitUntil:'domcontentloaded'});
 if(live){const reject=page.getByRole('button',{name:/Reject/i}).first();if(await reject.waitFor({state:'visible',timeout:10000}).then(()=>true,()=>false)){await reject.click();await reject.waitFor({state:'hidden'});}}
 await ready();
 await page.locator('video').first().evaluate(v=>v.pause());
 const entry=()=>page.getByRole('button',{name:'SmartTube controls',exact:true});
 await check('Collapsed tools occupy only 30x28; hidden controls do not intercept hits or tab focus',async()=>{
  assert.equal(await entry().getAttribute('aria-expanded'),'false');
  assert.equal(await page.getByRole('button',{name:'Forward ten seconds'}).isVisible(),false);
  const geometry=await page.locator('#smarttube-browser-toolbar').evaluate(h=>{const r=h.getBoundingClientRect(),s=h.shadowRoot;return {width:r.width,height:r.height,visible:[...s.querySelectorAll('button')].filter(b=>b.getClientRects().length).length,hiddenHit:s.querySelector('.bar').getClientRects().length};});
  assert.deepEqual(geometry,{width:30,height:28,visible:1,hiddenHit:0});
  await shot('collapsed');
 });
 await check('Keyboard Enter opens, Tab reaches tools, Escape closes and restores entry focus',async()=>{
  const focusState=()=>page.locator('#smarttube-browser-toolbar').evaluate(h=>({documentFocus:document.activeElement?.tagName,focus:h.shadowRoot.activeElement?.outerHTML,expanded:h.shadowRoot.querySelector('[data-panel-toggle]').getAttribute('aria-expanded')}));
  await entry().focus();report.events.push({beforeEnter:await focusState()});await page.keyboard.press('Enter');report.events.push({afterEnter:await focusState()});
  assert.equal(await entry().getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Tab');report.events.push({afterTab:await focusState()});
  assert.equal(await page.locator('#smarttube-browser-toolbar').evaluate(h=>h.shadowRoot.activeElement?.dataset.action),'seek-back');
  await page.keyboard.press('Escape');
  assert.equal(await entry().getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('#smarttube-browser-toolbar').evaluate(h=>h.shadowRoot.activeElement?.hasAttribute('data-panel-toggle')),true);
 });
 await check('Pointer opens tools; focused panel stays open; volume and loop controls work',async()=>{
  await entry().click();await page.getByRole('button',{name:'Raise volume ten percent'}).click();
  await page.getByRole('button',{name:'Toggle video loop'}).click();assert.equal(await page.locator('video').first().evaluate(v=>v.loop),true);
  await page.waitForTimeout(1000);assert.equal(await entry().getAttribute('aria-expanded'),'true');
  await page.getByRole('button',{name:'Toggle video loop'}).click();await shot('expanded');
 });
 if(!live) {
  await check('Expanded controls fit narrow players and actual fullscreen; cinema and floating placement retain access',async()=>{
   await page.setViewportSize({width:360,height:600});await page.waitForTimeout(600);await shot('narrow');
   const bounds=await page.locator('#smarttube-browser-toolbar').evaluate(h=>{const a=h.getBoundingClientRect(),b=h.parentElement.getBoundingClientRect();return a.left>=b.left && a.right<=b.right && a.bottom<=b.bottom-55;});assert(bounds,'Narrow tools must leave the native bottom controls clear');
   await page.getByRole('button',{name:'Fixture fullscreen'}).click();await page.waitForFunction(()=>Boolean(document.fullscreenElement));await shot('fullscreen');
   await page.evaluate(()=>document.exitFullscreen());
   await page.getByRole('button',{name:'Toggle cinema mode'}).click();await page.waitForSelector('#smarttube-cinema-backdrop');
   await page.keyboard.press('Escape');assert.equal(await entry().getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#smarttube-cinema-backdrop').count(),1);
   await page.keyboard.press('Escape');await page.locator('#smarttube-cinema-backdrop').waitFor({state:'detached'});
   await entry().click();await page.getByRole('button',{name:'Toggle cinema mode'}).click();await page.waitForSelector('#smarttube-cinema-backdrop');
   await page.evaluate(()=>{const p=document.querySelector('#movie_player');p.style.position='fixed';p.style.width='320px';p.style.right='0';p.style.top='100px';scrollTo(0,600);});
   await page.waitForTimeout(600);await shot('floating-cinema');assert(await entry().isVisible());
   await page.setViewportSize({width:1100,height:850});
  });
 }
 await check('Real native media end with automatic queue off leaves URL and queue unchanged',async()=>{
  await ended();await page.waitForFunction(()=>document.querySelector('video')?.ended,{},{timeout:45000});await page.waitForTimeout(800);
  assert.equal(new URL(page.url()).searchParams.get('v'),A);assert.deepEqual(await queue(),[A,B,C]);
 });
 if(!live) {
  await state({enabled:true,toolbar:true,autoQueue:true},[A,B,C]);
  await page.goto(`https://www.youtube.com/watch?v=${A}`);await ready();
  await check('Whole-video and A–B looping suppress queue continuation',async()=>{
   await entry().click();await page.getByRole('button',{name:'Toggle video loop'}).click();await ended();await page.waitForTimeout(1000);assert.equal(new URL(page.url()).searchParams.get('v'),A);
   await page.getByRole('button',{name:'Toggle video loop'}).click();await page.locator('video').evaluate(v=>{v.pause();v.currentTime=.2;});await page.getByRole('button',{name:'Set loop start'}).click();
   await page.locator('video').evaluate(v=>{v.currentTime=1;});await page.getByRole('button',{name:'Set loop end'}).click();await page.locator('video').evaluate(v=>v.play());await page.waitForTimeout(1600);
   assert.equal(new URL(page.url()).searchParams.get('v'),A);assert(await page.locator('video').evaluate(v=>v.currentTime<1.1));await page.getByRole('button',{name:'Clear loop range'}).click();
  });
  await check('Delayed unavailable destination and repeated ended events retain every queued item',async()=>{
   unavailable=true;await worker.evaluate(()=>{globalThis.__queueEvents=[];});
   await ended();await page.waitForTimeout(450);
   await page.evaluate(()=>{for(let n=0;n<5;n++)document.querySelector('video')?.dispatchEvent(new Event('ended'));}).catch(()=>{});
   await page.getByRole('heading',{name:'Video unavailable'}).waitFor();
   assert.deepEqual(await queue(),[A,B,C]);
   const requests=await worker.evaluate(()=>globalThis.__queueEvents.filter(m=>m.type==='NEXT_QUEUE'));assert.equal(requests.length,1);report.events.push({delayedNextRequests:requests});
   await page.reload();assert.deepEqual(await queue(),[A,B,C]);await shot('unavailable');
  });
  await check('Unavailable queue survives full browser-process restart',async()=>{
   await context.close();await launchBrowser();assert.deepEqual(await queue(),[A,B,C]);
  });
  unavailable=false;
  await check('Failed network navigation preserves queue and explicit Next can recover',async()=>{
   abort=true;await page.goto(`https://www.youtube.com/watch?v=${A}`);await ready();await entry().click();await page.getByRole('button',{name:'Play next queued video'}).click();
   await page.waitForTimeout(1500);assert.deepEqual(await queue(),[A,B,C]);await shot('network-failure');
   abort=false;
   await page.goto(`https://www.youtube.com/watch?v=${A}`);await ready();await entry().click();await page.getByRole('button',{name:'Play next queued video'}).click();
   await page.waitForURL(`**watch?v=${B}`);await ready();
   for(let i=0;i<25 && (await queue()).includes(B);i++)await page.waitForTimeout(200);
   assert.deepEqual(await queue(),[C]);await shot('explicit-next-recovery');
  });
 }
 await check('Real media end advances once to queued playable content and confirms consumption',async()=>{
  await state({enabled:true,toolbar:true,autoQueue:true},[A,B,...(live?[]:[C])]);
  await page.goto(`https://www.youtube.com/watch?v=${A}`,{waitUntil:'domcontentloaded'});await ready();
  report.events.push({sourceMedia:await page.locator('video').first().evaluate(v=>({duration:v.duration,time:v.currentTime,src:v.currentSrc,advertising:Boolean(v.closest('.ad-showing,.ad-interrupting'))}))});
  await worker.evaluate(()=>{globalThis.__queueEvents=[];});
  await page.exposeFunction('__recordQueueEnd',event=>report.events.push({nativeEnd:event}));
  await page.evaluate(()=>{document.querySelector('#movie_player video').addEventListener('ended',e=>window.__recordQueueEnd({trusted:e.isTrusted,ended:e.target.ended,time:e.target.currentTime,duration:e.target.duration}));});
  await ended();await page.waitForURL(`**watch?v=${B}`,{timeout:45000});await ready();
  await page.locator('video').first().evaluate(v=>v.play());
  await page.waitForFunction(()=>{const v=document.querySelector('#movie_player video');return !v.paused&&v.currentTime>0&&!v.closest('.ad-showing,.ad-interrupting');});
  for(let i=0;i<30 && (await queue()).includes(B);i++)await page.waitForTimeout(200);
  assert.deepEqual(await queue(),live?[]:[C]);
  const events=await worker.evaluate(()=>globalThis.__queueEvents);assert.equal(events.filter(e=>e.type==='NEXT_QUEUE').length,1);report.events.push({transition:events,destination:await page.locator('video').first().evaluate(v=>({duration:v.duration,time:v.currentTime,src:v.currentSrc,paused:v.paused}))});await shot('destination-playing');
  assert(report.events.some(e=>e.nativeEnd?.trusted && e.nativeEnd.ended),'native ended event must be observed');
 });
 if(!live) await check('Last item consumes on successful playback; empty queue end does not navigate',async()=>{
  await ended();await page.waitForURL(`**watch?v=${C}`);await ready();
  for(let i=0;i<25 && (await queue()).length;i++)await page.waitForTimeout(200);
  assert.deepEqual(await queue(),[]);await ended();await page.waitForFunction(()=>document.querySelector('video')?.ended);await page.waitForTimeout(700);assert.equal(new URL(page.url()).searchParams.get('v'),C);
 });
 if(!live) await check('Disconnected Next survives initiating document destruction during delayed worker setup',async()=>{
  await state({enabled:true,toolbar:true,autoQueue:false},[B,C]);
  const extensionId=new URL(worker.url()).hostname;
  const popup=await context.newPage();await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.bringToFront();await popup.reload();await popup.getByText('Open a video on YouTube',{exact:true}).waitFor();
  const before=context.pages().length;
  await worker.evaluate(()=>{
   globalThis.__originalCreate=chrome.tabs.create;
   chrome.tabs.create=async options=>{globalThis.__openStarted=true;await new Promise(resolve=>{globalThis.__releaseOpen=resolve;});return globalThis.__originalCreate(options);};
  });
  await popup.locator('#next').evaluate(button=>{button.click();button.click();});
  for(let i=0;i<30 && !await worker.evaluate(()=>globalThis.__openStarted);i++)await page.waitForTimeout(100);
  assert(await worker.evaluate(()=>globalThis.__openStarted));
  await popup.close(); // Model the initiating action-popup document being destroyed.
  await worker.evaluate(()=>{chrome.tabs.create=globalThis.__originalCreate;globalThis.__releaseOpen();});
  for(let i=0;i<30 && (await queue()).includes(B);i++)await page.waitForTimeout(200);
  assert.equal(context.pages().length,before);assert.deepEqual(await queue(),[C]);
 });
 if(!live) await check('URL-first SPA keeps old playing media unconfirmed until target media actually reloads',async()=>{
  await state({enabled:true,toolbar:true,autoQueue:false},[A,B,C]);
  await page.goto(`https://www.youtube.com/watch?v=${A}`);await ready();
  const control=await context.newPage();await control.goto(`chrome-extension://${new URL(worker.url()).hostname}/options.html`);
  await page.bringToFront();
  const tabId=await control.evaluate(async()=>{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});return tab.id;});
  await control.evaluate(tabId=>chrome.runtime.sendMessage({type:'NEXT_QUEUE',currentVideoId:'abcdefghijk',tabId}),tabId);
  await page.locator('video').evaluate(v=>{v.loop=true;v.currentTime=.5;return v.play();});
  await page.evaluate(id=>{history.pushState({},'',`/watch?v=${id}`);document.dispatchEvent(new Event('yt-navigate-finish'));},B);
  await page.waitForTimeout(1200);assert.deepEqual(await queue(),[A,B,C],'URL B with old A still playing cannot consume queue');
  await page.locator('video').evaluate(v=>{v.load();return v.play();});await ready();await page.waitForTimeout(700);
  assert.deepEqual(await queue(),[A,B,C],'loadstart/metadata for unchanged old A must not confirm B');
  await page.locator('video').evaluate(v=>{v.removeAttribute('src');v.load();});await page.waitForTimeout(200);
  await page.locator('video').evaluate(v=>{v.src='/fixture.wav';v.load();return v.play();});await ready();await page.waitForTimeout(700);
  assert.deepEqual(await queue(),[A,B,C],'emptied then old-A reload must retain the queue');
  await page.locator('video').evaluate(v=>{v.src='/fixture.wav?actual-target=B';v.load();return v.play();});
  for(let i=0;i<30 && (await queue()).includes(B);i++)await page.waitForTimeout(200);
  assert.deepEqual(await queue(),[C]);await shot('spa-real-target-playing');await control.close();
 });
 if(!live) await check('Origin added after queue selection survives actual destination playback',async()=>{
  await state({enabled:true,toolbar:true,autoQueue:false},[B,C]);
  await page.goto(`https://www.youtube.com/watch?v=${A}`);await ready();
  const control=await context.newPage();await control.goto(`chrome-extension://${new URL(worker.url()).hostname}/options.html`);await page.bringToFront();
  const tabId=await control.evaluate(async()=>{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});return tab.id;});
  await control.evaluate(async({tabId,A})=>{await chrome.runtime.sendMessage({type:'NEXT_QUEUE',currentVideoId:A,tabId});await chrome.runtime.sendMessage({type:'ADD_QUEUE',item:{videoId:A,title:'new intentional origin entry'}});},{tabId,A});
  await page.goto(`https://www.youtube.com/watch?v=${B}`);await ready();
  for(let i=0;i<30 && (await queue()).includes(B);i++)await page.waitForTimeout(200);
  assert.deepEqual(await queue(),[C,A]);await shot('new-origin-retained');await control.close();
 });
 if(!live) await check('Recognized ad media cannot confirm or advance after marker clears; distinct target later confirms',async()=>{
  await state({enabled:true,toolbar:true,autoQueue:false},[A,B,C]);
  await page.goto(`https://www.youtube.com/watch?v=${A}`);await ready();
  const control=await context.newPage();await control.goto(`chrome-extension://${new URL(worker.url()).hostname}/options.html`);await page.bringToFront();
  const tabId=await control.evaluate(async()=>{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});return tab.id;});
  await control.evaluate(({tabId,A})=>chrome.runtime.sendMessage({type:'NEXT_QUEUE',currentVideoId:A,tabId}),{tabId,A});
  await page.locator('video').evaluate(v=>{v.loop=true;return v.play();});
  await page.evaluate(id=>{history.pushState({},'',`/watch?v=${id}`);document.dispatchEvent(new Event('yt-navigate-finish'));},B);
  const mediaReady=()=>page.waitForFunction(()=>{const v=document.querySelector('video');return v?.readyState>=2&&!v.paused&&v.currentTime>0&&v.played.length>0;});
  const recognizedSources=[];
  for(const ad of ['one','two']) {
   await page.evaluate(()=>document.querySelector('#movie_player').classList.add('ad-showing'));
   await page.locator('video').evaluate((v,ad)=>{v.src=`/fixture.wav?recognized-ad=${ad}`;v.load();return v.play();},ad);
   await mediaReady();await page.waitForTimeout(650);
   const recognizedSource=await page.locator('video').evaluate(v=>v.currentSrc);
   assert(!recognizedSources.includes(recognizedSource),'Each fixture ad must have a distinct source');recognizedSources.push(recognizedSource);
   await page.evaluate(()=>document.querySelector('#movie_player').classList.remove('ad-showing'));
   await page.waitForTimeout(800);assert.equal(await page.locator('video').evaluate(v=>v.currentSrc),recognizedSource);
   assert.deepEqual(await queue(),[A,B,C],'marker removal with unchanged recognized ad source must retain every queue item');
   report.events.push({fixtureRecognizedAd:ad,recognizedSource,queueAfterMarkerClear:await queue()});
   if(ad==='one') {
    await worker.evaluate(()=>chrome.storage.local.set({settings:{enabled:true,toolbar:true,autoQueue:true}}));
    await page.waitForTimeout(600);
    await page.locator('video').evaluate(v=>{v.loop=false;v.currentTime=v.duration-.3;return v.play();});
    await page.waitForFunction(()=>document.querySelector('video')?.ended);await page.waitForTimeout(650);
    assert.equal(new URL(page.url()).searchParams.get('v'),B,'native end of known ad media must not auto-advance');assert.deepEqual(await queue(),[A,B,C]);
    report.events.push({fixtureKnownAdNativeEnd:true,url:page.url(),queue:await queue()});
    await page.locator('video').evaluate(v=>{v.loop=true;});
   }
  }
  await shot('recognized-ad-marker-cleared');
  await page.locator('video').evaluate(v=>{v.removeAttribute('src');v.load();});await page.waitForTimeout(200);
  await page.locator('video').evaluate(v=>{v.src='/fixture.wav?recognized-ad=one';v.load();return v.play();});await mediaReady();await page.waitForTimeout(700);assert.deepEqual(await queue(),[A,B,C]);
  await page.locator('video').evaluate(v=>{const replacement=v.cloneNode(true);v.replaceWith(replacement);return replacement.play();});await mediaReady();await page.waitForTimeout(700);assert.deepEqual(await queue(),[A,B,C]);
  await page.locator('video').evaluate(v=>{v.src='/fixture.wav?genuine-target=B-after-ads';v.load();return v.play();});await mediaReady();
  for(let i=0;i<30 && (await queue()).includes(B);i++)await page.waitForTimeout(200);
  assert.deepEqual(await queue(),[C]);await shot('distinct-target-after-ads');await control.close();
 });
 report.result='passed';
} catch(error) {report.result='failed';report.stage=stage;report.error=error.stack;report.url=page?.url();report.queue=await queue().catch(()=>null);report.media=await page?.locator('#movie_player video').first().evaluate(v=>({readyState:v.readyState,seeking:v.seeking,time:v.currentTime,duration:v.duration,paused:v.paused,ended:v.ended,error:v.error?.message,advertising:Boolean(v.closest('.ad-showing,.ad-interrupting'))})).catch(()=>null);await shot('failure').catch(()=>{});process.exitCode=1;}
finally {await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));await context?.close();console.log(JSON.stringify({output,result:report.result,stage:report.stage,checks:report.checks,error:report.error},null,2));}
