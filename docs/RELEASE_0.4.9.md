# SmartTube Browser 0.4.9 preview

Prepared 19 October 2026. Local installed-version fix accepted by coordinator non-author review (one pass, no repairs). Separate release/source/package/provenance review and coordinator exact gate remain pending. Publication and actual public downloaded update verification remain pending.

## Download

After publication use the [v0.4.9 prerelease](https://github.com/ShadowSwaps/smarttube-browser-extension/releases/tag/v0.4.9). Until then [0.4.8 remains published](https://github.com/ShadowSwaps/smarttube-browser-extension/releases/tag/v0.4.8). Download `smarttube-browser-extension-0.4.9.zip` and `SHA256SUMS.txt`. No store account, build, payment or signing is required.

The original accepted ZIP is preserved byte for byte; its manifest is at the ZIP root. Unlike 0.4.8, there is no enclosing extension directory. Extract it into a dedicated folder, then choose the folder containing manifest.json.

## Verify the download

SHA-256: `258c812c51fdbc981dfa59ec5cac18d4ba685d7713086b2131a7e8eddac9a55c`.

In PowerShell run `Get-FileHash .\smarttube-browser-extension-0.4.9.zip -Algorithm SHA256` and compare the complete value with SHA256SUMS.txt and this page. Do not load a mismatch.

## Manual install or update

For a new install extract into a dedicated folder. In Brave open `brave://extensions`, enable Developer mode and Load unpacked that folder.

For an update preserve a copy of old files, close the browser, and replace files in the SAME existing unpacked root with the verified archive contents: manifest.json must replace the old manifest directly. Retain the existing extension entry/profile; do not uninstall or choose a new root. Restart Brave and refresh YouTube tabs, then inspect the registered version, Settings label, local preferences and queue. Chrome/Edge have corresponding extension pages but are compatibility targets without fresh acceptance here.

Uninstalling removes local storage; a different root/ID can use separate storage. Files alone do not back up local preferences/queue. If needed, close Brave, restore the saved old files to the same root and restart. Tested old-file restore/re-upgrade is bounded evidence, not a universal downgrade or storage recovery guarantee. No automatic updater, backup/export or storage migration is added.

## Change, verification and limits

Settings derives its v0.4.9 label from installed manifest metadata; a missing/throwing lookup does not block controls. The manifest retains version_name “0.4.9 local preview” because these exact accepted bytes are frozen for the GitHub prerelease. Player/content/core/native volume/quality/worker logic, storage schema, permissions, third-party notices and public build/dependency semantics are unchanged from accepted 0.4.8.

Five fresh author update groups passed in Brave 155.0.8059.85. The verified published 0.4.8 ZIP and unchanged accepted 0.4.9 ZIP were loaded successively into one stable test-owned root/profile/ID. Five headless muted process launches retained full settings and three ordered queue entries without import after upgrade, a separate 0.4.9 restart, bounded old-file restore and re-upgrade. All 18 served new resources matched source/package hashes. Settings label, popup queue, both surfaces’ save/reload and Settings navigation passed; screenshots were visually inspected. Static checks, 46 fresh units, selected-source build and all 18 built members passed. No media/watch page was opened. Preserved private harness failures: old ZIP-prefix assumption before launch, unchanged-toggle save-event expectation, and new-tab expectation when Settings reused an open tab; product/ZIP bytes did not change.

Author release checks and exact same-root update evidence are recorded in [validation](VALIDATION.md). Earlier 0.4.8 media/keyboard/queue evidence is reused only for byte-identical unaffected code; it is not fresh 0.4.9 playback or service acceptance. SponsorBlock actual-service evidence remains dated 0.4.7. No personal-profile, account, other-extension, signed-store, automatic-update, Chrome/Edge, arbitrary layout/ad/Shorts/live-stream or universal accessibility claim is made.

All owned test launches/restarts use headless isolated Brave, only SmartTube and explicit --mute-audio. Fresh release update checks use extension pages only, without media playback. Published download verification remains a distinct required gate.

Original code is [MIT](../LICENSE); [third-party data notices](../THIRD_PARTY_NOTICES.md) and [privacy](../PRIVACY.md) remain separate.
