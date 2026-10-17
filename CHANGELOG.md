# Changelog

## Unreleased

## 0.3.0

- Added opt-in cinema dimming with Escape/outside-click exit, fullscreen suspension and a saved startup preference.
- Added brightness, contrast, saturation and grayscale controls, a reset button, and restoration of previous video filters without overwriting a newer external edit.
- Added reversible switches for comments, related videos, live chat, Shorts shelves, end screens and info cards; new matching content is hidden automatically.
- Kept unfinished popup filter adjustments stable during player-status refreshes, and avoided sponsor lookups on appearance-only saves.
- Extended silent isolated Brave fixture and live Enhancer compatibility checks. No added permissions, runtime dependencies, paid services or proprietary assets; normal-profile acceptance remains pending.

## 0.2.0

- Fixed late startup speed resets with bounded reconciliation, explicit manual override handling, feedback for competing controllers, and an ownership opt-out.
- Added whole-video and A–B looping, native volume/mute, a popup volume slider, and opt-in Alt-wheel playback controls.
- Verified the selected playback workflows with actual Enhancer 3.0.19 in a silent isolated live Brave profile, plus 21 fixture outcomes. Normal-profile acceptance of the update remains pending.
- Added feature provenance, a broader Enhancer backlog and a reproducible optional compatibility harness; no proprietary code is included.

- Muted test-owned Brave output explicitly with `--mute-audio` in both fixture and live-site launchers; required silent ad hoc reviews and restarts in project guidance.
- Established isolated headless Brave as the default review route so routine tests do not use the human's desktop input; reverified all 15 fixture checks on that route.
- Recorded normal-profile Brave UI checks for controls, persistence and navigation; retained an unresolved default-speed failure after video reload.
- Added project guidance for bounded work, one checkout owner, usage-aware checkpoints, evidence-based validation reuse and explicit review methods.
- Distinguished disposable browser tests, live-site checks and the requested normal-profile installation acceptance.
- Preserved the project's free/open-source constraints without importing other projects' release approvals or automations.

## 0.1.0

- Released the initial Brave developer preview with playback controls, speed settings, local queue, opt-in SponsorBlock categories and undo.
- Added local tests, Brave fixture integration, signed-out live YouTube control checks, privacy documentation and third-party notices.
- Published source and an installable ZIP under the original-code MIT license. Chrome and Edge remain compatibility targets without separate browser acceptance.
