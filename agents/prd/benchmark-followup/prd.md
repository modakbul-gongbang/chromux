---
topic: "benchmark-followup"
status: "ready"
human_approval: "approved"
source_intake: "current conversation"
source_clarity: "none"
created_at: "2026-07-12"
updated_at: "2026-07-12"
---

# PRD: Benchmark Follow-Up

## 1. Summary

PR #13 이후 남은 chromux 벤치마크 follow-up을 같은 런 비교 원칙으로 닫는다.
필수 범위는 Sonnet 5 12태스크 재측정, benchmark 문서 갱신, post-v2 태스크의 공식 3-도구 비교 편입, README와 doc-check 동기화, 검증 및 PR delivery이다.
이 PRD는 새 브라우저 액션 기능이나 외부 벤치마크 통합을 바로 구현하지 않는다.
외부 벤치마크 채택안과 좌표 액션 레이어 로드맵은 후속 PRD 후보로 보존한다.

Approval checklist:

- Approve scope boundary in Section 3: benchmark 재측정과 문서화가 in scope이고, WebGames, REAL, WebArena, 좌표 액션 레이어 구현은 non-goal이다.
- Approve cost-bearing benchmark policy in Sections 4 and 9: Sonnet 12태스크 2-도구 런과 Opus 20태스크 3-도구 런을 승인하되, 예상 비용이 승인 cap을 넘으면 실행 전 중단하고 보고한다.
- Approve same-run publication rule in Sections 4, 6, and 11: 서로 다른 날짜나 다른 런의 셀을 한 비교 표에 섞지 않는다.
- Approve technical structure in Section 5: 기존 harness와 문서 체계를 유지하고, 필요할 때만 benchmark helper와 doc-check needle을 작게 수정한다.
- Approve verification modes in Section 9: repo static checks, harness smoke, cost-bearing benchmark reports, browser test suite, package dry-run, PR and CI evidence로 닫는다.
- Approve delivery mode: pr, using the legacy `.hoyeon/config.json` defaults only after explicit PRD approval.

## 2. Problem, Goal, And Users

`docs/benchmark-2026-07.md`는 0.18.0 직후의 최신 상태를 일부만 반영한다.
Sonnet 5 섹션은 기존 전체 12태스크 런이 0.17.0 인지 업그레이드 이전 측정이고, 0.18.0 재측정은 MiniWoB 2태스크만 끝났다고 공개한다.
또 0.18.0에서 추가된 post-v2 8태스크는 harness에는 있지만 공식 3-도구 비교 표에는 아직 들어가지 않았다.
이 상태가 오래 남으면 README와 benchmark 문서가 chromux 0.18.0의 실제 비교 근거를 덜 정확하게 전달한다.

목표는 측정과 문서의 기준점을 다시 맞추는 것이다.
Sonnet 5 12태스크는 최소 chromux와 @playwright/cli를 같은 런에서 다시 재고, 이전 표를 이력으로 보존하면서 새 0.18.0 표를 추가한다.
post-v2 8태스크는 기존 12태스크와 합쳐 Opus 기준 20태스크 3-도구 같은 런으로 공식 표에 편입한다.
모든 공개 수치는 같은 런에서 나온 값만 비교하고, 비용, 모델, 도구 버전, reps, 세션 수, live-site 한계를 문서에 남긴다.

주요 사용자는 chromux를 browser automation tool로 평가하는 agent와 maintainer이다.
두 번째 사용자는 README나 benchmark 문서를 보고 chromux, agent-browser, @playwright/cli의 비용, 성공률, 토큰, 시간 차이를 판단하는 reviewer이다.

## 3. Scope And Non-Goals

In scope:

- `benchmarks/agent-compare-benchmark.mjs`의 `buildTasks`를 태스크 정의의 유일한 코드 기준으로 재확인한다.
- Sonnet 5 기준 원래 12태스크 스위트를 0.18.0 상태에서 다시 측정한다.
- Sonnet 5 재측정의 필수 도구는 chromux와 @playwright/cli이다.
- Sonnet 5에서 agent-browser 포함은 비용과 목적을 검토해 문서에 명시하되, 기본 필수 범위는 아니다.
- post-v2 8태스크를 포함한 20태스크 Opus 3-도구 같은 런을 수행하고 공식 비교 표를 재구성한다.
- `docs/benchmark-2026-07.md`의 Sonnet 섹션, post-v2 표기, 공식 비교 표, aggregate, limitation, reproduction 문구를 최신 결과에 맞춘다.
- README의 "How it compares"와 Token Footprint 설명은 수치가 유의미하게 움직였을 때만 갱신한다.
- README나 skills의 benchmark 문구가 바뀌면 `benchmarks/chromux-doc-check.mjs` needle을 동기화한다.
- benchmark report JSON, command traces, versions, reps, costs, session counts, and live-site limitations를 증거로 남긴다.
- PR delivery 기본값은 legacy `.hoyeon/config.json`의 `mode: pr`, `branchPrefix: prd`, `baseBranch: main`, `ci.watch: true`를 따른다.

