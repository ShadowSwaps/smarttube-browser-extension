// Optional bounded public-service check. No account or personal browser profile.
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.BROWSER_TEST_PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=await import(path.isAbsolute(modulePath) ? pathToFileURL(modulePath).href : modulePath);
const extension=path.resolve('dist/extension');
await mkdir('test-results',{recursive:true});
const context=await chromium.launchPersistentContext(path.resolve(`.local/brave-live-${Date.now()}`),{
  executablePath:process.env.BRAVE_PATH || path.join(process.env.PROGRAMFILES || 'C:/Program Files','BraveSoftware/Brave-Browser/Application/brave.exe'),
  headless:true,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--mute-audio','--autoplay-policy=no-user-gesture-required','--disable-component-update','--disable-brave-update']
});
try {
  const page=await context.newPage();
  const failures=[];
  page.on('pageerror',error => failures.push(error.message.slice(0,200)));
  let navigationError=null;
  try {await page.goto('https://www.youtube.com/watch?v=aqz-KE-bpKQ',{waitUntil:'domcontentloaded',timeout:25000});}
  catch(error){navigationError=error.message.split('\n')[0];}
  const reject=page.getByRole('button',{name:/Reject/i}).first();
  await reject.waitFor({state:'visible',timeout:12000}).then(async()=>{await reject.click();await reject.waitFor({state:'hidden'});}).catch(() => {});
  await page.waitForSelector('#smarttube-player-entry',{state:'attached',timeout:12000}).catch(() => {});
  await page.locator('h1.ytd-watch-metadata').waitFor({state:'visible',timeout:12000}).catch(() => {});
  const controls=[]; let controlError=null;
  try {
  if (await page.locator('#smarttube-browser-toolbar').count()) {
 await page.mouse.move(1,1);await page.locator('#movie_player').hover();
 await page.getByRole('button',{name:'SmartTube controls',exact:true}).click();
    await page.getByText('Loop video / A–B',{exact:true}).click();
    await page.getByRole('button',{name:'Toggle video loop'}).click();
    if(!await page.locator('video').first().evaluate(v=>v.loop))throw new Error('Whole-video loop did not apply');
    await page.getByRole('button',{name:'Toggle video loop'}).click();
    controls.push('Grouped extension loop toggles real native media without duplicate transport.');
  }
  } catch(error) {controlError=error.message.split('\n')[0];}
  const observed=await page.evaluate(() => {
    const video=document.querySelector('video');
    return {url:location.href,title:document.title,toolbar:Boolean(document.querySelector('#smarttube-browser-toolbar')),playerClass:document.querySelector('#movie_player')?.className,toolbarStatus:document.querySelector('#smarttube-browser-toolbar')?.shadowRoot?.querySelector('[data-status]')?.textContent,video:video ? {readyState:video.readyState,paused:video.paused,position:video.currentTime,speed:video.playbackRate,duration:Number.isFinite(video.duration)?video.duration:null,error:video.error?.code || null}:null};
  });
  const report={browser:'Brave',chromiumVersion:context.browser()?.version(),scenario:'Signed-out public Big Buck Bunny YouTube page; reject optional cookies if prompted; no login',navigationError,observed,controls,controlError,pageErrors:failures};
  await page.screenshot({path:'test-results/live-youtube.png',fullPage:false});
  await writeFile('test-results/live-report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally {await context.close();}
