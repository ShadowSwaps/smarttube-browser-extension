# 0.4.3 release readiness

17 October 2026: the bounded runtime/package is accepted. Partial normal-Brave results are consolidated below; readiness/documentation acceptance remains pending targeted non-author review. This is preparation for a possible GitHub release, not a published release or publication authorization.

## Candidate identity

| Item | Frozen identity |
| --- | --- |
| Runtime source commit | `d5842686da40e1f171d8306fc28ad52845ca18cc` |
| Accepted source tree | `dd48b2f3138d91a6aa88b80815cc0ba41af8b4c2` |
| Manifest and package version | `0.4.3` |
| Existing local ZIP | `dist/smarttube-browser-extension-0.4.3.zip` |
| ZIP SHA-256 | `475dd3ac088279ffd58cf41255a5b742ca1850a77bec0b8e699547b730ffb580` |

The ZIP contains `extension/` and `INSTALL.txt` (17 files). All entries match the accepted build; extension code matches source. Documentation-only readiness changes do not replace this package or change its version. A future publisher must select an exact reviewed documentation commit and the frozen runtime/package above. Do not rebuild a different payload under the same checksum/version claim.

## Prepared release notes

Queue selections now stay saved until the intended destination starts loaded, unpaused non-ad playback. Delayed, unavailable or failed navigation retains entries for manual retry. Selection receipts bind the tab, origin membership and destination; repeated end events cannot repeatedly advance the same ended playback. Recognized ad sources remain excluded after marker clearing, media reloads or node replacement. Automatic continuation remains opt-in and yields to looping.

A small ST entry opens an on-demand player panel. Keyboard Enter/Space opens it. Outside native fullscreen, Escape closes focused tools and restores ST focus before a further Escape exits cinema. In the observed normal-Brave fullscreen sequence, first Escape exits fullscreen; the next closes ST and returns focus. Tab can leave the last tool for YouTube. Existing speed, loop, volume, appearance and local settings behavior is retained. No new permissions, storage schema, runtime dependency, paid service or bundled proprietary assets.

## Verification and limits

Separate non-author pass 4 and coordinator acceptance of the runtime completed on 17 October 2026. The original queue item ended at four review passes, three repair rounds and zero remaining. A newly observed runtime failure must be checkpointed against that history; this readiness task grants no runtime repair round.

Accepted evidence: 20 unit tests, 43 fixture outcomes and 15 fresh signed-out live Brave checks, plus 14 historical live layout checks reused only for unchanged layout dependencies. Brave Chromium engine was `155.0.8059.85`; every owned launch/restart was headless, isolated and used `--mute-audio`. Selected live coexistence checks used unmodified Enhancer 3.0.19 with fresh settings. The readiness identity audit reuses these results only after checking source, harness, report and package identities; no media suite is rerun merely for prose changes. See [queue evidence and preserved failures](QUEUE_CONTROLS.md) and [validation status](VALIDATION.md).

The live natural-end check observed a public 19.021-second source ending without seeking, exactly one queue selection, and a distinct loaded non-ad destination playing before consumption. Ad-marker clearing is proven through actual-code diagnostics and deterministic native-media fixtures, not actual public advertising. No waiting for ads or weakening Shields is required.

Normal-profile evidence now includes the native action popup and the selected playback/appearance scenarios below, with explicit unrun cases. Prior 0.3.0 human acceptance remains historical. Chrome/Edge, normal-profile whole-process restart, actual sponsor-bearing content, broader layouts/accessibility, arbitrary window resizing and arbitrary extension combinations remain unrun. Fixture restart evidence is separate from normal-profile restart. Historical failed media/harness runs remain preserved.

## Normal Brave results

On 17 October 2026, the human performed the initial checks, then explicitly asked the agent to take over automatic continuation and the remaining UI checks. Delegated checks used the computer-use skill in the existing normal Brave window; they were not headless fixtures. No new browser was launched. Routine agent-owned browser launches remain headless, isolated and muted; no browser work occurred during this documentation repair.

