# Usage and quality workflow

Adopted for SmartTube Browser on 17 October 2026 at the human's request. These practices adapt the focused ownership of Building REA Companion, the source-bound acceptance of Calendar planning and coordination, and the evidence/usage discipline of GameVault Coordinator. Their project-specific permissions and automations are not transferred.

## Coordinator and task ownership

The human adopted coordinator/task routing and bounded review on 17 October 2026. SmartTube Coordinator retains scope decisions, acceptance, publication decisions and closure bookkeeping. Each substantial authorized feature or coherent policy task uses a fresh chat with selected sources and [a saved handoff](TASK_HANDOFF_TEMPLATE.md), rather than a full-history fork. Small repairs remain in the owning task. Fresh tasks share account allowance; no usage saving is claimed from changing chats.

This authorizes scoped task-chat creation/coordination and recoverable archiving of verified completed tasks. It does not authorize agents, unrelated external messages, schedulers, runtime automation, permanent deletion, worktree cleanup or the next feature. Each action must remain within the human's scope and publication authority. Task workers do not create other chats or send cross-chat updates unless their handoff explicitly authorizes it; use saved results and completion events where available. Keep the coordinator open.

Only one implementation owner writes this checkout at a time. Record the reservation before dispatch; do not transfer it until the previous owner has saved source/evidence, stopped writing and reconciled any uncertain tool result. The owner handles implementation, self-checks, scoped corrections and its assigned authorized release verification. A reviewer receives read/review authority, not automatic writing authority. Waiting for review is an intermediate handoff; it does not close the task or free it to begin another feature.

Before a task proposal/dispatch, state actual and recommended model, reasoning and speed with a reason. Use configured defaults unless a specific override is authorized; preserve current speed/settings and no additional spending. Mark unexposed values unavailable rather than inventing a setting or claiming it changed. Recommendations do not apply settings. Another project's model, approval, hold or scheduler policy is only selected evidence, not SmartTube authority.

## Work cycle and stopping boundaries

1. Coordinator reads the request, relevant checkpoint and repository state; freezes the bounded result, preserved contracts, acceptance scenarios, affected files, non-goals, authority and stopping boundary. Choose the impact-based [review path](REVIEW_POLICY.md), carrying every inherited mandatory gate.
2. Check usage at task start and substantial phase boundaries. Use the minimum remaining percentage across all usable windows, including weekly; unavailable values are not zero. Keep existing tools and allowances without paid overage.
3. Save the selected-source handoff, work-item ID and writer reservation. For dispatch, record intended destination before delivery and the returned chat/acknowledgement immediately afterward. If delivery is uncertain, inspect and reconcile the exact destination before retrying; never blindly duplicate a task.
4. Owner implements one coherent slice, runs meaningful focused checks and preserves failures. Inspect the assembled candidate and perform relevant regression, integration and packaging checks. Documentation alone does not require unchanged media runs. Reuse passing evidence only when relevant source/tree, artifact, configuration and environment still match and no new failure or concern invalidates it.
5. Self-review the actual final diff and evidence, then obtain the required non-author review. Keep stable findings and pass counts; allow the initial review plus at most two repair-and-verification rounds. At an unresolved limit, recurring repair, scope growth or unresolved dispute, checkpoint under the review policy. Only explicit human authorization can add bounded review/repair rounds; the coordinator may resolve frozen-requirement interpretation or choose a checkpoint/backlog option, but cannot extend the budget.
6. Record the exact result and pending actions. Coordinator inspects the exact candidate, actual review and evidence before accepting. Publish only with applicable human authority and verify the destination/artifact; checks do not grant permission. Keep scoped fixes, required inputs and authorized publication verification pending until resolved.
7. Save final return evidence and confirm the exact task is idle. Coordinator verifies closure and archive eligibility below. Do not start another feature from an implementation-complete handoff.

At 10% or less remaining, assess whether the entire remaining authorized scope, required checks, delivery and checkpoint overhead can finish above 4%. Continue only with a supported positive assessment; otherwise checkpoint and stop substantive work. At or below 4%, checkpoint and stop. Never omit checks to fit quota. Reassess after scope/usage changes; a short-window reset does not restore weekly allowance. These local stops grant no continuation or scheduler authority. Explicit human pauses and required inputs remain in force.

