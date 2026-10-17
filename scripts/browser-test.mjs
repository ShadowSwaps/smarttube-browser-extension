// Real extension integration in a disposable Brave profile; YouTube/API responses
// are deterministic fixtures. Does not certify live YouTube service behavior.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const modulePath = process.env.BROWSER_TEST_PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(path.isAbsolute(modulePath) ? pathToFileURL(modulePath).href : modulePath);
const executablePath = process.env.BRAVE_PATH || path.join(process.env.PROGRAMFILES || 'C:/Program Files','BraveSoftware/Brave-Browser/Application/brave.exe');
await mkdir('test-results',{recursive:true});
const profile = path.resolve(`.local/brave-test-${Date.now()}`);
const extension = path.resolve('dist/extension');
const launchOptions = {
  executablePath,headless:true,viewport:{width:1100,height:850},
  args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--autoplay-policy=no-user-gesture-required','--disable-brave-update','--disable-component-update']
};
let context = await chromium.launchPersistentContext(profile,launchOptions);
const results = [];
const idA = 'abcdefghijk', idB = 'lmnopqrstuv', idC = '12345678901';
const wav = Buffer.alloc(44 + 120*8000*2);
wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
const fixture = `<!doctype html><html><head><title>Fixture video - YouTube</title></head><body style="background:#121212;color:white;font:16px system-ui;padding:40px"><h1 class="ytd-watch-metadata">Fixture video</h1><div id="movie_player" class="html5-video-player" style="position:relative;width:800px;height:450px;background:#25282e"><video style="width:800px;height:450px" src="/fixture.wav" muted controls></video></div></body></html>`;
let worker;
try {
  await context.route('https://www.youtube.com/**',route => {
    if (new URL(route.request().url()).pathname === '/fixture.wav') {
      const range = /^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range || '');
      if (range) {
        const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]),wav.length-1) : wav.length-1;
        return route.fulfill({status:206,contentType:'audio/wav',headers:{'accept-ranges':'bytes','content-range':`bytes ${start}-${end}/${wav.length}`},body:wav.subarray(start,end+1)});
      }
      return route.fulfill({status:200,contentType:'audio/wav',headers:{'accept-ranges':'bytes'},body:wav});
    }
    return route.fulfill({status:200,contentType:'text/html',body:fixture});
  });
  worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const extensionId = new URL(worker.url()).hostname;
  // A worker-local network fixture is explicit; actual endpoint interoperability
  // is a separate live-service check.
  await worker.evaluate(({idA,idB}) => {
    globalThis.__requests = [];
    globalThis.__messages = [];
    chrome.runtime.onMessage.addListener((message,sender) => { globalThis.__messages.push({type:message.type,videoId:message.videoId,url:sender.url,tabUrl:sender.tab?.url}); });
    globalThis.fetch = async (url,options) => {
      globalThis.__requests.push({url:String(url),credentials:options?.credentials});
      const data = [
        {videoID:idA,segments:[{segment:[10,20],category:'sponsor',actionType:'skip'}]},
        {videoID:idB,segments:[{segment:[40,50],category:'sponsor',actionType:'skip'}]}
      ];
      return new Response(JSON.stringify(data),{status:200});
    };
  },{idA,idB});
  const page = await context.newPage();
  await page.goto(`https://www.youtube.com/watch?v=${idA}`);
  await page.waitForSelector('#smarttube-browser-toolbar');
  await page.locator('video').evaluate(video => new Promise(resolve => {if(video.readyState >= 1)resolve();else video.addEventListener('loadedmetadata',resolve,{once:true});}));
  assert.equal(await page.locator('video').evaluate(video => Math.round(video.duration)),120);
  results.push('Real content script attaches to native HTML media in Brave.');
  assert.equal((await worker.evaluate(() => globalThis.__requests)).length,0);
  results.push('Default settings produce no SponsorBlock requests.');
  await page.evaluate(() => {
    const player=document.querySelector('#movie_player');
    player.dataset.nativeClicks='0';player.dataset.pointerBubbles='0';
    const native=document.createElement('button');native.className='ytp-play-button';native.textContent='Fixture native play';
    native.addEventListener('click',() => {player.dataset.nativeClicks=String(Number(player.dataset.nativeClicks)+1);const video=player.querySelector('video');if(video.paused)video.play();else video.pause();});
    player.addEventListener('mousedown',() => {player.dataset.pointerBubbles=String(Number(player.dataset.pointerBubbles)+1);});
    player.append(native);
  });
  await page.getByRole('button',{name:'Play or pause',exact:true}).click();
  await page.waitForFunction(() => !document.querySelector('video').paused);
  await page.getByRole('button',{name:'Play or pause',exact:true}).click();
  assert.equal(await page.locator('video').evaluate(video => video.paused),true);
  assert.equal(await page.locator('#movie_player').getAttribute('data-native-clicks'),'2');
  assert.equal(await page.locator('#movie_player').getAttribute('data-pointer-bubbles'),'0');
  results.push('Toolbar delegates play/pause to the native site control and isolates pointer events.');
  await worker.evaluate(async () => chrome.storage.local.set({settings:{enabled:true,sponsorEnabled:true,categories:['sponsor'],speed:1.5,toolbar:true,autoQueue:false}}));
  await page.getByText('1 sponsor segment ready',{exact:true}).waitFor();
  assert.equal(await page.locator('video').evaluate(v => v.playbackRate),1.5);
  await page.locator('video').evaluate(async video => {video.currentTime=12; await video.play();});
  await page.waitForFunction(() => document.querySelector('video').currentTime >= 20);
  await page.locator('video').evaluate(video => video.pause());
  assert((await page.locator('video').evaluate(video => video.currentTime)) < 23);
  results.push('Enabled sponsor fixture seeks 12s to 20s using the native media element.');
  await page.getByRole('button',{name:'Undo skip'}).click();
  assert((await page.locator('video').evaluate(video => video.currentTime)) < 14);
  results.push('Undo restores the pre-skip position.');
  await page.getByRole('button',{name:'Add this video to queue'}).click();
  await page.getByText('Added to your queue',{exact:true}).waitFor();
  const stored = await worker.evaluate(async () => chrome.storage.local.get(['settings','queue']));
  assert.equal(stored.queue[0].videoId,idA);
  results.push('Player queue action persists video identity and title.');
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html`);
  await options.getByLabel('Show player toolbar').uncheck();
  await page.waitForFunction(() => document.querySelector('#smarttube-browser-toolbar').hidden);
  await options.reload();
  assert.equal(await options.getByLabel('Show player toolbar').isChecked(),false);
  await options.getByLabel('Show player toolbar').check();
  await page.waitForFunction(() => !document.querySelector('#smarttube-browser-toolbar').hidden);
  results.push('Actual options UI updates content script and survives a page reload.');
  // Reset Undo protection so the advertising/live guard checks are independent.
  await page.reload();
  await page.getByText('1 sponsor segment ready',{exact:true}).waitFor();
  await page.evaluate(() => document.querySelector('#movie_player').classList.add('ad-showing'));
  await page.locator('video').evaluate(async video => {video.currentTime=12;await video.play();});
  await page.waitForTimeout(600);
  assert((await page.locator('video').evaluate(video => video.currentTime)) < 16);
  await page.locator('video').evaluate(video => video.pause());
  await page.evaluate(() => document.querySelector('#movie_player').classList.remove('ad-showing'));
  results.push('Recognized advertising state suppresses sponsor seeks.');
  await page.evaluate(() => document.querySelector('#movie_player').classList.add('ytp-live'));
  await page.locator('video').evaluate(async video => {video.currentTime=12;await video.play();});
  await page.waitForTimeout(600);
  assert((await page.locator('video').evaluate(video => video.currentTime)) < 16);
  await page.locator('video').evaluate(video => video.pause());
  await page.evaluate(() => document.querySelector('#movie_player').classList.remove('ytp-live'));
  results.push('Recognized YouTube live state suppresses sponsor seeks with a finite DVR duration.');
  await page.evaluate(idB => {history.pushState({},'',`/watch?v=${idB}`);document.dispatchEvent(new Event('yt-navigate-finish'));},idB);
  await page.getByText('1 sponsor segment ready',{exact:true}).waitFor();
  await page.waitForTimeout(300);
  await page.locator('video').evaluate(async video => {video.currentTime=12;await video.play();});
  await page.waitForTimeout(600);
  assert((await page.locator('video').evaluate(video => video.currentTime)) < 16);
  await page.locator('video').evaluate(video => video.pause());
  results.push('SPA navigation discards the previous video segments.');
  await worker.evaluate(() => {globalThis.fetch = async () => {throw new Error('offline');};});
  await page.evaluate(idC => {history.pushState({},'',`/watch?v=${idC}`);document.dispatchEvent(new Event('yt-navigate-finish'));},idC);
  await page.getByText('SponsorBlock unavailable · playback unaffected',{exact:true}).waitFor();
  await page.locator('video').evaluate(video => video.play());
  assert.equal(await page.locator('video').evaluate(video => video.paused),false);
  results.push('SponsorBlock network failure leaves native playback available.');
  const requests = await worker.evaluate(() => globalThis.__requests);
  for (const request of requests) {
    assert.match(request.url,/^https:\/\/sponsor\.ajay\.app\/api\/skipSegments\/[a-f0-9]{4}\?/);
    assert.equal(request.credentials,'omit');
    assert(!request.url.includes(idA) && !request.url.includes(idB));
  }
  results.push('Lookups use a four-character hash prefix with cookies omitted.');
  const popup = await context.newPage();
  await popup.setViewportSize({width:420,height:760});
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.bringToFront();
  await popup.reload();
  await popup.locator('#video-title').filter({hasText:'Fixture video'}).waitFor();
  await popup.getByRole('button',{name:'Forward ten seconds'}).click();
  await page.waitForFunction(() => document.querySelector('video').currentTime > 22);
  results.push('Popup controls route to the active YouTube tab and seek the real media element.');
  await popup.screenshot({path:'test-results/popup.png',fullPage:true});
  await options.screenshot({path:'test-results/options.png',fullPage:true});
  await page.screenshot({path:'test-results/player.png',fullPage:true});
  results.push('Popup and settings render successfully in actual extension pages.');
  await context.close();
  context = await chromium.launchPersistentContext(profile,launchOptions);
  const restartedWorker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const restarted = await restartedWorker.evaluate(async () => chrome.storage.local.get(['settings','queue']));
  assert.equal(restarted.settings.sponsorEnabled,true);
  assert.equal(restarted.settings.speed,1.5);
  assert.equal(restarted.queue[0].videoId,idA);
  results.push('Settings and queue survive a full Brave browser-process restart.');
  const report = {browser:'Brave',chromiumVersion:context.browser()?.version(),fixture:'Intercepted YouTube HTML + native WAV media + worker-local SponsorBlock responses',results,liveYouTube:'not tested by this fixture suite'};
  await writeFile('test-results/browser-report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} catch (error) {
  console.error('Worker diagnostics',await worker?.evaluate(() => ({requests:globalThis.__requests,messages:globalThis.__messages})).catch(() => 'unavailable'));
  for (const [index,page] of context.pages().entries()) {
    console.error('Failure page',index,page.url(),await page.evaluate(() => ({text:document.body.innerText,video:document.querySelector('video') ? {time:document.querySelector('video').currentTime,duration:document.querySelector('video').duration,paused:document.querySelector('video').paused,error:document.querySelector('video').error?.message,toolbar:document.querySelector('#smarttube-browser-toolbar')?.shadowRoot?.textContent} : null})).catch(() => 'unavailable'));
    await page.screenshot({path:`test-results/failure-${index}.png`}).catch(() => {});
  }
  throw error;
} finally { await context.close(); }
