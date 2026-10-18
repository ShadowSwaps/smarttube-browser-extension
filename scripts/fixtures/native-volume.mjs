// Main-world fixture only: deliberately separate site-owned and media state.
// DOM-only volume assignment must NOT silently update native state in tests.
export function installNativeVolumeFixture() {
  const installed = new WeakSet();
  function attach() {
    for (const player of document.querySelectorAll('#movie_player,#shorts-player,.html5-video-player')) {
      if (installed.has(player) || !player.querySelector('video')) continue;
      installed.add(player);
      const video = () => player.querySelector('video');
      let level = video().volume*100, muted = video().muted;
      let rate = 1;
      const speed = document.createElement('button');speed.className='ytp-settings-button';speed.setAttribute('aria-label','Native playback speed');
      speed.style.cssText='position:absolute;right:10px;bottom:30px';player.append(speed);
      player.setPlaybackRate = value => {rate=Math.max(.25,Math.min(Number(player.dataset.nativeMaxRate)||3,Number(value)));video().playbackRate=rate;speed.textContent=rate===1?'Playback speed Normal (1×)':`Playback speed ${rate}×`;};
      player.getPlaybackRate = () => rate;
      player.getAvailablePlaybackRates = () => [.25,.5,.75,1,1.25,1.5,1.75,Number(player.dataset.nativeMaxRate)||3];
      speed.textContent='Playback speed Normal (1×)';
      let panel = player.querySelector('.ytp-volume-panel');
      if (!panel) {
        panel = document.createElement('div');panel.className = 'ytp-volume-panel';panel.tabIndex = 0;
        panel.style.cssText = 'position:absolute;left:16px;bottom:30px;width:100px;height:20px;background:#777';
        player.append(panel);
      }
      panel.setAttribute('role','slider');panel.setAttribute('aria-label','Native volume state');
      panel.setAttribute('aria-valuemin','0');panel.setAttribute('aria-valuemax','100');
      const update = () => {panel.setAttribute('aria-valuenow',String(level));panel.setAttribute('aria-valuetext',`${level}% volume`);};
      player.setVolume = value => {level=Math.max(0,Math.min(100,Number(value)));video().volume=level/100;update();};
      player.getVolume = () => level;
      player.isMuted = () => muted;
      player.mute = () => {muted=true;video().muted=true;};
      player.unMute = () => {muted=false;video().muted=false;};
      player.querySelector('.ytp-mute-button')?.addEventListener('click',() => player[muted?'unMute':'mute']());
      player.querySelector('input.ytp-volume-slider')?.addEventListener('input',event => player.setVolume(Number(event.target.value)*100));
      panel.addEventListener('pointerdown',event => {const r=panel.getBoundingClientRect();player.setVolume(Math.round((event.clientX-r.left)/r.width*100));});
      player.addEventListener('keydown',event => {
        if (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
        if (event.code === 'ArrowDown') {player.setVolume(level-5);event.preventDefault();}
        if (event.code === 'ArrowUp') {player.setVolume(level+5);event.preventDefault();}
        if (event.code === 'KeyM') player[muted?'unMute':'mute']();
      });
      update();
    }
  }
  new MutationObserver(attach).observe(document,{childList:true,subtree:true});attach();
}
