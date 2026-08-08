import Foundation
import SwiftUI
import AppKit
import Combine
import ChromuxStatusBarCore

@MainActor
final class AppModel: ObservableObject {
    @Published private(set) var statusState: StatusState?
    @Published private(set) var statusLine: String = "Starting local server..."
    @Published private(set) var serverURL: URL?
    @Published var selectedProfileName: String?
    @Published var searchText: String = ""
    @Published var statusFilter: ProfileStatusFilter = .all
    @Published var selectedForBulk: Set<String> = []
    @Published var pendingDeleteNames: [String]?
    @Published var lastActionMessage: String?
    @Published private(set) var visibleWindowCount: Int = 0

    // MARK: - Secret store state (native secrets panel, T6/N7)

    @Published private(set) var secretsState: SecretsState?
    @Published private(set) var secretList: SecretListResponse?
    @Published private(set) var secretHistory: [SecretHistoryEvent] = []
    @Published private(set) var secretSetupState: SecretSetupState?
    /// True while an edit session token is held in memory (edit mode).
    @Published private(set) var hasEditSession: Bool = false
    /// Transiently revealed values, keyed by `revealKey`. Cleared on exit/refresh
    /// so a value is never rendered except right after a fresh-consent reveal.
    @Published var revealedValues: [String: String] = [:]
    @Published var secretMessage: String?
    @Published private(set) var secretBusy: Bool = false

    /// In-memory only: the edit-session token. Never persisted, never a cookie;
    /// sent as `X-Chromux-Secret-Session` on manage/expose calls.
    private var secretSessionToken: String?

    var secretOptedIn: Bool { secretsState?.optedIn ?? false }
    var secretVaultUnlocked: Bool { secretsState?.unlocked ?? false }
    /// The app-proof key resolved from the spawned server, sent on native mints.
    var appProofKey: String? { server.appProofKey }

    /// SwiftUI `openWindow(id:"main")`, captured from the environment on first
    /// window appearance. Used only as a fallback for the very first open before
    /// any `NSWindow` has been resolved and retained.
    var openMainWindow: (() -> Void)?

    /// Brings the dashboard window front (re-fronts the retained, hidden
    /// `NSWindow`). Wired by `AppDelegate`; menu actions call this instead of
    /// SwiftUI `openWindow` so a hidden window reliably returns.
    var presentMainWindow: (() -> Void)?

    /// Guards the one-time auto-open of the dashboard at process launch (R1):
    /// the `Window` scene does not auto-present, so the menu bar label opens it
    /// once when it first appears.
    var didAutoOpenAtLaunch = false

    private let server = ServerProcess()
    private var client: APIClient?
    private var pollTask: Task<Void, Never>?

    var profiles: [ProfileState] { statusState?.profiles ?? [] }

    var visibleProfiles: [ProfileState] {
        ProfileLogic.visible(profiles, search: searchText, statusFilter: statusFilter)
    }

    var orderedActiveProfiles: [ProfileState] {
        ProfileLogic.ordered(profiles).filter(ProfileLogic.isActive)
    }

    var selectedProfile: ProfileState? {
        guard let selectedProfileName else { return nil }
        return profiles.first { $0.name == selectedProfileName }
    }

    var isServerReachable: Bool { serverURL != nil }

    init() {
        server.onStatus = { [weak self] text in
            guard let self else { return }
            let firstLine = text.split(separator: "\n").first.map(String.init) ?? ""
            self.statusLine = firstLine.isEmpty ? "chromux status" : String(firstLine.prefix(80))
        }
        server.onURLDiscovered = { [weak self] url in
            guard let self else { return }
            self.serverURL = url
            self.client = APIClient(baseURL: url)
            Task {
                await self.refresh()
                await self.refreshSecrets()
            }
        }
        server.onTerminated = { [weak self] in
            self?.serverURL = nil
            self?.client = nil
            self?.statusState = nil
            // The server (and its app-proof key) is gone: drop any edit session.
            self?.secretSessionToken = nil
            self?.hasEditSession = false
            self?.revealedValues = [:]
            self?.secretsState = nil
            self?.secretList = nil
            self?.secretHistory = []
        }
    }

