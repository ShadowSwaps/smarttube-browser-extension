# Bounded review policy

Adopted on 17 October 2026 for authorized SmartTube work. Apply with [the workflow](WORKFLOW.md) and [handoff template](TASK_HANDOFF_TEMPLATE.md). This is a manual procedure; it installs no routing, validation-selection or enforcement automation.

## Select the path before dispatch

| Path | Eligibility | Required acceptance |
| --- | --- | --- |
| Coordinator review | Contained, understood impact, clear preserved contracts and meaningful checks; all inherited gates permit it | Author implements, self-checks and repairs; coordinator who did not author the candidate examines the exact final diff, relevant dependencies and evidence |
| Separate review | Consequential credentials/account access, storage/recovery, permissions, updater/release trust, automated selection/reuse/skipping of validation; also complex shared changes or uncertain impact | A separately authorized non-author reviewer examines the candidate and evidence; coordinator inspects that review and results before accepting |

A small diff alone does not establish low impact. Record path and reason, implementation owner, reviewer and actual authorship before dispatch. A different chat label, reviewer title or model does not establish independence. If the coordinator authored a candidate portion, another non-author must accept that portion and its affected integration. This requirement also applies to consequential policy changes governing the listed boundaries. Reviewers do not gain implementation permission by reviewing; transfer writing only through an explicit stopped handoff and record authorship of any later edits.

Inherited roadmap, security, release, installation and specifically required review/model gates remain mandatory. This policy cannot downgrade them. If a required reviewer, authorization, setting or test is unavailable, record the unmet gate and stop acceptance. Scope growth or newly discovered impact can require the separate path; changing path does not reset the review count. No new chat, model override, paid resource or publication is authorized solely by a review recommendation.

## Freeze the review brief and findings

Before pass 1, save the work-item ID, authorized result, baseline and candidate identities, affected files, preserved behavior, acceptance checks, non-goals, chosen path and inherited gates. Keep the authoritative findings ledger under ignored `.investigation-tools/workflow/`, linked from the task record. Preserve earlier candidates, failures and decisions rather than replacing them.

Pass 1 is a comprehensive acceptance review of the candidate, its dependencies and evidence. Batch every supported actionable finding found in that pass before returning repairs to the owner. Each finding needs:

- A stable ID, file/location and affected candidate identity.
- A demonstrated or credible concrete failure and its evidence; the requirement or preserved contract it violates.
- Severity, blocking/nonblocking disposition, the bounded correction and verification needed to close it.
- Discovery pass, status, owner response, verification result and any reopen/dispute reason.

Use critical/high for trust, data loss or major behavior failures, medium for a material scoped requirement failure, and low for minor issues. A blocker is a supported failure of scoped acceptance, a preserved contract or a mandatory gate regardless of label; severity alone cannot excuse it. Style preferences, speculative refactors and new features are nonblocking backlog unless an explicit frozen requirement makes them necessary. Record duplicates against the existing ID without creating another repair demand. A closed finding reopens only with new evidence or changed relevant behavior, retained beside the earlier closure.

## Count and bound the loop

The default budget is **three review passes total**: pass 1 comprehensive review, then at most **two repair-and-verification rounds** (passes 2 and 3). A round is one batched owner repair delivery followed by review verification. Count against the work item across commits, chat changes, reviewer substitutions and ownership transfers. Author pre-review checks and tests are self-checks, not independent acceptance passes; an acceptance review cannot be relabeled a self-check to evade the limit. Keep a dated pass/round ledger with exact candidates and reviewers.

Follow-up passes verify the requested fixes, affected regressions and any new harm. They do not reopen unrelated scope or repeat a full wishlist. A new material blocker remains valid at any pass: record concrete evidence and why it is newly relevant or was missed earlier. Preserve its discovery history; do not suppress it to fit the budget. A correction that regresses earlier accepted behavior must be fixed or remain blocking.

If pass 3 leaves a blocker, a fix recurs without convergence, or the repair needs architectural/scope growth, stop the repair loop and checkpoint immediately. Record remaining failures, current source, evidence, consumed budget, options and the exact decision needed. Do not shop for a passing reviewer or auto-pass blockers. Do not continue to pass 4 or renew the budget without explicit human authorization for further bounded rounds. A changed reviewer inherits the ledger. Only the human may extend the initial review plus two repair-and-verification rounds; save the actual authorization, added limit, scope/design decision and cumulative prior passes before resuming. The coordinator cannot grant itself or a task any further review/repair budget, even through repeated scope decisions. It may resolve interpretation within frozen requirements or choose a checkpoint/backlog option within existing authority. Renaming, splitting or redesigning the same unresolved work cannot erase its blockers or counts. Changing human acceptance requirements also requires human authorization; mandatory gates stay pending until actually satisfied.

## Resolve disagreement once, then decide

For a disputed finding, the owner supplies one evidence-based response against the frozen requirement; the reviewer gives one reconciliation with sources and a disposition. This exchange stays within the current pass and cannot become an extra repair cycle. If still disputed, checkpoint for the coordinator/human decision with both positions. The coordinator can resolve interpretation within authorized scope, but cannot declare demonstrated unmet acceptance or a mandatory gate passed. Missing evidence means acceptance remains pending. Broader improvements go to backlog rather than extending the current debate.

## Accept and return

Accept only when scoped requirements and preserved behavior are evidenced on the final candidate, blockers are closed with verification, mandatory gates are satisfied, and the required non-author review actually occurred. Record reviewer identity/authorship, actual method, final source/artifact identities, checks, evidence reuse rationale and coverage limits. Self-review remains explicitly self-review. If a later change invalidates evidence, reopen the affected gate against that source; a previous pass is not acceptance of a new candidate.

Review acceptance grants no new push, merge, install or release authority. Keep authorized publication checks and required installation with the task until resolved. An unrequested installation or separately deferred enhancement is not a task blocker. Return and archive through the workflow only after distinguishing those cases. When scope is stopped rather than accepted, report it as checkpointed with pending work, never complete.
