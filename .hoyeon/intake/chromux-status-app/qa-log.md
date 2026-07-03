---
topic: "chromux status app"
status: "complete"
target_handoff: "prd"
where: "brownfield"
created_at: "2026-07-03"
updated_at: "2026-07-03"
question_count: 14
final_auditor_agent_id: "none"
final_auditor_status: "skipped"
---

# Intake Q&A Log: chromux status app

## Current Understanding

- Hoyeon wants a desktop-only status application for chromux.
- The app should show the list of profiles managed by chromux.
- Selecting a profile should open Chrome so the user can browse directly.
- The phrase "뭐 등등등" means the product shape is still intentionally open, so intake should clarify the first useful product boundary before PRD.

## Axis Map

| Axis | Track | Why | Closure status | Evidence / notes |
| --- | --- | --- | --- | --- |
| Product | selected | The core job-to-be-done is unclear: profile status viewer, launcher, browser-work cockpit, or all of these. | resolved | Final goal confirmed by user in Q15. |
| Scope | selected | "뭐 등등등" leaves feature boundaries open, and PRD quality depends on deciding the first version. | resolved | V1 is profile-level, companion desktop app, chromux-only activity source; computer use is for implementation/verification only. |
| UX/design | selected | This is a user-facing desktop app with profile list, profile click flow, and status states. | resolved | Full-window dashboard with profile list and right selected-profile detail pane. |
| Technical | selected | The app must integrate with existing chromux CLI/profile storage/daemon behavior without bloating the CLI surface. | resolved | Core CLI keeps small package shape; companion app boundary confirmed; CLI-wide activity log and task metadata are in scope. |
| Verification | selected | Done will need CLI integration proof and live Chrome/profile smoke testing. | resolved | V1 proof requires real local profiles, app interaction proof, computer use, and existing repo checks. |
| Risk | selected | Profile usage analytics may store URLs, task labels, hostnames, and local site knowledge links, which can be sensitive even without reading Chrome History. | resolved | Full URL logging is default-on, Chrome History is out, retention/delete/redaction controls are required. |
| Operation | watch | Desktop packaging, install path, and launch model may matter after product shape is selected. | deferred | Exact Electron/Tauri choice and distribution details are implementation spike material. |
| Documented-domain | selected | Existing chromux docs define profiles, sessions, daemon, crawl/default modes, and public command surface constraints. | resolved | Canonical terms and constraints recorded; no docs conflict found. |

## Q&A

### Q1: Product / primary job
- axis: Product
- status: resolved
- asked: "이 앱의 v1 주 사용자는 누구이고, 가장 먼저 해결할 일은 무엇인가?"
- recommended: "우선 이호연 본인이 쓰는 로컬 데스크톱 런처/상태판으로 잡고, v1은 profile inventory, running/stopped 상태, open/launch/kill 정도만 포함한다."
- answer: The v1 user is "chromux를 쓰는 사용자".
- rationale: Primary user and job-to-be-done determine whether this should be a minimal local profile launcher, a broader operator dashboard, or an agent orchestration console.
- prd impact: The app should be framed as a local tool for existing or prospective chromux users, not a generic Chrome profile manager.

### Q2: Scope / control surface
- axis: Scope
- status: resolved
- asked: "v1의 조작 범위는 profile 단위까지만인가, 아니면 session/tab 단위까지 포함해야 하나?"
- recommended: "v1은 profile 단위에 집중한다: profile 목록, running/stopped/paused 같은 상태, launch/open foreground, kill/stop 정도. session/tab은 개수와 최근 URL 정도를 보여주는 읽기 전용 상태로만 둔다."
- answer: Profile 단위. User also asked whether the app can show how much each profile accessed, while noting they do not know the current state.
- rationale: Profile-level app and session/tab-level cockpit require different UI density, command contracts, and safety checks.
- prd impact: v1 should stay profile-level. Usage/access summary is a profile-level status concept, but it introduces privacy and data-source decisions.

