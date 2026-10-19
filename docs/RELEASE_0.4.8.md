# SmartTube Browser 0.4.8 preview

Prepared 19 October 2026. Keyboard and compact-layout implementation passed coordinator non-author acceptance (one pass, no repairs). Separate release/source/package/provenance review and coordinator prepublication gate are pending. Publication and actual public downloaded-distribution verification are pending; this page does not claim they occurred.

## Download

After publication, use the [v0.4.8 prerelease](https://github.com/ShadowSwaps/smarttube-browser-extension/releases/tag/v0.4.8). Download `smarttube-browser-extension-0.4.8.zip` and `SHA256SUMS.txt`. Until then the [0.4.7 preview](RELEASE_0.4.7.md) remains published. No store, signing fee, build, npm install or paid service is needed. This is a manual unpacked developer preview, not an automatic or signed store update.

## Verify the download

In PowerShell, in the download directory:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath .\smarttube-browser-extension-0.4.8.zip
Get-Content -LiteralPath .\SHA256SUMS.txt
```

The ZIP SHA-256 must be `848d59a3b47d8335ecdfdef073491eee42907e84ae9a1aadc23a140bd8cb5aba`. Check the filename and all 64 hexadecimal digits. A mismatch means stop and obtain the expected asset again. This is the byte-identical accepted keyboard/layout candidate ZIP under its release filename, with 15 runtime files and LICENSE, PRIVACY.md and THIRD_PARTY_NOTICES.md inside `extension/`.

## Manual install or update

1. Extract the verified ZIP to a staging folder. For a new install, open `brave://extensions`, enable Developer mode, choose Load unpacked, and select the extracted `extension` folder containing `manifest.json`.
2. For an update, record the existing extension ID and its unpacked folder. Keep a backup copy of the old folder outside that root. Record important settings and queue entries separately: a file backup alone does not back up browser local storage. Do not uninstall the existing entry.
3. Close owned YouTube tabs to avoid playback during the update. Close Brave before replacing files if using the tested process-close route. Replace the contents of the **same existing unpacked extension root** with the contents of the new `extension` folder; avoid a nested `extension/extension` directory. Do not move to another root or create a second entry.
4. Reopen Brave with the existing profile/entry, or use Reload on the existing extension entry if updating while Brave remains open. Confirm the same extension ID and version 0.4.8. Refresh YouTube and verify Settings and queue order/membership. The isolated test uses a closed-process same-root replacement; it does not establish every open-browser reload case.
5. Check native playback and your preferences. Default startup is Normal 1× and 5% with Apply starting volume enabled; a previously saved wheel opt-out remains off. Startup preferences yield to deliberate native/manual controls. Sponsor skipping remains opt-in.

Uninstalling can remove local storage. Loading another root/ID can create separate storage; importing state afterward is not update preservation. Chrome and Edge offer analogous unpacked controls but have no equivalent acceptance evidence here.

## Recovery

Keep the old verified ZIP and root backup until the update is checked. If loading fails, stop playback, close the test-owned browser or affected tabs and restore the known-good files to the same root; reopen/reload the existing entry and check its version, ID, settings and queue. A bounded synthetic 0.4.8-to-0.4.7 file restore retained the selected settings and queue, followed by a successful re-upgrade; this is not a universal downgrade or storage recovery guarantee. There is no automatic backup/export or updater. Do not erase the profile or uninstall as a recovery step when preserving local data matters.

## Changes and coverage

One ST entry remains keyboard reachable while native chrome auto-hides. Enter/Space, visible focus, natural Tab exit, focus preservation and keyboard Undo focus return are covered. A side gutter keeps the entry clear of scrolling tools in compact players. Native playback remains with YouTube; no permissions, storage schema, service dependencies or updater were added.

The accepted candidate has 46 author unit tests, 94 fixture groups, eight exact-package signed-out live groups and seven fresh coordinator keyboard fixture groups. The selected 0.4.7 [SponsorBlock audit](SPONSORBLOCK_ACCEPTANCE.md) is dated actual-service evidence for unchanged service code, not a new 0.4.8 service run. [Validation](VALIDATION.md) preserves failures and exact scope.

Six author upgrade groups passed in Brave 155.0.8059.85. A verified published 0.4.7 ZIP was loaded in a stable test-owned root. Before update, Settings UI saved Apply starting volume/5%, wheel controls off, preferred quality 720p, filters on/brightness 90% and hide-comments on; a bounded worker setup seeded three ordered synthetic queue entries only on 0.4.7. The existing profile and extension ID survived closed-process replacement with the exact 0.4.8 ZIP. All settings and queue objects matched before/after without importing state, including after a separate 0.4.8 process restart and a bounded old-file restore/re-upgrade.

All 18 served new package resources matched the expected hashes. Popup queue order and Settings passed; actual watch playback, Tab/Enter/Escape focus, measured 360px panel clearance, reload/navigation, paused native manual 1.5×/0% precedence and saved wheel opt-out passed. Reload restored 5%/Normal 1× before playback. Four trusted actual playing events identified the expected documents/native videos at native 5/media 0.05/Normal 1×. Five launches used the same ID, headless isolated profile and explicit process mute; owned pages were blank before each awaited close. These are synthetic unpacked update checks, not personal-profile, signed-store or public-0.4.8-download acceptance.

Static checks, 46 fresh unit tests and a selected-source build passed; all 18 built members matched the unchanged ZIP. Earlier attempts are retained: one wrong setup selector before playback, one sandbox connection reset, and a native speed-menu selector mismatch after one safe playing event. Corrected harness attempts did not change product code. Release review and actual public download/install checks remain mandatory separate gates.

All owned acceptance browsers are headless isolated Brave, only SmartTube, with `--mute-audio`; native 5% and media 0.05 are measured before actual play. No personal profile, account, other extension, system audio or protections are changed. Personal-profile acceptance, Chrome/Edge, screen readers, arbitrary layouts/ads/Shorts/live streams and universal accessibility remain unverified. Native fullscreen button exit passed; browser-level Escape is unverified. There is no first-audible/continuous volume guarantee or recommendation to remove Enhancer.

Original code is [MIT](../LICENSE); [SponsorBlock data notices](../THIRD_PARTY_NOTICES.md) and [privacy](../PRIVACY.md) remain separate. No community dataset or third-party implementation is bundled.
