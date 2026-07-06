# Implementation Result: chromux-dominant-browser-automation

Status: complete

PRD: .hoyeon/prd/chromux-dominant-browser-automation/prd.md
Receipt: .hoyeon/implement/chromux-dominant-browser-automation/receipt.json

## Execution Plan

- Status: ready
- Nodes: 8
- Open nodes: 0
- Artifact: .hoyeon/implement/chromux-dominant-browser-automation/execution-plan.md
- N1: complete - Establish benchmark harness and baseline budgets. Covers R7, R8, AC1, AC2, AC14, AC15. (source: T1, risk: medium, parallelSafe: yes)
- N2: complete - Design and implement fast-path orchestration patterns using `run`, snippets, and existing daemon routes before propos... (source: T2, risk: medium, parallelSafe: yes)
- N3: complete - Upgrade `batch` and crawl-mode scheduling with adaptive worker reuse, retry classification, domain backoff, queue tel... (source: T3, risk: medium, parallelSafe: yes)
- N4: complete - Add richer readiness and action evidence so common flows prove final state without fragile sleeps or extra agent roun... (source: T4, risk: medium, parallelSafe: yes)
- N5: complete - Add structured receipt and replay-hint artifacts with privacy-preserving redaction. Covers R4, R8, AC7, AC8, AC10, AC14. (source: T5, risk: medium, parallelSafe: yes)
- N6: complete - Strengthen profile and resource diagnosis across CLI, daemon health, status app, and activity data. Covers R5, AC5, A... (source: T6, risk: medium, parallelSafe: yes)
- N7: complete - Expand built-in snippets and skill guidance for extraction, infinite scroll, form flow, diagnostics, and assertion pa... (source: T7, risk: medium, parallelSafe: yes)
- N8: complete - Complete verification, documentation, package, and optional PR delivery hygiene. Covers R8, AC13, AC14, AC15, AC16. (source: T8, risk: medium, parallelSafe: yes)

## Task Graph

- Status: complete
- Nodes: 43
- Edges: 221
- Open nodes: 0
- Artifact: .hoyeon/implement/chromux-dominant-browser-automation/taskgraph.md
## Tasks

- T1: complete - Establish benchmark harness and baseline budgets. Covers R7, R8, AC1, AC2, AC14, AC15.
- T2: complete - Design and implement fast-path orchestration patterns using `run`, snippets, and existing daemon routes before propos...
- T3: complete - Upgrade `batch` and crawl-mode scheduling with adaptive worker reuse, retry classification, domain backoff, queue tel...
- T4: complete - Add richer readiness and action evidence so common flows prove final state without fragile sleeps or extra agent roun...
- T5: complete - Add structured receipt and replay-hint artifacts with privacy-preserving redaction. Covers R4, R8, AC7, AC8, AC10, AC14.
- T6: complete - Strengthen profile and resource diagnosis across CLI, daemon health, status app, and activity data. Covers R5, AC5, A...
- T7: complete - Expand built-in snippets and skill guidance for extraction, infinite scroll, form flow, diagnostics, and assertion pa...
- T8: complete - Complete verification, documentation, package, and optional PR delivery hygiene. Covers R8, AC13, AC14, AC15, AC16.

## Acceptance Criteria