    func startServer() {
        server.start()
    }

    func restartServer() {
        server.stop()
        serverURL = nil
        client = nil
        statusState = nil
        statusLine = "Restarting local server..."
        server.start()
    }

    func stopServer() {
        server.stop()
    }

    func refresh() async {
        guard let client else { return }
        do {
            let state = try await client.fetchState()
            statusState = state
            let names = Set(state.profiles.map(\.name))
            selectedForBulk = selectedForBulk.filter { names.contains($0) }
            if let selectedProfileName, !names.contains(selectedProfileName) {
                self.selectedProfileName = ProfileLogic.ordered(state.profiles).first?.name
            } else if selectedProfileName == nil {
                selectedProfileName = ProfileLogic.ordered(state.profiles).first?.name
            }
        } catch {
            lastActionMessage = "Refresh failed: \(error.localizedDescription)"
        }
    }

    // MARK: - Visibility-gated polling (R6, AC9)

    func markWindowVisible() {
        visibleWindowCount += 1
        startPollingIfNeeded()
    }

    func markWindowHidden() {
        visibleWindowCount = max(0, visibleWindowCount - 1)
        if visibleWindowCount == 0 {
            stopPolling()
        }
    }

    private func startPollingIfNeeded() {
        guard pollTask == nil else { return }
        pollTask = Task { [weak self] in
            while !Task.isCancelled {
                await self?.refresh()
                await self?.refreshSecrets()
                try? await Task.sleep(nanoseconds: 7_000_000_000)
            }
        }
    }

    private func stopPolling() {
        pollTask?.cancel()
        pollTask = nil
    }

    // MARK: - Profile actions (R3, AC7)

    func runAction(_ action: String, on profileName: String) async {
        guard let client else { return }
        do {
            let response = try await client.runProfileAction(profile: profileName, action: action)
            lastActionMessage = response.result?.stderr?.isEmpty == false
                ? response.result?.stderr
                : (response.result?.stdout?.isEmpty == false ? response.result?.stdout : "\(action) complete")
            await refresh()
        } catch {
            lastActionMessage = error.localizedDescription
        }
    }

    // MARK: - Bulk delete (R4, T5, AC5, AC6)

    func requestBulkDelete() {
        guard !selectedForBulk.isEmpty else { return }
        pendingDeleteNames = ProfileLogic.ordered(profiles)
            .map(\.name)
            .filter(selectedForBulk.contains)
    }

    /// Delete a single profile (from the detail pane). Reuses the shared
    /// confirm/execute path so both single and bulk delete go through one alert.
    func requestDelete(_ name: String) {
        pendingDeleteNames = [name]
    }

    func cancelPendingDelete() {
        pendingDeleteNames = nil
    }

    /// Deletes the given profiles. `names` is passed explicitly (captured by the
    /// alert's `presenting:` value) rather than read from `pendingDeleteNames`,
    /// because dismissing the alert clears `pendingDeleteNames` before this
    /// action runs.
    func confirmPendingDelete(_ names: [String]) async {
        guard let client, !names.isEmpty else { return }
        pendingDeleteNames = nil
        do {
            let response = try await client.deleteProfiles(names)
            let succeeded = response.results.filter(\.removed).map(\.profile)
            let failed = response.results.filter { !$0.removed }.map(\.profile)
            lastActionMessage = DeleteSummary.resultMessage(succeededNames: succeeded, failedNames: failed)
            selectedForBulk.subtract(succeeded)
            // Optimistically drop the removed profiles so the list updates
            // instantly; the follow-up refresh (which recomputes disk usage for
            // every remaining profile and can take several seconds) reconciles.
            removeProfilesLocally(succeeded)
            await refresh()
        } catch {
            lastActionMessage = "Delete failed: \(error.localizedDescription)"
        }
    }

    private func removeProfilesLocally(_ names: [String]) {
        guard !names.isEmpty, let state = statusState else { return }
        let removed = Set(names)
        statusState = StatusState(
            ok: state.ok,
            generatedAt: state.generatedAt,
            chromuxHome: state.chromuxHome,
            profiles: state.profiles.filter { !removed.contains($0.name) }
        )
        if let selectedProfileName, removed.contains(selectedProfileName) {
            self.selectedProfileName = ProfileLogic.ordered(statusState?.profiles ?? []).first?.name
        }
    }

