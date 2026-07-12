# Verification

PRD: agents/prd/benchmark-followup/prd.md

## V1. General

- Status: pass
- Source: verification_matrix
- Check: Mode: build/static. Covers: R1, R6-R7, AC1, AC6-AC7, T1, T6. Check: `node chromux.mjs help`. Artifact: command-log. Pass: command exits 0 and public help remains the source of truth for current CLI syntax. Environment: local shell, Node 22 or newer. Required For Done: yes. Can Be Blocked: no. Safe Probe: local CLI only. Live Proof: command log. Side Effect: none. Sensitive Data Policy: no secrets.
- Evidence:
  - 2026-07-12T16:25:17.744Z: Artifact recorded: command-log agents/implement/benchmark-followup/artifacts/logs/V1-2026-07-12T16-25-17-742Z.log (f909c0e9c6ea) - verify-run passed: node chromux.mjs help
  - 2026-07-12T16:25:17.744Z: Command passed with exit code 0: node chromux.mjs help. Log: agents/implement/benchmark-followup/artifacts/logs/V1-2026-07-12T16-25-17-742Z.log
- Artifacts:
  - command-log: agents/implement/benchmark-followup/artifacts/logs/V1-2026-07-12T16-25-17-742Z.log (f909c0e9c6ea)

## V2. General

- Status: pass
- Source: verification_matrix
- Check: Mode: automated behavior. Covers: R1, R6-R7, AC1, AC6-AC7, T1, T6. Check: `node benchmarks/chromux-doc-check.mjs`. Artifact: command-log. Pass: command exits 0 and doc needles prove README, help, benchmark docs, and skills stay synchronized. Environment: local shell. Required For Done: yes. Can Be Blocked: no. Safe Probe: local docs check only. Live Proof: command log. Side Effect: none. Sensitive Data Policy: no secrets.
- Evidence:
  - 2026-07-12T16:25:21.955Z: Artifact recorded: command-log agents/implement/benchmark-followup/artifacts/logs/V2-2026-07-12T16-25-21-953Z.log (7be696aa81b3) - verify-run failed: node benchmarks/chromux-doc-check.mjs
  - 2026-07-12T16:25:21.955Z: Command failed with exit code 1: node benchmarks/chromux-doc-check.mjs. Log: agents/implement/benchmark-followup/artifacts/logs/V2-2026-07-12T16-25-21-953Z.log
  - 2026-07-12T16:25:43.575Z: Artifact recorded: command-log agents/implement/benchmark-followup/artifacts/logs/V2-2026-07-12T16-25-43-574Z.log (aa4e15509ac6) - verify-run passed: node benchmarks/chromux-doc-check.mjs
  - 2026-07-12T16:25:43.575Z: Command passed with exit code 0: node benchmarks/chromux-doc-check.mjs. Log: agents/implement/benchmark-followup/artifacts/logs/V2-2026-07-12T16-25-43-574Z.log
- Artifacts:
  - command-log: agents/implement/benchmark-followup/artifacts/logs/V2-2026-07-12T16-25-21-953Z.log (7be696aa81b3)
  - command-log: agents/implement/benchmark-followup/artifacts/logs/V2-2026-07-12T16-25-43-574Z.log (aa4e15509ac6)

## V3. General