- AC1: met - A documented benchmark run reports cold launch, warm daemon command, open, `run`, snapshot full, snapshot interactive...
- AC2: met - The benchmark harness uses deterministic local fixtures for required pass/fail gates and may use optional external pa...
- AC3: met - A representative multi-step QA flow can run with a single bundled operation or snippet and returns both result data a...
- AC4: met - A representative large URL queue runs through a bounded worker pool with worker reuse, per-item duration, retry class...
- AC5: met - Crawl execution backs off or fails clearly when profile queue, renderer, process, RSS, host error rate, or timeout po...
- AC6: met - Readiness helpers can wait for visible text, visible selector, DOM assertion, navigation completion, and a bounded qu...
- AC7: met - Failed readiness reports include the waited condition, timeout budget, last known URL/title, and relevant console or ...
- AC8: met - Structured receipts redact raw typed text, inline code, tokens, cookies, authorization headers, and secrets while pre...
- AC9: met - Profile diagnosis evidence can distinguish running, locked, stale daemon, paused, queue full, resource guarded, unres...
- AC10: met - The status app or CLI-readable status output exposes recent task duration, failure counts, resource guard events, and...
- AC11: met - Built-in snippets cover at least infinite scroll, structured page extraction, form flow with readiness, network-error...
- AC12: met - New snippets are tested against local fixtures and documented as runner material, not as new public commands.
- AC13: met - `node chromux.mjs help` remains the source of truth and does not expose deprecated compatibility aliases as primary h...
- AC14: met - `./test.sh` or a focused automated suite covers scheduler, readiness, receipt redaction, snippet contracts, and diagn...
- AC15: met - `npm pack --dry-run` confirms package contents stay inside the `package.json` allowlist and no planning artifacts are...
- AC16: met - Future PR delivery, if approved, provides a PR URL, reviewable result summary, and CI status without staging unrelate...

## Verification Evidence

