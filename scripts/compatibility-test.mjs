// Optional live, signed-out black-box check. Requires an existing, unmodified
// Enhancer installation selected explicitly; never reads personal profile data.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const modulePath=process.env.BROWSER_TEST_PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=await import(path.isAbsolute(modulePath)?pathToFileURL(modulePath).href:modulePath);
if(!process.env.ENHANCER_PATH)throw new Error('Set ENHANCER_PATH to the existing unmodified Enhancer package directory.');
const enhancer=path.resolve(process.env.ENHANCER_PATH), extension=path.resolve('dist/extension');
const run=Date.now(), output=path.resolve(`test-results/compatibility-${run}`);
await mkdir(output,{recursive:true});
const report={kind:'live public YouTube, isolated two-extension profile',headless:true,audio:'--mute-audio',checks:[],candidate:{}};
for(const file of ['manifest.json','content.js','core.js','ui.js','appearance.js']) report.candidate[file]=createHash('sha256').update(await readFile(path.join(extension,file))).digest('hex');
const context=await chromium.launchPersistentContext(path.resolve(`.local/brave-compatibility-${run}`),{
 executablePath:process.env.BRAVE_PATH || path.join(process.env.PROGRAMFILES || 'C:/Program Files','BraveSoftware/Brave-Browser/Application/brave.exe'),
 headless:true,args:[`--disable-extensions-except=${extension},${enhancer}`,`--load-extension=${extension},${enhancer}`,'--mute-audio','--autoplay-policy=no-user-gesture-required','--disable-brave-update','--disable-component-update']
});
let page;
try {
 const deadline=Date.now()+10000;
 while(context.serviceWorkers().length<2 && Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,100));
 const workers=[];
 for(const worker of context.serviceWorkers())workers.push({worker,...await worker.evaluate(()=>({name:chrome.runtime.getManifest().name,id:chrome.runtime.id,version:chrome.runtime.getManifest().version}))});
 const ours=workers.find(w=>w.name==='SmartTube Browser'), other=workers.find(w=>w.name.includes('Enhancer for YouTube'));
 assert(ours && other,'Both actual extensions must be enabled');
 report.extensions=workers.map(({name,version})=>({name,version}));
 report.browserVersion=context.browser()?.version();
 const options=await context.newPage();
 await options.goto(`chrome-extension://${other.id}/html/options.html`);
 // DOM controls in the fresh profile, not source inspection or copied settings.
 await options.locator('#overridespeeds').check();
 // Enhancer hides the standard select when its custom speed UI is active.
 // Assert the fresh-profile values without forcing a hidden widget action.
 assert.equal(await options.locator('#playback-speed').inputValue(),'1');
 assert.equal(await options.locator('#custom-playback-speed').inputValue(),'1');
 report.referenceConfiguration={overrideSpeeds:true,defaultSpeed:1,profile:'fresh; no copied account, cookies or user preferences'};
 await ours.worker.evaluate(()=>chrome.storage.local.set({settings:{enabled:true,speed:1.5,toolbar:true,sponsorEnabled:false,wheelControls:true}}));
 page=await context.newPage();
 await page.goto('https://www.youtube.com/watch?v=aqz-KE-bpKQ',{waitUntil:'domcontentloaded',timeout:30000});
 const reject=page.getByRole('button',{name:/Reject/i}).first();
 await reject.waitFor({state:'visible',timeout:5000}).then(()=>reject.click()).catch(()=>{});
 await page.waitForSelector('#smarttube-browser-toolbar',{timeout:15000});
 await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
 await page.waitForTimeout(4500);
 assert.equal(await page.locator('video').first().evaluate(v=>v.playbackRate),1.5);
 report.checks.push('Saved 1.5x holds on initial load with Enhancer override enabled at 1x.');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('#smarttube-browser-toolbar');
 await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
 await page.waitForTimeout(4500);
 assert.equal(await page.locator('video').first().evaluate(v=>v.playbackRate),1.5);
 report.checks.push('Saved 1.5x holds after reloading the real public video.');
 const tools=page.locator('#smarttube-browser-toolbar');
 const openTools=async()=>{const entry=tools.getByRole('button',{name:'SmartTube controls',exact:true});if(await entry.getAttribute('aria-expanded')==='false')await entry.click();};
 await openTools();
 await page.locator('video').first().evaluate(v=>{v.volume=.4;v.muted=false;});
 await tools.getByRole('button',{name:'Raise volume ten percent'}).click();
 assert(Math.abs(await page.locator('video').first().evaluate(v=>v.volume)-.5)<.001);
 await tools.getByRole('button',{name:'Mute or unmute'}).click();
 assert.equal(await page.locator('video').first().evaluate(v=>v.muted),true);
 report.checks.push('Volume and mute operate with both extensions enabled; browser output stays muted.');
 const box=await page.locator('video').first().boundingBox();assert(box);
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.keyboard.down('Alt');
 await page.mouse.wheel(0,-100);
 await page.keyboard.up('Alt');
 await page.waitForTimeout(400);
 const wheelRate=await page.locator('video').first().evaluate(v=>v.playbackRate);
 assert(Math.abs(wheelRate-1.55)<.001,`Alt-wheel speed was ${wheelRate}`);
 await page.keyboard.down('Alt');await page.keyboard.down('Shift');
 const beforeVolume=await page.locator('video').first().evaluate(v=>v.volume);
 await page.mouse.wheel(0,-100);
 await page.keyboard.up('Shift');await page.keyboard.up('Alt');
 await page.waitForTimeout(400);
 const afterVolume=await page.locator('video').first().evaluate(v=>v.volume);
 assert(Math.abs(afterVolume-beforeVolume-.05)<.001,`Alt-Shift-wheel changed volume by ${afterVolume-beforeVolume}`);
 report.checks.push('Real Alt-wheel and Alt-Shift-wheel apply one speed/volume step with Enhancer present.');
 await page.locator('video').first().evaluate(v=>{v.pause();v.currentTime=20;});
 await tools.getByRole('button',{name:'Set loop start'}).click();
 await page.locator('video').first().evaluate(v=>{v.currentTime=22;});
 await tools.getByRole('button',{name:'Set loop end'}).click();
 await page.locator('video').first().evaluate(async v=>{v.currentTime=22.2;await v.play();});
 await page.waitForFunction(()=>{const v=document.querySelector('video');return v.currentTime>=20&&v.currentTime<22;});
 await tools.getByRole('button',{name:'Clear loop range'}).click();
 report.checks.push('A-B loop repeats a real public video interval with Enhancer present.');
 await tools.getByRole('button',{name:'Cycle playback speed'}).click();
 const chosen=await page.locator('video').first().evaluate(v=>v.playbackRate);
 await page.waitForTimeout(1000);
 assert.equal(await page.locator('video').first().evaluate(v=>v.playbackRate),chosen);
 report.checks.push('Deliberate toolbar speed changes remain in effect.');
 await page.locator('video').first().evaluate(v=>v.pause());
 const ownOptions=await context.newPage();
 await ownOptions.goto(`chrome-extension://${ours.id}/options.html`);
 const previousFilter=await page.locator('video').first().evaluate(v=>({value:v.style.filter,priority:v.style.getPropertyPriority('filter')}));
 await ownOptions.getByLabel('Enable video filters',{exact:false}).check();
 for(const [label,value] of [['Brightness','110'],['Contrast','120'],['Saturation','0'],['Grayscale','30']]) {
   await ownOptions.getByLabel(label,{exact:true}).fill(value);
   await ownOptions.getByLabel(label,{exact:true}).dispatchEvent('change');
   const key={Brightness:'filterBrightness',Contrast:'filterContrast',Saturation:'filterSaturation',Grayscale:'filterGrayscale'}[label];
   await ownOptions.waitForFunction(({key,value})=>document.querySelector(`#${key}-value`).textContent===`${value}%`,{key,value});
 }
 await page.waitForFunction(()=>{const f=document.querySelector('video').style.filter;return f.includes('brightness(110%)')&&f.includes('contrast(120%)')&&f.includes('saturate(0%)')&&f.includes('grayscale(30%)');});
 assert.equal(await page.locator('video').first().evaluate(v=>v.playbackRate),chosen);
 report.checks.push('All four picture settings apply to real media while retaining the deliberately chosen playback rate.');
 await tools.getByRole('button',{name:'Toggle cinema mode'}).click();
 await page.waitForSelector('#smarttube-cinema-backdrop');
 assert.equal(await page.locator('#movie_player').evaluate(player=>{const r=player.getBoundingClientRect();return player.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true);
 await page.screenshot({path:path.join(output,'cinema-filters.png')});
 await page.keyboard.press('Escape');
 await page.keyboard.press('Escape');
 await openTools();
 await page.locator('#smarttube-cinema-backdrop').waitFor({state:'detached'});
 await tools.getByRole('button',{name:'Toggle cinema mode'}).click();
 await page.locator('[data-cinema-panel="0"]').click({position:{x:3,y:3}});
 await page.locator('#smarttube-cinema-backdrop').waitFor({state:'detached'});
 report.checks.push('Cinema preserves native-player hit testing and exits via Escape/outside click with both extensions loaded.');
 report.liveDistractions=[];
 for(const [label,selector] of [['Hide comments','ytd-watch-flexy #comments'],['Hide related videos','ytd-watch-flexy #related']]) {
   const target=page.locator(selector).first();
   await target.waitFor({state:'attached',timeout:5000});
   const before=await target.evaluate(el=>getComputedStyle(el).display);
   assert.notEqual(before,'none',`${label} target must initially have a visible display`);
   await ownOptions.getByLabel(label,{exact:true}).check();
   await page.waitForFunction(selector=>getComputedStyle(document.querySelector(selector)).display==='none',selector);
   await ownOptions.getByLabel(label,{exact:true}).uncheck();
   await page.waitForFunction(({selector,before})=>getComputedStyle(document.querySelector(selector)).display===before,{selector,before});
   report.liveDistractions.push({label,selector,restoredDisplay:before});
 }
 report.checks.push('Live comments and related-video containers hide and restore through the real settings UI. Other distraction selectors are fixture-verified only.');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('#smarttube-browser-toolbar');
 await page.waitForFunction(()=>document.querySelector('video')?.style.filter.includes('brightness(110%)'));
 await ownOptions.reload();
 assert.equal(await ownOptions.getByLabel('Contrast',{exact:true}).inputValue(),'120');
 await ownOptions.getByRole('button',{name:'Reset video filters'}).click();
 await page.waitForFunction(previous=>{const v=document.querySelector('video');return v.style.filter===previous.value&&v.style.getPropertyPriority('filter')===previous.priority;},previousFilter);
 await page.locator('video').first().evaluate(v=>{v.pause();v.currentTime=20;});
 report.checks.push('Picture preferences survive a live page/options reload; Reset restores the original inline filter.');
 await page.screenshot({path:path.join(output,'player.png')});
 report.result='passed';
} catch(error) {
 report.result='failed';report.error=error.message;
 await page?.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});
 throw error;
} finally {
 await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
 await context.close();console.log(JSON.stringify(report,null,2));
}
