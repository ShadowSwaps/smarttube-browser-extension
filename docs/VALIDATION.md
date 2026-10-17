# Validation status

## 0.4.2 final scoped repair candidate

The two remaining pass-2 blockers have author-verified corrections submitted together for the final permitted pass-3 verification. Final-source checks passed: 18 unit tests, 28 broad and 14 queue/control fixture outcomes, 10 live compatibility, 14 live layout and 5 live queue/control checks. Natural-end queue continuation was revalidated on the changed runtime. Exact source/package evidence, retained preliminary failure and limits are in [the queue/control record](QUEUE_CONTROLS.md). No acceptance is claimed; an unresolved blocker after this final round requires a human checkpoint. Earlier candidate records below remain historical.

## 0.4.1 scoped repair candidate

All three pass-1 blockers have author-verified repairs submitted together for non-author verification. Final-source checks passed: 17 unit tests, 28 broad and 13 queue/control fixture outcomes, 10 live compatibility, 14 live layout and 5 live queue/control checks. The new live attempt played a demonstrably short public source naturally through a trusted native end, selected one queued destination, verified its actual non-ad playback and queue consumption. This supplies live evidence for review; it is not author acceptance. See [exact reports, package and retained limits](QUEUE_CONTROLS.md). Normal-profile installation remains unrequested/unrun; the earlier 0.4.0 checkpoint below is historical.

## 0.4.0 queue and compact-controls candidate

Local implementation and author checks are recorded in [Queue recovery and discreet controls](QUEUE_CONTROLS.md). Required separate non-author review and real live end-to-end queue completion remain pending. Public media reset or showed a YouTube playback error when seeking near the end; fixture completion is recorded separately. Earlier normal-profile acceptance below applies to 0.3.0.

## 0.3.0 appearance update

Ten local tests, permission/syntax checks, build, 28 Brave fixture outcomes and ten live public-video checks passed on 17 October 2026. The live checks used actual Enhancer 3.0.19 with fresh settings; every test browser was headless and muted. Cinema, four filters and six distraction switches have bounded evidence in [the appearance requirements and validation record](APPEARANCE_FEATURES.md), including exact source/package identities, preserved harness failure, self-review and remaining coverage. Playback regressions and a full fixture browser-process restart passed. All 17 ZIP file entries match the build.

Additional isolated Brave testing on the unchanged v0.3.0 package passed 14 live gap checks: actual native fullscreen entry/exit and toolbar seeking, three viewport sizes, partial/deep scrolling with Enhancer's floating player, real same-document video navigation, appearance cleanup/return, and comments/related restoration. The incoming content was confirmed ready and outside advertising state before asserting saved speed. See [the additional evidence, preserved harness failures and exact identities](APPEARANCE_FEATURES.md#additional-isolated-brave-gap-checks). Extension code and package are unchanged; relevant earlier results are retained rather than unnecessarily rerun.

The five-step 0.3.0 normal-profile checklist is now user-reported passed, as recorded below. Non-author coordinator pass 1 supported the bounded technical evidence and user-reported results and requested correction of stale acceptance text. Documentation acceptance follows the separate review workflow. Live comments/related containers were exercised; other hide selectors and detached-video replacement remain fixture coverage. Native fullscreen now has bounded live API evidence; exhaustive layouts and other browsers remain unverified. Historical results below retain their original scope.

### User-reported normal-profile acceptance

On 17 October 2026, the human reported all five requested checklist steps passed in their normal Brave profile: source/version/reload and toolbar/popup connection; saved default speed; playback controls, popup routing and persistence; cinema, scrolling/resizing and native fullscreen; and video filters, navigation, comments/related restoration and reset. They explicitly reported actual **1.5× retained after page reload and following a video link**. Step 1 confirmed the specified source install and version 0.3.0; the agent did not independently inspect an installed digest or automate the personal profile. The direct user reply and full checklist/results are retained in the owning task's private acceptance evidence.

This satisfies the requested five-step normal-profile gate for that configuration, with no reported conflict. It does not grant publication/archive authority or establish every interaction. Normal-profile whole-browser process-restart persistence and opt-in sponsor skipping remain unrun. Historical 0.1.0 failure evidence below is preserved; the successful current 1.5× reload/navigation report supersedes its open recheck status for those tested scenarios.

## 0.2.0 playback update

Nine local tests, manifest/syntax checks, a dependency-free build and 21 assembled Brave fixture outcomes passed on 17 October 2026. Six live public-video checks passed in an isolated headless profile with actual Enhancer 3.0.19 enabled, covering saved speed before/after reload, volume/mute, wheel controls, range loops and deliberate speed changes. All owned browser processes used `--mute-audio`. See [candidate identities, scenarios, preserved failures and scope](ENHANCER_FEATURES.md).

