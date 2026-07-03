---
topic: "chromux status app"
status: "ready"
source_intake: ".hoyeon/intake/chromux-status-app/prd-handoff.md"
source_clarity: "none"
created_at: "2026-07-03"
updated_at: "2026-07-03"
---

# PRD: chromux status app

## 1. Summary

chromux에 로컬 companion desktop app을 추가한다.
이 앱은 chromux 사용자가 profile 상태를 보고 조작하며, agent가 CLI로 실행한 chromux 작업을 full URL activity log와 Task 중심 timeline으로 이해하게 한다.
V1은 Chrome History를 읽지 않고, chromux CLI 전체에서 앞으로 발생하는 activity event를 로컬에 기록한다.
기록된 event는 site knowledge notes와 연결되어 profile별 사용 기억을 만든다.

## 2. Problem, Goal, And Users

chromux는 real Chrome profile과 session을 제어하지만, 현재 사용자는 profile별 상태, 최근 작업 흐름, 접근 링크, site knowledge 축적 상태를 한 화면에서 보기 어렵다.
Agent가 chromux를 사용할수록 CLI 명령은 지나가지만, 나중에 어떤 profile로 어떤 작업을 했고 어떤 사이트 지식이 남았는지 복원하기 어렵다.

목표는 chromux 사용자가 로컬 desktop app에서 profile별 상태를 조작하고, CLI 전체의 full-URL activity log를 Task 중심 timeline으로 확인하며, site knowledge와 연결된 chromux 사용 기억을 관리할 수 있게 하는 것이다.

주 사용자는 chromux를 쓰는 사람이다.
여기에는 직접 CLI를 쓰는 사용자와 agent가 chromux를 쓰게 하는 사용자가 포함된다.

성공 신호는 사용자가 앱에서 profile 상태와 최근 Task 흐름을 보고, 필요한 profile action을 실행하고, full URL log와 site knowledge 연결을 확인하며, 민감한 기록을 보존/삭제/redact할 수 있는 것이다.

## 3. Scope And Non-Goals

In scope:

- R1. Companion desktop app은 알려진 chromux profile 목록을 보여준다.
- R2. Companion desktop app은 selected profile detail pane에서 profile 상태와 profile-level action을 제공한다.
- R3. Core chromux CLI는 CLI 전체 activity event를 durable local log로 기록한다.
- R4. Activity event는 기본으로 full URL과 command execution context를 포함한다.
- R5. Activity event는 `CHROMUX_TASK` 또는 동등한 Task metadata를 optional but recommended field로 지원한다.
- R6. App은 raw command event log와 grouped Task timeline을 모두 보여준다.
- R7. Task metadata가 있으면 Task grouping을 우선하고, 없으면 session open/close span 또는 idle-time window로 fallback한다.
- R8. App은 logged host와 `~/.chromux/skills/<host>/*.md` site knowledge notes를 연결해 보여준다.
- R9. Full URL logs는 기본 90일 retention을 가진다.
- R10. App은 전체 삭제, profile별 삭제, Task별 삭제, URL/title redaction을 제공한다.
- R11. Implementation verification은 실제 local chromux profiles와 computer use 기반 desktop interaction proof를 포함한다.
- R12. Repo docs and agent-facing skills are updated when behavior changes.

Non-goals:

- NG1. V1은 Chrome History를 읽지 않는다.
- NG2. V1은 generic Chrome profile manager가 아니다.
- NG3. V1은 session/tab management cockpit이 아니다.
- NG4. V1은 computer-use activity를 app data source로 ingest하지 않는다.
- NG5. V1은 desktop runtime을 existing core CLI package에 무심코 bundle하지 않는다.
- NG6. V1은 불필요한 top-level browser action command를 추가하지 않는다.
- NG7. V1은 외부 서버, cloud sync, account, auth, billing, production data를 도입하지 않는다.
- NG8. V1은 `CHANGELOG.md` 또는 auto-generated file을 수동 수정하지 않는다.

## 4. Pre-Work And Required Decisions

### 4.1 Pre-Work Before Implementation

