// Runs in YouTube's isolated world. Uses only the DOM and HTML media APIs.
(async () => {
  if (globalThis.__smarttubeBrowserLoaded) return;
  globalThis.__smarttubeBrowserLoaded = true;
  const initialUrl = location.href;
  const {sanitizeSettings, normalizeSegments, segmentAt, videoIdFromUrl, createQueueMediaTracker, CATEGORIES} = await import(chrome.runtime.getURL('core.js'));
  const {createAppearance} = await import(chrome.runtime.getURL('appearance.js'));
  let settings = sanitizeSettings();
  let savedEnabled = settings.enabled;
  let video = null, videoId = null, segments = [], generation = 0, status = 'Sponsor skipping is off';
  let host = null, shadow = null, lastSource = '', nextPending = false, attemptedEnd = null;
  let queueConfirmed = '', confirmingQueue = false;
  const queueMedia = createQueueMediaTracker(videoIdFromUrl(initialUrl));
  let speedKey = '', speedStartup = null, manualSpeed = false;
  let loopStart = null, loopEnd = null, loopEnabled = false, loopVideo = null, originalLoop = false;
  let lastWheel = 0;
  let lastSkip = null, undoUntil = 0, sessionDisabled = false;
  let cinemaOverride = null, panelOpen = false, entry = null;
  let pictureOverrides = {};
  let observedPlayer = null;
  let lastPlayerPointer = 0;
  const playerSize = new ResizeObserver(() => {if(video)mount();});
  const playerVisibility = new MutationObserver(() => {if(observedPlayer && entry)layoutEntry(observedPlayer);});
  const cinemaEnabled = () => settings.enabled && Boolean(videoId) && (cinemaOverride ?? settings.cinema);
  const appearance = createAppearance({onExitCinema:() => {cinemaOverride = false; sync();},toolsHaveEscape:() => panelOpen && Boolean(shadow?.activeElement)});
  const send = message => chrome.runtime.sendMessage(message).catch(() => ({ok:false}));
  const title = () => document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim()
    || document.title.replace(/ - YouTube$/, '').slice(0,200);
  const isAd = () => Boolean(video?.closest('.ad-showing, .ad-interrupting'));
  const playable = () => settings.enabled && video && videoId;
  function paint() {
    if (!shadow) return;
    host.hidden = !settings.enabled || !settings.toolbar || !videoId;
    shadow.querySelector('[data-status]').textContent = status;
    entry.hidden = host.hidden;
    entry.title = `SmartTube · ${status}${lastSkip ? ' · Undo skip available' : ''}`;
    entry.textContent = lastSkip ? 'ST·' : 'ST';
    for (const input of shadow.querySelectorAll('[data-setting]')) {
      if (shadow.activeElement === input) continue;
      const value = pictureOverrides[input.dataset.setting] ?? settings[input.dataset.setting];
      if (input.type === 'checkbox') input.checked = value;
      else input.value = value;
    }
    shadow.querySelector('[data-action="loop"]').setAttribute('aria-pressed',String(loopEnabled));
    shadow.querySelector('[data-action="loop"]').textContent = loopEnabled ? 'Loop on' : 'Loop';
    shadow.querySelector('[data-action="loop-a"]').textContent = loopStart === null ? 'A' : `A ${Math.floor(loopStart)}s`;
    shadow.querySelector('[data-action="loop-b"]').textContent = loopEnd === null ? 'B' : `B ${Math.floor(loopEnd)}s`;
    for (const name of ['loop','loop-a','loop-b']) shadow.querySelector(`[data-action="${name}"]`).disabled = !playable() || !Number.isFinite(video.duration) || isAd() || Boolean(video.closest('.ytp-live'));
    shadow.querySelector('[data-action="cinema"]').setAttribute('aria-pressed',String(cinemaEnabled()));
    const undo = shadow.querySelector('[data-action="undo"]');
    undo.hidden = !lastSkip;
    if (host.hidden && panelOpen) setPanel(false,false);
  }
  function notice(text) { status = text; paint(); }
  async function loadSegments() {
    const token = ++generation;
    segments = [];
    lastSkip = null;
    undoUntil = 0;
    if (!videoId || !settings.enabled || !settings.sponsorEnabled || !settings.categories.length) {
      notice('Sponsor skipping is off'); return;
    }
    notice('Loading sponsor segments…');
    const result = await send({type:'SEGMENTS',videoId});
    if (token !== generation) return;
    if (!result.ok) { notice('SponsorBlock unavailable · playback unaffected'); return; }
    // Metadata may still describe an ad or the previous video during SPA navigation.
    // Validate against the current duration at the instant of the seek instead.
    segments = normalizeSegments(result.segments,settings.categories);
    notice(segments.length ? `${segments.length} sponsor segment${segments.length === 1 ? '' : 's'} ready` : 'No matching sponsor segments');
  }
  async function next(automatic = false) {
    if (nextPending || !playable()) return;
    if (automatic && attemptedEnd === videoId) return;
    if (automatic) attemptedEnd = videoId;
    nextPending = true;
    const current = videoId;
    try {
      const result = await send({type:'NEXT_QUEUE',currentVideoId:current,automatic});
      if (current !== videoId || !playable() || (automatic && (!settings.autoQueue || loopEnabled))) return;
      if (!result.ok) { notice('Could not open queue · your items are saved'); return; }
      if (!result.item) { if (!automatic) notice('Your queue is empty'); return; }
      notice('Opening next video · queue kept until playback starts');
      location.assign(`https://www.youtube.com/watch?v=${result.item.videoId}`);
      // Keep repeated ended/click events from racing a slow navigation. A
      // deliberate retry is possible after the timeout; automatic retries stop.
      await new Promise(resolve => setTimeout(resolve,10000));
      if (current === videoId) notice('Video did not open · queue saved; use Next to retry');
    } catch { notice('Could not open video · queue saved; use Next to retry'); }
    finally { if (current === videoId) nextPending = false; }
  }
  async function confirmQueue() {
    if (!playable() || isAd() || !queueMedia.matches(videoId,video) || video.error || video.paused || video.ended || video.readyState < 2 || !video.played.length || video.currentTime <= 0 || queueConfirmed === videoId || confirmingQueue) return;
    const current = videoId;
    confirmingQueue = true;
    try { if ((await send({type:'QUEUE_PLAYING',videoId:current})).ok && current === videoId) queueConfirmed = current; }
    finally { confirmingQueue = false; }
  }
  function tick() {
    if (!playable() || isAd() || video.paused || video.seeking) return;
    if (loopEnabled && loopStart !== null && loopEnd !== null && Number.isFinite(video.duration) && loopEnd <= video.duration && video.currentTime >= loopEnd) {
      video.currentTime = loopStart; return;
    }
    if (!settings.sponsorEnabled || Date.now() < undoUntil) return;
    // A non-finite duration denotes a live stream; never auto-seek live content.
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.closest('.ytp-live')) return;
    const segment = segmentAt(segments,video.currentTime);
    if (!segment || segment.end > video.duration) return;
    const before = video.currentTime;
    const end = loopEnabled && loopEnd !== null ? Math.min(segment.end,loopEnd) : segment.end;
    lastSkip = {before,end};
    video.currentTime = end;
    notice(`Skipped ${CATEGORIES[segment.category]?.toLowerCase() || 'segment'} · undo available`);
  }
  function action(name, value) {
    if (!playable()) return {ok:false,error:'Open a YouTube video first.'};
    if (name === 'toggle') {
      // Use the site's own control when available so its player state stays in
      // sync after consent dialogs, autoplay restrictions and media reloads.
      const nativeControl = video.closest('.html5-video-player')?.querySelector('.ytp-play-button');
      if (nativeControl) nativeControl.click();
      else if (video.paused) video.play().catch(() => notice('Press play on the video'));
      else video.pause();
    }
    else if (name === 'seek' && Number.isFinite(value)) video.currentTime = Math.max(0,Math.min(Number.isFinite(video.duration) ? video.duration : Infinity,video.currentTime + Math.max(-60,Math.min(60,value))));
    else if (name === 'speed' && Number.isFinite(value)) {
      manualSpeed = true; speedStartup = null;
      video.playbackRate = Math.round(Math.min(3,Math.max(.25,value))*100)/100;
    }
    else if (name === 'volume' && Number.isFinite(value)) { video.volume = Math.max(0,Math.min(1,value)); if (value > 0) video.muted = false; }
    else if (name === 'volume-down') action('volume',video.volume-.1);
    else if (name === 'volume-up') action('volume',video.volume+.1);
    else if (name === 'mute') video.muted = !video.muted;
    else if (name === 'cinema') { cinemaOverride = !cinemaEnabled(); sync(); }
    else if (name === 'loop') {
      if (!Number.isFinite(video.duration) || video.closest('.ytp-live') || isAd()) return {ok:false,error:'Looping is available on regular videos.'};
      loopEnabled = !loopEnabled; applyLoop();
    }
    else if (name === 'loop-a') {
      if (!Number.isFinite(video.duration) || video.closest('.ytp-live') || isAd()) return {ok:false,error:'Looping is available on regular videos.'};
      loopStart = video.currentTime;
      if (loopEnd !== null && loopEnd <= loopStart+.2) { loopEnd = null; loopEnabled = false; applyLoop(); }
      notice('Loop start set · choose B after A');
    }
    else if (name === 'loop-b') {
      if (!Number.isFinite(video.duration) || video.closest('.ytp-live') || isAd() || loopStart === null || video.currentTime <= loopStart+.2) {
        notice('Set A first, then choose B at least 0.2s later');
        return {ok:false,error:'Choose a loop end after its start.'};
      }
      loopEnd = video.currentTime; loopEnabled = true; applyLoop(); notice('A–B loop enabled');
    }
    else if (name === 'loop-clear') { clearLoop(); notice('Loop cleared'); }
    else if (name === 'queue') send({type:'ADD_QUEUE',item:{videoId,title:title()}}).then(result => notice(result.ok ? 'Added to your queue' : 'Could not save queue'));
    else if (name === 'next') next();
    else if (name === 'undo' && lastSkip) {
      const saved = lastSkip; undoUntil = Date.now() + Math.max(10_000,(saved.end-saved.before+2)*1000 / video.playbackRate);
      video.currentTime = saved.before; lastSkip = null; notice('Skip undone · temporary skip protection');
    }
    paint(); return {ok:true};
  }
  function applyLoop() {
    if (loopEnabled) {
      if (loopVideo !== video) { loopVideo = video; originalLoop = video.loop; }
      video.loop = loopStart === null || loopEnd === null;
    } else if (loopVideo) { loopVideo.loop = originalLoop; loopVideo = null; }
  }
  function clearLoop() {
    loopEnabled = false; applyLoop(); loopStart = null; loopEnd = null;
  }
  function mount() {
    const player = video?.closest('#movie_player, #shorts-player, .html5-video-player');
    if (!player) { if (host) host.hidden = true; if (entry) entry.hidden = true; return; }
    if (!host) {
      host = document.createElement('div'); host.id = 'smarttube-browser-toolbar';
      host.setAttribute('role','region'); host.setAttribute('aria-label','SmartTube tools');
      shadow = host.attachShadow({mode:'open'});
      shadow.innerHTML = `<style>
        :host{position:absolute;right:12px;bottom:var(--tools-bottom,72px);z-index:60;font:12px/1.4 system-ui,sans-serif;color:#f4f6fa;width:300px;max-width:calc(100% - 24px)}
        :host([hidden]),[hidden]{display:none!important}.bar{box-sizing:border-box;max-height:var(--panel-height,240px);overflow:auto;padding:12px;background:#181818f5;border:1px solid #555;border-radius:10px;box-shadow:0 4px 18px #0005}
        .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0} .heading{display:flex;justify-content:space-between;align-items:center}:host([data-fallback]) .heading{padding-right:40px}details{border-top:1px solid #444;margin-top:10px;padding-top:10px}summary{cursor:pointer;padding:4px 0}label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 0}input[type=range]{width:120px;max-width:50%;accent-color:#ddd}
        button{border:0;border-radius:5px;color:inherit;background:#333;min-height:32px;padding:5px 9px;cursor:pointer;font:inherit}button:hover{background:#484848}button:focus-visible,summary:focus-visible,input:focus-visible{outline:2px solid #7be0c7;outline-offset:2px}button[aria-pressed=true]{background:#426052}.status{display:block;margin-top:10px;overflow-wrap:anywhere;color:#ccc}
        </style><div id="smarttube-tools" class="bar" role="group" aria-label="SmartTube player tools" hidden><div class="heading"><strong>SmartTube</strong><button data-close aria-label="Close SmartTube tools">×</button></div><div class="row"><button data-action="queue" aria-label="Add this video to queue">+ Queue</button><button data-action="next" aria-label="Play next queued video">Next</button><button data-action="cinema" aria-label="Toggle cinema mode" aria-pressed="false">Cinema</button></div><button data-action="undo" hidden>Undo skip</button><details><summary>Loop video / A–B</summary><div class="row"><button data-action="loop" aria-label="Toggle video loop" aria-pressed="false">Loop</button><button data-action="loop-a" aria-label="Set loop start">A</button><button data-action="loop-b" aria-label="Set loop end">B</button><button data-action="loop-clear" aria-label="Clear loop range">Clear</button></div></details><details data-picture><summary>Picture and distractions</summary></details><span class="status" role="status" data-status></span></div>`;
      const picture = shadow.querySelector('[data-picture]');
      picture.insertAdjacentHTML('beforeend','<p>For this tab. Save defaults in extension Settings.</p>');
      const toggles = {filtersEnabled:'Enable video filters',hideComments:'Hide comments',hideRelated:'Hide related videos',hideChat:'Hide live chat',hideShorts:'Hide Shorts shelves',hideEndCards:'Hide end screens',hideInfoCards:'Hide info cards'};
      for (const [key,label] of Object.entries(toggles)) picture.insertAdjacentHTML('beforeend',`<label>${label}<input type="checkbox" data-setting="${key}"></label>`);
      for (const [key,label,min,max] of [['filterBrightness','Brightness',50,150],['filterContrast','Contrast',50,150],['filterSaturation','Saturation',0,200],['filterGrayscale','Grayscale',0,100]]) picture.insertAdjacentHTML('beforeend',`<label>${label}<input aria-label="${label}" type="range" min="${min}" max="${max}" data-setting="${key}"></label>`);
      picture.insertAdjacentHTML('beforeend','<button data-reset-picture>Reset video filters</button>');
      // Saved preferences remain owned by extension pages. Player tools apply
      // tab-only presentation overrides without changing storage or routing.
      const savePicture = patch => {pictureOverrides={...pictureOverrides,...patch};sync();notice('Picture changed for this tab');};
      shadow.addEventListener('change',event => {const input=event.target;if(input.dataset.setting) savePicture({[input.dataset.setting]:input.type === 'checkbox' ? input.checked : Number(input.value)});});
      entry = document.createElement('button'); entry.id='smarttube-player-entry'; entry.type='button';
      entry.setAttribute('aria-label','SmartTube controls'); entry.setAttribute('aria-expanded','false'); entry.setAttribute('aria-controls',host.id);
      entry.addEventListener('click',event => {event.stopPropagation();setPanel(!panelOpen);});
      const entryStyle=document.createElement('style');entryStyle.id='smarttube-entry-style';
      entryStyle.textContent='#smarttube-player-entry{box-sizing:border-box;flex:0 0 36px;width:36px;height:36px;align-self:center;border:0;border-radius:6px;padding:0;margin:0 2px;background:#242424bb;color:white;font:600 12px system-ui;cursor:pointer}#smarttube-player-entry[data-fallback]{position:absolute;right:12px;top:12px;z-index:61;opacity:.7}#smarttube-player-entry:hover,#smarttube-player-entry:focus-visible{opacity:1;background:#444}#smarttube-player-entry:focus-visible{outline:2px solid #7be0c7;outline-offset:-2px}#smarttube-player-entry[hidden]{display:none!important}';
      document.documentElement.append(entryStyle);
      const onKey = event => {
        if (event.key === 'Escape' && document.fullscreenElement) return;
        if (event.key === 'Escape' && panelOpen) {event.preventDefault();setPanel(false);}
        event.stopPropagation();
      };
      entry.addEventListener('keydown',onKey);entry.addEventListener('keyup',event=>event.stopPropagation());
      shadow.addEventListener('click', event => {
        event.stopPropagation();
        const button = event.target.closest('button');
        if (!button) return;
        if (button.hasAttribute('data-close')) { setPanel(false); return; }
        if (button.hasAttribute('data-reset-picture')) {savePicture({filtersEnabled:false,filterBrightness:100,filterContrast:100,filterSaturation:100,filterGrayscale:0});return;}
        if (button.dataset.action) {const result=action(button.dataset.action);if(!result.ok)notice(result.error);}
        paint();
      });
      shadow.addEventListener('keydown',onKey);
      shadow.addEventListener('keyup',event => event.stopPropagation());
      for (const type of ['pointerdown','pointerup','mousedown','mouseup','dblclick','touchstart','touchend']) {shadow.addEventListener(type,event => event.stopPropagation());entry.addEventListener(type,event => event.stopPropagation());}
      document.addEventListener('pointerdown',event=>{if(panelOpen && !event.composedPath().includes(host) && !event.composedPath().includes(entry))setPanel(false,false);},true);
      document.addEventListener('focusin',event=>{if(panelOpen && !event.composedPath().includes(host) && !event.composedPath().includes(entry))setPanel(false,false);});
      document.addEventListener('pointermove',event=>{
        if (!observedPlayer?.contains(event.target)) return;
        lastPlayerPointer=Date.now();layoutEntry(observedPlayer);
      },{passive:true});
    }
    if (host.parentElement !== player) player.append(host);
    if (observedPlayer !== player) {
      playerSize.disconnect();playerVisibility.disconnect();observedPlayer=player;
      playerSize.observe(player);playerVisibility.observe(player,{attributes:true,attributeFilter:['class']});
    }
    layoutEntry(player);
    // Reserve the native control/caption area; tools scroll within the rest.
    const caption=player.querySelector('.ytp-caption-window-container');
    const visibleCaption=[...(caption?.querySelectorAll('.caption-window') || [])].find(node=>node.getClientRects().length && getComputedStyle(node).visibility!=='hidden');
    const captionTop=visibleCaption?.getBoundingClientRect().top;
    const rect=player.getBoundingClientRect();
    const bottom=Math.max(76,Number.isFinite(captionTop) ? rect.bottom-captionTop+8 : 0);
    host.style.setProperty('--tools-bottom',`${bottom}px`);
    host.style.setProperty('--panel-height',`${Math.max(32,player.clientHeight-bottom-12)}px`);
    paint();
  }
  function layoutEntry(player,forceFallback=false) {
    const controls=player.querySelector('.ytp-right-controls');
    const native=controls && player.clientWidth>=640 && controls.getBoundingClientRect().width>0;
    const focused=document.activeElement===entry;
    const chrome=controls?.closest('.ytp-chrome-bottom');
    const chromeHidden=player.classList.contains('ytp-autohide') || (chrome && (getComputedStyle(chrome).visibility==='hidden' || Number(getComputedStyle(chrome).opacity)===0));
    // Some coexisting controllers leave native chrome hidden even during
    // pointer activity. Keep one reachable entry without forcing chrome on.
    const needsAccess=focused || Date.now()-lastPlayerPointer<1500 || (entry.hasAttribute('data-fallback') && entry.matches(':hover'));
    const target=native && !forceFallback && !(needsAccess && chromeHidden) ? controls : player;
    if(entry.parentElement!==target){target.append(entry);if(focused)entry.focus({preventScroll:true});}
    entry.toggleAttribute('data-fallback',target===player);
    host.toggleAttribute('data-fallback',target===player);
    const hidden=target===controls && chromeHidden;
    entry.tabIndex=hidden ? -1 : 0;
    entry.style.visibility=hidden ? 'hidden' : '';
    entry.style.pointerEvents=hidden ? 'none' : '';
  }
  function setPanel(open,returnFocus=true) {
    if(open) mount();
    panelOpen = open;
    shadow.querySelector('.bar').hidden = !open;
    entry.setAttribute('aria-expanded',String(open));
    if(open) shadow.querySelector('[data-close]').focus({preventScroll:true});
    else if(returnFocus && !entry.hidden) {layoutEntry(host.parentElement,entry.tabIndex<0);entry.focus({preventScroll:true});}
  }
  function onEnded() { if (video?.ended && settings.autoQueue && !loopEnabled && !isAd() && queueMedia.matches(videoId,video)) next(true); }
  function onQueueLoad() { queueMedia.loading(isAd() ? null : videoIdFromUrl(location.href),video); queueConfirmed = ''; }
  function onMetadata() { queueMedia.metadata(isAd() ? null : videoIdFromUrl(location.href),video); sync(); }
  function applySpeed() {
    if (!playable() || !settings.applySpeed || isAd() || manualSpeed || video.readyState < 1) return;
    if (!speedStartup) return;
    if (!speedStartup.until) speedStartup.until = Date.now()+4000;
    if (Date.now() > speedStartup.until) { speedStartup = null; return; }
    if (Math.abs(video.playbackRate-settings.speed) > .001) {
      if (speedStartup.corrections >= 4) { speedStartup = null; notice('Another speed control is overriding the saved speed'); return; }
      speedStartup.corrections++;
      video.playbackRate = settings.speed;
    }
  }
  function resetSpeed() { speedStartup = {until:0,corrections:0}; manualSpeed = false; }
  function sync() {
    const nextId = videoIdFromUrl(location.href);
    const found = nextId ? [...document.querySelectorAll('video')].find(item => item.offsetWidth > 0 && !item.ended) || document.querySelector('video') : null;
    queueMedia.observe(found?.closest('.ad-showing,.ad-interrupting') ? null : nextId,found);
    if (nextId !== videoId) { clearLoop(); videoId = nextId; nextPending = false; attemptedEnd = null; queueConfirmed = ''; speedKey = ''; resetSpeed(); loadSegments(); send({type:'QUEUE_CONTEXT',videoId}); }
    if (found !== video) {
      if (video) { video.removeEventListener('timeupdate',tick); video.removeEventListener('ended',onEnded); video.removeEventListener('loadedmetadata',onMetadata); video.removeEventListener('loadstart',onQueueLoad); video.removeEventListener('emptied',onQueueLoad); }
      clearLoop(); video = found; speedKey = ''; resetSpeed();
      if (video) { video.addEventListener('timeupdate',tick); video.addEventListener('ended',onEnded); video.addEventListener('loadedmetadata',onMetadata); video.addEventListener('loadstart',onQueueLoad); video.addEventListener('emptied',onQueueLoad); }
    }
    if (video) {
      if (video.currentSrc !== lastSource) { lastSource = video.currentSrc; }
      const key = `${videoId}:${lastSource}`;
      if (key !== speedKey) { speedKey = key; resetSpeed(); }
      mount(); applySpeed(); tick(); confirmQueue();
      if (!nextPending && !video.paused && !video.ended && video.currentTime < video.duration-1) attemptedEnd = null;
    } else if (host) {setPanel(false,false);host.hidden = true;entry.hidden = true;playerSize.disconnect();playerVisibility.disconnect();observedPlayer=null;}
    appearance.update({video:videoId ? video : null,settings:{...settings,...pictureOverrides},cinemaEnabled:cinemaEnabled()});
  }
  chrome.runtime.onMessage.addListener((message,sender,respond) => {
    if (sender.id !== chrome.runtime.id) return;
    if (message.type === 'PLAYER_STATUS') respond({ok:true,videoId,title:videoId ? title() : '',paused:video?.paused ?? true,position:video?.currentTime || 0,duration:Number.isFinite(video?.duration) ? video.duration : 0,speed:video?.playbackRate || settings.speed,volume:video?.volume ?? 1,muted:video?.muted ?? false,loopEnabled,loopStart,loopEnd,cinema:cinemaEnabled(),status});
    if (message.type === 'CONTROL') respond(action(message.action,message.value));
  });
  chrome.storage.onChanged.addListener((changes,area) => {
    if (area !== 'local' || !changes.settings) return;
    const old = settings;
    settings = sanitizeSettings(changes.settings.newValue);
    for (const key of Object.keys(pictureOverrides)) if (settings[key] !== old[key]) delete pictureOverrides[key];
    savedEnabled = settings.enabled;
    if (sessionDisabled) settings.enabled = false;
    if (!settings.enabled) clearLoop();
    if (settings.speed !== old.speed || settings.applySpeed !== old.applySpeed || settings.enabled !== old.enabled) resetSpeed();
    if (settings.cinema !== old.cinema) cinemaOverride = null;
    if (settings.enabled !== old.enabled || settings.sponsorEnabled !== old.sponsorEnabled || settings.categories.join(',') !== old.categories.join(',')) loadSegments();
    sync();
  });
  document.addEventListener('keydown',event => {
    const element = event.composedPath()[0];
    if (element?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element?.tagName || '')) return;
    if (event.altKey && event.shiftKey && event.code === 'KeyS') {
      sessionDisabled = !sessionDisabled; settings.enabled = !sessionDisabled && savedEnabled;
      generation++; segments = []; if (sessionDisabled) clearLoop(); sync(); if (!sessionDisabled) loadSegments();
      event.preventDefault();
    }
    if (event.isTrusted && event.shiftKey && ['Comma','Period'].includes(event.code)) { manualSpeed = true; speedStartup = null; }
  });
  // Native speed menus and other controllers' deliberate user input win over
  // the short startup reconciliation window. No ratechange enforcement loop.
  document.addEventListener('pointerdown',event => {
    if (event.isTrusted && event.target.closest?.('.ytp-settings-button,.ytp-settings-menu,#efyt-speed,#efyt-speed-minus,#efyt-speed-plus')) { manualSpeed = true; speedStartup = null; }
  },true);
  document.addEventListener('wheel',event => {
    const target = event.composedPath()[0];
    if (!playable() || !target?.closest?.('#movie_player,#shorts-player,.html5-video-player') || target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (event.ctrlKey || event.metaKey) { if (event.isTrusted) { manualSpeed = true; speedStartup = null; } return; }
    if (!settings.wheelControls || !event.altKey || !event.deltaY || isAd()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (Date.now()-lastWheel < 60) return;
    lastWheel = Date.now(); const step = event.deltaY < 0 ? 1 : -1;
    if (event.shiftKey) action('volume',video.volume+step*.05);
    else action('speed',video.playbackRate+step*.05);
  },{capture:true,passive:false});
  const state = await send({type:'GET_STATE'});
  if (state.ok) { settings = sanitizeSettings(state.settings); savedEnabled = settings.enabled; }
  document.addEventListener('yt-navigate-finish',sync);
  sync();
  setInterval(sync,500);
})().catch(() => { /* Reloading an extension invalidates its old content context; refresh the page. */ });
