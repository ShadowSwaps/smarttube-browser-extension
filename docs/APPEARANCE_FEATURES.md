# Appearance controls: 0.3.0

The local [0.4.1 repair candidate](QUEUE_CONTROLS.md) replaces the persistent toolbar with a small ST entry and an on-demand panel. Escape closes focused tools before exiting cinema. The evidence below remains the historical 0.3.0 record; candidate checks and pending gates are recorded separately.

The user selected cinema mode, video filters and hiding distractions as the next Enhancer-inspired increment. This is original MIT implementation of those selected ideas, using the [existing reference and feature map](ENHANCER_FEATURES.md). No reference JavaScript, themes or other assets were copied. Development and testing use existing local tools with no paid service, new npm dependency or added extension permission.

## Requirements and evidence

| ID | Selected behaviour | Implementation | Observed verification |
| --- | --- | --- | --- |
| A1 | Dim the page around the native player; toolbar/popup toggle, Escape/outside-click exit | Four fixed panels in `appearance.js`, tab-local override in `content.js` | Fixture and live two-extension exit/hit-test checks; fixture resize and recognized fullscreen-class suspension/resume |
| A2 | Optional saved cinema startup setting, off by default | Existing local settings and sanitizer | Options/YouTube reload and disable/re-enable fixture checks |
| A3 | Brightness, contrast, saturation, grayscale and reset; affect only video | Fixed CSS functions, bounded integer values, popup/options sliders | Local malformed-value tests, fixture composition/priority restoration and newer-owner preservation, all four controls on live media |
| A4 | Hide comments, related videos, chat, Shorts shelves, end screens and info cards independently | Owned fixed-selector stylesheet; no DOM deletion | Six fixture switches, dynamic comment insertion, unrelated-content preservation and restoration; actual live comments/related containers hide and restore |
| A5 | Reverse appearance on disable, SPA exit and media replacement | Existing adapter sync plus property ownership checks | Fixture master switch, navigation, detached-video restoration and replacement checks |
| A6 | Retain playback and local preferences without extra lookups | Appearance-only saves do not reset speed or invalidate sponsor segments | Full playback fixture regression, unchanged sponsor request count, six existing live playback cases, full fixture browser restart with non-default appearance values and fresh options page |
| A7 | Keep popup adjustments stable while player status refreshes | Unsaved range drafts remain local until change | Fixture waits across the popup's refresh period before committing and verifies the applied value |

All appearance features start off. Brightness/contrast range from 50–150%, saturation 0–200%, grayscale 0–100%. **Reset video filters** disables filtering and resets the four values. Cinema dimming suspends during fullscreen or when the player leaves the viewport. Escape/outside click exits for the current tab; a saved startup preference resumes after page reload. Distraction switches remove matching sections from layout and switching them off restores the site's display rules.

Filters compose with the current computed video filter and restore the prior inline property/priority when SmartTube still owns its last write. A later external inline filter edit is preserved. This is bounded coexistence, not a promise that arbitrary extensions can jointly control one CSS property. No monitor settings or audio processing are changed.

## Assembled candidate validation

On 17 October 2026, the final candidate passed:

- Ten local tests (`node --test tests/core.test.mjs tests/background.test.mjs`), permission/syntax/script checks (`node scripts/check.mjs`), and dependency-free build (`node scripts/build.mjs`).
- 28 Brave fixture outcomes (`node scripts/browser-test.mjs`) using controlled YouTube markup, generated native WAV media and worker-local SponsorBlock responses. This includes popup/options operation, appearance reversibility, playback regressions and a full owned browser-process restart.
- Ten live checks (`node scripts/compatibility-test.mjs`) on public Big Buck Bunny `aqz-KE-bpKQ` with actual unmodified Enhancer 3.0.19 enabled. A fresh profile enabled Enhancer's 1× speed override while SmartTube saved 1.5×. Playback speed before/after reload, volume/mute, real wheel modifiers, A–B looping and deliberate rate changes passed alongside filters, cinema, live comments/related visibility and filter reload/reset.
- ZIP verification: all 17 file entries match the installable build, with none missing or unexpected.

Brave engine: `155.0.8059.85`. Every owned launch/restart was headless and used `--mute-audio`. No native desktop input, private profile copy, accounts, personal browsing data or changes to the human's normal audio settings were used.

Final local evidence: `test-results/browser-report.json` (28 outcomes), `test-results/compatibility-1792233297464/report.json` (ten live checks), popup/options/player/cinema screenshots, and that compatibility directory's `cinema-filters.png`. Reports and screenshots remain ignored local evidence. Historical files were archived before fixture reruns. An initial fixture run timed out on an incorrect master-switch accessible label; the harness label was corrected with product code unchanged. That failure's screenshots and explanation remain in a timestamped local archive. An earlier passing candidate preceded the popup draft improvement; the assembled candidate was rebuilt and both browser suites rerun after that change.

| Final packaged source | SHA-256 |
| --- | --- |
| `manifest.json` | `42964a94f83f88b291361107e5a0c727cbd7f5def70bf88d91a257351ea87112` |
| `content.js` | `886789147d04f452485d6b8c96289046c268e311dd6297cab22b6a3f070b41af` |
| `core.js` | `6a6ad6edc5c3841adeab5df0c431d943f23de689131736d5d1ffe7354156d81c` |
| `ui.js` | `b6dbf346119b0bc9e05232306bdac805d3595e51509aa00ffd3443fb8696b6b7` |
| `appearance.js` | `cb7c935b70ed94e15da254d1de603f9759ed7f9f909a9e0bdbfb15afe843bd58` |

