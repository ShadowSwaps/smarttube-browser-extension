// Runs in YouTube's isolated world. Uses only the DOM and HTML media APIs.
(async () => {
  if (globalThis.__smarttubeBrowserLoaded) return;
  globalThis.__smarttubeBrowserLoaded = true;
  const {sanitizeSettings, normalizeSegments, segmentAt, videoIdFromUrl, CATEGORIES} = await import(chrome.runtime.getURL('core.js'));
  let settings = sanitizeSettings();
  let savedEnabled = settings.enabled;
  let video = null, videoId = null, segments = [], generation = 0, status = 'Sponsor skipping is off';
  let host = null, shadow = null, lastSource = '', nextPending = false, appliedVideo = null;
  let lastSkip = null, undoUntil = 0, sessionDisabled = false;
  const send = message => chrome.runtime.sendMessage(message).catch(() => ({ok:false}));
  const title = () => document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim()
    || document.title.replace(/ - YouTube$/, '').slice(0,200);
  const isAd = () => Boolean(video?.closest('.ad-showing, .ad-interrupting'));
  const playable = () => settings.enabled && video && videoId;
  function paint() {
    if (!shadow) return;
    host.hidden = !settings.enabled || !settings.toolbar || !videoId;
    shadow.querySelector('[data-status]').textContent = status;
    shadow.querySelector('[data-speed]').textContent = `${video?.playbackRate || settings.speed}×`;
    const undo = shadow.querySelector('[data-action="undo"]');
    undo.hidden = !lastSkip;
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
    nextPending = true;
    try {
      const current = videoId;
      const result = await send({type:'NEXT_QUEUE',currentVideoId:current,automatic});
      if (result.ok && result.item && current === videoId) location.assign(`https://www.youtube.com/watch?v=${result.item.videoId}`);
      else if (!automatic) notice('Your queue is empty');
    } finally { nextPending = false; }
  }
  function tick() {
    if (!playable() || isAd() || video.paused || video.seeking || !settings.sponsorEnabled || Date.now() < undoUntil) return;
    // A non-finite duration denotes a live stream; never auto-seek live content.
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.closest('.ytp-live')) return;
    const segment = segmentAt(segments,video.currentTime);
    if (!segment || segment.end > video.duration) return;
    const before = video.currentTime;
    lastSkip = {before,end:segment.end};
    video.currentTime = segment.end;
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
    else if (name === 'speed' && Number.isFinite(value)) video.playbackRate = Math.min(3,Math.max(.25,value));
    else if (name === 'queue') send({type:'ADD_QUEUE',item:{videoId,title:title()}}).then(result => notice(result.ok ? 'Added to your queue' : 'Could not save queue'));
    else if (name === 'next') next();
    else if (name === 'undo' && lastSkip) {
      const saved = lastSkip; undoUntil = Date.now() + Math.max(10_000,(saved.end-saved.before+2)*1000 / video.playbackRate);
      video.currentTime = saved.before; lastSkip = null; notice('Skip undone · temporary skip protection');
    }
    return {ok:true};
  }
  function mount() {
    const player = video?.closest('#movie_player, #shorts-player, .html5-video-player');
    if (!player) return;
    if (!host) {
      host = document.createElement('div'); host.id = 'smarttube-browser-toolbar';
      shadow = host.attachShadow({mode:'open'});
      shadow.innerHTML = `<style>
        :host{position:absolute;left:12px;top:12px;z-index:60;font:12px/1.4 system-ui,sans-serif;color:#f4f6fa;max-width:calc(100% - 24px)}
        :host([hidden]){display:none} .bar{display:flex;gap:5px;align-items:center;padding:6px;background:#151921eb;border:1px solid #485364;border-radius:10px;box-shadow:0 4px 18px #0005;opacity:.3;transition:opacity .15s}
        .bar:hover,.bar:focus-within{opacity:1} strong{color:#7be0c7;margin:0 5px} button{border:0;border-radius:5px;color:inherit;background:#28313e;padding:6px 8px;cursor:pointer;font:inherit} button:hover{background:#3d4a5c} button:focus-visible{outline:2px solid #7be0c7;outline-offset:2px} [hidden]{display:none} .status{max-width:230px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0 5px}@media(max-width:650px){.status{display:none}}
        </style><div class="bar" aria-label="SmartTube playback tools"><strong>ST</strong><button data-action="seek-back" aria-label="Rewind ten seconds">−10s</button><button data-action="toggle" aria-label="Play or pause">▶ / Ⅱ</button><button data-action="seek-forward" aria-label="Forward ten seconds">+10s</button><button data-action="speed" data-speed aria-label="Cycle playback speed">1×</button><button data-action="queue" aria-label="Add this video to queue">+ Queue</button><button data-action="next" aria-label="Play next queued video">Next</button><button data-action="undo" hidden>Undo skip</button><span class="status" role="status" data-status></span></div>`;
      shadow.addEventListener('click', event => {
        event.stopPropagation();
        const button = event.target.closest('button');
        if (!button) return;
        const name = button.dataset.action;
        if (name === 'seek-back' || name === 'seek-forward') action('seek', name === 'seek-back' ? -10 : 10);
        else if (name === 'speed') {
          const speeds = [1,1.25,1.5,1.75,2];
          const speed = speeds.find(rate => rate > video.playbackRate + .01) || 1;
          action('speed',speed);
        } else action(name);
        paint();
      });
      for (const type of ['keydown','keyup']) shadow.addEventListener(type,event => event.stopPropagation());
      for (const type of ['pointerdown','pointerup','mousedown','mouseup','dblclick','touchstart','touchend']) shadow.addEventListener(type,event => event.stopPropagation());
    }
    if (host.parentElement !== player) player.append(host);
    paint();
  }
  function onEnded() { if (settings.autoQueue && !isAd()) next(true); }
  function onMetadata() { applySpeed(); }
  function applySpeed() {
    if (playable() && !isAd() && appliedVideo !== `${videoId}:${lastSource}` && video.readyState >= 1) {
      video.playbackRate = settings.speed;
      appliedVideo = `${videoId}:${lastSource}`;
    }
  }
  function sync() {
    const nextId = videoIdFromUrl(location.href);
    const found = nextId ? [...document.querySelectorAll('video')].find(item => item.offsetWidth > 0 && !item.ended) || document.querySelector('video') : null;
    if (nextId !== videoId) { videoId = nextId; appliedVideo = null; loadSegments(); }
    if (found !== video) {
      if (video) { video.removeEventListener('timeupdate',tick); video.removeEventListener('ended',onEnded); video.removeEventListener('loadedmetadata',onMetadata); }
      video = found; appliedVideo = null;
      if (video) { video.addEventListener('timeupdate',tick); video.addEventListener('ended',onEnded); video.addEventListener('loadedmetadata',onMetadata); }
    }
    if (video) {
      if (video.currentSrc !== lastSource) { lastSource = video.currentSrc; appliedVideo = null; }
      mount(); applySpeed(); tick();
    } else if (host) host.hidden = true;
  }
  chrome.runtime.onMessage.addListener((message,sender,respond) => {
    if (sender.id !== chrome.runtime.id) return;
    if (message.type === 'PLAYER_STATUS') respond({ok:true,videoId,title:videoId ? title() : '',paused:video?.paused ?? true,position:video?.currentTime || 0,duration:Number.isFinite(video?.duration) ? video.duration : 0,speed:video?.playbackRate || settings.speed,status});
    if (message.type === 'CONTROL') respond(action(message.action,message.value));
  });
  chrome.storage.onChanged.addListener((changes,area) => {
    if (area !== 'local' || !changes.settings) return;
    const old = settings;
    settings = sanitizeSettings(changes.settings.newValue);
    savedEnabled = settings.enabled;
    if (sessionDisabled) settings.enabled = false;
    if (settings.enabled && video && settings.speed !== old.speed && !isAd()) video.playbackRate = settings.speed;
    loadSegments(); sync();
  });
  document.addEventListener('keydown',event => {
    const element = event.composedPath()[0];
    if (element?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element?.tagName || '')) return;
    if (event.altKey && event.shiftKey && event.code === 'KeyS') {
      sessionDisabled = !sessionDisabled; settings.enabled = !sessionDisabled && savedEnabled;
      generation++; segments = []; sync(); if (!sessionDisabled) loadSegments();
      event.preventDefault();
    }
  });
  const state = await send({type:'GET_STATE'});
  if (state.ok) { settings = sanitizeSettings(state.settings); savedEnabled = settings.enabled; }
  document.addEventListener('yt-navigate-finish',sync);
  sync();
  setInterval(sync,500);
})().catch(() => { /* Reloading an extension invalidates its old content context; refresh the page. */ });
