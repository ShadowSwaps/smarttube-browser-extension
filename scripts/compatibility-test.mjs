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
for(const file of ['manifest.json','content.js','core.js','ui.js']) report.candidate[file]=createHash('sha256').update(await readFile(path.join(extension,file))).digest('hex');
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
