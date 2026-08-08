import Foundation
import ChromuxStatusBarCore

/// Secret-store REST calls (the `/api/secrets/*` boundary). Kept as an
/// extension on the same `APIClient` so all server access shares one type and
/// its `checkOK` transport check.
///
/// Auth model:
/// - Every request carries `X-Chromux-Secret: 1` (the load-bearing CSRF header
///   the server requires on this boundary).
/// - Observe reads (state/list/history/setup-state) need nothing more.
/// - Manage/expose calls carry the in-memory edit-session token as
///   `X-Chromux-Secret-Session`. The token is passed per call by `AppModel`
///   (never persisted, never a cookie).
/// - Native presence-proof mints (session/consent begin) carry the app-proof
///   key as `X-Chromux-App-Proof`.
extension APIClient {
    private static let secretHeader = "X-Chromux-Secret"
    private static let sessionHeader = "X-Chromux-Secret-Session"
    private static let appProofHeader = "X-Chromux-App-Proof"

    // MARK: - Observe reads

    func fetchSecretsState() async throws -> SecretsState {
        try await secretGET("api/secrets/state", as: SecretsState.self)
    }

    func fetchSecretList() async throws -> SecretListResponse {
        try await secretGET("api/secrets/list", as: SecretListResponse.self)
    }

    func fetchSecretHistory() async throws -> SecretHistoryResponse {
        try await secretGET("api/secrets/history", as: SecretHistoryResponse.self)
    }

    func fetchSecretSetupState() async throws -> SecretSetupState {
        try await secretGET("api/secrets/setup-state", as: SecretSetupState.self)
    }

    // MARK: - Session (native-macOS presence proof)

    func beginSecretSession(appProof: String) async throws -> SecretSessionResponse {
        try await secretPOST(
            "api/secrets/session/begin",
            json: ["proof": "native-macos"],
            appProof: appProof,
            as: SecretSessionResponse.self
        )
    }

    func revokeSecretSession(session: String) async throws -> SecretActionResponse {
        try await secretPOST(
            "api/secrets/session/revoke",
            json: [:],
            session: session,
            as: SecretActionResponse.self
        )
    }

    // MARK: - Manage

    func setSecretOptin(enabled: Bool, session: String) async throws -> SecretActionResponse {
        try await secretPOST(
            "api/secrets/optin",
            json: ["enabled": enabled],
            session: session,
            as: SecretActionResponse.self
        )
    }

    func setSecret(
        host: String,
        user: String,
        password: String,
        totp: String?,
        scope: String?,
        session: String
    ) async throws -> SecretActionResponse {
        var json: [String: Any] = ["host": host, "user": user, "password": password]
        if let totp, !totp.isEmpty { json["totp"] = totp }
        if let scope, !scope.isEmpty { json["scope"] = scope }
        return try await secretPOST("api/secrets/set", json: json, session: session, as: SecretActionResponse.self)
    }

    func removeSecret(host: String, scope: String?, session: String) async throws -> SecretActionResponse {
        var json: [String: Any] = ["host": host]
        if let scope, !scope.isEmpty { json["scope"] = scope }
        return try await secretPOST("api/secrets/rm", json: json, session: session, as: SecretActionResponse.self)
    }

    func unlockVault(masterPassword: String, session: String) async throws -> SecretActionResponse {
        try await secretPOST(
            "api/secrets/unlock",
            json: ["masterPassword": masterPassword],
            session: session,
            as: SecretActionResponse.self
        )
    }

    func wizardInstall(session: String) async throws -> SecretActionResponse {
        try await secretPOST("api/secrets/wizard/install", json: [:], session: session, as: SecretActionResponse.self)
    }

    func wizardLogin(
        email: String,
        masterPassword: String,
        twofa: String?,
        session: String
    ) async throws -> SecretActionResponse {
        var json: [String: Any] = ["email": email, "masterPassword": masterPassword]
        if let twofa, !twofa.isEmpty { json["twofa"] = twofa }
        return try await secretPOST("api/secrets/wizard/login", json: json, session: session, as: SecretActionResponse.self)
    }

    // MARK: - Consent + expose (fresh presence proof per reveal)

    func beginConsent(
        action: String,
        host: String,
        field: String?,
        appProof: String,
        session: String
    ) async throws -> SecretConsentResponse {
        var json: [String: Any] = ["proof": "native-macos", "action": action, "host": host]
        if let field, !field.isEmpty { json["field"] = field }
        return try await secretPOST(
            "api/secrets/consent/begin",
            json: json,
            session: session,
            appProof: appProof,
            as: SecretConsentResponse.self
        )
    }

    func revealSecret(
        host: String,
        field: String,
        consent: String,
        scope: String?,
        session: String
    ) async throws -> SecretRevealResponse {
        var json: [String: Any] = ["host": host, "field": field, "consent": consent]
        if let scope, !scope.isEmpty { json["scope"] = scope }
        return try await secretPOST("api/secrets/reveal", json: json, session: session, as: SecretRevealResponse.self)
    }

    func totpSecret(
        host: String,
        consent: String,
        scope: String?,
        session: String
    ) async throws -> SecretRevealResponse {
        var json: [String: Any] = ["host": host, "consent": consent]
        if let scope, !scope.isEmpty { json["scope"] = scope }
        return try await secretPOST("api/secrets/totp", json: json, session: session, as: SecretRevealResponse.self)
    }

    // MARK: - Transport helpers

    private func secretGET<T: Decodable>(_ path: String, as type: T.Type) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.setValue("1", forHTTPHeaderField: Self.secretHeader)
        let (data, response) = try await URLSession.shared.data(for: request)
        try Self.checkOK(data: data, response: response, allowNon2xxBody: true)
        return try JSONDecoder().decode(T.self, from: data)
    }

    private func secretPOST<T: Decodable>(
        _ path: String,
        json: [String: Any],
        session: String? = nil,
        appProof: String? = nil,
        as type: T.Type
    ) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("1", forHTTPHeaderField: Self.secretHeader)
        if let session { request.setValue(session, forHTTPHeaderField: Self.sessionHeader) }
        if let appProof { request.setValue(appProof, forHTTPHeaderField: Self.appProofHeader) }
        // The bodies mix String and Bool values, so serialize the dictionary
        // directly rather than through a per-endpoint Encodable struct.
        request.httpBody = try JSONSerialization.data(withJSONObject: json.isEmpty ? [:] : json)
        let (data, response) = try await URLSession.shared.data(for: request)
        try Self.checkOK(data: data, response: response, allowNon2xxBody: true)
        return try JSONDecoder().decode(T.self, from: data)
    }
}
