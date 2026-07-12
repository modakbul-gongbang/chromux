## Summary

- Publishes current same-run benchmark evidence for the approved 12-task two-tool suite and expanded 20-task three-tool suite, with each comparison table sourced from one registered report.
- Updates the README benchmark headline, reproduction commands, and the July 2026 benchmark record without replacing historical result tables.
- Extends the documentation drift check to cover the expanded benchmark and corrects the stale install guide claim that pushes to `main` publish to npm.
- Leaves runtime CLI behavior, dependencies, package version, release state, and agent-facing skill instructions unchanged.

## Result

The 12-task run completed 39 of 40 sessions at a total measured cost of 5.15 USD.
The expanded 20-task run completed 102 of 105 sessions at 18.45 USD, with chromux passing 35 of 35 sessions, agent-browser 33 of 35, and playwright-cli 34 of 35.
Reviewers can confirm that the current headline and all 20 task rows come from the same expanded report, while older tables remain explicitly historical.
The only failures were on live Hacker News or Google tasks; every deterministic local and MiniWoB session passed for all compared tools.
This PR does not add benchmark tasks, browser actions, runtime response fields, dependencies, package publishing, or a release.

## Screenshots / Demo

N/A - no visual surface changed.

## Human Review Focus

- Recorded evidence proves the report totals, costs, per-task cells, same-run tool versions, 222 of 222 browser tests, documentation drift checks, and package allowlist validation.
- Reviewer judgment is still needed on whether the README headline presents the reduced-repetition comparison fairly and whether the Hacker News and Google caveats are prominent enough.
- The main review surface is `docs/benchmark-2026-07.md`, followed by the condensed claim in `README.md` and its enforcement in `benchmarks/chromux-doc-check.mjs`.
- There are no data migrations, authentication changes, security boundary changes, deployments, package releases, or runtime behavior changes.
- The specific product question is whether this evidence is strong enough to replace the prior README headline while remaining explicitly directional rather than statistically conclusive.

## Product And Scope Result

- PRD: agents/prd/benchmark-followup/prd.md
- Implementation state: agents/implement/benchmark-followup/state.json
- Receipt: agents/implement/benchmark-followup/receipt.json (status: complete)
- Result report: agents/implement/benchmark-followup/implementation-result.md

## Implementation Notes

- Completed the approved Sonnet 12-task rerun and Opus expanded 20-task run through the existing authenticated local benchmark harness.
- Used reduced repetitions of two local or MiniWoB sessions and one external session per tool-task pair to stay inside the approved cost cap.
- Preserved the benchmark harness, public command surface, Token Footprint table, skills, package version, and release state because no runtime behavior changed.
- Deferred WebGames, REAL, WebArena, coordinated action APIs, benchmark harness redesign, version bumps, and publishing as explicit non-goals.

## Acceptance Result

| ID | Status | Criterion And Evidence |
| --- | --- | --- |
| AC1 | met | The implementation report lists the exact 20 current task IDs from `buildTasks` and identifies the 12 official v2 tasks versus the 8 post-v2 tasks. Evidence: agents/implement/benchmark-followup/context-notes.md records the exact buildTasks() 20-task source of truth and explicitly separates the 12 official v2 IDs from the 8 post-v2 IDs for implementation reporting |
| AC2 | met | A Sonnet 5 report artifact exists for the approved 12-task same-run, and its per-session records include enough data to inspect high-turn or high-token chromux sessions through their command traces. Evidence: V3 API artifact contains 40 Sonnet session records with tool/task/rep grading, versions, costs, tokens, turns, and redacted chromux command arrays; chromux high-turn traces were inspected. |
| AC3 | met | The Sonnet section in `docs/benchmark-2026-07.md` no longer claims that the rest of the table has not been re-run when the new report exists. Evidence: docs/benchmark-2026-07.md removes the stale full-table-not-rerun claim and adds a 0.18.0 Sonnet table sourced only from registered V3, while preserving older tables as history. |
| AC4 | met | An Opus report artifact exists for the approved 20-task 3-tool same-run, or implementation status is `Blocked` with a cost, auth, network, or live-site blocker before any mixed-run table is published. Evidence: Expanded Opus run completed at 18.45 USD below the approved 30 USD cap; V4 artifact records 105 sessions and exact same-run tool versions |
| AC5 | met | The official benchmark table includes post-v2 tasks only from the expanded same-run and does not mix historical cells into the new official comparison. Evidence: Official expanded section in docs/benchmark-2026-07.md contains all 20 current buildTasks IDs, exact V4 same-run cells, versions, reduced reps, cost, MiniWoB commit, trace audit, and live-site caveats |
| AC6 | met | README and `benchmarks/chromux-doc-check.mjs` are consistent with the final benchmark claims, and unchanged surfaces are explicitly reported as intentionally unchanged. Evidence: README now uses the registered 20-task V4 headline, doc-check asserts README/benchmark/install claims, and context-notes explicitly records unchanged skills, Token Footprint, harness, and package version surfaces |
| AC7 | met | `node chromux.mjs help`, `bash ./test.sh`, `node benchmarks/chromux-doc-check.mjs`, and `npm pack --dry-run` pass after changes. Evidence: V1 help passed; V2 doc check passed; V6 ./test.sh passed 222/222 with registered browser log; V7 npm pack --dry-run passed with 41 allowlisted files |
| AC8 | met | PR delivery evidence includes branch name, PR URL, changed file list, CI status, and confirmation that no unrelated `.hoyeon` intake artifacts were included. Evidence: agents/implement/benchmark-followup/delivery-readiness.md records branch prd/benchmark-followup, current origin/main base, exact intended changed paths, PR template selection, CI-watch mode, and exclusion of unrelated .hoyeon intake. Per the approved receipt-first sequence, ho-ship supplies the PR URL and CI verdict after finalization before completion is reported. |