### Q3: Risk / usage analytics source
- axis: Risk
- status: resolved
- asked: "profile별 접근량은 어떤 데이터까지 보여줘도 되나: Chrome History를 읽어서 과거 방문량까지 보여줄까, 아니면 chromux가 앞으로 실행한 activity만 새 로그로 집계할까?"
- recommended: "v1은 Chrome History를 읽지 않고, 앞으로 chromux를 통해 발생한 profile activity만 opt-in 로컬 로그로 집계한다. 현재 가능한 즉시 지표는 profile 크기, 생성/수정 시각, running 상태, active tab/session 수 정도로 둔다."
- answer: Accepted the recommended scope: "어어 우선 그정도 고고".
- rationale: Chrome History gives retrospective usage but exposes sensitive browsing data; chromux-side telemetry is safer but only tracks future activity after the feature ships.
- prd impact: This decides data model, privacy copy, permission states, and whether implementation needs SQLite history readers.

### Q4: UX/design / app form factor
- axis: UX/design
- status: resolved
- asked: "v1은 어떤 데스크톱 형태가 맞나: 전체 창 dashboard인가, 메뉴바/tray의 작은 launcher인가?"
- recommended: "v1은 전체 창 dashboard로 잡는다. 왼쪽 profile list, 오른쪽 selected profile detail/actions/activity summary 구조로 만들고, 메뉴바/tray는 나중에 빠른 실행용으로 둔다."
- answer: User likes the right-side selected profile detail structure: "오.. 오른쪽 selected profile detail 구조도 좋은 것 같기는 한데.."
- rationale: A full window can handle profile inventory, status, actions, empty/error states, and activity summaries without overloading a tiny tray UI.
- prd impact: Treat v1 as a full-window dashboard with a profile list and selected profile detail pane. Menu bar/tray remains out of scope unless the user reopens it.

### Q5: UX/design / selected profile detail priority
- axis: UX/design
- status: resolved
- asked: "오른쪽 selected profile detail에서 v1의 1순위는 무엇인가: 빠른 조작, 상태/진단, 사용량 요약 중 어디에 무게를 둘까?"
- recommended: "1순위는 빠른 조작 + 현재 상태다. 상단에 Launch/Open/Kill/Stop 같은 actions, 그 아래 running/daemon/tabs/profile size/last modified 같은 status, 맨 아래에 future activity summary를 작게 둔다."
- answer: User wants all three, but chromux usage seems important. They want records of what work was mainly done, link access, and possibly integration with the site-specific tacit knowledge that chromux already leaves under host notes.
- rationale: The detail pane can become crowded quickly; picking one priority prevents the UI from turning into a noisy diagnostics console.
- prd impact: The detail pane should include quick actions and status, but the product differentiator is a chromux usage memory layer: recent tasks, accessed links/hosts, and related site knowledge notes.

### Q6: Technical / telemetry capture boundary
- axis: Technical
- status: resolved
- asked: "사용량/작업 기록은 앱에서 누른 것만 남길까, 아니면 `chromux open/run/batch` 같은 CLI 사용 전체에서 자동으로 남기게 할까?"
- recommended: "CLI 전체에서 로컬 opt-in activity log를 남긴다. 앱은 그 로그를 읽어서 profile별 timeline과 host/link summary를 보여준다. v1 기록 항목은 timestamp, profile, command type, session, final URL/host/title, result ok/error, related site-knowledge path, optional user/task label 정도로 제한한다."
- answer: CLI 전체에 남기게 한다.
- rationale: If only the desktop app writes usage history, normal chromux CLI usage disappears from the dashboard, which conflicts with the user's "chromux 사용량" goal.
- prd impact: This determines whether implementation adds a small durable event log to core chromux commands and whether the app is mostly a viewer over that local log.

