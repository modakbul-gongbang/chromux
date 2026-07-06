---
topic: "chromux-dominant-browser-automation"
status: "ready"
human_approval: "approved"
source_intake: "current conversation"
source_clarity: "none"
created_at: "2026-07-06"
updated_at: "2026-07-06"
---

# PRD: Chromux Dominant Browser Automation

## 1. Summary

`chromux` should evolve from a strong real-Chrome CLI into a dominant browser automation tool for agents by making common browser work faster, more predictable, better instrumented, and safer under parallel load.
The product direction is not to add many top-level verbs.
The direction is to strengthen the existing raw-CDP daemon, `run`, `batch`, crawl mode, activity layer, built-in snippets, status app, and verification suite so agents can complete browser work with fewer round trips and clearer proof.

Approval checklist:

- Approve the scope boundary in Section 3: performance, optimal operation, reliability, observability, and agent ergonomics are in scope; Playwright/Puppeteer replacement and broad new browser engines are not.
- Approve the technical structure in Section 5: keep zero runtime dependencies and raw CDP, while adding local benchmark, receipt, scheduler, and snippet infrastructure.
- Approve the requirement set in Section 6: fast-path orchestration, adaptive crawl execution, richer readiness, observability and replay, profile/resource governance, reusable extraction primitives, and benchmark gates.
- Approve the verification modes in Section 9: static/package checks, automated behavior tests, real browser runtime checks, performance benchmark checks, documentation review, and optional PR/CI delivery proof.
- Approve the delivery boundary in Sections 4 and 9: future implementation should follow `.hoyeon/config.json` PR delivery defaults only after explicit implementation approval; this PRD does not open a branch or PR.
- Approve the privacy boundary in Sections 10 and 11: local receipts and activity traces must redact secrets and avoid storing raw typed text or inline code beyond existing safe policies.

## 2. Problem, Goal, And Users

AI agents need a browser automation surface that uses the user's real Chrome, preserves login state, avoids bundled-browser detection, and can operate many tabs without collapsing into slow manual loops.
`chromux` already has the right foundation: real Chrome, isolated profiles, raw CDP, background tabs, human-like interaction primitives, crawl mode, local activity logs, and broad browser tests.
The remaining gap is that excellent behavior still depends too much on agent discipline.
An agent must know when to use `run` instead of many separate calls, when to use `batch`, when to inspect console or network, when to close or pause sessions, and how to prove that a flow really completed.

The goal is to make the best path the default path.
For interactive QA, the tool should bundle action, readiness, diagnostics, and evidence into fewer reliable operations.
For crawling and broad page collection, the tool should schedule work adaptively, respect resource limits, retry only when useful, and report meaningful throughput and failure causes.
For maintenance, every performance or behavior claim should have benchmark and browser-runtime proof.

Primary users:

- AI agents using `chromux` for logged-in browser work, product QA, scraping, research, and runtime verification.
- Maintainers reviewing whether the CLI remains small, zero-dependency, raw-CDP-based, package-safe, and cross-platform.
- Downstream project owners who need browser evidence they can trust without switching to Playwright or a separate Chromium runtime.

## 3. Scope And Non-Goals

In scope:

- Define a performance and reliability roadmap for making `chromux` a dominant Chrome automation tool.
- Reduce agent round trips for common browser workflows by promoting bundled `run` patterns, reusable snippets, and structured receipts.
- Improve crawl and batch execution with adaptive scheduling, bounded retry, domain backoff, host budgets, and richer per-item outputs.
- Improve readiness and action verification beyond simple load, text, and selector checks.
- Add local observability artifacts for browser work, including timing, diagnostics, resource state, and replay hints.
- Expand profile and resource governance so slow, locked, stale, paused, overloaded, and unresponsive states are diagnosable.
- Establish benchmark gates for cold start, warm open, `run`, snapshot, interaction, and batch throughput.
- Update README, install instructions, skills, and tests to teach the fastest safe path.
- Preserve package allowlist safety and avoid publishing `.hoyeon` planning artifacts.

Non-goals:

- Do not replace raw CDP with Playwright, Puppeteer, Selenium, or another browser automation runtime.
- Do not add runtime npm dependencies unless a separate PRD explicitly approves the tradeoff.
- Do not support Firefox, Safari, Edge, or Chromium variants as part of this roadmap.
- Do not add a broad plugin system, remote browser service, cloud queue, or account system.
- Do not read Chrome History, cookies, passwords, or unrelated user browsing data.
- Do not turn `chromux` into a generic test framework.
- Do not add a large set of new public CLI verbs before proving that `run`, `batch`, snippets, and daemon internals cannot cover the use case.
- Do not manually publish from the local machine.

## 4. Pre-Work And Required Decisions

### 4.1 Pre-Work Before Implementation

- Inspect `git status --short` and keep unrelated existing `.hoyeon` artifacts out of any future branch or PR.
- Read current `AGENTS.md`, `README.md`, `install.md`, `skills/chromux/SKILL.md`, `skills/chromux-work/SKILL.md`, `package.json`, `test.sh`, and relevant `chromux.mjs` daemon, `run`, `batch`, activity, and status-app sections.
- Read `.hoyeon/prd/human-like-browser-work/prd.md` and treat it as prior interaction-fidelity work rather than duplicated scope.
- Read `.hoyeon/prd/cli-command-registry-refactor/prd.md` if command routing changes are needed.
- Capture a current benchmark baseline on the local machine before optimizing behavior.
- Confirm Google Chrome is available locally for browser/runtime verification.
- Confirm whether the future implementation is allowed to create a branch and PR using `.hoyeon/config.json` defaults.

### 4.2 Human Decisions Before PRD Approval

- Approve this roadmap as a multi-session product and architecture improvement rather than a one-command feature request.
- Approve keeping visible command-surface growth conservative.
- Approve deriving concrete performance budgets from a baseline benchmark harness instead of inventing fixed numbers before measurement.
- Approve storing local run receipts and benchmark artifacts under `CHROMUX_HOME` or implementation artifact directories, with secret and text-entry redaction.
- Approve future implementation delivery mode: PR delivery by default per `.hoyeon/config.json`, with branch creation, PR creation, and CI watch only after explicit implementation approval.
- Approve that exact prioritization among QA, crawling, and observability can be adjusted during implementation only if all approved requirements remain covered.

### 4.3 Decision Traceability For Fidelity Review

- User goal: "압도적인 크롬 브라우저 자동화" with performance and optimal behavior emphasis | represented by R1-R8, AC1-AC16, T1-T8, V1-V6.
- Repo rule: keep the public command surface small and prefer `run` or `cdp` before new top-level verbs | represented by Scope, R1, R6, T2, T7, and Guardrails.
- Existing current capability: real Chrome, raw CDP, crawl mode, `batch`, human-like interaction primitives, activity log, and status app already exist | represented by Context Notes and by non-duplication in Scope.
- Existing related work: `human-like-browser-work` already covers click, fill, type, press, waits, and target validation | represented by Pre-Work and Non-goals against duplicating that scope.
- Delivery default: `.hoyeon/config.json` says PR delivery with CI watch is the repo default | represented by Human Decisions, V6, and the Result Report Contract.
- Deferred decision: any new top-level public command beyond a proven need | represented by Human Decisions, Risks, and Guardrails.

## 5. Major Technical Structure Changes

- Keep the single zero-dependency Node.js CLI and raw CDP architecture.
- Keep one daemon per profile and the current localhost TCP daemon transport.
- Add a repo-owned benchmark harness that can measure cold start, daemon warm path, open, run, snapshot, interaction, and batch behavior against local deterministic fixtures.
- Add a structured browser-work receipt model for selected flows, including step timings, URL/title state, readiness proof, console/network deltas when enabled, resource snapshots, and replay hints.
- Extend crawl and batch internals toward adaptive scheduling with bounded retry, host-level backoff, queue telemetry, worker health, and per-item failure classification.
- Extend readiness and action helpers inside `run` or internal daemon routes so common flows can wait on navigation, DOM state, network quiet, visible selectors, text, and app-specific assertions without hand-written sleeps.
- Extend local activity/status data enough to expose performance and failure summaries without reading Chrome History.
- Expand built-in runner snippets under `snippets/_builtin/` for common extraction, readiness, infinite-scroll, form-flow, and diagnostic patterns.
- Update docs and skills so agents learn the fast path and verification path directly.
- Do not introduce DB, external service, auth, billing, cloud queue, or production-data structure changes.