    // MARK: - Secret store: reads (T6/N7)

    /// Refreshes the observe surface. `state` is always fetched; the credential
    /// list and usage history are only fetched once opted in (they can spawn
    /// `bw`, so they stay dormant until the user opts in).
    func refreshSecrets() async {
        guard let client else { return }
        do {
            let state = try await client.fetchSecretsState()
            secretsState = state
            if state.optedIn {
                secretList = try await client.fetchSecretList()
                secretHistory = try await client.fetchSecretHistory().events
            } else {
                secretList = nil
                secretHistory = []
            }
        } catch {
            secretMessage = "Secrets refresh failed: \(error.localizedDescription)"
        }
    }

    func refreshSecretSetupState() async {
        guard let client else { return }
        secretSetupState = try? await client.fetchSecretSetupState()
    }

    // MARK: - Secret store: edit mode (Touch ID -> minted session)

    /// Fresh Touch ID, then mint a native-macOS edit session and hold its token
    /// in memory. Returns whether edit mode is now active.
    @discardableResult
    func enterEditMode() async -> Bool {
        guard let client, let appProofKey else {
            secretMessage = "Native proof is unavailable (server not ready)."
            return false
        }
        secretBusy = true
        defer { secretBusy = false }
        let approved = await TouchIDAuth.authenticate(reason: "chromux secret edit mode")
        guard approved else { secretMessage = "Touch ID was cancelled."; return false }
        do {
            let resp = try await client.beginSecretSession(appProof: appProofKey)
            guard resp.ok, let token = resp.token else {
                secretMessage = resp.next ?? "Could not start edit mode."
                return false
            }
            secretSessionToken = token
            hasEditSession = true
            secretMessage = nil
            await refreshSecrets()
            return true
        } catch {
            secretMessage = "Edit mode failed: \(error.localizedDescription)"
            return false
        }
    }

    /// Revokes the edit session and drops all in-memory session/reveal state.
    func exitEditMode() async {
        if let client, let token = secretSessionToken {
            _ = try? await client.revokeSecretSession(session: token)
        }
        secretSessionToken = nil
        hasEditSession = false
        revealedValues = [:]
        await refreshSecrets()
    }

    // MARK: - Secret store: opt-in (dormancy boundary)

    /// The dormant "Set up secret store" action: Touch ID -> mint session ->
    /// opt in -> load setup state (so the wizard can follow if `bw` is missing).
    func setupSecretStore() async {
        let entered = await enterEditMode()
        guard entered, let client, let token = secretSessionToken else { return }
        secretBusy = true
        defer { secretBusy = false }
        do {
            _ = try await client.setSecretOptin(enabled: true, session: token)
            secretMessage = nil
        } catch {
            secretMessage = "Opt-in failed: \(error.localizedDescription)"
        }
        await refreshSecrets()
        await refreshSecretSetupState()
    }

    /// Settings toggle: opt in/out through a freshly minted session, then tidy
    /// up the session (opt-in state persists server-side).
    func setSecretOptin(enabled: Bool) async {
        let entered = await enterEditMode()
        guard entered, let client, let token = secretSessionToken else { return }
        do {
            _ = try await client.setSecretOptin(enabled: enabled, session: token)
            secretMessage = nil
        } catch {
            secretMessage = "Opt-in change failed: \(error.localizedDescription)"
        }
        await refreshSecrets()
        await exitEditMode()
    }

    // MARK: - Secret store: manage (edit mode required)

    func unlockVault(masterPassword: String) async {
        guard let client, let token = secretSessionToken else {
            secretMessage = "Enter edit mode first."
            return
        }
        secretBusy = true
        defer { secretBusy = false }
        do {
            let resp = try await client.unlockVault(masterPassword: masterPassword, session: token)
            secretMessage = resp.unlocked == true ? "Vault unlocked." : (resp.next ?? "Unlock failed.")
            await refreshSecrets()
        } catch {
            secretMessage = "Unlock failed: \(error.localizedDescription)"
        }
    }

