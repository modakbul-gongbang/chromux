import SwiftUI
import ChromuxStatusBarCore

/// Native SwiftUI secrets panel (T6/N7). Pure REST client of the local server;
/// no WebKit. Opt-in dormancy: until the user opts in, only a "Set up secret
/// store" button shows. Once opted in, lock state + TTL + usage history are
/// always visible; the credential list shows host/scope only (never values);
/// and edit mode (a minted Touch ID session) unlocks the register/unlock forms
/// and per-credential reveal / copy-TOTP, each gated by a fresh Touch ID.
struct SecretsPanelView: View {
    @ObservedObject var model: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if !model.isServerReachable {
                    disconnected
                } else if model.secretsState == nil {
                    ProgressView("Loading secret store...")
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 40)
                } else if !model.secretOptedIn {
                    SecretDormantView(model: model)
                } else {
                    SecretActiveView(model: model)
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(DesignTokens.canvas)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if let message = model.secretMessage {
                Text(message)
                    .font(.caption)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(DesignTokens.surface2)
            }
        }
        .task {
            // Self-contained refresh loop tied to this window's lifetime; the
            // main dashboard's visibility-gated poll drives its own surface.
            await model.refreshSecrets()
            await model.refreshSecretSetupState()
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 7_000_000_000)
                await model.refreshSecrets()
            }
        }
    }

    private var disconnected: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Secret store")
                .font(.title2.bold())
            Text("The local chromux server is not running.")
                .foregroundStyle(DesignTokens.inkSubtle)
        }
    }
}

// MARK: - Dormant (not opted in)

private struct SecretDormantView: View {
    @ObservedObject var model: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Secret store")
                .font(.title2.bold())
            Text("The secret store is off. It stays completely dormant until you opt in: no credentials are stored or served, and nothing runs in the background.")
                .foregroundStyle(DesignTokens.inkMuted)
                .fixedSize(horizontal: false, vertical: true)
            Text("Setting up confirms you are present with Touch ID, then opts this machine in.")
                .font(.caption)
                .foregroundStyle(DesignTokens.inkSubtle)
                .fixedSize(horizontal: false, vertical: true)
            Button("Set up secret store") {
                Task { await model.setupSecretStore() }
            }
            .buttonStyle(.borderedProminent)
            .disabled(model.secretBusy)

            if let setup = model.secretSetupState, !setup.bwInstalled {
                Text("Bitwarden CLI (bw) is not installed yet; after opting in you can run the setup wizard from a terminal (`chromux secret setup`).")
                    .font(.caption)
                    .foregroundStyle(DesignTokens.inkSubtle)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

// MARK: - Active (opted in)

private struct SecretActiveView: View {
    @ObservedObject var model: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            header
            SecretStatusSection(model: model)
            if model.secretVaultUnlocked {
                SecretCredentialListSection(model: model)
            } else {
                SecretLockedSection(model: model)
            }
            if model.hasEditSession {
                SecretRegisterSection(model: model)
            }
            SecretHistorySection(model: model)
        }
    }

    private var header: some View {
        HStack {
            Text("Secret store")
                .font(.title2.bold())
            SecretLockPill(unlocked: model.secretVaultUnlocked)
            Spacer()
            if model.hasEditSession {
                Button("Exit edit mode") { Task { await model.exitEditMode() } }
                    .disabled(model.secretBusy)
            } else {
                Button("Enter edit mode") { Task { await model.enterEditMode() } }
                    .disabled(model.secretBusy)
            }
        }
    }
}

private struct SecretStatusSection: View {
    @ObservedObject var model: AppModel

    private var rows: [(String, String)] {
        let state = model.secretsState
        return [
            ("Opted in", (state?.optedIn ?? false) ? "yes" : "no"),
            ("Vault", (state?.unlocked ?? false) ? "unlocked" : "locked"),
            ("Session TTL", ttlText(state?.ttlRemainingMs)),
            ("Edit sessions", state?.editSessions.map(String.init) ?? "0"),
            ("Consent providers", state?.consentProviders?.joined(separator: ", ") ?? "-"),
            ("Platform", state?.platform ?? "-"),
        ]
    }

