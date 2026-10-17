# Usage and quality workflow

Adopted for SmartTube Browser on 17 October 2026 at the human's request. These practices adapt the focused ownership of Building REA Companion, the source-bound acceptance of Calendar planning and coordination, and the evidence/usage discipline of GameVault Coordinator. Their project-specific permissions and automations are not transferred.

## Work cycle

1. Read the current request, repository state and relevant checkpoint. Define a bounded result, preserved behavior and acceptance scenarios.
2. Check available usage at the start and between substantial phases. Use existing tools without paid overage. Keep explanations concise without reducing verification depth.
3. Implement one coherent change with one checkout owner. Run the smallest meaningful checks and resolve demonstrated failures.
4. Inspect the assembled candidate and affected integrations. Reuse applicable evidence using source, artifact and environment identities; rerun only what changes or unresolved risks invalidate.
5. Review the final diff and results. Record the reviewer and actual method, including whether review was self-review. Escalate consequential boundaries to independent review when authorized and available.
6. Record actual outcomes, remaining work and next action. Publish only within applicable human authorization. A successful build does not automatically complete a feature or its installation.

At 10% or less available usage, assess the full remaining work against a 4% floor. If finishing with all checks above that floor is uncertain, preserve a checkpoint and stop substantive work. At or below 4%, checkpoint and stop. This policy creates no automation and changes no other chat's state.

## Evidence and acceptance

| Record | Required contents |
| --- | --- |
| Change brief | Intended behavior, preserved behavior, affected components, stopping boundary |
| Test result | Candidate identity, scenario/command, relevant configuration/environment, exit/outcome, evidence location |
| Review | Reviewer identity, independence or self-review, performed method, findings and disposition |
| Release | Exact source and artifact identities, relevant accepted checks, authorization, verified publication result |
| Installation | Normal or disposable profile, installed source/version, observed behavior, conflicts and unperformed cases |

Use distinct coverage labels: implemented; verified under fixtures; verified on a live site; accepted in the normal profile; partially verified; failed; or unrun. Test totals support a stated scope, not a claim of universal compatibility. Preserve historical failures and source comparisons. Do not silently replace an earlier source baseline to make a check pass.

## Context and ownership

Search and read selected evidence first. Summarize large tool results before bringing them into active context, while retaining the full evidence for necessary deeper review. Batch independent reads; keep edits, approvals and dependent acceptance steps sequential.

Use short checkpoints with source/evidence links and exact remaining work. Fresh chats or independent reviewers require applicable authorization; no duplicate workers, full-history forks, polling loops or scheduler are introduced by this workflow. Preserve this chat's isolated graph.

## Current normal-profile acceptance

### Default review environment

Routine testing and visual review use the installed Brave executable headlessly through Playwright, in an isolated workspace profile. This avoids desktop mouse/keyboard input and lets the human continue using their computer. `scripts/browser-test.mjs` uses controlled fixtures; `scripts/live-smoke.mjs` uses a public, signed-out live video. Both already use disposable profiles under `.local`; screenshots and reports go under ignored `test-results`. Preserve prior evidence before a rerun that overwrites those output names. Close only browser contexts owned by the test.

All test-owned Brave processes must launch with `--mute-audio`, including process restarts and ad hoc reviews. Both shipped test launchers now set it explicitly. Playback timing and controls can still be exercised without sound output. Do not change system volume or the human's personal browser audio settings to achieve silence.

The isolated fixture route was exercised again on 17 October 2026 for this background-review requirement: all 15 checks passed, including a restart of its own browser process. Native desktop automation was not used in that run. This does not resolve the normal-profile saved-speed failure.

A separate visible Brave window shares the Windows desktop and can still interrupt input. Headless review is the default; use the human's normal profile only for explicitly requested acceptance scenarios. Existing headless test profiles do not contain their other extensions or account. A future representative compatibility profile should install only selected public test extensions and reproduce explicit settings, without copying personal browser data. Its setup and compatibility are not established by the clean fixture pass.

### Existing normal-profile result

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
| Shared quota daemon, automatic chats, schedulers and model changes | Deferred | No need or authorization for additional coordination infrastructure |

Writing these rules establishes the intended procedure, not proof that all future work complies or that the application has passed a security audit.
