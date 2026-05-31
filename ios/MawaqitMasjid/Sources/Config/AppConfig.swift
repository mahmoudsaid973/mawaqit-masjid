// PR-29 — environment config driven by Configuration.xcconfig.
// Point Xcode's "Configuration Settings File" to Configuration.xcconfig
// for Debug + Release; override per target in CI.
//
// PR-47 — scaffold-agent's Info.plist template does not include an
// API_BASE_URL entry, so Bundle.main.object(forInfoDictionaryKey:) would
// return nil and the app would crash on every launch (preconditionFailure).
// Two paths are now accepted:
//   1) Info.plist entry `API_BASE_URL` with value `$(API_BASE_URL)`
//      (substituted at build time from Configuration.xcconfig) — preferred
//      for multi-environment deployments.
//   2) Hardcoded fallback (below) — the default URL emitted by
//      Configuration.xcconfig. Keeps the app launchable before Info.plist
//      is wired, matching the Configuration.xcconfig default of
//      `https://api.example.com`. Override at build time for staging/prod.
import Foundation

public enum AppConfig {
    private static let fallbackBaseURL: URL = {
        guard let url = URL(string: "https://api.example.com") else {
            preconditionFailure("ios-backend-scaffold emitted an invalid default URL literal — this is a build-time bug.")
        }
        return url
    }()

    public static var apiBaseURL: URL {
        if let raw = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
           !raw.isEmpty,
           let url = URL(string: raw) {
            return url
        }
        return fallbackBaseURL
    }

    public static var authEndpoint: URL { apiBaseURL.appendingPathComponent("auth") }
    public static var refreshEndpoint: URL { apiBaseURL.appendingPathComponent("auth/refresh") }
}
