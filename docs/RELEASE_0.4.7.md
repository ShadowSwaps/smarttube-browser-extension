# SmartTube Browser 0.4.7 preview

Prepared 18 October 2026 for the existing public [source repository](https://github.com/ShadowSwaps/smarttube-browser-extension). The runtime and selected isolated everyday workflows are locally accepted. Separate non-author release/source/package/provenance review and the coordinator exact-candidate gate are pending. Publication and downloaded-distribution verification have not occurred. The reserved [v0.4.7 prerelease link](https://github.com/ShadowSwaps/smarttube-browser-extension/releases/tag/v0.4.7) becomes usable only after those gates. This is a manually installed preview, with manual updates.

## What is included

- Local preferred quality: Auto by default, Highest available, or a fixed resolution using the highest offered at or below the target. Bounded correction yields to native Settings interaction; missing/slow native capabilities remain unsupported or unconfirmed.
- Native Normal 1× on new/reloaded videos; optional starting volume defaults to 5% with verified positive unmute, bounded correction and manual precedence. Alt-wheel adjusts volume; Alt-Shift-wheel adjusts speed within native limits, with readable achieved-value feedback.
- One compact ST entry for queue, Cinema, loops and picture tools. YouTube retains ordinary transport and native Theater mode.
- Local queue/retry/optional automatic continuation, video-local loops, reversible picture/distraction settings and opt-in SponsorBlock skipping/Undo.

No account, API key, npm dependency, subscription, hosted backend, store payment or signing purchase is required. No automatic updater or paid CI is introduced.

## Verify the download

Download **smarttube-browser-extension-0.4.7.zip** and **SHA256SUMS.txt** from the v0.4.7 prerelease when published. Avoid confusing GitHub's automatically generated source archives with the installable asset. The ZIP retains the exact locally accepted bytes:

```text
9f2272af19404e05005e663348d8dd9f65ccf40763c1c68d73430b3e412919ce  smarttube-browser-extension-0.4.7.zip
```

In PowerShell, from the download folder:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath .\smarttube-browser-extension-0.4.7.zip
Get-Content -LiteralPath .\SHA256SUMS.txt
```

Compare the complete hash with both the line above and SHA256SUMS.txt before extracting. Stop if they differ. A matching hash checks byte identity; it does not independently authenticate the repository owner or establish universal compatibility.

The ZIP contains one **extension/** folder with 18 files: 15 runtime/assets plus LICENSE, PRIVACY.md and THIRD_PARTY_NOTICES.md. The manifest is **extension/manifest.json**, version **0.4.7**. Accepted runtime identity is `daf4a475de31652e3e5e5c8c308e9db3dc1c9174c1a5e7d6b1c047d0d463fef1`, calculated as SHA-256 of JSON.stringify of the sorted recursive relative-path-to-SHA256 map of the 15 runtime/assets. This runtime identity excludes the three accompanying notices and is distinct from the ZIP hash.

## Manual install or update

1. Verify and extract the ZIP into a permanent folder you control. Keep all files, including the three notices. Do not load a ZIP directly.
2. In Brave, open `brave://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the extracted **extension** folder containing manifest.json. Chrome uses `chrome://extensions`; Edge uses `edge://extensions`, with separate acceptance still unverified.
3. Confirm the existing extension entry shows **SmartTube Browser 0.4.7**. Pin its toolbar entry, refresh an open YouTube watch tab and open the popup. **Settings** contains preferred quality, starting volume and saved defaults. Sponsor skipping starts off; appearance defaults start off.
4. For an update, first pause playback and preserve the previous extension folder as a backup. Replace its contents in the **same existing unpacked root**, then select **Reload** on the existing extension entry and refresh YouTube tabs. Verify the version, popup connection, saved settings and queue before resuming. Do not uninstall as an update step: uninstall removes local storage. Loading a different root/ID may create separate storage.
5. Preserve existing browser protections and other extensions. This preview does not establish that Enhancer can be removed. If using another SponsorBlock extension, enable skipping in only one to avoid duplicate actions.

Updates are manual; this package has no signed store update channel. A browser process restart retains saved queue/settings but clears temporary navigation receipts: an interrupted queued selection may need explicit Next/retry or removal. Reloading a page is distinct from restarting the browser process.

For recovery, pause playback, restore the previous known-good files into the same root, reload the same extension entry and refresh YouTube. The current local storage schema is retained, but downgrade behavior across every older version has not been exhaustively tested. If recovery fails, disable SmartTube and use native YouTube controls; retain the backup and avoid uninstalling before deciding what local data to keep.

## Tested scope and limits

The accepted source/package has 46 unit tests, 87 controlled fixture groups and ten signed-out live quality groups. The accepted everyday audit adds one setup scenario, four actual-live scenarios and one mixed intercepted-503/live-recovery scenario. It covers native-ended queue continuation, loop exclusion, persistent explicit retry after an actual owned browser-process restart, and visible comments/related hide/restore on the tested layout. The controlled 503 is not evidence of an actual YouTube outage. Restarts retire watch documents to blank before shutdown; automatic resumption of restored watch tabs is unverified.

Tests use headless isolated Brave 155.0.8059.85 with only SmartTube and `--mute-audio` on every launch/restart. Native 5/media .05 is measured immediately before actual playback and in captured playing events. This does not change normal browser audio or guarantee first-audible timing or continuous volume enforcement. Historical dual-extension observations remain separate transition evidence. See [quality](PREFERRED_QUALITY.md), [startup behavior](STARTUP_VOLUME.md), [validation](VALIDATION.md) and [replacement readiness](ENHANCER_REPLACEMENT.md).

Personal-profile/account/other-extension compatibility, Chrome/Edge, every layout/format, actual ads and real SponsorBlock service behavior remain unverified. This is not full Enhancer parity, a removal recommendation, a promise of ad removal or a Windows application. Native player capabilities and YouTube layouts can change. Earlier failed runs and harness limitations remain part of the evidence; no zero-error or universal-compatibility claim is made. The public asset still requires postpublication download/hash/extracted-install verification.

## Privacy and licenses

Settings and queue stay in local extension storage. Sponsor skipping is off by default; enabling it sends hash-prefix/category requests to SponsorBlock, which also receives ordinary network information. Read [privacy](../PRIVACY.md).

Original code is [MIT](../LICENSE). SponsorBlock data retains its separate CC BY-NC-SA 4.0 terms and is retrieved at runtime, not bundled or relicensed as MIT. No proprietary Enhancer code/assets are distributed. Keep [third-party notices](../THIRD_PARTY_NOTICES.md) with the package.
