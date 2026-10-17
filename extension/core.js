// Platform-independent logic. No browser APIs, network or DOM access.
export const CATEGORIES = Object.freeze({
  sponsor: 'Sponsors', selfpromo: 'Self promotion', interaction: 'Subscribe reminders',
  intro: 'Introductions', outro: 'End cards', music_offtopic: 'Non-music sections'
});
export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true, sponsorEnabled: false, categories: ['sponsor'],
  speed: 1, toolbar: true, autoQueue: false
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
  for (const key of ['enabled', 'sponsorEnabled', 'toolbar', 'autoQueue']) {
    if (typeof raw?.[key] === 'boolean') value[key] = raw[key];
  }
  if (typeof raw?.speed === 'number' && Number.isFinite(raw.speed)) {
    value.speed = Math.round(Math.min(3, Math.max(0.25, raw.speed)) * 100) / 100;
  }
  value.categories = Array.isArray(raw?.categories)
    ? [...new Set(raw.categories.filter(item => Object.hasOwn(CATEGORIES, item)))]
    : [...DEFAULT_SETTINGS.categories];
  return value;
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
