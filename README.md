# SmartTube Browser

A free, open-source YouTube viewing extension for **Brave**, Chrome, and Edge. Inspired by SmartTube, rebuilt for the browser around YouTube's existing player.

**Status: v0.2.0 developer preview.** Fixes the startup speed reset and adds looping, volume and opt-in wheel controls. Tested in Brave fixtures and a live isolated profile with Enhancer 3.0.19; normal-profile acceptance of this update is pending. See [playback evidence and feature map](docs/ENHANCER_FEATURES.md). Installation is manual; this is not a Chrome Web Store listing.

## Features

- Compact player toolbar with play/pause, ten-second seeking, speed controls, and queue actions.
- Popup with playback controls and a queue saved on your device.
- Opt-in SponsorBlock skipping, category selection, and an Undo skip control.
- Default playback speed, optional toolbar, and optional automatic queue continuation.
- Whole-video or A–B looping, native volume/mute controls, and optional mouse-wheel controls.
- Settings saved locally; no account, telemetry, API key, subscription, or hosted backend.

This is an independent community project, not an official SmartTube port. YouTube supplies playback and account features. This version does not provide SmartTube's independent player, casting, full TV interface, or a promise of video-ad removal. If you already use SponsorBlock, enable sponsor skipping in only one extension to avoid conflicts.

## Install in Brave

1. Download the source from this repository or clone it.
2. Open `brave://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose the repository's **extension** folder, which contains `manifest.json`.
4. Refresh any open YouTube tabs, then open a video on `https://www.youtube.com`.
5. Pin SmartTube Browser from Brave's extensions menu to access the popup. Sponsor skipping is off until you enable it.

Choose `extension` itself, not its `icons` subfolder. If Brave reports a missing manifest, return to the folder containing `manifest.json` and select that folder.

No build, npm install, paid store account, or signing certificate is needed to load the source. For Chrome use `chrome://extensions`; for Edge use `edge://extensions`. Brave is the primary validation target; see [validation status](docs/VALIDATION.md) for the exact tested scope.

The toolbar is in the top-left corner of the player and becomes more visible on hover or keyboard focus. **Alt + Shift + S** temporarily pauses/resumes enhancements in that tab. Click **Settings** in the popup to configure categories and automatic queue continuation.

For a range loop, choose **A** at the start and **B** at the end; **Clear** removes the range. Loop ranges reset when the video changes. Enable **Mouse-wheel playback controls** in settings for **Alt + wheel** speed changes and **Alt + Shift + wheel** volume changes over the player. The browser test processes are always muted; this does not mute ordinary extension use.

The saved speed is reconciled for up to four seconds at startup, with at most four corrections. Deliberate speed actions take over immediately. If another extension should own the default, turn off **Apply saved playback speed**.

Updates are manual: replace your source folder with a newer version, select Reload on the extensions page, and refresh YouTube. Existing local settings are retained. Uninstalling the extension removes its local storage.

## Develop locally

Use an existing Node.js 20+ installation. Runtime and build scripts have **zero npm dependencies**.

```sh
npm test
npm run check
npm run build
```

The build copies installable files to `dist/extension`. You can load either that folder or `extension` directly. Browser integration tests use an existing local Playwright installation and Brave; no browser or package is downloaded automatically.

```powershell
$env:BROWSER_TEST_PLAYWRIGHT_MODULE = 'C:\path\to\playwright\index.mjs'
$env:BRAVE_PATH = 'C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe'
npm run test:browser
```

The browser suite creates disposable profiles under `.local` and outputs screenshots and a report under `test-results`. It uses synthetic YouTube and SponsorBlock fixtures in the real Brave extension runtime. Its passing result does not establish compatibility with every live YouTube account, layout, or video. See [architecture](docs/ARCHITECTURE.md), [privacy](PRIVACY.md), and [contributing](CONTRIBUTING.md).

## Cost and license

Free to use and develop with existing equipment, internet, and available tooling. No paid API, backend, CI workflow, cloud resource, signing certificate, store listing, or paid AI overage is required or enabled. Build and test locally; do not add metered services as mandatory dependencies. GitHub hosts the source. The Windows app is deferred.

Original extension code is [MIT licensed](LICENSE). Uses SponsorBlock data licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) from [SponsorBlock](https://sponsor.ajay.app/), filtered by selected categories. The data retains its separate license; this project's MIT license does not relicense it. No SponsorBlock client code or Android source is bundled. See [third-party notices](THIRD_PARTY_NOTICES.md).