- Status: pass
- Source: verification_matrix
- Check: Mode: benchmark/live-agent. Covers: R2-R3, AC2-AC3, T2-T3. Check: `node benchmarks/agent-compare-benchmark.mjs --model claude-sonnet-5 --tools chromux,playwright-cli --tasks form-order,feed-extract,nav-tour,sequential-steps,inventory-aggregate,signup-challenge,hn-top-story,wikipedia-hop,google-search,youtube-search,miniwob-email-inbox,miniwob-book-flight --out /tmp/chromux-sonnet-12-rerun.json`. Artifact: benchmark-report-json. Pass: report exists, covers the 12 approved tasks, records versions, reps, sessions, costs, and per-session command traces, and docs use only this same-run data for the new Sonnet table. Environment: authenticated `claude` CLI, Google Chrome, network, npm install access. Required For Done: yes. Can Be Blocked: yes. Safe Probe: stop before launch if estimated cost exceeds approved cap. Live Proof: report JSON and command log. Side Effect: launches agent sessions, installs competitor CLI packages in temp prefix, visits public sites. Sensitive Data Policy: do not print secrets, redact tokens, do not publish raw account data.
- Evidence:
  - 2026-07-12T15:06:42.716Z: Artifact recorded: api agents/implement/benchmark-followup/artifacts/api/chromux-sonnet-12-rerun.json (9bafa342cff5) - Sonnet 5 same-run raw report for 12 tasks across chromux and playwright-cli, 2/1 reps, 40 sessions, with per-session commands and machine grading.
  - 2026-07-12T15:07:06.667Z: Registered API artifact agents/implement/benchmark-followup/artifacts/api/chromux-sonnet-12-rerun.json sha256 9bafa342cff5fb20ec6084e478e2fda762cef916cc94635fecb1cc2b180ea688; 12 tasks, 2 tools, 40 sessions, 39 passed, .1543, per-session command traces present.
  - 2026-07-12T16:37:37.148Z: Artifact recorded: command-log agents/implement/benchmark-followup/artifacts/logs/V3-2026-07-12T16-37-37-147Z.log (c095a1dd5be8) - verify-run passed: node -e 'const r=require("./agents/implement/benchmark-followup/artifacts/api/chromux-sonnet-12-rerun.json"); const tasks=new Set(r.results.map(x=>x.task)); const tools=new Set(r.results.map(x=>x.tool)); if(r.model!=="claude-sonnet-5"||r.repsLocal!==2||r.repsExternal!==1||r.results.length!==40||tasks.size!==12||tools.size!==2) process.exit(1); console.log(JSON.stringify({ok:true,sessions:r.results.length,tasks:tasks.size,tools:[...tools],cost:Object.values(r.summary).reduce((n,x)=>n+x.overall.totalCostUsd,0)}));'
  - 2026-07-12T16:37:37.149Z: Command passed with exit code 0: node -e 'const r=require("./agents/implement/benchmark-followup/artifacts/api/chromux-sonnet-12-rerun.json"); const tasks=new Set(r.results.map(x=>x.task)); const tools=new Set(r.results.map(x=>x.tool)); if(r.model!=="claude-sonnet-5"||r.repsLocal!==2||r.repsExternal!==1||r.results.length!==40||tasks.size!==12||tools.size!==2) process.exit(1); console.log(JSON.stringify({ok:true,sessions:r.results.length,tasks:tasks.size,tools:[...tools],cost:Object.values(r.summary).reduce((n,x)=>n+x.overall.totalCostUsd,0)}));'. Log: agents/implement/benchmark-followup/artifacts/logs/V3-2026-07-12T16-37-37-147Z.log
- Artifacts:
  - api: agents/implement/benchmark-followup/artifacts/api/chromux-sonnet-12-rerun.json (9bafa342cff5)
  - command-log: agents/implement/benchmark-followup/artifacts/logs/V3-2026-07-12T16-37-37-147Z.log (c095a1dd5be8)

## V4. General

