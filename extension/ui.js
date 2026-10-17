import {CATEGORIES,sanitizeSettings,sanitizeQueue,formatTime} from './core.js';
const $ = selector => document.querySelector(selector);
const popup = document.body.dataset.view === 'popup';
let state = {settings:sanitizeSettings(),queue:[]};
let player = null, tabId = null;
const send = message => chrome.runtime.sendMessage(message);
function feedback(text) { $('#feedback').textContent = text; }
function render() {
  for (const key of ['enabled','sponsorEnabled','toolbar','autoQueue']) {
    const input = $(`#${key}`); if (input) input.checked = state.settings[key];
  }
  $('#speed').value = String(state.settings.speed);
  for (const input of document.querySelectorAll('[data-category]')) input.checked = state.settings.categories.includes(input.dataset.category);
  if (!popup) return;
  $('#video-title').textContent = player?.videoId ? player.title : 'Open a video on YouTube';
  $('#player-time').textContent = player?.videoId ? `${formatTime(player.position)} / ${formatTime(player.duration)} · ${player.speed}×` : 'Your viewing tools are ready when you are.';
  $('#sponsor-status').textContent = !state.settings.enabled ? 'Player enhancements are paused in settings.' : player?.status || '';
  for (const button of document.querySelectorAll('[data-control],#add-current')) button.disabled = !player?.videoId || !state.settings.enabled;
  $('#play').textContent = player?.paused ? '▶ Play' : 'Ⅱ Pause';
  $('#queue-count').textContent = String(state.queue.length);
  $('#empty-queue').hidden = state.queue.length > 0;
  $('#next').disabled = !state.queue.length;
  const list = $('#queue'); list.replaceChildren();
  for (const item of state.queue) {
    const row = document.createElement('li');
    const open = document.createElement('button'); open.className = 'queue-title'; open.textContent = item.title; open.title = item.title;
    open.addEventListener('click', () => openVideo(item.videoId));
    const remove = document.createElement('button'); remove.className = 'remove'; remove.textContent = '×'; remove.setAttribute('aria-label',`Remove ${item.title} from queue`);
    remove.addEventListener('click',async () => {
      try { const result = await send({type:'REMOVE_QUEUE',videoId:item.videoId}); if (!result.ok) throw new Error(); state.queue = result.queue; render(); }
      catch { feedback('Could not update queue. Try again.'); }
    });
    row.append(open,remove); list.append(row);
  }
}
async function openVideo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  if (tabId && player?.videoId) await chrome.tabs.update(tabId,{url,active:true}); else await chrome.tabs.create({url});
}
async function refreshPlayer() {
  if (!popup || !tabId) return;
  try { player = await chrome.tabs.sendMessage(tabId,{type:'PLAYER_STATUS'}); }
  catch { player = null; }
  render();
}
async function save(patch) {
  try {
    const result = await send({type:'SET_SETTINGS',settings:patch});
    if (!result.ok) throw new Error();
    state.settings = result.settings; render(); feedback('Saved on this device.');
  } catch { render(); feedback('Could not save. Try again.'); }
}
async function control(action,value) {
  if (!tabId) return;
  try {
    const result = await chrome.tabs.sendMessage(tabId,{type:'CONTROL',action,value});
    if (!result?.ok) throw new Error();
    await refreshPlayer();
  } catch { feedback('Refresh the YouTube tab to connect the player.'); }
}
async function init() {
  if (!popup) {
    const fieldset = $('#categories');
    for (const [key,label] of Object.entries(CATEGORIES)) {
      const row = document.createElement('label'); row.className = 'category-row'; row.textContent = label;
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.dataset.category = key;
      checkbox.addEventListener('change', () => save({categories:[...document.querySelectorAll('[data-category]:checked')].map(input => input.dataset.category)}));
      row.append(checkbox); fieldset.append(row);
    }
  }
  const result = await send({type:'GET_STATE'});
  if (!result.ok) throw new Error();
  state = result;
  for (const key of ['enabled','sponsorEnabled','toolbar','autoQueue']) {
    $(`#${key}`)?.addEventListener('change',event => save({[key]:event.target.checked}));
  }
  $('#speed').addEventListener('change',event => save({speed:Number(event.target.value)}));
  if (popup) {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    // Sending only to the active tab avoids querying browsing history or all tabs.
    tabId = tab?.id;
    $('#settings').addEventListener('click',() => chrome.runtime.openOptionsPage());
    $('#open-youtube').addEventListener('click',() => chrome.tabs.create({url:'https://www.youtube.com/'}));
    for (const button of document.querySelectorAll('[data-control]')) button.addEventListener('click',() => {
      if (button.dataset.control === 'back') control('seek',-10);
      else if (button.dataset.control === 'forward') control('seek',10);
      else control('toggle');
    });
    $('#add-current').addEventListener('click',async () => {
      if (!player?.videoId) return;
      try { const result = await send({type:'ADD_QUEUE',item:{videoId:player.videoId,title:player.title}}); if (!result.ok) throw new Error(); state.queue = result.queue; render(); feedback('Added to your queue.'); }
      catch { feedback('Could not add this video.'); }
    });
    $('#next').addEventListener('click',async () => {
      try { const result = await send({type:'NEXT_QUEUE',currentVideoId:player?.videoId}); if (!result.ok) throw new Error(); if (result.item) await openVideo(result.item.videoId); }
      catch { feedback('Could not open the next video.'); }
    });
    await refreshPlayer();
    setInterval(refreshPlayer,1500);
  }
  render();
}
chrome.storage.onChanged.addListener((changes,area) => {
  if (area !== 'local') return;
  if (changes.settings) state.settings = sanitizeSettings(changes.settings.newValue);
  if (changes.queue) state.queue = sanitizeQueue(changes.queue.newValue);
  render();
});
init().catch(() => feedback('Could not connect. Reload the extension and try again.'));
