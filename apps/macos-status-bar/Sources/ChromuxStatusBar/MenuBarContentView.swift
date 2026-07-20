import SwiftUI
import AppKit
import ChromuxStatusBarCore

/// The menu bar status item label ("cx"). It is the one SwiftUI view that is
/// reliably alive for the whole process, so it is used to (1) capture the
/// environment `openWindow` action into the model and (2) open the dashboard
/// once at launch, since the `Window` scene does not auto-present (R1).
struct MenuBarLabel: View {
    @ObservedObject var model: AppModel
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        Text("cx")
            .font(.system(size: 13, weight: .bold, design: .monospaced))
            .onAppear {
                let open = { openWindow(id: "main") }
                model.openMainWindow = open
                if !model.didAutoOpenAtLaunch {
                    model.didAutoOpenAtLaunch = true
                    open()
                }
            }
    }
}

/// Read-only menu bar dropdown (R2, D20): summary of active profiles only.
/// No kill/delete controls live here; clicking a row opens the main window.
struct MenuBarContentView: View {
    @ObservedObject var model: AppModel

    // Visibility-gated polling (R6, AC9) is driven by AppDelegate observing
    // NSMenu.didBeginTracking/didEndTracking for this menu, not by SwiftUI
    // view lifecycle: MenuBarExtra's `.menu` style content is converted into
    // native NSMenuItems with no onAppear/onDisappear of its own.
    var body: some View {
        if !model.isServerReachable {
            Text("Server not running")
            Text(model.statusLine).foregroundStyle(.secondary)
            Button("Restart Server") { model.restartServer() }
            Divider()
        } else {
            let active = model.orderedActiveProfiles
            if active.isEmpty {
                Text("No active profiles")
            } else {
                ForEach(active) { profile in
                    Button(menuTitle(for: profile)) {
                        model.selectedProfileName = profile.name
                        model.presentMainWindow?()
                    }
                }
            }
            Divider()
        }

        Button("Open chromux") {
            model.presentMainWindow?()
        }
        Button("Quit") {
            model.stopServer()
            NSApp.terminate(nil)
        }
    }

    private func menuTitle(for profile: ProfileState) -> String {
        var parts = [String]()
        if let activeTabs = profile.activeTabs {
            parts.append("\(activeTabs) tab\(activeTabs == 1 ? "" : "s")")
        } else {
            parts.append("tabs unknown")
        }
        parts.append(ByteFormatter.format(profile.diskUsageBytes))
        if let port = profile.port {
            parts.append(":\(port)")
        }
        return "\(profile.name) - \(profile.status), \(parts.joined(separator: ", "))"
    }
}