- Status: pass
- Source: verification_matrix
- Check: Mode: benchmark/live-agent. Covers: R4-R5, AC4-AC5, T4-T5. Check: `node benchmarks/agent-compare-benchmark.mjs --model claude-opus-4-8 --tools chromux,agent-browser,playwright-cli --tasks form-order,feed-extract,nav-tour,sequential-steps,inventory-aggregate,signup-challenge,shop-cookie-select,slow-order,iframe-register,miniwob-email-inbox,miniwob-book-flight,miniwob-use-autocomplete,miniwob-login-user,miniwob-search-engine,miniwob-click-checkboxes,wikipedia-extract,hn-top-story,wikipedia-hop,google-search,youtube-search --out /tmp/chromux-opus-20-expanded.json`. Artifact: benchmark-report-json. Pass: report exists, covers all 20 current tasks, records versions, reps, sessions, costs, and docs promote post-v2 tasks only from this same-run report. Environment: authenticated `claude` CLI, Google Chrome, network, npm install access. Required For Done: yes. Can Be Blocked: yes. Safe Probe: stop before launch if estimated cost exceeds approved cap or if auth/network setup is missing. Live Proof: report JSON and command log. Side Effect: launches agent sessions, installs competitor CLI packages in temp prefix, visits public sites. Sensitive Data Policy: do not print secrets, redact tokens, do not publish raw account data.
- Evidence:
  - 2026-07-12T16:19:50.672Z: Artifact recorded: api agents/implement/benchmark-followup/artifacts/api/chromux-opus-20-expanded.json (85722fe6a57f) - Opus expanded 20-task same-run report: 3 tools, reduced 2/1 reps, 105 per-session records, 102 passed, 18.45 USD total
  - 2026-07-12T16:20:26.927Z: Registered API report agents/implement/benchmark-followup/artifacts/api/chromux-opus-20-expanded.json (sha256 85722fe6a57f3361201c79b9c5a33d897d0d5ccb32c412752a422e40e6a84f46): 105 same-run sessions, 102 passed, 18.45 USD; chromux 35/35, agent-browser 33/35, playwright-cli 34/35
  - 2026-07-12T16:37:48.962Z: Artifact recorded: command-log agents/implement/benchmark-followup/artifacts/logs/V4-2026-07-12T16-37-48-961Z.log (bb9d4b608f92) - verify-run passed: node -e 'const r=require("./agents/implement/benchmark-followup/artifacts/api/chromux-opus-20-expanded.json"); const tasks=new Set(r.results.map(x=>x.task)); const tools=new Set(r.results.map(x=>x.tool)); if(r.model!=="claude-opus-4-8"||r.repsLocal!==2||r.repsExternal!==1||r.results.length!==105||tasks.size!==20||tools.size!==3) process.exit(1); console.log(JSON.stringify({ok:true,sessions:r.results.length,tasks:tasks.size,tools:[...tools],cost:Object.values(r.summary).reduce((n,x)=>n+x.overall.totalCostUsd,0)}));'
  - 2026-07-12T16:37:48.963Z: Command passed with exit code 0: node -e 'const r=require("./agents/implement/benchmark-followup/artifacts/api/chromux-opus-20-expanded.json"); const tasks=new Set(r.results.map(x=>x.task)); const tools=new Set(r.results.map(x=>x.tool)); if(r.model!=="claude-opus-4-8"||r.repsLocal!==2||r.repsExternal!==1||r.results.length!==105||tasks.size!==20||tools.size!==3) process.exit(1); console.log(JSON.stringify({ok:true,sessions:r.results.length,tasks:tasks.size,tools:[...tools],cost:Object.values(r.summary).reduce((n,x)=>n+x.overall.totalCostUsd,0)}));'. Log: agents/implement/benchmark-followup/artifacts/logs/V4-2026-07-12T16-37-48-961Z.log
- Artifacts:
  - api: agents/implement/benchmark-followup/artifacts/api/chromux-opus-20-expanded.json (85722fe6a57f)
  - command-log: agents/implement/benchmark-followup/artifacts/logs/V4-2026-07-12T16-37-48-961Z.log (bb9d4b608f92)

## V5. General

- Status: pass
- Source: verification_matrix
- Check: Mode: automated behavior. Covers: R1-R7, AC1-AC7, T1-T6. Check: `node benchmarks/agent-compare-benchmark.mjs --smoke --model claude-haiku-4-5-20251001 --out /tmp/chromux-agent-compare-smoke.json`. Artifact: benchmark-report-json. Pass: smoke report exists and proves the harness still launches a cheap machine-graded task after any harness or docs-adjacent changes. Environment: authenticated `claude` CLI, Google Chrome, network, npm install access. Required For Done: yes. Can Be Blocked: yes. Safe Probe: one cheap smoke task only. Live Proof: report JSON and command log. Side Effect: launches one or more local benchmark sessions and installs temp competitor packages. Sensitive Data Policy: do not print secrets, redact tokens.
- Evidence:
  - 2026-07-12T14:42:19.581Z: Artifact recorded: command-log agents/implement/benchmark-followup/artifacts/logs/V5-2026-07-12T14-42-19-579Z.log (0e2bdc4386a6) - verify-run passed: node benchmarks/agent-compare-benchmark.mjs --smoke --model claude-haiku-4-5-20251001 --out /tmp/chromux-agent-compare-smoke.json
  - 2026-07-12T14:42:19.582Z: Command passed with exit code 0: node benchmarks/agent-compare-benchmark.mjs --smoke --model claude-haiku-4-5-20251001 --out /tmp/chromux-agent-compare-smoke.json. Log: agents/implement/benchmark-followup/artifacts/logs/V5-2026-07-12T14-42-19-579Z.log
  - 2026-07-12T14:42:46.074Z: Artifact recorded: api agents/implement/benchmark-followup/artifacts/api/chromux-agent-compare-smoke.json (0997feef9205) - Machine-graded smoke report for one form-order session per tool, including versions, costs, and session records.