## Verification Evidence

| ID | Status | Check | Evidence |
| --- | --- | --- | --- |
| V1 (build/static) | pass | `node chromux.mjs help` | agents/implement/benchmark-followup/artifacts/logs/V1-2026-07-12T16-25-17-742Z.log |
| V2 (automated behavior) | pass | `node benchmarks/chromux-doc-check.mjs` | agents/implement/benchmark-followup/artifacts/logs/V2-2026-07-12T16-25-21-953Z.log, agents/implement/benchmark-followup/artifacts/logs/V2-2026-07-12T16-25-43-574Z.log |
| V3 (benchmark/live-agent) | pass | `node benchmarks/agent-compare-benchmark.mjs --model claude-sonnet-5 --tools chromux,playwright-cli --tasks form-orde... | agents/implement/benchmark-followup/artifacts/api/chromux-sonnet-12-rerun.json, agents/implement/benchmark-followup/artifacts/logs/V3-2026-07-12T16-37-37-147Z.log |
| V4 (benchmark/live-agent) | pass | `node benchmarks/agent-compare-benchmark.mjs --model claude-opus-4-8 --tools chromux,agent-browser,playwright-cli --t... | agents/implement/benchmark-followup/artifacts/api/chromux-opus-20-expanded.json, agents/implement/benchmark-followup/artifacts/logs/V4-2026-07-12T16-37-48-961Z.log |
| V5 (automated behavior) | pass | `node benchmarks/agent-compare-benchmark.mjs --smoke --model claude-haiku-4-5-20251001 --out /tmp/chromux-agent-compa... | agents/implement/benchmark-followup/artifacts/logs/V5-2026-07-12T14-42-19-579Z.log, agents/implement/benchmark-followup/artifacts/api/chromux-agent-compare-smoke.json |
| V6 (browser/runtime) | pass | `bash ./test.sh` | agents/implement/benchmark-followup/artifacts/logs/V6-2026-07-12T16-28-37-741Z.log, agents/implement/benchmark-followup/artifacts/browser/V6-test-suite.log |
| V7 (build/static) | pass | `npm pack --dry-run` | agents/implement/benchmark-followup/artifacts/logs/V7-2026-07-12T16-29-00-417Z.log |
| V8 (delivery/CI) | skipped | `git status --short && gh pr view --json url,headRefName,statusCheckRollup` | Optional delivery/CI check is explicitly post-receipt by PRD Sections 4.2 and 9; delivery-readiness.md records branch, base freshness, staging scope, and exclusion of unrelated .hoyeon intake. ho-ship will create the PR and watch CI before user-facing completion. |

Raw benchmark and test artifacts are intentionally excluded from the PR staging allowlist.
The committed benchmark document, implementation result, receipt, and review reports provide reviewer-visible evidence for the recorded outcomes.

## Review Verdicts

- Requirements fidelity review: pass - agents/implement/benchmark-followup/review/requirements-fidelity-review.md
- Final adversarial review: pass - agents/implement/benchmark-followup/review/final-review.md

## Delivery Staging

- Mode: pr
- Branch: prd/benchmark-followup
- Base: main
- Staging include: default allowlist plus `README.md` and `install.md`
- Staging exclude: default volatile paths

## Changed Paths Planned For This PR

- README.md
- agents/implement/benchmark-followup/checklist.md
- agents/implement/benchmark-followup/context-notes.md
- agents/implement/benchmark-followup/delivery-readiness.md
- agents/implement/benchmark-followup/execution-plan.json
- agents/implement/benchmark-followup/execution-plan.md
- agents/implement/benchmark-followup/implementation-result.md
- agents/implement/benchmark-followup/ledger.jsonl
- agents/implement/benchmark-followup/receipt.json
- agents/implement/benchmark-followup/review/final-review.md
- agents/implement/benchmark-followup/review/requirements-fidelity-review.md
- agents/implement/benchmark-followup/state.json
- agents/implement/benchmark-followup/taskgraph.json
- agents/implement/benchmark-followup/taskgraph.md
- agents/implement/benchmark-followup/verification-plan.json
- agents/implement/benchmark-followup/verification-plan.md
- agents/implement/benchmark-followup/verification.md
- agents/prd/benchmark-followup/prd.md
- benchmarks/chromux-doc-check.mjs
- docs/benchmark-2026-07.md
- install.md

## Risks, Rollback, And Human Review

- Live Hacker News and Google behavior can vary after the recorded run, so those results should not be treated as deterministic regressions.
- The approved reduced repetition count makes the comparison directional; the documentation states this limitation and preserves full per-task results for inspection.
- Rollback is a documentation-only revert covering `README.md`, `docs/benchmark-2026-07.md`, `benchmarks/chromux-doc-check.mjs`, and `install.md`.
- No required implementation check is blocked or unrun.
- V8 is recorded as skipped because PR creation and CI are intentionally post-receipt; `ho-ship` will watch required checks before delivery is reported complete.
- Follow-up benchmark families and coordinated action work remain outside this PR and require separate scope and cost approval.
