// Narrow MAIN-world adapter. No extension APIs, network, storage or reloads.
// YouTube's watch-player API is capability-tested, not a promised public API.
(() => {
  const levels = {tiny:144,small:240,medium:360,large:480,hd720:720,hd1080:1080,hd1440:1440,hd2160:2160,hd2880:2880,highres:4320};
  const preferences = ['auto','highest',...Object.values(levels).map(String)];
  let state = null;
  function currentId() {
    const url = new URL(location.href), id = url.pathname === '/watch' && url.searchParams.get('v');
    return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
  }
  function current() {
    const id = currentId();
    if (!state || state.id !== id) state = {id,preference:'auto',manual:false,until:Date.now()+8000,attempts:0,last:0,owned:false,result:'off'};
    return state;
  }
  function manual(event) {
    if (event.isTrusted && event.target.closest?.('.ytp-settings-button,.ytp-settings-menu')) {
      const s = current(); s.manual = true; s.release = null; s.result = 'manual';
    }
  }
  // Listen before settings/player initialization, including keyboard activation.
  document.addEventListener('pointerdown',manual,true);
  document.addEventListener('keydown',event => {if (['Enter',' ','ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(event.key)) manual(event);},true);
  document.addEventListener('smarttube-quality-request-v1',event => {
    const media = event.target;
    if (!(media instanceof HTMLVideoElement) || !media.isConnected || typeof event.detail !== 'string' || event.detail.length > 1024) return;
    let request;
    try { request = JSON.parse(event.detail); } catch { return; }
    if (!request || request.version !== 1 || typeof request.id !== 'string' || request.id.length > 80
      || Object.keys(request).some(k => !['version','id','videoId','preference'].includes(k))
      || !preferences.includes(request.preference) || !request.videoId || request.videoId !== currentId()) return;
    const s = current(), player = media.closest('#movie_player');
    let selected = null, effective = null;
    try {
      const supported = player && ['getAvailableQualityLevels','getPlaybackQuality','setPlaybackQualityRange','getVideoData'].every(k => typeof player[k] === 'function');
      if (request.preference !== s.preference) {
        // A setting edit cannot undo this video's native manual override.
        s.preference = request.preference; s.until = Date.now()+8000; s.attempts = 0; s.last = 0; s.result = 'waiting';
        s.release = s.preference === 'auto' && s.owned && !s.manual
          ? {until:Date.now()+8000,attempts:0,last:0} : null;
      }
      if (s.manual) s.result = 'manual';
      else if (s.preference === 'auto') {
        // Ownership survives transient capability/identity/setter failures.
        // Polling the same Auto request must not restart this release budget.
        const pending = s.release;
        if (!s.owned) s.result = 'off';
        else if (!pending || Date.now() > pending.until || pending.attempts >= 4) s.result = 'release-failed';
        else {
          s.result = 'releasing';
          if (supported && player.getVideoData()?.video_id === s.id && Date.now()-pending.last >= 1000) {
            pending.attempts++; pending.last = Date.now();
            try {
              player.setPlaybackQualityRange('auto','auto');
              s.owned = false; s.release = null; s.target = null; s.result = 'off';
            } catch { if (pending.attempts >= 4) s.result = 'release-failed'; }
          }
        }
      }
      else if (Date.now() > s.until || s.result === 'confirmed') {if (s.result !== 'confirmed') s.result = 'unconfirmed';}
      else if (!supported) s.result = 'unsupported';
      else if (player.getVideoData()?.video_id !== s.id || media.readyState < 1 || player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting') || player.classList.contains('ytp-live')) s.result = 'waiting';
      else {
        const offered = player.getAvailableQualityLevels();
        const available = Array.isArray(offered) ? offered.filter(k => Object.hasOwn(levels,k)).sort((a,b) => levels[b]-levels[a]) : [];
        selected = available.find(k => s.preference === 'highest' || levels[k] <= Number(s.preference));
        effective = player.getPlaybackQuality();
        if (!selected) s.result = 'unavailable';
        else if (s.target === selected && s.owned && effective === selected && media.videoHeight === levels[selected]) s.result = 'confirmed';
        else if (s.attempts < 4 && Date.now()-s.last >= 1000) {
          s.attempts++; s.last = Date.now(); s.target = selected; s.owned = true;
          player.setPlaybackQualityRange(selected,selected); s.result = 'applying';
        }
      }
    } catch {s.result = 'unsupported';}
    media.dispatchEvent(new CustomEvent('smarttube-quality-receipt-v1',{detail:JSON.stringify({version:1,id:request.id,result:s.result,selected:selected || s.target || null,effective})}));
  },true);
})();
