## Summary

- Adds a deterministic local benchmark harness for cold launch, warm `ps --json`, open, `run`, snapshots, form interaction, and batch p50/p95 timing.
- Extends `run` with `waitFor`, `assertPage`, richer page helpers, and `--receipt` JSON artifacts that redact inline code, typed text, secrets, and URL query/hash values.
- Upgrades `batch` with bounded retries, host backoff, worker reuse telemetry, per-item attempts, failure kinds, p50/p95, and host state.
- Adds `ps --json` and daemon health gate telemetry for profile/resource diagnosis.
- Adds built-in runner snippets for page extraction, form flow, network-error collection, and page assertion, with README/install/skill/CI/test coverage.
- Bumps `@team-attention/chromux` to `0.11.0` for the publish-on-main workflow.

## Result

Agents now get a faster default path for real-Chrome work: fewer CLI round trips for QA flows, crawl batches with clearer failure telemetry, safer local receipts, and benchmark evidence for performance-sensitive behavior.
Reviewers can confirm the public command surface stays small by checking `node chromux.mjs help`: the change strengthens `run`, `batch`, snippets, and diagnostics rather than adding a broad new verb set.
This does not add Playwright, Puppeteer, new runtime dependencies, non-Chrome browser support, cloud queues, or manual local publishing.

## Human Review Focus

Already proven by recorded evidence: V1-V5 pass, `./test.sh` reports 118 passed and 0 failed, the benchmark uses localhost fixtures, `npm pack --dry-run` stays inside the package allowlist, snippets compile, and docs pass `benchmarks/chromux-doc-check.mjs`.
Security/privacy focus: review `chromux.mjs` receipt redaction, especially `redactReceiptValue` and `redactReceiptUrl`, because receipts intentionally preserve debuggable metadata while hashing raw text and URL query values.
Product judgment still needed: whether the benchmark metrics and snippet names are the right baseline for calling this the "fast path" for agents.
Release judgment still needed: this bumps `package.json` to `0.11.0`; the repo workflow publishes on merge to `main` if the version is new.

## Product And Scope Result

- PRD: .hoyeon/prd/chromux-dominant-browser-automation/prd.md
- Implementation state: .hoyeon/implement/chromux-dominant-browser-automation/state.json
- Receipt: .hoyeon/implement/chromux-dominant-browser-automation/receipt.json (status: complete)
- Result report: .hoyeon/implement/chromux-dominant-browser-automation/implementation-result.md

## Acceptance Result

