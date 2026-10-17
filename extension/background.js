import { CATEGORIES, VIDEO_ID, sanitizeSettings, sanitizeQueue, videoIdFromUrl } from './core.js';

let writes = Promise.resolve();
const cache = new Map();
const pending = new Map();
const CACHE_TTL = 30 * 60 * 1000;
async function readState() {
  const stored = await chrome.storage.local.get(['settings', 'queue']);
  return {settings: sanitizeSettings(stored.settings), queue: sanitizeQueue(stored.queue)};
}
function mutate(operation) {
  const result = writes.then(operation);
  writes = result.catch(() => {});
  return result;
}
function isExtensionPage(sender) {
  return sender.id === chrome.runtime.id && sender.url?.startsWith(chrome.runtime.getURL(''));
}
async function sponsorSegments(videoId, categories) {
  const key = `${videoId}:${categories.slice().sort().join(',')}`;
  if (cache.get(key)?.expires > Date.now()) return cache.get(key).result;
  if (pending.has(key)) return pending.get(key);
  const request = (async () => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(videoId));
    const hash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    const url = new URL(`https://sponsor.ajay.app/api/skipSegments/${hash.slice(0,4)}`);
    url.searchParams.set('categories', JSON.stringify(categories));
    url.searchParams.set('actionTypes', '["skip"]');
    const response = await fetch(url, {credentials:'omit', referrerPolicy:'no-referrer', signal:AbortSignal.timeout(8000)});
    let segments = [];
    if (response.status !== 404) {
      if (!response.ok) throw new Error('SponsorBlock unavailable');
      if (Number(response.headers.get('content-length')) > 1024*1024) throw new Error('Response too large');
      const reader = response.body.getReader();
      const chunks = []; let bytes = 0;
      try {
        for (;;) {
          const {done, value} = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > 1024*1024) throw new Error('Response too large');
          chunks.push(value);
        }
      } finally { await reader.cancel(); }
      const body = new Uint8Array(bytes); let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
      const data = JSON.parse(new TextDecoder().decode(body));
      if (!Array.isArray(data)) throw new Error('Invalid response');
      const match = data.find(item => item?.videoID === videoId);
      segments = Array.isArray(match?.segments) ? match.segments.slice(0,1000) : [];
    }
    const result = {ok:true, segments};
    cache.set(key, {expires:Date.now()+CACHE_TTL, result});
    while (cache.size > 100) cache.delete(cache.keys().next().value);
    return result;
  })().catch(() => {
    const result = {ok:false, error:'SponsorBlock is unavailable. Playback continues normally.', segments:[]};
    cache.set(key,{expires:Date.now()+60_000,result});
    while (cache.size > 100) cache.delete(cache.keys().next().value);
    return result;
  }).finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}
async function handle(message, sender) {
  if (sender.id !== chrome.runtime.id || !message || typeof message.type !== 'string') return {ok:false};
  const page = isExtensionPage(sender);
  // Chromium retains the document's initial sender.url after pushState. The
  // top-level tab URL carries the current video during YouTube SPA navigation.
  const sourceVideoId = sender.frameId === 0 && sender.url?.startsWith('https://www.youtube.com/')
    ? videoIdFromUrl(sender.tab?.url || sender.url) : null;
  if (message.type === 'GET_STATE') {
    if (!page && !sender.url?.startsWith('https://www.youtube.com/')) return {ok:false};
    await writes;
    return {ok:true,...await readState()};
  }
  if (message.type === 'SET_SETTINGS' && page) return mutate(async () => {
    const state = await readState();
    const settings = sanitizeSettings({...state.settings,...message.settings});
    await chrome.storage.local.set({settings});
    return {ok:true,settings};
  });
  if (message.type === 'SEGMENTS' && sourceVideoId && sourceVideoId === message.videoId) {
    const {settings} = await readState();
    if (!settings.enabled || !settings.sponsorEnabled || !settings.categories.length) return {ok:true,segments:[]};
    return sponsorSegments(sourceVideoId, settings.categories.filter(key => Object.hasOwn(CATEGORIES,key)));
  }
  if (message.type === 'ADD_QUEUE' && (page || sourceVideoId === message.item?.videoId)) return mutate(async () => {
    if (!VIDEO_ID.test(message.item?.videoId || '')) return {ok:false};
    const {queue} = await readState();
    const next = sanitizeQueue([...queue,message.item]);
    await chrome.storage.local.set({queue:next});
    return {ok:true,queue:next};
  });
  if (message.type === 'REMOVE_QUEUE' && page) return mutate(async () => {
    const {queue} = await readState();
    const next = queue.filter(item => item.videoId !== message.videoId);
    await chrome.storage.local.set({queue:next});
    return {ok:true,queue:next};
  });
  if (message.type === 'NEXT_QUEUE' && (page || (sourceVideoId && sourceVideoId === message.currentVideoId))) return mutate(async () => {
    const {settings,queue} = await readState();
    if (!page && (!settings.enabled || (message.automatic && !settings.autoQueue))) return {ok:false};
    const item = queue.find(item => item.videoId !== message.currentVideoId) || null;
    // Selection is non-destructive. A failed/unavailable destination stays in
    // the queue, including across browser restarts. Session receipts contain
    // no new persistent queue schema and survive service-worker suspension.
    const tabId = page ? message.tabId : sender.tab?.id;
    if (item && Number.isInteger(tabId)) await chrome.storage.session.set({[`queue:${tabId}`]:{from:message.currentVideoId,target:item.videoId}});
    return {ok:true,item};
  });
  if (message.type === 'QUEUE_PLAYING' && sourceVideoId && sourceVideoId === message.videoId && Number.isInteger(sender.tab?.id)) return mutate(async () => {
    const key = `queue:${sender.tab.id}`;
    const receipt = (await chrome.storage.session.get([key]))[key];
    if (!receipt || receipt.target !== sourceVideoId) return {ok:true};
    const {settings,queue} = await readState();
    if (!settings.enabled) return {ok:false};
    await chrome.storage.local.set({queue:queue.filter(item => item.videoId !== receipt.target && item.videoId !== receipt.from)});
    await chrome.storage.session.remove(key);
    return {ok:true};
  });
  return {ok:false,error:'Unsupported request'};
}
chrome.runtime.onMessage.addListener((message,sender,respond) => {
  handle(message,sender).then(respond,() => respond({ok:false,error:'Could not save or load data.'}));
  return true;
});
chrome.runtime.onInstalled.addListener(() => {
  mutate(async () => { const state = await readState(); await chrome.storage.local.set({schemaVersion:1,...state}); });
});
