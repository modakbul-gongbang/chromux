# Execution Plan: chromux-dominant-browser-automation

- PRD: .hoyeon/prd/chromux-dominant-browser-automation/prd.md
- Status: ready
- Generated: 2026-07-06T02:54:58.713Z
- Nodes: 8
- Blocking gaps: 0
- Warnings: 2

## Ready Guidance

- Ready sequential: none
- Ready parallel groups: none

## Nodes

### N1. Establish benchmark harness and baseline budgets. Covers R7, R8, AC1, AC2, AC14, AC15.

- Status: complete
- Source task: T1
- Owner: unassigned
- Depends on: none
- Write scope: snippets/_builtin/, .hoyeon
- Parallel safe: yes
- Risk: medium
- Covers: R: R7, R8; AC: AC1, AC2, AC14, AC15; V: V1, V2, V4, V5
- Evidence:
  - 2026-07-06T03:14:07.549Z: Added benchmarks/chromux-benchmark.mjs and benchmark artifacts; V4 pass with benchmark.json, benchmark.png, run receipt, batch JSONL; V1/V2/V5 pass.

### N2. Design and implement fast-path orchestration patterns using `run`, snippets, and existing daemon routes before propos...

- Status: complete
- Source task: T2
- Owner: unassigned
- Depends on: none
- Write scope: snippets/_builtin/, .hoyeon
- Parallel safe: yes
- Risk: medium
- Covers: R: R1, R3, R6; AC: AC3, AC6, AC11, AC12, AC13; V: V1, V2, V3, V4, V5
- Evidence:
  - 2026-07-06T03:14:14.633Z: Extended run helpers with waitFor/assertPage and added runner snippets page-extract/form-flow/network-errors/page-assert; help/docs updated; V2 test.sh and V3 runtime smoke pass.

### N3. Upgrade `batch` and crawl-mode scheduling with adaptive worker reuse, retry classification, domain backoff, queue tel...

- Status: complete
- Source task: T3
- Owner: unassigned
- Depends on: none
- Write scope: snippets/_builtin/, .hoyeon
- Parallel safe: yes
- Risk: medium
- Covers: R: R2, R5; AC: AC4, AC5, AC9, AC10; V: V2, V3, V4
- Evidence:
  - 2026-07-06T03:14:24.633Z: Upgraded cmdBatch with bounded retries, host backoff, p50/p95 summary, retry counts, host state, and failureKind taxonomy; V2 test.sh and V4 benchmark batch artifacts pass.

### N4. Add richer readiness and action evidence so common flows prove final state without fragile sleeps or extra agent roun...

- Status: complete
- Source task: T4
- Owner: unassigned
- Depends on: none
- Write scope: snippets/_builtin/, .hoyeon
- Parallel safe: yes
- Risk: medium
- Covers: R: R1, R3, R4; AC: AC3, AC6, AC7, AC8; V: V2, V3, V4, V5
- Evidence:
  - 2026-07-06T03:14:32.258Z: Added run waitFor/assertPage readiness proof with timeout diagnostics and current URL/title context; V2 validates waitFor/assertPage and V3 runtime smoke validates bundled form flow.

### N5. Add structured receipt and replay-hint artifacts with privacy-preserving redaction. Covers R4, R8, AC7, AC8, AC10, AC14.

- Status: complete
- Source task: T5
- Owner: unassigned
- Depends on: none
- Write scope: snippets/_builtin/, .hoyeon
- Parallel safe: yes
- Risk: medium
- Covers: R: R4, R8; AC: AC7, AC8, AC10, AC14; V: V1, V2, V3, V5
- Evidence:
  - 2026-07-06T03:14:38.482Z: Implemented run --receipt with safe local artifact path handling and redaction summaries; V2 validates no inline code or sensitive strings leak and V3/V4 receipt artifacts are recorded.

### N6. Strengthen profile and resource diagnosis across CLI, daemon health, status app, and activity data. Covers R5, AC5, A...