## 6. Requirements

- R1. Fast-path orchestration. Common browser tasks must be expressible as one bounded `run`, `batch`, or snippet-backed operation rather than many separate CLI round trips, and docs must make that path obvious.
- R2. Adaptive crawl execution. Large URL work must use worker reuse, bounded retry, domain backoff, resource-aware queueing, and per-item failure classification so throughput improves without runaway Chrome resource growth.
- R3. Rich readiness model. Browser work must prove page readiness through observable state such as load, DOM readiness, visible selectors, visible text, network or console diagnostics when enabled, and explicit page assertions.
- R4. Action receipt and replay evidence. Important browser operations must be able to produce a structured local receipt with timings, state transitions, diagnostics, and enough replay hints to debug failures.
- R5. Profile and resource governance. Profile lifecycle, stale locks, daemon health, paused state, queue saturation, renderer growth, RSS growth, and unresponsive sessions must be explainable through CLI/status-app evidence.
- R6. Reusable extraction primitives. Common collection patterns must be captured as built-in snippets or documented `run` recipes with clear input, output, timeout, and validation contracts.
- R7. Performance benchmark gates. The repo must define repeatable local benchmarks and thresholds or baseline comparison rules for the key automation paths.
- R8. Release and documentation hygiene. The help output, README, install docs, skills, tests, package allowlist, and release policy must stay aligned with behavior changes.

## 7. Acceptance Criteria

- AC1. A documented benchmark run reports cold launch, warm daemon command, open, `run`, snapshot full, snapshot interactive, click/fill/wait flow, and batch p50/p95 timings.
- AC2. The benchmark harness uses deterministic local fixtures for required pass/fail gates and may use optional external pages only as non-required exploratory evidence.
- AC3. A representative multi-step QA flow can run with a single bundled operation or snippet and returns both result data and step-level timing evidence.
- AC4. A representative large URL queue runs through a bounded worker pool with worker reuse, per-item duration, retry classification, final URL/title/html/text metadata, and failure reason classification.
- AC5. Crawl execution backs off or fails clearly when profile queue, renderer, process, RSS, host error rate, or timeout policies are exceeded.
- AC6. Readiness helpers can wait for visible text, visible selector, DOM assertion, navigation completion, and a bounded quiet or settled condition without unbounded sleeps.
- AC7. Failed readiness reports include the waited condition, timeout budget, last known URL/title, and relevant console or network failure summary when capture was enabled.
- AC8. Structured receipts redact raw typed text, inline code, tokens, cookies, authorization headers, and secrets while preserving enough metadata to debug.
- AC9. Profile diagnosis evidence can distinguish running, locked, stale daemon, paused, queue full, resource guarded, unresponsive session, and Chrome CDP unreachable states.
- AC10. The status app or CLI-readable status output exposes recent task duration, failure counts, resource guard events, and cleanup candidates.
- AC11. Built-in snippets cover at least infinite scroll, structured page extraction, form flow with readiness, network-error collection, and page assertion.
- AC12. New snippets are tested against local fixtures and documented as runner material, not as new public commands.
- AC13. `node chromux.mjs help` remains the source of truth and does not expose deprecated compatibility aliases as primary help entries.
- AC14. `./test.sh` or a focused automated suite covers scheduler, readiness, receipt redaction, snippet contracts, and diagnosis behavior.
- AC15. `npm pack --dry-run` confirms package contents stay inside the `package.json` allowlist and no planning artifacts are published.
- AC16. Future PR delivery, if approved, provides a PR URL, reviewable result summary, and CI status without staging unrelated local artifacts.

## 8. PRD-Level Tasks

