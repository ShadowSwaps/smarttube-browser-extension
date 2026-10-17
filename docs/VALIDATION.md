# Validation status

Version 0.1.0 is an initial unpacked extension, validated on 17 October 2026 with installed Brave (Chromium engine 155.0.8059.85), using disposable test profiles. No personal browser profile or signed-in YouTube account was used. Chrome and Edge are implementation targets using the same Manifest V3 APIs; they have not been separately exercised here.

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

## Remaining coverage

Manual testing is still useful on the user's normal Brave setup, including Shields and any other player extensions. Full YouTube account workflows, every layout/locale, real sponsor-bearing content, live streams, Shorts variations, every keyboard/accessibility combination, multiple queued autoplay transitions, Chrome, Edge, and other operating systems are not comprehensively validated. The extension uses the existing YouTube player and does not claim independent playback or guaranteed ad removal. The Windows app has not been started.