- P1. 구현 전에 desktop runtime and package layout spike를 수행한다.
- P2. Spike는 core `@team-attention/chromux` CLI의 zero-dependency package shape와 companion desktop app boundary를 보존하는 선택지를 비교해야 한다.
- P3. 구현 전에 local activity log storage format을 정한다.
- P4. Storage format은 retention, deletion, Task delete, profile delete, URL/title redaction을 지원해야 한다.
- P5. 구현 전에 current package allowlist가 local planning artifacts와 PRD artifacts를 publish하지 않는지 확인한다.

### 4.2 Human Decisions Before PRD Approval

None required for PRD approval.
Runtime choice and storage format are implementation spike outputs, but this PRD already requires the constraints those choices must satisfy.
Desktop visual taste, privacy copy, and final UX are human verification items before completion.

### 4.3 Decision Traceability For Fidelity Review

- User chose "chromux를 쓰는 사용자" as target user.
Represented by Section 2, R1-R12, AC1-AC14.
- User chose profile-level scope.
Represented by R1-R2, AC1-AC4, NG3.
- User accepted full-window dashboard with left profile list and right selected profile detail pane.
Represented by R1-R2, AC1-AC4, AC12, human verification H1.
- User prioritized usage memory, recent work, link access, and site knowledge.
Represented by R3-R8, AC5-AC10, T3-T7, V2-V5.
- User chose CLI-wide logging rather than app-only logging.
Represented by R3, AC5, T3, V2, V4.
- User revised privacy default and chose automatic full URL logging.
Represented by R4, AC6, Risk K1, V2, V6.
- User chose Task as recommended grouping metadata.
Represented by R5-R7, AC7-AC9, T4-T6, V3-V5.
- User accepted 90-day retention and deletion/redaction controls.
Represented by R9-R10, AC11, T7, V3, V6.
- User chose companion desktop app.
Represented by R1-R2, Section 5, T1, NG5.
- User said computer use should be used for implementation/verification.
Represented by R11, V7, NG4.
- Chrome History reading was rejected for v1.
Represented by NG1, Risk K2, guardrail G3.

## 5. Major Technical Structure Changes

- S1. Add a local activity log boundary to core chromux.
This boundary records chromux command execution events across CLI usage.
- S2. Add Task metadata ingestion to CLI execution context.
The preferred input is `CHROMUX_TASK` or an equivalent metadata path that does not bloat normal command usage.
- S3. Add a local companion desktop app boundary.
The app reads profile inventory, profile runtime status, local activity logs, and site knowledge references.
- S4. Add a derived timeline layer.
This layer groups raw events by Task when available and by session span or idle windows when Task is absent.
- S5. Add local data lifecycle operations for activity logs.
This includes retention pruning, all/profile/Task deletion, and URL/title redaction while preserving command-level aggregates.
- S6. Update docs and agent-facing skills to recommend Task labels and describe activity logging behavior.

No external service, account system, cloud sync, production data access, payment, email, or live external API integration is approved.

## 6. Requirements

- R1. The companion desktop app must list known chromux profiles from local chromux state.
- R2. The app must show selected profile status and profile-level actions.
- R3. Core chromux must record durable local activity events for CLI-wide usage.
- R4. Default activity logging must include full URL plus command execution context.
- R5. Activity logging must support optional but recommended Task metadata.
- R6. The app must show raw command event logs.
- R7. The app must show grouped Task timeline cards.
- R8. The app must connect logged hosts to site knowledge notes under `~/.chromux/skills/<host>/*.md`.
- R9. The app and log layer must enforce default 90-day retention for full URL logs.
- R10. The app must support deletion and redaction controls for sensitive activity logs.
- R11. The implementation must preserve chromux core CLI constraints unless explicitly approved.
- R12. The implementation must update user-facing docs and agent-facing skills when command behavior, Task metadata, or activity logging changes.

## 7. Acceptance Criteria