    var body: some View {
        SecretFactsSection(title: "Status", rows: rows)
    }

    private func ttlText(_ ms: Int?) -> String {
        guard let ms, ms > 0 else { return "-" }
        let totalSeconds = ms / 1000
        return String(format: "%d:%02d", totalSeconds / 60, totalSeconds % 60)
    }
}

// MARK: - Locked vault (never shows values)

private struct SecretLockedSection: View {
    @ObservedObject var model: AppModel
    @State private var masterPassword: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Vault locked")
                .font(.headline)
                .foregroundStyle(DesignTokens.inkSubtle)
            Text("The vault is locked, so stored hosts and values are hidden. Unlock it in edit mode to manage credentials.")
                .font(.caption)
                .foregroundStyle(DesignTokens.inkSubtle)
                .fixedSize(horizontal: false, vertical: true)
            if model.hasEditSession {
                HStack {
                    SecureField("Master password", text: $masterPassword)
                        .textFieldStyle(.roundedBorder)
                        .frame(maxWidth: 280)
                    Button("Unlock vault") {
                        let pw = masterPassword
                        masterPassword = ""
                        Task { await model.unlockVault(masterPassword: pw) }
                    }
                    .disabled(model.secretBusy || masterPassword.isEmpty)
                }
            } else {
                Text("Enter edit mode to unlock.")
                    .font(.caption)
                    .foregroundStyle(DesignTokens.inkSubtle)
            }
        }
    }
}

// MARK: - Credential list (host/scope only)

private struct SecretCredentialListSection: View {
    @ObservedObject var model: AppModel

    private var items: [SecretListItem] { model.secretList?.items ?? [] }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Credentials")
                .font(.headline)
                .foregroundStyle(DesignTokens.inkSubtle)
            if items.isEmpty {
                Text("No stored credentials.")
                    .font(.caption)
                    .foregroundStyle(DesignTokens.inkSubtle)
            } else {
                ForEach(items) { item in
                    SecretCredentialRow(model: model, item: item)
                    Divider().background(DesignTokens.hairline)
                }
            }
        }
    }
}

private struct SecretCredentialRow: View {
    @ObservedObject var model: AppModel
    let item: SecretListItem

