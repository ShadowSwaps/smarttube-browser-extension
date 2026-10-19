# Changelog

## 0.4.8 preview — prepared 19 October 2026; release review pending

- Keep one keyboard-reachable ST fallback when native chrome auto-hides, with Enter/Space, visible focus and natural Tab navigation.
- Preserve focused tools while the entry moves; return keyboard Undo focus to Close when Undo disappears.
- Reserve space beside the scrolling panel so the fallback cannot cover expanded controls in compact players.
- Add keyboard/native-fullscreen fixture checks and exact-package signed-out Brave acceptance. Keyboard/layout coordinator non-author acceptance passed (one pass, no repairs). Release/source/package review and publication verification remain pending. Published 0.4.7 is unchanged; [coverage and limits](docs/VALIDATION.md) remain separate from review acceptance.

## 0.4.7 preview — published and accepted 18 October 2026

- Add local preferred quality: Auto by default, Highest available, or a fixed resolution falling back to the highest offered at or below the target.
- Confirm native reported quality and decoded height; bound selection to eight seconds/four calls and yield to current-video native Settings interactions. No new permissions, service or media reload forcing.
- See [behavior and verification limits](docs/PREFERRED_QUALITY.md). Preferred-quality separate review and coordinator acceptance passed (two passes, one repair round); everyday-readiness coordinator review passed (one pass, no repairs). Public release/source/package review and actual downloaded-distribution verification passed on 18 October 2026.

- Includes the accepted native Normal 1× startup, verified starting volume (default 5%), native wheel feedback and compact tools described below. See [0.4.7 distribution instructions and coverage](docs/RELEASE_0.4.7.md).

## Historical local preview checkpoints

The entries below retain their original pending statements. The native startup/UI/quality work and selected isolated everyday workflows were subsequently accepted on 18 October 2026; personal-profile acceptance remains unverified for 0.4.7.

### 0.4.6 local preview — historical review submission

- Start each new/reloaded video at native 1×, leaving later manual speed choices in control. Retire editable saved startup speed controls without deleting legacy stored values.
- Synchronize SmartTube speed changes with native player state/menu and show the achieved speed in the readable transient player notice. Respect native supported limits; retain0.05× steps within them.
- Apply starting volume(default5%) then deliberately unmute the YouTube player only after verified volume integration; failure attempts remain bounded, and browser/system mute is untouched.
- Separate native-integration review and coordinator verification remain required. New-candidate normal-profile acceptance and publication are pending.

### 0.4.5 local preview — reviewed locally; subsequent behavior changes pending

- Added enabled-by-default 5% starting volume, a saved percentage and an ownership opt-out. Startup correction is bounded and yields to deliberate native volume/mute gestures without unmuting.
- Enabled wheel actions by default, changed Alt-wheel to volume and Alt-Shift-wheel to speed as selected by the human, and added a brief volume percentage indicator. Explicit saved opt-outs remain respected.
- Repaired reviewed native-state mismatch through a narrow local MAIN-world volume adapter, preserving mute and using no new permission. Failed API attempts count toward the bounded startup budget; a separate non-author review remains required.
- Added focused native-media startup/restart and real wheel-input checks. See [behavior and limits](docs/STARTUP_VOLUME.md). Required non-author review and normal-profile installation remain pending; no publication.

### 0.4.4 local preview — review pending

- Integrated one SmartTube entry into native player chrome, with one accessible fallback and a compact independent popover. Added grouped Loop/Picture tools, Queue/Cinema quick actions and contextual Undo.
- Removed duplicate ordinary playback buttons from player tools and popup; retained saved-speed/wheel behavior and extension functions. Popup now prioritizes the queue and Settings.
- Kept saved preferences in extension pages; player picture controls are explicitly tab-only. No queue/background/storage/permission changes. Existing 0.4.3 package preserved; publication and normal-profile installation deferred.
- See [behavior, validation route and limits](docs/PLAYER_UI.md). Author checks do not establish non-author acceptance.

### 0.4.3 prepared release notes

- Accepted the bounded runtime/package locally on 17 October 2026 after separate non-author pass 4 and coordinator verification. Selected normal-Brave checks now have human-reported and explicitly delegated UI evidence; failed-navigation and old-queue retention remain unrun in that profile. Readiness-documentation review remains pending; no release is published by this preparation.
- Retained queue entries until the intended destination starts loaded, unpaused non-ad playback; failed navigation remains available for retry. Preserved origin membership, tab binding and one automatic attempt per ended playback.
- Excluded recognized ad media after marker clearing, reloads and node replacement, including automatic queue continuation. Actual public-ad marker-clear behavior remains unrun; deterministic native-media fixtures and actual-code diagnostics cover the correction.
- Replaced persistent player tools with a small ST entry and an on-demand keyboard-accessible panel; fixed popup lifetime and narrow-height overlap during the scoped review history.
- Verified 20 units, 43 fixture outcomes and 15 fresh live Brave checks; retained 14 earlier live layout checks solely for unchanged dependencies. No new permissions, saved-queue schema, runtime dependencies or paid services.
- Added [pinned install/update, SHA-256, human checklist, limits and rollback material](docs/RELEASE_0.4.3.md). Earlier failures/checkpoints remain historical; queue review ended at four passes/three repair rounds with no remaining allowance.
- Recorded native fullscreen Escape precedence: first exits fullscreen, next closes ST and returns focus. Outside fullscreen, focused-panel close precedes cinema exit; Tab can leave the panel. The delegated UI route stopped on browser URL verification and remains stopped, with metadata-tab restoration unverified.

### Dated clarification of historical entries

On 17 October 2026, the human subsequently passed the five selected 0.3.0 normal-profile steps, including actual 1.5× after reload and link navigation. Earlier pending statements below describe their original checkpoints. They do not establish 0.4.3 normal-profile acceptance.

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
