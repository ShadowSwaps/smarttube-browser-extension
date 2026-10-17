# Enhancer feature reconstruction and playback work

## Selected scope and reference

The user requested the reload speed fix and incorporation of useful Enhancer features, then selected playback controls: loop ranges, volume and mouse-wheel controls. This increment implements those workflows in SmartTube Browser 0.2.0. Remaining feature groups stay visible below; this is not a claim of complete Enhancer parity.

Reference: installed Enhancer for YouTube 3.0.19, with its original package used unmodified in a fresh, silent Brave profile. No personal profile, settings, cookies or accounts were copied. Its packaged license is proprietary; no implementation, assets or themes are redistributed. This project implements documented feature ideas independently under MIT.

Public sources: [developer feature overview](https://www.mrfdev.com/enhancer-for-youtube), [developer usage guide](https://www.mrfdev.com/how-to-use-enhancer-for-youtube), and [Mozilla listing](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-youtube/). The Firefox listing identifies a different version; it is a feature reference, not proof of Chrome 3.0.19 behaviour.

REA metadata evidence: parent `ev_5cdf3d4e5e1648b4fb5cf49a0918e3eb565d9c1d63558cebb3c154c0d33ca7cf`, summary `ev_f4087fa6b5c590099be7dddcd7fda12303181b6aaddd4d9e5da4d9fad1007ade`, artifact digest `c3d4b53af618eee6802d70e29da2cebdc2a81e243131ac362ddb0c363ce0a395`. Analysis selected only `manifest.json`; 64 other relevant inventoried files were outside analysis scope. This establishes package identity and declared interfaces, not implementation or execution. An earlier request selecting `license.txt` was rejected as an invalid analyzable-source selection; the corrected manifest-only request succeeded.

## Requirements and acceptance

| ID | Behaviour / design | Component | Implementation / verification |
| --- | --- | --- | --- |
| P1 | Saved speed wins over a late startup reset, then deliberate rate changes remain in control | `content.js` startup reconciliation | Implemented; delayed-reset fixture, reload, native-settings gesture and live two-extension checks passed |
| P2 | Stop correcting after four seconds or four corrections; allow startup-speed ownership to be disabled | `applySpeed`, content adapter | Implemented; opt-out and continuously competing-controller fixture passed |
| P3 | Loop the whole video or an A–B interval; reject B before A; clear on video navigation | content adapter, toolbar, popup | Implemented; native media fixture and actual public-video A–B check passed; navigation reset covered |
| P4 | Adjust volume in 0–100% range and toggle mute | content adapter, toolbar, popup slider | Implemented; fixture toolbar/popup checks and live two-extension checks passed |
| P5 | Opt-in Alt-wheel changes speed by 0.05×; Alt-Shift-wheel changes volume by 5%; preserve regular scrolling and Ctrl | `wheelControls`, capture listener | Intentional modifier difference from Enhancer; fixture and actual CDP mouse/keyboard checks with both extensions passed |
| P6 | Preserve settings/queue and use no extra permissions or paid dependencies | core defaults, worker, packaging | Existing migration/default handling retained; nine local tests, manifest allowlist, build and browser restart checks passed |

### Speed failure and fix

0.1.0 applied the default once after metadata. In the isolated live baseline, enabling Enhancer's speed override at 1× resulted in actual 1× while SmartTube stored 1.5×, both on initial load and reload. This corroborates the earlier [normal-profile failure](validation/normal-brave-2026-10-17.md) without copying that profile. It does not prove the exact internal setter/order inside Enhancer.

0.2.0 retries at the existing 500ms player synchronization interval during a bounded startup window. Native speed-menu interactions, YouTube speed shortcuts and SmartTube's explicit speed actions cancel correction. Continuous competing resets stop correction with visible feedback rather than starting an endless rate-setting fight. The popup labels its saved selector **Default playback speed** separately from actual playback status. Turn off **Apply saved playback speed** to let another extension own startup speed.

Loops belong to the current video, not a global saved setting. Full-video looping uses the native media loop flag; range loops use the playback clock. Clear restores the original native loop flag. Recognized ads/live streams are excluded, and queue auto-continuation does not interrupt an active loop. Volume uses the native media API, without audio processing or amplification.

## Broader feature map

These groups come from public documentation. The selected appearance increment is now implemented in 0.3.0; see [requirements, evidence and limits](APPEARANCE_FEATURES.md). Other rows remain deferred and this is not a claim of full parity.

| Feature group | Status / next constraint |
| --- | --- |
| Default speed, loop ranges, native volume, wheel control | Selected increment implemented; improvements and limits above |
| Volume/bass amplification | Deferred; investigate codec/audio-graph compatibility before adding gain |
| Preferred quality, frame-rate/codec selection | Deferred; requires supported player capability discovery and fallback |
| Background autoplay / stop behaviour | Deferred; define interaction with queue and browser policies |
| Mini player / pop-up player | Deferred; compare native picture-in-picture and embedded playback boundaries |
| Cinema mode / wider player | Cinema dimming implemented in 0.3.0; player resizing remains deferred |
| Hide comments, related videos, chat, Shorts, end cards | Six reversible switches implemented in 0.3.0, including info cards; selector coverage is bounded |
| Video filters / themes | Four original video filters implemented in 0.3.0; themes remain deferred, no copied assets |
| Screenshots | Deferred; validate canvas/media-origin restrictions and output |
| Configurable shortcuts | Deferred; preserve YouTube and other extension bindings |
| Custom script execution | Not selected; would change the execution/security boundary |

## Validation and limits

All runs used local installed tools, headless Brave engine 155.0.8059.85 and `--mute-audio`. The assembled candidate passed nine local tests and 21 Brave fixture outcomes. The optional `scripts/compatibility-test.mjs` passed six live checks with actual Enhancer 3.0.19 on public Big Buck Bunny `aqz-KE-bpKQ`: initial/reload speed, volume/mute, real wheel modifiers, A–B looping and a deliberate toolbar rate change.

Reproduce using existing Playwright, Brave and an explicitly selected existing Enhancer package:

```powershell
$env:BROWSER_TEST_PLAYWRIGHT_MODULE = 'C:\path\to\playwright\index.mjs'
$env:ENHANCER_PATH = 'C:\path\to\unmodified\Enhancer\3.0.19_0'
node scripts/compatibility-test.mjs
```

The harness reads the reference's fresh-profile options DOM and executes its unmodified extension. It does not inspect reference JavaScript or copy private preferences. Live results use timestamped `test-results/compatibility-*` directories; full reports and screenshots remain local. Fixture output from earlier runs was archived before reruns. Preserved failures include a sandbox DNS denial, a setup attempt to select a hidden reference widget, and a fixture expectation that incorrectly expected an unchanged saved setting to overwrite a deliberate manual rate. Setup was corrected before the passing results.

Reviewer: Codex, implementation author; self-review of final diff, fixture/live outcomes and popup/options/player screenshots. No independent maintainer review or complete security audit is claimed. 0.2.0 has not yet been accepted in the human's normal profile. Later resets outside the startup window, every Enhancer configuration, live/Shorts loop variations, exhaustive keyboard/accessibility cases, real sponsor-bearing content, Chrome and Edge remain outside this result.

Packaged candidate: `smarttube-browser-extension-0.2.0.zip`, SHA-256 `2ecc6bfb6bdffbfc6d2f0bbf2274f305bb7e5ccc049ef16c77d7333280b70a34`. All 16 ZIP file entries were checked against the installable build. The live compatibility report identifies `content.js` as `1cdc926173905fb47c8a259870a6a28f98b24b7abc79dcaf1217979413beebab` and `core.js` as `43bc53aaa196b180b79b5621ad00e46dba2957d9560cf67e35d12fff7c5179b5`.
