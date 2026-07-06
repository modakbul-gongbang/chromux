# Verification

PRD: .hoyeon/prd/chromux-dominant-browser-automation/prd.md

## V1. General

- Status: pass
- Source: verification_matrix
- Check: Mode: build/static. Covers: R8, AC13, AC15, T8. Check: `node --check chromux.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run`. Artifact: command-log. Pass: Static checks, `node chromux.mjs help`, and `npm pack --dry-run` prove the CLI, help surface, and package surface remain coherent. Required For Done: yes. Can Be Blocked: no. Safe Probe: local only. Sensitive Data Policy: no secrets or browser profile data required.
- Evidence:
  - 2026-07-06T03:10:41.419Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-10-41-417Z.log (dac620f01f39) - verify-run passed: bash -lc 'node --check chromux.mjs && node --check benchmarks/chromux-benchmark.mjs && node --check benchmarks/chromux-doc-check.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run'
  - 2026-07-06T03:10:41.419Z: Command passed with exit code 0: bash -lc 'node --check chromux.mjs && node --check benchmarks/chromux-benchmark.mjs && node --check benchmarks/chromux-doc-check.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run'. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-10-41-417Z.log
  - 2026-07-06T03:38:22.400Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-38-22-399Z.log (e8fbf579ac0f) - verify-run passed: bash -lc 'node --check chromux.mjs && node --check benchmarks/chromux-benchmark.mjs && node --check benchmarks/chromux-doc-check.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run'
  - 2026-07-06T03:38:22.400Z: Command passed with exit code 0: bash -lc 'node --check chromux.mjs && node --check benchmarks/chromux-benchmark.mjs && node --check benchmarks/chromux-doc-check.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run'. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-38-22-399Z.log
- Artifacts:
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-10-41-417Z.log (dac620f01f39)
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-38-22-399Z.log (e8fbf579ac0f)

## V2. General

- Status: pass
- Source: verification_matrix
- Check: Mode: automated behavior. Covers: R2-R6, AC4-AC12, AC14, T3-T7. Check: `bash ./test.sh`. Artifact: command-log. Pass: Automated tests prove adaptive scheduling, readiness helpers, receipt redaction, diagnosis states, and snippet contracts against deterministic fixtures. Required For Done: yes. Can Be Blocked: no. Safe Probe: local Chrome fixtures only. Sensitive Data Policy: isolated `CHROMUX_HOME`; no raw typed text, tokens, cookies, or inline code stored.
- Evidence:
  - 2026-07-06T03:13:47.504Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-13-47-501Z.log (b41f141b69ce) - verify-run passed: bash ./test.sh
  - 2026-07-06T03:13:47.504Z: Command passed with exit code 0: bash ./test.sh. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-13-47-501Z.log
  - 2026-07-06T03:39:42.714Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-39-42-713Z.log (522e32b14100) - verify-run passed: bash ./test.sh
  - 2026-07-06T03:39:42.715Z: Command passed with exit code 0: bash ./test.sh. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-39-42-713Z.log
- Artifacts:
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-13-47-501Z.log (b41f141b69ce)
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-39-42-713Z.log (522e32b14100)

## V3. General

- Status: pass
- Source: verification_matrix
- Check: Mode: browser/runtime. Covers: R1-R6, AC3-AC10, T2-T6. Check: `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json`. Artifact: command-log plus benchmark JSON file under `.hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/`. Pass: Real Chrome smoke flows prove bundled QA, crawl worker reuse, profile recovery, watch diagnostics, and cleanup behavior in an isolated `CHROMUX_HOME` using benchmark-owned local fixtures. Required For Done: yes. Can Be Blocked: no. Safe Probe: deterministic localhost fixture server started and stopped by benchmark harness. Sensitive Data Policy: isolated temporary profile; benchmark artifacts must redact text entry and inline runner code.
- Evidence:
  - 2026-07-06T03:11:07.792Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-11-07-790Z.log (e38560987bf4) - verify-run passed: bash -lc 'CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json'
  - 2026-07-06T03:11:07.792Z: Command passed with exit code 0: bash -lc 'CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json'. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-11-07-790Z.log
  - 2026-07-06T03:11:22.676Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json (91a00ac4fcbf) - Runtime smoke benchmark JSON with local fixture metrics and resource state
  - 2026-07-06T03:11:34.324Z: Artifact recorded: screenshot .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.png (63cf370cb666) - Runtime smoke screenshot captured from benchmark fixture
  - 2026-07-06T03:11:34.364Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-run-receipt.json (fd5f66d0a0be) - Runtime smoke redacted run receipt generated by run --receipt
  - 2026-07-06T03:11:34.375Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-batch.jsonl (b9bf496823d4) - Runtime smoke batch JSONL rows with attempts and failureKind fields
  - 2026-07-06T03:40:00.181Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-40-00-180Z.log (a29f0fce0249) - verify-run passed: bash -lc 'CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json'
  - 2026-07-06T03:40:00.181Z: Command passed with exit code 0: bash -lc 'CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json'. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-40-00-180Z.log
  - 2026-07-06T03:51:14.827Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json (1ed16f8f9311) - Runtime smoke benchmark JSON with local fixture metrics and resource state after receipt URL redaction change
  - 2026-07-06T03:51:14.903Z: Artifact recorded: screenshot .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.png (63cf370cb666) - Runtime smoke screenshot captured from benchmark fixture after receipt URL redaction change
  - 2026-07-06T03:51:14.971Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-run-receipt.json (54b41c8db768) - Runtime smoke redacted run receipt generated by run --receipt after URL query redaction change
  - 2026-07-06T03:51:15.043Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-batch.jsonl (e819f7ce02b5) - Runtime smoke batch JSONL rows with attempts and failureKind fields after receipt URL redaction change
