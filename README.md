# SmartTube Browser

A free, open-source YouTube viewing extension for **Brave**, Chrome, and Edge. Inspired by SmartTube, rebuilt for the browser around YouTube's existing player.

**Status, 17 October 2026: v0.4.3 runtime/package accepted locally; readiness review pending.** Required separate non-author runtime review and coordinator acceptance passed. Adds queue recovery and an on-demand player controls panel; see [accepted evidence and preserved failures](docs/QUEUE_CONTROLS.md). Normal-Brave coverage now combines human-reported playback/popup/Next checks with explicitly delegated UI checks of automatic continuation and appearance. Failed-navigation and old-queue retention remain unrun in that profile; installed bytes were not independently measured. Non-author readiness/docs review is pending. See [exact outcomes, limits, checksum, update and rollback guidance](docs/RELEASE_0.4.3.md). No 0.4.3 GitHub release has been published by this work; installation is manual, with no store listing.

## Features

- Small player entry button opens play/pause, seeking, speed, loop, volume and queue controls.
- Popup with playback controls and a queue saved on your device.
- Opt-in SponsorBlock skipping, category selection, and an Undo skip control.
- Default playback speed, optional toolbar, and optional automatic queue continuation.
- Whole-video or A–B looping, native volume/mute controls, and optional mouse-wheel controls.
- Cinema dimming, brightness/contrast/saturation/grayscale filters, and switches to hide comments, related videos, chat, Shorts shelves, end screens and info cards.
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

The subdued **ST** button is in the top-right corner of the player. Click it, or focus it and press Enter/Space, to open the controls and status/Undo area. Outside native fullscreen, Escape closes the focused panel and returns focus to ST before a further Escape exits cinema. In the observed normal-Brave fullscreen sequence, the first Escape exits fullscreen; the next closes ST and returns focus. Tab can leave the last tool for YouTube; focus is not trapped. Only ST remains visible when collapsed; hidden tools leave the tab order. **Alt + Shift + S** temporarily pauses/resumes enhancements in that tab. The queue list and **Settings** are in Brave's extension popup, separate from the ST player panel.

Queue selections remain saved until the selected video starts playing outside an advertisement. Failed or unavailable navigation retains the entries for retry from the popup. No automatic skipping of unavailable entries is added. A browser restart retains the queue but clears the temporary navigation receipt, so an interrupted selection may remain for manual retry/removal.

For a range loop, choose **A** at the start and **B** at the end; **Clear** removes the range. Loop ranges reset when the video changes. Enable **Mouse-wheel playback controls** in settings for **Alt + wheel** speed changes and **Alt + Shift + wheel** volume changes over the player. The browser test processes are always muted; this does not mute ordinary extension use.

The saved speed is reconciled for up to four seconds at startup, with at most four corrections. Deliberate speed actions take over immediately. If another extension should own the default, turn off **Apply saved playback speed**.

Click **Cinema** in the toolbar or **Cinema mode** in the popup to dim the page around the player. Press **Escape** or click the dimmed page to exit for that tab. Settings can also start videos in cinema mode; dimming suspends during fullscreen. Open **Picture and distractions** in settings or the popup for video filters and individual hide switches. **Reset video filters** disables filters and restores neutral values. Every appearance feature starts off; settings are saved on this device. Hiding uses known YouTube layout selectors and may need updates as the site changes.

Updates are manual: preserve a copy of the old files, replace files in the same unpacked root with a verified version, select Reload on the existing extension entry, and refresh YouTube. Keeping the same entry is intended to retain local settings and queue; verify them after reload. Uninstalling removes local storage; a different unpacked root/ID may use separate storage. See [exact 0.4.3 update and recovery steps](docs/RELEASE_0.4.3.md#manual-install-or-update).

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