    private var passwordKey: String {
        model.revealKey(host: item.host, scope: item.scope, field: "password")
    }
    private var revealedPassword: String? { model.revealedValues[passwordKey] }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.host).font(.body)
                    Text("scope: \(item.scope ?? "global")")
                        .font(.caption)
                        .foregroundStyle(DesignTokens.inkSubtle)
                }
                Spacer()
                if model.hasEditSession {
                    Button("Reveal") {
                        Task { await model.revealField(host: item.host, scope: item.scope) }
                    }
                    .disabled(model.secretBusy)
                    Button("Copy TOTP") {
                        Task { await model.copyTotp(host: item.host, scope: item.scope) }
                    }
                    .disabled(model.secretBusy)
                    Button("Delete", role: .destructive) {
                        Task { await model.deleteSecret(host: item.host, scope: item.scope) }
                    }
                    .disabled(model.secretBusy)
                }
            }
            if let value = revealedPassword {
                HStack {
                    Text(value)
                        .font(.system(.body, design: .monospaced))
                        .textSelection(.enabled)
                        .padding(6)
                        .background(DesignTokens.surface2, in: RoundedRectangle(cornerRadius: 6))
                    Button("Hide") {
                        model.hideRevealedValue(host: item.host, scope: item.scope)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Register / edit form (edit mode only)

private struct SecretRegisterSection: View {
    @ObservedObject var model: AppModel
    @State private var host = ""
    @State private var user = ""
    @State private var password = ""
    @State private var totp = ""
    @State private var scope = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Register / edit credential")
                .font(.headline)
                .foregroundStyle(DesignTokens.inkSubtle)
            Grid(alignment: .leading, horizontalSpacing: 12, verticalSpacing: 8) {
                GridRow {
                    Text("Host").foregroundStyle(DesignTokens.inkSubtle)
                    TextField("github.com", text: $host).textFieldStyle(.roundedBorder)
                }
                GridRow {
                    Text("User").foregroundStyle(DesignTokens.inkSubtle)
                    TextField("username or email", text: $user).textFieldStyle(.roundedBorder)
                }
                GridRow {
                    Text("Password").foregroundStyle(DesignTokens.inkSubtle)
                    SecureField("password", text: $password).textFieldStyle(.roundedBorder)
                }
                GridRow {
                    Text("TOTP secret").foregroundStyle(DesignTokens.inkSubtle)
                    SecureField("optional", text: $totp).textFieldStyle(.roundedBorder)
                }
                GridRow {
                    Text("Scope").foregroundStyle(DesignTokens.inkSubtle)
                    TextField("global (default)", text: $scope).textFieldStyle(.roundedBorder)
                }
            }
            .frame(maxWidth: 460)
            Button("Save credential") {
                Task {
                    await model.registerSecret(
                        host: host,
                        user: user,
                        password: password,
                        totp: totp.isEmpty ? nil : totp,
                        scope: scope.isEmpty ? nil : scope
                    )
                    password = ""
                    totp = ""
                }
            }
            .disabled(model.secretBusy || host.isEmpty || user.isEmpty || password.isEmpty)
        }
    }
}

// MARK: - Usage history (always visible when opted in)

private struct SecretHistorySection: View {
    @ObservedObject var model: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Usage history")
                .font(.headline)
                .foregroundStyle(DesignTokens.inkSubtle)
            if model.secretHistory.isEmpty {
                Text("No usage yet.")
                    .font(.caption)
                    .foregroundStyle(DesignTokens.inkSubtle)
            } else {
                ForEach(Array(model.secretHistory.enumerated()), id: \.offset) { _, event in
                    HStack(spacing: 8) {
                        StatusPill(status: event.ok == true ? "running" : "error")
                        Text(event.host ?? "-")
                        Text(event.field ?? "-")
                            .foregroundStyle(DesignTokens.inkSubtle)
                        Spacer()
                        Text(event.outcome ?? (event.ok == true ? "ok" : "error"))
                            .font(.caption)
                            .foregroundStyle(DesignTokens.inkSubtle)
                        Text(timestampText(event.timestamp))
                            .font(.caption.monospacedDigit())
                            .foregroundStyle(DesignTokens.inkSubtle)
                    }
                    .font(.caption)
                }
            }
        }
    }

    private func timestampText(_ ms: Double?) -> String {
        guard let ms else { return "-" }
        let date = Date(timeIntervalSince1970: ms / 1000)
        let formatter = DateFormatter()
        formatter.dateFormat = "MM-dd HH:mm"
        return formatter.string(from: date)
    }
}

// MARK: - Shared bits

private struct SecretFactsSection: View {
    let title: String
    let rows: [(String, String)]

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.headline)
                .foregroundStyle(DesignTokens.inkSubtle)
            Grid(alignment: .leading, horizontalSpacing: 16, verticalSpacing: 6) {
                ForEach(rows, id: \.0) { row in
                    GridRow {
                        Text(row.0).foregroundStyle(DesignTokens.inkSubtle)
                        Text(row.1)
                    }
                }
            }
        }
    }
}

private struct SecretLockPill: View {
    let unlocked: Bool

    var body: some View {
        let color = unlocked ? DesignTokens.semanticSuccess : DesignTokens.inkSubtle
        Text(unlocked ? "unlocked" : "locked")
            .font(.caption2.weight(.medium))
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.18), in: Capsule())
            .foregroundStyle(color)
    }
}