Non-goals:

- WebGames, REAL, WebArena, WebChoreArena, ST-WebAgentBench 통합을 이번 PRD에서 구현하지 않는다.
- DPR 보정, `hover`, `drag`, contenteditable routing, cross-origin iframe OOPIF handling, canvas/WebGL vision loop를 이번 PRD에서 구현하지 않는다.
- benchmark task를 유리하게 바꾸거나 외부 사이트 task로 튜닝하지 않는다.
- 스킬 예시에 fixture literal을 넣지 않는다.
- benchmark 수치를 같은 런이 아닌 셀끼리 섞지 않는다.
- MiniWoB나 외부 benchmark의 machine grading을 model judgment로 대체하지 않는다.
- npm publish, tag, GitHub Release, registry release를 하지 않는다.
- branch, commit, PR title에 AI agent, model, vendor name을 넣지 않는다.
- unrelated untracked `.hoyeon/intake/chromux-memory-credential-search/`를 건드리거나 커밋하지 않는다.

## 4. Pre-Work And Required Decisions

### 4.1 Pre-Work Before Implementation

- Confirm the active checkout, base branch, and latest `main` state before running expensive benchmarks, because the handoff names `main@7e2dbf4` but this checkout currently reports `prd/cross-tool-benchmark`.
- Inspect `git status --short` and keep unrelated untracked `.hoyeon/intake/chromux-memory-credential-search/` out of the work.
- Read `AGENTS.md`, `README.md`, `docs/benchmark-2026-07.md`, `benchmarks/agent-compare-benchmark.mjs`, `benchmarks/compare-benchmark.mjs`, `benchmarks/fixtures.mjs`, `benchmarks/miniwob.mjs`, `benchmarks/chromux-doc-check.mjs`, `package.json`, `install.md`, `skills/chromux/SKILL.md`, and `skills/chromux-work/SKILL.md`.
- Reconfirm actual benchmark CLI flags from `benchmarks/agent-compare-benchmark.mjs` before launching cost-bearing runs.
- Confirm local `claude` CLI authentication, Google Chrome availability, network access, and npm install access before cost-bearing benchmark runs.
- Estimate session count and expected cost before each full run and stop for human approval if the estimate exceeds the approved cap.
- Preserve raw benchmark reports in stable local artifacts and cite the exact report path in the implementation result.

### 4.2 Human Decisions Before PRD Approval

- Approve running a cost-bearing Sonnet 5 12-task same-run comparison for chromux and @playwright/cli.
- Approve excluding agent-browser from the required Sonnet 5 rerun unless the executor can justify the added cost before launch and the user approves that expansion.
- Approve running one Opus 20-task 3-tool same-run comparison for the official expanded table, with an expected target around 30 USD and a hard stop for renewed approval if the estimate exceeds 40 USD.
- Approve PR delivery mode using `.hoyeon/config.json` defaults after implementation receipt is complete.
- Approve that live external tasks such as Google, YouTube, Hacker News, and Wikipedia may fail or vary because of current live-site behavior, and that those failures must be reported as measured rather than hand-corrected.
- Approve that external benchmark adoption and browser capability gap implementation are deferred to later PRDs.

### 4.3 Decision Traceability For Fidelity Review

- User request: "이거 보고 $ho-spec 고고" using `/private/tmp/claude-501/-Users-hoyeonlee-team-attention-chromux/76e875de-00ac-4a0a-a6d9-dcdc79ccb421/scratchpad/benchmark-followup-handoff.md` | accepted | represented by R1-R8, AC1-AC8, T1-T7, V1-V8.
- Handoff decision: task definitions are sourced from `benchmarks/agent-compare-benchmark.mjs` `buildTasks`, not from the prose table | accepted | represented by R1, AC1, T1, V1.
- Handoff decision: publish only same-run comparisons and never mix cells from different dates or runs | accepted | represented by R2-R5, AC2-AC5, T2-T5, V3-V5, Guardrails.
- Handoff decision: Sonnet 5 full 12-task rerun is required because the public Sonnet table is partly stale for 0.18.0 | accepted | represented by R2-R3, AC2-AC3, T2-T3, V3.
- Handoff decision: post-v2 8 tasks must enter the official 3-tool table only through a full expanded same-run | accepted | represented by R4-R5, AC4-AC5, T4, V4.
- Handoff decision: external benchmark adoption order is WebGames, REAL, then WebArena-family | deferred | represented by Non-goals, Risks, and Result Report follow-up candidates.
- Handoff decision: coordinate action layer improvements are a likely next P0 but are not part of this benchmark follow-up | deferred | represented by Non-goals and Guardrails.
- Repo delivery default: `.hoyeon/config.json` uses PR delivery with CI watch | accepted subject to approval | represented by R8, AC8, T7, V8.
- Repo rule: npm publish is manual only and not part of this task | rejected for current scope | represented by Non-goals and Guardrails.

