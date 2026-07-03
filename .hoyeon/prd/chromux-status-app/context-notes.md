# Context Notes: chromux status app

## Sources Read

- `.hoyeon/intake/chromux-status-app/prd-handoff.md`
- `.hoyeon/intake/chromux-status-app/qa-log.md`
- `README.md`
- `AGENTS.md`
- `install.md`
- `skills/chromux/SKILL.md`
- `package.json`

## Repository Context

- chromux is currently a zero-dependency Node.js CLI package.
- `package.json` exposes only the `chromux` bin and publishes a narrow file allowlist.
- Profiles are stored under `~/.chromux/profiles/`.
- Runtime daemon state and sessions are profile-oriented.
- `chromux help` is the source of truth for public CLI syntax.
- The repo guidance says to keep the public command surface small and prefer existing raw-CDP and daemon/profile patterns.

## Product Context

- The approved v1 is a local companion desktop app for chromux users.
- The app is profile-level, not a full session/tab cockpit.
- The main UI is a full-window dashboard with a left profile list and a right selected-profile detail pane.
- The differentiator is chromux usage memory: CLI-wide full-URL activity logs, Task-centered timelines, and site knowledge links.
- Computer use is required for implementation and verification proof only.
- Computer-use activity ingestion is not a v1 app data source.

## Sensitive Data Context

- V1 must not read Chrome History.
- CLI-wide logging is default-on and includes full URL plus command context.
- Full URL logs are sensitive local data because they can include search queries, private routes, titles, Task labels, and errors.
- The PRD requires 90-day default retention, configurable retention, delete controls, and URL/title redaction.

## Deferred Technical Decisions

- Exact desktop runtime and package layout are deferred to a technical spike.
- Exact storage format for the activity log is deferred to implementation, but it must support retention, deletion, and redaction.
- Exact session grouping threshold is deferred, but Task-first grouping and session-span fallback are required.
