// Original DOM presentation adapter. Never reparents the YouTube player or
// modifies the site's stored preferences. All CSS values come from the core.
import {videoFilterCss} from './core.js';
const HIDDEN = Object.freeze({
  hideComments:'ytd-watch-flexy #comments',
  hideRelated:'ytd-watch-flexy #related, ytd-watch-flexy ytd-watch-next-secondary-results-renderer',
  hideChat:'ytd-watch-flexy #chat, ytd-watch-flexy ytd-live-chat-frame',
  hideShorts:'ytd-reel-shelf-renderer, ytd-reel-item-renderer, ytd-rich-section-renderer:has(ytm-shorts-lockup-view-model), ytd-rich-shelf-renderer:has(ytd-reel-item-renderer), ytd-guide-entry-renderer:has(a[href="/shorts"]), ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
  hideEndCards:'#movie_player .ytp-endscreen-content, #movie_player .ytp-ce-element',
  hideInfoCards:'#movie_player .ytp-cards-button, #movie_player .ytp-cards-teaser'
});
export function createAppearance({onExitCinema}) {
  const style = document.createElement('style'); style.id = 'smarttube-distraction-style';
  (document.head || document.documentElement).append(style);
  let filtered = null, filter = '', releaseFilter = null;
  let player = null, cinema = false, backdrop = null, frame = 0;
  const observer = new ResizeObserver(schedule);
  function restoreFilter() { releaseFilter?.(); releaseFilter = null; filtered = null; filter = ''; }
  function applyFilter(video,css) {
    if (video === filtered && css === filter) return;
    restoreFilter();
    if (!video || !css) return;
    const previous = video.style.getPropertyValue('filter'), priority = video.style.getPropertyPriority('filter');
    const computed = getComputedStyle(video).filter;
    const value = `${computed && computed !== 'none' ? `${computed} ` : ''}${css}`;
    video.style.setProperty('filter',value,'important');
    const written = video.style.getPropertyValue('filter');
    filtered = video; filter = css;
    releaseFilter = () => {
      // A newer owner wins: never erase another extension's subsequent edit.
      if (video.style.getPropertyValue('filter') !== written || video.style.getPropertyPriority('filter') !== 'important') return;
      if (previous) video.style.setProperty('filter',previous,priority);
      else video.style.removeProperty('filter');
    };
  }
  function removeBackdrop() { backdrop?.remove(); backdrop = null; }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function draw() {
    frame = 0;
    if (!cinema || !player?.isConnected || document.fullscreenElement || player.classList.contains('ytp-fullscreen')) { removeBackdrop(); return; }
    const rect = player.getBoundingClientRect(), w = innerWidth, h = innerHeight;
    const left = Math.max(0,Math.min(w,rect.left)), right = Math.max(0,Math.min(w,rect.right));
    const top = Math.max(0,Math.min(h,rect.top)), bottom = Math.max(0,Math.min(h,rect.bottom));
    if (right <= left || bottom <= top) { removeBackdrop(); return; }
    if (!backdrop) {
      backdrop = document.createElement('div'); backdrop.id = 'smarttube-cinema-backdrop';
      backdrop.setAttribute('aria-hidden','true');
      Object.assign(backdrop.style,{position:'fixed',inset:'0',zIndex:'2147483000',pointerEvents:'none'});
      for (let i=0;i<4;i++) {
        const panel = document.createElement('div'); panel.dataset.cinemaPanel = String(i);
        Object.assign(panel.style,{position:'absolute',background:'rgba(0,0,0,.82)',pointerEvents:'auto'});
        panel.addEventListener('click',onExitCinema); backdrop.append(panel);
      }
      document.documentElement.append(backdrop);
    }
    // Four rectangles leave the real player and all its controls uncovered,
    // even when YouTube creates ancestor stacking contexts or clipping layers.
    const regions = [[0,0,w,top],[0,bottom,w,h-bottom],[0,top,left,bottom-top],[right,top,w-right,bottom-top]];
    [...backdrop.children].forEach((panel,index) => {
      const [x,y,width,height] = regions[index];
      Object.assign(panel.style,{left:`${x}px`,top:`${y}px`,width:`${width}px`,height:`${height}px`});
    });
  }
  addEventListener('resize',schedule);
  document.addEventListener('scroll',schedule,{capture:true,passive:true});
  document.addEventListener('fullscreenchange',schedule);
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && backdrop) { onExitCinema(); event.preventDefault(); }
  },true);
  return {
    update({video,settings,cinemaEnabled}) {
      const css = settings.enabled ? Object.entries(HIDDEN).filter(([key])=>settings[key]).map(([,selector])=>`${selector}{display:none!important}`).join('\n') : '';
      if (style.textContent !== css) style.textContent = css;
      applyFilter(settings.enabled ? video : null,settings.enabled && video ? videoFilterCss(settings) : '');
      const nextPlayer = video?.closest('#movie_player,#shorts-player,.html5-video-player') || null;
      if (nextPlayer !== player) { observer.disconnect(); player = nextPlayer; if (player) observer.observe(player); }
      cinema = settings.enabled && Boolean(cinemaEnabled);
      schedule();
    }
  };
}
