import Foundation
import LocalAuthentication
import AppKit

/// Local presence proof for the native app: a fresh Touch ID (biometric)
/// evaluation gates both entering edit mode and every individual reveal/TOTP.
/// Only after this succeeds does the app send its app-proof key to mint a
/// server session or consent, so a co-resident agent that lacks the biometric
/// cannot drive these paths.
enum TouchIDAuth {
    /// Runs a fresh `LAContext` evaluation. Returns `true` only when the user
    /// passes biometrics (or device-owner auth as a fallback).
    ///
    /// `CHROMUX_LA_BYPASS=1` short-circuits to success so the whole
    /// edit/reveal path is scriptable in tests without a real prompt.
    static func authenticate(reason: String) async -> Bool {
        if ProcessInfo.processInfo.environment["CHROMUX_LA_BYPASS"] == "1" {
            return true
        }

        // A fresh context per call: LAContext caches a successful evaluation,
        // so reusing one would let a later reveal skip its own prompt.
        let context = LAContext()
        var policy: LAPolicy = .deviceOwnerAuthenticationWithBiometrics
        var policyError: NSError?
        if !context.canEvaluatePolicy(policy, error: &policyError) {
            // No usable biometric (no Touch ID hardware, not enrolled) — fall
            // back to the device-owner policy (password/watch).
            policy = .deviceOwnerAuthentication
        }

        // The prompt attaches to the frontmost app; bring the app forward first
        // so it is not hidden behind other windows.
        await MainActor.run { NSApp.activate(ignoringOtherApps: true) }

        return await withCheckedContinuation { continuation in
            context.evaluatePolicy(policy, localizedReason: reason) { success, _ in
                continuation.resume(returning: success)
            }
        }
    }
}
