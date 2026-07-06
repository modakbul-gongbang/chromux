# Verification Plan: chromux-dominant-browser-automation

- Status: ready
- Generated: 2026-07-06T02:44:49.574Z
- PRD: .hoyeon/prd/chromux-dominant-browser-automation/prd.md

## Environment

- Package manager: npm
- Browser tool: chromux
- Server strategy: no dev server script detected
- Service strategy: use repo-local dev/test commands; ask if services are required
- DB strategy: no DB surface detected

## Test Mode Contract

- build/static: required=yes; blockable=no; covers=CLI syntax, help surface, package allowlist, docs consistency; human=approve any public command-surface change
- automated behavior: required=yes; blockable=no; covers=scheduler, readiness, receipts, snippets, diagnosis, redaction regressions; human=none
- browser/runtime: required=yes; blockable=no; covers=real Chrome behavior for QA, crawl, profile lifecycle, diagnostics; human=final confidence that behavior is Chrome-real
- performance benchmark: required=yes; blockable=no; covers=cold/warm command latency, batch throughput, resource budgets; human=approve baseline-derived budget method
- documentation review: required=yes; blockable=no; covers=README, install, skills, and orchestration guidance; human=approve agent-facing workflow framing
- delivery/CI: required=no; blockable=yes; covers=future PR URL, branch diff, and CI status if implementation is shipped; human=PR creation and CI spend require explicit implementation approval

## Checks

### VP1. V1 - command

- Level: General
- Source: verification_matrix
- Test mode: build/static
- Tool: verify-run
- Command: `node --check chromux.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run`
- Covers: R: R8; AC: AC13, AC15; T: T8
- Artifacts: command-log
- Pass criteria: Static checks, `node chromux.mjs help`, and `npm pack --dry-run` prove the CLI, help surface, and package surface remain coherent
- Required for done: yes
- Can be blocked: no
- Contract method: `node --check chromux.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run`
- Contract artifact: command-log
- Safe probe: local only
- Sensitive data policy: no secrets or browser profile data required
- Status: planned

### VP2. V2 - automated

- Level: General
- Source: verification_matrix
- Test mode: automated behavior
- Tool: verify-run
- Command: `bash ./test.sh`
- Covers: R: R2, R3, R4, R5, R6; AC: AC4, AC5, AC6, AC7, AC8, AC9, AC10, AC11, AC12, AC14; T: T3, T4, T5, T6, T7
- Artifacts: command-log
- Pass criteria: Automated tests prove adaptive scheduling, readiness helpers, receipt redaction, diagnosis states, and snippet contracts against deterministic fixtures
- Required for done: yes
- Can be blocked: no
- Contract method: `bash ./test.sh`
- Contract artifact: command-log
- Safe probe: local Chrome fixtures only
- Sensitive data policy: isolated `CHROMUX_HOME`; no raw typed text, tokens, cookies, or inline code stored
- Status: planned

### VP3. V3 - command

- Level: General
- Source: verification_matrix
- Test mode: browser/runtime
- Tool: verify-run
- Command: `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json`
- Covers: R: R1, R2, R3, R4, R5, R6; AC: AC3, AC4, AC5, AC6, AC7, AC8, AC9, AC10; T: T2, T3, T4, T5, T6
- Artifacts: command-log, dom-log, screenshot, console-log
- Pass criteria: Real Chrome smoke flows prove bundled QA, crawl worker reuse, profile recovery, watch diagnostics, and cleanup behavior in an isolated `CHROMUX_HOME` using benchmark-owned local fixtures
- Required for done: yes
- Can be blocked: no
- Contract method: `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json`
- Contract artifact: command-log plus benchmark JSON file under `.hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/`
- Safe probe: deterministic localhost fixture server started and stopped by benchmark harness
- Sensitive data policy: isolated temporary profile; benchmark artifacts must redact text entry and inline runner code
- Status: planned

### VP4. V4 - command

- Level: General
- Source: verification_matrix
- Test mode: performance benchmark
- Tool: verify-run
- Command: `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json`
- Covers: R: R1, R2, R5, R7; AC: AC1, AC2, AC4, AC5; T: T1, T3
- Artifacts: command-log, dom-log
- Pass criteria: Benchmark artifacts report p50/p95 latency, throughput, retry/failure classification, and resource snapshots against baseline-derived budgets
- Required for done: yes
- Can be blocked: no
- Contract method: `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json`
- Contract artifact: benchmark JSON file and command-log under `.hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/`
- Safe probe: deterministic localhost fixture server only
- Sensitive data policy: isolated temporary profile; no production pages or user data
- Status: planned