- Artifacts:
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-11-07-790Z.log (e38560987bf4)
  - screenshot: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.png (63cf370cb666)
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-40-00-180Z.log (a29f0fce0249)
  - log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json (1ed16f8f9311)
  - screenshot: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.png (63cf370cb666)
  - log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-run-receipt.json (54b41c8db768)
  - log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-batch.jsonl (e819f7ce02b5)

## V4. General

- Status: pass
- Source: verification_matrix
- Check: Mode: performance benchmark. Covers: R1, R2, R5, R7, AC1, AC2, AC4, AC5, T1, T3. Check: `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json`. Artifact: benchmark JSON file and command-log under `.hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/`. Pass: Benchmark artifacts report p50/p95 latency, throughput, retry/failure classification, and resource snapshots against baseline-derived budgets. Required For Done: yes. Can Be Blocked: no. Safe Probe: deterministic localhost fixture server only. Sensitive Data Policy: isolated temporary profile; no production pages or user data.
- Evidence:
  - 2026-07-06T03:11:50.420Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-11-50-418Z.log (a571e6809948) - verify-run passed: bash -lc 'CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json'
  - 2026-07-06T03:11:50.420Z: Command passed with exit code 0: bash -lc 'CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json'. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-11-50-418Z.log
  - 2026-07-06T03:12:03.893Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json (5e8ac48fd90e) - Full benchmark JSON with p50 and p95 timing, batch throughput, and resource state
  - 2026-07-06T03:12:09.586Z: Artifact recorded: screenshot .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.png (63cf370cb666) - Full benchmark screenshot captured from deterministic fixture
  - 2026-07-06T03:12:15.880Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-run-receipt.json (1f7067a49e7d) - Full benchmark redacted run receipt generated by run --receipt
  - 2026-07-06T03:12:21.688Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-batch.jsonl (fe0e14a07def) - Full benchmark batch JSONL rows with attempts and failureKind fields
  - 2026-07-06T03:51:35.897Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-51-35-895Z.log (6a2c895e2cb8) - verify-run passed: bash -lc 'CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json'
  - 2026-07-06T03:51:35.898Z: Command passed with exit code 0: bash -lc 'CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json'. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-51-35-895Z.log
  - 2026-07-06T03:51:47.575Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json (0d43191e440f) - Full benchmark JSON with p50 and p95 timing, batch throughput, and resource state after receipt URL redaction change
  - 2026-07-06T03:51:47.645Z: Artifact recorded: screenshot .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.png (63cf370cb666) - Full benchmark screenshot captured from deterministic fixture after receipt URL redaction change
  - 2026-07-06T03:51:47.710Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-run-receipt.json (7e31b56d3502) - Full benchmark redacted run receipt generated by run --receipt after URL query redaction change
  - 2026-07-06T03:51:47.779Z: Artifact recorded: log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-batch.jsonl (f27e6145971e) - Full benchmark batch JSONL rows with attempts and failureKind fields after receipt URL redaction change
- Artifacts:
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-11-50-418Z.log (a571e6809948)
  - screenshot: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.png (63cf370cb666)
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-51-35-895Z.log (6a2c895e2cb8)
  - log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json (0d43191e440f)
  - screenshot: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.png (63cf370cb666)
  - log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-run-receipt.json (7e31b56d3502)
  - log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-batch.jsonl (f27e6145971e)

## V5. General

- Status: pass
- Source: verification_matrix
- Check: Mode: documentation review. Covers: R1, R6, R8, AC11-AC13, T7, T8. Check: `node benchmarks/chromux-doc-check.mjs`. Artifact: command-log. Pass: README, install docs, `skills/chromux`, and `skills/chromux-work` teach the fastest safe path and match `chromux help`. Required For Done: yes. Can Be Blocked: no. Safe Probe: local file and help-output inspection only. Sensitive Data Policy: no secrets or browser profile data required.
- Evidence:
  - 2026-07-06T03:10:46.496Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-10-46-495Z.log (0f131a5d4c7d) - verify-run passed: node benchmarks/chromux-doc-check.mjs
  - 2026-07-06T03:10:46.496Z: Command passed with exit code 0: node benchmarks/chromux-doc-check.mjs. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-10-46-495Z.log
  - 2026-07-06T03:51:52.741Z: Artifact recorded: command-log .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-51-52-739Z.log (4ab2ebe4801a) - verify-run passed: node benchmarks/chromux-doc-check.mjs
  - 2026-07-06T03:51:52.741Z: Command passed with exit code 0: node benchmarks/chromux-doc-check.mjs. Log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-51-52-739Z.log
- Artifacts:
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-10-46-495Z.log (0f131a5d4c7d)
  - command-log: .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-51-52-739Z.log (4ab2ebe4801a)

## V6. General

- Status: blocked
- Source: verification_matrix
- Check: Mode: delivery/CI. Covers: AC16, T8. Check: `node ~/.codex/skills/prd-ship/scripts/prd_ship.js status --state .hoyeon/implement/chromux-dominant-browser-automation/state.json`. Artifact: api-log or command-log. Pass: If implementation delivery is approved, branch, PR URL, diff scope, and CI result prove the change is reviewable and unrelated artifacts are excluded. Required For Done: no. Can Be Blocked: yes. Safe Probe: GitHub metadata only after explicit ship request. Sensitive Data Policy: PR body and logs must not include local secrets, cookies, tokens, or unpushed `/Users/...` visual artifact paths.
- Evidence:
  - 2026-07-06T03:18:29.142Z: Optional delivery/CI check is blocked until receipt.json exists because prd-ship requires a complete prd-implement receipt before status/ship; user explicitly requested ship in this run, so delivery proof will be collected after finalization.
