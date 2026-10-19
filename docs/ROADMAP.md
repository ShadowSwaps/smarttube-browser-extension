# Release checkpoint — 19 October 2026

Keyboard/compact-layout local scope passed coordinator non-author acceptance (one pass, no repairs). The next assigned gate is [0.4.8 release and update verification](RELEASE_0.4.8.md): exact source/package review and coordinator gate before publication, then actual public downloaded installation verification. No new feature or personal-profile work is commissioned. Published 0.4.7 remains available; historical checkpoints below retain their original status.

# Project roadmap

The user selected an open-source, zero-additional-spending project, Brave as the primary browser, an extension first, and a Windows app later. The public source repository is `ShadowSwaps/smarttube-browser-extension`.

Accepted local candidate, 19 October 2026: 0.4.8 improves keyboard reach/focus and compact-player tools, with focused fixtures and exact-package signed-out Brave acceptance. Coordinator non-author review passed (one pass, no repairs); release review and publication gates remain pending. This bounded UI item adds no native transport controls, backend or permissions. See [UI behavior](PLAYER_UI.md) and [validation](VALIDATION.md); published 0.4.7 remains unchanged.

Current status, 19 October 2026: the 0.4.7 preview was published and its release/downloaded-distribution gates passed on 18 October. The [SponsorBlock live-service audit](SPONSORBLOCK_ACCEPTANCE.md) now has bounded actual-service author verification and passed coordinator non-author pass 1 (one pass, no repairs); final coordinator acceptance is recorded on 19 October. The dated release-preparation checkpoints below remain historical.

## First extension version

Implemented: Manifest V3 source, pure JavaScript feature core, isolated player adapter, toolbar, popup, settings, speed, local queue, optional queue continuation, opt-in sponsor categories, undo, bounded read-only SponsorBlock lookup, persistence, and privacy/third-party notices.

JavaScript ES modules with JSDoc-friendly contracts replace the earlier proposed TypeScript build for this first version, keeping source immediately installable with no compiler or npm dependency. Platform-independent rules remain separated for later desktop reuse. This choice does not prevent introducing type checking later with existing free tooling.

## Enhancer replacement goal

SmartTube is intended to provide the useful Enhancer features within one free, open-source extension, together with YouTube's native controls. Users should ultimately need only SmartTube. Long-term coexistence with Enhancer is not the product goal; existing two-extension checks remain historical or optional transition evidence, not proof that SmartTube can replace it.

Use the [Enhancer feature map](ENHANCER_FEATURES.md) to prioritize independently implemented features. Track which relied-on workflows SmartTube already covers, which are served adequately by native YouTube controls, and which important gaps remain. Do not require indiscriminate feature-for-feature parity or duplicate native playback controls.

At future feature acceptance/review checkpoints, assess replacement readiness and tell the human when removing Enhancer is justified:

- The human's relied-on feature workflows are identified; each essential workflow has an accepted SmartTube/native equivalent or an explicitly accepted omission.
- Those workflows work with SmartTube alone, including relevant saved preferences, playback/navigation, keyboard/wheel behavior, appearance and queue use. Evidence with Enhancer also installed does not establish this.
- Relevant isolated Brave checks pass without Enhancer, followed by a separately authorized normal-profile check with Enhancer disabled and a recovery path that preserves settings. No normal-profile action is authorized by this roadmap note.
- Remaining gaps, differences and unrun cases are stated clearly. Coordinator recommends removal when the selected everyday workflows are covered; do not claim readiness from feature count alone.

Current status (18 October 2026): 0.4.7 [preferred quality](PREFERRED_QUALITY.md) has passed separate non-author review and coordinator acceptance, closing the confirmed essential quality gap. Native Theater satisfies the essential larger-player requirement. The [everyday-readiness audit](ENHANCER_REPLACEMENT.md) passed coordinator non-author review (one pass, no repairs) for selected live queue continuation/restart recovery and visible comments/related hide/restore. Accepted verdict: selected isolated everyday workflows are ready, overall replacement partially verified. Personal-profile compatibility remains separately optional/deferred unverified. Any normal-profile transition or Enhancer disable/removal requires explicit human instruction; no such action is authorized here.

## Next extension work

As of 18 October 2026, uncommitted 0.4.7 is locally accepted for its human-authorized preferred-quality and isolated scope, following the accepted compact UI and restart/volume work. The product's five reviews/four repair rounds/zero remaining, queue recovery's four/three/zero and release-readiness's two/one counts remain unchanged. This supersedes the earlier 0.4.4 author-check-only status; see [compact player UI](PLAYER_UI.md), [startup volume](STARTUP_VOLUME.md) and the exact candidate/evidence boundaries in the [replacement audit](ENHANCER_REPLACEMENT.md). Runtime, accepted ZIP and public harness semantics remain frozen for the release preparation. Personal-profile coverage is optional/unverified, the stopped normal-browser UI route stays stopped, and [GitHub preview preparation](RELEASE_0.4.7.md) awaits separate release/source/package review, the coordinator gate and distribution verification.

1. 0.3.0 normal-profile milestone: the user reported all five checklist steps passed on 17 October 2026, including retained 1.5× after reload/navigation, playback/persistence, cinema/fullscreen/scroll and picture/distraction controls. See [current acceptance and unrun limits](VALIDATION.md#user-reported-normal-profile-acceptance). Isolated live two-extension checks also pass; historical [0.1.0 normal-profile evidence](validation/normal-brave-2026-10-17.md) remains preserved. Non-author review and closure follow the existing workflow separately. See the [appearance increment](APPEARANCE_FEATURES.md) and [broader Enhancer backlog](ENHANCER_FEATURES.md); further work still requires scope authorization.
2. Selected ordinary-watch queue continuation/recovery and visible comments/related coverage have standalone live evidence. The [19 October SponsorBlock audit](SPONSORBLOCK_ACCEPTANCE.md) adds actual selected sponsor skip/Undo and category/off author checks on published 0.4.7; coordinator non-author pass 1 passed (one pass, no repairs), with final coordinator acceptance recorded on 19 October. Broader transitions, additional segments/categories, Shorts, accessibility and alternate layouts remain possible future coverage. Scope any observed failure under inherited repair/review limits.
3. Validate Chrome and Edge separately before claiming equivalent browser coverage.
4. Improve optional timeline markers, channel exclusions, and queue management based on selected priorities.

## Windows afterward

Prove embedded playback and authentication in a separate Windows project before building out its interface. Reuse the core rules and contracts. Independent extraction/SABR playback remains a separate scope decision.

## Permanent cost constraints

Free use, open-source code, existing local development resources, no required Premium subscriptions, no metered API/hosting dependency, no paid build pipeline, no paid signing or publication requirement, and no paid AI overage. Distribute an unpacked extension first. No GitHub Actions workflow or cloud deployment is enabled by this project.