| Scenario | Observed result and provenance |
| --- | --- |
| Version and source | Human confirmed 0.4.3; delegated UI inspection displayed 0.4.3 from the repository's `extension` root. The running browser reported Brave 1.97.59 / Chromium 155.0.8059.85. No independently measured installed digest. |
| Popup/settings | Human reported the native Brave extension popup works with saved settings retained; delegated UI also opened it and read playback/queue status. The player ST panel is separate and has no embedded queue list or popup-launch button. |
| Speed and controls | Human confirmed actual 1.5× after reload and a video link, seek, volume, loop and focus return. First Escape exits native fullscreen; the next closes ST and returns focus. Tab leaving the final tool matches the nontrapping design. No first-Escape fullscreen panel-close pass is claimed. |
| Queue selection/Next | Human reported the selected video starts and its entry disappears afterward; explicitly confirmed the ST Next button as well. |
| Automatic continuation | Delegated UI observed a short source play from its start without seeking, pause/resume near its end, one visible transition to the intended destination, destination playback and an empty queue. This does not independently count internal Next events or establish YouTube autoplay state; the native autoplay switch was not exposed and was left untouched. |
| Persistence | A temporary entry survived page reload/navigation in the delegated run. Old-queue retention after extension reload remains unrun: the delegated run began with an empty queue and the human did not explicitly confirm old entries. |
| Interrupted navigation | One attempt was too late: the destination had already started. Failed-navigation retention is unrun in this profile, not passed or failed. Existing deterministic fixture coverage remains separate; no further race/retry is requested. |
| Appearance | Delegated UI observed grayscale on the original and linked incoming video, related-video hide/restore, cinema dimming, native fullscreen/return and page scrolling. Fullscreen changed viewport size; arbitrary window resizing was not separately tested. No broad extension-coexistence guarantee follows. |

Before the UI route stopped, temporary appearance settings were restored off/neutral, automatic continuation was off, and the original tab was paused at 0:22 with 1.5×, volume 5% and an empty queue. Tab-specific mute was restored to its original unmuted state while paused. Scrolling over the player briefly triggered an existing wheel-volume control; final popup inspection showed the original 5%. Existing Shields/extensions/accounts were not deliberately changed. The speed inherited from the human's earlier check stayed at 1.5×; their preferred value before that check was not recorded, so full pre-check speed restoration is not claimed.

Computer Use stopped when it could not determine the current browser URL with enough confidence to enforce policy. The route stopped immediately and has not resumed or used an alternate control path. The attempted return from the read-only `brave://version` page was not confirmed: the metadata tab may still be there, and no later cleanup is claimed. No personal screenshots were saved into repository/public evidence. Source/version displays and UI observations do not prove the installed in-memory bytes. These limits require review disposition, not repeated human checks.

Readiness review pass 1 requested documentation/evidence corrections; this assembled correction awaits targeted pass 2. Runtime acceptance and its exhausted queue review budget are unchanged. The saved private receipts retain exact human replies, delegations, observed results, restriction and historical failures; public documentation omits personal video/history details.

## Manual install or update

For a pinned source install, select commit `d5842686da40e1f171d8306fc28ad52845ca18cc` rather than a moving branch, and use its `extension` folder. Alternatively, extract the verified ZIP into a stable local directory and select its `extension` folder containing `manifest.json`. Never select `icons` or the ZIP's parent directory.

For an existing installation, first note its source folder, version and preferences. Keep the same unpacked extension root and existing extension entry/ID. Preserve a separate copy of the old files, replace that root's extension files with the verified candidate, click **Reload** on its existing entry at `brave://extensions`, then refresh the dedicated YouTube tab. Do not remove/reinstall the entry: uninstall removes local storage. A new unpacked folder/ID can have separate storage. Reloading the same entry is intended to retain local settings and queue; verify this below. No automated update service is included.

