# Normal Brave profile check — 17 October 2026

**Result: partially verified, one open failure.** These are observed native UI scenarios, not comprehensive compatibility or an independent audit.

## Candidate and method

- Installed candidate: SmartTube Browser 0.1.0, unpacked from the repository's `extension` folder. The user completed installation; the extension card was observed enabled without an Errors button.
- Checkout: `9d370643438453d6c7b44684bd303155056cfbff`; extension runtime unchanged from initial source commit `3bdb53e36470b0570c84fb0445578ddc942e8477`. The release ZIP was not the installation input.
- Environment: existing Windows Brave profile; installed executable product version `155.1.97.59`. This file version does not establish every profile setting.
- Existing Enhancer for YouTube 3.0.19 remained enabled. Existing protection extensions, Shields settings, accounts and original tabs were preserved. No profile files or cookies were inspected.
- Tester/reviewer: Codex, implementation author. Method: native Computer Use accessibility observations and screenshots, followed by self-review of this report against those observations. No independent reviewer or normal-profile DevTools/network/console audit was performed.
- Public test videos: Big Buck Bunny `aqz-KE-bpKQ` and Sintel `eRsGyueVLvQ`. These were real public YouTube pages, not intercepted responses.
- Evidence: native UI tool observations retained in the originating task; this sanitized report records the reproducible scenarios. Personal screenshots, unrelated page text and account identifiers are not repository artifacts.

Selected installed-source SHA-256 identities:

| File | SHA-256 |
| --- | --- |
| `extension/manifest.json` | `dffbc864c87be693e1d338d085bb0344b8a9e5a0232b34cb4c93a8a668186c9d` |
| `extension/content.js` | `c0e8e0e95ddca9a3761e22346e14d8b3f97074474dab9d5214744f27f127c9a4` |
| `extension/background.js` | `5bb9a607c43e45b74d08b7310c3d7fb3bf6474a0971469a895a620d91192f9a8` |

## Scenarios

| Scenario | Observed outcome |
| --- | --- |
| Installation | **Pass:** unpacked 0.1.0 card enabled. An earlier user attempt selected `icons` and failed; selecting the manifest's parent folder resolved installation. |
| Coexisting controls | **Pass:** SmartTube toolbar and Enhancer's control row both rendered on the live player. This does not establish every Enhancer feature. |
| Toolbar pause | **Pass:** SmartTube toggle changed native YouTube state from pause action to play action; the test video stopped. |
| Forward/rewind | **Pass:** while paused, native time changed 0:29 → 0:39 → 0:29. |
| Toolbar speed | **Pass:** cycling from 1× produced 1.25×; both toolbar and popup's actual-player status reported it. |
| Popup routing | **Pass:** popup identified Big Buck Bunny and its duration, position and actual rate. Popup Play resumed playback and position advanced. |
| Queue persistence | **Pass:** Add current changed queue count 0 → 1. The same public item remained after closing/reopening the popup and reloading the video. |
| Saved default | **Pass for storage and immediate application:** selecting 1.5× in options applied to the open player. Reloading options retained the selected 1.5× value. |
| Default after video reload | **Fail:** reloading the video produced actual 1× while the popup's saved selector still read 1.5×. See reproduction below. |
| Internal navigation | **Pass:** an in-page YouTube search and result link opened Sintel; SmartTube tools reappeared on the new video. No document-reuse instrumentation was added, so this proves the user-facing navigation path rather than independently proving YouTube's internal navigation mechanism. |
| Queued transition | **Pass:** Sintel's SmartTube Next opened queued Big Buck Bunny in the same test tab. A further Next reported “Your queue is empty,” confirming the test item was consumed. Automatic end-of-video continuation was not exercised. |
| Restoration | **Pass:** saved default restored to original 1×, queue returned to its original empty state by playing its item, sponsor lookup left off, dedicated video left paused. Test video and options tabs remain available for inspection. |

## Open failure: saved default loses effect after reload

1. With the normal profile's existing player extensions enabled, open Big Buck Bunny.
2. Open SmartTube settings through its popup; choose 1.5× as the default.
3. Reload the options page: the selection remains 1.5×. Return to the video: the toolbar reports 1.5×.
4. Reload the video and reopen SmartTube's popup.
5. Observed: actual-player status reports 1× while the saved speed selector reports 1.5×.

Disposition: unresolved, observed once in this session. Another controller overriding the rate after SmartTube's initial application is plausible; the cause was not isolated by disabling extensions or changing protections. Do not label this case passed because storage works. Investigate timing/ownership with a controlled regression before implementing a fix; avoid competing rate setters that continually override deliberate user changes.

## Limits and check reuse

Sponsor skipping stayed off. No live sponsor-bearing segment, sponsor undo, network request behavior, ad/live/Shorts handling, full browser-process restart, automatic queue continuation, exhaustive accessibility, or Chrome/Edge check was performed in the normal profile. Existing disposable-profile and signed-out evidence remains scoped as described in [VALIDATION.md](../VALIDATION.md).

UI helper errors included unavailable click geometry and a stale menu element index. Fresh observations and a screenshot-based menu click recovered the test route; delayed immediate snapshots were followed by fresh observations before asserting outcomes. These helper failures are not extension test passes or evidence of an extension crash.

Only documentation changed as a result of this session. Runtime tests were not rerun for those documentation edits. Historical passing checks remain evidence for their original inputs; they do not resolve the observed normal-profile speed failure. No new runtime version or release artifact was produced.