    func registerSecret(host: String, user: String, password: String, totp: String?, scope: String?) async {
        guard let client, let token = secretSessionToken else {
            secretMessage = "Enter edit mode first."
            return
        }
        secretBusy = true
        defer { secretBusy = false }
        do {
            let resp = try await client.setSecret(
                host: host, user: user, password: password, totp: totp, scope: scope, session: token
            )
            secretMessage = resp.ok ? "Saved \(host)." : (resp.next ?? "Save failed.")
            await refreshSecrets()
        } catch {
            secretMessage = "Save failed: \(error.localizedDescription)"
        }
    }

    func deleteSecret(host: String, scope: String?) async {
        guard let client, let token = secretSessionToken else {
            secretMessage = "Enter edit mode first."
            return
        }
        secretBusy = true
        defer { secretBusy = false }
        do {
            let resp = try await client.removeSecret(host: host, scope: scope, session: token)
            secretMessage = resp.removed == true ? "Removed \(host)." : (resp.next ?? "Nothing removed.")
            let prefix = revealKeyPrefix(host: host, scope: scope)
            revealedValues = revealedValues.filter { !$0.key.hasPrefix(prefix) }
            await refreshSecrets()
        } catch {
            secretMessage = "Remove failed: \(error.localizedDescription)"
        }
    }

    // MARK: - Secret store: expose (fresh Touch ID + consent per reveal)

    func revealField(host: String, scope: String?, field: String = "password") async {
        guard let client, let appProofKey, let token = secretSessionToken else {
            secretMessage = "Enter edit mode first."
            return
        }
        secretBusy = true
        defer { secretBusy = false }
        let approved = await TouchIDAuth.authenticate(reason: "chromux reveal \(host)")
        guard approved else { secretMessage = "Touch ID was cancelled."; return }
        do {
            let consent = try await client.beginConsent(
                action: "reveal", host: host, field: field, appProof: appProofKey, session: token
            )
            guard consent.ok, let consentToken = consent.consent else {
                secretMessage = consent.next ?? "Consent was denied."
                return
            }
            let revealed = try await client.revealSecret(
                host: host, field: field, consent: consentToken, scope: scope, session: token
            )
            guard revealed.ok, let value = revealed.value else {
                secretMessage = revealed.next ?? "Reveal failed."
                return
            }
            revealedValues[revealKey(host: host, scope: scope, field: field)] = value
            secretMessage = nil
        } catch {
            secretMessage = "Reveal failed: \(error.localizedDescription)"
        }
    }

    func copyTotp(host: String, scope: String?) async {
        guard let client, let appProofKey, let token = secretSessionToken else {
            secretMessage = "Enter edit mode first."
            return
        }
        secretBusy = true
        defer { secretBusy = false }
        let approved = await TouchIDAuth.authenticate(reason: "chromux reveal \(host)")
        guard approved else { secretMessage = "Touch ID was cancelled."; return }
        do {
            let consent = try await client.beginConsent(
                action: "totp", host: host, field: nil, appProof: appProofKey, session: token
            )
            guard consent.ok, let consentToken = consent.consent else {
                secretMessage = consent.next ?? "Consent was denied."
                return
            }
            let result = try await client.totpSecret(host: host, consent: consentToken, scope: scope, session: token)
            guard result.ok, let value = result.value else {
                secretMessage = result.next ?? "TOTP unavailable."
                return
            }
            // TOTP is copied to the clipboard, never rendered in the panel.
            let pasteboard = NSPasteboard.general
            pasteboard.clearContents()
            pasteboard.setString(value, forType: .string)
            secretMessage = "TOTP for \(host) copied to clipboard."
        } catch {
            secretMessage = "TOTP failed: \(error.localizedDescription)"
        }
    }

    func hideRevealedValue(host: String, scope: String?, field: String = "password") {
        revealedValues[revealKey(host: host, scope: scope, field: field)] = nil
    }

    func revealKey(host: String, scope: String?, field: String) -> String {
        "\(revealKeyPrefix(host: host, scope: scope))\(field)"
    }

    private func revealKeyPrefix(host: String, scope: String?) -> String {
        "\(scope ?? "global")/\(host)#"
    }
}
