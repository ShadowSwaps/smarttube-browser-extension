// Focused UI integration checks. --live observes signed-out YouTube; default
// uses a deterministic native-control DOM fixture, not a service substitute.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {installNativeVolumeFixture} from './fixtures/native-volume.mjs';
const modulePath=process.env.BROWSER_TEST_PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=await import(path.isAbsolute(modulePath)?pathToFileURL(modulePath).href:modulePath);
const live=process.argv.includes('--live'), stamp=Date.now();
const output=path.resolve(`test-results/player-ui-${live?'live':'fixture'}-${stamp}`), extension=path.resolve('dist/extension');
await mkdir(output,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={kind:live?'signed-out public YouTube':'deterministic native DOM fixture',audio:'--mute-audio',headless:true,output,candidate:{},checks:[],observations:[]};
for(const f of await readdir(extension))if(/\.(js|html|css|json)$/.test(f))report.candidate[f]=hash(await readFile(path.join(extension,f)));
report.harness=hash(await readFile(new URL(import.meta.url)));
const context=await chromium.launchPersistentContext(path.resolve(`.local/player-ui-${stamp}`),{executablePath:process.env.BRAVE_PATH || 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,hasTouch:true,viewport:{width:1280,height:900},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--mute-audio','--autoplay-policy=no-user-gesture-required','--disable-component-update','--disable-brave-update']});
report.browser=context.browser().version();let page;
const check=async(name,fn)=>{await fn();report.checks.push(name);};
try {
 if(!live)await context.addInitScript(installNativeVolumeFixture);
 if(!live)await context.route('https://www.youtube.com/**',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><title>UI fixture - YouTube</title><style>body{margin:20px;background:#111;color:white}#movie_player{position:relative;width:min(880px,100%);aspect-ratio:16/9;background:#333}video{width:100%;height:100%}.ytp-chrome-bottom{position:absolute;bottom:0;left:12px;right:12px;height:60px}.ytp-right-controls{display:flex;justify-content:flex-end;height:40px;margin-top:20px}.ytp-autohide .ytp-chrome-bottom{opacity:0;pointer-events:none}.caption-window{position:absolute;bottom:80px;left:20px}</style><input aria-label="Site input"><div id="movie_player" class="html5-video-player" tabindex="0"><video></video><div class="ytp-caption-window-container"></div><div class="ytp-chrome-bottom"><div class="ytp-right-controls"><button class="ytp-settings-button">Native settings</button><button class="ytp-fullscreen-button" onclick="document.fullscreenElement?document.exitFullscreen():document.querySelector('#movie_player').requestFullscreen()">Native fullscreen</button></div></div></div>`}));
 const worker=context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
 const id=await worker.evaluate(()=>chrome.runtime.id);
 page=await context.newPage();
 await page.goto(`https://www.youtube.com/watch?v=${live?'aqz-KE-bpKQ':'abcdefghijk'}`,{waitUntil:'domcontentloaded',timeout:30000});
 if(live)await page.getByRole('button',{name:/Reject/i}).first().waitFor({state:'visible',timeout:10000}).then(async()=>{const reject=page.getByRole('button',{name:/Reject/i}).first();await reject.click();await reject.waitFor({state:'hidden'});}).catch(()=>{});
 await page.waitForSelector('#smarttube-player-entry',{state:'attached'});
 const entry=page.locator('#smarttube-player-entry');
 assert.equal(await entry.getAttribute('aria-label'),'SmartTube controls');
 const tools=page.locator('#smarttube-browser-toolbar');
 const hover=async()=>{await page.mouse.move(1,1);await page.locator('#movie_player').hover();await entry.waitFor({state:'visible'});};
 const open=async()=>{await hover();if(await entry.getAttribute('aria-expanded')==='false')await entry.click();};
 const shot=name=>page.screenshot({path:path.join(output,`${name}.png`)});
 const geometry=async()=>{
  const result=await tools.evaluate(h=>{const a=h.getBoundingClientRect(),p=h.parentElement.getBoundingClientRect(),b=h.shadowRoot.querySelector('.bar').getBoundingClientRect();return {player:{x:p.x,y:p.y,w:p.width,h:p.height},panel:{x:b.x,y:b.y,w:b.width,h:b.height},inside:a.left>=p.left && a.right<=p.right && a.top>=p.top && a.bottom<=p.bottom-60};});
  report.observations.push(result);assert(result.inside,'Popover fits player and clears bottom native controls');
 };
 await check('One entry mounts in actual native right controls; collapsed tools have no hit box',async()=>{
  await page.waitForFunction(()=>document.querySelector('#smarttube-player-entry')?.parentElement.matches('.ytp-right-controls'));
  assert.equal(await page.locator('#smarttube-player-entry').count(),1);
  assert.equal(await tools.locator('.bar').evaluate(e=>e.getClientRects().length),0);
  assert.equal(await tools.locator('[data-action="toggle"],[data-action="speed"],[data-action="mute"]').count(),0);
  await shot('collapsed-native');
 });
 await check('Keyboard opens compact tools, Tab reaches Queue, Escape closes with focus return',async()=>{
  await hover();await entry.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('#smarttube-player-entry').getAttribute('aria-expanded')==='true');
  assert.equal(await tools.evaluate(h=>h.shadowRoot.activeElement?.hasAttribute('data-close')),true);
  await page.keyboard.press('Tab');assert.equal(await tools.evaluate(h=>h.shadowRoot.activeElement?.dataset.action),'queue');
  await geometry();await shot('open-native');await page.keyboard.press('Escape');
  assert.equal(await entry.getAttribute('aria-expanded'),'false');assert.equal(await entry.evaluate(e=>document.activeElement===e),true);
 });
 await check('Expandable tab-only Picture controls apply and reset; focused controls survive native hide',async()=>{
  const storedBefore=await worker.evaluate(()=>chrome.storage.local.get('settings'));
  await open();await tools.getByText('Picture and distractions',{exact:true}).click();
  await tools.getByLabel('Enable video filters',{exact:true}).check();
  const slider=tools.getByLabel('Grayscale',{exact:true});await slider.fill('50');await slider.dispatchEvent('change');
  await page.waitForFunction(()=>document.querySelector('video').style.filter.includes('grayscale(50%)'));
  if(!live)await page.locator('#movie_player').evaluate(p=>p.classList.add('ytp-autohide'));
  await page.waitForTimeout(700);assert.equal(await entry.getAttribute('aria-expanded'),'true');assert.equal(await slider.isVisible(),true);
  await tools.getByRole('button',{name:'Reset video filters'}).click();
  await page.waitForFunction(()=>!document.querySelector('video').style.filter);
  assert.deepEqual(await worker.evaluate(()=>chrome.storage.local.get('settings')),storedBefore,'Tab picture tools never write saved settings');
  if(!live)await page.locator('#movie_player').evaluate(p=>p.classList.remove('ytp-autohide'));
  await geometry();await shot('picture-expanded');
  await tools.getByText('Picture and distractions',{exact:true}).click();await page.keyboard.press('Escape');
 });
 await check('Touch opens and closes ST without toggling native playback',async()=>{
  await hover();const before=await page.locator('video').first().evaluate(v=>v.paused);
  await entry.tap();assert.equal(await entry.getAttribute('aria-expanded'),'true');
  await tools.getByRole('button',{name:'Close SmartTube tools'}).tap();
  assert.equal(await entry.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('video').first().evaluate(v=>v.paused),before);
 });
 if(live){
  await check('Live native controls auto-hide without an invisible ST tab stop; hover restores entry',async()=>{
   await page.locator('video').first().evaluate(v=>v.play().catch(()=>{}));
   await page.locator('h1.ytd-watch-metadata').click();await page.mouse.move(5,850);
   await page.waitForFunction(()=>document.querySelector('#movie_player').classList.contains('ytp-autohide'),{},{timeout:15000});
   await page.waitForFunction(()=>document.querySelector('#smarttube-player-entry').tabIndex===-1);
   assert.equal(await entry.isVisible(),false);await shot('autohide');await hover();await entry.waitFor({state:'visible'});
  });
 }
 await check('Narrow player uses one accessible fallback, with scrollable tools within player',async()=>{
  await page.setViewportSize({width:520,height:850});await page.waitForFunction(()=>document.querySelector('#smarttube-player-entry').hasAttribute('data-fallback'));
  assert.equal(await page.locator('#smarttube-player-entry').count(),1);await open();await geometry();await shot('narrow-fallback');
  assert(await tools.getByRole('button',{name:'Close SmartTube tools'}).evaluate(b=>{const a=b.getBoundingClientRect(),e=document.querySelector('#smarttube-player-entry').getBoundingClientRect();return a.right<=e.left || a.bottom<=e.top || a.top>=e.bottom;}),'Fallback entry must not cover Close');
  await tools.getByText('Picture and distractions',{exact:true}).click();await geometry();
  await page.keyboard.press('Escape');await page.setViewportSize({width:1280,height:900});await hover();
 });
 if(!live){
  await check('Native control removal/replacement reparents the same entry without duplication',async()=>{
   await page.evaluate(()=>{window.__entry=document.querySelector('#smarttube-player-entry');document.querySelector('.ytp-right-controls').remove();});
   await page.waitForFunction(()=>document.querySelector('#smarttube-player-entry')?.hasAttribute('data-fallback'));
   await page.evaluate(()=>{const c=document.createElement('div');c.className='ytp-right-controls';c.innerHTML='<button class="ytp-settings-button">Replacement native control</button><button class="ytp-fullscreen-button">Native fullscreen</button>';c.querySelector('.ytp-fullscreen-button').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.querySelector('#movie_player').requestFullscreen();document.querySelector('.ytp-chrome-bottom').append(c);});
   await page.waitForFunction(()=>document.querySelector('#smarttube-player-entry')?.parentElement.matches('.ytp-right-controls'));
   assert.equal(await entry.evaluate(e=>e===window.__entry),true);assert.equal(await page.locator('#smarttube-player-entry').count(),1);
  });
  await check('Caption area clears tools; native/site keys remain available and outside focus closes tools',async()=>{
   await page.evaluate(()=>{const c=document.createElement('div');c.className='caption-window';c.textContent='Fixture caption';document.querySelector('.ytp-caption-window-container').append(c);window.__siteKeys=0;document.addEventListener('keydown',()=>window.__siteKeys++);});
   await page.locator('.caption-window').evaluate(c=>c.style.display='none');await open();await geometry();
   await page.locator('.caption-window').evaluate(c=>c.style.display='');
   await open();await page.waitForTimeout(600);
   assert(await tools.evaluate(h=>h.getBoundingClientRect().bottom<=document.querySelector('.caption-window').getBoundingClientRect().top));
   const before=await page.evaluate(()=>window.__siteKeys);await tools.getByText('Loop video / A–B',{exact:true}).focus();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>window.__siteKeys),before);
   await page.getByLabel('Site input').focus();await page.keyboard.type('abc');assert.equal(await page.getByLabel('Site input').inputValue(),'abc');assert.equal(await entry.getAttribute('aria-expanded'),'false');
  });
  await check('Complete player/media replacement moves owned UI and clears loop state without duplicates',async()=>{
   await page.evaluate(()=>{const old=document.querySelector('#movie_player'),next=document.createElement('div');next.id='movie_player';next.className='html5-video-player';next.tabIndex=0;next.innerHTML='<video></video><div class="ytp-chrome-bottom"><div class="ytp-right-controls"><button class="ytp-settings-button">Native settings</button><button class="ytp-fullscreen-button">Native fullscreen</button></div></div>';next.querySelector('.ytp-fullscreen-button').onclick=()=>document.fullscreenElement?document.exitFullscreen():next.requestFullscreen();old.replaceWith(next);});
   await page.waitForFunction(()=>document.querySelector('#movie_player').contains(document.querySelector('#smarttube-player-entry')));
   assert.equal(await page.locator('#smarttube-player-entry').count(),1);assert.equal(await tools.count(),1);
   await open();assert.equal(await tools.getByRole('button',{name:'Toggle video loop'}).getAttribute('aria-pressed'),'false');await geometry();await shot('player-replaced');await page.keyboard.press('Escape');
  });
 }
 await check('Native fullscreen keeps one usable tools entry; Cinema returns after fullscreen',async()=>{
  await open();await tools.getByRole('button',{name:'Toggle cinema mode'}).click();await page.waitForSelector('#smarttube-cinema-backdrop');
  await page.keyboard.press('Escape');await hover();await page.locator('.ytp-fullscreen-button').click();
  await page.waitForFunction(()=>Boolean(document.fullscreenElement));await open();await geometry();await shot('native-fullscreen');
  assert.equal(await page.locator('#smarttube-cinema-backdrop').count(),0);
  // Browser Escape can be intercepted by the automation protocol, so inspect
  // actual native fullscreen and use the site's fullscreen button to exit.
  await page.locator('.ytp-fullscreen-button').click();await page.waitForFunction(()=>!document.fullscreenElement);
  await page.waitForSelector('#smarttube-cinema-backdrop');await open();await tools.getByRole('button',{name:'Toggle cinema mode'}).click();
 });
 if(live)await check('Actual related-link SPA navigation remounts exactly one native entry',async()=>{
  await page.keyboard.press('Escape');
  const before=page.url();const link=page.locator('#related a[href^="/watch?v="]').first();await link.click();
  await page.waitForURL(url=>url.href!==before);await page.waitForFunction(()=>document.querySelectorAll('#smarttube-player-entry').length===1 && document.querySelector('#smarttube-player-entry').closest('#movie_player'));
  await hover();await open();await geometry();await shot('spa-remount');
 });
 await check('Popup prioritizes queue, groups tools, omits native transport and retains Settings',async()=>{
  const popup=await context.newPage();await popup.setViewportSize({width:420,height:760});await popup.goto(`chrome-extension://${id}/popup.html`);
  await popup.getByRole('button',{name:'Open settings'}).waitFor();
  assert.equal(await popup.locator('.transport,#volume,#speed').count(),0);
  assert.equal(await popup.locator('details[open]').count(),0);
  await popup.getByRole('heading',{name:'Your queue 0',exact:true}).waitFor();await popup.screenshot({path:path.join(output,'popup-compact.png'),fullPage:true});
 });
 await check('Disabled settings remove both entry and panel without touching site controls',async()=>{
  await worker.evaluate(()=>chrome.storage.local.set({settings:{enabled:false}}));
  await page.waitForFunction(()=>document.querySelector('#smarttube-player-entry').hidden);
  assert.equal(await tools.evaluate(h=>h.hidden),true);assert(await page.locator('.ytp-settings-button').count() || !live);
 });
 report.result='passed';
}catch(error){report.result='failed';report.error=error.stack;process.exitCode=1;await page?.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});}
finally{await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));await context.close();console.log(JSON.stringify(report,null,2));}