Check a downloaded ZIP locally before extracting:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath '.\smarttube-browser-extension-0.4.3.zip'
```

Compare the full result with the SHA-256 above. A checksum checks bytes; it does not independently establish publisher identity. A version label alone does not prove the installed digest. Keep existing Shields, extensions, accounts, tabs and browser/system audio settings. Normal-profile actions require explicit authorization; the delegated route described above is now stopped. Routine agent-owned browser launches stay headless, isolated and muted.

## Short human Brave checklist

This is the reusable checklist, not a request to repeat the run above or resume the stopped UI route. For an authorized future run, work through one step at a time and report pass, fail or unrun. Stop and report any unexpected runtime failure.

Before starting: use one dedicated tab; note your original preferences. Keep existing Shields, extensions, accounts, tabs and queue entries. Mute only the test tab during playback; restore its previous mute state afterward. Do not change browser-wide/system audio. Omit personal browsing details/screenshots.

### 1. Version and popup

- Reload the existing SmartTube entry at `brave://extensions`; confirm **0.4.3**.
- Refresh YouTube. Open the native Brave extension popup and try Play/Pause.
- Confirm saved settings and old queue entries remain.
- Record the Brave version and extension source folder. A label alone does not verify installed bytes.

### 2. Saved speed

- Note your preferred speed. Enable **Apply saved playback speed** and save **1.5×**.
- Reload, then follow a normal video link.
- Confirm actual non-ad playback is 1.5× after each, not just its label.

### 3. Player controls

- Only **ST** should show when collapsed. Click to open it.
- Outside native fullscreen, focus ST, use Enter/Space, Tab into tools, then Escape to close and return focus. In the observed native fullscreen sequence, first Escape exits fullscreen and the next closes ST with focus return; do not expect the first Escape to override fullscreen. Tab may leave the last control for YouTube; the panel does not trap focus.
- Try seek, extension volume/mute and one loop; clear the loop afterward.
- The player panel and Brave's extension popup are separate. Open the latter through Brave's extensions menu as in step 1; there is no player-panel button to open it.

### 4. Queue — guided separately

Keep old queue entries. If their order prevents a safe test, report the case unrun.

- **Next:** add test videos A and B. From A, use Next. B should start before the relevant test entries disappear.
- **Natural end:** clear loops; temporarily enable automatic continuation. Play a short source from the start without seeking. Confirm exactly one transition to B. Note/restore native autoplay if temporarily turned off to isolate this check.
- **Interrupted navigation:** pause and add B; note the queue. Select B from A and immediately Stop loading before B plays. Pending entries should remain. If B plays first, record this subcase unrun; do not repeat the race. Record unavailable-video retention only if actually encountered.

### 5. Appearance and cleanup

- Try cinema, scroll/resize and native fullscreen. Exit native fullscreen first. Outside fullscreen, close focused tools, then use a further Escape to exit cinema.
- Try one filter and hide/restore comments or related videos; follow a video link and check they still work.
- Restore your original speed, loop, automatic continuation, appearance, native autoplay and test-tab mute preferences. Remove only test queue entries.
- Report any conflict with your existing extensions.

Whole-browser process restart and sponsor/ad scenarios are not part of this short checklist unless separately agreed. A page reload is not a process restart. Human reports, delegated UI observations and agent-measured repository/package identities are recorded separately; skipped cases remain explicit.

## Rollback and future publication gate

If this update misbehaves, stop the acceptance run and retain the report. Restore the saved previous extension files in the same unpacked root, reload the same entry and refresh the test tab. Do not uninstall, clear storage or assume downgrade recovery is guaranteed. 0.4.3 makes no saved-queue schema migration; restore any temporarily changed preferences manually. Preserve pending queue entries for manual retry/removal. Report the rollback's actual outcome; this document does not claim it has been exercised.

The historical 0.3.0 ZIP is `smarttube-browser-extension-0.3.0.zip`, SHA-256 `5a82fa3c1f767b2317c0ddc48a4753e2b78ba57c4667d673819dd5ee444de36d`. It is a prior human-tested option, not an automatic downgrade instruction or a newly verified release asset. Prefer the exact locally saved previous install when recovering.

Before any future GitHub publication: obtain a disposition for the recorded unrun/unknown cases, obtain non-author readiness/docs acceptance, record the exact reviewed source/docs commit and unchanged ZIP identity, and obtain explicit publication authority. This does not authorize repeating checks or resuming the stopped UI route. A publisher would attach the frozen ZIP and a checksum text file containing:

```text
475dd3ac088279ffd58cf41255a5b742ca1850a77bec0b8e699547b730ffb580  smarttube-browser-extension-0.4.3.zip
```

Verify the uploaded asset hash and target commit after authorized publication. No push, tag, PR, release, store upload, CI enablement or installation automation is performed by this readiness preparation.