| ID | Status | Criterion And Evidence |
| --- | --- | --- |
| AC1 | met | A documented benchmark run reports cold launch, warm daemon command, open, `run`, snapshot full, snapshot interactive, click/fill/wait flow, and batch p50/p95 timings. Evidence: V4 benchmark.json records coldLaunchMs, warm ps, open, run extraction, full and interactive snapshots, interaction flow, and batch p50/p95; V4 passed with benchmark artifacts. |
| AC2 | met | The benchmark harness uses deterministic local fixtures for required pass/fail gates and may use optional external pages only as non-required exploratory evidence. Evidence: benchmarks/chromux-benchmark.mjs owns a deterministic localhost fixture server for pass/fail gates; V3 smoke and V4 full benchmark both passed without external pages. |
| AC3 | met | A representative multi-step QA flow can run with a single bundled operation or snippet and returns both result data and step-level timing evidence. Evidence: Bundled form-flow runner executed a multi-step real Chrome flow through one run invocation and returned result data plus readiness proof; V3/V4 run receipt artifacts recorded. |
| AC4 | met | A representative large URL queue runs through a bounded worker pool with worker reuse, per-item duration, retry classification, final URL/title/html/text metadata, and failure reason classification. Evidence: cmdBatch now emits bounded worker results with workerId, session, duration, attempts, retryable, failureKind, host, queue telemetry, and p50/p95 summary; V2 and V4 passed. |
| AC5 | met | Crawl execution backs off or fails clearly when profile queue, renderer, process, RSS, host error rate, or timeout policies are exceeded. Evidence: Batch/resource guard paths classify timeout, resource_guard, queue_full, session_unresponsive, navigation, http_or_page, and unknown failures with host backoff and daemon health gate data; V2/V3/V4 passed. |
| AC6 | met | Readiness helpers can wait for visible text, visible selector, DOM assertion, navigation completion, and a bounded quiet or settled condition without unbounded sleeps. Evidence: run helpers include waitFor text, selector, expression, settled, quiet plus waitLoad and assertPage; V2 validates text waits and assertions against local fixtures. |
| AC7 | met | Failed readiness reports include the waited condition, timeout budget, last known URL/title, and relevant console or network failure summary when capture was enabled. Evidence: waitFor/assertPage failures include waited condition, timeout budget, current URL/title, and last redacted observed value or error context; V2 failure diagnostics tests passed. |
| AC8 | met | Structured receipts redact raw typed text, inline code, tokens, cookies, authorization headers, and secrets while preserving enough metadata to debug. Evidence: run --receipt writes chromux.run-receipt.v1 artifacts with codeStored:false and redacted strings/secrets; V2 validates inline code and typed text do not leak, with V3/V4 receipt artifacts recorded. |
| AC9 | met | Profile diagnosis evidence can distinguish running, locked, stale daemon, paused, queue full, resource guarded, unresponsive session, and Chrome CDP unreachable states. Evidence: ps --json and daemon /health expose running profiles, paused state, stale daemon count, queue depth, queue limit, active gate, and resource guard state; V2/V3/V4 passed. |
| AC10 | met | The status app or CLI-readable status output exposes recent task duration, failure counts, resource guard events, and cleanup candidates. Evidence: CLI-readable ps JSON, batch summaries, activity sanitization, and benchmark resource artifacts expose recent durations, failure counts, retry/resource guard information, and profile state; V2/V3/V4 passed. |
| AC11 | met | Built-in snippets cover at least infinite scroll, structured page extraction, form flow with readiness, network-error collection, and page assertion. Evidence: Built-in runner snippets now cover page extraction/infinite scroll, form flow with readiness, network-error diagnostics, and page assertion patterns under snippets/_builtin/. |
| AC12 | met | New snippets are tested against local fixtures and documented as runner material, not as new public commands. Evidence: All new snippets compile with the runner helper signature in test.sh and CI, are exercised by local fixture benchmark flows, and are documented as runner material rather than top-level commands. |
| AC13 | met | `node chromux.mjs help` remains the source of truth and does not expose deprecated compatibility aliases as primary help entries. Evidence: node chromux.mjs help remains the public command source of truth, documents run --receipt, batch retry/backoff, ps --json, and snippets, while deprecated eval stays off the primary help surface; V1/V5 passed. |
| AC14 | met | `./test.sh` or a focused automated suite covers scheduler, readiness, receipt redaction, snippet contracts, and diagnosis behavior. Evidence: ./test.sh passed 118 checks covering scheduler, readiness, receipt redaction, snippet contracts, ps diagnostics, batch retry telemetry, benchmark smoke, and doc consistency. |
| AC15 | met | `npm pack --dry-run` confirms package contents stay inside the `package.json` allowlist and no planning artifacts are published. Evidence: npm pack --dry-run passed for @team-attention/chromux@0.11.0 with package allowlist contents only; planning artifacts are outside the published package. |
| AC16 | met | Future PR delivery, if approved, provides a PR URL, reviewable result summary, and CI status without staging unrelated local artifacts. Evidence: PR delivery is approved and configured for prd/chromux-dominant-browser-automation; prd-ship refused status before receipt as expected, so PR URL and CI proof are deferred to the post-receipt ship step without staging unrelated files. |

## Verification Evidence

