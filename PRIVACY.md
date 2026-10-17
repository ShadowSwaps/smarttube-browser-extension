# Privacy

SmartTube Browser has no analytics, advertising, telemetry, remote configuration, hosted backend, or extension account. All executable extension code is packaged locally.

Settings and up to 100 queue entries are stored in `chrome.storage.local` on this device. Queue entries contain a YouTube video ID and title. The extension reads the current YouTube page's title, video identity, player state, and playback clock to provide its controls. These values are not sent to a project server. It does not read YouTube authentication cookies or export account credentials.

Sponsor skipping is **off by default**. If enabled, the extension makes HTTPS requests to `sponsor.ajay.app` using the first four characters of a SHA-256 video ID hash and the selected categories. Requests omit credentials and referrers. SponsorBlock receives the hash prefix and ordinary network information, including IP address. Hash prefixes narrow the possible video set and are not a guarantee of anonymity. See [SponsorBlock's privacy policy](https://sponsor.ajay.app/privacy/).

Segment responses are cached in service-worker memory, with at most 100 entries and a 30-minute success lifetime; failure results expire after a minute. Browser worker termination can clear that cache. No viewing statistics, votes, segment submissions, or user IDs are sent to SponsorBlock. If it is unavailable, normal playback continues.

Permissions:

| Permission or access | Purpose |
| --- | --- |
| `storage` | Save settings and queue locally |
| `activeTab` | Connect the popup to the tab where it was opened |
| `https://www.youtube.com/*` content script | Read and operate the existing HTML media player; react to navigation |
| `https://sponsor.ajay.app/*` host permission | Fetch segment data only when sponsor skipping is enabled |

No broad all-sites, browsing-history, cookies, downloads, debugger, or network interception permission is requested. Opening a queued video navigates to YouTube, which applies its own privacy policy. Links to documentation or third-party policies open only when clicked. Uninstalling the extension removes its local storage.
