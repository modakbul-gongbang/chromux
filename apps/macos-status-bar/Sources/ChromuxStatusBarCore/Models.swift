import Foundation

public struct DaemonState: Codable, Equatable, Sendable {
    public let status: String
    public let sessions: Int?
    public let mode: String?
    public let paused: Bool?
    public let error: String?

    public init(status: String, sessions: Int? = nil, mode: String? = nil, paused: Bool? = nil, error: String? = nil) {
        self.status = status
        self.sessions = sessions
        self.mode = mode
        self.paused = paused
        self.error = error
    }
}

public struct ProfileState: Codable, Equatable, Identifiable, Sendable {
    public let name: String
    public let status: String
    public let reason: String?
    public let pid: Int?
    public let port: Int?
    public let launchMode: String?
    public let headless: Bool?
    public let source: String?
    public let userDataDir: String?
    public let modifiedAt: String?
    public let diskUsageBytes: Int64?
    public let daemon: DaemonState?
    public let activeTabs: Int?
    public let paused: Bool?

    public var id: String { name }

    public init(
        name: String,
        status: String,
        reason: String? = nil,
        pid: Int? = nil,
        port: Int? = nil,
        launchMode: String? = nil,
        headless: Bool? = nil,
        source: String? = nil,
        userDataDir: String? = nil,
        modifiedAt: String? = nil,
        diskUsageBytes: Int64? = nil,
        daemon: DaemonState? = nil,
        activeTabs: Int? = nil,
        paused: Bool? = nil
    ) {
        self.name = name
        self.status = status
        self.reason = reason
        self.pid = pid
        self.port = port
        self.launchMode = launchMode
        self.headless = headless
        self.source = source
        self.userDataDir = userDataDir
        self.modifiedAt = modifiedAt
        self.diskUsageBytes = diskUsageBytes
        self.daemon = daemon
        self.activeTabs = activeTabs
        self.paused = paused
    }
}

public struct StatusState: Codable, Equatable, Sendable {
    public let ok: Bool?
    public let generatedAt: String?
    public let chromuxHome: String?
    public let profiles: [ProfileState]

    public init(ok: Bool? = nil, generatedAt: String? = nil, chromuxHome: String? = nil, profiles: [ProfileState]) {
        self.ok = ok
        self.generatedAt = generatedAt
        self.chromuxHome = chromuxHome
        self.profiles = profiles
    }
}

public struct ProfileActionResult: Codable, Equatable, Sendable {
    public let ok: Bool
    public let code: Int?
    public let stdout: String?
    public let stderr: String?
}

public struct ProfileActionResponse: Codable, Equatable, Sendable {
    public let ok: Bool
    public let action: String
    public let profile: String
    public let result: ProfileActionResult?
}

public struct ProfileDeleteResultEntry: Codable, Equatable, Sendable {
    public let profile: String
    public let ok: Bool
    public let killed: Bool?
    public let removed: Bool
    public let error: String?
}

public struct ProfileDeleteResponse: Codable, Equatable, Sendable {
    public let ok: Bool
    public let deleted: Int
    public let failed: Int
    public let results: [ProfileDeleteResultEntry]
}

// MARK: - Secret store (native secrets panel + Touch ID consent)

/// GET api/secrets/state. `optedIn`/`unlocked` are always present in the
/// server response; the rest are advisory and may be absent.
public struct SecretsState: Codable, Equatable, Sendable {
    public let ok: Bool?
    public let optedIn: Bool
    public let unlocked: Bool
    public let ttlRemainingMs: Int?
    public let editSessions: Int?
    public let consentProviders: [String]?
    public let platform: String?
    public let historyCount: Int?

    public init(
        ok: Bool? = nil,
        optedIn: Bool = false,
        unlocked: Bool = false,
        ttlRemainingMs: Int? = nil,
        editSessions: Int? = nil,
        consentProviders: [String]? = nil,
        platform: String? = nil,
        historyCount: Int? = nil
    ) {
        self.ok = ok
        self.optedIn = optedIn
        self.unlocked = unlocked
        self.ttlRemainingMs = ttlRemainingMs
        self.editSessions = editSessions
        self.consentProviders = consentProviders
        self.platform = platform
        self.historyCount = historyCount
    }
}

/// One row in the credential list. Observe surface: host + scope only, never
/// usernames or values.
public struct SecretListItem: Codable, Equatable, Identifiable, Sendable {
    public let host: String
    public let scope: String?

    public var id: String { "\(scope ?? "global")/\(host)" }

    public init(host: String, scope: String? = nil) {
        self.host = host
        self.scope = scope
    }
}

public struct SecretListResponse: Codable, Equatable, Sendable {
    public let ok: Bool?
    public let locked: Bool
    public let items: [SecretListItem]

    public init(ok: Bool? = nil, locked: Bool = false, items: [SecretListItem] = []) {
        self.ok = ok
        self.locked = locked
        self.items = items
    }
}