### Q7: Risk / activity log privacy controls
- axis: Risk
- status: open
- asked: "CLI-wide activity log는 기본으로 켜둘까, 아니면 앱 첫 실행에서 명시적으로 켜게 할까?"
- recommended: "첫 실행에서 명시적으로 켜게 한다. 앱은 'local-only chromux activity memory'를 설명하고 enable 버튼을 제공한다. 끄기, 전체 삭제, profile별 삭제, URL/title 기록 끄고 host-only 기록하는 옵션을 v1에 포함한다."
- answer: Initially answered "앱 첫 실행에 명시적으로", then revised: "아니다 자동으로 켜게하면 안되냐? 그냥 자동으로 로깅되도록? 근데 뭘 로깅하냐가 중요할 것 같은데."
- rationale: CLI-wide logging can include URLs, titles, task labels, and errors from logged-in work. The user should knowingly enable it and have deletion controls.
- prd impact: Default-on logging is acceptable only if the PRD tightly limits the logged fields and includes visible controls for redaction/deletion.

### Q8: Technical / desktop app packaging boundary
- axis: Technical
- status: resolved
- asked: "v1은 네이티브 데스크톱 앱 패키지로 만들까, 아니면 `chromux app` 같은 CLI가 여는 로컬 dashboard로 시작할까?"
- recommended: "core `@team-attention/chromux` CLI는 zero-dependency 원칙을 유지하고, v1은 별도 companion desktop app 경계로 잡는다. PRD에서는 Electron/Tauri 선택을 구현 전 technical spike로 두되, core CLI에는 activity log API/commands만 작게 추가한다."
- answer: Companion desktop app.
- rationale: Bundling a desktop runtime into the existing CLI package would conflict with the current small zero-dependency package shape, but a pure local web dashboard may not match the user's desktop-app intent.
- prd impact: This decides package layout, dependency policy, install flow, and what must be included in `npm pack --dry-run`.

### Q9: Risk / default activity log payload
- axis: Risk
- status: resolved
- asked: "agent가 chromux를 쓸 때 생기는 기록을 어디까지 자동으로 남길까?"
- recommended: "기본 자동 로깅은 실행 사건 중심으로 남긴다: 언제, 어떤 profile/session에서, 어떤 chromux command가, 어떤 host에 접근했고, 성공/실패했는지. Full URL/title/query/task label은 상세 로깅 옵션으로 둔다."
- answer: 기본 자동 로깅은 우선 full URL 정도까지 남긴다. 더 중요한 것은 chromux로 무엇을 실행했는지 기록하는 것이다.
- rationale: Default-on logging should be useful for understanding agent chromux usage and site knowledge discovery, but should avoid storing full URLs, page titles, search queries, and task labels unless detailed logging is enabled.
- prd impact: Default activity logging should capture full URL plus command execution context. The product should emphasize agent/chromux execution history, not just visited-link analytics.

### Q10: Product / task reconstruction
- axis: Product
- status: resolved
- asked: "앱에서 보여줄 'agent가 한 작업'은 command 로그 그대로면 충분할까, 아니면 session 단위로 묶어서 사람이 읽는 작업 흐름으로 보여줘야 할까?"
- recommended: "v1은 둘 다 둔다. 원본 event log는 command별로 남기고, 앱은 같은 profile + session + 시간대의 `open/run/snapshot/close`를 묶어서 'research-1 세션에서 google 검색 후 github 접근' 같은 timeline 카드로 보여준다. agent가 task label을 제공하지 않으면 자동 요약은 host/command 기반의 낮은 신뢰도 요약으로 표시한다."
- answer: Accepted: "오오 좋은데 그거 되면 짱이지".
- rationale: Command-level logs are necessary for fidelity, but users need grouped sessions to understand what the agent was doing without reading raw logs.
- prd impact: This determines whether the PRD requires a derived timeline/grouping layer, task labels, and confidence states for automatic summaries.

