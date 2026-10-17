# Appearance controls: 0.3.0

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

## Limits and update

Normal-profile acceptance of 0.3.0 remains pending. The isolated profile contains the selected reference extension and fresh settings, not every extension/configuration from the human's normal setup. No universal Enhancer parity is claimed. Live chat, Shorts variants, end screens and info cards have controlled selector coverage only; live comments/related checks establish container display restoration, not every recommendation type or lazy-loaded comments workflow. Fullscreen suspension was simulated through the recognized player class in fixtures; native fullscreen, exhaustive scrolling layouts, keyboard/accessibility combinations, Chrome and Edge remain unverified. YouTube may change its selectors. Themes, player resizing, amplification and further backlog items remain deferred.

For the existing source install, select **Reload** on SmartTube Browser at `brave://extensions`, then refresh YouTube. Open **Picture and distractions** in the popup or settings; click **Cinema** in the toolbar for a temporary toggle. Existing saved settings and queue are retained.
