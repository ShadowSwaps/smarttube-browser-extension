// Optional live gap checks. Real signed-out YouTube and unmodified selected
// Enhancer in a fresh isolated profile; no private browser data or desktop input.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const modulePath=process.env.BROWSER_TEST_PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=await import(path.isAbsolute(modulePath)?pathToFileURL(modulePath).href:modulePath);
if(!process.env.ENHANCER_PATH)throw new Error('Set ENHANCER_PATH to the explicitly selected unmodified reference package.');
const extension=path.resolve('dist/extension'), enhancer=path.resolve(process.env.ENHANCER_PATH);
const stamp=Date.now(), output=path.resolve(`test-results/brave-acceptance-${stamp}`);
await mkdir(output,{recursive:true});
const report={kind:'live signed-out Brave compatibility gap checks',headless:true,audio:'--mute-audio',checks:[],candidate:{},events:[]};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function identify(dir,prefix='') {
 for(const entry of await readdir(dir,{withFileTypes:true})) {
  const relative=path.posix.join(prefix,entry.name), file=path.join(dir,entry.name);
  if(entry.isDirectory())await identify(file,relative);
  else report.candidate[relative]=hash(await readFile(file));
 }
}
await identify(extension);
report.harness=hash(await readFile(new URL(import.meta.url)));
const context=await chromium.launchPersistentContext(path.resolve(`.local/brave-acceptance-${stamp}`),{
 executablePath:process.env.BRAVE_PATH || 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
 headless:true,viewport:{width:1280,height:900},
 args:[`--disable-extensions-except=${extension},${enhancer}`,`--load-extension=${extension},${enhancer}`,'--mute-audio','--autoplay-policy=no-user-gesture-required','--disable-brave-update','--disable-component-update']
});
let page,stage='extension setup';
try {
 const deadline=Date.now()+10000;
 while(context.serviceWorkers().length<2 && Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,100));
 const workers=[];
 for(const worker of context.serviceWorkers())workers.push({worker,...await worker.evaluate(()=>({name:chrome.runtime.getManifest().name,id:chrome.runtime.id,version:chrome.runtime.getManifest().version}))});
 const ours=workers.find(w=>w.name==='SmartTube Browser'),other=workers.find(w=>w.name.includes('Enhancer for YouTube'));
 assert(ours && other,'Both real extensions must be active');
 report.extensions=workers.map(({name,version})=>({name,version}));
 report.browserVersion=context.browser().version();
 const referenceOptions=await context.newPage();
 await referenceOptions.goto(`chrome-extension://${other.id}/html/options.html`);
 await referenceOptions.locator('#overridespeeds').check();
 assert.equal(await referenceOptions.locator('#playback-speed').inputValue(),'1');
 report.referenceConfiguration={overrideSpeeds:true,defaultSpeed:1,profile:'fresh; no personal data copied'};
 await ours.worker.evaluate(()=>chrome.storage.local.set({settings:{enabled:true,speed:1.5,toolbar:true,sponsorEnabled:false,cinema:false,filtersEnabled:true,filterBrightness:110}}));
 const options=await context.newPage();
 await options.goto(`chrome-extension://${ours.id}/options.html`);
 page=await context.newPage();
 await page.addInitScript(()=>{
  window.__acceptanceDocument=crypto.randomUUID();window.__acceptanceEvents=[];
  document.addEventListener('fullscreenchange',()=>window.__acceptanceEvents.push({type:'fullscreenchange',active:Boolean(document.fullscreenElement),tag:document.fullscreenElement?.tagName || null,id:document.fullscreenElement?.id || null}));
  document.addEventListener('yt-navigate-finish',()=>window.__acceptanceEvents.push({type:'yt-navigate-finish',path:location.pathname,video:new URL(location.href).searchParams.get('v')}));
  for(const type of ['loadedmetadata','ratechange','loadstart','emptied','durationchange'])document.addEventListener(type,event=>{
   if(event.target.tagName==='VIDEO')window.__acceptanceEvents.push({type,time:performance.now(),video:new URL(location.href).searchParams.get('v'),duration:event.target.duration,rate:event.target.playbackRate,readyState:event.target.readyState});
  },true);
 });
 stage='initial media';
 await page.goto('https://www.youtube.com/watch?v=aqz-KE-bpKQ',{waitUntil:'domcontentloaded',timeout:30000});
 const reject=page.getByRole('button',{name:/Reject/i}).first();
 const consentVisible=await reject.waitFor({state:'visible',timeout:10000}).then(()=>true,error=>{if(error.name==='TimeoutError')return false;throw error;});
 if(consentVisible) {await reject.click();await reject.waitFor({state:'hidden'});}
 report.consent=consentVisible?'Rejected optional cookies in fresh test profile':'No consent control observed within 10 seconds';
 const video=()=>page.locator('#movie_player video').first();
 async function ready() {
  await page.waitForFunction(()=>{const v=document.querySelector('#movie_player video');return v?.readyState>=2&&Number.isFinite(v.duration)&&v.duration>0&&!v.closest('.ad-showing,.ad-interrupting');},{},{timeout:30000});
  await page.waitForSelector('#smarttube-browser-toolbar');
  await page.waitForFunction(()=>document.querySelector('#movie_player video')?.style.filter.includes('brightness(110%)'));
 }
 await ready();await page.waitForTimeout(4500);
 await page.screenshot({path:path.join(output,'collapsed-watching.png')});
 assert.equal(await video().evaluate(v=>v.playbackRate),1.5);
 await video().evaluate(v=>v.pause());
 report.checks.push('Initial live media retains saved 1.5x and video-only filter with Enhancer speed override at 1x.');
 await options.getByLabel('Start videos in cinema mode',{exact:false}).check();
 async function geometry(name) {
  // Wait for actual layout convergence; sample the full four-panel boundary,
  // uncovered player center and absence of accidental native fullscreen.
  await page.waitForFunction(()=>{
   const p=document.querySelector('#movie_player'),b=document.querySelector('#smarttube-cinema-backdrop');if(!p||!b)return false;
   const r=p.getBoundingClientRect(),w=innerWidth,h=innerHeight,l=Math.max(0,Math.min(w,r.left)),rr=Math.max(0,Math.min(w,r.right)),t=Math.max(0,Math.min(h,r.top)),bt=Math.max(0,Math.min(h,r.bottom));
   if(rr<=l||bt<=t)return false;
   const expected=[[0,0,w,t],[0,bt,w,h-bt],[0,t,l,bt-t],[rr,t,w-rr,bt-t]];
   return [...b.children].every((el,i)=>{const q=el.getBoundingClientRect();return [q.x,q.y,q.width,q.height].every((n,j)=>Math.abs(n-expected[i][j])<1);})&&p.contains(document.elementFromPoint((l+rr)/2,(t+bt)/2));
  },{},{timeout:8000});
  report.checks.push(name);
  report.events.push({name,...await page.evaluate(()=>{const r=document.querySelector('#movie_player').getBoundingClientRect();return {viewport:[innerWidth,innerHeight],scrollY,player:{x:r.x,y:r.y,width:r.width,height:r.height},fullscreen:document.fullscreenElement?.id || null};})});
  assert(await page.locator('#smarttube-browser-toolbar').evaluate(h=>{const a=h.getBoundingClientRect(),b=h.parentElement.getBoundingClientRect();return a.left>=b.left-1&&a.right<=b.right+1&&a.top>=b.top-1&&a.bottom<=b.bottom-55;}),'Tools must stay inside player and above native bottom controls');
 }
 stage='native fullscreen';
 await geometry('Cinema matches the initial live player boundaries and preserves center hit testing.');
 await page.locator('#movie_player').hover();
 await page.locator('.ytp-fullscreen-button').click();
 await page.waitForFunction(()=>{const f=document.fullscreenElement,p=document.querySelector('#movie_player');return Boolean(f && (f.contains(p)||p.contains(f)));});
 await page.locator('#smarttube-cinema-backdrop').waitFor({state:'detached'});
 assert.equal(await video().evaluate(v=>v.style.filter.includes('brightness(110%)')),true);
 const fullscreenPosition=await video().evaluate(v=>v.currentTime);
 if(await page.getByRole('button',{name:'SmartTube controls',exact:true}).getAttribute('aria-expanded')==='false') await page.getByRole('button',{name:'SmartTube controls',exact:true}).click();
 await page.getByRole('button',{name:'Forward ten seconds'}).click();
 await page.waitForFunction(before=>document.querySelector('#movie_player video').currentTime>=before+9,fullscreenPosition);
 report.checks.push('SmartTube toolbar seeking remains clickable during actual native fullscreen.');
 await page.screenshot({path:path.join(output,'native-fullscreen.png')});
 // Use the site's own native fullscreen control for exit as well.
 await page.locator('#movie_player').hover();await page.locator('.ytp-fullscreen-button').click();
 await page.waitForFunction(()=>!document.fullscreenElement);
 await geometry('Actual YouTube native fullscreen entry suspends cinema, exit resumes it, and filters remain applied.');
 stage='resize and scroll';
 for(const viewport of [{width:980,height:720},{width:1600,height:1000},{width:1280,height:900}]) {
  await page.setViewportSize(viewport);await geometry(`Live resize ${viewport.width}x${viewport.height} retains an uncovered player and aligned panels.`);
 }
 await page.evaluate(()=>scrollTo(0,200));
 await geometry('Partly scrolled live player retains aligned cinema panels and hit testing.');
 await page.screenshot({path:path.join(output,'scrolled-cinema.png')});
 await page.evaluate(()=>scrollTo(0,document.querySelector('#movie_player').getBoundingClientRect().bottom+scrollY+100));
 await page.waitForFunction(()=>scrollY>200);
 // The selected reference's fresh defaults float the real player on deep
 // scroll. Assert that observed layout explicitly; do not call it offscreen.
 await geometry('Deep scroll with fresh Enhancer keeps the floating live player uncovered and all cinema panels aligned.');
 await page.evaluate(()=>scrollTo(0,0));
 await geometry('Scrolling back from the reference floating player restores the regular aligned cinema layout.');
 // Suspend saved cinema only for navigating the site outside its dim panels.
 await page.keyboard.press('Escape');await page.locator('#smarttube-cinema-backdrop').waitFor({state:'detached'});
 stage='live SPA media transition';
 const documentId=await page.evaluate(()=>window.__acceptanceDocument);
 const firstMedia=await video().evaluate(v=>{window.__acceptanceOldVideo=v;return {source:v.currentSrc,duration:v.duration};});
 const links=page.locator('#related a[href*="/watch?v="]');
 await links.first().waitFor({state:'attached',timeout:15000});
 let nextLink;
 for(let i=0;i<await links.count();i++) {
  const candidate=links.nth(i),href=await candidate.getAttribute('href');
  if(href && new URL(href,'https://www.youtube.com').searchParams.get('v')!=='aqz-KE-bpKQ' && await candidate.isVisible()){nextLink=candidate;break;}
 }
 assert(nextLink,'A visible actual related-video link is required for live SPA navigation');
 const nextId=new URL(await nextLink.getAttribute('href'),'https://www.youtube.com').searchParams.get('v');
 await nextLink.click();await page.waitForURL(url=>url.searchParams.get('v')===nextId);await ready();
 assert.equal(await page.evaluate(()=>window.__acceptanceDocument),documentId,'Must be same-document YouTube SPA navigation');
 await page.waitForFunction(before=>{const v=document.querySelector('#movie_player video');return v.currentSrc!==before.source || v.duration!==before.duration;},firstMedia);
 // URL changes can precede an ad/media swap. The initial ready() may still
 // describe the outgoing video. Observe settled incoming non-ad media before
 // asserting saved speed; SmartTube deliberately leaves advertising alone.
 await page.evaluate(()=>{window.__acceptanceContentSince=0;});
 await page.waitForFunction(()=>{
  const v=document.querySelector('#movie_player video');
  const content=v?.readyState>=2&&Number.isFinite(v.duration)&&v.duration>0&&!v.closest('.ad-showing,.ad-interrupting');
  if(!content)window.__acceptanceContentSince=0;
  else if(!window.__acceptanceContentSince)window.__acceptanceContentSince=performance.now();
  return content && performance.now()-window.__acceptanceContentSince>=4500;
 },{},{timeout:120000});
 assert.equal(await video().evaluate(v=>v.playbackRate),1.5);
 report.settledIncomingMedia=await video().evaluate(v=>({rate:v.playbackRate,duration:v.duration,readyState:v.readyState,advertising:Boolean(v.closest('.ad-showing,.ad-interrupting'))}));
 report.events.push({name:'media transition',videoId:nextId,...await page.evaluate(()=>({sameVideoNode:window.__acceptanceOldVideo===document.querySelector('#movie_player video'),oldNodeConnected:window.__acceptanceOldVideo.isConnected,oldFilter:window.__acceptanceOldVideo.style.filter}))});
 if(!await page.evaluate(()=>window.__acceptanceOldVideo.isConnected))assert.equal(await page.evaluate(()=>window.__acceptanceOldVideo.style.filter),'');
 report.checks.push('Actual related-link SPA navigation changes settled non-ad live media within the same document and reapplies saved speed/filter; detached media is restored if replaced.');
 stage='live layout switches after SPA';
 for(const [label,selector] of [['Hide comments','ytd-watch-flexy #comments'],['Hide related videos','ytd-watch-flexy #related']]) {
  const target=page.locator(selector).first();await target.waitFor({state:'visible',timeout:20000});
  const before=await target.evaluate(el=>getComputedStyle(el).display);assert.notEqual(before,'none');
  await options.getByLabel(label,{exact:true}).check();await page.waitForFunction(s=>getComputedStyle(document.querySelector(s)).display==='none',selector);
  await options.getByLabel(label,{exact:true}).uncheck();await page.waitForFunction(({s,before})=>getComputedStyle(document.querySelector(s)).display===before,{s:selector,before});
 }
 report.checks.push('Live comments/related visibility restores after actual SPA media navigation.');
 stage='leave watch and return';
 await page.evaluate(()=>scrollTo(0,0));
 if(await page.getByRole('button',{name:'SmartTube controls',exact:true}).getAttribute('aria-expanded')==='false') await page.getByRole('button',{name:'SmartTube controls',exact:true}).click();
 await page.getByRole('button',{name:'Toggle cinema mode'}).click();
 await geometry('Cinema follows the incoming live media after SPA navigation and layout switches.');
 await video().evaluate(v=>{window.__acceptanceLeavingVideo=v;});
 // Focus/Enter activates the real site link while cinema is active, allowing
 // verification of its SPA cleanup without using the dim-panel exit action.
 await page.locator('a#logo').first().focus();await page.keyboard.press('Enter');await page.waitForURL(url=>url.pathname==='/');
 assert.equal(await page.evaluate(()=>window.__acceptanceDocument),documentId);
 await page.locator('#smarttube-cinema-backdrop').waitFor({state:'detached'});
 await page.waitForFunction(()=>window.__acceptanceLeavingVideo.style.filter==='');
 await page.goBack({waitUntil:'domcontentloaded'});await ready();
 assert.equal(await page.evaluate(()=>window.__acceptanceDocument),documentId);
 await options.getByLabel('Start videos in cinema mode',{exact:false}).uncheck();
 await options.getByLabel('Start videos in cinema mode',{exact:false}).check();
 await page.evaluate(()=>scrollTo(0,0));await geometry('Leaving watch through real SPA navigation clears appearance; returning supports cinema and filters again.');
 await page.screenshot({path:path.join(output,'returned-player.png')});
 report.result='passed';
} catch(error) {
 report.result='failed';report.stage=stage;report.error=error.message;
 report.diagnostics=await page?.evaluate(()=>{const p=document.querySelector('#movie_player'),r=p?.getBoundingClientRect(),v=p?.querySelector('video');return {time:performance.now(),media:v?{duration:v.duration,rate:v.playbackRate,readyState:v.readyState}:null,status:document.querySelector('#smarttube-browser-toolbar')?.shadowRoot?.querySelector('[data-status]')?.textContent,fullscreen:{active:Boolean(document.fullscreenElement),tag:document.fullscreenElement?.tagName||null,id:document.fullscreenElement?.id||null},player:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,panels:[...document.querySelectorAll('[data-cinema-panel]')].map(el=>({style:el.getAttribute('style')})),centerHit:r?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.tagName:null};}).catch(()=>null);
 await page?.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});
 throw error;
} finally {
 if(page)report.pageEvents=await page.evaluate(()=>window.__acceptanceEvents).catch(()=>[]);
 await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
 await context.close();console.log(JSON.stringify({output,...report},null,2));
}