| ID | Status | Check | Evidence |
| --- | --- | --- | --- |
| V1 (build/static) | pass | `node --check chromux.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run` | .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-10-41-417Z.log, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-38-22-399Z.log |
| V2 (automated behavior) | pass | `bash ./test.sh` | .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-13-47-501Z.log, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-39-42-713Z.log |
| V3 (browser/runtime) | pass | `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out... | .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-11-07-790Z.log, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.png, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-40-00-180Z.log, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.png, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-run-receipt.json, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-batch.jsonl |
| V4 (performance benchmark) | pass | `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/i... | .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-11-50-418Z.log, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.png, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-51-35-895Z.log, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.png, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-run-receipt.json, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-batch.jsonl |
| V5 (documentation review) | pass | `node benchmarks/chromux-doc-check.mjs` | .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-10-46-495Z.log, .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-51-52-739Z.log |
| V6 (delivery/CI) | blocked | `node ~/.codex/skills/prd-ship/scripts/prd_ship.js status --state .hoyeon/implement/chromux-dominant-browser-automati... | Optional delivery/CI check is blocked until receipt.json exists because prd-ship requires a complete prd-implement receipt before status/ship; user explicitly requested ship in this run, so delivery proof will be collected after finalization. |

## Review Verdicts

- Requirements fidelity review: pass - .hoyeon/implement/chromux-dominant-browser-automation/review/requirements-fidelity-review.md
- Final adversarial review: pass - .hoyeon/implement/chromux-dominant-browser-automation/review/final-review.md

## Delivery Staging

- Mode: pr
- Branch: prd/chromux-dominant-browser-automation
- Base: main
- Staging include: default PRD run paths plus explicit source/docs/tests/CI/benchmark paths passed to `prd-ship --include`
- Staging exclude: default volatile paths, implementation artifacts, active session files

## Changed Paths Planned For This PR

- .github/workflows/ci.yml
- .hoyeon/config.json
- .hoyeon/implement/chromux-dominant-browser-automation/checklist.md
- .hoyeon/implement/chromux-dominant-browser-automation/context-notes.md
- .hoyeon/implement/chromux-dominant-browser-automation/execution-plan.json
- .hoyeon/implement/chromux-dominant-browser-automation/execution-plan.md
- .hoyeon/implement/chromux-dominant-browser-automation/implementation-result.md
- .hoyeon/implement/chromux-dominant-browser-automation/ledger.jsonl
- .hoyeon/implement/chromux-dominant-browser-automation/receipt.json
- .hoyeon/implement/chromux-dominant-browser-automation/review/final-review.md
- .hoyeon/implement/chromux-dominant-browser-automation/review/requirements-fidelity-review.md
- .hoyeon/implement/chromux-dominant-browser-automation/state.json
- .hoyeon/implement/chromux-dominant-browser-automation/taskgraph.json
- .hoyeon/implement/chromux-dominant-browser-automation/taskgraph.md
- .hoyeon/implement/chromux-dominant-browser-automation/verification-plan.json
- .hoyeon/implement/chromux-dominant-browser-automation/verification-plan.md
- .hoyeon/implement/chromux-dominant-browser-automation/verification.md
- .hoyeon/prd/chromux-dominant-browser-automation/context-notes.md
- .hoyeon/prd/chromux-dominant-browser-automation/intent-scope-audit.md
- .hoyeon/prd/chromux-dominant-browser-automation/prd.md
- .hoyeon/prd/chromux-dominant-browser-automation/verification-contract-audit.md
- README.md
- benchmarks/chromux-benchmark.mjs
- benchmarks/chromux-doc-check.mjs
- chromux.mjs
- install.md
- package.json
- skills/chromux-work/SKILL.md
- skills/chromux/SKILL.md
- snippets/_builtin/form-flow.js
- snippets/_builtin/network-errors.js
- snippets/_builtin/page-assert.js
- snippets/_builtin/page-extract.js
- test.sh

## Risks, Rollback, And Human Review

- Risk: receipt metadata could still expose too much context if future helpers add new object keys.
  Mitigation: V2 now includes redaction regression coverage for secret strings and URL query/hash values.
- Risk: benchmark numbers are local-machine baselines, not universal performance guarantees.
  Mitigation: the harness reports concrete metrics and deterministic fixture behavior instead of hard-coding global thresholds.
- Risk: adaptive retry/backoff could affect crawl behavior on fragile targets.
  Mitigation: retry counts are bounded, host backoff is explicit, and default mode remains compatibility-oriented.
- Rollback: revert this PR or restore `package.json` to `0.10.0` before merge if release timing changes.
- Unrun or blocked: V6 delivery/CI was blocked during `prd-implement` because `prd-ship` requires a complete receipt first; this PR creation and CI watch are the V6 follow-through.
