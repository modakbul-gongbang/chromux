# Cross-tool benchmark: chromux vs agent-browser vs @playwright/cli (July 2026)

This document records the methodology and results of the first published
cross-tool comparison for chromux, closing gap G-4 from
[competitive-analysis-2026-07.md](competitive-analysis-2026-07.md).
Two harnesses were run, both checked into `benchmarks/`:

1. **Agent-in-the-loop** (`benchmarks/agent-compare-benchmark.mjs`) — the
   headline benchmark. A real coding agent performs identical browser
   missions with each CLI; we measure what actually matters to an agent
   session: wall time, tokens, turns, and task success.
2. **Deterministic payload/latency** (`benchmarks/compare-benchmark.mjs`) —
   the explanatory benchmark. No LLM; measures the stdout payload an agent
   must read for equivalent observation commands, warm command latency, and a
   parallel-session isolation probe on identical fixture pages.

## Agent-in-the-loop methodology

For every (tool x task x repetition) the harness spawns an independent
headless Claude session:

```
claude -p "<mission>" --model claude-opus-4-8 --output-format json \
  --allowedTools Bash --max-turns 40 --setting-sources "" --strict-mcp-config \
  --disallowedTools WebFetch WebSearch Task \
  --append-system-prompt "<vendor's official SKILL.md>"
```

Fairness rules:

- **One model for all tools** (`claude-opus-4-8`), one shared mission prompt
  template, same `--max-turns`, same machine-grading.
- **Each tool is introduced by its vendor's official skill text**: chromux by
  `skills/chromux/SKILL.md` from this repo, agent-browser by the `SKILL.md`
  shipped inside the `agent-browser` npm package, playwright-cli by the
  `SKILL.md` shipped inside `@playwright/cli` (playwright-core). No
  tool-specific prompt tuning beyond that.
- **Per-tool init is measured separately** and excluded from task metrics:
  npm install of the pinned competitor CLIs plus the first browser/daemon
  launch. Task sessions start against a warm daemon for every tool.
- **Cheating is blocked or detected**: WebFetch/WebSearch/MCP are disabled in
  the session; local fixture pages log every request's user agent, and a run
  that touched the fixture with a non-browser client is failed as
  `non-browser-access`.
- Metrics come from the `claude -p` result JSON: `duration_ms`, `usage`
  (input/output/cache tokens), `num_turns`, `total_cost_usd`. Success is
  graded mechanically by the harness (see below), never by a model.

### Tasks

Local tasks run on a deterministic fixture server (`benchmarks/fixtures.mjs`)
with machine-checkable expected values; external tasks target public sites
without login and are graded against live ground truth or stable facts.

| task | kind | mission | grading |
|---|---|---|---|
| form-order | local | fill checkout form (email/coupon/country select), submit, report confirmation code | server-recorded submission must match the requested values AND the reported code must equal the server-issued code |
| feed-extract | local | on a 200-story feed, count stories with >700 points and name the top story | exact match against the generator's expected values |
| nav-tour | local | follow "Continue" links across 4 pages, report the completion code | exact code match |
| sequential-steps | local | 3 sequential click-wait-verify cycles, report the 3 revealed values | exact match of all 3 values |
| hn-top-story | external | report title+points of the current #1 Hacker News story | reported title must appear in the official HN API top stories fetched at run time |
| wikipedia-hop | external | from the Eiffel Tower article, navigate to Gustave Eiffel's page, report name + birth year | name contains "Eiffel", birth year 1832 |
| google-search | external | search Google for "playwright github", report first organic result URL | URL contains github.com/microsoft/playwright (bot-detection failures count as failures — that is part of the signal) |
| youtube-search | external | search YouTube, report title+channel of the top result for a fixed query | channel/title must identify the expected canonical video |

Repetitions: 3 per local task, 2 per external task, sequential (no
concurrent sessions), i.e. 20 sessions per tool, 60 total.

### Reproduction

```bash
node benchmarks/agent-compare-benchmark.mjs --out /tmp/agent-compare.json
# cheap harness check without external tasks:
node benchmarks/agent-compare-benchmark.mjs --smoke --model claude-haiku-4-5-20251001
```

Requires an authenticated `claude` CLI, Google Chrome, and network access.
Competitor CLIs are npm-installed at their latest versions into a temp prefix
at run start; versions are recorded in the report JSON.

## Agent-in-the-loop results

Run of 2026-07-10, macOS (Apple Silicon), model `claude-opus-4-8`, 60
sessions, total cost $13.89. Versions: chromux 0.14.1 (working tree, real
Google Chrome), agent-browser 0.31.1 (auto-detected Chrome), @playwright/cli
0.1.17 (bundled Playwright Chromium).
Cells are success% · median wall time · median turns · median total tokens.

