// PR-29 — Keychain wrapper for the auth bearer token.
// Persists tokens across app launches; cleared on sign-out.
import Foundation
import Security

public final class KeychainStore {
    public static let shared = KeychainStore()
    private init() {}

    // Wave D #745 — keychain fallback was a shared service id which meant
    // every Forge-generated app on the same device shared a keychain
    // service (token leakage across apps). When bundleIdentifier is nil
    // we cannot safely share the keychain; crash hard in debug, fall back
    // to a unique random id per app launch in release (tokens won't
    // persist across launches but cross-app leakage is prevented).
    private let service: String = {
        if let id = Bundle.main.bundleIdentifier { return id }
        #if DEBUG
        fatalError("Bundle.main.bundleIdentifier is nil — set CFBundleIdentifier in Info.plist")
        #else
        return "com.forge.unknown.(UUID().uuidString)"
        #endif
    }()

    public func write(_ token: AuthToken, account: String = "default") throws {
        let data = try JSONEncoder().encode(token)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(query as CFDictionary) // Idempotent: clear existing before writing.
        var attrs = query
        attrs[kSecValueData as String] = data
        let status = SecItemAdd(attrs as CFDictionary, nil)
        guard status == errSecSuccess else { throw ApiError.transport("Keychain write failed: \(status)") }
    }

    public func read(account: String = "default") -> AuthToken? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var out: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &out)
        guard status == errSecSuccess, let data = out as? Data else { return nil }
        return try? JSONDecoder().decode(AuthToken.self, from: data)
    }

    public func delete(account: String = "default") {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(query as CFDictionary)
    }
}
