# Context Notes: Chromux Dominant Browser Automation

## Sources Read

- Current user request: `$prd 압도적인 크롬 브라우저 자동화를 위한(성능이나 최적의동작이나) 도구로 거듭나기 위해 뭐뭐가 더 개선되어야 할까`.
- `AGENTS.md` project guidance supplied in the conversation.
- `.hoyeon/config.json`.
- `package.json`.
- `README.md`.
- `install.md`.
- `skills/chromux/SKILL.md`.
- `skills/chromux-work/SKILL.md`.
- `chromux.mjs`.
- `test.sh`.
- `.hoyeon/prd/human-like-browser-work/prd.md`.
- `.hoyeon/prd/cli-command-registry-refactor/prd.md`.
- Memory registry entries for prior chromux Windows support, companion app, and headless CI work.

## Current Product Shape

- `chromux` is a zero-dependency Node.js CLI that controls real Google Chrome through raw CDP.
- The public help surface centers on `open`, `run`, `batch`, `cdp`, lifecycle commands, interaction shortcuts, watch diagnostics, and `app`.
- The repo guidance says new browser actions should usually be expressed through `run` or `cdp` before adding top-level verbs.
- The CLI supports macOS, Linux, and native Windows.
- The native AppKit wrapper is macOS-only.
- The current daemon transport is localhost TCP and per-profile state tracks separate Chrome CDP and daemon ports.
- Current profile state uses isolated Chrome user data directories under `~/.chromux/profiles`.
- The activity layer writes local command events under `~/.chromux/activity`.
- The status app exposes profile status, raw events, Task timeline, site-note links, retention, deletion, and redaction controls.

## Existing Strengths

- Real user Chrome is the main differentiator versus bundled Chromium automation.
- Background tab creation, profile adoption, startup locks, stale lock recovery, and daemon health checks already exist.
- Human-like interaction work already added `click`, `fill`, `type`, `press`, `wait-for-text`, `wait-for-selector`, target validation, and interactive snapshots.
- Crawl mode already adds worker pool guidance, resource blocking, operation/session/queue caps, idle cleanup, unresponsive session closure, and resource guards.
- `batch` already processes URL lines or JSONL rows through a worker-tab pool and reports per-URL duration plus p95 duration.
- `run` already supports multi-step async JavaScript with `cdp`, `js`, `sleep`, `waitLoad`, and `page(...)`.
- `watch` already supports console and network diagnostics on demand.
- `test.sh` already exercises a broad real-browser suite, including headless launch, tab isolation, interaction primitives, watch commands, crawl batch, resource guards, and startup lock recovery.

## Main Gaps For A Truly Dominant Tool

- Agent round trips are still easy to waste because the fastest path depends on the agent knowing when to bundle work into `run`.
- `batch` is useful, but it is still a basic worker pool rather than an adaptive crawl scheduler with retry policy, host budgets, domain backoff, and richer output contracts.
- Page readiness is still mostly load event, text, selector, or hand-written `run` assertions.
- There is no first-class run receipt that captures step timings, action evidence, readiness proof, console or network deltas, resource snapshots, and replay hints in one durable artifact.
- Performance is documented qualitatively, but there is no repo-owned benchmark harness with stable cold-start, warm-open, `run`, snapshot, and batch throughput budgets.
- Resource governance is profile-local and crawl-focused, but there is no single "why did this profile slow down or fail" diagnosis artifact.
- Built-in snippets are minimal, with only `scroll-until.js` currently listed.
- The status app is useful for humans, but the CLI does not yet expose a compact agent-readable work summary for large browser runs.
- The project has strong local tests, but PRD-level future work needs explicit performance, behavior, browser/runtime, and package-surface gates.

## PRD Direction

- Treat this as a multi-session product and architecture roadmap, not a small bug fix.
- Preserve the zero-dependency raw-CDP architecture unless the user explicitly approves otherwise.
- Prefer strengthening `run`, `batch`, daemon policy, receipts, snippets, and docs before adding new visible commands.
- Keep the current `human-like-browser-work` PRD as related prior work, not as the scope of this new PRD.
- Use repository `.hoyeon/config.json` as the future implementation delivery default, but do not open a PR during PRD writing.
