import Foundation
import Testing
@testable import ChromuxStatusBarCore

struct SecretDecodingTests {
    @Test func decodesSecretsState() throws {
        let json = """
        {
          "ok": true,
          "optedIn": true,
          "unlocked": true,
          "ttlRemainingMs": 275000,
          "editSessions": 1,
          "consentProviders": ["native-macos", "launch-token"],
          "platform": "darwin",
          "historyCount": 4
        }
        """.data(using: .utf8)!

        let state = try JSONDecoder().decode(SecretsState.self, from: json)
        #expect(state.optedIn)
        #expect(state.unlocked)
        #expect(state.ttlRemainingMs == 275_000)
        #expect(state.editSessions == 1)
        #expect(state.consentProviders == ["native-macos", "launch-token"])
        #expect(state.platform == "darwin")
        #expect(state.historyCount == 4)
    }

    @Test func decodesDormantSecretsState() throws {
        let json = """
        { "ok": true, "optedIn": false, "unlocked": false, "ttlRemainingMs": 0, "editSessions": 0, "consentProviders": ["launch-token"], "platform": "darwin", "historyCount": 0 }
        """.data(using: .utf8)!

        let state = try JSONDecoder().decode(SecretsState.self, from: json)
        #expect(!state.optedIn)
        #expect(!state.unlocked)
        #expect(state.ttlRemainingMs == 0)
    }

    @Test func decodesSecretListWithItems() throws {
        let json = """
        {
          "ok": true,
          "locked": false,
          "items": [
            { "host": "github.com", "scope": "global" },
            { "host": "gitlab.com", "scope": "work" }
          ]
        }
        """.data(using: .utf8)!

        let list = try JSONDecoder().decode(SecretListResponse.self, from: json)
        #expect(!list.locked)
        #expect(list.items.count == 2)
        #expect(list.items[0].host == "github.com")
        #expect(list.items[0].scope == "global")
        #expect(list.items[0].id == "global/github.com")
        #expect(list.items[1].scope == "work")
    }

    @Test func decodesLockedSecretList() throws {
        let json = """
        { "ok": true, "locked": true, "items": [], "next": "the vault is locked — unlock it first" }
        """.data(using: .utf8)!

        let list = try JSONDecoder().decode(SecretListResponse.self, from: json)
        #expect(list.locked)
        #expect(list.items.isEmpty)
    }

    @Test func decodesSecretHistory() throws {
        let json = """
        {
          "ok": true,
          "events": [
            { "timestamp": 1753500000000, "host": "github.com", "scope": "global", "field": "password", "outcome": "ok", "ok": true },
            { "timestamp": 1753499000000, "host": "gitlab.com", "scope": null, "field": "totp", "outcome": "not-found", "ok": false }
          ]
        }
        """.data(using: .utf8)!

        let history = try JSONDecoder().decode(SecretHistoryResponse.self, from: json)
        #expect(history.events.count == 2)
        #expect(history.events[0].host == "github.com")
        #expect(history.events[0].field == "password")
        #expect(history.events[0].ok == true)
        #expect(history.events[0].timestamp == 1_753_500_000_000)
        #expect(history.events[1].ok == false)
        #expect(history.events[1].scope == nil)
    }

    @Test func decodesSetupState() throws {
        let json = """
        { "ok": true, "bwInstalled": true, "bwPath": "/Users/test/.chromux/bin/bw", "loggedIn": true, "unlocked": false }
        """.data(using: .utf8)!

        let setup = try JSONDecoder().decode(SecretSetupState.self, from: json)
        #expect(setup.bwInstalled)
        #expect(setup.bwPath == "/Users/test/.chromux/bin/bw")
        #expect(setup.loggedIn)
        #expect(!setup.unlocked)
    }

    @Test func decodesSessionBeginSuccess() throws {
        let json = """
        { "ok": true, "token": "sess-abc123", "ttlRemainingMs": 300000, "via": "native-macos" }
        """.data(using: .utf8)!

        let resp = try JSONDecoder().decode(SecretSessionResponse.self, from: json)
        #expect(resp.ok)
        #expect(resp.token == "sess-abc123")
        #expect(resp.via == "native-macos")
        #expect(resp.secret == nil)
    }

    @Test func decodesSessionBeginDenial() throws {
        let json = """
        { "ok": false, "secret": "consent-unavailable", "next": "the native app proof is unavailable; use `chromux secret approve`" }
        """.data(using: .utf8)!

        let resp = try JSONDecoder().decode(SecretSessionResponse.self, from: json)
        #expect(!resp.ok)
        #expect(resp.token == nil)
        #expect(resp.secret == "consent-unavailable")
    }

    @Test func decodesConsentAndReveal() throws {
        let consentJSON = """
        { "ok": true, "consent": "consent-xyz", "ttlRemainingMs": 30000 }
        """.data(using: .utf8)!
        let consent = try JSONDecoder().decode(SecretConsentResponse.self, from: consentJSON)
        #expect(consent.ok)
        #expect(consent.consent == "consent-xyz")

        let revealJSON = """
        { "ok": true, "host": "github.com", "scope": "global", "field": "password", "value": "hunter2" }
        """.data(using: .utf8)!
        let reveal = try JSONDecoder().decode(SecretRevealResponse.self, from: revealJSON)
        #expect(reveal.ok)
        #expect(reveal.value == "hunter2")
        #expect(reveal.field == "password")
    }

    @Test func decodesActionResponses() throws {
        let optin = try JSONDecoder().decode(
            SecretActionResponse.self,
            from: #"{ "ok": true, "optedIn": true }"#.data(using: .utf8)!
        )
        #expect(optin.optedIn == true)

        let set = try JSONDecoder().decode(
            SecretActionResponse.self,
            from: #"{ "ok": true, "host": "github.com", "scope": "global", "updated": true }"#.data(using: .utf8)!
        )
        #expect(set.updated == true)
        #expect(set.host == "github.com")

        let rm = try JSONDecoder().decode(
            SecretActionResponse.self,
            from: #"{ "ok": true, "host": "github.com", "scope": "global", "removed": true }"#.data(using: .utf8)!
        )
        #expect(rm.removed == true)

        let denial = try JSONDecoder().decode(
            SecretActionResponse.self,
            from: #"{ "ok": false, "secret": "locked", "next": "the vault is locked — unlock it first" }"#.data(using: .utf8)!
        )
        #expect(!denial.ok)
        #expect(denial.secret == "locked")
    }
}