Package: `smarttube-browser-extension-0.3.0.zip`, SHA-256 `5a82fa3c1f767b2317c0ddc48a4753e2b78ba57c4667d673819dd5ee444de36d`.

Reviewer: Codex, implementation author. Performed self-review of the actual diff, settings/message boundaries, source/package identities, fixture/live results and popup/options/cinema/player screenshots. This is not independent review or full security certification. Permission and worker authorization boundaries are unchanged.

## Additional isolated Brave gap checks

On 17 October 2026, `node scripts/brave-acceptance-test.mjs` passed 14 focused live checks with the same v0.3.0 extension files and unmodified Enhancer 3.0.19 in a fresh, headless, muted Brave profile (engine `155.0.8059.85`). No extension code or package changed. The checks observed:

- Actual native fullscreen entry and exit through YouTube's control, with `document.fullscreenElement` and `fullscreenchange` events. The fullscreen element was `HTML`. Cinema suspended and resumed, filters remained applied, and a real SmartTube toolbar click sought forward.
- Aligned cinema panels and uncovered player hit testing at 980×720, 1600×1000 and 1280×900, partial scrolling, deep scrolling with Enhancer's floating player, and return to the normal layout.
- A real related-link transition from Big Buck Bunny to `B4EPW7JUMTM` within the same document. The site reused its video node. Settled incoming content reported ready state 4, 1.5× playback and no advertising state. Filters, comments/related hide-and-restore and cinema continued to work. Activating the real home link through keyboard focus/Enter cleared active cinema and restored the exact departing video's filter; history navigation back reapplied appearance.

Final local evidence is `.investigation-tools/workflow/brave-acceptance/run-1792241482916/report.json` and its three screenshots. The report hashes all 16 installed extension files and the harness (`dd0e21c3567ea9f5e790ba6e2950280ec75251b0ca0b260502fc1699ec0f2ae2`). The existing ZIP still has SHA-256 `5a82fa3c1f767b2317c0ddc48a4753e2b78ba57c4667d673819dd5ee444de36d`; all 16 extension entries and the root installation note match the build. Prior fixture, playback and package evidence above remains applicable to the unchanged extension; these are additional live checks, not replacement runs of those suites.

Failed setup/assertion runs remain in the private evidence directory: sandbox DNS resolution, consent obstructing geometry, an incorrect expected fullscreen-element ID, and an incorrect offscreen assumption when Enhancer floated the player. A premature SPA speed assertion observed a six-second advertisement at 1×. Screenshot review corrected the initial product-failure attribution; the final harness waits for settled non-ad media, preserving SmartTube's advertising exclusion. No product failure requiring a code change was established.

Reviewer: Codex, author of this test/evidence increment, performed self-review of the actual diff, source/artifact identities, reports and screenshots. Non-author SmartTube Coordinator pass 1 examined the exact candidate delta, relevant dependencies, reports, screenshots, identities and direct human reply; it supported the bounded evidence and requested correction of stale acceptance text. Documentation acceptance follows the separate review workflow. The human reported all five normal-profile checklist steps passed on 17 October 2026; see [current results and limits](VALIDATION.md#user-reported-normal-profile-acceptance). No push, release or personal-profile automation was performed.

To reproduce with existing local tools and the explicitly selected unmodified reference package:

```powershell
$env:BROWSER_TEST_PLAYWRIGHT_MODULE = 'C:\path\to\playwright\index.mjs'
$env:ENHANCER_PATH = 'C:\path\to\unmodified\Enhancer\3.0.19_0'
node scripts/brave-acceptance-test.mjs
```

This optional script writes timestamped private workflow evidence and uses its own disposable `.local` profile. It does not download a browser, install packages or use a hosted backend.

## Limits and update

The human reported the five-step 0.3.0 normal-profile checklist passed on 17 October 2026, explicitly including actual 1.5× after reload and video-link navigation. Source/version and remaining checklist behaviors were user-confirmed, not agent-observed in the personal profile. Normal-profile process restart and opt-in sponsor skipping remain unrun. The isolated profile contains the selected reference extension and fresh settings, not every extension/configuration from the human's normal setup. No universal Enhancer parity is claimed. Live chat, Shorts variants, end screens and info cards have controlled selector coverage only; live comments/related checks establish container display restoration, not every recommendation type or lazy-loaded comments workflow. Earlier fixture fullscreen simulation is now supplemented by the actual native API evidence above. The live SPA transition reused its video node; detached-node replacement remains fixture coverage. Deep scrolling exercised the reference's floating player rather than a live offscreen player. The final return screenshot captures another pre-roll with appearance applied; post-return non-ad speed was not asserted. Exhaustive scrolling layouts, keyboard/accessibility combinations, Chrome and Edge remain unverified. YouTube may change its selectors. Themes, player resizing, amplification and further backlog items remain deferred.

For the existing source install, select **Reload** on SmartTube Browser at `brave://extensions`, then refresh YouTube. Open **Picture and distractions** in the popup or settings; click **Cinema** in the toolbar for a temporary toggle. Existing saved settings and queue are retained.