### VP5. V5 - command

- Level: General
- Source: verification_matrix
- Test mode: documentation review
- Tool: verify-run
- Command: `node benchmarks/chromux-doc-check.mjs`
- Covers: R: R1, R6, R8; AC: AC11, AC12, AC13; T: T7, T8
- Artifacts: command-log
- Pass criteria: README, install docs, `skills/chromux`, and `skills/chromux-work` teach the fastest safe path and match `chromux help`
- Required for done: yes
- Can be blocked: no
- Contract method: `node benchmarks/chromux-doc-check.mjs`
- Contract artifact: command-log
- Safe probe: local file and help-output inspection only
- Sensitive data policy: no secrets or browser profile data required
- Status: planned

### VP6. V6 - command

- Level: General
- Source: verification_matrix
- Test mode: delivery/CI
- Tool: verify-run
- Command: `node ~/.codex/skills/prd-ship/scripts/prd_ship.js status --state .hoyeon/implement/chromux-dominant-browser-automation/state.json`
- Covers: AC: AC16; T: T8
- Artifacts: command-log, dom-log, api-log
- Pass criteria: If implementation delivery is approved, branch, PR URL, diff scope, and CI result prove the change is reviewable and unrelated artifacts are excluded
- Required for done: no
- Can be blocked: yes
- Contract method: `node ~/.codex/skills/prd-ship/scripts/prd_ship.js status --state .hoyeon/implement/chromux-dominant-browser-automation/state.json`
- Contract artifact: api-log or command-log
- Safe probe: GitHub metadata only after explicit ship request
- Sensitive data policy: PR body and logs must not include local secrets, cookies, tokens, or unpushed `/Users/...` visual artifact paths
- Status: planned

## Acceptance Coverage

- AC1: covered (VP4) - A documented benchmark run reports cold launch, warm daemon command, open, `run`, snapshot full, snapshot interactive...
- AC2: covered (VP4) - The benchmark harness uses deterministic local fixtures for required pass/fail gates and may use optional external pa...
- AC3: covered (VP3) - A representative multi-step QA flow can run with a single bundled operation or snippet and returns both result data a...
- AC4: covered (VP2, VP3, VP4) - A representative large URL queue runs through a bounded worker pool with worker reuse, per-item duration, retry class...
- AC5: covered (VP2, VP3, VP4) - Crawl execution backs off or fails clearly when profile queue, renderer, process, RSS, host error rate, or timeout po...
- AC6: covered (VP2, VP3) - Readiness helpers can wait for visible text, visible selector, DOM assertion, navigation completion, and a bounded qu...
- AC7: covered (VP2, VP3) - Failed readiness reports include the waited condition, timeout budget, last known URL/title, and relevant console or ...
- AC8: covered (VP2, VP3) - Structured receipts redact raw typed text, inline code, tokens, cookies, authorization headers, and secrets while pre...
- AC9: covered (VP2, VP3) - Profile diagnosis evidence can distinguish running, locked, stale daemon, paused, queue full, resource guarded, unres...
- AC10: covered (VP2, VP3) - The status app or CLI-readable status output exposes recent task duration, failure counts, resource guard events, and...
- AC11: covered (VP2, VP5) - Built-in snippets cover at least infinite scroll, structured page extraction, form flow with readiness, network-error...
- AC12: covered (VP2, VP5) - New snippets are tested against local fixtures and documented as runner material, not as new public commands.
- AC13: covered (VP1, VP5) - `node chromux.mjs help` remains the source of truth and does not expose deprecated compatibility aliases as primary h...
- AC14: covered (VP2) - `./test.sh` or a focused automated suite covers scheduler, readiness, receipt redaction, snippet contracts, and diagn...
- AC15: covered (VP1) - `npm pack --dry-run` confirms package contents stay inside the `package.json` allowlist and no planning artifacts are...
- AC16: covered (VP6) - Future PR delivery, if approved, provides a PR URL, reviewable result summary, and CI status without staging unrelate...

## Gaps

- None
