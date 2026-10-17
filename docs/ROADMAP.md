# Project roadmap

The user selected an open-source, zero-additional-spending project, Brave as the primary browser, an extension first, and a Windows app later. The public source repository is `ShadowSwaps/smarttube-browser-extension`.

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

Current status: replacement readiness has not yet been established. Notify the human at a justified milestone; do not remove or disable their installed Enhancer without their explicit instruction. No scheduler or background monitor is created.

## Next extension work

As of 17 October 2026, the queue recovery runtime/package 0.4.3 remains locally accepted with its four reviews/three repair rounds/zero remaining unchanged. Its bounded [release-readiness work](RELEASE_0.4.3.md) was subsequently accepted by coordinator non-author pass 2 (one repair round); the stopped normal-browser UI route remains stopped. The separately authorized [0.4.4 compact player UI preview](PLAYER_UI.md) is now author-checked and awaits its own coordinator non-author review (zero reviews/repair rounds used). It changes presentation only; queue tracker/background/storage semantics are frozen. Publication and normal-profile installation remain deferred.

1. 0.3.0 normal-profile milestone: the user reported all five checklist steps passed on 17 October 2026, including retained 1.5× after reload/navigation, playback/persistence, cinema/fullscreen/scroll and picture/distraction controls. See [current acceptance and unrun limits](VALIDATION.md#user-reported-normal-profile-acceptance). Isolated live two-extension checks also pass; historical [0.1.0 normal-profile evidence](validation/normal-brave-2026-10-17.md) remains preserved. Non-author review and closure follow the existing workflow separately. See the [appearance increment](APPEARANCE_FEATURES.md) and [broader Enhancer backlog](ENHANCER_FEATURES.md); further work still requires scope authorization.
2. Extend coverage of queue transitions, videos with actual sponsor segments, Shorts, accessibility, and alternate YouTube layouts. Add regressions for observed failures.
3. Validate Chrome and Edge separately before claiming equivalent browser coverage.
4. Improve optional timeline markers, channel exclusions, and queue management based on selected priorities.

## Windows afterward

Prove embedded playback and authentication in a separate Windows project before building out its interface. Reuse the core rules and contracts. Independent extraction/SABR playback remains a separate scope decision.

## Permanent cost constraints

Free use, open-source code, existing local development resources, no required Premium subscriptions, no metered API/hosting dependency, no paid build pipeline, no paid signing or publication requirement, and no paid AI overage. Distribute an unpacked extension first. No GitHub Actions workflow or cloud deployment is enabled by this project.
