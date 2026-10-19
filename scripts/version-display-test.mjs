import assert from 'node:assert/strict';
import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const modulePath=process.env.BROWSER_TEST_PLAYWRIGHT_MODULE||'playwright';
const {chromium}=await import(path.isAbsolute(modulePath)?pathToFileURL(modulePath).href:modulePath);
const executablePath=process.env.BRAVE_PATH||path.join(process.env.PROGRAMFILES||'C:/Program Files','BraveSoftware/Brave-Browser/Application/brave.exe');
const source=path.resolve(process.env.VERSION_DISPLAY_EXTENSION||'dist/extension');
const alternate=path.resolve('.local/version-display-alternate');
const output=path.resolve('.investigation-tools/workflow/version-display-20261019');
await mkdir(output,{recursive:true});
await rm(alternate,{recursive:true,force:true});
await cp(source,alternate,{recursive:true});
const alternateManifest=JSON.parse(await readFile(path.join(alternate,'manifest.json'),'utf8'));
alternateManifest.version='0.4.91';
await writeFile(path.join(alternate,'manifest.json'),JSON.stringify(alternateManifest,null,2)+'\n');

async function inspect(extension,expectedVersion,profileName){
 const profile=path.resolve(`.local/${profileName}-${Date.now()}`);
 const context=await chromium.launchPersistentContext(profile,{executablePath,headless:true,viewport:{width:1100,height:850},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--mute-audio','--disable-brave-update','--disable-component-update']});
 try{
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  const id=new URL(worker.url()).hostname;
  const installed=await worker.evaluate(()=>chrome.runtime.getManifest().version);
  assert.equal(installed,expectedVersion);
  const options=await context.newPage();
  const pageErrors=[];options.on('pageerror',error=>pageErrors.push(error.message));
  await options.goto(`chrome-extension://${id}/options.html`);
  await assert.equal(await options.locator('#installed-version').textContent(),`v${installed}`);
  assert.doesNotMatch(await options.locator('footer').innerText(),/0\.4\.7|local preview/);
  const popup=await context.newPage();popup.on('pageerror',error=>pageErrors.push(error.message));
  await popup.goto(`chrome-extension://${id}/popup.html`);
  await popup.getByRole('button',{name:'Settings'}).waitFor();
  await options.getByLabel('Show player toolbar').uncheck();
  await options.locator('#feedback').getByText('Saved on this device.',{exact:true}).waitFor();
  await worker.evaluate(()=>chrome.storage.local.set({queue:[{videoId:'abcdefghijk',title:'Version display fixture'}]}));
  await options.reload();
  assert.equal(await options.locator('#installed-version').textContent(),`v${installed}`);
  assert.equal(await options.getByLabel('Show player toolbar').isChecked(),false);
  const saved=await worker.evaluate(()=>chrome.storage.local.get(['settings','queue']));
  assert.equal(saved.settings.toolbar,false);
  assert.equal(saved.queue[0].videoId,'abcdefghijk');
  assert.deepEqual(pageErrors,[]);
  return {installedVersion:installed,footer:await options.locator('footer').innerText(),popupLoaded:true,settingsReloaded:true,queuePersisted:true,pageErrors};
 }finally{await context.close();}
}

try{
 const result={browser:'Brave',headless:true,audio:'--mute-audio',candidate:await inspect(source,'0.4.9','version-display'),syntheticAlternate:await inspect(alternate,'0.4.91','version-display-alt')};
 await writeFile(path.join(output,'focused-browser-report.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
}finally{await rm(alternate,{recursive:true,force:true});}
