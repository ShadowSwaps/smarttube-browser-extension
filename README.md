# SmartTube Browser

A free, open-source YouTube viewing extension for **Brave**, Chrome, and Edge. Inspired by SmartTube, rebuilt for the browser around YouTube's existing player.

**Status, 18 October 2026: 0.4.7 preview prepared for GitHub prerelease review.** Preferred quality, native startup controls and selected everyday workflows passed their required local reviews and isolated Brave acceptance. Release/source/package review and publication verification remain pending. Personal-profile/account/other-extension compatibility is unverified. See [0.4.7 installation, checksum, updates and limits](docs/RELEASE_0.4.7.md).

## Features

- One player entry opens Queue/Cinema quick actions and expandable Loop/Picture tools.
- Queue-focused popup with extension tools and Settings; ordinary playback stays with YouTube.
- Opt-in SponsorBlock skipping, category selection, and an Undo skip control.
- Normal 1× speed on every new/reloaded video, optional toolbar, and optional automatic queue continuation.
- Whole-video or A–B looping, native volume/mute controls, and optional mouse-wheel controls.
- Cinema dimming, brightness/contrast/saturation/grayscale filters, and switches to hide comments, related videos, chat, Shorts shelves, end screens and info cards.
- Settings saved locally; no account, telemetry, API key, subscription, or hosted backend.

This is an independent community project, not an official SmartTube port. YouTube supplies playback and account features. This version does not provide SmartTube's independent player, casting, full TV interface, or a promise of video-ad removal. If you already use SponsorBlock, enable sponsor skipping in only one extension to avoid conflicts.

## Install in Brave

1. Open the [0.4.7 preview release](https://github.com/ShadowSwaps/smarttube-browser-extension/releases/tag/v0.4.7) when published, download `smarttube-browser-extension-0.4.7.zip` and `SHA256SUMS.txt`, [verify the checksum](docs/RELEASE_0.4.7.md#verify-the-download), and extract the ZIP. The link is reserved until publication. Alternatively use source from the exact `v0.4.7` tag once published.
2. Open `brave://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose the extracted **extension** folder, which contains `manifest.json`.
4. Refresh any open YouTube tabs, then open a video on `https://www.youtube.com`.
5. Pin SmartTube Browser from Brave's extensions menu to access the popup. Sponsor skipping is off until you enable it.

Choose `extension` itself, not its `icons` subfolder. If Brave reports a missing manifest, return to the folder containing `manifest.json` and select that folder.

No build, npm install, paid store account, or signing certificate is needed to load the source. For Chrome use `chrome://extensions`; for Edge use `edge://extensions`. Brave is the primary validation target; see [validation status](docs/VALIDATION.md) for the exact tested scope.

The **ST** button joins YouTube's native control bar, with a subdued top-right fallback when that bar is unavailable or narrow. Click/tap it, or focus it and press Enter/Space, to open tools and status/Undo. Outside native fullscreen, Escape closes focused tools and returns focus to ST before a further Escape exits Cinema. SmartTube leaves fullscreen Escape to the browser. Tab can leave the tools; focus is not trapped, and hidden tools leave the tab order. **Alt + Shift + S** temporarily pauses/resumes enhancements in that tab. The queue list and **Settings** are in Brave's extension popup. See [integration, fallback and input details](docs/PLAYER_UI.md).

Queue selections remain saved until the selected video starts playing outside an advertisement. Failed or unavailable navigation retains the entries for retry from the popup. No automatic skipping of unavailable entries is added. A browser restart retains the queue but clears the temporary navigation receipt, so an interrupted selection may remain for manual retry/removal.

Expand **Loop video / A–B**, choose **A** at the start and **B** at the end; **Clear** removes the range. Loop ranges reset when the video changes. **Mouse-wheel playback controls** starts enabled: **Alt + wheel** changes volume by 5% and briefly shows the percentage; **Alt + Shift + wheel** changes speed by 0.05× over the player and briefly shows the achieved rate, such as **Speed 1.55×**. YouTube’s native supported range applies; limit feedback shows the achieved rate. Regular scrolling and Ctrl-wheel remain available. Saved opt-outs remain off after an update. The browser test processes are always muted; this does not mute ordinary extension use.

**Preferred quality** in Settings offers Auto (default), Highest available, or a fixed resolution with the highest available at-or-below fallback. Selection is bounded to eight seconds/four attempts and yields to native Settings interaction for the current video. See [quality behavior and candidate verification limits](docs/PREFERRED_QUALITY.md). Preferred-quality implementation review and coordinator acceptance passed; public release review remains a separate pending gate.

**Apply starting volume** starts enabled at **5%**. Change the percentage or turn it off in Settings. Startup correction lasts at most four seconds/four attempts, unmutes YouTube’s player only after positive native/media volume is confirmed, and yields to deliberate native volume/mute gestures or SmartTube volume actions. It is a startup preference with [timing and competing-controller limits](docs/STARTUP_VOLUME.md), not a continuous volume limiter.

Every new or reloaded video starts at **Normal(1×)** while SmartTube enhancements are enabled. Startup correction is limited to four seconds/four attempts; deliberate speed actions take over for the current video. Old saved startup speed and ownership fields remain stored for compatibility but are no longer used; their editable Settings controls have been retired. Native controls, SmartTube speed gestures and the native speed menu use the same achieved rate. Later changes by other controllers remain possible; this is not continuous speed enforcement.

Click **Cinema** in player tools or expand **Loop and Cinema** in the popup to dim the page around the player. Press **Escape** or click the dimmed page to exit for that tab. Settings can also start videos in cinema mode; dimming suspends during fullscreen. **Picture and distractions** in player tools makes labeled tab-only adjustments; Settings/popup save defaults locally. **Reset video filters** disables filtering and restores neutral values in the chosen surface. Every appearance feature starts off. Hiding uses known YouTube layout selectors and may need updates as the site changes.

Updates are manual: preserve a copy of the old files, replace files in the same unpacked root with a verified version, select Reload on the existing extension entry, and refresh YouTube. Keeping the same entry is intended to retain local settings and queue; verify them after reload. Uninstalling removes local storage; a different unpacked root/ID may use separate storage. See [0.4.7 update and recovery steps](docs/RELEASE_0.4.7.md#manual-install-or-update).

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
