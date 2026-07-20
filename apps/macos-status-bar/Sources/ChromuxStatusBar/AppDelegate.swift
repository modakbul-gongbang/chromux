import AppKit

/// Owns the single shared `AppModel` and the app lifecycle contract (R1, R5,
/// R6): regular Dock/Cmd+Tab presence, window-close-stays-resident, an
/// explicit Quit that stops the local server before the process exits, and
/// visibility-gated polling for both the main window and the menu bar
/// dropdown.
///
/// SwiftUI's `onAppear`/`onDisappear` are not a reliable signal here: the
/// main `Window` scene's view does not reliably receive `onDisappear` when
/// closed via the standard close button (a documented SwiftUI-on-macOS
/// limitation), and it is not observable via global `NSApp.windows` /
/// `NotificationCenter` `NSWindow` notifications either in this SwiftUI
/// runtime. Instead, `WindowAccessor` resolves the real `NSWindow` instance
/// from inside the view hierarchy and this object becomes that specific
/// window's delegate. `MenuBarExtra` content in `.menu` style has no
/// SwiftUI view lifecycle at all, so its visibility is tracked via
/// `NSMenu.didBeginTracking`/`didEndTracking` notifications instead, the
/// same mechanism the previous AppKit wrapper used
/// (`NSMenuDelegate.menuWillOpen`).
@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    let model = AppModel()
    private var mainWindow: NSWindow?
    private var mainWindowVisible = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        model.startServer()
        model.presentMainWindow = { [weak self] in self?.showMainWindow() }

        let center = NotificationCenter.default
        center.addObserver(self, selector: #selector(statusMenuDidBeginTracking(_:)), name: NSMenu.didBeginTrackingNotification, object: nil)
        center.addObserver(self, selector: #selector(statusMenuDidEndTracking(_:)), name: NSMenu.didEndTrackingNotification, object: nil)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        false
    }

    /// Dock/Spotlight relaunch of an already-running resident app (R1). When
    /// the dashboard window is hidden there are no visible windows, so re-front
    /// the retained window; otherwise the relaunch would only reactivate the
    /// app with no visible UI (the reported "Spotlight opens nothing").
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag {
            showMainWindow()
        }
        return true
    }

    func applicationWillTerminate(_ notification: Notification) {
        model.stopServer()
    }

    // MARK: - Main window visibility (R6, AC9)

    /// Called by `WindowAccessor` once the main window resolves. The window is
    /// hidden (orderOut), not destroyed, on close (see `windowShouldClose`), so
    /// this normally fires once per process. The `mainWindow !==` guard keeps
    /// it idempotent if SwiftUI ever hands back a fresh instance.
    func attachMainWindow(_ window: NSWindow) {
        guard mainWindow !== window else { return }
        mainWindow = window
        window.delegate = self
        if !mainWindowVisible {
            mainWindowVisible = true
            model.markWindowVisible()
        }
    }

    /// Brings the dashboard window back for Dock/Spotlight relaunch and the menu
    /// "Open chromux" action. SwiftUI's single `Window` scene does not reliably
    /// reopen once its `NSWindow` is destroyed via `openWindow(id:)`, so the
    /// window is kept alive and hidden on close and simply re-fronted here.
    @objc func showMainWindow() {
        NSApp.activate(ignoringOtherApps: true)
        if let mainWindow {
            mainWindow.makeKeyAndOrderFront(nil)
        } else {
            model.openMainWindow?()
        }
        if !mainWindowVisible {
            mainWindowVisible = true
            model.markWindowVisible()
        }
    }

    /// Hide (not destroy) the dashboard window on close so the resident app can
    /// re-front the same `NSWindow` on relaunch. Returning `false` cancels the
    /// AppKit close; `orderOut` removes it from screen. `NSWindowDelegate`
    /// callbacks always arrive on the main thread.
    nonisolated func windowShouldClose(_ sender: NSWindow) -> Bool {
        MainActor.assumeIsolated {
            sender.orderOut(nil)
            if mainWindowVisible {
                mainWindowVisible = false
                model.markWindowHidden()
            }
        }
        return false
    }

    // MARK: - Menu bar dropdown visibility (R6, AC9)

    @objc private func statusMenuDidBeginTracking(_ notification: Notification) {
        guard let menu = notification.object as? NSMenu, isStatusItemMenu(menu) else { return }
        model.markWindowVisible()
    }

    @objc private func statusMenuDidEndTracking(_ notification: Notification) {
        guard let menu = notification.object as? NSMenu, isStatusItemMenu(menu) else { return }
        model.markWindowHidden()
    }

    /// The `MenuBarExtra` status item's menu is not reachable through public
    /// SwiftUI API, so it is identified by exclusion: this app has no other
    /// menus that begin tracking during normal use (the app menu bar's
    /// File/Edit/Window/Help menus are submenus of `NSApp.mainMenu`; the
    /// status item's menu is not).
    private func isStatusItemMenu(_ menu: NSMenu) -> Bool {
        guard let mainMenu = NSApp.mainMenu else { return true }
        return !mainMenu.items.contains { $0.submenu === menu }
    }
}