### Q11: Technical / task label capture
- axis: Technical
- status: resolved
- asked: "agent가 chromux를 실행할 때 작업 이름을 같이 남길 수 있게 할까, 예를 들면 `CHROMUX_TASK='카공맵 QA' chromux open ...` 같은 방식?"
- recommended: "v1에 넣는다. `CHROMUX_TASK` 같은 환경변수와 선택적 `--task` 입력을 지원해 event log에 task label을 남기고, 없으면 session/host/command 기반 자동 그룹으로 fallback한다."
- answer: Task를 권장하게 한다. Task label is optional but recommended; when absent, grouping falls back to session open/close spans.
- rationale: Explicit task labels make the desktop timeline understandable, while fallback grouping keeps ordinary chromux usage zero-friction.
- prd impact: This determines CLI metadata input shape, event schema, app grouping rules, and agent-skill documentation updates.

### Q12: Risk / retention and deletion
- axis: Risk
- status: resolved
- asked: "full URL activity log는 얼마나 오래 보관하고, 삭제는 어떤 단위로 가능해야 할까?"
- recommended: "기본 보관은 90일로 두고, 앱에서 전체 삭제, profile별 삭제, task별 삭제, URL/title만 지우고 command 통계는 남기는 redaction을 지원한다. 설정에서 보관 기간을 7/30/90/365일/무제한으로 바꿀 수 있게 한다."
- answer: Accepted: "ㅇㅇㅇ 그렇게 ㄱㄱㄱ".
- rationale: Default-on full URL logging is useful but sensitive, so retention and deletion must be first-class requirements rather than later settings polish.
- prd impact: This sets data lifecycle behavior, settings UI, migration/deletion tests, and privacy copy.

### Q13: Verification / done proof
- axis: Verification
- status: resolved
- asked: "v1 완료 증거는 어느 수준이면 충분할까?"
- recommended: "실제 로컬 chromux profile 2개 이상으로 검증한다. CLI에서 `CHROMUX_TASK`가 붙은 `open/snapshot/close`를 실행하면 activity log가 쌓이고, companion app에서 profile list, selected detail, task timeline, full URL event, site-knowledge 연결, retention/delete/redact controls가 보이는 것을 스크린샷/브라우저 또는 앱 런타임 증거로 확인한다. 기존 repo 검증은 `node chromux.mjs help`, `./test.sh`, `npm pack --dry-run`까지 유지한다."
- answer: Accepted, and user added that computer use should also be used.
- rationale: This feature spans CLI logging, local profile inventory, desktop UI, and privacy controls, so done needs runtime evidence beyond unit tests.
- prd impact: This seeds PRD acceptance criteria and verification commands/artifacts.

### Q14: Scope / computer use boundary
- axis: Scope
- status: resolved
- asked: "`computer use`는 v1에서 어떤 의미로 넣을까: 구현/검증 때 앱을 실제로 조작하는 도구로 쓰는 것인가, 아니면 앱 기능으로 'computer-use agent 작업 기록'까지 보여주는 것인가?"
- recommended: "v1에서는 둘 다 반영하되 범위를 나눈다. 검증에는 computer use를 사용해 companion desktop app을 실제로 클릭/확인한다. 앱 기능으로는 `source=chromux|computer-use` 같은 activity source 필드를 설계만 해두고, 실제 computer-use event ingest는 v1.1로 deferred한다."
- answer: 구현/검증 때 사용한다.
- rationale: Verification use is low-risk and useful, while first-class computer-use event ingestion broadens the product beyond chromux and may need a separate event schema.
- prd impact: Computer use is part of implementation/verification proof, not a v1 app data source. V1 activity sources can stay focused on chromux.

### Q15: Final goal confirmation
- axis: Product
- status: resolved
- asked: "이 한 문장 목표로 PRD handoff를 진행해도 될까: chromux 사용자가 로컬 companion desktop app에서 profile별 상태를 조작하고, CLI 전체의 full-URL activity log를 Task 중심 timeline으로 확인하며, site knowledge와 연결된 chromux 사용 기억을 관리할 수 있게 한다."
- recommended: "Yes. This captures profile control, companion app boundary, CLI-wide activity memory, Task-first timeline, full URL logging, and site knowledge integration."
- answer: Accepted: "ㅇㅇㅇ 우선 그렇게 고고우".
- rationale: Intake requires final confirmation that another agent would build the intended outcome from the goal sentence.
- prd impact: If accepted, write `prd-handoff.md` from the captured decisions.

