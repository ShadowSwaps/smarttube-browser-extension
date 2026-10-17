# SmartTube Browser project instructions

## Scope and cost

Build the browser extension first, with Brave as the primary acceptance browser. Chrome and Edge remain compatibility targets; Windows work is deferred until the human requests it. Keep original code open source under MIT and retain separate third-party data notices.

Require no additional project spending: use existing equipment, internet, installed tools and available AI allowances. Do not enable paid overage, buy credits, start trials, add paid APIs or a hosted backend, or make signing/store fees mandatory. A service's free tier alone does not prove absence of billing exposure. Keep builds and required tests local; do not enable a metered CI workflow automatically.

## Bounded work and ownership

Before a meaningful change, identify its intended result, preserved behavior, affected files, acceptance checks and stopping boundary. Work in coherent slices. One implementation owner edits this checkout at a time. Do not spawn agents, create chats, message other chats, add schedulers, or silently change model/reasoning/speed settings without authorization applicable to this project.

Search before reading, select relevant evidence, batch independent reads, and filter large tool results to status, cursor, meaningful findings and requested evidence. Keep concise checkpoints with links instead of repeatedly loading full histories. Preserve historical failures and decisions. Progress reports should explain the current result and next gate without narrating unchanged polls.

## Usage and completion

At task start and substantial phase boundaries, read current account usage using the supported usage tool. Use the minimum remaining percentage across all usable windows, including weekly; missing values are unavailable, not zero. Do not poll while idle or claim a model setting changed when it did not.

At 10% or less remaining, assess whether the entire remaining authorized scope, required checks, delivery and checkpoint overhead can finish above 4%. Continue only with a supported positive assessment; otherwise checkpoint and stop substantive work. At 4% or less, checkpoint and stop substantive work. Never omit checks or enable paid usage to fit the remaining allowance. These are local task boundaries, not an authorization to coordinate other chats or create automatic continuation. Reassess after scope or usage changes; never assume a short-window reset restores weekly allowance.

A completed turn, build, PR or test count is not acceptance of an entire feature. Keep pending installation, review and validation visible. Do not mark work fully complete or start a different feature while required work remains unresolved. Preserve explicit human pauses and required inputs.

## Quality and evidence

Run focused meaningful checks while implementing, then relevant regression, integration and packaging checks on the assembled candidate. Reuse a passing result only when its relevant source/tree, artifact, configuration and environment still match and no new failure or concern invalidates it. New documentation alone does not require rerunning unchanged media tests. Preserve failed runs; fix their cause or record the unresolved limitation instead of retrying until a result looks successful.

Record source identity, command/scenario, outcome, relevant browser/environment, artifact identity and evidence location. Distinguish implementation, fixture verification, live-site verification and normal-profile acceptance. Do not equate a page reload with a browser-process restart or fixtures with actual community-service behavior. Keep previously accepted behavior covered when changing shared logic.

Review the actual final diff and relevant evidence. Record reviewer identity and performed method; self-review must be labeled self-review. For consequential permission, storage, update or release-boundary changes, seek independent review when authorized and available, and report any missing required review. Do not claim independent acceptance from the author's own tests or from a reviewer label alone. Passing tests grant no new publication authority.

## Normal Brave profile

Use the project's headless Brave/Playwright setup with an isolated workspace profile for routine browser tests and screenshot review. It runs independently of the human's mouse, keyboard and personal browser session. Keep native desktop automation out of this route. Existing scripts use disposable profiles; a persistent compatibility profile may be introduced only with explicitly selected test extensions/settings. Never clone the human's profile, cookies, accounts or browsing history to populate it. A separate visible browser window still shares the desktop and does not provide input isolation.

Keep every test-owned Brave instance silent: pass `--mute-audio` on every launch and restart, including fixture, live-site and ad hoc review sessions. Headless mode alone is not the silence policy. Preserve the human's normal browser volume and Windows audio settings; any audible test requires the human's explicit request.

Install and test in the normal profile only when requested. Preserve existing settings, Shields, extensions, accounts and tabs. Do not weaken protections or remove another extension to obtain a pass. Use a dedicated test tab, restore temporary player preferences where practical, and avoid publishing browsing history, account details, cookies or screenshots containing personal information.

Record the exact installed source/version and actual outcomes for toolbar, popup, playback, local persistence, navigation and relevant extension interactions. Keep any unperformed cases pending. If a UI tool stops for a policy or URL-verification failure, stop that route and report the concrete blocker; do not bypass it through another control path.

## Chat graph isolation

Use the installed graphify-chat skill for this chat's own graph. Resolve the current session from hook context or CODEX_THREAD_ID, never by recency or project directory. Enrich meaningful decisions/results with selected source evidence; keep changed files and pending semantics visible. Refresh failures must not block the user's task. Other chats and their graphs remain separate unless the human explicitly requests selected material. Reading another project's workflow does not transfer its approvals, pauses, schedulers or model settings.