- AC1. Given at least two known chromux profiles, the app shows both in the profile list.
- AC2. Selecting a profile updates the right detail pane without requiring command-line interaction.
- AC3. The selected profile detail shows running/stopped/locked state, daemon state when available, active tab/session count when available, profile size or modified time when available, and profile-level actions.
- AC4. Launch/open foreground and kill/stop style profile actions work through the app or report a clear actionable error.
- AC5. Running chromux CLI commands such as `open`, `snapshot`, and `close` creates durable local activity events.
- AC6. Logged activity events include timestamp, profile, session, command, full URL when available, host, title when available, result ok/error, duration when available, related site knowledge path when available, and Task label when provided.
- AC7. `CHROMUX_TASK` or equivalent metadata can label related chromux CLI activity.
- AC8. Raw event log view shows command-level events without losing execution fidelity.
- AC9. Timeline view groups events by Task when Task metadata is present.
- AC10. Timeline view falls back to session span or idle-time grouping when Task metadata is absent.
- AC11. For a logged host with site knowledge notes, the app shows the related local note path or affordance.
- AC12. Full URL logs default to 90-day retention and can be configured to 7, 30, 90, 365 days, or unlimited.
- AC13. The app supports delete all, delete by profile, delete by Task, and URL/title redaction while retaining command-level aggregate statistics.
- AC14. Chrome History files are not read by v1 behavior.
- AC15. Computer use can operate the companion app during implementation verification and produce evidence of the main desktop flow.
- AC16. `node chromux.mjs help`, `./test.sh`, and `npm pack --dry-run` remain passing or any blockage is clearly classified.
- AC17. `npm pack --dry-run` does not include `.hoyeon/` planning, intake, PRD, or audit artifacts.

## 8. PRD-Level Tasks

- T1. Define companion desktop app boundary and technical spike result.
Covers R1, R2, R11, AC1-AC4.
- T2. Implement or expose local profile inventory and profile runtime state for the companion app.
Covers R1, R2, AC1-AC4.
- T3. Add durable local activity event logging across core chromux CLI usage.
Covers R3, R4, AC5-AC6.
- T4. Add Task metadata support and recommended agent usage path.
Covers R5, AC7.
- T5. Build raw event log reading and display.
Covers R6, AC8.
- T6. Build Task-first timeline grouping with session fallback.
Covers R7, AC9-AC10.
- T7. Connect activity hosts to site knowledge note paths.
Covers R8, AC11.
- T8. Add retention, deletion, and URL/title redaction controls.
Covers R9, R10, AC12-AC13.
- T9. Update README, install guidance when needed, and agent-facing skills for Task labels, activity logging, and privacy behavior.
Covers R12, AC7, AC16.
- T10. Add automated regression coverage for activity logging, Task grouping, retention, deletion, redaction, and profile inventory transformations.
Covers R1-R10, AC1-AC14.
- T11. Run required runtime, computer use, and package verification.
Covers R11-R12, AC15-AC17.

## 9. Verification Contract

### 9.1 Test Mode Contract

| Mode | Required For Done | Covers | Human Decision |
| --- | --- | --- | --- |
| build/static | yes | repo health, help surface, package allowlist | none |
| automated behavior | yes | logging, grouping, retention, deletion, redaction, profile data transformations | none |
| browser/runtime | yes | real chromux profile commands and Chrome/profile behavior | none |
| desktop/runtime | yes | companion app profile list, detail pane, actions, timeline, settings | final UX judgment |
| computer-use | yes | actual desktop app interaction proof | final interaction judgment |
| package audit | yes | npm package contents and no planning artifact leakage | none |

### 9.2 Required Agent Verification

