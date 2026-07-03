# PRD Handoff: chromux status app

> Date: 2026-07-03
> Source: `.hoyeon/intake/chromux-status-app/qa-log.md`

## Clear Outcome

Build a local companion desktop app for chromux users.
The app lets users inspect and operate chromux profiles, see CLI-wide full-URL activity logs, review Task-centered timelines, and connect usage history to chromux site knowledge notes.

## Axis Decisions

The target user is a chromux user, including users who rely on agents using chromux.
V1 is profile-level, not a full session/tab cockpit.
The app should show chromux-managed profiles and let the user launch/open Chrome for direct human browsing.
The app should support profile-level actions such as launch/open foreground, kill, stop, and status inspection.
Session and tab data should appear as status and activity context, not as the primary control surface.

The app form is a full-window dashboard.
Use a left profile list and a right selected-profile detail pane.
The selected profile detail should include quick actions, current status, usage memory, recent work, accessed links/hosts, and related site knowledge notes.
Menu bar or tray behavior is out of scope for v1.

The product differentiator is chromux usage memory.
The app should show both raw command event logs and grouped session timeline cards.
Task labels should be optional but recommended.
When Task metadata is present, Task grouping takes priority.
When Task metadata is absent, grouping should fall back to session open/close spans or idle-time windows.

## Domain Terms And Documented Decisions

Use existing chromux terminology: profile, session, daemon, default mode, crawl mode, headed, headless, active session, known profile, and site knowledge.
Profiles live under `~/.chromux/profiles/`.
Site knowledge notes live under `~/.chromux/skills/<host>/*.md`.
`chromux help` remains the source of truth for current CLI syntax.
The public CLI surface should stay small.
New browser actions should usually be expressed through existing `run` or `cdp` patterns rather than adding unrelated top-level verbs.

## Requirement Seeds

The companion desktop app must list known chromux profiles.
For each profile, show status such as running/stopped/locked, daemon state, active tab/session count, profile size, and last modified time where available.
Selecting a profile must populate the right-side detail pane.
Clicking a profile action must be able to launch or open Chrome so the user can browse directly.

The core CLI should record durable activity events for CLI-wide chromux use.
Default activity logging should include full URL plus command execution context.
The event schema should capture at least timestamp, profile, session, command, full URL, host, title when available, result ok/error, duration when available, related site knowledge path, and Task label when provided.
Activity logging should not read Chrome History in v1.

The recommended agent path should support `CHROMUX_TASK` or equivalent metadata.
Agent-facing docs and skills should encourage setting a Task label for meaningful work.
The app should still work without Task labels by deriving session timeline cards from profile, session, command sequence, URL/host, and time proximity.

The app should surface related site knowledge.
For a logged host, show whether `~/.chromux/skills/<host>/*.md` exists.
Provide a clear link or affordance to inspect those local notes.
Do not imply that site knowledge is secret-safe unless the notes are explicitly non-secret and reusable.

Retention and deletion must be first-class.
Default retention for full URL activity logs should be 90 days.
Settings should support 7, 30, 90, 365 days, and unlimited retention.
The app should support deleting all logs, deleting profile-specific logs, deleting Task-specific logs, and redacting URL/title while preserving command-level aggregate statistics.

## Non-Goals

Do not read Chrome History in v1.
Do not build a generic Chrome profile manager.
Do not make session/tab management the primary v1 control surface.
Do not ingest computer-use activity as a v1 app data source.
Do not bundle a desktop runtime into the existing CLI package without an explicit technical decision.
Do not expand the core chromux public command surface unnecessarily.

## Pre-Work And Human Decisions

The implementation should decide Electron versus Tauri or another desktop runtime through a technical spike.
The core `@team-attention/chromux` package currently has a zero-dependency CLI shape, so companion app packaging should avoid casually changing that contract.
The PRD should keep implementation room for either a separate package or clearly separated companion app directory.

## Major Technical Structure Signals

Core chromux should gain a small local activity log mechanism.
The companion app should read that log and chromux profile state.
The activity log should be local-only.
The app should treat full URL logs as sensitive local data.
The app should derive Task timeline cards from raw events rather than replacing the raw event log.
The app should keep chromux as the v1 activity source.
Computer use is required for implementation and verification proof, not for v1 event ingestion.

## Test And Verification Seeds

Use at least two real local chromux profiles for verification.
Run CLI commands with `CHROMUX_TASK` set and verify activity events are recorded.
Verify `open`, `snapshot`, and `close` events appear in the raw event log.
Verify the companion app shows profile list, selected profile detail, current status, quick actions, Task timeline, full URL events, and site knowledge links.
Verify retention controls, delete-all, profile delete, Task delete, and URL/title redaction.
Use computer use to interact with the companion desktop app during implementation verification.
Keep existing repo validation in scope: `node chromux.mjs help`, `./test.sh`, and `npm pack --dry-run`.
For changed docs or skills, verify they reflect the Task label recommendation and activity logging behavior.

## Risks, Side Effects, And Sensitive Data

Default full URL logging is sensitive even when local-only.
Search queries, private URLs, logged-in app paths, page titles, Task labels, and errors may expose personal or work context.
Do not read historical Chrome browsing databases in v1.
The PRD must require clear data lifecycle behavior and deletion controls.
The implementation must avoid publishing local planning or handoff artifacts in npm packages.
The implementation must not manually modify `CHANGELOG.md` or auto-generated files.

## Human Review Needed

Review desktop visual design and information density.
Review whether the Task timeline summaries are understandable to a chromux user.
Review privacy copy around full URL activity logging.
Review retention and redaction controls before treating the app as ready.

## Open Questions

Exact desktop runtime and package layout are deferred to implementation spike.
Exact storage format for activity logs is deferred to PRD or implementation, but it must support retention and redaction.
Exact timeline grouping thresholds are deferred, but the behavior must support Task-first grouping and session-span fallback.

## Suggested Next Step

`$prd --context .hoyeon/intake/chromux-status-app/prd-handoff.md "chromux status app"`