- T1. Establish benchmark harness and baseline budgets. Covers R7, R8, AC1, AC2, AC14, AC15.
- T2. Design and implement fast-path orchestration patterns using `run`, snippets, and existing daemon routes before proposing new public commands. Covers R1, R3, R6, AC3, AC6, AC11, AC12, AC13.
- T3. Upgrade `batch` and crawl-mode scheduling with adaptive worker reuse, retry classification, domain backoff, queue telemetry, and failure taxonomy. Covers R2, R5, AC4, AC5, AC9, AC10.
- T4. Add richer readiness and action evidence so common flows prove final state without fragile sleeps or extra agent round trips. Covers R1, R3, R4, AC3, AC6, AC7, AC8.
- T5. Add structured receipt and replay-hint artifacts with privacy-preserving redaction. Covers R4, R8, AC7, AC8, AC10, AC14.
- T6. Strengthen profile and resource diagnosis across CLI, daemon health, status app, and activity data. Covers R5, AC5, AC9, AC10.
- T7. Expand built-in snippets and skill guidance for extraction, infinite scroll, form flow, diagnostics, and assertion patterns. Covers R1, R6, R8, AC11, AC12, AC13.
- T8. Complete verification, documentation, package, and optional PR delivery hygiene. Covers R8, AC13, AC14, AC15, AC16.

## 9. Verification Contract

### 9.1 Test Mode Contract

| Mode | Required For Done | Covers | Human Decision |
| --- | --- | --- | --- |
| build/static | yes | CLI syntax, help surface, package allowlist, docs consistency | approve any public command-surface change |
| automated behavior | yes | scheduler, readiness, receipts, snippets, diagnosis, redaction regressions | none |
| browser/runtime | yes | real Chrome behavior for QA, crawl, profile lifecycle, diagnostics | final confidence that behavior is Chrome-real |
| performance benchmark | yes | cold/warm command latency, batch throughput, resource budgets | approve baseline-derived budget method |
| documentation review | yes | README, install, skills, and orchestration guidance | approve agent-facing workflow framing |
| delivery/CI | no/blockable | future PR URL, branch diff, and CI status if implementation is shipped | PR creation and CI spend require explicit implementation approval |

### 9.2 Required Agent Verification

| ID | Mode | Covers | Method | Artifact | Pass Intent | Required For Done | Can Be Blocked | Safe Probe | Sensitive Data Policy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V1 | build/static | R8, AC13, AC15, T8 | `node --check chromux.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run` | command-log | Static checks, `node chromux.mjs help`, and `npm pack --dry-run` prove the CLI, help surface, and package surface remain coherent | yes | no | local only | no secrets or browser profile data required |
| V2 | automated behavior | R2-R6, AC4-AC12, AC14, T3-T7 | `bash ./test.sh` | command-log | Automated tests prove adaptive scheduling, readiness helpers, receipt redaction, diagnosis states, and snippet contracts against deterministic fixtures | yes | no | local Chrome fixtures only | isolated `CHROMUX_HOME`; no raw typed text, tokens, cookies, or inline code stored |
| V3 | browser/runtime | R1-R6, AC3-AC10, T2-T6 | `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json` | command-log plus benchmark JSON file under `.hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/` | Real Chrome smoke flows prove bundled QA, crawl worker reuse, profile recovery, watch diagnostics, and cleanup behavior in an isolated `CHROMUX_HOME` using benchmark-owned local fixtures | yes | no | deterministic localhost fixture server started and stopped by benchmark harness | isolated temporary profile; benchmark artifacts must redact text entry and inline runner code |
| V4 | performance benchmark | R1, R2, R5, R7, AC1, AC2, AC4, AC5, T1, T3 | `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json` | benchmark JSON file and command-log under `.hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/` | Benchmark artifacts report p50/p95 latency, throughput, retry/failure classification, and resource snapshots against baseline-derived budgets | yes | no | deterministic localhost fixture server only | isolated temporary profile; no production pages or user data |
| V5 | documentation review | R1, R6, R8, AC11-AC13, T7, T8 | `node benchmarks/chromux-doc-check.mjs` | command-log | README, install docs, `skills/chromux`, and `skills/chromux-work` teach the fastest safe path and match `chromux help` | yes | no | local file and help-output inspection only | no secrets or browser profile data required |
| V6 | delivery/CI | AC16, T8 | `node ~/.codex/skills/prd-ship/scripts/prd_ship.js status --state .hoyeon/implement/chromux-dominant-browser-automation/state.json` | api-log or command-log | If implementation delivery is approved, branch, PR URL, diff scope, and CI result prove the change is reviewable and unrelated artifacts are excluded | no | yes | GitHub metadata only after explicit ship request | PR body and logs must not include local secrets, cookies, tokens, or unpushed `/Users/...` visual artifact paths |

