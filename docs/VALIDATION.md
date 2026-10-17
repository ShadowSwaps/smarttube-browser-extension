# Validation status

Version 0.1.0 is an initial unpacked extension. Initial validation on 17 October 2026 used installed Brave (Chromium engine 155.0.8059.85) with disposable profiles and signed-out YouTube. A subsequent user-authorized normal-profile check is documented separately below. Chrome and Edge are implementation targets using the same Manifest V3 APIs; they have not been separately exercised here.

## Local checks

- `npm test`: nine tests passed. Cases include interval boundaries and overlaps, category filtering, malformed storage, bounded queues, serialized concurrent mutations, message sender validation, stale document URLs after SPA navigation, hash-prefix requests, deduplication, and network failure.
- `npm run check`: manifest permission allowlist, JavaScript syntax, and packaged-script checks passed.
- `npm run build`: installable output produced without npm dependencies or external build services.

## Brave integration

`npm run test:browser` loads the real extension in a disposable Brave profile. The YouTube document and SponsorBlock responses are fixtures; media is a generated WAV played by a real HTML media element with HTTP range support. Network fixture injection is confined to the test service worker and is never shipped in extension code.

The tested behaviors are content-script attachment, no default SponsorBlock requests, native play-control delegation and pointer isolation, sponsor seeking and undo, persisted queue, options-to-player updates, options reload persistence, recognized advertising/live-state protection, SPA navigation invalidation, network-failure fallback, hash-prefix requests with omitted credentials, popup control routing, UI rendering, and settings/queue persistence across a full browser restart.

Screenshots and a machine-readable result are generated locally under `test-results` and excluded from Git. A real-browser fixture test establishes the tested integration, not service-wide YouTube compatibility.

## Public service checks

A signed-out live Brave smoke check opened the public Big Buck Bunny video `aqz-KE-bpKQ`, rejected optional cookies when prompted, and verified toolbar seeking by at least nine seconds, a playback rate change to 1.25×, and a native play/pause state change. The native media element reported ready state 4 and duration 634.601 seconds, with no media error, page errors, or control errors in the final check. Earlier attempts exposed consent timing and native-control integration issues; the final adapter and harness were corrected before this result. The optional `scripts/live-smoke.mjs` script records current results rather than assuming historical results still apply.

One read-only public SponsorBlock hash-prefix request returned HTTP 200 with an array response. It contained no matching segment record for the selected video; that is not an observed live sponsor skip. Sponsor seek correctness is covered by the controlled Brave integration fixture. No submission, vote, account login, or billing operation was performed.

## Normal Brave profile: partially verified

On 17 October 2026, native UI checks verified the unpacked 0.1.0 extension in the user's existing Windows Brave profile, with Enhancer for YouTube 3.0.19 enabled and existing protections preserved. Installation, toolbar/popup connection, pause/resume, exact ten-second forward/rewind, manual speed changes, saved settings/queue across page reloads, internal YouTube navigation, and one manual queued transition passed.

**Open failure:** a saved 1.5× default remained in storage but actual playback returned to 1× after reloading the video. This is a demonstrated normal-profile failure; competition with another speed controller is an inference, not an isolated cause. Original 1× settings were restored. See the [scenario evidence and reproduction](validation/normal-brave-2026-10-17.md).

This was author-performed UI verification and self-review, not independent review. Personal screenshots, account information and browsing history are excluded from the repository. No runtime code or release artifact changed during this check.

## Remaining coverage

Normal-profile acceptance remains partial because the saved-speed failure is open. Normal-profile sponsor skipping and full browser-process restart persistence were not exercised. Full YouTube account workflows, every layout/locale, real sponsor-bearing content, live streams, Shorts variations, every keyboard/accessibility combination, multiple queued autoplay transitions, Chrome, Edge, and other operating systems are not comprehensively validated. The extension uses the existing YouTube player and does not claim independent playback or guaranteed ad removal. The Windows app has not been started.