- Artifacts:
  - command-log: agents/implement/benchmark-followup/artifacts/logs/V5-2026-07-12T14-42-19-579Z.log (0e2bdc4386a6)
  - api: agents/implement/benchmark-followup/artifacts/api/chromux-agent-compare-smoke.json (0997feef9205)

## V6. General

- Status: pass
- Source: verification_matrix
- Check: Mode: browser/runtime. Covers: R7, AC7, T6. Check: `bash ./test.sh`. Artifact: command-log. Pass: full chromux browser test suite exits 0 after benchmark docs or harness changes. Environment: local shell with Google Chrome. Required For Done: yes. Can Be Blocked: no. Safe Probe: isolated test profiles. Live Proof: command log. Side Effect: launches and closes local Chrome profiles, may fetch configured public test hosts. Sensitive Data Policy: no secrets.
- Evidence:
  - 2026-07-12T16:28:37.743Z: Artifact recorded: command-log agents/implement/benchmark-followup/artifacts/logs/V6-2026-07-12T16-28-37-741Z.log (f933c72eee2b) - verify-run passed: bash ./test.sh
  - 2026-07-12T16:28:37.743Z: Command passed with exit code 0: bash ./test.sh. Log: agents/implement/benchmark-followup/artifacts/logs/V6-2026-07-12T16-28-37-741Z.log
  - 2026-07-12T16:28:54.365Z: Artifact recorded: browser agents/implement/benchmark-followup/artifacts/browser/V6-test-suite.log (f933c72eee2b) - Complete real Chrome ./test.sh transcript proving behavioral suite pass and browser cleanup
- Artifacts:
  - command-log: agents/implement/benchmark-followup/artifacts/logs/V6-2026-07-12T16-28-37-741Z.log (f933c72eee2b)
  - browser: agents/implement/benchmark-followup/artifacts/browser/V6-test-suite.log (f933c72eee2b)

## V7. General

- Status: pass
- Source: verification_matrix
- Check: Mode: build/static. Covers: R7, AC7, T6-T7. Check: `npm pack --dry-run`. Artifact: command-log. Pass: command exits 0 and tarball includes only the package allowlist from `package.json`. Environment: local shell, npm. Required For Done: yes. Can Be Blocked: no. Safe Probe: package dry-run only. Live Proof: command log. Side Effect: no publish. Sensitive Data Policy: no secrets.
- Evidence:
  - 2026-07-12T16:29:00.418Z: Artifact recorded: command-log agents/implement/benchmark-followup/artifacts/logs/V7-2026-07-12T16-29-00-417Z.log (db3136d2bc26) - verify-run passed: npm pack --dry-run
  - 2026-07-12T16:29:00.418Z: Command passed with exit code 0: npm pack --dry-run. Log: agents/implement/benchmark-followup/artifacts/logs/V7-2026-07-12T16-29-00-417Z.log
- Artifacts:
  - command-log: agents/implement/benchmark-followup/artifacts/logs/V7-2026-07-12T16-29-00-417Z.log (db3136d2bc26)

## V8. General

- Status: skipped
- Source: verification_matrix
- Check: Mode: delivery/CI. Covers: R8, AC8, T7. Check: `git status --short && gh pr view --json url,headRefName,statusCheckRollup`. Artifact: command-log. Pass: changed file list excludes unrelated `.hoyeon` intake artifacts, PR URL exists after ship, and required CI status is reported as pass or explicitly blocked. Environment: authenticated GitHub CLI after receipt. Required For Done: no. Can Be Blocked: yes. Safe Probe: PR status read and diff inspection. Live Proof: PR URL, changed files, CI status. Side Effect: may push branch and open PR during ship stage. Sensitive Data Policy: do not include secrets or local-only paths in PR body.
- Evidence:
  - 2026-07-12T16:33:33.994Z: Optional delivery/CI check is explicitly post-receipt by PRD Sections 4.2 and 9; delivery-readiness.md records branch, base freshness, staging scope, and exclusion of unrelated .hoyeon intake. ho-ship will create the PR and watch CI before user-facing completion.
