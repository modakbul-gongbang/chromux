# Verification Plan: benchmark-followup

- Status: ready
- Generated: 2026-07-12T14:37:08.334Z
- PRD: agents/prd/benchmark-followup/prd.md

## Environment

- Package manager: npm
- Browser tool: chromux
- Server strategy: no dev server script detected
- Service strategy: use repo-local dev/test commands; ask if services are required
- DB strategy: no DB surface detected

## Test Mode Contract

- build/static: required=yes; blockable=no; covers=CLI help, docs drift, package surface, shell-level repo health; human=none
- automated behavior: required=yes; blockable=no; covers=benchmark harness smoke and doc-check regression coverage; human=none
- benchmark/live-agent: required=yes; blockable=no; covers=approved Sonnet and Opus same-run benchmark reports; human=cost, auth, network, and live-site approval required
- browser/runtime: required=yes; blockable=no; covers=full chromux browser suite after docs or harness changes; human=none
- delivery/CI: required=no; blockable=yes; covers=PR URL, diff scope, and GitHub CI after implementation receipt; human=final merge remains human-owned

## Checks

### VP1. V1 - command

- Level: General
- Source: verification_matrix
- Test mode: build/static
- Tool: verify-run
- Command: `node chromux.mjs help`
- Covers: R: R1, R6, R7; AC: AC1, AC6, AC7; T: T1, T6
- Artifacts: command-log
- Pass criteria: command exits 0 and public help remains the source of truth for current CLI syntax
- Required for done: yes
- Can be blocked: no
- Contract method: `node chromux.mjs help`
- Contract artifact: command-log
- Contract environment: local shell, Node 22 or newer
- Safe probe: local CLI only
- Live proof: command log
- Side effect: none
- Sensitive data policy: no secrets
- Status: planned

### VP2. V2 - automated

- Level: General
- Source: verification_matrix
- Test mode: automated behavior
- Tool: verify-run
- Command: `node benchmarks/chromux-doc-check.mjs`
- Covers: R: R1, R6, R7; AC: AC1, AC6, AC7; T: T1, T6
- Artifacts: command-log
- Pass criteria: command exits 0 and doc needles prove README, help, benchmark docs, and skills stay synchronized
- Required for done: yes
- Can be blocked: no
- Contract method: `node benchmarks/chromux-doc-check.mjs`
- Contract artifact: command-log
- Contract environment: local shell
- Safe probe: local docs check only
- Live proof: command log
- Side effect: none
- Sensitive data policy: no secrets
- Status: planned

### VP3. V3 - api

- Level: General
- Source: verification_matrix
- Test mode: benchmark/live-agent
- Tool: record-artifact
- Covers: R: R2, R3; AC: AC2, AC3; T: T2, T3
- Artifacts: api-log, network-log
- Pass criteria: report exists, covers the 12 approved tasks, records versions, reps, sessions, costs, and per-session command traces, and docs use only this same-run data for the new Sonnet table
- Required for done: yes
- Can be blocked: yes
- Contract method: `node benchmarks/agent-compare-benchmark.mjs --model claude-sonnet-5 --tools chromux,playwright-cli --tasks form-order,feed-extract,nav-tour,sequential-steps,inventory-aggregate,signup-challenge,hn-top-story,wikipedia-hop,google-search,youtube-search,miniwob-email-inbox,miniwob-book-flight --out /tmp/chromux-sonnet-12-rerun.json`
- Contract artifact: benchmark-report-json
- Contract environment: authenticated `claude` CLI, Google Chrome, network, npm install access
- Safe probe: stop before launch if estimated cost exceeds approved cap
- Live proof: report JSON and command log
- Side effect: launches agent sessions, installs competitor CLI packages in temp prefix, visits public sites
- Sensitive data policy: do not print secrets, redact tokens, do not publish raw account data
- Status: planned

### VP4. V4 - api

- Level: General
- Source: verification_matrix
- Test mode: benchmark/live-agent
- Tool: record-artifact
- Covers: R: R4, R5; AC: AC4, AC5; T: T4, T5
- Artifacts: api-log, network-log
- Pass criteria: report exists, covers all 20 current tasks, records versions, reps, sessions, costs, and docs promote post-v2 tasks only from this same-run report
- Required for done: yes
- Can be blocked: yes
- Contract method: `node benchmarks/agent-compare-benchmark.mjs --model claude-opus-4-8 --tools chromux,agent-browser,playwright-cli --tasks form-order,feed-extract,nav-tour,sequential-steps,inventory-aggregate,signup-challenge,shop-cookie-select,slow-order,iframe-register,miniwob-email-inbox,miniwob-book-flight,miniwob-use-autocomplete,miniwob-login-user,miniwob-search-engine,miniwob-click-checkboxes,wikipedia-extract,hn-top-story,wikipedia-hop,google-search,youtube-search --out /tmp/chromux-opus-20-expanded.json`
- Contract artifact: benchmark-report-json
- Contract environment: authenticated `claude` CLI, Google Chrome, network, npm install access
- Safe probe: stop before launch if estimated cost exceeds approved cap or if auth/network setup is missing
- Live proof: report JSON and command log
- Side effect: launches agent sessions, installs competitor CLI packages in temp prefix, visits public sites
- Sensitive data policy: do not print secrets, redact tokens, do not publish raw account data
- Status: planned

