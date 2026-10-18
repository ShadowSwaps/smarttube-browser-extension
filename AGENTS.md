# SmartTube Browser project instructions

## Scope and cost

Build the browser extension first, with Brave as the primary acceptance browser. Chrome and Edge remain compatibility targets; Windows work is deferred until the human requests it. Keep original code open source under MIT and retain separate third-party data notices.

Use existing equipment, internet, installed tools and available AI allowances; require no extra project spending. Do not enable paid overage, buy credits, start trials, add paid APIs or a hosted backend, or make signing/store fees mandatory. A free tier alone does not prove no billing exposure. Keep builds and required tests local; do not enable a metered CI workflow automatically.

## Bounded work and ownership

Before meaningful changes, identify intended result, preserved behavior, affected files, acceptance checks and stop boundary. Work in coherent slices. One implementation owner edits this checkout at a time. Do not spawn agents, create chats, message other chats, add schedulers, or silently change model/reasoning/speed settings without applicable project authorization.

Search before reading, select relevant evidence, batch independent reads, and filter large tool results to status, cursor, meaningful findings and requested evidence. Use concise linked checkpoints instead of repeated full-history reads. Preserve historical failures and decisions. Report the current result and next gate; omit unchanged polls.

## Coordinator and policy routing

Lead every task-chat checkpoint/final reply with truthful status, concrete result and relevant brief verification, limits and evidence links. Close with a natural sentence: stay in this task chat or return to **SmartTube Coordinator**, why, and required human action/input or none. Name responsible owner and return condition. Use sentence case; see the four [status examples](docs/WORKFLOW.md#task-status-and-human-routing). Completed requires every scoped obligation and mandatory gate resolved; ready for review is intermediate; still working requires authorized work; checkpointed means stopped and unaccepted. Human routing grants no acceptance, completion, writer transfer or archive eligibility: an intermediate review return to the coordinator retains task-scoped repairs and open gates.

The human-adopted coordinator/task procedure is [docs/WORKFLOW.md](docs/WORKFLOW.md). Read it at task start and ownership/closure boundaries; use [docs/TASK_HANDOFF_TEMPLATE.md](docs/TASK_HANDOFF_TEMPLATE.md) for dispatch and return. SmartTube Coordinator chooses bounded authorized scope. Substantial work uses a fresh selected-source task chat; small repairs stay with its owner. Scoped task-chat coordination and recoverable completion-based archiving are authorized; this grants no authority for agents, schedulers, unrelated messages, new features or publication. One writer remains in force.

Read [docs/REVIEW_POLICY.md](docs/REVIEW_POLICY.md) before choosing a review path, reviewing or repairing findings. Preserve inherited mandatory gates. Allow one comprehensive review plus at most two repair-and-verification rounds per work item across chat, reviewer and commit changes. Unresolved blockers at the limit require checkpointing; only explicit human authorization can extend this budget. The coordinator cannot grant more rounds, auto-pass blockers or reset cumulative counts.

Keep task, finding and archive records under ignored `.investigation-tools/workflow/`. Keep pending review, scoped fixes and authorized release verification with the owning task. Archive only after coordinator verification of completed scope, required publication, saved evidence and the exact idle chat with no pending scoped action. Keep the coordinator open; do not permanently delete chats or clean up worktrees through this policy.

## Usage and completion

Read current account usage with the supported usage tool at task start and substantial phase boundaries. Use minimum remaining percentage across all usable windows, including weekly; missing values mean unavailable, not zero. Do not poll while idle or claim a model setting changed when it did not.

At <=10% remaining, assess whether all remaining authorized scope, required checks, delivery and checkpoint overhead can finish above 4%. Continue only on a supported positive assessment; otherwise checkpoint and stop substantive work. At <=4%, checkpoint and stop substantive work. Never omit checks or enable paid usage to fit the remaining allowance. These local task boundaries authorize neither other-chat coordination nor automatic continuation. Reassess after scope or usage changes; never assume a short-window reset restores weekly allowance.

A completed turn, build, PR or test count is not acceptance of an entire feature. Keep pending installation, review and validation visible. Do not mark work fully complete or start another feature with required work unresolved. Preserve explicit human pauses and required inputs.

## Quality and evidence

Run meaningful focused checks during implementation, then relevant regression, integration and packaging checks on the assembled candidate. Reuse passing results only while relevant source/tree, artifact, configuration and environment match and no new failure or concern invalidates them. Documentation alone requires no unchanged media-test reruns. Preserve failed runs; fix their cause or record the unresolved limitation instead of retrying until a result looks successful.

Record source/artifact identities, command/scenario, outcome, relevant browser/environment and evidence location. Distinguish implementation, fixture verification, live-site verification and normal-profile acceptance. Do not equate page reload with browser-process restart, or fixtures with actual community-service behavior. Cover previously accepted behavior when changing shared logic.

Review the actual final diff and relevant evidence. Record reviewer identity, authorship and actual method; self-review must be labeled self-review. Contained changes require coordinator non-author review; consequential credentials, storage/recovery, permissions, updater/release trust or automated validation-selection changes require separate non-author review under the review policy. Keep acceptance pending if required review is unavailable or unauthorized. The author's own tests or a reviewer label alone do not establish independent acceptance. Passing tests grant no new publication authority.

## Normal Brave profile

Use the project's headless Brave/Playwright setup with an isolated workspace profile for routine browser tests and screenshot review. It is independent of the human's mouse, keyboard and personal browser session. Keep native desktop automation out of this route. Existing scripts use disposable profiles; introduce a persistent compatibility profile only with explicitly selected test extensions/settings. Never populate it by cloning the human's profile, cookies, accounts or browsing history. A separate visible browser window shares the desktop; it provides no input isolation.

Keep every test-owned Brave instance silent: pass `--mute-audio` on every launch and restart, including fixtures, live sites and ad hoc reviews. Headless mode alone is not the silence policy. Preserve the human's normal browser volume and Windows audio settings; audible testing requires the human's explicit request.

Install and test in the normal profile only when requested. Preserve existing settings, Shields, extensions, accounts and tabs. Never weaken protections or remove another extension to pass. Use a dedicated test tab, restore temporary player preferences where practical, and avoid publishing browsing history, account details, cookies or screenshots containing personal information.

Record the exact installed source/version and actual outcomes for toolbar, popup, playback, local persistence, navigation and relevant extension interactions. Keep unperformed cases pending. On a UI-tool policy or URL-verification failure, stop that route and report the concrete blocker; do not bypass it via another control path.

## Chat graph isolation

Use the installed graphify-chat skill for this chat's own graph. Resolve current session from hook context or CODEX_THREAD_ID, never recency or project directory. Enrich meaningful decisions/results with selected source evidence; keep changed files and pending semantics visible. Refresh failures must not block the task. Keep other chats/graphs separate unless the human explicitly requests selected material. Reading another project's workflow does not transfer its approvals, pauses, schedulers or model settings.
