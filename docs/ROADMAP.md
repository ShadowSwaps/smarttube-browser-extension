# Project roadmap

The user selected an open-source, zero-additional-spending project, Brave as the primary browser, an extension first, and a Windows app later. The public source repository is `ShadowSwaps/smarttube-browser-extension`.

## First extension version

Implemented: Manifest V3 source, pure JavaScript feature core, isolated player adapter, toolbar, popup, settings, speed, local queue, optional queue continuation, opt-in sponsor categories, undo, bounded read-only SponsorBlock lookup, persistence, and privacy/third-party notices.

JavaScript ES modules with JSDoc-friendly contracts replace the earlier proposed TypeScript build for this first version, keeping source immediately installable with no compiler or npm dependency. Platform-independent rules remain separated for later desktop reuse. This choice does not prevent introducing type checking later with existing free tooling.

## Next extension work

1. Accept 0.3.0 in the normal profile after manual extension/page reload: speed fix, playback controls, cinema, picture filters and distraction switches. Isolated live two-extension checks pass; historical [normal-profile evidence](validation/normal-brave-2026-10-17.md) remains preserved. See the [appearance increment](APPEARANCE_FEATURES.md) and [broader Enhancer backlog](ENHANCER_FEATURES.md). Preserve existing protections and extensions.
2. Extend coverage of queue transitions, videos with actual sponsor segments, Shorts, accessibility, and alternate YouTube layouts. Add regressions for observed failures.
3. Validate Chrome and Edge separately before claiming equivalent browser coverage.
4. Improve optional timeline markers, channel exclusions, and queue management based on selected priorities.

## Windows afterward

Prove embedded playback and authentication in a separate Windows project before building out its interface. Reuse the core rules and contracts. Independent extraction/SABR playback remains a separate scope decision.

## Permanent cost constraints

Free use, open-source code, existing local development resources, no required Premium subscriptions, no metered API/hosting dependency, no paid build pipeline, no paid signing or publication requirement, and no paid AI overage. Distribute an unpacked extension first. No GitHub Actions workflow or cloud deployment is enabled by this project.