### 9.3 Human Verification

- Human reviewer must approve this roadmap scope before `prd-implement` can run.
- Human reviewer must approve any new visible public CLI command proposed during implementation.
- Human reviewer must judge whether the benchmark-derived performance budgets are meaningful for the repo's real use.
- Human reviewer must approve PR delivery before branch creation, PR creation, and CI watch if implementation is requested.
- Human reviewer should inspect the final result report for product prioritization across QA, crawling, and observability.

## 10. Risks And Open Decisions

- Risk: optimizing for crawl throughput could weaken human-like QA behavior.
Mitigation: keep default mode compatibility-oriented and keep crawl policies scoped to `CHROMUX_MODE=crawl`.
- Risk: receipts and traces could expose sensitive user data.
Mitigation: redact raw typed text, inline code, cookies, tokens, authorization headers, and private values by default.
- Risk: benchmark gates can become flaky across machines.
Mitigation: use deterministic local fixtures, median or p95 over multiple runs, baseline-derived budgets, and explicit rerun rules.
- Risk: adaptive retry can amplify traffic to fragile sites.
Mitigation: use host budgets, bounded retry counts, backoff, pause/resume, and clear safe-probe rules.
- Risk: adding new public verbs would violate the repo's small-surface principle.
Mitigation: prove a use case cannot be handled through `run`, `batch`, `cdp`, snippets, or existing commands before asking for a new verb.
- Deferred: exact public command names, if any, are not approved by this PRD.
- Deferred: remote or cloud browser orchestration is out of scope.
- Open decision: none blocking before PRD approval because the approval checklist covers the required human decisions.

## 11. Implementation Guardrails

- Do not add runtime dependencies without a separate explicit approval.
- Do not replace raw CDP with Playwright, Puppeteer, Selenium, or another automation runtime.
- Do not expand to non-Chrome browsers.
- Do not add new top-level public commands unless implementation proves existing surfaces cannot cover the use case and the user approves the command.
- Do not read Chrome History, cookies, passwords, or unrelated browsing data.
- Do not store raw typed text, inline `run` code, secrets, tokens, cookies, or authorization headers in receipts.
- Do not make crawl mode the default for normal QA or login flows.
- Do not silently weaken default-mode browser compatibility for crawl performance.
- Do not publish manually from the local machine.
- Do not stage unrelated `.hoyeon` artifacts or local planning files in future PR delivery.

## 12. Implementation Result Report Contract

The implementation report must include:

- Status: `Done`, `Partially Done`, or `Blocked`.
- User-visible changes in browser automation capability.
- Major changed CLI, daemon, activity, status app, snippet, docs, and test surfaces.
- Whether the approved zero-dependency raw-CDP structure was followed.
- Task completion status for T1-T8.
- R/AC/V coverage.
- Verification evidence grouped by build/static, automated behavior, browser/runtime, performance benchmark, documentation review, and delivery/CI when applicable.
- Benchmark artifacts with baseline, p50/p95, resource snapshots, and budget interpretation.
- Automated tests added or updated, including the regression risk each protects.
- Browser/runtime evidence from real Chrome with isolated `CHROMUX_HOME`.
- Privacy and redaction evidence for receipts and activity outputs.
- Delivery evidence when PR delivery is approved: branch, PR URL, diff scope, CI status, retry attempts, and blocked state if any.
- Deviations from this PRD.
- Remaining human review items.
- Not-done items and follow-up candidates.