## 5. Major Technical Structure Changes

No major runtime architecture change is expected.
The existing zero-dependency CLI, raw CDP daemon, benchmark harnesses, and fixture servers remain the foundation.

Expected structural changes are limited to benchmark and documentation surfaces:

- `docs/benchmark-2026-07.md` will gain updated same-run result sections and lose stale "not re-run" wording.
- README benchmark summary may change if the new official table materially changes headline claims.
- `benchmarks/chromux-doc-check.mjs` may gain or update needles so README, benchmark docs, help, and skills do not drift.
- `benchmarks/agent-compare-benchmark.mjs` may receive a small harness-only fix if current flags, report metadata, or task selection cannot express the approved runs.
- No new browser action verb, no new runtime dependency, no external benchmark adapter, no DB, no auth, no production service, and no release pipeline change are expected.

## 6. Requirements

- R1. Baseline correctness. The executor must verify current repo state, task list, package version, harness flags, and documentation baseline before measurement.
- R2. Sonnet rerun. The executor must run a Sonnet 5 12-task same-run comparison for chromux 0.18.0 and @playwright/cli, with model, tools, versions, reps, sessions, cost, and raw report path recorded.
- R3. Sonnet documentation. `docs/benchmark-2026-07.md` must preserve older Sonnet data as history and add the new 0.18.0 same-run Sonnet table, including 12-task aggregate and MiniWoB-excluded aggregate.
- R4. Expanded official run. The executor must run one approved Opus 20-task 3-tool same-run comparison that includes the original 12 tasks plus the 8 post-v2 tasks from `buildTasks`.
- R5. Expanded documentation. The post-v2 tasks must be removed from the "added post-v2 but not official" state only when the expanded same-run report exists, and the official table must state run date, model, reps, versions, sessions, cost, and live-site caveats.
- R6. README and drift checks. README, skills, and doc-check needles must be updated when benchmark claims or command guidance change, and left untouched when the benchmark doc change does not affect those surfaces.
- R7. Verification and package hygiene. The completed change must pass repo-required checks and must not publish, tag, release, or include unrelated artifacts.
- R8. Delivery. The completed implementation must be shippable through PR delivery, with branch, PR URL, diff scope, and CI status reported.

## 7. Acceptance Criteria

- AC1. The implementation report lists the exact 20 current task IDs from `buildTasks` and identifies the 12 official v2 tasks versus the 8 post-v2 tasks.
- AC2. A Sonnet 5 report artifact exists for the approved 12-task same-run, and its per-session records include enough data to inspect high-turn or high-token chromux sessions through their command traces.
- AC3. The Sonnet section in `docs/benchmark-2026-07.md` no longer claims that the rest of the table has not been re-run when the new report exists.
- AC4. An Opus report artifact exists for the approved 20-task 3-tool same-run, or implementation status is `Blocked` with a cost, auth, network, or live-site blocker before any mixed-run table is published.
- AC5. The official benchmark table includes post-v2 tasks only from the expanded same-run and does not mix historical cells into the new official comparison.
- AC6. README and `benchmarks/chromux-doc-check.mjs` are consistent with the final benchmark claims, and unchanged surfaces are explicitly reported as intentionally unchanged.
- AC7. `node chromux.mjs help`, `bash ./test.sh`, `node benchmarks/chromux-doc-check.mjs`, and `npm pack --dry-run` pass after changes.
- AC8. PR delivery evidence includes branch name, PR URL, changed file list, CI status, and confirmation that no unrelated `.hoyeon` intake artifacts were included.

## 8. PRD-Level Tasks

