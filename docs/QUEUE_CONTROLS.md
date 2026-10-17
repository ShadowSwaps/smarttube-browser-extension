# Queue recovery and discreet controls: 0.4.0 candidate

This is a local implementation and author self-check checkpoint dated 17 October 2026. Separate non-author review is required for queue storage/recovery. Actual live end-to-end queue completion remains unverified. No publication or normal-profile installation was performed; earlier 0.3.0 normal-profile acceptance does not accept this version.

## Behavior

The player normally shows a subdued 30 × 28 px ST button in its upper-right corner. Click/tap or keyboard Enter/Space opens the existing playback tools, status and Undo. The panel wraps and scrolls within the player, reserving space above native bottom controls. Hidden tools have no hit targets or tab stops. Focused tools remain open until deliberately closed; Escape closes them and returns focus to ST before cinema handles a further Escape. No animation was introduced.

Queue selection excludes the current video and retains the saved entries until the selected destination reports unpaused non-ad playback with loaded media and a positive playback position. A receipt in extension-only `chrome.storage.session` binds the origin and destination to the tab. Confirmation removes those two video IDs once, through the existing serialized queue mutation path. It does not change the saved queue schema or require new permissions.

Delayed/failed navigation and unavailable content retain the queue. The source entry, if queued, also remains until destination confirmation. Retry through the popup's queue list or explicitly remove unwanted entries. There is no automatic skip of unavailable content. Browser restart clears session receipts and retains the queue; an interrupted selection may consequently remain queued for manual retry/removal. Automatic continuation stays opt-in and yields to whole-video/A–B looping. Repeated ended events cannot issue repeated automatic attempts for the same ended playback; deliberate replay or Next can try again. A slow navigation blocks overlapping Next requests for ten seconds. Popup opening is also guarded against overlapping clicks.

## Author verification

All test-owned browsers used headless isolated Brave **155.0.8059.85** and `--mute-audio`, including process restarts. No personal browser data, desktop input, system audio changes, paid services or new dependencies were used. Live coexistence used the selected unmodified Enhancer **3.0.19**, with a fresh 1× override configuration.

| Check on the assembled runtime | Result | Local evidence |
| --- | --- | --- |
| `node --test tests/*.test.mjs` | 11 passed: sender/privacy boundaries, queue serialization, repeated selection, tab/destination confirmation, malformed inputs and existing core contracts | `.investigation-tools/workflow/queue-controls/unit-candidate.log` |
| `node scripts/check.mjs` and `node scripts/build.mjs` | Passed; existing permission set retained | `check-candidate.log`, installed-file/package identities |
| `node scripts/browser-test.mjs` | 28 fixture outcomes passed: speed races/manual override, loops, volume/wheel, sponsor/privacy, appearance, popup and process restart | `fixture-candidate.log`, `test-results/browser-report.json` |
| `node scripts/queue-controls-test.mjs` | 12 fixture outcomes passed: native media end, opt-out, loops, delayed/unavailable/network failures, duplicate events, explicit recovery, restart, empty queue, popup opening, keyboard/pointer and layout | `queue-fixture-review.log`, `test-results/queue-controls-fixture-1792244453005/report.json` |
| `node scripts/compatibility-test.mjs` | 10 live playback/appearance checks passed with Enhancer | `live-compatibility-candidate.log`, `test-results/compatibility-1792244320052/report.json` |
| `node scripts/brave-acceptance-test.mjs` | 14 live checks passed: native fullscreen, three viewports, scroll/floating geometry, SPA media navigation and appearance restoration; tools remain inside player and above native controls | `live-layout-candidate.log`, `test-results/brave-acceptance-1792244331568/report.json` |
| `node scripts/queue-controls-test.mjs --live` | Partial: collapsed geometry, keyboard and pointer/loop controls passed. Live native-end queue transition not established | Preserved `queue-live-run1.log` through `queue-live-run6.log` and timestamped `test-results/queue-controls-live-*` reports/screenshots |

The live completion attempts encountered initial restricted DNS, a consent-dialog wait race, native YouTube autoplay interference, then streaming resets/errors after seeking near the end. The harness now waits for consent dismissal and disables native site autoplay only in its disposable profile to isolate extension behavior. Public Big Buck Bunny and YouTube Developers sources failed to provide the required completion evidence; the last showed YouTube's “Something went wrong” player error, no loaded media and the queue retained. These are retained failures, not replaced by fixture claims. Live reports identify their own candidate files; the later popup guard and narrow-height correction did not resolve or reclassify that missing gate.

Author screenshot inspection found native-control overlap in the initial narrow expanded panel despite its earlier containment check. The panel height and acceptance check were corrected before the final runs; the final narrow screenshot leaves at least 55 px below the panel. Other preserved pre-candidate failures were obsolete harness assumptions about panel visibility after Escape/SPA and post-navigation layout readiness. No acceptance review passes were consumed by these author self-checks.

## Package and remaining gates

Local package: `dist/smarttube-browser-extension-0.4.0.zip`, SHA-256 **a9d40151b96017a212d6fca6956c4a48c301f4cc08bc1557506d8f07889f6553**. All **17** file entries match the build; all extension source files match their built copies. The historical 0.3.0 ZIP was preserved. Exact file hashes are in `.investigation-tools/workflow/queue-controls/package-identity.json` and per-run reports.

Reviewer: implementation author in owning chat, **self-review only**, inspecting actual diff, selected dependencies, test reports, screenshots and package bytes. Required separate non-author review is pending, with initial comprehensive review plus at most two repair/verification rounds for this work item. The coordinator must arrange that review and assess the unresolved live gate; the owner retains scoped repairs. The private review request carries exact source and evidence identities.

Normal-profile checks were unrequested and unrun for 0.4.0. Chrome/Edge, other accounts/layouts, broad accessibility/coexistence and real sponsor-bearing content remain outside these results. No new feature, push, release, scheduler, reviewer chat/agent or archive is authorized by this checkpoint.
