// Platform-independent logic. No browser APIs, network or DOM access.
export const CATEGORIES = Object.freeze({
  sponsor: 'Sponsors', selfpromo: 'Self promotion', interaction: 'Subscribe reminders',
  intro: 'Introductions', outro: 'End cards', music_offtopic: 'Non-music sections'
});
export const APPEARANCE_BOOLEANS = Object.freeze(['cinema','filtersEnabled','hideComments','hideRelated','hideChat','hideShorts','hideEndCards','hideInfoCards']);
export const FILTER_LIMITS = Object.freeze({filterBrightness:[50,150,100],filterContrast:[50,150,100],filterSaturation:[0,200,100],filterGrayscale:[0,100,0]});
export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true, sponsorEnabled: false, categories: ['sponsor'],
  speed: 1, applySpeed: true, wheelControls: true, toolbar: true, autoQueue: false,
  applyVolume: true, startupVolume: 5, preferredQuality: 'auto',
  cinema:false, filtersEnabled:false, hideComments:false, hideRelated:false,
  hideChat:false, hideShorts:false, hideEndCards:false, hideInfoCards:false,
  filterBrightness:100, filterContrast:100, filterSaturation:100, filterGrayscale:0
});
export const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
export function videoIdFromUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'www.youtube.com') return null;
    const candidate = url.pathname === '/watch' ? url.searchParams.get('v')
      : /^\/shorts\/([^/]+)\/?$/.exec(url.pathname)?.[1];
    return VIDEO_ID.test(candidate || '') ? candidate : null;
  } catch { return null; }
}
export function sanitizeSettings(raw = {}) {
  const value = { ...DEFAULT_SETTINGS };
  for (const key of ['enabled', 'sponsorEnabled', 'toolbar', 'autoQueue', 'applySpeed', 'applyVolume', 'wheelControls', ...APPEARANCE_BOOLEANS]) {
    if (typeof raw?.[key] === 'boolean') value[key] = raw[key];
  }
  for (const [key,[min,max]] of Object.entries(FILTER_LIMITS)) {
    if (typeof raw?.[key] === 'number' && Number.isFinite(raw[key])) value[key] = Math.round(Math.max(min,Math.min(max,raw[key])));
  }
  if (typeof raw?.speed === 'number' && Number.isFinite(raw.speed)) {
    value.speed = Math.round(Math.min(3, Math.max(0.25, raw.speed)) * 100) / 100;
  }
  if (typeof raw?.startupVolume === 'number' && Number.isFinite(raw.startupVolume)) {
    value.startupVolume = Math.round(Math.min(100, Math.max(0, raw.startupVolume)));
  }
  value.categories = Array.isArray(raw?.categories)
    ? [...new Set(raw.categories.filter(item => Object.hasOwn(CATEGORIES, item)))]
    : [...DEFAULT_SETTINGS.categories];
  if (['auto','highest','144','240','360','480','720','1080','1440','2160','2880','4320'].includes(raw?.preferredQuality)) value.preferredQuality = raw.preferredQuality;
  return value;
}
export function videoFilterCss(settings) {
  const clean = sanitizeSettings(settings);
  return clean.filtersEnabled ? `brightness(${clean.filterBrightness}%) contrast(${clean.filterContrast}%) saturate(${clean.filterSaturation}%) grayscale(${clean.filterGrayscale}%)` : '';
}
export function sanitizeQueue(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw.filter(item => item && VIDEO_ID.test(item.videoId) && !seen.has(item.videoId) && seen.add(item.videoId))
    .slice(0, 100).map(item => ({videoId: item.videoId,
      title: typeof item.title === 'string' ? item.title.slice(0, 200) : item.videoId}));
}
export function normalizeSegments(raw, categories, duration = Infinity) {
  if (!Array.isArray(raw) || !Array.isArray(categories)) return [];
  return raw.slice(0, 1000).flatMap(item => {
    if (!item || item.actionType !== 'skip' || !categories.includes(item.category) || !Array.isArray(item.segment)) return [];
    const [start, end] = item.segment;
    if (typeof start !== 'number' || typeof end !== 'number' || !Number.isFinite(start) || !Number.isFinite(end)
      || start < 0 || end <= start || end > duration + 1) return [];
    return [{start, end, category: item.category}];
  }).sort((a,b) => a.start - b.start || a.end - b.end);
}
export function segmentAt(segments, position) {
  if (!Number.isFinite(position)) return null;
  let matched = null;
  for (const segment of segments) {
    if (segment.start > (matched?.end ?? position)) break;
    if (!matched && position >= segment.start && position < segment.end) matched = {...segment};
    else if (matched && segment.start <= matched.end) matched.end = Math.max(matched.end, segment.end);
  }
  return matched;
}
export function formatTime(seconds) {
  const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

// Associate playback with a URL only after a media/document transition. SPA
// navigation can update the URL while the previous video's media keeps playing.
export function createQueueMediaTracker(initialId) {
  let id = initialId, media = null, source = '', excludedSource = null, navigated = false, associated = null;
  const untrustedSources = new Set();
  return {
    observe(nextId, nextMedia) {
      const nextSource = nextMedia?.currentSrc || '';
      media = nextMedia;
      associated = null;
      // Remember every recognized ad/unidentified source for this document.
      // Losing its marker, loading it again or replacing its node cannot turn
      // it into content. Keep the prior content boundary independently.
      if (!nextId) {
        if (nextSource) untrustedSources.add(nextSource);
        return;
      }
      if (nextId !== id) { excludedSource = source || excludedSource; navigated = true; }
      id = nextId;
      if (!nextSource || untrustedSources.has(nextSource)) return;
      if (navigated && !excludedSource) excludedSource = nextSource;
      if ((!navigated && nextId === initialId) || (excludedSource && nextSource !== excludedSource)) associated = id;
      source = nextSource;
    },
    loading(nextId, nextMedia) {
      this.observe(nextId,nextMedia);
      associated = null;
    },
    metadata(nextId, nextMedia) {
      this.observe(nextId,nextMedia);
    },
    matches(nextId, nextMedia) { return associated === nextId && media === nextMedia; }
  };
}