## Evidence and acceptance

| Record | Required contents |
| --- | --- |
| Change brief | Stable work-item ID, authorization, baseline/dirty state, intended and preserved behavior, affected components, non-goals, acceptance and stopping boundary |
| Test result | Candidate identity, scenario/command, relevant configuration/environment, exit/outcome, evidence location |
| Review | Chosen path/reason, inherited gates, reviewer identity/authorship, self-review or non-author method, findings ledger, cumulative passes and dispositions |
| Release | Exact source and artifact identities, relevant accepted checks, authorization, verified publication result |
| Installation | Normal or disposable profile, installed source/version, observed behavior, conflicts and unperformed cases |

Use distinct coverage labels: implemented; verified under fixtures; verified on a live site; accepted in the normal profile; partially verified; failed; or unrun. Test totals support a stated scope, not a claim of universal compatibility. Preserve historical failures and source comparisons. Do not silently replace an earlier source baseline to make a check pass.

## Context and ownership

Search and read selected evidence first. Summarize large tool results before bringing them into active context, while retaining the full evidence for necessary deeper review. Batch independent reads; keep edits, approvals and dependent acceptance steps sequential.

Use short checkpoints with source/evidence links and exact remaining work. Load this workflow at task start and ownership/closure boundaries, the review policy for review selection and finding repair, and the template for dispatch/return. Avoid repeatedly loading detailed policies and historical reports when unchanged selected evidence suffices. Preserve this chat's isolated graph; resolve its session from hook context or `CODEX_THREAD_ID`, never another chat or project recency. Track only relevant files and keep changed/pending semantics visible; refresh failure does not block the task.

For coordinator monitoring, use compact completion/attention waits with the last returned cursor. Keep calls bounded to at most 60 seconds so user steering and usage boundaries remain actionable. Do useful independent work when available; do not narrate unchanged snapshots or poll usage while idle. Read deeper evidence on a meaningful change or for acceptance. This procedure creates no automatic wakeup or extra monitoring chat.

## Private ledger and closure

Use ignored `.investigation-tools/workflow/` for the task/archive ledger, per-item handoffs, findings and evidence indexes. The directory is already covered by `.gitignore`; public policies contain the procedure, not personal data or full histories. Keep stable IDs and links to existing evidence rather than duplicating it. Each task entry records coordinator/task identities, authorization, baseline/current source, owner/writer state, model/reasoning/speed disclosure, last usage, review path and gates, cumulative passes, findings path, coverage, publication state, exact next action/destination and return condition. Mark unavailable fields explicitly.

Record archive eligibility separately from archive execution. An archive entry needs the exact task ID/title, accepted scope/commit/artifact, saved final handoff/evidence, reviewer and coordinator acceptance, publication status and evidence (or why not required), confirmed idle state, absence of pending scoped actions, authorization and actual recoverable archive outcome/reference. Preserve checkpointed tasks and their failures; do not archive them as completed. This is a manual ledger, not an enforcement engine.

The task remains the owning place for corrections while coordinator review/publication is pending. Return to SmartTube Coordinator for closure only after all pending scoped actions are resolved. Implementation finished, a commit, a passing count or a finished turn alone cannot establish closure. Missing mandatory review, requested installation, human input or authorized release verification blocks closure. A separately deferred enhancement or unrequested installation does not. Record that distinction explicitly; 0.3.0 normal-profile acceptance remains separately pending and is not a gate for this documentation task.

Coordinator archives only the exact task verified completed and idle, after inspecting saved evidence and required publication. No permanent deletion or worktree cleanup is included. Keep the coordinator open. If a tool fails or the state is uncertain, record archive pending and reconcile it before retrying; do not claim archival success from intent alone.

## Current normal-profile acceptance

### Default review environment

