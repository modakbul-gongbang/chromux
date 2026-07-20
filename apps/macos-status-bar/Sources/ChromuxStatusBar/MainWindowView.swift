import SwiftUI
import AppKit
import ChromuxStatusBarCore

struct MainWindowView: View {
    @ObservedObject var model: AppModel
    let onWindowResolved: (NSWindow) -> Void
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        NavigationSplitView {
            ProfileListView(model: model)
                .navigationSplitViewColumnWidth(min: 260, ideal: 300, max: 380)
        } detail: {
            ProfileDetailView(model: model)
        }
        .navigationTitle("chromux")
        .background(DesignTokens.canvas)
        .background(WindowAccessor(onResolve: onWindowResolved))
        // Delete confirmation lives at the split-view root, not inside the
        // sidebar List: alerts/dialogs attached to List rows in a
        // NavigationSplitView sidebar can fail to present. Drives both the
        // single-profile (detail pane) and bulk (sidebar) delete paths.
        .alert(
            "Delete \(model.pendingDeleteNames?.count ?? 0) profile\((model.pendingDeleteNames?.count ?? 0) == 1 ? "" : "s")?",
            isPresented: Binding(
                get: { model.pendingDeleteNames != nil },
                set: { if !$0 { model.cancelPendingDelete() } }
            ),
            presenting: model.pendingDeleteNames
        ) { names in
            // `names` is captured at present time, so dismissing the alert
            // (which clears pendingDeleteNames) can't empty it before delete runs.
            Button("Delete", role: .destructive) {
                Task { await model.confirmPendingDelete(names) }
            }
            Button("Cancel", role: .cancel) {
                model.cancelPendingDelete()
            }
        } message: { names in
            Text(DeleteSummary.confirmationMessage(names: names))
        }
        .onAppear {
            // Capture the environment's OpenWindowAction so AppDelegate can
            // reopen the dashboard on Dock/Spotlight relaunch (R1). The action
            // outlives this specific window instance.
            if model.openMainWindow == nil {
                model.openMainWindow = { openWindow(id: "main") }
            }
        }
    }
}
