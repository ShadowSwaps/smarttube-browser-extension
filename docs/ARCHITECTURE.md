# Extension architecture

Manifest V3 targets Brave first, with Chromium-compatible APIs for Chrome and Edge. Installable source is in `extension`; the local build simply copies these files. There is no compilation service, dependency download, or runtime remote-code loading.

| Component | Responsibility |
| --- | --- |
| `core.js` | Validate video IDs/settings/queue and normalize/merge sponsor intervals; no browser API dependencies |
| `content.js` | Connect to the native media element, render a shadow-root toolbar, handle navigation, seek, undo, and queue continuation |
| `background.js` | Serialize storage writes; validate message sender and video identity; perform bounded hash-prefix SponsorBlock lookups and cache results |
| `ui.js` | Popup/options behavior, local settings, active-tab controls, queue rendering using plain text |

The content script uses an isolated world and shared DOM/media APIs. Play/pause delegates to YouTube's native button when available to keep site player state consistent, with an HTML media fallback. Toolbar pointer events are isolated from the parent player. A generation counter drops stale segment responses after navigation or settings changes. Only one media element is observed per tab; listeners are detached when it changes. Playback monitoring stays in the content script and does not depend on keeping the worker alive.

Sponsor skipping ignores paused/seeking media, recognized YouTube ad states, non-finite/live duration, and out-of-duration intervals. Overlapping or adjacent enabled segments are merged for one seek. Undo restores the prior position with temporary protection against immediate re-skipping. SponsorBlock is optional, read-only, rate-limited by bounded caches, and has no paid fallback. It is separate from YouTube advertising behavior.

The worker accepts settings changes only from this extension's pages. Segment requests must match the sender frame's current video identity. It constructs a fixed-origin URL and never accepts an arbitrary fetch URL. Queue writes are serialized to avoid lost updates. Network responses are bounded to one MiB, a timeout, and 1,000 segment records. UI titles use `textContent` to avoid rendering supplied HTML.

Settings and queue are versioned under local storage schema 1. Expiring media URLs, account credentials, and cookies are not persisted by the extension. Existing YouTube sign-in and account features remain within YouTube.

The first Windows milestone will reuse the pure core after extension behavior is established. Desktop playback, login, and independent streaming remain separate unimplemented work. No background worker, cloud deployment, scheduler, or paid API is needed by this architecture.