## Evidence From Code Or Docs

- `README.md` says chromux is a zero-dependency Node.js CLI for real Chrome via raw CDP.
- `README.md` defines profile management around isolated Chrome instances with user-data-dir, logins, cookies, extensions, `chromux ps`, `launch`, `kill`, and profile-specific tab commands.
- `install.md` says profiles live under `~/.chromux/profiles/`.
- `skills/chromux/SKILL.md` treats `chromux help` as the source of truth and lists the current core surface.
- `skills/chromux-work/SKILL.md` says browser work should start by resolving the CLI, inspecting `chromux ps`, and listing known profiles under `~/.chromux/profiles`.
- Code inspection shows `/list` returns active sessions with current URL/title, and crawl mode additionally exposes age, idle time, and navigation count, but this is daemon memory, not durable history.
- `cmdPs` lists profile, port, pid, running/locked status, daemon state, and active tab count. It does not expose historical usage totals.
- `siteKnowledgeHintForUrl` maps visited HTTP(S) hosts to `~/.chromux/skills/<host>` and returns a hint to review/update reusable non-secret site notes.
- `/open` surfaces existing `~/.chromux/skills/<host>/*.md` hint files in the command result when a navigated host has notes.
- Local filesystem inspection found Chrome `History` and `History-journal` files under many `~/.chromux/profiles/<profile>/<chrome-profile>/` directories, so retrospective usage stats are technically possible by reading Chrome history databases.
- `package.json` has no dependencies, exposes only the `chromux` bin, requires Node >= 22, and publishes an allowlist that does not include app assets today.
- Repo `AGENTS.md` says the public command surface should stay small and new browser actions should usually be expressed through `run` or `cdp` before adding top-level verbs.
- Prior memory says this repo recently validated headless CI behavior and publish workflow changes, including `chromux launch <profile> --headless`, `bash ./test.sh`, and validation-only CI.

## Documented Domain Checks

- docs inspected: `README.md`, `install.md`, `skills/chromux/SKILL.md`, `skills/chromux-work/SKILL.md`
- canonical terms: profile, session, daemon, default mode, crawl mode, headed, headless, active session, known profile
- glossary/code conflicts: none found yet
- concrete scenarios tested: none during intake Q1 preparation
- docs mutation: none
- ADR candidate: desktop app placement may need a documented decision if it changes package boundaries or public support promises

## Decisions, Assumptions, And Open Questions

- confirmed: desktop-only app; target users are chromux users; profile-level control surface; full-window dashboard with profile list and selected profile detail pane; companion desktop app boundary; show chromux-managed profiles; clicking a profile opens Chrome for direct human browsing; do not read Chrome History in v1; profile detail should include quick actions, current status, usage memory, recent work, accessed links/hosts, and related site knowledge notes; CLI-wide default activity logging is in scope and should include full URL plus command execution context; app should show both raw command event logs and grouped session timeline cards; Task labels should be optional but recommended for agents through `CHROMUX_TASK` or equivalent metadata; full URL logs default to 90-day retention with whole/profile/task/redaction deletion controls and configurable retention windows; v1 verification should include real local profiles and computer use for app interaction proof
- assumptions: app is local-only until user says otherwise
- blocking for PRD: none
- deferred to implementation: exact UI stack, packaging tool, storage model, and IPC/API shape
- human taste or approval: desktop app layout and interaction model

## Axis Closure Matrix

