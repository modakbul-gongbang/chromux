import Foundation
import AppKit
import WebKit

struct StatusState: Decodable {
    let profiles: [ProfileState]
}

struct ProfileState: Decodable {
    let name: String
    let status: String
    let port: Int?
    let activeTabs: Int?
    let daemon: DaemonState?

    var isActive: Bool {
        status == "running" || (activeTabs ?? 0) > 0 || daemon?.status == "running"
    }

    var menuTitle: String {
        let tabText = activeTabs.map { "\($0) tab\($0 == 1 ? "" : "s")" } ?? "tabs unknown"
        if let port {
            return "\(name) - \(status), \(tabText), :\(port)"
        }
        return "\(name) - \(status), \(tabText)"
    }
}

struct DaemonState: Decodable {
    let status: String
}

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, NSMenuDelegate {
    private var statusItem: NSStatusItem!
    private var serverProcess: Process?
    private var serverURL: URL?
    private var window: NSWindow?
    private var webView: WKWebView?
    private let statusMenu = NSMenu()
    private let statusLine = NSMenuItem(title: "Starting local server...", action: nil, keyEquivalent: "")
    private var profileMenuItems: [NSMenuItem] = []

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        configureStatusItem()
        startServer()
        openDashboard()
    }

    func applicationWillTerminate(_ notification: Notification) {
        stopServer()
    }

    private func configureStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem.button {
            button.title = "cx"
            button.font = NSFont.monospacedSystemFont(ofSize: 13, weight: .bold)
        }

        statusLine.isEnabled = false
        statusMenu.delegate = self
        statusMenu.addItem(statusLine)
        statusMenu.addItem(NSMenuItem.separator())
        statusMenu.addItem(NSMenuItem(title: "Open Dashboard", action: #selector(openDashboard), keyEquivalent: "o"))
        statusMenu.addItem(NSMenuItem(title: "Open In Browser", action: #selector(openInBrowser), keyEquivalent: "b"))
        statusMenu.addItem(NSMenuItem(title: "Restart Local Server", action: #selector(restartServer), keyEquivalent: "r"))
        statusMenu.addItem(NSMenuItem.separator())
        statusMenu.addItem(NSMenuItem(title: "Quit", action: #selector(quit), keyEquivalent: "q"))
        statusMenu.items.forEach { $0.target = self }
        statusItem.menu = statusMenu
        log("status item ready: cx")
    }

    func menuWillOpen(_ menu: NSMenu) {
        refreshProfileMenu()
    }

    private func resourcePath(_ name: String, type: String? = nil) -> String? {
        Bundle.main.path(forResource: name, ofType: type)
    }

    private func statusAppLaunch(chromuxPath: String) -> (executable: URL, arguments: [String]) {
        let nodeCandidates = [
            ProcessInfo.processInfo.environment["CHROMUX_NODE"],
            "/opt/homebrew/bin/node",
            "/usr/local/bin/node",
            "/usr/bin/node",
        ].compactMap { $0 }

        for candidate in nodeCandidates {
            if FileManager.default.isExecutableFile(atPath: candidate) {
                return (
                    URL(fileURLWithPath: candidate),
                    [chromuxPath, "app", "--host", "127.0.0.1", "--port", "0"]
                )
            }
        }

        return (
            URL(fileURLWithPath: "/usr/bin/env"),
            ["node", chromuxPath, "app", "--host", "127.0.0.1", "--port", "0"]
        )
    }

    private func serverEnvironment() -> [String: String] {
        var env = ProcessInfo.processInfo.environment
        let defaultPath = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        if let path = env["PATH"], !path.isEmpty {
            env["PATH"] = "\(defaultPath):\(path)"
        } else {
            env["PATH"] = defaultPath
        }
        return env
    }

    private func startServer() {
        guard serverProcess == nil else { return }
        guard let chromuxPath = resourcePath("chromux", type: "mjs") else {
            updateStatus("Missing chromux.mjs")
            return
        }

        let process = Process()
        let output = Pipe()
        let error = Pipe()
        let launch = statusAppLaunch(chromuxPath: chromuxPath)
        process.executableURL = launch.executable
        process.arguments = launch.arguments
        process.standardOutput = output
        process.standardError = error
        process.environment = serverEnvironment()
        process.terminationHandler = { [weak self] proc in
            DispatchQueue.main.async {
                if self?.serverProcess === proc {
                    self?.serverProcess = nil
                    self?.serverURL = nil
                    self?.updateStatus("Server stopped")
                }
            }
        }

        output.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            if data.isEmpty {
                handle.readabilityHandler = nil
                return
            }
            guard let text = String(data: data, encoding: .utf8) else { return }
            DispatchQueue.main.async {
                self?.handleServerOutput(text)
            }
        }

        error.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            if data.isEmpty {
                handle.readabilityHandler = nil
                return
            }
            guard let text = String(data: data, encoding: .utf8) else { return }
            DispatchQueue.main.async {
                self?.updateStatus(text.trimmingCharacters(in: .whitespacesAndNewlines))
            }
        }

        do {
            try process.run()
            serverProcess = process
            updateStatus("Starting local server...")
        } catch {
            updateStatus("Launch failed: \(error.localizedDescription)")
        }
    }

    private func handleServerOutput(_ text: String) {
        for line in text.split(separator: "\n").map(String.init) {
            guard let range = line.range(of: "http://127.0.0.1:") else { continue }
            let urlText = String(line[range.lowerBound...]).trimmingCharacters(in: .whitespacesAndNewlines)
            if let url = URL(string: urlText) {
                serverURL = url
                updateStatus(url.absoluteString)
                loadDashboardIfVisible()
                refreshProfileMenu()
            }
        }
    }

    private func updateStatus(_ text: String) {
        statusLine.title = text.isEmpty ? "chromux status" : text
    }

    private func replaceProfileMenuItems(with items: [NSMenuItem]) {
        for item in profileMenuItems {
            statusMenu.removeItem(item)
        }
        profileMenuItems = items

        let insertIndex = min(2, statusMenu.numberOfItems)
        for (offset, item) in items.enumerated() {
            statusMenu.insertItem(item, at: insertIndex + offset)
        }
        statusMenu.update()
    }

    private func refreshProfileMenu() {
        guard let stateURL = serverURL?.appendingPathComponent("api/state") else {
            replaceProfileMenuItems(with: disabledProfileItems(["Profiles unavailable until server starts"]))
            return
        }

        replaceProfileMenuItems(with: disabledProfileItems(["Loading profiles..."]))

        URLSession.shared.dataTask(with: stateURL) { [weak self] data, _, error in
            let titles: [String]
            if let error {
                titles = ["Profiles unavailable: \(error.localizedDescription)"]
            } else if let data, let state = try? JSONDecoder().decode(StatusState.self, from: data) {
                let activeProfiles = state.profiles
                    .filter { $0.isActive }
                    .sorted {
                        if $0.status == $1.status { return $0.name.localizedStandardCompare($1.name) == .orderedAscending }
                        return $0.status == "running"
                    }
                if activeProfiles.isEmpty {
                    titles = ["No active profiles"]
                } else {
                    titles = ["Active Profiles"] + activeProfiles.map(\.menuTitle)
                }
            } else {
                titles = ["Profiles unavailable: invalid server response"]
            }

            DispatchQueue.main.async {
                self?.replaceProfileMenuItems(with: self?.disabledProfileItems(titles) ?? [])
            }
        }.resume()
    }

    private func disabledProfileItems(_ titles: [String]) -> [NSMenuItem] {
        titles.map { title in
            let item = NSMenuItem(title: title, action: nil, keyEquivalent: "")
            item.isEnabled = false
            if title == "Active Profiles" {
                item.attributedTitle = NSAttributedString(
                    string: title,
                    attributes: [
                        .font: NSFont.menuBarFont(ofSize: 0).withSize(11),
                        .foregroundColor: NSColor.secondaryLabelColor,
                    ]
                )
            }
            return item
        }
    }

    private func stopServer() {
        serverProcess?.terminate()
        serverProcess = nil
    }

    @objc private func restartServer() {
        stopServer()
        serverURL = nil
        updateStatus("Restarting local server...")
        startServer()
    }

    @objc private func openDashboard() {
        if serverProcess == nil {
            startServer()
        }

        if window == nil {
            let config = WKWebViewConfiguration()
            let web = WKWebView(frame: NSRect(x: 0, y: 0, width: 1120, height: 760), configuration: config)
            web.navigationDelegate = self
            webView = web

            let win = NSWindow(
                contentRect: NSRect(x: 0, y: 0, width: 1120, height: 760),
                styleMask: [.titled, .closable, .miniaturizable, .resizable],
                backing: .buffered,
                defer: false
            )
            win.title = "chromux status"
            win.contentView = web
            win.center()
            window = win
            log("dashboard window ready")
        }

        loadDashboardIfVisible()
        window?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func loadDashboardIfVisible() {
        guard let url = serverURL, let webView else { return }
        if webView.url != url {
            webView.load(URLRequest(url: url))
        }
    }

    @objc private func openInBrowser() {
        guard let url = serverURL else {
            startServer()
            return
        }
        NSWorkspace.shared.open(url)
    }

    @objc private func quit() {
        NSApp.terminate(nil)
    }

    private func log(_ message: String) {
        FileHandle.standardError.write(("chromux status: \(message)\n").data(using: .utf8)!)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
