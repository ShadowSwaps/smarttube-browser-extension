// MAIN world, top frame, exact YouTube match. This adapter has no extension
// API or settings access. Page-visible requests/receipts are untrusted data.
(() => {
  const requestType = 'smarttube-volume-request-v1', receiptType = 'smarttube-volume-receipt-v1';
  function holdMuted(media) {
    if (Object.getOwnPropertyDescriptor(media,'muted')) throw new Error();
    const native = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'muted');
    if (!native?.get || !native?.set) throw new Error();
    const read = () => native.get.call(media);
    const write = next => native.set.call(media,next);
    write(true);
    Object.defineProperty(media,'muted',{configurable:true,enumerable:false,get:read,set(next){if(next)write(true);}});
    return () => {delete media.muted;};
  }
  function currentId() {
    const url = new URL(location.href);
    const id = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/shorts\/([^/]+)\/?$/.exec(url.pathname)?.[1];
    return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
  }
  document.addEventListener(requestType, event => {
    const media = event.target;
    if (!(media instanceof HTMLVideoElement) || !media.isConnected || typeof event.detail !== 'string' || event.detail.length > 8192) return;
    let request;
    try { request = JSON.parse(event.detail); } catch { return; }
    if (!request || request.version !== 1 || typeof request.id !== 'string' || request.id.length > 80
      || Object.keys(request).some(key => !['version','id','percent','unmute','videoId','source'].includes(key))
      || typeof request.percent !== 'number' || !Number.isFinite(request.percent) || request.percent < 0 || request.percent > 100
      || typeof request.unmute !== 'boolean' || request.videoId !== currentId() || !request.videoId
      || typeof request.source !== 'string' || request.source !== media.currentSrc) return;
    const player = media.closest('#movie_player,#shorts-player,.html5-video-player');
    const receipt = {version:1,id:request.id,ok:false};
    // An own property can shadow the platform mute state, even when both the
    // page and native API appear unmuted. Reject before any mutation or success
    // shortcut; leave the page's descriptor and existing playback untouched.
    if (request.unmute && request.percent > 0 && Object.getOwnPropertyDescriptor(media,'muted')) {
      media.dispatchEvent(new CustomEvent(receiptType,{detail:JSON.stringify(receipt)}));
      return;
    }
    try {
      if (!player || !['setVolume','getVolume','isMuted','mute','unMute'].every(name => typeof player[name] === 'function')) throw new Error();
      const muted = request.unmute && request.percent > 0 ? false : Boolean(player.isMuted() || media.muted);
      player.setVolume(request.percent);
      // Never deliberately unmute an unverified or partially applied volume.
      if (!(Math.abs(Number(player.getVolume())-request.percent) < .1 && Math.abs(media.volume*100-request.percent) < .1)) throw new Error();
      if (Boolean(player.isMuted()) !== muted || media.muted !== muted) {
        if (muted) player.mute();
        else {
          // Unmute can restore YouTube's previously audible volume. Hold media
          // muted until the target is reapplied; restore the descriptor even
          // if a native method throws. No persistent media interception.
          const restore = holdMuted(media);
          try {
            player.unMute(); player.setVolume(request.percent);
            if (!(Math.abs(Number(player.getVolume())-request.percent) < .1 && Math.abs(media.volume*100-request.percent) < .1)) throw new Error();
          } finally { restore(); }
          media.muted = false;
        }
      }
      receipt.ok = Math.abs(Number(player.getVolume())-request.percent) < .1
        && Math.abs(media.volume*100-request.percent) < .1 && media.muted === muted && Boolean(player.isMuted()) === muted;
      if (!receipt.ok && request.unmute) player.mute();
    } catch {
      // A native unmute can throw after a partial mutation. Fail closed.
      if (request.unmute) { try { player?.mute?.(); } catch { /* Native failure. */ } }
    }
    media.dispatchEvent(new CustomEvent(receiptType,{detail:JSON.stringify(receipt)}));
  },true);

  // Separate fixed rate protocol. Page-visible input can only control this
  // connected video's native player; it exposes no extension capabilities.
  document.addEventListener('smarttube-speed-request-v1',event => {
    const media = event.target;
    if (!(media instanceof HTMLVideoElement) || !media.isConnected || typeof event.detail !== 'string' || event.detail.length > 8192) return;
    let request;
    try { request = JSON.parse(event.detail); } catch { return; }
    if (!request || request.version !== 1 || typeof request.id !== 'string' || request.id.length > 80
      || Object.keys(request).some(key => !['version','id','rate','videoId','source'].includes(key))
      || typeof request.rate !== 'number' || !Number.isFinite(request.rate) || request.rate < .25 || request.rate > 3
      || request.videoId !== currentId() || !request.videoId || typeof request.source !== 'string' || request.source !== media.currentSrc) return;
    const player = media.closest('#movie_player,#shorts-player,.html5-video-player');
    const receipt = {version:1,id:request.id,ok:false};
    try {
      if (!player || !['setPlaybackRate','getPlaybackRate','getAvailablePlaybackRates'].every(name => typeof player[name] === 'function')) throw new Error();
      const available = player.getAvailablePlaybackRates();
      if (!Array.isArray(available) || !available.length || available.length > 32 || available.some(rate => typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0 || rate > 16)) throw new Error();
      const min = Math.max(.25,Math.min(...available)), max = Math.min(3,Math.max(...available));
      if (min > max) throw new Error();
      const rate = Math.round(Math.max(min,Math.min(max,request.rate))*100)/100;
      player.setPlaybackRate(rate);
      receipt.ok = Math.abs(Number(player.getPlaybackRate())-rate) < .001 && Math.abs(media.playbackRate-rate) < .001;
      if (receipt.ok) { receipt.rate = rate; receipt.limited = Math.abs(rate-request.rate) > .001; }
    } catch { /* No media-only fallback or guessed success. */ }
    media.dispatchEvent(new CustomEvent('smarttube-speed-receipt-v1',{detail:JSON.stringify(receipt)}));
  },true);
})();
