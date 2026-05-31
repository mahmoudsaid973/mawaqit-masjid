// PR-29 — typed API error.
import Foundation

public enum ApiError: Error, LocalizedError, Equatable {
    case transport(String)
    case unauthorized
    case notFound
    case server(Int, String)
    case decoding(String)
    case offline

    public var errorDescription: String? {
        switch self {
        case .transport(let msg): return "Network error: \(msg)"
        case .unauthorized: return "Please sign in again."
        case .notFound: return "Requested resource not found."
        case .server(let code, let msg): return "Server error \(code): \(msg)"
        case .decoding(let msg): return "Response could not be decoded: \(msg)"
        case .offline: return "No internet connection."
        }
    }
}