| task | chromux | agent-browser | playwright-cli |
|---|---|---|---|
| form-order | 100% · 34.2s · 8t · 173K | 100% · 19.9s · 6t · 134K | 100% · 34.9s · 7t · 138K |
| feed-extract | 100% · 35.6s · 5t · 109K | 100% · 50.2s · 8t · 188K | 100% · 23.6s · 4t · 78K |
| nav-tour | 100% · 22.8s · 4t · 85K | 100% · 23.3s · 7t · 121K | 100% · 25.9s · 7t · 138K |
| sequential-steps | 100% · 33.7s · 6t · 130K | 100% · 37.0s · 8t · 184K | 100% · 31.9s · 7t · 139K |
| hn-top-story | 100% · 19.1s · 4t · 74K | 100% · 20.3s · 4t · 74K | 100% · 17.3s · 4t · 67K |
| wikipedia-hop | 100% · 27.0s · 5t · 109K | 100% · 22.1s · 6t · 110K | 100% · 24.1s · 5t · 99K |
| google-search | **100%** · 44.1s · 6t · 122K | **50%** · 146.0s · 12t · 310K | 100% · 34.5s · 6t · 122K |
| youtube-search | 100% · 32.2s · 6t · 119K | 100% · 24.8s · 5t · 110K | 100% · 20.4s · 4t · 81K |
| **overall** | **100%** · 10.7min · 109t · 2.37M · $4.60 | 95% · 13.7min · 138t · 3.08M · $5.29 | **100%** · **9.0min** · 112t · **2.22M** · **$4.00** |

Honest reading of the numbers:

- **All three CLIs are viable agent browsers.** With a frontier model at the
  wheel, every tool completed every deterministic task; the CLI-over-MCP bet
  these three tools share is confirmed rather than differentiated.
- **The real Chrome difference shows up exactly where expected.** On Google,
  agent-browser's automation-flagged browser hit reCAPTCHA both reps — one
  rep burned 146s / 12 turns / 310K tokens fighting it, the other gave up
  (the only failure in the run). chromux's real-Chrome sessions passed
  cleanly both reps. This is the category of task ("your accounts, real
  sites, bot-gated surfaces") chromux is built for.
- **playwright-cli is the strongest generalist on neutral tasks** — fastest
  and cheapest overall on this task set. Its per-command latency is the
  worst of the three (see below), but its agent-facing responses are lean
  and its bundled-Chromium weakness simply doesn't show on sites without
  bot checks.
- **agent-browser pays a token premium** (~40% more input tokens than the
  others' median) because its idiomatic observation loop re-reads more of
  the page per step, and it degrades hardest under adversarial conditions.

## Deterministic payload / latency results

Same fixture pages for all tools (article, form with status line, 200-story
feed). Payload = agent-visible stdout bytes, tokens estimated at chars/4.
"Post-action verification (idiomatic)" is each tool's cheapest documented way
to confirm an action's effect on page structure: `snapshot --diff` for
chromux, re-`snapshot -i` for agent-browser, re-`snapshot` for playwright-cli
(which has no interactive filter). A targeted single-element read is also
shown for the form page.

```bash
node benchmarks/compare-benchmark.mjs --out /tmp/compare.json
```

Run of 2026-07-10, same machine and versions, 5 warm reps for latency,
tokens estimated at chars/4.

| page | command | chromux | agent-browser | playwright-cli |
|---|---|---|---|---|
| article | snapshot (full) | 775 | 1,057 | 1,028 |
| article | snapshot (interactive-only) | 41 | 40 | 1,028 |
| article | post-action verification | **36** | 47 | 1,036 |
| article | structured extract | 25 | 25 | 86 |
| form | snapshot (full) | 67 | 94 | 116 |
| form | snapshot (interactive-only) | 38 | 66 | 116 |
| form | post-action verification | 39 | 66 | 115 |
| form | targeted single-element read | 2 | 2 | 36 |
| form | structured extract | 27 | 27 | 88 |
| feed (200 stories) | snapshot (full) | **14,252** | 25,646 | 28,349 |
| feed (200 stories) | snapshot (interactive-only) | **7,153** | 10,928 | 28,349 |
| feed (200 stories) | post-action verification | **37** | 10,935 | 28,357 |
| feed (200 stories) | structured extract | 27 | 27 | 88 |

| metric | chromux | agent-browser | playwright-cli |
|---|---|---|---|
| navigate p50 (warm) | 218ms | **95ms** | 883ms |
| snapshot p50 (warm) | 163ms | **48ms** | 183ms |
| parallel sessions isolated | yes | yes | yes |

Reading:

- **chromux's `snapshot --diff` is the standout number**: verifying an
  action's effect on a large page costs ~37 tokens vs ~10.9K (agent-browser
  re-snapshot) and ~28.4K (playwright-cli re-snapshot, which has no
  interactive filter at all). On long multi-step sessions this compounds.
- **agent-browser's Rust daemon has the best raw command latency** (2-4x
  faster than chromux per command); playwright-cli is the slowest to
  navigate.
- **Parallel-session isolation passes for all three tools** as of these
  versions — agent-browser 0.31.1 has working named sessions, so earlier
  claims that its sessions share a tab no longer hold.
- Why doesn't the payload gap fully show up in the agent-in-the-loop totals?
  Because a capable model already uses each tool's cheapest observation
  commands and short tasks are dominated by fixed session overhead. The
  payload advantage matters most on long sessions over large pages — the
  regime the deterministic table isolates.

## Limitations

- Single machine (macOS, Apple Silicon), single model, one benchmark window;
  external-site tasks depend on live site behavior and bot-detection policy
  at run time.
- Token estimates in the deterministic harness use chars/4; the
  agent-in-the-loop numbers use real API token counts.
- The agent decides its own command usage from the vendor skill text; results
  therefore measure the *tool + its documentation* as a system, which is the
  thing an agent actually experiences. A model weaker than the benchmark
  model may fail tasks a stronger model completes (we observed exactly this
  with `<select>` handling during harness bring-up; the chromux skill now
  documents the `run`+`change`-event idiom).
- Sessions run sequentially; daemons stay warm across repetitions for every
  tool alike.
