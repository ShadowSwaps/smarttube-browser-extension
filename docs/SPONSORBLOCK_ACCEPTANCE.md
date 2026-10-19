# SponsorBlock live-service verification

19 October 2026. **Author verification and coordinator non-author pass 1 passed for the selected isolated Brave scenarios (one pass, no repairs); final coordinator acceptance is recorded on 19 October.** No extension runtime, permissions or published 0.4.7 asset changed.

## Exact candidate and environment

The audit loaded the extraction of the actual published [0.4.7 preview ZIP](https://github.com/ShadowSwaps/smarttube-browser-extension/releases/tag/v0.4.7), from published commit `31d8288a4afb85dcfeae86c13a4c7b860a3b6c64`. Its SHA-256 is `9f2272af19404e05005e663348d8dd9f65ccf40763c1c68d73430b3e412919ce`. The runtime identity is `daf4a475de31652e3e5e5c8c308e9db3dc1c9174c1a5e7d6b1c047d0d463fef1`, calculated as SHA-256 of JSON.stringify of the sorted recursive relative-path-to-SHA-256 map. All 15 runtime resources served by the installed extension matched the expected bytes on each launch.

Two fresh test-owned Brave 155.0.8059.85 processes ran headlessly with isolated synthetic profiles, only SmartTube and `--mute-audio`. Native volume 5%, media volume 0.05 and Normal 1× were measured immediately before every explicit play and in all 14 captured trusted playing events. Both contexts closed. These were separate fresh profiles, not a new process-restart persistence test. No personal browser, account, cookies, other extensions, system audio or protections were changed.

## Observed scenarios

| Scenario | Actual outcome |
| --- | --- |
| Default off | Fresh Settings showed sponsor skipping off. Two public watch loads, intervening playback and navigation made zero SponsorBlock fetch calls. |
| UI opt-in and actual service | Enabling the existing Settings switch requested only the four-character video hash prefix and selected categories, with `actionTypes=["skip"]`. Actual HTTP 200 responses were captured and bound to the current video ID and duration. |
| Actual sponsor skip | On [Reacting To Your Worst Tech Support Nightmares!](https://www.youtube.com/watch?v=ohtTai7AiN8), the returned sponsor interval was 10.172–15.564 seconds. Playback approached from 8.672; a trusted seeking event landed at 15.564 about 1.61 seconds later, with the extension's skipped/Undo status. This elapsed time and native event trace distinguish the skip from normal clock progress. |
| Actual Undo and expiry | Clicking the actual Undo skip button returned to 10.212355. Playback from inside that interval progressed without an immediate repeat skip during the protected window. After about 11 seconds, replaying inside it skipped again. Source protection is `max(10 seconds, (end − before + 2) / playbackRate)`; this sample exercised the minimum window, not every possible duration/rate. |
| Navigation | Navigating with Undo available to [Me at the zoo](https://www.youtube.com/watch?v=jNQXAC9IVRw) produced a new document/native video identity, cleared Undo and reported no matching sponsor segments from its real HTTP 200 prefix response. Playing through the previous video's interval did not reuse it. Same-document navigation remains covered by the unchanged controlled fixture suite. |
| Categories | Empty selection stopped lookups and skipping. A separate actual intro-only request on the sponsor-bearing video returned no matching intro record; playback inside the sponsor interval continued without skipping. This establishes the selected category boundary, not live coverage of all six categories. |
| Off switch alone | With sponsor intervals already loaded and the sponsor category retained, disabling sponsor skipping stopped automatic seeking inside the interval. Subsequent navigation initiated no lookup. Native seeking, paused manual rate selection/restoration and playback remained usable. |
| Safe failure | Separately injected malformed HTTP 200 JSON and HTTP 503 responses produced the unavailable/playback-unaffected status while native playback continued. These two cases were test-worker injections, not actual service outages. The actual service returned HTTP 200; missing matching records were successful empty results. |

The complete main run passed nine scenario groups. A focused follow-up passed two additional off/category scenarios plus repeated installation and request/audio checks; those repeated checks are not additional feature coverage. Four actual service requests and two controlled fetch injections were recorded across the two runs. Actual responses were never replaced by fixtures for the live skip/Undo proof.

## Response identity and privacy boundary

Actual response bodies are dated and hashed; community data can change even between requests for the same prefix.

| Receipt time (Europe/Oslo, 19 October 2026) | Request / result | Response SHA-256 |
| --- | --- | --- |
| 09:30:00.107 | Prefix `6ed6`, sponsor; six matching sponsor segments | `93ea4ee3080e21cb7e41b4cb1aeec6fca85ebd81ffa9d8548ae2e719a4eabcb1` |
| 09:30:14.138 | Prefix `6745`, sponsor; no matching video record | `0a54856c0585aceea60251a3be9073590d265786cfd4c5bc22f16a121988c997` |
| 09:31:38.134 | Prefix `6ed6`, sponsor; same tested sponsor interval | `16b81123090582e3801c1543442ee7f78e7976327e49ddb2e01d4da0839b2fdd` |
| 09:31:56.673 | Prefix `6ed6`, intro; no matching video record | `bc773600bb7ad387354bcf797475537dc7d0041b6b02ecc5ecfe7ac1b3559d4a` |

Observation at the extension's worker fetch boundary recorded GET, the existing SponsorBlock origin and hash-prefix path, only categories/actionTypes query parameters, `credentials: "omit"`, `referrerPolicy: "no-referrer"`, and no request body or custom headers. The observed calls sent no full video ID, queue, account/user ID, submission or vote. This is the extension request boundary, not a packet capture or an anonymity claim. Ordinary network metadata, including IP address, remains visible to the service. See [the fixed privacy contract](../PRIVACY.md) and [official hash-prefix API documentation](https://wiki.sponsor.ajay.app/w/API_Docs#GET_/api/skipSegments/:sha256HashPrefix).

## Evidence, reuse and limits

The private work-item record `smarttube-sponsor-live-20261018` retains the frozen matrix, source/package identities, exact harness snapshots, full timed reports, response bodies/hashes, screenshot, reuse audit and self-review. The inspected screenshot shows the real sponsored content and the Undo protection status. Raw community responses and synthetic profile files are not published here.

The earlier sandbox DNS failure, Windows file-URL harness failure, and human-paused partial S0–S3 run remain preserved. The paused run exited 1 without a final report and is not counted as a complete passing run. The 19 October runs provide fresh service/video evidence. The failure-injection mechanism was corrected in the private harness before the fresh run; no runtime repair occurred.

Identity checks bind the previously accepted 46 unit tests and 87 controlled fixture groups to unchanged runtime, harness/dependency/report bytes and the same browser version/configuration. These are reused results, not fresh tests or actual-service proof. They retain broader recognized ad/live-state, malformed/bounds, same-document navigation, queue, native controls and quality coverage with their original limits.

Personal-profile/account/other-extension behavior, Chrome/Edge, actual YouTube ad transitions, live streams, Shorts, arbitrary layouts, all sponsor intervals and every manual timing combination remain unverified. SponsorBlock skips community-marked content segments; it does not establish YouTube video-ad removal. No service writes, login, paid resource, new release or publication occurred in this audit. The published 0.4.7 assets remain immutable; coordinator non-author pass 1 passed for this bounded audit, and final coordinator acceptance is recorded on 19 October.