### VP5. V5 - automated

- Level: General
- Source: verification_matrix
- Test mode: automated behavior
- Tool: verify-run
- Command: `node benchmarks/agent-compare-benchmark.mjs --smoke --model claude-haiku-4-5-20251001 --out /tmp/chromux-agent-compare-smoke.json`
- Covers: R: R1, R2, R3, R4, R5, R6, R7; AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7; T: T1, T2, T3, T4, T5, T6
- Artifacts: command-log, network-log
- Pass criteria: smoke report exists and proves the harness still launches a cheap machine-graded task after any harness or docs-adjacent changes
- Required for done: yes
- Can be blocked: yes
- Contract method: `node benchmarks/agent-compare-benchmark.mjs --smoke --model claude-haiku-4-5-20251001 --out /tmp/chromux-agent-compare-smoke.json`
- Contract artifact: benchmark-report-json
- Contract environment: authenticated `claude` CLI, Google Chrome, network, npm install access
- Safe probe: one cheap smoke task only
- Live proof: report JSON and command log
- Side effect: launches one or more local benchmark sessions and installs temp competitor packages
- Sensitive data policy: do not print secrets, redact tokens
- Status: planned

### VP6. V6 - command

- Level: General
- Source: verification_matrix
- Test mode: browser/runtime
- Tool: verify-run
- Command: `bash ./test.sh`
- Covers: R: R7; AC: AC7; T: T6
- Artifacts: command-log, screenshot, console-log
- Pass criteria: full chromux browser test suite exits 0 after benchmark docs or harness changes
- Required for done: yes
- Can be blocked: no
- Contract method: `bash ./test.sh`
- Contract artifact: command-log
- Contract environment: local shell with Google Chrome
- Safe probe: isolated test profiles
- Live proof: command log
- Side effect: launches and closes local Chrome profiles, may fetch configured public test hosts
- Sensitive data policy: no secrets
- Status: planned

### VP7. V7 - command

- Level: General
- Source: verification_matrix
- Test mode: build/static
- Tool: verify-run
- Command: `npm pack --dry-run`
- Covers: R: R7; AC: AC7; T: T6, T7
- Artifacts: command-log
- Pass criteria: command exits 0 and tarball includes only the package allowlist from `package.json`
- Required for done: yes
- Can be blocked: no
- Contract method: `npm pack --dry-run`
- Contract artifact: command-log
- Contract environment: local shell, npm
- Safe probe: package dry-run only
- Live proof: command log
- Side effect: no publish
- Sensitive data policy: no secrets
- Status: planned

### VP8. V8 - api

- Level: General
- Source: verification_matrix
- Test mode: delivery/CI
- Tool: record-artifact
- Covers: R: R8; AC: AC8; T: T7
- Artifacts: api-log
- Pass criteria: changed file list excludes unrelated `.hoyeon` intake artifacts, PR URL exists after ship, and required CI status is reported as pass or explicitly blocked
- Required for done: no
- Can be blocked: yes
- Contract method: `git status --short && gh pr view --json url,headRefName,statusCheckRollup`
- Contract artifact: command-log
- Contract environment: authenticated GitHub CLI after receipt
- Safe probe: PR status read and diff inspection
- Live proof: PR URL, changed files, CI status
- Side effect: may push branch and open PR during ship stage
- Sensitive data policy: do not include secrets or local-only paths in PR body
- Status: planned

## Acceptance Coverage

- AC1: covered (VP1, VP2, VP5) - The implementation report lists the exact 20 current task IDs from `buildTasks` and identifies the 12 official v2 tas...
- AC2: covered (VP3, VP5) - A Sonnet 5 report artifact exists for the approved 12-task same-run, and its per-session records include enough data ...
- AC3: covered (VP3, VP5) - The Sonnet section in `docs/benchmark-2026-07.md` no longer claims that the rest of the table has not been re-run whe...
- AC4: covered (VP4, VP5) - An Opus report artifact exists for the approved 20-task 3-tool same-run, or implementation status is `Blocked` with a...
- AC5: covered (VP4, VP5) - The official benchmark table includes post-v2 tasks only from the expanded same-run and does not mix historical cells...
- AC6: covered (VP1, VP2, VP5) - README and `benchmarks/chromux-doc-check.mjs` are consistent with the final benchmark claims, and unchanged surfaces ...
- AC7: covered (VP1, VP2, VP5, VP6, VP7) - `node chromux.mjs help`, `bash ./test.sh`, `node benchmarks/chromux-doc-check.mjs`, and `npm pack --dry-run` pass aft...
- AC8: covered (VP8) - PR delivery evidence includes branch name, PR URL, changed file list, CI status, and confirmation that no unrelated `...

## Gaps

- None
