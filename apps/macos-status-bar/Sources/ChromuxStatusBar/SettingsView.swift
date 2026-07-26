import SwiftUI
import ServiceManagement

/// Launch at Login toggle, carried over unchanged from the previous wrapper (R8, AC14).
struct SettingsView: View {
    @ObservedObject var model: AppModel
    @State private var launchAtLoginEnabled = SMAppService.mainApp.status == .enabled
    @State private var errorMessage: String?

    var body: some View {
        Form {
            Toggle("Launch at Login", isOn: Binding(
                get: { launchAtLoginEnabled },
                set: { toggleLaunchAtLogin($0) }
            ))
            if let errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            Divider()

            // Opt-in for the secret store. Flipping it mints a fresh Touch ID
            // session (the manage-tier boundary), so the toggle is disabled
            // while a mint/refresh is in flight.
            Toggle("Enable secret store", isOn: Binding(
                get: { model.secretOptedIn },
                set: { isOn in Task { await model.setSecretOptin(enabled: isOn) } }
            ))
            .disabled(model.secretBusy || !model.isServerReachable)
            Text("Confirms presence with Touch ID before turning credential storage on or off.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(20)
        .frame(width: 360)
        .onAppear { launchAtLoginEnabled = SMAppService.mainApp.status == .enabled }
        .task { await model.refreshSecrets() }
    }

    private func toggleLaunchAtLogin(_ isOn: Bool) {
        do {
            if isOn {
                try SMAppService.mainApp.register()
            } else {
                try SMAppService.mainApp.unregister()
            }
            errorMessage = nil
        } catch {
            errorMessage = "Launch at Login failed: \(error.localizedDescription)"
        }
        launchAtLoginEnabled = SMAppService.mainApp.status == .enabled
    }
}
