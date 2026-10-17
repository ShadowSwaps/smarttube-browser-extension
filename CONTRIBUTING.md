# Contributing

Build free software with local tools and no paid infrastructure. Use Node.js 20+, run `npm test`, `npm run check`, and `npm run build`, then load `extension` into Brave in developer mode. Verify relevant behavior on an actual YouTube page as well as controlled fixtures. Include the browser version and exact tested scope in changes.

Keep player-independent rules in `extension/core.js`; browser, DOM, and extension APIs belong in adapters. The future Windows app can reuse the core. Package all executable code locally. Never add telemetry, billing credentials, paid services, remote executable code, or required Premium features.

Tests should cover observable outcomes, boundary cases, failure recovery, and data ownership. Mark fixtures clearly and keep live-service observations separate. Do not commit credentials, disposable profiles, personal browsing data, test artifacts, or third-party source checkouts. Do not add automatic GitHub Actions or another metered build service without establishing that it cannot incur charges.

Please report reproducible bugs with browser version, extension version, and steps. Do not include cookies, account tokens, or private video titles. Security reports should avoid disclosing active credentials or exploit details in public issues.