- T1. Reconcile current repo baseline, task list, harness flags, version, docs, and delivery config before measurement. Covers R1, AC1.
- T2. Run the approved Sonnet 5 12-task same-run and inspect report-level command traces for high-cost chromux sessions. Covers R2, AC2.
- T3. Update the Sonnet section and aggregates in `docs/benchmark-2026-07.md` using only the new same-run data. Covers R3, AC3.
- T4. Run the approved Opus 20-task 3-tool same-run or stop with a documented blocker before publishing any expanded official table. Covers R4, AC4.
- T5. Update the official benchmark table and post-v2 task wording only from the expanded same-run report. Covers R5, AC5.
- T6. Sync README, skills, and `benchmarks/chromux-doc-check.mjs` when benchmark claims or guidance changed, then run local verification. Covers R6-R7, AC6-AC7.
- T7. Prepare PR delivery evidence with a clean diff and CI status, without publishing or staging unrelated artifacts. Covers R8, AC8.

## 9. Verification Contract

### 9.1 Test Mode Contract

| Mode | Required For Done | Covers | Human Decision |
| --- | --- | --- | --- |
| build/static | yes | CLI help, docs drift, package surface, shell-level repo health | none |
| automated behavior | yes | benchmark harness smoke and doc-check regression coverage | none |
| benchmark/live-agent | yes | approved Sonnet and Opus same-run benchmark reports | cost, auth, network, and live-site approval required |
| browser/runtime | yes | full chromux browser suite after docs or harness changes | none |
| delivery/CI | no/blockable | PR URL, diff scope, and GitHub CI after implementation receipt | final merge remains human-owned |

### 9.2 Required Agent Verification

| ID | Mode | Covers | Method | Artifact | Pass Criteria | Environment | Required For Done | Can Be Blocked | Safe Probe | Live Proof | Side Effect | Sensitive Data Policy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V1 | build/static | R1, R6-R7, AC1, AC6-AC7, T1, T6 | `node chromux.mjs help` | command-log | command exits 0 and public help remains the source of truth for current CLI syntax | local shell, Node 22 or newer | yes | no | local CLI only | command log | none | no secrets |
| V2 | automated behavior | R1, R6-R7, AC1, AC6-AC7, T1, T6 | `node benchmarks/chromux-doc-check.mjs` | command-log | command exits 0 and doc needles prove README, help, benchmark docs, and skills stay synchronized | local shell | yes | no | local docs check only | command log | none | no secrets |
| V3 | benchmark/live-agent | R2-R3, AC2-AC3, T2-T3 | `node benchmarks/agent-compare-benchmark.mjs --model claude-sonnet-5 --tools chromux,playwright-cli --tasks form-order,feed-extract,nav-tour,sequential-steps,inventory-aggregate,signup-challenge,hn-top-story,wikipedia-hop,google-search,youtube-search,miniwob-email-inbox,miniwob-book-flight --out /tmp/chromux-sonnet-12-rerun.json` | benchmark-report-json | report exists, covers the 12 approved tasks, records versions, reps, sessions, costs, and per-session command traces, and docs use only this same-run data for the new Sonnet table | authenticated `claude` CLI, Google Chrome, network, npm install access | yes | yes | stop before launch if estimated cost exceeds approved cap | report JSON and command log | launches agent sessions, installs competitor CLI packages in temp prefix, visits public sites | do not print secrets, redact tokens, do not publish raw account data |
| V4 | benchmark/live-agent | R4-R5, AC4-AC5, T4-T5 | `node benchmarks/agent-compare-benchmark.mjs --model claude-opus-4-8 --tools chromux,agent-browser,playwright-cli --tasks form-order,feed-extract,nav-tour,sequential-steps,inventory-aggregate,signup-challenge,shop-cookie-select,slow-order,iframe-register,miniwob-email-inbox,miniwob-book-flight,miniwob-use-autocomplete,miniwob-login-user,miniwob-search-engine,miniwob-click-checkboxes,wikipedia-extract,hn-top-story,wikipedia-hop,google-search,youtube-search --out /tmp/chromux-opus-20-expanded.json` | benchmark-report-json | report exists, covers all 20 current tasks, records versions, reps, sessions, costs, and docs promote post-v2 tasks only from this same-run report | authenticated `claude` CLI, Google Chrome, network, npm install access | yes | yes | stop before launch if estimated cost exceeds approved cap or if auth/network setup is missing | report JSON and command log | launches agent sessions, installs competitor CLI packages in temp prefix, visits public sites | do not print secrets, redact tokens, do not publish raw account data |
| V5 | automated behavior | R1-R7, AC1-AC7, T1-T6 | `node benchmarks/agent-compare-benchmark.mjs --smoke --model claude-haiku-4-5-20251001 --out /tmp/chromux-agent-compare-smoke.json` | benchmark-report-json | smoke report exists and proves the harness still launches a cheap machine-graded task after any harness or docs-adjacent changes | authenticated `claude` CLI, Google Chrome, network, npm install access | yes | yes | one cheap smoke task only | report JSON and command log | launches one or more local benchmark sessions and installs temp competitor packages | do not print secrets, redact tokens |
| V6 | browser/runtime | R7, AC7, T6 | `bash ./test.sh` | command-log | full chromux browser test suite exits 0 after benchmark docs or harness changes | local shell with Google Chrome | yes | no | isolated test profiles | command log | launches and closes local Chrome profiles, may fetch configured public test hosts | no secrets |
| V7 | build/static | R7, AC7, T6-T7 | `npm pack --dry-run` | command-log | command exits 0 and tarball includes only the package allowlist from `package.json` | local shell, npm | yes | no | package dry-run only | command log | no publish | no secrets |
| V8 | delivery/CI | R8, AC8, T7 | `git status --short && gh pr view --json url,headRefName,statusCheckRollup` | command-log | changed file list excludes unrelated `.hoyeon` intake artifacts, PR URL exists after ship, and required CI status is reported as pass or explicitly blocked | authenticated GitHub CLI after receipt | no | yes | PR status read and diff inspection | PR URL, changed files, CI status | may push branch and open PR during ship stage | do not include secrets or local-only paths in PR body |