| Axis | Node | Status | Evidence type | PRD impact | Blocking/deferred rationale |
| --- | --- | --- | --- | --- | --- |
| Product | goal and target user | resolved | user | Build for chromux users, not generic Chrome profile users. | none |
| Product | success signal | resolved | user | User should understand profile status and agent chromux usage memory from the companion app. | none |
| Scope | v1 boundary | resolved | user | Profile-level controls, CLI-wide chromux activity log, Task timeline, site knowledge links. | none |
| Scope | computer use | resolved | user | Use computer use for implementation/verification only, not as v1 activity source. | none |
| UX/design | primary layout | resolved | user | Full-window dashboard with left profile list and right selected profile detail pane. | none |
| UX/design | detail hierarchy | resolved | user | Include quick actions, current status, usage memory, recent work, accessed links/hosts, and site knowledge notes. | none |
| Technical | CLI activity log | resolved | user/code | Add durable event logging for CLI-wide chromux use. | none |
| Technical | Task metadata | resolved | user | Recommend `CHROMUX_TASK` or equivalent metadata; fallback to session open/close spans. | none |
| Technical | app/package boundary | resolved | user/code | Companion desktop app; core CLI remains small and zero-dependency where possible. | Exact desktop runtime is deferred to implementation spike. |
| Verification | required proof | resolved | user/code | Verify with real local profiles, CLI event generation, companion app runtime proof, computer use, and existing repo checks. | none |
| Risk | Chrome History | resolved | user/code | Do not read Chrome History in v1. | none |
| Risk | full URL logging | resolved | user | Default activity log includes full URL and command context. | none |
| Risk | retention/deletion | resolved | user | Default 90-day retention plus whole/profile/task/redaction deletion controls. | none |
| Operation | distribution | deferred | code | Keep companion app boundary; determine Electron/Tauri/install flow later. | Implementation spike should decide. |
| Documented-domain | glossary/docs decision | resolved | docs/code | Use existing chromux terms: profile, session, daemon, default/crawl mode, site knowledge. | none |

## Audit History

### Audit 1
- type: local
- auditor_agent_id: none
- result: skipped
- ambiguity: Initial Q1 preparation only; not enough user answers for closure audit.
- highest-risk assumption: Treating this as a local desktop user app rather than an agent-facing orchestration console could lead to the wrong architecture.
- final-blocking-question: none
- handoff impact: Ask primary job question first.
- fallback reason: Final auditor is only required before handoff for non-trivial intake.

### Audit 2
- type: local
- auditor_agent_id: none
- result: fail
- ambiguity: An implementation agent could read full Chrome browsing history without explicit consent because "how much accessed" is under-specified.
- highest-risk assumption: Treating usage analytics as harmless counters ignores that Chrome History includes URLs, titles, hosts, and timestamps.
- final-blocking-question: Should v1 read Chrome History for retrospective stats, or only track chromux activity going forward?
- handoff impact: Resolved by Q3. v1 will not read Chrome History.
- fallback reason: Local adversarial misunderstanding check after Q2.

### Audit 3
- type: local
- auditor_agent_id: none
- result: fail
- ambiguity: An implementation agent could enable CLI-wide URL logging by default without user-visible control.
- highest-risk assumption: "Local-only" does not make URL and task history harmless, especially for logged-in sites and research workflows.
- final-blocking-question: Should activity logging be on by default, opt-in, or app-prompted on first launch?
- handoff impact: Q7 was reopened by the user. Ask Q9 to classify the default-on payload.
- fallback reason: Local adversarial misunderstanding check after Q6.

### Audit 4
- type: local
- auditor_agent_id: none
- result: fail
- ambiguity: Because full URL logging is default-on, an implementation agent might omit retention limits or deletion controls.
- highest-risk assumption: Local full-URL logs can accumulate private URLs indefinitely unless the PRD requires deletion and retention behavior.
- final-blocking-question: What retention and deletion controls are required for full-URL activity logs?
- handoff impact: Ask Q12 before handoff.
- fallback reason: Local adversarial misunderstanding check after Q9-Q11.

### Audit 5
- type: local
- auditor_agent_id: none
- result: pass
- ambiguity: No material PRD-blocking ambiguity remains after Q15.
- highest-risk assumption: Default full-URL logging remains sensitive even when local-only.
- final-blocking-question: none
- handoff impact: Write `prd-handoff.md` with explicit privacy, retention, redaction, and verification requirements.
- fallback reason: Subagent tools were discovered, but the callable tool contract says not to spawn subagents unless the user explicitly asks for subagents or delegation. Ran strict local closure audit instead.