The speed reset is fixed for these tested conditions. At the 0.2.0 checkpoint, normal-profile acceptance was pending; the later user-reported 0.3.0 playback checks are recorded above. The historical 0.1.0 failure below is not erased. New controls use existing permissions; no Enhancer code or assets are bundled.

## Historical 0.1.0 evidence

Version 0.1.0 is an initial unpacked extension. Initial validation on 17 October 2026 used installed Brave (Chromium engine 155.0.8059.85) with disposable profiles and signed-out YouTube. A subsequent user-authorized normal-profile check is documented separately below. Chrome and Edge are implementation targets using the same Manifest V3 APIs; they have not been separately exercised here.

## Local checks

- `npm test`: nine tests passed. Cases include interval boundaries and overlaps, category filtering, malformed storage, bounded queues, serialized concurrent mutations, message sender validation, stale document URLs after SPA navigation, hash-prefix requests, deduplication, and network failure.
- `npm run check`: manifest permission allowlist, JavaScript syntax, and packaged-script checks passed.
- `npm run build`: installable output produced without npm dependencies or external build services.

## Brave integration

`npm run test:browser` loads the real extension in a disposable Brave profile. The YouTube document and SponsorBlock responses are fixtures; media is a generated WAV played by a real HTML media element with HTTP range support. Network fixture injection is confined to the test service worker and is never shipped in extension code.

The tested behaviors are content-script attachment, no default SponsorBlock requests, native play-control delegation and pointer isolation, sponsor seeking and undo, persisted queue, options-to-player updates, options reload persistence, recognized advertising/live-state protection, SPA navigation invalidation, network-failure fallback, hash-prefix requests with omitted credentials, popup control routing, UI rendering, and settings/queue persistence across a full browser restart.

Screenshots and a machine-readable result are generated locally under `test-results` and excluded from Git. A real-browser fixture test establishes the tested integration, not service-wide YouTube compatibility.

On 17 October 2026, `node scripts/browser-test.mjs` was rerun with the existing bundled Playwright runtime to verify the background review route. The installed Brave executable ran with `headless:true` in its own disposable profile; all 15 outcomes passed, including restart persistence, without native desktop input. Codex performed self-review of the generated popup and player screenshots. Earlier output files were copied to a timestamped local archive before the run. This used the unchanged extension candidate and controlled fixtures, with no other player extension installed in that test profile; it does not reproduce or resolve the normal-profile speed failure below.

## Public service checks

A signed-out live Brave smoke check opened the public Big Buck Bunny video `aqz-KE-bpKQ`, rejected optional cookies when prompted, and verified toolbar seeking by at least nine seconds, a playback rate change to 1.25×, and a native play/pause state change. The native media element reported ready state 4 and duration 634.601 seconds, with no media error, page errors, or control errors in the final check. Earlier attempts exposed consent timing and native-control integration issues; the final adapter and harness were corrected before this result. The optional `scripts/live-smoke.mjs` script records current results rather than assuming historical results still apply.

One read-only public SponsorBlock hash-prefix request returned HTTP 200 with an array response. It contained no matching segment record for the selected video; that is not an observed live sponsor skip. Sponsor seek correctness is covered by the controlled Brave integration fixture. No submission, vote, account login, or billing operation was performed.

## Historical 0.1.0 normal Brave profile: partially verified

On 17 October 2026, native UI checks verified the unpacked 0.1.0 extension in the user's existing Windows Brave profile, with Enhancer for YouTube 3.0.19 enabled and existing protections preserved. Installation, toolbar/popup connection, pause/resume, exact ten-second forward/rewind, manual speed changes, saved settings/queue across page reloads, internal YouTube navigation, and one manual queued transition passed.

**Historical 0.1.0 failure:** a saved 1.5× default remained in storage but actual playback returned to 1× after reloading the video. This was a demonstrated normal-profile failure; competition with another speed controller was an inference, not an isolated cause. Original 1× settings were restored. See the [scenario evidence and reproduction](validation/normal-brave-2026-10-17.md). The later user-reported 0.3.0 reload/navigation success is recorded above; this original failure remains part of the history.

This was author-performed UI verification and self-review, not independent review. Personal screenshots, account information and browsing history are excluded from the repository. No runtime code or release artifact changed during this check.

## Remaining coverage

The five-step 0.3.0 normal-profile checklist is user-reported passed, including the saved-speed recheck and appearance controls; broader acceptance is bounded by the specific scenarios above. Normal-profile sponsor skipping and full browser-process restart persistence were not exercised. Full YouTube account workflows, every layout/locale, real sponsor-bearing content, live streams, Shorts variations, every keyboard/accessibility combination, multiple queued autoplay transitions, Chrome, Edge, and other operating systems are not comprehensively validated. The extension uses the existing YouTube player and does not claim independent playback or guaranteed ad removal. The Windows app has not been started.