### 9.3 Human Verification

- Human review must approve the benchmark cost policy before `ho-build` executes cost-bearing runs.
- Human review must judge whether the final README headline still reflects the intended product positioning after the new numbers.
- Human review owns final PR merge and any future decision to start a separate external benchmark or coordinate-action PRD.

## 10. Risks And Open Decisions

- Risk: cost-bearing benchmark runs can exceed the rough estimate because session count, model behavior, live-site friction, or retries change.
Mitigation: estimate before launch, stop above the approved cap, and report blocked rather than silently continuing.
- Risk: live sites can vary or block tools, especially Google and YouTube.
Mitigation: publish measured failures with date, model, versions, and live-site caveat rather than hand-correcting.
- Risk: task prose table can drift from `buildTasks`.
Mitigation: treat `buildTasks` as source of truth and update docs from code plus report JSON.
- Risk: benchmark docs can overstate chromux by mixing cells from different runs.
Mitigation: same-run-only rule is a guardrail and acceptance criterion.
- Risk: smoke or full benchmark runs can be blocked by missing `claude` auth, Chrome, network, or npm install access.
Mitigation: run pre-work checks first and return `Blocked` with exact missing prerequisite.
- Risk: README headline may need product judgment if the new expanded table moves materially.
Mitigation: require human review for final headline copy.
- Open decision: none blocking beyond human PRD approval and benchmark cost approval embedded in that approval.

## 11. Implementation Guardrails

- Do not publish any comparison table that mixes cells from different benchmark runs.
- Do not tune chromux on external or third-party tasks during this PRD.
- Do not change benchmark grading from machine grading to model judgment.
- Do not add fixture literal answers to skills or benchmark guidance.
- Do not implement WebGames, REAL, WebArena, coordinate-action, DPR, hover, drag, contenteditable, OOPIF, or canvas features in this PRD.
- Do not add runtime npm dependencies.
- Do not run `npm publish`, create a tag, create a release, or bump package version unless the user separately approves a release-intended change.
- Do not include AI agent, model, or vendor names in branch, commit, or PR title.
- Do not stage unrelated `.hoyeon/intake/chromux-memory-credential-search/`.
- Do not use local-only `/Users/...`, `file://`, or unpushed artifact paths as the only PR body evidence.

## 12. Implementation Result Report Contract

The implementing agent must report:

- Status: `Done`, `Partially Done`, or `Blocked`.
- User-visible benchmark and documentation changes.
- Changed docs, benchmark scripts, skills, README, and doc-check files.
- Whether the approved technical structure was followed without runtime architecture expansion.
- Task completion status for T1-T7.
- R/AC/V coverage, including any blocked benchmark verification.
- Verification evidence grouped by build/static, automated behavior, benchmark/live-agent, browser/runtime, and delivery/CI.
- Raw benchmark report paths, report hashes, model names, tool versions, reps, session counts, cost totals, and exact task IDs.
- Automated tests or doc-check needles added or updated, including the regression risk each protects.
- Delivery evidence: branch, PR URL, changed file list, CI status, and any retry or blocked state.
- Deviations from the PRD, especially any skipped run, changed reps, added tool, excluded tool, or budget stop.
- Remaining human review for README headline judgment, PR merge, and future external benchmark or capability-gap PRDs.
- Not-done items and follow-up candidates, including WebGames integration, REAL validation, WebArena-family infrastructure, DPR/hover/drag, contenteditable, and OOPIF tiers.
