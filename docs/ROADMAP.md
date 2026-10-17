# Project roadmap

The user selected an open-source, zero-additional-spending project, Brave as the primary browser, an extension first, and a Windows app later. The public source repository is `ShadowSwaps/smarttube-browser-extension`.

## First extension version

Implemented: Manifest V3 source, pure JavaScript feature core, isolated player adapter, toolbar, popup, settings, speed, local queue, optional queue continuation, opt-in sponsor categories, undo, bounded read-only SponsorBlock lookup, persistence, and privacy/third-party notices.

JavaScript ES modules with JSDoc-friendly contracts replace the earlier proposed TypeScript build for this first version, keeping source immediately installable with no compiler or npm dependency. Platform-independent rules remain separated for later desktop reuse. This choice does not prevent introducing type checking later with existing free tooling.

## Next extension work

As of 17 October 2026, the authorized queue recovery and compact-controls runtime/package 0.4.3 is locally accepted after separate non-author pass 4 and coordinator verification. See [accepted scope and preserved history](QUEUE_CONTROLS.md). Its cumulative budget ended at four reviews/three repair rounds/zero remaining. Current work is [release-readiness documentation](RELEASE_0.4.3.md), incorporating partial human/delegated normal-Brave evidence and explicit unrun cases. Non-author readiness acceptance remains pending; the browser UI route remains stopped on URL verification. No repeated manual checks, publication or next feature is authorized by this documentation repair.

1. 0.3.0 normal-profile milestone: the user reported all five checklist steps passed on 17 October 2026, including retained 1.5× after reload/navigation, playback/persistence, cinema/fullscreen/scroll and picture/distraction controls. See [current acceptance and unrun limits](VALIDATION.md#user-reported-normal-profile-acceptance). Isolated live two-extension checks also pass; historical [0.1.0 normal-profile evidence](validation/normal-brave-2026-10-17.md) remains preserved. Non-author review and closure follow the existing workflow separately. See the [appearance increment](APPEARANCE_FEATURES.md) and [broader Enhancer backlog](ENHANCER_FEATURES.md); further work still requires scope authorization.
2. Extend coverage of queue transitions, videos with actual sponsor segments, Shorts, accessibility, and alternate YouTube layouts. Add regressions for observed failures.
3. Validate Chrome and Edge separately before claiming equivalent browser coverage.
4. Improve optional timeline markers, channel exclusions, and queue management based on selected priorities.

## Windows afterward

Prove embedded playback and authentication in a separate Windows project before building out its interface. Reuse the core rules and contracts. Independent extraction/SABR playback remains a separate scope decision.

## Permanent cost constraints

Free use, open-source code, existing local development resources, no required Premium subscriptions, no metered API/hosting dependency, no paid build pipeline, no paid signing or publication requirement, and no paid AI overage. Distribute an unpacked extension first. No GitHub Actions workflow or cloud deployment is enabled by this project.