Routine testing and visual review use the installed Brave executable headlessly through Playwright, in an isolated workspace profile. This avoids desktop mouse/keyboard input and lets the human continue using their computer. `scripts/browser-test.mjs` uses controlled fixtures; `scripts/live-smoke.mjs` uses a public, signed-out live video. Both already use disposable profiles under `.local`; screenshots and reports go under ignored `test-results`. Preserve prior evidence before a rerun that overwrites those output names. Close only browser contexts owned by the test.

All test-owned Brave processes must launch with `--mute-audio`, including process restarts and ad hoc reviews. Both shipped test launchers now set it explicitly. Playback timing and controls can still be exercised without sound output. Do not change system volume or the human's personal browser audio settings to achieve silence.

The isolated fixture route was exercised again on 17 October 2026 for this background-review requirement: all 15 checks passed, including a restart of its own browser process. Native desktop automation was not used in that run. This does not resolve the normal-profile saved-speed failure.

A separate visible Brave window shares the Windows desktop and can still interrupt input. Headless review is the default; use the human's normal profile only for explicitly requested acceptance scenarios. Existing headless test profiles do not contain their other extensions or account. A future representative compatibility profile should install only selected public test extensions and reproduce explicit settings, without copying personal browser data. Its setup and compatibility are not established by the clean fixture pass.

### Existing normal-profile result

0.3.0 adds the user-selected appearance controls. The same one-owner, usage-aware procedure retained the failed fixture setup evidence, reran affected checks after the final popup fix, and verified the package. Ten local tests, 28 fixture outcomes and ten live two-extension checks passed; source identities and self-review are in [the appearance evidence record](APPEARANCE_FEATURES.md). No native desktop input, model changes, agents, schedulers or paid resources were used for this increment. Normal-profile acceptance remains pending after manual reload.

The selected speed failure is now addressed in 0.2.0 and verified in a fresh live two-extension profile. Playback features and limits are recorded in [the implementation and evidence map](ENHANCER_FEATURES.md). Acceptance of 0.2.0 in the human's normal profile awaits their manual extension/page reload; no native desktop input was used to deliver this update.

The developer preview has historical disposable-Brave and signed-out live-site evidence in VALIDATION.md. User-authorized installation and normal-profile UI checks were subsequently performed on 17 October 2026. Installation and the tested controls, persistence and navigation scenarios passed, while a saved-speed override after video reload failed. Normal-profile acceptance is partial; see [the scenario report](validation/normal-brave-2026-10-17.md). Earlier fixture results do not supersede this observed failure.

The normal-profile check should establish installation/enabled state, toolbar and popup operation, play/pause/seek/speed, settings and queue persistence, navigation behavior, existing Shields/extension interactions and any opt-in sponsor behavior actually exercised. Preserve existing protections and account state. Do not restart the human's whole browser without agreement; a full normal-profile process-restart check can remain unrun while other checks proceed.

## Workflow changes adopted

| Practice | Status | Benefit and quality condition |
| --- | --- | --- |
| Bounded work, one owner, concise evidence reads | Implemented in project guidance | Less duplicated context and work; full required evidence remains accessible |
| Usage checks and conservative checkpoint thresholds | Implemented in project guidance | Avoids paid overage and unfinished verification near exhaustion; no checks are removed |
| Validation reuse tied to unchanged inputs | Implemented in project guidance | Avoids redundant runs while invalidating affected evidence after real changes |
| Separate fixture, live-site and normal-profile coverage | Implemented in project guidance | Prevents broader acceptance claims than actual observations support |
| Reviewer identity and performed method | Implemented in project guidance | Makes self-review and genuinely independent review distinguishable |
| Coordinator, fresh scoped tasks and completion-based recoverable archive | Adopted manual procedure | Selected-source handoffs and verified closure; one writer, no automatic next feature or premature archive |
| Impact-based non-author review and bounded repair loop | Adopted manual procedure | Comprehensive first pass and at most two repair rounds; blockers and mandatory gates remain visible |
| Private task/finding/archive ledger and handoff template | Defined; filled per task | Preserves source, authority, review counts and exact next action without duplicating history |
| Shared quota daemon, automatic chat creation, schedulers and model changes | Deferred | Manual coordination adds no runtime infrastructure or setting changes |

Writing these rules establishes the intended procedure, not proof that all future work complies or that the application has passed a security audit.
