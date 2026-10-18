// Silent isolated Brave: native media fixtures and real keyboard/pointer/wheel
// events. No normal-profile data, external community service or desktop input.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {installNativeVolumeFixture} from './fixtures/native-volume.mjs';
const modulePath=process.env.BROWSER_TEST_PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=await import(path.isAbsolute(modulePath)?pathToFileURL(modulePath).href:modulePath);
const stamp=Date.now(), extension=path.resolve('dist/extension');
const profile=path.resolve(`.local/restart-volume-${stamp}`), output=path.resolve(`test-results/restart-volume-${stamp}`);
await mkdir(output,{recursive:true});
const hash=x=>createHash('sha256').update(x).digest('hex');
const report={kind:'deterministic native media fixtures',headless:true,audio:'--mute-audio',checks:[],candidate:{},output};
for(const f of await readdir(extension))if(/\.(js|json|html|css)$/.test(f))report.candidate[f]=hash(await readFile(path.join(extension,f)));
report.harness=hash(await readFile(new URL(import.meta.url)));
const launch={executablePath:process.env.BRAVE_PATH || 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,viewport:{width:1100,height:850},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--mute-audio','--disable-brave-update','--disable-component-update']};
const wav=Buffer.alloc(44+30*8000*2);
wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
const fixture=`<!doctype html><title>Volume fixture - YouTube</title><style>body{margin:0;height:2200px}#movie_player{position:relative;width:800px;height:450px}video{width:800px;height:450px}.ytp-volume-area{position:absolute;bottom:0}</style><div id="movie_player" class="html5-video-player" tabindex="0"><video src="/fixture.wav" muted></video><div class="ytp-volume-area"><button class="ytp-mute-button">Native mute</button><input class="ytp-volume-slider" aria-label="Native volume" type="range" min="0" max="1" step=".01" oninput="document.querySelector('video').volume=Number(this.value)"></div></div><input aria-label="Page input">`;
let context,worker,page,options,id,stage='launch';
async function launchBrowser() {
 context=await chromium.launchPersistentContext(profile,launch);report.browser=context.browser().version();
 await context.addInitScript(installNativeVolumeFixture);
 await context.route('https://www.youtube.com/**',route=>{
  if(new URL(route.request().url()).pathname==='/fixture.wav')return route.fulfill({contentType:'audio/wav',body:wav});
  return route.fulfill({contentType:'text/html',body:fixture});
 });
 worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');id=await worker.evaluate(()=>chrome.runtime.id);
 options=await context.newPage();await options.goto(`chrome-extension://${id}/options.html`);await options.getByLabel('Apply starting volume',{exact:false}).waitFor();
 page=await context.newPage();
}
async function setting(patch) {
 const result=await options.evaluate(settings=>chrome.runtime.sendMessage({type:'SET_SETTINGS',settings}),patch);assert(result.ok);await page.waitForTimeout(100);
}
async function open(videoId='abcdefghijk') {await page.goto(`https://www.youtube.com/watch?v=${videoId}`);await page.waitForSelector('#smarttube-player-entry');await page.waitForFunction(()=>document.querySelector('video').readyState>=1);}
const volume=()=>page.locator('video').evaluate(v=>v.volume);
const level=async value=>{await page.locator('video').evaluate((v,x)=>{v.pause();v.volume=x;},value);};
const atFive=()=>page.waitForFunction(()=>Math.abs(document.querySelector('video').volume-.05)<.001);
const check=async(name,fn)=>{stage=name;await fn();report.checks.push(name);};
async function wheel(keys,dy=-100,x=300,y=200) {
 await page.mouse.move(x,y);for(const k of keys)await page.keyboard.down(k);await page.mouse.wheel(0,dy);for(const k of [...keys].reverse())await page.keyboard.up(k);await page.waitForTimeout(120);
}
try {
 await launchBrowser();await open();
 await check('Fresh defaults enable wheel, verified5% startup unmute and fixed normal1x speed',async()=>{await atFive();assert.equal(await page.locator('video').evaluate(v=>v.muted),false);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1);assert.equal(await options.getByLabel('Starting volume (%)',{exact:true}).inputValue(),'5');assert.equal(await options.getByLabel('Apply starting volume',{exact:false}).isChecked(),true);assert.equal(await options.getByLabel('Mouse-wheel playback controls',{exact:false}).isChecked(),true);assert.equal(await options.locator('#speed,#applySpeed').count(),0);await level(0);await wheel(['Alt']);assert(Math.abs(await volume()-.05)<.001);});
 await check('Separate native/media/ARIA state stays synchronized for preference, wheel and native steps',async()=>{
  const levels=()=>page.evaluate(()=>{const p=document.querySelector('#movie_player'),v=p.querySelector('video');return {media:v.volume,native:p.getVolume(),aria:Number(p.querySelector('.ytp-volume-panel').getAttribute('aria-valuenow')),muted:v.muted,nativeMuted:p.isMuted()};});
  await page.evaluate(()=>{const p=document.querySelector('#movie_player');p.setVolume(5);p.mute();});await setting({startupVolume:4});await page.waitForFunction(()=>document.querySelector('video').volume===.04);assert.deepEqual(await levels(),{media:.04,native:4,aria:4,muted:false,nativeMuted:false});
  await setting({startupVolume:5});await atFive();await wheel(['Alt'],100);assert.deepEqual(await levels(),{media:0,native:0,aria:0,muted:false,nativeMuted:false});await wheel(['Alt']);assert.deepEqual(await levels(),{media:.05,native:5,aria:5,muted:false,nativeMuted:false});
  await setting({startupVolume:4});await page.waitForFunction(()=>document.querySelector('video').volume===.04);await page.locator('#movie_player').focus();await page.keyboard.press('ArrowDown');await page.waitForTimeout(650);assert.equal((await levels()).media,0);assert.equal((await levels()).native,0);
  await setting({startupVolume:5});await atFive();const panel=page.locator('.ytp-volume-panel');const b=await panel.boundingBox();await page.mouse.click(b.x+4,b.y+10);await page.waitForTimeout(650);assert.deepEqual(await levels(),{media:.04,native:4,aria:4,muted:false,nativeMuted:false});
  await page.evaluate(()=>{const p=document.querySelector('#movie_player');p.setVolume(5);p.mute();});await setting({startupVolume:5});
 });
 await check('Missing native API never falls back to media-only success; forged/stale receipts grant no settings changes',async()=>{
  await page.evaluate(()=>{const p=document.querySelector('#movie_player');p.setVolume(5);window.__nativeSetter=p.setVolume;p.setVolume=undefined;window.__fakeReply=e=>{const r=JSON.parse(e.detail);e.target.dispatchEvent(new CustomEvent('smarttube-volume-receipt-v1',{detail:JSON.stringify({version:1,id:r.id,ok:true})}));};document.addEventListener('smarttube-volume-request-v1',window.__fakeReply);});
  await setting({startupVolume:4});await page.waitForTimeout(700);assert.equal(await volume(),.05);assert.equal(await page.locator('.ytp-volume-panel').getAttribute('aria-valuenow'),'5');
  const stored=(await worker.evaluate(()=>chrome.storage.local.get('settings'))).settings;assert.equal(stored.startupVolume,4);assert.equal(stored.enabled,true);
  await page.evaluate(()=>{document.removeEventListener('smarttube-volume-request-v1',window.__fakeReply);document.querySelector('#movie_player').setVolume=window.__nativeSetter;});await page.waitForFunction(()=>document.querySelector('video').volume===.04);
  await page.locator('video').evaluate(v=>v.dispatchEvent(new CustomEvent('smarttube-volume-receipt-v1',{detail:JSON.stringify({version:1,id:'stale',ok:true})})));assert.equal(await volume(),.04);await setting({startupVolume:5});await atFive();
 });
 await check('Real platform mute accessor rejects all own descriptors without native unmute, mutation or false success',async()=>{
  await setting({applyVolume:false});
  report.ownMuteDescriptors=await page.evaluate(()=>{
   const p=document.querySelector('#movie_player'),v=p.querySelector('video'),platform=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'muted'),unmute=p.unMute,setVolume=p.setVolume,results=[];
   v.pause();p.setVolume(5);
   const run=descriptor=>{
    p.unMute();platform.set.call(v,true);Object.defineProperty(v,'muted',descriptor);
    const before=Object.getOwnPropertyDescriptor(v,'muted'),initial={platform:platform.get.call(v),native:p.isMuted(),volume:v.volume};let unmutes=0,sets=0,receipt;
    p.unMute=()=>{unmutes++;};p.setVolume=()=>{sets++;};
    const receive=e=>{receipt=JSON.parse(e.detail);};v.addEventListener('smarttube-volume-receipt-v1',receive);
    v.dispatchEvent(new CustomEvent('smarttube-volume-request-v1',{bubbles:true,detail:JSON.stringify({version:1,id:'own-descriptor',percent:5,unmute:true,videoId:new URL(location.href).searchParams.get('v'),source:v.currentSrc})}));
    v.removeEventListener('smarttube-volume-receipt-v1',receive);const after=Object.getOwnPropertyDescriptor(v,'muted');
    const result={ok:receipt?.ok,unmutes,sets,unchanged:Reflect.ownKeys(before).every(k=>Object.is(before[k],after[k])),physicalUnchanged:platform.get.call(v)===initial.platform,nativeUnchanged:p.isMuted()===initial.native,volumeUnchanged:v.volume===initial.volume};
    p.unMute=unmute;p.setVolume=setVolume;results.push(result);return descriptor.configurable;
   };
   for(const value of [true,false])for(const writable of [true,false])for(const enumerable of [true,false]){run({value,writable,enumerable,configurable:true});delete v.muted;}
   let writes=0;run({configurable:true,get:()=>false,set:()=>{writes++;}});delete v.muted;
   run({value:false,writable:true,configurable:false});
   return {results,writes};
  });
  assert.equal(report.ownMuteDescriptors.results.length,10);assert.equal(report.ownMuteDescriptors.writes,0);
  for(const r of report.ownMuteDescriptors.results)assert.deepEqual(r,{ok:false,unmutes:0,sets:0,unchanged:true,physicalUnchanged:true,nativeUnchanged:true,volumeUnchanged:true});
  await page.reload();await setting({applyVolume:true});await atFive();
 });
 await check('Real platform stays muted through native volume restoration and guard cleanup on success or throw',async()=>{
  await setting({applyVolume:false});
  report.platformMuteGuard=await page.evaluate(()=>{
   const p=document.querySelector('#movie_player'),v=p.querySelector('video'),platform=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'muted'),unmute=p.unMute,setVolume=p.setVolume,results=[];
   v.pause();
   for(const mode of ['success','unmute-throw','reapply-throw']) {
    p.mute();p.setVolume(5);const trace=[];let sets=0,receipt;
    p.setVolume=n=>{setVolume(n);trace.push({volume:n,platformMuted:platform.get.call(v)});if(mode==='reapply-throw'&&++sets===3)throw new Error('partial reapply');};
    p.unMute=()=>{unmute();p.setVolume(100);if(mode==='unmute-throw')throw new Error('partial unmute');};
    const receive=e=>{receipt=JSON.parse(e.detail);};v.addEventListener('smarttube-volume-receipt-v1',receive);
    v.dispatchEvent(new CustomEvent('smarttube-volume-request-v1',{bubbles:true,detail:JSON.stringify({version:1,id:mode,percent:5,unmute:true,videoId:new URL(location.href).searchParams.get('v'),source:v.currentSrc})}));
    v.removeEventListener('smarttube-volume-receipt-v1',receive);results.push({mode,ok:receipt?.ok,trace,ownAbsent:!Object.hasOwn(v,'muted'),platformMuted:platform.get.call(v),volume:v.volume});p.unMute=unmute;p.setVolume=setVolume;
   }
   p.setVolume(5);p.mute();return results;
  });
  for(const r of report.platformMuteGuard){assert.equal(r.ok,r.mode==='success');assert(r.ownAbsent);assert(r.trace.some(n=>n.volume===100));assert(r.trace.filter(n=>n.volume>5).every(n=>n.platformMuted));assert.equal(r.platformMuted,r.mode!=='success');if(r.mode!=='unmute-throw')assert.equal(r.volume,.05);}
  await setting({applyVolume:true});await atFive();
 });
 await check('Delayed startup reset is corrected; expired startup leaves later volume alone',async()=>{
  await page.reload();await atFive();await page.waitForTimeout(650);await level(.8);await atFive();await page.waitForTimeout(4300);await level(.17);await page.waitForTimeout(650);assert.equal(await volume(),.17);
 });
 await check('Native volume pointer gesture cancels early correction and mute remains usable',async()=>{
  await page.reload();await atFive();const slider=page.getByLabel('Native volume',{exact:true});await slider.click();await level(.13);await page.waitForTimeout(650);assert.equal(await volume(),.13);
  const before=await page.locator('video').evaluate(v=>v.muted);await page.getByRole('button',{name:'Native mute',exact:true}).click();assert.equal(await page.locator('video').evaluate(v=>v.muted),!before);
 });
 await check('Native mute keyboard gesture cancels early correction; page inputs remain available',async()=>{
  await page.reload();await atFive();await page.locator('#movie_player').focus();await page.keyboard.press('m');await level(.12);await page.waitForTimeout(650);assert.equal(await volume(),.12);assert.equal(await page.locator('video').evaluate(v=>v.muted),true);
  await page.getByLabel('Page input').fill('m');assert.equal(await page.getByLabel('Page input').inputValue(),'m');
 });
 await check('Chosen real Alt-wheel volume and Alt-Shift-wheel speed; regular scroll and Ctrl unaffected',async()=>{
  await setting({wheelControls:true,speed:1,applySpeed:true});await page.reload();await atFive();await level(0);await wheel(['Alt']);assert(Math.abs(await volume()-.05)<.001);await page.waitForTimeout(650);assert(Math.abs(await volume()-.05)<.001);
  const notice=page.locator('#smarttube-volume-notice');assert.equal(await notice.getByRole('status').innerText(),'Volume 5%');assert.equal(await notice.evaluate(e=>getComputedStyle(e).pointerEvents),'none');
  await notice.waitFor({state:'hidden'});
  await wheel(['Alt'],100);assert.equal(await volume(),0);await page.waitForTimeout(650);assert.equal(await volume(),0,'Wheel adjustment cancels startup correction even below the saved default');await wheel(['Alt']);assert(Math.abs(await volume()-.05)<.001);
  await wheel(['Alt','Shift']);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1.05);
  assert.equal(await notice.getByRole('status').innerText(),'Speed 1.05×');assert.equal(await page.locator('#movie_player').evaluate(p=>p.getPlaybackRate()),1.05);assert.equal(await page.getByLabel('Native playback speed',{exact:true}).innerText(),'Playback speed 1.05×');
  await wheel(['Control']);assert(Math.abs(await volume()-.05)<.001);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1.05);
  await wheel([],100);assert(await page.evaluate(()=>scrollY>0));assert(Math.abs(await volume()-.05)<.001);await page.evaluate(()=>scrollTo(0,0));
  await setting({toolbar:false});await level(0);await wheel(['Alt']);await notice.waitFor({state:'visible'});assert.equal(await notice.getByRole('status').innerText(),'Volume 5%');await page.screenshot({path:path.join(output,'wheel-volume-notice.png')});await setting({toolbar:true});
 });
 await check('Native speed range is truthful, failure has no DOM-only fallback and manual choices survive replacement',async()=>{
  await page.reload();await atFive();await page.locator('#movie_player').evaluate(p=>p.dataset.nativeMaxRate='2');
  const control=rate=>worker.evaluate(async rate=>{for(const tab of await chrome.tabs.query({})){const state=await chrome.tabs.sendMessage(tab.id,{type:'PLAYER_STATUS'}).catch(()=>null);if(state?.videoId)return chrome.tabs.sendMessage(tab.id,{type:'CONTROL',action:'speed',value:rate});}throw new Error('Owned fixture tab unavailable');},rate);
  await control(3);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),2);assert.equal(await page.locator('#movie_player').evaluate(p=>p.getPlaybackRate()),2);assert.equal(await page.locator('#smarttube-volume-notice').getByRole('status').innerText(),'Speed 2.00× · YouTube limit');
  await control(1.55);assert.equal(await page.getByLabel('Native playback speed',{exact:true}).innerText(),'Playback speed 1.55×');
  await page.locator('#movie_player').evaluate(p=>{window.__speedSetter=p.setPlaybackRate;p.setPlaybackRate=undefined;});const failed=await control(1.75);assert.equal(failed.ok,false);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1.55);
  await page.locator('#movie_player').evaluate(p=>{p.setPlaybackRate=window.__speedSetter;const old=p.querySelector('video'),next=old.cloneNode(true);next.playbackRate=p.getPlaybackRate();old.replaceWith(next);});await page.waitForTimeout(650);assert.equal(await page.locator('#movie_player').evaluate(p=>p.getPlaybackRate()),1.55);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1.55);
  await page.reload();await atFive();assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1);assert.equal(await page.getByLabel('Native playback speed',{exact:true}).innerText(),'Playback speed Normal (1×)');
 });
 await check('Legacy saved speed and opt-out never replace fixed1x on new video; manual speed remains local',async()=>{
  await setting({speed:1.75,applySpeed:false});await page.reload();await atFive();assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1);await wheel(['Alt','Shift']);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1.05);await page.waitForTimeout(650);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),1.05);
  await page.evaluate(()=>{history.pushState({},'','/watch?v=lmnopqrstuv');document.dispatchEvent(new Event('yt-navigate-finish'));});await page.waitForFunction(()=>document.querySelector('video').playbackRate===1);assert.equal(await page.locator('#movie_player').evaluate(p=>p.getPlaybackRate()),1);await open();
 });
 await check('Notice clears fixed masthead/viewport overlap and remains visible with toolbar off, cinema and native fullscreen',async()=>{
  await setting({toolbar:false});await page.evaluate(()=>{window.scrollTo(0,0);const h=document.createElement('div');h.id='masthead-container';h.style.cssText='position:fixed;left:0;top:0;width:100%;height:56px;background:#fff;z-index:1000';document.body.append(h);document.querySelector('#movie_player').setVolume(5);});
  const visible=()=>page.locator('#smarttube-volume-notice').evaluate(h=>{const p=h.parentElement,r=h.getBoundingClientRect(),b=p.getBoundingClientRect(),header=document.querySelector('#masthead-container').getBoundingClientRect();const fullscreen=!!document.fullscreenElement;return {top:r.top,headerBottom:header.bottom,inside:r.left>=Math.max(0,b.left)&&r.right<=Math.min(innerWidth,b.right)&&r.top>=Math.max(0,b.top)&&r.bottom<=Math.min(innerHeight,b.bottom),uncovered:p.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)),fullscreen,hidden:h.hidden,pointer:getComputedStyle(h).pointerEvents};});
  await wheel(['Alt'],100);let g=await visible();assert(g.inside&&g.uncovered&&!g.hidden&&g.top>=g.headerBottom);assert.equal(g.pointer,'none');await page.screenshot({path:path.join(output,'volume-notice-masthead.png')});
  await setting({cinema:true});await wheel(['Alt']);g=await visible();assert(g.inside&&g.uncovered&&g.top>=g.headerBottom);assert.equal(await page.locator('#smarttube-cinema-backdrop').count(),1);await setting({cinema:false});
  await page.evaluate(()=>{const b=document.createElement('button');b.id='fixture-fullscreen';b.textContent='Enter native fullscreen';b.style.cssText='position:absolute;left:850px;top:80px';b.onclick=()=>document.querySelector('#movie_player').requestFullscreen();document.body.append(b);});await page.getByRole('button',{name:'Enter native fullscreen',exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);await wheel(['Alt'],100);g=await visible();assert(g.fullscreen&&g.inside&&g.uncovered&&!g.hidden);await page.screenshot({path:path.join(output,'volume-notice-fullscreen.png')});await page.evaluate(()=>document.exitFullscreen());await page.waitForFunction(()=>!document.fullscreenElement);
  await page.evaluate(()=>{document.querySelector('#masthead-container').remove();document.querySelector('#fixture-fullscreen').remove();document.querySelector('#movie_player').setVolume(5);});await setting({toolbar:true});
 });
 await check('Ads exclude wheel; startup volume covers ad-to-content and early replacement without undoing later manual changes',async()=>{
  await page.reload();await atFive();await page.locator('#movie_player').evaluate(e=>e.classList.add('ad-showing'));await level(0);await wheel(['Alt']);assert.equal(await volume(),0);await atFive();
  await page.locator('#movie_player').evaluate(e=>e.classList.remove('ad-showing'));await page.locator('video').evaluate(v=>{const n=v.cloneNode(true);n.volume=.7;v.replaceWith(n);});await atFive();
  await page.locator('#movie_player').focus();await page.keyboard.press('ArrowDown');await page.locator('video').evaluate(v=>{const n=v.cloneNode(true);n.volume=.11;v.replaceWith(n);});await page.waitForTimeout(650);assert.equal(await volume(),.11);
 });
 await check('A continuously competing startup setter causes at most four corrections and then stops',async()=>{
  await page.reload();await atFive();await page.evaluate(()=>{window.__corrections=1;document.querySelector('video').addEventListener('volumechange',()=>{if(Math.abs(document.querySelector('video').volume-.05)<.001)window.__corrections++;});window.__competing=setInterval(()=>document.querySelector('video').volume=.8,80);});
  await page.waitForTimeout(3000);const corrections=await page.evaluate(()=>{clearInterval(window.__competing);return window.__corrections;});assert(corrections<=4);await level(.8);await page.waitForTimeout(650);assert.equal(await volume(),.8);report.correctionCount=corrections;
 });
 await check('Throwing native API consumes the four-attempt budget and cannot restart after expiry',async()=>{
  await page.reload();await atFive();await page.evaluate(()=>{const p=document.querySelector('#movie_player');window.__setter=p.setVolume;window.__attempts=0;p.setVolume=()=>{window.__attempts++;throw new Error('fixture native API failure');};});await setting({startupVolume:4});await page.waitForTimeout(2600);assert.equal(await page.evaluate(()=>window.__attempts),4);assert.equal(await volume(),.05);await page.evaluate(()=>document.querySelector('#movie_player').setVolume=window.__setter);await page.waitForTimeout(650);assert.equal(await volume(),.05);await setting({startupVolume:5});await atFive();
 });
 await check('Preference opt-out, extension disable and tab pause leave volume alone; resume reapplies 5%',async()=>{
  await setting({applyVolume:false});await page.reload();await page.waitForSelector('#smarttube-player-entry');await level(.21);await page.waitForTimeout(650);assert.equal(await volume(),.21);
  await setting({applyVolume:true,enabled:false});await level(.22);await page.waitForTimeout(650);assert.equal(await volume(),.22);await setting({enabled:true});await atFive();
  await page.locator('#movie_player').focus();await page.keyboard.press('Alt+Shift+S');await level(.23);await page.waitForTimeout(650);assert.equal(await volume(),.23);assert.equal(await page.locator('#smarttube-player-entry').evaluate(e=>e.hidden),true);await page.keyboard.press('Alt+Shift+S');await atFive();
 });
 await check('Starting volume UI saves 5%, validates boundaries, and survives reload',async()=>{
  await options.getByLabel('Starting volume (%)',{exact:true}).fill('7');await options.getByLabel('Starting volume (%)',{exact:true}).press('Tab');await options.getByText('Saved on this device.',{exact:true}).waitFor();await page.waitForFunction(()=>Math.abs(document.querySelector('video').volume-.07)<.001);
  await options.getByLabel('Starting volume (%)',{exact:true}).fill('5');await options.getByLabel('Starting volume (%)',{exact:true}).press('Tab');await atFive();await options.reload();assert.equal(await options.getByLabel('Starting volume (%)',{exact:true}).inputValue(),'5');
  await options.getByLabel('Apply starting volume',{exact:false}).uncheck();await options.getByLabel('Starting volume (%)',{exact:true}).waitFor();assert.equal(await options.getByLabel('Starting volume (%)',{exact:true}).isDisabled(),true);
  await options.getByLabel('Apply starting volume',{exact:false}).check();await page.waitForTimeout(150);assert.equal(await options.getByLabel('Starting volume (%)',{exact:true}).isEnabled(),true);await atFive();
 });
 await check('SPA video navigation reapplies 5% after a deliberate volume change',async()=>{
  await page.locator('#movie_player').focus();await page.keyboard.press('ArrowDown');await level(.14);await page.evaluate(()=>{history.pushState({},'','/watch?v=lmnopqrstuv');document.dispatchEvent(new Event('yt-navigate-finish'));});await atFive();
 });
 await setting({speed:1.5,wheelControls:true,applyVolume:true,startupVolume:5});
 await check('Actual Brave process close/relaunch retains volume, wheel and speed settings and applies them to media',async()=>{
  await context.close();await launchBrowser();const stored=await worker.evaluate(()=>chrome.storage.local.get('settings'));assert.equal(stored.settings.startupVolume,5);assert.equal(stored.settings.applyVolume,true);assert.equal(stored.settings.wheelControls,true);assert.equal(stored.settings.speed,1.5);
  await open();await atFive();await page.waitForFunction(()=>document.querySelector('video').playbackRate===1);assert.equal(await page.locator('video').evaluate(v=>v.muted),false);await level(0);await wheel(['Alt']);assert(Math.abs(await volume()-.05)<.001);
  await page.locator('video').evaluate(v=>{v.volume=.05;v.muted=true;});assert.equal(await volume(),.05);await page.locator('video').evaluate(v=>v.play());assert.equal(await volume(),.05);await page.locator('video').evaluate(v=>v.pause());
  await options.screenshot({path:path.join(output,'volume-settings.png'),fullPage:true});
 });
 console.log(JSON.stringify({status:'passed',checks:report.checks.length,output}));
} catch(error) {report.failure={stage,error:error.stack};console.error(error);process.exitCode=1;}
finally {await context?.close();await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));}