- V1: pass - General: `node --check chromux.mjs && bash -n test.sh && node chromux.mjs help && npm pack --dry-run`
- V2: pass - General: `bash ./test.sh`
- V3: pass - General: `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-runtime-XXXXXX)" node benchmarks/chromux-benchmark.mjs --smoke --out...
- V4: pass - General: `CHROMUX_HOME="$(mktemp -d /tmp/chromux-dominant-bench-XXXXXX)" node benchmarks/chromux-benchmark.mjs --out .hoyeon/i...
- V5: pass - General: `node benchmarks/chromux-doc-check.mjs`
- V6: blocked - General: `node ~/.codex/skills/prd-ship/scripts/prd_ship.js status --state .hoyeon/implement/chromux-dominant-browser-automati...

## Artifact Evidence

- verification V1: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-10-41-417Z.log
- verification V1: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V1-2026-07-06T03-38-22-399Z.log
- verification V2: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-13-47-501Z.log
- verification V2: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V2-2026-07-06T03-39-42-713Z.log
- verification V3: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-11-07-790Z.log
- verification V3: screenshot - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.png
- verification V3: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V3-2026-07-06T03-40-00-180Z.log
- verification V3: log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.json
- verification V3: screenshot - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke.png
- verification V3: log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-run-receipt.json
- verification V3: log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/runtime-smoke-batch.jsonl
- verification V4: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-11-50-418Z.log
- verification V4: screenshot - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.png
- verification V4: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V4-2026-07-06T03-51-35-895Z.log
- verification V4: log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.json
- verification V4: screenshot - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark.png
- verification V4: log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-run-receipt.json
- verification V4: log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/benchmark-batch.jsonl
- verification V5: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-10-46-495Z.log
- verification V5: command-log - .hoyeon/implement/chromux-dominant-browser-automation/artifacts/logs/V5-2026-07-06T03-51-52-739Z.log

## Requirements Fidelity Review

- Status: pass
- Report: .hoyeon/implement/chromux-dominant-browser-automation/review/requirements-fidelity-review.md
- Summary: PASS: refreshed after receipt URL query/hash redaction fix and V1-V5 rerun; PRD intent, non-goals, R/AC coverage, artifact-backed verification, privacy guardrails, and delivery sequencing align.

## Final Adversarial Review

- Status: pass
- Report: .hoyeon/implement/chromux-dominant-browser-automation/review/final-review.md
- Summary: PASS: refreshed requirements review verified, V1-V5 artifact-backed and fresh, URL query/hash receipt redaction fixed and tested, stale artifact entries cleaned, optional V6 deferred to prd-ship by design.

## Final Receipt

```json
{
  "schema": "hoyeon.prd-implement.receipt.v1",
  "status": "complete",
  "summary": "Completed chromux dominant browser automation PRD: benchmark harness, run receipts with URL query/hash redaction, readiness helpers, adaptive batch telemetry, ps --json diagnostics, snippets, docs, CI checks, package version 0.11.0, and refreshed V1-V5 verification. Optional V6 delivery/CI is deferred to prd-ship after receipt.",
  "verifiedAt": "2026-07-06T03:58:25.703Z",
  "counts": {
    "executionOpen": 0,
    "tasksOpen": 0,
    "acOpen": 0,
    "verificationOpen": 0,
    "totalOpen": 0,
    "blocked": {
      "execution": 0,
      "tasks": 0,
      "acceptanceCriteria": 0,
      "verification": 1,
      "requiredVerification": 0
    },
    "requiredVerificationNotPassed": 0
  },
  "delivery": {
    "schema": "hoyeon.delivery.v1",
    "mode": "pr",
    "branch": "prd/chromux-dominant-browser-automation",
    "baseBranch": "main",
    "prTemplate": null,
    "ci": {
      "watch": true,
      "maxFixAttempts": 2
    },
    "staging": {
      "include": [],
      "exclude": []
    },
    "worktree": {
      "enabled": true,
      "path": "/Users/hoyeonlee/team-attention/chromux.worktrees/prd-chromux-dominant-browser-automation",
      "root": "/Users/hoyeonlee/team-attention/chromux.worktrees",
      "link": [],
      "copy": [],
      "setup": [],
      "current": true,
      "skipped": true,
      "preparation": null
    },
    "configPath": ".hoyeon/config.json",
    "initializedAt": "2026-07-06T02:44:49.572Z"
  },
  "worktreeSnapshot": {
    "capturedAt": "2026-07-06T03:58:25.720Z",
    "statusHash": "3ced779f",
    "entryCount": 19,
    "entries": [
      {
        "status": " M",
        "path": ".github/workflows/ci.yml",
        "originalPath": null,
        "sha256": "e1ce5fefe7c92263812f1b9f1fc4eecbc37b84448bb8637b4b37e83d068eced2",
        "bytes": 5984
      },
      {
        "status": "??",
        "path": ".hoyeon/config.json",
        "originalPath": null,
        "sha256": "58b4fd36e333e58912ab2eca35a59e118c89d5376eea383c9228f33a1153342d",
        "bytes": 254
      },
      {
        "status": "??",
        "path": ".hoyeon/prd/chromux-dominant-browser-automation/context-notes.md",
        "originalPath": null,
        "sha256": "9c110129ffbea506f56548d550408c02e9e89f2edf0ff5803abbc94f723e3a69",
        "bytes": 4502
      },
      {
        "status": "??",
        "path": ".hoyeon/prd/chromux-dominant-browser-automation/intent-scope-audit.md",
        "originalPath": null,
        "sha256": "c12b3338af229cfda2eec077b46a8a8634fcec64d925a579960c1bbdd3e96a7d",
        "bytes": 2214
      },
      {
        "status": "??",
        "path": ".hoyeon/prd/chromux-dominant-browser-automation/prd.md",
        "originalPath": null,
        "sha256": "2f8d936a5b10996e9b11278b8a9928e355ebdd0b06b3b24d6fcdee76f6f42dab",
        "bytes": 23043
      },
      {
        "status": "??",
        "path": ".hoyeon/prd/chromux-dominant-browser-automation/verification-contract-audit.md",
        "originalPath": null,
        "sha256": "a8872c02e47c33688028fc66dbe8cd3d724796c9fbe39cdc12063c812f30d1d0",
        "bytes": 2882
      },
      {
        "status": "??",
        "path": "benchmarks/chromux-benchmark.mjs",
        "originalPath": null,
        "sha256": "502cee1f6e43d5952a525b4c12244f024c7cac4e1cd3f7358d12a6e706015e7c",
        "bytes": 9463
      },
      {
        "status": "??",
        "path": "benchmarks/chromux-doc-check.mjs",
        "originalPath": null,
        "sha256": "f0190667061ff71d2f3023f6a61ac7f9d74e4cf790a5a9661a8e3ca7c2118abd",
        "bytes": 1807
      },
      {
        "status": " M",
        "path": "chromux.mjs",
        "originalPath": null,
        "sha256": "536a589b640263e12e065dce349b59befc5849f1f03c0ac44e61d3b868faeb26",
        "bytes": 157207
      },
      {
        "status": " M",
        "path": "install.md",
        "originalPath": null,
        "sha256": "fa32b20a72c644a77327c1b31e9ae4dc96ccaff67d9bf530585ad840761ef56b",
        "bytes": 21911
      },
      {
        "status": " M",
        "path": "package.json",
        "originalPath": null,
        "sha256": "0222c4f28aa38d48a7ddcd602052db6f4ea10db3789143f470180729dd805db2",
        "bytes": 827
      },
      {
        "status": " M",
        "path": "README.md",
        "originalPath": null,
        "sha256": "f027316907d4c831b1d8c3665a748654d97f63463436e1f394cb0d2ec799acb5",
        "bytes": 23877
      },
      {
        "status": " M",
        "path": "skills/chromux-work/SKILL.md",
        "originalPath": null,
        "sha256": "266b8c32b7a2ce0468df4b365e3269b9706e26ed8e141bb2077c1925296c4f21",
        "bytes": 15604
      },
      {
        "status": " M",
        "path": "skills/chromux/SKILL.md",
        "originalPath": null,
        "sha256": "543055f4fbbd93558cc494663869f89af060fc82d45cdbd869fce33c9a190aa4",
        "bytes": 14469
      },
      {
        "status": "??",
        "path": "snippets/_builtin/form-flow.js",
        "originalPath": null,
        "sha256": "e51b487a09fa36f5b711f4a8fc8e40713f5e4cd3ca16b3e81e5953af41258425",
        "bytes": 1946
      },
      {
        "status": "??",
        "path": "snippets/_builtin/network-errors.js",
        "originalPath": null,
        "sha256": "5118481b6a0b977f9acb20b842c15d6d8582dc62076a673819278132c33774c2",
        "bytes": 1198
      },
      {
        "status": "??",
        "path": "snippets/_builtin/page-assert.js",
        "originalPath": null,
        "sha256": "11e256c0d229f9ee6a5897c9bcaa0b886092311d727a8afbbe328e8233cf4a2d",
        "bytes": 664
      },
      {
        "status": "??",
        "path": "snippets/_builtin/page-extract.js",
        "originalPath": null,
        "sha256": "0d5a78c2cbae07c31736d885af748b8217363d09dbe6f2eda2a257008f61d9b9",
        "bytes": 1043
      },
      {
        "status": " M",
        "path": "test.sh",
        "originalPath": null,
        "sha256": "9db2c57ec07bf89fb91432f43d4d8cdf9648eda7fec2aadde43daba22cd6d8b9",
        "bytes": 37794
      }
    ]
  },
  "executionPlan": {
    "status": "ready",
    "nodeCount": 8,
    "openNodeCount": 0,
    "blockingGapCount": 0,
    "warningCount": 2,
    "generatedAt": "2026-07-06T02:54:58.713Z"
  },
  "taskGraph": {
    "status": "complete",
    "nodeCount": 43,
    "edgeCount": 221,
    "openNodeCount": 0,
    "blockingGapCount": 0,
    "generatedAt": "2026-07-06T03:58:25.722Z"
  },
  "artifactCount": 20,
  "requirementsFidelityReview": {
    "status": "pass",
    "summary": "PASS: refreshed after receipt URL query/hash redaction fix and V1-V5 rerun; PRD intent, non-goals, R/AC coverage, artifact-backed verification, privacy guardrails, and delivery sequencing align.",
    "reportPath": ".hoyeon/implement/chromux-dominant-browser-automation/review/requirements-fidelity-review.md",
    "reportBytes": 7447,
    "reportSha256": "48e34fef395e0b27f0c31ac4622eddcf5a18b18a18fd4138c48ddbf34dd13ab6",
    "worktreeSnapshot": {
      "capturedAt": "2026-07-06T03:54:09.815Z",
      "statusHash": "3ced779f",
      "entryCount": 19,
      "entries": [
        {
          "status": " M",
          "path": ".github/workflows/ci.yml",
          "originalPath": null,
          "sha256": "e1ce5fefe7c92263812f1b9f1fc4eecbc37b84448bb8637b4b37e83d068eced2",
          "bytes": 5984
        },
        {
          "status": "??",
          "path": ".hoyeon/config.json",
          "originalPath": null,
          "sha256": "58b4fd36e333e58912ab2eca35a59e118c89d5376eea383c9228f33a1153342d",
          "bytes": 254
        },
        {
          "status": "??",
          "path": ".hoyeon/prd/chromux-dominant-browser-automation/context-notes.md",
          "originalPath": null,
          "sha256": "9c110129ffbea506f56548d550408c02e9e89f2edf0ff5803abbc94f723e3a69",
          "bytes": 4502
        },
        {
          "status": "??",
          "path": ".hoyeon/prd/chromux-dominant-browser-automation/intent-scope-audit.md",
          "originalPath": null,
          "sha256": "c12b3338af229cfda2eec077b46a8a8634fcec64d925a579960c1bbdd3e96a7d",
          "bytes": 2214
        },
        {
          "status": "??",
          "path": ".hoyeon/prd/chromux-dominant-browser-automation/prd.md",
          "originalPath": null,
          "sha256": "2f8d936a5b10996e9b11278b8a9928e355ebdd0b06b3b24d6fcdee76f6f42dab",
          "bytes": 23043
        },
        {
          "status": "??",
          "path": ".hoyeon/prd/chromux-dominant-browser-automation/verification-contract-audit.md",
          "originalPath": null,
          "sha256": "a8872c02e47c33688028fc66dbe8cd3d724796c9fbe39cdc12063c812f30d1d0",
          "bytes": 2882
        },
        {
          "status": "??",
          "path": "benchmarks/chromux-benchmark.mjs",
          "originalPath": null,
          "sha256": "502cee1f6e43d5952a525b4c12244f024c7cac4e1cd3f7358d12a6e706015e7c",
          "bytes": 9463
        },
        {
          "status": "??",
          "path": "benchmarks/chromux-doc-check.mjs",
          "originalPath": null,
          "sha256": "f0190667061ff71d2f3023f6a61ac7f9d74e4cf790a5a9661a8e3ca7c2118abd",
          "bytes": 1807
        },
        {
          "status": " M",
          "path": "chromux.mjs",
          "originalPath": null,
          "sha256": "536a589b640263e12e065dce349b59befc5849f1f03c0ac44e61d3b868faeb26",
          "bytes": 157207
        },
        {
          "status": " M",
          "path": "install.md",
          "originalPath": null,
          "sha256": "fa32b20a72c644a77327c1b31e9ae4dc96ccaff67d9bf530585ad840761ef56b",
          "bytes": 21911
        },
        {
          "status": " M",
          "path": "package.json",
          "originalPath": null,
          "sha256": "0222c4f28aa38d48a7ddcd602052db6f4ea10db3789143f470180729dd805db2",
          "bytes": 827
        },
        {
          "status": " M",
          "path": "README.md",
          "originalPath": null,
          "sha256": "f027316907d4c831b1d8c3665a748654d97f63463436e1f394cb0d2ec799acb5",
          "bytes": 23877
        },
        {
          "status": " M",
          "path": "skills/chromux-work/SKILL.md",
          "originalPath": null,
          "sha256": "266b8c32b7a2ce0468df4b365e3269b9706e26ed8e141bb2077c1925296c4f21",
          "bytes": 15604
        },
        {
          "status": " M",
          "path": "skills/chromux/SKILL.md",
          "originalPath": null,
          "sha256": "543055f4fbbd93558cc494663869f89af060fc82d45cdbd869fce33c9a190aa4",
          "bytes": 14469
        },
        {
          "status": "??",
          "path": "snippets/_builtin/form-flow.js",
          "originalPath": null,
          "sha256": "e51b487a09fa36f5b711f4a8fc8e40713f5e4cd3ca16b3e81e5953af41258425",
          "bytes": 1946
        },
        {
          "status": "??",
          "path": "snippets/_builtin/network-errors.js",
          "originalPath": null,
          "sha256": "5118481b6a0b977f9acb20b842c15d6d8582dc62076a673819278132c33774c2",
          "bytes": 1198
        },
        {
          "status": "??",
          "path": "snippets/_builtin/page-assert.js",
          "originalPath": null,
          "sha256": "11e256c0d229f9ee6a5897c9bcaa0b886092311d727a8afbbe328e8233cf4a2d",
          "bytes": 664
        },
        {
          "status": "??",
          "path": "snippets/_builtin/page-extract.js",
          "originalPath": null,
          "sha256": "0d5a78c2cbae07c31736d885af748b8217363d09dbe6f2eda2a257008f61d9b9",
          "bytes": 1043
        },
        {
          "status": " M",
          "path": "test.sh",
          "originalPath": null,
          "sha256": "9db2c57ec07bf89fb91432f43d4d8cdf9648eda7fec2aadde43daba22cd6d8b9",
          "bytes": 37794
        }
      ]
    },
    "recordedAt": "2026-07-06T03:54:09.815Z"
  },
  "finalReview": {
    "status": "pass",
    "summary": "PASS: refreshed requirements review verified, V1-V5 artifact-backed and fresh, URL query/hash receipt redaction fixed and tested, stale artifact entries cleaned, optional V6 deferred to prd-ship by design.",
    "reportPath": ".hoyeon/implement/chromux-dominant-browser-automation/review/final-review.md",
    "reportBytes": 4303,
    "reportSha256": "1307e0f3e65ae9df241ef97e0c0c6c6889040bc4a016a278c4ff2a8262fddcde",
    "worktreeSnapshot": {
      "capturedAt": "2026-07-06T03:55:08.790Z",
      "statusHash": "3ced779f",
      "entryCount": 19,
      "entries": [
        {
          "status": " M",
          "path": ".github/workflows/ci.yml",
          "originalPath": null,
          "sha256": "e1ce5fefe7c92263812f1b9f1fc4eecbc37b84448bb8637b4b37e83d068eced2",
          "bytes": 5984
        },
        {
          "status": "??",
          "path": ".hoyeon/config.json",
          "originalPath": null,
          "sha256": "58b4fd36e333e58912ab2eca35a59e118c89d5376eea383c9228f33a1153342d",
          "bytes": 254
        },
        {
          "status": "??",
          "path": ".hoyeon/prd/chromux-dominant-browser-automation/context-notes.md",
          "originalPath": null,
          "sha256": "9c110129ffbea506f56548d550408c02e9e89f2edf0ff5803abbc94f723e3a69",
          "bytes": 4502
        },
        {
          "status": "??",
          "path": ".hoyeon/prd/chromux-dominant-browser-automation/intent-scope-audit.md",
          "originalPath": null,
          "sha256": "c12b3338af229cfda2eec077b46a8a8634fcec64d925a579960c1bbdd3e96a7d",
          "bytes": 2214
        },
        {
          "status": "??",
          "path": ".hoyeon/prd/chromux-dominant-browser-automation/prd.md",
          "originalPath": null,
          "sha256": "2f8d936a5b10996e9b11278b8a9928e355ebdd0b06b3b24d6fcdee76f6f42dab",
          "bytes": 23043
        },
        {
          "status": "??",
          "path": ".hoyeon/prd/chromux-dominant-browser-automation/verification-contract-audit.md",
          "originalPath": null,
          "sha256": "a8872c02e47c33688028fc66dbe8cd3d724796c9fbe39cdc12063c812f30d1d0",
          "bytes": 2882
        },
        {
          "status": "??",
          "path": "benchmarks/chromux-benchmark.mjs",
          "originalPath": null,
          "sha256": "502cee1f6e43d5952a525b4c12244f024c7cac4e1cd3f7358d12a6e706015e7c",
          "bytes": 9463
        },
        {
          "status": "??",
          "path": "benchmarks/chromux-doc-check.mjs",
          "originalPath": null,
          "sha256": "f0190667061ff71d2f3023f6a61ac7f9d74e4cf790a5a9661a8e3ca7c2118abd",
          "bytes": 1807
        },
        {
          "status": " M",
          "path": "chromux.mjs",
          "originalPath": null,
          "sha256": "536a589b640263e12e065dce349b59befc5849f1f03c0ac44e61d3b868faeb26",
          "bytes": 157207
        },
        {
          "status": " M",
          "path": "install.md",
          "originalPath": null,
          "sha256": "fa32b20a72c644a77327c1b31e9ae4dc96ccaff67d9bf530585ad840761ef56b",
          "bytes": 21911
        },
        {
          "status": " M",
          "path": "package.json",
          "originalPath": null,
          "sha256": "0222c4f28aa38d48a7ddcd602052db6f4ea10db3789143f470180729dd805db2",
          "bytes": 827
        },
        {
          "status": " M",
          "path": "README.md",
          "originalPath": null,
          "sha256": "f027316907d4c831b1d8c3665a748654d97f63463436e1f394cb0d2ec799acb5",
          "bytes": 23877
        },
        {
          "status": " M",
          "path": "skills/chromux-work/SKILL.md",
          "originalPath": null,
          "sha256": "266b8c32b7a2ce0468df4b365e3269b9706e26ed8e141bb2077c1925296c4f21",
          "bytes": 15604
        },
        {
          "status": " M",
          "path": "skills/chromux/SKILL.md",
          "originalPath": null,
          "sha256": "543055f4fbbd93558cc494663869f89af060fc82d45cdbd869fce33c9a190aa4",
          "bytes": 14469
        },
        {
          "status": "??",
          "path": "snippets/_builtin/form-flow.js",
          "originalPath": null,
          "sha256": "e51b487a09fa36f5b711f4a8fc8e40713f5e4cd3ca16b3e81e5953af41258425",
          "bytes": 1946
        },
        {
          "status": "??",
          "path": "snippets/_builtin/network-errors.js",
          "originalPath": null,
          "sha256": "5118481b6a0b977f9acb20b842c15d6d8582dc62076a673819278132c33774c2",
          "bytes": 1198
        },
        {
          "status": "??",
          "path": "snippets/_builtin/page-assert.js",
          "originalPath": null,
          "sha256": "11e256c0d229f9ee6a5897c9bcaa0b886092311d727a8afbbe328e8233cf4a2d",
          "bytes": 664
        },
        {
          "status": "??",
          "path": "snippets/_builtin/page-extract.js",
          "originalPath": null,
          "sha256": "0d5a78c2cbae07c31736d885af748b8217363d09dbe6f2eda2a257008f61d9b9",
          "bytes": 1043
        },
        {
          "status": " M",
          "path": "test.sh",
          "originalPath": null,
          "sha256": "9db2c57ec07bf89fb91432f43d4d8cdf9648eda7fec2aadde43daba22cd6d8b9",
          "bytes": 37794
        }
      ]
    },
    "recordedAt": "2026-07-06T03:55:08.790Z"
  },
  "evidenceHash": "132f4bdf"
}
```