/// One usage-history event. `timestamp` is epoch milliseconds. Read from an
/// activity log, so it is available even while the vault is locked, and never
/// carries a secret value.
public struct SecretHistoryEvent: Codable, Equatable, Sendable {
    public let timestamp: Double?
    public let host: String?
    public let scope: String?
    public let field: String?
    public let outcome: String?
    public let ok: Bool?

    public init(
        timestamp: Double? = nil,
        host: String? = nil,
        scope: String? = nil,
        field: String? = nil,
        outcome: String? = nil,
        ok: Bool? = nil
    ) {
        self.timestamp = timestamp
        self.host = host
        self.scope = scope
        self.field = field
        self.outcome = outcome
        self.ok = ok
    }
}

public struct SecretHistoryResponse: Codable, Equatable, Sendable {
    public let ok: Bool?
    public let events: [SecretHistoryEvent]

    public init(ok: Bool? = nil, events: [SecretHistoryEvent] = []) {
        self.ok = ok
        self.events = events
    }
}

/// GET api/secrets/setup-state. `bwPath` is an extra field the server returns
/// alongside the frozen `{ok, bwInstalled, loggedIn, unlocked}` contract.
public struct SecretSetupState: Codable, Equatable, Sendable {
    public let ok: Bool?
    public let bwInstalled: Bool
    public let bwPath: String?
    public let loggedIn: Bool
    public let unlocked: Bool

    public init(
        ok: Bool? = nil,
        bwInstalled: Bool = false,
        bwPath: String? = nil,
        loggedIn: Bool = false,
        unlocked: Bool = false
    ) {
        self.ok = ok
        self.bwInstalled = bwInstalled
        self.bwPath = bwPath
        self.loggedIn = loggedIn
        self.unlocked = unlocked
    }
}

/// POST api/secrets/session/begin. On success carries the in-memory `token`;
/// on failure carries `secret`/`next` denial hints.
public struct SecretSessionResponse: Codable, Equatable, Sendable {
    public let ok: Bool
    public let token: String?
    public let ttlRemainingMs: Int?
    public let via: String?
    public let secret: String?
    public let next: String?

    public init(
        ok: Bool,
        token: String? = nil,
        ttlRemainingMs: Int? = nil,
        via: String? = nil,
        secret: String? = nil,
        next: String? = nil
    ) {
        self.ok = ok
        self.token = token
        self.ttlRemainingMs = ttlRemainingMs
        self.via = via
        self.secret = secret
        self.next = next
    }
}

/// POST api/secrets/consent/begin. `consent` is the single-use token to hand
/// straight to reveal/totp.
public struct SecretConsentResponse: Codable, Equatable, Sendable {
    public let ok: Bool
    public let consent: String?
    public let ttlRemainingMs: Int?
    public let secret: String?
    public let next: String?

    public init(
        ok: Bool,
        consent: String? = nil,
        ttlRemainingMs: Int? = nil,
        secret: String? = nil,
        next: String? = nil
    ) {
        self.ok = ok
        self.consent = consent
        self.ttlRemainingMs = ttlRemainingMs
        self.secret = secret
        self.next = next
    }
}

/// POST api/secrets/reveal and api/secrets/totp. `value` is present only on a
/// fresh-consent success and is meant to be shown transiently.
public struct SecretRevealResponse: Codable, Equatable, Sendable {
    public let ok: Bool
    public let host: String?
    public let scope: String?
    public let field: String?
    public let value: String?
    public let secret: String?
    public let next: String?

    public init(
        ok: Bool,
        host: String? = nil,
        scope: String? = nil,
        field: String? = nil,
        value: String? = nil,
        secret: String? = nil,
        next: String? = nil
    ) {
        self.ok = ok
        self.host = host
        self.scope = scope
        self.field = field
        self.value = value
        self.secret = secret
        self.next = next
    }
}

/// Shared shape for the manage/wizard mutations (optin/set/rm/unlock/revoke/
/// wizard). Every field except `ok` is optional so one type covers them all.
public struct SecretActionResponse: Codable, Equatable, Sendable {
    public let ok: Bool
    public let optedIn: Bool?
    public let updated: Bool?
    public let removed: Bool?
    public let unlocked: Bool?
    public let loggedIn: Bool?
    public let revoked: Bool?
    public let bwPath: String?
    public let host: String?
    public let scope: String?
    public let secret: String?
    public let next: String?

    public init(
        ok: Bool,
        optedIn: Bool? = nil,
        updated: Bool? = nil,
        removed: Bool? = nil,
        unlocked: Bool? = nil,
        loggedIn: Bool? = nil,
        revoked: Bool? = nil,
        bwPath: String? = nil,
        host: String? = nil,
        scope: String? = nil,
        secret: String? = nil,
        next: String? = nil
    ) {
        self.ok = ok
        self.optedIn = optedIn
        self.updated = updated
        self.removed = removed
        self.unlocked = unlocked
        self.loggedIn = loggedIn
        self.revoked = revoked
        self.bwPath = bwPath
        self.host = host
        self.scope = scope
        self.secret = secret
        self.next = next
    }
}