- Status: complete
- Source task: T6
- Owner: unassigned
- Depends on: none
- Write scope: snippets/_builtin/, .hoyeon
- Parallel safe: yes
- Risk: medium
- Covers: R: R5; AC: AC5, AC9, AC10; V: V2, V3, V4
- Evidence:
  - 2026-07-06T03:14:46.576Z: Added ps --json profile diagnostics plus health gate queue depth and resource telemetry; V2 validates ps JSON and resource guard behavior; V3/V4 benchmark resources capture running profile state.

### N7. Expand built-in snippets and skill guidance for extraction, infinite scroll, form flow, diagnostics, and assertion pa...

- Status: complete
- Source task: T7
- Owner: unassigned
- Depends on: none
- Write scope: snippets/_builtin/, .hoyeon
- Parallel safe: yes
- Risk: medium
- Covers: R: R1, R6, R8; AC: AC11, AC12, AC13; V: V1, V2, V3, V4, V5
- Evidence:
  - 2026-07-06T03:14:52.427Z: Added page-extract, form-flow, network-errors, and page-assert snippets; updated README/install/skills and CI snippet compilation; V2/V5 validate snippet contracts and docs.

### N8. Complete verification, documentation, package, and optional PR delivery hygiene. Covers R8, AC13, AC14, AC15, AC16.

- Status: complete
- Source task: T8
- Owner: unassigned
- Depends on: none
- Write scope: snippets/_builtin/, .hoyeon
- Parallel safe: yes
- Risk: medium
- Covers: R: R8; AC: AC13, AC14, AC15, AC16; V: V1, V2, V5, V6
- Evidence:
  - 2026-07-06T03:14:58.407Z: Updated help, docs, skills, CI, test.sh, package allowlist, and package version 0.11.0; V1 npm pack dry-run, V2 test suite, V5 doc check pass; V6 remains for PR delivery step.

## Rollups

- T1: nodes N1; AC AC1, AC2, AC14, AC15; Verification V1, V2, V4, V5
- T2: nodes N2; AC AC3, AC6, AC11, AC12, AC13; Verification V1, V2, V3, V4, V5
- T3: nodes N3; AC AC4, AC5, AC9, AC10; Verification V2, V3, V4
- T4: nodes N4; AC AC3, AC6, AC7, AC8; Verification V2, V3, V4, V5
- T5: nodes N5; AC AC7, AC8, AC10, AC14; Verification V1, V2, V3, V5
- T6: nodes N6; AC AC5, AC9, AC10; Verification V2, V3, V4
- T7: nodes N7; AC AC11, AC12, AC13; Verification V1, V2, V3, V4, V5
- T8: nodes N8; AC AC13, AC14, AC15, AC16; Verification V1, V2, V5, V6

## Trace Matrix

- T1: N N1; R R7, R8; AC AC1, AC2, AC14, AC15; required V V1, V2, V4, V5; optional V none
- T2: N N2; R R1, R3, R6; AC AC3, AC6, AC11, AC12, AC13; required V V1, V2, V3, V4, V5; optional V none
- T3: N N3; R R2, R5; AC AC4, AC5, AC9, AC10; required V V2, V3, V4; optional V none
- T4: N N4; R R1, R3, R4; AC AC3, AC6, AC7, AC8; required V V2, V3, V4, V5; optional V none
- T5: N N5; R R4, R8; AC AC7, AC8, AC10, AC14; required V V1, V2, V3, V5; optional V none
- T6: N N6; R R5; AC AC5, AC9, AC10; required V V2, V3, V4; optional V none
- T7: N N7; R R1, R6, R8; AC AC11, AC12, AC13; required V V1, V2, V3, V4, V5; optional V none
- T8: N N8; R R8; AC AC13, AC14, AC15, AC16; required V V1, V2, V5; optional V V6

## Gaps

- warning: weak_graph_no_dependencies execution-plan - Execution plan has five or more nodes and no dependencies; confirm this is genuinely parallelizable or record a deviation
- warning: weak_graph_repeated_write_scope execution-plan - Most execution nodes share the same write scope (snippets/_builtin/
.hoyeon); narrow scopes before relying on parallel guidance