| ID | Mode | Covers | Pass Intent | Required For Done | Can Be Blocked | Safe Probe | Side Effect | Sensitive Data Policy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V1 | build/static | R11-R12, AC16 | Existing repo checks and help surface do not regress. | yes | no | Run local static/build-style checks selected by executor, including `node chromux.mjs help` and `./test.sh` unless impossible. | May launch local test profiles. | Do not print secrets. |
| V2 | automated behavior | R3-R5, AC5-AC7 | Activity event creation and Task metadata behavior are covered by regression tests. | yes | no | Use local test data and isolated temp chromux home where possible. | Writes local test logs only. | Use fake URLs when testing sensitive cases. |
| V3 | automated behavior | R6-R10, AC8-AC14 | Raw log display data, Task grouping, retention, deletion, and redaction logic are covered by regression tests. | yes | no | Use deterministic local fixtures. | Writes local test fixtures only. | Redaction tests must prove URL/title removal. |
| V4 | browser/runtime | R1-R5, AC1-AC7, AC14 | Real local chromux commands create expected events across at least two profiles without reading Chrome History. | yes | no | Use local profiles created or selected for verification. | May open and close Chrome tabs. | Avoid credentials and private sites in verification URLs. |
| V5 | desktop/runtime | R1-R10, AC1-AC13 | Companion app shows profile list, selected detail, raw events, Task timeline, site knowledge links, and lifecycle controls. | yes | no | Use local fake or safe activity data plus real profile state. | May mutate local verification log data. | Do not display private user browsing data in screenshots. |
| V6 | computer-use | R1-R2, R6-R10, AC1-AC13, AC15 | Computer use interacts with the desktop app and captures evidence of the main flow. | yes | no | Use safe local profiles and sanitized URLs. | Clicks local app controls. | Screenshots must avoid private full URLs unless intentionally synthetic. |
| V7 | package audit | R11-R12, AC16-AC17 | `npm pack --dry-run` includes only approved package files and excludes `.hoyeon/`. | yes | no | Dry-run only. | None. | No secrets in package output. |
| V8 | desktop/runtime | R10, AC12-AC13 | Delete all, profile delete, Task delete, retention setting, and URL/title redaction are observable in the app. | yes | no | Use local test events. | Mutates local test logs. | Verify sensitive URL/title fields are removed or hidden after redaction. |

### 9.3 Human Verification

- H1. Human reviewer approves desktop information density, visual hierarchy, and selected profile detail layout.
- H2. Human reviewer approves privacy copy around default full URL activity logging.
- H3. Human reviewer confirms Task timeline summaries are understandable and do not overclaim certainty when derived from session fallback.
- H4. Human reviewer confirms computer-use evidence represents the intended app interaction flow.

## 10. Risks And Open Decisions

- K1. Default full URL logging is sensitive.
Mitigation: keep logs local, document behavior, enforce retention, provide deletion and redaction controls, and verify redaction.
- K2. Chrome History reading would expand sensitive data scope.
Mitigation: v1 explicitly forbids Chrome History access.
- K3. Companion desktop app could accidentally bloat or destabilize the zero-dependency CLI package.
Mitigation: require a technical spike and preserve clear package boundary.
- K4. Timeline summaries can overstate what an agent did.
Mitigation: keep raw event logs, prefer explicit Task labels, and mark fallback grouping as derived.
- K5. Activity logs could leak into published package artifacts.
Mitigation: package audit is required for done.
- K6. Exact desktop runtime and package layout are deferred.
This is not blocking because the PRD requires a spike before implementation chooses the structure.
- K7. Exact activity storage format is deferred.
This is not blocking because the PRD defines the lifecycle and verification requirements the storage must satisfy.

## 11. Implementation Guardrails

- G1. Do not implement code outside this PRD's scope without asking.
- G2. Do not convert v1 into a generic Chrome profile manager.
- G3. Do not read Chrome History files in v1.
- G4. Do not ingest computer-use event history as v1 app data.
- G5. Do not introduce cloud sync, account, auth, billing, or external services without approval.
- G6. Do not add new top-level browser action commands unless existing `run`, `cdp`, or profile patterns cannot reasonably support the requirement.
- G7. Do not weaken automated regression coverage for changed behavior without a clear PRD-level reason.
- G8. Do not publish `.hoyeon/` artifacts, local logs, private URLs, or planning files.
- G9. Do not manually modify `CHANGELOG.md` or auto-generated files.
- G10. Do not make screenshots or result reports expose private full URLs from real user browsing.

## 12. Implementation Result Report Contract

The implementation result report must include:

- Status: `Done`, `Partially Done`, or `Blocked`.
- User-visible changes.
- Major changed modules, package boundaries, data shapes, and local storage locations.
- Whether the approved companion app and core CLI boundary was followed.
- Completion status for T1-T11.
- R1-R12 coverage status.
- AC1-AC17 coverage status.
- V1-V8 verification evidence by mode.
- Automated tests added or updated, including the regression risk each protects.
- Computer use evidence for the desktop app flow.
- Package audit evidence from `npm pack --dry-run`.
- Any deviations from the PRD and whether they were approved.
- Remaining human review items H1-H4.
- Not-done items and follow-up candidates.
